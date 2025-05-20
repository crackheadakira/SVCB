import { BinaryString } from "@abstractions";

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

    public static addString(value: any) {
        if (typeof value !== "string") return;

        if (this.stringMap.has(value)) return;

        this.stringMap.set(value, this.stringList.length);
        this.stringList.push(value);
    }

    public static removeString(value: string) {
        const idx = this.stringMap.get(value);
        if (idx === undefined) return;

        this.stringMap.delete(value);
        this.stringList.splice(idx, 1);

        // reset indices
        this.stringMap.clear();
        this.stringList.forEach((val, i) => this.stringMap.set(val, i));
    }

    public static getOffset(value: string) {
        const idx = this.stringMap.get(value);
        if (idx !== undefined) return this.binaryStrings[idx]?.offset;
    }

    public static serialize() {
        this.binaryStrings = [];
        const enc = new TextEncoder();

        let offset = 0;
        for (const value of this.stringList) {
            const encoded = enc.encode(value);
            this.binaryStrings.push(new BinaryString(offset, encoded));

            offset += encoded.byteLength;
        }
    }

    public static deserializeString(index: number) {
        const str = this.binaryStrings[index];
        if (!str) throw new Error("Deserializing an invalid index");

        return str.toString();
    }

    public static readObject(obj: Record<string, any>) {
        for (const key of Object.keys(obj))
            if (typeof obj[key] === "object" && obj[key] !== null) {
                StringTable.readObject(obj[key]);
            } else if (typeof obj[key] === "string") StringTable.addString(obj[key]);
    }
}