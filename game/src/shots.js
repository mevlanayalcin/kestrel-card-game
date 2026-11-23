// Deterministic real-rules scene staging for screenshots (?shot=title|play|victory|defeat).
import { SUITS, doesSuitTrump } from './cards.js';
import { enumerateValidSubsets, evaluateTrick } from './combos.js';
import { MatchEngine, PHASES } from './rules.js';
function chooseTactical(engine, maxCards = 3) {
  const subs = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, maxCards);
  if (subs.length === 0) return [];
  const oppSuit = engine.oppTelegraph?.leadSuit;
  let best = subs[0]; let bestS = -Infinity;
  for (const sub of subs) {
    const tr = evaluateTrick(sub);
    let s = tr.totalPower * 1.6 + tr.comboBonus * 1.4 + (doesSuitTrump(tr.leadSuit, oppSuit) ? 6.5 : 0) + tr.gildedCount * 2.5;
    s += tr.burn * 1.4 + tr.chill * 1.2 + tr.ward * 0.9 + tr.heal * (engine.playerHp < 22 ? 1.5 : 0.4) + (sub.length >= 2 && tr.comboBonus >= 4 ? 3 : 0);
    if (s > bestS) { bestS = s; best = sub; }
  }
  return best;
}
function chooseReckless(engine) {
  const subs = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, 2);
  if (subs.length === 0) return [];
  const oppSuit = engine.oppTelegraph?.leadSuit; const oppEst = engine.oppTelegraph?.estimatedPower ?? 14;
  let chosen = subs[0]; let bestS = -Infinity;
  for (const sub of subs) {
    const tr = evaluateTrick(sub);
    const s = (sub.length === 2 ? 12 : 0) - tr.comboBonus * 2 + (doesSuitTrump(oppSuit, tr.leadSuit) ? 7 : 0) + (tr.totalPower < oppEst - 2 ? 8 : -12) - (tr.leadSuit === 'brass' ? 4 : 0);
    if (s > bestS) { bestS = s; chosen = sub; }
  }
  return chosen;
}
function setupMidRun(engine, rivalIdx, seed, relics) {
  engine.playerRelics = relics.slice(); engine.trophies = relics.length;
  engine.playerScore = relics.length * 640; engine.startMatch(rivalIdx, seed, true);
}
function playTurn(engine, pick, raiseGambit = false) {
  if (raiseGambit && !engine.gambitActive) engine.toggleGambitRaise();
  if (pick.length === 0) return engine.cycleSelectedCards();
  for (const c of pick) engine.toggleSelectCard(c.uid);
  return engine.playSelectedTrick();
}
function bestPairPlay(engine) {
  const subs = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, 2).filter((s) => s.length === 2);
  const oSuit = engine.oppTelegraph?.leadSuit;
  return subs.sort((a, b) => {
    const ta = evaluateTrick(a); const tb = evaluateTrick(b);
    return (tb.totalPower + (doesSuitTrump(tb.leadSuit, oSuit) ? 6 : 0) + tb.gildedCount * 5) - (ta.totalPower + (doesSuitTrump(ta.leadSuit, oSuit) ? 6 : 0) + ta.gildedCount * 5);
  })[0];
}
function runSimulatedPlay(engine, seed) {
  const relics = ['cinder_lens', 'briar_ring']; let best = null; let bestS = -1;
  for (const rnd of [4, 3]) {
    for (let off = 0; off < 420; off += 1) {
      const t = new MatchEngine(seed + off); setupMidRun(t, 2, seed + off, relics); let ok = true;
      for (let r = 1; r < rnd; r += 1) { playTurn(t, chooseTactical(t, 2)); t.advanceFromClash(); if (t.phase !== PHASES.SELECT) { ok = false; break; } }
      if (!ok || t.oppCommittedCards.length !== 2 || t.playerHand.length < 5) continue;
      const sub = bestPairPlay(t); if (!sub) continue;
      const cl = playTurn(t, sub, true);
      if (cl?.winner !== 'player' || cl.damageToOpp < 10 || t.oppHp < 3 || t.oppHp > 21 || t.playerHp < 14 || t.playerHp > 28 || t.playerHand.length !== 3 || t.oppHand.length < 2 || t.playerLanterns < 1) continue;
      const allSuits = new Set([...t.oppCommittedCards, ...t.playerPlayedCards, ...t.playerHand].map((c) => c.suit)).size;
      const handSuits = new Set(t.playerHand.map((c) => c.suit)).size;
      const pGild = t.playerPlayedCards.some((c) => c.gilded);
      if (!pGild && !t.playerHand.some((c) => c.gilded)) continue;
      const sc = allSuits * 30 + handSuits * 15 + (cl.playerTrumps ? 25 : 0) + (pGild ? 20 : 0) + (t.playerLanterns >= 2 ? 10 : 0);
      if (sc > bestS) { bestS = sc; best = { rnd, off }; }
      if (allSuits === 4 && handSuits === 3 && cl.playerTrumps && pGild) break;
    }
    if (bestS >= 180) break;
  }
  const ch = best ?? { rnd: 3, off: 0 };
  setupMidRun(engine, 2, seed + ch.off, relics);
  for (let r = 1; r < ch.rnd; r += 1) { playTurn(engine, chooseTactical(engine, 2)); engine.advanceFromClash(); }
  if (engine.phase === PHASES.SELECT) playTurn(engine, bestPairPlay(engine) ?? chooseTactical(engine, 2), true);
}
function replayVictory(engine, rivalIdx, seed, relics) {
  setupMidRun(engine, rivalIdx, seed, relics);
  for (let s = 1; engine.phase === PHASES.SELECT && s <= 14; s += 1) {
    const pick = chooseTactical(engine); const tr = evaluateTrick(pick);
    playTurn(engine, pick, s >= 2 && tr.comboBonus >= 5 && doesSuitTrump(tr.leadSuit, engine.oppTelegraph?.leadSuit));
    engine.advanceFromClash();
  }
}
function runSimulatedVictory(engine, seed) {
  const relics = ['cinder_lens', 'briar_ring'];
  let bestOff = null; let bestRank = -1;
  for (let off = 0; off < 180; off += 1) {
    const t = new MatchEngine(seed + off);
    replayVictory(t, 2, seed + off, relics);
    if (t.phase !== PHASES.VICTORY || t.oppHp !== 0 || t.draftChoices.length !== 3) continue;
    const hasGild = t.playerPlayedCards.some((c) => c.gilded);
    const suits = new Set(t.playerPlayedCards.map((c) => c.suit)).size;
    const rank = (t.playerPlayedCards.length === 3 ? 40 : 0) + (hasGild ? 30 : 0) + (suits >= 2 ? 15 : 0) + (t.playerHp >= 12 && t.playerHp <= 26 ? 20 : 0) + (t.round <= 8 ? 10 : 0);
    if (rank > bestRank) { bestRank = rank; bestOff = off; }
    if (rank >= 115) break;
  }
  replayVictory(engine, 2, seed + (bestOff ?? 0), relics);
}
function replayDefeat(engine, rivalIdx, seed, relics) {
  setupMidRun(engine, rivalIdx, seed, relics);
  for (let s = 1; engine.phase === PHASES.SELECT && s <= 14; s += 1) {
    playTurn(engine, s <= 2 ? chooseTactical(engine) : chooseReckless(engine));
    engine.advanceFromClash();
  }
}
function runSimulatedDefeat(engine, seed) {
  const relics = ['cinder_lens', 'briar_ring', 'gilded_seal'];
  for (let off = 0; off < 120; off += 1) {
    const t = new MatchEngine(seed + off);
    replayDefeat(t, 4, seed + off, relics);
    if (t.phase === PHASES.DEFEAT && t.round >= 4 && t.playerHp === 0 && t.oppHp >= 8 && t.oppHp <= 28 && t.oppCommittedCards.length >= 2 && t.playerPlayedCards.length === 2) {
      replayDefeat(engine, 4, seed + off, relics); return;
    }
  }
  replayDefeat(engine, 4, seed, relics);
}
export function stageShot(name, seed, engine, renderer, anim, uiState) {
  const mode = (name || 'title').toLowerCase();
  anim.particles = []; anim.callouts = []; anim.rings = []; anim.shake = 0; anim.flash = 0; anim.time = 1.65;
  if (mode === 'title' || mode === 'start') {
    engine.phase = PHASES.TITLE; engine.setRival(0); renderer.syncCardTargets(engine, anim, uiState); anim.snapAll(); return;
  }
  if (mode === 'play' || mode === 'table') {
    runSimulatedPlay(engine, seed); renderer.syncCardTargets(engine, anim, uiState); anim.snapAll();
    const c = engine.lastClash; const col = SUITS[c?.playerTrick?.leadSuit]?.bright ?? '#FFE066';
    anim.spawnShockwave(640, 294, '#FFE26A', 180, 5); anim.spawnShockwave(418, 294, col, 134, 4);
    anim.spawnBurst(418, 306, col, 22, 185, 45, 412); anim.spawnBurst(564, 294, '#FFE680', 14, 95, 35, 419);
    if (c && c.winner === 'player') {
      const tag = c.playerTrumps && c.gambitActive ? 'TRUMP ×2!' : c.gambitActive ? 'GAMBIT ×2!' : 'COMBO HIT!';
      anim.spawnCallout(418, 132, `-${c.damageToOpp} HP · ${tag}`, '#FFE472', 24);
    }
    anim.step(0.16, false); return;
  }
  if (mode === 'victory' || mode === 'win') {
    runSimulatedVictory(engine, seed); renderer.syncCardTargets(engine, anim, uiState); anim.snapAll();
    anim.spawnVictoryFlourish(640, 316); anim.step(0.28, false); return;
  }
  if (mode === 'defeat' || mode === 'loss' || mode === 'end') {
    runSimulatedDefeat(engine, seed); renderer.syncCardTargets(engine, anim, uiState); anim.snapAll();
    anim.spawnDefeatWisps(640, 532); anim.step(0.26, true);
  }
}
