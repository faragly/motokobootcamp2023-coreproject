export const toTimestamp = (value: Date): BigInt => {
    return BigInt(value.getTime() * 1000 * 1000);
};

export const fromTimestamp = (value: BigInt): Date => {
    return new Date(Number(value) / (1000 * 1000));
};