// Deterministic PRNG (Mulberry32), Fisher-Yates shuffle, and self-recycling deck pile.

export function createRng(seed) {
  let state = (seed >>> 0) || 1;
  return function nextFloat() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleCards(cards, rng) {
  const copy = cards.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export class DeckPile {
  constructor(initialCards, rng) {
    this.rng = rng;
    this.drawPile = shuffleCards(initialCards, rng);
    this.discardPile = [];
  }

  get drawCount() {
    return this.drawPile.length;
  }

  get discardCount() {
    return this.discardPile.length;
  }

  drawOne() {
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) return null;
      this.drawPile = shuffleCards(this.discardPile, this.rng);
      this.discardPile = [];
    }
    return this.drawPile.pop() ?? null;
  }

  drawMany(count) {
    const drawn = [];
    for (let i = 0; i < count; i += 1) {
      const card = this.drawOne();
      if (!card) break;
      drawn.push(card);
    }
    return drawn;
  }

  discard(cards) {
    for (const card of cards) {
      if (card) this.discardPile.push(card);
    }
  }
}
