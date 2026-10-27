---
name: party
description: Party games for one table, framed as bingo night in a community hall; each game keeps its own world inside the frame.
colors:
  sheet: '#d2f54a'
  sheet-deep: '#b6dc22'
  cell: '#f2fcc6'
  print: '#2e1a5e'
  print-soft: '#4f3f86'
  frame-ink-soft-hub: '#c5bde4'
  dab: '#e5007d'
  dab-deep: '#a8005c'
  ball: '#ffffff'
  ball-b: '#1f5fd6'
  ball-i: '#d62f2f'
  ball-n: '#2e1a5e'
  ball-g: '#138a4b'
  ball-o: '#e8710f'
  wrong: '#a3002a'
  oilcloth: '#d9662b'
  oilcloth-deep: '#b9501c'
  band: '#3b2418'
  band-ink: '#fbefd9'
  band-ink-soft: '#e2c9a6'
  card: '#fffdf8'
  card-edge: '#b9ab97'
  card-ink: '#1e1a17'
  card-red: '#c3272b'
  paper: '#fbf6e9'
  paper-rule: '#a9c4d9'
  paper-margin: '#e07a6e'
  pencil: '#45444c'
  saucer: '#f7f1e6'
  turn: '#f2c14e'
  backing: '#1d2a4d'
  backing-deep: '#141e3a'
  label-cloth: '#f1e6d2'
  label-bright: '#fffaf0'
  label-ink: '#1d2a4d'
  label-ink-soft: '#4a5577'
  quilt-ink: '#f4ecdd'
  quilt-ink-soft: '#c3c9de'
  pin: '#c99d3e'
  fabric-0: '#cf3f34'
  fabric-1: '#e0a22a'
  fabric-2: '#23928a'
  fabric-3: '#de6a9b'
  thread-0: '#ff7c6b'
  thread-1: '#ffcb4f'
  thread-2: '#58d6c8'
  thread-3: '#ff9fc8'
typography:
  display:
    fontFamily: 'League Gothic, Hanken Grotesk Variable, sans-serif'
    fontSize: '4.5rem'
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: '0.02em'
  headline:
    fontFamily: 'League Gothic, Hanken Grotesk Variable, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: '0.02em'
  title:
    fontFamily: 'League Gothic, Hanken Grotesk Variable, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: '0.02em'
  body:
    fontFamily: 'Hanken Grotesk Variable, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Hanken Grotesk Variable, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 700
    lineHeight: 1.43
  hartenjagen-lettered:
    fontFamily: 'Shrikhand, Albert Sans Variable, serif'
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: '-0.01em'
  hartenjagen-kitchen:
    fontFamily: 'Albert Sans Variable, system-ui, sans-serif'
  hartenjagen-pencil:
    fontFamily: 'Gochi Hand, Albert Sans Variable, cursive'
    fontFeature: 'tnum'
  quilt-display:
    fontFamily: 'Bricolage Grotesque Variable, Atkinson Hyperlegible, sans-serif'
  quilt-body:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
rounded:
  cell: '0.35rem'
  card: '0.45rem'
  full: '9999px'
spacing:
  xs: '0.375rem'
  sm: '0.5rem'
  md: '0.75rem'
  lg: '1rem'
  xl: '1.5rem'
  sheet-grid: '2.5rem'
