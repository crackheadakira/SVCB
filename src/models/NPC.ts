import type { StardewString } from "@abstractions";
import type { IStardewPosition } from "@models";

export interface StardewNPC {
    birthdaySeason: StardewString,
    birthdayDay: number,
    age: number,
    manners: number,
    socialAnxiety: number,
    optimism: number,
    gender: number,
    sleptInBed: boolean,
    isInvisible: boolean,
    lastSeenMovieWeek: number,
    datable: boolean,
    defaultPosition: IStardewPosition,
    defaultMap: StardewString,
    moveTowardPlayerThreshold: number,
    hasSaidAfternoonDialogue: boolean,
    dayScheduleName: StardewString,
    islandScheduleName: StardewString,
}

export interface StardewMonster extends StardewNPC {
    damageToFarmer: number,
    health: number,
    maxHealth: number,
    coinsToDrop: number,
    durationOfRandomMovements: number,
    resilience: number,
    slipperiness: number,
    experienceGained: number,
    jiterriness: number,
    missChance: number,
    isGlider: number,
    mineMonster: number,
    hasSpecialItem: number,
    initializedForLocation: boolean,
    ignoreDamageLOS: boolean,
    isHardModeMonster: boolean,
}