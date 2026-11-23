// Complete Lantern Trick run state machine: 5-rival circuit, Gambit ×2 raises, Relic drafts & live Gilded Foil forging.
import { createDeckBlueprint, applyGildToCard, cardKey, GILD_BY_SUIT, doesSuitTrump } from './cards.js';
import { createRng, DeckPile } from './deck.js';
import { evaluateTrick, resolveClash } from './combos.js';
import { RIVALS, chooseOpponentPlay, shouldRivalRaiseGambit, buildTelegraph, applyRivalRelic } from './ai.js';
import { buildRelicDraftChoices, buildGildedMapFromRelics, computePlayerRelicMods } from './relics.js';

export const PHASES = { TITLE: 'title', SELECT: 'select', CLASH: 'clash', VICTORY: 'victory', DEFEAT: 'defeat' };
export const HAND_SIZE = 5;
export const MAX_ROUNDS = 12;
export const PLAYER_MAX_HP = 30;
export const MAX_LANTERNS = 6;
export const FORGE_COST = 2;
export const CLASH_DURATION = 1.85;

export class MatchEngine {
  constructor(seed = 7) {
    this.seed = seed; this.rng = createRng(seed); this.rivalIndex = 0;
    this.phase = PHASES.TITLE; this.rulesOpen = false; this.round = 1;
    this.playerHp = PLAYER_MAX_HP; this.playerMaxHp = PLAYER_MAX_HP;
    this.oppHp = RIVALS[0].maxHp; this.oppMaxHp = RIVALS[0].maxHp;
    this.playerLanterns = 3; this.playerMaxLanterns = 3; this.oppLanterns = 3;
    this.playerNextBonusLantern = 0; this.oppNextBonusLantern = 0;
    this.playerBonusDraw = 0; this.oppBonusDraw = 0;
    this.playerWard = 0; this.oppWard = 0; this.playerCarryWard = 0;
    this.playerScore = 0; this.oppScore = 0;
    this.playerRelics = []; this.gildedCards = {}; this.draftChoices = []; this.trophies = 0;
    this.gambitActive = false; this.gambitBy = null;
    this.playerDeck = null; this.oppDeck = null;
    this.playerHand = []; this.oppHand = []; this.selectedIds = [];
    this.oppTelegraph = null; this.oppCommittedCards = []; this.playerPlayedCards = [];
    this.playerLastSuit = null; this.lastClash = null; this.clashTimer = 0; this.chronicle = [];
    this.matchStats = { combosLanded: 0, trumpsLanded: 0, gambitsWon: 0, bestTrickName: 'STRIKE', bestTrickPower: 0 };
    this.listeners = [];
  }

  get rival() { return RIVALS[this.rivalIndex] ?? RIVALS[0]; }
  onEvent(cb) { this.listeners.push(cb); }
  emit(type, payload = {}) { for (const cb of this.listeners) cb(type, payload); }

