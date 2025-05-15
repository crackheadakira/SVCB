import { expect, test } from "bun:test";
import { ViewWrapper } from "@models";

test("write uint8", () => {
    const buf = new Uint8Array(2);
    const view = new ViewWrapper(buf);
    view.write("setUint8", 19);

    expect(buf.toHex()).toBe("1300");
});

test("write uint16 little endian", () => {
    const buf = new Uint8Array(2);
    const view = new ViewWrapper(buf);
    view.write("setUint16", 19, true);

    expect(buf.toHex()).toBe("1300");
});