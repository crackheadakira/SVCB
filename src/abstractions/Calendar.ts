import type { Serializer } from "@abstractions";
import { StardewSeason, type ICalendar } from "@models";

export const Calendar: Serializer<ICalendar> = {
    serialize: (view, calendar) => {
        const packed = ((calendar.season & 0b11) << 5) | (calendar.dayOfMonth & 0b11111);
        view.write("setUint16", calendar.year);
        view.write("setUint8", packed);
    },
    deserialize: (view) => {
        const year = view.read("getUint16")
        const packed = view.read("getUint8");
        const season = (packed >> 5) & 0b11;
        const dayOfMonth = packed & 0b11111;
        return { year, season, dayOfMonth }
    },
    parse: (json) => {
        return {
            year: parseInt(json.yearForSaveGame),
            season: StardewSeason[json.seasonForSaveGame as keyof typeof StardewSeason],
            dayOfMonth: parseInt(json.dayOfMonthForSaveGame)
        }
    }
}