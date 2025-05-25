import { DescriptionElement, DescriptionElementList, StringTable, type FlagMap, type Serializer } from "@abstractions"
import { QuestType, type IAnyQuest, type IAnyQuestFlags, type IQuest, type IQuestFlags, type quest } from "@models"

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
        view.write("setUint8", data.questType);
        view.writeString(data.currentObjective);
        view.writeString(data.description);
        view.writeString(data.title);

        view.writeFlags(data.flags, bitPositions, "8");

        view.write("setUint16", data.moneyReward);
        view.write("setUint8", data.daysLeft);
        view.write("setInt16", data.daysQuestAccepted);


        view.write("setInt16", data.id ?? -1);
        view.write("setUint8", data.nextQuests?.length ?? 0);

        if (data.nextQuests) {
            for (const quest of data.nextQuests)
                view.write("setInt16", quest);
        }

        // TODO: add other quest type serialization
        switch (data.questType) {
            case QuestType.ItemDelivery:
                console.log(data.target);
                break;
        }
    },

    deserialize(view) {
        // TODO: implement
        const final: IAnyQuest = {
            questType: view.read("getUint8"),
            currentObjective: view.readString(),
            description: view.readString(),
            title: view.readString(),
            flags: view.readFlags(bitPositions) as IQuestFlags,
            moneyReward: view.read("getUint16"),
            daysLeft: view.read("getUint8"),
            daysQuestAccepted: view.read("getInt16"),
        };

        const id = view.read("getInt16");
        final.id = id !== -1 ? id : undefined;

        const questCount = view.read("getUint8");
        if (questCount > 0) final.nextQuests = [];
        for (let i = 0; i < questCount; i++) {
            const quest = view.read("getInt16");
            final.nextQuests?.push(quest);
        }

        return final;
    },

    parse(json) {
        const questType = json.questType as QuestType;
        const base = {
            currentObjective: StringTable.addString(json["_currentObjective"])!,
            description: StringTable.addString(json["_questDescription"])!,
            title: StringTable.addString(json.questTitle)!,
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
                    questType: QuestType.Basic,
                } satisfies IQuest

            case QuestType.ItemDelivery:
                return {
                    ...base,
                    questType: QuestType.ItemDelivery,
                    target: StringTable.addString(json.target)!,
                    targetMessage: StringTable.addString(json.targetMessage)!,
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
                    questType: QuestType.Building,
                    buildingType: StringTable.addString(json.buildingType)!
                } satisfies quest.IBuildingQuest

            case QuestType.Resource:
                return {
                    ...base,
                    questType: QuestType.Resource,
                    target: StringTable.addString(json.target)!,
                    targetMessage: StringTable.addString(json.targetMessage)!,
                    collected: json.numberCollected,
                    number: json.number,
                    reward: json.reward,
                    resource: !isNaN(json.resource) ? json.resource : StringTable.addString(json.resource),
                    parts: DescriptionElementList.parse(json.parts.DescriptionElement)!,
                    dialogueparts: DescriptionElementList.parse(json.dialogueparts.DescriptionElement)!,
                    objective: DescriptionElement.parse(json.objective),
                } satisfies quest.IResourceCollectionQuest
        }
    },
}