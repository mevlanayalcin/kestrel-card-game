// Candlelit walnut-and-velvet parlor table renderer, fanned hands, clash arena, and particles.
import { SUITS, doesSuitTrump } from './cards.js';
import { PHASES } from './rules.js';
import { drawCard, drawSuitEmblem, drawLanternIcon, roundedRectPath } from './card-art.js';

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const CENTER_X = 630;
export const CLASH_Y = 296;
export const HAND_CARD_W = 118;
export const HAND_CARD_H = 168;
export const CLASH_CARD_W = 110;
export const CLASH_CARD_H = 158;
export const OPP_CARD_W = 84;
export const OPP_CARD_H = 120;

export function computePlayerHandSlots(count, selectedSet, hoveredUid, draggingUid) {
  const slots = [];
  if (count <= 0) return slots;
  const stride = count >= 6 ? 116 : 134;
  const totalSpan = (count - 1) * stride;
  const startX = CENTER_X - totalSpan / 2;
  const baseY = 586;

  for (let i = 0; i < count; i += 1) {
    const norm = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    const x = startX + i * stride;
    const arcY = norm * norm * 10;
    const rot = norm * 0.055;
    slots.push({
      index: i,
      x,
      y: baseY + arcY,
      rot,
      w: HAND_CARD_W,
      h: HAND_CARD_H,
      selectedSet,
      hoveredUid,
      draggingUid,
    });
  }
  return slots;
}

