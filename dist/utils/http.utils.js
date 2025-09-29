import { isNullish } from './types.utils';
export const isHttpSuccessStatus = (status) => {
    if (isNullish(status)) {
        return false;
    }
    return status >= 200 && status < 300;
};
export const isHttpClientErrorStatus = (status) => {
    if (isNullish(status)) {
        return false;
    }
    return status >= 400 && status < 500;
};
export const isHttpServerErrorStatus = (status) => {
    if (isNullish(status)) {
        return false;
    }
    return status >= 500;
};
//# sourceMappingURL=http.utils.js.map