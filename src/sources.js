// Turns either a built-in demo or a server campaign into one shape the UI
// understands. Days are counted from local midnight on the campaign's first day.
import { DEMOS, DEMO_START, DEMO_TODAY, generateHistory } from './data/demo-campaign.js';

const DAY = 864e5;
const midnight = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d; };

export function demoView(setting, graph) {
  const demo = DEMOS[setting.id];
  return {
    kind: 'demo',
    setting: setting.id,
    level: setting.defaultLevel,
    code: null,
    name: demo.name,
    start: DEMO_START,
    today: DEMO_TODAY,
    // A demo player's `faction` names the ground they muster from — an army
    // book's own seat, or one of its sub-factions'. Both resolve to the book.
    players: demo.players.map(p => ({
      ...p,
      faction: setting.factionOfStart.get(p.faction) ?? p.faction,
      start: p.faction,
      joinedDay: p.active[0],
      retired: false,
    })),
    games: generateHistory(graph, setting, demo).map(g => ({ ...g, status: 'confirmed' })),
    events: demo.events.map(e => ({ ...e })),
    me: null,
    members: [],
  };
}

export function campaignView(payload) {
  // The timeline covers the current season, not all of history.
  const start = midnight(payload.campaign.seasonStartedAt ?? payload.campaign.createdAt);
  const dayOf = ms => (ms - start.getTime()) / DAY;
  const me = payload.me && {
    ...payload.me,
    armyIds: new Set(payload.armies.filter(a => a.userId === payload.me.userId && !a.retiredAt).map(a => a.id)),
  };
  return {
    kind: 'campaign',
    setting: payload.campaign.setting,
    level: payload.campaign.level ?? 'codex',
    resetDays: payload.campaign.resetDays ?? 0,
    seasonStartedAt: payload.campaign.seasonStartedAt,
    code: payload.campaign.code,
    name: payload.campaign.name,
    start,
    today: dayOf(Date.now()),
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
