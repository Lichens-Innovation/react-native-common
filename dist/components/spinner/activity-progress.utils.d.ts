export interface ActivityProgress {
    loaded: number;
    total?: number;
}
export declare const computeActivityProgress: (progress?: ActivityProgress) => {
    percentage: number;
    stats: string;
};
