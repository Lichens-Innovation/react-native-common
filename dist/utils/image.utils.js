import { logger } from '../logger/logger';
import { nativeFileSystem } from '../services/files/native-file-system';
import { EncodingType } from '../services/files/native-file-system.types';
export const convertImageToBase64 = async (uri) => {
    try {
        const base64String = await nativeFileSystem.readAsStringAsync(uri, {
            encoding: EncodingType.Base64,
        });
        return base64String;
    }
    catch (error) {
        logger.error('Error converting image to base64:', error);
        return null;
    }
};
//# sourceMappingURL=image.utils.js.map