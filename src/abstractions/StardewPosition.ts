import type { Serializer } from "@abstractions";
import type { IStardewPosition } from "@models";

export const StardewPosition: Serializer<IStardewPosition> = {
    serialize(view, data) {
        view.write("setUint16", data.x);
        view.write("setUint16", data.y);
    },
    deserialize(view) {
        return {
            x: view.read("getUint16"),
            y: view.read("getUint16"),
        }
    },
    parse(json) {
        return {
            x: parseInt(json.X),
            y: parseInt(json.Y),
        }
    },
}