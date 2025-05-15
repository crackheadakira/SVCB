import type { DescriptionElement, StardewMonster, StardewObject } from "@models";

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

export type AnyQuest =
    | Quest
    | quest.BuildingQuest
    | quest.CraftingQuest
    | quest.FishingQuest
    | quest.GoSomewhereQuest
    | quest.ItemDeliveryQuest
    | quest.ItemHarvestQuest
    | quest.LostItemQuest
    | quest.ResourceCollectionQuest
    | quest.SecretLostItemQuest
    | quest.SlayMonsterQuest
    | quest.SocializeQuest;


export interface Quest {
    questType: QuestType,
    currentObjective: string,
    description: string,
    title: string,
    rewardDescription?: string,
    accepted: boolean,
    completed: boolean,
    dailyQuest: boolean,
    showNew: boolean,
    canBeCancelled: boolean,
    destroy: boolean,
    id?: number,
    moneyReward: number,
    daysLeft: number,
    daysQuestAccepted: number,
    nextQuests?: number[],
}

export namespace quest {

    export interface BuildingQuest extends Quest {
        buildingType: string,
    }

    export interface CraftingQuest extends Quest {
        isBigCraftable: boolean,
        indexToCraft: number,
    }

    export interface FishingQuest extends Quest {
        target: string,
        numberToFish: number,
        reward: number,
        numberFished: number,
        whichFish: number,

        fish: StardewObject
        parts: DescriptionElement[]
        dialogueParts: DescriptionElement[]
        objective: DescriptionElement
    }

    export interface GoSomewhereQuest extends Quest {
        whereToGo: string,
    }

    export interface ItemDeliveryQuest extends Quest {
        target: string,
        item: number,
        number: number,

        deliveryItem: StardewObject
        parts: DescriptionElement[]
        dialogueparts: DescriptionElement[]
        objective: DescriptionElement
    }

    export interface ItemHarvestQuest extends Quest {
        itemIndex: number,
        number: number,
    }

    export interface LostItemQuest extends Quest {
        npcName: string,
        locationOfItem: string,
        itemIndex: number,
        tileX: number,
        tileY: number,
        itemFound: boolean,

        objective: DescriptionElement
    }

    export interface ResourceCollectionQuest extends Quest {
        target: string,
        targetMessage: string,
        collected: number,
        number: number,
        reward: number,
        resource: number,

        parts: DescriptionElement[]
        dialogueparts: DescriptionElement[]
        objective: DescriptionElement
    }

    export interface SecretLostItemQuest extends Quest {
        npcName: string,
        friendshipReward: number,
        exclusiveQuestId: number,
        itemIndex: number,
        itemFound: boolean,
    }

    export interface SlayMonsterQuest extends Quest {
        monsterName: string,
        target: string,
        monster: StardewMonster
        numberToKill: number,

        parts: DescriptionElement[]
        dialogueparts: DescriptionElement[]
        objective: DescriptionElement
    }

    export interface SocializeQuest extends Quest {
        whoToGreet: string[],
        total: number,

        parts: DescriptionElement[]
        objective: DescriptionElement
    }
}