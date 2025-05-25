import { expect, test, describe } from "bun:test";
import { Calendar } from "@abstractions";
import { StardewSeason, ViewWrapper, type ICalendar } from "@models";

const cases: [ICalendar, Uint8Array<ArrayBuffer>][] = [
    [{ "year": 1, "season": StardewSeason.Spring, "dayOfMonth": 8 }, new Uint8Array([0x00, 0x01, 0x08])],
    [{ "year": 7, "season": StardewSeason.Summer, "dayOfMonth": 28 }, new Uint8Array([0x00, 0x07, 0x3C])]
];

describe.each(cases)("case %#", (calendar, serialized) => {
    test("serialize calendar", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        Calendar.serialize(view, calendar);

        expect(buf).toEqual(serialized);
    });

    test("deserialize calendar", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const result = Calendar.deserialize(view);

        expect(result).toEqual(calendar);
    })
});