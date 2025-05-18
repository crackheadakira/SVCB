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

    writer.writeCalendar(saveInfo.calendar);

    writer.write("setUint8", saveInfo.facing);
    writer.write("setUint8", saveInfo.currentEmote);
    writer.write("setFloat32", saveInfo.glowTransparency);
    writer.write("setFloat32", saveInfo.glowRate);

    writer.writeFlags({
        ...saveInfo.flags,
        gender: saveInfo.flags.gender === "Male",
    }, {
        gender: 0,
        isCharging: 1,
        coloredBorder: 2,
        flip: 3,
        isEmoting: 4,
        isGlowing: 5,
    });

    writer.writeAllSkills(saveInfo.skills);

    writer.writeDialogueEvent(saveInfo.activeDialogueEvents);
    writer.writeDialogueEvent(saveInfo.previousActiveDialogueEvents);

    writer.writeSize(writer.offset - 14, 14);
    return buffer.slice(0, writer.offset);
}

export function deserialize(buffer: ArrayBuffer): SaveInfo {
    const reader = new ViewWrapper(buffer);

    const magic = reader.read("getUint16");
    if (magic !== 0x5336) throw new Error(`Invalid .stdew file given; magic number does not match (got 0x${magic.toString(16)}, 0x5336`);

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
        calendar: reader.readCalendar(),
        facing: reader.read("getUint8"),
        currentEmote: reader.read("getUint8"),
        glowTransparency: reader.read("getFloat32"),
        glowRate: reader.read("getFloat32"),
        flags: reader.readFarmerFlags(),
        skills: reader.readAllSkills(),
        activeDialogueEvents: reader.readDialogueEvents(),
        previousActiveDialogueEvents: reader.readDialogueEvents(),
        QuestLog: [],
    };
};
