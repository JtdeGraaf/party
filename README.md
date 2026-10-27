> [!WARNING]
> **🤖 One-prompt app — please ignore the code.**
> This entire project — idea, design, code, GitHub repo, and Cloudflare deployment — was generated and shipped by [Claude Code](https://claude.com/claude-code) from a **single prompt**, in a **single run**. No human wrote or reviewed this code. It is not an example of how I write software; judge the idea, not the implementation.
>
> **The prompt:** "Ok good I want to also offer like a kahoot sort of experience where the host machine just shows the table. And the clients can all connect through their phones and only have the deck of card from the player. … remember that the room server is optional, people should also be able to play through their phones alone"

# Party

**Live:** https://party.graaf.dev

Party games for one table. One person picks a game and opens a room; the others scan the QR code or type four
letters and their name. Everyone plays on their own phone. If there's a TV or laptop around, it can show the table
instead, Kahoot-style, and the phones then show only each player's own cards. In English and Dutch.

The hub looks like bingo night in a community hall: the room code is four called balls, the people in the room are
cells on a bingo card, and a dauber dab lands on your cell when you join. Each game keeps its own world inside that
frame.

## Games

- **Hartenjagen** (Dutch Hearts, Jt's house rules), 4 or 5 players, at a 1970s kitchen table under oilcloth. 32 cards,
  7 to ace. With 5 players the 2 cards left over are the stok, which goes to whoever takes the first trick. Hearts are 1
  point, the queen of spades 5, the jack of clubs 2. Scores count up until someone reaches 50, then count down; the
  first to reach 0 wins. Take all 15 in one hand and everyone else gets them.
- **Dots and boxes** (Kamertje verhuren), 2 to 4 players, sewn as a patchwork quilt. 3×3, 4×4 or 5×5.

## Two ways to play

- **Phones only:** each phone shows your own part (your hand) and a compact table: the others, the trick or the board,
  whose turn it is, the score.
- **With a table screen:** open the room with "Use this screen as the table" on a TV or laptop. It shows the code and QR
  code, who's in, the table and the score. Phones then show only your own part. A table screen can join or leave any
  time; the phones switch on their own.

## Hidden cards are hidden

Each room is one Cloudflare Durable Object that deals, checks every move against the rules and sends every connection
only what it may see: a phone gets its own hand and the shared table, the table screen gets the table and nobody's
cards. A phone gets back into its seat with a token it keeps in localStorage, so a locked or reloaded phone picks up
where it was.

What it doesn't do: there are no accounts. Anyone with a room's code can join its lobby or watch a game in it. The
server can read rooms, and they are thrown away after 12 hours without activity. The only personal data is the first
name each player types.

## How it's built

- `src/party/`: the room's rules in plain TypeScript (codes, messages, seating, views) and the `GameRules` interface
  every game implements. Nothing in it knows about turns or cards.
- `server/`: the room server, behind small hosting interfaces (storage, wake-ups, connections). No Cloudflare code.
- `worker/`: the Cloudflare side: the Worker and the room's Durable Object.
- `src/games/<game>/`: one folder per game: its rules (run on the server), its phone and table screens, its theme and
  its translations. See [docs/adding-a-game.md](docs/adding-a-game.md).

## Running it

```bash
npm install
npm test
npm run build && npx wrangler dev    # the site and the room server; open it on localhost, 127.0.0.1, a.localhost … as several phones
npm run deploy                       # build and deploy to Cloudflare
```

Pushes to `main` deploy automatically through GitHub Actions.
