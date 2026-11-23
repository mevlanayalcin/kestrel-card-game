// Five parlor circuit rivals with distinct personalities, Relic passives, Gambit raises, and readable tells.
import { SUITS, doesSuitTrump } from './cards.js';
import { enumerateValidSubsets, evaluateTrick } from './combos.js';

export const RIVALS = [
  { id: 'maren', name: 'Maren', title: 'The Lamplighter', difficulty: 'I · Standard', maxHp: 26, favSuit: 'ember', secondSuit: 'brass', accent: '#FF6A4D', badge: 'EMBER', relicName: 'HEARTH COIL', relicDesc: 'Ember +2 PWR', aggression: 1.15, counterWeight: 0.75, maxPlayCards: 2, gambitThreshold: 19 },
  { id: 'vesper', name: 'Vesper', title: 'Of The Weir', difficulty: 'II · Tactician', maxHp: 28, favSuit: 'tide', secondSuit: 'bramble', accent: '#4BB4FF', badge: 'TIDE', relicName: 'WEIR TIDE', relicDesc: 'Tide/Bramble +2 HP', aggression: 1.0, counterWeight: 1.1, maxPlayCards: 3, gambitThreshold: 21 },
  { id: 'sable', name: 'Sable', title: 'The Auctioneer', difficulty: 'III · High Roller', maxHp: 30, favSuit: 'brass', secondSuit: 'ember', accent: '#F5B942', badge: 'GAMBIT', relicName: 'GAVEL STAKE', relicDesc: 'Gambit ×2 +3 PWR', aggression: 1.25, counterWeight: 1.2, maxPlayCards: 3, gambitThreshold: 15 },
  { id: 'corvus', name: 'Corvus', title: 'The Archivist', difficulty: 'IV · Master', maxHp: 32, favSuit: 'bramble', secondSuit: 'ember', accent: '#46D986', badge: 'COMBOS', relicName: 'GILDED LEDGER', relicDesc: 'Combos +2 PWR', aggression: 1.3, counterWeight: 1.45, maxPlayCards: 3, gambitThreshold: 18 },
  { id: 'aurelius', name: 'Aurelius', title: 'The Grandmaster', difficulty: 'V · Champion', maxHp: 36, favSuit: 'ember', secondSuit: 'tide', accent: '#FFE066', badge: 'CROWN', relicName: 'SOLAR CROWN', relicDesc: 'Trumps +2 & +2 Ward', aggression: 1.38, counterWeight: 1.6, maxPlayCards: 3, gambitThreshold: 16 },
];

export function applyRivalRelic(trick, rival, gambitActive = false) {
  let powerBonus = 0; let healBonus = 0; let wardBonus = 0; let trumpBonus = 0; let triggered = false;
  if (!rival || !trick?.cards?.length) return { powerBonus, healBonus, wardBonus, trumpBonus, triggered };
  if (rival.id === 'maren' && trick.leadSuit === 'ember') { powerBonus = 2; triggered = true; }
  else if (rival.id === 'vesper' && trick.cards.length >= 2 && (trick.leadSuit === 'tide' || trick.leadSuit === 'bramble')) { healBonus = 2; triggered = true; }
  else if (rival.id === 'sable' && gambitActive) { powerBonus = 3; triggered = true; }
  else if (rival.id === 'corvus' && trick.cards.length >= 2 && trick.comboBonus >= 4) { powerBonus = 2; triggered = true; }
  else if (rival.id === 'aurelius') { wardBonus = 2; trumpBonus = 2; triggered = true; }
  return { powerBonus, healBonus, wardBonus, trumpBonus, triggered };
}

