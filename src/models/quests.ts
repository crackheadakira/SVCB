import type { IDescriptionElement, StardewMonster, StardewObject } from "@models";

export enum QuestType {
    Basic = 1,
    Crafting,
    ItemDelivery,
    Monster,
    Socialize,
    Location,
    Fishing,
    Building,
    Harvest,
    Resource,
    Weeding,
};

export type IAnyQuest =
    | IQuest
    | quest.IBuildingQuest
    | quest.ICraftingQuest
    | quest.IFishingQuest
    | quest.IGoSomewhereQuest
    | quest.IItemDeliveryQuest
    | quest.IItemHarvestQuest
    | quest.ILostItemQuest
    | quest.IResourceCollectionQuest
    | quest.ISecretLostItemQuest
    | quest.ISlayMonsterQuest
    | quest.ISocializeQuest;

export interface IQuest {
    questType: QuestType,
    currentObjective: string,
    description: string,
    title: string,
    rewardDescription?: string,
    flags: IQuestFlags,
    id?: number,
    moneyReward: number,
    daysLeft: number,
    daysQuestAccepted: number,
    nextQuests?: number[],
}

export interface IQuestFlags {
    [key: string]: boolean | undefined;
    accepted: boolean;
    completed: boolean;
    dailyQuest: boolean;
    showNew: boolean;
    canBeCancelled: boolean;
    destroy: boolean;
}

export interface IAnyQuestFlags extends IQuestFlags {
    isBigCraftable?: boolean;
    itemFound?: boolean;
}

export namespace quest {

    export interface IBuildingQuest extends IQuest {
        buildingType: string,
    }

    export interface ICraftingQuest extends IQuest {
        indexToCraft: number,
        flags: IAnyQuestFlags,
    }

    export interface IFishingQuest extends IQuest {
        target: string,
        numberToFish: number,
        reward: number,
        numberFished: number,
        whichFish: number,

        fish: StardewObject
        parts: IDescriptionElement[]
        dialogueParts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface IGoSomewhereQuest extends IQuest {
        whereToGo: string,
    }

    export interface IItemDeliveryQuest extends IQuest {
        target: string,
        targetMessage: string,
        item: number,
        number: number,

        deliveryItem?: StardewObject
        parts?: IDescriptionElement[]
        dialogueparts?: IDescriptionElement[]
        objective?: IDescriptionElement
    }

    export interface IItemHarvestQuest extends IQuest {
        itemIndex: number,
        number: number,
    }

    export interface ILostItemQuest extends IQuest {
        npcName: string,
        locationOfItem: string,
        itemIndex: number,
        tileX: number,
        tileY: number,
        flags: IAnyQuestFlags,

        objective: IDescriptionElement
    }

    export interface IResourceCollectionQuest extends IQuest {
        target: string,
        targetMessage: string,
        collected: number,
        number: number,
        reward: number,
        resource: number,

        parts: IDescriptionElement[]
        dialogueparts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface ISecretLostItemQuest extends IQuest {
        npcName: string,
        friendshipReward: number,
        exclusiveQuestId: number,
        itemIndex: number,
        flags: IAnyQuestFlags,
    }

    export interface ISlayMonsterQuest extends IQuest {
        monsterName: string,
        target: string,
        monster: StardewMonster
        numberToKill: number,

        parts: IDescriptionElement[]
        dialogueparts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface ISocializeQuest extends IQuest {
        whoToGreet: string[],
        total: number,

        parts: IDescriptionElement[]
        objective: IDescriptionElement
    }
}