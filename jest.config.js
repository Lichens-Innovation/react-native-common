/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/tests/**/*.test.{ts,tsx}'],
  // the RN/Expo ecosystem ships untranspiled ESM: transform node_modules too (cached after the first run)
  transformIgnorePatterns: ['node_modules/(?!.+)'],
  moduleNameMapper: {
    // tsconfig paths point /utils at the package folder, whose main (dist/index.js) does not exist
    '^@rjsf/utils$': '<rootDir>/node_modules/@rjsf/utils/dist/index.cjs',
    // the .native initializer registers CSS handlers JSReanimated (used under Jest) does not implement
    '^\\./initializers$': '<rootDir>/node_modules/react-native-reanimated/lib/module/initializers.js',
    '^@lib$': '<rootDir>/src/react-native-common.index.ts',
    '^@lib/rjsf$': '<rootDir>/src/components/rjsf/rjsf.index.ts',
  },
};
