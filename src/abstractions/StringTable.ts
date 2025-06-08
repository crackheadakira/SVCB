import { BinaryString } from "@abstractions";
import type { ViewWrapper } from "@models";

export class StringTable {
    private static stringMap: Map<string, number> = new Map();
    private static stringList: string[] = [];
    private static binaryStrings: BinaryString[] = [];

    public static get strings(): readonly string[] {
        return this.stringList;
    }
    public static get binaries(): readonly BinaryString[] {
        return this.binaryStrings;
    }
    public static get indexMap(): ReadonlyMap<string, number> {
        return this.stringMap;
    }

    public static reset() {
        this.stringMap = new Map();
        this.stringList = [];
        this.binaryStrings = [];
    }

    private static addBinaryString(value: string) {
        const binary = BinaryString.fromString(value);

        this.binaryStrings.push(binary);

        return binary;
    }

    public static addString(value: string) {
        if (!value || value == "") return ""
        if (this.stringMap.has(value)) return this.getBinaryString(value)!;

        this.stringMap.set(value, this.stringList.length);
        this.stringList.push(value);

        return this.addBinaryString(value);
    }

    public static removeString(value: string) {
        const idx = this.stringMap.get(value);
        if (idx === undefined) return;

        this.stringMap.delete(value);
        this.stringList.splice(idx, 1);
        this.binaryStrings.splice(idx, 1);

        // reset indices
        this.stringMap.clear();
        this.stringList.forEach((val, i) => this.stringMap.set(val, i));
    }

    public static getBinaryString(value: string) {
        const idx = this.stringMap.get(value);
        if (idx !== undefined) return this.binaryStrings[idx];
    }

    public static serialize() {
        this.binaryStrings = [];
        const enc = new TextEncoder();

        for (const value of this.stringList) {
            const encoded = enc.encode(value);
            this.binaryStrings.push(new BinaryString(encoded, value));
        }
    }

    public static write(view: ViewWrapper, offset: number) {
        view.write("setUint16", this.stringList.length);
        offset += 2;

        // add total header size to offset for it to be absolute
        offset += this.stringList.length * 6;

        for (let i = 0; i < this.stringList.length; i++) {
            const string = this.binaryStrings[i];

            if (!string) {
                console.log(this.binaryStrings);
                throw new Error(`Got undefined binary string at idx ${i}`);
            }

            view.write("setUint32", offset);
            view.write("setUint16", string.length);

            offset += string.length;
        }

        for (let i = 0; i < this.stringList.length; i++) {
            const string = this.binaryStrings[i];

            if (!string) {
                console.log(this.binaryStrings);
                throw new Error(`Got undefined binary string at idx ${i}`);
            }

            for (const byte of string.content) {
                view.write("setUint8", byte);
            }
        }
    }

    public static deserializeString(index: number) {
        const str = this.binaryStrings[index];
        if (!str) throw new Error("Deserializing an invalid index");

        return str.original;
    }

    public static readObject(obj: Record<string, any>) {
        for (const key of Object.keys(obj))
            if (typeof obj[key] === "object" && obj[key] !== null) {
                StringTable.readObject(obj[key]);
            } else if (typeof obj[key] === "string") StringTable.addString(obj[key]);
    }
}