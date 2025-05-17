/*
firstVisit_AdventureGuild_memory_oneday
firstVisit_ArchaeologyHouse_memory_oneweek
eventSeen_prizeTicketIntro_memory_oneday
*/

export type anyEvent = GeneralEvent | anyLocation;
type anyLocation = VisitLocation | UndergroundMine | NPCHouse;

type EventMemory = "day" | "week";
interface GeneralEvent {
    eventType: "eventSeen" | "fishCaught" | "questComplete",
    memory?: EventMemory,
    value: number,
}

interface VisitLocation {
    eventType: "firstVisit",
    locationType: "Location" | "undergroundMine" | "NPCHouse",
    memory?: EventMemory,
    location: string,
    value: number,
}

interface UndergroundMine {
    eventType: "firstVisit",
    locationType: "undergroundMine",
    memory?: EventMemory,
    mine: number,
    value: number,
}

interface NPCHouse {
    eventType: "firstVisit";
    locationType: "NPCHouse";
    memory?: EventMemory;
    npc: string;
    value: number;
}


export function VisitPatternHandler(key: string, value: number): anyEvent | undefined {
    const [prefix, rawLocation, ...rest] = key.split("_");
    if (!prefix || !rawLocation) return;

    const hasMemory = key.includes("memory");
    const hasDay = key.includes("oneday");
    const memory = hasMemory ? (hasDay ? "day" : "week") : undefined;

    const base = { value, memory } as const;

    switch (prefix) {
        case "firstVisit": {
            if (rawLocation.startsWith("UndergroundMine")) {
                const mine = parseInt(rawLocation.match(/\d+/)?.[0] ?? "");
                if (!isNaN(mine)) return {
                    ...base,
                    eventType: "firstVisit",
                    locationType: "undergroundMine",
                    mine,
                } satisfies UndergroundMine
            } else if (rawLocation.includes("House")) {
                const npc = rawLocation.split("House")[0] ?? "";
                return {
                    ...base,
                    eventType: "firstVisit",
                    locationType: "NPCHouse",
                    npc,
                } satisfies NPCHouse
            } else return {
                ...base,
                eventType: "firstVisit",
                locationType: "Location",
                location: rawLocation,
            } satisfies VisitLocation

            break;
        }

        case "eventSeen":
        case "questComplete":
        case "fishCaught": {
            return {
                ...base,
                eventType: prefix,
            } satisfies GeneralEvent
        }

        default: return;
    }
}

export function parseDialogueEvents(json: any) {
    const locations: Record<string, anyEvent[]> = {};

    for (const key of Object.keys(json)) {
        const res = VisitPatternHandler(key, json[key])
        if (!res) continue;

        let valKey: string = res.eventType;

        if (res.eventType === "firstVisit") {
            if (res.locationType === "Location") valKey = res.location;
            else if (isNPCHouse(res)) valKey = res.npc;
            else if (isUndergroundMine(res)) valKey = res.locationType;
        };


        if (!locations[valKey]) locations[valKey] = [];
        locations[valKey]?.push(res);
    }

    return locations;
}

function isNPCHouse(event: anyLocation): event is NPCHouse {
    return event.locationType === "NPCHouse";
}

function isUndergroundMine(event: anyLocation): event is UndergroundMine {
    return event.locationType === "undergroundMine";
}