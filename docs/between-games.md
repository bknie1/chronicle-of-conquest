# Between games

A design note, not a plan. Captured from a conversation on 2026-09-25 so the
idea is not lost; nothing here is built.

## The problem it answers

The map only moves when two people put models on a table. Between game
nights it is a record, and a record does not give anyone a reason to open it.
The store sees the campaign one evening a week.

## The idea

Give players something to *do* on the map between games that can change the
landscape without a battle, and that another player can notice and respond to.

**Caravans.** A player with a hold takes a mercantile objective: send a caravan
from one place they hold to another. It travels along the road graph at some
rate — a place a day, say — and when it arrives both ends gain a mutual boon
of influence. The reward is slow and shared, so it rewards patience and
alliances, not clicking.

**Interception.** A caravan is visible on the map to anyone who looks. If it
crosses a place where its owner's influence is thin, another player who is
paying attention can lay an ambush there: a challenge is raised, the caravan
is halted, and the next game between those two decides whether it gets
through. That is the whole loop — the map creates a reason for a battle rather
than only recording one.

**Council and intrigue.** Alongside trade, a lighter layer: votes among the
organisers' council on things that change the rules for a season — a tithe on
a region, a truce at a realmgate, an edict that doubles a place's value. Game
of Thrones rather than Diplomacy: few, consequential, public.

## What already exists to build on

- The road graph (`buildSettingGraph`) already knows every place's neighbours,
  so a route is a shortest path over it.
- Influence per place is recomputed from events (`computeInfluence`), so a
  caravan's boon is one more event kind, not new state.
- Decrees are the precedent for influence that arrives without a battle.
- Challenges are the precedent for "two players have agreed to a fight here".

## Not yet decided

Whether caravans are per army or per faction; how a thin-influence threshold
is set; whether interception costs the ambusher anything if they lose; what
the council is for in a two-player campaign. Low priority until the map
itself is done.
