import { expect, test, describe } from "bun:test";
import { ViewWrapper, type SaveInfo } from "@models";
import { Skills } from "@abstractions";

const cases: [SaveInfo["skills"], Uint8Array<ArrayBuffer>][] = [
    [
        {
            "farming": { "level": 1, "experiencePoints": 349 },
            "fishing": { "level": 2, "experiencePoints": 710 },
            "foraging": { "level": 1, "experiencePoints": 247 },
            "mining": { "level": 1, "experiencePoints": 359 },
            "combat": { "level": 1, "experiencePoints": 212 },
            "luck": { "level": 0, "experiencePoints": 0 }
        },
        new Uint8Array([0x01, 0x01, 0x5D, 0x02, 0x02, 0xC6, 0x01, 0x00, 0xF7, 0x01, 0x01, 0x67, 0x01, 0x00, 0xD4, 0x00, 0x00, 0x00])
    ],
    [
        {
            "farming": { "level": 10, "experiencePoints": 15_000 },
            "fishing": { "level": 10, "experiencePoints": 15_000 },
            "foraging": { "level": 10, "experiencePoints": 15_000 },
            "mining": { "level": 10, "experiencePoints": 15_000 },
            "combat": { "level": 10, "experiencePoints": 15_000 },
            "luck": { "level": 6, "experiencePoints": 3_600 }
        },
        new Uint8Array([0x0A, 0x3A, 0x98, 0x0A, 0x3A, 0x98, 0x0A, 0x3A, 0x98, 0x0A, 0x3A, 0x98, 0x0A, 0x3A, 0x98, 0x06, 0x0E, 0x10])
    ]
];

describe.each(cases)("case %#", (skills, serialized) => {
    test("serialize skill", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        Skills.serialize(view, skills);

        expect(buf).toEqual(serialized)
    })

    test("deserialize skill", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const res = Skills.deserialize(view);

        expect(res).toEqual(skills);
    })
});