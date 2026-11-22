// Three distinct parlor rivals with tactical personalities, play heuristics, and readable tells.
import { SUITS, doesSuitTrump } from './cards.js';
import { enumerateValidSubsets, evaluateTrick } from './combos.js';

export const RIVALS = [
  {
    id: 'maren',
    name: 'Maren',
    title: 'The Lamplighter',
    difficulty: 'Standard',
    maxHp: 26,
    favSuit: 'ember',
    secondSuit: 'brass',
    accent: '#FF6A4D',
    badge: 'EMBER & BRASS',
    style: 'Favors fiery Ember volleys and steady Brass shields.',
    aggression: 1.15,
    counterWeight: 0.7,
    maxPlayCards: 2,
  },
  {
    id: 'vesper',
    name: 'Vesper',
    title: 'Of The Weir',
    difficulty: 'Tactician',
    maxHp: 30,
    favSuit: 'tide',
    secondSuit: 'bramble',
    accent: '#4BB4FF',
    badge: 'TIDE & BRAMBLE',
    style: 'Chains Tide chills with Bramble sustain to outlast foes.',
    aggression: 1.0,
    counterWeight: 1.15,
    maxPlayCards: 3,
  },
  {
    id: 'corvus',
    name: 'Corvus',
    title: 'The Archivist',
    difficulty: 'Master',
    maxHp: 34,
    favSuit: 'bramble',
    secondSuit: 'ember',
    accent: '#FFD459',
    badge: 'MASTER COMBOS',
    style: 'Reads your last suit and hunts lethal Pair & Chain breaks.',
    aggression: 1.3,
    counterWeight: 1.45,
    maxPlayCards: 3,
  },
];

export function scoreCandidatePlay(trick, rival, context) {
  let score = trick.totalPower * 1.45;
  score += trick.comboBonus * 1.1;
  score += trick.burn * 1.6 * rival.aggression;
  score += trick.chill * 1.3;
  score += trick.ward * (context.oppHp < rival.maxHp * 0.6 ? 1.55 : 0.85);
  score += trick.heal * (context.oppHp < rival.maxHp * 0.75 ? 1.8 : 0.5);
  score += trick.nextLantern * 1.0;

  if (trick.leadSuit === rival.favSuit) score += 2.2;
  if (trick.leadSuit === rival.secondSuit) score += 1.1;

  if (context.playerLastSuit && doesSuitTrump(trick.leadSuit, context.playerLastSuit)) {
    score += 3.2 * rival.counterWeight;
  }

  // Prefer multi-card combos when affordable, especially in later rounds
  if (trick.cards.length === 2 && trick.comboBonus >= 4) score += 2.8;
  if (trick.cards.length === 3 && trick.comboBonus >= 6) score += 4.2;

  // Avoid overspending 3 cards with no combo synergy
  if (trick.cards.length === 3 && trick.comboBonus < 5) score -= 4.0;

  return score;
}

export function chooseOpponentPlay(hand, lanterns, rival, context, rng) {
  const subsets = enumerateValidSubsets(hand, lanterns, rival.maxPlayCards);
  if (subsets.length === 0) {
    const cheapest = hand.slice().sort((a, b) => a.cost - b.cost)[0];
    return cheapest ? [cheapest] : [];
  }

  let bestSubset = subsets[0];
  let bestScore = -Infinity;

  for (const subset of subsets) {
    const trick = evaluateTrick(subset);
    const jitter = (rng() - 0.5) * (rival.id === 'maren' ? 2.4 : rival.id === 'vesper' ? 1.2 : 0.4);
    const val = scoreCandidatePlay(trick, rival, context) + jitter;
    if (val > bestScore) {
      bestScore = val;
      bestSubset = subset;
    }
  }

  return bestSubset;
}

export function buildTelegraph(cards, rival) {
  const trick = evaluateTrick(cards);
  const ordered = cards.slice().sort((a, b) => {
    if (a.suit === trick.leadSuit && b.suit !== trick.leadSuit) return -1;
    if (b.suit === trick.leadSuit && a.suit !== trick.leadSuit) return 1;
    return b.rank - a.rank;
  });

  const revealedCard = ordered[0] ?? null;
  const hiddenCards = ordered.slice(1);

  let tellTag = 'SINGLE LEAD';
  let tellTone = SUITS[trick.leadSuit]?.color ?? '#C68816';
  let intentBadge = 'STRIKE';

  if (hiddenCards.length > 0) {
    if (trick.comboId === 'pair') {
      tellTag = `PAIR TELL · RANK ${revealedCard.rank}`;
      intentBadge = 'HEAVY PAIR';
    } else if (trick.comboId === 'harmony') {
      tellTag = `${SUITS[trick.leadSuit].name.toUpperCase()} HARMONY TELL`;
      intentBadge = 'HARMONY';
    } else if (trick.comboId === 'chain') {
      tellTag = `CHAIN TELL · RUN`;
      intentBadge = 'CHAIN RUN';
    } else if (trick.comboId === 'prism') {
      tellTag = `PRISM TELL · 3 SUITS`;
      intentBadge = 'PRISM';
    } else {
      const hiddenHigh = hiddenCards.some((c) => c.rank >= 6);
      tellTag = hiddenHigh ? 'HIGH RESERVE (6–9)' : 'LIGHT BACKUP (1–5)';
      intentBadge = 'DUAL PLAY';
    }
  } else if (revealedCard) {
    tellTag = `${SUITS[revealedCard.suit].name.toUpperCase()} SOLO · ${revealedCard.effect.label}`;
    intentBadge = revealedCard.effect.ward > 0 ? 'GUARD' : revealedCard.effect.heal > 0 ? 'MEND' : 'STRIKE';
  }

  // Approximate forecast shown cleanly to player (within ±1 of real power if hidden cards exist)
  const powerMin = hiddenCards.length > 0 ? Math.max(revealedCard.rank + 2, trick.totalPower - 2) : trick.totalPower;
  const powerMax = hiddenCards.length > 0 ? trick.totalPower + 1 : trick.totalPower;
  const powerText = hiddenCards.length > 0 ? `${powerMin}–${powerMax}` : `${trick.totalPower}`;

  return {
    trick,
    revealedCard,
    hiddenCards,
    leadSuit: trick.leadSuit,
    tellTag,
    tellTone,
    intentBadge,
    powerText,
    estimatedPower: trick.totalPower,
    rivalName: rival.name,
  };
}
