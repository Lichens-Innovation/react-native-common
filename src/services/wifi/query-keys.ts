// @see https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories habit-hooks-disable non-essential-comment

export const WifiDiagnoseQueryKey = {
  all: ['wifi-diagnose'] as const,
  list: () => [...WifiDiagnoseQueryKey.all, 'list'] as const,
  details: () => [...WifiDiagnoseQueryKey.all, 'details'] as const,
} as const;
