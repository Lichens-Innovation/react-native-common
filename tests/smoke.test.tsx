import { render, renderHook, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as lib from '@lib';

describe('test infrastructure', () => {
  it('loads the public barrel with every native module mocked', () => {
    expect(Object.keys(lib).length).toBeGreaterThan(10);
  });

  it('renders a React Native element', async () => {
    // act
    await render(<Text>hello</Text>);

    // assert
    expect(screen.getByText('hello')).toBeOnTheScreen();
  });

  it('renders a hook', async () => {
    // act
    const { result } = await renderHook(() => 42);

    // assert
    expect(result.current).toBe(42);
  });
});
