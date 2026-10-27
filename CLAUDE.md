# Party

Vite + React + TypeScript app with one Cloudflare Worker, deployed to https://party.graaf.dev (pushes to main deploy).
A hub for party games at one table: phones only, or phones plus an optional table screen.

Follow the `house-style` and `react-slices` skills from the `graaf` marketplace (JtdeGraaf/agents) in full:
file-based routes, feature slices, Base UI wrappers with Tailwind tokens, all copy in i18n (en + nl, keys in
parity), Zod + react-hook-form, logic in `lib/` with tests.
Verify with `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`.

The room server is authoritative: one Durable Object per room runs the game's rules and sends each connection only
what it may see. Hidden information never goes into a view it doesn't belong in.

- `src/party/` is game-agnostic: room codes, protocol (Zod), the pure room state machine, the `GameRules` interface.
- `server/` runs rooms behind `server/hosting.ts`; `server/in-memory/` is the host the tests use. No Cloudflare here.
- `worker/` is the only Cloudflare code. A boundary test (`src/test/boundaries.test.ts`) keeps it that way, keeps
  `party/` and `components/` free of games, and games out of each other.
- A game is one folder, `src/games/<id>/`, plus a line in `src/games/rules-registry.ts`, `src/games/screens-registry.ts`,
  `src/i18n/resources.ts`, the theme import in `src/styles.css`, and the problem-code check in `src/i18n/i18n.test.ts`.
  Every game runs `describeGameRules` from `src/test/game-contract.ts`. How-to: `docs/adding-a-game.md`.

`npm run build && npx wrangler dev` runs the site and the room server together; open it on `localhost`, `127.0.0.1`,
`a.localhost`, `b.localhost` … to play as several phones, and on one more as the table screen. The visual system is in
DESIGN.md: the hub is bingo night; each game sets the frame's tokens under its `.world-<id>` class.
