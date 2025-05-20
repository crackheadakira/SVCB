export type AnyEvent = GeneralEvent | anyLocation;
type anyLocation = VisitLocation | UndergroundMine | NPCHouse;

export enum EventType {
    eventSeen,
    fishCaught,
    questComplete,
    location,
    undergroundMine,
    NPCHouse
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
    location: string,
    value: number,
}

export interface UndergroundMine {
    eventType: EventType,
    memory?: EventMemory,
    mine: number,
    value: number,
}

export interface NPCHouse {
    eventType: EventType;
    memory?: EventMemory;
    npc: string;
    value: number;
}