jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockDateTimePicker = (props: object) => <View {...props} accessibilityLabel="mock-date-time-picker" />;
  return { __esModule: true, default: MockDateTimePicker };
});

import { DateTimeWidget, DateWidget, TimeWidget } from '@lib/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import { getTextInput, renderWidget } from './render-widget';

const DONE_LABEL = 'app:general.done';
const SET_EVENT = { type: 'set', nativeEvent: {} };
const DISMISSED_EVENT = { type: 'dismissed', nativeEvent: {} };

const queryPicker = () => screen.queryByLabelText('mock-date-time-picker');
const getPicker = () => screen.getByLabelText('mock-date-time-picker');
const queryClearButton = () => screen.queryByLabelText('icon-close');
const openPicker = () => fireEvent.press(getTextInput());
const pick = (event: object, date?: Date) => fireEvent(getPicker(), 'change', event, date);

const pad = (n: number) => String(n).padStart(2, '0');
const toDateOnly = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const mockAndroidPlatform = () => jest.replaceProperty(Platform, 'OS', 'android');

type PickerCase = [string, ComponentType<WidgetProps>, string];

const PICKER_WIDGETS: PickerCase[] = [
  ['DateWidget', DateWidget, '2024-03-05'],
  ['DateTimeWidget', DateTimeWidget, '2024-03-05T14:30:00'],
  ['TimeWidget', TimeWidget, '14:30:00'],
];

