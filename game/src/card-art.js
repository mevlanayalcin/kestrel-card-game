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

export function drawSuitEmblem(ctx, suitId, cx, cy, radius, options = {}) {
  const suit = SUITS[suitId] ?? SUITS.brass;
  const mono = options.monochrome ?? false;
  const fillPrimary = mono ? (options.color ?? '#FBF4E3') : suit.color;
  const fillBright = mono ? (options.color ?? '#FFFFFF') : suit.bright;
  const strokeDeep = mono ? 'rgba(0,0,0,0.32)' : suit.deep;

  ctx.save();
  ctx.translate(cx, cy);

  if (suitId === 'ember') {
    ctx.beginPath();
    ctx.moveTo(0, -radius * 1.12);
    ctx.quadraticCurveTo(radius * 0.42, -radius * 0.36, radius * 0.92, 0);
    ctx.quadraticCurveTo(radius * 0.38, radius * 0.38, 0, radius * 1.08);
    ctx.quadraticCurveTo(-radius * 0.38, radius * 0.38, -radius * 0.92, 0);
    ctx.quadraticCurveTo(-radius * 0.42, -radius * 0.36, 0, -radius * 1.12);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -radius, 0, radius);
    grad.addColorStop(0, '#FF5C47');
    grad.addColorStop(0.55, '#C8221D');
    grad.addColorStop(1, '#7A110E');
    ctx.fillStyle = mono ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.8, radius * 0.105);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    if (!mono) {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.56);
      ctx.quadraticCurveTo(radius * 0.28, -radius * 0.06, 0, radius * 0.52);
      ctx.quadraticCurveTo(-radius * 0.28, -radius * 0.06, 0, -radius * 0.56);
      ctx.closePath();
      ctx.fillStyle = '#FFE478';
      ctx.fill();
    }
  } else if (suitId === 'tide') {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.98, 0.52, Math.PI * 2 - 0.52, false);
    ctx.arc(radius * 0.42, -radius * 0.08, radius * 0.72, Math.PI * 2 - 0.78, 0.78, true);
    ctx.closePath();

    const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    grad.addColorStop(0, '#3296F0');
    grad.addColorStop(0.55, '#135BA3');
    grad.addColorStop(1, '#092F5C');
    ctx.fillStyle = mono ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.8, radius * 0.105);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(radius * 0.56, -radius * 0.36);
    ctx.quadraticCurveTo(radius * 0.96, 0.08 * radius, radius * 0.52, radius * 0.38);
    ctx.quadraticCurveTo(radius * 0.12, radius * 0.14, radius * 0.56, -radius * 0.36);
    ctx.closePath();
    ctx.fillStyle = mono ? fillPrimary : '#2CA2F2';
    ctx.fill();
    if (!mono) {
      ctx.lineWidth = Math.max(1.2, radius * 0.07);
      ctx.strokeStyle = '#092F5C';
      ctx.stroke();
    }
  } else if (suitId === 'bramble') {
    const lobes = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
    const grad = ctx.createRadialGradient(0, -radius * 0.2, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#38C872');
    grad.addColorStop(0.55, '#178247');
    grad.addColorStop(1, '#0B4726');
    ctx.fillStyle = mono ? fillPrimary : grad;
    ctx.strokeStyle = strokeDeep;
    ctx.lineWidth = Math.max(1.8, radius * 0.105);

    for (const a of lobes) {
      ctx.save();
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-radius * 0.52, -radius * 0.25, -radius * 0.48, -radius * 0.88, 0, -radius * 1.06);
      ctx.bezierCurveTo(radius * 0.48, -radius * 0.88, radius * 0.52, -radius * 0.25, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.moveTo(-radius * 0.12, radius * 0.25);
    ctx.lineTo(radius * 0.12, radius * 0.25);
    ctx.lineTo(radius * 0.2, radius * 0.96);
    ctx.lineTo(-radius * 0.2, radius * 0.96);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!mono) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#EBFFD6';
      ctx.fill();
    }
  } else {
    const teeth = 8;
    const outerR = radius * 1.04;
    const midR = radius * 0.74;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i += 1) {
      const ang = (i * Math.PI) / teeth - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : midR;
      if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
      else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(-radius * 0.15, -radius * 0.2, radius * 0.1, 0, 0, outerR);
    grad.addColorStop(0, '#FFF6BE');
    grad.addColorStop(0.5, fillBright);
    grad.addColorStop(0.88, fillPrimary);
    grad.addColorStop(1, strokeDeep);
    ctx.fillStyle = mono ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.085);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    if (!mono) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#4E3006';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
      ctx.fillStyle = '#FFEE9A';
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawLanternIcon(ctx, cx, cy, size, lit = true) {
  ctx.save();
  ctx.translate(cx, cy);
  if (lit) {
    const halo = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 1.5);
    halo.addColorStop(0, 'rgba(255, 224, 115, 0.7)');
    halo.addColorStop(1, 'rgba(255, 168, 40, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.92);
  ctx.lineTo(size * 0.62, -size * 0.35);
  ctx.lineTo(size * 0.48, size * 0.58);
  ctx.lineTo(0, size * 0.9);
  ctx.lineTo(-size * 0.48, size * 0.58);
  ctx.lineTo(-size * 0.62, -size * 0.35);
  ctx.closePath();
  ctx.fillStyle = lit ? '#FFD75E' : '#3C3530';
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, size * 0.14);
  ctx.strokeStyle = lit ? '#7B4F08' : '#1E1A17';
  ctx.stroke();
  if (lit) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.42);
    ctx.lineTo(size * 0.24, 0.04 * size);
    ctx.lineTo(0, size * 0.42);
    ctx.lineTo(-size * 0.24, 0.04 * size);
    ctx.closePath();
    ctx.fillStyle = '#FFF9DB';
    ctx.fill();
  }
  ctx.restore();
}

