# Product

<!-- impeccable:product-schema 1 -->

Facts marked _(inferred)_ come from the brief and the two earlier games, not from an interview: Jt delegated product
and design decisions for ship-app runs in advance.

## Platform

web

## Stack

Vite + React + TypeScript on the react-slices stack (TanStack Router, Tailwind v4 + Base UI, i18next en/nl), with one
Cloudflare Worker and a Durable Object per room as the authoritative room server (pinned by ship-app and the brief).
The room server sits behind hosting interfaces so it can move off Cloudflare.

## Users

Jt and his friends, sitting round one table (a kitchen table, a living room, a café), each with a phone in hand.
Sometimes a laptop or TV is at hand and becomes the shared table everyone looks at. Dutch and English speakers. Not
gamers looking for a platform: people who want to play a familiar game together right now, without accounts or an
install.

## Product Purpose

party.graaf.dev is one place for party games played at one table. One person picks a game and opens a room; the others
scan a QR code or type a four-letter code and a name. The room server deals and checks every move, so a phone only
ever holds what its player may see. Success: from "shall we play?" to the first card in under a minute, and a game
nobody can peek at.

## Positioning

Two ways to play, both first-class: phones alone (each phone shows your own hand plus a compact table), or phones plus
a big shared screen (Kahoot-style: the TV shows the table, the phones only your hand). Each game keeps its own world
inside one hub frame. _(inferred)_ The hub is a home for Jt's own house rules (his Dutch Hearts) rather than a catalogue.

## Operating Context

- Phones held in one hand, often in portrait, at arm's length, in mixed light; people look up from them to talk.
- A table screen is read from across a room: a laptop on the table or a TV on the wall, landscape.
- Phones get locked, put down and backgrounded mid-game; they must come back to their seat with the right hand.
- Codes are read out loud across the table, so they have to survive being said and typed.

## Capabilities and Constraints

- Games now: hartenjagen (Jt's Dutch Hearts house rules, 4 or 5 players, with the stok) and dots and boxes (2–4).
  More games will follow; the hub must not assume turns, cards or boards.
- Rooms: 4-letter code, a seat token per phone in localStorage, late joiners watch, rooms expire after 12 hours quiet.
- No accounts, no install, no tracking. Names are the only personal data; the server can read rooms.
- English and Dutch, every string in both.

## Brand Commitments

- The address is party.graaf.dev; it sits among Jt's other one-prompt apps on graaf.dev, each with its own visual world.
- hartenjagen keeps its 1970s oilcloth kitchen table, real cards and pencilled notepad; dots and boxes keeps its
  patchwork quilt. The hub frame must not borrow either world, nor the carnival, blueprint or Japanese mook worlds of
  Jt's other apps.

## Evidence on Hand

The two earlier games and their rules (`apps/hartenjagen`, `apps/dotsandboxes`, live at hartenjagen.graaf.dev and
dotsandboxes.graaf.dev). No users, testimonials or numbers exist; none may be invented.

## Product Principles

- Getting everyone to the table beats everything: big code, QR, one name field, nothing else in the way.
- The server is the dealer. Hidden means hidden, in both ways of playing.
- The hub frames; the game is the room. The frame stays recognisable, each game's world fills it.
- A phone that wandered off comes back to exactly where it was.

## Accessibility & Inclusion

Readable at arm's length and across a room: large type for codes and turns, colour never the only signal of whose
turn it is or which seat is which, works at 360 px wide, respects reduced motion.
