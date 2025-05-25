import { parseBitFlags, type FlagMap, type Serializer } from "@abstractions";
import type { SaveInfo } from "@models";

const bitPositions: FlagMap<SaveInfo["flags"]> = {
    gender: 0,
    isCharging: 1,
    coloredBorder: 2,
    flip: 3,
    isEmoting: 4,
    isGlowing: 5
}

export const FarmerFlags: Serializer<SaveInfo["flags"]> = {
    serialize(view, data) {
        view.writeFlags(data, bitPositions, "16");
    },
    deserialize(view) {
        const FLAGS = view.read("getUint16");
        return parseBitFlags(FLAGS, bitPositions);
    },
    parse(json) {
        return {
            gender: json.gender,
            isCharging: json.isCharging,
            coloredBorder: json.coloredBorder,
            flip: json.flip,
            isEmoting: json.IsEmoting,
            isGlowing: json.isGlowing,
        }
    },
}