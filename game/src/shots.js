// Deterministic real-rules scene staging for screenshots (?shot=title|play|victory|defeat).
import { doesSuitTrump } from './cards.js';
import { enumerateValidSubsets, evaluateTrick } from './combos.js';
import { MatchEngine, PHASES } from './rules.js';

function chooseTacticalPlayerPlay(engine) {
  const subsets = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, 3);
  if (subsets.length === 0) return [];
  const oppSuit = engine.oppTelegraph?.leadSuit;
  let best = subsets[0];
  let bestScore = -Infinity;
  for (const sub of subsets) {
    const tr = evaluateTrick(sub);
    const trumps = doesSuitTrump(tr.leadSuit, oppSuit);
    let score = tr.totalPower * 1.6 + tr.comboBonus * 1.4 + (trumps ? 6.5 : 0);
    score += tr.burn * 1.4 + tr.chill * 1.2 + tr.ward * 0.9 + tr.heal * (engine.playerHp < 22 ? 1.5 : 0.4);
    if (sub.length >= 2 && tr.comboBonus >= 4) score += 3.0;
    if (score > bestScore) { bestScore = score; best = sub; }
  }
  return best;
}

function chooseRecklessPlayerPlay(engine) {
  const subsets = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, 2);
  if (subsets.length === 0) return [];
  const oppSuit = engine.oppTelegraph?.leadSuit;
  const oppEst = engine.oppTelegraph?.estimatedPower ?? 14;
  let chosen = subsets[0];
  let bestScore = -Infinity;
  for (const sub of subsets) {
    const tr = evaluateTrick(sub);
    const getsTrumped = doesSuitTrump(oppSuit, tr.leadSuit);
    let score = (sub.length === 2 ? 12 : 0) - tr.comboBonus * 2 + (getsTrumped ? 7 : 0);
    score += tr.totalPower < oppEst - 2 ? 8 : -12;
    if (tr.leadSuit === 'brass') score -= 4;
    if (score > bestScore) { bestScore = score; chosen = sub; }
  }
  return chosen;
}

function setupMidRunState(engine, rivalIndex, seed, relics) {
  engine.playerRelics = relics.slice();
  engine.trophies = relics.length;
  engine.playerScore = relics.length * 620;
  engine.startMatch(rivalIndex, seed, true);
}

function runSimulatedPlay(engine, targetRound, seed) {
  // Mid-run Round 4 duel vs Sable (Rival 3/5) with 2 drafted Relics & active Gambit ×2 raise!
  const runRelics = ['cinder_lens', 'briar_ring'];
  for (let offset = 0; offset < 140; offset += 1) {
    setupMidRunState(engine, 2, seed + offset, runRelics);
    let ok = true;
    for (let r = 1; r < targetRound; r += 1) {
      const pick = chooseTacticalPlayerPlay(engine);
      if (pick.length === 0) engine.cycleSelectedCards();
      else {
        for (const c of pick) engine.toggleSelectCard(c.uid);
        engine.playSelectedTrick();
      }
      engine.advanceFromClash();
      if (engine.phase !== PHASES.SELECT) { ok = false; break; }
    }
    if (!ok) continue;

    const pick = chooseTacticalPlayerPlay(engine);
    const trick = evaluateTrick(pick);
    const hasTell = engine.oppCommittedCards.length >= 2;
    const hasCombo = pick.length >= 2 && trick.comboBonus >= 4;
    const hasTrump = doesSuitTrump(trick.leadSuit, engine.oppTelegraph?.leadSuit);
    const ties = engine.chronicle.filter((c) => c.winner === 'tie').length;
    if (
      hasTell && hasCombo && hasTrump && ties === 0 &&
      engine.playerHand.length === 5 &&
      engine.oppHp >= 8 && engine.oppHp <= 24 &&
      engine.playerHp >= 14 && engine.playerHp <= 27
    ) {
      if (!engine.gambitActive) engine.toggleGambitRaise();
      for (const c of pick) engine.toggleSelectCard(c.uid);
      return;
    }
  }

  setupMidRunState(engine, 2, seed, runRelics);
  for (let r = 1; r < targetRound; r += 1) {
    const pick = chooseTacticalPlayerPlay(engine);
    if (pick.length === 0) engine.cycleSelectedCards();
    else { for (const c of pick) engine.toggleSelectCard(c.uid); engine.playSelectedTrick(); }
    engine.advanceFromClash();
    if (engine.phase !== PHASES.SELECT) break;
  }
  if (engine.phase === PHASES.SELECT) {
    if (!engine.gambitActive) engine.toggleGambitRaise();
    const pick = chooseTacticalPlayerPlay(engine);
    for (const c of pick) engine.toggleSelectCard(c.uid);
  }
}

