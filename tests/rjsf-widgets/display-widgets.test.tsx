jest.mock('@react-native-community/slider', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockSlider = (props: object) => <View {...props} accessibilityLabel="mock-slider" />;
  return { __esModule: true, default: MockSlider };
});

import { HiddenWidget, ImageVideoGalleryWidget, LabelWidget, RangeWidget, RjsfDisplayLabel } from '@lib/rjsf';
import { fireEvent, screen } from '@testing-library/react-native';
import { useAudioPlayerStatus } from 'expo-audio';
import { getWidgetHost, renderWidget, renderWithProviders } from './render-widget';

const CAPTURE_ICON = /^icon-(camera|video)$/u;

describe('RjsfDisplayLabel', () => {
  it('renders the label with the given color', async () => {
    // act
    await renderWithProviders(<RjsfDisplayLabel label="Title" color="#abcdef" />);

    // assert
    expect(screen.getByText('Title')).toHaveStyle({ color: '#abcdef' });
  });

  it.each`
    label
    ${''}
    ${'   '}
    ${undefined}
  `('renders nothing for blank label $label', async ({ label }) => {
    // act
    await renderWithProviders(<RjsfDisplayLabel label={label} />);

    // assert
    expect(getWidgetHost().children).toHaveLength(0);
  });

  it('lets the style override the color', async () => {
    // act
    await renderWithProviders(<RjsfDisplayLabel label="Title" color="#abcdef" style={{ color: '#000000' }} />);

    // assert
    expect(screen.getByText('Title')).toHaveStyle({ color: '#000000' });
  });
});

describe('LabelWidget', () => {
  it('renders the label with a required marker', async () => {
    // act
    await renderWidget(LabelWidget, { label: 'Section A', required: true });

    // assert
    expect(screen.getByText('Section A *')).toBeOnTheScreen();
  });

  it.each`
    label          | hideLabel
    ${'Section A'} | ${true}
    ${''}          | ${false}
    ${'   '}       | ${false}
    ${undefined}   | ${false}
  `('renders nothing for label="$label" hideLabel=$hideLabel', async ({ label, hideLabel }) => {
    // act
    await renderWidget(LabelWidget, { label, hideLabel, required: true });

    // assert
    expect(getWidgetHost().children).toHaveLength(0);
  });

  it.each`
    isSection    | sectionStyle
    ${true}      | ${true}
    ${false}     | ${false}
    ${'true'}    | ${false}
    ${undefined} | ${false}
  `('section styling=$sectionStyle for isSection=$isSection', async ({ isSection, sectionStyle }) => {
    // act
    await renderWidget(LabelWidget, { label: 'Section A', options: { isSection } });

    // assert
    const text = screen.getByText('Section A');
    if (sectionStyle) expect(text).toHaveStyle({ marginTop: 16, marginBottom: 4 });
    else expect(text).not.toHaveStyle({ marginTop: 16 });
  });

  it('applies the labelColor option', async () => {
    // act
    await renderWidget(LabelWidget, { label: 'Section A', options: { labelColor: '#00ff00' } });

    // assert
    expect(screen.getByText('Section A')).toHaveStyle({ color: '#00ff00' });
  });

  it('never calls onChange', async () => {
    // act
    const { props } = await renderWidget(LabelWidget, { label: 'Section A', value: 'x' });

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });
});

describe('HiddenWidget', () => {
  it('renders a single collapsed view and nothing else', async () => {
    // act
    await renderWidget(HiddenWidget, { label: 'Secret', value: 'abc' });

    // assert
    expect(getWidgetHost().children).toHaveLength(1);
    expect(getWidgetHost().children[0]).toHaveStyle({ display: 'none', height: 0, overflow: 'hidden' });
    expect(screen.queryByText(/Secret|abc/)).not.toBeOnTheScreen();
  });
});

