/**
 * Builds additional context data for the handlebars template.
 * Example: { unixTimestamp: "1234567890", utcDate: "2022-01-01", ... }
 *
 * @returns a record with additional context data
 */
export declare const buildAdditionalContextData: (timestamp?: Date) => Record<string, string>;
type ApplyFilenameTemplateArgs = {
    filename?: string;
    pattern?: string;
    timestamp?: Date;
};
export declare const applyFilenameTemplate: ({ filename, pattern, timestamp }: ApplyFilenameTemplateArgs) => string | undefined;
export {};
