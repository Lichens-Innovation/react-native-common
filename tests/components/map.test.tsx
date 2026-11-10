import { act, fireEvent, renderHook, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { geoJsonPointToLatLng, LocationPickerModal, logger, useUserLocation, type GeoJsonPoint } from '@lib';
import { renderWithProviders } from './render-with-providers';

type HostNode = NonNullable<typeof screen.root>;

const DEFAULT_REGION = { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.001, longitudeDelta: 0.001 };

const position = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } });

const mocked = {
  getForegroundPermissionsAsync: jest.mocked(Location.getForegroundPermissionsAsync),
  requestForegroundPermissionsAsync: jest.mocked(Location.requestForegroundPermissionsAsync),
  getLastKnownPositionAsync: jest.mocked(Location.getLastKnownPositionAsync),
  watchPositionAsync: jest.mocked(Location.watchPositionAsync),
};

let watchCallback: ((location: unknown) => void) | undefined;
const subscription = { remove: jest.fn() };

const setUpLocation = ({
  currentStatus = 'granted',
  requestedStatus = 'granted',
  lastKnown = null as unknown,
}: { currentStatus?: string; requestedStatus?: string; lastKnown?: unknown } = {}) => {
  mocked.getForegroundPermissionsAsync.mockResolvedValue({ status: currentStatus } as never);
  mocked.requestForegroundPermissionsAsync.mockResolvedValue({ status: requestedStatus } as never);
  mocked.getLastKnownPositionAsync.mockResolvedValue(lastKnown as never);
  mocked.watchPositionAsync.mockImplementation((async (_options: unknown, callback: (location: unknown) => void) => {
    watchCallback = callback;
    return subscription;
  }) as never);
};

const flushPromises = () =>
  act(async () => {
    await Promise.resolve();
  });

beforeEach(() => {
  jest.clearAllMocks();
  watchCallback = undefined;
  setUpLocation();
});

describe('geoJsonPointToLatLng', () => {
  it.each`
    point                                                       | expected                                           | description
    ${{ type: 'Point', coordinates: [-73.5, 45.5] }}            | ${{ latitude: 45.5, longitude: -73.5 }}            | ${'swaps [lng, lat] into a LatLng'}
    ${{ type: 'Point', coordinates: [0, 0] }}                   | ${{ latitude: 0, longitude: 0 }}                   | ${'keeps zero coordinates'}
    ${null}                                                     | ${null}                                            | ${'null'}
    ${undefined}                                                | ${null}                                            | ${'undefined'}
    ${{ type: 'LineString', coordinates: [1, 2] }}              | ${null}                                            | ${'non Point type'}
    ${{ type: 'Point', coordinates: [1] }}                      | ${null}                                            | ${'one coordinate'}
    ${{ type: 'Point', coordinates: [1, 2, 3] }}                | ${null}                                            | ${'three coordinates'}
    ${{ type: 'Point', coordinates: 'nope' }}                   | ${null}                                            | ${'non-array coordinates'}
    ${{ type: 'Point', coordinates: ['1', 2] }}                 | ${null}                                            | ${'string longitude'}
    ${{ type: 'Point', coordinates: [1, null] }}                | ${null}                                            | ${'null latitude'}
    ${{ type: 'Point', coordinates: [Number.NaN, Number.NaN] }} | ${{ latitude: Number.NaN, longitude: Number.NaN }} | ${'NaN numbers (still numbers)'}
  `('returns $expected for $description', ({ point, expected }) => {
    expect(geoJsonPointToLatLng(point as GeoJsonPoint)).toEqual(expected);
  });
});

