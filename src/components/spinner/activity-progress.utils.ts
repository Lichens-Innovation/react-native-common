import prettyBytes from 'pretty-bytes';
import { toFixed } from '~/utils/number.utils';

export interface ActivityProgress {
  loaded: number;
  total?: number;
  isBytes?: boolean;
  decimals?: number;
}

export const computeActivityProgress = (progress?: ActivityProgress) => {
  if (!progress) {
    return { percentage: 0, stats: '' };
  }

  const { loaded, total, isBytes = true, decimals = 2 } = progress;
  const hasTotal = !!total;

  if (isBytes) {
    const loadedLabel = prettyBytes(loaded);
    const totalLabel = hasTotal ? prettyBytes(total) : '';
    const stats = `${loadedLabel} / ${totalLabel}`;
    const percentage = hasTotal ? toFixed((loaded / total) * 100, decimals) : 0;
    return { percentage, stats };
  }

  const stats = hasTotal ? `${loaded} / ${total}` : `${loaded}`;
  const percentage = hasTotal ? toFixed((loaded / total) * 100, decimals) : 0;
  return { percentage, stats };
};
