import * as Sentry from '@sentry/react-native';
import { act, fireEvent, renderHook, screen } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { ErrorBoundary, ErrorBoundaryScreen, ErrorDetails, logger, useErrorDetails } from '@lib';
import { renderWithProviders } from './render-with-providers';

const mockRouter = { replace: jest.fn() };
const mockSearchParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  get router() {
    return mockRouter;
  },
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockSearchParams,
}));

// no log file in the document directory: sharing the current logs file is a no-op past the lookup habit-hooks-disable non-essential-comment
jest.mock('expo-file-system', () => ({
  File: class {},
  Directory: class {
    list() {
      return [];
    }
  },
  Paths: { document: { uri: '/mock/document' }, cache: { uri: '/mock/cache' }, info: () => ({ exists: true }) },
}));

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockSearchParams).forEach((key) => delete mockSearchParams[key]);
});

describe('useErrorDetails', () => {
  it.each`
    error                         | expectedMessage   | description
    ${new Error('Boom')}          | ${'Boom'}         | ${'Error instance'}
    ${'plain string'}             | ${'plain string'} | ${'string error'}
    ${{ message: 'from object' }} | ${'from object'}  | ${'object with message'}
    ${undefined}                  | ${'Unknown'}      | ${'undefined'}
    ${null}                       | ${'Unknown'}      | ${'null'}
    ${''}                         | ${'Unknown'}      | ${'empty string'}
    ${new Error('')}              | ${'Unknown'}      | ${'Error with empty message'}
    ${'   '}                      | ${'   '}          | ${'whitespace-only string (kept as-is)'}
    ${new Error('  ')}            | ${'  '}           | ${'Error with whitespace-only message (kept as-is)'}
  `('uses errorMsg "$expectedMessage" for $description', async ({ error, expectedMessage }) => {
    // act
    const { result } = await renderHook(() => useErrorDetails(error));

    // assert
    expect(result.current.errorMsg).toBe(expectedMessage);
  });

  it('returns a uuid v4 id, the translated title and description', async () => {
    // act
    const { result } = await renderHook(() => useErrorDetails(new Error('Boom')));

    // assert
    expect(result.current.id).toMatch(UUID_PATTERN);
    expect(result.current.title).toBe('common:error');
    expect(result.current.description).toBe('common:errorBoundary.error');
  });

  it('returns the stack for Error instances and an empty string otherwise', async () => {
    // arrange
    const error = new Error('Boom');

    // act
    const { result: fromError } = await renderHook(() => useErrorDetails(error));
    const { result: fromString } = await renderHook(() => useErrorDetails('nope'));

    // assert
    expect(fromError.current.stack).toBe(error.stack);
    expect(fromString.current.stack).toBe('');
  });

  it('generates a new id on every render', async () => {
    // arrange
    const { result, rerender } = await renderHook(() => useErrorDetails('x'));
    const firstId = result.current.id;

    // act
    await rerender({});

    // assert
    expect(result.current.id).not.toBe(firstId);
  });
});

describe('ErrorBoundary', () => {
  it('logs, reports to Sentry and redirects to the error screen', async () => {
    // arrange
    const error = new Error('Kaboom');
    const errorSpy = jest.spyOn(logger, 'error');

    // act
    await renderWithProviders(<ErrorBoundary error={error} retry={jest.fn()} />);

    // assert
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^ErrorBoundary Unexpected error: Kaboom \(ID: [0-9a-f-]{36}\)\. Stack: Error: Kaboom/),
      error
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: expect.objectContaining({
        title: 'common:error',
        errorMsg: 'Kaboom',
        id: expect.stringMatching(UUID_PATTERN),
      }),
    });
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/error',
      params: {
        title: 'common:error',
        description: 'common:errorBoundary.error',
        errorMsg: 'Kaboom',
        id: expect.stringMatching(UUID_PATTERN),
      },
    });
  });

  it('renders nothing', async () => {
    // act
    await renderWithProviders(<ErrorBoundary error={new Error('x')} retry={jest.fn()} />);

    // assert
    expect(screen.queryByText(/x/)).toBeNull();
  });
});

describe('ErrorBoundaryScreen', () => {
  it('renders the title, id and description from the route params', async () => {
    // arrange
    Object.assign(mockSearchParams, { title: 'Oops', description: 'Something broke', id: 'abc-123' });

    // act
    await renderWithProviders(<ErrorBoundaryScreen />);

    // assert
    expect(screen.getByText('Oops')).toBeOnTheScreen();
    expect(screen.getByText('abc-123')).toBeOnTheScreen();
    expect(screen.getByText('Something broke')).toBeOnTheScreen();
    expect(screen.getByText('ID:')).toBeOnTheScreen();
    expect(screen.getByText('Description:')).toBeOnTheScreen();
  });

  it('goes back home on close', async () => {
    // arrange
    await renderWithProviders(<ErrorBoundaryScreen />);

    // act
    await fireEvent.press(screen.getByText('common:close'));

    // assert
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('looks up the current logs file on details press (nothing to share without a log file)', async () => {
    // arrange
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    await renderWithProviders(<ErrorBoundaryScreen />);

    // act
    await fireEvent.press(screen.getByText('common:errorBoundary.details'));
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    // assert
    expect(Sharing.isAvailableAsync).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});

describe('ErrorDetails', () => {
  it('renders the default title and the error own properties as JSON without the stack', async () => {
    // arrange
    const error = Object.assign(new Error('Boom'), { code: 'E42' });

    // act
    await renderWithProviders(<ErrorDetails error={error} />);

    // assert
    expect(screen.getByText('Error')).toBeOnTheScreen();
    expect(screen.getByText(JSON.stringify({ code: 'E42' }, null, 2))).toBeOnTheScreen();
  });

  it('renders a custom title', async () => {
    // act
    await renderWithProviders(<ErrorDetails error={new Error('x')} title="Details" />);

    // assert
    expect(screen.getByText('Details')).toBeOnTheScreen();
    expect(screen.getByText('{}')).toBeOnTheScreen();
  });
});
