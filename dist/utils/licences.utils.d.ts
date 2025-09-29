export type LicenceEntry = {
    licenses: string;
    repository?: string;
    publisher?: string;
    email?: string;
    path?: string;
    licenseFile?: string;
};
export type LicenceDetail = {
    title: string;
    version: string;
    licenceType: string;
    repository: string;
    licenseUrl: string;
};
export declare const parseLicenceData: (entries: Record<string, LicenceEntry>) => LicenceDetail[];
