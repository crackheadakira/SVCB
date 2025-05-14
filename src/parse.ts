import type { Farmer, Gender, Skill } from "@models";
import { Direction, StardewSeason, StringTable } from "@models";

function parseBoolean(key: string) {
  return key === "true";
}

export function jsonToFarmer(json: any): Farmer {
  return {
    magic: 0x5336,
    version: json.gameVersion,
    name: json.name,
    farmName: json.farmName,
    favoriteThing: json.favoriteThing,
    speed: parseInt(json.Speed),
    position: {
      x: parseInt(json.Position.X),
      y: parseInt(json.Position.Y),
    },
    calendar: {
      year: parseInt(json.yearForSaveGame),
      season: StardewSeason[json.seasonForSaveGame as keyof typeof StardewSeason],
      dayOfMonth: parseInt(json.dayOfMonthForSaveGame)
    },
    facing: Direction[json.FacingDirection as keyof typeof Direction],
    currentEmote: parseInt(json.CurrentEmote),
    glowTransparency: parseFloat(json.glowingTransparency),
    glowRate: parseFloat(json.glowRate),
    flags: {
      gender: json.gender as Gender,
      isCharging: parseBoolean(json.isCharging),
      coloredBorder: parseBoolean(json.coloredBorder),
      flip: parseBoolean(json.flip),
      isEmoting: parseBoolean(json.IsEmoting),
      isGlowing: parseBoolean(json.isGlowing),
    },
    skills: {
      farming: {
        level: parseInt(json.farmingLevel),
        experiencePoints: parseInt(json.experiencePoints.int[0])
      } satisfies Skill,
      fishing: {
        level: parseInt(json.fishingLevel),
        experiencePoints: parseInt(json.experiencePoints.int[1])
      } satisfies Skill,
      foraging: {
        level: parseInt(json.foragingLevel),
        experiencePoints: parseInt(json.experiencePoints.int[2])
      } satisfies Skill,
      mining: {
        level: parseInt(json.miningLevel),
        experiencePoints: parseInt(json.experiencePoints.int[3])
      } satisfies Skill,
      combat: {
        level: parseInt(json.combatLevel),
        experiencePoints: parseInt(json.experiencePoints.int[4])
      } satisfies Skill,
      luck: {
        level: parseInt(json.luckLevel),
        experiencePoints: parseInt(json.experiencePoints.int[5])
      } satisfies Skill
    },
    activeDialogueEvents: json.activeDialogueEvents,
  } satisfies Farmer
}

type XmlValue = string | number | boolean | null | XmlObject | XmlValue[];
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
      return this.convertValue(children[0]!.textContent!);
    }

    const obj: XmlObject = this.parseAttributes(node);

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

  convertValue(raw: string): XmlValue {
    const val = raw.trim();

    if (val === "") return null;
    if (val === "true") return true;
    if (val === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);

    StringTable.addString(val);
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

  postProcess(obj: XmlObject): XmlValue {
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

    return obj;
  }

  extractKey(input: any): string {
    if (typeof input === "object" && input !== null && "string" in input) {
      return String(input.string);
    }
    return String(input);
  }

  extractValue(input: any): XmlValue {
    if (typeof input === "object" && input !== null && "int" in input) {
      return parseInt(input.int as string, 10);
    }
    return input;
  }
}