export function drawHeartIcon(ctx, cx, cy, size, color = '#FF6F61') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.82);
  ctx.bezierCurveTo(-size * 1.15, size * 0.12, -size * 1.05, -size * 0.85, -size * 0.45, -size * 0.85);
  ctx.bezierCurveTo(-size * 0.12, -size * 0.85, 0, -size * 0.52, 0, -size * 0.36);
  ctx.bezierCurveTo(0, -size * 0.52, size * 0.12, -size * 0.85, size * 0.45, -size * 0.85);
  ctx.bezierCurveTo(size * 1.05, -size * 0.85, size * 1.15, size * 0.12, 0, size * 0.82);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1.1, size * 0.14);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.stroke();
  ctx.restore();
}

export function drawShieldIcon(ctx, cx, cy, size, color = '#FFD459') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.92);
  ctx.lineTo(size * 0.78, -size * 0.56);
  ctx.lineTo(size * 0.68, size * 0.18);
  ctx.quadraticCurveTo(size * 0.46, size * 0.72, 0, size * 0.96);
  ctx.quadraticCurveTo(-size * 0.46, size * 0.72, -size * 0.68, size * 0.18);
  ctx.lineTo(-size * 0.78, -size * 0.56);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, size * 0.14);
  ctx.strokeStyle = '#6A4608';
  ctx.stroke();
  ctx.restore();
}