components:
  button-plate:
    backgroundColor: '{colors.print}'
    textColor: '{colors.sheet}'
    typography: '{typography.title}'
    rounded: '{rounded.cell}'
    padding: '0.75rem 1.5rem 0.625rem'
  button-quiet:
    backgroundColor: 'transparent'
    textColor: '{colors.print}'
    typography: '{typography.body}'
    rounded: '{rounded.cell}'
    padding: '0.625rem 1rem'
  button-bar:
    backgroundColor: 'transparent'
    textColor: '{colors.sheet}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '0.375rem 0.75rem'
  text-field:
    backgroundColor: '{colors.ball}'
    textColor: '{colors.print}'
    rounded: '{rounded.cell}'
    padding: '0.625rem 0.75rem'
  text-field-code:
    backgroundColor: '{colors.ball}'
    textColor: '{colors.print}'
    typography: '{typography.display}'
    rounded: '{rounded.cell}'
    padding: '0.375rem 0.75rem'
  choice-cell:
    backgroundColor: '{colors.ball}'
    textColor: '{colors.print}'
    typography: '{typography.title}'
    rounded: '{rounded.cell}'
    height: '3.5rem'
  players-card:
    backgroundColor: '{colors.cell}'
    rounded: '{rounded.cell}'
    padding: '0.375rem'
  ground-note:
    backgroundColor: '{colors.cell}'
    textColor: '{colors.print}'
    rounded: '{rounded.cell}'
    padding: '0.25rem 0.75rem'
  bar:
    backgroundColor: '{colors.print}'
    textColor: '{colors.sheet}'
    padding: '0.5rem 0.75rem'
---

# Design System: party

## Overview

**Creative North Star: "Bingo Night at the Community Hall"**

The hub is a bingo session in a village hall: the whole page is a fluorescent lime bingo sheet with a faint printed grid, everything is printed on it in deep violet card ink, room codes are called balls with a coloured band, the people in a room are cells on a bingo card, and "you", "in" and "chosen" are marked with a translucent magenta dauber. It is loud, cheap-paper cheerful and very legible at arm's length and across a room: big condensed capitals for everything that is read out or tapped, a plain grotesque for everything else.

The hub is a frame, not the room. Its shapes (the bar, the balls, the card cells, the plate, the dab) stay the same on every screen, but inside a game they take that game's colours from a set of frame tokens the game's world sets under `.world-<id>`. Hartenjagen fills the frame with a 1970s kitchen table (orange oilcloth, real playing cards, a pencilled notepad, coffee saucers); dots and boxes fills it with a patchwork quilt (indigo backing cloth, brass pins, cotton prints, a thread colour and stitch per seat). Each game world is a sub-system with its own tokens and faces; the hub never borrows them, and they never borrow the hub's lime or magenta.

The build refuses the dark neon game-night dashboard and the four-shape quiz look.

**Key Characteristics:**

- One full-bleed ground per screen: the bingo sheet in the hub, the game's cloth inside a game.
- Codes as called balls: white face, coloured band per bingo column (B, I, N, G, O), League Gothic letter.
- Bingo-card cells for seats and choices; the dauber dab marks the ones that are yours, in, or picked.
- One solid reversed plate per screen for the thing to do now; everything else is a printed outline.
- A fixed frame contract of twelve colour tokens that every game world must set.

## Colors

A fluorescent lime ground printed in one violet ink, with a magenta dauber and five ball-band colours as the only other hues in the hub; each game world swaps in its own complete palette through the frame tokens.

### Primary

- **Card-Print Violet** (`print`): all hub text, the bar, the grid rules on the sheet, the reversed plate. The hub's one ink.
- **Bingo-Sheet Lime** (`sheet`): the hub ground, and the ink on the violet bar and plate. `sheet-deep` is its darker press.

### Secondary

- **Dauber Magenta** (`dab`): the dab itself, text selection, the input caret, the hub's focus ring. Only for "this one is yours / in / chosen", never decoration. `dab-deep` is its darker press.

### Tertiary

- **Ball Bands** (`ball-b` blue, `ball-i` red, `ball-n` violet, `ball-g` green, `ball-o` orange): the band round each called ball, taken in bingo-column order and round again. Used nowhere else.

### Neutral

- **Ball White** (`ball`): the ball face, input and card-cell fill in the hub.
- **Sheet Cell** (`cell`): the pale lime panel (players card, settings, ground-notes).
- **Soft Print** (`print-soft`): secondary text on the sheet.
- **Bar Lilac** (`frame-ink-soft-hub`, `#c5bde4` in the source as `--color-frame-ink-soft`): quiet text and the unpressed language tab on the violet bar.
- **Wrong Crimson** (`wrong`): field errors and failed actions only.

### The frame contract

Every screen is drawn from these tokens, never from a world's raw names. The hub sets them in `@theme`; each game sets all twelve under `.world-<id>`.

