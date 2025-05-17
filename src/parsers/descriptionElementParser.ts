import type { DescriptionElement } from "@models";
import { parseObject } from "@parsers";

export function parseDescriptionElementList(json: Record<string, any>) {
    if (!Array.isArray(json)) return;
    const final: DescriptionElement[] = [];
    for (const item of json) {
        final.push(parseDescriptionElement(item));
    }

    return final;
}

export function parseDescriptionElement(json: Record<string, any>): DescriptionElement {
    const final: DescriptionElement = {
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
}