export function drawSpeakerIcon(ctx, cx, cy, size, muted = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = muted ? '#9E8D74' : '#FFE496';
  ctx.strokeStyle = muted ? '#E06A62' : '#FFE496';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-size * 0.72, -size * 0.32);
  ctx.lineTo(-size * 0.3, -size * 0.32);
  ctx.lineTo(size * 0.18, -size * 0.74);
  ctx.lineTo(size * 0.18, size * 0.74);
  ctx.lineTo(-size * 0.3, size * 0.32);
  ctx.lineTo(-size * 0.72, size * 0.32);
  ctx.closePath();
  ctx.fill();
  if (muted) {
    ctx.beginPath();
    ctx.moveTo(size * 0.38, -size * 0.38);
    ctx.lineTo(size * 0.88, size * 0.38);
    ctx.moveTo(size * 0.88, -size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(size * 0.25, 0, size * 0.36, -0.7, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.25, 0, size * 0.64, -0.75, 0.75);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSuitCartouche(ctx, card, cx, cy, cw, ch) {
  const r = cw * 0.44;
  ctx.save();
  // Arched illuminated-manuscript cartouche path
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy + ch / 2 - 4);
  ctx.lineTo(cx - cw / 2, cy - ch * 0.08);
  ctx.arc(cx, cy - ch * 0.08, cw / 2, Math.PI, 0, false);
  ctx.lineTo(cx + cw / 2, cy + ch / 2 - 4);
  ctx.quadraticCurveTo(cx + cw / 2, cy + ch / 2, cx + cw / 2 - 4, cy + ch / 2);
  ctx.lineTo(cx - cw / 2 + 4, cy + ch / 2);
  ctx.quadraticCurveTo(cx - cw / 2, cy + ch / 2, cx - cw / 2, cy + ch / 2 - 4);
  ctx.closePath();

  // High-contrast complementary stained-glass backdrop so every suit emblem LEAPS off at thumbnail size!
  const bg = ctx.createLinearGradient(cx, cy - ch * 0.52, cx, cy + ch * 0.52);
  if (card.suit === 'ember') {
    // Twilight plum dome -> blazing golden-ivory hearth glow behind Crimson Flame Diamond!
    bg.addColorStop(0, '#421626');
    bg.addColorStop(0.45, '#F6C26B');
    bg.addColorStop(0.82, '#FFF2C6');
    bg.addColorStop(1, '#9E461D');
  } else if (card.suit === 'tide') {
    // Starry midnight-navy dome -> luminous moonlit ice-aqua mist behind Deep Sapphire Crescent!
    bg.addColorStop(0, '#0E2448');
    bg.addColorStop(0.42, '#7AC8F5');
    bg.addColorStop(0.78, '#E6F8FF');
    bg.addColorStop(1, '#1A5284');
  } else if (card.suit === 'bramble') {
    // Deep forest canopy dome -> sunlit sage-cream glade behind Rich Emerald Tri-Leaf!
    bg.addColorStop(0, '#123823');
    bg.addColorStop(0.44, '#8CE0A8');
    bg.addColorStop(0.8, '#ECFFE8');
    bg.addColorStop(1, '#1B5A34');
  } else {
    // Complementary Deep Celestial Midnight-Navy Astrolabe behind Gleaming Bright Gold Sunburst Gear!
    bg.addColorStop(0, '#101830');
    bg.addColorStop(0.55, '#1D2C54');
    bg.addColorStop(1, '#0C1226');
  }
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  ctx.clip();

  if (card.suit === 'ember') {
    // Radiating hearth sunbeams + brass brazier pedestal
    ctx.strokeStyle = 'rgba(255, 245, 200, 0.45)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i += 1) {
      const a = -Math.PI + (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy + ch * 0.08);
      ctx.lineTo(cx + Math.cos(a) * cw * 0.72, cy + ch * 0.08 + Math.sin(a) * ch * 0.72);
      ctx.stroke();
    }
    ctx.fillStyle = '#592014';
    ctx.beginPath();
    ctx.moveTo(cx - cw * 0.34, cy + ch * 0.34);
    ctx.lineTo(cx + cw * 0.34, cy + ch * 0.34);
    ctx.lineTo(cx + cw * 0.22, cy + ch * 0.5);
    ctx.lineTo(cx - cw * 0.22, cy + ch * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (card.suit === 'tide') {
    // Twinkling stars in indigo top dome + curling rolling ocean waves at base
    ctx.fillStyle = '#FFF9D6';
    for (const [sx, sy] of [[-0.28, -0.3], [0.28, -0.32], [0.0, -0.38], [0.33, -0.18]]) {
      ctx.beginPath(); ctx.arc(cx + sx * cw, cy + sy * ch, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    for (let wIdx = 0; wIdx < 2; wIdx += 1) {
      const wy = cy + ch * (0.28 + wIdx * 0.12);
      ctx.beginPath();
      ctx.moveTo(cx - cw * 0.55, wy);
      ctx.bezierCurveTo(cx - cw * 0.2, wy - 8, cx + cw * 0.1, wy + 7, cx + cw * 0.55, wy - 4);
      ctx.lineTo(cx + cw * 0.55, cy + ch * 0.55);
      ctx.lineTo(cx - cw * 0.55, cy + ch * 0.55);
      ctx.closePath();
      ctx.fillStyle = wIdx === 0 ? 'rgba(20, 92, 156, 0.55)' : 'rgba(12, 54, 98, 0.72)';
      ctx.fill();
    }
  } else if (card.suit === 'bramble') {
    // Ornate golden botanical arch vines framing the sunlit glade
    ctx.strokeStyle = 'rgba(20, 86, 48, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy + ch * 0.02, r * 0.9, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(186, 138, 36, 0.6)';
    ctx.lineWidth = 1.3;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + dir * cw * 0.46, cy + ch * 0.46);
      ctx.bezierCurveTo(cx + dir * cw * 0.2, cy + ch * 0.22, cx + dir * cw * 0.44, cy - ch * 0.14, cx + dir * cw * 0.16, cy - ch * 0.36);
      ctx.stroke();
    }
  } else {
    // Gleaming celestial brass astrolabe orbits & stars on deep midnight-navy dome
    ctx.fillStyle = '#FFF3BD';
    for (const [sx, sy] of [[-0.32, -0.26], [0.32, -0.24], [-0.3, 0.32], [0.3, 0.3]]) {
      ctx.beginPath(); ctx.arc(cx + sx * cw, cy + sy * ch, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255, 224, 124, 0.42)';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.arc(cx, cy + ch * 0.02, r * 0.96, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + ch * 0.02, r * 1.05, r * 0.44, 0.52, 0, Math.PI * 2);
    ctx.ellipse(cx, cy + ch * 0.02, r * 1.05, r * 0.44, -0.52, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Soft crisp shadow halo behind central suit emblem for razor-sharp silhouette pop!
  ctx.save();
  ctx.shadowColor = card.suit === 'brass' ? 'rgba(255, 218, 86, 0.72)' : 'rgba(18, 12, 8, 0.42)';
  ctx.shadowBlur = card.suit === 'brass' ? 14 : 8;
  drawSuitEmblem(ctx, card.suit, cx, cy + ch * 0.01, cw * 0.325);
  ctx.restore();

  // Top arch gilt tier pips (1..3 bright dots)
  const stars = card.cost;
  const starY = cy - ch * 0.4;
  ctx.fillStyle = '#FFE994';
  for (let i = 0; i < stars; i += 1) {
    ctx.beginPath(); ctx.arc(cx + (i - (stars - 1) / 2) * 8, starY, 1.9, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();

  ctx.lineWidth = card.rank >= 7 ? 2.1 : 1.5;
  ctx.strokeStyle = card.rank >= 7 ? '#F2C95E' : '#C99C42';
  ctx.stroke();
  ctx.restore();
}

export function drawCardBack(ctx, w, h, tellOptions = null) {
  const r = Math.max(8, w * 0.085);

  // 3D beveled card thickness edge
  roundedRectPath(ctx, -w / 2 + 2, -h / 2 + 2.5, w, h, r);
  ctx.fillStyle = '#18060A';
  ctx.fill();

  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  const bg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  bg.addColorStop(0, '#621E2B');
  bg.addColorStop(0.5, '#3E1019');
  bg.addColorStop(1, '#23070D');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = Math.max(2, w * 0.024);
  ctx.strokeStyle = '#E3BE6A';
  ctx.stroke();

  const inset = w * 0.085;
  roundedRectPath(ctx, -w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, r * 0.58);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(240, 204, 120, 0.72)';
  ctx.stroke();

  // Ornate rose-window diamond lattice
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(236, 194, 102, 0.2)';
  ctx.lineWidth = 1;
  const step = Math.max(11, w * 0.16);
  for (let d = -h; d <= h + w; d += step) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + d, -h / 2);
    ctx.lineTo(-w / 2 + d - h, h / 2);
    ctx.moveTo(-w / 2 + d - h, -h / 2);
    ctx.lineTo(-w / 2 + d, h / 2);
    ctx.stroke();
  }
  // Corner gilded quatrefoils
  ctx.fillStyle = 'rgba(240, 204, 120, 0.42)';
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * (w / 2 - inset * 1.8), sy * (h / 2 - inset * 1.8), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Central compass rose medallion
  const medR = w * 0.255;
  ctx.beginPath();
  ctx.arc(0, 0, medR + 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(240, 204, 120, 0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, medR, 0, Math.PI * 2);
  ctx.fillStyle = '#290B12';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = tellOptions ? tellOptions.color : '#E4BF6B';
  ctx.stroke();

  if (tellOptions) {
    const pulse = 0.74 + 0.26 * Math.sin(tellOptions.time * 4.5);
    const halo = ctx.createRadialGradient(0, 0, medR * 0.2, 0, 0, medR * 1.7);
    halo.addColorStop(0, tellOptions.color);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.45 * pulse;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, medR * 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFF3D0';
    ctx.font = `900 ${Math.round(w * 0.31)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 2);

    const bh = h * 0.16;
    roundedRectPath(ctx, -w * 0.43, h * 0.27, w * 0.86, bh, 5);
    ctx.fillStyle = tellOptions.color;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#F7DF9C';
    ctx.stroke();
    ctx.fillStyle = '#FFFDF5';
    ctx.font = `800 ${Math.round(w * 0.115)}px system-ui, sans-serif`;
    ctx.fillText(tellOptions.label ?? 'TELL', 0, h * 0.27 + bh / 2 + 0.5);
  } else {
    drawLanternIcon(ctx, 0, 0, medR * 0.68, true);
  }
}

export function drawCardFace(ctx, card, w, h, state = {}) {
  const suit = SUITS[card.suit];
  const r = Math.max(9, w * 0.088);
  const selected = !!state.selected;
  const hovered = !!state.hovered;
  const dimmed = !!state.dimmed;
  const winnerGlow = !!state.winnerGlow;

  if (selected || winnerGlow || hovered) {
    ctx.save();
    ctx.shadowColor = winnerGlow ? '#FFE072' : selected ? '#FFD459' : suit.bright;
    ctx.shadowBlur = winnerGlow ? 28 : selected ? 22 : 14;
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = winnerGlow ? 'rgba(255, 224, 114, 0.38)' : 'rgba(255, 212, 89, 0.22)';
    ctx.fill();
    ctx.restore();
  }

  // 3D beveled physical card thickness edge (warm gilded parchment side)
  roundedRectPath(ctx, -w / 2 + 2.2, -h / 2 + 2.8, w, h, r);
  ctx.fillStyle = '#523B1F';
  ctx.fill();

  // Warm antique cream-ivory vellum body with gentle aged vignette
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  const parch = ctx.createRadialGradient(-w * 0.1, -h * 0.15, w * 0.08, 0, 0, h * 0.72);
  parch.addColorStop(0, '#FFFDF6');
  parch.addColorStop(0.65, '#F5E7C9');
  parch.addColorStop(1, '#DFC89B');
  ctx.fillStyle = parch;
  ctx.fill();

  // Thick suit-colored outer border for instant thumbnail recognition
  ctx.lineWidth = selected || winnerGlow ? Math.max(3.6, w * 0.036) : Math.max(2.7, w * 0.028);
  ctx.strokeStyle = selected || winnerGlow ? '#FFE070' : suit.color;
  ctx.stroke();

  // Fine inner double-gilt frame + brass corner rivets
  const pad = w * 0.062;
  roundedRectPath(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, r * 0.52);
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = 'rgba(182, 134, 42, 0.72)';
  ctx.stroke();

  ctx.fillStyle = '#C99634';
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * (w / 2 - pad - 3), sy * (h / 2 - pad - 3), 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top-left GIANT high-contrast rank numeral
  const rankFont = Math.round(w * 0.305);
  ctx.fillStyle = suit.deep;
  ctx.font = `900 ${rankFont}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(card.rank), -w / 2 + w * 0.1, -h / 2 + h * 0.05);

  // Crisp mini suit emblem neatly tucked beside/below rank
  drawSuitEmblem(ctx, card.suit, -w / 2 + w * 0.195, -h / 2 + h * 0.3, w * 0.075);

  // Top-right Burnished-Gold Lantern Cost Medallion + glowing pips
  const costCx = w / 2 - w * 0.21;
  const costCy = -h / 2 + h * 0.135;
  const costR = w * 0.13;
  ctx.beginPath();
  ctx.arc(costCx, costCy, costR, 0, Math.PI * 2);
  const costGrad = ctx.createRadialGradient(costCx - 2, costCy - 3, 2, costCx, costCy, costR);
  costGrad.addColorStop(0, '#4B3418');
  costGrad.addColorStop(1, '#1D1309');
  ctx.fillStyle = costGrad;
  ctx.fill();
  ctx.lineWidth = Math.max(1.8, w * 0.02);
  ctx.strokeStyle = '#F5CE62';
  ctx.stroke();

  ctx.fillStyle = '#FFE78E';
  ctx.font = `900 ${Math.round(w * 0.185)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), costCx, costCy + 0.5);

  const pipSpacing = w * 0.082;
  const pipStartX = costCx - ((card.cost - 1) * pipSpacing) / 2;
  const pipY = costCy + costR + h * 0.048;
  for (let i = 0; i < card.cost; i += 1) {
    drawLanternIcon(ctx, pipStartX + i * pipSpacing, pipY, w * 0.034, true);
  }

  // Central Museum-Grade Jewel-Toned Arched Illustration Cartouche!
  drawSuitCartouche(ctx, card, 0, h * 0.065, w * 0.68, h * 0.44);

  // Bottom high-contrast suit-colored effect ribbon with gold clasps
  const banW = w * 0.85;
  const banH = h * 0.16;
  const banY = h / 2 - banH - h * 0.064;
  roundedRectPath(ctx, -banW / 2, banY, banW, banH, 5);
  const banGrad = ctx.createLinearGradient(-banW / 2, banY, banW / 2, banY + banH);
  banGrad.addColorStop(0, suit.deep);
  banGrad.addColorStop(0.5, suit.color);
  banGrad.addColorStop(1, suit.deep);
  ctx.fillStyle = banGrad;
  ctx.fill();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = '#ECC86E';
  ctx.stroke();

  ctx.fillStyle = '#FFFDF6';
  ctx.font = `800 ${Math.round(w * 0.122)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.effect.label, 0, banY + banH / 2 + 0.5);

  if (dimmed) {
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = 'rgba(18, 15, 13, 0.44)';
    ctx.fill();
  }
}

export function drawCard(ctx, card, x, y, w, h, options = {}) {
  const rot = options.rot ?? 0;
  const scale = options.scale ?? 1;
  const flip = options.flip ?? 1;
  const shadow = options.shadow ?? true;
  const flipScaleX = Math.max(0.05, Math.abs(flip));
  const faceUp = flip >= 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale * flipScaleX, scale);

  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(3, 8, 6, 0.64)';
    ctx.shadowBlur = options.selected ? 24 : 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = options.selected ? 13 : 8;
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.max(8, w * 0.088));
    ctx.fillStyle = '#18100B';
    ctx.fill();
    ctx.restore();
  }

  if (faceUp && card) {
    drawCardFace(ctx, card, w, h, options);
  } else {
    drawCardBack(ctx, w, h, options.tellOptions ?? null);
  }
  ctx.restore();
}
