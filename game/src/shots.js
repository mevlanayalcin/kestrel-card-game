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

  for (const subset of subsets) {
    const trick = evaluateTrick(subset);
    const trumps = doesSuitTrump(trick.leadSuit, oppSuit);
    let score = trick.totalPower * 1.6 + trick.comboBonus * 1.4;
    if (trumps) score += 6.5;
    score += trick.burn * 1.4 + trick.chill * 1.2 + trick.ward * 0.9 + trick.heal * (engine.playerHp < 22 ? 1.5 : 0.4);
    if (subset.length >= 2 && trick.comboBonus >= 4) score += 3.0;
    if (score > bestScore) {
      bestScore = score;
      best = subset;
    }
  }
  return best;
}

function chooseRecklessPlayerPlay(engine) {
  // Simulates a hurried player ignoring rival tells and playing single un-comboed or trumped cards
  const subsets = enumerateValidSubsets(engine.playerHand, engine.playerLanterns, 1);
  if (subsets.length === 0) return [];
  const oppSuit = engine.oppTelegraph?.leadSuit;
  let chosen = subsets[0];
  let bestWeakScore = -Infinity;

  for (const subset of subsets) {
    const card = subset[0];
    const getsTrumped = doesSuitTrump(oppSuit, card.suit);
    let weakness = (10 - card.rank) * 1.2 + (getsTrumped ? 5 : 0);
    if (card.suit === 'brass') weakness -= 3;
    if (weakness > bestWeakScore) {
      bestWeakScore = weakness;
      chosen = subset;
    }
  }
  return chosen;
}

