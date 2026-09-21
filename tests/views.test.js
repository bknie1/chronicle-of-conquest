import { test } from 'node:test';
import assert from 'node:assert/strict';
import { settingToKeep } from '../src/sources.js';

// A campaign is reloaded constantly — once a minute in the background, and
// again whenever a result lands. Every one of those reloads has to put you
// back where you were. When it did not, a player browsing one game was moved
// to another a minute later with nothing to connect it to, which is a very
// expensive bug to find from the outside.
const payload = (code, setting, settings) => ({ campaign: { code, setting, settings } });
const viewing = (code, setting) => ({ kind: 'campaign', code, setting });

test('reloading a campaign keeps the game being looked at', () => {
  const p = payload('ABC-123', 'mortal-realms', ['mortal-realms', 'old-world']);
  assert.equal(settingToKeep(p, viewing('ABC-123', 'old-world')), 'old-world');
  assert.equal(settingToKeep(p, viewing('ABC-123', 'mortal-realms')), 'mortal-realms');
});

test('and falls back to the campaign’s own game when it cannot', () => {
  const p = payload('ABC-123', 'mortal-realms', ['mortal-realms', 'old-world']);
  // Nothing open yet.
  assert.equal(settingToKeep(p, null), undefined);
  // Looking at a demo, not this campaign.
  assert.equal(settingToKeep(p, { kind: 'demo', setting: 'warhammer-40k' }), undefined);
  // A different campaign.
  assert.equal(settingToKeep(p, viewing('XYZ-789', 'old-world')), undefined);
  // A game this campaign has since switched off.
  assert.equal(settingToKeep(p, viewing('ABC-123', 'warhammer-40k')), undefined);
});

test('a campaign that spans one game still works', () => {
  const p = payload('ABC-123', 'old-world', undefined);
  assert.equal(settingToKeep(p, viewing('ABC-123', 'old-world')), 'old-world');
  assert.equal(settingToKeep(p, viewing('ABC-123', 'mortal-realms')), undefined);
});
