import type { Calendar, Farmer, Skill } from "@models/base";

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
    private LITTLE_ENDIAN: boolean;
    private STRING_LENGTH = 12;

    private view: DataView;
    private offset = 0;

    constructor(buffer: DataView, isLittleEndian?: boolean)
    constructor(buffer: ArrayBuffer, isLittleEndian?: boolean)
    constructor(buffer: Uint8Array, isLittleEndian?: boolean)
    constructor(buffer: ArrayBuffer | DataView | Uint8Array, isLittleEndian = false) {
        if (buffer instanceof DataView) this.view = buffer;
        else if (buffer instanceof Uint8Array) this.view = this.getViewFromArray(buffer);
        else this.view = new DataView(buffer);

        this.LITTLE_ENDIAN = isLittleEndian;
    }

    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean, offset?: number,): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian = this.LITTLE_ENDIAN, offset?: number): void {
        const fnMethod = this.view[method] as (byteOffset: number, value: DataViewParameters<T>[1], littleEndian?: boolean | undefined) => void;
        const fn = fnMethod.bind(this.view);

        if (offset != undefined) fn(offset, value, littleEndian);
        else {
            fn(this.offset, value, littleEndian);
            this.offset += this.getByteSize(method);
        }
    }

    public read<T extends DataViewGetterKeys>(method: T, littleEndian?: boolean, offset?: number): ReturnTypeForGetter<T>
    public read<T extends DataViewGetterKeys>(method: T, littleEndian = this.LITTLE_ENDIAN, offset?: number): ReturnTypeForGetter<T> {
        const fn = this.view[method].bind(this.view);
        const o = offset ? offset : this.offset;
        const res = fn(o, littleEndian);

        if (offset == undefined) this.offset += this.getByteSize(method);

        return res as ReturnTypeForGetter<T>;
    }

    public setOffset(newOffset: number) {
        this.offset = newOffset;
    }

    public getOffset() {
        return this.offset;
    }

    public incrementOffset(inc: number) {
        this.offset += inc;
    }

    public decrementOffset(dec: number) {
        this.offset -= dec;
    }

    public writeBytes(data: Uint8Array) {
        for (const byte of data) {
            this.write("setUint8", byte);
        }
    }

    public writeSize() {
        this.write("setUint32", this.offset - 14, undefined, 14);
    }

    public writeString(text: string): void
    public writeString(text: string, length: number): void
    public writeString(text: string, length?: number) {
        const maxLength = length ? length : this.STRING_LENGTH;

        const enc = new TextEncoder();
        const encoded = enc.encode(text.padEnd(maxLength, "\0").substring(0, maxLength));
        for (const byte of encoded) {
            this.write("setUint8", byte);
        };

    }

    public writeSkill(skill: Skill) {
        this.write("setUint8", skill.level);
        this.write("setUint16", skill.experiencePoints);
    }

    public writeAllSkills(skills: Farmer["skills"]) {
        this.writeSkill(skills.farming);
        this.writeSkill(skills.fishing);
        this.writeSkill(skills.foraging);
        this.writeSkill(skills.mining);
        this.writeSkill(skills.combat);
        this.writeSkill(skills.luck);
    }

    public writeFlags(flags: Farmer["flags"]) {
        let FLAGS = 0;

        if (flags.gender === "Male") FLAGS |= 1 << 0;
        if (flags.isCharging) FLAGS |= 1 << 1;
        if (flags.coloredBorder) FLAGS |= 1 << 2;
        if (flags.flip) FLAGS |= 1 << 3;
        if (flags.isEmoting) FLAGS |= 1 << 4;
        if (flags.isGlowing) FLAGS |= 1 << 5;

        this.write("setUint16", FLAGS);
    }

    public writeCalendar(calendar: Calendar) {
        const packed = ((calendar.season & 0b11) << 5) | (calendar.dayOfMonth & 0b11111);
        this.write("setUint16", calendar.year);
        this.write("setUint8", packed);
    }

    public writeRecord(data: Record<string, number>, customLogic?: (key: string, value: number, writeFn: (...args: Parameters<ViewWrapper["write"]>) => void) => void) {
        const keys = Object.keys(data);
        const enc = new TextEncoder();

        const totalEntries = keys.length;
        this.write("setUint16", totalEntries);

        for (const key of keys) {
            const value = data[key];

            if (value === undefined) continue;
            if (customLogic) {
                customLogic(key, value, this.write.bind(this));
            } else {
                const encoded = enc.encode(key);
                this.write("setUint16", encoded.byteLength);
                this.writeBytes(encoded);
                this.write("setUint8", value);
            }
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
        } satisfies Farmer["skills"];
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
    public readString(length: number, offset?: number) {
        let str = '';
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

    public readCalendar() {
        const year = this.read("getUint16")
        const packed = this.read("getUint8");
        const season = (packed >> 5) & 0b11;
        const dayOfMonth = packed & 0b11111;
        return { year, season, dayOfMonth } satisfies Calendar;
    }

    public readFlags(): Farmer["flags"] {
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