| Token             | Used for                                                      | Hub        | Hartenjagen   | Dots and boxes |
| ----------------- | ------------------------------------------------------------- | ---------- | ------------- | -------------- |
| `frame`           | the bar along the top; the player-count pill on a shelf sheet | print      | band          | backing-deep   |
| `frame-ink`       | text and outlines on the bar; pressed language tab            | sheet      | band-ink      | label-cloth    |
| `frame-ink-soft`  | quiet text on the bar; reconnecting dot                       | `#c5bde4`  | band-ink-soft | quilt-ink-soft |
| `frame-ground`    | the full-bleed page ground (body, shelf sheet, dialog paper)  | sheet      | oilcloth      | backing        |
| `frame-on-ground` | text and quiet-button outlines set straight on the ground     | print      | band          | quilt-ink      |
| `frame-panel`     | panels on the ground: players card, settings box, ground-note | cell       | paper         | label-cloth    |
| `frame-text`      | text inside panels, fields and cells                          | print      | band          | label-ink      |
| `frame-text-soft` | secondary text in panels; FREE cells; placeholders            | print-soft | pencil        | label-ink-soft |
| `frame-cell`      | card cells, choice cells, input fill                          | ball       | saucer        | label-bright   |
| `frame-mark`      | the dab, focus ring, field focus border, connected dot        | dab        | card-red      | thread-1       |
| `frame-plate`     | the one reversed plate                                        | print      | band          | fabric-1       |
| `frame-plate-ink` | text on the plate                                             | sheet      | band-ink      | label-ink      |

### Hartenjagen: the kitchen table

- **Oilcloth Orange** (`oilcloth`, `oilcloth-deep`) is the table ground; its flower print uses `petal-brown #5a3420`, `petal-gold #f2c14e`, `petal-ember #b8451a`, `petal-cream #f3dcb8` and `leaf #7f8f2e`.
- **Coffee Band** (`band`, `band-ink`, `band-ink-soft`) is the bar, the plate and all text on the cloth.
- **Real Cards** (`card`, `card-edge`, `card-ink`, `card-red`): card face, edge, black suits, red suits. Card red is the world's mark.
- **Notepad** (`paper`, `paper-rule`, `paper-margin`, `pencil`, `pencil-soft #6e6c74`): the score pad and panels, blue rules, red margin, pencil text.
- **Saucer** (`saucer`, `saucer-rim #e4d8c4`) for seat places and cells; **Turn Gold** (`turn`) for the "your turn" pill.

### Dots and boxes: the quilt

- **Indigo Backing** (`backing`, `backing-deep`): the cloth ground (with a fine plain-weave texture) and the bar.
- **Woven Label** (`label-cloth`, `label-bright`, `label-ink`, `label-ink-soft`): panels, cells and their text.
- **Quilt Ink** (`quilt-ink`, `quilt-ink-soft`): text straight on the backing.
- **Brass Pins** (`pin`, `pin-shine #f6dc93`): the dots.
- **Fabric prints** (`fabric-0..3`) and **threads** (`thread-0..3`): one fabric and one thread per seat. `fabric-1` mustard is the plate; `thread-1` is the mark.

### Named Rules

**The One Ink Rule.** The hub prints in violet only. Magenta is the dauber, the band colours are the balls; neither is used as a second text or surface colour.

**The Frame Token Rule.** Shared components (bar, balls, cells, fields, buttons, notes) read `--color-frame-*` only. A new game world must set all twelve tokens under its `.world-<id>` class, or the frame will show the hub's lime through it.

**The Colour Is Never Alone Rule.** No seat, turn or state is told by colour only. On the quilt each seat has its own fabric print (0 gingham wash, 1 polka dot, 2 stripe, 3 star) and its own stitch dash (`9 5`, `3 4`, `14 4 3 4`, `6 3 1 3`); the turn is also written out in words; the connection dot also says "reconnecting" in text.

## Typography

**Display Font:** League Gothic (with Hanken Grotesk Variable, sans-serif)
**Body Font:** Hanken Grotesk Variable (with system-ui, sans-serif)

