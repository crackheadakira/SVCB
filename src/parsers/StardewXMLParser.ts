import type { VisitLocation } from "@models";

export type XmlValue = string | number | boolean | null | XmlObject | XmlValue[] | VisitLocation;
export interface XmlObject {
    [key: string]: XmlValue;
}

export class StardewXMLParser {
    parse(value: string): XmlValue {
        const parser = new DOMParser();

        return this.parseNode(parser.parseFromString(value, "text/xml"));
    }

    parseNode(node: Node): XmlValue {
        if (node.nodeType === 1 && node instanceof Element) {
            if (node.hasAttribute("xsi:nil") && node.getAttribute("xsi:nil") === "true") {
                return null;
            }
        }

        const children = Array.from(node.childNodes).filter(n =>
            n.nodeType !== 3 || (n.textContent?.trim().length ?? 0) > 0
        );

        if (children.length === 1 && children[0]!.nodeType === 3) {
            return StardewXMLParser.convertValue(children[0]!.textContent!);
        }

        const obj = this.parseAttributes(node);

        for (const child of children) {
            const name = child.nodeName;
            const parsed = this.parseNode(child);

            if (obj[name]) {
                if (!Array.isArray(obj[name])) {
                    obj[name] = [obj[name]];
                }
                (obj[name] as XmlValue[]).push(parsed);
            } else {
                obj[name] = parsed;
            }
        }

        return this.postProcess(obj);
    }

    static convertValue(raw: string): XmlValue {
        if (typeof raw !== "string") return raw;

        const val = raw.trim();

        if (val === "") return null;
        if (val === "true") return true;
        if (val === "false") return false;
        if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);

        return val;
    }

    parseAttributes(node: Node): XmlObject {
        if (!(node instanceof Element) || node.attributes.length === 0) return {};

        const attrs: Record<string, string> = {};
        for (const attr of Array.from(node.attributes)) {
            attrs[attr.name] = attr.value;
        }

        return { $attrs: attrs };
    }

    postProcess(obj: XmlObject) {
        if (
            Object.keys(obj).length === 1 &&
            Array.isArray(obj["item"]) &&
            obj["item"].every(
                entry => typeof entry === "object" && entry !== null && "key" in entry && "value" in entry
            )
        ) {
            const flatMap: Record<string, XmlValue> = {};

            for (const entry of obj["item"] as XmlObject[]) {
                const key = this.extractKey(entry.key);
                const value = this.extractValue(entry.value);
                flatMap[key] = value;
            }

            return flatMap;
        }

        if (
            Object.keys(obj).length === 1 &&
            Array.isArray(obj.int) &&
            (obj.int.every(v => typeof v === "number" || typeof v === "string" || typeof v === "boolean"))
        ) {
            return obj.int;
        }

        return obj;
    }

    extractKey(input: any) {
        if (typeof input === "object" && input !== null && "string" in input) {
            return StardewXMLParser.convertValue(input.string) as string;
        }
        return StardewXMLParser.convertValue(input) as string;
    }

    extractValue(input: any) {
        if (typeof input === "object" && input !== null && "int" in input) {
            return StardewXMLParser.convertValue(input.int);
        }
        return StardewXMLParser.convertValue(input);
    }
}