import type { StardewString } from "@abstractions"
import type { StardewMonster, StardewNPC } from "@models"

export interface ISkill {
    level: number // u8 or u4,
    experiencePoints: number // u16
}

export interface IFriendship {
    points: number // u16
    giftsThisWeek: number // u8
    giftsToday: number // u8
    lastGiftDate?: ICalendar,
    talkedToToday: boolean
    proposalRejected: boolean,
    weddingDate?: ICalendar,
    nextBirthingDate?: ICalendar,
    status: FriendshipStatus
    proposer: number // i64
    roommateMarriage?: boolean
}

export type IStardewPosition = {
    /** X position indicating location in world */
    x: number, // u16
    /** Y position indicating location in world */
    y: number, // u16
};

export type ICalendar = {
    year: number // u16,
    season: StardewSeason,
    dayOfMonth: number,
}

export type Gender = "Male" | "Female";
export enum StardewSeason { "Spring", "Summer", "Fall", "Winter" };

export enum Direction {
    North,
    East,
    South,
    West,
}
export enum FriendshipStatus {
    Friendly,
    Dating,
    Engaged,
    Married,
    Divorced,
}

export interface IStardewItemFlags {
    [key: string]: boolean | undefined;
    hasBeenInInventory: boolean,
    isLostItem?: boolean,
}

export interface IStardewObjectFlags extends IStardewItemFlags {
    specialItem: boolean,
    destroyOvernight: boolean,
    canBeSetDown: boolean,
    canBeGrabbed: boolean,
    isSpawnedObject: boolean,
    questItem: boolean,
    isOn: boolean,
    bigCraftable: boolean,
    setOutdoors: boolean,
    setIndoors: boolean,
    readyForHarvest: boolean,
    showNextIndex: boolean,
    flipped: boolean,
    isRecipe: boolean,
    isLamp: boolean,

    isHoedirt?: boolean,
    hasBeenPickedUpByFarmer?: boolean,

    hasQuestId: boolean,
    hasHeldObject: boolean,
    hasOrderData: boolean,
    hasPreserve: boolean,
    hasHoneyType: boolean,
}

export interface IStardewItem {
    specialVariable: number,
    category: number,
    name: StardewString,
    parentSheetIndex: number,
    flags: IStardewItemFlags,
}

export interface IStardewObject extends IStardewItem {
    tileLocation: IStardewPosition,
    owner: bigint,
    type: StardewString,
    fragility: number,
    price: number,
    edibility: number,
    stack: number,
    quality: number,
    minutesUntilReady: number,
    boundingBox: IStardewRectangle
    scale: IStardewPosition,
    uses: number,
    flags: IStardewObjectFlags,
    questId?: number,
    heldObject?: IStardewObject,
    preservedParentSheetIndex?: number,
    orderData?: StardewString,
    preserve?: PreserveType
    honeyType?: HoneyType,
}

export interface IStardewRectangle {
    height: number,
    width: number,
    x: number,
    y: number,
    location: IStardewPosition,
    size: IStardewPosition // technically Vector2
}

enum PreserveType {
    Wine,
    Jelly,
    Pickle,
    Juice,
    Roe,
    AgedRoe,
}

enum HoneyType {
    Wild = -1, // 0xFFFFFFFF
    Poppy = 376, // 0x00000178
    Tulip = 591, // 0x0000024F
    SummerSpangle = 593, // 0x00000251
    FairyRose = 595, // 0x00000253
    BlueJazz = 597, // 0x00000255
}

export interface IDescriptionElement {
    xmlKey: StardewString;
    param?: Array<number | StardewMonster | StardewNPC | IStardewObject> | number;
}