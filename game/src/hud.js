// HUD medallions, 5-Rival Circuit progress, Player Relics tray, Gambit ×2 controls, and 3-Card Relic Draft.
import { SUITS, SUIT_IDS, createTitleShowcaseCards, doesSuitTrump } from './cards.js';
import { COMBO_CATALOG } from './combos.js';
import { RIVALS } from './ai.js';
import { PHASES, MAX_ROUNDS } from './rules.js';
import { getRelicById, drawRelicIcon } from './relics.js';
import { drawCard, drawSuitEmblem, drawLanternIcon, drawHeartIcon, drawShieldIcon, drawSpeakerIcon, roundedRectPath } from './card-art.js';
import { drawRivalPortrait, drawParlorCandle, drawWoodenDeckTray, drawLanternCoin, drawTrophySeal } from './portraits.js';
import { STAGE_W, STAGE_H, CENTER_X } from './renderer.js';

const SHOWCASE_CARDS = createTitleShowcaseCards();
const UI_FONT = 'system-ui, -apple-system, sans-serif';

function label(ctx, text, x, y, font, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function box(ctx, x, y, w, h, r, fill, stroke, lw = 1.2) {
  roundedRectPath(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function hpBar(ctx, x, y, w, h, ratio, bg, c0, c1) {
  box(ctx, x, y, w, h, 5, bg, null);
  const pct = Math.max(0, Math.min(1, ratio));
  if (pct <= 0) return;
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  box(ctx, x, y, Math.max(8, w * pct), h, 5, g, null);
}

export class HudRenderer {
  constructor() { this.buttons = []; }
  resetButtons() { this.buttons = []; }
  registerButton(id, x, y, w, h, data = null) { this.buttons.push({ id, x, y, w, h, data }); }

  hitTestButton(x, y) {
    for (let i = this.buttons.length - 1; i >= 0; i -= 1) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  }

  render(ctx, engine, anim, sound, uiState) {
    this.resetButtons();
    if (engine.phase === PHASES.TITLE) {
      this.drawTitleScreen(ctx, engine, anim, sound, uiState);
    } else {
      this.drawLeftColumn(ctx, engine);
      this.drawRightColumn(ctx, engine, sound, uiState);
      if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) this.drawCenterActionBar(ctx, engine, uiState);
      else if (engine.phase === PHASES.VICTORY) this.drawVictoryAndDraft(ctx, engine, anim, uiState);
      else if (engine.phase === PHASES.DEFEAT) this.drawDefeatBanner(ctx, engine, anim, uiState);
    }
    if (engine.rulesOpen) this.drawRulesModal(ctx, uiState);
  }

  drawPanelBox(ctx, x, y, w, h, border = 'rgba(227,188,100,0.62)', top = 'rgba(22,16,12,0.9)', bot = 'rgba(12,10,8,0.94)') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    box(ctx, x, y, w, h, 14, g, border, 1.8);
  }

  drawButton(ctx, id, x, y, w, h, text, style = {}, data = null, hoveredId = null) {
    const hov = hoveredId === id;
    const dis = !!style.disabled;
    const pri = !!style.primary;
    const crim = !!style.crimson;
    if (!dis) this.registerButton(id, x, y, w, h, data);

    ctx.save();
    let fill = 'rgba(42,36,30,0.72)';
    let stroke = 'rgba(132,114,84,0.45)';
    if (!dis) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      if (crim) {
        g.addColorStop(0, hov ? '#E04D45' : '#BD352E'); g.addColorStop(1, hov ? '#A02620' : '#7D1B17');
        stroke = hov ? '#FFE994' : '#F6C08A';
      } else if (pri) {
        g.addColorStop(0, hov ? '#FFE47E' : '#F2C756'); g.addColorStop(1, hov ? '#D69D26' : '#B57B14');
        stroke = hov ? '#FFF9DA' : '#FFE48A';
      } else {
        g.addColorStop(0, hov ? 'rgba(66,48,30,0.96)' : 'rgba(38,28,20,0.92)');
        g.addColorStop(1, hov ? 'rgba(42,30,18,0.96)' : 'rgba(22,16,12,0.94)');
        stroke = hov ? '#FFE07A' : 'rgba(227,188,100,0.65)';
      }
      fill = g;
      if (hov) { ctx.shadowColor = pri ? 'rgba(255,212,89,0.55)' : 'rgba(255,212,89,0.32)'; ctx.shadowBlur = 14; }
    }
    box(ctx, x, y, w, h, style.radius ?? 10, fill, stroke, pri || crim ? 2.2 : 1.5);
    ctx.shadowBlur = 0;
    if (text) label(ctx, text, x + w / 2, y + h / 2 + 0.5, `900 ${style.fontSize ?? 14}px ${UI_FONT}`, dis ? '#8E816E' : pri ? '#1E1205' : '#FFF4DC');
    ctx.restore();
  }

  drawLeftColumn(ctx, engine) {
    const x = 36;
    const w = 192;
    const oppDead = engine.oppHp <= 0;

    // 1. Opponent Medallion (y = 36..200)
    this.drawPanelBox(ctx, x, 36, w, 164, oppDead ? '#8C4440' : engine.rival.accent);
    drawRivalPortrait(ctx, engine.rival.id, x + 34, 69, 21);
    label(ctx, engine.rival.name.toUpperCase(), x + 64, 61, '900 16px Georgia, serif', '#FFF5DC', 'left');
    label(ctx, engine.rival.title.toUpperCase(), x + 64, 78, `700 9.5px ${UI_FONT}`, '#D2C19E', 'left');

    box(ctx, x + 10, 96, w - 20, 21, 6, 'rgba(255,206,102,0.12)', 'rgba(240,198,104,0.44)', 1);
    label(ctx, `${engine.rival.relicName}: ${engine.rival.relicDesc}`, x + w / 2, 106.5, `800 9.2px ${UI_FONT}`, '#FFE79E');

    drawHeartIcon(ctx, x + 26, 136, 10.5, oppDead ? '#C84842' : '#FF6B5C');
    const oStr = String(engine.oppHp);
    label(ctx, oStr, x + 44, 137, '900 30px Georgia, serif', oppDead ? '#FF6B60' : '#FF8274', 'left');
    label(ctx, `/${engine.oppMaxHp}`, x + 48 + ctx.measureText(oStr).width, 141, `700 14px ${UI_FONT}`, '#C8B898', 'left');
    hpBar(ctx, x + 14, 157, w - 28, 10, engine.oppHp / engine.oppMaxHp, '#2B1615', '#D93B32', '#FF7A59');

    label(ctx, `SCORE ${engine.oppScore}`, x + 14, 183, `800 11.5px ${UI_FONT}`, '#EADBB8', 'left');
    if (engine.oppWard > 0) {
      drawShieldIcon(ctx, x + w - 33, 182, 7, '#FFD459');
      label(ctx, String(engine.oppWard), x + w - 14, 183, `800 12px ${UI_FONT}`, '#FFD459', 'right');
    } else {
      drawLanternIcon(ctx, x + w - 33, 182, 6, true);
      label(ctx, String(engine.oppLanterns), x + w - 14, 183, `800 12px ${UI_FONT}`, '#E6CA78', 'right');
    }

    // 2. Wooden Deck Tray + Rival Suit Tracker + Elemental Trump Cycle (y = 208..466)
    this.drawPanelBox(ctx, x, 208, w, 258, 'rgba(227,188,100,0.52)');
    drawWoodenDeckTray(ctx, x + 12, 217, 68, 86);
    for (let s = 3; s >= 0; s -= 1) drawCard(ctx, null, x + 48 - s * 1.6, 261 - s * 1.6, 48, 68, { flip: -1, shadow: s === 3 });
    label(ctx, 'DECK', x + 90, 232, `800 11px ${UI_FONT}`, '#F3D486', 'left');
    label(ctx, String(engine.playerDeck?.drawCount ?? 0), x + 90, 258, '900 27px Georgia, serif', '#FFF7E2', 'left');
    label(ctx, `DISC ${engine.playerDeck?.discardCount ?? 0}`, x + 90, 281, `700 10.5px ${UI_FONT}`, '#C4B395', 'left');

    box(ctx, x + 10, 310, w - 20, 34, 8, 'rgba(10,22,17,0.74)', 'rgba(227,188,100,0.34)', 1);
    label(ctx, 'RIVAL SUITS LEFT', x + w / 2, 319, `800 8.5px ${UI_FONT}`, '#E2CE9F');
    const remSuits = engine.getRivalRemainingSuits();
    for (let i = 0; i < SUIT_IDS.length; i += 1) {
      const sid = SUIT_IDS[i];
      drawSuitEmblem(ctx, sid, x + 22 + i * 42, 334, 6.6);
      label(ctx, String(remSuits[sid]), x + 33 + i * 42, 335, `800 11px ${UI_FONT}`, '#FFF4D8', 'left');
    }

    label(ctx, 'TRUMP CYCLE (+3 PWR)', x + w / 2, 357, `800 10px ${UI_FONT}`, '#F4D27A');
    const wCx = x + w / 2;
    const wCy = 411;
    const nodes = [{ id: 'ember', px: wCx, py: wCy - 33 }, { id: 'bramble', px: wCx + 43, py: wCy + 21 }, { id: 'tide', px: wCx - 43, py: wCy + 21 }];
    ctx.strokeStyle = 'rgba(240,206,118,0.65)'; ctx.lineWidth = 1.9;
    for (let i = 0; i < 3; i += 1) {
      const a = nodes[i]; const b = nodes[(i + 1) % 3];
      const dx = b.px - a.px; const dy = b.py - a.py; const len = Math.hypot(dx, dy);
      const ex = b.px - (dx / len) * 17; const ey = b.py - (dy / len) * 17;
      ctx.beginPath(); ctx.moveTo(a.px + (dx / len) * 17, a.py + (dy / len) * 17); ctx.lineTo(ex, ey); ctx.stroke();
      const ang = Math.atan2(dy, dx);
      ctx.fillStyle = '#F2CE74';
      ctx.beginPath(); ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(ang - 0.5) * 6, ey - Math.sin(ang - 0.5) * 6);
      ctx.lineTo(ex - Math.cos(ang + 0.5) * 6, ey - Math.sin(ang + 0.5) * 6);
      ctx.closePath(); ctx.fill();
    }
    for (const n of nodes) {
      ctx.beginPath(); ctx.arc(n.px, n.py, 14.5, 0, Math.PI * 2);
      ctx.fillStyle = '#18120D'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = SUITS[n.id].bright; ctx.stroke();
      drawSuitEmblem(ctx, n.id, n.px, n.py, 10);
    }
    ctx.beginPath(); ctx.arc(wCx, wCy + 3, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#22170C'; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = '#FFD459'; ctx.stroke();
    drawSuitEmblem(ctx, 'brass', wCx, wCy + 3, 8.5);
    label(ctx, 'BRASS: NEUTRAL + WARD', wCx, 454, `700 9.5px ${UI_FONT}`, '#DFCEAB');

    // 3. Player Medallion + ACTIVE DRAFTED RELICS TRAY (y = 474..684)
    const pDead = engine.playerHp <= 0;
    this.drawPanelBox(ctx, x, 474, w, 210, pDead ? '#A34844' : '#E5BE62');
    label(ctx, 'YOU · CHALLENGER', x + 14, 492, `900 11.5px ${UI_FONT}`, '#FFE499', 'left');

    // Active Player Relics strip right inside player panel (generous spacing, zero overlap!)
    if (engine.playerRelics.length > 0) {
      box(ctx, x + 10, 504, w - 20, 32, 7, 'rgba(255,212,89,0.1)', 'rgba(240,198,104,0.4)', 1);
      const shown = engine.playerRelics.slice(0, 3);
      const step = shown.length <= 2 ? 84 : 46;
      for (let i = 0; i < shown.length; i += 1) {
        const rel = getRelicById(shown[i]);
        const rx = x + 25 + i * step;
        drawRelicIcon(ctx, shown[i], rx, 520, 10.5);
        if (shown.length <= 2 && rel) {
          label(ctx, rel.name.split(' ')[0], rx + 15, 520, `800 8.8px ${UI_FONT}`, '#FFE9A3', 'left');
        }
      }
      if (shown.length === 3) label(ctx, 'RELICS', x + w - 16, 520, `800 8.5px ${UI_FONT}`, '#E2CE9B', 'right');
    } else {
      box(ctx, x + 10, 504, w - 20, 26, 7, 'rgba(18,28,22,0.65)', 'rgba(227,188,100,0.22)', 1);
      label(ctx, 'WIN TO DRAFT RELICS', x + w / 2, 517, `700 9px ${UI_FONT}`, '#B5A689');
    }

    drawHeartIcon(ctx, x + 27, 557, 11.5, pDead ? '#C84842' : '#4CE28D');
    const pStr = String(engine.playerHp);
    label(ctx, pStr, x + 45, 558, '900 31px Georgia, serif', pDead ? '#FF6B60' : '#57E897', 'left');
    label(ctx, `/${engine.playerMaxHp}`, x + 49 + ctx.measureText(pStr).width, 562, `700 14.5px ${UI_FONT}`, '#C8B89A', 'left');
    hpBar(ctx, x + 14, 578, w - 28, 10, engine.playerHp / engine.playerMaxHp, '#10241A', '#1FA35E', '#66F09F');

    label(ctx, 'LANTERNS', x + 14, 606, `800 11.5px ${UI_FONT}`, '#F5CF6B', 'left');
    label(ctx, `${engine.playerLanterns} / ${engine.playerMaxLanterns}`, x + w - 14, 606, `900 14px ${UI_FONT}`, '#FFE485', 'right');
    const maxCoins = Math.max(engine.playerMaxLanterns, 6);
    const cStep = Math.min(24, (w - 34) / Math.max(1, maxCoins - 1));
    for (let i = 0; i < maxCoins; i += 1) drawLanternCoin(ctx, x + 21 + i * cStep, 628, 8, i < engine.playerLanterns);

    ctx.strokeStyle = 'rgba(227,188,100,0.25)';
    ctx.beginPath(); ctx.moveTo(x + 14, 647); ctx.lineTo(x + w - 14, 647); ctx.stroke();
    label(ctx, `SCORE ${engine.playerScore}`, x + 14, 666, '900 14.5px Georgia, serif', '#FFF2CF', 'left');
    if (engine.playerWard > 0) {
      drawShieldIcon(ctx, x + w - 33, 665, 7.2, '#FFD459');
      label(ctx, String(engine.playerWard), x + w - 14, 666, `800 13px ${UI_FONT}`, '#FFD459', 'right');
    }
  }

  drawRightColumn(ctx, engine, sound, uiState) {
    const x = 1034;
    const w = 210;

    // 1. Top Bar with 5-Rival Circuit Progress Pips (y = 36..102)
    this.drawPanelBox(ctx, x, 36, w, 66, 'rgba(227,188,100,0.58)');
    label(ctx, `ROUND ${engine.round}/${MAX_ROUNDS}`, x + 12, 53, '900 13.5px Georgia, serif', '#FFE496', 'left');
    label(ctx, `RIVAL ${engine.rivalIndex + 1} OF ${RIVALS.length}`, x + 12, 70, `700 10px ${UI_FONT}`, '#D5C6A8', 'left');
    this.drawButton(ctx, 'btn-mute', x + 122, 45, 26, 30, '', { radius: 7 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, x + 135, 60, 8.2, sound.muted);
    this.drawButton(ctx, 'btn-rules', x + 151, 45, 24, 30, '?', { fontSize: 13.5, radius: 7 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-reset', x + 178, 45, 24, 30, '↺', { fontSize: 14.5, radius: 7 }, null, uiState.hoveredButtonId);

    // 5-Rival Circuit Ribbon inside top bar
    for (let i = 0; i < RIVALS.length; i += 1) {
      const px = x + 22 + i * 41;
      const py = 89;
      if (i > 0) {
        ctx.strokeStyle = i <= engine.rivalIndex ? '#E6BE62' : 'rgba(227,188,100,0.28)';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(px - 31, py); ctx.lineTo(px - 10, py); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(px, py, i === engine.rivalIndex ? 6.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i < engine.rivalIndex ? '#52E090' : i === engine.rivalIndex ? '#FFE066' : '#261E18';
      ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = i <= engine.rivalIndex ? '#FFF6CE' : '#7D6D52'; ctx.stroke();
    }

    // 2. Combo Synergies Guide (y = 110..366)
    this.drawPanelBox(ctx, x, 110, w, 256, 'rgba(227,188,100,0.52)');
    label(ctx, 'COMBO SYNERGIES', x + w / 2, 130, `900 12px ${UI_FONT}`, '#F4D27A');
    const activeCombo = engine.phase === PHASES.CLASH ? engine.lastClash?.playerTrick?.comboId : engine.getSelectedTrick().comboId;
    for (let i = 0; i < COMBO_CATALOG.length; i += 1) {
      const it = COMBO_CATALOG[i];
      const ry = 148 + i * 43;
      const act = activeCombo === it.id;
      box(ctx, x + 12, ry, w - 24, 37, 8, act ? 'rgba(236,182,48,0.28)' : 'rgba(255,248,226,0.05)', act ? '#FFE066' : 'rgba(227,188,100,0.22)', act ? 2 : 1);
      label(ctx, it.name, x + 22, ry + 13, `900 13px ${UI_FONT}`, act ? '#FFF5C2' : it.color, 'left');
      label(ctx, it.desc, x + 22, ry + 27, `600 11px ${UI_FONT}`, act ? '#FDEBA4' : '#C8BA9F', 'left');
      label(ctx, it.bonus, x + w - 20, ry + 19, '900 14px Georgia, serif', act ? '#FFE270' : '#F3D27A', 'right');
    }
    box(ctx, x + 12, 326, w - 24, 28, 7, 'rgba(198,136,22,0.22)', 'rgba(255,212,89,0.48)', 1);
    label(ctx, 'BRASS COMBO: +2 WARD · +1✦', x + w / 2, 340.5, `800 10.5px ${UI_FONT}`, '#FFE79A');

    // 3. Trick Chronicle (y = 376..684)
    this.drawPanelBox(ctx, x, 376, w, 308, 'rgba(227,188,100,0.48)');
    label(ctx, 'TRICK CHRONICLE', x + w / 2, 396, `900 12px ${UI_FONT}`, '#F4D27A');
    if (engine.chronicle.length === 0) {
      label(ctx, 'Read Rival Tell & Suits,', x + w / 2, 452, `600 12px ${UI_FONT}`, '#B5A68A');
      label(ctx, 'select 1–3 cards, or', x + w / 2, 474, `600 12px ${UI_FONT}`, '#B5A68A');
      label(ctx, 'RAISE ×2 for huge stakes!', x + w / 2, 496, `700 12px ${UI_FONT}`, '#FFE28A');
    } else {
      const shown = engine.chronicle.slice(0, 4);
      for (let i = 0; i < shown.length; i += 1) {
        const e = shown[i];
        const cy = 414 + i * 58;
        const fill = e.winner === 'player' ? 'rgba(30,122,74,0.26)' : e.winner === 'opponent' ? 'rgba(180,48,42,0.26)' : 'rgba(140,118,72,0.22)';
        const brd = e.winner === 'player' ? 'rgba(84,224,140,0.52)' : e.winner === 'opponent' ? 'rgba(255,104,92,0.52)' : 'rgba(224,190,106,0.42)';
        box(ctx, x + 12, cy, w - 24, 51, 9, fill, brd, 1.1);
        label(ctx, `R${e.round}`, x + 20, cy + 16, `800 11px ${UI_FONT}`, '#EEE0C2', 'left');
        label(
          ctx,
          e.winner === 'player' ? `WIN (-${e.damage})` : e.winner === 'opponent' ? `LOSS (-${e.damage})` : e.winner === 'cycle' ? 'KINDLED' : 'TIE',
          x + 44, cy + 16, `900 11px ${UI_FONT}`,
          e.winner === 'player' ? '#6BF09E' : e.winner === 'opponent' ? '#FF8072' : '#FFE084', 'left',
        );
        label(ctx, `${e.playerPower}v${e.oppPower}`, x + w - 20, cy + 16, '900 12px Georgia, serif', '#FFF4D4', 'right');
        if (e.playerSuit) drawSuitEmblem(ctx, e.playerSuit, x + 25, cy + 36, 7);
        label(ctx, e.playerCombo, x + 38, cy + 36.5, `700 10.5px ${UI_FONT}`, '#DBD0B6', 'left');
        if (e.gambit || e.counterBreak || e.trumped) {
          label(ctx, e.gambit ? '×2!' : e.counterBreak ? 'BREAK!' : 'TRUMP', x + w - 20, cy + 36.5, `900 10px ${UI_FONT}`, e.gambit ? '#FF9A62' : '#FFE066', 'right');
        }
      }
    }
    label(ctx, '[1-5] Card · [G] Gambit · [C] Kindle', x + w / 2, 669, `700 9.6px ${UI_FONT}`, '#B3A487');
  }

  drawCenterActionBar(ctx, engine, uiState) {
    const barY = 424;
    const barH = 42;
    const isClash = engine.phase === PHASES.CLASH;
    const trick = engine.getSelectedTrick();
    const canPlay = engine.canPlaySelected();

    box(ctx, 254, barY, 342, barH, 11, 'rgba(18,14,10,0.92)', engine.gambitActive ? '#FF8052' : canPlay ? '#E6BE62' : 'rgba(227,188,100,0.4)', 1.6);
    if (isClash && engine.lastClash) {
      label(ctx, engine.lastClash.headline, 268, barY + 21.5, `900 12.5px ${UI_FONT}`, engine.lastClash.winner === 'player' ? '#72F2A5' : engine.lastClash.winner === 'opponent' ? '#FF877A' : '#FFE38A', 'left');
    } else if (uiState.toastMessage && uiState.toastTimer > 0) {
      label(ctx, `! ${uiState.toastMessage}`, 268, barY + 21.5, `800 12px ${UI_FONT}`, '#FF9C84', 'left');
    } else if (trick.cards.length > 0) {
      const trumps = doesSuitTrump(trick.leadSuit, engine.oppTelegraph?.leadSuit);
      const pMods = engine.getSelectedProjectedMods();
      const eff = trick.totalPower + (trumps ? 3 : 0) + pMods.powerBonus;
      if (trick.leadSuit) drawSuitEmblem(ctx, trick.leadSuit, 274, barY + 21, 10);
      label(ctx, `${trick.comboName} · PWR ${eff} · ${trick.totalCost}✦`, 292, barY + 21.5, `900 12.5px ${UI_FONT}`, '#FFF4D4', 'left');
    } else {
      label(ctx, 'Pick 1–3 cards, Raise ×2 [G], or Kindle [C]', 268, barY + 21.5, `700 12px ${UI_FONT}`, '#D9C9A8', 'left');
    }

    if (isClash) {
      this.drawButton(ctx, 'btn-continue', 606, barY, 400, barH, 'NEXT ROUND  [SPACE]', { primary: true, fontSize: 14 }, null, uiState.hoveredButtonId);
    } else {
      this.drawButton(ctx, 'btn-play', 604, barY, 138, barH, canPlay ? 'PLAY TRICK ▸' : 'PLAY TRICK', { primary: canPlay, disabled: !canPlay, fontSize: 13 }, null, uiState.hoveredButtonId);
      const gambitLabel = engine.gambitActive ? 'GAMBIT ×2 ON' : 'RAISE ×2 [G]';
      this.drawButton(ctx, 'btn-gambit', 749, barY, 128, barH, gambitLabel, { crimson: engine.gambitActive, fontSize: 12.5 }, null, uiState.hoveredButtonId);
      const kindleLabel = engine.gambitBy === 'rival' ? 'FOLD +2✦' : 'KINDLE +2✦';
      this.drawButton(ctx, 'btn-cycle', 884, barY, 122, barH, kindleLabel, { fontSize: 12.5 }, null, uiState.hoveredButtonId);
    }
  }

  drawTitleScreen(ctx, engine, anim, sound, uiState) {
    this.drawButton(ctx, 'btn-mute', 1140, 40, 42, 36, '', { radius: 8 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, 1161, 58, 10, sound.muted);
    this.drawButton(ctx, 'btn-rules', 1190, 40, 46, 36, '?', { fontSize: 16, radius: 8 }, null, uiState.hoveredButtonId);

    // Upper Heirloom Title Panel with 5-Rival Circuit Cameo Strip!
    const panelW = 890;
    const panelX = CENTER_X - panelW / 2;
    const panelY = 28;
    this.drawPanelBox(ctx, panelX, panelY, panelW, 326, '#E8C266', 'rgba(26,17,11,0.92)', 'rgba(12,24,19,0.94)');

    drawLanternIcon(ctx, CENTER_X, panelY + 24, 15, true);
    ctx.strokeStyle = 'rgba(240,202,108,0.45)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(CENTER_X - 200, panelY + 24); ctx.lineTo(CENTER_X - 28, panelY + 24);
    ctx.moveTo(CENTER_X + 28, panelY + 24); ctx.lineTo(CENTER_X + 200, panelY + 24);
    ctx.stroke();

    label(ctx, 'LANTERN TRICK', CENTER_X + 3, panelY + 75, '900 56px Georgia, serif', 'rgba(0,0,0,0.68)');
    const tg = ctx.createLinearGradient(CENTER_X, panelY + 42, CENTER_X, panelY + 102);
    tg.addColorStop(0, '#FFF8D4'); tg.addColorStop(0.5, '#F5CB5C'); tg.addColorStop(1, '#BA7F19');
    label(ctx, 'LANTERN TRICK', CENTER_X, panelY + 72, '900 56px Georgia, serif', tg);
    label(ctx, '5-RIVAL CANDLELIT PARLOR GAMBIT & RELIC CARD DUEL', CENTER_X, panelY + 108, `800 13px ${UI_FONT}`, '#EAE0C0');

    // 5-Rival Circuit Cameo Medallion Strip!
    const cw = 162;
    const ch = 114;
    const gap = 10;
    const rowX = CENTER_X - (cw * 5 + gap * 4) / 2;
    const rowY = panelY + 128;
    for (let i = 0; i < RIVALS.length; i += 1) {
      const r = RIVALS[i];
      const rx = rowX + i * (cw + gap);
      const sel = engine.rivalIndex === i;
      const id = `rival-${i}`;
      const hov = uiState.hoveredButtonId === id;
      this.registerButton(id, rx, rowY, cw, ch, i);
      box(ctx, rx, rowY, cw, ch, 10, sel ? 'rgba(242,198,84,0.22)' : hov ? 'rgba(255,240,200,0.09)' : 'rgba(11,18,15,0.78)', sel ? '#FFE06E' : hov ? '#E2BD64' : 'rgba(227,188,100,0.36)', sel ? 2.3 : 1.2);
      drawRivalPortrait(ctx, r.id, rx + cw / 2, rowY + 32, 22);
      label(ctx, `${r.name} · ${r.maxHp} HP`, rx + cw / 2, rowY + 67, '900 13px Georgia, serif', sel ? '#FFF8DF' : '#ECE0C2');
      label(ctx, r.difficulty.toUpperCase(), rx + cw / 2, rowY + 84, `800 9.5px ${UI_FONT}`, r.accent);
      label(ctx, r.relicName, rx + cw / 2, rowY + 100, `700 9.5px ${UI_FONT}`, '#DFCE9F');
    }

    this.drawButton(ctx, 'btn-start', CENTER_X - 196, panelY + 258, 244, 50, 'DEAL RUN  ▸', { primary: true, fontSize: 18, radius: 12 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-rules-title', CENTER_X + 64, panelY + 258, 134, 50, 'RULES  [?]', { fontSize: 14, radius: 12 }, null, uiState.hoveredButtonId);

    // Warm candlelight pool beneath the 4 giant heirloom showcase cards
    const hg = ctx.createRadialGradient(CENTER_X, 504, 24, CENTER_X, 504, 360);
    hg.addColorStop(0, 'rgba(255,215,115,0.28)'); hg.addColorStop(1, 'rgba(255,190,80,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(CENTER_X, 504, 400, 128, 0, 0, Math.PI * 2); ctx.fill();

    const fanStart = CENTER_X - (172 * 3) / 2;
    for (let i = 0; i < SHOWCASE_CARDS.length; i += 1) {
      const norm = (i / 3) * 2 - 1;
      drawCard(ctx, SHOWCASE_CARDS[i], fanStart + i * 172, 498 + norm * norm * 13 + Math.sin(anim.time * 2.1 + i * 1.1) * 3, 138, 198, { rot: norm * 0.068, scale: 1, flip: 1, selected: i === 3 });
    }

    box(ctx, CENTER_X - 420, 648, 840, 34, 17, 'rgba(15,11,8,0.92)', 'rgba(227,188,100,0.54)', 1.4);
    label(ctx, '5-RIVAL CIRCUIT · GAMBIT ×2 STAKES · RELIC DRAFTS · EMBER > BRAMBLE > TIDE > EMBER · BRASS WARDS', CENTER_X, 665.5, `800 11.8px ${UI_FONT}`, '#F4E2B0');
  }

  drawVictoryAndDraft(ctx, engine, anim, uiState) {
    const bw = 724;
    const bx = CENTER_X - bw / 2;
    const by = 32;
    this.drawPanelBox(ctx, bx, by, bw, 184, '#FFE06E', 'rgba(34,24,11,0.94)', 'rgba(15,30,22,0.95)');

    drawParlorCandle(ctx, bx + 62, by + 76, 0.86, anim.time, false);
    drawParlorCandle(ctx, bx + bw - 62, by + 76, 0.86, anim.time + 1.1, false);
    drawTrophySeal(ctx, CENTER_X, by + 28, 17);

    label(ctx, 'VICTORY!', CENTER_X + 2, by + 74, '900 48px Georgia, serif', 'rgba(0,0,0,0.65)');
    const g = ctx.createLinearGradient(CENTER_X, by + 46, CENTER_X, by + 98);
    g.addColorStop(0, '#FFF9D6'); g.addColorStop(0.5, '#FFD95A'); g.addColorStop(1, '#C78615');
    label(ctx, 'VICTORY!', CENTER_X, by + 72, '900 48px Georgia, serif', g);
    label(ctx, `${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} DEFEATED · ROUND ${engine.round}`, CENTER_X, by + 110, `800 13px ${UI_FONT}`, '#F2E2BC');

    // Sleek single inline stat ribbon — spacious luxury composition!
    box(ctx, bx + 34, by + 128, bw - 68, 42, 10, 'rgba(11,20,15,0.84)', 'rgba(236,198,108,0.48)', 1.3);
    label(ctx, `LIFE  ${engine.playerHp}/${engine.playerMaxHp}`, bx + 148, by + 149.5, '900 16px Georgia, serif', '#6BF09E');
    label(ctx, `GLORY  ${engine.playerScore}`, CENTER_X, by + 149.5, '900 17px Georgia, serif', '#FFE06E');
    label(ctx, `GAMBITS ${engine.matchStats.gambitsWon} · TRUMPS ${engine.matchStats.trumpsLanded}`, bx + bw - 156, by + 149.5, `800 13.5px ${UI_FONT}`, '#74CAFF');

    const nextRival = RIVALS[(engine.rivalIndex + 1) % RIVALS.length];
    label(ctx, `✦ CHOOSE YOUR SPOIL → NEXT RIVAL: ${nextRival.name.toUpperCase()} ✦`, CENTER_X, 452, `900 13.5px ${UI_FONT}`, '#FFE79A');

    // Interactive 3-Card Illustrated Brass Relic Draft (y = 472..646, airy margins!)
    const choices = engine.draftChoices.slice(0, 3);
    const rw = 224;
    const rh = 172;
    const rgap = 22;
    const rx0 = CENTER_X - (rw * choices.length + rgap * Math.max(0, choices.length - 1)) / 2;

    for (let i = 0; i < choices.length; i += 1) {
      const rel = choices[i];
      const rx = rx0 + i * (rw + rgap);
      const ry = 472;
      const btnId = `relic-${rel.id}`;
      const hov = uiState.hoveredButtonId === btnId;
      this.registerButton(btnId, rx, ry, rw, rh, rel.id);

      const bg = ctx.createLinearGradient(rx, ry, rx, ry + rh);
      bg.addColorStop(0, hov ? 'rgba(54,39,18,0.96)' : 'rgba(28,20,13,0.94)');
      bg.addColorStop(1, hov ? 'rgba(24,38,28,0.96)' : 'rgba(13,24,19,0.95)');
      box(ctx, rx, ry, rw, rh, 12, bg, hov ? '#FFF09E' : rel.color, hov ? 2.4 : 1.7);

      drawRelicIcon(ctx, rel.id, rx + rw / 2, ry + 38, 22);
      label(ctx, rel.name, rx + rw / 2, ry + 78, '900 14.5px Georgia, serif', '#FFF6DA');
      label(ctx, rel.short.toUpperCase(), rx + rw / 2, ry + 98, `800 11px ${UI_FONT}`, rel.color);
      label(ctx, rel.desc, rx + rw / 2, ry + 118, `600 10.5px ${UI_FONT}`, '#DCD0B2');

      box(ctx, rx + 26, ry + 134, rw - 52, 28, 7, hov ? '#FFE072' : '#D9A534', '#FFF2B2', 1.2);
      label(ctx, `CLAIM SPOIL [${i + 1}]`, rx + rw / 2, ry + 148.5, `900 11.5px ${UI_FONT}`, '#1C1105');
    }

    this.drawButton(ctx, 'btn-rematch', CENTER_X - 134, 656, 124, 26, 'REMATCH [R]', { fontSize: 11, radius: 6 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-title', CENTER_X + 10, 656, 124, 26, 'TITLE SCREEN', { fontSize: 11, radius: 6 }, null, uiState.hoveredButtonId);
  }

  drawDefeatBanner(ctx, engine, anim, uiState) {
    const bw = 724;
    const bx = CENTER_X - bw / 2;
    const by = 38;
    this.drawPanelBox(ctx, bx, by, bw, 330, '#DC5B54', 'rgba(24,21,31,0.95)', 'rgba(14,15,24,0.96)');

    drawParlorCandle(ctx, bx + 66, by + 92, 0.9, anim.time, true);
    drawParlorCandle(ctx, bx + bw - 66, by + 92, 0.9, anim.time + 1.1, true);
    drawLanternIcon(ctx, CENTER_X, by + 26, 14, false);

    label(ctx, 'DEFEAT', CENTER_X + 3, by + 76, '900 52px Georgia, serif', 'rgba(0,0,0,0.72)');
    const g = ctx.createLinearGradient(CENTER_X, by + 46, CENTER_X, by + 104);
    g.addColorStop(0, '#F5E8E8'); g.addColorStop(0.55, '#E8958E'); g.addColorStop(1, '#B8433E');
    label(ctx, 'DEFEAT', CENTER_X, by + 74, '900 52px Georgia, serif', g);
    label(ctx, `OUTPLAYED BY ${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} · ROUND ${engine.round}`, CENTER_X, by + 114, `800 13.5px ${UI_FONT}`, '#DBD2E0');

    const c = engine.lastClash;
    const stats = [
      { k: 'YOUR LIFE', v: `${engine.playerHp} / ${engine.playerMaxHp}`, col: '#FF7066' },
      { k: `${engine.rival.name.toUpperCase()} LIFE`, v: `${engine.oppHp} / ${engine.oppMaxHp}`, col: '#F2CA6B' },
      { k: 'COUNTERED BY', v: c ? c.oppTrick.comboShort : 'OUTLASTED', col: '#F0B2AC' },
    ];
    const sw = 206;
    const sx0 = CENTER_X - (sw * 3 + 36) / 2;
    for (let i = 0; i < 3; i += 1) {
      const sx = sx0 + i * (sw + 18);
      box(ctx, sx, by + 144, sw, 72, 10, 'rgba(13,14,23,0.86)', 'rgba(214,104,98,0.48)', 1.4);
      label(ctx, stats[i].k, sx + sw / 2, by + 165, `800 11px ${UI_FONT}`, '#B9B4C9');
      label(ctx, stats[i].v, sx + sw / 2, by + 195, '900 22px Georgia, serif', stats[i].col);
    }

    this.drawButton(ctx, 'btn-rematch', CENTER_X - 210, by + 246, 210, 54, 'REMATCH  [R]', { crimson: true, fontSize: 16, radius: 11 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-title', CENTER_X + 18, by + 246, 192, 54, 'CHANGE RIVAL', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
  }

  drawRulesModal(ctx, uiState) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,8,10,0.74)'; ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    const mw = 776; const mh = 524;
    const mx = (STAGE_W - mw) / 2; const my = (STAGE_H - mh) / 2;
    this.drawPanelBox(ctx, mx, my, mw, mh, '#F0C860', 'rgba(26,18,12,0.97)', 'rgba(13,24,19,0.98)');
    label(ctx, 'HOW TO PLAY LANTERN TRICK', STAGE_W / 2, my + 40, '900 26px Georgia, serif', '#FFE07A');

    const lines = [
      '1. 5-RIVAL CIRCUIT & RELIC DRAFTS — Defeat Maren, Vesper, Sable, Corvus & Aurelius, drafting 1 of 3 Relics after each win!',
      '2. READ THE TELL & SUITS LEFT — Watch Rival face-up lead, hidden Tell, Relic passive, and "Rival Suits Left" counter.',
      '3. GAMBIT ×2 STAKES [G] — Confident you counter their Tell? Raise ×2 for +5 DMG & a Trophy Seal (or Fold with [C] Kindle!).',
      '4. COMBINE 1 TO 3 CARDS — Spend Lantern coins (1–3 per card):',
      '   • PAIR (same rank): +5 PWR & Pierce 2   • HARMONY (same suit): +4/+8   • CHAIN (run): +4/+9   • PRISM (3 suits): +6',
      '5. ELEMENTAL TRUMPS (+3 PWR & COUNTER-BREAK):',
      '   • Ember (Red Diamond) > Bramble (Green Leaf) > Tide (Blue Crescent) > Ember · Brass (Gold Gear) adds Ward + Lanterns.',
      '6. CONTROLS — Click cards (keys 1–5), drag to table or [Space/Enter] play, [G] Raise Gambit ×2, [C] Kindle, [M] Mute, [R] Rematch.',
    ];
    for (let i = 0; i < lines.length; i += 1) {
      const head = /^\d\./.test(lines[i]);
      label(ctx, lines[i], mx + 30, my + 92 + i * 42, head ? `800 13px ${UI_FONT}` : `600 12.8px ${UI_FONT}`, head ? '#FFE7A3' : '#DCD0B6', 'left');
    }
    this.drawButton(ctx, 'btn-close-rules', STAGE_W / 2 - 90, my + mh - 64, 180, 44, 'GOT IT  [ESC]', { primary: true, fontSize: 15 }, null, uiState.hoveredButtonId);
    ctx.restore();
  }
}
