// Venetian twilight-velvet parlor table renderer: chiaroscuro candlelight, shockwave clash, and huge cards.
import { SUITS, SUIT_IDS, doesSuitTrump } from './cards.js';
import { PHASES } from './rules.js';
import { drawCard, drawSuitEmblem, roundedRectPath } from './card-art.js';
import { drawParlorCandle, drawGambitWaxSeal, drawWoodenDeckTray } from './portraits.js';
export const STAGE_W = 1280;
export const STAGE_H = 720;
export const CENTER_X = 640;
export const CLASH_Y = 294;
export const HAND_CARD_W = 128;
export const HAND_CARD_H = 184;
export const OPP_CARD_W = 72;
export const OPP_CARD_H = 102;
const UI = 'system-ui, -apple-system, sans-serif'; const SF = 'Georgia, serif';
const clashDims = (n) => (n >= 3 ? { w: 108, h: 154, stride: 114 } : { w: 124, h: 178, stride: 138 });
const lg = (ctx, x0, y0, x1, y1, s) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of s) g.addColorStop(o, c); return g; };
const rg = (ctx, x0, y0, r0, x1, y1, r1, s) => { const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1); for (const [o, c] of s) g.addColorStop(o, c); return g; };
function txt(ctx, t, x, y, f, c, a = 'center') { ctx.fillStyle=c; ctx.font = f; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
function box(ctx, x, y, w, h, r, fill, stroke, lw = 1.4) { roundedRectPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle=fill; ctx.fill();} if (stroke) { ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.stroke();} }
function dot(ctx, x, y, r, fill, stroke = null, lw = 1.4) { ctx.beginPath();ctx.arc(x, y, r, 0, Math.PI*2); if (fill) { ctx.fillStyle=fill; ctx.fill();} if (stroke) { ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.stroke();} }
export function computePlayerHandSlots(count) {
 const slots = [];
 if (count <= 0) return slots;
 const w = count >= 6 ? 108 : count === 5 ? 122 : HAND_CARD_W;
 const h = count >= 6 ? 154 : count === 5 ? 174 : HAND_CARD_H;
 const stride = count >= 6 ? 112 : count === 5 ? 132 : count === 4 ? 148 : 158;
 const sx = CENTER_X - ((count - 1) * stride) / 2;
 for (let i = 0; i < count; i += 1) {
  const n = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
  slots.push({ index: i, x: sx + i * stride, y: 582 + n * n * 10, rot: n * 0.052, w, h });
 }
 return slots;
}
export function computeOppHandSlots(count) {
 const slots = [];
 if (count <= 0) return slots;
 const stride = 66;
 const sx = CENTER_X - ((count - 1) * stride) / 2;
 for (let i = 0; i < count; i += 1) {
  const n = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
  slots.push({ x: sx + i * stride, y: 84 - n * n * 6, rot: -n * 0.062 });
 }
 return slots;
}
export class TableRenderer {
 constructor() { this.backdropCanvas = null; this.buildBackdropCache(); }
 buildBackdropCache() {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = STAGE_W; canvas.height = STAGE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle=lg(ctx, 0, 0, STAGE_W, STAGE_H, [[0, '#4A2514'], [0.35, '#29130A'], [0.7, '#3C1D0F'], [1, '#1B0C05']]);
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.strokeStyle='rgba(255,204,132,0.06)'; ctx.lineWidth=1.4;
  for (let y = 3; y < STAGE_H; y += 5) {
   ctx.beginPath();ctx.moveTo(0, y);
   for (let x = 0; x <= STAGE_W; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.011 + y * 0.16) * 2.2);
   ctx.stroke();
  }
  const m = 22;
  box(ctx, m - 4, m - 4, STAGE_W - (m - 4) * 2, STAGE_H - (m - 4) * 2, 20, lg(ctx, 0, 0, STAGE_W, STAGE_H, [[0, '#F6D680'], [0.25, '#9F6E20'], [0.5, '#FBE294'], [0.75, '#8A5A16'], [1, '#E6B958']]), null);
  box(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16, rg(ctx, CENTER_X, 320, 40, CENTER_X, 360, 720, [[0, '#1D5459'], [0.38, '#10353E'], [0.74, '#091E28'], [1, '#040E14']]), null);
  ctx.save();roundedRectPath(ctx, m, m, STAGE_W - m * 2, STAGE_H - m * 2, 16); ctx.clip();
  ctx.strokeStyle='rgba(255,236,184,0.028)'; ctx.lineWidth=1;
  for (let i = -STAGE_H; i < STAGE_W + STAGE_H; i += 12) {
   ctx.beginPath();ctx.moveTo(i, 0); ctx.lineTo(i + STAGE_H, STAGE_H); ctx.moveTo(i, STAGE_H); ctx.lineTo(i + STAGE_H, 0); ctx.stroke();
  }
  let s = 90210; ctx.fillStyle='rgba(255,240,196,0.036)';
  for (let i = 0; i < 1050; i += 1) {
   s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const fx = m + (s % (STAGE_W - m * 2));
   s = (Math.imul(s, 1664525) + 1013904223) >>> 0; ctx.fillRect(fx, m + (s % (STAGE_H - m * 2)), 1.5, 1.5);
  }
  box(ctx, m + 10, m + 10, STAGE_W - (m + 10) * 2, STAGE_H - (m + 10) * 2, 12, null, 'rgba(238,196,104,0.32)', 1.4);
  ctx.save();ctx.translate(CENTER_X, CLASH_Y);
  ctx.beginPath();ctx.ellipse(0, 0, 428, 146, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(5,16,22,0.44)'; ctx.fill();ctx.lineWidth=1.9; ctx.strokeStyle='rgba(242,202,108,0.42)'; ctx.stroke();
  ctx.beginPath();ctx.ellipse(0, 0, 412, 134, 0, 0, Math.PI*2);
  ctx.lineWidth=1.1; ctx.setLineDash([6, 7]); ctx.strokeStyle='rgba(242,202,108,0.24)'; ctx.stroke();ctx.setLineDash([]);
  dot(ctx, 0, 0, 74, null, 'rgba(244,208,118,0.38)', 1.7);
  for (let i = 0; i < 16; i += 1) {
   const a = (i * Math.PI) / 8; ctx.beginPath();
   ctx.moveTo(Math.cos(a) * 54, Math.sin(a) * 54); ctx.lineTo(Math.cos(a) * (i % 2 === 0 ? 88 : 72), Math.sin(a) * (i % 2 === 0 ? 88 : 72));
   ctx.strokeStyle=i % 2 === 0 ? 'rgba(246,210,120,0.34)' : 'rgba(246,210,120,0.16)'; ctx.lineWidth=i % 2 === 0 ? 1.7 : 1; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle=rg(ctx, CENTER_X, STAGE_H / 2, 330, CENTER_X, STAGE_H / 2, 790, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(2,6,11,0.68)']]);
  ctx.fillRect(m, m, STAGE_W - m * 2, STAGE_H - m * 2);
  ctx.restore();
  for (const [cx, cy] of [[24, 24], [STAGE_W - 24, 24], [24, STAGE_H - 24], [STAGE_W - 24, STAGE_H - 24]]) {
   dot(ctx, cx, cy, 10.5, '#C49234', '#FCE69B', 1.6); dot(ctx, cx, cy, 4, '#3B2012');
  }
  this.backdropCanvas = canvas;
 }
 syncCardTargets(engine, anim, uiState) {
  const active = new Set(); const phase = engine.phase;
  if (phase === PHASES.SELECT || phase === PHASES.CLASH) {
   const oppSlots = computeOppHandSlots(engine.oppHand.length);
   for (let i = 0; i < engine.oppHand.length; i += 1) {
    const u = engine.oppHand[i].uid; active.add(u);
    anim.ensureCard(u, 96, 120, false).setTarget(oppSlots[i].x, oppSlots[i].y, oppSlots[i].rot, 1, -1, 0);
   }
   const oc = engine.oppCommittedCards; const od = clashDims(oc.length);
   const oStart = 418 - ((oc.length - 1) * od.stride) / 2;
   for (let i = 0; i < oc.length; i += 1) {
    active.add(oc[i].uid);
    anim.ensureCard(oc[i].uid, CENTER_X, 82, false).setTarget(
     oStart + i * od.stride + (phase === PHASES.CLASH ? 12 : 0), CLASH_Y, (i - (oc.length - 1) / 2) * 0.036, 1,
     phase === PHASES.CLASH || i === 0 ? 1 : -1, phase === PHASES.CLASH && engine.lastClash?.winner === 'opponent' ? 1 : 0,
    );
   }
   if (phase === PHASES.CLASH) {
    const pc = engine.playerPlayedCards; const pd = clashDims(pc.length);
    const pStart = 862 - ((pc.length - 1) * pd.stride) / 2;
    for (let i = 0; i < pc.length; i += 1) {
     active.add(pc[i].uid);
     anim.ensureCard(pc[i].uid, CENTER_X, 580, true).setTarget(
      pStart + i * pd.stride - 12, CLASH_Y, (i - (pc.length - 1) / 2) * 0.036, 1, 1, engine.lastClash?.winner === 'player' ? 1 : 0,
     );
    }
   }
   const selSet = new Set(engine.selectedIds); const slots = computePlayerHandSlots(engine.playerHand.length);
   for (let i = 0; i < engine.playerHand.length; i += 1) {
    const card = engine.playerHand[i]; const sl = slots[i]; active.add(card.uid);
    const sc = anim.ensureCard(card.uid, 96, 260, false);
    const isSel = selSet.has(card.uid); const isHov = uiState.hoveredUid === card.uid && phase === PHASES.SELECT;
    if (uiState.draggingUid === card.uid && phase === PHASES.SELECT) sc.setTarget(uiState.dragX, uiState.dragY, 0, 1.06, 1, 1);
    else sc.setTarget(sl.x, sl.y + (isSel ? -24 : isHov ? -14 : 0), isSel ? sl.rot * 0.3 : sl.rot, isSel ? 1.04 : isHov ? 1.025 : 1, 1, isSel ? 1 : 0);
   }
  }
  anim.pruneCards(active);
 }
 render(ctx, engine, anim, uiState) {
  const isDef = engine.phase === PHASES.DEFEAT; const isVic = engine.phase === PHASES.VICTORY;
  ctx.save();
  if (anim.shake > 0.2) ctx.translate(Math.sin(anim.time * 58) * anim.shake, Math.cos(anim.time * 49) * anim.shake * 0.7);
  if (this.backdropCanvas) ctx.drawImage(this.backdropCanvas, 0, 0);
  this.drawCandleLighting(ctx, anim.time, isVic, isDef, engine.gambitActive, engine.phase === PHASES.CLASH);
  this.drawAmbientMotes(ctx, anim, isVic, isDef);
  if (engine.phase === PHASES.TITLE) {
   drawParlorCandle(ctx, 96, 154, 1.16, anim.time, false, true);
   drawParlorCandle(ctx, 1184, 154, 1.16, anim.time + 1.3, false, true);
  } else if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
   drawParlorCandle(ctx, 388, 84, 0.88, anim.time, false, true);
   drawParlorCandle(ctx, 892, 84, 0.88, anim.time + 1.4, false, true);
   this.drawTabletopProps(ctx, engine);
  }
  if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
   this.drawOpponentHand(ctx, engine, anim);
   this.drawShockwaves(ctx, anim);
   this.drawKineticTrails(ctx, engine, anim);
   this.drawClashArena(ctx, engine, anim);
   this.drawPlayerHand(ctx, engine, anim, uiState);
   this.drawParticles(ctx, anim);
   this.drawCenterVsMedallion(ctx, engine, anim, engine.getSelectedTrick(), engine.oppTelegraph, engine.phase === PHASES.CLASH);
  } else if (isVic) {
   this.drawShockwaves(ctx, anim); this.drawParticles(ctx, anim); this.drawVictoryTableShowcase(ctx, engine, anim);
  } else if (isDef) {
   this.drawShockwaves(ctx, anim); this.drawParticles(ctx, anim); this.drawDefeatTableShowcase(ctx, engine, anim);
  } else this.drawParticles(ctx, anim);
  this.drawCallouts(ctx, anim);
  if (anim.flash > 0.01) { ctx.globalAlpha=anim.flash * 0.24; ctx.fillStyle=anim.flashColor; ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44); }
  ctx.restore();
 }
 drawCandleLighting(ctx, time, isVic, isDef, gambit, isClash) {
  const fl = 0.95 + Math.sin(time * 5.2) * 0.03 + Math.sin(time * 11.7) * 0.02;
  ctx.save();
  if (isDef) {
   ctx.fillStyle='rgba(7,11,26,0.62)'; ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44);
   ctx.fillStyle=rg(ctx, CENTER_X, 515, 45, CENTER_X, 515, 480, [[0, 'rgba(216,58,66,0.28)'], [0.58, 'rgba(30,44,78,0.16)'], [1, 'rgba(6,10,22,0)']]);
   ctx.fillRect(22, 22, STAGE_W - 44, STAGE_H - 44); ctx.restore();return;
  }
  const pools = [[110, 140, 340 * fl], [1170, 140, 340 * fl], [CENTER_X, isVic ? 340 : 298, (isVic ? 580 : isClash ? 490 : 420) * fl]];
  for (let i = 0; i < 3; i += 1) {
   const [lx, ly, lr] = pools[i];
   const stops = isVic && i === 2 ? [[0, 'rgba(255,226,112,0.42)'], [0.5, 'rgba(255,178,56,0.16)'], [1, 'rgba(255,150,30,0)']]
    : (gambit || isClash) && i === 2 ? [[0, 'rgba(255,196,82,0.34)'], [0.5, 'rgba(224,78,42,0.14)'], [1, 'rgba(210,72,46,0)']]
    : [[0, 'rgba(255,204,108,0.24)'], [0.55, 'rgba(255,158,52,0.08)'], [1, 'rgba(255,140,30,0)']];
   dot(ctx, lx, ly, lr, rg(ctx, lx, ly, 12, lx, ly, lr, stops));
  }
  if (isVic) {
   ctx.translate(CENTER_X, 326); ctx.rotate(time * 0.08);
   for (let i = 0; i < 16; i += 1) {
    const a0 = (i / 16) * Math.PI*2;
    ctx.beginPath();ctx.moveTo(0, 0); ctx.arc(0, 0, 580, a0, a0 + Math.PI / 34); ctx.closePath();
    ctx.fillStyle=rg(ctx, 0, 0, 20, 0, 0, 580, [[0, 'rgba(255,230,132,0.26)'], [0.55, 'rgba(255,194,72,0.09)'], [1, 'rgba(255,194,72,0)']]); ctx.fill();
   }
  }
  ctx.restore();
 }
 drawTabletopProps(ctx, engine) {
  drawWoodenDeckTray(ctx, 42, 174, 72, 92);
  for (let s = 3; s >= 0; s -= 1) drawCard(ctx, null, 78 - s * 1.6, 220 - s * 1.6, 50, 72, { flip: -1, shadow: s === 3 });
  txt(ctx, 'DECK', 140, 198, `800 10px ${UI}`, '#F3D486');
  txt(ctx, String(engine.playerDeck?.drawCount ?? 0), 140, 223, `900 28px ${SF}`, '#FFF7E2');
  txt(ctx, `DISC ${engine.playerDeck?.discardCount ?? 0}`, 140, 248, `700 10px ${UI}`, '#C7BA9C');
  const wCx = 102; const wCy = 336;
  const nodes = [{ id: 'ember', px: wCx, py: wCy - 34 }, { id: 'bramble', px: wCx + 42, py: wCy + 20 }, { id: 'tide', px: wCx - 42, py: wCy + 20 }];
  ctx.strokeStyle='rgba(242,208,120,0.68)'; ctx.lineWidth=2;
  for (let i = 0; i < 3; i += 1) {
   const a = nodes[i]; const b = nodes[(i + 1) % 3];
   const dx = b.px - a.px; const dy = b.py - a.py; const len = Math.hypot(dx, dy);
   const ex = b.px - (dx / len) * 16; const ey = b.py - (dy / len) * 16;
   ctx.beginPath();ctx.moveTo(a.px + (dx / len) * 16, a.py + (dy / len) * 16); ctx.lineTo(ex, ey); ctx.stroke();
   const ang = Math.atan2(dy, dx); ctx.fillStyle='#F5D178';
   ctx.beginPath();ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(ang - 0.5) * 6, ey - Math.sin(ang - 0.5) * 6);
   ctx.lineTo(ex - Math.cos(ang + 0.5) * 6, ey - Math.sin(ang + 0.5) * 6); ctx.closePath();ctx.fill();
  }
  for (const n of nodes) { dot(ctx, n.px, n.py, 14, '#121820', SUITS[n.id].bright, 1.6); drawSuitEmblem(ctx, n.id, n.px, n.py, 9.5); }
  dot(ctx, wCx, wCy + 3, 11, '#22170C', '#FFD459', 1.3); drawSuitEmblem(ctx, 'brass', wCx, wCy + 3, 7.6);
  txt(ctx, 'TRUMP +3', wCx, 384, `800 9.5px ${UI}`, '#E6CF96');
  box(ctx, 40, 402, 126, 62, 10, 'rgba(8,18,24,0.74)', 'rgba(232,192,102,0.38)', 1.2);
  txt(ctx, 'RIVAL SUITS', 103, 415, `800 8.8px ${UI}`, '#E4CE9C');
  const rem = engine.getRivalRemainingSuits();
  for (let i = 0; i < SUIT_IDS.length; i += 1) {
   const sid = SUIT_IDS[i]; const sx = 64 + (i % 2) * 58; const sy = 434 + Math.floor(i / 2) * 20;
   drawSuitEmblem(ctx, sid, sx, sy, 6.8); txt(ctx, String(rem[sid]), sx + 14, sy + 0.5, `900 12px ${UI}`, '#FFF4D8', 'left');
  }
 }
 drawAmbientMotes(ctx, anim, isVic, isDef) {
  ctx.save();
  for (const m of anim.motes) {
   ctx.globalAlpha=m.alpha * (0.65 + 0.35 * Math.sin(anim.time * 2.4 + m.phase)) * (isVic ? 1.7 : 1);
   dot(ctx, m.x, m.y, isVic ? m.r * 1.25 : m.r, isDef ? '#8FA5C4' : isVic ? '#FFE382' : '#FBD07A');
  }
  ctx.restore();
 }
 drawShockwaves(ctx, anim) {
  ctx.save();
  for (const g of anim.rings) {
   const a = Math.max(0, g.life / g.maxLife);
   ctx.globalAlpha=a * 0.85; ctx.shadowColor=g.color; ctx.shadowBlur=16;
   dot(ctx, g.x, g.y, g.r, null, g.color, g.lw * a + 1.2);
  }
  ctx.restore();
 }
 drawOpponentHand(ctx, engine, anim) {
  for (const c of engine.oppHand) {
   const sc = anim.cards.get(c.uid);
   if (sc) drawCard(ctx, null, sc.x, sc.y, OPP_CARD_W, OPP_CARD_H, { rot: sc.rot, scale: sc.scale, flip: -1 });
  }
 }
 drawKineticTrails(ctx, engine, anim) {
  if (engine.phase === PHASES.CLASH && engine.lastClash) {
   const c = engine.lastClash;
   const col = c.winner === 'player' ? '#FFE270' : '#FF6B5C';
   const fx = c.winner === 'player' ? 790 : 490; const tx = c.winner === 'player' ? 490 : 790;
   ctx.save();
   ctx.strokeStyle=lg(ctx, fx, CLASH_Y, tx, CLASH_Y, [[0, col], [0.5, '#FFF8D4'], [1, 'rgba(255,110,72,0.16)']]);
   ctx.lineWidth=3.8; ctx.shadowColor=col; ctx.shadowBlur=18;
   ctx.beginPath();ctx.moveTo(fx, CLASH_Y - 22); ctx.quadraticCurveTo(CENTER_X, CLASH_Y - 76, tx, CLASH_Y - 12); ctx.stroke();
   ctx.beginPath();ctx.moveTo(fx, CLASH_Y + 24); ctx.quadraticCurveTo(CENTER_X, CLASH_Y + 74, tx, CLASH_Y + 14); ctx.stroke();
   ctx.restore();return;
  }
  if (engine.phase !== PHASES.SELECT || engine.selectedIds.length === 0) return;
  const tr = engine.getSelectedTrick(); const suit = SUITS[tr.leadSuit] ?? SUITS.brass;
  const sel = new Set(engine.selectedIds); const pts = [];
  for (const c of engine.playerHand) if (sel.has(c.uid)) { const sc = anim.cards.get(c.uid); if (sc) pts.push({ x: sc.x, y: sc.y - 82 }); }
  if (pts.length === 0) return;
  ctx.save();
  const a = pts[pts.length - 1]; const cx = Math.max(a.x + 80, 760); const cy = 408;
  ctx.strokeStyle=lg(ctx, a.x, a.y, 862, 376, [[0, 'rgba(255,228,112,0.85)'], [0.55, suit.bright], [1, 'rgba(255,232,132,0.22)']]);
  ctx.lineWidth=3.2; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -anim.time * 42;
  ctx.beginPath();ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cx, cy, 862, 376); ctx.stroke();ctx.setLineDash([]);
  for (const o of [0, 0.45]) {
   const t = (anim.time * 0.75 + o) % 1;
   const px = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * 862;
   const py = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * 376;
   ctx.shadowColor='#FFE485'; ctx.shadowBlur=12; dot(ctx, px, py, o === 0 ? 4.6 : 3, '#FFF9D6');
  }
  ctx.restore();
 }
 drawClashArena(ctx, engine, anim) {
  const tele = engine.oppTelegraph; const isClash = engine.phase === PHASES.CLASH;
  const selTrick = engine.getSelectedTrick(); const oppSuit = tele?.leadSuit ?? 'brass'; const oppInfo = SUITS[oppSuit];
  box(ctx, 278, 158, 280, 32, 10, 'rgba(18,12,14,0.88)', oppInfo.bright, 1.8);
  drawSuitEmblem(ctx, oppSuit, 298, 174, 10);
  txt(ctx, isClash ? `${engine.rival.name.toUpperCase()} · ${engine.lastClash.oppTrick.comboShort} (${engine.lastClash.oppPower})` : `${tele.intentBadge} · ${tele.tellTag}`, 315, 174.5, `800 12px ${UI}`, '#FFF5DF', 'left');
  const oc = engine.oppCommittedCards; const od = clashDims(oc.length);
  for (let i = 0; i < oc.length; i += 1) {
   const sc = anim.cards.get(oc[i].uid);
   if (!sc) continue;
   drawCard(ctx, oc[i], sc.x, sc.y, od.w, od.h, {
    rot: sc.rot, scale: sc.scale, flip: sc.flip, time: anim.time,
    winnerGlow: isClash && engine.lastClash?.winner === 'opponent', dimmed: isClash && engine.lastClash?.winner === 'player',
    tellOptions: !isClash && i > 0 ? { color: oppInfo.color, label: tele.trick.comboId === 'pair' ? 'PAIR TELL' : tele.trick.comboId === 'harmony' ? 'HARMONY' : 'HIDDEN', time: anim.time } : null,
   });
  }
  const pSuit = isClash ? engine.lastClash.playerTrick.leadSuit : selTrick.leadSuit; const pInfo = pSuit ? SUITS[pSuit] : null;
  box(ctx, 722, 158, 280, 32, 10, 'rgba(10,24,28,0.88)', pInfo ? pInfo.bright : 'rgba(232,192,102,0.55)', 1.8);
  if (pSuit) drawSuitEmblem(ctx, pSuit, 742, 174, 10);
  txt(ctx, isClash ? `YOUR ${engine.lastClash.playerTrick.comboName} (${engine.lastClash.playerPower})` : selTrick.cards.length > 0 ? `STAGED · ${selTrick.comboName}` : 'SELECT 1–3 CARDS BELOW', pSuit ? 759 : 862, 174.5, `800 12px ${UI}`, '#FFF7E2', pSuit ? 'left' : 'center');
  if (isClash) {
   const pd = clashDims(engine.playerPlayedCards.length);
   for (const card of engine.playerPlayedCards) {
    const sc = anim.cards.get(card.uid);
    if (sc) drawCard(ctx, card, sc.x, sc.y, pd.w, pd.h, { rot: sc.rot, scale: sc.scale, flip: sc.flip, time: anim.time, winnerGlow: engine.lastClash?.winner === 'player', dimmed: engine.lastClash?.winner === 'opponent' });
   }
  } else if (selTrick.cards.length > 0) {
   const pTr = doesSuitTrump(selTrick.leadSuit, oppSuit); const pMods = engine.getSelectedProjectedMods();
   const proj = Math.max(1, selTrick.totalPower + (pTr ? 3 : 0) + pMods.powerBonus);
   box(ctx, 738, 206, 248, 174, 15, lg(ctx, 738, 206, 986, 380, [[0, 'rgba(14,44,50,0.92)'], [1, 'rgba(7,22,28,0.95)']]), engine.gambitActive ? '#FF7D59' : pTr ? '#FFE066' : pInfo.bright, 2.3);
   if (pSuit) drawSuitEmblem(ctx, pSuit, 794, 266, 30);
   txt(ctx, String(proj), 838, 262, `900 50px ${SF}`, '#FFF4CC', 'left');
   txt(ctx, 'PROJECTED PWR', 840, 294, `700 11px ${UI}`, '#D8C7A0', 'left');
   const pts = [];
   if (selTrick.comboBonus > 0) pts.push(`COMBO +${selTrick.comboBonus}`);
   if (selTrick.gildBonus > 0) pts.push(`FOIL +${selTrick.gildBonus}`);
   if (pTr) pts.push(`TRUMP +${3 + (engine.playerRelics.includes('cinder_lens') ? 3 : 0)}`);
   if (selTrick.ward > 0) pts.push(`WARD +${selTrick.ward}`);
   txt(ctx, pts.slice(0, 3).join(' · ') || 'READY TO CLASH', 862, 332, `800 11.5px ${UI}`, pTr || engine.gambitActive ? '#FFE066' : '#E8D9B8');
   txt(ctx, `COST ${selTrick.totalCost} / ${engine.playerLanterns} LANTERNS`, 862, 358, `800 12px ${UI}`, '#F6D26E');
  } else {
   ctx.save();ctx.setLineDash([8, 6]); box(ctx, 740, 208, 244, 170, 15, 'rgba(8,24,30,0.46)', 'rgba(236,198,108,0.48)', 1.8); ctx.restore();
   txt(ctx, 'CLICK OR DRAG CARDS', 862, 280, `800 14.5px ${UI}`, 'rgba(246,226,176,0.85)');
   txt(ctx, 'Pair · Harmony · Chain · Prism', 862, 308, `600 12.5px ${UI}`, 'rgba(218,200,156,0.72)');
  }
 }
 drawCenterVsMedallion(ctx, engine, anim, selTrick, tele, isClash) {
  ctx.save();
  if (engine.gambitActive) {
   drawGambitWaxSeal(ctx, CENTER_X, 184, 38, anim.time, engine.gambitBy ?? 'player');
   box(ctx, CENTER_X - 76, 378, 152, 24, 12, 'rgba(156,28,22,0.95)', '#FFE47A', 1.7);
   txt(ctx, '×2 STAKES · +5 DMG', CENTER_X, 390.5, `900 10.5px ${UI}`, '#FFF6CC');
  }
  const cy = engine.gambitActive ? 302 : CLASH_Y;
  let ring = engine.gambitActive ? '#FF8052' : '#E6C066';
  if (isClash) ring = engine.lastClash.winner === 'player' ? '#FFE26A' : engine.lastClash.winner === 'opponent' ? '#FF5E52' : '#9CC7E8';
  else if (selTrick.leadSuit && tele && doesSuitTrump(selTrick.leadSuit, tele.leadSuit)) ring = '#FFE066';
  dot(ctx, CENTER_X, cy, 50, rg(ctx, CENTER_X, cy - 12, 6, CENTER_X, cy, 50, [[0, engine.gambitActive ? '#5E2018' : '#3E2B16'], [1, '#140E09']]), ring, 3.4);
  if (isClash) {
   const c = engine.lastClash;
   txt(ctx, `${c.oppPower} : ${c.playerPower}`, CENTER_X, cy - 10, `900 24px ${SF}`, '#FFF7D8');
   txt(ctx, c.winner === 'player' ? `WIN -${c.damageToOpp}` : c.winner === 'opponent' ? `HIT -${c.damageToPlayer}` : 'TIE', CENTER_X, cy + 16, `900 12.5px ${UI}`, c.winner === 'player' ? '#6BF09E' : c.winner === 'opponent' ? '#FF7568' : '#BCE0FF');
  } else if (selTrick.cards.length > 0 && tele) {
   const tr = doesSuitTrump(selTrick.leadSuit, tele.leadSuit);
   txt(ctx, tr ? 'TRUMP!' : 'VS', CENTER_X, cy - 8, `900 21px ${SF}`, tr ? '#FFE066' : '#F6DC94');
   txt(ctx, tr ? `+${3 + (engine.playerRelics.includes('cinder_lens') ? 3 : 0)} POWER` : `${tele.powerText} vs ${selTrick.totalPower}`, CENTER_X, cy + 16, `800 11.5px ${UI}`, '#DED0AE');
  } else {
   txt(ctx, 'VS', CENTER_X, cy - 5, `900 26px ${SF}`, '#F4D17A');
   txt(ctx, `RND ${engine.round}`, CENTER_X, cy + 19, `800 10.5px ${UI}`, '#C4B18C');
  }
  ctx.restore();
 }
 drawPlayerHand(ctx, engine, anim, uiState) {
  const sel = new Set(engine.selectedIds); const remL = engine.playerLanterns - engine.getSelectedTrick().totalCost;
  if (engine.phase === PHASES.SELECT && engine.selectedIds.length >= 2) {
   const pts = [];
   for (const c of engine.playerHand) if (sel.has(c.uid)) { const sc = anim.cards.get(c.uid); if (sc) pts.push({ x: sc.x, y: sc.y - 78 }); }
   if (pts.length >= 2) {
    ctx.save();ctx.strokeStyle='#FFE066'; ctx.shadowColor='#FFD459'; ctx.shadowBlur=14; ctx.lineWidth=3.2;
    ctx.beginPath();ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) ctx.quadraticCurveTo((pts[i - 1].x + pts[i].x) / 2, Math.min(pts[i - 1].y, pts[i].y) - 24, pts[i].x, pts[i].y);
    ctx.stroke();for (const pt of pts) dot(ctx, pt.x, pt.y, 5, '#FFF7D1'); ctx.restore();
   }
  }
  const order = engine.playerHand.map((card, index) => ({ card, index }));
  order.sort((a, b) => { const z = (u) => (u === uiState.draggingUid ? 3 : u === uiState.hoveredUid ? 2 : sel.has(u) ? 1 : 0); return z(a.card.uid) - z(b.card.uid) || a.index - b.index; });
  const slots = computePlayerHandSlots(engine.playerHand.length);
  const cw = slots[0]?.w ?? HAND_CARD_W; const ch = slots[0]?.h ?? HAND_CARD_H;
  for (const { card, index } of order) {
   const sc = anim.cards.get(card.uid); if (!sc) continue;
   const isSel = sel.has(card.uid); const isHov = uiState.hoveredUid === card.uid && engine.phase === PHASES.SELECT;
   const cant = engine.phase === PHASES.SELECT && !isSel && (card.cost > remL || engine.selectedIds.length >= 3);
   drawCard(ctx, card, sc.x, sc.y, cw, ch, { rot: sc.rot, scale: sc.scale, flip: sc.flip, selected: isSel, hovered: isHov, dimmed: cant, time: anim.time });
   if (engine.phase === PHASES.SELECT && card.uid !== uiState.draggingUid) {
    const ky = Math.min(686, sc.y + ch / 2 + 10);
    box(ctx, sc.x - 13, ky - 8.5, 26, 17, 5, isSel ? '#FFD459' : 'rgba(16,14,12,0.86)', isSel ? '#FFF4C2' : 'rgba(232,192,102,0.6)', 1);
    txt(ctx, String(index + 1), sc.x, ky + 0.5, `800 11px ${UI}`, isSel ? '#1E1308' : '#EBD6A6');
   }
  }
 }
 drawVictoryTableShowcase(ctx, engine, anim) {
  const cards = engine.playerPlayedCards.length > 0 ? engine.playerPlayedCards : engine.playerHand.slice(0, 3);
  const sx = CENTER_X - ((cards.length - 1) * 152) / 2;
  for (let i = 0; i < cards.length; i += 1) {
   const n = cards.length === 1 ? 0 : (i / (cards.length - 1)) * 2 - 1;
   drawCard(ctx, cards[i], sx + i * 152, 306 + Math.abs(n) * 5 + Math.sin(anim.time * 2.6 + i) * 2.5, 118, 168, { rot: n * 0.055, scale: 1, flip: 1, winnerGlow: true, time: anim.time });
  }
  const c = engine.lastClash;
  box(ctx, CENTER_X - 285, 400, 570, 28, 14, lg(ctx, CENTER_X - 285, 412, CENTER_X + 285, 412, [[0, 'rgba(92,60,10,0.92)'], [0.5, 'rgba(182,126,24,0.96)'], [1, 'rgba(92,60,10,0.92)']]), '#FFE485', 1.6);
  txt(ctx, c ? `★ FINISHER: ${c.playerTrick.comboName} (${c.playerPower} PWR) · DEALT ${c.damageToOpp} FINAL DMG ★` : '★ WINNING FINISHER ★', CENTER_X, 414.5, `900 12.5px ${UI}`, '#FFFDF0');
 }
 drawDefeatTableShowcase(ctx, engine, anim) {
  const oc = engine.oppCommittedCards; const pc = engine.playerPlayedCards; const c = engine.lastClash;
  box(ctx, CENTER_X - 295, 386, 590, 32, 16, 'rgba(42,16,22,0.94)', '#E4645C', 1.8);
  txt(ctx, c ? `LETHAL COUNTER: ${engine.rival.name.toUpperCase()}'S ${c.oppTrick.comboName} (${c.oppPower}) vs YOURS (${c.playerPower})` : 'DECISIVE FINAL CLASH', CENTER_X, 402.5, `900 13.5px ${UI}`, '#FFE2DD');
  const drawSide = (cards, center, opts) => {
   const d = cards.length >= 3 ? { w: 112, h: 160, s: 122 } : { w: 122, h: 174, s: 136 };
   const st = center - ((Math.max(1, cards.length) - 1) * d.s) / 2;
   for (let i = 0; i < cards.length; i += 1) drawCard(ctx, cards[i], st + i * d.s, 532, d.w, d.h, { rot: (i - (cards.length - 1) / 2) * 0.036, scale: 1, flip: 1, time: anim.time, ...opts });
  };
  drawSide(oc, 414, { winnerGlow: true });
  dot(ctx, CENTER_X, 532, 42, '#2A1014', '#FF665A', 3);
  txt(ctx, c ? `-${c.damageToPlayer}` : 'KO', CENTER_X, 524, `900 22px ${SF}`, '#FF9C94');
  txt(ctx, c?.gambitActive ? 'GAMBIT KO' : 'LETHAL', CENTER_X, 548, `800 10px ${UI}`, '#E6BAB6');
  drawSide(pc, 866, { dimmed: true });
  box(ctx, CENTER_X - 280, 646, 560, 28, 14, 'rgba(15,20,34,0.92)', 'rgba(184,198,224,0.48)', 1.2);
  txt(ctx, c?.oppTrumps ? `TIP: ${SUITS[c.oppTrick.leadSuit].name} trumped ${SUITS[c.playerTrick.leadSuit]?.name ?? 'your suit'} (+3) — watch Rival Tell & Suits!` : `TIP: Counter ${engine.rival.name}'s ${engine.rival.relicName} — Fold ×2 with [C] Kindle!`, CENTER_X, 660.5, `700 11.8px ${UI}`, '#D2DCEB');
 }
 drawParticles(ctx, anim) {
  for (const p of anim.particles) {
   ctx.save();ctx.globalAlpha=Math.max(0, Math.min(1, p.life / 0.65));
   ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color; ctx.beginPath();
   if (p.shape === 'diamond') { ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.72, 0); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * 0.72, 0); ctx.closePath();}
   else ctx.arc(0, 0, p.size * 0.65, 0, Math.PI*2);
   ctx.fill();ctx.restore();
  }
 }
 drawCallouts(ctx, anim) {
  ctx.save();
  for (const c of anim.callouts) {
   ctx.globalAlpha=Math.min(1, c.life / 0.45); ctx.font = `900 ${c.size}px ${SF}`;
   ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth=6; ctx.strokeStyle='rgba(12,8,6,0.94)';
   ctx.strokeText(c.text, c.x, c.y); ctx.fillStyle=c.color; ctx.fillText(c.text, c.x, c.y);
  }
  ctx.restore();
 }
}
