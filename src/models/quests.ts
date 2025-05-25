import type { StardewString } from "@abstractions";
import type { IDescriptionElement, StardewMonster, IStardewObject } from "@models";

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
    currentObjective: StardewString,
    description: StardewString,
    title: StardewString,
    rewardDescription?: StardewString,
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
        buildingType: StardewString,
    }

    export interface ICraftingQuest extends IQuest {
        questType: QuestType.Crafting,
        indexToCraft: number,
        flags: IAnyQuestFlags,
    }

    export interface IFishingQuest extends IQuest {
        questType: QuestType.Fishing,
        target: StardewString,
        numberToFish: number,
        reward: number,
        numberFished: number,
        whichFish: number,

        fish: IStardewObject
        parts: IDescriptionElement[]
        dialogueParts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface IGoSomewhereQuest extends IQuest {
        questType: QuestType.Location,
        whereToGo: StardewString,
    }

    export interface IItemDeliveryQuest extends IQuest {
        questType: QuestType.ItemDelivery,
        target: StardewString,
        targetMessage: StardewString,
        item: number,
        number: number,

        deliveryItem?: IStardewObject
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
        npcName: StardewString,
        locationOfItem: StardewString,
        itemIndex: number,
        tileX: number,
        tileY: number,
        flags: IAnyQuestFlags,

        objective: IDescriptionElement
    }

    export interface IResourceCollectionQuest extends IQuest {
        questType: QuestType.Resource,
        target: StardewString,
        targetMessage: StardewString,
        collected: number,
        number: number,
        reward: number,
        resource: number | StardewString,

        parts: IDescriptionElement[]
        dialogueparts: IDescriptionElement[]
        objective: IDescriptionElement
    }

    export interface ISecretLostItemQuest extends IQuest {
        questType: QuestType.Harvest,
        npcName: StardewString,
        friendshipReward: number,
        exclusiveQuestId: number,
        itemIndex: number,
        flags: IAnyQuestFlags,
    }

    export interface ISlayMonsterQuest extends IQuest {
        questType: QuestType.Monster,
        monsterName: StardewString,
        target: StardewString,
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