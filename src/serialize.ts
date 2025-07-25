import { Calendar, DialogueEvents, FarmerFlags, Quests, Skills, StringTable } from "@abstractions";
import { ViewWrapper, type SaveInfo } from "@models";

export function serialize(saveInfo: SaveInfo) {
    const buffer = new ArrayBuffer(8192);
    const writer = new ViewWrapper(buffer);

    writer.write("setUint16", saveInfo.magic);

    writer.writeString(saveInfo.version);

    // later set these 4 bytes, 15 -> 19, indicates size
    writer.incrementOffset(4);

    writer.writeString(saveInfo.name);
    writer.writeString(saveInfo.farmName);
    writer.writeString(saveInfo.favoriteThing);

    writer.write("setUint16", saveInfo.speed);
    writer.write("setUint16", saveInfo.position.x);
    writer.write("setUint16", saveInfo.position.y);

    Calendar.serialize(writer, saveInfo.calendar);

    writer.write("setUint8", saveInfo.facing);
    writer.write("setUint8", saveInfo.currentEmote);
    writer.write("setFloat32", saveInfo.glowTransparency);
    writer.write("setFloat32", saveInfo.glowRate);

    FarmerFlags.serialize(writer, saveInfo.flags);

    Skills.serialize(writer, saveInfo.skills);

    DialogueEvents.serialize(writer, saveInfo.activeDialogueEvents);
    DialogueEvents.serialize(writer, saveInfo.previousActiveDialogueEvents);

    Quests.serialize(writer, saveInfo.QuestLog);

    // string table offset is derived from this in usage
    writer.writeSize(writer.offset, 14);

    // write string table
    StringTable.write(writer, writer.offset);

    return buffer.slice(0, writer.offset);
}

export function deserialize(buffer: ArrayBuffer): SaveInfo {
    const reader = new ViewWrapper(buffer);

    const magic = reader.read("getUint16");
    if (magic !== 0x5336) throw new Error(`Invalid .stdew file given; magic number does not match (got 0x${magic.toString(16)}, 0x5336`);
    const dataSize = reader.read("getUint32", undefined, 14);
    reader.setDataSize(dataSize);

    return {
        magic,
        version: reader.readString(12),
        dataSize: reader.read("getUint32"),
        name: reader.readString(12),
        farmName: reader.readString(12),
        favoriteThing: reader.readString(12),
        speed: reader.read("getUint16"),
        position: {
            x: reader.read("getUint16"),
            y: reader.read("getUint16")
        },
        calendar: Calendar.deserialize(reader),
        facing: reader.read("getUint8"),
        currentEmote: reader.read("getUint8"),
        glowTransparency: reader.read("getFloat32"),
        glowRate: reader.read("getFloat32"),
        flags: FarmerFlags.deserialize(reader),
        skills: Skills.deserialize(reader),
        activeDialogueEvents: DialogueEvents.deserialize(reader),
        previousActiveDialogueEvents: DialogueEvents.deserialize(reader),
        QuestLog: Quests.deserialize(reader),
        friendshipData: {},
    };
};