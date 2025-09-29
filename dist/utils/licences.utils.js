const numberRegex = /\d+(\.\d+)*/;
const atRegex = /(?:@)/gi;
export const parseLicenceData = (entries) => {
    const licences = [];
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
//# sourceMappingURL=licences.utils.js.map