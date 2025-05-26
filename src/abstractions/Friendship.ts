import type { Serializer } from "@abstractions";
import { FriendshipStatus, type IFriendship } from "@models";

export const Friendships: Serializer<Record<string, IFriendship>> = {
    serialize(view, data) {
        view.write("setUint8", Object.keys(data).length);

        for(const key of Object.keys(data)) {
            const item = data[key];
            if(!item) continue;

            view.writeString(key);
            Friendship.serialize(view, item);
        }
    },

    deserialize(view) {
        const total = view.read("getUint8");
        const final: Record<string, IFriendship> = {};

        for(let i = 0; i < total; i++) {
            const key = view.readString();
            const data = Friendship.deserialize(view);

            final[key] = data;
        }

        return final;
    },

    parse(json) {
        const final: Record<string, IFriendship> = {};

        for (const key of Object.keys(json)) {
            final[key] = Friendship.parse(json[key].Friendship);
        }

        return final;
    },
}

const booleanToBit = (val: boolean, offset: number) => ((val ? 1 : 0) & 0b1) << offset;
const bitToBoolean = (val: number, offset: number) => ((val >> offset) &0b1) === 1;

export const Friendship: Serializer<IFriendship> = {
    serialize(view, data) {
        view.write("setUint16", data.points);
        const packed = booleanToBit(data.talkedToToday, 5) | booleanToBit(data.proposalRejected, 4) | ((data.giftsToday & 0b11) << 2) | (data.giftsThisWeek & 0b11);
        view.write("setUint8", packed);
        view.write("setUint16", data.proposer);
        view.write("setUint8", data.status);
    },

    deserialize(view) {
        const points = view.read("getUint16");
        const packed = view.read("getUint8");

        return {
            points,
            talkedToToday: bitToBoolean(packed, 5),
            proposalRejected: bitToBoolean(packed, 4),
            giftsToday: (packed >> 2) & 0b11,
            giftsThisWeek: packed & 0b11,
            proposer: view.read("getUint16"),
            status: view.read("getUint8")
        }
    },

    // assume json is data[npc].Friendship;
    parse(json) {
        return {
            points: json.Points,
            giftsThisWeek: json.GiftsThisWeek,
            giftsToday: json.GiftsToday,
            talkedToToday: json.TalkedToToday,
            status: FriendshipStatus[json.Status as keyof typeof FriendshipStatus],
            proposalRejected: json.proposalRejected,
            proposer: json.Proposer
        } satisfies IFriendship
    },
}