describe('useUserLocation', () => {
  it('starts loading with the default region and no location', async () => {
    // arrange
    mocked.getForegroundPermissionsAsync.mockReturnValue(new Promise(() => undefined));

    // act
    const { result } = await renderHook(() => useUserLocation());

    // assert
    expect(result.current).toMatchObject({
      userLocation: null,
      region: DEFAULT_REGION,
      isLoading: true,
      locationPermissionDenied: false,
      mapError: null,
    });
  });

  it('does not request permission when already granted and applies the last known position', async () => {
    // arrange
    setUpLocation({ lastKnown: position(45.5, -73.6) });

    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.getLastKnownPositionAsync).toHaveBeenCalledWith({});
    expect(result.current).toMatchObject({
      userLocation: { latitude: 45.5, longitude: -73.6 },
      region: { ...DEFAULT_REGION, latitude: 45.5, longitude: -73.6 },
      isLoading: false,
      locationPermissionDenied: false,
      mapError: null,
    });
  });

  it('watches the position with high accuracy and updates userLocation (not region) on updates', async () => {
    // arrange
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // act
    await act(async () => watchCallback?.(position(10, 20)));

    // assert
    expect(mocked.watchPositionAsync).toHaveBeenCalledWith(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      expect.any(Function)
    );
    expect(result.current.userLocation).toEqual({ latitude: 10, longitude: 20 });
    expect(result.current.region).toEqual(DEFAULT_REGION);
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps loading when there is no last known position and no update yet', async () => {
    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.userLocation).toBeNull();
  });

  it('requests permission when not granted yet', async () => {
    // arrange
    setUpLocation({ currentStatus: 'undetermined', requestedStatus: 'granted', lastKnown: position(1, 2) });

    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(mocked.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result.current.locationPermissionDenied).toBe(false);
    expect(result.current.userLocation).toEqual({ latitude: 1, longitude: 2 });
  });

  it('flags permission denied but still reads the last known position and watches', async () => {
    // arrange
    setUpLocation({ currentStatus: 'denied', requestedStatus: 'denied', lastKnown: position(3, 4) });

    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(result.current.locationPermissionDenied).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.userLocation).toEqual({ latitude: 3, longitude: 4 });
    expect(mocked.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('sets an error state and logs when initialization throws', async () => {
    // arrange
    mocked.getForegroundPermissionsAsync.mockRejectedValue(new Error('boom'));
    const errorSpy = jest.spyOn(logger, 'error');

    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(errorSpy).toHaveBeenCalledWith('Error during user location initialization: boom');
    expect(result.current).toMatchObject({
      isLoading: false,
      locationPermissionDenied: true,
      mapError: 'Failed to initialize map',
      userLocation: null,
    });
  });

  it('sets an error state when watchPositionAsync rejects, after applying the last known position', async () => {
    // arrange
    setUpLocation({ lastKnown: position(5, 6) });
    mocked.watchPositionAsync.mockRejectedValue(new Error('watch failed'));

    // act
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();

    // assert
    expect(result.current).toMatchObject({
      userLocation: { latitude: 5, longitude: 6 },
      isLoading: false,
      locationPermissionDenied: true,
      mapError: 'Failed to initialize map',
    });
  });

  it('stops loading after the 10s timeout', async () => {
    // arrange
    jest.useFakeTimers();
    mocked.getForegroundPermissionsAsync.mockReturnValue(new Promise(() => undefined));
    const { result } = await renderHook(() => useUserLocation());

    // act
    await act(async () => {
      jest.advanceTimersByTime(9999);
    });
    const isLoadingBefore = result.current.isLoading;
    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    // assert
    expect(isLoadingBefore).toBe(true);
    expect(result.current.isLoading).toBe(false);
    jest.useRealTimers();
  });

  it('setRegion replaces the region', async () => {
    // arrange
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();
    const region = { latitude: 1, longitude: 2, latitudeDelta: 3, longitudeDelta: 4 };

    // act
    await act(async () => result.current.setRegion(region));

    // assert
    expect(result.current.region).toEqual(region);
  });

  it('keeps setRegion and retry identities stable across renders', async () => {
    // arrange
    const { result, rerender } = await renderHook(() => useUserLocation());
    const { setRegion, retry } = result.current;

    // act
    await rerender({});
    await flushPromises();

    // assert
    expect(result.current.setRegion).toBe(setRegion);
    expect(result.current.retry).toBe(retry);
  });

  it('retry resets the error state and re-runs the permission flow', async () => {
    // arrange
    mocked.getForegroundPermissionsAsync.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();
    expect(result.current.mapError).toBe('Failed to initialize map');
    setUpLocation({ lastKnown: position(7, 8) });

    // act
    await act(async () => result.current.retry());
    await flushPromises();

    // assert
    expect(mocked.getForegroundPermissionsAsync).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({
      mapError: null,
      locationPermissionDenied: false,
      isLoading: false,
      userLocation: { latitude: 7, longitude: 8 },
    });
  });

  it('ignores watch updates from a previous run after retry (aborted)', async () => {
    // arrange
    const { result } = await renderHook(() => useUserLocation());
    await flushPromises();
    const firstWatchCallback = watchCallback;
    await act(async () => result.current.retry());
    await flushPromises();

    // act
    await act(async () => firstWatchCallback?.(position(50, 50)));

    // assert
    expect(result.current.userLocation).toBeNull();
  });

  it('removes the subscription on unmount', async () => {
    // arrange
    const { unmount } = await renderHook(() => useUserLocation());
    await flushPromises();

    // act
    await unmount();

    // assert
    expect(subscription.remove).toHaveBeenCalledTimes(1);
  });

  it('ignores watch updates after unmount', async () => {
    // arrange
    const { result, unmount } = await renderHook(() => useUserLocation());
    await flushPromises();
    const snapshot = result.current.userLocation;

    // act
    await unmount();
    await act(async () => watchCallback?.(position(9, 9)));

    // assert
    expect(result.current.userLocation).toBe(snapshot);
  });
});

