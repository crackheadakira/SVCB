import type { StardewMonster, StardewNPC } from "@models"

export interface Skill {
    level: number // u8 or u4,
    experiencePoints: number // u16
}

export interface Friendship {
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

export type StardewPosition = {
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

export interface StardewItem {
    isLostItem?: boolean,
    specialVariable: number,
    category: number,
    hasBeenInInventory: boolean,
    name: string,
    parentSheetIndex: number,
}

export interface StardewObject extends StardewItem {
    tileLocation: StardewPosition,
    owner: bigint,
    type: string,
    fragility: number,
    price: number,
    edibility: number,
    stack: number,
    quality: number,
    minutesUntilReady: number,
    boundingBox: Rectangle
    scale: StardewPosition,
    uses: number,

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
    questId?: number,
    heldObject?: StardewObject,
    preservedParentSheetIndex?: number,
    orderData?: string,
    preserve?: PreserveType
    honeyType?: HoneyType,
}

export interface Rectangle {
    height: number,
    width: number,
    x: number,
    y: number,
    location: StardewPosition,
    size: StardewPosition // technically Vector2
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

export interface DescriptionElement {
    xmlKey: string;
    param?: Array<number | StardewMonster | StardewNPC | StardewObject> | number;
}