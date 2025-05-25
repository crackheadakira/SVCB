import { expect, test, describe } from "bun:test";
import { StardewPosition } from "@abstractions";
import { type IStardewPosition, ViewWrapper, } from "@models";

const cases: [IStardewPosition, Uint8Array<ArrayBuffer>][] = [
    [{ x: 178, y: 215 }, new Uint8Array([0x00, 0xB2, 0x00, 0xD7])],
    [{ x: 0, y: 912 }, new Uint8Array([0x00, 0x00, 0x03, 0x90])]
];

describe.each(cases)("case %#", (position, serialized) => {
    test("serialize position", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        StardewPosition.serialize(view, position);

        expect(buf).toEqual(serialized);
    });

    test("deserialize position", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const result = StardewPosition.deserialize(view);

        expect(result).toEqual(position);
    })
});