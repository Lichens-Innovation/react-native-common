import { FormSubmitContext, RjsfPaperFormWrapper, SubmitButtonOptionsContext } from '@lib/rjsf';
import { fireEvent, renderHook, screen } from '@testing-library/react-native';
import { useContext } from 'react';
import { Text } from 'react-native';
import { renderWithProviders } from './render-with-providers';

interface SubmitProbeProps {
  event?: unknown;
}

const SubmitProbe = ({ event }: SubmitProbeProps) => {
  const submit = useContext(FormSubmitContext);
  return <Text onPress={() => submit(event)}>probe</Text>;
};

describe('FormSubmitContext', () => {
  it('defaults to a no-op handler that does not throw', async () => {
    // act
    const { result } = await renderHook(() => useContext(FormSubmitContext));

    // assert
    expect(typeof result.current).toBe('function');
    expect(() => result.current({})).not.toThrow();
    expect(result.current()).toBeUndefined();
  });
});

describe('SubmitButtonOptionsContext', () => {
  it('defaults to inline submit button with no override label', async () => {
    // act
    const { result } = await renderHook(() => useContext(SubmitButtonOptionsContext));

    // assert
    expect(result.current).toEqual({ submitButtonAbsolutePosition: false, submitButtonOverrideLabel: null });
  });
});

describe('RjsfPaperFormWrapper', () => {
  it('provides a submit handler that forwards the event to onSubmit', async () => {
    // arrange
    const onSubmit = jest.fn();
    const event = { foo: 'bar' };
    await renderWithProviders(
      <RjsfPaperFormWrapper onSubmit={onSubmit}>
        <SubmitProbe event={event} />
      </RjsfPaperFormWrapper>
    );

    // act
    await fireEvent.press(screen.getByText('probe'));

    // assert
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(event);
  });

  it('always calls the latest onSubmit after a re-render', async () => {
    // arrange
    const first = jest.fn();
    const second = jest.fn();
    const ui = (onSubmit: jest.Mock) => (
      <RjsfPaperFormWrapper onSubmit={onSubmit}>
        <SubmitProbe />
      </RjsfPaperFormWrapper>
    );
    const { rerender } = await renderWithProviders(ui(first));
    await rerender(ui(second));

    // act
    await fireEvent.press(screen.getByText('probe'));

    // assert
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onSubmit is undefined', async () => {
    // arrange
    await renderWithProviders(
      <RjsfPaperFormWrapper>
        <SubmitProbe />
      </RjsfPaperFormWrapper>
    );

    // act & assert
    await expect(fireEvent.press(screen.getByText('probe'))).resolves.not.toThrow();
  });

  it('passes View props through and renders children', async () => {
    // act
    await renderWithProviders(
      <RjsfPaperFormWrapper testID="wrapper" accessibilityLabel="form wrapper">
        <Text>child</Text>
      </RjsfPaperFormWrapper>
    );

    // assert
    expect(screen.getByLabelText('form wrapper')).toHaveProp('testID', 'wrapper');
    expect(screen.getByText('child')).toBeOnTheScreen();
  });
});