function replayVictoryInto(engine, rivalIndex, seed, relics) {
  setupMidRunState(engine, rivalIndex, seed, relics);
  let safety = 0;
  while (engine.phase === PHASES.SELECT && safety < 14) {
    safety += 1;
    const pick = chooseTacticalPlayerPlay(engine);
    const tr = evaluateTrick(pick);
    if (safety >= 2 && !engine.gambitActive && tr.comboBonus >= 5 && doesSuitTrump(tr.leadSuit, engine.oppTelegraph?.leadSuit)) {
      engine.toggleGambitRaise();
    }
    if (pick.length === 0) engine.cycleSelectedCards();
    else { for (const c of pick) engine.toggleSelectCard(c.uid); engine.playSelectedTrick(); }
    engine.advanceFromClash();
  }
}

function runSimulatedVictory(engine, seed) {
  const runRelics = ['cinder_lens', 'briar_ring'];
  for (let offset = 0; offset < 100; offset += 1) {
    const trial = new MatchEngine(seed + offset);
    replayVictoryInto(trial, 2, seed + offset, runRelics);
    if (
      trial.phase === PHASES.VICTORY &&
      trial.round >= 4 && trial.round <= 8 &&
      trial.oppHp === 0 &&
      trial.playerHp >= 12 && trial.playerHp <= 28 &&
      trial.playerPlayedCards.length >= 2 &&
      trial.lastClash?.playerTrick?.comboBonus >= 4 &&
      trial.lastClash?.damageToOpp >= 7 &&
      trial.draftChoices.length === 3
    ) {
      replayVictoryInto(engine, 2, seed + offset, runRelics);
      return;
    }
  }
  replayVictoryInto(engine, 2, seed, runRelics);
}

function replayDefeatInto(engine, rivalIndex, seed, relics) {
  setupMidRunState(engine, rivalIndex, seed, relics);
  let safety = 0;
  while (engine.phase === PHASES.SELECT && safety < 14) {
    safety += 1;
    const pick = safety <= 2 ? chooseTacticalPlayerPlay(engine) : chooseRecklessPlayerPlay(engine);
    if (pick.length === 0) engine.cycleSelectedCards();
    else { for (const c of pick) engine.toggleSelectCard(c.uid); engine.playSelectedTrick(); }
    engine.advanceFromClash();
  }
}

function runSimulatedDefeat(engine, seed) {
  // Dramatic climax defeat vs Aurelius the Grandmaster (Rival 5/5) with 3 drafted relics on the line!
  const runRelics = ['cinder_lens', 'briar_ring', 'gilded_seal'];
  for (let offset = 0; offset < 120; offset += 1) {
    const trial = new MatchEngine(seed + offset);
    replayDefeatInto(trial, 4, seed + offset, runRelics);
    if (
      trial.phase === PHASES.DEFEAT &&
      trial.round >= 4 &&
      trial.playerHp === 0 &&
      trial.oppHp >= 8 && trial.oppHp <= 28 &&
      trial.oppCommittedCards.length >= 2 &&
      trial.playerPlayedCards.length === 2
    ) {
      replayDefeatInto(engine, 4, seed + offset, runRelics);
      return;
    }
  }
  replayDefeatInto(engine, 4, seed, runRelics);
}

export function stageShot(name, seed, engine, renderer, anim, uiState) {
  const mode = (name || 'title').toLowerCase();
  anim.particles = []; anim.callouts = []; anim.shake = 0; anim.flash = 0; anim.time = 1.65;

  if (mode === 'title' || mode === 'start') {
    engine.phase = PHASES.TITLE;
    engine.setRival(0);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.snapAll();
    return;
  }

  if (mode === 'play' || mode === 'table') {
    runSimulatedPlay(engine, 4, seed);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.snapAll();
    anim.spawnBurst(630, 505, '#FFE072', 14, 95, 36, 412);
    anim.step(0.18, false);
    return;
  }

  if (mode === 'victory' || mode === 'win') {
    runSimulatedVictory(engine, seed);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.snapAll();
    anim.spawnVictoryFlourish(630, 345);
    anim.step(0.32, false);
    return;
  }

  if (mode === 'defeat' || mode === 'loss' || mode === 'end') {
    runSimulatedDefeat(engine, seed);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.snapAll();
    anim.spawnDefeatWisps(630, 490);
    anim.step(0.28, true);
  }
}
