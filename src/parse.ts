import type { SaveInfo, Gender, Skill, VisitLocation, AnyQuest, quest, StardewObject, Rectangle, StardewPosition, DescriptionElement, Quest } from "@models";
import { Direction, StardewSeason, QuestType } from "@models";
import type { StringMappingType } from "typescript";

function parseBoolean(key: string) {
  return key === "true";
}

export function jsonToSaveInfo(json: any): SaveInfo {
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
    QuestLog: parseQuestLog(json.questLog.Quest),
  } satisfies SaveInfo
}

function parseLocation(json: any): StardewPosition {
  return {
    x: json.X,
    y: json.Y,
  }
}

function parseQuestLog(json: any) {
  const final: AnyQuest[] = [];
  if (Array.isArray(json)) {
    for (const quest of json) {
      const res = parseQuest(quest);
      if (!res) continue;

      final.push(res);
    }
  }

  return final;
}

function parseQuest(json: Record<string, any>): AnyQuest | undefined {
  const questType = json.questType as QuestType;
  const base = {
    currentObjective: json["_currentObjective"],
    description: json["quest_Description"],
    title: json.questTitle,
    rewardDescription: json?.rewardDescription,
    accepted: json.accepted,
    completed: json.completed,
    dailyQuest: json.dailyQuest,
    showNew: json.showNew,
    canBeCancelled: json.canBeCancelled,
    destroy: json.destroy,
    id: json?.id,
    moneyReward: json.moneyReward,
    questType,
    daysLeft: json.daysLeft,
    daysQuestAccepted: json.dayQuestAccepted,
    nextQuests: json?.nextQuests,
  } satisfies Quest;

  switch (questType) {
    case QuestType.Basic:
      return {
        ...base,
      } satisfies Quest
    case QuestType.Building:
      return {
        ...base,
        buildingType: json.buildingType
      } satisfies quest.BuildingQuest
    case QuestType.Resource:
      return {
        ...base,
        target: json.target,
        targetMessage: json.targetMessage,
        collected: json.numberCollected,
        number: json.number,
        reward: json.reward,
        resource: json.resource,
        parts: parseDescriptionElementList(json.parts.DescriptionElement)!,
        dialogueparts: parseDescriptionElementList(json.dialogueparts.DescriptionElement)!,
        objective: parseDescriptionElement(json.objective),
      } satisfies quest.ResourceCollectionQuest
  }
}

function parseObject(json: Record<string, any>): StardewObject {
  return {
    category: json.category,
    hasBeenInInventory: json.hasBeenInInventory,
    name: json.name,
    parentSheetIndex: json.parentSheetIndex,
    specialItem: json.specialItem,
    isRecipe: json.isRecipe,
    quality: json.quality,
    stack: json.stack,
    specialVariable: json.SpecialVariable,
    tileLocation: parseLocation(json.tileLocation),
    owner: json.owner,
    type: json.type,
    canBeSetDown: json.canBeSetDown,
    canBeGrabbed: json.canBeGrabbed,
    isSpawnedObject: json.isSpawnedObject,
    questItem: json.questItem,
    isOn: json.isOn,
    fragility: json.fragility,
    price: json.price,
    edibility: json.edibility,
    bigCraftable: json.bigCraftable,
    setOutdoors: json.setOutdoors,
    setIndoors: json.setIndoors,
    readyForHarvest: json.readyForHarvest,
    showNextIndex: json.showNextIndex,
    flipped: json.flipped,
    isLamp: json.isLamp,
    minutesUntilReady: json.minutesUntilReady,
    boundingBox: parseRectangle(json.boundingBox),
    scale: parseLocation(json.scale),
    uses: json.uses,
    destroyOvernight: json.destroyOvernight,
  } satisfies StardewObject
}

function parseDescriptionElement(json: Record<string, any>): DescriptionElement {
  const final: DescriptionElement = {
    xmlKey: "",
  };

  final.xmlKey = json.xmlKey;
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

function parseDescriptionElementList(json: Record<string, any>) {
  if (!Array.isArray(json)) return;
  const final: DescriptionElement[] = [];
  for (const item of json) {
    final.push(parseDescriptionElement(item));
  }

  return final;
}

function parseRectangle(json: any): Rectangle {
  return {
    x: json.X,
    y: json.Y,
    width: json.Width,
    height: json.Height,
    location: parseLocation(json.Location),
    size: parseLocation(json.Size),
  }
}

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