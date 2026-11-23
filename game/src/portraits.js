// Bespoke 5-rival cameo portraits, 3D Gambit ×2 wax seal, Trophy seal, parlor candles, tray, and brass coins.
import { roundedRectPath, drawLanternIcon } from './card-art.js';

function circ(ctx, x, y, r, fill, stroke = null, lw = 1.4) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function ell(ctx, x, y, rx, ry, fill, stroke = null, lw = 1.4, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function rg(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function drawRivalPortrait(ctx, rivalId, cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  const rim = ctx.createLinearGradient(-r, -r, r, r);
  rim.addColorStop(0, '#FCE49A'); rim.addColorStop(0.5, '#B37F22'); rim.addColorStop(1, '#F2CE72');
  circ(ctx, 0, 0, r + 2.5, rim);

  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.save(); ctx.clip();
  if (rivalId === 'maren') {
    ctx.fillStyle = rg(ctx, 0, -r * 0.25, r * 0.1, 0, 0, r, [[0, '#A83822'], [0.7, '#4B1610'], [1, '#1E0807']]);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#581915'; ctx.beginPath(); ctx.moveTo(-r * 0.92, r * 1.05); ctx.quadraticCurveTo(-r * 0.65, r * 0.22, 0, r * 0.22); ctx.quadraticCurveTo(r * 0.65, r * 0.22, r * 0.92, r * 1.05); ctx.fill();
    ctx.fillStyle = '#9E2E20'; ctx.beginPath(); ctx.arc(0, -r * 0.12, r * 0.56, Math.PI * 0.9, Math.PI * 2.1); ctx.lineTo(r * 0.55, r * 0.45); ctx.lineTo(-r * 0.55, r * 0.45); ctx.fill();
    ell(ctx, 0, -r * 0.02, r * 0.34, r * 0.38, '#EDC29B');
    ell(ctx, 0, r * 0.42, r * 0.46, r * 0.2, '#B83424');
    drawLanternIcon(ctx, 0, r * 0.58, r * 0.2, true);
    ctx.strokeStyle = '#3B2310'; ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.beginPath(); ctx.moveTo(-r * 0.42, -r * 0.08); ctx.lineTo(r * 0.42, -r * 0.08); ctx.stroke();
    for (const gx of [-r * 0.17, r * 0.17]) {
      circ(ctx, gx, -r * 0.08, r * 0.15, '#FFE47E', '#8E5F14', Math.max(1.4, r * 0.075));
      circ(ctx, gx - r * 0.04, -r * 0.12, r * 0.045, '#FFFDF0');
    }
  } else if (rivalId === 'vesper') {
    ctx.fillStyle = rg(ctx, 0, -r * 0.25, r * 0.1, 0, 0, r, [[0, '#62C6F8'], [0.62, '#1A5A8C'], [1, '#0A223B']]);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#13426E'; ctx.beginPath(); ctx.moveTo(-r * 0.92, r * 1.05); ctx.bezierCurveTo(-r * 0.82, -r * 0.7, r * 0.82, -r * 0.7, r * 0.92, r * 1.05); ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * 0.075); ctx.strokeStyle = '#B8EAFF'; ctx.stroke();
    ell(ctx, 0, -r * 0.02, r * 0.44, r * 0.48, '#0C2744');
    ell(ctx, 0, r * 0.05, r * 0.31, r * 0.35, '#E6F4FF');
    ell(ctx, -r * 0.12, r * 0.03, r * 0.07, r * 0.045, '#1676C4');
    ell(ctx, r * 0.12, r * 0.03, r * 0.07, r * 0.045, '#1676C4');
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, -r * 0.38, r * 0.24, 0.2, Math.PI - 0.2, false); ctx.arc(0, -r * 0.48, r * 0.19, Math.PI - 0.35, 0.35, true); ctx.fill();
    circ(ctx, 0, r * 0.58, r * 0.16, '#42E695', '#FFFFFF', 1.4);
  } else if (rivalId === 'sable') {
    ctx.fillStyle = rg(ctx, 0, -r * 0.2, r * 0.1, 0, 0, r, [[0, '#9B651A'], [0.65, '#47290D'], [1, '#1B0E06']]);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#201824'; ctx.beginPath(); ctx.moveTo(-r * 0.92, r * 1.05); ctx.lineTo(-r * 0.56, r * 0.22); ctx.lineTo(r * 0.56, r * 0.22); ctx.lineTo(r * 0.92, r * 1.05); ctx.fill();
    ctx.fillStyle = '#C92B2B'; ctx.beginPath(); ctx.moveTo(-r * 0.24, r * 0.26); ctx.lineTo(r * 0.24, r * 0.26); ctx.lineTo(0, r * 0.82); ctx.closePath(); ctx.fill();
    circ(ctx, 0, r * 0.44, r * 0.09, '#FFE484');
    ell(ctx, 0, r * 0.04, r * 0.31, r * 0.34, '#EBC8A4');
    ctx.fillStyle = '#18131E'; ctx.fillRect(-r * 0.36, -r * 0.78, r * 0.72, r * 0.56);
    ctx.fillStyle = '#F2C552'; ctx.fillRect(-r * 0.36, -r * 0.34, r * 0.72, r * 0.13);
    ell(ctx, 0, -r * 0.21, r * 0.58, r * 0.11, '#18131E', '#E2B954', 1.2);
    circ(ctx, -r * 0.12, r * 0.01, r * 0.055, '#261812');
    circ(ctx, r * 0.13, r * 0.01, r * 0.12, 'rgba(255,240,165,0.75)', '#FFD459', 1.5);
  } else if (rivalId === 'corvus') {
    ctx.fillStyle = rg(ctx, 0, -r * 0.2, r * 0.1, 0, 0, r, [[0, '#27784F'], [0.68, '#0E2E1F'], [1, '#07140E']]);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.save(); ctx.translate(r * 0.35, -r * 0.22); ctx.rotate(0.45); ell(ctx, 0, -r * 0.22, r * 0.12, r * 0.44, '#48E88E'); ctx.restore();
    ctx.fillStyle = '#1B1A24'; ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 1.05); ctx.lineTo(-r * 0.56, r * 0.08); ctx.lineTo(0, r * 0.46); ctx.lineTo(r * 0.56, r * 0.08); ctx.lineTo(r * 0.95, r * 1.05); ctx.fill();
    ctx.strokeStyle = '#E0B85A'; ctx.lineWidth = Math.max(1.2, r * 0.06); ctx.stroke();
    ell(ctx, 0, -r * 0.12, r * 0.38, r * 0.42, '#2A2530');
    ctx.fillStyle = '#F2CE6E'; ctx.beginPath(); ctx.moveTo(-r * 0.36, -r * 0.18); ctx.quadraticCurveTo(0, -r * 0.38, r * 0.36, -r * 0.18); ctx.lineTo(r * 0.24, r * 0.1); ctx.lineTo(0, r * 0.28); ctx.lineTo(-r * 0.24, r * 0.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6A470A'; ctx.lineWidth = 1.2; ctx.stroke();
    ell(ctx, -r * 0.14, -r * 0.08, r * 0.09, r * 0.055, '#2B0C0B', null, 1, 0.18);
    ell(ctx, r * 0.14, -r * 0.08, r * 0.09, r * 0.055, '#2B0C0B', null, 1, -0.18);
    circ(ctx, -r * 0.13, -r * 0.08, r * 0.04, '#FF6A4D'); circ(ctx, r * 0.13, -r * 0.08, r * 0.04, '#FF6A4D');
    circ(ctx, r * 0.14, -r * 0.08, r * 0.125, null, '#FFF0A8', 1.3);
  } else {
    ctx.fillStyle = rg(ctx, 0, -r * 0.2, r * 0.08, 0, 0, r, [[0, '#FFE072'], [0.45, '#8A2B24'], [1, '#220912']]);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#751520'; ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 1.05); ctx.quadraticCurveTo(-r * 0.6, r * 0.18, 0, r * 0.28); ctx.quadraticCurveTo(r * 0.6, r * 0.18, r * 0.95, r * 1.05); ctx.fill();
    ctx.strokeStyle = '#FFE070'; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = '#FFE26E'; ctx.beginPath(); ctx.moveTo(-r * 0.44, -r * 0.2); ctx.lineTo(-r * 0.5, -r * 0.64); ctx.lineTo(-r * 0.2, -r * 0.36); ctx.lineTo(0, -r * 0.78); ctx.lineTo(r * 0.2, -r * 0.36); ctx.lineTo(r * 0.5, -r * 0.64); ctx.lineTo(r * 0.44, -r * 0.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7A4E08'; ctx.lineWidth = 1.2; ctx.stroke();
    ell(ctx, 0, r * 0.06, r * 0.34, r * 0.38, '#FFF0CC', '#C99022', 1.4);
    ell(ctx, -r * 0.13, r * 0.02, r * 0.075, r * 0.04, '#4A1812'); ell(ctx, r * 0.13, r * 0.02, r * 0.075, r * 0.04, '#4A1812');
    circ(ctx, 0, r * 0.58, r * 0.16, '#FFE26E');
  }
  ctx.restore();
  circ(ctx, 0, 0, r, null, 'rgba(255,244,198,0.65)', 1.4);
  ctx.restore();
}

export function drawGambitWaxSeal(ctx, cx, cy, r, time, by = 'player') {
  ctx.save(); ctx.translate(cx, cy);
  const pulse = 0.94 + Math.sin(time * 6) * 0.06;
  circ(ctx, 0, 0, r * 2.0 * pulse, rg(ctx, 0, 0, r * 0.3, 0, 0, r * 2.0 * pulse, [[0, 'rgba(255,222,96,0.68)'], [0.55, 'rgba(224,62,44,0.34)'], [1, 'rgba(224,62,44,0)']]));
  ctx.beginPath();
  for (let i = 0; i < 24; i += 1) {
    const a = (i * Math.PI) / 12; const rad = i % 2 === 0 ? r * 1.14 : r * 0.96;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = rg(ctx, -r * 0.25, -r * 0.25, 2, 0, 0, r * 1.15, [[0, '#FF5744'], [0.6, '#B8201B'], [1, '#630E0B']]);
  ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#FFE88A'; ctx.stroke();
  circ(ctx, 0, 0, r * 0.8, '#3B110B', '#FFE06E', 2.4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFF7C8'; ctx.font = `900 ${Math.round(r * 0.78)}px Georgia, serif`; ctx.fillText('×2', 0, -r * 0.12);
  ctx.fillStyle = by === 'rival' ? '#FFB0A4' : '#FFE488'; ctx.font = `900 ${Math.round(r * 0.28)}px system-ui, sans-serif`; ctx.fillText('GAMBIT', 0, r * 0.42);
  ctx.restore();
}

export function drawTrophySeal(ctx, cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  circ(ctx, 0, 0, r, rg(ctx, -r * 0.25, -r * 0.25, 2, 0, 0, r, [[0, '#FFF8CC'], [0.55, '#F5C445'], [1, '#9E6810']]), '#FFF5C2', 2);
  ctx.fillStyle = '#4A2D05';
  ctx.beginPath(); ctx.moveTo(-r * 0.38, -r * 0.36); ctx.lineTo(r * 0.38, -r * 0.36);
  ctx.quadraticCurveTo(r * 0.32, r * 0.12, 0, r * 0.18); ctx.quadraticCurveTo(-r * 0.32, r * 0.12, -r * 0.38, -r * 0.36); ctx.fill();
  ctx.fillRect(-r * 0.08, r * 0.14, r * 0.16, r * 0.24); ctx.fillRect(-r * 0.28, r * 0.36, r * 0.56, r * 0.12);
  ctx.restore();
}

export function drawParlorCandle(ctx, cx, cy, scale, time, snuffed = false, onPlinth = false) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
  if (!snuffed) ell(ctx, 0, 14, 66, 36, rg(ctx, 0, 12, 6, 0, 12, 66, [[0, 'rgba(255,204,96,0.38)'], [0.55, 'rgba(255,162,54,0.13)'], [1, 'rgba(255,140,30,0)']]));
  if (onPlinth) { ell(ctx, 0, 18, 30, 13, 'rgba(3,8,6,0.62)'); ell(ctx, 0, 14, 27, 11.5, '#3A2112', '#CFA244', 1.5); }
  ell(ctx, 0, 15, 20, 8.5, 'rgba(4,9,7,0.65)');
  const saucer = ctx.createLinearGradient(-18, 6, 18, 18);
  saucer.addColorStop(0, '#F5D57C'); saucer.addColorStop(0.5, '#A97822'); saucer.addColorStop(1, '#583A0B');
  ell(ctx, 0, 12, 18, 8, saucer, '#FCE6A4', 1.2);
  roundedRectPath(ctx, -9, -8, 18, 20, 4);
  const wax = ctx.createLinearGradient(-9, 0, 9, 0);
  wax.addColorStop(0, '#F7EBD1'); wax.addColorStop(0.65, '#E4CFA5'); wax.addColorStop(1, '#B3996F');
  ctx.fillStyle = wax; ctx.fill();
  ell(ctx, 0, -8, 9, 3.6, snuffed ? '#C9BCA3' : '#FFF7E0');
  ctx.strokeStyle = '#2B1F16'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -13); ctx.stroke();

  if (snuffed) {
    ctx.strokeStyle = 'rgba(164,184,212,0.52)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.bezierCurveTo(-6, -24, 8, -32, Math.sin(time * 1.4) * 5, -44); ctx.stroke();
  } else {
    const sway = Math.sin(time * 7.3 + cx) * 1.6; const flick = 0.94 + Math.sin(time * 13.1 + cy) * 0.08;
    circ(ctx, 0, -18, 54 * flick, rg(ctx, sway * 0.4, -20, 2, 0, -18, 54 * flick, [[0, 'rgba(255,224,128,0.56)'], [0.45, 'rgba(255,162,52,0.22)'], [1, 'rgba(255,130,30,0)']]));
    ctx.beginPath(); ctx.moveTo(0, -12);
    ctx.bezierCurveTo(-8, -17, -5 + sway * 0.5, -26, sway, -31 * flick);
    ctx.bezierCurveTo(5 + sway * 0.5, -26, 8, -17, 0, -12); ctx.closePath();
    const fg = ctx.createLinearGradient(0, -12, 0, -31);
    fg.addColorStop(0, '#FF8C2B'); fg.addColorStop(0.6, '#FFD24C'); fg.addColorStop(1, '#FFF8D4');
    ctx.fillStyle = fg; ctx.fill();
    ell(ctx, sway * 0.25, -17, 2.8, 5.2, '#FFFDF2');
  }
  ctx.restore();
}

export function drawWoodenDeckTray(ctx, x, y, w, h) {
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, 9);
  const wood = ctx.createLinearGradient(x, y, x + w, y + h);
  wood.addColorStop(0, '#4E2D1A'); wood.addColorStop(0.5, '#341C0F'); wood.addColorStop(1, '#221108');
  ctx.fillStyle = wood; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#B88930'; ctx.stroke();
  roundedRectPath(ctx, x + 5, y + 5, w - 10, h - 10, 6);
  ctx.fillStyle = '#0D261E'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(236,198,114,0.35)'; ctx.stroke();
  ctx.restore();
}

export function drawLanternCoin(ctx, cx, cy, r, lit = true) {
  ctx.save(); ctx.translate(cx, cy);
  if (lit) circ(ctx, 0, 0, r * 1.75, rg(ctx, 0, 0, r * 0.2, 0, 0, r * 1.75, [[0, 'rgba(255,218,96,0.65)'], [1, 'rgba(255,170,40,0)']]));
  circ(ctx, 0, 1.8, r, lit ? '#694408' : '#181410');
  circ(ctx, 0, 0, r, rg(ctx, -r * 0.3, -r * 0.35, r * 0.1, 0, 0, r, lit ? [[0, '#FFF5B8'], [0.55, '#F0BD42'], [1, '#9A6510']] : [[0, '#4E4438'], [1, '#26201A']]), lit ? '#FFE894' : '#584E42', 1.2);
  ctx.beginPath(); ctx.moveTo(0, -r * 0.48); ctx.lineTo(r * 0.36, 0); ctx.lineTo(0, r * 0.48); ctx.lineTo(-r * 0.36, 0); ctx.closePath();
  ctx.fillStyle = lit ? '#FFFDF0' : '#3A3229'; ctx.fill();
  ctx.restore();
}
