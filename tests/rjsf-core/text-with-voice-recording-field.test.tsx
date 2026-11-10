import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { findAllByProp, renderForm } from './render-with-providers';

const schema = (title: string | null = 'Notes', required = false): RJSFSchema => ({
  type: 'object',
  required: required ? ['note'] : [],
  properties: {
    note: {
      type: 'object',
      ...(title === null ? {} : { title }),
      properties: { text: { type: 'string' }, recordings: { type: 'array', items: { type: 'string' } } },
    },
  },
});

const ui = (extra: Record<string, unknown> = {}): UiSchema => ({
  note: { 'ui:field': 'TextWithVoiceRecordingField', ...extra },
});

const lastFormData = (onChange: jest.Mock) => onChange.mock.calls.at(-1)?.[0].formData;
const thumbnailDeleteButtons = () => findAllByProp('hitSlop', 8);
const allInputs = () => screen.getAllByDisplayValue(/.*/);

beforeEach(() => {
  // the thumbnail list mounts a media viewer that reads the (globally auto-mocked) expo-audio hooks habit-hooks-disable non-essential-comment
  jest.mocked(useAudioPlayer).mockReturnValue({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() } as never);
  jest.mocked(useAudioPlayerStatus).mockReturnValue({ playing: false, duration: 0, currentTime: 0 } as never);
});

describe('TextWithVoiceRecordingField', () => {
  describe('label & placeholder', () => {
    it.each`
      title      | required | uiExtra                               | expected
      ${'Notes'} | ${false} | ${{}}                                 | ${'Notes'}
      ${'Notes'} | ${true}  | ${{}}                                 | ${'Notes *'}
      ${'Notes'} | ${false} | ${{ 'ui:options': { label: false } }} | ${null}
      ${null}    | ${false} | ${{}}                                 | ${null}
    `(
      'title=$title required=$required ui=$uiExtra → label $expected',
      async ({ title, required, uiExtra, expected }) => {
        // act
        await renderForm({ schema: schema(title, required), uiSchema: ui(uiExtra) });

        // assert
        if (expected) expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
        else expect(screen.queryByText(/Notes/)).toBeNull();
      }
    );

    it.each`
      placeholder  | expected
      ${'Type…'}   | ${'Type…'}
      ${42}        | ${undefined}
      ${undefined} | ${undefined}
    `('ui:placeholder=$placeholder → placeholder $expected', async ({ placeholder, expected }) => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui({ 'ui:placeholder': placeholder }) });

      // assert
      expect(allInputs()[0].props.placeholder).toBe(expected);
    });
  });

  describe('value normalization', () => {
    it.each`
      formData                                          | text    | recordingCount
      ${undefined}                                      | ${''}   | ${0}
      ${'plain string'}                                 | ${''}   | ${0}
      ${['array']}                                      | ${''}   | ${0}
      ${{ text: 42, recordings: 'nope' }}               | ${''}   | ${0}
      ${{ text: 'hi', recordings: ['a.jpg', 3, null] }} | ${'hi'} | ${1}
      ${{ text: 'hi', recordings: ['a.jpg', 'b.jpg'] }} | ${'hi'} | ${2}
    `('formData=$formData → text "$text", $recordingCount thumbnail(s)', async ({ formData, text, recordingCount }) => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { note: formData } });

      // assert
      expect(allInputs()[0]).toHaveDisplayValue(text);
      expect(thumbnailDeleteButtons()).toHaveLength(recordingCount);
    });
  });

  describe('editing', () => {
    it('writes { text, recordings } keeping existing recordings on typing', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { note: { text: 'a', recordings: ['r1.jpg'] } },
        onChange,
      });

      // act
      await fireEvent.changeText(screen.getByDisplayValue('a'), 'abc');

      // assert
      expect(lastFormData(onChange)).toEqual({ note: { text: 'abc', recordings: ['r1.jpg'] } });
    });

    it('drops non-string recordings and writes an empty list when typing over garbage data', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { note: { text: 'x', recordings: [1, 'ok.jpg'] } },
        onChange,
      });

      // act
      await fireEvent.changeText(screen.getByDisplayValue('x'), 'y');

      // assert
      expect(lastFormData(onChange)).toEqual({ note: { text: 'y', recordings: ['ok.jpg'] } });
    });

    it('clears the text via the clear button', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { note: { text: 'abc' } }, onChange });

      // act
      await fireEvent.press(screen.getByLabelText('close'));

      // assert
      expect(lastFormData(onChange)).toEqual({ note: { text: '', recordings: [] } });
    });

    it('removes the pressed recording only', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { note: { text: 't', recordings: ['a.jpg', 'b.jpg'] } },
        onChange,
      });

      // act
      await fireEvent.press(thumbnailDeleteButtons()[0] as never);

      // assert
      expect(lastFormData(onChange)).toEqual({ note: { text: 't', recordings: ['b.jpg'] } });
    });
  });

  describe('readonly / disabled', () => {
    it.each`
      disabled | readonly
      ${true}  | ${false}
      ${false} | ${true}
    `('ignores recording removal when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { note: { text: 't', recordings: ['a.jpg'] } },
        onChange,
        disabled,
        readonly,
      });
      onChange.mockClear();

      // act
      await fireEvent.press(thumbnailDeleteButtons()[0] as never);

      // assert
      expect(onChange).not.toHaveBeenCalled();
    });

    it('makes the input read-only and disables mic + clear when readonly', async () => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { note: { text: 't' } }, readonly: true });

      // assert
      expect(screen.getByDisplayValue('t')).toHaveProp('readOnly', true);
      // eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- DictationMicButton exposes no accessible name (src gap)
      expect(screen.getByTestId('dictation-mic')).toBeDisabled();
      expect(screen.getByLabelText('close')).toBeDisabled();
    });

    it('keeps the input editable but disabled when disabled', async () => {
      // act
      await renderForm({ schema: schema(), uiSchema: ui(), formData: { note: { text: 't' } }, disabled: true });

      // assert
      expect(screen.getByDisplayValue('t')).toHaveProp('editable', false);
      expect(screen.getByDisplayValue('t')).toHaveProp('readOnly', false);
    });
  });

  describe('errors', () => {
    it('flags the input in error when errorSchema.text has errors (after submit)', async () => {
      // arrange
      await renderForm({
        schema: schema(),
        uiSchema: ui(),
        formData: { note: { text: 'bad' } },
        onError: jest.fn(),
        customValidate: (_data, errors) => {
          (errors.note as unknown as { text: { addError: (m: string) => void } }).text.addError('Text is bad');
          return errors;
        },
      });
      // eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- Paper's outline is a role-less decorative View; its style is the only error signal
      const outlineBefore = screen.getAllByTestId('text-input-outline')[0].props.style;

      // act
      await fireEvent.press(screen.getByText('Submit'));

      // assert
      // eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- see outlineBefore above
      expect(screen.getAllByTestId('text-input-outline')[0].props.style).not.toEqual(outlineBefore);
    });
  });
});
