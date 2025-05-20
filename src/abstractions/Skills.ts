import type { Serializer } from "@abstractions";
import type { ISkill, SaveInfo, ViewWrapper } from "@models";

const skillKeys = ["farming", "fishing", "foraging", "mining", "combat", "luck"] as const;

export const Skill = {
    serialize(view: ViewWrapper, data: ISkill) {
        view.write("setUint8", data.level);
        view.write("setUint16", data.experiencePoints);
    },
    deserialize(view: ViewWrapper): ISkill {
        return {
            level: view.read("getUint8"),
            experiencePoints: view.read("getUint16"),
        }
    },
}

export const Skills: Serializer<SaveInfo["skills"]> = {
    serialize(view, data) {
        for (const key of skillKeys) {
            Skill.serialize(view, data[key]);
        }
    },

    deserialize(view) {
        return skillKeys.reduce((acc, key) => {
            acc[key] = Skill.deserialize(view);
            return acc;
        }, {} as SaveInfo["skills"]);
    },

    parse(json) {
        return skillKeys.reduce((acc, key, index) => {
            acc[key] = {
                level: parseInt(json[`${key}Level`]),
                experiencePoints: parseInt(json.experiencePoints[index])
            };
            return acc;
        }, {} as SaveInfo["skills"]);
    },
}