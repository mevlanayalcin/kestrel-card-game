// Bespoke procedural playing card renderer: thumbnail-legible color+shape emblems, parchment, and filigree.
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
  const monochrome = options.monochrome ?? false;
  const fillPrimary = monochrome ? (options.color ?? '#FBF4E3') : suit.color;
  const fillBright = monochrome ? (options.color ?? '#FFFFFF') : suit.bright;
  const strokeDeep = monochrome ? 'rgba(0,0,0,0.28)' : suit.deep;

  ctx.save();
  ctx.translate(cx, cy);

  if (suitId === 'ember') {
    // Bold 4-pointed Crimson Flame Diamond with bright golden-orange inner spark
    ctx.beginPath();
    ctx.moveTo(0, -radius * 1.12);
    ctx.quadraticCurveTo(radius * 0.42, -radius * 0.36, radius * 0.92, 0);
    ctx.quadraticCurveTo(radius * 0.38, radius * 0.38, 0, radius * 1.08);
    ctx.quadraticCurveTo(-radius * 0.38, radius * 0.38, -radius * 0.92, 0);
    ctx.quadraticCurveTo(-radius * 0.42, -radius * 0.36, 0, -radius * 1.12);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -radius, 0, radius);
    grad.addColorStop(0, fillBright);
    grad.addColorStop(0.55, fillPrimary);
    grad.addColorStop(1, strokeDeep);
    ctx.fillStyle = monochrome ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.09);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    if (!monochrome) {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.58);
      ctx.quadraticCurveTo(radius * 0.28, -radius * 0.08, 0, radius * 0.56);
      ctx.quadraticCurveTo(-radius * 0.28, -radius * 0.08, 0, -radius * 0.58);
      ctx.closePath();
      ctx.fillStyle = '#FFE07A';
      ctx.fill();
    }
  } else if (suitId === 'tide') {
    // Bold Sapphire Crescent Moon cradling a curling luminous wave droplet
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.98, 0.52, Math.PI * 2 - 0.52, false);
    ctx.arc(radius * 0.42, -radius * 0.08, radius * 0.72, Math.PI * 2 - 0.78, 0.78, true);
    ctx.closePath();

    const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    grad.addColorStop(0, fillBright);
    grad.addColorStop(0.6, fillPrimary);
    grad.addColorStop(1, strokeDeep);
    ctx.fillStyle = monochrome ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.09);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    // Inner tidal crest droplet inside the crescent hollow
    ctx.beginPath();
    ctx.moveTo(radius * 0.56, -radius * 0.36);
    ctx.quadraticCurveTo(radius * 0.96, 0.08 * radius, radius * 0.52, radius * 0.38);
    ctx.quadraticCurveTo(radius * 0.12, radius * 0.14, radius * 0.56, -radius * 0.36);
    ctx.closePath();
    ctx.fillStyle = monochrome ? fillPrimary : '#A6E3FF';
    ctx.fill();
    if (!monochrome) {
      ctx.lineWidth = Math.max(1, radius * 0.06);
      ctx.strokeStyle = fillPrimary;
      ctx.stroke();
    }
  } else if (suitId === 'bramble') {
    // Sculptural 3-lobed Emerald Botanical Tri-Leaf / Hex Silhouette
    const lobes = [
      { a: -Math.PI / 2, dist: 0.44 },
      { a: Math.PI / 6, dist: 0.44 },
      { a: (5 * Math.PI) / 6, dist: 0.44 },
    ];
    const grad = ctx.createRadialGradient(0, -radius * 0.2, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, fillBright);
    grad.addColorStop(0.65, fillPrimary);
    grad.addColorStop(1, strokeDeep);

    ctx.fillStyle = monochrome ? fillPrimary : grad;
    ctx.strokeStyle = strokeDeep;
    ctx.lineWidth = Math.max(1.5, radius * 0.09);

    for (const lobe of lobes) {
      ctx.save();
      ctx.rotate(lobe.a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-radius * 0.52, -radius * 0.25, -radius * 0.48, -radius * 0.88, 0, -radius * 1.06);
      ctx.bezierCurveTo(radius * 0.48, -radius * 0.88, radius * 0.52, -radius * 0.25, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Crisp bottom stem + golden center knot
    ctx.beginPath();
    ctx.moveTo(-radius * 0.12, radius * 0.25);
    ctx.lineTo(radius * 0.12, radius * 0.25);
    ctx.lineTo(radius * 0.2, radius * 0.96);
    ctx.lineTo(-radius * 0.2, radius * 0.96);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!monochrome) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#DDF7C5';
      ctx.fill();
    }
  } else {
    // Brass: 8-Spoke Burnished Gold Sunburst Gear Medallion
    const teeth = 8;
    const outerR = radius * 1.04;
    const midR = radius * 0.74;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i += 1) {
      const angle = (i * Math.PI) / teeth - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : midR;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(-radius * 0.15, -radius * 0.2, radius * 0.1, 0, 0, outerR);
    grad.addColorStop(0, '#FFF1A8');
    grad.addColorStop(0.5, fillBright);
    grad.addColorStop(0.85, fillPrimary);
    grad.addColorStop(1, strokeDeep);
    ctx.fillStyle = monochrome ? fillPrimary : grad;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, radius * 0.085);
    ctx.strokeStyle = strokeDeep;
    ctx.stroke();

    if (!monochrome) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#523406';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE88A';
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
  // Lantern body diamond-hex
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
  ctx.lineWidth = Math.max(1.3, size * 0.15);
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

