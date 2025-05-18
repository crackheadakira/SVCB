import type { Calendar, DescriptionElement, Rectangle, SaveInfo, Skill, StardewObject, StardewPosition } from "@models/base";
import { EventType, EventTypeChecker, type anyEvent, type EventMemory, type GeneralEvent, type NPCHouse, type UndergroundMine, type VisitLocation } from "parsers/dialogueEventsParser";
import { BinaryString } from "./BinaryTypes";
import { makeBitFlags, parseBitFlags } from "@models";

type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T];
type DataViewSetterKeys = Extract<FunctionKeys<DataView>, `set${string}`>;
type DataViewGetterKeys = Extract<FunctionKeys<DataView>, `get${string}`>;
type DataViewParameters<T extends DataViewGetterKeys | DataViewSetterKeys> = Parameters<DataView[T]>
type IsBigIntMethod<T extends string> = T extends `${string}big${string}` ? true : false;
type ReturnTypeForGetter<T extends DataViewGetterKeys> = IsBigIntMethod<T> extends true
    ? bigint
    : number;

export class ViewWrapper {
    private LITTLE_ENDIAN: boolean = false;
    private STRING_LENGTH = 12;
    private static readonly encoder = new TextEncoder()

    private view: DataView;
    private _offset = 0;

    public get offset(): Readonly<number> {
        return this._offset;
    }

