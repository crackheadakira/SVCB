import { expect, test } from "bun:test";
import { ViewWrapper } from "@models";

test("write uint8", () => {
    const buf = new Uint8Array(2);
    const view = new ViewWrapper(buf, false);
    view.write("setUint8", 19);

    expect(buf.toHex()).toEqual("1300");
});

test("write uint8 offset", () => {
    const buf = new Uint8Array(2);
    const view = new ViewWrapper(buf, false);
    view.write("setUint8", 19, undefined, 1);

    expect(buf.toHex()).toEqual("0013");
});

test("write uint16 little endian", () => {
    const buf = new Uint8Array(2);
    const view = new ViewWrapper(buf, false);
    view.write("setUint16", 19, true);

    expect(buf.toHex()).toEqual("1300");
});