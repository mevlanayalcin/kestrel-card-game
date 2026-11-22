// Complete Lantern Trick match state machine: turns, hand selection, clash resolution, and gauntlet.
import { createDeckBlueprint } from './cards.js';
import { createRng, DeckPile } from './deck.js';
import { evaluateTrick, resolveClash } from './combos.js';
import { RIVALS, chooseOpponentPlay, buildTelegraph } from './ai.js';

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
    this.matchStats = {
      combosLanded: 0,
      trumpsLanded: 0,
      counterBreaks: 0,
      bestTrickName: 'SINGLE STRIKE',
      bestTrickPower: 0,
      finisherSummary: '',
    };
    this.listeners = [];
  }

  get rival() {
    return RIVALS[this.rivalIndex] ?? RIVALS[0];
  }

  onEvent(callback) {
    this.listeners.push(callback);
  }

  emit(type, payload = {}) {
    for (const cb of this.listeners) cb(type, payload);
  }

  setRival(index) {
    this.rivalIndex = ((index % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.oppMaxHp = this.rival.maxHp;
    this.oppHp = this.rival.maxHp;
    this.emit('rivalChange', { rival: this.rival });
  }

  startMatch(rivalIndex = this.rivalIndex, seed = this.seed) {
    this.rivalIndex = ((rivalIndex % RIVALS.length) + RIVALS.length) % RIVALS.length;
    this.seed = seed;
    this.rng = createRng(seed + this.rivalIndex * 97);
    this.round = 1;
    this.phase = PHASES.SELECT;
    this.rulesOpen = false;

    this.playerHp = PLAYER_MAX_HP;
    this.playerMaxHp = PLAYER_MAX_HP;
    this.oppHp = this.rival.maxHp;
    this.oppMaxHp = this.rival.maxHp;

    this.playerWard = 0;
    this.oppWard = 0;
    this.playerCarryWard = 0;
    this.playerScore = 0;
    this.oppScore = 0;
    this.playerNextBonusLantern = 0;
    this.oppNextBonusLantern = 0;
    this.playerBonusDraw = 0;
    this.oppBonusDraw = 0;
    this.playerLastSuit = null;
    this.lastClash = null;
    this.clashTimer = 0;
    this.chronicle = [];
    this.matchStats = {
      combosLanded: 0,
      trumpsLanded: 0,
      counterBreaks: 0,
      bestTrickName: 'SINGLE STRIKE',
      bestTrickPower: 0,
      finisherSummary: '',
    };

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

    const baseLanterns = Math.min(MAX_LANTERNS, 2 + this.round);
    this.playerMaxLanterns = Math.min(MAX_LANTERNS + 2, baseLanterns + this.playerNextBonusLantern);
    this.playerLanterns = this.playerMaxLanterns;
    this.oppLanterns = Math.min(MAX_LANTERNS + 2, baseLanterns + this.oppNextBonusLantern);
    this.playerNextBonusLantern = 0;
    this.oppNextBonusLantern = 0;

    // Ward is a single-round active shield (plus carry-over from Bracing/Cycling)
    this.playerWard = this.playerCarryWard;
    this.playerCarryWard = 0;
    this.oppWard = 0;

    const playerTargetHand = Math.min(6, HAND_SIZE + this.playerBonusDraw);
    const oppTargetHand = Math.min(6, HAND_SIZE + this.oppBonusDraw);
    this.playerBonusDraw = 0;
    this.oppBonusDraw = 0;

    if (this.playerHand.length < playerTargetHand) {
      this.playerHand.push(...this.playerDeck.drawMany(playerTargetHand - this.playerHand.length));
    }
    if (this.oppHand.length < oppTargetHand) {
      this.oppHand.push(...this.oppDeck.drawMany(oppTargetHand - this.oppHand.length));
    }

    // Opponent commits cards now and exposes 1 face-up card + readable tell
    this.oppCommittedCards = chooseOpponentPlay(
      this.oppHand,
      this.oppLanterns,
      this.rival,
      { oppHp: this.oppHp, playerHp: this.playerHp, playerLastSuit: this.playerLastSuit, round: this.round },
      this.rng,
    );
    const committedSet = new Set(this.oppCommittedCards.map((c) => c.uid));
    this.oppHand = this.oppHand.filter((c) => !committedSet.has(c.uid));
    this.oppTelegraph = buildTelegraph(this.oppCommittedCards, this.rival);

    this.emit('roundStart', { round: this.round, telegraph: this.oppTelegraph });
  }

  getSelectedCards() {
    const idSet = new Set(this.selectedIds);
    return this.playerHand.filter((c) => idSet.has(c.uid));
  }

  getSelectedTrick() {
    return evaluateTrick(this.getSelectedCards());
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

    const currentCost = this.getSelectedTrick().totalCost;
    if (currentCost + card.cost > this.playerLanterns) {
      this.emit('invalidAction', { reason: `Need ${currentCost + card.cost} Lanterns (have ${this.playerLanterns})` });
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
    if (this.phase !== PHASES.SELECT) return false;
    if (this.selectedIds.length === 0) return false;
    const trick = this.getSelectedTrick();
    return trick.totalCost <= this.playerLanterns;
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
    this.playerLanterns = Math.max(0, this.playerLanterns - playerTrick.totalCost);
    this.playerLastSuit = playerTrick.leadSuit;

    const clash = resolveClash(playerTrick, oppTrick, this.playerWard, this.oppWard);

    // Apply Ward & Heal & Damage (Ward caps cleanly so defense shields clashes without stalling)
    this.playerWard = Math.min(6, Math.max(0, this.playerWard + playerTrick.ward - (clash.winner === 'opponent' ? clash.damageToPlayer : 0)));
    this.oppWard = Math.min(6, Math.max(0, this.oppWard + oppTrick.ward - (clash.winner === 'player' ? clash.damageToOpp : 0)));

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
    if (clash.counterBreak && clash.winner === 'player') this.matchStats.counterBreaks += 1;
    if (clash.playerPower >= this.matchStats.bestTrickPower) {
      this.matchStats.bestTrickPower = clash.playerPower;
      this.matchStats.bestTrickName = playerTrick.comboName;
    }

    this.lastClash = {
      round: this.round,
      playerTrick,
      oppTrick,
      ...clash,
    };

    this.chronicle.unshift({
      round: this.round,
      winner: clash.winner,
      playerPower: clash.playerPower,
      oppPower: clash.oppPower,
      playerSuit: playerTrick.leadSuit,
      oppSuit: oppTrick.leadSuit,
      playerCombo: playerTrick.comboShort,
      oppCombo: oppTrick.comboShort,
      damage: clash.winner === 'player' ? clash.damageToOpp : clash.damageToPlayer,
      trumped: clash.playerTrumps || clash.oppTrumps,
      counterBreak: clash.counterBreak,
    });
    if (this.chronicle.length > 6) this.chronicle.pop();

    this.phase = PHASES.CLASH;
    this.clashTimer = CLASH_DURATION;
    this.emit('clash', this.lastClash);
    return this.lastClash;
  }

  cycleSelectedCards() {
    if (this.phase !== PHASES.SELECT) return null;
    // Discard up to 2 selected cards (or lowest card if none selected), brace with +4 Ward & +1 Next Lantern
    let discarded = this.getSelectedCards().slice(0, 2);
    if (discarded.length === 0 && this.playerHand.length > 0) {
      const lowest = this.playerHand.slice().sort((a, b) => a.rank - b.rank)[0];
      discarded = [lowest];
    }
    const discardIds = new Set(discarded.map((c) => c.uid));
    this.playerHand = this.playerHand.filter((c) => !discardIds.has(c.uid));
    this.playerDeck.discard(discarded);
    this.selectedIds = [];
    this.playerPlayedCards = [];

    const oppTrick = this.oppTelegraph.trick;
    const bracedWard = this.playerWard + 5;
    const rawOppDmg = Math.max(2, Math.floor(oppTrick.totalPower * 0.65) + oppTrick.burn);
    const dmg = Math.max(1, rawOppDmg - Math.max(0, bracedWard - oppTrick.pierce));

    this.playerWard = 3;
    this.playerCarryWard = 3;
    this.playerHp = Math.max(0, this.playerHp - dmg);
    this.oppHp = Math.min(this.oppMaxHp, this.oppHp + oppTrick.heal);
    this.playerNextBonusLantern += 2;
    this.playerScore += 35;
    this.oppScore += 75;

    const syntheticPlayerTrick = evaluateTrick([]);
    syntheticPlayerTrick.comboName = 'BRACE & CYCLE';
    syntheticPlayerTrick.comboShort = 'CYCLE +5🛡';

    this.lastClash = {
      round: this.round,
      playerTrick: syntheticPlayerTrick,
      oppTrick,
      winner: 'opponent',
      playerPower: 0,
      oppPower: oppTrick.totalPower,
      playerTrumps: false,
      oppTrumps: false,
      counterBreak: false,
      damageToOpp: 0,
      damageToPlayer: dmg,
      playerHeal: 0,
      oppHeal: oppTrick.heal,
      playerScoreGain: 35,
      oppScoreGain: 75,
      tieBonusLantern: 0,
      headline: `BRACED & CYCLED (+2✦ NEXT TURN)`,
    };

    this.chronicle.unshift({
      round: this.round,
      winner: 'cycle',
      playerPower: 0,
      oppPower: oppTrick.totalPower,
      playerSuit: 'brass',
      oppSuit: oppTrick.leadSuit,
      playerCombo: 'CYCLE +2✦',
      oppCombo: oppTrick.comboShort,
      damage: dmg,
      trumped: false,
      counterBreak: false,
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
      if (this.clashTimer === 0) {
        this.advanceFromClash();
      }
    }
  }

  advanceFromClash() {
    if (this.phase !== PHASES.CLASH) return;

    // Check match end first so victory/defeat keep the final winning cards visible on the table!
    if (this.oppHp <= 0 || (this.round >= MAX_ROUNDS && this.playerHp > this.oppHp) || (this.round >= MAX_ROUNDS && this.playerHp === this.oppHp && this.playerScore >= this.oppScore)) {
      this.playerScore += this.playerHp * 20;
      const pt = this.lastClash?.playerTrick;
      this.matchStats.finisherSummary = pt
        ? `${pt.comboName} (${this.lastClash.playerPower} PWR)`
        : 'CLEAN SWEEP';
      this.phase = PHASES.VICTORY;
      this.emit('victory', { stats: this.matchStats, lastClash: this.lastClash });
      return;
    }

    if (this.playerHp <= 0 || this.round >= MAX_ROUNDS) {
      const ot = this.lastClash?.oppTrick;
      this.matchStats.finisherSummary = ot
        ? `${ot.comboName} (${this.lastClash.oppPower} vs ${this.lastClash.playerPower})`
        : 'OUTLASTED';
      this.phase = PHASES.DEFEAT;
      this.emit('defeat', { stats: this.matchStats, lastClash: this.lastClash });
      return;
    }

    // Move played tricks to discard piles and begin next round
    this.playerDeck.discard(this.playerPlayedCards);
    this.oppDeck.discard(this.oppCommittedCards);
    this.round += 1;
    this.beginRound();
  }

  nextRival() {
    const nextIdx = (this.rivalIndex + 1) % RIVALS.length;
    this.startMatch(nextIdx, this.seed + 13);
  }
}
