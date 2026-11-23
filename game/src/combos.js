// Multi-way trick combo evaluator and Elemental Trump / Gambit ×2 clash resolution engine.
import { SUITS, doesSuitTrump } from './cards.js';

export const COMBO_CATALOG = [
  { id: 'pair', name: 'PAIR', desc: 'Same Rank', bonus: '+5', icon: '◈◈', color: '#FF8A65' },
  { id: 'harmony', name: 'HARMONY', desc: 'Same Suit', bonus: '+4/+8', icon: '♦♦', color: '#4BB4FF' },
  { id: 'chain', name: 'CHAIN', desc: 'Run 4-5-6', bonus: '+4/+9', icon: '▸▸', color: '#46D986' },
  { id: 'prism', name: 'PRISM', desc: '3 Suits', bonus: '+6', icon: '✦✦', color: '#FFD459' },
];

export function determineLeadSuit(cards) {
  if (!cards || cards.length === 0) return null;
  const counts = {};
  const maxRank = {};
  for (const c of cards) {
    counts[c.suit] = (counts[c.suit] ?? 0) + 1;
    maxRank[c.suit] = Math.max(maxRank[c.suit] ?? 0, c.rank);
  }
  return Object.keys(counts).sort((a, b) => {
    if (counts[b] !== counts[a]) return counts[b] - counts[a];
    if (maxRank[b] !== maxRank[a]) return maxRank[b] - maxRank[a];
    if (a === 'brass' && b !== 'brass') return 1;
    if (b === 'brass' && a !== 'brass') return -1;
    return a < b ? -1 : 1;
  })[0];
}

function isSequentialRun(ranks) {
  if (ranks.length < 2) return false;
  for (let i = 1; i < ranks.length; i += 1) if (ranks[i] !== ranks[i - 1] + 1) return false;
  return true;
}

