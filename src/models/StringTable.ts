import { BinaryString, ViewWrapper } from "@models";

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