import { makePersistable } from 'mobx-persist-store';
import { getMockLogger } from './core-test.utils';

jest.mock('mobx-persist-store', () => ({ makePersistable: jest.fn() }));

const flushPromises = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

const loadLibInIsolation = () => {
  jest.isolateModules(() => {
    jest.requireActual('@lib');
  });
};

describe('commonStore hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists isDarkMode in MMKV and logs once hydration completes', async () => {
    // arrange
    jest.mocked(makePersistable).mockResolvedValue(undefined as never);

    // act
    loadLibInIsolation();
    await flushPromises();

    // assert
    expect(makePersistable).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'CommonStore', properties: ['isDarkMode'] })
    );
    expect(getMockLogger().info).toHaveBeenCalledWith('[CommonStore] Hydration complete');
  });

  it('handles a hydration failure by logging it as an error', () => {
    // arrange: a controllable thenable stands in for the persistence promise so the failure can be simulated
    type Handler = (value: unknown) => unknown;
    const rejectionHandlers: Handler[] = [];
    const hydration = {
      then: (_onFulfilled?: Handler, onRejected?: Handler) => {
        if (onRejected) rejectionHandlers.push(onRejected);
        return hydration;
      },
      catch: (onRejected: Handler) => {
        rejectionHandlers.push(onRejected);
        return hydration;
      },
    };
    jest.mocked(makePersistable).mockReturnValue(hydration as never);
    const error = new Error('hydrate failed');

    // act
    loadLibInIsolation();
    rejectionHandlers.forEach((handler) => handler(error));

    // assert
    expect(rejectionHandlers).toHaveLength(1);
    expect(getMockLogger().error).toHaveBeenCalledWith('[CommonStore] Hydration failed', error);
  });
});
