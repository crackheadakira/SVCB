import type { Calendar, Farmer, Skill } from "./types/base";

export function serialize(farmer: Farmer) {
    console.log(farmer);
    const buffer = new ArrayBuffer(1024);
    const writer = new ViewWrapper(buffer);

    writer.write("setUint16", farmer.magic);

    writer.writeString(farmer.version);

    // later set these 4 bytes, 15 -> 19, indicates size
    writer.incrementOffset(4);

    writer.writeString(farmer.name);
    writer.writeString(farmer.farmName);
    writer.writeString(farmer.favoriteThing);

    writer.write("setUint16", farmer.speed);
    writer.write("setUint16", farmer.position.x);
    writer.write("setUint16", farmer.position.y);

    writer.writeCalendar(farmer.calendar);

    writer.write("setUint8", farmer.facing);
    writer.write("setUint8", farmer.currentEmote);
    writer.write("setFloat32", farmer.glowTransparency);
    writer.write("setFloat32", farmer.glowRate);

    writer.writeFlags(farmer.flags);

    writer.writeAllSkills(farmer.skills);

    writer.write("setUint32", writer.getOffset() - 14, undefined, 14);
    return buffer.slice(0, writer.getOffset());
}

export function deserialize(buffer: ArrayBuffer) {
    const reader = new ViewWrapper(buffer);

    const magic = reader.read("getUint16");
    if (magic !== 0x5336) throw new Error(`Invalid .SVD file given; magic number does not match (got 0x${magic.toString(16)}, 0x5336`);

    return {
        magic,
        version: reader.readString(12),
        dataSize: reader.read("getUint32"),
        name: reader.readString(12),
        farmName: reader.readString(12),
        favoriteThing: reader.readString(12),
        speed: reader.read("getUint16"),
        position: {
            x: reader.read("getUint16"),
            y: reader.read("getUint16")
        },
        calendar: reader.readCalendar(),
        facing: reader.read("getUint8"),
        currentEmote: reader.read("getUint8"),
        glowTransparency: reader.read("getFloat32"),
        glowRate: reader.read("getFloat32"),
        flags: reader.readFlags(),
        skills: reader.readAllSkills(),
    };
};

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
    constructor(buffer: ArrayBuffer | DataView, isLittleEndian = false) {
        if (buffer instanceof DataView) this.view = buffer;
        else this.view = new DataView(buffer);

        this.LITTLE_ENDIAN = isLittleEndian;
    }

    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian?: boolean, offset?: number,): void
    public write<T extends DataViewSetterKeys>(method: T, value: DataViewParameters<T>[1], littleEndian = this.LITTLE_ENDIAN, offset?: number) {
        const fnMethod = this.view[method] as (byteOffset: number, value: DataViewParameters<T>[1], littleEndian?: boolean | undefined) => void;
        const fn = fnMethod.bind(this.view);

        if (offset) fn(offset, value, littleEndian);
        else {
            fn(this.offset, value, littleEndian);
            this.offset += this.getByteSize(method);
        }
    }

    public read<T extends DataViewGetterKeys>(method: T, littleEndian = this.LITTLE_ENDIAN): ReturnTypeForGetter<T> {
        const fn = this.view[method].bind(this.view);
        const res = fn(this.offset, littleEndian);

        this.offset += this.getByteSize(method);

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

    public readString(length: number) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const charCode = this.read("getUint8");
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
}

class BinaryString {
    private length: number;
    private offset: number;

    constructor(l: number, o: number) {
        this.length = l;
        this.offset = o;
    }
}

export class StringTable {
    private static uniqueStrings: Set<string> = new Set();
    private static allStrings: string[] = [];
    private static binaryStrings: BinaryString[] = [];
    private static serialized?: Uint8Array;

    public static addString(value: string) {
        this.uniqueStrings.add(value);
        this.allStrings.push(value);
    }

    public static removeString(value: string) {
        this.uniqueStrings.delete(value);
        this.allStrings.splice(this.allStrings.findIndex((v) => v === value), 1)
    }

    public static calculateOffset(value: string) {
        const enc = new TextEncoder();
        if (!this.uniqueStrings.has(value)) throw new Error("Given value does not exist in unique strings");
        let offset = 0;
        let index = 0;

        for (const item of this.uniqueStrings) {
            if (item === value) break;

            offset += enc.encode(item).length;
            index++;
        }

        return [offset, index];
    }

    public static filterUnique() {
        this.uniqueStrings = new Set(this.allStrings);

        return this.allStrings.length - this.uniqueStrings.size;
    }

    public static serialize() {
        const enc = new TextEncoder();

        let totalLength = 0;
        for (const item of this.uniqueStrings) {
            totalLength += enc.encode(item).length;
        }

        const buffer = new ArrayBuffer(totalLength);
        const view = new DataView(buffer);
        let offset = 0;
        let idx = 0;

        for (const item of this.uniqueStrings) {
            const encoded = enc.encode(item);

            let i = 0;
            for (const byte of encoded) {
                view.setUint8(offset + i, byte);
                i++;
            };

            this.binaryStrings[idx] = new BinaryString(encoded.length, offset);

            offset += encoded.length;
            idx++;
        }


        const buf = new Uint8Array(buffer);
        this.serialized = buf;

        return buf;
    }

    public static deserializeString(length: number, offset: number) {
        if (!this.serialized) throw new Error("Trying to deserialize before serialization!");

        const view = new DataView(this.serialized.buffer, this.serialized.byteOffset, this.serialized.byteLength);
        return ViewWrapper.readString(length, view, offset);
    }
}