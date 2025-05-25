import { expect, test } from "bun:test";
import { ViewWrapper } from "@models";
import { Skills } from "@abstractions";

const skills = {
    "farming": {
        "level": 1,
        "experiencePoints": 349
    },
    "fishing": {
        "level": 2,
        "experiencePoints": 710
    },
    "foraging": {
        "level": 1,
        "experiencePoints": 247
    },
    "mining": {
        "level": 1,
        "experiencePoints": 359
    },
    "combat": {
        "level": 1,
        "experiencePoints": 212
    },
    "luck": {
        "level": 0,
        "experiencePoints": 0
    }
};

const serialized = new Uint8Array([0x01, 0x01, 0x5D, 0x02, 0x02, 0xC6, 0x01, 0x00, 0xF7, 0x01, 0x01, 0x67, 0x01, 0x00, 0xD4, 0x00, 0x00, 0x00]);

test("serialize skill", () => {
    const buf = new Uint8Array(18);
    const view = new ViewWrapper(buf);

    Skills.serialize(view, skills);

    expect(buf).toEqual(serialized)
})

test("deserialize skill", () => {
    const buf = new Uint8Array(serialized);
    const view = new ViewWrapper(buf);

    const res = Skills.deserialize(view);

    expect(res).toEqual(skills);
})