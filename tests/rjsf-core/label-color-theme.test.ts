import { LIGHT_THEME } from '@lib';
import { mergeLabelColorTheme } from '@lib/rjsf';

describe('mergeLabelColorTheme', () => {
  it.each`
    labelColor   | case
    ${undefined} | ${'undefined'}
    ${''}        | ${'empty string'}
  `('returns undefined when labelColor is $case', ({ labelColor }) => {
    expect(mergeLabelColorTheme(LIGHT_THEME, labelColor)).toBeUndefined();
  });

  it('returns undefined when labelColor is whitespace-only', () => {
    // act
    const result = mergeLabelColorTheme(LIGHT_THEME, '   ');

    // assert
    expect(result).toBeUndefined();
  });

  it('overrides only primary and onSurfaceVariant, keeping the rest of the theme', () => {
    // act
    const result = mergeLabelColorTheme(LIGHT_THEME, '#ff0000');

    // assert
    expect(result).toEqual({
      ...LIGHT_THEME,
      colors: { ...LIGHT_THEME.colors, primary: '#ff0000', onSurfaceVariant: '#ff0000' },
    });
    expect(result?.spacing).toBe(LIGHT_THEME.spacing);
  });

  it('does not mutate the input theme', () => {
    // arrange
    const primaryBefore = LIGHT_THEME.colors.primary;

    // act
    mergeLabelColorTheme(LIGHT_THEME, '#00ff00');

    // assert
    expect(LIGHT_THEME.colors.primary).toBe(primaryBefore);
  });
});
