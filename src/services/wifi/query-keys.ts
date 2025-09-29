/**
 * The keys defined here are used to identify the queries in the database.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */

export const WifiDiagnoseQueryKey = {
  all: ['wifi-diagnose'] as const,
  list: () => [...WifiDiagnoseQueryKey.all, 'list'] as const,
  details: () => [...WifiDiagnoseQueryKey.all, 'details'] as const,
} as const;
