import prettyBytes from 'pretty-bytes';
export const computeActivityProgress = (progress) => {
    if (!progress) {
        return { percentage: 0, stats: '' };
    }
    const { loaded, total } = progress;
    const hasTotal = !!total;
    const loadedLabel = prettyBytes(loaded);
    const totalLabel = hasTotal ? prettyBytes(total) : '';
    const stats = `${loadedLabel} / ${totalLabel}`;
    const percentage = hasTotal ? (loaded / total) * 100 : 0;
    return { percentage, stats };
};
//# sourceMappingURL=activity-progress.utils.js.map