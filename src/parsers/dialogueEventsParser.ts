/*
firstVisit_AdventureGuild_memory_oneday
firstVisit_ArchaeologyHouse_memory_oneweek
eventSeen_prizeTicketIntro_memory_oneday
*/

export type anyLocation = VisitLocation | UndergroundMine;

export interface VisitLocation {
    locationType: "Location" | "undergroundMine" | "NPCHouse",
    eventType: "firstVisit" | "eventSeen",
    location: string,
    value: number,
    memory?: "day" | "week",
}

interface UndergroundMine extends VisitLocation {
    locationType: "undergroundMine",
    mine: number,
}

export function VisitPatternHandler(key: string, value: number): anyLocation | undefined {
    const firstVisit = key.startsWith("firstVisit_");
    const eventSeen = key.startsWith("eventSeen_");
    const fishCaught = key.startsWith("fishCaught_");
    const questComplete = key.startsWith("questComplete_");
    const hasMemory = key.includes("memory");

    if (!firstVisit && !eventSeen && !fishCaught && !questComplete && !hasMemory) return;

    const split = key.split("_");
    const location = split[1]!;

    const hasDay = split.includes("oneday");

    const obj = {
        eventType: firstVisit ? "firstVisit" : "eventSeen",
        locationType: "Location",
        location: firstVisit ? location : split[0]!,
        value,
        memory: hasMemory ? (hasDay ? "day" : "week") : undefined,
    } satisfies anyLocation;

    const isUndergroundmine = location.startsWith("UndergroundMine");
    const isHouse = location.includes("House");

    if (isUndergroundmine) {
        const mineNumber = parseInt(location.match(/\d+/)![0]);

        return {
            ...obj,
            location: "UndergroundMine",
            locationType: "undergroundMine",
            mine: mineNumber,
        } satisfies UndergroundMine;
    } else if (isHouse) {
        const npc = location.substring(0, location.indexOf("House"));

        return {
            ...obj,
            locationType: "NPCHouse",
            location: npc,
        };
    }

    return obj;
}

export function parseDialogueEvents(json: any) {
    const locations: Record<string, anyLocation[]> = {};

    for (const key of Object.keys(json)) {
        const res = VisitPatternHandler(key, json[key])
        if (!res) continue;

        if (!locations[res.location]) locations[res.location] = [];
        locations[res.location]?.push(res);
    }

    return locations;
}