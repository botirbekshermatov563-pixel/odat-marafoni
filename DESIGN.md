---
name: Odat Marafoni
description: A 30-day habit marathon drawn as a night sky in the spirit of Ulug'bek's star table.
colors:
  lapis-night: "#070C1E"
  lapis-plate: "#0F1834"
  lapis-raised: "#172250"
  lapis-sky: "#0A1129"
  lapis-hairline: "#25336A"
  parchment-ink: "#EDE8D8"
  dusk-ink: "#A3ACCB"
  brass-star: "#F2BF5E"
  tile-turquoise: "#46D1BD"
  ember-miss: "#F08A7B"
  paper-ground: "#F1EBDB"
  paper-plate: "#FBF7EC"
  paper-raised: "#E9E1CC"
  paper-sky: "#EDE4CD"
  paper-hairline: "#CFC5A9"
  lapis-ink: "#14204A"
  ochre-star: "#B5730B"
  tile-turquoise-day: "#0B7A70"
typography:
  display:
    fontFamily: "Marcellus, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(26px, 6vw, 36px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Marcellus, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
  star: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.brass-star}"
    textColor: "#241800"
    rounded: "{rounded.md}"
    padding: "11px 18px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.md}"
    padding: "11px 18px"
    height: "44px"
  plate:
    backgroundColor: "{colors.lapis-plate}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.lg}"
    padding: "18px"
  tick-cell:
    backgroundColor: "transparent"
    textColor: "{colors.brass-star}"
    rounded: "{rounded.star}"
    size: "40px"
---

# Design System: Odat Marafoni

## Overview

**Creative North Star: "The Zij Sky"**

The 30-day marathon is not a table of checkmarks but a sky. Each day is a star; ticking a habit lights it, a perfect day becomes an eight-pointed rosette, and consecutive perfect days are joined into a constellation. The system borrows the calm authority of Ulug'bek's astronomical tables: hairline plates, registration marks at the corners, inscriptional capitals over a quiet sans, brass on lapis.

Dark is the default scene (a phone in a dim room, evening, the last tick of the day); the light theme is the same chart printed on warm paper with lapis ink and ochre stars. Density is low and unhurried outside the tick grid, which stays large and precise because tapping it is the product's core action.

**Key Characteristics:**
- One star form only: the eight-pointed rosette (two overlapping squares). Partial days are plain discs sized by completion.
- Color is committed, not sprinkled: brass means done, turquoise means now, ember means missed.
- Plates are flat, outlined by a 1px hairline, with two small brass registration corners.
- Icons are drawn in a single 1.6px stroke; emoji appear only as user-chosen habit glyphs.

## Colors

A lapis night with brass stars and one turquoise tile accent; the day theme inverts the ground to parchment and swaps stars to ochre.

