/**
 * The keys defined here are used to identify the queries in the database.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */
export declare const WifiDiagnoseQueryKey: {
    readonly all: readonly ["wifi-diagnose"];
    readonly list: () => readonly ["wifi-diagnose", "list"];
    readonly details: () => readonly ["wifi-diagnose", "details"];
};
