import { expect, test, describe } from "bun:test";
import { StringTable } from "@abstractions";
import { ViewWrapper } from "@models";

const cases: [string[], Uint8Array<ArrayBuffer>][] = [
    [["hello"], new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x00, 0x05, 0x00, 0x01, 0x68, 0x65, 0x6C, 0x6C, 0x6F])],
    [["hello", "world"], new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x00, 0x05, 0x00, 0x00, 0x00, 0x07, 0x00, 0x05, 0x00, 0x02, 0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x77, 0x6F, 0x72, 0x6C, 0x64])]
]

describe.each(cases)("case %#", (strings, serialized) => {
    test("serialize binary string(s)", () => {
        StringTable.reset();

        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf);

        for (const string of strings) {

            const res = StringTable.addString(string);
            if (!res) throw new Error("Adding to string table returned undefined");

            view.writeString(res);
        }

        StringTable.write(view);

        expect(buf).toEqual(serialized);
    });

    test("deserialize binary string(s)", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf);
        view.setDataSize(6 * strings.length);

        for (const string of strings) {
            const res = view.readString();
            expect(res).toEqual(string);
        }
    })
})