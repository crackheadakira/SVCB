import { StardewPosition, StardewRectangle, StringTable, type FlagMap, type Serializer } from "@abstractions";
import type { IStardewObject, IStardewObjectFlags } from "@models";

const bitPositions: FlagMap<IStardewObjectFlags> = {
    specialItem: 0,
    destroyOvernight: 1,
    canBeSetDown: 2,
    canBeGrabbed: 3,
    isSpawnedObject: 4,
    questItem: 5,
    isOn: 6,
    bigCraftable: 7,
    setOutdoors: 8,
    setIndoors: 9,
    readyForHarvest: 10,
    showNextIndex: 11,
    flipped: 12,
    isRecipe: 13,
    isLamp: 14,
    isHoedirt: 15,
    hasBeenPickedUpByFarmer: 16,
    hasQuestId: 17,
    hasHeldObject: 18,
    hasOrderData: 19,
    hasPreserve: 20,
    hasHoneyType: 21,
    hasBeenInInventory: 22,
    isLostItem: 23,
};

export const StardewObject: Serializer<IStardewObject> = {
    serialize(view, data) {
        view.writeString(data.type);
        view.writeString(data.name);
        view.write("setBigInt64", data.owner);
        view.write("setUint16", data.parentSheetIndex);
        view.write("setUint16", data.fragility);
        view.write("setUint16", data.price);
        view.write("setInt16", data.edibility);
        view.write("setUint16", data.stack);
        view.write("setUint8", data.quality);

        view.write("setUint16", data.minutesUntilReady);
        view.write("setUint16", data.uses);
        StardewRectangle.serialize(view, data.boundingBox);
        StardewPosition.serialize(view, data.scale);
        StardewPosition.serialize(view, data.tileLocation);

        view.write("setUint8", data.specialVariable);
        view.write("setUint8", data.category);

        view.writeFlags(data.flags, bitPositions, "32");

        if (data.flags.hasQuestId) view.write("setUint8", data.questId!);
        if (data.flags.hasPreserve) {
            view.write("setUint8", data.preserve!);
            view.write("setUint16", data.preservedParentSheetIndex!);
        }
        if (data.flags.hasOrderData) view.writeString(data.orderData!);
        if (data.flags.hasHoneyType) view.write("setUint8", data.honeyType!);
        if (data.flags.hasHeldObject) this.serialize(view, data.heldObject!);
    },

    deserialize(view) {
        const base: IStardewObject = {
            type: view.readString(),
            name: view.readString(),
            owner: view.read("getBigInt64"),
            parentSheetIndex: view.read("getUint16"),
            fragility: view.read("getUint16"),
            price: view.read("getUint16"),
            edibility: view.read("getInt16"),
            stack: view.read("getUint16"),
            quality: view.read("getUint8"),
            minutesUntilReady: view.read("getUint16"),
            uses: view.read("getUint16"),
            boundingBox: StardewRectangle.deserialize(view),
            scale: StardewPosition.deserialize(view),
            tileLocation: StardewPosition.deserialize(view),
            specialVariable: view.read("getUint8"),
            category: view.read("getUint8"),
            flags: view.readFlags(bitPositions, "32") as IStardewObjectFlags,
        };

        if (base.flags.hasQuestId) base.questId = view.read("getUint8");
        if (base.flags.hasPreserve) {
            base.preserve = view.read("getUint8");
            base.preservedParentSheetIndex = view.read("getUint16");
        }
        if (base.flags.hasOrderData) base.orderData = view.readString();
        if (base.flags.hasHoneyType) base.honeyType = view.read("getUint8");
        if (base.flags.hasHeldObject) base.heldObject = this.deserialize(view);

        return base;
    },

    parse(json) {
        return {
            category: json.category,
            hasBeenInInventory: json.hasBeenInInventory,
            name: StringTable.addString(json.name)!,
            parentSheetIndex: json.parentSheetIndex,
            quality: json.quality,
            stack: json.stack,
            specialVariable: json.SpecialVariable,
            tileLocation: StardewPosition.parse(json.tileLocation),
            owner: json.owner,
            type: StringTable.addString(json.type)!,
            fragility: json.fragility,
            price: json.price,
            edibility: json.edibility,
            minutesUntilReady: json.minutesUntilReady,
            boundingBox: StardewRectangle.parse(json.boundingBox),
            scale: StardewPosition.parse(json.scale),
            uses: json.uses,
            flags: {
                hasBeenInInventory: json.hasBeenInInventory,
                isLostItem: json?.isLostItem,
                isRecipe: json.isRecipe,
                canBeSetDown: json.canBeSetDown,
                canBeGrabbed: json.canBeGrabbed,
                specialItem: json.specialItem,
                isSpawnedObject: json.isSpawnedObject,
                questItem: json.questItem,
                isOn: json.isOn,
                bigCraftable: json.bigCraftable,
                setOutdoors: json.setOutdoors,
                setIndoors: json.setIndoors,
                readyForHarvest: json.readyForHarvest,
                showNextIndex: json.showNextIndex,
                flipped: json.flipped,
                isLamp: json.isLamp,
                heldObject: json.heldObject,
                destroyOvernight: json.destroyOvernight,

                hasBeenPickedUpByFarmer: json?.hasBeenPickedUpByFarmer ?? false,
                isHoedirt: json?.isHoedirt ?? false,

                hasQuestId: json.questId !== undefined,
                hasHeldObject: json.heldObject !== undefined,
                hasOrderData: json.orderData !== undefined,
                hasPreserve: json.preserve !== undefined,
                hasHoneyType: json.honeyType !== undefined,
            },
            honeyType: json.honeyType,
            preserve: json.preserve,
            orderData: StringTable.addString(json.orderData),
            questId: json?.questId,
            heldObject: json.heldObject !== undefined ? this.parse(json.heldObject) : undefined,
            preservedParentSheetIndex: json?.preservedParentSheetIndex,
        }
    },
}