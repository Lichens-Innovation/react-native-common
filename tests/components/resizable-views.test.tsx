import { fireEvent, screen } from '@testing-library/react-native';
import { cloneElement, type ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  HorizontalResizableSplitView,
  ResizableOverlayView,
  VerticalResizableSplitView,
  type HorizontalResizableSplitViewProps,
  type ResizableOverlayViewProps,
  type VerticalResizableSplitViewProps,
} from '@lib';
import { renderWithProviders, TEST_THEME } from './render-with-providers';

interface ReanimatedMock {
  useSharedValue: (init: unknown) => unknown;
}

// the global reanimated mock creates a new shared value on every render; layout-driven sizes need them stable across re-renders habit-hooks-disable non-essential-comment
jest.mock('react-native-reanimated', () => {
  const { useRef } = jest.requireActual<typeof import('react')>('react');
  const mock = jest.requireActual<ReanimatedMock>('react-native-reanimated/mock');
  return { ...mock, useSharedValue: (init: unknown) => useRef(mock.useSharedValue(init)).current };
});

type HostElement = ReturnType<typeof screen.getByText>;

const { colors } = TEST_THEME;

const flatten = (element: HostElement) => StyleSheet.flatten(element.props.style) ?? {};

const findAncestor = (element: HostElement, predicate: (node: HostElement) => boolean): HostElement => {
  let node = element.parent as HostElement | null;
  while (node) {
    if (predicate(node)) return node;
    node = node.parent as HostElement | null;
  }
  throw new Error('ancestor not found');
};

const layoutContainerOf = (contentText: string) =>
  findAncestor(screen.getByText(contentText), (node) => typeof node.props.onLayout === 'function');

const paneOf = (contentText: string) => screen.getByText(contentText).parent as HostElement;

const descendantsOf = (root: HostElement) => {
  const nodes: HostElement[] = [];
  const walk = (node: HostElement) => {
    nodes.push(node);
    (node.children as (HostElement | string)[]).forEach((child) => typeof child !== 'string' && walk(child));
  };
  walk(root);
  return nodes;
};

// the drag handle bar is the only view styled with the theme primary color and a border radius habit-hooks-disable non-essential-comment
const handleBarsIn = (contentText: string) =>
  descendantsOf(layoutContainerOf(contentText)).filter((node) => {
    const style = flatten(node);
    return style.backgroundColor === colors.primary && style.borderRadius !== undefined;
  });

// returns a helper firing a container layout followed by a re-render (to read animated styles) habit-hooks-disable non-essential-comment
const renderResizable = async (ui: ReactElement, contentText: string) => {
  const { rerender } = await renderWithProviders(ui);
  const relayout = async (width: number, height: number) => {
    await fireEvent(layoutContainerOf(contentText), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width, height } },
    });
    await rerender(cloneElement(ui));
  };
  return { relayout };
};

const expectRenderToThrow = async (ui: ReactElement, message: string) => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  await expect(renderWithProviders(ui)).rejects.toThrow(message);
};

