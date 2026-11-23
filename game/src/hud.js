// Airy corner parlor HUD medallions, 5-Rival Circuit gems, Relic & Gilded Forge Draft, and brass controls.
import { createTitleShowcaseCards, doesSuitTrump } from './cards.js';
import { COMBO_CATALOG } from './combos.js';
import { RIVALS } from './ai.js';
import { PHASES, MAX_ROUNDS } from './rules.js';
import { getRelicById, drawRelicIcon } from './relics.js';
import { drawCard, drawSuitEmblem, drawLanternIcon, drawHeartIcon, drawShieldIcon, drawSpeakerIcon, roundedRectPath } from './card-art.js';
import { drawRivalPortrait, drawParlorCandle, drawLanternCoin, drawTrophySeal } from './portraits.js';
import { STAGE_W, STAGE_H, CENTER_X } from './renderer.js';
const SHOWCASE_CARDS = createTitleShowcaseCards();
const UI = 'system-ui, -apple-system, sans-serif'; const SF = 'Georgia, serif';
const lg = (ctx, x0, y0, x1, y1, s) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of s) g.addColorStop(o, c); return g; };
function label(ctx, t, x, y, f, c, a = 'center') { ctx.fillStyle = c; ctx.font = f; ctx.textAlign = a; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
function box(ctx, x, y, w, h, r, fill, stroke, lw = 1.2) { roundedRectPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
function hpBar(ctx, x, y, w, h, ratio, bg, c0, c1) {
 box(ctx, x, y, w, h, 5, bg, null);
 const pct = Math.max(0, Math.min(1, ratio));
 if (pct > 0) box(ctx, x, y, Math.max(8, w * pct), h, 5, lg(ctx, x, y, x + w, y, [[0, c0], [1, c1]]), null);
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
  if (engine.phase === PHASES.TITLE) this.drawTitleScreen(ctx, engine, anim, sound, uiState);
  else if (engine.phase === PHASES.SELECT || engine.phase === PHASES.CLASH) {
   this.drawTopRivalPlate(ctx, engine);
   this.drawTopRightStrip(ctx, engine, sound, uiState);
   this.drawBottomChallengerPlate(ctx, engine);
   this.drawBottomRightConsole(ctx, engine, uiState);
  } else {
   this.drawTopRivalPlate(ctx, engine);
   this.drawEndCornerChallenger(ctx, engine, sound, uiState);
   if (engine.phase === PHASES.VICTORY) this.drawVictoryAndDraft(ctx, engine, anim, uiState);
   else this.drawDefeatBanner(ctx, engine, anim, uiState);
  }
  if (engine.rulesOpen) this.drawRulesModal(ctx, uiState);
 }
 drawPanelBox(ctx, x, y, w, h, border = 'rgba(232,192,102,0.65)', top = 'rgba(18,16,18,0.9)', bot = 'rgba(9,13,18,0.95)') {
  box(ctx, x, y, w, h, 14, lg(ctx, x, y, x, y + h, [[0, top], [1, bot]]), border, 1.8);
 }
 drawButton(ctx, id, x, y, w, h, text, style = {}, data = null, hoveredId = null) {
  const hov = hoveredId === id; const dis = !!style.disabled; const pri = !!style.primary; const crim = !!style.crimson;
  if (!dis) this.registerButton(id, x, y, w, h, data);
  ctx.save();
  let fill = 'rgba(38,34,30,0.72)'; let stroke = 'rgba(132,114,84,0.45)';
  if (!dis) {
   fill = crim ? lg(ctx, x, y, x, y + h, [[0, hov ? '#E44E46' : '#C2342C'], [1, hov ? '#A0241E' : '#7D1915']])
    : pri ? lg(ctx, x, y, x, y + h, [[0, hov ? '#FFE888' : '#F6CA58'], [1, hov ? '#DC9F24' : '#B87C12']])
    : lg(ctx, x, y, x, y + h, [[0, hov ? 'rgba(64,48,32,0.96)' : 'rgba(34,27,22,0.92)'], [1, hov ? 'rgba(38,28,18,0.96)' : 'rgba(18,16,16,0.95)']]);
   stroke = crim ? (hov ? '#FFE994' : '#F6C08A') : pri ? (hov ? '#FFFCE0' : '#FFE48A') : (hov ? '#FFE07A' : 'rgba(232,192,102,0.65)');
   if (hov) { ctx.shadowColor = pri ? 'rgba(255,216,89,0.58)' : 'rgba(255,212,89,0.34)'; ctx.shadowBlur = 14; }
  }
  box(ctx, x, y, w, h, style.radius ?? 10, fill, stroke, pri || crim ? 2.2 : 1.5);
  ctx.shadowBlur = 0;
  if (text) label(ctx, text, x + w / 2, y + h / 2 + 0.5, `900 ${style.fontSize ?? 14}px ${UI}`, dis ? '#8E816E' : pri ? '#1E1205' : '#FFF4DC');
  ctx.restore();
 }
 drawTopRivalPlate(ctx, engine) {
  const x = 34; const y = 28; const w = 290; const h = 76; const dead = engine.oppHp <= 0;
  this.drawPanelBox(ctx, x, y, w, h, dead ? '#8C4440' : engine.rival.accent);
  drawRivalPortrait(ctx, engine.rival.id, x + 36, y + 38, 25);
  label(ctx, `${engine.rival.name.toUpperCase()} · ${engine.rival.difficulty.split(' ')[0]}`, x + 72, y + 20, `900 15px ${SF}`, '#FFF5DC', 'left');
  label(ctx, `${engine.rival.relicName}: ${engine.rival.relicDesc}`, x + 72, y + 36, `700 9.5px ${UI}`, '#FFE296', 'left');
  drawHeartIcon(ctx, x + 80, y + 57, 8.5, dead ? '#C84842' : '#FF6B5C');
  label(ctx, `${engine.oppHp}/${engine.oppMaxHp}`, x + 94, y + 57.5, `900 17px ${SF}`, dead ? '#FF7066' : '#FF8A7A', 'left');
  hpBar(ctx, x + 154, y + 52, 92, 10, engine.oppHp / engine.oppMaxHp, '#2A1415', '#D93B32', '#FF7A59');
  if (engine.oppWard > 0) { drawShieldIcon(ctx, x + w - 34, y + 56, 6.8, '#FFD459'); label(ctx, String(engine.oppWard), x + w - 14, y + 57, `900 12px ${UI}`, '#FFD459', 'right'); }
  else { drawLanternIcon(ctx, x + w - 34, y + 56, 6, true); label(ctx, String(engine.oppLanterns), x + w - 14, y + 57, `900 12px ${UI}`, '#F2D27C', 'right'); }
  label(ctx, `PTS ${engine.oppScore}`, x + w - 14, y + 20, `800 10.5px ${UI}`, '#D8CBA8', 'right');
 }
 drawTopRightStrip(ctx, engine, sound, uiState) { const hovId = uiState.hoveredButtonId;
  const x = 956; const y = 28; const w = 290; const h = 76;
  this.drawPanelBox(ctx, x, y, w, h, 'rgba(232,192,102,0.62)');
  label(ctx, `ROUND ${engine.round}/${MAX_ROUNDS}`, x + 14, y + 20, `900 14px ${SF}`, '#FFE496', 'left');
  label(ctx, `RIVAL ${engine.rivalIndex + 1} OF ${RIVALS.length}`, x + 14, y + 37, `700 9.8px ${UI}`, '#D5C6A8', 'left');
  this.drawButton(ctx, 'btn-mute', x + 188, y + 10, 28, 28, '', { radius: 7 }, null, hovId);
  drawSpeakerIcon(ctx, x + 202, y + 24, 8, sound.muted);
  this.drawButton(ctx, 'btn-rules', x + 220, y + 10, 26, 28, '?', { fontSize: 13.5, radius: 7 }, null, hovId);
  this.drawButton(ctx, 'btn-reset', x + 250, y + 10, 26, 28, '↺', { fontSize: 14.5, radius: 7 }, null, hovId);
  for (let i = 0; i < RIVALS.length; i += 1) {
   const px = x + 22 + i * 26; const py = y + 59;
   if (i > 0) { ctx.strokeStyle = i <= engine.rivalIndex ? '#E6BE62' : 'rgba(227,188,100,0.28)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - 19, py); ctx.lineTo(px - 7, py); ctx.stroke(); }
   ctx.beginPath(); ctx.arc(px, py, i === engine.rivalIndex ? 6 : 4.6, 0, Math.PI * 2);
   ctx.fillStyle = i < engine.rivalIndex ? '#52E090' : i === engine.rivalIndex ? '#FFE066' : '#241E1A'; ctx.fill();
   ctx.lineWidth = 1.3; ctx.strokeStyle = i <= engine.rivalIndex ? '#FFF6CE' : '#7D6D52'; ctx.stroke();
  }
  const gems = engine.chronicle.slice(0, 4).reverse();
  for (let i = 0; i < gems.length; i += 1) {
   const e = gems[i]; const gx = x + 158 + i * 30; const gy = y + 50;
   const col = e.winner === 'player' ? '#248E54' : e.winner === 'opponent' ? '#B8342E' : '#856B34';
   const brd = e.gambit ? '#FFE478' : e.winner === 'player' ? '#6BF09E' : e.winner === 'opponent' ? '#FF8072' : '#E6CA7A';
   box(ctx, gx, gy, 26, 19, 5, col, brd, e.gambit ? 1.6 : 1.1);
   label(ctx, e.gambit ? '×2' : e.winner === 'player' ? 'W' : e.winner === 'opponent' ? 'L' : 'K', gx + 13, gy + 10, `900 10px ${UI}`, '#FFF8E4');
  }
 }
 drawEndCornerChallenger(ctx, engine, sound, uiState) { const hovId = uiState.hoveredButtonId;
  const x = 956; const y = 28; const w = 290; const h = 76; const pDead = engine.playerHp <= 0;
  this.drawPanelBox(ctx, x, y, w, h, pDead ? '#A34844' : '#E8C266');
  label(ctx, 'YOU · CHALLENGER', x + 14, y + 19, `900 11px ${UI}`, '#FFE499', 'left');
  this.drawButton(ctx, 'btn-mute', x + 220, y + 8, 26, 26, '', { radius: 6 }, null, hovId);
  drawSpeakerIcon(ctx, x + 233, y + 21, 7.6, sound.muted);
  this.drawButton(ctx, 'btn-rules', x + 250, y + 8, 26, 26, '?', { fontSize: 13, radius: 6 }, null, hovId);
  drawHeartIcon(ctx, x + 22, y + 48, 8.5, pDead ? '#C84842' : '#4CE28D');
  label(ctx, `${engine.playerHp}/${engine.playerMaxHp}`, x + 36, y + 49, `900 17px ${SF}`, pDead ? '#FF7066' : '#57E897', 'left');
  label(ctx, `SCORE ${engine.playerScore}`, x + 108, y + 49, `900 13.5px ${SF}`, '#FFE490', 'left');
  const shown = engine.playerRelics.slice(0, 3);
  for (let i = 0; i < shown.length; i += 1) drawRelicIcon(ctx, shown[i], x + w - 20 - i * 24, y + 52, 9.5);
 }
 drawBottomChallengerPlate(ctx, engine) {
  const x = 34; const y = 506; const w = 250; const h = 180; const pDead = engine.playerHp <= 0;
  this.drawPanelBox(ctx, x, y, w, h, pDead ? '#A34844' : '#E8C266');
  label(ctx, 'YOU · CHALLENGER', x + 14, y + 19, `900 11px ${UI}`, '#FFE499', 'left');
  label(ctx, `SCORE ${engine.playerScore}`, x + w - 14, y + 19, `900 13.5px ${SF}`, '#FFF3CC', 'right');
  box(ctx, x + 10, y + 33, w - 20, 32, 8, 'rgba(255,212,89,0.1)', 'rgba(240,198,104,0.42)', 1);
  const shown = engine.playerRelics.slice(0, 3);
  if (shown.length > 0) {
   const step = shown.length <= 2 ? 78 : 34;
   for (let i = 0; i < shown.length; i += 1) {
    const rel = getRelicById(shown[i]); const rx = x + 26 + i * step;
    drawRelicIcon(ctx, shown[i], rx, y + 49, 10.5);
    if (shown.length <= 2 && rel) label(ctx, rel.name.split(' ')[0], rx + 15, y + 49.5, `800 9px ${UI}`, '#FFE9A3', 'left');
   }
   const fc = Object.keys(engine.gildedCards).length;
   if (fc > 0) label(ctx, `✦${fc} FOIL`, x + w - 16, y + 49.5, `900 9.5px ${UI}`, '#FFE87A', 'right');
  } else label(ctx, 'WIN TO DRAFT RELICS & FORGE FOILS', x + w / 2, y + 49.5, `700 9.2px ${UI}`, '#C7BA9B');
  drawHeartIcon(ctx, x + 26, y + 90, 11, pDead ? '#C84842' : '#4CE28D');
  const pStr = String(engine.playerHp);
  label(ctx, pStr, x + 44, y + 91, `900 30px ${SF}`, pDead ? '#FF6B60' : '#57E897', 'left');
  label(ctx, `/${engine.playerMaxHp}`, x + 48 + ctx.measureText(pStr).width, y + 95, `700 14px ${UI}`, '#C8B89A', 'left');
  if (engine.playerWard > 0) { drawShieldIcon(ctx, x + w - 42, y + 90, 8.5, '#FFD459'); label(ctx, String(engine.playerWard), x + w - 16, y + 91, `900 15px ${UI}`, '#FFD459', 'right'); }
  hpBar(ctx, x + 14, y + 112, w - 28, 10, engine.playerHp / engine.playerMaxHp, '#0D221C', '#1FA35E', '#66F09F');
  label(ctx, 'LANTERNS', x + 14, y + 137, `800 11px ${UI}`, '#F5CF6B', 'left');
  label(ctx, `${engine.playerLanterns} / ${engine.playerMaxLanterns}`, x + w - 14, y + 137, `900 13.5px ${UI}`, '#FFE485', 'right');
  const maxC = Math.max(engine.playerMaxLanterns, 6);
  const cStep = Math.min(28, (w - 40) / Math.max(1, maxC - 1));
  for (let i = 0; i < maxC; i += 1) drawLanternCoin(ctx, x + 22 + i * cStep, y + 160, 8.5, i < engine.playerLanterns);
 }
 drawBottomRightConsole(ctx, engine, uiState) { const hovId = uiState.hoveredButtonId;
  const x = 996; const y = 506; const w = 250; const h = 180;
  const isClash = engine.phase === PHASES.CLASH; const trick = engine.getSelectedTrick(); const canPlay = engine.canPlaySelected();
  this.drawPanelBox(ctx, x, y, w, h, engine.gambitActive ? '#FF8052' : canPlay ? '#FFE06E' : 'rgba(232,192,102,0.58)');
  box(ctx, x + 10, y + 10, w - 20, 34, 8, 'rgba(9,18,22,0.88)', engine.gambitActive ? '#FF8658' : 'rgba(232,192,102,0.38)', 1.2);
  if (isClash && engine.lastClash) {
   const c = engine.lastClash;
   const col = c.winner === 'player' ? '#72F2A5' : c.winner === 'opponent' ? '#FF877A' : '#FFE38A';
   label(ctx, c.winner === 'player' ? `${c.gambitActive ? 'GAMBIT ×2 WON' : 'TRICK WON'} (-${c.damageToOpp} HP)` : c.winner === 'opponent' ? `RIVAL WINS (-${c.damageToPlayer} HP)` : 'CLASH TIE · +1✦', x + w / 2, y + 27.5, `900 12px ${UI}`, col);
  } else if (uiState.toastMessage && uiState.toastTimer > 0) {
   label(ctx, `! ${uiState.toastMessage.slice(0, 30)}`, x + w / 2, y + 27.5, `800 11px ${UI}`, '#FF9C84');
  } else if (trick.cards.length > 0) {
   const tr = doesSuitTrump(trick.leadSuit, engine.oppTelegraph?.leadSuit);
   const eff = trick.totalPower + (tr ? 3 : 0) + engine.getSelectedProjectedMods().powerBonus;
   if (trick.leadSuit) drawSuitEmblem(ctx, trick.leadSuit, x + 26, y + 27, 8.5);
   label(ctx, `${trick.comboShort} · ${eff} PWR · ${trick.totalCost}✦`, x + 42, y + 27.5, `900 11.8px ${UI}`, '#FFF4D4', 'left');
  } else label(ctx, 'PICK 1–3 CARDS OR RAISE ×2', x + w / 2, y + 27.5, `700 11px ${UI}`, '#D8C8A6');
  if (isClash) {
   this.drawButton(ctx, 'btn-continue', x + 12, y + 54, w - 24, 52, 'NEXT ROUND  ▸', { primary: true, fontSize: 16, radius: 11 }, null, hovId);
   box(ctx, x + 12, y + 116, w - 24, 38, 9, engine.gambitActive ? 'rgba(156,28,22,0.52)' : 'rgba(20,34,38,0.72)', engine.gambitActive ? '#FFE072' : 'rgba(232,192,102,0.34)', 1.2);
   label(ctx, engine.gambitActive ? '★ GAMBIT ×2 STAKES RESOLVED ★' : 'PRESS [SPACE] TO CONTINUE', x + w / 2, y + 135.5, `800 11px ${UI}`, engine.gambitActive ? '#FFF0A8' : '#D6C8A8');
   label(ctx, '[SPACE] Next · [R] Rematch · [?] Rules', x + w / 2, y + 168, `700 9.6px ${UI}`, '#B5A68A');
  } else {
   this.drawButton(ctx, 'btn-play', x + 12, y + 54, w - 24, 46, canPlay ? 'PLAY TRICK  ▸' : 'PLAY TRICK', { primary: canPlay, disabled: !canPlay, fontSize: 15, radius: 11 }, null, hovId);
   const canForge = engine.canForgeSelectedCard();
   this.drawButton(ctx, 'btn-gambit', x + 10, y + 108, 76, 44, engine.gambitActive ? '×2 ON' : '×2 [G]', { crimson: engine.gambitActive, fontSize: 11, radius: 9 }, null, hovId);
   this.drawButton(ctx, 'btn-forge', x + 90, y + 108, 74, 44, 'FOIL 2✦', { primary: false, disabled: !canForge, fontSize: 10.8, radius: 9 }, null, hovId);
   this.drawButton(ctx, 'btn-cycle', x + 168, y + 108, 72, 44, engine.gambitBy === 'rival' ? 'FOLD' : 'KINDLE', { fontSize: 10.8, radius: 9 }, null, hovId);
   label(ctx, '[1-5] Card · [G] ×2 · [F] Forge · [C] Kindle', x + w / 2, y + 168, `700 9.4px ${UI}`, '#B5A68A');
  }
 }
 drawTitleScreen(ctx, engine, anim, sound, uiState) { const hovId = uiState.hoveredButtonId;
  this.drawButton(ctx, 'btn-mute', 1140, 40, 42, 36, '', { radius: 8 }, null, hovId);
  drawSpeakerIcon(ctx, 1161, 58, 10, sound.muted);
  this.drawButton(ctx, 'btn-rules', 1190, 40, 46, 36, '?', { fontSize: 16, radius: 8 }, null, hovId);
  const pw = 920; const px = CENTER_X - pw / 2; const py = 26;
  this.drawPanelBox(ctx, px, py, pw, 314, '#ECC668', 'rgba(22,16,18,0.92)', 'rgba(9,22,28,0.94)');
  ctx.strokeStyle = 'rgba(255,222,126,0.52)'; ctx.lineWidth = 1.4;
  for (const [cx, cy, dx, dy] of [[px + 12, py + 12, 1, 1], [px + pw - 12, py + 12, -1, 1], [px + 12, py + 302, 1, -1], [px + pw - 12, py + 302, -1, -1]]) {
   ctx.beginPath(); ctx.moveTo(cx, cy + dy * 18); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * 18, cy); ctx.stroke();
  }
  drawLanternIcon(ctx, CENTER_X, py + 23, 15, true);
  ctx.strokeStyle = 'rgba(242,204,110,0.48)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(CENTER_X - 210, py + 23); ctx.lineTo(CENTER_X - 28, py + 23); ctx.moveTo(CENTER_X + 28, py + 23); ctx.lineTo(CENTER_X + 210, py + 23); ctx.stroke();
  label(ctx, 'LANTERN TRICK', CENTER_X + 3, py + 73, `900 58px ${SF}`, 'rgba(0,0,0,0.72)');
  label(ctx, 'LANTERN TRICK', CENTER_X, py + 70, `900 58px ${SF}`, lg(ctx, CENTER_X, py + 40, CENTER_X, py + 102, [[0, '#FFFAD8'], [0.5, '#F8CE5E'], [1, '#BE8016']]));
  label(ctx, 'GILDED FOLIO · 5-RIVAL CANDLELIT GAMBIT & RELIC CARD DUEL', CENTER_X, py + 106, `800 13px ${UI}`, '#ECE2C2');
  const cw = 168; const ch = 110; const gap = 10; const rowX = CENTER_X - (cw * 5 + gap * 4) / 2; const rowY = py + 124;
  for (let i = 0; i < RIVALS.length; i += 1) {
   const r = RIVALS[i]; const rx = rowX + i * (cw + gap); const sel = engine.rivalIndex === i;
   const id = `rival-${i}`; const hov = hovId === id;
   this.registerButton(id, rx, rowY, cw, ch, i);
   box(ctx, rx, rowY, cw, ch, 10, sel ? 'rgba(244,200,84,0.22)' : hov ? 'rgba(255,240,200,0.09)' : 'rgba(9,18,24,0.82)', sel ? '#FFE06E' : hov ? '#E2BD64' : 'rgba(232,192,102,0.36)', sel ? 2.4 : 1.2);
   drawRivalPortrait(ctx, r.id, rx + cw / 2, rowY + 31, 22);
   label(ctx, `${r.name} · ${r.maxHp} HP`, rx + cw / 2, rowY + 65, `900 13px ${SF}`, sel ? '#FFF8DF' : '#ECE0C2');
   label(ctx, r.difficulty.toUpperCase(), rx + cw / 2, rowY + 81, `800 9.5px ${UI}`, r.accent);
   label(ctx, r.relicName, rx + cw / 2, rowY + 96, `700 9.5px ${UI}`, '#E0CF9F');
  }
  this.drawButton(ctx, 'btn-start', CENTER_X - 202, py + 248, 250, 50, 'DEAL RUN  ▸', { primary: true, fontSize: 18, radius: 12 }, null, hovId);
  this.drawButton(ctx, 'btn-rules-title', CENTER_X + 64, py + 248, 138, 50, 'RULES  [?]', { fontSize: 14, radius: 12 }, null, hovId);
  const hg = ctx.createRadialGradient(CENTER_X, 502, 24, CENTER_X, 502, 410);
  hg.addColorStop(0, 'rgba(255,216,112,0.32)'); hg.addColorStop(1, 'rgba(255,180,72,0)');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(CENTER_X, 502, 440, 136, 0, 0, Math.PI * 2); ctx.fill();
  const fs = CENTER_X - (188 * 3) / 2;
  for (let i = 0; i < SHOWCASE_CARDS.length; i += 1) {
   const n = (i / 3) * 2 - 1;
   drawCard(ctx, SHOWCASE_CARDS[i], fs + i * 188, 496 + n * n * 14 + Math.sin(anim.time * 2.1 + i * 1.1) * 3, 148, 212, { rot: n * 0.068, scale: 1, flip: 1, selected: i === 3, time: anim.time });
  }
  box(ctx, CENTER_X - 440, 650, 880, 32, 16, 'rgba(11,16,22,0.92)', 'rgba(232,192,102,0.56)', 1.4);
  label(ctx, '5-RIVAL CIRCUIT · GILDED FOIL FORGING · GAMBIT ×2 STAKES · EMBER > BRAMBLE > TIDE > EMBER · BRASS WARDS', CENTER_X, 666.5, `800 11.8px ${UI}`, '#F6E4B4');
 }
 drawEndHeader(ctx, title, sub, anim, bw, bh, border, top, bot, snuffed, gradStops, trophy) {
  const bx = CENTER_X - bw / 2; const by = 28;
  this.drawPanelBox(ctx, bx, by, bw, bh, border, top, bot);
  drawParlorCandle(ctx, bx + 55, by + (snuffed ? 90 : 72), snuffed ? 0.9 : 0.84, anim.time, snuffed);
  drawParlorCandle(ctx, bx + bw - 55, by + (snuffed ? 90 : 72), snuffed ? 0.9 : 0.84, anim.time + 1.1, snuffed);
  if (trophy) drawTrophySeal(ctx, CENTER_X, by + 26, 16); else drawLanternIcon(ctx, CENTER_X, by + 26, 14, false);
  const sz = snuffed ? 52 : 46; const ty = by + (snuffed ? 74 : 68);
  label(ctx, title, CENTER_X + 2.5, ty + 2, `900 ${sz}px ${SF}`, 'rgba(0,0,0,0.68)');
  label(ctx, title, CENTER_X, ty, `900 ${sz}px ${SF}`, lg(ctx, CENTER_X, ty - 26, CENTER_X, ty + 28, gradStops));
  label(ctx, sub, CENTER_X, by + (snuffed ? 114 : 104), `800 12.8px ${UI}`, snuffed ? '#DFD6E4' : '#F4E4BE');
  return { bx, by };
 }
 drawVictoryAndDraft(ctx, engine, anim, uiState) { const hovId = uiState.hoveredButtonId;
  const bw = 604;
  const { bx, by } = this.drawEndHeader(ctx, 'VICTORY!', `${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} DEFEATED · ROUND ${engine.round}`, anim, bw, 172, '#FFE06E', 'rgba(32,23,12,0.95)', 'rgba(12,28,32,0.96)', false, [[0, '#FFFAD8'], [0.5, '#FFDA5C'], [1, '#C98614']], true);
  box(ctx, bx + 26, by + 120, bw - 52, 40, 10, 'rgba(9,18,22,0.86)', 'rgba(240,202,110,0.52)', 1.3);
  label(ctx, `LIFE ${engine.playerHp}/${engine.playerMaxHp}`, bx + 116, by + 140.5, `900 15.5px ${SF}`, '#6BF09E');
  label(ctx, `GLORY ${engine.playerScore}`, CENTER_X, by + 140.5, `900 16.5px ${SF}`, '#FFE06E');
  label(ctx, `GAMBITS ${engine.matchStats.gambitsWon} · TRUMPS ${engine.matchStats.trumpsLanded}`, bx + bw - 126, by + 140.5, `800 12.5px ${UI}`, '#74CAFF');
  const nextRival = RIVALS[(engine.rivalIndex + 1) % RIVALS.length];
  label(ctx, `✦ CHOOSE SPOIL & FORGE A GILDED FOIL CARD → NEXT RIVAL: ${nextRival.name.toUpperCase()} ✦`, CENTER_X, 448, `900 14px ${UI}`, '#FFE89E');
  const choices = engine.draftChoices.slice(0, 3);
  const rw = 266; const rh = 180; const rgap = 24;
  const rx0 = CENTER_X - (rw * choices.length + rgap * Math.max(0, choices.length - 1)) / 2;
  for (let i = 0; i < choices.length; i += 1) {
   const rel = choices[i]; const rx = rx0 + i * (rw + rgap); const ry = 468;
   const btnId = `relic-${rel.id}`; const hov = hovId === btnId;
   this.registerButton(btnId, rx, ry, rw, rh, rel.id);
   box(ctx, rx, ry, rw, rh, 13, lg(ctx, rx, ry, rx, ry + rh, [[0, hov ? 'rgba(56,40,18,0.96)' : 'rgba(24,20,18,0.95)'], [1, hov ? 'rgba(18,38,40,0.96)' : 'rgba(10,22,28,0.96)']]), hov ? '#FFF2A2' : rel.color, hov ? 2.5 : 1.9);
   drawRelicIcon(ctx, rel.id, rx + rw / 2, ry + 36, 22);
   label(ctx, rel.name, rx + rw / 2, ry + 73, `900 15px ${SF}`, '#FFF7DC');
   label(ctx, rel.short.toUpperCase(), rx + rw / 2, ry + 93, `800 11px ${UI}`, rel.color);
   box(ctx, rx + 18, ry + 106, rw - 36, 22, 6, 'rgba(255,214,88,0.16)', 'rgba(255,224,114,0.55)', 1);
   label(ctx, rel.forgeTag, rx + rw / 2, ry + 117.5, `800 10px ${UI}`, '#FFF0A0');
   box(ctx, rx + 26, ry + 138, rw - 52, 30, 8, hov ? '#FFE274' : '#DFA934', '#FFF4B8', 1.3);
   label(ctx, `CLAIM & FORGE [${i + 1}]`, rx + rw / 2, ry + 153.5, `900 12px ${UI}`, '#1C1105');
  }
  this.drawButton(ctx, 'btn-rematch', CENTER_X - 140, 658, 130, 26, 'REMATCH [R]', { fontSize: 11, radius: 6 }, null, hovId);
  this.drawButton(ctx, 'btn-title', CENTER_X + 10, 658, 130, 26, 'TITLE SCREEN', { fontSize: 11, radius: 6 }, null, hovId);
 }
 drawDefeatBanner(ctx, engine, anim, uiState) { const hovId = uiState.hoveredButtonId;
  const { by } = this.drawEndHeader(ctx, 'DEFEAT', `OUTPLAYED BY ${engine.rival.name.toUpperCase()} ${engine.rival.title.toUpperCase()} · ROUND ${engine.round}`, anim, 604, 336, '#E05C54', 'rgba(22,19,32,0.95)', 'rgba(11,14,24,0.96)', true, [[0, '#F8ECEC'], [0.55, '#EC968E'], [1, '#BC433E']], false);
  const c = engine.lastClash;
  const stats = [['YOUR LIFE', `${engine.playerHp} / ${engine.playerMaxHp}`, '#FF7066'], [`${engine.rival.name.toUpperCase()} LIFE`, `${engine.oppHp} / ${engine.oppMaxHp}`, '#F4CC6C'], ['COUNTERED BY', c ? c.oppTrick.comboShort : 'OUTLASTED', '#F2B4AE']];
  const sw = 176; const sx0 = CENTER_X - (sw * 3 + 28) / 2;
  for (let i = 0; i < 3; i += 1) {
   const sx = sx0 + i * (sw + 14);
   box(ctx, sx, by + 142, sw, 72, 10, 'rgba(11,14,24,0.88)', 'rgba(218,104,98,0.5)', 1.4);
   label(ctx, stats[i][0], sx + sw / 2, by + 163, `800 10.5px ${UI}`, '#BCB6CC');
   label(ctx, stats[i][1], sx + sw / 2, by + 193, `900 20px ${SF}`, stats[i][2]);
  }
  this.drawButton(ctx, 'btn-rematch', CENTER_X - 208, by + 244, 206, 54, 'REMATCH  [R]', { crimson: true, fontSize: 16, radius: 11 }, null, hovId);
  this.drawButton(ctx, 'btn-title', CENTER_X + 16, by + 244, 192, 54, 'CHANGE RIVAL', { fontSize: 14, radius: 11 }, null, hovId);
 }
 drawRulesModal(ctx, uiState) { const hovId = uiState.hoveredButtonId;
  ctx.save(); ctx.fillStyle = 'rgba(5,8,14,0.78)'; ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const mw = 810; const mh = 560; const mx = (STAGE_W - mw) / 2; const my = (STAGE_H - mh) / 2;
  this.drawPanelBox(ctx, mx, my, mw, mh, '#F2CA62', 'rgba(22,18,16,0.97)', 'rgba(9,20,26,0.98)');
  label(ctx, 'LANTERN TRICK · CODEX & COMBO SYNERGIES', STAGE_W / 2, my + 38, `900 24px ${SF}`, '#FFE27A');
  const cw = 180; const cgap = 12; const cx0 = STAGE_W / 2 - (cw * 4 + cgap * 3) / 2;
  for (let i = 0; i < COMBO_CATALOG.length; i += 1) {
   const it = COMBO_CATALOG[i]; const cx = cx0 + i * (cw + cgap);
   box(ctx, cx, my + 66, cw, 62, 9, 'rgba(255,248,226,0.06)', it.color, 1.4);
   label(ctx, `${it.name}  ${it.bonus}`, cx + cw / 2, my + 87, `900 13.5px ${SF}`, it.color);
   label(ctx, it.desc, cx + cw / 2, my + 111, `600 11.5px ${UI}`, '#DCD0B6');
  }
  const lines = [
   '1. 5-RIVAL CIRCUIT & LIVE FOIL FORGING [F] — Spend 2 spare Lanterns mid-duel to permanently Gild a card (+3 PWR / -1 Cost / +2 HP / +3 Ward), plus draft 1 of 3 Relics & Foils after every win!',
   '2. READ THE TELL & RIVAL SUITS — Inspect the Rival face-up lead, hidden Tell, Relic passive, and live Rival Suits counter.',
   '3. GAMBIT ×2 STAKES [G] — Confident you counter their Tell? Raise ×2 for +5 DMG & +220 Glory (or Fold safely with [C] Kindle!).',
   '4. ELEMENTAL TRUMPS (+3 PWR & COUNTER-BREAK) — Ember (Red Diamond) > Bramble (Green Leaf) > Tide (Blue Crescent) > Ember.',
   '5. BRASS HARMONY — Including Brass (Gold Gear) in a 2–3 card trick grants +2 Ward & +1 Lantern next round.',
   '6. CONTROLS — Click cards (1–5), drag or [Space] play, [G] Gambit ×2, [F] Forge Foil (2✦), [C] Kindle, [M] Mute, [R] Rematch.',
  ];
  for (let i = 0; i < lines.length; i += 1) label(ctx, lines[i], mx + 28, my + 164 + i * 50, `700 12.2px ${UI}`, i % 2 === 0 ? '#FFE9A8' : '#DCD2BA', 'left');
  this.drawButton(ctx, 'btn-close-rules', STAGE_W / 2 - 90, my + mh - 62, 180, 44, 'GOT IT  [ESC]', { primary: true, fontSize: 15 }, null, hovId);
  ctx.restore();
 }
}
