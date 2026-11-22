// HUD medallions, Rival Cameos & Relics, Suit Tracker, Trump Wheel, Combo Guide, and Screen Overlays.
import { SUITS, SUIT_IDS, createTitleShowcaseCards, doesSuitTrump } from './cards.js';
import { COMBO_CATALOG } from './combos.js';
import { RIVALS } from './ai.js';
import { PHASES, MAX_ROUNDS } from './rules.js';
import { drawCard, drawSuitEmblem, drawLanternIcon, drawHeartIcon, drawShieldIcon, drawSpeakerIcon, roundedRectPath } from './card-art.js';
import { drawRivalPortrait, drawParlorCandle, drawWoodenDeckTray, drawLanternCoin } from './portraits.js';
import { STAGE_W, STAGE_H, CENTER_X } from './renderer.js';

const SHOWCASE_CARDS = createTitleShowcaseCards();
const UI_FONT = 'system-ui, -apple-system, sans-serif';

function label(ctx, text, x, y, font, color, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
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
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
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
      else if (engine.phase === PHASES.VICTORY) this.drawOutcomeBanner(ctx, engine, anim, uiState, true);
      else if (engine.phase === PHASES.DEFEAT) this.drawOutcomeBanner(ctx, engine, anim, uiState, false);
    }
    if (engine.rulesOpen) this.drawRulesModal(ctx, uiState);
  }

  drawPanelBox(ctx, x, y, w, h, border = 'rgba(227,188,100,0.62)', top = 'rgba(22,16,12,0.89)', bot = 'rgba(12,10,8,0.93)') {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
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
        g.addColorStop(0, hov ? '#D94942' : '#BA3630');
        g.addColorStop(1, hov ? '#9E2822' : '#7E1E19');
        stroke = hov ? '#FFE485' : '#F2B89B';
      } else if (pri) {
        g.addColorStop(0, hov ? '#FFE278' : '#F0C554');
        g.addColorStop(1, hov ? '#D49A24' : '#B57B14');
        stroke = hov ? '#FFF9DA' : '#FFE48A';
      } else {
        g.addColorStop(0, hov ? 'rgba(66,48,30,0.96)' : 'rgba(38,28,20,0.92)');
        g.addColorStop(1, hov ? 'rgba(42,30,18,0.96)' : 'rgba(22,16,12,0.94)');
        stroke = hov ? '#FFE07A' : 'rgba(227,188,100,0.65)';
      }
      fill = g;
      if (hov) { ctx.shadowColor = pri ? 'rgba(255,212,89,0.55)' : 'rgba(255,212,89,0.3)'; ctx.shadowBlur = 14; }
    }
    box(ctx, x, y, w, h, style.radius ?? 10, fill, stroke, pri || crim ? 2.2 : 1.5);
    ctx.shadowBlur = 0;
    if (text) label(ctx, text, x + w / 2, y + h / 2 + 0.5, `900 ${style.fontSize ?? 15}px ${UI_FONT}`, dis ? '#8E816E' : pri ? '#1E1205' : '#FFF4DC');
    ctx.restore();
  }

  drawLeftColumn(ctx, engine) {
    const x = 36;
    const w = 192;
    const oppDead = engine.oppHp <= 0;

    // 1. Opponent medallion: painted cameo portrait, signature Relic passive, HP & Score
    this.drawPanelBox(ctx, x, 36, w, 168, oppDead ? '#8C4440' : engine.rival.accent);
    drawRivalPortrait(ctx, engine.rival.id, x + 34, 70, 21);
    label(ctx, engine.rival.name.toUpperCase(), x + 64, 62, '900 16px Georgia, serif', '#FFF5DC', 'left');
    label(ctx, engine.rival.title.toUpperCase(), x + 64, 79, `700 9.5px ${UI_FONT}`, '#C9B796', 'left');

    box(ctx, x + 10, 98, w - 20, 21, 6, 'rgba(255,206,102,0.12)', 'rgba(240,198,104,0.42)', 1);
    label(ctx, `${engine.rival.relicName}: ${engine.rival.relicDesc}`, x + w / 2, 108.5, `800 9.3px ${UI_FONT}`, '#FFE496');

    drawHeartIcon(ctx, x + 26, 139, 10.5, oppDead ? '#C84842' : '#FF6B5C');
    const oStr = String(engine.oppHp);
    label(ctx, oStr, x + 44, 140, '900 30px Georgia, serif', oppDead ? '#FF6B60' : '#FF8274', 'left');
    label(ctx, `/${engine.oppMaxHp}`, x + 48 + ctx.measureText(oStr).width, 144, `700 14px ${UI_FONT}`, '#B8A68A', 'left');
    hpBar(ctx, x + 14, 160, w - 28, 10, engine.oppHp / engine.oppMaxHp, '#2B1615', '#D93B32', '#FF7A59');

    label(ctx, `SCORE ${engine.oppScore}`, x + 14, 187, `800 11.5px ${UI_FONT}`, '#E5D5B5', 'left');
    if (engine.oppWard > 0) {
      drawShieldIcon(ctx, x + w - 33, 186, 7, '#FFD459');
      label(ctx, String(engine.oppWard), x + w - 14, 187, `800 12px ${UI_FONT}`, '#FFD459', 'right');
    } else {
      drawLanternIcon(ctx, x + w - 33, 186, 6, true);
      label(ctx, String(engine.oppLanterns), x + w - 14, 187, `800 12px ${UI_FONT}`, '#E6CA78', 'right');
    }

    // 2. Wooden Deck Tray + Rival Suit Tracker + Elemental Trump Wheel
    this.drawPanelBox(ctx, x, 214, w, 272, 'rgba(227,188,100,0.52)');
    drawWoodenDeckTray(ctx, x + 12, 224, 72, 92);
    for (let s = 3; s >= 0; s -= 1) drawCard(ctx, null, x + 50 - s * 1.8, 272 - s * 1.8, 52, 74, { flip: -1, shadow: s === 3 });
    label(ctx, 'DECK', x + 94, 240, `800 11px ${UI_FONT}`, '#F3D486', 'left');
    label(ctx, String(engine.playerDeck?.drawCount ?? 0), x + 94, 266, '900 28px Georgia, serif', '#FFF7E2', 'left');
    label(ctx, `DISC ${engine.playerDeck?.discardCount ?? 0}`, x + 94, 290, `700 10.5px ${UI_FONT}`, '#B7A78A', 'left');

    box(ctx, x + 10, 323, w - 20, 36, 8, 'rgba(10,22,17,0.72)', 'rgba(227,188,100,0.3)', 1);
    label(ctx, 'RIVAL SUITS LEFT', x + w / 2, 332.5, `800 8.5px ${UI_FONT}`, '#D8C293');
    const remSuits = engine.getRivalRemainingSuits();
    for (let i = 0; i < SUIT_IDS.length; i += 1) {
      const sid = SUIT_IDS[i];
      drawSuitEmblem(ctx, sid, x + 22 + i * 42, 348, 6.8);
      label(ctx, String(remSuits[sid]), x + 34 + i * 42, 349, `800 11px ${UI_FONT}`, '#FFF2D4', 'left');
    }

    label(ctx, 'TRUMP CYCLE (+3 PWR)', x + w / 2, 372, `800 10.5px ${UI_FONT}`, '#F2CE74');
    const wCx = x + w / 2;
    const wCy = 429;
    const nodes = [{ id: 'ember', px: wCx, py: wCy - 35 }, { id: 'bramble', px: wCx + 45, py: wCy + 23 }, { id: 'tide', px: wCx - 45, py: wCy + 23 }];
    ctx.strokeStyle = 'rgba(240,206,118,0.65)';
    ctx.lineWidth = 1.9;
    for (let i = 0; i < 3; i += 1) {
      const a = nodes[i];
      const b = nodes[(i + 1) % 3];
      const dx = b.px - a.px;
      const dy = b.py - a.py;
      const len = Math.hypot(dx, dy);
      const ex = b.px - (dx / len) * 18;
      const ey = b.py - (dy / len) * 18;
      ctx.beginPath();
      ctx.moveTo(a.px + (dx / len) * 18, a.py + (dy / len) * 18);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      const ang = Math.atan2(dy, dx);
      ctx.fillStyle = '#F2CE74';
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(ang - 0.5) * 6.5, ey - Math.sin(ang - 0.5) * 6.5);
      ctx.lineTo(ex - Math.cos(ang + 0.5) * 6.5, ey - Math.sin(ang + 0.5) * 6.5);
      ctx.closePath();
      ctx.fill();
    }
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.px, n.py, 15.5, 0, Math.PI * 2);
      ctx.fillStyle = '#18120D';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = SUITS[n.id].bright;
      ctx.stroke();
      drawSuitEmblem(ctx, n.id, n.px, n.py, 10.5);
    }
    ctx.beginPath();
    ctx.arc(wCx, wCy + 3, 12.5, 0, Math.PI * 2);
    ctx.fillStyle = '#22170C';
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = '#FFD459';
    ctx.stroke();
    drawSuitEmblem(ctx, 'brass', wCx, wCy + 3, 9);
    label(ctx, 'BRASS: NEUTRAL + WARD', wCx, 474, `700 9.5px ${UI_FONT}`, '#D8C7A4');

    // 3. Player Medallion with 3D Brass Lantern Coins
    const pDead = engine.playerHp <= 0;
    this.drawPanelBox(ctx, x, 496, w, 188, pDead ? '#A34844' : '#E5BE62');
    label(ctx, 'YOU · CHALLENGER', x + 14, 516, `900 12.5px ${UI_FONT}`, '#FFE499', 'left');
    drawHeartIcon(ctx, x + 27, 549, 11.5, pDead ? '#C84842' : '#4CE28D');
    const pStr = String(engine.playerHp);
    label(ctx, pStr, x + 45, 550, '900 32px Georgia, serif', pDead ? '#FF6B60' : '#57E897', 'left');
    label(ctx, `/${engine.playerMaxHp}`, x + 49 + ctx.measureText(pStr).width, 554, `700 15px ${UI_FONT}`, '#C0B092', 'left');
    hpBar(ctx, x + 14, 571, w - 28, 10, engine.playerHp / engine.playerMaxHp, '#10241A', '#1FA35E', '#66F09F');

    label(ctx, 'LANTERNS', x + 14, 601, `800 11.5px ${UI_FONT}`, '#F5CF6B', 'left');
    label(ctx, `${engine.playerLanterns} / ${engine.playerMaxLanterns}`, x + w - 14, 601, `900 14.5px ${UI_FONT}`, '#FFE485', 'right');
    const maxCoins = Math.max(engine.playerMaxLanterns, 6);
    const cStep = Math.min(24, (w - 34) / Math.max(1, maxCoins - 1));
    for (let i = 0; i < maxCoins; i += 1) drawLanternCoin(ctx, x + 21 + i * cStep, 624, 8.2, i < engine.playerLanterns);

    ctx.strokeStyle = 'rgba(227,188,100,0.25)';
    ctx.beginPath();
    ctx.moveTo(x + 14, 645);
    ctx.lineTo(x + w - 14, 645);
    ctx.stroke();
    label(ctx, `SCORE ${engine.playerScore}`, x + 14, 665, '900 14.5px Georgia, serif', '#FFF2CF', 'left');
    if (engine.playerWard > 0) {
      drawShieldIcon(ctx, x + w - 33, 664, 7.2, '#FFD459');
      label(ctx, String(engine.playerWard), x + w - 14, 665, `800 13px ${UI_FONT}`, '#FFD459', 'right');
    }
  }

  drawRightColumn(ctx, engine, sound, uiState) {
    const x = 1034;
    const w = 210;

    this.drawPanelBox(ctx, x, 36, w, 56, 'rgba(227,188,100,0.55)');
    label(ctx, `ROUND ${engine.round}/${MAX_ROUNDS}`, x + 12, 55, '900 14px Georgia, serif', '#FFE496', 'left');
    label(ctx, `RIVAL ${engine.rivalIndex + 1} OF 3`, x + 12, 74, `700 10.5px ${UI_FONT}`, '#C8B99B', 'left');
    this.drawButton(ctx, 'btn-mute', x + 122, 47, 26, 32, '', { radius: 7 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, x + 135, 63, 8.5, sound.muted);
    this.drawButton(ctx, 'btn-rules', x + 151, 47, 24, 32, '?', { fontSize: 14, radius: 7 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-reset', x + 178, 47, 24, 32, '↺', { fontSize: 15, radius: 7 }, null, uiState.hoveredButtonId);

    this.drawPanelBox(ctx, x, 106, w, 258, 'rgba(227,188,100,0.52)');
    label(ctx, 'COMBO SYNERGIES', x + w / 2, 126, `900 12px ${UI_FONT}`, '#F2CE74');
    const activeCombo = engine.phase === PHASES.CLASH ? engine.lastClash?.playerTrick?.comboId : engine.getSelectedTrick().comboId;
    for (let i = 0; i < COMBO_CATALOG.length; i += 1) {
      const it = COMBO_CATALOG[i];
      const ry = 144 + i * 44;
      const act = activeCombo === it.id;
      box(ctx, x + 12, ry, w - 24, 38, 8, act ? 'rgba(236,182,48,0.26)' : 'rgba(255,248,226,0.05)', act ? '#FFE066' : 'rgba(227,188,100,0.22)', act ? 2 : 1);
      label(ctx, it.name, x + 22, ry + 13, `900 13px ${UI_FONT}`, act ? '#FFF5C2' : it.color, 'left');
      label(ctx, it.desc, x + 22, ry + 28, `600 11px ${UI_FONT}`, act ? '#FDEBA4' : '#B9AA8F', 'left');
      label(ctx, it.bonus, x + w - 20, ry + 20, '900 14px Georgia, serif', act ? '#FFE270' : '#F3D27A', 'right');
    }
    box(ctx, x + 12, 324, w - 24, 28, 7, 'rgba(198,136,22,0.2)', 'rgba(255,212,89,0.45)', 1);
    label(ctx, 'BRASS COMBO: +2 WARD · +1✦', x + w / 2, 338.5, `800 10.5px ${UI_FONT}`, '#FFE48E');

    this.drawPanelBox(ctx, x, 380, w, 304, 'rgba(227,188,100,0.48)');
    label(ctx, 'TRICK CHRONICLE', x + w / 2, 400, `900 12px ${UI_FONT}`, '#F2CE74');
    if (engine.chronicle.length === 0) {
      label(ctx, 'Read the Rival Tell,', x + w / 2, 456, `600 12px ${UI_FONT}`, '#9C8E75');
      label(ctx, 'select 1–3 cards,', x + w / 2, 476, `600 12px ${UI_FONT}`, '#9C8E75');
      label(ctx, 'and press PLAY TRICK.', x + w / 2, 496, `600 12px ${UI_FONT}`, '#9C8E75');
    } else {
      const shown = engine.chronicle.slice(0, 4);
      for (let i = 0; i < shown.length; i += 1) {
        const e = shown[i];
        const cy = 418 + i * 57;
        const fill = e.winner === 'player' ? 'rgba(30,122,74,0.24)' : e.winner === 'opponent' ? 'rgba(180,48,42,0.24)' : 'rgba(140,118,72,0.2)';
        const brd = e.winner === 'player' ? 'rgba(84,224,140,0.5)' : e.winner === 'opponent' ? 'rgba(255,104,92,0.5)' : 'rgba(224,190,106,0.4)';
        box(ctx, x + 12, cy, w - 24, 50, 9, fill, brd, 1.1);
        label(ctx, `R${e.round}`, x + 20, cy + 16, `800 11px ${UI_FONT}`, '#E8D9B8', 'left');
        label(
          ctx,
          e.winner === 'player' ? `WIN (-${e.damage})` : e.winner === 'opponent' ? `LOSS (-${e.damage})` : e.winner === 'cycle' ? 'KINDLED' : 'TIE',
          x + 44, cy + 16, `900 11px ${UI_FONT}`,
          e.winner === 'player' ? '#6BF09E' : e.winner === 'opponent' ? '#FF8072' : '#FFE084', 'left',
        );
        label(ctx, `${e.playerPower}v${e.oppPower}`, x + w - 20, cy + 16, '900 12px Georgia, serif', '#FFF2CF', 'right');
        if (e.playerSuit) drawSuitEmblem(ctx, e.playerSuit, x + 25, cy + 36, 7);
        label(ctx, e.playerCombo, x + 38, cy + 36.5, `700 10.5px ${UI_FONT}`, '#CFC1A5', 'left');
        if (e.counterBreak || e.trumped) label(ctx, e.counterBreak ? 'BREAK!' : 'TRUMP', x + w - 20, cy + 36.5, `800 10px ${UI_FONT}`, '#FFE066', 'right');
      }
    }
    label(ctx, '[1-5] Select · [Space] Play · [C] Kindle', x + w / 2, 668, `700 9.8px ${UI_FONT}`, '#9C8D73');
  }

  drawCenterActionBar(ctx, engine, uiState) {
    const barY = 424;
    const barH = 42;
    const isClash = engine.phase === PHASES.CLASH;
    const trick = engine.getSelectedTrick();
    const canPlay = engine.canPlaySelected();

    box(ctx, 256, barY, 430, barH, 11, 'rgba(18,14,10,0.92)', isClash ? '#FFE066' : canPlay ? '#E6BE62' : 'rgba(227,188,100,0.4)', 1.6);
    if (isClash && engine.lastClash) {
      label(ctx, engine.lastClash.headline, 272, barY + 21.5, `900 13.5px ${UI_FONT}`, engine.lastClash.winner === 'player' ? '#72F2A5' : engine.lastClash.winner === 'opponent' ? '#FF877A' : '#FFE38A', 'left');
    } else if (uiState.toastMessage && uiState.toastTimer > 0) {
      label(ctx, `! ${uiState.toastMessage}`, 272, barY + 21.5, `800 13px ${UI_FONT}`, '#FF9C84', 'left');
    } else if (trick.cards.length > 0) {
      const trumps = doesSuitTrump(trick.leadSuit, engine.oppTelegraph?.leadSuit);
      const eff = trick.totalPower + (trumps ? 3 : 0);
      if (trick.leadSuit) drawSuitEmblem(ctx, trick.leadSuit, 280, barY + 21, 11);
      label(ctx, `${trick.comboName} · PWR ${eff}${trumps ? ' (TRUMP +3)' : ''} · ${trick.totalCost}✦`, 300, barY + 21.5, `900 13.5px ${UI_FONT}`, '#FFF4D4', 'left');
    } else {
      label(ctx, 'Pick 1–3 cards to counter the Rival Tell (or Kindle +2✦)', 272, barY + 21.5, `700 12.8px ${UI_FONT}`, '#D2C19E', 'left');
    }

    if (isClash) {
      this.drawButton(ctx, 'btn-continue', 702, barY, 302, barH, 'NEXT ROUND  [SPACE]', { primary: true, fontSize: 14 }, null, uiState.hoveredButtonId);
    } else {
      this.drawButton(ctx, 'btn-play', 700, barY, 166, barH, canPlay ? 'PLAY TRICK  ▸' : 'PLAY TRICK', { primary: canPlay, disabled: !canPlay, fontSize: 14 }, null, uiState.hoveredButtonId);
      this.drawButton(ctx, 'btn-cycle', 876, barY, 128, barH, 'KINDLE +2✦', { fontSize: 13 }, null, uiState.hoveredButtonId);
    }
  }

  drawTitleScreen(ctx, engine, anim, sound, uiState) {
    this.drawButton(ctx, 'btn-mute', 1140, 42, 42, 36, '', { radius: 8 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, 1161, 60, 10, sound.muted);
    this.drawButton(ctx, 'btn-rules', 1190, 42, 46, 36, '?', { fontSize: 16, radius: 8 }, null, uiState.hoveredButtonId);

    const panelW = 816;
    const panelX = CENTER_X - panelW / 2;
    const panelY = 32;
    this.drawPanelBox(ctx, panelX, panelY, panelW, 318, '#E8C266', 'rgba(26,17,11,0.92)', 'rgba(12,24,19,0.93)');

    drawLanternIcon(ctx, CENTER_X, panelY + 28, 16, true);
    ctx.strokeStyle = 'rgba(240,202,108,0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(CENTER_X - 180, panelY + 28); ctx.lineTo(CENTER_X - 30, panelY + 28);
    ctx.moveTo(CENTER_X + 30, panelY + 28); ctx.lineTo(CENTER_X + 180, panelY + 28);
    ctx.stroke();

    label(ctx, 'LANTERN TRICK', CENTER_X + 3, panelY + 83, '900 58px Georgia, serif', 'rgba(0,0,0,0.68)');
    const tg = ctx.createLinearGradient(CENTER_X, panelY + 46, CENTER_X, panelY + 108);
    tg.addColorStop(0, '#FFF8D4'); tg.addColorStop(0.5, '#F5CB5C'); tg.addColorStop(1, '#BA7F19');
    label(ctx, 'LANTERN TRICK', CENTER_X, panelY + 80, '900 58px Georgia, serif', tg);
    label(ctx, 'HEIRLOOM CANDLELIT PARLOR TRICK-COMBO DUEL', CENTER_X, panelY + 118, `800 13.5px ${UI_FONT}`, '#E7D7B4');

    const cardW = 242;
    const rowX = CENTER_X - (cardW * 3 + 32) / 2;
    const rowY = panelY + 142;
    for (let i = 0; i < RIVALS.length; i += 1) {
      const r = RIVALS[i];
      const rx = rowX + i * (cardW + 16);
      const sel = engine.rivalIndex === i;
      const id = `rival-${i}`;
      const hov = uiState.hoveredButtonId === id;
      this.registerButton(id, rx, rowY, cardW, 84, i);
      box(ctx, rx, rowY, cardW, 84, 10, sel ? 'rgba(242,198,84,0.22)' : hov ? 'rgba(255,240,200,0.09)' : 'rgba(12,18,15,0.74)', sel ? '#FFE06E' : hov ? '#E2BD64' : 'rgba(227,188,100,0.36)', sel ? 2.4 : 1.3);
      drawRivalPortrait(ctx, r.id, rx + 31, rowY + 42, 22);
      label(ctx, `${r.name} · ${r.maxHp} HP`, rx + 62, rowY + 21, '900 14.5px Georgia, serif', sel ? '#FFF8DF' : '#E7D8B6', 'left');
      label(ctx, `${r.difficulty.toUpperCase()} · ${r.badge}`, rx + 62, rowY + 40, `800 10px ${UI_FONT}`, r.accent, 'left');
      label(ctx, `Relic: ${r.relicName}`, rx + 62, rowY + 61, `700 10.5px ${UI_FONT}`, '#D8C79F', 'left');
    }

    this.drawButton(ctx, 'btn-start', CENTER_X - 186, panelY + 246, 234, 50, 'PLAY MATCH  ▸', { primary: true, fontSize: 18, radius: 12 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-rules-title', CENTER_X + 64, panelY + 246, 130, 50, 'RULES  [?]', { fontSize: 14, radius: 12 }, null, uiState.hoveredButtonId);

    const hg = ctx.createRadialGradient(CENTER_X, 504, 24, CENTER_X, 504, 350);
    hg.addColorStop(0, 'rgba(255,215,115,0.26)');
    hg.addColorStop(1, 'rgba(255,190,80,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(CENTER_X, 504, 390, 128, 0, 0, Math.PI * 2);
    ctx.fill();

    const fanStart = CENTER_X - (168 * 3) / 2;
    for (let i = 0; i < SHOWCASE_CARDS.length; i += 1) {
      const norm = (i / 3) * 2 - 1;
      drawCard(ctx, SHOWCASE_CARDS[i], fanStart + i * 168, 496 + norm * norm * 14 + Math.sin(anim.time * 2.1 + i * 1.1) * 3, 136, 194, { rot: norm * 0.072, scale: 1, flip: 1, selected: i === 3 });
    }

    box(ctx, CENTER_X - 395, 646, 790, 34, 17, 'rgba(15,11,8,0.9)', 'rgba(227,188,100,0.52)', 1.4);
    label(ctx, '4 SUITS:  EMBER > BRAMBLE > TIDE > EMBER  ·  BRASS WARDS  ·  COMBOS: PAIR · HARMONY · CHAIN · PRISM', CENTER_X, 663.5, `800 12.2px ${UI_FONT}`, '#F2DEA8');
  }

  drawOutcomeBanner(ctx, engine, anim, uiState, isWin) {
    const bw = 724;
    const bx = CENTER_X - bw / 2;
    const by = 38;
    this.drawPanelBox(
      ctx, bx, by, bw, 330,
      isWin ? '#FFE06E' : '#DC5B54',
      isWin ? 'rgba(34,24,11,0.93)' : 'rgba(24,21,31,0.95)',
      isWin ? 'rgba(15,30,22,0.95)' : 'rgba(14,15,24,0.96)',
    );

    drawParlorCandle(ctx, bx + 66, by + (isWin ? 86 : 92), 0.9, anim.time, !isWin);
    drawParlorCandle(ctx, bx + bw - 66, by + (isWin ? 86 : 92), 0.9, anim.time + 1.1, !isWin);
    drawLanternIcon(ctx, CENTER_X, by + 26, 14, isWin);

    const headText = isWin ? 'VICTORY!' : 'DEFEAT';
    label(ctx, headText, CENTER_X + 3, by + 76, '900 52px Georgia, serif', 'rgba(0,0,0,0.68)');
    const g = ctx.createLinearGradient(CENTER_X, by + 46, CENTER_X, by + 104);
    if (isWin) { g.addColorStop(0, '#FFF9D6'); g.addColorStop(0.5, '#FFD95A'); g.addColorStop(1, '#C78615'); }
    else { g.addColorStop(0, '#F5E8E8'); g.addColorStop(0.55, '#E8958E'); g.addColorStop(1, '#B8433E'); }
    label(ctx, headText, CENTER_X, by + 74, '900 52px Georgia, serif', g);

    const sub = isWin
      ? `${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} DEFEATED · ROUND ${engine.round}`
      : `OUTPLAYED BY ${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} · ROUND ${engine.round}`;
    label(ctx, sub, CENTER_X, by + 114, `800 13.5px ${UI_FONT}`, isWin ? '#F2E2BC' : '#DBD2E0');

    const c = engine.lastClash;
    const stats = isWin
      ? [
          { k: 'YOUR LIFE', v: `${engine.playerHp} / ${engine.playerMaxHp}`, col: '#6BF09E' },
          { k: 'GLORY SCORE', v: String(engine.playerScore), col: '#FFE06E' },
          { k: 'COMBOS · TRUMPS', v: `${engine.matchStats.combosLanded} · ${engine.matchStats.trumpsLanded}`, col: '#66C2FF' },
        ]
      : [
          { k: 'YOUR LIFE', v: `${engine.playerHp} / ${engine.playerMaxHp}`, col: '#FF7066' },
          { k: `${engine.rival.name.toUpperCase()} LIFE`, v: `${engine.oppHp} / ${engine.oppMaxHp}`, col: '#F2CA6B' },
          { k: 'COUNTERED BY', v: c ? c.oppTrick.comboShort : 'OUTLASTED', col: '#F0B2AC' },
        ];

    const sw = 206;
    const sx0 = CENTER_X - (sw * 3 + 36) / 2;
    for (let i = 0; i < 3; i += 1) {
      const sx = sx0 + i * (sw + 18);
      box(ctx, sx, by + 144, sw, 72, 10, isWin ? 'rgba(11,20,15,0.82)' : 'rgba(13,14,23,0.86)', isWin ? 'rgba(236,198,108,0.48)' : 'rgba(214,104,98,0.48)', 1.4);
      label(ctx, stats[i].k, sx + sw / 2, by + 165, `800 11px ${UI_FONT}`, isWin ? '#D6C6A4' : '#B9B4C9');
      label(ctx, stats[i].v, sx + sw / 2, by + 195, `900 ${isWin ? 24 : 22}px Georgia, serif`, stats[i].col);
    }

    if (isWin) {
      const nextRival = RIVALS[(engine.rivalIndex + 1) % RIVALS.length];
      this.drawButton(ctx, 'btn-next-rival', CENTER_X - 246, by + 246, 224, 54, `NEXT: ${nextRival.name.toUpperCase()}  ▸`, { primary: true, fontSize: 15, radius: 11 }, null, uiState.hoveredButtonId);
      this.drawButton(ctx, 'btn-rematch', CENTER_X - 6, by + 246, 146, 54, 'REMATCH [R]', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
      this.drawButton(ctx, 'btn-title', CENTER_X + 154, by + 246, 96, 54, 'TITLE', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
    } else {
      this.drawButton(ctx, 'btn-rematch', CENTER_X - 210, by + 246, 210, 54, 'REMATCH  [R]', { crimson: true, fontSize: 16, radius: 11 }, null, uiState.hoveredButtonId);
      this.drawButton(ctx, 'btn-title', CENTER_X + 18, by + 246, 192, 54, 'CHANGE RIVAL', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
    }
  }

  drawRulesModal(ctx, uiState) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,8,10,0.74)';
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    const mw = 768;
    const mh = 516;
    const mx = (STAGE_W - mw) / 2;
    const my = (STAGE_H - mh) / 2;
    this.drawPanelBox(ctx, mx, my, mw, mh, '#F0C860', 'rgba(26,18,12,0.97)', 'rgba(13,24,19,0.98)');
    label(ctx, 'HOW TO PLAY LANTERN TRICK', STAGE_W / 2, my + 40, '900 26px Georgia, serif', '#FFE07A');

    const lines = [
      '1. READ THE RIVAL TELL & RELIC — Each round your rival shows 1 face-up card + hidden Tell, plus their Relic passive.',
      '2. TRACK RIVAL SUITS — Watch "Rival Suits Left" on the left panel to anticipate their hidden combo card.',
      '3. COMBINE 1 TO 3 CARDS — Spend Lantern coins (cost 1–3 per card) to trigger combos:',
      '   • PAIR RESONANCE (same rank): +5 PWR & pierces 2 Ward    • SUIT HARMONY (2–3 same suit): +4 / +8 PWR',
      '   • CHAIN RUN (consecutive ranks e.g. 4-5-6): +4 / +9 PWR   • PRISM TRIAD (3 suits): +6 PWR, ignores Trump',
      '4. ELEMENTAL TRUMPS (+3 PWR & COUNTER-BREAK):',
      '   • Ember (Red Diamond) > Bramble (Green Leaf) > Tide (Blue Crescent) > Ember · Brass (Gold Gear) adds Ward + Lanterns.',
      '5. KINDLE HEARTH [C] — Discard 1–2 cards to gain +4 carry-over Ward & +2 Lanterns next round.',
      '6. CONTROLS — Click cards (or keys 1–5), drag onto the table or press Space/Enter to play, M to mute, R to rematch.',
    ];
    for (let i = 0; i < lines.length; i += 1) {
      const head = /^\d\./.test(lines[i]);
      label(ctx, lines[i], mx + 32, my + 92 + i * 38, head ? `800 13.5px ${UI_FONT}` : `600 13px ${UI_FONT}`, head ? '#FFE7A3' : '#DCD0B6', 'left');
    }
    this.drawButton(ctx, 'btn-close-rules', STAGE_W / 2 - 90, my + mh - 64, 180, 44, 'GOT IT  [ESC]', { primary: true, fontSize: 15 }, null, uiState.hoveredButtonId);
    ctx.restore();
  }
}