### Primary
- **Brass Star** (#F2BF5E; day: Ochre Star #B5730B): completed habits and days, primary buttons, level badge, section icons, progress fills. Never used for text on light grounds below 3:1.
- **Tile Turquoise** (#46D1BD; day: #0B7A70): "today" only: the marching-ants underline on the current column, the ring around today's star, focus rings, links, caret.

### Neutral
- **Lapis Night** (#070C1E) page ground with a static star-dust field; **Lapis Plate** (#0F1834) for panels; **Lapis Sky** (#0A1129) for the sky chart and the tick grid bed; **Lapis Raised** (#172250) for pills and quiet fills; **Lapis Hairline** (#25336A) for 1px rules.
- **Parchment Ink** (#EDE8D8) body text; **Dusk Ink** (#A3ACCB) secondary text (7:1 on plates).
- Day theme: Paper Ground (#F1EBDB), Paper Plate (#FBF7EC), Paper Sky (#EDE4CD), Paper Hairline (#CFC5A9), Lapis Ink (#14204A) text.

### Semantic
- **Ember Miss** (#F08A7B; day #B23F2E): missed days only, always as a dotted outline, never a fill.

### Named Rules
**The One Meaning Per Color Rule.** Brass = achieved, turquoise = now, ember = missed. Do not reuse them decoratively.
**The Dusk Ink Floor Rule.** Secondary text is never dimmer than Dusk Ink; it stays at 4.5:1 or better on its plate.

## Typography

**Display Font:** Marcellus (Iowan Old Style, Palatino, Georgia fallback)
**Body Font:** Figtree (system-ui fallback), tabular numerals throughout

**Character:** An inscriptional serif for names and numbers gives the chart a manuscript voice; a friendly geometric sans keeps forms and Uzbek copy easy to read at phone size.

### Hierarchy
- **Display** (400, clamp(26px, 6vw, 36px), 1.05): the "Odat Marafoni" title only.
- **Headline** (400, 20px, 1.2): every section heading, always preceded by its drawn icon in brass.
- **Title** (400, 16-19px): level name, goal titles, archive ranges, big readout values (24px).
- **Body** (400, 15px, 1.5): copy and inputs; journal text capped at 70ch.
- **Label** (600, 12-13px): pills, hints, table headers; never uppercase, never tracked.

### Named Rules
**The Tabular Rule.** Every number that can change (percentages, streaks, dates, timers) uses tabular figures so columns and counters do not jitter.

## Layout

A single centered column (max 980px) of plates separated by 20px. The sky plate leads: a full-width chart with a four-cell readout row (two by two on phones). The tick grid is a horizontally scrolling table with a sticky habit column (150px on phones, up to 210px wider) and 44px day columns, auto-scrolled so today sits just after the sticky column. The sky chart has two layouts chosen by container width (under 600px): one wavy ecliptic on wide screens, a three-row serpentine on phones. Touch targets are at least 36px, the tick buttons 40px.

## Elevation & Depth

Flat by default; there are no shadows. Depth is tonal (page, plate, sky bed) plus 1px hairlines. Corner registration marks (9px brass L-shapes at top-left and bottom-right) stand in for elevation on every plate.

### Named Rules
**The Hairline-Or-Shadow Rule.** A plate is defined by its 1px hairline; it never also carries a diffuse shadow.

## Shapes

Plates 14px, buttons and fields 10px, pills fully round, tick cells and icon buttons perfect circles. The rosette star (two rotated squares) is the only decorative geometry.

## Components

### Buttons
- **Shape:** 10px radius, 44px minimum height (38px small).
- **Primary:** Brass fill, near-black warm ink (#241800), 700 weight; presses down to 97% scale.
- **Ghost:** transparent with a Line Strong outline; hover shifts outline and text to brass.

### Tick cell (signature)
A 40px circle in the grid. Empty is a dashed outline; done is a solid brass rosette that ignites (scale and turn, 0.55s, exponential ease-out) only on the cell just tapped; missed past days are dotted ember; future days are disabled at 30% opacity.

### Sky chart (signature)
Thirty stars along a dashed guide. Future days are dots, partial days are discs sized by completion, perfect days are rosettes joined by brass lines when consecutive; today has a turquoise dashed ring that marches.

### Cards / Containers
Plates: Lapis Plate background, 1px hairline, 14px radius, 18px padding, brass registration corners. Goals inside a plate are separated by hairlines, never nested boxes.

### Inputs / Fields
Ground-colored fields with a 1px hairline and 10px radius; focus turns the border turquoise with a 3px soft turquoise halo.

### Navigation
None beyond scroll; the title bar carries day and date pills, level badge (a brass rosette holding the level number) and a theme toggle drawn as sun, moon or half-disc.

## Do's and Don'ts

### Do:
- **Do** keep every measurement of progress expressed as stars: rosette = perfect, disc = partial, dot = future.
- **Do** author new icons on the 24px grid with a 1.6px round stroke.
- **Do** keep tap targets at 36px or larger and tick cells at 40px.

### Don't:
- **Don't** introduce a second star shape, gradient text, glass, or glowing halos.
- **Don't** use ember for anything but a missed day, or turquoise for anything but "now" and focus.
- **Don't** use emoji as interface icons; they belong only to user-chosen habit glyphs.
