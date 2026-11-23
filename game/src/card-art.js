// Heirloom illustrated playing-card renderer: parchment vellum, gilt filigree, suit cartouches, and icons.
import { SUITS } from './cards.js';

export function roundedRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function lgrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

function rgrad(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

function circle(ctx, x, y, r, fill, stroke = null, lw = 1.4) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function drawSuitEmblem(ctx, suitId, cx, cy, r, options = {}) {
  const suit = SUITS[suitId] ?? SUITS.brass;
  const mono = options.monochrome ?? false;
  const fillPrimary = mono ? (options.color ?? '#FBF4E3') : suit.color;
  const strokeDeep = mono ? 'rgba(0,0,0,0.32)' : suit.deep;

  ctx.save();
  ctx.translate(cx, cy);
  if (suitId === 'ember') {
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.12);
    ctx.quadraticCurveTo(r * 0.42, -r * 0.36, r * 0.92, 0);
    ctx.quadraticCurveTo(r * 0.38, r * 0.38, 0, r * 1.08);
    ctx.quadraticCurveTo(-r * 0.38, r * 0.38, -r * 0.92, 0);
    ctx.quadraticCurveTo(-r * 0.42, -r * 0.36, 0, -r * 1.12);
    ctx.closePath();
    ctx.fillStyle = mono ? fillPrimary : lgrad(ctx, 0, -r, 0, r, [[0, '#FF5C47'], [0.55, '#C8221D'], [1, '#7A110E']]);
    ctx.fill(); ctx.lineWidth = Math.max(1.8, r * 0.105); ctx.strokeStyle = strokeDeep; ctx.stroke();
    if (!mono) {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.56); ctx.quadraticCurveTo(r * 0.28, -r * 0.06, 0, r * 0.52); ctx.quadraticCurveTo(-r * 0.28, -r * 0.06, 0, -r * 0.56);
      ctx.closePath(); ctx.fillStyle = '#FFE478'; ctx.fill();
    }
  } else if (suitId === 'tide') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.98, 0.52, Math.PI * 2 - 0.52, false);
    ctx.arc(r * 0.42, -r * 0.08, r * 0.72, Math.PI * 2 - 0.78, 0.78, true);
    ctx.closePath();
    ctx.fillStyle = mono ? fillPrimary : lgrad(ctx, -r, -r, r, r, [[0, '#3296F0'], [0.55, '#135BA3'], [1, '#092F5C']]);
    ctx.fill(); ctx.lineWidth = Math.max(1.8, r * 0.105); ctx.strokeStyle = strokeDeep; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.56, -r * 0.36); ctx.quadraticCurveTo(r * 0.96, 0.08 * r, r * 0.52, r * 0.38); ctx.quadraticCurveTo(r * 0.12, r * 0.14, r * 0.56, -r * 0.36);
    ctx.closePath(); ctx.fillStyle = mono ? fillPrimary : '#2CA2F2'; ctx.fill();
    if (!mono) { ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.strokeStyle = '#092F5C'; ctx.stroke(); }
  } else if (suitId === 'bramble') {
    ctx.fillStyle = mono ? fillPrimary : rgrad(ctx, 0, -r * 0.2, r * 0.1, 0, 0, r, [[0, '#38C872'], [0.55, '#178247'], [1, '#0B4726']]);
    ctx.strokeStyle = strokeDeep; ctx.lineWidth = Math.max(1.8, r * 0.105);
    for (const a of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
      ctx.save(); ctx.rotate(a + Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.52, -r * 0.25, -r * 0.48, -r * 0.88, 0, -r * 1.06);
      ctx.bezierCurveTo(r * 0.48, -r * 0.88, r * 0.52, -r * 0.25, 0, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, r * 0.25); ctx.lineTo(r * 0.12, r * 0.25); ctx.lineTo(r * 0.2, r * 0.96); ctx.lineTo(-r * 0.2, r * 0.96);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (!mono) circle(ctx, 0, 0, r * 0.22, '#EBFFD6');
  } else {
    const outerR = r * 1.04; const midR = r * 0.74;
    ctx.beginPath();
    for (let i = 0; i < 16; i += 1) {
      const ang = (i * Math.PI) / 8 - Math.PI / 2;
      const rad = i % 2 === 0 ? outerR : midR;
      if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = mono ? fillPrimary : rgrad(ctx, -r * 0.15, -r * 0.2, r * 0.1, 0, 0, outerR, [[0, '#FFF6BE'], [0.5, suit.bright], [0.88, fillPrimary], [1, strokeDeep]]);
    ctx.fill(); ctx.lineWidth = Math.max(1.5, r * 0.085); ctx.strokeStyle = strokeDeep; ctx.stroke();
    if (!mono) { circle(ctx, 0, 0, r * 0.42, '#4E3006'); circle(ctx, 0, 0, r * 0.23, '#FFEE9A'); }
  }
  ctx.restore();
}

export function drawLanternIcon(ctx, cx, cy, s, lit = true) {
  ctx.save(); ctx.translate(cx, cy);
  if (lit) circle(ctx, 0, 0, s * 1.5, rgrad(ctx, 0, 0, s * 0.1, 0, 0, s * 1.5, [[0, 'rgba(255,224,115,0.7)'], [1, 'rgba(255,168,40,0)']]));
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.92); ctx.lineTo(s * 0.62, -s * 0.35); ctx.lineTo(s * 0.48, s * 0.58);
  ctx.lineTo(0, s * 0.9); ctx.lineTo(-s * 0.48, s * 0.58); ctx.lineTo(-s * 0.62, -s * 0.35); ctx.closePath();
  ctx.fillStyle = lit ? '#FFD75E' : '#3C3530'; ctx.fill();
  ctx.lineWidth = Math.max(1.2, s * 0.14); ctx.strokeStyle = lit ? '#7B4F08' : '#1E1A17'; ctx.stroke();
  if (lit) {
    ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(s * 0.24, 0.04 * s); ctx.lineTo(0, s * 0.42); ctx.lineTo(-s * 0.24, 0.04 * s);
    ctx.closePath(); ctx.fillStyle = '#FFF9DB'; ctx.fill();
  }
  ctx.restore();
}

