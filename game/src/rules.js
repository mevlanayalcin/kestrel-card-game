// Complete Lantern Trick run state machine: 5-rival circuit, Gambit ×2 raises, and Relic drafting.
import { createDeckBlueprint, doesSuitTrump } from './cards.js';
import { createRng, DeckPile } from './deck.js';
import { evaluateTrick, resolveClash } from './combos.js';
import { RIVALS, chooseOpponentPlay, shouldRivalRaiseGambit, buildTelegraph, applyRivalRelic } from './ai.js';
import { buildRelicDraftChoices, computePlayerRelicMods } from './relics.js';

export const PHASES = {
  TITLE: 'title',
  SELECT: 'select',
  CLASH: 'clash',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
};

export const HAND_SIZE = 5;
export const MAX_ROUNDS = 12;
export const PLAYER_MAX_HP = 30;
export const MAX_LANTERNS = 6;
export const CLASH_DURATION = 1.85;

export class MatchEngine {
  constructor(seed = 7) {
    this.seed = seed;
    this.rng = createRng(seed);
    this.rivalIndex = 0;
    this.phase = PHASES.TITLE;
    this.rulesOpen = false;
    this.round = 1;
    this.playerHp = PLAYER_MAX_HP;
    this.playerMaxHp = PLAYER_MAX_HP;
    this.oppHp = RIVALS[0].maxHp;
    this.oppMaxHp = RIVALS[0].maxHp;
    this.playerLanterns = 3;
    this.playerMaxLanterns = 3;
    this.oppLanterns = 3;
    this.playerNextBonusLantern = 0;
    this.oppNextBonusLantern = 0;
    this.playerBonusDraw = 0;
    this.oppBonusDraw = 0;
    this.playerWard = 0;
    this.oppWard = 0;
    this.playerCarryWard = 0;
    this.playerScore = 0;
    this.oppScore = 0;
    this.playerRelics = [];
    this.draftChoices = [];
    this.trophies = 0;
    this.gambitActive = false;
    this.gambitBy = null; // 'player' | 'rival' | null
    this.playerDeck = null;
    this.oppDeck = null;
    this.playerHand = [];
    this.oppHand = [];
    this.selectedIds = [];
    this.oppTelegraph = null;
    this.oppCommittedCards = [];
    this.playerPlayedCards = [];
    this.playerLastSuit = null;
    this.lastClash = null;
    this.clashTimer = 0;
    this.chronicle = [];
    this.matchStats = { combosLanded: 0, trumpsLanded: 0, gambitsWon: 0, bestTrickName: 'STRIKE', bestTrickPower: 0 };
    this.listeners = [];
  }

  get rival() { return RIVALS[this.rivalIndex] ?? RIVALS[0]; }
  onEvent(cb) { this.listeners.push(cb); }
  emit(type, payload = {}) { for (const cb of this.listeners) cb(type, payload); }

