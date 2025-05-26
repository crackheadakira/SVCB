import { expect, test } from "bun:test";
import { Friendship } from "@abstractions";
import { FriendshipStatus, ViewWrapper, type IFriendship } from "@models";

const cases: IFriendship[] = [
    {
        points: 187,
        giftsThisWeek: 1,
        giftsToday: 1,
        talkedToToday: true,
        proposalRejected: false,
        status: FriendshipStatus.Friendly,
        proposer: 0
    },
    {
        points: 3762,
        giftsThisWeek: 2,
        giftsToday: 2,
        talkedToToday: true,
        proposalRejected: true,
        status: FriendshipStatus.Divorced,
        proposer: 1059
    }
];

test.each(cases)("#%#, serialize -> deserialize", (friendship) => {
    const buf = new Uint8Array(100);
    const view = new ViewWrapper(buf, false);

    Friendship.serialize(view, friendship);

    view.setOffset(0);
    const output = Friendship.deserialize(view);

    expect(output).toEqual(friendship);
});