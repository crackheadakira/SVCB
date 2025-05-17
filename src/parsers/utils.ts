import type { Rectangle, StardewPosition } from "@models";

export function parseBoolean(key: string) {
    return key === "true";
}

export function parseLocation(json: any): StardewPosition {
    return {
        x: json.X,
        y: json.Y,
    }
}

export function parseRectangle(json: any): Rectangle {
    return {
        x: json.X,
        y: json.Y,
        width: json.Width,
        height: json.Height,
        location: parseLocation(json.Location),
        size: parseLocation(json.Size),
    }
}