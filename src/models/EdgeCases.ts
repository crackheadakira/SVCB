/*
firstVisit_AdventureGuild_memory_oneday
firstVisit_ArchaeologyHouse_memory_oneweek
eventSeen_prizeTicketIntro_memory_oneday
*/

import type { XmlValue } from "parse";


export interface VisitLocation {
    type: "firstVisit" | "eventSeen",
    location: string,
    original: string,
    value: XmlValue,
    memory?: "day" | "week",
}

export function VisitPatternHandler(key: string, value: XmlValue): VisitLocation | undefined {
    if (typeof key !== "string") return;

    const firstVisit = key.startsWith("firstVisit_");
    const eventSeen = key.startsWith("eventSeen_");
    const fishCaught = key.startsWith("fishCaught_");
    const questComplete = key.startsWith("questComplete_");
    const hasMemory = key.includes("memory");

    if (!firstVisit && !eventSeen && !fishCaught && !questComplete && !hasMemory) return;

    const split = key.split("_");
    const location = split[1]!;

    const hasDay = split.includes("oneday");

    return {
        type: firstVisit ? "firstVisit" : "eventSeen",
        location: firstVisit ? location : split[0]!,
        original: key,
        value,
        memory: hasMemory ? (hasDay ? "day" : "week") : undefined
    } satisfies VisitLocation;
}