import { expect, test } from "bun:test";
import { FarmerFlags } from "@abstractions";
import { ViewWrapper, type SaveInfo } from "@models";

const cases: SaveInfo["flags"][] = [
    {
        gender: true,
        isCharging: true,
        coloredBorder: false,
        flip: true,
        isEmoting: false,
        isGlowing: true
    },
    {
        gender: false,
        isCharging: false,
        coloredBorder: false,
        flip: true,
        isEmoting: false,
        isGlowing: false
    },
];

test.each(cases)("#%#, serialize -> deserialize", (flags) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    FarmerFlags.serialize(view, flags);

    view.setOffset(0);

    const output = FarmerFlags.deserialize(view);

    expect(output).toEqual(flags)
});