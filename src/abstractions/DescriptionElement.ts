import type { Serializer } from "@abstractions";
import type { IDescriptionElement } from "@models";
import { parseObject } from "@parsers";

export const DescriptionElementList: Serializer<IDescriptionElement[]> = {
    serialize(view, data) {
        view.write("setUint8", data.length);

        for (const element of data) DescriptionElement.serialize(view, element);
    },

    deserialize(view) {
        const total = view.read("getUint8");
        const final: IDescriptionElement[] = [];

        for (let i = 0; i < total; i++) {
            final.push(DescriptionElement.deserialize(view));
        }

        return final;
    },

    parse(json) {
        const final: IDescriptionElement[] = [];
        for (const item of json) {
            final.push(DescriptionElement.parse(item));
        }

        return final;
    },
}

export const DescriptionElement: Serializer<IDescriptionElement> = {
    // TODO: not make this finicky
    serialize(view, data) {
        // make this a binary string
        view.writeString(data.xmlKey);

        // instead of writing data.param length make a type
        // 0 -> no param, 1 -> number param, 2 -> stardew object
        // then amount of params.
        if (!data.param) {
            view.write("setUint8", 0);
            return;
        }

        if (Array.isArray(data.param)) {
            view.write("setUint8", data.param.length);

            for (const param of data.param) {
                if (typeof param === "object" && "owner" in param) {
                    view.writeStardewObject(param);
                }
            }

        } else {
            view.write("setUint8", 1);
            view.write("setUint8", data.param);
        }
    },

    deserialize(view) {
        const final: IDescriptionElement = {
            xmlKey: view.readString()
        };

        const param = view.read("getUint8");
        if (param === 0) return final;
        else if (param === 1) final.param = view.read("getUint8");
        // else do StardewObject thing

        return final;
    },

    parse(json) {
        const final: IDescriptionElement = {
            xmlKey: json.xmlKey,
        };

        if (json.param) {
            if (Array.isArray(json.param)) {
                final.param = [];
                for (const param of json.param) {
                    if (typeof param === "object" && "$attrs" in param) {
                        if (!param) continue;
                        const type = param["$attrs"]["xsi:type"];
                        if (type === "Object") final.param.push(parseObject(param));
                    } else if (typeof param === "number") final.param.push(param);
                }
            } else {
                final.param = json.param;
            }
        }

        return final;
    },
}