function runSimulatedPlay(engine, targetRound, seed) {
  for (let offset = 0; offset < 120; offset += 1) {
    engine.startMatch(0, seed + offset);
    let ok = true;
    for (let r = 1; r < targetRound; r += 1) {
      const pick = chooseTacticalPlayerPlay(engine);
      if (pick.length === 0) {
        engine.cycleSelectedCards();
      } else {
        for (const c of pick) engine.toggleSelectCard(c.uid);
        engine.playSelectedTrick();
      }
      engine.advanceFromClash();
      if (engine.phase !== PHASES.SELECT) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;

    // Pick a vivid tactical moment: rival has 2 cards (1 face-up + 1 tell), both took real damage, & player has a trumping combo!
    const pick = chooseTacticalPlayerPlay(engine);
    const trick = evaluateTrick(pick);
    const hasTell = engine.oppCommittedCards.length >= 2;
    const hasCombo = pick.length >= 2 && trick.comboBonus >= 4;
    const hasTrump = doesSuitTrump(trick.leadSuit, engine.oppTelegraph?.leadSuit);
    const ties = engine.chronicle.filter((c) => c.winner === 'tie').length;
    if (
      hasTell &&
      hasCombo &&
      hasTrump &&
      ties === 0 &&
      engine.oppHp >= 8 &&
      engine.oppHp <= 20 &&
      engine.playerHp >= 15 &&
      engine.playerHp <= 26
    ) {
      for (const c of pick) engine.toggleSelectCard(c.uid);
      return;
    }
  }

  // Secondary fallback: relax playerHp slightly while preserving real multi-card combo + tell
  for (let offset = 0; offset < 60; offset += 1) {
    engine.startMatch(0, seed + offset);
    for (let r = 1; r < targetRound; r += 1) {
      const pick = chooseTacticalPlayerPlay(engine);
      if (pick.length === 0) engine.cycleSelectedCards();
      else {
        for (const c of pick) engine.toggleSelectCard(c.uid);
        engine.playSelectedTrick();
      }
      engine.advanceFromClash();
      if (engine.phase !== PHASES.SELECT) break;
    }
    if (engine.phase !== PHASES.SELECT) continue;
    const pick = chooseTacticalPlayerPlay(engine);
    const trick = evaluateTrick(pick);
    if (engine.oppCommittedCards.length >= 2 && pick.length >= 2 && trick.comboBonus >= 4) {
      for (const c of pick) engine.toggleSelectCard(c.uid);
      return;
    }
  }
}

function runSimulatedVictory(engine, seed) {
  for (let offset = 0; offset < 90; offset += 1) {
    const trial = new MatchEngine(seed + offset);
    trial.startMatch(0, seed + offset);
    let safety = 0;
    while (trial.phase === PHASES.SELECT && safety < 14) {
      safety += 1;
      const pick = chooseTacticalPlayerPlay(trial);
      if (pick.length === 0) trial.cycleSelectedCards();
      else {
        for (const c of pick) trial.toggleSelectCard(c.uid);
        trial.playSelectedTrick();
      }
      trial.advanceFromClash();
    }
    if (
      trial.phase === PHASES.VICTORY &&
      trial.round >= 4 &&
      trial.round <= 8 &&
      trial.oppHp === 0 &&
      trial.playerHp >= 10 &&
      trial.playerHp <= 27 &&
      trial.playerPlayedCards.length >= 2 &&
      trial.lastClash?.playerTrick?.comboBonus >= 4 &&
      trial.lastClash?.damageToOpp >= 6
    ) {
      replayInto(engine, 0, seed + offset, chooseTacticalPlayerPlay);
      return;
    }
  }
  replayInto(engine, 0, seed, chooseTacticalPlayerPlay);
}

function runSimulatedDefeat(engine, seed) {
  for (let offset = 0; offset < 120; offset += 1) {
    const trial = new MatchEngine(seed + offset);
    trial.startMatch(2, seed + offset);
    let safety = 0;
    while (trial.phase === PHASES.SELECT && safety < 14) {
      safety += 1;
      // Play smart on Rounds 1-2 so it is a genuine back-and-forth match before Corvus outplays reckless reads
      const pick = safety <= 2 ? chooseTacticalPlayerPlay(trial) : chooseRecklessPlayerPlay(trial);
      if (pick.length === 0) trial.cycleSelectedCards();
      else {
        for (const c of pick) trial.toggleSelectCard(c.uid);
        trial.playSelectedTrick();
      }
      trial.advanceFromClash();
    }
    if (
      trial.phase === PHASES.DEFEAT &&
      trial.round >= 4 &&
      trial.playerHp === 0 &&
      trial.oppHp >= 8 &&
      trial.oppHp <= 25 &&
      trial.oppCommittedCards.length >= 2 &&
      trial.playerPlayedCards.length >= 1
    ) {
      replayDefeatInto(engine, 2, seed + offset);
      return;
    }
  }
  replayDefeatInto(engine, 2, seed);
}

function replayInto(engine, rivalIndex, seed, policy) {
  engine.startMatch(rivalIndex, seed);
  let safety = 0;
  while (engine.phase === PHASES.SELECT && safety < 14) {
    safety += 1;
    const pick = policy(engine);
    if (pick.length === 0) engine.cycleSelectedCards();
    else {
      for (const c of pick) engine.toggleSelectCard(c.uid);
      engine.playSelectedTrick();
    }
    engine.advanceFromClash();
  }
}

function replayDefeatInto(engine, rivalIndex, seed) {
  engine.startMatch(rivalIndex, seed);
  let safety = 0;
  while (engine.phase === PHASES.SELECT && safety < 14) {
    safety += 1;
    const pick = safety <= 2 ? chooseTacticalPlayerPlay(engine) : chooseRecklessPlayerPlay(engine);
    if (pick.length === 0) engine.cycleSelectedCards();
    else {
      for (const c of pick) engine.toggleSelectCard(c.uid);
      engine.playSelectedTrick();
    }
    engine.advanceFromClash();
  }
}

export function stageShot(name, seed, engine, renderer, anim, uiState) {
  const mode = (name || 'title').toLowerCase();
  anim.particles = [];
  anim.callouts = [];
  anim.shake = 0;
  anim.flash = 0;
  anim.time = 1.65;

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
    // Subtle golden glow sparks above selected combo cards
    anim.spawnBurst(630, 505, '#FFE072', 14, 95, 35, 412);
    anim.step(0.18, false);
    return;
  }

  if (mode === 'victory' || mode === 'win') {
    runSimulatedVictory(engine, seed);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.snapAll();
    anim.spawnVictoryFlourish(630, 490);
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