    constructor(buffer: DataView, isLittleEndian?: boolean)
    constructor(buffer: ArrayBuffer, isLittleEndian?: boolean)
    constructor(buffer: Uint8Array, isLittleEndian?: boolean)
    constructor(buffer: ArrayBuffer | DataView | Uint8Array, isLittleEndian?: boolean) {
        if (buffer instanceof DataView) this.view = buffer;
        else if (buffer instanceof Uint8Array) this.view = this.getViewFromArray(buffer);
        else this.view = new DataView(buffer);

        if (isLittleEndian) this.LITTLE_ENDIAN = isLittleEndian;
    }

    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean, offset?: number,): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian = this.LITTLE_ENDIAN, offset?: number): void {
        const fnMethod = this.view[method] as (byteOffset: number, value: DataViewParameters<T>[1], littleEndian?: boolean | undefined) => void;
        const fn = fnMethod.bind(this.view);

        if (offset != undefined) fn(offset, value, littleEndian);
        else {
            fn(this.offset, value, littleEndian);
            this._offset += this.getByteSize(method);
        }
    }

    public read<T extends DataViewGetterKeys>(method: T, littleEndian?: boolean, offset?: number): ReturnTypeForGetter<T>
    public read<T extends DataViewGetterKeys>(method: T, littleEndian = this.LITTLE_ENDIAN, offset?: number): ReturnTypeForGetter<T> {
        const fn = this.view[method].bind(this.view);
        const o = offset ? offset : this.offset;
        const res = fn(o, littleEndian);

        if (offset == undefined) this._offset += this.getByteSize(method);

        return res as ReturnTypeForGetter<T>;
    }

    public setOffset(newOffset: number) {
        this._offset = newOffset;
    }

    public incrementOffset(inc: number) {
        this._offset += inc;
    }

    public decrementOffset(dec: number) {
        this._offset -= dec;
    }

    public writeBytes(data: Uint8Array) {
        new Uint8Array(this.view.buffer, this.view.byteOffset + this._offset, data.length).set(data);
        this._offset += data.length;
    }

    public writeSize(value: number, offset: number) {
        this.write("setUint32", value, undefined, offset);
    }

    public writeString(text: string): void
    public writeString(text: string, length: number): void
    public writeString(text: string, length?: number) {
        const maxLength = length ? length : this.STRING_LENGTH;

        const encoded = ViewWrapper.encoder.encode(text.padEnd(maxLength, "\0").substring(0, maxLength));
        for (const byte of encoded) {
            this.write("setUint8", byte);
        };

    }

    public writeSkill(skill: Skill) {
        this.write("setUint8", skill.level);
        this.write("setUint16", skill.experiencePoints);
    }

    public writeAllSkills(skills: SaveInfo["skills"]) {
        this.writeSkill(skills.farming);
        this.writeSkill(skills.fishing);
        this.writeSkill(skills.foraging);
        this.writeSkill(skills.mining);
        this.writeSkill(skills.combat);
        this.writeSkill(skills.luck);
    }

    public writeFlags<T extends Record<string, boolean>>(
        flags: T,
        bitPositions: Record<keyof T, number>
    ) {
        const bitmask = makeBitFlags(flags, bitPositions);

        const maxBit = Math.max(...Object.values(bitPositions));

        if (maxBit < 8) {
            this.write("setUint8", bitmask);
        } else if (maxBit < 16) {
            this.write("setUint16", bitmask);
        } else if (maxBit < 32) {
            this.write("setUint32", bitmask);
        } else {
            throw new Error("Flags too large for u32 write");
        }
    }

    /*
    public writeFlags(flags: SaveInfo["flags"]) {
        let FLAGS = 0;

        if (flags.gender === "Male") FLAGS |= 1 << 0;
        if (flags.isCharging) FLAGS |= 1 << 1;
        if (flags.coloredBorder) FLAGS |= 1 << 2;
        if (flags.flip) FLAGS |= 1 << 3;
        if (flags.isEmoting) FLAGS |= 1 << 4;
        if (flags.isGlowing) FLAGS |= 1 << 5;

        this.write("setUint16", FLAGS);
    }*/

    public writeCalendar(calendar: Calendar) {
        const packed = ((calendar.season & 0b11) << 5) | (calendar.dayOfMonth & 0b11111);
        this.write("setUint16", calendar.year);
        this.write("setUint8", packed);
    }

    public writeRecord(data: Record<string, number>, customLogic?: (key: string, value: number, writeFn: (...args: Parameters<ViewWrapper["write"]>) => void) => void) {
        const keys = Object.keys(data);

        const totalEntries = keys.length;
        this.write("setUint16", totalEntries);

        for (const key of keys) {
            const value = data[key];

            if (value === undefined) continue;
            if (customLogic) {
                customLogic(key, value, this.write.bind(this));
            } else {
                const encoded = ViewWrapper.encoder.encode(key);
                this.write("setUint16", encoded.byteLength);
                this.writeBytes(encoded);
                this.write("setUint8", value);
            }
        }
    }

    public writeBinaryString(data: BinaryString) {
        this.write("setUint16", data.length);
        for (const byte of data.content) {
            this.write("setUint8", byte);
        }
    }

    public writeDialogueEvent(data: anyEvent[]) {
        this.write("setUint16", data.length);
        for (const item of data) {
            this.write("setUint8", item.eventType);
            const memory = item.memory === undefined ? 0 : (item.memory === "day" ? 1 : 2);
            this.write("setUint8", (memory << 6) | (item.value & 0b111111));

            if (EventTypeChecker.isLocation(item)) this.writeBinaryString(BinaryString.fromString(0, item.location));
            else if (EventTypeChecker.isUndergroundMine(item)) this.write("setUint8", item.mine);
            else if (EventTypeChecker.isNPCHouse(item)) this.writeBinaryString(BinaryString.fromString(0, item.npc));
        }
    }

    public writePosition(data: StardewPosition) {
        this.write("setUint16", data.x);
        this.write("setUint16", data.y);
    }

    public writeRectangle(data: Rectangle) {
        this.write("setUint16", data.x);
        this.write("setUint16", data.y);
        this.write("setUint16", data.width);
        this.write("setUint16", data.height);
        this.writePosition(data.location);
        this.writePosition(data.size);
    }

    // TODO: optimize data storage
    public writeStardewObject(data: StardewObject) {
        this.writeString(data.type);
        this.write("setBigInt64", data.owner);
        this.write("setUint16", data.fragility);
        this.write("setUint16", data.price);
        this.write("setInt16", data.edibility);
        this.write("setUint16", data.stack);
        this.write("setUint8", data.quality);

        this.write("setUint8", data.minutesUntilReady);
        this.writeRectangle(data.boundingBox);
        this.writePosition(data.scale);
        this.write("setUint16", data.uses);

        const flags = {
            specialItem: data.specialItem,
            destroyOvernight: data.destroyOvernight,
            canBeSetDown: data.canBeSetDown,
            canBeGrabbed: data.canBeGrabbed,
            isSpawnedObject: data.isSpawnedObject,
            questItem: data.questItem,
            isOn: data.isOn,
            bigCraftable: data.bigCraftable,
            setOutdoors: data.setOutdoors,
            setIndoors: data.setIndoors,
            readyForHarvest: data.readyForHarvest,
            showNextIndex: data.showNextIndex,
            flipped: data.flipped,
            isRecipe: data.isRecipe,
            isLamp: data.isLamp,
            isHoedirt: data.isHoedirt ?? false,
            hasBeenPickedUpByFarmer: data.hasBeenPickedUpByFarmer ?? false,
            hasQuestId: data.questId !== undefined,
            hasHeldObject: data.heldObject !== undefined,
            hasPreserve: data.preserve !== undefined,
            hasOrderData: data.orderData !== undefined,
            hasHoneyType: data.honeyType !== undefined,
        };

        this.writeFlags(flags, {
            specialItem: 0,
            destroyOvernight: 1,
            canBeSetDown: 2,
            canBeGrabbed: 3,
            isSpawnedObject: 4,
            questItem: 5,
            isOn: 6,
            bigCraftable: 7,
            setOutdoors: 8,
            setIndoors: 9,
            readyForHarvest: 10,
            showNextIndex: 11,
            flipped: 12,
            isRecipe: 13,
            isLamp: 14,
            isHoedirt: 15,
            hasBeenPickedUpByFarmer: 16,
            hasQuestId: 17,
            hasHeldObject: 18,
            hasOrderData: 19,
            hasPreserve: 20,
            hasHoneyType: 21,
        });

        if (flags.hasQuestId) this.write("setUint8", data.questId!);
        if (flags.hasPreserve) {
            this.write("setUint8", data.preserve!);
            this.write("setUint16", data.preservedParentSheetIndex!);
        }
        if (flags.hasOrderData) this.writeString(data.orderData!);
        if (flags.hasHoneyType) this.write("setUint8", data.honeyType!);
        if (flags.hasHeldObject) this.writeStardewObject(data.heldObject!);
    }

    public writeDescriptionElementList(data: DescriptionElement[]) {
        this.write("setUint8", data.length);

        for (const element of data) this.writeDescriptionElement(element);
    }

    // TODO: not make this finicky
    public writeDescriptionElement(data: DescriptionElement) {
        this.writeString(data.xmlKey);

        if (!data.param) {
            this.write("setUint8", 0);
            return;
        }

        if (Array.isArray(data.param)) {
            this.write("setUint8", data.param.length);

            for (const param of data.param) {
                if (typeof param === "object" && "owner" in param) {
                    this.writeStardewObject(param);
                }
            }

        } else {
            this.write("setUint8", 1);
            this.write("setUint8", data.param);
        }

    }

    public readPosition(): StardewPosition {
        return {
            x: this.read("getUint16"),
            y: this.read("getUint16"),
        }
    }

    public readRectangle(): Rectangle {
        return {
            x: this.read("getUint16"),
            y: this.read("getUint16"),
            width: this.read("getUint16"),
            height: this.read("getUint16"),
            location: this.readPosition(),
            size: this.readPosition(),
        }
    }

    public readSkill() {
        return {
            level: this.read("getUint8"),
            experiencePoints: this.read("getUint16"),
        } satisfies Skill
    }

    public readAllSkills() {
        return {
            farming: this.readSkill(),
            fishing: this.readSkill(),
            foraging: this.readSkill(),
            mining: this.readSkill(),
            combat: this.readSkill(),
            luck: this.readSkill(),
        } satisfies SaveInfo["skills"];
    }

    public readRecord() {
        const totalEntries = this.read("getUint16");
        const resultingRecord: Record<string, number> = {};

        for (let i = 0; i < totalEntries; i++) {
            const keyLength = this.read("getUint16");
            const key = this.readString(keyLength);
            const value = this.read("getUint8");
            resultingRecord[key] = value;
        }

        return resultingRecord;
    }

    public readString(length: number, offset: number): string
    public readString(length: number): string
    public readString(): string
    public readString(length?: number, offset?: number) {
        let str = '';

        if (!length) length = this.read("getUint16");

        for (let i = 0; i < length; i++) {
            const charCode = this.read("getUint8", undefined, offset);
            if (charCode !== 0) {
                str += String.fromCharCode(charCode);
            }
        }
        return str;
    }

    public static readString(length: number, view: DataView, offset: number = 0) {
        let str = '';

        for (let i = 0; i < length; i++) {
            const charCode = view.getUint8(offset + i);
            if (charCode !== 0) {
                str += String.fromCharCode(charCode);
            }
        }

        return str;
    }

    public readDialogueEvents(): anyEvent[] {
        const totalEvents = this.read("getUint16");
        const events: anyEvent[] = [];

        for (let i = 0; i < totalEvents; i++) {
            events.push(this.readDialogueEvent())
        }

        return events.sort();
    }

    public readDialogueEvent(): anyEvent {
        const type = this.read("getUint8");
        const packed = this.read("getUint8");
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

        if (type < 3) return base;
        else if (type === EventType.location) {
            return {
                ...base,
                location: this.readString(),
            } satisfies VisitLocation
        } else if (type === EventType.undergroundMine) {
            return {
                ...base,
                mine: this.read("getUint8"),
            } satisfies UndergroundMine
        } else {
            return {
                ...base,
                npc: this.readString(),
            } satisfies NPCHouse
        }
    }

    public readCalendar() {
        const year = this.read("getUint16")
        const packed = this.read("getUint8");
        const season = (packed >> 5) & 0b11;
        const dayOfMonth = packed & 0b11111;
        return { year, season, dayOfMonth } satisfies Calendar;
    }

    public readFlags<T extends Record<string, boolean>>(
        bitPositions: Record<keyof T, number>
    ) {
        const maxBit = Math.max(...Object.values(bitPositions));
        let bitmask: number;

        if (maxBit < 8) {
            bitmask = this.read("getUint8");
        } else if (maxBit < 16) {
            bitmask = this.read("getUint16");
        } else if (maxBit < 32) {
            bitmask = this.read("getUint32");
        } else {
            throw new Error("Too many flags to read in one go");
        }

        return parseBitFlags(bitmask, bitPositions);
    }


    public readFarmerFlags(): SaveInfo["flags"] {
        const FLAGS = this.read("getUint16");

        return {
            gender: (FLAGS & (1 << 0)) !== 0 ? "Male" : "Female",
            isCharging: (FLAGS & (1 << 1)) !== 0,
            coloredBorder: (FLAGS & (1 << 2)) !== 0,
            flip: (FLAGS & (1 << 3)) !== 0,
            isEmoting: (FLAGS & (1 << 4)) !== 0,
            isGlowing: (FLAGS & (1 << 5)) !== 0,
        }
    }

    private getByteSize(method: DataViewSetterKeys | DataViewGetterKeys) {
        if (method.includes("8")) return 1;
        if (method.includes("16")) return 2;
        if (method.includes("32") || method.includes("Float32")) return 4;
        if (method.includes("64")) return 8;
        throw new Error(`Unknown byte size for method: ${method} `);
    }

    private getViewFromArray(arr: Uint8Array) {
        return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    }
}