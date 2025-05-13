import type { Farmer, Gender, Skill } from "@models";
import { Direction, StardewSeason } from "@models";

const parser = new DOMParser();

export function parseXML(xmlData: string | undefined) {
  if (!xmlData) throw new Error("Did not get XML data upon submit");
  const parsedDom = parser.parseFromString(xmlData, "text/xml");
  return xmlToJson(parsedDom);
}

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

function flattenEntries(arr: any[]) {
  const out: Record<string, any> = {};
  for (const entry of arr) {
    Object.assign(out, entry);
  }
  return out;
}

function xmlToJson(node: Node) {
  const obj: any = {};

  if (node.nodeType === 1 && node instanceof Element) {
    if (node.hasAttribute("xsi:nil") && node.getAttribute("xsi:nil") === "true") {
      return null;
    }

    if (node.attributes.length > 0) {
      obj["$attrs"] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes.item(i);
        if (!attr) continue;

        obj["$attrs"][attr.name] = attr.value;
      }
    }
  }

  const children = Array.from(node.childNodes).filter(n => {
    if (n.nodeType === 3) {
      return n.textContent?.trim().length;
    }
    return true;
  });

  if (children.length === 1 && children[0]!.nodeType === 3) {
    return children[0]!.textContent?.trim();
  }

  for (const child of children) {
    const childName = child.nodeName;
    const childObj = xmlToJson(child);

    if (obj[childName]) {
      if (!Array.isArray(obj[childName])) {
        obj[childName] = [obj[childName]];
      }
      obj[childName].push(childObj);
    } else {
      obj[childName] = childObj;
    }
  }

  if (
    Object.keys(obj).length === 1 &&
    Array.isArray(obj["item"]) &&
    obj["item"].every(
      item =>
        typeof item === "object" &&
        "key" in item &&
        "value" in item
    )
  ) {
    const flatObj: Record<string, any> = {};
    for (const entry of obj["item"]) {
      const key = typeof entry.key === "object" && "string" in entry.key ? entry.key.string : entry.key;
      const value = typeof entry.value === "object" && "int" in entry.value ? Number(entry.value.int) : entry.value;
      flatObj[key] = value;
    }
    return flatObj;
  }

  return obj;
}