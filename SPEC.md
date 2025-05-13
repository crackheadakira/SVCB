# _.STDEW_ Specification

## Overview

This specification outlines the structure and binary format used to serialize and deserialize save data from Stardew Valley into a compact binary format.

## Save Game Info Layout

| Field                 | Type     | Size (bytes) | Notes                                            |
| --------------------- | -------- | ------------ | ------------------------------------------------ |
| `magic`               | `u16`    | 2            | Magic number `0x5336` to identify file           |
| `version`             | `string` | 12           | E.g. `1.6.15`, null-padded                       |
| `dataSize`            | `u32`    | 4            | Total size (excluding header)                    |
| `name`                | `string` | 12           | UTF-8, null-padded                               |
| `farmName`            | `string` | 12           | UTF-8, null-padded                               |
| `favoriteThing`       | `string` | 12           | UTF-8, null-padded                               |
| `speed`               | `u16`    | 2            |                                                  |
| `position.x`          | `u16`    | 2            | X-coordinate of the farmer in world space        |
| `position.y`          | `u16`    | 2            | Y-coordinate of the farmer in world space        |
| `calendar.year`       | `u16`    | 2            |                                                  |
| `calendar.season`     | `u2`     | 0.25         |                                                  |
| `calendar.dayOfMonth` | `u5`     | 0.625        | Calendar wastes 1 byte, takes up 23 bytes        |
| `facing`              | `u8`     | 1            | Should be an `u2` in the future                  |
| `currentEmote`        | `u8`     | 1            |                                                  |
| `glowTransparency`    | `f32`    | 4            |                                                  |
| `glowRate`            | `f32`    | 4            |                                                  |
| `flags`               | `u16`    | 2            | Refer to flags layout table for more information |
| `skills.farming`      | `skill`  | 3            | Refer to skill layout table for more information |
| `skills.fishing`      | `skill`  | 3            |                                                  |
| `skills.foraging`     | `skill`  | 3            |                                                  |
| `skills.mining`       | `skill`  | 3            |                                                  |
| `skills.combat`       | `skill`  | 3            |                                                  |
| `skills.luck`         | `skill`  | 3            |                                                  |

Minimum Total Size: 93 bytes

## Flags Layout

| Bit    | Name          | Notes                  |
| ------ | ------------- | ---------------------- |
| `0`    | Gender        | (0 = Female, 1 = Male) |
| `1`    | isCharging    |                        |
| `2`    | coloredBorder |                        |
| `3`    | flip          |                        |
| `4`    | isEmoting     |                        |
| `5`    | isGlowing     |                        |
| `6-15` | Reserved      |                        |