describe('RangeWidget', () => {
  const getSlider = () => screen.getByLabelText('mock-slider');

  it('renders the required label', async () => {
    // act
    await renderWidget(RangeWidget, { label: 'Level', required: true, schema: { type: 'integer' } });

    // assert
    expect(screen.getByText('Level *')).toBeOnTheScreen();
  });

  it.each`
    value        | schema                                           | min   | max    | sliderValue | shown
    ${42}        | ${{ type: 'integer' }}                           | ${0}  | ${100} | ${42}       | ${'42'}
    ${42.6}      | ${{ type: 'number' }}                            | ${0}  | ${100} | ${42.6}     | ${'43'}
    ${undefined} | ${{ type: 'integer' }}                           | ${0}  | ${100} | ${0}        | ${'0'}
    ${undefined} | ${{ type: 'integer', minimum: 10, maximum: 20 }} | ${10} | ${20}  | ${10}       | ${'10'}
    ${NaN}       | ${{ type: 'integer', minimum: 5 }}               | ${5}  | ${100} | ${5}        | ${'5'}
    ${'7'}       | ${{ type: 'integer' }}                           | ${0}  | ${100} | ${0}        | ${'0'}
    ${150}       | ${{ type: 'integer', maximum: 120 }}             | ${0}  | ${120} | ${150}      | ${'150'}
  `(
    'value $value with $schema -> slider [$min,$max] at $sliderValue showing "$shown"',
    async ({ value, schema, min, max, sliderValue, shown }) => {
      // act
      await renderWidget(RangeWidget, { value, schema });

      // assert
      expect(getSlider().props).toEqual(
        expect.objectContaining({ minimumValue: min, maximumValue: max, value: sliderValue })
      );
      expect(screen.getByText(shown)).toBeOnTheScreen();
    }
  );

  it('commits the rounded value on sliding complete through onChange then onBlur', async () => {
    // arrange
    const { props } = await renderWidget(RangeWidget, { id: 'root_level', value: 1, schema: { type: 'number' } });

    // act
    await fireEvent(getSlider(), 'slidingComplete', 12.5);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(13);
    expect(props.onBlur).toHaveBeenCalledWith('root_level', 13);
  });

  it.each`
    disabled | readonly | expected
    ${false} | ${false} | ${false}
    ${true}  | ${false} | ${true}
    ${false} | ${true}  | ${true}
  `(
    'slider disabled=$expected when disabled=$disabled readonly=$readonly',
    async ({ disabled, readonly, expected }) => {
      // act
      await renderWidget(RangeWidget, { disabled, readonly, schema: { type: 'integer' } });

      // assert
      expect(getSlider().props.disabled).toBe(expected);
    }
  );
});

describe('ImageVideoGalleryWidget', () => {
  const URIS = ['file:///a.jpg', 'file:///b.png'];

  beforeEach(() => {
    // the global expo-audio mock returns undefined; the media viewer reads status fields on every render habit-hooks-disable non-essential-comment
    jest.mocked(useAudioPlayerStatus).mockReturnValue({ playing: false, duration: 0, currentTime: 0 } as never);
  });

  it('renders the required title and camera + video buttons by default', async () => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { label: 'Photos', required: true, value: [] });

    // assert
    expect(screen.getByText('Photos *')).toBeOnTheScreen();
    expect(screen.getAllByLabelText(CAPTURE_ICON)).toHaveLength(2);
  });

  const getRemoveButtons = () => screen.queryAllByLabelText('icon-close');

  it('renders one removable thumbnail per uri', async () => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { value: URIS });

    // assert
    expect(getRemoveButtons()).toHaveLength(2);
  });

  it.each`
    value
    ${'not-an-array'}
    ${undefined}
    ${null}
  `('renders no thumbnails for value $value', async ({ value }) => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { value });

    // assert
    expect(getRemoveButtons()).toHaveLength(0);
  });

  it('removes the pressed uri through onChange then onBlur', async () => {
    // arrange
    const { props } = await renderWidget(ImageVideoGalleryWidget, { id: 'root_media', value: URIS });

    // act
    await fireEvent.press(getRemoveButtons()[1]);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(['file:///a.jpg']);
    expect(props.onBlur).toHaveBeenCalledWith('root_media', ['file:///a.jpg']);
  });

  it('removes every occurrence of a duplicated uri', async () => {
    // arrange
    const { props } = await renderWidget(ImageVideoGalleryWidget, {
      value: ['file:///a.jpg', 'file:///b.png', 'file:///a.jpg'],
    });

    // act
    await fireEvent.press(getRemoveButtons()[0]);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(['file:///b.png']);
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `('hides remove buttons when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { value: URIS, disabled, readonly });

    // assert
    expect(getRemoveButtons()).toHaveLength(0);
  });

  it('hides the video button when enableVideo is false', async () => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { value: [], options: { enableVideo: false } });

    // assert
    expect(screen.getAllByLabelText(CAPTURE_ICON)).toHaveLength(1);
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `('disables capture buttons when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // act
    await renderWidget(ImageVideoGalleryWidget, { value: [], disabled, readonly });

    // assert
    screen.getAllByLabelText(CAPTURE_ICON).forEach((button) => expect(button).toBeDisabled());
  });
});
