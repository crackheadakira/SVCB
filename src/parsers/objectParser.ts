import type { StardewObject } from "@models";
import { parseLocation, parseRectangle } from "@parsers";

export function parseObject(json: Record<string, any>): StardewObject {
    return {
        category: json.category,
        hasBeenInInventory: json.hasBeenInInventory,
        name: json.name,
        parentSheetIndex: json.parentSheetIndex,
        specialItem: json.specialItem,
        isRecipe: json.isRecipe,
        quality: json.quality,
        stack: json.stack,
        specialVariable: json.SpecialVariable,
        tileLocation: parseLocation(json.tileLocation),
        owner: json.owner,
        type: json.type,
        canBeSetDown: json.canBeSetDown,
        canBeGrabbed: json.canBeGrabbed,
        isSpawnedObject: json.isSpawnedObject,
        questItem: json.questItem,
        isOn: json.isOn,
        fragility: json.fragility,
        price: json.price,
        edibility: json.edibility,
        bigCraftable: json.bigCraftable,
        setOutdoors: json.setOutdoors,
        setIndoors: json.setIndoors,
        readyForHarvest: json.readyForHarvest,
        showNextIndex: json.showNextIndex,
        flipped: json.flipped,
        isLamp: json.isLamp,
        minutesUntilReady: json.minutesUntilReady,
        boundingBox: parseRectangle(json.boundingBox),
        scale: parseLocation(json.scale),
        uses: json.uses,
        destroyOvernight: json.destroyOvernight,
    } satisfies StardewObject
}