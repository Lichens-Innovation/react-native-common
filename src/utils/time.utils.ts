const ONE_SECOND_IN_MS = 1000;
const ONE_MINUTE_IN_MS = 60 * ONE_SECOND_IN_MS;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

export const PeriodsInMilliseconds = {
  oneSecond: ONE_SECOND_IN_MS,
  oneMinute: ONE_MINUTE_IN_MS,
  oneHour: ONE_HOUR_IN_MS,
  oneDay: ONE_DAY_IN_MS,
} as const;

// shorter alias for PeriodsInMilliseconds
export const PeriodsInMS = PeriodsInMilliseconds;
