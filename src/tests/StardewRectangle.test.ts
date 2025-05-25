import { expect, test, describe } from "bun:test";
import { StardewRectangle } from "@abstractions";
import { type IStardewRectangle, ViewWrapper, } from "@models";

const cases: [IStardewRectangle, Uint8Array<ArrayBuffer>][] = [
    [{
        x: 178, y: 215,
        height: 32, width: 32,
        location: { x: 178, y: 215, },
        size: { x: 32, y: 32, }
    }, new Uint8Array([0x00, 0xB2, 0x00, 0xD7, 0x00, 0x20, 0x00, 0x20, 0x00, 0xB2, 0x00, 0xD7, 0x00, 0x20, 0x00, 0x20])],
    [{
        x: 1206, y: 683,
        height: 12, width: 18,
        location: { x: 11, y: 19, },
        size: { x: 12, y: 18, }
    }, new Uint8Array([0x04, 0xB6, 0x02, 0xAB, 0x00, 0x12, 0x00, 0x0C, 0x00, 0x0B, 0x00, 0x13, 0x00, 0x0C, 0x00, 0x12])],
];

describe.each(cases)("case %#", (rectangle, serialized) => {
    test("serialize rectangle", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        StardewRectangle.serialize(view, rectangle);

        expect(buf).toEqual(serialized);
    });

    test("deserialize rectangle", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const result = StardewRectangle.deserialize(view);

        expect(result).toEqual(rectangle);
    })
});