import { BinaryString } from "@abstractions";
import type { ViewWrapper } from "@models";

export class StringTable {
    private static stringMap: Map<string, number> = new Map();
    private static stringList: string[] = [];
    private static binaryStrings: BinaryString[] = [];
    private static offset: number = 0;

    public static get strings(): readonly string[] {
        return this.stringList;
    }
    public static get binaries(): readonly BinaryString[] {
        return this.binaryStrings;
    }
    public static get indexMap(): ReadonlyMap<string, number> {
        return this.stringMap;
    }

    private static addBinaryString(value: string) {
        if (!value || value === "") return;

        const binary = BinaryString.fromString(this.offset + 2, value);
        this.offset += binary.length;

        this.binaryStrings.push(binary);

        return binary;
    }

    public static addString(value: string) {
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

        this.offset = 0;
        for (const value of this.stringList) {
            const encoded = enc.encode(value);
            this.binaryStrings.push(new BinaryString(this.offset, encoded, value));

            this.offset += encoded.byteLength;
        }
    }

    public static write(view: ViewWrapper) {
        view.write("setUint16", this.stringList.length);

        for (let i = 0; i < this.stringList.length; i++) {
            const string = this.binaryStrings[i];
            if (!string) continue;

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