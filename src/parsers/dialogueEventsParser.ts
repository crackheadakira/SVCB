/*
firstVisit_AdventureGuild_memory_oneday
firstVisit_ArchaeologyHouse_memory_oneweek
eventSeen_prizeTicketIntro_memory_oneday
*/

import { EventType, type AnyEvent, type GeneralEvent, type NPCHouse, type UndergroundMine, type VisitLocation } from "@models";

export function VisitPatternHandler(key: string, value: number): AnyEvent | undefined {
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
                    eventType: EventType.undergroundMine,
                    mine,
                } satisfies UndergroundMine
            } else if (rawLocation.includes("House")) {
                const npc = rawLocation.split("House")[0] ?? "";
                return {
                    ...base,
                    eventType: EventType.NPCHouse,
                    npc,
                } satisfies NPCHouse
            } else return {
                ...base,
                eventType: EventType.location,
                location: rawLocation,
            } satisfies VisitLocation

            break;
        }

        case "eventSeen": return {
            ...base,
            eventType: EventType.eventSeen,
        } satisfies GeneralEvent

        case "questComplete": return {
            ...base,
            eventType: EventType.questComplete,
        } satisfies GeneralEvent

        case "fishCaught": return {
            ...base,
            eventType: EventType.fishCaught,
        } satisfies GeneralEvent

        default: return;
    }
}

export function parseDialogueEvents(json: any) {
    const locations: AnyEvent[] = [];

    for (const key of Object.keys(json)) {
        const res = VisitPatternHandler(key, json[key])
        if (!res) continue;

        let valKey: string = EventType[res.eventType];

        if (EventTypeChecker.isLocation(res)) valKey = res.location;
        else if (EventTypeChecker.isNPCHouse(res)) valKey = res.npc;
        else if (EventTypeChecker.isUndergroundMine(res)) valKey = "UndergroundMine";

        locations.push(res);
    }

    return locations.sort();
}

export namespace EventTypeChecker {
    export function isLocation(event: AnyEvent): event is VisitLocation {
        return event.eventType === EventType.location;
    }

    export function isNPCHouse(event: AnyEvent): event is NPCHouse {
        return event.eventType === EventType.NPCHouse;
    }

    export function isUndergroundMine(event: AnyEvent): event is UndergroundMine {
        return event.eventType === EventType.undergroundMine
    }
}