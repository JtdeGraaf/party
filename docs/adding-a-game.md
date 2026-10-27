# Adding a game

A game is one folder, `src/games/<id>/`, and a handful of one-line registrations. The room never learns what the game
is: it seats people, passes moves in, stores the state, runs wake-ups and hands out views. Turns, cards, boards,
scores, timers and secrets are the game's.

## 1. The rules (`rules/`, runs on the server)

Write the game as pure TypeScript and implement `GameRules` from `src/party/game-rules.ts`:

- `players: { min, max }`, `joinsMidGame` (and `seatAdded` when true).
- `settingsSchema` + `defaultSettings`, `moveSchema`, `stateSchema`, `viewSchema`: Zod schemas for everything that
  crosses the wire or sits in storage. State is plain JSON with a `stateVersion`.
- `start({ seats, settings, gameNumber, random, now })` and `move(state, { seat, move, random, now })` return
  `{ state, wakeAt? }`, or `{ problem }` with one of the game's own problem codes.
- `wake(state, …)` when the game asked for a wake-up (countdowns, reveals, an automatic next round).
- `view(state, viewer)` for `{ as: 'table' }`, `{ as: 'seat', seat }` and `{ as: 'watcher' }`. **Whatever isn't in
  a view never leaves the server**, so leave out every other seat's secrets, and the table screen's view holds none.
- `isOver(state)`.

Randomness and time are injected: use `random.below(n)` (or `shuffled`) and `now`, never `Math.random()` or
`Date.now()`.

Rules must not import React, the browser, or another game. `src/test/boundaries.test.ts` checks.

## 2. Tests

- Unit tests for the rules themselves.
- `describeGameRules(rules, { settings, pickMove })` from `src/test/game-contract.ts`: it starts the game for every
  player count, checks state survives storage, builds every kind of view, refuses seats that don't exist, and plays
  random legal games to the end with your `pickMove`.
- A test that a seat's view never contains another seat's secrets, and the table's view none.

## 3. Screens

Export a `GameScreens` (see `src/games/game-screens.ts`) from `<id>-screens.ts`:

- `Phone` (required) gets `{ room, gameView, hasTableScreen, sendMove }`. Parse `gameView` with your `viewSchema`.
  Phones only: show the private part and a compact table. With `hasTableScreen`, show only the private part.
- `Table` (optional) for a landscape TV read from across the room. Without it, the table screen shows `Phone` as a
  watcher sees it.
- `Rules`, `Emblem` (a small drawing for the shelf), `Settings` (optional), `Backdrop` (optional, drawn behind the
  whole room), `worldClass`.

## 4. The world

Every game gets its own visual world inside the hub's bingo-night frame. Check `~/.claude/ship-app/design-log.md` and
pick something nothing there uses (Impeccable's new-work flow), then write `theme.css`:

- `@theme` with the game's own named tokens (prefix them if they could clash with the hub's or another game's).
- `.world-<id> { --color-frame…: …; }` setting every frame token from `src/styles.css`, so the bar, the lobby, the
  players card and the start plate take on the game's colours. Check text on `--color-frame-ground` and on the panel
  for contrast; short lines on the ground use the `ground-note` utility.

Import it at the top of `src/styles.css`. Fonts go in `src/main.tsx` (fontsource; the files only load when used).

## 5. Translations

`i18n/en.json` and `i18n/nl.json` in the game folder, with at least `meta.name`, `meta.tagline` and `errors.<code>`
for every problem code. Register both in `src/i18n/resources.ts` and add the problem-code check to
`src/i18n/i18n.test.ts`. Use `useTranslation('<id>')` in the game's components.

## 6. Register

- `src/games/rules-registry.ts`: the rules (the Worker imports this).
- `src/games/screens-registry.ts`: the screens (the app imports this; the order is the shelf's order).

No new routes: `/<id>`, `/room/$code` and `/table/$code` work for every game.

## 7. Check it with several phones

`npm run build && npx wrangler dev`, then open phones on `localhost`, `127.0.0.1`, `a.localhost`, `b.localhost` … (each
has its own storage) and one more origin as the table screen. Play a whole game phones-only and once with the table
screen, reload a phone mid-game, and restart `wrangler dev` once: every phone must come back to its seat.
