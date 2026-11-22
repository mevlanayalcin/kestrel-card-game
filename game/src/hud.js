// HUD medallions, Trump Wheel, Combo Synergy Guide, Chronicle, and Title / Victory / Defeat screens.
import { SUITS, createTitleShowcaseCards, doesSuitTrump } from './cards.js';
import { COMBO_CATALOG } from './combos.js';
import { RIVALS } from './ai.js';
import { PHASES, MAX_ROUNDS } from './rules.js';
import { drawCard, drawSuitEmblem, drawLanternIcon, drawHeartIcon, drawShieldIcon, drawSpeakerIcon, roundedRectPath } from './card-art.js';
import { STAGE_W, STAGE_H, CENTER_X } from './renderer.js';

const SHOWCASE_CARDS = createTitleShowcaseCards();

export class HudRenderer {
  constructor() {
    this.buttons = [];
  }

  resetButtons() {
    this.buttons = [];
  }

  registerButton(id, x, y, w, h, data = null) {
    this.buttons.push({ id, x, y, w, h, data });
  }

  hitTestButton(x, y) {
    for (let i = this.buttons.length - 1; i >= 0; i -= 1) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return b;
      }
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

      if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
        this.drawCenterActionBar(ctx, engine, uiState);
      } else if (engine.phase === PHASES.VICTORY) {
        this.drawVictoryBanner(ctx, engine, uiState);
      } else if (engine.phase === PHASES.DEFEAT) {
        this.drawDefeatBanner(ctx, engine, uiState);
      }
    }

    if (engine.rulesOpen) {
      this.drawRulesModal(ctx, uiState);
    }
  }

  drawPanelBox(ctx, x, y, w, h, borderColor = 'rgba(227, 188, 100, 0.62)', fillTop = 'rgba(22, 16, 12, 0.88)', fillBot = 'rgba(13, 10, 8, 0.92)') {
    roundedRectPath(ctx, x, y, w, h, 14);
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, fillTop);
    grad.addColorStop(1, fillBot);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  drawButton(ctx, id, x, y, w, h, label, style = {}, data = null, hoveredId = null) {
    const hovered = hoveredId === id;
    const disabled = !!style.disabled;
    const primary = !!style.primary;
    const crimson = !!style.crimson;

    if (!disabled) this.registerButton(id, x, y, w, h, data);

    ctx.save();
    roundedRectPath(ctx, x, y, w, h, style.radius ?? 10);
    if (disabled) {
      ctx.fillStyle = 'rgba(42, 36, 30, 0.72)';
      ctx.strokeStyle = 'rgba(132, 114, 84, 0.45)';
    } else if (crimson) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, hovered ? '#D94942' : '#BA3630');
      g.addColorStop(1, hovered ? '#9E2822' : '#7E1E19');
      ctx.fillStyle = g;
      ctx.strokeStyle = hovered ? '#FFE485' : '#F2B89B';
    } else if (primary) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, hovered ? '#FFE278' : '#F0C554');
      g.addColorStop(1, hovered ? '#D49A24' : '#B57B14');
      ctx.fillStyle = g;
      ctx.strokeStyle = hovered ? '#FFF9DA' : '#FFE48A';
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, hovered ? 'rgba(66, 48, 30, 0.96)' : 'rgba(38, 28, 20, 0.92)');
      g.addColorStop(1, hovered ? 'rgba(42, 30, 18, 0.96)' : 'rgba(22, 16, 12, 0.94)');
      ctx.fillStyle = g;
      ctx.strokeStyle = hovered ? '#FFE07A' : 'rgba(227, 188, 100, 0.65)';
    }
    if (hovered && !disabled) {
      ctx.shadowColor = primary ? 'rgba(255, 212, 89, 0.55)' : 'rgba(255, 212, 89, 0.3)';
      ctx.shadowBlur = 14;
    }
    ctx.fill();
    ctx.lineWidth = primary || crimson ? 2.2 : 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = disabled ? '#8E816E' : primary ? '#1E1205' : '#FFF4DC';
    ctx.font = `900 ${style.fontSize ?? 15}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
    ctx.restore();
  }

  drawLeftColumn(ctx, engine) {
    const x = 36;
    const w = 192;

    // 1. OPPONENT MEDALLION PANEL (y = 38..184)
    const oppDead = engine.oppHp <= 0;
    this.drawPanelBox(ctx, x, 38, w, 146, oppDead ? '#8C4440' : engine.rival.accent);

    // Rival suit crest + name
    drawSuitEmblem(ctx, engine.rival.favSuit, x + 26, 66, 13);
    ctx.fillStyle = '#FFF5DC';
    ctx.font = '900 17px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(engine.rival.name.toUpperCase(), x + 46, 61);

    ctx.fillStyle = '#C9B796';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(engine.rival.title.toUpperCase(), x + 46, 77);

    // HUGE Opponent Life display + HP Bar (exact measured spacing + custom vector heart)
    drawHeartIcon(ctx, x + 28, 113, 11.5, oppDead ? '#C84842' : '#FF6B5C');
    ctx.fillStyle = oppDead ? '#FF6B60' : '#FF8274';
    ctx.font = '900 32px Georgia, serif';
    ctx.textAlign = 'left';
    const oppHpStr = String(engine.oppHp);
    ctx.fillText(oppHpStr, x + 46, 114);
    const oppHpW = ctx.measureText(oppHpStr).width;
    ctx.fillStyle = '#B8A68A';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(`/${engine.oppMaxHp}`, x + 50 + oppHpW, 118);

    // HP Bar
    const barX = x + 16;
    const barW = w - 32;
    roundedRectPath(ctx, barX, 134, barW, 11, 5);
    ctx.fillStyle = '#2B1615';
    ctx.fill();
    const oppPct = Math.max(0, Math.min(1, engine.oppHp / engine.oppMaxHp));
    if (oppPct > 0) {
      roundedRectPath(ctx, barX, 134, Math.max(8, barW * oppPct), 11, 5);
      const hpG = ctx.createLinearGradient(barX, 134, barX + barW, 134);
      hpG.addColorStop(0, '#D93B32');
      hpG.addColorStop(1, '#FF7A59');
      ctx.fillStyle = hpG;
      ctx.fill();
    }

    // Opp Score & Ward strip
    ctx.fillStyle = '#E5D5B5';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${engine.oppScore}`, x + 16, 165);
    if (engine.oppWard > 0) {
      drawShieldIcon(ctx, x + w - 34, 164, 7.5, '#FFD459');
      ctx.fillStyle = '#FFD459';
      ctx.textAlign = 'right';
      ctx.fillText(String(engine.oppWard), x + w - 14, 165);
    } else {
      drawLanternIcon(ctx, x + w - 34, 164, 6.5, true);
      ctx.fillStyle = '#E6CA78';
      ctx.textAlign = 'right';
      ctx.fillText(String(engine.oppLanterns), x + w - 14, 165);
    }

    // 2. DRAW DECK + ELEMENTAL TRUMP WHEEL (y = 200..476)
    this.drawPanelBox(ctx, x, 200, w, 276, 'rgba(227, 188, 100, 0.5)');

    // Miniature 3D stacked Draw Deck at top of panel
    const deckCx = x + 56;
    const deckCy = 262;
    for (let s = 3; s >= 0; s -= 1) {
      drawCard(ctx, null, deckCx - s * 2, deckCy - s * 2, 58, 82, {
        flip: -1,
        shadow: s === 3,
      });
    }
    ctx.fillStyle = '#F3D486';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DECK', x + 98, 240);
    ctx.fillStyle = '#FFF7E2';
    ctx.font = '900 28px Georgia, serif';
    ctx.fillText(String(engine.playerDeck?.drawCount ?? 0), x + 98, 267);
    ctx.fillStyle = '#B7A78A';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText(`DISC ${engine.playerDeck?.discardCount ?? 0}`, x + 98, 292);

    // Divider line
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 14, 316);
    ctx.lineTo(x + w - 14, 316);
    ctx.stroke();

    // Elemental Trump Triangle Diagram (Color + Shape!)
    ctx.fillStyle = '#F2CE74';
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRUMP CYCLE (+3 PWR)', x + w / 2, 333);

    const wCx = x + w / 2;
    const wCy = 402;
    const nodes = [
      { id: 'ember', px: wCx, py: wCy - 42 },
      { id: 'bramble', px: wCx + 48, py: wCy + 28 },
      { id: 'tide', px: wCx - 48, py: wCy + 28 },
    ];

    // Circular gold arrows connecting Ember -> Bramble -> Tide -> Ember
    ctx.save();
    ctx.strokeStyle = 'rgba(240, 206, 118, 0.65)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const a = nodes[i];
      const b = nodes[(i + 1) % 3];
      const dx = b.px - a.px;
      const dy = b.py - a.py;
      const len = Math.hypot(dx, dy);
      const sx = a.px + (dx / len) * 20;
      const sy = a.py + (dy / len) * 20;
      const ex = b.px - (dx / len) * 20;
      const ey = b.py - (dy / len) * 20;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Arrowhead
      const ang = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(ang - 0.5) * 7, ey - Math.sin(ang - 0.5) * 7);
      ctx.lineTo(ex - Math.cos(ang + 0.5) * 7, ey - Math.sin(ang + 0.5) * 7);
      ctx.closePath();
      ctx.fillStyle = '#F2CE74';
      ctx.fill();
    }
    ctx.restore();

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.px, n.py, 17, 0, Math.PI * 2);
      ctx.fillStyle = '#18120D';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = SUITS[n.id].bright;
      ctx.stroke();
      drawSuitEmblem(ctx, n.id, n.px, n.py, 12);
    }

    // Center Brass Neutral Ward emblem
    ctx.beginPath();
    ctx.arc(wCx, wCy + 4, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#22170C';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#FFD459';
    ctx.stroke();
    drawSuitEmblem(ctx, 'brass', wCx, wCy + 4, 10);

    ctx.fillStyle = '#D8C7A4';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☀ BRASS: NEUTRAL + WARD', wCx, 460);

    // 3. PLAYER MEDALLION PANEL (y = 492..682)
    const pDead = engine.playerHp <= 0;
    this.drawPanelBox(ctx, x, 492, w, 190, pDead ? '#A34844' : '#E5BE62');

    ctx.fillStyle = '#FFE499';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('YOU · CHALLENGER', x + 16, 514);

    // HUGE Player Life total (exact measured spacing + custom vector heart)
    drawHeartIcon(ctx, x + 28, 548, 12, pDead ? '#C84842' : '#4CE28D');
    ctx.fillStyle = pDead ? '#FF6B60' : '#57E897';
    ctx.font = '900 34px Georgia, serif';
    const pHpStr = String(engine.playerHp);
    ctx.fillText(pHpStr, x + 46, 548);
    const pHpW = ctx.measureText(pHpStr).width;
    ctx.fillStyle = '#C0B092';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(`/${engine.playerMaxHp}`, x + 50 + pHpW, 552);

    // Player HP bar
    roundedRectPath(ctx, barX, 570, barW, 11, 5);
    ctx.fillStyle = '#10241A';
    ctx.fill();
    const pPct = Math.max(0, Math.min(1, engine.playerHp / engine.playerMaxHp));
    if (pPct > 0) {
      roundedRectPath(ctx, barX, 570, Math.max(8, barW * pPct), 11, 5);
      const pg = ctx.createLinearGradient(barX, 570, barX + barW, 570);
      pg.addColorStop(0, '#1FA35E');
      pg.addColorStop(1, '#66F09F');
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Lantern Resource Pool (glowing gold lantern icons + numeral!)
    ctx.fillStyle = '#F5CF6B';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LANTERNS', x + 16, 602);
    ctx.textAlign = 'right';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.fillText(`${engine.playerLanterns} / ${engine.playerMaxLanterns}`, x + w - 16, 602);

    const lanternDisplayMax = Math.max(engine.playerMaxLanterns, 6);
    const lStep = Math.min(24, (w - 38) / Math.max(1, lanternDisplayMax - 1));
    for (let i = 0; i < lanternDisplayMax; i += 1) {
      drawLanternIcon(ctx, x + 22 + i * lStep, 624, 8.5, i < engine.playerLanterns);
    }

    // Score & Ward footer strip
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x + 14, 644);
    ctx.lineTo(x + w - 14, 644);
    ctx.stroke();

    ctx.fillStyle = '#FFF2CF';
    ctx.font = '900 15px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${engine.playerScore}`, x + 16, 664);

    if (engine.playerWard > 0) {
      drawShieldIcon(ctx, x + w - 34, 663, 7.5, '#FFD459');
      ctx.fillStyle = '#FFD459';
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(engine.playerWard), x + w - 14, 664);
    }
  }

  drawRightColumn(ctx, engine, sound, uiState) {
    const x = 1034;
    const w = 210;

    // 1. TOP ROUND & UTILITY BAR (y = 38..94) — generous clearance before buttons
    this.drawPanelBox(ctx, x, 38, w, 56, 'rgba(227, 188, 100, 0.55)');
    ctx.fillStyle = '#FFE496';
    ctx.font = '900 14px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ROUND ${engine.round}/${MAX_ROUNDS}`, x + 12, 57);

    ctx.fillStyle = '#C8B99B';
    ctx.font = '700 10.5px system-ui, sans-serif';
    ctx.fillText(`RIVAL ${engine.rivalIndex + 1} OF 3`, x + 12, 76);

    // Compact interactive utility buttons: custom vector Mute, Rules, Restart
    this.drawButton(ctx, 'btn-mute', x + 122, 49, 26, 32, '', { radius: 7 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, x + 135, 65, 8.5, sound.muted);
    this.drawButton(ctx, 'btn-rules', x + 151, 49, 24, 32, '?', { fontSize: 14, radius: 7 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-reset', x + 178, 49, 24, 32, '↺', { fontSize: 15, radius: 7 }, null, uiState.hoveredButtonId);

    // 2. COMBO SYNERGY GUIDE (y = 108..366) — highlights live active combo!
    this.drawPanelBox(ctx, x, 108, w, 258, 'rgba(227, 188, 100, 0.52)');
    ctx.fillStyle = '#F2CE74';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMBO SYNERGIES', x + w / 2, 128);

    const activeComboId = engine.phase === PHASES.CLASH
      ? engine.lastClash?.playerTrick?.comboId
      : engine.getSelectedTrick().comboId;

    for (let i = 0; i < COMBO_CATALOG.length; i += 1) {
      const item = COMBO_CATALOG[i];
      const ry = 146 + i * 44;
      const active = activeComboId === item.id;

      roundedRectPath(ctx, x + 12, ry, w - 24, 38, 8);
      ctx.fillStyle = active ? 'rgba(236, 182, 48, 0.25)' : 'rgba(255, 248, 226, 0.05)';
      ctx.fill();
      ctx.lineWidth = active ? 2 : 1;
      ctx.strokeStyle = active ? '#FFE066' : 'rgba(227, 188, 100, 0.22)';
      ctx.stroke();

      ctx.fillStyle = active ? '#FFF5C2' : item.color;
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, x + 22, ry + 13);

      ctx.fillStyle = active ? '#FDEBA4' : '#B9AA8F';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillText(item.desc, x + 22, ry + 28);

      ctx.fillStyle = active ? '#FFE270' : '#F3D27A';
      ctx.font = '900 14px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.bonus, x + w - 20, ry + 20);
    }

    // Brass Harmonic Synergy footer
    roundedRectPath(ctx, x + 12, 326, w - 24, 28, 7);
    ctx.fillStyle = 'rgba(198, 136, 22, 0.2)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 212, 89, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#FFE48E';
    ctx.font = '800 10.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRASS COMBO: +2 WARD · +1✦', x + w / 2, 340.5);

    // 3. TRICK CHRONICLE (y = 382..682)
    this.drawPanelBox(ctx, x, 382, w, 300, 'rgba(227, 188, 100, 0.48)');
    ctx.fillStyle = '#F2CE74';
    ctx.font = '900 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRICK CHRONICLE', x + w / 2, 402);

    if (engine.chronicle.length === 0) {
      ctx.fillStyle = '#9C8E75';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.fillText('Read the Rival Tell,', x + w / 2, 456);
      ctx.fillText('select 1–3 cards,', x + w / 2, 476);
      ctx.fillText('and press PLAY TRICK.', x + w / 2, 496);
    } else {
      const shown = engine.chronicle.slice(0, 4);
      for (let i = 0; i < shown.length; i += 1) {
        const entry = shown[i];
        const cy = 420 + i * 56;
        roundedRectPath(ctx, x + 12, cy, w - 24, 50, 9);
        const bg =
          entry.winner === 'player'
            ? 'rgba(30, 122, 74, 0.24)'
            : entry.winner === 'opponent'
              ? 'rgba(180, 48, 42, 0.24)'
              : 'rgba(140, 118, 72, 0.2)';
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.lineWidth = 1.1;
        ctx.strokeStyle =
          entry.winner === 'player'
            ? 'rgba(84, 224, 140, 0.5)'
            : entry.winner === 'opponent'
              ? 'rgba(255, 104, 92, 0.5)'
              : 'rgba(224, 190, 106, 0.4)';
        ctx.stroke();

        // Top row: Round + Result + Score clash
        ctx.fillStyle = '#E8D9B8';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`R${entry.round}`, x + 20, cy + 16);

        ctx.fillStyle = entry.winner === 'player' ? '#6BF09E' : entry.winner === 'opponent' ? '#FF8072' : '#FFE084';
        ctx.font = '900 11px system-ui, sans-serif';
        ctx.fillText(
          entry.winner === 'player' ? `WIN (-${entry.damage}♥)` : entry.winner === 'opponent' ? `LOSS (-${entry.damage}♥)` : entry.winner === 'cycle' ? 'CYCLED' : 'TIE',
          x + 44,
          cy + 16,
        );

        ctx.fillStyle = '#FFF2CF';
        ctx.font = '900 12px Georgia, serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${entry.playerPower}v${entry.oppPower}`, x + w - 20, cy + 16);

        // Bottom row: Combo & Suit icon
        if (entry.playerSuit) drawSuitEmblem(ctx, entry.playerSuit, x + 25, cy + 36, 7);
        ctx.fillStyle = '#CFC1A5';
        ctx.font = '700 10.5px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(entry.playerCombo, x + 38, cy + 36.5);

        if (entry.counterBreak || entry.trumped) {
          ctx.fillStyle = '#FFE066';
          ctx.font = '800 10px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(entry.counterBreak ? 'BREAK!' : 'TRUMP', x + w - 20, cy + 36.5);
        }
      }
    }

    // Subtle keyboard control legend at bottom of chronicle panel
    ctx.fillStyle = '#9C8D73';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[1-5] Select · [Space] Play · [C] Cycle', x + w / 2, 666);
  }

  drawCenterActionBar(ctx, engine, uiState) {
    const barY = 424;
    const barH = 42;
    const isClash = engine.phase === PHASES.CLASH;
    const trick = engine.getSelectedTrick();
    const canPlay = engine.canPlaySelected();

    // Left Live Status / Combo Preview Pill
    const pillX = 256;
    const pillW = 434;
    roundedRectPath(ctx, pillX, barY, pillW, barH, 11);
    ctx.fillStyle = 'rgba(18, 14, 10, 0.9)';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = isClash
      ? '#FFE066'
      : canPlay
        ? '#E6BE62'
        : 'rgba(227, 188, 100, 0.4)';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (isClash && engine.lastClash) {
      ctx.fillStyle = engine.lastClash.winner === 'player' ? '#72F2A5' : engine.lastClash.winner === 'opponent' ? '#FF877A' : '#FFE38A';
      ctx.font = '900 14px system-ui, sans-serif';
      ctx.fillText(engine.lastClash.headline, pillX + 16, barY + barH / 2 + 0.5);
    } else if (uiState.toastMessage && uiState.toastTimer > 0) {
      ctx.fillStyle = '#FF9C84';
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.fillText(`! ${uiState.toastMessage}`, pillX + 16, barY + barH / 2 + 0.5);
    } else if (trick.cards.length > 0) {
      const oppSuit = engine.oppTelegraph?.leadSuit;
      const trumps = doesSuitTrump(trick.leadSuit, oppSuit);
      const effPower = trick.totalPower + (trumps ? 3 : 0);
      if (trick.leadSuit) drawSuitEmblem(ctx, trick.leadSuit, pillX + 24, barY + barH / 2, 11);
      ctx.fillStyle = '#FFF4D4';
      ctx.font = '900 13.5px system-ui, sans-serif';
      const label = `${trick.comboName} · PWR ${effPower}${trumps ? ' (TRUMP +3)' : ''} · ${trick.totalCost}✦`;
      ctx.fillText(label, pillX + 44, barY + barH / 2 + 0.5);
    } else {
      ctx.fillStyle = '#D2C19E';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.fillText('Pick 1–3 cards to counter the Rival Tell (or Cycle for +2✦)', pillX + 16, barY + barH / 2 + 0.5);
    }

    // Right Action Buttons
    if (isClash) {
      this.drawButton(ctx, 'btn-continue', 706, barY, 298, barH, 'NEXT ROUND  [SPACE]', { primary: true, fontSize: 14 }, null, uiState.hoveredButtonId);
    } else {
      this.drawButton(
        ctx,
        'btn-play',
        704,
        barY,
        166,
        barH,
        canPlay ? 'PLAY TRICK  ▸' : 'PLAY TRICK',
        { primary: canPlay, disabled: !canPlay, fontSize: 14 },
        null,
        uiState.hoveredButtonId,
      );
      this.drawButton(
        ctx,
        'btn-cycle',
        880,
        barY,
        124,
        barH,
        'CYCLE +2✦',
        { fontSize: 13 },
        null,
        uiState.hoveredButtonId,
      );
    }
  }

  drawTitleScreen(ctx, engine, anim, sound, uiState) {
    // Top-right custom vector audio & rules buttons
    this.drawButton(ctx, 'btn-mute', 1140, 42, 42, 36, '', { radius: 8 }, null, uiState.hoveredButtonId);
    drawSpeakerIcon(ctx, 1161, 60, 10, sound.muted);
    this.drawButton(ctx, 'btn-rules', 1190, 42, 46, 36, '?', { fontSize: 16, radius: 8 }, null, uiState.hoveredButtonId);

    // 1. Upper-Center Ornate Title Crest Panel (y = 34..348)
    const panelW = 790;
    const panelX = CENTER_X - panelW / 2;
    const panelY = 34;
    const panelH = 314;
    this.drawPanelBox(ctx, panelX, panelY, panelW, panelH, '#E6BF64', 'rgba(26, 17, 11, 0.9)', 'rgba(13, 24, 19, 0.92)');

    // Lit decorative brass lantern crown at top center
    drawLanternIcon(ctx, CENTER_X, panelY + 30, 16, true);

    // Grand embossed title typography
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 58px Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillText('LANTERN TRICK', CENTER_X + 3, panelY + 82 + 3);

    const titleGrad = ctx.createLinearGradient(CENTER_X, panelY + 48, CENTER_X, panelY + 110);
    titleGrad.addColorStop(0, '#FFF6C8');
    titleGrad.addColorStop(0.5, '#F5CB5C');
    titleGrad.addColorStop(1, '#BA7F19');
    ctx.fillStyle = titleGrad;
    ctx.fillText('LANTERN TRICK', CENTER_X, panelY + 82);

    ctx.fillStyle = '#E5D5B2';
    ctx.font = '800 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('TACTICAL CANDLELIT PARLOR TRICK-COMBO DUEL', CENTER_X, panelY + 120);
    ctx.restore();

    // 3-Rival Gauntlet Selector Cards inside Title Crest
    const cardW = 226;
    const cardH = 80;
    const gap = 18;
    const rowStartX = CENTER_X - (cardW * 3 + gap * 2) / 2;
    const rowY = panelY + 144;

    for (let i = 0; i < RIVALS.length; i += 1) {
      const rival = RIVALS[i];
      const rx = rowStartX + i * (cardW + gap);
      const selected = engine.rivalIndex === i;
      const btnId = `rival-${i}`;
      const hovered = uiState.hoveredButtonId === btnId;
      this.registerButton(btnId, rx, rowY, cardW, cardH, i);

      roundedRectPath(ctx, rx, rowY, cardW, cardH, 10);
      ctx.fillStyle = selected ? 'rgba(242, 198, 84, 0.2)' : hovered ? 'rgba(255, 240, 200, 0.09)' : 'rgba(12, 18, 15, 0.72)';
      ctx.fill();
      ctx.lineWidth = selected ? 2.4 : 1.3;
      ctx.strokeStyle = selected ? '#FFE06E' : hovered ? '#E2BD64' : 'rgba(227, 188, 100, 0.35)';
      ctx.stroke();

      drawSuitEmblem(ctx, rival.favSuit, rx + 26, rowY + 30, 14);

      ctx.fillStyle = selected ? '#FFF8DF' : '#E7D8B6';
      ctx.font = '900 15px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${rival.name} · ${rival.maxHp} HP`, rx + 48, rowY + 22);

      ctx.fillStyle = rival.accent;
      ctx.font = '800 10.5px system-ui, sans-serif';
      ctx.fillText(`${rival.difficulty.toUpperCase()} · ${rival.badge}`, rx + 48, rowY + 40);

      ctx.fillStyle = '#BBA98A';
      ctx.font = '600 10.5px system-ui, sans-serif';
      ctx.fillText(rival.title, rx + 48, rowY + 60);
    }

    // Primary PLAY MATCH CTA + HOW TO PLAY button
    this.drawButton(ctx, 'btn-start', CENTER_X - 186, panelY + 244, 234, 50, 'PLAY MATCH  ▸', { primary: true, fontSize: 18, radius: 12 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-rules-title', CENTER_X + 64, panelY + 244, 130, 50, 'RULES  [?]', { fontSize: 14, radius: 12 }, null, uiState.hoveredButtonId);

    // Warm golden candle spotlight softly illuminating the 4 hero cards below
    ctx.save();
    const heroGlow = ctx.createRadialGradient(CENTER_X, 504, 20, CENTER_X, 504, 340);
    heroGlow.addColorStop(0, 'rgba(255, 215, 115, 0.24)');
    heroGlow.addColorStop(1, 'rgba(255, 190, 80, 0)');
    ctx.fillStyle = heroGlow;
    ctx.beginPath();
    ctx.ellipse(CENTER_X, 504, 380, 128, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Lower-Center HEROIC 4-SUIT SHOWCASE FAN (All 4 color+shape suits HUGE & crystal clear!)
    const fanStride = 166;
    const fanStartX = CENTER_X - (fanStride * 3) / 2;
    for (let i = 0; i < SHOWCASE_CARDS.length; i += 1) {
      const card = SHOWCASE_CARDS[i];
      const norm = (i / 3) * 2 - 1;
      const bob = Math.sin(anim.time * 2.1 + i * 1.1) * 3;
      const cx = fanStartX + i * fanStride;
      const cy = 496 + norm * norm * 14 + bob;
      drawCard(ctx, card, cx, cy, 134, 192, {
        rot: norm * 0.075,
        scale: 1,
        flip: 1,
        selected: i === 3,
      });
    }

    // Bottom crisp rules pill along lower edge (generous gap below showcase cards!)
    roundedRectPath(ctx, CENTER_X - 385, 646, 770, 34, 17);
    ctx.fillStyle = 'rgba(15, 11, 8, 0.9)';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.52)';
    ctx.stroke();

    ctx.fillStyle = '#F2DEA8';
    ctx.font = '800 12.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4 SUITS:  EMBER > BRAMBLE > TIDE > EMBER  ·  BRASS WARDS  ·  COMBOS: PAIR · HARMONY · CHAIN · PRISM', CENTER_X, 663.5);
  }

  drawVictoryBanner(ctx, engine, uiState) {
    const bw = 724;
    const bh = 318;
    const bx = CENTER_X - bw / 2;
    const by = 48;

    this.drawPanelBox(ctx, bx, by, bw, bh, '#FFE06E', 'rgba(34, 24, 11, 0.93)', 'rgba(16, 30, 22, 0.94)');

    // Gold top lantern crown
    drawLanternIcon(ctx, CENTER_X, by + 30, 15, true);

    // Big embossed VICTORY! header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 58px Georgia, serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillText('VICTORY!', CENTER_X + 3, by + 84 + 3);

    const vg = ctx.createLinearGradient(CENTER_X, by + 50, CENTER_X, by + 114);
    vg.addColorStop(0, '#FFF9D6');
    vg.addColorStop(0.5, '#FFD95A');
    vg.addColorStop(1, '#C78615');
    ctx.fillStyle = vg;
    ctx.fillText('VICTORY!', CENTER_X, by + 84);

    ctx.fillStyle = '#F0DFB6';
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.fillText(`${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} DEFEATED · ROUND ${engine.round}`, CENTER_X, by + 124);
    ctx.restore();

    // 3 High-Contrast Summary Stat Boxes
    const stats = [
      { label: 'YOUR LIFE', value: `${engine.playerHp} / ${engine.playerMaxHp}`, accent: '#6BF09E' },
      { label: 'GLORY SCORE', value: String(engine.playerScore), accent: '#FFE06E' },
      { label: 'COMBOS · TRUMPS', value: `${engine.matchStats.combosLanded} · ${engine.matchStats.trumpsLanded}`, accent: '#66C2FF' },
    ];
    const sw = 204;
    const sh = 66;
    const sGap = 18;
    const sx0 = CENTER_X - (sw * 3 + sGap * 2) / 2;
    for (let i = 0; i < stats.length; i += 1) {
      const st = stats[i];
      const sx = sx0 + i * (sw + sGap);
      roundedRectPath(ctx, sx, by + 150, sw, sh, 10);
      ctx.fillStyle = 'rgba(11, 20, 15, 0.78)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(236, 198, 108, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#C4B38F';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, sx + sw / 2, by + 170);

      ctx.fillStyle = st.accent;
      ctx.font = '900 24px Georgia, serif';
      ctx.fillText(st.value, sx + sw / 2, by + 198);
    }

    // Action buttons
    const nextRival = RIVALS[(engine.rivalIndex + 1) % RIVALS.length];
    this.drawButton(ctx, 'btn-next-rival', CENTER_X - 246, by + 240, 224, 52, `NEXT: ${nextRival.name.toUpperCase()}  ▸`, { primary: true, fontSize: 15, radius: 11 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-rematch', CENTER_X - 6, by + 240, 146, 52, 'REMATCH [R]', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-title', CENTER_X + 154, by + 240, 96, 52, 'TITLE', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
  }

  drawDefeatBanner(ctx, engine, uiState) {
    const bw = 724;
    const bh = 318;
    const bx = CENTER_X - bw / 2;
    const by = 48;

    this.drawPanelBox(ctx, bx, by, bw, bh, '#DC5B54', 'rgba(24, 21, 31, 0.94)', 'rgba(15, 16, 25, 0.95)');

    // Snuffed lantern emblem at top
    drawLanternIcon(ctx, CENTER_X, by + 30, 15, false);

    // Big bold DEFEAT header (cool slate-silver & crimson)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 56px Georgia, serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillText('DEFEAT', CENTER_X + 3, by + 84 + 3);

    const dg = ctx.createLinearGradient(CENTER_X, by + 50, CENTER_X, by + 114);
    dg.addColorStop(0, '#F5E8E8');
    dg.addColorStop(0.55, '#E8958E');
    dg.addColorStop(1, '#B8433E');
    ctx.fillStyle = dg;
    ctx.fillText('DEFEAT', CENTER_X, by + 84);

    ctx.fillStyle = '#D1C7D6';
    ctx.font = '800 14px system-ui, sans-serif';
    ctx.fillText(`OUTPLAYED BY ${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} · ROUND ${engine.round}`, CENTER_X, by + 124);
    ctx.restore();

    // 3 Fair Breakdown Stat Boxes
    const c = engine.lastClash;
    const stats = [
      { label: 'YOUR LIFE', value: `${engine.playerHp} / ${engine.playerMaxHp}`, accent: '#FF7066' },
      { label: `${engine.rival.name.toUpperCase()} LIFE`, value: `${engine.oppHp} / ${engine.oppMaxHp}`, accent: '#F2CA6B' },
      { label: 'COUNTERED BY', value: c ? c.oppTrick.comboShort : 'OUTLASTED', accent: '#E8A49E' },
    ];
    const sw = 204;
    const sh = 66;
    const sGap = 18;
    const sx0 = CENTER_X - (sw * 3 + sGap * 2) / 2;
    for (let i = 0; i < stats.length; i += 1) {
      const st = stats[i];
      const sx = sx0 + i * (sw + sGap);
      roundedRectPath(ctx, sx, by + 150, sw, sh, 10);
      ctx.fillStyle = 'rgba(13, 14, 23, 0.84)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(214, 104, 98, 0.45)';
      ctx.stroke();

      ctx.fillStyle = '#A8A3B8';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, sx + sw / 2, by + 170);

      ctx.fillStyle = st.accent;
      ctx.font = '900 22px Georgia, serif';
      ctx.fillText(st.value, sx + sw / 2, by + 198);
    }

    // Action buttons
    this.drawButton(ctx, 'btn-rematch', CENTER_X - 210, by + 240, 210, 52, 'REMATCH  [R]', { crimson: true, fontSize: 16, radius: 11 }, null, uiState.hoveredButtonId);
    this.drawButton(ctx, 'btn-title', CENTER_X + 18, by + 240, 192, 52, 'CHANGE RIVAL', { fontSize: 14, radius: 11 }, null, uiState.hoveredButtonId);
  }

  drawRulesModal(ctx, uiState) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 10, 0.72)';
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    const mw = 760;
    const mh = 510;
    const mx = (STAGE_W - mw) / 2;
    const my = (STAGE_H - mh) / 2;
    this.drawPanelBox(ctx, mx, my, mw, mh, '#F0C860', 'rgba(26, 18, 12, 0.97)', 'rgba(13, 24, 19, 0.98)');

    ctx.fillStyle = '#FFE07A';
    ctx.font = '900 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HOW TO PLAY LANTERN TRICK', STAGE_W / 2, my + 42);

    const lines = [
      '1. READ THE RIVAL TELL — Each round your rival places 1 card face-up plus any hidden backup with a visible Tell.',
      '2. COMBINE 1 TO 3 CARDS — Spend Lanterns (1–3 cost per card) to build higher-scoring combos:',
      '   • PAIR RESONANCE (same rank): +5 PWR & pierces 2 Ward    • SUIT HARMONY (2–3 same suit): +4 / +8 PWR',
      '   • CHAIN RUN (consecutive ranks e.g. 4-5-6): +4 / +9 PWR   • PRISM TRIAD (3 suits): +6 PWR, ignores Trump',
      '3. ELEMENTAL TRUMPS (+3 PWR & COUNTER-BREAK):',
      '   • Ember (Red Diamond) > Bramble (Green Leaf) > Tide (Blue Crescent) > Ember',
      '   • Brass (Gold Sun Gear) is Neutral and grants +2 Ward & +1 Next-Turn Lantern in any 2–3 card combo!',
      '4. BRACE & CYCLE — Out of Lanterns or bad hand? Cycle discards 1–2 cards, shields you, and grants +2 Lanterns next turn.',
      '5. CONTROLS — Click cards (or keys 1–5), drag to table or press Space/Enter to play, C to cycle, M to mute, R to rematch.',
    ];

    ctx.textAlign = 'left';
    ctx.font = '600 14px system-ui, -apple-system, sans-serif';
    for (let i = 0; i < lines.length; i += 1) {
      const isHeading = lines[i].startsWith('1.') || lines[i].startsWith('2.') || lines[i].startsWith('3.') || lines[i].startsWith('4.') || lines[i].startsWith('5.');
      ctx.fillStyle = isHeading ? '#FFE7A3' : '#DCD0B6';
      ctx.font = isHeading ? '800 14px system-ui, sans-serif' : '600 13.5px system-ui, sans-serif';
      ctx.fillText(lines[i], mx + 36, my + 96 + i * 38);
    }

    this.drawButton(ctx, 'btn-close-rules', STAGE_W / 2 - 90, my + mh - 66, 180, 44, 'GOT IT  [ESC]', { primary: true, fontSize: 15 }, null, uiState.hoveredButtonId);
    ctx.restore();
  }
}
