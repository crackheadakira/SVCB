import { ViewWrapper, type Farmer } from "@models";

export function serialize(farmer: Farmer) {
    console.log(farmer);
    const buffer = new ArrayBuffer(8192);
    const writer = new ViewWrapper(buffer);

    writer.write("setUint16", farmer.magic);

    writer.writeString(farmer.version);

    // later set these 4 bytes, 15 -> 19, indicates size
    writer.incrementOffset(4);

    writer.writeString(farmer.name);
    writer.writeString(farmer.farmName);
    writer.writeString(farmer.favoriteThing);

    writer.write("setUint16", farmer.speed);
    writer.write("setUint16", farmer.position.x);
    writer.write("setUint16", farmer.position.y);

    writer.writeCalendar(farmer.calendar);

    writer.write("setUint8", farmer.facing);
    writer.write("setUint8", farmer.currentEmote);
    writer.write("setFloat32", farmer.glowTransparency);
    writer.write("setFloat32", farmer.glowRate);

    writer.writeFlags(farmer.flags);

    writer.writeAllSkills(farmer.skills);

    // write first record
    writer.writeRecord(farmer.activeDialogueEvents);

    writer.writeSize();
    return buffer.slice(0, writer.getOffset());
}

export function deserialize(buffer: ArrayBuffer): Farmer {
    const reader = new ViewWrapper(buffer);

    const magic = reader.read("getUint16");
    if (magic !== 0x5336) throw new Error(`Invalid .SVD file given; magic number does not match (got 0x${magic.toString(16)}, 0x5336`);

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
        flags: reader.readFlags(),
        skills: reader.readAllSkills(),
        activeDialogueEvents: reader.readRecord(),
    };
};
