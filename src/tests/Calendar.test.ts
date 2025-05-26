import { expect, test } from "bun:test";
import { Calendar } from "@abstractions";
import { StardewSeason, ViewWrapper, type ICalendar } from "@models";

const cases: ICalendar[] = [
    { "year": 1, "season": StardewSeason.Spring, "dayOfMonth": 8 },
    { "year": 7, "season": StardewSeason.Summer, "dayOfMonth": 28 }
];

test.each(cases)("#%#, serialize -> deserialize", (calendar) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    Calendar.serialize(view, calendar);

    view.setOffset(0);
    const output = Calendar.deserialize(view);

    expect(output).toEqual(calendar);
});