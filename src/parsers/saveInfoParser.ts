import { Direction, StardewSeason, type Gender, type SaveInfo, type Skill } from "@models";
import { parseBoolean, parseQuestLog } from "@parsers";

export function jsonToSaveInfo(json: any): SaveInfo | undefined {
    if (!json) return;

    return {
        magic: 0x5336,
        version: json.gameVersion,
        name: json.name,
        farmName: json.farmName,
        favoriteThing: json.favoriteThing,
        speed: parseInt(json.Speed),
        position: {
            x: parseInt(json.Position.X),
            y: parseInt(json.Position.Y),
        },
        calendar: {
            year: parseInt(json.yearForSaveGame),
            season: StardewSeason[json.seasonForSaveGame as keyof typeof StardewSeason],
            dayOfMonth: parseInt(json.dayOfMonthForSaveGame)
        },
        facing: Direction[json.FacingDirection as keyof typeof Direction],
        currentEmote: parseInt(json.CurrentEmote),
        glowTransparency: parseFloat(json.glowingTransparency),
        glowRate: parseFloat(json.glowRate),
        flags: {
            gender: json.gender as Gender,
            isCharging: parseBoolean(json.isCharging),
            coloredBorder: parseBoolean(json.coloredBorder),
            flip: parseBoolean(json.flip),
            isEmoting: parseBoolean(json.IsEmoting),
            isGlowing: parseBoolean(json.isGlowing),
        },
        skills: {
            farming: {
                level: parseInt(json.farmingLevel),
                experiencePoints: parseInt(json.experiencePoints[0])
            } satisfies Skill,
            fishing: {
                level: parseInt(json.fishingLevel),
                experiencePoints: parseInt(json.experiencePoints[1])
            } satisfies Skill,
            foraging: {
                level: parseInt(json.foragingLevel),
                experiencePoints: parseInt(json.experiencePoints[2])
            } satisfies Skill,
            mining: {
                level: parseInt(json.miningLevel),
                experiencePoints: parseInt(json.experiencePoints[3])
            } satisfies Skill,
            combat: {
                level: parseInt(json.combatLevel),
                experiencePoints: parseInt(json.experiencePoints[4])
            } satisfies Skill,
            luck: {
                level: parseInt(json.luckLevel),
                experiencePoints: parseInt(json.experiencePoints[5])
            } satisfies Skill
        },
        activeDialogueEvents: json.activeDialogueEvents,
        QuestLog: parseQuestLog(json.questLog.Quest),
    } satisfies SaveInfo
}