export function scoreCandidatePlay(trick, rival, context) {
  let score = trick.totalPower * 1.45 + trick.comboBonus * 1.1 + trick.burn * 1.6 * rival.aggression + trick.chill * 1.3 + trick.nextLantern;
  score += trick.ward * (context.oppHp < rival.maxHp * 0.6 ? 1.55 : 0.85) + trick.heal * (context.oppHp < rival.maxHp * 0.75 ? 1.8 : 0.5);
  if (trick.leadSuit === rival.favSuit) score += 2.2;
  if (trick.leadSuit === rival.secondSuit) score += 1.1;
  if (context.playerLastSuit && doesSuitTrump(trick.leadSuit, context.playerLastSuit)) score += 3.2 * rival.counterWeight;
  if (trick.cards.length === 2 && trick.comboBonus >= 4) score += 2.8;
  if (trick.cards.length === 3) score += trick.comboBonus >= 6 ? 4.2 : trick.comboBonus < 5 ? -4.0 : 0;
  return score;
}

export function chooseOpponentPlay(hand, lanterns, rival, context, rng) {
  const subsets = enumerateValidSubsets(hand, lanterns, rival.maxPlayCards);
  if (!subsets.length) {
    const cheapest = hand.slice().sort((a, b) => a.cost - b.cost)[0];
    return cheapest ? [cheapest] : [];
  }
  let best = subsets[0];
  let bestScore = -Infinity;
  const noiseScale = rival.id === 'maren' ? 2.4 : rival.id === 'vesper' ? 1.3 : 0.45;
  for (const sub of subsets) {
    const val = scoreCandidatePlay(evaluateTrick(sub), rival, context) + (rng() - 0.5) * noiseScale;
    if (val > bestScore) { bestScore = val; best = sub; }
  }
  return best;
}

export function shouldRivalRaiseGambit(trick, rival, round, rng) {
  if (round < 2 || trick.cards.length < 2) return false;
  return trick.totalPower >= rival.gambitThreshold && rng() < (rival.id === 'sable' ? 0.78 : 0.48);
}

export function buildTelegraph(cards, rival, gambitActive = false) {
  const trick = evaluateTrick(cards);
  const relic = applyRivalRelic(trick, rival, gambitActive);
  const effectiveTotal = trick.totalPower + relic.powerBonus;
  const ordered = cards.slice().sort((a, b) => (a.suit === trick.leadSuit ? -1 : b.suit === trick.leadSuit ? 1 : 0) || b.rank - a.rank);
  const revealedCard = ordered[0] ?? null;
  const hiddenCards = ordered.slice(1);
  let tellTag = 'SINGLE LEAD';
  let intentBadge = 'STRIKE';

  if (hiddenCards.length > 0) {
    if (trick.comboId === 'pair') { tellTag = `PAIR TELL · RANK ${revealedCard.rank}`; intentBadge = 'HEAVY PAIR'; }
    else if (trick.comboId === 'harmony') { tellTag = `${SUITS[trick.leadSuit].name.toUpperCase()} HARMONY TELL`; intentBadge = 'HARMONY'; }
    else if (trick.comboId === 'chain') { tellTag = 'CHAIN TELL · RUN'; intentBadge = 'CHAIN RUN'; }
    else if (trick.comboId === 'prism') { tellTag = 'PRISM TELL · 3 SUITS'; intentBadge = 'PRISM'; }
    else { tellTag = hiddenCards.some((c) => c.rank >= 6) ? 'HIGH RESERVE (6–9)' : 'LIGHT BACKUP (1–5)'; intentBadge = 'DUAL PLAY'; }
  } else if (revealedCard) {
    tellTag = `${SUITS[revealedCard.suit].name.toUpperCase()} SOLO · ${revealedCard.effect.label}`;
    intentBadge = revealedCard.effect.ward > 0 ? 'GUARD' : revealedCard.effect.heal > 0 ? 'MEND' : 'STRIKE';
  }
  const pMin = hiddenCards.length ? Math.max(revealedCard.rank + 2, effectiveTotal - 2) : effectiveTotal;
  return {
    trick, relic, revealedCard, hiddenCards, leadSuit: trick.leadSuit, tellTag,
    tellTone: SUITS[trick.leadSuit]?.color ?? '#C68816', intentBadge,
    powerText: hiddenCards.length ? `${pMin}–${effectiveTotal + 1}` : `${effectiveTotal}`,
    estimatedPower: effectiveTotal, rivalName: rival.name,
  };
}
