import { formatNumber } from "@angular/common";

const ONE_MBT_IN_E8S = 100_000_000;

export const formatMBT = (amount: bigint): string =>
    formatNumber(Number(amount) / Number(ONE_MBT_IN_E8S), 'en-US', '0.0-3');