describe('LocationPickerModal', () => {
  const POINT: GeoJsonPoint = { type: 'Point', coordinates: [-73.6, 45.5] };

  const renderModal = (initialPoint: GeoJsonPoint | null) => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const rendering = renderWithProviders(
      <LocationPickerModal initialPoint={initialPoint} onConfirm={onConfirm} onCancel={onCancel} />
    );
    return { onConfirm, onCancel, rendering };
  };

  const confirmButton = () => screen.getByRole('button', { name: 'common:confirm' });

  const isHostNode = (child: HostNode | string): child is HostNode => typeof child !== 'string';

  const mapElement = () => {
    const queue: (HostNode | null)[] = [screen.root];
    while (queue.length) {
      const node = queue.shift();
      if (node?.props.provider === 'google') return node;
      queue.push(...(node?.children ?? []).filter(isHostNode));
    }
    throw new Error('map not found');
  };

  it('centers on the initial point and shows a marker with confirm enabled', async () => {
    // arrange
    const { onConfirm, rendering } = renderModal(POINT);
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:confirm'));

    // assert
    expect(mapElement().props.initialRegion).toEqual({
      latitude: 45.5,
      longitude: -73.6,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    expect(mapElement().props.showsUserLocation).toBe(true);
    const marker = mapElement().children.find(isHostNode);
    expect(marker?.props).toMatchObject({ coordinate: { latitude: 45.5, longitude: -73.6 }, pinColor: '#FF7E46' });
    expect(onConfirm).toHaveBeenCalledWith(45.5, -73.6);
  });

  it('falls back to the default region, no marker and confirm disabled without a point or location', async () => {
    // arrange
    mocked.getForegroundPermissionsAsync.mockReturnValue(new Promise(() => undefined));
    const { onConfirm, rendering } = renderModal(null);
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:confirm'));

    // assert
    expect(mapElement().props.initialRegion).toEqual(DEFAULT_REGION);
    expect(mapElement().children.filter((child: unknown) => typeof child !== 'string')).toHaveLength(0);
    expect(confirmButton()).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('centers on the user location when no initial point is given (marker stays empty)', async () => {
    // arrange
    setUpLocation({ lastKnown: position(12, 34) });

    // act
    await renderModal(null).rendering;
    await flushPromises();

    // assert
    expect(mapElement().props.initialRegion).toEqual({
      latitude: 12,
      longitude: 34,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    expect(confirmButton()).toBeDisabled();
  });

  it('treats an invalid initial point like no point', async () => {
    // arrange
    mocked.getForegroundPermissionsAsync.mockReturnValue(new Promise(() => undefined));

    // act
    await renderModal({ type: 'Point', coordinates: [1] as unknown as [number, number] }).rendering;

    // assert
    expect(mapElement().props.initialRegion).toEqual(DEFAULT_REGION);
    expect(confirmButton()).toBeDisabled();
  });

  it('moves the pending marker on map press and confirms the pressed coordinate', async () => {
    // arrange
    const { onConfirm, rendering } = renderModal(null);
    await rendering;

    // act
    await fireEvent(mapElement(), 'press', { nativeEvent: { coordinate: { latitude: 1.5, longitude: 2.5 } } });
    await fireEvent.press(screen.getByText('common:confirm'));

    // assert
    expect(onConfirm).toHaveBeenCalledWith(1.5, 2.5);
  });

  it('calls onCancel from the cancel button', async () => {
    // arrange
    const { onCancel, rendering } = renderModal(POINT);
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:cancel'));

    // assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