describe('ResizableOverlayView', () => {
  const overlay = (props: Partial<ResizableOverlayViewProps> = {}) => (
    <ResizableOverlayView
      foregroundContent={<Text>Foreground</Text>}
      backgroundContent={<Text>Background</Text>}
      {...props}
    />
  );

  it('renders both contents and the drag handle by default', async () => {
    // act
    await renderResizable(overlay(), 'Foreground');

    // assert
    expect(screen.getByText('Foreground')).toBeOnTheScreen();
    expect(screen.getByText('Background')).toBeOnTheScreen();
    expect(handleBarsIn('Foreground')).toHaveLength(1);
  });

  it('hides the handle when hideHandle is true', async () => {
    // act
    await renderResizable(overlay({ hideHandle: true }), 'Foreground');

    // assert
    expect(handleBarsIn('Foreground')).toHaveLength(0);
  });

  it('pins the handle bar style (horizontal bar) and merges handleStyle / handleContainerStyle', async () => {
    // arrange
    await renderResizable(
      overlay({ handleStyle: { opacity: 0.5 }, handleContainerStyle: { zIndex: 7 } }),
      'Foreground'
    );

    // act
    const [bar] = handleBarsIn('Foreground');

    // assert
    expect(flatten(bar)).toMatchObject({ width: 40, height: 4, opacity: 0.5, transform: [{ scale: 1 }] });
    expect(flatten(bar.parent as HostElement)).toMatchObject({ position: 'absolute', height: 20, zIndex: 7 });
  });

  it.each`
    anchorType       | expectedAnchor
    ${undefined}     | ${{ top: 0, right: 0 }}
    ${'topLeft'}     | ${{ top: 0, left: 0 }}
    ${'topRight'}    | ${{ top: 0, right: 0 }}
    ${'bottomLeft'}  | ${{ bottom: 0, left: 0 }}
    ${'bottomRight'} | ${{ bottom: 0, right: 0 }}
  `('anchors the overlay with $expectedAnchor for anchorType=$anchorType', async ({ anchorType, expectedAnchor }) => {
    // act
    await renderResizable(overlay({ anchorType }), 'Foreground');

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject({
      position: 'absolute',
      overflow: 'hidden',
      ...expectedAnchor,
    });
  });

  it('has a zero-height overlay before the first layout', async () => {
    // act
    await renderResizable(overlay(), 'Foreground');

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject({ height: 0 });
  });

  it('sizes the overlay from the default ratios after layout (0.5 of height)', async () => {
    // arrange
    const { relayout } = await renderResizable(overlay(), 'Foreground');

    // act
    await relayout(400, 1000);

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject({ height: 500 });
    expect(flatten(paneOf('Foreground')).width).toBeUndefined();
  });

  it.each`
    initialForegroundRatio | minForegroundRatio | maxForegroundRatio | expectedHeight
    ${0.3}                 | ${undefined}       | ${undefined}       | ${300}
    ${0.1}                 | ${0.1}             | ${undefined}       | ${100}
    ${0.9}                 | ${undefined}       | ${0.95}            | ${900}
    ${1}                   | ${0}               | ${1}               | ${1000}
    ${0.1}                 | ${undefined}       | ${undefined}       | ${150}
  `(
    'sizes the overlay to $expectedHeight for initial=$initialForegroundRatio min=$minForegroundRatio max=$maxForegroundRatio',
    async ({ initialForegroundRatio, minForegroundRatio, maxForegroundRatio, expectedHeight }) => {
      // arrange
      const { relayout } = await renderResizable(
        overlay({ initialForegroundRatio, minForegroundRatio, maxForegroundRatio }),
        'Foreground'
      );

      // act
      await relayout(400, 1000);

      // assert
      expect(flatten(paneOf('Foreground'))).toMatchObject({ height: expectedHeight });
    }
  );

  it.each`
    width  | height  | aspectRatio | expected                       | description
    ${400} | ${1000} | ${2}        | ${{ height: 200, width: 400 }} | ${'width-limited: height capped by width / aspect ratio'}
    ${400} | ${1000} | ${0.5}      | ${{ height: 500, width: 250 }} | ${'height-limited: width derived from height'}
    ${100} | ${1000} | ${4}        | ${{ height: 150, width: 100 }} | ${'min height wins over aspect ratio cap'}
  `('applies the aspect ratio: $description', async ({ width, height, aspectRatio, expected }) => {
    // arrange
    const { relayout } = await renderResizable(overlay({ foregroundContentAspectRatio: aspectRatio }), 'Foreground');

    // act
    await relayout(width, height);

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject(expected);
  });

  it('resets the overlay to zero when the layout height becomes 0', async () => {
    // arrange
    const { relayout } = await renderResizable(overlay(), 'Foreground');
    await relayout(400, 1000);

    // act
    await relayout(400, 0);

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject({ height: 0 });
  });

  it('recomputes the overlay on every layout change', async () => {
    // arrange
    const { relayout } = await renderResizable(overlay(), 'Foreground');
    await relayout(400, 1000);

    // act
    await relayout(400, 600);

    // assert
    expect(flatten(paneOf('Foreground'))).toMatchObject({ height: 300 });
  });

  it.each`
    anchorType       | aspectRatio  | expected                               | description
    ${'topRight'}    | ${undefined} | ${{ top: 490, width: 400, left: 0 }}   | ${'top anchor: handle on the bottom edge'}
    ${'bottomLeft'}  | ${undefined} | ${{ top: 490, width: 400, left: 0 }}   | ${'bottom anchor: handle on the top edge'}
    ${'topRight'}    | ${0.5}       | ${{ top: 490, width: 250, left: 150 }} | ${'right anchor with aspect ratio: left offset'}
    ${'topLeft'}     | ${0.5}       | ${{ top: 490, width: 250, left: 0 }}   | ${'left anchor with aspect ratio'}
    ${'bottomRight'} | ${2}         | ${{ top: 790, width: 400, left: 0 }}   | ${'bottom anchor width-limited'}
    ${'topLeft'}     | ${2}         | ${{ top: 190, width: 400, left: 0 }}   | ${'top anchor width-limited'}
  `('positions the handle container: $description', async ({ anchorType, aspectRatio, expected }) => {
    // arrange
    const { relayout } = await renderResizable(
      overlay({ anchorType, foregroundContentAspectRatio: aspectRatio }),
      'Foreground'
    );

    // act
    await relayout(400, 1000);

    // assert
    const handleContainer = handleBarsIn('Foreground')[0].parent as HostElement;
    expect(flatten(handleContainer)).toMatchObject(expected);
  });

  it('positions the handle container before layout at the top edge', async () => {
    // act
    await renderResizable(overlay(), 'Foreground');

    // assert
    const handleContainer = handleBarsIn('Foreground')[0].parent as HostElement;
    expect(flatten(handleContainer)).toMatchObject({ top: -10, width: 0, left: 0 });
  });

  describe('obscuring mask', () => {
    it('renders contents directly when no obscuring is requested', async () => {
      // act
      await renderResizable(overlay(), 'Foreground');

      // assert
      expect(paneOf('Foreground').children).toHaveLength(1);
      expect(paneOf('Background').children).toHaveLength(1);
    });

    it.each`
      prop                                                 | contentText     | maskColor
      ${'shouldObscureForegroundPaneContentWhileResizing'} | ${'Foreground'} | ${colors.surfaceVariant}
      ${'shouldObscureBackgroundPaneContentWhileResizing'} | ${'Background'} | ${colors.surface}
    `('$prop adds an opaque $maskColor mask until layout is ready', async ({ prop, contentText, maskColor }) => {
      // arrange
      const { relayout } = await renderResizable(overlay({ [prop]: true }), 'Foreground');
      const maskBefore = paneOf(contentText).children[1] as HostElement;

      // assert
      expect(paneOf(contentText).children).toHaveLength(2);
      expect(flatten(maskBefore)).toMatchObject({ position: 'absolute', backgroundColor: maskColor, opacity: 1 });

      // act
      await relayout(400, 1000);

      // assert
      expect(flatten(paneOf(contentText).children[1] as HostElement)).toMatchObject({ opacity: 0 });
    });
  });

  describe('dev props validation', () => {
    it.each`
      props                                                                                 | message
      ${{ foregroundContentAspectRatio: 0 }}                                                | ${'foregroundContentAspectRatio must be greater than 0. Provided: 0'}
      ${{ foregroundContentAspectRatio: -1 }}                                               | ${'foregroundContentAspectRatio must be greater than 0. Provided: -1'}
      ${{ foregroundContentAspectRatio: Number.POSITIVE_INFINITY }}                         | ${'foregroundContentAspectRatio must be greater than 0. Provided: Infinity'}
      ${{ foregroundContentAspectRatio: Number.NaN }}                                       | ${'foregroundContentAspectRatio must be greater than 0. Provided: NaN'}
      ${{ initialForegroundRatio: 1.5 }}                                                    | ${'initialForegroundRatio must be between 0 and 1. Provided: 1.5'}
      ${{ initialForegroundRatio: Number.NaN }}                                             | ${'initialForegroundRatio must be between 0 and 1. Provided: NaN'}
      ${{ minForegroundRatio: -0.1 }}                                                       | ${'minForegroundRatio must be between 0 and 1. Provided: -0.1'}
      ${{ maxForegroundRatio: 2 }}                                                          | ${'maxForegroundRatio must be between 0 and 1. Provided: 2'}
      ${{ maxForegroundRatio: Number.NaN }}                                                 | ${'maxForegroundRatio must be between 0 and 1. Provided: NaN'}
      ${{ minForegroundRatio: 0.5, maxForegroundRatio: 0.5 }}                               | ${'minForegroundRatio must be less than maxForegroundRatio. Provided: {"minForegroundRatio":0.5,"maxForegroundRatio":0.5}'}
      ${{ initialForegroundRatio: 0.1, minForegroundRatio: 0.2 }}                           | ${'initialForegroundRatio must be >= minForegroundRatio. Provided: {"initialForegroundRatio":0.1,"minForegroundRatio":0.2}'}
      ${{ initialForegroundRatio: 0.9, maxForegroundRatio: 0.8 }}                           | ${'initialForegroundRatio must be <= maxForegroundRatio. Provided: {"initialForegroundRatio":0.9,"maxForegroundRatio":0.8}'}
      ${{ initialForegroundRatio: 2, minForegroundRatio: 0.9, maxForegroundRatio: 0.1 }}    | ${'initialForegroundRatio must be between 0 and 1. Provided: 2'}
      ${{ initialForegroundRatio: 0.05, minForegroundRatio: 0.9, maxForegroundRatio: 0.1 }} | ${'minForegroundRatio must be less than maxForegroundRatio. Provided: {"minForegroundRatio":0.9,"maxForegroundRatio":0.1}'}
    `('throws "$message"', async ({ props, message }) => {
      await expectRenderToThrow(overlay(props), message);
    });

    it.each`
      props
      ${{}}
      ${{ initialForegroundRatio: 0.15 }}
      ${{ initialForegroundRatio: 0.85 }}
      ${{ initialForegroundRatio: 0, minForegroundRatio: 0, maxForegroundRatio: 1 }}
      ${{ foregroundContentAspectRatio: 16 / 9 }}
      ${{ initialForegroundRatio: 0.1 }}
      ${{ initialForegroundRatio: 0.95 }}
    `('accepts $props (implicit default bounds are not validated)', async ({ props }) => {
      // act
      await renderResizable(overlay(props), 'Foreground');

      // assert
      expect(screen.getByText('Foreground')).toBeOnTheScreen();
    });
  });
});

