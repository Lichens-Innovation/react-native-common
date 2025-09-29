/**
 * The keys defined here are used to identify the queries in the database.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */
export const WifiDiagnoseQueryKey = {
    all: ['wifi-diagnose'],
    list: () => [...WifiDiagnoseQueryKey.all, 'list'],
    details: () => [...WifiDiagnoseQueryKey.all, 'details'],
};
//# sourceMappingURL=query-keys.js.map