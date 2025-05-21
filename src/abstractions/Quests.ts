import { DescriptionElement, DescriptionElementList, type FlagMap, type Serializer } from "@abstractions"
import { QuestType, type IAnyQuest, type IAnyQuestFlags, type IQuest, type quest } from "@models"

const bitPositions: FlagMap<IAnyQuestFlags> = {
    accepted: 0,
    completed: 1,
    dailyQuest: 2,
    showNew: 3,
    canBeCancelled: 4,
    destroy: 5,
    isBigCraftable: 6,
    itemFound: 7,
};


export const Quest: Serializer<IAnyQuest> = {
    serialize(view, data) {
        // TODO: implement the function
        view.write("setUint8", data.questType);
        view.writeString(data.currentObjective);
        view.writeString(data.description);
        view.writeString(data.title);

        view.writeFlags(data.flags, bitPositions);

    },

    deserialize(view) {
        // TODO: implement
    },

    parse(json) {
        const questType = json.questType as QuestType;
        const base = {
            currentObjective: json["_currentObjective"],
            description: json["_questDescription"],
            title: json.questTitle,
            flags: {
                accepted: json.accepted,
                completed: json.completed,
                dailyQuest: json.dailyQuest,
                showNew: json.showNew,
                canBeCancelled: json.canBeCancelled,
                destroy: json.destroy,
            },
            moneyReward: json.moneyReward,
            questType,
            daysLeft: json.daysLeft,
            daysQuestAccepted: json.dayQuestAccepted,
            rewardDescription: json?.rewardDescription,
            id: json?.id,
            nextQuests: json?.nextQuests,
        } satisfies IQuest;

        switch (questType) {
            default:
            case QuestType.Basic:
                return {
                    ...base,
                } satisfies IQuest

            case QuestType.ItemDelivery:
                return {
                    ...base,
                    target: json.target,
                    targetMessage: json.targetMessage,
                    item: json.item,
                    number: json.number,
                    deliveryItem: undefined, // need more save files to figure out
                    parts: undefined,
                    dialogueparts: undefined,
                    objective: undefined
                } satisfies quest.IItemDeliveryQuest

            case QuestType.Building:
                return {
                    ...base,
                    buildingType: json.buildingType
                } satisfies quest.IBuildingQuest

            case QuestType.Resource:
                return {
                    ...base,
                    target: json.target,
                    targetMessage: json.targetMessage,
                    collected: json.numberCollected,
                    number: json.number,
                    reward: json.reward,
                    resource: json.resource,
                    parts: DescriptionElementList.parse(json.parts.DescriptionElement)!,
                    dialogueparts: DescriptionElementList.parse(json.dialogueparts.DescriptionElement)!,
                    objective: DescriptionElement.parse(json.objective),
                } satisfies quest.IResourceCollectionQuest
        }
    },
}