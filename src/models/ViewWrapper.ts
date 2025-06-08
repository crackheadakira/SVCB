import { BinaryString, makeBitFlags, parseBitFlags, StardewPosition, StardewRectangle, StringTable, type StardewString } from "@abstractions";

type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T];
type DataViewSetterKeys = Extract<FunctionKeys<DataView>, `set${string}`>;
type DataViewGetterKeys = Extract<FunctionKeys<DataView>, `get${string}`>;
type DataViewParameters<T extends DataViewGetterKeys | DataViewSetterKeys> = Parameters<DataView[T]>
type IsBigIntMethod<T extends string> = T extends `${string}Big${string}` ? true : false;
type ReturnTypeForGetter<T extends DataViewGetterKeys> = IsBigIntMethod<T> extends true
    ? bigint
    : number;

export class ViewWrapper {
    private LITTLE_ENDIAN: boolean = false;
    private STRING_LENGTH = 12;
    private dataSize: number = 0;
    private static readonly encoder = new TextEncoder()

    private view: DataView;
    private _offset = 0;

    public get offset(): Readonly<number> {
        return this._offset;
    }

    public setDataSize(d: number) {
        this.dataSize = d;
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

        if (offset !== undefined) fn(offset, value, littleEndian);
        else {
            fn(this.offset, value, littleEndian);
            this._offset += this.getByteSize(method);
        }
    }

    public read<T extends DataViewGetterKeys>(method: T, littleEndian?: boolean, offset?: number): ReturnTypeForGetter<T>
    public read<T extends DataViewGetterKeys>(method: T, littleEndian = this.LITTLE_ENDIAN, offset?: number): ReturnTypeForGetter<T> {
        const fn = this.view[method].bind(this.view);
        const o = offset !== undefined ? offset : this.offset;
        const res = fn(o, littleEndian);

        if (offset === undefined) this._offset += this.getByteSize(method);

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

    public writeString(text: StardewString): void
    public writeString(text: StardewString, length: number): void
    public writeString(text: StardewString, length?: number) {
        const maxLength = length ? length : this.STRING_LENGTH;

        if (text instanceof BinaryString) {
            const index = StringTable.indexMap.get(text.original);
            if (index === undefined) throw new Error("BinaryString did not exist in StringTable")
            this.write("setUint16", index);
            return;
        }

        const encoded = ViewWrapper.encoder.encode(text.padEnd(maxLength, "\0").substring(0, maxLength));
        for (const byte of encoded) {
            this.write("setUint8", byte);
        };

    }

    public writeFlags<T extends Record<string, boolean | undefined>>(
        flags: T,
        bitPositions: Record<keyof T, number>,
        size: "8" | "16" | "32"
    ) {
        const bitmask = makeBitFlags(flags, bitPositions);

        if (size === "8") {
            this.write("setUint8", bitmask);
        } else if (size === "16") {
            this.write("setUint16", bitmask);
        } else if (size === "32") {
            this.write("setUint32", bitmask);
        }
    }

    public writeRecord(data: Record<string, number>) {
        const keys = Object.keys(data);

        const totalEntries = keys.length;
        this.write("setUint16", totalEntries);

        for (const key of keys) {
            const value = data[key];
            if (value === undefined) continue;

            this.writeString(key);
            this.write("setUint8", value);
        }
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

        if (!length) {
            // get string table index
            const index = this.read("getUint16");

            // calculate header offset (+2 because of totalStrings);
            const headerOffset = this.dataSize + 2 + index * 6;

            const stringOffset = this.read("getUint32", undefined, headerOffset);
            const stringLength = this.read("getUint16", undefined, headerOffset + 4);

            offset = stringOffset;
            length = stringLength;
        }

        for (let i = 0; i < length; i++) {
            const charCode = this.read("getUint8", undefined, offset === undefined ? undefined : offset + i);
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

    public readFlags<T extends Record<string, boolean>>(
        bitPositions: Record<keyof T, number>, size: "8" | "16" | "32"
    ): T {
        let bitmask: number;

        if (size === "8") {
            bitmask = this.read("getUint8");
        } else if (size === "16") {
            bitmask = this.read("getUint16");
        } else {
            bitmask = this.read("getUint32");
        }

        return parseBitFlags(bitmask, bitPositions);
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