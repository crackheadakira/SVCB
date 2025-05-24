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
    | quest.IBasicQuest
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
    moneyReward: number,
    daysLeft: number,
    daysQuestAccepted: number,
    id?: number,
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

    export interface IBasicQuest extends IQuest {
        questType: QuestType.Basic
    }

    export interface IBuildingQuest extends IQuest {
        questType: QuestType.Building,
        buildingType: string,
    }

    export interface ICraftingQuest extends IQuest {
        questType: QuestType.Crafting,
        indexToCraft: number,
        flags: IAnyQuestFlags,
    }

    export interface IFishingQuest extends IQuest {
        questType: QuestType.Fishing,
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
        questType: QuestType.Location,
        whereToGo: string,
    }

    export interface IItemDeliveryQuest extends IQuest {
        questType: QuestType.ItemDelivery,
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
        questType: QuestType.Harvest,
        itemIndex: number,
        number: number,
    }

    export interface ILostItemQuest extends IQuest {
        questType: QuestType.Harvest,
        npcName: string,
        locationOfItem: string,
        itemIndex: number,
        tileX: number,
        tileY: number,
        flags: IAnyQuestFlags,

        objective: IDescriptionElement
    }

    export interface IResourceCollectionQuest extends IQuest {
        questType: QuestType.Resource,
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
        questType: QuestType.Harvest,
        npcName: string,
        friendshipReward: number,
        exclusiveQuestId: number,
        itemIndex: number,
        flags: IAnyQuestFlags,
    }

    export interface ISlayMonsterQuest extends IQuest {
        questType: QuestType.Monster,
        monsterName: string,
        target: string,
        monster: StardewMonster
        numberToKill: number,

        parts: IDescriptionElement[]
        dialogueparts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface ISocializeQuest extends IQuest {
        questType: QuestType.Socialize,
        whoToGreet: string[],
        total: number,

        parts: IDescriptionElement[]
        objective: IDescriptionElement
    }
}