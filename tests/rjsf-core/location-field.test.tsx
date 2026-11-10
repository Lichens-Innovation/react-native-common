import { logger } from '@lib';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { findAllByProp, renderForm, showSnackbarMessageMock } from './render-with-providers';

const schema = (title: string | null = 'Position', required = false): RJSFSchema => ({
  type: 'object',
  required: required ? ['loc'] : [],
  properties: {
    loc: { type: 'object', ...(title === null ? {} : { title }), properties: { coordinates: { type: 'object' } } },
  },
});

const ui = (options: Record<string, unknown> = {}): UiSchema => ({
  loc: { 'ui:field': 'LocationField', 'ui:options': options },
});

const point = (lat: number, lng: number) => ({ type: 'Point', coordinates: [lng, lat] });
const lastFormData = (onChange: jest.Mock) => onChange.mock.calls.at(-1)?.[0].formData;

beforeEach(() => {
  showSnackbarMessageMock.mockClear();
  // useUserLocation (map modal) polls these: keep them harmless habit-hooks-disable non-essential-comment
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
  jest.mocked(Location.getLastKnownPositionAsync).mockResolvedValue(null as never);
  jest.mocked(Location.watchPositionAsync).mockResolvedValue({ remove: jest.fn() } as never);
});

describe('LocationField', () => {
  describe('label', () => {
    it.each`
      title         | required | expected
      ${'Position'} | ${false} | ${'Position'}
      ${'Position'} | ${true}  | ${'Position *'}
    `('renders "$expected" for title=$title required=$required', async ({ title, required, expected }) => {
      // act
      await renderForm({ schema: schema(title, required), uiSchema: ui() });

      // assert
      expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it.each`
      title
      ${null}
      ${''}
      ${'   '}
    `('renders no label for title=$title', async ({ title }) => {
      // act
      await renderForm({ schema: schema(title), uiSchema: ui() });

      // assert
      expect(screen.queryByText('Position')).toBeNull();
      expect(screen.queryByText(/\*/)).toBeNull();
    });

    it('colors the label with a valid hex labelColor', async () => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui({ labelColor: '#abcdef' }) });

      // assert
      expect(screen.getByText('Position')).toHaveStyle({ color: '#abcdef' });
    });
  });

  describe('coordinate preview', () => {
    it.each`
      formData
      ${undefined}
      ${{}}
      ${{ coordinates: null }}
    `('shows the empty state for formData=$formData', async ({ formData }) => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { loc: formData } });

      // assert
      expect(screen.getByText('location.noLocationCaptured')).toBeOnTheScreen();
      expect(screen.queryByText('location.clearLocation')).toBeNull();
    });

    it('shows lat, lng with 6 decimals and a clear button for a stored point', async () => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { loc: { coordinates: point(45.5, -73.6) } } });

      // assert
      expect(screen.getByText('45.500000, -73.600000')).toBeOnTheScreen();
      expect(screen.getByText('location.clearLocation')).toBeOnTheScreen();
      expect(screen.queryByText('location.noLocationCaptured')).toBeNull();
    });

    it('renders neither empty state nor coordinates for a malformed point', async () => {
      // act
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { loc: { coordinates: { type: 'Point', coordinates: [1] } } },
      });

      // assert
      expect(screen.queryByText('location.noLocationCaptured')).toBeNull();
      expect(screen.queryByText('location.clearLocation')).toBeNull();
      expect(screen.getByText('location.useGps')).toBeOnTheScreen();
    });

    it('clears to an empty object (not coordinates: null) on clear press (SPOTD-893)', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { loc: { coordinates: point(1, 2) } },
        onChange,
      });

      // act
      await fireEvent.press(screen.getByText('location.clearLocation'));

      // assert
      expect(lastFormData(onChange)).toEqual({ loc: {} });
      expect(screen.getByText('location.noLocationCaptured')).toBeOnTheScreen();
    });
  });

  describe('GPS capture', () => {
    it('writes a GeoJSON point [lng, lat] when permission is granted', async () => {
      // arrange
      const onChange = jest.fn();
      jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
      jest
        .mocked(Location.getCurrentPositionAsync)
        .mockResolvedValue({ coords: { latitude: 10.1234567, longitude: 20.7654321 } } as never);
      await renderForm({ schema: schema(), uiSchema: ui(), onChange });

      // act
      await fireEvent.press(screen.getByText('location.useGps'));

      // assert
      await waitFor(() =>
        expect(lastFormData(onChange)).toEqual({
          loc: { coordinates: { type: 'Point', coordinates: [20.7654321, 10.1234567] } },
        })
      );
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({});
      expect(screen.getByText('10.123457, 20.765432')).toBeOnTheScreen();
    });

    it('shows the permission-denied snackbar and writes nothing when permission is denied', async () => {
      // arrange
      const onChange = jest.fn();
      jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      jest.mocked(Location.getCurrentPositionAsync).mockClear();
      await renderForm({ schema: schema(), uiSchema: ui(), onChange });
      onChange.mockClear(); // rjsf emits once on mount to apply defaults

      // act
      await fireEvent.press(screen.getByText('location.useGps'));

      // assert
      await waitFor(() => expect(showSnackbarMessageMock).toHaveBeenCalledWith('location.permissionDenied'));
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('logs the error and shows the error snackbar when the GPS call rejects', async () => {
      // arrange
      const onChange = jest.fn();
      const error = new Error('gps down');
      const errorSpy = jest.spyOn(logger, 'error');
      jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
      jest.mocked(Location.getCurrentPositionAsync).mockRejectedValue(error);
      await renderForm({ schema: schema(), uiSchema: ui(), onChange });
      onChange.mockClear(); // rjsf emits once on mount to apply defaults

      // act
      await fireEvent.press(screen.getByText('location.useGps'));

      // assert
      await waitFor(() => expect(showSnackbarMessageMock).toHaveBeenCalledWith('location.error'));
      expect(errorSpy).toHaveBeenCalledWith('LocationField GPS error', error);
      expect(onChange).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('logs and shows the error snackbar when the permission request itself rejects', async () => {
      // arrange
      const errorSpy = jest.spyOn(logger, 'error');
      jest.mocked(Location.requestForegroundPermissionsAsync).mockRejectedValue(new Error('perm'));
      await renderForm({ schema: schema(), uiSchema: ui() });

      // act
      await fireEvent.press(screen.getByText('location.useGps'));

      // assert
      await waitFor(() => expect(showSnackbarMessageMock).toHaveBeenCalledWith('location.error'));
      expect(errorSpy).toHaveBeenCalledWith('LocationField GPS error', expect.any(Error));
      errorSpy.mockRestore();
    });
  });

  describe('disabled / readonly', () => {
    it.each`
      disabled | readonly | actionsDisabled
      ${false} | ${false} | ${false}
      ${true}  | ${false} | ${true}
      ${false} | ${true}  | ${true}
      ${true}  | ${true}  | ${true}
    `(
      'disabled=$disabled readonly=$readonly → actions disabled: $actionsDisabled',
      async ({ disabled, readonly, actionsDisabled }) => {
        // act
        await renderForm({
          schema: schema(),
          uiSchema: ui(),
          formData: { loc: { coordinates: point(1, 2) } },
          disabled,
          readonly,
        });

        // assert
        for (const text of ['location.useGps', 'location.pickOnMap', 'location.clearLocation']) {
          const button = screen.getByRole('button', { name: new RegExp(text.replace('.', '\\.')) });
          if (actionsDisabled) expect(button).toBeDisabled();
          else expect(button).toBeEnabled();
        }
      }
    );
  });

  describe('map picker', () => {
    it('opens the picker and closes it on cancel without writing', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({ schema: schema(), uiSchema: ui(), onChange });
      onChange.mockClear(); // rjsf emits once on mount to apply defaults

      // act
      await fireEvent.press(screen.getByText('location.pickOnMap'));

      // assert
      expect(screen.getByText('cancel')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'confirm' })).toBeDisabled();

      // act
      await fireEvent.press(screen.getByText('cancel'));

      // assert
      expect(screen.queryByText('cancel')).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('writes the picked coordinate on confirm and closes the picker', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({ schema: schema(), uiSchema: ui(), onChange });
      await fireEvent.press(screen.getByText('location.pickOnMap'));
      const [map] = findAllByProp('provider', 'google');

      // act
      await fireEvent(map as never, 'press', { nativeEvent: { coordinate: { latitude: 3, longitude: 4 } } });
      await fireEvent.press(screen.getByText('confirm'));

      // assert
      expect(lastFormData(onChange)).toEqual({ loc: { coordinates: { type: 'Point', coordinates: [4, 3] } } });
      expect(screen.queryByText('cancel')).toBeNull();
      expect(screen.getByText('3.000000, 4.000000')).toBeOnTheScreen();
    });

    it('pre-selects the stored point so confirm is enabled immediately', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { loc: { coordinates: point(7, 8) } }, onChange });

      // act
      await fireEvent.press(screen.getByText('location.pickOnMap'));
      await fireEvent.press(screen.getByText('confirm'));

      // assert
      expect(lastFormData(onChange)).toEqual({ loc: { coordinates: { type: 'Point', coordinates: [8, 7] } } });
    });
  });
});
