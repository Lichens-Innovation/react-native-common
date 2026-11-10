import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react-native';
import { runInAction } from 'mobx';
import type { AppStateStatus } from 'react-native';
import { SnackbarContext, WifiInfosProvider, commonStore } from '@lib';

const DETAILS_QUERY_KEY = ['wifi-diagnose', 'details'];

const setAppStatus = async (status: AppStateStatus) => {
  await act(async () => {
    runInAction(() => {
      commonStore.appStatus = status;
    });
  });
};

const renderProvider = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
  await render(
    <QueryClientProvider client={queryClient}>
      <SnackbarContext.Provider value={{ showSnackbarMessage: jest.fn() }}>
        <WifiInfosProvider>{null}</WifiInfosProvider>
      </SnackbarContext.Provider>
    </QueryClientProvider>
  );
  return { invalidate };
};

const detailsInvalidations = (invalidate: jest.SpyInstance) =>
  invalidate.mock.calls.filter(([filters]) => JSON.stringify(filters?.queryKey) === JSON.stringify(DETAILS_QUERY_KEY));

describe('WifiInfosProvider', () => {
  beforeEach(async () => {
    await setAppStatus('active');
  });

  it('does not invalidate the wifi details on mount', async () => {
    // act
    const { invalidate } = await renderProvider();

    // assert
    expect(detailsInvalidations(invalidate)).toHaveLength(0);
  });

  it('invalidates the wifi details when the app comes back to the foreground', async () => {
    // arrange
    const { invalidate } = await renderProvider();
    await setAppStatus('background');

    // act
    await setAppStatus('active');

    // assert
    expect(detailsInvalidations(invalidate)).toHaveLength(1);
  });

  it('does not invalidate when the app goes to the background', async () => {
    // arrange
    const { invalidate } = await renderProvider();

    // act
    await setAppStatus('background');
    await setAppStatus('inactive');

    // assert
    expect(detailsInvalidations(invalidate)).toHaveLength(0);
  });
});