export function computeOppHandSlots(count) {
  const slots = [];
  if (count <= 0) return slots;
  const stride = 72;
  const totalSpan = (count - 1) * stride;
  const startX = CENTER_X - totalSpan / 2;
  const baseY = 88;
  for (let i = 0; i < count; i += 1) {
    const norm = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    slots.push({
      x: startX + i * stride,
      y: baseY - norm * norm * 10,
      rot: -norm * 0.07,
    });
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

    // 1. Carved dark walnut outer table frame
    const walnut = ctx.createLinearGradient(0, 0, STAGE_W, STAGE_H);
    walnut.addColorStop(0, '#3B2214');
    walnut.addColorStop(0.35, '#29170D');
    walnut.addColorStop(0.7, '#341D11');
    walnut.addColorStop(1, '#1E1008');
    ctx.fillStyle = walnut;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    // Subtle horizontal walnut woodgrain lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 205, 145, 0.045)';
    ctx.lineWidth = 1.5;
    for (let y = 3; y < STAGE_H; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= STAGE_W; x += 64) {
        ctx.lineTo(x, y + Math.sin(x * 0.012 + y * 0.15) * 2.2);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 2. Burnished brass molding & velvet baize inset
    const m = 22;
    roundedRectPath(ctx, m - 4, m - 4, STAGE_W - (m - 4) * 2, STAGE_H - (m - 4) * 2, 20);
    const brassFrame = ctx.createLinearGradient(0, 0, STAGE_W, STAGE_H);
    brassFrame.addColorStop(0, '#E3BC64');
    brassFrame.addColorStop(0.25, '#9A6F22');
    brassFrame.addColorStop(0.5, '#F0D07D');
    brassFrame.addColorStop(0.75, '#8A601B');
    brassFrame.addColorStop(1, '#D2A64A');
    ctx.fillStyle = brassFrame;
    ctx.fill();

    // Deep emerald-teal velvet baize cloth
    roundedRectPath(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16);
    const baize = ctx.createRadialGradient(CENTER_X, 345, 45, CENTER_X, 360, 680);
    baize.addColorStop(0, '#1F5C48');
    baize.addColorStop(0.42, '#154436');
    baize.addColorStop(0.78, '#0E2E25');
    baize.addColorStop(1, '#081D17');
    ctx.fillStyle = baize;
    ctx.fill();

    // Fine woven velvet crosshatch grain (clipped to baize)
    ctx.save();
    roundedRectPath(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16);
    ctx.clip();

    ctx.strokeStyle = 'rgba(255, 238, 195, 0.022)';
    ctx.lineWidth = 1;
    for (let i = -STAGE_H; i < STAGE_W + STAGE_H; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + STAGE_H, STAGE_H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, STAGE_H);
      ctx.lineTo(i + STAGE_H, 0);
      ctx.stroke();
    }

    // Subtle golden inlaid parlor border lines
    roundedRectPath(ctx, m + 10, m + 10, STAGE_W - (m + 10) * 2, STAGE_H - (m + 10) * 2, 12);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.24)';
    ctx.stroke();

    // Central inlaid compass ring & octagon parlor table marking
    ctx.save();
    ctx.translate(CENTER_X, CLASH_Y);

    ctx.beginPath();
    ctx.ellipse(0, 0, 340, 126, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 31, 24, 0.34)';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.32)';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 328, 116, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(227, 188, 100, 0.18)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner circular compass medallion
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(235, 198, 109, 0.28)';
    ctx.stroke();

    for (let i = 0; i < 8; i += 1) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 44, Math.sin(ang) * 44);
      ctx.lineTo(Math.cos(ang) * 72, Math.sin(ang) * 72);
      ctx.strokeStyle = 'rgba(235, 198, 109, 0.22)';
      ctx.lineWidth = i % 2 === 0 ? 1.8 : 1;
      ctx.stroke();
    }
    ctx.restore();

    // Soft inner shadow around walnut rim
    const rimShade = ctx.createRadialGradient(CENTER_X, STAGE_H / 2, 340, CENTER_X, STAGE_H / 2, 760);
    rimShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    rimShade.addColorStop(1, 'rgba(3, 10, 8, 0.54)');
    ctx.fillStyle = rimShade;
    ctx.fillRect(m, m, STAGE_W - m * 2, STAGE_H - m * 2);
    ctx.restore();

    // Corner brass clasps on walnut frame
    const corners = [
      [24, 24],
      [STAGE_W - 24, 24],
      [24, STAGE_H - 24],
      [STAGE_W - 24, STAGE_H - 24],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#B88930';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#F6DC8C';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3B2214';
      ctx.fill();
    }

    this.backdropCanvas = canvas;
  }

  syncCardTargets(engine, anim, uiState) {
    const activeUids = new Set();
    const phase = engine.phase;

    // 1. Opponent hidden hand (always shown during match, and subtly behind Title)
    const oppCount = phase === PHASES.TITLE ? 5 : engine.oppHand.length;
    const oppSlots = computeOppHandSlots(oppCount);
    for (let i = 0; i < oppCount; i += 1) {
      const uid = phase === PHASES.TITLE ? `title-opp-${i}` : engine.oppHand[i].uid;
      activeUids.add(uid);
      const sc = anim.ensureCard(uid, 130, 120, false);
      sc.setTarget(oppSlots[i].x, oppSlots[i].y, oppSlots[i].rot, 1, -1, 0);
    }

    if (phase === PHASES.SELECT || phase === PHASES.CLASH) {
      // 2. Opponent committed / telegraphed cards on left of Clash Arena
      const oppCards = engine.oppCommittedCards;
      const oppStride = oppCards.length >= 3 ? 72 : 98;
      const oppCenter = 408;
      const oppStartX = oppCenter - ((oppCards.length - 1) * oppStride) / 2;

      for (let i = 0; i < oppCards.length; i += 1) {
        const card = oppCards[i];
        activeUids.add(card.uid);
        const isRevealed = phase === PHASES.CLASH || i === 0;
        const sc = anim.ensureCard(card.uid, CENTER_X, 92, false);
        const lungeX = phase === PHASES.CLASH ? 14 : 0;
        sc.setTarget(
          oppStartX + i * oppStride + lungeX,
          CLASH_Y,
          (i - (oppCards.length - 1) / 2) * 0.055,
          1,
          isRevealed ? 1 : -1,
          phase === PHASES.CLASH && engine.lastClash?.winner === 'opponent' ? 1 : 0,
        );
      }

      // 3. Player played cards during CLASH on right of Clash Arena
      if (phase === PHASES.CLASH) {
        const pCards = engine.playerPlayedCards;
        const pStride = pCards.length >= 3 ? 64 : 78;
        const pCenter = 852;
        const pStartX = pCenter - ((pCards.length - 1) * pStride) / 2;
        for (let i = 0; i < pCards.length; i += 1) {
          const card = pCards[i];
          activeUids.add(card.uid);
          const sc = anim.ensureCard(card.uid, CENTER_X, 600, true);
          sc.setTarget(
            pStartX + i * pStride - 14,
            CLASH_Y,
            (i - (pCards.length - 1) / 2) * 0.055,
            1,
            1,
            engine.lastClash?.winner === 'player' ? 1 : 0,
          );
        }
      }

      // 4. Player hand at bottom
      const selectedSet = new Set(engine.selectedIds);
      const slots = computePlayerHandSlots(engine.playerHand.length, selectedSet, uiState.hoveredUid, uiState.draggingUid);
      for (let i = 0; i < engine.playerHand.length; i += 1) {
        const card = engine.playerHand[i];
        const slot = slots[i];
        activeUids.add(card.uid);
        const sc = anim.ensureCard(card.uid, 128, 336, false);
        const isSelected = selectedSet.has(card.uid);
        const isHovered = uiState.hoveredUid === card.uid && phase === PHASES.SELECT;
        const isDragging = uiState.draggingUid === card.uid && phase === PHASES.SELECT;

        if (isDragging) {
          sc.setTarget(uiState.dragX, uiState.dragY, 0, 1.06, 1, 1);
        } else {
          const lift = isSelected ? -21 : isHovered ? -14 : 0;
          sc.setTarget(
            slot.x,
            slot.y + lift,
            isSelected ? slot.rot * 0.35 : slot.rot,
            isSelected ? 1.035 : isHovered ? 1.025 : 1,
            1,
            isSelected ? 1 : 0,
          );
        }
      }
    }

    anim.pruneCards(activeUids);
  }

  render(ctx, engine, anim, uiState) {
    const isDefeat = engine.phase === PHASES.DEFEAT;
    const isVictory = engine.phase === PHASES.VICTORY;

    ctx.save();
    if (anim.shake > 0.2) {
      const sx = Math.sin(anim.time * 58) * anim.shake;
      const sy = Math.cos(anim.time * 49) * anim.shake * 0.7;
      ctx.translate(sx, sy);
    }

    // 1. Static cached walnut + baize table backdrop
    if (this.backdropCanvas) {
      ctx.drawImage(this.backdropCanvas, 0, 0);
    }

    // 2. Dynamic candlelit glow pools (warm amber normally, radiant gold on victory, cool twilight on defeat)
    this.drawCandleLighting(ctx, anim.time, isVictory, isDefeat);

    // 3. Ambient floating dust/ember motes
    this.drawAmbientMotes(ctx, anim, isVictory, isDefeat);

    // 4. Opponent fanned hand backs at top
    this.drawOpponentHand(ctx, engine, anim);

    // 5. Active table gameplay (Clash Arena + Player Hand)
    if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
      this.drawClashArena(ctx, engine, anim);
      this.drawPlayerHand(ctx, engine, anim, uiState);
      this.drawParticles(ctx, anim);
    } else if (isVictory) {
      // Render burst sparkles behind finisher cards so card faces remain razor-sharp!
      this.drawParticles(ctx, anim);
      this.drawVictoryTableShowcase(ctx, engine, anim);
    } else if (isDefeat) {
      this.drawParticles(ctx, anim);
      this.drawDefeatTableShowcase(ctx, engine, anim);
    } else {
      this.drawParticles(ctx, anim);
    }

    // 7. Floating combat callouts
    this.drawCallouts(ctx, anim);

    // 8. Impact flash tint
    if (anim.flash > 0.01) {
      ctx.save();
      ctx.globalAlpha = anim.flash * 0.24;
      ctx.fillStyle = anim.flashColor;
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
      ctx.restore();
    }

    ctx.restore();
  }

  drawCandleLighting(ctx, time, isVictory, isDefeat) {
    const flicker = 0.94 + Math.sin(time * 5.2) * 0.03 + Math.sin(time * 11.7) * 0.02;

    if (isDefeat) {
      // Cool midnight-indigo twilight wash when player's lanterns go out
      ctx.save();
      ctx.fillStyle = 'rgba(11, 17, 34, 0.56)';
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);

      const coolSpot = ctx.createRadialGradient(CENTER_X, 510, 40, CENTER_X, 510, 420);
      coolSpot.addColorStop(0, 'rgba(195, 58, 66, 0.22)');
      coolSpot.addColorStop(0.6, 'rgba(32, 46, 78, 0.14)');
      coolSpot.addColorStop(1, 'rgba(6, 10, 22, 0)');
      ctx.fillStyle = coolSpot;
      ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
      ctx.restore();
      return;
    }

    // Warm flickering parlor sconces from upper-left and upper-right
    const lanterns = [
      [130, 56, 320 * flicker],
      [1150, 56, 320 * flicker],
      [CENTER_X, isVictory ? 460 : 320, (isVictory ? 520 : 380) * flicker],
    ];
    ctx.save();
    for (let i = 0; i < lanterns.length; i += 1) {
      const [lx, ly, lr] = lanterns[i];
      const grad = ctx.createRadialGradient(lx, ly, 10, lx, ly, lr);
      if (isVictory && i === 2) {
        grad.addColorStop(0, 'rgba(255, 222, 104, 0.36)');
        grad.addColorStop(0.5, 'rgba(255, 176, 56, 0.16)');
        grad.addColorStop(1, 'rgba(255, 150, 30, 0)');
      } else {
        grad.addColorStop(0, 'rgba(255, 206, 112, 0.16)');
        grad.addColorStop(0.55, 'rgba(255, 166, 62, 0.06)');
        grad.addColorStop(1, 'rgba(255, 150, 30, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden victory sunburst rays radiating behind the winning combo
    if (isVictory) {
      ctx.translate(CENTER_X, 520);
      ctx.rotate(time * 0.09);
      const rayCount = 16;
      for (let i = 0; i < rayCount; i += 1) {
        const a0 = (i / rayCount) * Math.PI * 2;
        const a1 = a0 + Math.PI / rayCount / 2.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 540, a0, a1);
        ctx.closePath();
        const rg = ctx.createRadialGradient(0, 0, 20, 0, 0, 540);
        rg.addColorStop(0, 'rgba(255, 228, 128, 0.22)');
        rg.addColorStop(0.55, 'rgba(255, 194, 72, 0.08)');
        rg.addColorStop(1, 'rgba(255, 194, 72, 0)');
        ctx.fillStyle = rg;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawAmbientMotes(ctx, anim, isVictory, isDefeat) {
    ctx.save();
    for (const m of anim.motes) {
      const pulse = 0.65 + 0.35 * Math.sin(anim.time * 2.4 + m.phase);
      ctx.globalAlpha = m.alpha * pulse * (isVictory ? 1.7 : 1);
      ctx.fillStyle = isDefeat ? '#8FA5C4' : isVictory ? '#FFE382' : '#FBD07A';
      ctx.beginPath();
      ctx.arc(m.x, m.y, isVictory ? m.r * 1.25 : m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawOpponentHand(ctx, engine, anim) {
    const isTitle = engine.phase === PHASES.TITLE;
    const count = isTitle ? 5 : engine.oppHand.length;
    for (let i = 0; i < count; i += 1) {
      const uid = isTitle ? `title-opp-${i}` : engine.oppHand[i].uid;
      const sc = anim.cards.get(uid);
      if (!sc) continue;
      ctx.save();
      if (isTitle) ctx.globalAlpha = 0.52;
      drawCard(ctx, null, sc.x, sc.y, OPP_CARD_W, OPP_CARD_H, {
        rot: sc.rot,
        scale: sc.scale,
        flip: -1,
      });
      ctx.restore();
    }
  }

  drawClashArena(ctx, engine, anim) {
    const telegraph = engine.oppTelegraph;
    const isClash = engine.phase === PHASES.CLASH;
    const selectedTrick = engine.getSelectedTrick();
    const oppSuit = telegraph?.leadSuit ?? 'brass';
    const oppSuitInfo = SUITS[oppSuit];

    // Left Clash Header: Opponent Intent / Played Power Pill
    const oppBannerX = 278;
    const oppBannerY = 172;
    const oppBannerW = 260;
    const oppBannerH = 34;

    roundedRectPath(ctx, oppBannerX, oppBannerY, oppBannerW, oppBannerH, 10);
    ctx.fillStyle = 'rgba(20, 12, 10, 0.86)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = oppSuitInfo.bright;
    ctx.stroke();

    drawSuitEmblem(ctx, oppSuit, oppBannerX + 20, oppBannerY + 17, 10);

    ctx.fillStyle = '#FFF5DF';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const oppHeaderText = isClash
      ? `${engine.rival.name.toUpperCase()} · ${engine.lastClash.oppTrick.comboShort}`
      : `INTENT · ${telegraph.intentBadge} (${telegraph.powerText})`;
    ctx.fillText(oppHeaderText, oppBannerX + 36, oppBannerY + 17.5);

    // Opponent committed / telegraphed cards
    const oppCards = engine.oppCommittedCards;
    for (let i = 0; i < oppCards.length; i += 1) {
      const card = oppCards[i];
      const sc = anim.cards.get(card.uid);
      if (!sc) continue;
      const showTell = !isClash && i > 0;
      drawCard(ctx, card, sc.x, sc.y, CLASH_CARD_W, CLASH_CARD_H, {
        rot: sc.rot,
        scale: sc.scale,
        flip: sc.flip,
        winnerGlow: isClash && engine.lastClash?.winner === 'opponent',
        tellOptions: showTell
          ? {
              color: oppSuitInfo.color,
              label: telegraph.trick.comboId === 'pair' ? 'PAIR TELL' : telegraph.trick.comboId === 'harmony' ? 'HARMONY' : 'HIDDEN',
              time: anim.time,
            }
          : null,
      });
    }

    // Tell sub-ribbon beneath opponent's cards
    if (telegraph) {
      const ribbonY = 386;
      roundedRectPath(ctx, 278, ribbonY, 260, 28, 8);
      ctx.fillStyle = isClash ? 'rgba(24, 15, 11, 0.88)' : 'rgba(30, 16, 16, 0.84)';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isClash ? '#E0B962' : oppSuitInfo.color;
      ctx.stroke();
      ctx.fillStyle = '#FFECC2';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        isClash ? `RIVAL POWER: ${engine.lastClash.oppPower}` : `TELL: ${telegraph.tellTag}`,
        408,
        ribbonY + 14.5,
      );
    }

    // Right Clash Zone: Player Played Cards OR Live Staged Projection!
    const pBannerX = 722;
    const pBannerY = 172;
    const pBannerW = 260;
    const pBannerH = 34;

    const pSuit = isClash ? engine.lastClash.playerTrick.leadSuit : selectedTrick.leadSuit;
    const pSuitInfo = pSuit ? SUITS[pSuit] : null;

    roundedRectPath(ctx, pBannerX, pBannerY, pBannerW, pBannerH, 10);
    ctx.fillStyle = 'rgba(14, 24, 20, 0.88)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = pSuitInfo ? pSuitInfo.bright : 'rgba(227, 188, 100, 0.55)';
    ctx.stroke();

    if (pSuit) {
      drawSuitEmblem(ctx, pSuit, pBannerX + 20, pBannerY + 17, 10);
    }
    ctx.fillStyle = '#FFF7E2';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = pSuit ? 'left' : 'center';
    ctx.textBaseline = 'middle';
    const pHeaderText = isClash
      ? `YOUR TRICK · ${engine.lastClash.playerTrick.comboShort}`
      : selectedTrick.cards.length > 0
        ? `STAGED · ${selectedTrick.comboName}`
        : 'SELECT 1–3 CARDS BELOW';
    ctx.fillText(pHeaderText, pSuit ? pBannerX + 36 : pBannerX + pBannerW / 2, pBannerY + 17.5);

    if (isClash) {
      for (const card of engine.playerPlayedCards) {
        const sc = anim.cards.get(card.uid);
        if (!sc) continue;
        drawCard(ctx, card, sc.x, sc.y, CLASH_CARD_W, CLASH_CARD_H, {
          rot: sc.rot,
          scale: sc.scale,
          flip: sc.flip,
          winnerGlow: engine.lastClash?.winner === 'player',
        });
      }

      // Bottom power ribbon under player's played cards
      roundedRectPath(ctx, 722, 386, 260, 28, 8);
      ctx.fillStyle = 'rgba(15, 29, 23, 0.9)';
      ctx.fill();
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = '#FFD459';
      ctx.stroke();
      ctx.fillStyle = '#FFE999';
      ctx.font = '800 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`YOUR POWER: ${engine.lastClash.playerPower}`, 852, 400.5);
    } else if (selectedTrick.cards.length > 0) {
      // Staged Combo Tactical Projection directly in the right Clash Arena!
      const playerTrumps = doesSuitTrump(selectedTrick.leadSuit, oppSuit);
      const oppTrumps = !selectedTrick.ignoreEnemyTrump && doesSuitTrump(oppSuit, selectedTrick.leadSuit);
      const projPower = Math.max(1, selectedTrick.totalPower + (playerTrumps ? 3 : 0));

      roundedRectPath(ctx, 738, 218, 228, 156, 14);
      const projGrad = ctx.createLinearGradient(738, 218, 966, 374);
      projGrad.addColorStop(0, 'rgba(20, 48, 38, 0.9)');
      projGrad.addColorStop(1, 'rgba(11, 29, 23, 0.92)');
      ctx.fillStyle = projGrad;
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = playerTrumps ? '#FFE066' : pSuitInfo.bright;
      ctx.stroke();

      // Big projected power numeral + suit emblem
      if (pSuit) {
        drawSuitEmblem(ctx, pSuit, 786, 268, 26);
      }
      ctx.fillStyle = '#FFF4CC';
      ctx.font = '900 44px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(projPower), 824, 265);

      ctx.fillStyle = '#D7C49E';
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillText('PROJECTED PWR', 826, 293);

      // Breakdown pills inside projection card
      const breakdown = [];
      if (selectedTrick.comboBonus > 0) breakdown.push(`COMBO +${selectedTrick.comboBonus}`);
      if (playerTrumps) breakdown.push('TRUMP +3');
      if (oppTrumps) breakdown.push('TRUMPED');
      if (selectedTrick.ward > 0) breakdown.push(`WARD +${selectedTrick.ward}`);
      if (selectedTrick.heal > 0) breakdown.push(`MEND +${selectedTrick.heal}`);
      if (selectedTrick.burn > 0) breakdown.push(`BURN +${selectedTrick.burn}`);
      if (selectedTrick.chill > 0) breakdown.push(`CHILL -${selectedTrick.chill}`);
      if (selectedTrick.nextLantern > 0) breakdown.push(`+${selectedTrick.nextLantern} LANTERN`);

      ctx.fillStyle = playerTrumps ? '#FFE066' : '#E7D8B6';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(breakdown.slice(0, 3).join('  ·  ') || 'READY TO PLAY', 852, 330);

      // Lantern cost row
      ctx.fillStyle = '#F5CF6B';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText(`COST: ${selectedTrick.totalCost} / ${engine.playerLanterns} LANTERNS`, 852, 355);

      // Bottom ribbon
      roundedRectPath(ctx, 722, 386, 260, 28, 8);
      ctx.fillStyle = playerTrumps ? 'rgba(130, 88, 12, 0.88)' : 'rgba(18, 36, 29, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = playerTrumps ? '#FFE066' : '#D9B15A';
      ctx.stroke();
      ctx.fillStyle = '#FFF8DE';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        playerTrumps
          ? `★ ${pSuitInfo.name.toUpperCase()} TRUMPS ${oppSuitInfo.name.toUpperCase()} (+3 PWR)!`
          : `${selectedTrick.cards.length} CARD${selectedTrick.cards.length > 1 ? 'S' : ''} READY · CLICK PLAY`,
        852,
        400.5,
      );
    } else {
      // Empty soft drop-zone silhouette encouraging click or drag
      roundedRectPath(ctx, 742, 222, 220, 148, 14);
      ctx.fillStyle = 'rgba(11, 29, 23, 0.45)';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = 'rgba(232, 193, 106, 0.48)';
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(244, 224, 174, 0.78)';
      ctx.font = '800 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CLICK OR DRAG CARDS', 852, 284);
      ctx.fillStyle = 'rgba(218, 198, 152, 0.65)';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.fillText('Combine Pair · Harmony · Chain', 852, 310);
    }

    // Center Compass VS / Clash Result Medallion
    this.drawCenterVsMedallion(ctx, engine, selectedTrick, telegraph, isClash);
  }

  drawCenterVsMedallion(ctx, engine, selectedTrick, telegraph, isClash) {
    const cx = CENTER_X;
    const cy = CLASH_Y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    const medGrad = ctx.createRadialGradient(cx, cy - 12, 6, cx, cy, 48);
    medGrad.addColorStop(0, '#3C2816');
    medGrad.addColorStop(1, '#1A1109');
    ctx.fillStyle = medGrad;
    ctx.fill();

    let ringColor = '#E2BC64';
    if (isClash) {
      ringColor = engine.lastClash.winner === 'player' ? '#FFE066' : engine.lastClash.winner === 'opponent' ? '#FF5E52' : '#9CC7E8';
    } else if (selectedTrick.leadSuit && telegraph && doesSuitTrump(selectedTrick.leadSuit, telegraph.leadSuit)) {
      ringColor = '#FFE066';
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = ringColor;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isClash) {
      const c = engine.lastClash;
      ctx.fillStyle = '#FFF5D6';
      ctx.font = '900 22px Georgia, serif';
      ctx.fillText(`${c.oppPower} : ${c.playerPower}`, cx, cy - 8);

      ctx.fillStyle = c.winner === 'player' ? '#6BF09E' : c.winner === 'opponent' ? '#FF7568' : '#BCE0FF';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText(c.winner === 'player' ? `WIN -${c.damageToOpp}♥` : c.winner === 'opponent' ? `HIT -${c.damageToPlayer}♥` : 'TIE -2♥', cx, cy + 16);
    } else if (selectedTrick.cards.length > 0 && telegraph) {
      const playerTrumps = doesSuitTrump(selectedTrick.leadSuit, telegraph.leadSuit);
      ctx.fillStyle = playerTrumps ? '#FFE066' : '#F6DC94';
      ctx.font = '900 21px Georgia, serif';
      ctx.fillText(playerTrumps ? 'TRUMP!' : 'VS', cx, cy - 7);
      ctx.fillStyle = '#D9C7A3';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText(playerTrumps ? '+3 POWER' : `${telegraph.powerText} vs ${selectedTrick.totalPower}`, cx, cy + 15);
    } else {
      ctx.fillStyle = '#F2CF78';
      ctx.font = '900 24px Georgia, serif';
      ctx.fillText('VS', cx, cy - 4);
      ctx.fillStyle = '#BCA984';
      ctx.font = '700 10px system-ui, sans-serif';
      ctx.fillText(`RND ${engine.round}`, cx, cy + 18);
    }
    ctx.restore();
  }

  drawPlayerHand(ctx, engine, anim, uiState) {
    const selectedSet = new Set(engine.selectedIds);
    const selectedTrick = engine.getSelectedTrick();
    const remainingLanterns = engine.playerLanterns - selectedTrick.totalCost;

    // Draw luminous combo tether arcs connecting 2–3 selected cards!
    if (engine.phase === PHASES.SELECT && engine.selectedIds.length >= 2) {
      const pts = [];
      for (const card of engine.playerHand) {
        if (selectedSet.has(card.uid)) {
          const sc = anim.cards.get(card.uid);
          if (sc) pts.push({ x: sc.x, y: sc.y - 68 });
        }
      }
      if (pts.length >= 2) {
        ctx.save();
        ctx.strokeStyle = '#FFE066';
        ctx.shadowColor = '#FFD459';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i += 1) {
          const midX = (pts[i - 1].x + pts[i].x) / 2;
          const midY = Math.min(pts[i - 1].y, pts[i].y) - 24;
          ctx.quadraticCurveTo(midX, midY, pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Spark nodes at tether anchors
        for (const pt of pts) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF7D1';
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Draw hand cards in z-order (hovered & dragged card on top)
    const drawOrder = engine.playerHand.map((card, index) => ({ card, index }));
    drawOrder.sort((a, b) => {
      const aTop = a.card.uid === uiState.draggingUid ? 3 : a.card.uid === uiState.hoveredUid ? 2 : selectedSet.has(a.card.uid) ? 1 : 0;
      const bTop = b.card.uid === uiState.draggingUid ? 3 : b.card.uid === uiState.hoveredUid ? 2 : selectedSet.has(b.card.uid) ? 1 : 0;
      return aTop - bTop || a.index - b.index;
    });

    for (const { card, index } of drawOrder) {
      const sc = anim.cards.get(card.uid);
      if (!sc) continue;
      const isSelected = selectedSet.has(card.uid);
      const isHovered = uiState.hoveredUid === card.uid && engine.phase === PHASES.SELECT;
      const cantAfford = engine.phase === PHASES.SELECT && !isSelected && (card.cost > remainingLanterns || engine.selectedIds.length >= 3);

      drawCard(ctx, card, sc.x, sc.y, HAND_CARD_W, HAND_CARD_H, {
        rot: sc.rot,
        scale: sc.scale,
        flip: sc.flip,
        selected: isSelected,
        hovered: isHovered,
        dimmed: cantAfford,
      });

      // Subtle brass hotkey badge [1]..[6] cleanly inside baize at foot of each card
      if (engine.phase === PHASES.SELECT && card.uid !== uiState.draggingUid) {
        const kx = sc.x;
        const ky = Math.min(683, sc.y + HAND_CARD_H / 2 + 9);
        ctx.save();
        roundedRectPath(ctx, kx - 12, ky - 8.5, 24, 17, 5);
        ctx.fillStyle = isSelected ? '#FFD459' : 'rgba(20, 14, 10, 0.82)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = isSelected ? '#FFF4C2' : 'rgba(227, 188, 100, 0.55)';
        ctx.stroke();
        ctx.fillStyle = isSelected ? '#1E1308' : '#E7D1A1';
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(index + 1), kx, ky + 0.5);
        ctx.restore();
      }
    }
  }

  drawVictoryTableShowcase(ctx, engine, anim) {
    const cards = engine.playerPlayedCards.length > 0 ? engine.playerPlayedCards : engine.playerHand.slice(0, 3);
    const labelY = 406;

    // Gold triumph header ribbon above the winning cards
    roundedRectPath(ctx, CENTER_X - 240, labelY - 16, 480, 32, 16);
    const ribGrad = ctx.createLinearGradient(CENTER_X - 240, labelY, CENTER_X + 240, labelY);
    ribGrad.addColorStop(0, 'rgba(104, 68, 12, 0.92)');
    ribGrad.addColorStop(0.5, 'rgba(176, 122, 22, 0.95)');
    ribGrad.addColorStop(1, 'rgba(104, 68, 12, 0.92)');
    ctx.fillStyle = ribGrad;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#FFE485';
    ctx.stroke();

    ctx.fillStyle = '#FFFDF0';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fin = engine.lastClash
      ? `★ WINNING FINISHER: ${engine.lastClash.playerTrick.comboName} · ${engine.lastClash.playerPower} PWR ★`
      : '★ WINNING HAND ★';
    ctx.fillText(fin, CENTER_X, labelY + 0.5);

    // Display winning combo cards fanned grandly on the glowing baize
    const stride = 148;
    const startX = CENTER_X - ((cards.length - 1) * stride) / 2;
    for (let i = 0; i < cards.length; i += 1) {
      const norm = cards.length === 1 ? 0 : (i / (cards.length - 1)) * 2 - 1;
      const bob = Math.sin(anim.time * 2.8 + i * 0.9) * 4;
      drawCard(ctx, cards[i], startX + i * stride, 534 + Math.abs(norm) * 10 + bob, 126, 180, {
        rot: norm * 0.08,
        scale: 1,
        flip: 1,
        winnerGlow: true,
      });
    }

    // Bottom triumph laurel pill
    if (engine.lastClash) {
      roundedRectPath(ctx, CENTER_X - 210, 646, 420, 28, 12);
      ctx.fillStyle = 'rgba(16, 36, 27, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#E5BE62';
      ctx.stroke();
      ctx.fillStyle = '#FFE799';
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.fillText(
        `DEALT ${engine.lastClash.damageToOpp} FINAL DMG · RIVAL ${engine.lastClash.oppPower} PWR SHATTERED`,
        CENTER_X,
        660.5,
      );
    }
  }

  drawDefeatTableShowcase(ctx, engine, anim) {
    const oppCards = engine.oppCommittedCards;
    const pCards = engine.playerPlayedCards;
    const labelY = 406;

    // Crimson-slate fair breakdown header above the decisive table clash
    roundedRectPath(ctx, CENTER_X - 265, labelY - 16, 530, 32, 16);
    ctx.fillStyle = 'rgba(42, 18, 22, 0.92)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#E0605A';
    ctx.stroke();

    ctx.fillStyle = '#FFE2DD';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const c = engine.lastClash;
    const txt = c
      ? `LETHAL COUNTER: ${engine.rival.name.toUpperCase()}'S ${c.oppTrick.comboName} (${c.oppPower}) vs YOURS (${c.playerPower})`
      : 'DECISIVE FINAL CLASH';
    ctx.fillText(txt, CENTER_X, labelY + 0.5);

    // Left: Opponent's winning counter cards (spotlighted crimson-gold, generous gap from center badge)
    const oppStride = oppCards.length >= 3 ? 84 : 112;
    const oppCenter = 420;
    const oppStart = oppCenter - ((oppCards.length - 1) * oppStride) / 2;
    for (let i = 0; i < oppCards.length; i += 1) {
      drawCard(ctx, oppCards[i], oppStart + i * oppStride, 536, 112, 162, {
        rot: (i - (oppCards.length - 1) / 2) * 0.055,
        scale: 1,
        flip: 1,
        winnerGlow: true,
      });
    }

    // Center crimson impact badge
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, 536, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#2A1014';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#FF665A';
    ctx.stroke();
    ctx.fillStyle = '#FF9C94';
    ctx.font = '900 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c ? `-${c.damageToPlayer}` : 'KO', CENTER_X, 529);
    ctx.fillStyle = '#E0B4B0';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.fillText('LETHAL', CENTER_X, 550);
    ctx.restore();

    // Right: Player's countered cards (slightly dimmed for instant visual clarity)
    const pStride = pCards.length >= 3 ? 82 : 108;
    const pCenter = 834;
    const pStart = pCenter - ((Math.max(1, pCards.length) - 1) * pStride) / 2;
    for (let i = 0; i < pCards.length; i += 1) {
      drawCard(ctx, pCards[i], pStart + i * pStride, 540, 110, 158, {
        rot: (i - (pCards.length - 1) / 2) * 0.05,
        scale: 0.96,
        flip: 1,
        dimmed: true,
      });
    }

    // Bottom subtle fair-loss caption
    roundedRectPath(ctx, CENTER_X - 245, 646, 490, 28, 12);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(184, 198, 222, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#CFD9EB';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(
      c && c.oppTrumps
        ? `TIP: ${SUITS[c.oppTrick.leadSuit].name} trumped ${SUITS[c.playerTrick.leadSuit]?.name ?? 'your suit'} (+3) — watch the Rival Tell!`
        : 'TIP: Watch the Rival Tell & weave Brass Ward or Elemental Trumps to counter!',
      CENTER_X,
      660.5,
    );
  }

  drawParticles(ctx, anim) {
    ctx.save();
    for (const p of anim.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 0.65));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.72, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.72, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawCallouts(ctx, anim) {
    ctx.save();
    for (const c of anim.callouts) {
      const alpha = Math.min(1, c.life / 0.45);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${c.size}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(14, 9, 6, 0.9)';
      ctx.strokeText(c.text, c.x, c.y);
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, c.x, c.y);
    }
    ctx.restore();
  }
}
