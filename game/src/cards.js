// Suit geometry, elemental trump cycle, Gilded Foil enchantments, and 36-card Artisan Deck definitions.

export const SUIT_IDS = ['ember', 'tide', 'bramble', 'brass'];

export const SUITS = {
  ember: { id: 'ember', name: 'Ember', shape: 'diamond', symbol: '♦', beats: 'bramble', losesTo: 'tide', color: '#C8322B', bright: '#FF6352', deep: '#6E1512', tint: '#FCEAE6', glow: 'rgba(255,99,82,0.55)', tagline: 'Burns Bramble (+3)' },
  tide: { id: 'tide', name: 'Tide', shape: 'crescent', symbol: '☾', beats: 'ember', losesTo: 'bramble', color: '#1A6CB0', bright: '#4BB4FF', deep: '#0E365C', tint: '#E7F3FD', glow: 'rgba(75,180,255,0.55)', tagline: 'Quenches Ember (+3)' },
  bramble: { id: 'bramble', name: 'Bramble', shape: 'trileaf', symbol: '♣', beats: 'tide', losesTo: 'ember', color: '#1E8A52', bright: '#46D986', deep: '#0E482A', tint: '#E7F8EE', glow: 'rgba(70,217,134,0.55)', tagline: 'Drinks Tide (+3)' },
  brass: { id: 'brass', name: 'Brass', shape: 'sungear', symbol: '☀', beats: null, losesTo: null, color: '#C68816', bright: '#FFD459', deep: '#644207', tint: '#FDF5DF', glow: 'rgba(255,212,89,0.6)', tagline: 'Harmonic Shield & Lantern' },
};

export const GILD_TYPES = {
  solar: { id: 'solar', badge: '✦ GILDED +3', power: 3, costDelta: 0, heal: 0, ward: 0 },
  keen: { id: 'keen', badge: '✦ KEEN -1✦', power: 1, costDelta: -1, heal: 0, ward: 0 },
  verdant: { id: 'verdant', badge: '✦ BLOOM +2', power: 2, costDelta: 0, heal: 2, ward: 0 },
  warded: { id: 'warded', badge: '✦ AEGIS +3', power: 2, costDelta: 0, heal: 0, ward: 3 },
};

export const GILD_BY_SUIT = { ember: 'solar', tide: 'keen', bramble: 'verdant', brass: 'warded' };

const EFFECT_TABLE = {
  ember: [['SPARK +1', 'spark', 1, 0, 0, 0, 0, 0], ['IGNITE +2', 'ignite', 2, 0, 0, 0, 0, 0], ['BLAZE +3', 'blaze', 3, 2, 0, 0, 0, 0]],
  tide: [['SURGE +1', 'surge', 0, 0, 0, 0, 0, 1], ['CHILL -2', 'chill', 0, 0, 2, 0, 0, 0], ['DELUGE -3', 'deluge', 0, 0, 3, 0, 0, 1]],
  bramble: [['MEND +2', 'mend', 0, 0, 0, 2, 0, 0], ['BLOOM +3', 'bloom', 0, 0, 0, 3, 0, 0], ['THORN +3', 'thorn', 0, 0, 0, 3, 2, 0]],
  brass: [['WARD +2', 'ward', 0, 0, 0, 0, 2, 0], ['AEGIS +3', 'aegis', 0, 0, 0, 0, 3, 1], ['BASTION +4', 'bastion', 0, 0, 0, 0, 4, 1]],
};

export function doesSuitTrump(attackerSuit, defenderSuit) {
  return Boolean(attackerSuit && defenderSuit && SUITS[attackerSuit]?.beats === defenderSuit);
}

export function cardCostForRank(rank) {
  return rank <= 3 ? 1 : rank <= 6 ? 2 : 3;
}

export function cardKey(suitId, rank) {
  return `${suitId}-${rank}`;
}

export function cardEffectFor(suitId, rank) {
  const [label, art, burn, pierce, chill, heal, ward, lantern] = EFFECT_TABLE[suitId][rank <= 3 ? 0 : rank <= 6 ? 1 : 2];
  return { label, art, burn, pierce, chill, heal, ward, lantern };
}

export function applyGildToCard(card, gildId) {
  const gild = GILD_TYPES[gildId];
  if (!gild) return card;
  card.gilded = gildId;
  card.cost = Math.max(1, cardCostForRank(card.rank) + gild.costDelta);
  return card;
}

export function createCard(suitId, rank, uid, gildId = null) {
  const card = {
    uid, suit: suitId, rank, cost: cardCostForRank(rank),
    effect: cardEffectFor(suitId, rank), name: `${SUITS[suitId].name} ${rank}`, gilded: null,
  };
  return gildId ? applyGildToCard(card, gildId) : card;
}

export function createDeckBlueprint(ownerPrefix, gildedMap = null) {
  const deck = [];
  let seq = 1;
  for (const suitId of SUIT_IDS) {
    for (let rank = 1; rank <= 9; rank += 1) {
      const gildId = gildedMap?.[cardKey(suitId, rank)] ?? null;
      deck.push(createCard(suitId, rank, `${ownerPrefix}-${suitId}-${rank}-${seq++}`, gildId));
    }
  }
  return deck;
}

export function createTitleShowcaseCards() {
  return [
    createCard('ember', 8, 'showcase-ember-8', 'solar'),
    createCard('tide', 7, 'showcase-tide-7'),
    createCard('bramble', 6, 'showcase-bramble-6'),
    createCard('brass', 9, 'showcase-brass-9', 'warded'),
  ];
}
