import { BinaryString } from "@models";

export class StringTable {
    private static uniqueStrings: Set<string> = new Set();
    // private static allStrings: string[] = [];
    private static binaryStrings: BinaryString[] = [];

    public static getUniqueStrings() {
        return this.uniqueStrings;
    }

    public static getBinaryStrings() {
        return this.binaryStrings;
    }

    public static addString(value: string) {
        this.uniqueStrings.add(value);
        // this.allStrings.push(value);
    }

    public static removeString(value: string) {
        this.uniqueStrings.delete(value);
        // this.allStrings.splice(this.allStrings.findIndex((v) => v === value), 1)
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

    /*
    public static filterUnique() {
        this.uniqueStrings = new Set(this.allStrings);

        return this.allStrings.length - this.uniqueStrings.size;
    }
    */

    public static serialize() {
        const enc = new TextEncoder();

        let totalLength = 0;
        for (const item of this.uniqueStrings) {
            totalLength += enc.encode(item).length;
        }

        let offset = 0;
        let idx = 0;

        for (const item of this.uniqueStrings) {
            const encoded = enc.encode(item);
            this.binaryStrings[idx] = new BinaryString(offset, encoded);

            offset += encoded.length;
            idx++;
        }
    }

    public static deserializeString(index: number) {
        const str = this.binaryStrings[index];
        if (!str) throw new Error("Deserializing an invalid index");

        return str.toString();
    }
}