**Character:** League Gothic is the bingo caller's register: tall, tight, uppercase capitals for numbers, codes, names on cells, headings and the plate. Hanken Grotesk carries all running text in a plain, friendly grotesque.

### Hierarchy

- **Display** (400, 3.75rem to 4.5rem, 0.95, 0.02em, uppercase): the page heading on the shelf; code letters in the code field (3rem, 0.35em tracking); balls scale from 1.125rem (bar) to `min(21vh, 10.5vw, 13rem)` (table screen).
- **Headline** (400, 2.25rem, 0.95, uppercase): section and dialog titles, the code-field label, game names on shelf sheets (3rem).
- **Title** (400, 1.875rem, 0.95, uppercase): the plate's text, choice cells, seat names (1.5rem on phones, 3rem on the table screen).
- **Body** (400 to 600, 1rem, 1.5): hints, the shelf pitch (max-width 65ch), tagline (0.875rem semibold).
- **Label** (700, 0.875rem): field and group labels; bar text and the player-count pill at 0.75rem bold.

All the display register comes from one utility (League Gothic, 400, uppercase, 0.02em, line-height 0.95); counts use tabular figures.

### Game faces

- **Hartenjagen:** Shrikhand lettering (400, 1.05, -0.01em) for card corners, headings and the turn pill; Albert Sans for kitchen text; Gochi Hand with tabular figures for the pencilled score pad.
- **Dots and boxes:** Bricolage Grotesque for headings and scores; Atkinson Hyperlegible for body text.

### Named Rules

**The Called Register Rule.** Anything read out loud or tapped as a choice (codes, names, numbers, the plate) is set in the display register; anything read as a sentence is set in the body face.

## Layout

Mobile first from 360 px. The hub page is a single column (`max-width 64rem`, 1rem side padding, 1.5rem top); at 1024 px it becomes two columns, the shelf leading and a 22rem join column on the right. On phones the join-by-code field comes first, above the shelf. The shelf is an auto-fill grid of sheets at least 17rem wide with 0.75rem gaps. The lobby stacks the code, the players card, settings and the plate with 1.25rem to 2rem gaps; on the table screen the balls go huge with the QR beside them and the players card runs as one row of large cells. The sheet ground carries a 2.5rem printed grid. Spacing follows the 4 px Tailwind scale; panels pad 1rem, cells sit 0.375rem apart inside the card.

## Elevation & Depth

Physical, low and warm: everything sits on a paper or cloth ground and casts a small soft shadow in the ground's own ink colour, never black. The hub uses two shadows; each world brings its own.

### Shadow Vocabulary

- **Sheet** (`box-shadow: 0 2px 4px rgb(46 26 94 / 0.16), 0 10px 24px rgb(46 26 94 / 0.14)`): plates, panels, shelf sheets, dialogs.
- **Ball** (`box-shadow: inset -3px -4px 6px rgb(46 26 94 / 0.18), 0 2px 3px rgb(46 26 94 / 0.25)`): the round of a called ball.
- **Card** (hartenjagen, `0 2px 3px rgb(58 30 12 / 0.28), 0 6px 14px rgb(58 30 12 / 0.18)`), **Lifted** (`0 6px 10px rgb(58 30 12 / 0.3), 0 14px 26px rgb(58 30 12 / 0.22)`), **Paper** (`0 3px 6px rgb(58 30 12 / 0.3), 0 12px 30px rgb(58 30 12 / 0.2)`).
- **Quilt drop shadows** (SVG `drop-shadow`, `rgb(8 12 28 / 0.45-0.55)`): patches, pins, the last-move tag.

### Named Rules

**The Tinted Shadow Rule.** Shadows are tinted, never black or grey: the frame's shared pieces cast violet, a world's own objects cast that world's dark ink (coffee brown under cards and the notepad, night indigo under patches and pins).

## Shapes

