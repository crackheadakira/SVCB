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
        return ViewWrapper.readString(length, view);
    }

    public serialize() {
        const serializedArray = new Uint8Array(2 + this.length);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, this.length);
        serializedArray.set(this.content, 2);

        return serializedArray;
    }

    public static serialize(content: Uint8Array) {
        const serializedArray = new Uint8Array(2 + content.byteLength);
        const dataView = new DataView(serializedArray.buffer);
        dataView.setUint16(0, content.byteLength);
        serializedArray.set(content, 2);

        return serializedArray;
    }
}

export namespace binary {
    /*
    readonly key: BinaryString;
    readonly data: BinaryData;
    */

    export function serializeRecord(data: Record<string, number>) {
        const keys = Object.keys(data);
        const enc = new TextEncoder();

        // start off with u32
        let totalSize = 4;

        const encodedKeys: { key: Uint8Array, value: number }[] = [];
        for (const key of keys) {
            const value = data[key];

            if (value === undefined) continue;

            const encoded = enc.encode(key);
            encodedKeys.push({ key: encoded, value });
            totalSize += 2 + enc.encode(key).byteLength + 1;
        }

        const buf = new ArrayBuffer(totalSize);
        const writer = new ViewWrapper(buf);
        writer.write("setUint32", totalSize);

        for (const { key, value } of encodedKeys) {
            writer.write("setUint16", key.byteLength);
            writer.writeBytes(key);
            writer.write("setUint8", value);
        }

        return buf;
    }
}