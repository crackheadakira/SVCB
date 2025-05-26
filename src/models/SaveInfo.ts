import type { IAnyQuest, ICalendar, Direction, ISkill, IStardewPosition, AnyEvent, IFriendship } from "@models"

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
    position: IStardewPosition,

    /** Date of world */
    calendar: ICalendar,

    /** Direction farmer is facing */
    facing: Direction,

    /** ID of current emote */
    currentEmote: number // u8

    /** Transparency of glow */
    glowTransparency: number, // f32

    /** The rate it should glow at? */
    glowRate: number, // f32

    flags: {
        /** Gender of farmer, `false` if female, `true` if male */
        gender: boolean,

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
        farming: ISkill,
        fishing: ISkill,
        foraging: ISkill,
        mining: ISkill,
        combat: ISkill,
        luck: ISkill,
    }

    /** Dialogue events farmer has yet to experience, `number` refers to days until event */
    activeDialogueEvents: AnyEvent[]

    /** Previous dialogue events farmer has experienced, `number` refers to days since event */
    previousActiveDialogueEvents: AnyEvent[]

    QuestLog: IAnyQuest[];

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
    friendshipData: Record<string, IFriendship>,

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