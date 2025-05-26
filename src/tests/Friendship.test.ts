import { expect, test, describe } from "bun:test";
import { Friendship } from "@abstractions";
import { FriendshipStatus, ViewWrapper, type IFriendship } from "@models";

const cases: [IFriendship, Uint8Array<ArrayBuffer>][] = [
    [
        {
            points: 187,
            giftsThisWeek: 1,
            giftsToday: 1,
            talkedToToday: true,
            proposalRejected: false,
            status: FriendshipStatus.Friendly,
            proposer: 0
        }, new Uint8Array([0x00, 0xBB, 0x25, 0x00, 0x00, 0x00])
    ],
    [
        {
            points: 3762,
            giftsThisWeek: 2,
            giftsToday: 2,
            talkedToToday: true,
            proposalRejected: true,
            status: FriendshipStatus.Divorced,
            proposer: 1059
        }, new Uint8Array([0x0E, 0xB2, 0x3A, 0x04, 0x23, 0x04])
    ]
];

describe.each(cases)("friendship (case %#)", (calendar, serialized) => {
    test("serialize", () => {
        const buf = new Uint8Array(serialized.byteLength);
        const view = new ViewWrapper(buf, false);

        Friendship.serialize(view, calendar);

        expect(buf).toEqual(serialized);
    });

    test("deserialize", () => {
        const buf = new Uint8Array(serialized);
        const view = new ViewWrapper(buf, false);

        const result = Friendship.deserialize(view);

        expect(result).toEqual(calendar);
    })
});