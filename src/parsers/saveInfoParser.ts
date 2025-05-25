import { Direction, StardewSeason, type SaveInfo } from "@models";
import { parseQuestLog } from "@parsers";
import { FarmerFlags, Skills, StardewPosition, DialogueEvents } from "abstractions";

export function jsonToSaveInfo(json: any): SaveInfo | undefined {
    if (!json) return;

    return {
        magic: 0x5336,
        version: json.gameVersion,
        name: json.name,
        farmName: json.farmName,
        favoriteThing: json.favoriteThing,
        speed: parseInt(json.Speed),
        position: StardewPosition.parse(json.Position),
        calendar: {
            year: parseInt(json.yearForSaveGame),
            season: StardewSeason[json.seasonForSaveGame as keyof typeof StardewSeason],
            dayOfMonth: parseInt(json.dayOfMonthForSaveGame)
        },
        facing: Direction[json.FacingDirection as keyof typeof Direction],
        currentEmote: parseInt(json.CurrentEmote),
        glowTransparency: parseFloat(json.glowingTransparency),
        glowRate: parseFloat(json.glowRate),
        flags: FarmerFlags.parse(json),
        skills: Skills.parse(json),
        activeDialogueEvents: DialogueEvents.parse(json.activeDialogueEvents),
        previousActiveDialogueEvents: DialogueEvents.parse(json.previousActiveDialogueEvents),
        QuestLog: parseQuestLog(json.questLog.Quest),
    } satisfies SaveInfo
}