export function drawHeartIcon(ctx, cx, cy, s, color = '#FF6F61') {
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(0, s * 0.82);
  ctx.bezierCurveTo(-s * 1.15, s * 0.12, -s * 1.05, -s * 0.85, -s * 0.45, -s * 0.85);
  ctx.bezierCurveTo(-s * 0.12, -s * 0.85, 0, -s * 0.52, 0, -s * 0.36);
  ctx.bezierCurveTo(0, -s * 0.52, s * 0.12, -s * 0.85, s * 0.45, -s * 0.85);
  ctx.bezierCurveTo(s * 1.05, -s * 0.85, s * 1.15, s * 0.12, 0, s * 0.82);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = Math.max(1.1, s * 0.14); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
  ctx.restore();
}

export function drawShieldIcon(ctx, cx, cy, s, color = '#FFD459') {
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(0, -s * 0.92); ctx.lineTo(s * 0.78, -s * 0.56); ctx.lineTo(s * 0.68, s * 0.18);
  ctx.quadraticCurveTo(s * 0.46, s * 0.72, 0, s * 0.96); ctx.quadraticCurveTo(-s * 0.46, s * 0.72, -s * 0.68, s * 0.18);
  ctx.lineTo(-s * 0.78, -s * 0.56); ctx.closePath();
  ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = Math.max(1.2, s * 0.14); ctx.strokeStyle = '#6A4608'; ctx.stroke();
  ctx.restore();
}

export function drawSpeakerIcon(ctx, cx, cy, s, muted = false) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = muted ? '#9E8D74' : '#FFE496'; ctx.strokeStyle = muted ? '#E06A62' : '#FFE496';
  ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.72, -s * 0.32); ctx.lineTo(-s * 0.3, -s * 0.32); ctx.lineTo(s * 0.18, -s * 0.74);
  ctx.lineTo(s * 0.18, s * 0.74); ctx.lineTo(-s * 0.3, s * 0.32); ctx.lineTo(-s * 0.72, s * 0.32); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  if (muted) {
    ctx.moveTo(s * 0.38, -s * 0.38); ctx.lineTo(s * 0.88, s * 0.38);
    ctx.moveTo(s * 0.88, -s * 0.38); ctx.lineTo(s * 0.38, s * 0.38);
  } else {
    ctx.arc(s * 0.25, 0, s * 0.36, -0.7, 0.7); ctx.stroke();
    ctx.beginPath(); ctx.arc(s * 0.25, 0, s * 0.64, -0.75, 0.75);
  }
  ctx.stroke(); ctx.restore();
}

