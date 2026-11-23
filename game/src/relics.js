// Illustrated roguelite Player Relics + Gilded Foil Card Forging: 6 artifacts, icons, and 3-card draft.
import { drawSuitEmblem, drawLanternIcon, drawShieldIcon } from './card-art.js';

export const RELIC_CATALOG = [
  { id: 'cinder_lens', name: 'CINDER LENS', short: 'Trump +3 PWR', desc: 'Trumps +3 PWR · Gilds Ember 8.', forgeTag: '✦ FORGE EMBER 8 (+3 PWR)', forgeKey: 'ember-8', forgeGild: 'solar', suit: 'ember', color: '#FF6B57' },
  { id: 'tideglass', name: 'TIDEGLASS', short: '+1 Max Lantern', desc: '+1 Lantern/rnd · Gilds Tide 7.', forgeTag: '✦ FORGE TIDE 7 (-1 COST)', forgeKey: 'tide-7', forgeGild: 'keen', suit: 'tide', color: '#4BB4FF' },
  { id: 'briar_ring', name: 'BRIAR RING', short: 'Combo +2 HP', desc: 'Combos +2 HP · Gilds Bramble 6.', forgeTag: '✦ FORGE BRAMBLE 6 (+2 HP)', forgeKey: 'bramble-6', forgeGild: 'verdant', suit: 'bramble', color: '#46D986' },
  { id: 'gilded_seal', name: 'GILDED SEAL', short: 'Gambit +3 DMG', desc: 'Gambit +3 DMG · Gilds Brass 9.', forgeTag: '✦ FORGE BRASS 9 (+3 WARD)', forgeKey: 'brass-9', forgeGild: 'warded', suit: 'brass', color: '#FFD459' },
  { id: 'pair_compass', name: 'PAIR COMPASS', short: 'Pair/Chain +3', desc: 'Pairs/Chains +3 · Gilds Brass 8.', forgeTag: '✦ FORGE BRASS 8 (+3 PWR)', forgeKey: 'brass-8', forgeGild: 'solar', suit: 'brass', color: '#FFB85C' },
  { id: 'hearth_crown', name: 'HEARTH CROWN', short: '+2 Start Ward', desc: '+2 Ward/rnd · Gilds Ember 7.', forgeTag: '✦ FORGE EMBER 7 (+3 WARD)', forgeKey: 'ember-7', forgeGild: 'warded', suit: 'ember', color: '#FFE078' },
];

export const getRelicById = (id) => RELIC_CATALOG.find((r) => r.id === id) ?? null;

export function buildGildedMapFromRelics(ownedIds) {
  const map = {};
  for (const id of ownedIds) { const rel = getRelicById(id); if (rel) map[rel.forgeKey] = rel.forgeGild; }
  return map;
}

export function buildRelicDraftChoices(ownedIds, rng) {
  const owned = new Set(ownedIds);
  const pool = RELIC_CATALOG.filter((r) => !owned.has(r.id)).slice();
  for (let i = pool.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3);
}

export function computePlayerRelicMods(ownedIds, trick, playerTrumps, gambitActive) {
  const set = new Set(ownedIds);
  return {
    powerBonus: (set.has('cinder_lens') && playerTrumps ? 3 : 0) + (set.has('pair_compass') && (trick.comboId === 'pair' || trick.comboId === 'chain') ? 3 : 0),
    healBonus: set.has('briar_ring') && trick.cards.length >= 2 && trick.comboBonus >= 4 ? 2 : 0,
    gambitDmgBonus: set.has('gilded_seal') && gambitActive ? 3 : 0,
    gambitWardBonus: set.has('gilded_seal') && gambitActive ? 2 : 0,
    winScoreBonus: set.has('hearth_crown') ? 100 : 0,
  };
}

export function drawRelicIcon(ctx, relicId, cx, cy, r) {
  const relic = getRelicById(relicId) ?? RELIC_CATALOG[0];
  ctx.save(); ctx.translate(cx, cy);
  const rim = ctx.createLinearGradient(-r, -r, r, r);
  rim.addColorStop(0, '#FFF2B2'); rim.addColorStop(0.5, '#C78E26'); rim.addColorStop(1, '#F2CE72');
  ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill();
  const bg = ctx.createRadialGradient(0, -r * 0.2, 2, 0, 0, r);
  bg.addColorStop(0, '#302418'); bg.addColorStop(1, '#120D09');
  ctx.beginPath(); ctx.arc(0, 0, r - 0.5, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();

  if (relicId === 'cinder_lens') {
    ctx.strokeStyle = '#FFD459'; ctx.lineWidth = Math.max(1.5, r * 0.11); ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    drawSuitEmblem(ctx, 'ember', 0, 0, r * 0.44);
  } else if (relicId === 'tideglass') {
    ctx.strokeStyle = '#9EDBFF'; ctx.lineWidth = Math.max(1.4, r * 0.1);
    ctx.beginPath(); ctx.moveTo(-r * 0.44, -r * 0.52); ctx.lineTo(r * 0.44, -r * 0.52); ctx.lineTo(-r * 0.44, r * 0.52); ctx.lineTo(r * 0.44, r * 0.52); ctx.closePath();
    ctx.fillStyle = 'rgba(75,180,255,0.35)'; ctx.fill(); ctx.stroke();
    drawLanternIcon(ctx, 0, 0, r * 0.28, true);
  } else if (relicId === 'briar_ring') {
    ctx.strokeStyle = '#46D986'; ctx.lineWidth = Math.max(2, r * 0.14); ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2); ctx.stroke();
    drawSuitEmblem(ctx, 'bramble', 0, -r * 0.12, r * 0.36);
  } else if (relicId === 'gilded_seal') {
    ctx.fillStyle = '#B82D28'; ctx.beginPath(); ctx.arc(0, 0, r * 0.64, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFE485'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#FFF6CE'; ctx.font = `900 ${Math.round(r * 0.66)}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×2', 0, 1);
  } else if (relicId === 'pair_compass') {
    ctx.strokeStyle = '#FFD459'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#FF9C54'; ctx.beginPath(); ctx.moveTo(0, -r * 0.62); ctx.lineTo(r * 0.22, 0); ctx.lineTo(0, r * 0.62); ctx.lineTo(-r * 0.22, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF7D4'; ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else {
    drawShieldIcon(ctx, 0, r * 0.08, r * 0.52, '#FFD459');
    ctx.fillStyle = '#FFF6C4'; ctx.beginPath(); ctx.moveTo(-r * 0.38, -r * 0.22); ctx.lineTo(-r * 0.22, -r * 0.55); ctx.lineTo(0, -r * 0.32); ctx.lineTo(r * 0.22, -r * 0.55); ctx.lineTo(r * 0.38, -r * 0.22); ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, r - 0.5, 0, Math.PI * 2); ctx.lineWidth = 1.2; ctx.strokeStyle = relic.color; ctx.stroke();
  ctx.restore();
}
