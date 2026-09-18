// Turns either the built-in demo or a server campaign into one shape the UI
// understands. Days are counted from local midnight on the campaign's first day.
import { CAMPAIGN, PLAYERS, EVENTS, generateHistory } from './data/demo-campaign.js';

const DAY = 864e5;
const midnight = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d; };

export function demoView(graph, map) {
  return {
    kind: 'demo',
    code: null,
    name: CAMPAIGN.name,
    start: CAMPAIGN.start,
    today: CAMPAIGN.today,
    factions: map.factions,
    players: PLAYERS.map(p => ({ ...p, joinedDay: p.active[0], retired: false })),
    games: generateHistory(graph, map.nodes).map(g => ({ ...g, status: 'confirmed' })),
    events: EVENTS.map(e => ({ ...e })),
    me: null,
    members: [],
  };
}

export function campaignView(payload, map) {
  const start = midnight(payload.campaign.createdAt);
  const dayOf = ms => (ms - start.getTime()) / DAY;
  const me = payload.me && {
    ...payload.me,
    armyIds: new Set(payload.armies.filter(a => a.userId === payload.me.userId && !a.retiredAt).map(a => a.id)),
  };
  return {
    kind: 'campaign',
    code: payload.campaign.code,
    name: payload.campaign.name,
    start,
    today: dayOf(Date.now()),
    factions: map.factions,
    players: payload.armies.map(a => ({
      id: a.id, userId: a.userId, name: a.playerName, army: a.name, faction: a.faction,
      joinedDay: dayOf(a.createdAt), retired: !!a.retiredAt,
    })),
    games: payload.games.map(g => ({
      id: g.id, day: dayOf(g.playedAt), node: g.node, winner: g.winner, loser: g.loser,
      status: g.status, reportedBy: g.reportedBy, confirmer: g.confirmer,
    })),
    events: payload.events.map(e => ({
      id: e.id, day: dayOf(e.scheduledFor), node: e.node, players: e.armies, note: e.note, createdBy: e.createdBy,
    })),
    me,
    members: payload.members,
    autoConfirmHours: payload.autoConfirmHours,
  };
}

export const dayToMs = (view, day) => view.start.getTime() + day * DAY;
