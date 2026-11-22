// Suit geometry, color palettes, elemental trumps, and 36-card Artisan Deck definitions.

export const SUIT_IDS = ['ember', 'tide', 'bramble', 'brass'];

export const SUITS = {
  ember: {
    id: 'ember',
    name: 'Ember',
    shape: 'diamond',
    symbol: '♦',
    beats: 'bramble',
    losesTo: 'tide',
    color: '#C8322B',
    bright: '#FF6352',
    deep: '#6E1512',
    tint: '#FCEAE6',
    glow: 'rgba(255, 99, 82, 0.55)',
    tagline: 'Burns Bramble (+3)',
  },
  tide: {
    id: 'tide',
    name: 'Tide',
    shape: 'crescent',
    symbol: '☾',
    beats: 'ember',
    losesTo: 'bramble',
    color: '#1A6CB0',
    bright: '#4BB4FF',
    deep: '#0E365C',
    tint: '#E7F3FD',
    glow: 'rgba(75, 180, 255, 0.55)',
    tagline: 'Quenches Ember (+3)',
  },
  bramble: {
    id: 'bramble',
    name: 'Bramble',
    shape: 'trileaf',
    symbol: '♣',
    beats: 'tide',
    losesTo: 'ember',
    color: '#1E8A52',
    bright: '#46D986',
    deep: '#0E482A',
    tint: '#E7F8EE',
    glow: 'rgba(70, 217, 134, 0.55)',
    tagline: 'Drinks Tide (+3)',
  },
  brass: {
    id: 'brass',
    name: 'Brass',
    shape: 'sungear',
    symbol: '☀',
    beats: null,
    losesTo: null,
    color: '#C68816',
    bright: '#FFD459',
    deep: '#644207',
    tint: '#FDF5DF',
    glow: 'rgba(255, 212, 89, 0.6)',
    tagline: 'Harmonic Shield & Lantern',
  },
};

export function doesSuitTrump(attackerSuit, defenderSuit) {
  if (!attackerSuit || !defenderSuit) return false;
  return SUITS[attackerSuit]?.beats === defenderSuit;
}

export function cardCostForRank(rank) {
  if (rank <= 3) return 1;
  if (rank <= 6) return 2;
  return 3;
}

export function cardEffectFor(suitId, rank) {
  if (suitId === 'ember') {
    if (rank <= 3) return { label: 'SPARK +1', burn: 1, pierce: 0, chill: 0, heal: 0, ward: 0, lantern: 0 };
    if (rank <= 6) return { label: 'IGNITE +2', burn: 2, pierce: 0, chill: 0, heal: 0, ward: 0, lantern: 0 };
    return { label: 'BLAZE +3', burn: 3, pierce: 2, chill: 0, heal: 0, ward: 0, lantern: 0 };
  }
  if (suitId === 'tide') {
    if (rank <= 3) return { label: 'SURGE +1', burn: 0, pierce: 0, chill: 0, heal: 0, ward: 0, lantern: 1 };
    if (rank <= 6) return { label: 'CHILL -2', burn: 0, pierce: 0, chill: 2, heal: 0, ward: 0, lantern: 0 };
    return { label: 'DELUGE -3', burn: 0, pierce: 0, chill: 3, heal: 0, ward: 0, lantern: 1 };
  }
  if (suitId === 'bramble') {
    if (rank <= 3) return { label: 'MEND +2', burn: 0, pierce: 0, chill: 0, heal: 2, ward: 0, lantern: 0 };
    if (rank <= 6) return { label: 'BLOOM +3', burn: 0, pierce: 0, chill: 0, heal: 3, ward: 0, lantern: 0 };
    return { label: 'THORN +3', burn: 0, pierce: 0, chill: 0, heal: 3, ward: 2, lantern: 0 };
  }
  if (rank <= 3) return { label: 'WARD +2', burn: 0, pierce: 0, chill: 0, heal: 0, ward: 2, lantern: 0 };
  if (rank <= 6) return { label: 'AEGIS +3', burn: 0, pierce: 0, chill: 0, heal: 0, ward: 3, lantern: 1 };
  return { label: 'BASTION +4', burn: 0, pierce: 0, chill: 0, heal: 0, ward: 4, lantern: 1 };
}

export function createCard(suitId, rank, uid) {
  const suit = SUITS[suitId];
  const effect = cardEffectFor(suitId, rank);
  return {
    uid,
    suit: suitId,
    rank,
    cost: cardCostForRank(rank),
    effect,
    name: `${suit.name} ${rank}`,
  };
}

export function createDeckBlueprint(ownerPrefix) {
  const deck = [];
  let seq = 1;
  for (const suitId of SUIT_IDS) {
    for (let rank = 1; rank <= 9; rank += 1) {
      deck.push(createCard(suitId, rank, `${ownerPrefix}-${suitId}-${rank}-${seq++}`));
    }
  }
  return deck;
}

export function createTitleShowcaseCards() {
  return [
    createCard('ember', 8, 'showcase-ember-8'),
    createCard('tide', 7, 'showcase-tide-7'),
    createCard('bramble', 6, 'showcase-bramble-6'),
    createCard('brass', 9, 'showcase-brass-9'),
  ];
}
