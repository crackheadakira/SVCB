import { expect, test } from "bun:test";
import { StardewPosition } from "@abstractions";
import { type IStardewPosition, ViewWrapper, } from "@models";

const cases: IStardewPosition[] = [
    { x: 178, y: 215 },
    { x: 0, y: 912 }
];

test.each(cases)("#%#, serialize -> deserialize", (position) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    StardewPosition.serialize(view, position);

    view.setOffset(0);

    const output = StardewPosition.deserialize(view);

    expect(output).toEqual(position);
});