function drawSuitCartouche(ctx, card, cx, cy, cw, ch) {
  const r = cw * 0.44;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy + ch / 2 - 4); ctx.lineTo(cx - cw / 2, cy - ch * 0.08);
  ctx.arc(cx, cy - ch * 0.08, cw / 2, Math.PI, 0, false);
  ctx.lineTo(cx + cw / 2, cy + ch / 2 - 4); ctx.quadraticCurveTo(cx + cw / 2, cy + ch / 2, cx + cw / 2 - 4, cy + ch / 2);
  ctx.lineTo(cx - cw / 2 + 4, cy + ch / 2); ctx.quadraticCurveTo(cx - cw / 2, cy + ch / 2, cx - cw / 2, cy + ch / 2 - 4);
  ctx.closePath();

  const stops = card.suit === 'ember' ? [[0, '#421626'], [0.45, '#F6C26B'], [0.82, '#FFF2C6'], [1, '#9E461D']]
    : card.suit === 'tide' ? [[0, '#0E2448'], [0.42, '#7AC8F5'], [0.78, '#E6F8FF'], [1, '#1A5284']]
    : card.suit === 'bramble' ? [[0, '#123823'], [0.44, '#8CE0A8'], [0.8, '#ECFFE8'], [1, '#1B5A34']]
    : [[0, '#101830'], [0.55, '#1D2C54'], [1, '#0C1226']];
  ctx.fillStyle = lgrad(ctx, cx, cy - ch * 0.52, cx, cy + ch * 0.52, stops);
  ctx.fill();

  ctx.save(); ctx.clip();
  if (card.suit === 'ember') {
    ctx.strokeStyle = 'rgba(255,245,200,0.45)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i += 1) {
      const a = -Math.PI + (i / 6) * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy + ch * 0.08); ctx.lineTo(cx + Math.cos(a) * cw * 0.72, cy + ch * 0.08 + Math.sin(a) * ch * 0.72); ctx.stroke();
    }
    ctx.fillStyle = '#592014';
    ctx.beginPath(); ctx.moveTo(cx - cw * 0.34, cy + ch * 0.34); ctx.lineTo(cx + cw * 0.34, cy + ch * 0.34);
    ctx.lineTo(cx + cw * 0.22, cy + ch * 0.5); ctx.lineTo(cx - cw * 0.22, cy + ch * 0.5); ctx.closePath(); ctx.fill();
  } else if (card.suit === 'tide') {
    for (const [sx, sy] of [[-0.28, -0.3], [0.28, -0.32], [0, -0.38], [0.33, -0.18]]) circle(ctx, cx + sx * cw, cy + sy * ch, 1.5, '#FFF9D6');
    for (let wIdx = 0; wIdx < 2; wIdx += 1) {
      const wy = cy + ch * (0.28 + wIdx * 0.12);
      ctx.beginPath(); ctx.moveTo(cx - cw * 0.55, wy);
      ctx.bezierCurveTo(cx - cw * 0.2, wy - 8, cx + cw * 0.1, wy + 7, cx + cw * 0.55, wy - 4);
      ctx.lineTo(cx + cw * 0.55, cy + ch * 0.55); ctx.lineTo(cx - cw * 0.55, cy + ch * 0.55); ctx.closePath();
      ctx.fillStyle = wIdx === 0 ? 'rgba(20,92,156,0.55)' : 'rgba(12,54,98,0.72)'; ctx.fill();
    }
  } else if (card.suit === 'bramble') {
    circle(ctx, cx, cy + ch * 0.02, r * 0.9, null, 'rgba(20,86,48,0.38)', 1.6);
    ctx.strokeStyle = 'rgba(186,138,36,0.6)'; ctx.lineWidth = 1.3;
    for (const dir of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(cx + dir * cw * 0.46, cy + ch * 0.46);
      ctx.bezierCurveTo(cx + dir * cw * 0.2, cy + ch * 0.22, cx + dir * cw * 0.44, cy - ch * 0.14, cx + dir * cw * 0.16, cy - ch * 0.36); ctx.stroke();
    }
  } else {
    for (const [sx, sy] of [[-0.32, -0.26], [0.32, -0.24], [-0.3, 0.32], [0.3, 0.3]]) circle(ctx, cx + sx * cw, cy + sy * ch, 1.4, '#FFF3BD');
    ctx.strokeStyle = 'rgba(255,224,124,0.42)'; ctx.lineWidth = 1.25;
    circle(ctx, cx, cy + ch * 0.02, r * 0.96, null, 'rgba(255,224,124,0.42)', 1.25);
    ctx.beginPath(); ctx.ellipse(cx, cy + ch * 0.02, r * 1.05, r * 0.44, 0.52, 0, Math.PI * 2);
    ctx.ellipse(cx, cy + ch * 0.02, r * 1.05, r * 0.44, -0.52, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.save();
  ctx.shadowColor = card.suit === 'brass' ? 'rgba(255,218,86,0.72)' : 'rgba(18,12,8,0.42)';
  ctx.shadowBlur = card.suit === 'brass' ? 14 : 8;
  drawSuitEmblem(ctx, card.suit, cx, cy + ch * 0.01, cw * 0.325);
  ctx.restore();

  for (let i = 0; i < card.cost; i += 1) circle(ctx, cx + (i - (card.cost - 1) / 2) * 8, cy - ch * 0.4, 1.9, '#FFE994');
  ctx.restore();

  ctx.lineWidth = card.rank >= 7 ? 2.1 : 1.5; ctx.strokeStyle = card.rank >= 7 ? '#F2C95E' : '#C99C42'; ctx.stroke();
  ctx.restore();
}

export function drawCardBack(ctx, w, h, tellOptions = null) {
  const r = Math.max(8, w * 0.085);
  roundedRectPath(ctx, -w / 2 + 2, -h / 2 + 2.5, w, h, r); ctx.fillStyle = '#18060A'; ctx.fill();
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fillStyle = lgrad(ctx, -w / 2, -h / 2, w / 2, h / 2, [[0, '#621E2B'], [0.5, '#3E1019'], [1, '#23070D']]);
  ctx.fill(); ctx.lineWidth = Math.max(2, w * 0.024); ctx.strokeStyle = '#E3BE6A'; ctx.stroke();

  const inset = w * 0.085;
  roundedRectPath(ctx, -w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, r * 0.58);
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(240,204,120,0.72)'; ctx.stroke();

  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(236,194,102,0.2)'; ctx.lineWidth = 1;
  const step = Math.max(11, w * 0.16);
  for (let d = -h; d <= h + w; d += step) {
    ctx.beginPath(); ctx.moveTo(-w / 2 + d, -h / 2); ctx.lineTo(-w / 2 + d - h, h / 2);
    ctx.moveTo(-w / 2 + d - h, -h / 2); ctx.lineTo(-w / 2 + d, h / 2); ctx.stroke();
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) circle(ctx, sx * (w / 2 - inset * 1.8), sy * (h / 2 - inset * 1.8), 3, 'rgba(240,204,120,0.42)');
  ctx.restore();

  const medR = w * 0.255;
  circle(ctx, 0, 0, medR + 3, null, 'rgba(240,204,120,0.45)', 1);
  circle(ctx, 0, 0, medR, '#290B12', tellOptions ? tellOptions.color : '#E4BF6B', 2);

  if (tellOptions) {
    ctx.save(); ctx.globalAlpha = 0.45 * (0.74 + 0.26 * Math.sin(tellOptions.time * 4.5));
    circle(ctx, 0, 0, medR * 1.7, rgrad(ctx, 0, 0, medR * 0.2, 0, 0, medR * 1.7, [[0, tellOptions.color], [1, 'rgba(0,0,0,0)']]));
    ctx.restore();
    ctx.fillStyle = '#FFF3D0'; ctx.font = `900 ${Math.round(w * 0.31)}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2);
    const bh = h * 0.16;
    roundedRectPath(ctx, -w * 0.43, h * 0.27, w * 0.86, bh, 5);
    ctx.fillStyle = tellOptions.color; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#F7DF9C'; ctx.stroke();
    ctx.fillStyle = '#FFFDF5'; ctx.font = `800 ${Math.round(w * 0.115)}px system-ui, sans-serif`;
    ctx.fillText(tellOptions.label ?? 'TELL', 0, h * 0.27 + bh / 2 + 0.5);
  } else {
    drawLanternIcon(ctx, 0, 0, medR * 0.68, true);
  }
}

export function drawCardFace(ctx, card, w, h, state = {}) {
  const suit = SUITS[card.suit];
  const r = Math.max(9, w * 0.088);
  const { selected, hovered, dimmed, winnerGlow } = state;

  if (selected || winnerGlow || hovered) {
    ctx.save();
    ctx.shadowColor = winnerGlow ? '#FFE072' : selected ? '#FFD459' : suit.bright;
    ctx.shadowBlur = winnerGlow ? 28 : selected ? 22 : 14;
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = winnerGlow ? 'rgba(255,224,114,0.38)' : 'rgba(255,212,89,0.22)'; ctx.fill();
    ctx.restore();
  }

  roundedRectPath(ctx, -w / 2 + 2.2, -h / 2 + 2.8, w, h, r); ctx.fillStyle = '#523B1F'; ctx.fill();
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fillStyle = rgrad(ctx, -w * 0.1, -h * 0.15, w * 0.08, 0, 0, h * 0.72, [[0, '#FFFDF6'], [0.65, '#F5E7C9'], [1, '#DFC89B']]);
  ctx.fill();
  ctx.lineWidth = selected || winnerGlow ? Math.max(3.6, w * 0.036) : Math.max(2.7, w * 0.028);
  ctx.strokeStyle = selected || winnerGlow ? '#FFE070' : suit.color; ctx.stroke();

  const pad = w * 0.062;
  roundedRectPath(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, r * 0.52);
  ctx.lineWidth = 1.25; ctx.strokeStyle = 'rgba(182,134,42,0.72)'; ctx.stroke();
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) circle(ctx, sx * (w / 2 - pad - 3), sy * (h / 2 - pad - 3), 1.6, '#C99634');

  ctx.fillStyle = suit.deep; ctx.font = `900 ${Math.round(w * 0.375)}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(String(card.rank), -w / 2 + w * 0.088, -h / 2 + h * 0.028);
  drawSuitEmblem(ctx, card.suit, -w / 2 + w * 0.19, -h / 2 + h * 0.322, w * 0.076);

  const costCx = w / 2 - w * 0.21; const costCy = -h / 2 + h * 0.138; const costR = w * 0.142;
  circle(ctx, costCx, costCy, costR, rgrad(ctx, costCx - 2, costCy - 3, 2, costCx, costCy, costR, [[0, '#4B3418'], [1, '#1D1309']]), '#F5CE62', Math.max(2, w * 0.022));
  ctx.fillStyle = '#FFE994'; ctx.font = `900 ${Math.round(w * 0.205)}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(card.cost), costCx, costCy + 0.5);

  const pipSp = w * 0.082;
  for (let i = 0; i < card.cost; i += 1) drawLanternIcon(ctx, costCx + (i - (card.cost - 1) / 2) * pipSp, costCy + costR + h * 0.048, w * 0.034, true);

  drawSuitCartouche(ctx, card, 0, h * 0.078, w * 0.68, h * 0.42);

  const banW = w * 0.85; const banH = h * 0.16; const banY = h / 2 - banH - h * 0.064;
  roundedRectPath(ctx, -banW / 2, banY, banW, banH, 5);
  ctx.fillStyle = lgrad(ctx, -banW / 2, banY, banW / 2, banY + banH, [[0, suit.deep], [0.5, suit.color], [1, suit.deep]]);
  ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = '#ECC86E'; ctx.stroke();
  ctx.fillStyle = '#FFFDF6'; ctx.font = `800 ${Math.round(w * 0.122)}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(card.effect.label, 0, banY + banH / 2 + 0.5);

  if (dimmed) { roundedRectPath(ctx, -w / 2, -h / 2, w, h, r); ctx.fillStyle = 'rgba(18,15,13,0.44)'; ctx.fill(); }
}

export function drawCard(ctx, card, x, y, w, h, options = {}) {
  const flip = options.flip ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(options.rot ?? 0);
  ctx.scale((options.scale ?? 1) * Math.max(0.05, Math.abs(flip)), options.scale ?? 1);
  if (options.shadow ?? true) {
    ctx.save();
    ctx.shadowColor = 'rgba(3,8,6,0.64)'; ctx.shadowBlur = options.selected ? 24 : 15;
    ctx.shadowOffsetX = 4; ctx.shadowOffsetY = options.selected ? 13 : 8;
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.max(8, w * 0.088));
    ctx.fillStyle = '#18100B'; ctx.fill(); ctx.restore();
  }
  if (flip >= 0 && card) drawCardFace(ctx, card, w, h, options);
  else drawCardBack(ctx, w, h, options.tellOptions ?? null);
  ctx.restore();
}
