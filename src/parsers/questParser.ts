import { DescriptionElement, DescriptionElementList } from "@abstractions";
import { QuestType, type IAnyQuest, type quest, type IQuest } from "@models";

export function parseQuestLog(json: any) {
    const final: IAnyQuest[] = [];
    if (Array.isArray(json)) {
        for (const quest of json) {
            const res = parseQuest(quest);
            if (!res) continue;

            final.push(res);
        }
    }

    return final;
}

export function parseQuest(json: Record<string, any>): IAnyQuest | undefined {
    const questType = json.questType as QuestType;
    const base = {
        currentObjective: json["_currentObjective"],
        description: json["_questDescription"],
        title: json.questTitle,
        rewardDescription: json?.rewardDescription,
        accepted: json.accepted,
        completed: json.completed,
        dailyQuest: json.dailyQuest,
        showNew: json.showNew,
        canBeCancelled: json.canBeCancelled,
        destroy: json.destroy,
        id: json?.id,
        moneyReward: json.moneyReward,
        questType,
        daysLeft: json.daysLeft,
        daysQuestAccepted: json.dayQuestAccepted,
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
}