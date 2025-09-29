const numberRegex = /\d+(\.\d+)*/;
const atRegex = /(?:@)/gi;

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

export const parseLicenceData = (entries: Record<string, LicenceEntry>) => {
  const licences: LicenceDetail[] = [];

  for (const [id, licence] of Object.entries(entries)) {
    const version = id.match(numberRegex);

    // Removes the part after the @
    const nameWithoutVersion = id.replace(atRegex, '').replace(version ? version[0] : '', '');

    licences.push({
      title: nameWithoutVersion,
      version: version ? version[0] : '',
      licenceType: licence.licenses,
      repository: licence.repository || '',
      licenseUrl: licence.licenseFile || '',
    });
  }

  return licences;
};
