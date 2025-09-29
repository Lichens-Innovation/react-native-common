export const NO_OP = () => { };
export const isNullish = (value) => value === null || value === undefined;
export const isNumber = (optionalNumber) => {
    return !isNullish(optionalNumber) && typeof optionalNumber === 'number' && !isNaN(optionalNumber);
};
//# sourceMappingURL=types.utils.js.map