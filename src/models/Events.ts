import type { StardewString } from "@abstractions";

export type AnyEvent = GeneralEvent | anyLocation;
type anyLocation = VisitLocation | UndergroundMine | House;

export enum EventType {
    eventSeen,
    fishCaught,
    questComplete,
    location,
    undergroundMine,
    House
}

export type EventMemory = "day" | "week";
export interface GeneralEvent {
    eventType: EventType,
    memory?: EventMemory,
    value: number,
}

export interface VisitLocation {
    eventType: EventType,
    memory?: EventMemory,
    location: StardewString,
    value: number,
}

export interface UndergroundMine {
    eventType: EventType,
    memory?: EventMemory,
    mine: number,
    value: number,
}

export interface House {
    eventType: EventType;
    memory?: EventMemory;
    house: StardewString;
    value: number;
}