  setRival(index) {
    this.rivalIndex = ((index % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.oppMaxHp = this.rival.maxHp; this.oppHp = this.rival.maxHp;
    this.emit('rivalChange', { rival: this.rival });
  }

  startMatch(rivalIndex = this.rivalIndex, seed = this.seed, keepRelics = false) {
    this.rivalIndex = ((rivalIndex % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.seed = seed; this.rng = createRng(seed + this.rivalIndex * 97);
    this.round = 1; this.phase = PHASES.SELECT; this.rulesOpen = false;
    if (!keepRelics) { this.playerRelics = []; this.trophies = 0; this.gildedCards = {}; }
    this.gildedCards = { ...this.gildedCards, ...buildGildedMapFromRelics(this.playerRelics) };
    this.draftChoices = []; this.gambitActive = false; this.gambitBy = null;

    this.playerHp = PLAYER_MAX_HP; this.playerMaxHp = PLAYER_MAX_HP;
    this.oppHp = this.rival.maxHp; this.oppMaxHp = this.rival.maxHp;
    this.playerWard = 0; this.oppWard = 0; this.playerCarryWard = 0;
    this.playerScore = keepRelics ? this.playerScore : 0; this.oppScore = 0;
    this.playerNextBonusLantern = 0; this.oppNextBonusLantern = 0;
    this.playerBonusDraw = 0; this.oppBonusDraw = 0;
    this.playerLastSuit = null; this.lastClash = null; this.clashTimer = 0; this.chronicle = [];
    this.matchStats = { combosLanded: 0, trumpsLanded: 0, gambitsWon: 0, bestTrickName: 'STRIKE', bestTrickPower: 0 };

    this.playerDeck = new DeckPile(createDeckBlueprint('p', this.gildedCards), this.rng);
    this.oppDeck = new DeckPile(createDeckBlueprint('o'), this.rng);
    this.playerHand = []; this.oppHand = []; this.selectedIds = [];
    this.playerPlayedCards = []; this.oppCommittedCards = [];

    this.beginRound();
    this.emit('matchStart', { rival: this.rival });
  }

  beginRound() {
    this.phase = PHASES.SELECT; this.selectedIds = []; this.playerPlayedCards = [];
    this.clashTimer = 0; this.gambitActive = false; this.gambitBy = null;

    const extraL = this.playerRelics.includes('tideglass') ? 1 : 0;
    const baseL = Math.min(MAX_LANTERNS, 2 + this.round) + extraL;
    this.playerMaxLanterns = Math.min(MAX_LANTERNS + 3, baseL + this.playerNextBonusLantern);
    this.playerLanterns = this.playerMaxLanterns;
    this.oppLanterns = Math.min(MAX_LANTERNS + 2, Math.min(MAX_LANTERNS, 2 + this.round) + this.oppNextBonusLantern);
    this.playerNextBonusLantern = 0; this.oppNextBonusLantern = 0;

    this.playerWard = this.playerCarryWard + (this.playerRelics.includes('hearth_crown') ? 2 : 0);
    this.playerCarryWard = 0; this.oppWard = 0;

    const pTarget = Math.min(6, HAND_SIZE + this.playerBonusDraw);
    const oTarget = Math.min(6, HAND_SIZE + this.oppBonusDraw);
    this.playerBonusDraw = 0; this.oppBonusDraw = 0;

    if (this.playerHand.length < pTarget) this.playerHand.push(...this.playerDeck.drawMany(pTarget - this.playerHand.length));
    if (this.oppHand.length < oTarget) this.oppHand.push(...this.oppDeck.drawMany(oTarget - this.oppHand.length));

    this.oppCommittedCards = chooseOpponentPlay(
      this.oppHand, this.oppLanterns, this.rival,
      { oppHp: this.oppHp, playerHp: this.playerHp, playerLastSuit: this.playerLastSuit, round: this.round },
      this.rng,
    );
    const cSet = new Set(this.oppCommittedCards.map((c) => c.uid));
    this.oppHand = this.oppHand.filter((c) => !cSet.has(c.uid));

    if (shouldRivalRaiseGambit(evaluateTrick(this.oppCommittedCards), this.rival, this.round, this.rng)) {
      this.gambitActive = true; this.gambitBy = 'rival';
    }
    this.oppTelegraph = buildTelegraph(this.oppCommittedCards, this.rival, this.gambitActive);
    this.emit('roundStart', { round: this.round, telegraph: this.oppTelegraph, gambitActive: this.gambitActive });
  }

  toggleGambitRaise() {
    if (this.phase !== PHASES.SELECT) return false;
    if (this.gambitBy === 'rival') {
      this.emit('invalidAction', { reason: `${this.rival.name} raised ×2 — play or Fold!` });
      return false;
    }
    this.gambitActive = !this.gambitActive;
    this.gambitBy = this.gambitActive ? 'player' : null;
    this.oppTelegraph = buildTelegraph(this.oppCommittedCards, this.rival, this.gambitActive);
    this.emit('gambitToggle', { active: this.gambitActive, by: this.gambitBy });
    return true;
  }

  getSelectedCards() { const s = new Set(this.selectedIds); return this.playerHand.filter((c) => s.has(c.uid)); }
  getSelectedTrick() { return evaluateTrick(this.getSelectedCards()); }

  getSelectedProjectedMods() {
    const tr = this.getSelectedTrick();
    return computePlayerRelicMods(this.playerRelics, tr, doesSuitTrump(tr.leadSuit, this.oppTelegraph?.leadSuit), this.gambitActive);
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
    if (this.selectedIds.length >= 3) { this.emit('invalidAction', { reason: 'Max 3 cards per trick' }); return false; }
    const cost = this.getSelectedTrick().totalCost + card.cost;
    if (cost > this.playerLanterns) { this.emit('invalidAction', { reason: `Need ${cost} Lanterns (have ${this.playerLanterns})` }); return false; }
    this.selectedIds.push(uid);
    this.emit('selectChange', { selectedIds: this.selectedIds.slice(), card, selected: true });
    return true;
  }

  toggleSelectIndex(index) { return index >= 0 && index < this.playerHand.length ? this.toggleSelectCard(this.playerHand[index].uid) : false; }
  canPlaySelected() { return this.phase === PHASES.SELECT && this.selectedIds.length > 0 && this.getSelectedTrick().totalCost <= this.playerLanterns; }

  canForgeSelectedCard() {
    if (this.phase !== PHASES.SELECT || this.playerLanterns < FORGE_COST) return false;
    const target = this.getSelectedCards().find((c) => !c.gilded) ?? this.playerHand.find((c) => !c.gilded);
    return Boolean(target);
  }

  forgeSelectedCard() {
    if (this.phase !== PHASES.SELECT) return null;
    if (this.playerLanterns < FORGE_COST) {
      this.emit('invalidAction', { reason: `Need ${FORGE_COST} Lanterns to Forge Foil` });
      return null;
    }
    const target = this.getSelectedCards().find((c) => !c.gilded) ?? this.playerHand.find((c) => !c.gilded);
    if (!target) {
      this.emit('invalidAction', { reason: 'All cards in hand are already Gilded!' });
      return null;
    }
    const gildId = GILD_BY_SUIT[target.suit] ?? 'solar';
    applyGildToCard(target, gildId);
    this.gildedCards[cardKey(target.suit, target.rank)] = gildId;
    this.playerLanterns -= FORGE_COST;
    this.playerScore += 60;
    this.emit('cardForged', { card: target, gildId });
    return target;
  }

  playSelectedTrick() {
    if (!this.canPlaySelected()) return null;
    const played = this.getSelectedCards();
    const pSet = new Set(played.map((c) => c.uid));
    this.playerHand = this.playerHand.filter((c) => !pSet.has(c.uid));
    this.selectedIds = []; this.playerPlayedCards = played;

    const pTr = evaluateTrick(played); const oTr = this.oppTelegraph.trick;
    const oppRelic = applyRivalRelic(oTr, this.rival, this.gambitActive);
    const pTrumps = !oTr.ignoreEnemyTrump && doesSuitTrump(pTr.leadSuit, oTr.leadSuit);
    const pMods = computePlayerRelicMods(this.playerRelics, pTr, pTrumps, this.gambitActive);

    this.playerLanterns = Math.max(0, this.playerLanterns - pTr.totalCost);
    this.playerLastSuit = pTr.leadSuit;

    const clash = resolveClash(pTr, oTr, this.playerWard, this.oppWard, oppRelic, pMods, this.gambitActive);
    this.playerWard = Math.min(8, Math.max(0, this.playerWard + pTr.ward + clash.gambitWardGain - (clash.winner === 'opponent' ? clash.damageToPlayer : 0)));
    this.oppWard = Math.min(8, Math.max(0, this.oppWard + oTr.ward - (clash.winner === 'player' ? clash.damageToOpp : 0)));
    this.playerHp = Math.min(this.playerMaxHp, Math.max(0, this.playerHp + clash.playerHeal - clash.damageToPlayer));
    this.oppHp = Math.min(this.oppMaxHp, Math.max(0, this.oppHp + clash.oppHeal - clash.damageToOpp));
    this.playerScore += clash.playerScoreGain; this.oppScore += clash.oppScoreGain;

    this.playerNextBonusLantern += pTr.nextLantern + clash.tieBonusLantern;
    this.oppNextBonusLantern += oTr.nextLantern + clash.tieBonusLantern;
    this.playerBonusDraw += pTr.bonusDraw; this.oppBonusDraw += oTr.bonusDraw;

    if (pTr.comboBonus > 0) this.matchStats.combosLanded += 1;
    if (clash.playerTrumps) this.matchStats.trumpsLanded += 1;
    if (clash.gambitActive && clash.winner === 'player') { this.matchStats.gambitsWon += 1; this.trophies += 1; }
    if (clash.playerPower >= this.matchStats.bestTrickPower) { this.matchStats.bestTrickPower = clash.playerPower; this.matchStats.bestTrickName = pTr.comboName; }

    this.lastClash = { round: this.round, playerTrick: pTr, oppTrick: oTr, ...clash };
    this.chronicle.unshift({
      round: this.round, winner: clash.winner, playerPower: clash.playerPower, oppPower: clash.oppPower,
      playerSuit: pTr.leadSuit, oppSuit: oTr.leadSuit, playerCombo: pTr.comboShort, oppCombo: oTr.comboShort,
      damage: clash.winner === 'player' ? clash.damageToOpp : clash.damageToPlayer,
      trumped: clash.playerTrumps || clash.oppTrumps, counterBreak: clash.counterBreak, gambit: clash.gambitActive,
    });
    if (this.chronicle.length > 6) this.chronicle.pop();

    this.phase = PHASES.CLASH; this.clashTimer = CLASH_DURATION;
    this.emit('clash', this.lastClash);
    return this.lastClash;
  }

  cycleSelectedCards() {
    if (this.phase !== PHASES.SELECT) return null;
    let disc = this.getSelectedCards().slice(0, 2);
    if (disc.length === 0 && this.playerHand.length > 0) disc = [this.playerHand.slice().sort((a, b) => a.rank - b.rank)[0]];
    const dIds = new Set(disc.map((c) => c.uid));
    this.playerHand = this.playerHand.filter((c) => !dIds.has(c.uid));
    this.playerDeck.discard(disc); this.selectedIds = []; this.playerPlayedCards = [];

    const oTr = this.oppTelegraph.trick; const oppRelic = applyRivalRelic(oTr, this.rival, false);
    const rawDmg = this.gambitActive ? 4 : Math.max(2, Math.floor((oTr.totalPower + oppRelic.powerBonus) * 0.62) + oTr.burn);
    const dmg = Math.max(1, rawDmg - Math.max(0, this.playerWard + 5 - oTr.pierce));

    this.playerWard = 4; this.playerCarryWard = 4;
    this.playerHp = Math.max(0, this.playerHp - dmg);
    this.oppHp = Math.min(this.oppMaxHp, this.oppHp + oTr.heal + oppRelic.healBonus);
    this.playerNextBonusLantern += 2; this.playerScore += 35; this.oppScore += 75;

    const syn = evaluateTrick([]);
    syn.comboName = this.gambitActive ? 'FOLD & KINDLE' : 'KINDLE HEARTH'; syn.comboShort = 'KINDLE +2✦';
    this.lastClash = {
      round: this.round, playerTrick: syn, oppTrick: oTr, winner: 'opponent',
      playerPower: 0, oppPower: oTr.totalPower + oppRelic.powerBonus,
      playerTrumps: false, oppTrumps: false, counterBreak: false, gambitActive: false,
      damageToOpp: 0, damageToPlayer: dmg, playerHeal: 0, oppHeal: oTr.heal + oppRelic.healBonus,
      playerScoreGain: 35, oppScoreGain: 75, tieBonusLantern: 0,
      headline: this.gambitActive ? 'FOLDED GAMBIT ×2 · +4 WARD & +2✦ NEXT' : 'KINDLED HEARTH (+4 WARD · +2✦ NEXT)',
    };
    this.chronicle.unshift({ round: this.round, winner: 'cycle', playerPower: 0, oppPower: oTr.totalPower + oppRelic.powerBonus, playerSuit: 'brass', oppSuit: oTr.leadSuit, playerCombo: 'KINDLE +2✦', oppCombo: oTr.comboShort, damage: dmg, trumped: false, counterBreak: false, gambit: false });
    if (this.chronicle.length > 6) this.chronicle.pop();

    this.phase = PHASES.CLASH; this.clashTimer = CLASH_DURATION;
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
      this.playerScore += this.playerHp * 20; this.trophies += 1;
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
    this.playerDeck.discard(this.playerPlayedCards); this.oppDeck.discard(this.oppCommittedCards);
    this.round += 1; this.beginRound();
  }

  pickRelicAndAdvance(relicId) {
    if (this.phase !== PHASES.VICTORY) return false;
    if (relicId && !this.playerRelics.includes(relicId) && this.playerRelics.length < 4) this.playerRelics.push(relicId);
    const nextIdx = (this.rivalIndex + 1) % RIVALS.length;
    this.emit('relicDrafted', { relicId, nextRival: RIVALS[nextIdx] });
    this.startMatch(nextIdx, this.seed + 13, nextIdx !== 0);
    return true;
  }

  nextRival() { this.pickRelicAndAdvance(this.draftChoices[0]?.id ?? null); }
}
