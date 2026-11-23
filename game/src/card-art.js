// Museum-grade bespoke woodcut/tarot card renderer: 12 unique card vignettes, linen grain, and Gilded Foil shimmer.
import { SUITS, GILD_TYPES } from './cards.js';
const SF = 'Georgia, serif'; const UI = 'system-ui, sans-serif';
export function rr(ctx, x, y, w, h, r) {
 const rad = Math.min(r, w / 2, h / 2);
 ctx.beginPath();
 ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad);
 ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath();
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
 ctx.beginPath();ctx.arc(x, y, r, 0, Math.PI*2);
 if (fill) { ctx.fillStyle=fill; ctx.fill();}
 if (stroke) { ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.stroke();}
}
function poly(ctx, pts, fill = null, stroke = null, lw = 1.3) {
 ctx.beginPath();
 for (let i = 0; i < pts.length; i += 2) {
  if (i === 0) ctx.moveTo(pts[0], pts[1]); else ctx.lineTo(pts[i], pts[i + 1]);
 }
 ctx.closePath();
 if (fill) { ctx.fillStyle=fill; ctx.fill();}
 if (stroke) { ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.stroke();}
}
function star4(ctx, x, y, r, color) {
 ctx.fillStyle=color; ctx.beginPath();
 ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
 ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.closePath();ctx.fill();
}
export function drawSuitEmblem(ctx, suitId, cx, cy, r, options = {}) {
 const suit = SUITS[suitId] ?? SUITS.brass;
 const mono = options.monochrome ?? false;
 const fillPrimary = mono ? (options.color ?? '#FBF4E3') : suit.color;
 const strokeDeep = mono ? 'rgba(0,0,0,0.32)' : suit.deep;
 ctx.save();ctx.translate(cx, cy);
 if (suitId === 'ember') {
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.12); ctx.quadraticCurveTo(r * 0.42, -r * 0.36, r * 0.92, 0);
  ctx.quadraticCurveTo(r * 0.38, r * 0.38, 0, r * 1.08); ctx.quadraticCurveTo(-r * 0.38, r * 0.38, -r * 0.92, 0);
  ctx.quadraticCurveTo(-r * 0.42, -r * 0.36, 0, -r * 1.12); ctx.closePath();
  ctx.fillStyle=mono ? fillPrimary : lgrad(ctx, 0, -r, 0, r, [[0, '#FF6850'], [0.55, '#C8221D'], [1, '#75100D']]);
  ctx.fill();ctx.lineWidth=Math.max(1.8, r * 0.11); ctx.strokeStyle=strokeDeep; ctx.stroke();
  if (!mono) {
   ctx.beginPath();ctx.moveTo(0, -r * 0.56); ctx.quadraticCurveTo(r * 0.28, -r * 0.06, 0, r * 0.52);
   ctx.quadraticCurveTo(-r * 0.28, -r * 0.06, 0, -r * 0.56); ctx.closePath();ctx.fillStyle='#FFE985'; ctx.fill();
  }
 } else if (suitId === 'tide') {
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.98, 0.52, Math.PI*2 - 0.52, false);
  ctx.arc(r * 0.42, -r * 0.08, r * 0.72, Math.PI*2 - 0.78, 0.78, true); ctx.closePath();
  ctx.fillStyle=mono ? fillPrimary : lgrad(ctx, -r, -r, r, r, [[0, '#4AB6FF'], [0.55, '#1562AD'], [1, '#082E5A']]);
  ctx.fill();ctx.lineWidth=Math.max(1.8, r * 0.11); ctx.strokeStyle=strokeDeep; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(r * 0.56, -r * 0.36); ctx.quadraticCurveTo(r * 0.96, 0.08 * r, r * 0.52, r * 0.38);
  ctx.quadraticCurveTo(r * 0.12, r * 0.14, r * 0.56, -r * 0.36); ctx.closePath();
  ctx.fillStyle=mono ? fillPrimary : '#52C0FF'; ctx.fill();
  if (!mono) { ctx.lineWidth=Math.max(1.2, r * 0.07); ctx.strokeStyle='#082E5A'; ctx.stroke();}
 } else if (suitId === 'bramble') {
  ctx.fillStyle=mono ? fillPrimary : rgrad(ctx, 0, -r * 0.2, r * 0.1, 0, 0, r, [[0, '#44D680'], [0.55, '#178247'], [1, '#0B4726']]);
  ctx.strokeStyle=strokeDeep; ctx.lineWidth=Math.max(1.8, r * 0.11);
  for (const a of [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]) {
   ctx.save();ctx.rotate(a + Math.PI / 2); ctx.beginPath();ctx.moveTo(0, 0);
   ctx.bezierCurveTo(-r * 0.52, -r * 0.25, -r * 0.48, -r * 0.88, 0, -r * 1.06);
   ctx.bezierCurveTo(r * 0.48, -r * 0.88, r * 0.52, -r * 0.25, 0, 0); ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  poly(ctx, [-r * 0.12, r * 0.25, r * 0.12, r * 0.25, r * 0.2, r * 0.96, -r * 0.2, r * 0.96], ctx.fillStyle, strokeDeep, ctx.lineWidth);
  if (!mono) circle(ctx, 0, 0, r * 0.22, '#ECFFD8');
 } else {
  const outerR = r * 1.04; const midR = r * 0.74;
  const pts = [];
  for (let i = 0; i < 16; i += 1) {
   const a = (i * Math.PI) / 8 - Math.PI / 2; const rad = i % 2 === 0 ? outerR : midR;
   pts.push(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  poly(ctx, pts, mono ? fillPrimary : rgrad(ctx, -r * 0.15, -r * 0.2, r * 0.1, 0, 0, outerR, [[0, '#FFF8C4'], [0.5, suit.bright], [0.88, fillPrimary], [1, strokeDeep]]), strokeDeep, Math.max(1.5, r * 0.085));
  if (!mono) { circle(ctx, 0, 0, r * 0.42, '#4E3006'); circle(ctx, 0, 0, r * 0.23, '#FFEE9A'); }
 }
 ctx.restore();
}
export function drawLanternIcon(ctx, cx, cy, s, lit = true) {
 ctx.save();ctx.translate(cx, cy);
 if (lit) circle(ctx, 0, 0, s * 1.5, rgrad(ctx, 0, 0, s * 0.1, 0, 0, s * 1.5, [[0, 'rgba(255,224,115,0.72)'], [1, 'rgba(255,168,40,0)']]));
 poly(ctx, [0, -s * 0.92, s * 0.62, -s * 0.35, s * 0.48, s * 0.58, 0, s * 0.9, -s * 0.48, s * 0.58, -s * 0.62, -s * 0.35], lit ? '#FFD75E' : '#3C3530', lit ? '#7B4F08' : '#1E1A17', Math.max(1.2, s * 0.14));
 if (lit) poly(ctx, [0, -s * 0.42, s * 0.24, 0.04 * s, 0, s * 0.42, -s * 0.24, 0.04 * s], '#FFF9DB');
 ctx.restore();
}
export function drawHeartIcon(ctx, cx, cy, s, color = '#FF6F61') {
 ctx.save();ctx.translate(cx, cy); ctx.beginPath();ctx.moveTo(0, s * 0.82);
 ctx.bezierCurveTo(-s * 1.15, s * 0.12, -s * 1.05, -s * 0.85, -s * 0.45, -s * 0.85);
 ctx.bezierCurveTo(-s * 0.12, -s * 0.85, 0, -s * 0.52, 0, -s * 0.36);
 ctx.bezierCurveTo(0, -s * 0.52, s * 0.12, -s * 0.85, s * 0.45, -s * 0.85);
 ctx.bezierCurveTo(s * 1.05, -s * 0.85, s * 1.15, s * 0.12, 0, s * 0.82);
 ctx.closePath();ctx.fillStyle=color; ctx.fill();ctx.lineWidth=Math.max(1.1, s * 0.14); ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.stroke();ctx.restore();
}
export function drawShieldIcon(ctx, cx, cy, s, color = '#FFD459') {
 ctx.save();ctx.translate(cx, cy); ctx.beginPath();
 ctx.moveTo(0, -s * 0.92); ctx.lineTo(s * 0.78, -s * 0.56); ctx.lineTo(s * 0.68, s * 0.18);
 ctx.quadraticCurveTo(s * 0.46, s * 0.72, 0, s * 0.96); ctx.quadraticCurveTo(-s * 0.46, s * 0.72, -s * 0.68, s * 0.18);
 ctx.lineTo(-s * 0.78, -s * 0.56); ctx.closePath();
 ctx.fillStyle=color; ctx.fill();ctx.lineWidth=Math.max(1.2, s * 0.14); ctx.strokeStyle='#6A4608'; ctx.stroke();ctx.restore();
}
export function drawSpeakerIcon(ctx, cx, cy, s, muted = false) {
 ctx.save();ctx.translate(cx, cy);
 poly(ctx, [-s * 0.72, -s * 0.32, -s * 0.3, -s * 0.32, s * 0.18, -s * 0.74, s * 0.18, s * 0.74, -s * 0.3, s * 0.32, -s * 0.72, s * 0.32], muted ? '#9E8D74' : '#FFE496');
 ctx.strokeStyle=muted ? '#E06A62' : '#FFE496'; ctx.lineWidth=1.8; ctx.lineCap = 'round'; ctx.beginPath();
 if (muted) { ctx.moveTo(s * 0.38, -s * 0.38); ctx.lineTo(s * 0.88, s * 0.38); ctx.moveTo(s * 0.88, -s * 0.38); ctx.lineTo(s * 0.38, s * 0.38); }
 else { ctx.arc(s * 0.25, 0, s * 0.36, -0.7, 0.7); ctx.stroke();ctx.beginPath();ctx.arc(s * 0.25, 0, s * 0.64, -0.75, 0.75); }
 ctx.stroke();ctx.restore();
}
function drawCardVignetteScene(ctx, art, cx, cy, cw, ch) {
 const rx = cw * 0.5; const ry = ch * 0.5;
 if (art === 'blaze') {
  ctx.strokeStyle='rgba(255,244,190,0.48)'; ctx.lineWidth=1.3;
  for (let i = 0; i < 9; i += 1) {
   const a = -Math.PI + (i / 8) * Math.PI;
   ctx.beginPath();ctx.moveTo(cx, cy + ch * 0.08); ctx.lineTo(cx + Math.cos(a) * rx * 1.4, cy + ch * 0.08 + Math.sin(a) * ry * 1.3); ctx.stroke();
  }
  for (const d of [-1, 1]) {
   ctx.fillStyle=lgrad(ctx, cx, cy - ry * 0.4, cx + d * rx, cy + ry * 0.2, [[0, '#FFE478'], [0.55, '#F0532C'], [1, '#8C1814']]);
   ctx.beginPath();ctx.moveTo(cx, cy + ch * 0.14);
   ctx.bezierCurveTo(cx + d * rx * 0.52, cy - ry * 0.12, cx + d * rx * 0.96, cy - ry * 0.68, cx + d * rx * 0.9, cy - ry * 0.16);
   ctx.bezierCurveTo(cx + d * rx * 0.78, cy + ry * 0.22, cx + d * rx * 0.34, cy + ry * 0.34, cx, cy + ch * 0.24); ctx.closePath();ctx.fill();
  }
  poly(ctx, [cx - rx * 0.66, cy + ry * 0.56, cx + rx * 0.66, cy + ry * 0.56, cx + rx * 0.44, cy + ry * 0.96, cx - rx * 0.44, cy + ry * 0.96], '#471810', '#F2C058', 1.4);
 } else if (art === 'ignite') {
  ctx.strokeStyle='#D9A040'; ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(cx - rx * 0.9, cy - ry * 0.6); ctx.quadraticCurveTo(cx, cy - ry * 0.34, cx + rx * 0.9, cy - ry * 0.6); ctx.stroke();
  for (const dx of [-0.48, 0.48]) {
   const lx = cx + dx * rx;
   ctx.beginPath();ctx.moveTo(lx, cy - ry * 0.48); ctx.lineTo(lx, cy - ry * 0.14); ctx.stroke();
   drawLanternIcon(ctx, lx, cy + ry * 0.1, cw * 0.16, true);
  }
  for (const [sx, sy] of [[-0.25, -0.2], [0.24, -0.25], [0, 0.48]]) star4(ctx, cx + sx * rx, cy + sy * ry, 4.2, '#FFF3B0');
 } else if (art === 'spark') {
  ctx.strokeStyle='rgba(255,232,140,0.68)'; ctx.lineWidth=1.4;
  for (const [x1, y1, x2, y2] of [[-0.1, 0.1, -0.58, -0.52], [0.05, 0.05, 0.62, -0.44], [0, 0.1, 0.15, -0.68], [-0.2, 0.2, -0.7, -0.1]]) {
   ctx.beginPath();ctx.moveTo(cx + x1 * rx, cy + y1 * ry); ctx.lineTo(cx + x2 * rx, cy + y2 * ry); ctx.stroke();
   star4(ctx, cx + x2 * rx, cy + y2 * ry, 3.6, '#FFF5B8');
  }
  poly(ctx, [cx - rx * 0.72, cy + ry * 0.44, cx + rx * 0.52, cy + ry * 0.44, cx + rx * 0.82, cy + ry * 0.56, cx + rx * 0.34, cy + ry * 0.7, cx + rx * 0.44, cy + ry * 0.96, cx - rx * 0.54, cy + ry * 0.96, cx - rx * 0.42, cy + ry * 0.66], '#381B18');
 } else if (art === 'deluge') {
  const lx = cx + rx * 0.54; const ly = cy - ry * 0.46;
  poly(ctx, [lx, ly, cx - rx * 0.88, cy - ry * 0.74, cx - rx * 0.88, cy - ry * 0.26], 'rgba(255,244,178,0.28)');
  circle(ctx, lx, ly, cw * 0.24, rgrad(ctx, lx, ly, 2, lx, ly, cw * 0.24, [[0, 'rgba(255,246,185,0.92)'], [1, 'rgba(255,246,185,0)']]));
  poly(ctx, [lx - rx * 0.13, cy + ry * 0.68, lx - rx * 0.07, ly + ry * 0.1, lx + rx * 0.07, ly + ry * 0.1, lx + rx * 0.14, cy + ry * 0.68], '#E4EFF9');
  ctx.fillStyle='#FFE478'; ctx.fillRect(lx - rx * 0.06, ly - ry * 0.04, rx * 0.12, ry * 0.14);
  ctx.fillStyle='#0F4A80'; ctx.beginPath();ctx.moveTo(cx - rx, cy + ry * 0.38);
  ctx.bezierCurveTo(cx - rx * 0.76, cy - ry * 0.46, cx + rx * 0.14, cy - ry * 0.42, cx + rx * 0.08, cy + ry * 0.06);
  ctx.bezierCurveTo(cx - rx * 0.18, cy - ry * 0.08, cx - rx * 0.32, cy + ry * 0.26, cx + rx, cy + ry * 0.48);
  ctx.lineTo(cx + rx, cy + ry); ctx.lineTo(cx - rx, cy + ry); ctx.closePath();ctx.fill();
  ctx.strokeStyle='#E8F9FF'; ctx.lineWidth=2.1; ctx.beginPath();ctx.moveTo(cx - rx * 0.88, cy + ry * 0.22);
  ctx.bezierCurveTo(cx - rx * 0.58, cy - ry * 0.36, cx + rx * 0.06, cy - ry * 0.32, cx + rx * 0.06, cy + ry * 0.02); ctx.stroke();
 } else if (art === 'chill') {
  const g = lgrad(ctx, cx, cy - ry * 0.72, cx, cy + ry * 0.65, [[0, '#F0FCFF'], [0.45, '#7AD2FF'], [1, '#1A5E9E']]);
  for (const [ox, hs, ws] of [[0, 0.74, 0.28], [-0.42, 0.48, 0.2], [0.42, 0.52, 0.2]]) {
   poly(ctx, [cx + ox * rx, cy - ry * hs, cx + (ox + ws) * rx, cy + ry * 0.15, cx + ox * rx, cy + ry * 0.65, cx + (ox - ws) * rx, cy + ry * 0.15], g, '#FFFFFF', 1.1);
  }
  for (const [sx, sy] of [[-0.55, -0.42], [0.58, -0.36], [0, -0.72]]) star4(ctx, cx + sx * rx, cy + sy * ry, 4.2, '#FFFFFF');
 } else if (art === 'surge') {
  ctx.strokeStyle='rgba(220,248,255,0.68)'; ctx.lineWidth=1.8;
  for (let i = 0; i < 3; i += 1) { ctx.beginPath();ctx.arc(cx, cy + ry * 0.08, cw * (0.22 + i * 0.11), i * 1.1, i * 1.1 + Math.PI * 1.35); ctx.stroke();}
  for (const [sx, sy] of [[-0.5, -0.4], [0.55, -0.34], [0.48, 0.48], [-0.45, 0.42]]) circle(ctx, cx + sx * rx, cy + sy * ry, 2.2, '#D8F5FF');
 } else if (art === 'thorn') {
  poly(ctx, [cx, cy - ry * 0.78, cx + rx * 0.24, cy + ry * 0.34, cx, cy + ry * 0.56, cx - rx * 0.24, cy + ry * 0.34], lgrad(ctx, cx - rx * 0.2, cy - ry * 0.7, cx + rx * 0.2, cy + ry * 0.6, [[0, '#F2FFF6'], [0.45, '#7DE8A8'], [1, '#104A2A']]), '#0C3B21', 1.4);
  ctx.strokeStyle='#D9AF4A'; ctx.lineWidth=2.2; ctx.beginPath();ctx.moveTo(cx - rx * 0.56, cy + ry * 0.66);
  ctx.bezierCurveTo(cx - rx * 0.7, cy + ry * 0.05, cx + rx * 0.7, cy - ry * 0.05, cx + rx * 0.44, cy - ry * 0.56); ctx.stroke();
 } else if (art === 'bloom') {
  ctx.strokeStyle='rgba(255,248,196,0.45)'; ctx.lineWidth=2.2;
  for (const dx of [-0.55, 0, 0.55]) { ctx.beginPath();ctx.moveTo(cx + dx * rx * 0.3, cy - ry * 0.85); ctx.lineTo(cx + dx * rx * 0.9, cy + ry * 0.85); ctx.stroke();}
  ctx.strokeStyle='#1B663B'; ctx.lineWidth=2.4; ctx.beginPath();ctx.arc(cx, cy + ry * 0.14, rx * 0.72, Math.PI, 0, false); ctx.stroke();
  ctx.strokeStyle='#E0B84C'; ctx.lineWidth=1.4;
  for (const d of [-1, 1]) {
   ctx.beginPath();ctx.moveTo(cx + d * rx * 0.72, cy + ry * 0.86); ctx.quadraticCurveTo(cx + d * rx * 0.82, cy + ry * 0.1, cx + d * rx * 0.32, cy - ry * 0.52); ctx.stroke();
   circle(ctx, cx + d * rx * 0.54, cy - ry * 0.26, 3.8, '#FFE985', '#1B663B', 1);
  }
 } else if (art === 'mend') {
  circle(ctx, cx, cy - ry * 0.18, rx * 0.56, rgrad(ctx, cx, cy - ry * 0.18, 2, cx, cy - ry * 0.18, rx * 0.56, [[0, 'rgba(255,252,208,0.85)'], [1, 'rgba(255,252,208,0)']]));
  ctx.strokeStyle='#176E3E'; ctx.lineWidth=2.2; ctx.beginPath();ctx.moveTo(cx, cy + ry * 0.85); ctx.quadraticCurveTo(cx - rx * 0.12, cy + ry * 0.25, cx, cy - ry * 0.2); ctx.stroke();
  for (const d of [-1, 1]) {
   ctx.fillStyle='#38C872'; ctx.beginPath();ctx.moveTo(cx, cy + ry * 0.35);
   ctx.bezierCurveTo(cx + d * rx * 0.65, cy + ry * 0.3, cx + d * rx * 0.62, cy - ry * 0.22, cx + d * rx * 0.12, cy - ry * 0.08); ctx.closePath();ctx.fill();
  }
 } else if (art === 'bastion') {
  for (const [sx, sy] of [[-0.64, -0.45], [0.64, -0.4], [-0.58, 0.56], [0.58, 0.52]]) star4(ctx, cx + sx * rx, cy + sy * ry, 3.6, '#FFF2B2');
  ctx.strokeStyle='rgba(255,224,124,0.62)'; ctx.lineWidth=1.4;
  ctx.beginPath();ctx.ellipse(cx, cy - ry * 0.04, rx * 0.84, ry * 0.34, 0.48, 0, Math.PI*2);
  ctx.ellipse(cx, cy - ry * 0.04, rx * 0.84, ry * 0.34, -0.48, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle='#B88424';
  for (const [tx, tw, th] of [[-0.5, 0.24, 0.42], [0.26, 0.24, 0.42], [-0.22, 0.44, 0.54]]) ctx.fillRect(cx + tx * rx, cy + ry * (0.95 - th), tw * rx, th * ry);
  ctx.strokeStyle='#FFE68C'; ctx.lineWidth=1.2; ctx.strokeRect(cx - rx * 0.22, cy + ry * 0.41, rx * 0.44, ry * 0.54);
 } else if (art === 'aegis') {
  ctx.strokeStyle='rgba(255,224,124,0.44)'; ctx.lineWidth=1.3;
  for (let i = 0; i < 12; i += 1) { const a = (i / 12) * Math.PI*2; ctx.beginPath();ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * rx * 0.96, cy + Math.sin(a) * ry * 0.92); ctx.stroke();}
  for (const d of [-1, 1]) {
   ctx.fillStyle='#DFAA3E'; ctx.beginPath();ctx.moveTo(cx + d * rx * 0.28, cy + ry * 0.14);
   ctx.quadraticCurveTo(cx + d * rx * 0.88, cy - ry * 0.22, cx + d * rx * 0.78, cy - ry * 0.44);
   ctx.quadraticCurveTo(cx + d * rx * 0.5, cy - ry * 0.14, cx + d * rx * 0.22, cy - ry * 0.12); ctx.closePath();ctx.fill();
  }
  drawShieldIcon(ctx, cx, cy + ry * 0.08, cw * 0.28, '#F6C852');
 } else {
  circle(ctx, cx, cy + ry * 0.04, cw * 0.34, '#36230E', '#F0C458', 2.2);
  circle(ctx, cx, cy + ry * 0.04, cw * 0.24, null, 'rgba(255,232,146,0.55)', 1.2);
  for (let i = 0; i < 8; i += 1) { const a = (i / 8) * Math.PI*2; circle(ctx, cx + Math.cos(a) * cw * 0.29, cy + ry * 0.04 + Math.sin(a) * cw * 0.29, 1.8, '#FFF2B2'); }
 }
}
function drawSuitCartouche(ctx, card, cx, cy, cw, ch) {
 ctx.save();ctx.beginPath();
 ctx.moveTo(cx - cw / 2, cy + ch / 2 - 4); ctx.lineTo(cx - cw / 2, cy - ch * 0.08);
 ctx.arc(cx, cy - ch * 0.08, cw / 2, Math.PI, 0, false);
 ctx.lineTo(cx + cw / 2, cy + ch / 2 - 4); ctx.quadraticCurveTo(cx + cw / 2, cy + ch / 2, cx + cw / 2 - 4, cy + ch / 2);
 ctx.lineTo(cx - cw / 2 + 4, cy + ch / 2); ctx.quadraticCurveTo(cx - cw / 2, cy + ch / 2, cx - cw / 2, cy + ch / 2 - 4); ctx.closePath();
 const stops = card.suit === 'ember' ? [[0, '#3D1122'], [0.44, '#F5B559'], [0.82, '#FFF1C2'], [1, '#8C3818']]
  : card.suit === 'tide' ? [[0, '#0B1E40'], [0.42, '#6CC4F8'], [0.78, '#E6F9FF'], [1, '#144B7A']]
  : card.suit === 'bramble' ? [[0, '#0F3320'], [0.44, '#84DF9E'], [0.8, '#ECFFE8'], [1, '#15502E']]
  : [[0, '#0E162E'], [0.55, '#1D2D56'], [1, '#0A1022']];
 ctx.fillStyle=lgrad(ctx, cx, cy - ch * 0.52, cx, cy + ch * 0.52, stops); ctx.fill();
 ctx.save();ctx.clip();
 const art = card.effect?.art ?? 'blaze';
 drawCardVignetteScene(ctx, art, cx, cy, cw, ch);
 ctx.save();
 ctx.shadowColor=card.suit === 'brass' ? 'rgba(255,222,94,0.82)' : 'rgba(10,8,6,0.58)';
 ctx.shadowBlur=card.suit === 'brass' ? 14 : 9;
 const ey = art === 'deluge' ? cy - ch * 0.14 : art === 'bastion' || art === 'spark' ? cy - ch * 0.06 : cy + ch * 0.01;
 const ex = art === 'deluge' ? cx - cw * 0.12 : cx;
 const er = art === 'deluge' ? cw * 0.205 : art === 'bastion' || art === 'blaze' || art === 'bloom' ? cw * 0.24 : cw * 0.23;
 drawSuitEmblem(ctx, card.suit, ex, ey, er);
 ctx.restore();
 for (let i = 0; i < card.cost; i += 1) circle(ctx, cx + (i - (card.cost - 1) / 2) * 8, cy - ch * 0.4, 1.9, '#FFE994');
 ctx.restore();
 ctx.lineWidth=card.gilded || card.rank >= 7 ? 2.2 : 1.5;
 ctx.strokeStyle=card.gilded ? '#FFF29C' : card.rank >= 7 ? '#F2C95E' : '#C99C42'; ctx.stroke();ctx.restore();
}
export function drawCardBack(ctx, w, h, tellOptions = null) {
 const r = Math.max(8, w * 0.085);
 rr(ctx, -w / 2 + 2, -h / 2 + 2.5, w, h, r); ctx.fillStyle='#120810'; ctx.fill();
 rr(ctx, -w / 2, -h / 2, w, h, r);
 ctx.fillStyle=lgrad(ctx, -w / 2, -h / 2, w / 2, h / 2, [[0, '#5A1B2E'], [0.5, '#350D1D'], [1, '#1C0610']]);
 ctx.fill();ctx.lineWidth=Math.max(2, w * 0.024); ctx.strokeStyle='#E8C56E'; ctx.stroke();
 const inset = w * 0.085;
 rr(ctx, -w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, r * 0.58);
 ctx.lineWidth=1.3; ctx.strokeStyle='rgba(244,208,122,0.74)'; ctx.stroke();
 ctx.save();ctx.clip(); ctx.strokeStyle='rgba(240,198,106,0.22)'; ctx.lineWidth=1;
 const step = Math.max(11, w * 0.16);
 for (let d = -h; d <= h + w; d += step) {
  ctx.beginPath();ctx.moveTo(-w / 2 + d, -h / 2); ctx.lineTo(-w / 2 + d - h, h / 2);
  ctx.moveTo(-w / 2 + d - h, -h / 2); ctx.lineTo(-w / 2 + d, h / 2); ctx.stroke();
 }
 for (const sx of [-1, 1]) for (const sy of [-1, 1]) circle(ctx, sx * (w / 2 - inset * 1.8), sy * (h / 2 - inset * 1.8), 3, 'rgba(244,208,122,0.45)');
 ctx.restore();
 const medR = w * 0.255;
 circle(ctx, 0, 0, medR + 3, null, 'rgba(244,208,122,0.48)', 1);
 circle(ctx, 0, 0, medR, '#250914', tellOptions ? tellOptions.color : '#E8C46F', 2);
 if (tellOptions) {
  ctx.save();ctx.globalAlpha=0.45 * (0.74 + 0.26 * Math.sin(tellOptions.time * 4.5));
  circle(ctx, 0, 0, medR * 1.7, rgrad(ctx, 0, 0, medR * 0.2, 0, 0, medR * 1.7, [[0, tellOptions.color], [1, 'rgba(0,0,0,0)']]));
  ctx.restore();
  ctx.fillStyle='#FFF3D0'; ctx.font = `900 ${Math.round(w * 0.31)}px ${SF}`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?', 0, 2);
  const bh = h * 0.16;
  rr(ctx, -w * 0.43, h * 0.27, w * 0.86, bh, 5);
  ctx.fillStyle=tellOptions.color; ctx.fill();ctx.lineWidth=1.2; ctx.strokeStyle='#F7DF9C'; ctx.stroke();
  ctx.fillStyle='#FFFDF5'; ctx.font = `800 ${Math.round(w * 0.115)}px ${UI}`;
  ctx.fillText(tellOptions.label ?? 'TELL', 0, h * 0.27 + bh / 2 + 0.5);
 } else drawLanternIcon(ctx, 0, 0, medR * 0.68, true);
}
export function drawCardFace(ctx, card, w, h, state = {}) {
 const suit = SUITS[card.suit]; const r = Math.max(9, w * 0.088);
 const { selected, hovered, dimmed, winnerGlow, time = 0 } = state;
 const isGilded = Boolean(card.gilded);
 if (selected || winnerGlow || hovered || isGilded) {
  ctx.save();
  ctx.shadowColor=winnerGlow ? '#FFE57A' : isGilded ? '#FFD24C' : selected ? '#FFD459' : suit.bright;
  ctx.shadowBlur=winnerGlow ? 30 : isGilded ? 20 : selected ? 22 : 14;
  rr(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fillStyle=winnerGlow ? 'rgba(255,228,118,0.4)' : isGilded ? 'rgba(255,214,88,0.28)' : 'rgba(255,212,89,0.22)';
  ctx.fill();ctx.restore();
 }
 rr(ctx, -w / 2 + 2.4, -h / 2 + 3.2, w, h, r);
 ctx.fillStyle=isGilded ? '#7A540E' : '#4C361C'; ctx.fill();
 rr(ctx, -w / 2, -h / 2, w, h, r);
 ctx.fillStyle=isGilded
  ? lgrad(ctx, -w / 2, -h / 2, w / 2, h / 2, [[0, '#FFFDF0'], [0.35, '#FBE295'], [0.68, '#F6CE62'], [1, '#CFA034']])
  : rgrad(ctx, -w * 0.1, -h * 0.15, w * 0.08, 0, 0, h * 0.72, [[0, '#FFFDF7'], [0.62, '#F6E8CC'], [1, '#DEC698']]);
 ctx.fill();
 ctx.save();rr(ctx, -w / 2, -h / 2, w, h, r); ctx.clip();
 ctx.strokeStyle=isGilded ? 'rgba(130,86,12,0.06)' : 'rgba(120,90,46,0.05)'; ctx.lineWidth=1;
 for (let gy = -h / 2 + 6; gy < h / 2; gy += 6) { ctx.beginPath();ctx.moveTo(-w / 2, gy); ctx.lineTo(w / 2, gy); ctx.stroke();}
 if (isGilded) {
  const sh = Math.sin(time * 2.1 + card.rank) * w * 0.12;
  ctx.fillStyle=lgrad(ctx, -w * 0.7 + sh, -h * 0.5, w * 0.7 + sh, h * 0.5, [
   [0, 'rgba(255,255,255,0)'], [0.32, 'rgba(255,248,195,0.45)'], [0.46, 'rgba(255,198,225,0.22)'],
   [0.56, 'rgba(180,248,255,0.22)'], [0.7, 'rgba(255,250,210,0.42)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillRect(-w / 2, -h / 2, w, h);
 }
 ctx.restore();
 rr(ctx, -w / 2, -h / 2, w, h, r);
 ctx.lineWidth=selected || winnerGlow || isGilded ? Math.max(3.8, w * 0.036) : Math.max(2.9, w * 0.028);
 ctx.strokeStyle=selected || winnerGlow ? '#FFE578' : isGilded ? '#F5C445' : suit.color; ctx.stroke();
 const pad = w * 0.06;
 rr(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, r * 0.5);
 ctx.lineWidth=isGilded ? 1.6 : 1.25; ctx.strokeStyle=isGilded ? '#A87114' : 'rgba(182,134,42,0.72)'; ctx.stroke();
 for (const sx of [-1, 1]) for (const sy of [-1, 1]) circle(ctx, sx * (w / 2 - pad - 3), sy * (h / 2 - pad - 3), 1.8, isGilded ? '#FFF8CC' : '#C99634');
 ctx.fillStyle=suit.deep; ctx.font = `900 ${Math.round(w * 0.38)}px ${SF}`;
 ctx.textAlign='left'; ctx.textBaseline='top';
 ctx.fillText(String(card.rank), -w / 2 + w * 0.085, -h / 2 + h * 0.024);
 drawSuitEmblem(ctx, card.suit, -w / 2 + w * 0.19, -h / 2 + h * 0.326, w * 0.088);
 const costCx = w / 2 - w * 0.21; const costCy = -h / 2 + h * 0.138; const costR = w * 0.145;
 circle(ctx, costCx, costCy, costR, rgrad(ctx, costCx - 2, costCy - 3, 2, costCx, costCy, costR, [[0, '#4B3418'], [1, '#1D1309']]), '#F8D468', Math.max(2, w * 0.022));
 ctx.fillStyle='#FFF0A0'; ctx.font = `900 ${Math.round(w * 0.21)}px ${UI}`;
 ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(card.cost), costCx, costCy + 0.5);
 const pipSp = w * 0.082;
 for (let i = 0; i < card.cost; i += 1) drawLanternIcon(ctx, costCx + (i - (card.cost - 1) / 2) * pipSp, costCy + costR + h * 0.048, w * 0.034, true);
 drawSuitCartouche(ctx, card, 0, h * 0.082, w * 0.7, h * 0.43);
 const banW = w * 0.86; const banH = h * 0.16; const banY = h / 2 - banH - h * 0.06;
 rr(ctx, -banW / 2, banY, banW, banH, 5);
 ctx.fillStyle=lgrad(ctx, -banW / 2, banY, banW / 2, banY + banH, [[0, suit.deep], [0.5, suit.color], [1, suit.deep]]);
 ctx.fill();ctx.lineWidth=1.4; ctx.strokeStyle=isGilded ? '#FFF2A6' : '#ECC86E'; ctx.stroke();
 ctx.fillStyle='#FFFDF6'; ctx.font = `800 ${Math.round(w * 0.12)}px ${UI}`;
 ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(card.effect.label, 0, banY + banH / 2 + 0.5);
 if (isGilded) {
  const gInfo = GILD_TYPES[card.gilded]; const gw = w * 0.58; const gh = h * 0.095;
  rr(ctx, -gw / 2, -h / 2 - gh * 0.34, gw, gh, 5);
  ctx.fillStyle='#2B1805'; ctx.fill();ctx.lineWidth=1.3; ctx.strokeStyle='#FFE87A'; ctx.stroke();
  ctx.fillStyle='#FFF2A0'; ctx.font = `900 ${Math.round(w * 0.084)}px ${UI}`;
  ctx.fillText(gInfo ? gInfo.badge : '✦ GILDED', 0, -h / 2 + gh * 0.16);
  star4(ctx, -w * 0.34, h * 0.18, w * 0.055, '#FFF9CC'); star4(ctx, w * 0.35, -h * 0.06, w * 0.048, '#FFF9CC');
 }
 if (dimmed) { rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fillStyle='rgba(14,16,22,0.46)'; ctx.fill();}
}
export function drawCard(ctx, card, x, y, w, h, options = {}) {
 const flip = options.flip ?? 1;
 ctx.save();ctx.translate(x, y); ctx.rotate(options.rot ?? 0);
 ctx.scale((options.scale ?? 1) * Math.max(0.05, Math.abs(flip)), options.scale ?? 1);
 if (options.shadow ?? true) {
  ctx.save();
  ctx.shadowColor='rgba(2,6,10,0.68)'; ctx.shadowBlur=options.selected ? 26 : 16;
  ctx.shadowOffsetX = 4; ctx.shadowOffsetY = options.selected ? 14 : 9;
  rr(ctx, -w / 2, -h / 2, w, h, Math.max(8, w * 0.088));
  ctx.fillStyle='#120C08'; ctx.fill();ctx.restore();
 }
 if (flip >= 0 && card) drawCardFace(ctx, card, w, h, options);
 else drawCardBack(ctx, w, h, options.tellOptions ?? null);
 ctx.restore();
}
export const roundedRectPath = rr;
