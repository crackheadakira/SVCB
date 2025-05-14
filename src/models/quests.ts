import type { StardewMonster, StardewObject } from "@models";

enum QuestType {
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

interface Quest {
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
    id: number,
    moneyReward: number,
    daysLeft: number,
    daysQuestAccepted: number,
    nextQuests?: number[],
}

interface CraftingQuest extends Quest {
    isBigCraftable: boolean,
    indexToCraft: number,
}

interface FishingQuest extends Quest {
    target: string,
    numberToFish: number,
    reward: number,
    numberFished: number,
    whichFish: number,

    fish: StardewObject
    // parts: DescriptionElementList
    // dialogueParts: DescriptionElementList
    // objective: DescriptionElementRef
}

interface GoSomewhereQuest extends Quest {
    whereToGo: string,
}

interface ItemDeliveryQuest extends Quest {
    target: string,
    item: number,
    number: number,

    deliveryItem: StardewObject
    // parts: DescriptionElementList
    // dialogueparts: DescriptionElementList
    // objective: DescriptionElementRef
}

interface ItemHarvestQuest extends Quest {
    itemIndex: number,
    number: number,
}

interface LostItemQuest extends Quest {
    npcName: string,
    locationOfItem: string,
    itemIndex: number,
    tileX: number,
    tileY: number,
    itemFound: boolean,

    // objective: DescriptionElementRef
}

interface ResourceCollectionQuest extends Quest {
    target: string,
    targetMessage: string,
    collected: number,
    number: number,
    reward: number,
    resource: number,
}

interface SecretLostItemQuest extends Quest {
    npcName: string,
    friendshipReward: number,
    exclusiveQuestId: number,
    itemIndex: number,
    itemFound: boolean,
}

interface SlayMonsterQuest extends Quest {
    monsterName: string,
    target: string,
    monster: StardewMonster
    numberToKill: number,

    // parts: DescriptionElementList
    // dialogueparts: DescriptionElementList
    // objective: DescriptionElementRef
}

interface SocializeQuest extends Quest {
    whoToGreet: string[],
    total: number,

    // parts: DescriptionElementList
    // objective: DescriptionElementRef
}