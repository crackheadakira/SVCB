import { ViewWrapper } from "@models";

export interface BinaryData {
    size: number;
    content: Uint8Array;
}

export class BinaryString {
    readonly offset: number;
    readonly length: number;
    readonly content: Uint8Array;

    constructor(offset: number, content: Uint8Array) {
        this.offset = offset;
        this.content = content;
        this.length = content.byteLength;
    }

    public toString() {
        const view = new DataView(this.content.buffer, this.content.byteOffset, this.content.byteLength);
        return ViewWrapper.readString(this.length, view);
    }

    public serialize() {
        const serializedArray = new Uint8Array(2 + this.length);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, this.length);
        serializedArray.set(this.content, 2);

        return serializedArray;
    }

    public static fromString(offset: number, value: string) {
        const encoded = new TextEncoder().encode(value);
        return new BinaryString(offset, encoded);
    }

    public static serialize(content: Uint8Array) {
        const serializedArray = new Uint8Array(2 + content.byteLength);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, content.byteLength);
        serializedArray.set(content, 2);

        return serializedArray;
    }
}