// Candlelit walnut-and-velvet parlor table renderer: woven baize, candles, kinetic snap arcs, zero-clip hands.
import { SUITS, doesSuitTrump } from './cards.js';
import { PHASES } from './rules.js';
import { drawCard, drawSuitEmblem, roundedRectPath } from './card-art.js';
import { drawParlorCandle } from './portraits.js';

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const CENTER_X = 630;
export const CLASH_Y = 294;
export const HAND_CARD_W = 116;
export const HAND_CARD_H = 166;
export const OPP_CARD_W = 82;
export const OPP_CARD_H = 118;
const UI_FONT = 'system-ui, -apple-system, sans-serif';

function clashDims(count) {
  return count >= 3 ? { w: 92, h: 132, stride: 98 } : { w: 104, h: 150, stride: 114 };
}

function drawText(ctx, text, x, y, font, color, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawBox(ctx, x, y, w, h, r, fill, stroke, lw = 1.4) {
  roundedRectPath(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function computePlayerHandSlots(count) {
  const slots = [];
  if (count <= 0) return slots;
  const compact = count >= 6;
  const w = compact ? 104 : HAND_CARD_W;
  const h = compact ? 148 : HAND_CARD_H;
  const stride = compact ? 114 : 134;
  const startX = CENTER_X - ((count - 1) * stride) / 2;
  for (let i = 0; i < count; i += 1) {
    const norm = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    slots.push({ index: i, x: startX + i * stride, y: 588 + norm * norm * 9, rot: norm * 0.05, w, h });
  }
  return slots;
}

export function computeOppHandSlots(count) {
  const slots = [];
  if (count <= 0) return slots;
  const stride = 74;
  const startX = CENTER_X - ((count - 1) * stride) / 2;
  for (let i = 0; i < count; i += 1) {
    const norm = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    slots.push({ x: startX + i * stride, y: 88 - norm * norm * 9, rot: -norm * 0.065 });
  }
  return slots;
}

export class TableRenderer {
  constructor() {
    this.backdropCanvas = null;
    this.buildBackdropCache();
  }

  buildBackdropCache() {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = STAGE_W;
    canvas.height = STAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Carved mahogany-walnut outer parlor table frame + organic woodgrain
    const walnut = ctx.createLinearGradient(0, 0, STAGE_W, STAGE_H);
    walnut.addColorStop(0, '#442615'); walnut.addColorStop(0.35, '#2A160B');
    walnut.addColorStop(0.7, '#391F11'); walnut.addColorStop(1, '#1C0E06');
    ctx.fillStyle = walnut;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    ctx.strokeStyle = 'rgba(255,206,142,0.055)';
    ctx.lineWidth = 1.4;
    for (let y = 3; y < STAGE_H; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= STAGE_W; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.011 + y * 0.16) * 2.2);
      ctx.stroke();
    }

    // Beveled burnished-brass rail molding + emerald-teal velvet baize cloth
    const m = 22;
    const brass = ctx.createLinearGradient(0, 0, STAGE_W, STAGE_H);
    brass.addColorStop(0, '#F0CC73'); brass.addColorStop(0.25, '#996D20');
    brass.addColorStop(0.5, '#F6DA89'); brass.addColorStop(0.75, '#865B18'); brass.addColorStop(1, '#DFB454');
    drawBox(ctx, m - 4, m - 4, STAGE_W - (m - 4) * 2, STAGE_H - (m - 4) * 2, 20, brass, null);

    const baize = ctx.createRadialGradient(CENTER_X, 335, 40, CENTER_X, 360, 690);
    baize.addColorStop(0, '#22634E'); baize.addColorStop(0.42, '#154637');
    baize.addColorStop(0.78, '#0D2D24'); baize.addColorStop(1, '#071B15');
    drawBox(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16, baize, null);

    ctx.save();
    roundedRectPath(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16);
    ctx.clip();

    // Fine woven velvet crosshatch + deterministic micro-felt specks
    ctx.strokeStyle = 'rgba(255,240,196,0.025)';
    ctx.lineWidth = 1;
    for (let i = -STAGE_H; i < STAGE_W + STAGE_H; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i + STAGE_H, STAGE_H);
      ctx.moveTo(i, STAGE_H); ctx.lineTo(i + STAGE_H, 0);
      ctx.stroke();
    }
    let rng = 90210;
    ctx.fillStyle = 'rgba(255,242,205,0.032)';
    for (let i = 0; i < 950; i += 1) {
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      const fx = m + (rng % (STAGE_W - m * 2));
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      ctx.fillRect(fx, m + (rng % (STAGE_H - m * 2)), 1.5, 1.5);
    }

    drawBox(ctx, m + 10, m + 10, STAGE_W - (m + 10) * 2, STAGE_H - (m + 10) * 2, 12, null, 'rgba(232,192,102,0.28)', 1.3);

    // Central Inlaid Brass Astrolabe Clash Arena
    ctx.save();
    ctx.translate(CENTER_X, CLASH_Y);
    ctx.beginPath();
    ctx.ellipse(0, 0, 354, 128, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,28,22,0.38)';
    ctx.fill();
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = 'rgba(232,192,102,0.36)';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 342, 118, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = 'rgba(232,192,102,0.22)';
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(0, 0, 66, 0, Math.PI * 2);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(238,200,112,0.34)';
    ctx.stroke();
    for (let i = 0; i < 16; i += 1) {
      const a = (i * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
      ctx.lineTo(Math.cos(a) * (i % 2 === 0 ? 78 : 64), Math.sin(a) * (i % 2 === 0 ? 78 : 64));
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(240,202,112,0.3)' : 'rgba(240,202,112,0.16)';
      ctx.lineWidth = i % 2 === 0 ? 1.6 : 1;
      ctx.stroke();
    }
    ctx.restore();

    const rimShade = ctx.createRadialGradient(CENTER_X, STAGE_H / 2, 330, CENTER_X, STAGE_H / 2, 760);
    rimShade.addColorStop(0, 'rgba(0,0,0,0)');
    rimShade.addColorStop(1, 'rgba(3,10,8,0.56)');
    ctx.fillStyle = rimShade;
    ctx.fillRect(m, m, STAGE_W - m * 2, STAGE_H - m * 2);
    ctx.restore();

    for (const [cx, cy] of [[24, 24], [STAGE_W - 24, 24], [24, STAGE_H - 24], [STAGE_W - 24, STAGE_H - 24]]) {
      ctx.beginPath(); ctx.arc(cx, cy, 10.5, 0, Math.PI * 2);
      ctx.fillStyle = '#BC8C32'; ctx.fill();
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#FAE194'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3B2214'; ctx.fill();
    }
    this.backdropCanvas = canvas;
  }

  syncCardTargets(engine, anim, uiState) {
    const active = new Set();
    const phase = engine.phase;
    const oppCount = phase === PHASES.TITLE ? 5 : engine.oppHand.length;
    const oppSlots = computeOppHandSlots(oppCount);
    for (let i = 0; i < oppCount; i += 1) {
      const uid = phase === PHASES.TITLE ? `title-opp-${i}` : engine.oppHand[i].uid;
      active.add(uid);
      anim.ensureCard(uid, 130, 120, false).setTarget(oppSlots[i].x, oppSlots[i].y, oppSlots[i].rot, 1, -1, 0);
    }

    if (phase === PHASES.SELECT || phase === PHASES.CLASH) {
      const oppCards = engine.oppCommittedCards;
      const od = clashDims(oppCards.length);
      const oppStart = 404 - ((oppCards.length - 1) * od.stride) / 2;
      for (let i = 0; i < oppCards.length; i += 1) {
        const card = oppCards[i];
        active.add(card.uid);
        anim.ensureCard(card.uid, CENTER_X, 92, false).setTarget(
          oppStart + i * od.stride + (phase === PHASES.CLASH ? 10 : 0),
          CLASH_Y,
          (i - (oppCards.length - 1) / 2) * 0.032,
          1,
          phase === PHASES.CLASH || i === 0 ? 1 : -1,
          phase === PHASES.CLASH && engine.lastClash?.winner === 'opponent' ? 1 : 0,
        );
      }

      if (phase === PHASES.CLASH) {
        const pCards = engine.playerPlayedCards;
        const pd = clashDims(pCards.length);
        const pStart = 856 - ((pCards.length - 1) * pd.stride) / 2;
        for (let i = 0; i < pCards.length; i += 1) {
          const card = pCards[i];
          active.add(card.uid);
          anim.ensureCard(card.uid, CENTER_X, 590, true).setTarget(
            pStart + i * pd.stride - 10,
            CLASH_Y,
            (i - (pCards.length - 1) / 2) * 0.032,
            1, 1,
            engine.lastClash?.winner === 'player' ? 1 : 0,
          );
        }
      }

      const selSet = new Set(engine.selectedIds);
      const slots = computePlayerHandSlots(engine.playerHand.length);
      for (let i = 0; i < engine.playerHand.length; i += 1) {
        const card = engine.playerHand[i];
        const slot = slots[i];
        active.add(card.uid);
        const sc = anim.ensureCard(card.uid, 128, 336, false);
        const isSel = selSet.has(card.uid);
        const isHov = uiState.hoveredUid === card.uid && phase === PHASES.SELECT;
        if (uiState.draggingUid === card.uid && phase === PHASES.SELECT) {
          sc.setTarget(uiState.dragX, uiState.dragY, 0, 1.06, 1, 1);
        } else {
          const lift = isSel ? -21 : isHov ? -14 : 0;
          sc.setTarget(slot.x, slot.y + lift, isSel ? slot.rot * 0.35 : slot.rot, isSel ? 1.035 : isHov ? 1.025 : 1, 1, isSel ? 1 : 0);
        }
      }
    }
    anim.pruneCards(active);
  }

  render(ctx, engine, anim, uiState) {
    const isDefeat = engine.phase === PHASES.DEFEAT;
    const isVictory = engine.phase === PHASES.VICTORY;
    ctx.save();
    if (anim.shake > 0.2) ctx.translate(Math.sin(anim.time * 58) * anim.shake, Math.cos(anim.time * 49) * anim.shake * 0.7);
    if (this.backdropCanvas) ctx.drawImage(this.backdropCanvas, 0, 0);
    this.drawCandleLighting(ctx, anim.time, isVictory, isDefeat);
    this.drawAmbientMotes(ctx, anim, isVictory, isDefeat);

    if (engine.phase === PHASES.TITLE) {
      drawParlorCandle(ctx, 126, 152, 1.12, anim.time, false, true);
      drawParlorCandle(ctx, 1154, 152, 1.12, anim.time + 1.3, false, true);
    } else if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
      drawParlorCandle(ctx, 294, 96, 0.9, anim.time, false, true);
      drawParlorCandle(ctx, 966, 96, 0.9, anim.time + 1.4, false, true);
    }

    if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
      this.drawOpponentHand(ctx, engine, anim);
      this.drawClashArena(ctx, engine, anim);
      this.drawKineticTrails(ctx, engine, anim);
      this.drawPlayerHand(ctx, engine, anim, uiState);
      this.drawParticles(ctx, anim);
    } else if (isVictory) {
      this.drawParticles(ctx, anim);
      this.drawVictoryTableShowcase(ctx, engine, anim);
    } else if (isDefeat) {
      this.drawParticles(ctx, anim);
      this.drawDefeatTableShowcase(ctx, engine);
    } else {
      this.drawParticles(ctx, anim);
    }

    this.drawCallouts(ctx, anim);
    if (anim.flash > 0.01) {
      ctx.globalAlpha = anim.flash * 0.24;
      ctx.fillStyle = anim.flashColor;
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
    }
    ctx.restore();
  }

  drawCandleLighting(ctx, time, isVictory, isDefeat) {
    const flick = 0.95 + Math.sin(time * 5.2) * 0.03 + Math.sin(time * 11.7) * 0.02;
    ctx.save();
    if (isDefeat) {
      ctx.fillStyle = 'rgba(9,14,28,0.58)';
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
      const spot = ctx.createRadialGradient(CENTER_X, 520, 40, CENTER_X, 520, 430);
      spot.addColorStop(0, 'rgba(195,58,66,0.22)'); spot.addColorStop(0.6, 'rgba(30,44,74,0.14)'); spot.addColorStop(1, 'rgba(6,10,22,0)');
      ctx.fillStyle = spot;
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
      ctx.restore();
      return;
    }

    const pools = [[130, 120, 320 * flick], [1150, 120, 320 * flick], [CENTER_X, isVictory ? 470 : 320, (isVictory ? 540 : 390) * flick]];
    for (let i = 0; i < pools.length; i += 1) {
      const [lx, ly, lr] = pools[i];
      const g = ctx.createRadialGradient(lx, ly, 12, lx, ly, lr);
      if (isVictory && i === 2) { g.addColorStop(0, 'rgba(255,224,108,0.38)'); g.addColorStop(0.5, 'rgba(255,178,56,0.16)'); g.addColorStop(1, 'rgba(255,150,30,0)'); }
      else { g.addColorStop(0, 'rgba(255,206,114,0.17)'); g.addColorStop(0.55, 'rgba(255,166,62,0.06)'); g.addColorStop(1, 'rgba(255,150,30,0)'); }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
    }

    if (isVictory) {
      ctx.translate(CENTER_X, 520);
      ctx.rotate(time * 0.08);
      for (let i = 0; i < 16; i += 1) {
        const a0 = (i / 16) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 540, a0, a0 + Math.PI / 36); ctx.closePath();
        const rg = ctx.createRadialGradient(0, 0, 20, 0, 0, 540);
        rg.addColorStop(0, 'rgba(255,228,128,0.24)'); rg.addColorStop(0.55, 'rgba(255,194,72,0.09)'); rg.addColorStop(1, 'rgba(255,194,72,0)');
        ctx.fillStyle = rg;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawAmbientMotes(ctx, anim, isVictory, isDefeat) {
    ctx.save();
    for (const m of anim.motes) {
      ctx.globalAlpha = m.alpha * (0.65 + 0.35 * Math.sin(anim.time * 2.4 + m.phase)) * (isVictory ? 1.7 : 1);
      ctx.fillStyle = isDefeat ? '#8FA5C4' : isVictory ? '#FFE382' : '#FBD07A';
      ctx.beginPath(); ctx.arc(m.x, m.y, isVictory ? m.r * 1.25 : m.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawOpponentHand(ctx, engine, anim) {
    const isTitle = engine.phase === PHASES.TITLE;
    const count = isTitle ? 5 : engine.oppHand.length;
    for (let i = 0; i < count; i += 1) {
      const sc = anim.cards.get(isTitle ? `title-opp-${i}` : engine.oppHand[i].uid);
      if (!sc) continue;
      ctx.save();
      if (isTitle) ctx.globalAlpha = 0.5;
      drawCard(ctx, null, sc.x, sc.y, OPP_CARD_W, OPP_CARD_H, { rot: sc.rot, scale: sc.scale, flip: -1 });
      ctx.restore();
    }
  }

  drawKineticTrails(ctx, engine, anim) {
    if (engine.phase !== PHASES.SELECT || engine.selectedIds.length === 0) return;
    const trick = engine.getSelectedTrick();
    const suit = SUITS[trick.leadSuit] ?? SUITS.brass;
    const selSet = new Set(engine.selectedIds);
    const pts = [];
    for (const c of engine.playerHand) {
      if (selSet.has(c.uid)) {
        const sc = anim.cards.get(c.uid);
        if (sc) pts.push({ x: sc.x, y: sc.y - 72 });
      }
    }
    if (pts.length === 0) return;

    ctx.save();
    const anchor = pts[pts.length - 1];
    const ctrlX = Math.max(anchor.x + 80, 740);
    const ctrlY = 398;
    const grad = ctx.createLinearGradient(anchor.x, anchor.y, 856, 370);
    grad.addColorStop(0, 'rgba(255,224,110,0.78)');
    grad.addColorStop(0.55, suit.bright);
    grad.addColorStop(1, 'rgba(255,232,132,0.22)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.8;
    ctx.setLineDash([7, 6]);
    ctx.lineDashOffset = -anim.time * 42;
    ctx.beginPath(); ctx.moveTo(anchor.x, anchor.y); ctx.quadraticCurveTo(ctrlX, ctrlY, 856, 372); ctx.stroke();
    ctx.setLineDash([]);

    const t = (anim.time * 0.75) % 1;
    const cx = (1 - t) * (1 - t) * anchor.x + 2 * (1 - t) * t * ctrlX + t * t * 856;
    const cy = (1 - t) * (1 - t) * anchor.y + 2 * (1 - t) * t * ctrlY + t * t * 372;
    ctx.shadowColor = '#FFE485'; ctx.shadowBlur = 12; ctx.fillStyle = '#FFF9D6';
    ctx.beginPath(); ctx.arc(cx, cy, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  drawClashArena(ctx, engine, anim) {
    const tele = engine.oppTelegraph;
    const isClash = engine.phase === PHASES.CLASH;
    const selTrick = engine.getSelectedTrick();
    const oppSuit = tele?.leadSuit ?? 'brass';
    const oppInfo = SUITS[oppSuit];

    drawBox(ctx, 270, 170, 268, 34, 10, 'rgba(20,12,10,0.88)', oppInfo.bright, 1.8);
    drawSuitEmblem(ctx, oppSuit, 290, 187, 10);
    drawText(ctx, isClash ? `${engine.rival.name.toUpperCase()} · ${engine.lastClash.oppTrick.comboShort}` : `INTENT · ${tele.intentBadge} (${tele.powerText})`, 306, 187.5, `800 12.5px ${UI_FONT}`, '#FFF5DF', 'left');

    const oppCards = engine.oppCommittedCards;
    const od = clashDims(oppCards.length);
    for (let i = 0; i < oppCards.length; i += 1) {
      const card = oppCards[i];
      const sc = anim.cards.get(card.uid);
      if (!sc) continue;
      const showTell = !isClash && i > 0;
      drawCard(ctx, card, sc.x, sc.y, od.w, od.h, {
        rot: sc.rot, scale: sc.scale, flip: sc.flip,
        winnerGlow: isClash && engine.lastClash?.winner === 'opponent',
        tellOptions: showTell ? { color: oppInfo.color, label: tele.trick.comboId === 'pair' ? 'PAIR TELL' : tele.trick.comboId === 'harmony' ? 'HARMONY' : 'HIDDEN', time: anim.time } : null,
      });
    }

    if (tele) {
      drawBox(ctx, 270, 384, 268, 28, 8, isClash ? 'rgba(24,15,11,0.88)' : 'rgba(32,16,16,0.86)', isClash ? '#E0B962' : oppInfo.color, 1.25);
      const tStr = isClash
        ? `RIVAL POWER: ${engine.lastClash.oppPower}${engine.lastClash.oppRelicTriggered ? ` (${engine.rival.relicName})` : ''}`
        : `TELL: ${tele.tellTag}${tele.relic?.triggered ? ' · RELIC!' : ''}`;
      drawText(ctx, tStr, 404, 398.5, `700 11.5px ${UI_FONT}`, '#FFECC2');
    }

    const pSuit = isClash ? engine.lastClash.playerTrick.leadSuit : selTrick.leadSuit;
    const pInfo = pSuit ? SUITS[pSuit] : null;
    drawBox(ctx, 722, 170, 268, 34, 10, 'rgba(14,24,20,0.88)', pInfo ? pInfo.bright : 'rgba(227,188,100,0.55)', 1.8);
    if (pSuit) drawSuitEmblem(ctx, pSuit, 742, 187, 10);
    drawText(ctx, isClash ? `YOUR TRICK · ${engine.lastClash.playerTrick.comboShort}` : selTrick.cards.length > 0 ? `STAGED · ${selTrick.comboName}` : 'SELECT 1–3 CARDS BELOW', pSuit ? 758 : 856, 187.5, `800 12.5px ${UI_FONT}`, '#FFF7E2', pSuit ? 'left' : 'center');

    if (isClash) {
      const pd = clashDims(engine.playerPlayedCards.length);
      for (const card of engine.playerPlayedCards) {
        const sc = anim.cards.get(card.uid);
        if (sc) drawCard(ctx, card, sc.x, sc.y, pd.w, pd.h, { rot: sc.rot, scale: sc.scale, flip: sc.flip, winnerGlow: engine.lastClash?.winner === 'player' });
      }
      drawBox(ctx, 722, 384, 268, 28, 8, 'rgba(15,29,23,0.9)', '#FFD459', 1.3);
      drawText(ctx, `YOUR POWER: ${engine.lastClash.playerPower}`, 856, 398.5, `800 12px ${UI_FONT}`, '#FFE999');
    } else if (selTrick.cards.length > 0) {
      const pTrumps = doesSuitTrump(selTrick.leadSuit, oppSuit);
      const oTrumps = !selTrick.ignoreEnemyTrump && doesSuitTrump(oppSuit, selTrick.leadSuit);
      const projPower = Math.max(1, selTrick.totalPower + (pTrumps ? 3 : 0));

      const pg = ctx.createLinearGradient(738, 218, 974, 370);
      pg.addColorStop(0, 'rgba(20,49,39,0.92)'); pg.addColorStop(1, 'rgba(10,27,21,0.94)');
      drawBox(ctx, 738, 218, 236, 152, 14, pg, pTrumps ? '#FFE066' : pInfo.bright, 2.2);
      if (pSuit) drawSuitEmblem(ctx, pSuit, 788, 266, 26);
      drawText(ctx, String(projPower), 826, 263, '900 44px Georgia, serif', '#FFF4CC', 'left');
      drawText(ctx, 'PROJECTED PWR', 828, 291, `700 11px ${UI_FONT}`, '#D7C49E', 'left');

      const parts = [];
      if (selTrick.comboBonus > 0) parts.push(`COMBO +${selTrick.comboBonus}`);
      if (pTrumps) parts.push('TRUMP +3');
      if (oTrumps) parts.push('TRUMPED');
      if (selTrick.ward > 0) parts.push(`WARD +${selTrick.ward}`);
      if (selTrick.heal > 0) parts.push(`MEND +${selTrick.heal}`);
      if (selTrick.burn > 0) parts.push(`BURN +${selTrick.burn}`);
      if (selTrick.chill > 0) parts.push(`CHILL -${selTrick.chill}`);
      if (selTrick.nextLantern > 0) parts.push(`+${selTrick.nextLantern} LANTERN`);

      drawText(ctx, parts.slice(0, 3).join('  ·  ') || 'READY TO PLAY', 856, 326, `800 11.5px ${UI_FONT}`, pTrumps ? '#FFE066' : '#E7D8B6');
      drawText(ctx, `COST: ${selTrick.totalCost} / ${engine.playerLanterns} LANTERNS`, 856, 350, `800 12px ${UI_FONT}`, '#F5CF6B');

      drawBox(ctx, 722, 384, 268, 28, 8, pTrumps ? 'rgba(130,88,12,0.9)' : 'rgba(18,36,29,0.88)', pTrumps ? '#FFE066' : '#D9B15A', 1.4);
      drawText(ctx, pTrumps ? `★ ${pInfo.name.toUpperCase()} TRUMPS ${oppInfo.name.toUpperCase()} (+3 PWR)!` : `${selTrick.cards.length} CARD${selTrick.cards.length > 1 ? 'S' : ''} READY · CLICK PLAY`, 856, 398.5, `800 11.5px ${UI_FONT}`, '#FFF8DE');
    } else {
      ctx.save();
      ctx.setLineDash([7, 5]);
      drawBox(ctx, 742, 220, 228, 148, 14, 'rgba(11,29,23,0.45)', 'rgba(232,193,106,0.48)', 1.8);
      ctx.restore();
      drawText(ctx, 'CLICK OR DRAG CARDS', 856, 282, `800 14px ${UI_FONT}`, 'rgba(244,224,174,0.82)');
      drawText(ctx, 'Combine Pair · Harmony · Chain', 856, 308, `600 12px ${UI_FONT}`, 'rgba(218,198,152,0.68)');
    }

    this.drawCenterVsMedallion(ctx, engine, selTrick, tele, isClash);
  }

  drawCenterVsMedallion(ctx, engine, selTrick, tele, isClash) {
    ctx.save();
    ctx.beginPath(); ctx.arc(CENTER_X, CLASH_Y, 48, 0, Math.PI * 2);
    const mg = ctx.createRadialGradient(CENTER_X, CLASH_Y - 12, 6, CENTER_X, CLASH_Y, 48);
    mg.addColorStop(0, '#442D18'); mg.addColorStop(1, '#1A1109');
    ctx.fillStyle = mg; ctx.fill();
    let ring = '#E4BE64';
    if (isClash) ring = engine.lastClash.winner === 'player' ? '#FFE066' : engine.lastClash.winner === 'opponent' ? '#FF5E52' : '#9CC7E8';
    else if (selTrick.leadSuit && tele && doesSuitTrump(selTrick.leadSuit, tele.leadSuit)) ring = '#FFE066';
    ctx.lineWidth = 3; ctx.strokeStyle = ring; ctx.stroke();

    if (isClash) {
      const c = engine.lastClash;
      drawText(ctx, `${c.oppPower} : ${c.playerPower}`, CENTER_X, CLASH_Y - 8, '900 22px Georgia, serif', '#FFF5D6');
      drawText(ctx, c.winner === 'player' ? `WIN -${c.damageToOpp}` : c.winner === 'opponent' ? `HIT -${c.damageToPlayer}` : 'TIE -2', CENTER_X, CLASH_Y + 16, `800 11px ${UI_FONT}`, c.winner === 'player' ? '#6BF09E' : c.winner === 'opponent' ? '#FF7568' : '#BCE0FF');
    } else if (selTrick.cards.length > 0 && tele) {
      const trumps = doesSuitTrump(selTrick.leadSuit, tele.leadSuit);
      drawText(ctx, trumps ? 'TRUMP!' : 'VS', CENTER_X, CLASH_Y - 7, '900 20px Georgia, serif', trumps ? '#FFE066' : '#F6DC94');
      drawText(ctx, trumps ? '+3 POWER' : `${tele.powerText} vs ${selTrick.totalPower}`, CENTER_X, CLASH_Y + 15, `800 11px ${UI_FONT}`, '#D9C7A3');
    } else {
      drawText(ctx, 'VS', CENTER_X, CLASH_Y - 4, '900 24px Georgia, serif', '#F2CF78');
      drawText(ctx, `RND ${engine.round}`, CENTER_X, CLASH_Y + 18, `700 10px ${UI_FONT}`, '#BCA984');
    }
    ctx.restore();
  }

  drawPlayerHand(ctx, engine, anim, uiState) {
    const selSet = new Set(engine.selectedIds);
    const remLanterns = engine.playerLanterns - engine.getSelectedTrick().totalCost;

    if (engine.phase === PHASES.SELECT && engine.selectedIds.length >= 2) {
      const pts = [];
      for (const card of engine.playerHand) {
        if (selSet.has(card.uid)) {
          const sc = anim.cards.get(card.uid);
          if (sc) pts.push({ x: sc.x, y: sc.y - 68 });
        }
      }
      if (pts.length >= 2) {
        ctx.save();
        ctx.strokeStyle = '#FFE066'; ctx.shadowColor = '#FFD459'; ctx.shadowBlur = 14; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i += 1) ctx.quadraticCurveTo((pts[i - 1].x + pts[i].x) / 2, Math.min(pts[i - 1].y, pts[i].y) - 22, pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.fillStyle = '#FFF7D1';
        for (const pt of pts) { ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.8, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    }

    const order = engine.playerHand.map((card, index) => ({ card, index }));
    order.sort((a, b) => {
      const z = (u) => (u === uiState.draggingUid ? 3 : u === uiState.hoveredUid ? 2 : selSet.has(u) ? 1 : 0);
      return z(a.card.uid) - z(b.card.uid) || a.index - b.index;
    });

    const compact = engine.playerHand.length >= 6;
    const cw = compact ? 104 : HAND_CARD_W;
    const ch = compact ? 148 : HAND_CARD_H;
    for (const { card, index } of order) {
      const sc = anim.cards.get(card.uid);
      if (!sc) continue;
      const isSel = selSet.has(card.uid);
      const isHov = uiState.hoveredUid === card.uid && engine.phase === PHASES.SELECT;
      const cantAfford = engine.phase === PHASES.SELECT && !isSel && (card.cost > remLanterns || engine.selectedIds.length >= 3);
      drawCard(ctx, card, sc.x, sc.y, cw, ch, { rot: sc.rot, scale: sc.scale, flip: sc.flip, selected: isSel, hovered: isHov, dimmed: cantAfford });

      if (engine.phase === PHASES.SELECT && card.uid !== uiState.draggingUid) {
        const ky = Math.min(683, sc.y + ch / 2 + 9);
        drawBox(ctx, sc.x - 12, ky - 8.5, 24, 17, 5, isSel ? '#FFD459' : 'rgba(20,14,10,0.84)', isSel ? '#FFF4C2' : 'rgba(227,188,100,0.55)', 1);
        drawText(ctx, String(index + 1), sc.x, ky + 0.5, `800 11px ${UI_FONT}`, isSel ? '#1E1308' : '#E7D1A1');
      }
    }
  }

  drawVictoryTableShowcase(ctx, engine, anim) {
    const cards = engine.playerPlayedCards.length > 0 ? engine.playerPlayedCards : engine.playerHand.slice(0, 3);
    const rg = ctx.createLinearGradient(CENTER_X - 245, 406, CENTER_X + 245, 406);
    rg.addColorStop(0, 'rgba(104,68,12,0.92)'); rg.addColorStop(0.5, 'rgba(182,126,24,0.96)'); rg.addColorStop(1, 'rgba(104,68,12,0.92)');
    drawBox(ctx, CENTER_X - 245, 390, 490, 32, 16, rg, '#FFE485', 1.8);
    drawText(ctx, engine.lastClash ? `★ WINNING FINISHER: ${engine.lastClash.playerTrick.comboName} · ${engine.lastClash.playerPower} PWR ★` : '★ WINNING HAND ★', CENTER_X, 406.5, `900 14px ${UI_FONT}`, '#FFFDF0');

    const startX = CENTER_X - ((cards.length - 1) * 152) / 2;
    for (let i = 0; i < cards.length; i += 1) {
      const norm = cards.length === 1 ? 0 : (i / (cards.length - 1)) * 2 - 1;
      drawCard(ctx, cards[i], startX + i * 152, 534 + Math.abs(norm) * 10 + Math.sin(anim.time * 2.8 + i) * 3.5, 126, 180, { rot: norm * 0.075, scale: 1, flip: 1, winnerGlow: true });
    }
    if (engine.lastClash) {
      drawBox(ctx, CENTER_X - 220, 646, 440, 28, 12, 'rgba(16,36,27,0.9)', '#E5BE62', 1.4);
      drawText(ctx, `DEALT ${engine.lastClash.damageToOpp} FINAL DMG · RIVAL ${engine.lastClash.oppPower} PWR SHATTERED`, CENTER_X, 660.5, `800 12px ${UI_FONT}`, '#FFE799');
    }
  }

  drawDefeatTableShowcase(ctx, engine) {
    const oppCards = engine.oppCommittedCards;
    const pCards = engine.playerPlayedCards;
    const c = engine.lastClash;

    drawBox(ctx, CENTER_X - 270, 390, 540, 32, 16, 'rgba(42,18,22,0.92)', '#E0605A', 1.8);
    drawText(ctx, c ? `LETHAL COUNTER: ${engine.rival.name.toUpperCase()}'S ${c.oppTrick.comboName} (${c.oppPower}) vs YOURS (${c.playerPower})` : 'DECISIVE FINAL CLASH', CENTER_X, 406.5, `900 13.5px ${UI_FONT}`, '#FFE2DD');

    const od = oppCards.length >= 3 ? { w: 94, h: 136, stride: 102 } : { w: 108, h: 156, stride: 118 };
    const oppStart = 420 - ((oppCards.length - 1) * od.stride) / 2;
    for (let i = 0; i < oppCards.length; i += 1) {
      drawCard(ctx, oppCards[i], oppStart + i * od.stride, 538, od.w, od.h, { rot: (i - (oppCards.length - 1) / 2) * 0.035, scale: 1, flip: 1, winnerGlow: true });
    }

    ctx.beginPath(); ctx.arc(CENTER_X, 538, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#2A1014'; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#FF665A'; ctx.stroke();
    drawText(ctx, c ? `-${c.damageToPlayer}` : 'KO', CENTER_X, 531, '900 20px Georgia, serif', '#FF9C94');
    drawText(ctx, 'LETHAL', CENTER_X, 552, `800 10px ${UI_FONT}`, '#E0B4B0');

    const pd = pCards.length >= 3 ? { w: 94, h: 136, stride: 102 } : pCards.length === 2 ? { w: 104, h: 150, stride: 114 } : { w: 108, h: 156, stride: 118 };
    const pStart = 840 - ((Math.max(1, pCards.length) - 1) * pd.stride) / 2;
    for (let i = 0; i < pCards.length; i += 1) {
      drawCard(ctx, pCards[i], pStart + i * pd.stride, 538, pd.w, pd.h, { rot: (i - (pCards.length - 1) / 2) * 0.035, scale: 1, flip: 1, dimmed: true });
    }

    drawBox(ctx, CENTER_X - 255, 646, 510, 28, 12, 'rgba(18,22,34,0.9)', 'rgba(184,198,222,0.45)', 1.2);
    drawText(
      ctx,
      c && c.oppTrumps
        ? `TIP: ${SUITS[c.oppTrick.leadSuit].name} trumped ${SUITS[c.playerTrick.leadSuit]?.name ?? 'your suit'} (+3) — watch the Rival Tell & Suit Tracker!`
        : `TIP: Counter ${engine.rival.name}'s ${engine.rival.relicName} with Trumps, Brass Ward, or Kindle (+4 Ward)!`,
      CENTER_X, 660.5, `700 11.5px ${UI_FONT}`, '#CFD9EB',
    );
  }

  drawParticles(ctx, anim) {
    for (const p of anim.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.65));
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.shape === 'diamond') {
        ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.72, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.72, 0); ctx.closePath();
      } else {
        ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }
  }

  drawCallouts(ctx, anim) {
    ctx.save();
    for (const c of anim.callouts) {
      ctx.globalAlpha = Math.min(1, c.life / 0.45);
      ctx.font = `900 ${c.size}px Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(14,9,6,0.9)'; ctx.strokeText(c.text, c.x, c.y);
      ctx.fillStyle = c.color; ctx.fillText(c.text, c.x, c.y);
    }
    ctx.restore();
  }
}