Small paper corners throughout: cells, fields, panels, plates and sheets share one radius (`rounded.cell`); cells inside a card take that radius minus 2px. Balls, the bar buttons, pills and the language switch are fully round. Playing cards use `rounded.card`. The dab is a deliberately lumpy SVG ink blot, never a clean circle. Quiet controls are inset 2px rings; bar controls are 1px rings.

## Components

### Buttons

- **Shape:** paper corner (0.35rem); bar buttons fully round.
- **Plate:** solid `frame-plate` with `frame-plate-ink`, display register at 1.875rem, sheet shadow, lifts 1px on hover. One per screen: Join, Start, Open on this phone, the confirm action.
- **Quiet:** transparent with a 2px inset ring in `frame-on-ground` at 70%, bold body text; hover tints the ground 10% and firms the ring.
- **Bar:** small, round, 1px `frame-ink` ring at 50%, inside the bar only.
- **Focus:** a 3px `frame-mark` outline, 2px offset, on everything. Disabled at 45% opacity.

### Inputs / Fields

- **Style:** `frame-cell` fill, 2px `frame-text` border at 70%, paper corner, bold small label above.
- **Code size:** centred display letters at 3rem with 0.35em tracking, like four called balls, the label in the headline register.
- **Focus:** the border turns `frame-mark`. **Error:** border and message in `wrong`.

### Choice cells

A row of bingo-card cells (3.5rem tall, display register), 2px inset ring; the picked one gets a dab (mark at 35%, multiply) and a firm ring.

### Players card

A `frame-panel` card holding one cell per seat: joined players carry a dab and their name in the display register (with "you" or "away" beneath), empty seats read FREE in `frame-text-soft`. Two to a row on phones, one row on the table screen.

### Called balls (signature)

White face, coloured band by bingo column, ball shadow, in four sizes (bar, small, big, huge). On first show in the lobby they roll in one after another, 90ms apart.

### Dauber dab (signature)

A translucent lumpy ink blot in `frame-mark` at 80%, multiply blend, that lands once when it first appears (on joining, on picking): it presses in at 1.35x with a 2px blur and soaks back to size over 420ms. On the shelf it stays hub magenta in plain blend, since the sheets beneath are dark or saturated. Never on hover.

### Bar

The frame's bar across the top in `frame`/`frame-ink`: the name or room code as bar-size balls, the game name in the display register on wider screens, a connection dot, the EN/NL switch.

### Shelf sheet

Each game as a sheet printed in its own world: the game's `.world-<id>` on the link, its ground, its name in the display register, a tagline, a player-count pill in `frame`, and the game's emblem; lifts 2px on hover, dabbed on pick.

### Ground-note

A short line set on any ground (hub sheet, oilcloth, quilt) sits on a small `frame-panel` panel at 92%, paper corner, 0.25rem by 0.75rem padding, so it reads over any print.

### Sheet and confirm dialog

Bingo-sheet paper with the printed grid, sheet shadow, violet backdrop at 50-55%, title in the headline register. The confirm dialog pairs a quiet Cancel with a plate that names the action.

## Do's and Don'ts

### Do:

- **Do** read every shared colour from the `--color-frame-*` tokens and set all twelve in a new game's `.world-<id>`.
- **Do** keep exactly one plate per screen; everything else is quiet.
- **Do** put any short line that sits straight on a ground on a ground-note panel.
- **Do** give every seat a second signal beside colour: a print, a stitch pattern, a name, or words.
- **Do** set codes, names on cells, numbers and the plate in the display register, with tabular figures for counts.
- **Do** keep motion to one-shot physical events (dab 420ms, ball roll 520ms, card land 380ms, stitch pull 420ms, patch 520ms) on `cubic-bezier(0.16, 1, 0.3, 1)`, and let reduced motion cut every animation and transition to 1ms.

### Don't:

- **Don't** use the dab on hover or as decoration; it marks yours, in or chosen, once.
- **Don't** let the hub borrow oilcloth, cards, notepad or quilt, or a game borrow the hub's lime and magenta.
- **Don't** add a second solid plate or a filled secondary button beside the plate.
- **Don't** cast black or grey shadows; tint them violet on frame pieces and in the world's own ink on its objects.