export function evaluateTrick(cards) {
  if (!cards || cards.length === 0) {
    return {
      cards: [], leadSuit: null, comboId: 'none', comboName: 'SELECT 1–3 CARDS', comboShort: 'NONE',
      comboBonus: 0, basePower: 0, totalPower: 0, totalCost: 0, ward: 0, heal: 0, burn: 0, chill: 0,
      pierce: 0, nextLantern: 0, bonusDraw: 0, ignoreEnemyTrump: false, brassHarmony: false,
    };
  }
  const sorted = cards.slice().sort((a, b) => a.rank - b.rank);
  const ranks = sorted.map((c) => c.rank);
  const uniqueSuits = new Set(sorted.map((c) => c.suit));
  const rankCounts = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] ?? 0) + 1;
  const maxSameRank = Math.max(...Object.values(rankCounts));
  const allSameSuit = uniqueSuits.size === 1;
  const sequential = isSequentialRun(ranks);

  let comboId = 'single'; let comboName = 'SINGLE STRIKE'; let comboShort = 'STRIKE';
  let comboBonus = 0; let extraPierce = 0; let bonusDraw = 0;
  let ignoreEnemyTrump = false; let harmonyBoost = false;

  if (cards.length === 3) {
    if (maxSameRank === 3) { comboId = 'pair'; comboName = 'TRIPLE RESONANCE'; comboShort = 'TRIPLE +10'; comboBonus = 10; extraPierce = 4; }
    else if (allSameSuit && sequential) { comboId = 'chain'; comboName = 'ROYAL CHAIN'; comboShort = 'ROYAL +12'; comboBonus = 12; bonusDraw = 1; harmonyBoost = true; }
    else if (sequential) { comboId = 'chain'; comboName = 'MASTER CHAIN'; comboShort = 'CHAIN +9'; comboBonus = 9; bonusDraw = 1; }
    else if (allSameSuit) { comboId = 'harmony'; comboName = 'GRAND HARMONY'; comboShort = 'HARMONY +8'; comboBonus = 8; harmonyBoost = true; }
    else if (maxSameRank === 2) { comboId = 'pair'; comboName = 'PAIR RESONANCE'; comboShort = 'PAIR +5'; comboBonus = 5; extraPierce = 2; }
    else if (uniqueSuits.size === 3) { comboId = 'prism'; comboName = 'PRISM TRIAD'; comboShort = 'PRISM +6'; comboBonus = 6; ignoreEnemyTrump = true; }
    else { comboId = 'harmony'; comboName = 'MIXED VOLLEY'; comboShort = 'VOLLEY +2'; comboBonus = 2; }
  } else if (cards.length === 2) {
    if (maxSameRank === 2) { comboId = 'pair'; comboName = 'PAIR RESONANCE'; comboShort = 'PAIR +5'; comboBonus = 5; extraPierce = 2; }
    else if (allSameSuit && sequential) { comboId = 'harmony'; comboName = 'SUITED CHAIN'; comboShort = 'SUITED +6'; comboBonus = 6; harmonyBoost = true; }
    else if (allSameSuit) { comboId = 'harmony'; comboName = 'SUIT HARMONY'; comboShort = 'HARMONY +4'; comboBonus = 4; harmonyBoost = true; }
    else if (sequential) { comboId = 'chain'; comboName = 'SWIFT CHAIN'; comboShort = 'CHAIN +4'; comboBonus = 4; }
    else { comboId = 'mixed'; comboName = 'DUAL PLAY'; comboShort = 'DUAL +1'; comboBonus = 1; }
  }

  let basePower = 0; let totalCost = 0; let ward = 0; let heal = 0;
  let burn = 0; let chill = 0; let pierce = extraPierce; let nextLantern = 0; let hasBrass = false;
  for (const c of cards) {
    basePower += c.rank; totalCost += c.cost; ward += c.effect.ward; heal += c.effect.heal;
    burn += c.effect.burn; chill += c.effect.chill; pierce += c.effect.pierce; nextLantern += c.effect.lantern;
    if (c.suit === 'brass') hasBrass = true;
  }

  const leadSuit = determineLeadSuit(cards);
  const brassHarmony = cards.length >= 2 && hasBrass;
  if (brassHarmony) { ward += 2; nextLantern += 1; }
  if (harmonyBoost && leadSuit) {
    if (leadSuit === 'ember') burn += 2;
    if (leadSuit === 'tide') chill += 1;
    if (leadSuit === 'bramble') heal += 2;
    if (leadSuit === 'brass') ward += 2;
  }
  return {
    cards: sorted, leadSuit, comboId, comboName, comboShort, comboBonus,
    basePower, totalPower: basePower + comboBonus, totalCost,
    ward, heal, burn, chill, pierce, nextLantern, bonusDraw, ignoreEnemyTrump, brassHarmony,
  };
}

function calcSideDamage(margin, trick, defWard, counterBreak, gambitExtra) {
  const base = Math.min(10, Math.round(margin * 0.55) + 3);
  const raw = base + Math.min(4, trick.burn) + (counterBreak ? 2 : 0) + gambitExtra;
  return Math.max(2, raw - Math.max(0, defWard - trick.pierce));
}

