import { StardewPosition, type Serializer } from "@abstractions";
import type { IStardewRectangle } from "@models";

export const StardewRectangle: Serializer<IStardewRectangle> = {
    serialize(view, data) {
        view.write("setUint16", data.x);
        view.write("setUint16", data.y);
        view.write("setUint16", data.width);
        view.write("setUint16", data.height);
        StardewPosition.serialize(view, data.location);
        StardewPosition.serialize(view, data.size);
    },

    deserialize(view) {
        return {
            x: view.read("getUint16"),
            y: view.read("getUint16"),
            width: view.read("getUint16"),
            height: view.read("getUint16"),
            location: StardewPosition.deserialize(view),
            size: StardewPosition.deserialize(view),
        }
    },

    parse(json) {
        return {
            x: json.X,
            y: json.Y,
            width: json.Width,
            height: json.Height,
            location: StardewPosition.parse(json.Location),
            size: StardewPosition.parse(json.Size),
        }
    },
}