import { expect, test } from "bun:test";
import { StringTable } from "@abstractions";
import { ViewWrapper } from "@models";

const cases: string[][][] = [
    [["hello"]],
    [["hello", "world"]]
]

test.each(cases)("#%#, serialize -> deserialize", (strings) => {
    StringTable.reset();

    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf);

    for (const string of strings) {

        const res = StringTable.addString(string);
        if (!res) throw new Error("Adding to string table returned undefined");

        view.writeString(res);
    }

    StringTable.write(view);

    view.setOffset(0);
    view.setDataSize(6 * strings.length);

    for (const string of strings) {

        const output = view.readString();

        expect(output).toEqual(string);
    }
})