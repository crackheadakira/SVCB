import { expect, test } from "bun:test";
import { StardewRectangle } from "@abstractions";
import { type IStardewRectangle, ViewWrapper, } from "@models";

const cases: IStardewRectangle[] = [
    {
        x: 178, y: 215,
        height: 32, width: 32,
        location: { x: 178, y: 215, },
        size: { x: 32, y: 32, }
    },
    {
        x: 1206, y: 683,
        height: 12, width: 18,
        location: { x: 11, y: 19, },
        size: { x: 12, y: 18, }
    }
];

test.each(cases)("#%#, serialize -> deserialize", (rectangle) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    StardewRectangle.serialize(view, rectangle);

    view.setOffset(0);

    const output = StardewRectangle.deserialize(view);

    expect(output).toEqual(rectangle);
});