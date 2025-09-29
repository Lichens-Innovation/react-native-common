import { type FunctionComponent } from 'react';
import { ActivityProgress } from './activity-progress.utils';
interface ActivityProgressBarStatsProps {
    progress?: ActivityProgress;
    shouldShowSpinner?: boolean;
}
export declare const ActivityProgressBarStats: FunctionComponent<ActivityProgressBarStatsProps>;
export {};
