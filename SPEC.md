# _.STDEW_ Specification

## Overview

This specification outlines the structure and binary format used to serialize and deserialize save data from Stardew Valley into a compact binary format.

## Save Game Info Layout

| Field                  | Type     | Size (bytes) | Notes                                             |
| ---------------------- | -------- | ------------ | ------------------------------------------------- |
| `magic`                | `u16`    | 2            | Magic number `0x5336` to validate file            |
| `version`              | `string` | 12           | E.g. `1.6.15`, null-padded                        |
| `dataSize`             | `u32`    | 4            | How many bytes exist after size                   |
| `name`                 | `string` | 12           | UTF-8, null-padded                                |
| `farmName`             | `string` | 12           | UTF-8, null-padded                                |
| `favoriteThing`        | `string` | 12           | UTF-8, null-padded                                |
| `speed`                | `u16`    | 2            |                                                   |
| `position.x`           | `u16`    | 2            | X-coordinate of the farmer in world space         |
| `position.y`           | `u16`    | 2            | Y-coordinate of the farmer in world space         |
| `calendar.year`        | `u16`    | 2            |                                                   |
| `calendar.season`      | `u2`     | 0.25         |                                                   |
| `calendar.dayOfMonth`  | `u5`     | 0.625        | Calendar wastes 1 byte, takes up 23 bytes         |
| `facing`               | `u8`     | 1            | Should be an `u2` in the future                   |
| `currentEmote`         | `u8`     | 1            |                                                   |
| `glowTransparency`     | `f32`    | 4            |                                                   |
| `glowRate`             | `f32`    | 4            |                                                   |
| `flags`                | `u16`    | 2            | Refer to flags layout table for more information  |
| `skills.farming`       | `skill`  | 3            | Refer to skill layout table for more information  |
| `skills.fishing`       | `skill`  | 3            |                                                   |
| `skills.foraging`      | `skill`  | 3            |                                                   |
| `skills.mining`        | `skill`  | 3            |                                                   |
| `skills.combat`        | `skill`  | 3            |                                                   |
| `skills.luck`          | `skill`  | 3            |                                                   |
| `activeDialogueEvents` | `record` | variable     | Refer to record layout table for more information |

Minimum Total Size: 93 bytes

## Flags Layout

| Bit    | Name          | Notes                                  |
| ------ | ------------- | -------------------------------------- |
| `0`    | Gender        | (0 = Female, 1 = Male)                 |
| `1`    | isCharging    | If charging up tool                    |
| `2`    | coloredBorder | Draw player with a border              |
| `3`    | flip          | Flip the direction character is drawn  |
| `4`    | isEmoting     | Is farmer emoting                      |
| `5`    | isGlowing     | Is farmer glowing                      |
| `6-15` | Reserved      | Reserved for any future boolean values |

## Skill Layout

| Field   | Type  | Size (bytes) |
| ------- | ----- | ------------ |
| `level` | `u8`  | 1            |
| `exp`   | `u16` | 2            |

## Record Layout

| Field             | Type          |
| ----------------- | ------------- |
| `totalEntries`    | `u16`         |
| `entry[i].length` | `u16`         |
| `entry[i].bytes`  | `variable`    |
| `entry[i].value`  | `u8` or `u16` |
