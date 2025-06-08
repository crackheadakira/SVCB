# _.STDEW_ Specification

## Table of Contents

-   [Overview](#overview)
-   [Save Game Info Layout](#save-game-info-layout)
-   [Flags Layout](#flags-layout)
-   [Skill Layout](#skill-layout)
-   [Record Layout](#record-layout)
-   [String Layout](#string-layout)
-   [Dialogue Event Layout](#dialogue-event-layout)
-   [First Visit Layout](#first-visit-layout)

## Overview

This specification outlines the structure and binary format used to serialize and deserialize save data from Stardew Valley into a compact binary format.

All fields up to byte 93 are fixed-size. Data after byte 93 is variable-length and must be parsed sequentially using length prefixes or known field counts.

All numeric fields (`u16`, `u32`, `f32`, etc.) are stored in big-endian format.

### Example .STDEW start

```
0x00: 53 36               ; magic number ("S6")
0x02: 31 2E 36 2E 31 35   ; "1.6.15"
0x08: 00 00 00 00 00 00   ; null padding (8 bytes)
0x0E: 00 00 03 C4         ; data size ("964")
0x12: 4D 6F 72 67 61 6E   ; farmer name ("Morgan")
0x18: 00 00 00 00 00 00   ; null padding (8 bytes)
```

## Save Game Info Layout

| Offset       | Field                            | Type                 | Size        | Notes                                           |
| ------------ | -------------------------------- | -------------------- | ----------- | ----------------------------------------------- |
| 0            | `magic`                          | `u16`                | 2 bytes     | Magic number `0x5336` to validate file          |
| 2            | `version`                        | `string`             | 12 bytes    | E.g. `1.6.15`, null-padded                      |
| 14           | `dataSize`                       | `u32`                | 4 bytes     | How many bytes exist after size                 |
| 18           | `name`                           | `string`             | 12 bytes    | UTF-8, null-padded                              |
| 30           | `farmName`                       | `string`             | 12 bytes    | UTF-8, null-padded                              |
| 42           | `favoriteThing`                  | `string`             | 12 bytes    | UTF-8, null-padded                              |
| 54           | `speed`                          | `u16`                | 2 bytes     |                                                 |
| 56           | `position.x`                     | `u16`                | 2 bytes     | X-coordinate of the farmer in world space       |
| 58           | `position.y`                     | `u16`                | 2 bytes     | Y-coordinate of the farmer in world space       |
| 60           | `calendar.year`                  | `u16`                | 2 bytes     |                                                 |
| 62           | `calendar.season`                | `u2`                 | packed bits |                                                 |
| 62           | `calendar.dayOfMonth`            | `u5`                 | packed bits |                                                 |
| 62           | `padding`                        | `u1` (pad)           | packed bits |                                                 |
| 63           | `facing`                         | `u8`                 | 1 bytes     | Should be an `u2` in the future                 |
| 64           | `currentEmote`                   | `u8`                 | 1 bytes     |                                                 |
| 65           | `glowTransparency`               | `f32`                | 4 bytes     |                                                 |
| 69           | `glowRate`                       | `f32`                | 4 bytes     |                                                 |
| 73           | `flags`                          | `u16`                | 2 bytes     | [Flags Layout](#flags-layout)                   |
| 75           | `skills.farming`                 | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 78           | `skills.fishing`                 | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 81           | `skills.foraging`                | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 84           | `skills.mining`                  | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 87           | `skills.combat`                  | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 90           | `skills.luck`                    | `u8 level + u16 exp` | 3 bytes     |                                                 |
| 93           | --- START OF VARIABLE REGION --- |                      |             |                                                 |
| 93           | `activeDialogueEvents`           | `event`              | variable    | [Dialogue Event Layout](#dialogue-event-layout) |
| ...          | `previousActiveDialogueEvents`   | `event`              | variable    | [Dialogue Event Layout](#dialogue-event-layout) |
| dataSize     | `stringTable.length`             | `u16`                | 2 bytes     |                                                 |
| dataSize + 2 | `stringTable`                    | stream of `u8`       | variable    | Contains the data pointed to by BinaryString    |

Fixed byte size:

-   All fields before `activeDialogueEvents` = 93 bytes
-   Additional variable-length fields follow

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

### Example

If `flags = 0b00110101`:

-   Gender = 1 (Male)
-   isCharging = 0
-   coloredBorder = 1
-   flip = 0
-   isEmoting = 1
-   isGlowing = 1

## Record Layout

| Field             | Type          | Notes                               |
| ----------------- | ------------- | ----------------------------------- |
| `totalEntries`    | `u16`         |                                     |
| `entry[i].length` | `u16`         |                                     |
| `entry[i].bytes`  | `variable`    | Preceded by `entry[i].length` (u16) |
| `entry[i].value`  | `u8` or `u16` |                                     |

## String Layout

All strings are UTF-8 encoded and prefixed with a `u16` length. Strings may or may not be null-padded depending on context:

-   Fixed-size fields (e.g., `name`, `farmName`) are right-padded with null bytes (`0x00`) to the defined length.
-   Variable-length strings are length-prefixed only and not padded.

| Field   | Type  | Notes                               |
| ------- | ----- | ----------------------------------- |
| `index` | `u16` | Index to use in string table header |

### String Table

| Field   | Type  | Notes                               |
| ------- | ----- | ----------------------------------- |
| `index` | `u16` | Index to use in string table header |

## Dialogue Event Layout

| Field             | Type  | Notes                                                                                         |
| ----------------- | ----- | --------------------------------------------------------------------------------------------- |
| `totalEvents`     | `u16` |                                                                                               |
| `event[i].type`   | `u8`  | `eventSeen` = 0, `fishCaught`, `questComplete`, `location`, `undergroundMine`, `NPCHouse` = 5 |
| `event[i].memory` | `u2`  | `0` = no event, `1` = day, `2` = week. First 2 bits of byte 1                                 |
| `event[i].value`  | `u6`  | Next 6 bits of byte 1                                                                         |

### First Visit Layout

| Field               | Type             | Notes                                 |
| ------------------- | ---------------- | ------------------------------------- |
| `DialogueEvents`    | `u16`            |                                       |
| `event[i].location` | `string`         | Only on `VisitLocation`               |
| `event[i].mine`     | `u8`             | Only on `undergroundMine`             |
| `event[i].npc`      | `string` or `u8` | Only on `NPCHouse`, undecided on type |