export function resolveClash(playerTrick, oppTrick, playerStartWard = 0, oppStartWard = 0, oppRelic = null, playerMods = null, gambitActive = false) {
  const playerTrumps = !oppTrick.ignoreEnemyTrump && doesSuitTrump(playerTrick.leadSuit, oppTrick.leadSuit);
  const oppTrumps = !playerTrick.ignoreEnemyTrump && doesSuitTrump(oppTrick.leadSuit, playerTrick.leadSuit);
  const oppTrumpExtra = oppTrumps ? (oppRelic?.trumpBonus ?? 0) : 0;

  const playerPower = Math.max(1, playerTrick.totalPower + (playerMods?.powerBonus ?? 0) + (playerTrumps ? 3 : 0) - oppTrick.chill);
  const oppPower = Math.max(1, oppTrick.totalPower + (oppRelic?.powerBonus ?? 0) + (oppTrumps ? 3 + oppTrumpExtra : 0) - playerTrick.chill);
  const playerWardPool = playerStartWard + playerTrick.ward;
  const oppWardPool = oppStartWard + oppTrick.ward + (oppRelic?.wardBonus ?? 0);

  let winner = 'tie'; let damageToOpp = 0; let damageToPlayer = 0; let counterBreak = false;
  let playerScoreGain = 40; let oppScoreGain = 40; let tieBonusLantern = 0;

  if (playerPower > oppPower) {
    winner = 'player';
    const margin = playerPower - oppPower;
    counterBreak = playerTrumps && margin >= 4;
    const gBonus = gambitActive ? 5 + (playerMods?.gambitDmgBonus ?? 0) : 0;
    damageToOpp = calcSideDamage(margin, playerTrick, oppWardPool, counterBreak, gBonus);
    playerScoreGain = 110 + margin * 15 + playerTrick.comboBonus * 12 + (playerTrumps ? 60 : 0) + (counterBreak ? 120 : 0) + (gambitActive ? 220 : 0) + (playerMods?.winScoreBonus ?? 0);
    oppScoreGain = 20;
  } else if (oppPower > playerPower) {
    winner = 'opponent';
    const margin = oppPower - playerPower;
    counterBreak = oppTrumps && margin >= 4;
    damageToPlayer = calcSideDamage(margin, oppTrick, playerWardPool, counterBreak, gambitActive ? 5 : 0);
    oppScoreGain = 110 + margin * 15 + oppTrick.comboBonus * 12 + (oppTrumps ? 60 : 0) + (counterBreak ? 120 : 0) + (gambitActive ? 180 : 0);
    playerScoreGain = 20;
  } else {
    damageToOpp = gambitActive ? 4 : 2; damageToPlayer = gambitActive ? 4 : 2;
    tieBonusLantern = 1; playerScoreGain = 65; oppScoreGain = 65;
  }

  let headline = gambitActive ? 'GAMBIT ×2 DEADLOCK!' : 'EVEN CLASH · SPARKS FLY';
  if (winner === 'player') {
    headline = gambitActive ? `GAMBIT ×2 WON! ${playerTrick.comboName} (-${damageToOpp} HP)`
      : counterBreak ? `COUNTER-BREAK! ${SUITS[playerTrick.leadSuit].name.toUpperCase()} SHATTERS RIVAL`
      : playerTrumps ? `TRUMP WIN! ${playerTrick.comboName}` : `TRICK WON · ${playerTrick.comboName}`;
  } else if (winner === 'opponent') {
    headline = gambitActive ? `GAMBIT ×2 LOST! ${oppTrick.comboName} (-${damageToPlayer} HP)`
      : counterBreak ? `RIVAL COUNTER-BREAK! ${oppTrick.comboName}`
      : oppTrumps ? `RIVAL TRUMP · ${oppTrick.comboName}` : `RIVAL WINS · ${oppTrick.comboName}`;
  }

  return {
    winner, playerPower, oppPower, playerTrumps, oppTrumps, counterBreak, gambitActive,
    damageToOpp, damageToPlayer,
    playerHeal: playerTrick.heal + (playerMods?.healBonus ?? 0),
    oppHeal: oppTrick.heal + (oppRelic?.healBonus ?? 0),
    oppRelicTriggered: Boolean(oppRelic?.triggered),
    gambitWardGain: winner === 'player' && gambitActive ? (playerMods?.gambitWardBonus ?? 0) : 0,
    playerScoreGain, oppScoreGain, tieBonusLantern, headline,
  };
}

export function enumerateValidSubsets(hand, maxLanterns, maxCards = 3) {
  const results = [];
  for (let i = 0; i < hand.length; i += 1) {
    const c1 = hand[i];
    if (c1.cost <= maxLanterns) results.push([c1]);
    if (maxCards < 2) continue;
    for (let j = i + 1; j < hand.length; j += 1) {
      const c2 = hand[j];
      if (c1.cost + c2.cost <= maxLanterns) results.push([c1, c2]);
      if (maxCards < 3) continue;
      for (let k = j + 1; k < hand.length; k += 1) {
        const c3 = hand[k];
        if (c1.cost + c2.cost + c3.cost <= maxLanterns) results.push([c1, c2, c3]);
      }
    }
  }
  return results;
}
