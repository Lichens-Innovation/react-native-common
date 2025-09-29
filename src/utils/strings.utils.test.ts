import { describe, expect, it } from 'vitest';
import { isAlphanumeric, removeDiacriticalMarks } from './string.utils';

describe('Tests suite for string utilities', () => {
  describe('isAlphanumeric', () => {
    it.each`
      value          | expected
      ${'abc123'}    | ${true}
      ${'ABC'}       | ${true}
      ${'12345'}     | ${true}
      ${'a1b2c3'}    | ${true}
      ${'abc 123'}   | ${true}
      ${'123_abc'}   | ${true}
      ${'!@#$%'}     | ${false}
      ${'abc123!'}   | ${false}
      ${'Père Noël'} | ${false}
    `('should return $expected for "$value"', ({ value, expected }) => {
      expect(isAlphanumeric(value)).toBe(expected);
    });
  });

  describe('Tests for the removeDiacriticalMarks function', () => {
    it.each`
      value                                           | expected
      ${"Ça va très bien, n'est-ce pas?"}             | ${"Ca va tres bien, n'est-ce pas?"}
      ${'éàùëïö'}                                     | ${'eaueio'}
      ${'Café'}                                       | ${'Cafe'}
      ${'Noël'}                                       | ${'Noel'}
      ${"L'été est là!"}                              | ${"L'ete est la!"}
      ${'München'}                                    | ${'Munchen'}
      ${'José'}                                       | ${'Jose'}
      ${'Fiancée'}                                    | ${'Fiancee'}
      ${'Résumé'}                                     | ${'Resume'}
      ${"À l'école"}                                  | ${"A l'ecole"}
      ${'Süs'}                                        | ${'Sus'}
      ${'naïve'}                                      | ${'naive'}
      ${''}                                           | ${''}
      ${'{{filename}}_{{{yyyy-MM-dd}}}_{{{HHmmss}}}'} | ${'{{filename}}_{{{yyyy-MM-dd}}}_{{{HHmmss}}}'}
    `('should return "$expected" for "$value"', ({ value, expected }) => {
      expect(removeDiacriticalMarks(value)).toBe(expected);
    });
  });
});
