export type StardewString = string | BinaryString;

export class BinaryString {
    readonly length: number;
    readonly content: Uint8Array;
    readonly original: string;

    constructor(content: Uint8Array, original: string) {
        this.content = content;
        this.length = content.byteLength;

        this.original = original;
    }

    public toString() {
        return this.original;
    }

    public serialize() {
        const serializedArray = new Uint8Array(2 + this.length);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, this.length);
        serializedArray.set(this.content, 2);

        return serializedArray;
    }

    public static fromString(value: string) {
        const encoded = new TextEncoder().encode(value);
        return new BinaryString(encoded, value);
    }

    public static serialize(content: Uint8Array) {
        const serializedArray = new Uint8Array(2 + content.byteLength);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, content.byteLength);
        serializedArray.set(content, 2);

        return serializedArray;
    }
}