describe.each(PICKER_WIDGETS)('%s (shared picker behaviour)', (_name, Widget, validValue) => {
  it('renders the required label', async () => {
    // act
    await renderWidget(Widget, { label: 'When', required: true });

    // assert
    expect(screen.getAllByText('When *')).not.toHaveLength(0);
  });

  it('is never directly editable', async () => {
    // act
    await renderWidget(Widget, { value: validValue });

    // assert
    expect(getTextInput().props.editable).toBe(false);
  });

  it.each`
    value
    ${undefined}
    ${''}
    ${'   '}
    ${'not-a-date'}
  `('shows an empty input and no clear button for $value', async ({ value }) => {
    // act
    await renderWidget(Widget, { value });

    // assert
    expect(getTextInput().props.value).toBe('');
    expect(queryClearButton()).not.toBeOnTheScreen();
  });

  it('forwards the placeholder', async () => {
    // act
    await renderWidget(Widget, { placeholder: 'Choose' });

    // assert
    expect(getTextInput().props.placeholder).toBe('Choose');
  });

  it('clear button commits undefined through onChange then onBlur', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { id: 'root_when', value: validValue });

    // act
    await fireEvent.press(screen.getByLabelText('icon-close'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith(undefined);
    expect(props.onBlur).toHaveBeenCalledWith('root_when', undefined);
  });

  it('never reports focus because the paper input is not editable', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { id: 'root_when', value: validValue });

    // act
    await fireEvent(getTextInput(), 'focus');

    // assert
    expect(props.onFocus).not.toHaveBeenCalled();
  });

  it('does not commit on open when a value already exists (iOS)', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { value: validValue });

    // act
    await openPicker();

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
    expect(screen.getByText(DONE_LABEL)).toBeOnTheScreen();
  });

  it('closes the iOS modal on Done', async () => {
    // arrange
    await renderWidget(Widget, { value: validValue });
    await openPicker();

    // act
    await fireEvent.press(screen.getByText(DONE_LABEL));

    // assert
    expect(screen.queryByText(DONE_LABEL)).not.toBeOnTheScreen();
    expect(queryPicker()).not.toBeOnTheScreen();
  });

  it('toggles the iOS modal closed when the input is pressed again', async () => {
    // arrange
    await renderWidget(Widget, { value: validValue });
    await openPicker();

    // act
    await openPicker();

    // assert
    expect(screen.queryByText(DONE_LABEL)).not.toBeOnTheScreen();
  });

  it('uses the iOS spinner with the light theme variant', async () => {
    // arrange
    await renderWidget(Widget, { value: validValue });

    // act
    await openPicker();

    // assert
    expect(getPicker().props.display).toBe('spinner');
    expect(getPicker().props.themeVariant).toBe('light');
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
    ${true}  | ${true}
  `(
    'display-only when disabled=$disabled readonly=$readonly: shows value, no clear button, never opens',
    async ({ disabled, readonly }) => {
      // arrange
      const { props } = await renderWidget(Widget, { value: validValue, disabled, readonly });

      // act
      await fireEvent.press(getTextInput());

      // assert
      expect(getTextInput().props.value).not.toBe('');
      expect(queryClearButton()).not.toBeOnTheScreen();
      expect(queryPicker()).not.toBeOnTheScreen();
      expect(props.onChange).not.toHaveBeenCalled();
    }
  );

  it('display-only never reports focus either', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { id: 'root_when', value: validValue, readonly: true });

    // act
    await fireEvent(getTextInput(), 'focus');

    // assert
    expect(props.onFocus).not.toHaveBeenCalled();
  });

  it('display-only passes disabled to the input only when disabled (not readonly)', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(Widget, { value: validValue, readonly: true });

    // assert
    expect(getTextInput().props.editable).toBe(false);
    expect(screen.queryAllByText('My label')).not.toHaveLength(0);

    // act
    await rerenderWidget({ readonly: false, disabled: true });

    // assert
    expect(getTextInput().props.editable).toBe(false);
  });
});

describe('DateWidget', () => {
  it.each`
    value                     | expected
    ${'2024-03-05'}           | ${'5 mars 2024'}
    ${' 2024-03-05 '}         | ${'5 mars 2024'}
    ${'2024-03-05T23:59:00Z'} | ${'5 mars 2024'}
  `('displays $value as "$expected" (fr locale by default)', async ({ value, expected }) => {
    // act
    await renderWidget(DateWidget, { value });

    // assert
    expect(getTextInput().props.value).toBe(expected);
  });

  it('opens an empty field on iOS by committing today immediately', async () => {
    // arrange
    const { props } = await renderWidget(DateWidget, { id: 'root_day' });

    // act
    await openPicker();

    // assert
    const today = toDateOnly(new Date());
    expect(props.onChange).toHaveBeenCalledWith(today);
    expect(props.onBlur).toHaveBeenCalledWith('root_day', today);
    expect(getPicker().props.mode).toBe('date');
  });

  it('starts the picker on the parsed local date', async () => {
    // arrange
    await renderWidget(DateWidget, { value: '2024-03-05' });

    // act
    await openPicker();

    // assert
    expect(getPicker().props.value).toEqual(new Date(2024, 2, 5));
  });

  it('commits the picked day as YYYY-MM-DD and keeps the iOS modal open', async () => {
    // arrange
    const { props } = await renderWidget(DateWidget, { id: 'root_day', value: '2024-03-05' });
    await openPicker();

    // act
    await pick(SET_EVENT, new Date(2025, 11, 31, 23, 30));

    // assert
    expect(props.onChange).toHaveBeenCalledWith('2025-12-31');
    expect(props.onBlur).toHaveBeenCalledWith('root_day', '2025-12-31');
    expect(screen.getByText(DONE_LABEL)).toBeOnTheScreen();
  });

  it('ignores a pick without a date', async () => {
    // arrange
    const { props } = await renderWidget(DateWidget, { value: '2024-03-05' });
    await openPicker();

    // act
    await pick(SET_EVENT, undefined);

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });

  describe('on Android', () => {
    beforeEach(() => {
      mockAndroidPlatform();
    });

    it('also commits today when opening an empty field', async () => {
      // arrange
      const { props } = await renderWidget(DateWidget);

      // act
      await openPicker();

      // assert
      expect(props.onChange).toHaveBeenCalledWith(toDateOnly(new Date()));
      expect(getPicker().props.display).toBe('default');
      expect(screen.queryByText(DONE_LABEL)).not.toBeOnTheScreen();
    });

    it('closes the dialog and commits the picked date', async () => {
      // arrange
      const { props } = await renderWidget(DateWidget, { value: '2024-03-05' });
      await openPicker();

      // act
      await pick(SET_EVENT, new Date(2024, 0, 2));

      // assert
      expect(props.onChange).toHaveBeenCalledWith('2024-01-02');
      expect(queryPicker()).not.toBeOnTheScreen();
    });

    it('commits even for a dismissed event when a date is provided', async () => {
      // arrange
      const { props } = await renderWidget(DateWidget, { value: '2024-03-05' });
      await openPicker();

      // act
      await pick(DISMISSED_EVENT, new Date(2024, 0, 2));

      // assert
      expect(props.onChange).toHaveBeenCalledWith('2024-01-02');
      expect(queryPicker()).not.toBeOnTheScreen();
    });

    it('closes without committing on a dismissal without date', async () => {
      // arrange
      const { props } = await renderWidget(DateWidget, { value: '2024-03-05' });
      await openPicker();

      // act
      await pick(DISMISSED_EVENT, undefined);

      // assert
      expect(props.onChange).not.toHaveBeenCalled();
      expect(queryPicker()).not.toBeOnTheScreen();
    });

    it('closes on touch cancel', async () => {
      // arrange
      await renderWidget(DateWidget, { value: '2024-03-05' });
      await openPicker();

      // act
      await fireEvent(getPicker(), 'touchCancel');

      // assert
      expect(queryPicker()).not.toBeOnTheScreen();
    });
  });
});

describe('DateTimeWidget', () => {
  it.each`
    value                    | expected
    ${'2024-03-05T14:30:00'} | ${'5 mars 2024, 14 h 30'}
    ${'2024-03-05T09:05:00'} | ${'5 mars 2024, 9 h 05'}  | ${' 2024-03-05T09:05:00 '} | ${''}
  `('displays local $value as "$expected"', async ({ value, expected }) => {
    // act
    await renderWidget(DateTimeWidget, { value });

    // assert
    expect(getTextInput().props.value).toBe(expected);
  });

  it('opens an empty field on iOS by committing now as an ISO string', async () => {
    // arrange
    const before = Date.now();
    const { props } = await renderWidget(DateTimeWidget, { id: 'root_at' });

    // act
    await openPicker();

    // assert
    const committed = props.onChange.mock.calls[0][0] as string;
    expect(committed).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Date.parse(committed)).toBeGreaterThanOrEqual(before);
    expect(props.onBlur).toHaveBeenCalledWith('root_at', committed);
    expect(getPicker().props.mode).toBe('datetime');
  });

  it('commits the iOS pick as an ISO string', async () => {
    // arrange
    const picked = new Date(2025, 5, 1, 8, 15, 42);
    const { props } = await renderWidget(DateTimeWidget, { id: 'root_at', value: '2024-03-05T14:30:00' });
    await openPicker();

    // act
    await pick(SET_EVENT, picked);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(picked.toISOString());
    expect(props.onBlur).toHaveBeenCalledWith('root_at', picked.toISOString());
  });

  it('ignores an iOS pick without a date', async () => {
    // arrange
    const { props } = await renderWidget(DateTimeWidget, { value: '2024-03-05T14:30:00' });
    await openPicker();

    // act
    await pick(SET_EVENT, undefined);

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });

  describe('on Android', () => {
    beforeEach(() => {
      mockAndroidPlatform();
    });

    it('opens the date dialog first without committing anything', async () => {
      // arrange
      const { props } = await renderWidget(DateTimeWidget);

      // act
      await openPicker();

      // assert
      expect(props.onChange).not.toHaveBeenCalled();
      expect(getPicker().props.mode).toBe('date');
      expect(getPicker().props.display).toBe('default');
    });

    it('chains date then time dialogs and commits the combined local date-time with zero seconds', async () => {
      // arrange
      const { props } = await renderWidget(DateTimeWidget, { id: 'root_at', value: '2024-03-05T14:30:00' });
      await openPicker();

      // act
      await pick(SET_EVENT, new Date(2025, 6, 14, 3, 3, 3));

      // assert
      expect(getPicker().props.mode).toBe('time');
      expect(getPicker().props.value).toEqual(new Date(2025, 6, 14, 3, 3, 3));
      expect(props.onChange).not.toHaveBeenCalled();

      // act
      await pick(SET_EVENT, new Date(2000, 0, 1, 18, 45, 59));

      // assert
      const expected = new Date(2025, 6, 14, 18, 45, 0, 0).toISOString();
      expect(props.onChange).toHaveBeenCalledWith(expected);
      expect(props.onBlur).toHaveBeenCalledWith('root_at', expected);
      expect(queryPicker()).not.toBeOnTheScreen();
    });

    it('ends the sequence without committing when the date dialog is dismissed', async () => {
      // arrange
      const { props } = await renderWidget(DateTimeWidget, { value: '2024-03-05T14:30:00' });
      await openPicker();

      // act
      await pick(DISMISSED_EVENT, new Date(2025, 6, 14));

      // assert
      expect(queryPicker()).not.toBeOnTheScreen();
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('ends the sequence without committing when the time dialog is dismissed', async () => {
      // arrange
      const { props } = await renderWidget(DateTimeWidget, { value: '2024-03-05T14:30:00' });
      await openPicker();
      await pick(SET_EVENT, new Date(2025, 6, 14));

      // act
      await pick(DISMISSED_EVENT, undefined);

      // assert
      expect(queryPicker()).not.toBeOnTheScreen();
      expect(props.onChange).not.toHaveBeenCalled();
    });

    it('restarts at the date dialog when reopened', async () => {
      // arrange
      await renderWidget(DateTimeWidget, { value: '2024-03-05T14:30:00' });
      await openPicker();
      await pick(SET_EVENT, new Date(2025, 6, 14));
      await pick(SET_EVENT, new Date(2025, 6, 14, 10, 0));

      // act
      await openPicker();

      // assert
      expect(getPicker().props.mode).toBe('date');
    });

    it('pressing the input while the date dialog is open keeps it at the date stage', async () => {
      // arrange
      await renderWidget(DateTimeWidget, { value: '2024-03-05T14:30:00' });
      await openPicker();

      // act
      await openPicker();

      // assert
      expect(getPicker().props.mode).toBe('date');
    });
  });
});

describe('TimeWidget', () => {
  it.each`
    value           | expected
    ${'14:30:00'}   | ${'14 h 30'}
    ${'14:30'}      | ${'14 h 30'}
    ${' 09:05:59 '} | ${'9 h 05'}
    ${'24:00:00'}   | ${''}
    ${'9:05'}       | ${''}
  `('displays $value as "$expected"', async ({ value, expected }) => {
    // act
    await renderWidget(TimeWidget, { value });

    // assert
    expect(getTextInput().props.value).toBe(expected);
  });

  it('opens an empty field on iOS by committing the current time as HH:MM:00', async () => {
    // arrange
    const { props } = await renderWidget(TimeWidget, { id: 'root_t' });

    // act
    await openPicker();

    // assert
    const committed = props.onChange.mock.calls[0][0] as string;
    expect(committed).toMatch(/^\d{2}:\d{2}:00$/);
    expect(props.onBlur).toHaveBeenCalledWith('root_t', committed);
    expect(getPicker().props.mode).toBe('time');
  });

  it('starts the picker at the stored time', async () => {
    // arrange
    await renderWidget(TimeWidget, { value: '14:30:15' });

    // act
    await openPicker();

    // assert
    const pickerValue = getPicker().props.value as Date;
    expect([pickerValue.getHours(), pickerValue.getMinutes(), pickerValue.getSeconds()]).toEqual([14, 30, 15]);
  });

  it.each`
    event              | date                              | expected
    ${SET_EVENT}       | ${new Date(2024, 0, 1, 7, 5, 33)} | ${'07:05:00'}
    ${DISMISSED_EVENT} | ${new Date(2024, 0, 1, 7, 5, 33)} | ${undefined}
    ${SET_EVENT}       | ${undefined}                      | ${undefined}
  `('iOS pick ($event.type) commits $expected', async ({ event, date, expected }) => {
    // arrange
    const { props } = await renderWidget(TimeWidget, { value: '14:30:00' });
    await openPicker();

    // act
    await pick(event, date);

    // assert
    if (expected) expect(props.onChange).toHaveBeenCalledWith(expected);
    else expect(props.onChange).not.toHaveBeenCalled();
    expect(screen.getByText(DONE_LABEL)).toBeOnTheScreen();
  });

  describe('on Android', () => {
    beforeEach(() => {
      mockAndroidPlatform();
    });

    it('opens an empty field without committing, using a 24h default dialog', async () => {
      // arrange
      const { props } = await renderWidget(TimeWidget);

      // act
      await openPicker();

      // assert
      expect(props.onChange).not.toHaveBeenCalled();
      expect(getPicker().props).toEqual(expect.objectContaining({ mode: 'time', display: 'default', is24Hour: true }));
    });

    it('closes and commits a confirmed time', async () => {
      // arrange
      const { props } = await renderWidget(TimeWidget, { id: 'root_t' });
      await openPicker();

      // act
      await pick(SET_EVENT, new Date(2024, 0, 1, 23, 59, 59));

      // assert
      expect(props.onChange).toHaveBeenCalledWith('23:59:00');
      expect(props.onBlur).toHaveBeenCalledWith('root_t', '23:59:00');
      expect(queryPicker()).not.toBeOnTheScreen();
    });

    it('closes without committing when dismissed', async () => {
      // arrange
      const { props } = await renderWidget(TimeWidget);
      await openPicker();

      // act
      await pick(DISMISSED_EVENT, new Date(2024, 0, 1, 23, 59));

      // assert
      expect(props.onChange).not.toHaveBeenCalled();
      expect(queryPicker()).not.toBeOnTheScreen();
    });
  });
});
