import { expect, test } from "bun:test";
import { ViewWrapper, type SaveInfo } from "@models";
import { Skills } from "@abstractions";

const cases: SaveInfo["skills"][] = [
    {
        "farming": { "level": 1, "experiencePoints": 349 },
        "fishing": { "level": 2, "experiencePoints": 710 },
        "foraging": { "level": 1, "experiencePoints": 247 },
        "mining": { "level": 1, "experiencePoints": 359 },
        "combat": { "level": 1, "experiencePoints": 212 },
        "luck": { "level": 0, "experiencePoints": 0 }
    },
    {
        "farming": { "level": 10, "experiencePoints": 15_000 },
        "fishing": { "level": 10, "experiencePoints": 15_000 },
        "foraging": { "level": 10, "experiencePoints": 15_000 },
        "mining": { "level": 10, "experiencePoints": 15_000 },
        "combat": { "level": 10, "experiencePoints": 15_000 },
        "luck": { "level": 6, "experiencePoints": 3_600 }
    },
];

test.each(cases)("#%#, serialize -> deserialize", (skills) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    Skills.serialize(view, skills);

    view.setOffset(0);

    const output = Skills.deserialize(view);

    expect(output).toEqual(skills)
});