describe('HorizontalResizableSplitView', () => {
  const split = (props: Partial<HorizontalResizableSplitViewProps> = {}) => (
    <HorizontalResizableSplitView leftContent={<Text>Left</Text>} rightContent={<Text>Right</Text>} {...props} />
  );

  const handleContainer = () => layoutContainerOf('Left').children[2] as HostElement;

  it('renders both panes in a row and the handle', async () => {
    // act
    await renderResizable(split(), 'Left');

    // assert
    expect(screen.getByText('Left')).toBeOnTheScreen();
    expect(screen.getByText('Right')).toBeOnTheScreen();
    expect(flatten(layoutContainerOf('Left'))).toMatchObject({ flex: 1, flexDirection: 'row' });
    expect(handleBarsIn('Left')).toHaveLength(1);
  });

  it('pins the vertical handle bar style', async () => {
    // act
    await renderResizable(split({ handleStyle: { opacity: 0.3 } }), 'Left');

    // assert
    expect(flatten(handleBarsIn('Left')[0])).toMatchObject({ width: 4, height: 40, opacity: 0.3 });
    expect(flatten(handleContainer())).toMatchObject({ position: 'absolute', top: 0, bottom: 0, width: 20 });
  });

  it.each`
    initialLeftRatio | expectedLeft | expectedRight | expectedHandleLeft
    ${undefined}     | ${300}       | ${300}        | ${290}
    ${0.25}          | ${150}       | ${450}        | ${140}
    ${0.85}          | ${510}       | ${90}         | ${500}
    ${0}             | ${0}         | ${600}        | ${-10}
  `(
    'splits a 600 wide container at initialLeftRatio=$initialLeftRatio',
    async ({ initialLeftRatio, expectedLeft, expectedRight, expectedHandleLeft }) => {
      // arrange
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const { relayout } = await renderResizable(split({ initialLeftRatio, minLeftRatio: 0 }), 'Left');

      // act
      await relayout(600, 400);

      // assert
      expect(flatten(paneOf('Left'))).toMatchObject({ width: expectedLeft });
      expect(flatten(paneOf('Right'))).toMatchObject({ width: expectedRight });
      expect(flatten(handleContainer())).toMatchObject({ left: expectedHandleLeft });
    }
  );

  it('ignores a zero-width layout, then freezes the first positive layout', async () => {
    // arrange
    const { relayout } = await renderResizable(split(), 'Left');

    // act
    await relayout(0, 400);
    const widthAfterZero = flatten(paneOf('Left')).width;
    await relayout(600, 400);
    await relayout(1000, 400);

    // assert
    expect(widthAfterZero).toBe(0);
    expect(flatten(paneOf('Left'))).toMatchObject({ width: 300 });
    expect(flatten(paneOf('Right'))).toMatchObject({ width: 300 });
  });

  it('hides the handle when hideHandle is true', async () => {
    // act
    await renderResizable(split({ hideHandle: true }), 'Left');

    // assert
    expect(layoutContainerOf('Left').children).toHaveLength(2);
    expect(handleBarsIn('Left')).toHaveLength(0);
  });

  it.each`
    obscureLeft | obscureRight | leftChildren | rightChildren
    ${false}    | ${false}     | ${1}         | ${1}
    ${true}     | ${false}     | ${2}         | ${1}
    ${false}    | ${true}      | ${1}         | ${2}
  `(
    'mask children left=$leftChildren right=$rightChildren',
    async ({ obscureLeft, obscureRight, leftChildren, rightChildren }) => {
      // act
      await renderResizable(
        split({
          shouldObscureLeftPaneContentWhileResizing: obscureLeft,
          shouldObscureRightPaneContentWhileResizing: obscureRight,
        }),
        'Left'

        // assert
      );
      expect(paneOf('Left').children).toHaveLength(leftChildren);
      expect(paneOf('Right').children).toHaveLength(rightChildren);
    }
  );

  it('uses surface for the left mask and surfaceVariant for the right mask', async () => {
    // act
    await renderResizable(
      split({ shouldObscureLeftPaneContentWhileResizing: true, shouldObscureRightPaneContentWhileResizing: true }),
      'Left'

      // assert
    );
    expect(flatten(paneOf('Left').children[1] as HostElement).backgroundColor).toBe(colors.surface);
    expect(flatten(paneOf('Right').children[1] as HostElement).backgroundColor).toBe(colors.surfaceVariant);
  });

  describe('dev props validation', () => {
    it.each`
      props                                           | message
      ${{ initialLeftRatio: -1 }}                     | ${'initialLeftRatio must be between 0 and 1. Provided: -1'}
      ${{ minLeftRatio: 1.1 }}                        | ${'minLeftRatio must be between 0 and 1. Provided: 1.1'}
      ${{ maxLeftRatio: 5 }}                          | ${'maxLeftRatio must be between 0 and 1. Provided: 5'}
      ${{ minLeftRatio: Number.POSITIVE_INFINITY }}   | ${'minLeftRatio must be between 0 and 1. Provided: Infinity'}
      ${{ minLeftRatio: 0.6, maxLeftRatio: 0.4 }}     | ${'minLeftRatio must be less than maxLeftRatio. Provided: {"minLeftRatio":0.6,"maxLeftRatio":0.4}'}
      ${{ initialLeftRatio: 0.1, minLeftRatio: 0.2 }} | ${'initialLeftRatio must be >= minLeftRatio. Provided: {"initialLeftRatio":0.1,"minLeftRatio":0.2}'}
      ${{ initialLeftRatio: 0.9, maxLeftRatio: 0.8 }} | ${'initialLeftRatio must be <= maxLeftRatio. Provided: {"initialLeftRatio":0.9,"maxLeftRatio":0.8}'}
    `('throws "$message"', async ({ props, message }) => {
      await expectRenderToThrow(split(props), message);
    });

    it('accepts a NaN ratio (no finiteness check in split views)', async () => {
      // act
      await renderResizable(split({ initialLeftRatio: Number.NaN }), 'Left');

      // assert
      expect(screen.getByText('Left')).toBeOnTheScreen();
    });
  });
});

