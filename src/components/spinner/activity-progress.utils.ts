import prettyBytes from 'pretty-bytes';

export interface ActivityProgress {
  loaded: number;
  total?: number;
}

export const computeActivityProgress = (progress?: ActivityProgress) => {
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
