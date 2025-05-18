type FlagMap<T> = { [K in keyof T]: number };

export function makeBitFlags<T extends Record<string, boolean>>(
    flags: T,
    bitPositions: FlagMap<T>
): number {
    let bitmask = 0;
    for (const key in bitPositions) {
        if (flags[key]) {
            bitmask |= 1 << bitPositions[key];
        }
    }
    return bitmask;
}

export function parseBitFlags<T extends Record<string, boolean>>(
    bitmask: number,
    bitPositions: FlagMap<T>
): T {
    const flags = {} as T;
    for (const key in bitPositions) {
        flags[key] = ((bitmask & (1 << bitPositions[key])) !== 0) as T[typeof key];
    }
    return flags;
}