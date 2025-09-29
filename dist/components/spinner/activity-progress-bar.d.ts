import { type FunctionComponent } from 'react';
import { ActivityProgress } from './activity-progress.utils';
interface ActivityProgressBarProps {
    title: string;
    progress?: ActivityProgress;
    description?: string;
    shouldShowSpinner?: boolean;
}
export declare const ActivityProgressBar: FunctionComponent<ActivityProgressBarProps>;
export {};