  setRival(index) {
    this.rivalIndex = ((index % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.oppMaxHp = this.rival.maxHp;
    this.oppHp = this.rival.maxHp;
    this.emit('rivalChange', { rival: this.rival });
  }

  startMatch(rivalIndex = this.rivalIndex, seed = this.seed, keepRelics = false) {
    this.rivalIndex = ((rivalIndex % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.seed = seed;
    this.rng = createRng(seed + this.rivalIndex * 97);
    this.round = 1;
    this.phase = PHASES.SELECT;
    this.rulesOpen = false;
    if (!keepRelics) { this.playerRelics = []; this.trophies = 0; }
    this.draftChoices = [];
    this.gambitActive = false;
    this.gambitBy = null;

    this.playerHp = PLAYER_MAX_HP;
    this.playerMaxHp = PLAYER_MAX_HP;
    this.oppHp = this.rival.maxHp;
    this.oppMaxHp = this.rival.maxHp;
    this.playerWard = 0;
    this.oppWard = 0;
    this.playerCarryWard = 0;
    this.playerScore = keepRelics ? this.playerScore : 0;
    this.oppScore = 0;
    this.playerNextBonusLantern = 0;
    this.oppNextBonusLantern = 0;
    this.playerBonusDraw = 0;
    this.oppBonusDraw = 0;
    this.playerLastSuit = null;
    this.lastClash = null;
    this.clashTimer = 0;
    this.chronicle = [];
    this.matchStats = { combosLanded: 0, trumpsLanded: 0, gambitsWon: 0, bestTrickName: 'STRIKE', bestTrickPower: 0 };

    this.playerDeck = new DeckPile(createDeckBlueprint('p'), this.rng);
    this.oppDeck = new DeckPile(createDeckBlueprint('o'), this.rng);
    this.playerHand = [];
    this.oppHand = [];
    this.selectedIds = [];
    this.playerPlayedCards = [];
    this.oppCommittedCards = [];

    this.beginRound();
    this.emit('matchStart', { rival: this.rival });
  }

  beginRound() {
    this.phase = PHASES.SELECT;
    this.selectedIds = [];
    this.playerPlayedCards = [];
    this.clashTimer = 0;
    this.gambitActive = false;
    this.gambitBy = null;

    const relicExtraLantern = this.playerRelics.includes('tideglass') ? 1 : 0;
    const baseLanterns = Math.min(MAX_LANTERNS, 2 + this.round) + relicExtraLantern;
    this.playerMaxLanterns = Math.min(MAX_LANTERNS + 3, baseLanterns + this.playerNextBonusLantern);
    this.playerLanterns = this.playerMaxLanterns;
    this.oppLanterns = Math.min(MAX_LANTERNS + 2, Math.min(MAX_LANTERNS, 2 + this.round) + this.oppNextBonusLantern);
    this.playerNextBonusLantern = 0;
    this.oppNextBonusLantern = 0;

    const crownWard = this.playerRelics.includes('hearth_crown') ? 2 : 0;
    this.playerWard = this.playerCarryWard + crownWard;
    this.playerCarryWard = 0;
    this.oppWard = 0;

    const pTarget = Math.min(6, HAND_SIZE + this.playerBonusDraw);
    const oTarget = Math.min(6, HAND_SIZE + this.oppBonusDraw);
    this.playerBonusDraw = 0;
    this.oppBonusDraw = 0;

    if (this.playerHand.length < pTarget) this.playerHand.push(...this.playerDeck.drawMany(pTarget - this.playerHand.length));
    if (this.oppHand.length < oTarget) this.oppHand.push(...this.oppDeck.drawMany(oTarget - this.oppHand.length));

    this.oppCommittedCards = chooseOpponentPlay(
      this.oppHand, this.oppLanterns, this.rival,
      { oppHp: this.oppHp, playerHp: this.playerHp, playerLastSuit: this.playerLastSuit, round: this.round },
      this.rng,
    );
    const committedSet = new Set(this.oppCommittedCards.map((c) => c.uid));
    this.oppHand = this.oppHand.filter((c) => !committedSet.has(c.uid));

    // Check if the rival boldly opens with a Gambit ×2 stake raise!
    const prelimTrick = evaluateTrick(this.oppCommittedCards);
    if (shouldRivalRaiseGambit(prelimTrick, this.rival, this.round, this.rng)) {
      this.gambitActive = true;
      this.gambitBy = 'rival';
    }
    this.oppTelegraph = buildTelegraph(this.oppCommittedCards, this.rival, this.gambitActive);
    this.emit('roundStart', { round: this.round, telegraph: this.oppTelegraph, gambitActive: this.gambitActive });
  }

  toggleGambitRaise() {
    if (this.phase !== PHASES.SELECT) return false;
    if (this.gambitBy === 'rival') {
      this.emit('invalidAction', { reason: `${this.rival.name} already raised Gambit ×2 — play or Fold & Kindle!` });
      return false;
    }
    this.gambitActive = !this.gambitActive;
    this.gambitBy = this.gambitActive ? 'player' : null;
    this.oppTelegraph = buildTelegraph(this.oppCommittedCards, this.rival, this.gambitActive);
    this.emit('gambitToggle', { active: this.gambitActive, by: this.gambitBy });
    return true;
  }

  getSelectedCards() {
    const idSet = new Set(this.selectedIds);
    return this.playerHand.filter((c) => idSet.has(c.uid));
  }

  getSelectedTrick() { return evaluateTrick(this.getSelectedCards()); }

  getSelectedProjectedMods() {
    const trick = this.getSelectedTrick();
    const trumps = doesSuitTrump(trick.leadSuit, this.oppTelegraph?.leadSuit);
    return computePlayerRelicMods(this.playerRelics, trick, trumps, this.gambitActive);
  }

  getRivalRemainingSuits() {
    const counts = { ember: 0, tide: 0, bramble: 0, brass: 0 };
    if (!this.oppDeck) return counts;
    for (const c of this.oppDeck.drawPile) counts[c.suit] += 1;
    for (const c of this.oppHand) counts[c.suit] += 1;
    if (this.phase === PHASES.SELECT && this.oppCommittedCards.length > 1) {
      for (let i = 1; i < this.oppCommittedCards.length; i += 1) counts[this.oppCommittedCards[i].suit] += 1;
    }
    return counts;
  }

  toggleSelectCard(uid) {
    if (this.phase !== PHASES.SELECT) return false;
    const card = this.playerHand.find((c) => c.uid === uid);
    if (!card) return false;
    const idx = this.selectedIds.indexOf(uid);
    if (idx !== -1) {
      this.selectedIds.splice(idx, 1);
      this.emit('selectChange', { selectedIds: this.selectedIds.slice(), card, selected: false });
      return true;
    }
    if (this.selectedIds.length >= 3) {
      this.emit('invalidAction', { reason: 'Max 3 cards per trick' });
      return false;
    }
    const cost = this.getSelectedTrick().totalCost + card.cost;
    if (cost > this.playerLanterns) {
      this.emit('invalidAction', { reason: `Need ${cost} Lanterns (have ${this.playerLanterns})` });
      return false;
    }
    this.selectedIds.push(uid);
    this.emit('selectChange', { selectedIds: this.selectedIds.slice(), card, selected: true });
    return true;
  }

  toggleSelectIndex(index) {
    if (index < 0 || index >= this.playerHand.length) return false;
    return this.toggleSelectCard(this.playerHand[index].uid);
  }

  canPlaySelected() {
    return this.phase === PHASES.SELECT && this.selectedIds.length > 0 && this.getSelectedTrick().totalCost <= this.playerLanterns;
  }

  playSelectedTrick() {
    if (!this.canPlaySelected()) return null;
    const played = this.getSelectedCards();
    const playedSet = new Set(played.map((c) => c.uid));
    this.playerHand = this.playerHand.filter((c) => !playedSet.has(c.uid));
    this.selectedIds = [];
    this.playerPlayedCards = played;

    const playerTrick = evaluateTrick(played);
    const oppTrick = this.oppTelegraph.trick;
    const oppRelic = applyRivalRelic(oppTrick, this.rival, this.gambitActive);
    const pTrumps = !oppTrick.ignoreEnemyTrump && doesSuitTrump(playerTrick.leadSuit, oppTrick.leadSuit);
    const playerMods = computePlayerRelicMods(this.playerRelics, playerTrick, pTrumps, this.gambitActive);

    this.playerLanterns = Math.max(0, this.playerLanterns - playerTrick.totalCost);
    this.playerLastSuit = playerTrick.leadSuit;

    const clash = resolveClash(playerTrick, oppTrick, this.playerWard, this.oppWard, oppRelic, playerMods, this.gambitActive);
    this.playerWard = Math.min(8, Math.max(0, this.playerWard + playerTrick.ward + clash.gambitWardGain - (clash.winner === 'opponent' ? clash.damageToPlayer : 0)));
    this.oppWard = Math.min(8, Math.max(0, this.oppWard + oppTrick.ward - (clash.winner === 'player' ? clash.damageToOpp : 0)));
    this.playerHp = Math.min(this.playerMaxHp, Math.max(0, this.playerHp + clash.playerHeal - clash.damageToPlayer));
    this.oppHp = Math.min(this.oppMaxHp, Math.max(0, this.oppHp + clash.oppHeal - clash.damageToOpp));
    this.playerScore += clash.playerScoreGain;
    this.oppScore += clash.oppScoreGain;

    this.playerNextBonusLantern += playerTrick.nextLantern + clash.tieBonusLantern;
    this.oppNextBonusLantern += oppTrick.nextLantern + clash.tieBonusLantern;
    this.playerBonusDraw += playerTrick.bonusDraw;
    this.oppBonusDraw += oppTrick.bonusDraw;

    if (playerTrick.comboBonus > 0) this.matchStats.combosLanded += 1;
    if (clash.playerTrumps) this.matchStats.trumpsLanded += 1;
    if (clash.gambitActive && clash.winner === 'player') { this.matchStats.gambitsWon += 1; this.trophies += 1; }
    if (clash.playerPower >= this.matchStats.bestTrickPower) {
      this.matchStats.bestTrickPower = clash.playerPower;
      this.matchStats.bestTrickName = playerTrick.comboName;
    }

    this.lastClash = { round: this.round, playerTrick, oppTrick, ...clash };
    this.chronicle.unshift({
      round: this.round, winner: clash.winner, playerPower: clash.playerPower, oppPower: clash.oppPower,
      playerSuit: playerTrick.leadSuit, oppSuit: oppTrick.leadSuit,
      playerCombo: playerTrick.comboShort, oppCombo: oppTrick.comboShort,
      damage: clash.winner === 'player' ? clash.damageToOpp : clash.damageToPlayer,
      trumped: clash.playerTrumps || clash.oppTrumps, counterBreak: clash.counterBreak, gambit: clash.gambitActive,
    });
    if (this.chronicle.length > 6) this.chronicle.pop();

    this.phase = PHASES.CLASH;
    this.clashTimer = CLASH_DURATION;
    this.emit('clash', this.lastClash);
    return this.lastClash;
  }

  cycleSelectedCards() {
    if (this.phase !== PHASES.SELECT) return null;
    let discarded = this.getSelectedCards().slice(0, 2);
    if (discarded.length === 0 && this.playerHand.length > 0) {
      discarded = [this.playerHand.slice().sort((a, b) => a.rank - b.rank)[0]];
    }
    const discardIds = new Set(discarded.map((c) => c.uid));
    this.playerHand = this.playerHand.filter((c) => !discardIds.has(c.uid));
    this.playerDeck.discard(discarded);
    this.selectedIds = [];
    this.playerPlayedCards = [];

    const oppTrick = this.oppTelegraph.trick;
    const oppRelic = applyRivalRelic(oppTrick, this.rival, false);
    const bracedWard = this.playerWard + 5;
    // Folding a rival Gambit ×2 avoids the ×2 punish!
    const rawOppDmg = this.gambitActive ? 4 : Math.max(2, Math.floor((oppTrick.totalPower + oppRelic.powerBonus) * 0.62) + oppTrick.burn);
    const dmg = Math.max(1, rawOppDmg - Math.max(0, bracedWard - oppTrick.pierce));

    this.playerWard = 4;
    this.playerCarryWard = 4;
    this.playerHp = Math.max(0, this.playerHp - dmg);
    this.oppHp = Math.min(this.oppMaxHp, this.oppHp + oppTrick.heal + oppRelic.healBonus);
    this.playerNextBonusLantern += 2;
    this.playerScore += 35;
    this.oppScore += 75;

    const syn = evaluateTrick([]);
    syn.comboName = this.gambitActive ? 'FOLD & KINDLE' : 'KINDLE HEARTH';
    syn.comboShort = 'KINDLE +2✦';

    this.lastClash = {
      round: this.round, playerTrick: syn, oppTrick, winner: 'opponent',
      playerPower: 0, oppPower: oppTrick.totalPower + oppRelic.powerBonus,
      playerTrumps: false, oppTrumps: false, counterBreak: false, gambitActive: false,
      damageToOpp: 0, damageToPlayer: dmg, playerHeal: 0, oppHeal: oppTrick.heal + oppRelic.healBonus,
      playerScoreGain: 35, oppScoreGain: 75, tieBonusLantern: 0,
      headline: this.gambitActive ? 'FOLDED GAMBIT ×2 · +4 WARD & +2✦ NEXT' : 'KINDLED HEARTH (+4 WARD · +2 LANTERNS NEXT)',
    };
    this.chronicle.unshift({
      round: this.round, winner: 'cycle', playerPower: 0, oppPower: oppTrick.totalPower + oppRelic.powerBonus,
      playerSuit: 'brass', oppSuit: oppTrick.leadSuit, playerCombo: 'KINDLE +2✦', oppCombo: oppTrick.comboShort,
      damage: dmg, trumped: false, counterBreak: false, gambit: false,
    });
    if (this.chronicle.length > 6) this.chronicle.pop();

    this.phase = PHASES.CLASH;
    this.clashTimer = CLASH_DURATION;
    this.emit('clash', this.lastClash);
    return this.lastClash;
  }

  step(dt) {
    if (this.phase === PHASES.CLASH && this.clashTimer > 0) {
      this.clashTimer = Math.max(0, this.clashTimer - dt);
      if (this.clashTimer === 0) this.advanceFromClash();
    }
  }

  advanceFromClash() {
    if (this.phase !== PHASES.CLASH) return;
    if (this.oppHp <= 0 || (this.round >= MAX_ROUNDS && (this.playerHp > this.oppHp || (this.playerHp === this.oppHp && this.playerScore >= this.oppScore)))) {
      this.playerScore += this.playerHp * 20;
      this.trophies += 1;
      this.draftChoices = buildRelicDraftChoices(this.playerRelics, this.rng);
      this.phase = PHASES.VICTORY;
      this.emit('victory', { stats: this.matchStats, lastClash: this.lastClash, draftChoices: this.draftChoices });
      return;
    }
    if (this.playerHp <= 0 || this.round >= MAX_ROUNDS) {
      this.phase = PHASES.DEFEAT;
      this.emit('defeat', { stats: this.matchStats, lastClash: this.lastClash });
      return;
    }
    this.playerDeck.discard(this.playerPlayedCards);
    this.oppDeck.discard(this.oppCommittedCards);
    this.round += 1;
    this.beginRound();
  }

  pickRelicAndAdvance(relicId) {
    if (this.phase !== PHASES.VICTORY) return false;
    if (relicId && !this.playerRelics.includes(relicId) && this.playerRelics.length < 4) {
      this.playerRelics.push(relicId);
    }
    const nextIdx = (this.rivalIndex + 1) % RIVALS.length;
    const keepRun = nextIdx !== 0;
    this.emit('relicDrafted', { relicId, nextRival: RIVALS[nextIdx] });
    this.startMatch(nextIdx, this.seed + 13, keepRun);
    return true;
  }

  nextRival() {
    const firstChoice = this.draftChoices[0]?.id ?? null;
    this.pickRelicAndAdvance(firstChoice);
  }
}