export function drawCardBack(ctx, w, h, tellOptions = null) {
  const r = Math.max(8, w * 0.085);

  // Drop shadow & crisp dark rim
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  const bg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  bg.addColorStop(0, '#5A1B27');
  bg.addColorStop(0.5, '#3E111A');
  bg.addColorStop(1, '#26090F');
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.lineWidth = Math.max(2, w * 0.025);
  ctx.strokeStyle = '#DFBA67';
  ctx.stroke();

  // Inner gilded frame
  const inset = w * 0.08;
  roundedRectPath(ctx, -w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, r * 0.62);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(236, 198, 114, 0.65)';
  ctx.stroke();

  // Geometric gold diamond lattice clipped inside inner frame
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(232, 189, 98, 0.18)';
  ctx.lineWidth = 1;
  const step = Math.max(12, w * 0.17);
  for (let d = -h; d <= h + w; d += step) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + d, -h / 2);
    ctx.lineTo(-w / 2 + d - h, h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w / 2 + d - h, -h / 2);
    ctx.lineTo(-w / 2 + d, h / 2);
    ctx.stroke();
  }
  ctx.restore();

  // Central gilded medallion
  const medR = w * 0.25;
  ctx.beginPath();
  ctx.arc(0, 0, medR, 0, Math.PI * 2);
  ctx.fillStyle = '#2B0C13';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = tellOptions ? tellOptions.color : '#E2BE6B';
  ctx.stroke();

  if (tellOptions) {
    // Glowing rival tell wax seal on mystery committed card
    const pulse = 0.72 + 0.28 * Math.sin(tellOptions.time * 4.5);
    const halo = ctx.createRadialGradient(0, 0, medR * 0.2, 0, 0, medR * 1.65);
    halo.addColorStop(0, tellOptions.color);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.42 * pulse;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, medR * 1.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFF3D0';
    ctx.font = `900 ${Math.round(w * 0.31)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 2);

    // Small tell banner at bottom of mystery card
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
    drawLanternIcon(ctx, 0, 0, medR * 0.7, true);
  }
}

export function drawCardFace(ctx, card, w, h, state = {}) {
  const suit = SUITS[card.suit];
  const r = Math.max(9, w * 0.088);
  const selected = !!state.selected;
  const hovered = !!state.hovered;
  const dimmed = !!state.dimmed;
  const winnerGlow = !!state.winnerGlow;

  // Selection or triumph aura behind card
  if (selected || winnerGlow || hovered) {
    ctx.save();
    ctx.shadowColor = winnerGlow ? '#FFE072' : selected ? '#FFD459' : suit.bright;
    ctx.shadowBlur = winnerGlow ? 28 : selected ? 22 : 14;
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = winnerGlow ? 'rgba(255, 224, 114, 0.38)' : 'rgba(255, 212, 89, 0.22)';
    ctx.fill();
    ctx.restore();
  }

  // Ivory parchment card body
  roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
  const parch = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  parch.addColorStop(0, '#FFFDF5');
  parch.addColorStop(0.55, '#F8EED8');
  parch.addColorStop(1, '#E9D9B6');
  ctx.fillStyle = parch;
  ctx.fill();

  // Thick suit-colored outer border for instant thumbnail recognition
  ctx.lineWidth = selected || winnerGlow ? Math.max(3.6, w * 0.036) : Math.max(2.6, w * 0.028);
  ctx.strokeStyle = selected || winnerGlow ? '#FFD866' : suit.color;
  ctx.stroke();

  // Subtle suit-tinted inner panel
  const pad = w * 0.068;
  roundedRectPath(ctx, -w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2, r * 0.55);
  ctx.fillStyle = suit.tint;
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(1.4, w * 0.015);
  ctx.strokeStyle = suit.color;
  ctx.stroke();

  // Top-left GIANT high-contrast rank numeral
  const rankFont = Math.round(w * 0.315);
  ctx.fillStyle = suit.deep;
  ctx.font = `900 ${rankFont}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(card.rank), -w / 2 + w * 0.11, -h / 2 + h * 0.052);

  // Small suit shape cleanly spaced directly beneath rank numeral
  drawSuitEmblem(ctx, card.suit, -w / 2 + w * 0.205, -h / 2 + h * 0.322, w * 0.082);

  // Top-right Lantern Cost Crest (bold dark brass medallion + glowing gold cost numeral + pips)
  const costCx = w / 2 - w * 0.215;
  const costCy = -h / 2 + h * 0.145;
  const costR = w * 0.135;

  ctx.beginPath();
  ctx.arc(costCx, costCy, costR, 0, Math.PI * 2);
  const costGrad = ctx.createRadialGradient(costCx - 2, costCy - 3, 2, costCx, costCy, costR);
  costGrad.addColorStop(0, '#443018');
  costGrad.addColorStop(1, '#1E140A');
  ctx.fillStyle = costGrad;
  ctx.fill();
  ctx.lineWidth = Math.max(1.8, w * 0.02);
  ctx.strokeStyle = '#F2C95E';
  ctx.stroke();

  ctx.fillStyle = '#FFE485';
  ctx.font = `900 ${Math.round(w * 0.19)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), costCx, costCy + 0.5);

  // Golden lantern cost pips directly under the cost medallion
  const pipSpacing = w * 0.085;
  const pipStartX = costCx - ((card.cost - 1) * pipSpacing) / 2;
  const pipY = costCy + costR + h * 0.052;
  for (let i = 0; i < card.cost; i += 1) {
    drawLanternIcon(ctx, pipStartX + i * pipSpacing, pipY, w * 0.036, true);
  }

  // Center GIANT geometric Suit Medallion inside engraved filigree ring
  const medCy = h * 0.055;
  const ringR = w * 0.305;

  ctx.beginPath();
  ctx.arc(0, medCy, ringR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 252, 242, 0.9)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.6, w * 0.018);
  ctx.strokeStyle = card.rank >= 7 ? '#D8A230' : suit.color;
  ctx.stroke();

  // Outer master filigree ring on high-rank cards (7–9)
  if (card.rank >= 7) {
    ctx.beginPath();
    ctx.arc(0, medCy, ringR + w * 0.035, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#C98E20';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawSuitEmblem(ctx, card.suit, 0, medCy, w * 0.255);

  // Bottom high-contrast suit-colored effect ribbon
  const banW = w * 0.85;
  const banH = h * 0.165;
  const banY = h / 2 - banH - h * 0.068;
  roundedRectPath(ctx, -banW / 2, banY, banW, banH, 5);
  const banGrad = ctx.createLinearGradient(-banW / 2, banY, banW / 2, banY + banH);
  banGrad.addColorStop(0, suit.deep);
  banGrad.addColorStop(0.5, suit.color);
  banGrad.addColorStop(1, suit.deep);
  ctx.fillStyle = banGrad;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#E8C56E';
  ctx.stroke();

  ctx.fillStyle = '#FFFDF6';
  ctx.font = `800 ${Math.round(w * 0.122)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.effect.label, 0, banY + banH / 2 + 0.5);

  if (dimmed) {
    roundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
    ctx.fillStyle = 'rgba(18, 16, 14, 0.42)';
    ctx.fill();
  }
}

export function drawCard(ctx, card, x, y, w, h, options = {}) {
  const rot = options.rot ?? 0;
  const scale = options.scale ?? 1;
  const flip = options.flip ?? 1; // 1 = face up, -1 = face down
  const shadow = options.shadow ?? true;

  const flipScaleX = Math.max(0.05, Math.abs(flip));
  const faceUp = flip >= 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale * flipScaleX, scale);

  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(4, 9, 7, 0.58)';
    ctx.shadowBlur = options.selected ? 22 : 14;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = options.selected ? 12 : 7;
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
