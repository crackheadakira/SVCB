import type { anyEvent, AnyQuest } from "@models"

export interface SaveInfo {
    /** First two bytes to verify that file is a valid save file */
    magic: number, // u16 0x5336 -> SV

    /** Version of the game the save was made in */
    version: string, // padded to 12 bytes

    /** How many bytes exist after size */
    dataSize?: number, // u32

    /** Farmers name */
    name: string, // 12 bytes

    /** Farmers farm name */
    farmName: string, // 12 bytes

    /** Farmers favorite thing */
    favoriteThing: string, // 12 bytes

    /** Farmer base walking speed */
    speed: number,

    /** Farmer position in world */
    position: StardewPosition,

    /** Date of world */
    calendar: Calendar,

    /** Direction farmer is facing */
    facing: Direction,

    /** ID of current emote */
    currentEmote: number // u8

    /** Transparency of glow */
    glowTransparency: number, // f32

    /** The rate it should glow at? */
    glowRate: number, // f32

    flags: {
        /** Gender of farmer */
        gender: Gender,

        /** If charging up tool */
        isCharging: boolean,

        /** Draw player with a border */
        coloredBorder: boolean,

        /** Flip the direction character is drawn */
        flip: boolean,

        /** Is farmer emoting */
        isEmoting: boolean,

        /** Is farmer glowing */
        isGlowing: boolean,
    }

    skills: {
        farming: Skill,
        fishing: Skill,
        foraging: Skill,
        mining: Skill,
        combat: Skill,
        luck: Skill,
    }

    /** Dialogue events farmer has yet to experience, `number` refers to days until event */
    activeDialogueEvents: Record<string, anyEvent[]>

    /** Previous dialogue events farmer has experienced, `number` refers to days since event */
    previousActiveDialogueEvents: Record<string, anyEvent[]>

    QuestLog: AnyQuest[];

    // TODO Item interface
    // items: {}[],

    // /** Dialogue branches user has picked */
    // dialogueQuestionsAnswered: number[], // u32[]

    // /** Events the player has seen */
    // eventsSeen: (string | number)[], // u32[] or string

    // /** Amount of times you've cooked a recipe */
    // cookingRecipes: Record<string, number>,

    // /** Amount of times you've crafted a recipe */
    // craftingRecipes: Record<string, number>

    // /** Friendship information for NPCs */
    // friendshipData: Record<string, Friendship>,

    // /** Keys of mail farmer has received */
    // mailReceived: string[],

    // /** Keys of songs farmer has heard */
    // songsHeard: string[],

    // /** Achievements the farmer has unlocked */
    // achievements: number[],

    // /** Keys of trigger actions that have been run */
    // triggerActionsRun: string[]

    // // Unneeded

    // /** Scale farmer is drawn at, doesn't seem to change. */
    // scale: number, // f16

    // /** Only for monsters `(leaper & shooter)` */
    // forceOneTileWide: boolean,
    // /** Draw monster on top of farmer */
    // drawOnTop: boolean,
    // /** Seems to be only for NPCs */
    // faceTowardFarmer: boolean,
    // /** Seems to be only for NPCs */
    // faceAwayFromFarmer: boolean,
    // /** Seems to be only for NPCs */
    // ignoreMovementAnimation: boolean,
    // /** Seems to be only for NPCs */
    // willDestroyObjectsUnderFoot: boolean
}

export interface Skill {
    level: number // u8 or u4,
    experiencePoints: number // u16
}

export interface Friendship {
    points: number // u16
    giftsThisWeek: number // u8
    giftsToday: number // u8
    lastGiftDate?: Calendar,
    talkedToToday: boolean
    proposalRejected: boolean,
    weddingDate?: Calendar,
    nextBirthingDate?: Calendar,
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

export type Calendar = {
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
    canBeSetDown: boolean,
    canBeGrabbed: boolean,
    isHoedirt?: boolean,
    isSpawnedObject: boolean,
    questItem: boolean,
    questId?: number,
    isOn: boolean,
    fragility: number,
    price: number,
    edibility: number,
    stack: number,
    quality: number,
    bigCraftable: boolean,
    setOutdoors: boolean,
    setIndoors: boolean,
    readyForHarvest: boolean,
    showNextIndex: boolean,
    flipped: boolean,
    hasBeenPickedUpByFarmer?: boolean,
    isRecipe: boolean,
    isLamp: boolean,
    heldObject?: StardewObject,
    minutesUntilReady: number,
    boundingBox: Rectangle
    scale: StardewPosition,
    uses: number,
    orderData?: string,
    preserve?: PreserveType
    preservedParentSheetIndex?: number,
    honeyType?: HoneyType,
    specialItem: boolean,
    destroyOvernight: boolean,
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

export interface StardewNPC {
    birthdaySeason: string,
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
    defaultPosition: StardewPosition,
    defaultMap: string,
    moveTowardPlayerThreshold: number,
    hasSaidAfternoonDialogue: boolean,
    dayScheduleName: string,
    islandScheduleName: string,
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

export interface DescriptionElement {
    xmlKey: string;
    param?: Array<number | StardewMonster | StardewNPC | StardewObject> | number;
}