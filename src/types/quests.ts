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

interface ResourceCollectionQuest extends Quest {
    target: string,
    targetMessage: string,
    collected: number,
    number: number,
    reward: number,
    resource: number,
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

    // fish: StardewValley.Object
    // parts: DescriptionElementList
    // dialogueParts: DescriptionElementList
    // objective: DescriptiveElementRef
}

interface GoSomewhereQuest extends Quest {
    whereToGo: string,
}