describe('VerticalResizableSplitView', () => {
  const split = (props: Partial<VerticalResizableSplitViewProps> = {}) => (
    <VerticalResizableSplitView topContent={<Text>Top</Text>} bottomContent={<Text>Bottom</Text>} {...props} />
  );

  const handleContainer = () => layoutContainerOf('Top').children[2] as HostElement;

  it('renders both panes in a column and the handle', async () => {
    // act
    await renderResizable(split(), 'Top');

    // assert
    expect(screen.getByText('Top')).toBeOnTheScreen();
    expect(screen.getByText('Bottom')).toBeOnTheScreen();
    expect(flatten(layoutContainerOf('Top')).flexDirection).toBeUndefined();
    expect(flatten(handleBarsIn('Top')[0])).toMatchObject({ width: 40, height: 4 });
    expect(flatten(handleContainer())).toMatchObject({ position: 'absolute', left: 0, right: 0, height: 20 });
  });

  it.each`
    initialTopRatio | expectedTop | expectedBottom | expectedHandleTop
    ${undefined}    | ${400}      | ${400}         | ${390}
    ${0.2}          | ${160}      | ${640}         | ${150}
  `(
    'splits an 800 high container at initialTopRatio=$initialTopRatio',
    async ({ initialTopRatio, expectedTop, expectedBottom, expectedHandleTop }) => {
      // arrange
      const { relayout } = await renderResizable(split({ initialTopRatio }), 'Top');

      // act
      await relayout(300, 800);

      // assert
      expect(flatten(paneOf('Top'))).toMatchObject({ height: expectedTop });
      expect(flatten(paneOf('Bottom'))).toMatchObject({ height: expectedBottom });
      expect(flatten(handleContainer())).toMatchObject({ top: expectedHandleTop });
    }
  );

  it('ignores a zero-height layout, then freezes the first positive layout', async () => {
    // arrange
    const { relayout } = await renderResizable(split(), 'Top');

    // act
    await relayout(300, 0);
    await relayout(300, 800);
    await relayout(300, 200);

    // assert
    expect(flatten(paneOf('Top'))).toMatchObject({ height: 400 });
  });

  it('hides the handle when hideHandle is true', async () => {
    // act
    await renderResizable(split({ hideHandle: true }), 'Top');

    // assert
    expect(layoutContainerOf('Top').children).toHaveLength(2);
  });

  it.each`
    obscureTop | obscureBottom | topChildren | bottomChildren
    ${true}    | ${false}      | ${2}        | ${1}
    ${false}   | ${true}       | ${1}        | ${2}
  `(
    'mask children top=$topChildren bottom=$bottomChildren',
    async ({ obscureTop, obscureBottom, topChildren, bottomChildren }) => {
      // act
      await renderResizable(
        split({
          shouldObscureTopPaneContentWhileResizing: obscureTop,
          shouldObscureBottomPaneContentWhileResizing: obscureBottom,
        }),
        'Top'

        // assert
      );
      expect(paneOf('Top').children).toHaveLength(topChildren);
      expect(paneOf('Bottom').children).toHaveLength(bottomChildren);
    }
  );

  describe('dev props validation', () => {
    it.each`
      props                                         | message
      ${{ initialTopRatio: 1.2 }}                   | ${'initialTopRatio must be between 0 and 1. Provided: 1.2'}
      ${{ minTopRatio: -0.5 }}                      | ${'minTopRatio must be between 0 and 1. Provided: -0.5'}
      ${{ maxTopRatio: 3 }}                         | ${'maxTopRatio must be between 0 and 1. Provided: 3'}
      ${{ minTopRatio: 0.7, maxTopRatio: 0.7 }}     | ${'minTopRatio must be less than maxTopRatio. Provided: {"minTopRatio":0.7,"maxTopRatio":0.7}'}
      ${{ initialTopRatio: 0.1, minTopRatio: 0.3 }} | ${'initialTopRatio must be >= minTopRatio. Provided: {"initialTopRatio":0.1,"minTopRatio":0.3}'}
      ${{ initialTopRatio: 0.9, maxTopRatio: 0.5 }} | ${'initialTopRatio must be <= maxTopRatio. Provided: {"initialTopRatio":0.9,"maxTopRatio":0.5}'}
    `('throws "$message"', async ({ props, message }) => {
      await expectRenderToThrow(split(props), message);
    });

    it('accepts a NaN ratio (no finiteness check in split views)', async () => {
      // act
      await renderResizable(split({ maxTopRatio: Number.NaN }), 'Top');

      // assert
      expect(screen.getByText('Top')).toBeOnTheScreen();
    });
  });
});
