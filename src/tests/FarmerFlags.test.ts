import { expect, test, describe } from "bun:test";
import { FarmerFlags } from "@abstractions";
import { StardewSeason, ViewWrapper, type SaveInfo } from "@models";

const cases: [SaveInfo["flags"], Uint8Array<ArrayBuffer>][] = [
    [
        {
            gender: true,
            isCharging: true,
            coloredBorder: false,
            flip: true,
            isEmoting: false,
            isGlowing: true
        },
        new Uint8Array([0x00, 0x2B])
    ],
    [
        {
            gender: false,
            isCharging: false,
            coloredBorder: false,
            flip: true,
            isEmoting: false,
            isGlowing: false
        },
        new Uint8Array([0x00, 0x08])
    ],
];

describe.each(cases)("case %#", (flags, serialized) => {
    test("serialize flags", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        FarmerFlags.serialize(view, flags);

        expect(buf).toEqual(serialized)
    })

    test("deserialize flags", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const res = FarmerFlags.deserialize(view);

        expect(res).toEqual(flags);
    })
});