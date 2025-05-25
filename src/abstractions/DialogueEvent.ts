import { type Serializer, StringTable } from "@abstractions";
import { EventType, ViewWrapper, type AnyEvent, type EventMemory, type GeneralEvent, type NPCHouse, type UndergroundMine, type VisitLocation } from "@models";

export const DialogueEvent = {
    serialize(view: ViewWrapper, data: AnyEvent) {
        view.write("setUint8", data.eventType);
        const memory = data.memory === undefined ? 0 : (data.memory === "day" ? 1 : 2);
        view.write("setUint8", (memory << 6) | (data.value & 0b111111));

        if (EventTypeChecker.isLocation(data)) view.writeString(data.location);
        else if (EventTypeChecker.isUndergroundMine(data)) view.write("setUint8", data.mine);
        else if (EventTypeChecker.isNPCHouse(data)) view.writeString(data.npc)
    },

    deserialize(view: ViewWrapper): AnyEvent {
        const type = view.read("getUint8");
        const packed = view.read("getUint8");
        const _memory = packed >> 6;
        const value = packed & 0b00111111;
        let memory: EventMemory | undefined;
        if (_memory === 1) memory = "day";
        else if (_memory === 2) memory = "week";

        const base = {
            eventType: type,
            value,
            memory,
        } satisfies GeneralEvent;

        if (type < EventType.location) return base;
        else if (type === EventType.location) {
            return {
                ...base,
                location: view.readString(),
            } satisfies VisitLocation
        } else if (type === EventType.undergroundMine) {
            return {
                ...base,
                mine: view.read("getUint8"),
            } satisfies UndergroundMine
        } else {
            return {
                ...base,
                npc: view.readString(),
            } satisfies NPCHouse
        }
    },

    parse(key: string, value: number): AnyEvent | undefined {
        const [prefix, rawLocation] = key.split("_");
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
                        npc: StringTable.addString(npc)!,
                    } satisfies NPCHouse
                } else return {
                    ...base,
                    eventType: EventType.location,
                    location: StringTable.addString(rawLocation)!,
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
    },
}

export const DialogueEvents: Serializer<AnyEvent[]> = {
    serialize(view, data) {
        view.write("setUint16", data.length);
        for (const item of data) {
            DialogueEvent.serialize(view, item);
        };
    },

    deserialize(view) {
        const length = view.read("getUint16");
        const events: AnyEvent[] = [];

        for (let i = 0; i < length; i++) {
            events.push(DialogueEvent.deserialize(view));
        }

        return events;
    },

    parse(json) {
        const locations: AnyEvent[] = [];

        for (const key of Object.keys(json)) {
            const res = DialogueEvent.parse(key, json[key])
            if (!res) continue;

            // let valKey = EventType[res.eventType];

            // if (EventTypeChecker.isLocation(res)) valKey = res.location.toString();
            // else if (EventTypeChecker.isNPCHouse(res)) valKey = res.npc.toString();
            // else if (EventTypeChecker.isUndergroundMine(res)) valKey = "UndergroundMine";

            locations.push(res);
        }

        return locations;
    },
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