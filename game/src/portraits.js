// Bespoke canvas-drawn rival cameo portraits, flickering parlor candles, wooden tray, and brass tokens.
import { roundedRectPath, drawLanternIcon } from './card-art.js';

export function drawRivalPortrait(ctx, rivalId, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer gilded cameo bezel
  ctx.beginPath();
  ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
  const rim = ctx.createLinearGradient(-r, -r, r, r);
  rim.addColorStop(0, '#FCE49A');
  rim.addColorStop(0.5, '#B37F22');
  rim.addColorStop(1, '#F2CE72');
  ctx.fillStyle = rim;
  ctx.fill();

  // Clip portrait interior
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.save();
  ctx.clip();

  if (rivalId === 'maren') {
    // Maren the Lamplighter: warm hearth backdrop, crimson cloak, gleaming brass goggles
    const bg = ctx.createRadialGradient(0, -r * 0.25, r * 0.1, 0, 0, r);
    bg.addColorStop(0, '#78261A');
    bg.addColorStop(0.7, '#3C120E');
    bg.addColorStop(1, '#1E0807');
    ctx.fillStyle = bg;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Warm rim light behind shoulders
    ctx.fillStyle = 'rgba(255, 186, 82, 0.22)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.05, r * 0.78, 0, Math.PI * 2);
    ctx.fill();

    // Cloaked shoulders
    ctx.fillStyle = '#581915';
    ctx.beginPath();
    ctx.moveTo(-r * 0.92, r * 1.05);
    ctx.quadraticCurveTo(-r * 0.65, r * 0.22, 0, r * 0.22);
    ctx.quadraticCurveTo(r * 0.65, r * 0.22, r * 0.92, r * 1.05);
    ctx.closePath();
    ctx.fill();

    // Hood & artisan cap
    ctx.fillStyle = '#8F291E';
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, r * 0.56, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(r * 0.55, r * 0.45);
    ctx.lineTo(-r * 0.55, r * 0.45);
    ctx.closePath();
    ctx.fill();

    // Face & scarf
    ctx.fillStyle = '#E6B891';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.02, r * 0.34, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crimson scarf collar + tiny glowing lantern brooch
    ctx.fillStyle = '#A83222';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, r * 0.46, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    drawLanternIcon(ctx, 0, r * 0.56, r * 0.2, true);

    // Signature burnished brass lamplighter goggles
    ctx.strokeStyle = '#3B2310';
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, -r * 0.08);
    ctx.lineTo(r * 0.42, -r * 0.08);
    ctx.stroke();

    for (const gx of [-r * 0.17, r * 0.17]) {
      ctx.beginPath();
      ctx.arc(gx, -r * 0.08, r * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE278';
      ctx.fill();
      ctx.lineWidth = Math.max(1.4, r * 0.075);
      ctx.strokeStyle = '#8E5F14';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx - r * 0.04, -r * 0.12, r * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF0';
      ctx.fill();
    }
  } else if (rivalId === 'vesper') {
    // Vesper of the Weir: luminous moonlit aqua halo behind hooded sapphire oracle + bright silver crescent
    const bg = ctx.createRadialGradient(0, -r * 0.25, r * 0.1, 0, 0, r);
    bg.addColorStop(0, '#5EC2F5');
    bg.addColorStop(0.62, '#1A5A8C');
    bg.addColorStop(1, '#0A223B');
    ctx.fillStyle = bg;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.fillStyle = '#13426E';
    ctx.beginPath();
    ctx.moveTo(-r * 0.92, r * 1.05);
    ctx.bezierCurveTo(-r * 0.82, -r * 0.7, r * 0.82, -r * 0.7, r * 0.92, r * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * 0.075);
    ctx.strokeStyle = '#B8EAFF';
    ctx.stroke();

    ctx.fillStyle = '#0C2744';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.02, r * 0.44, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E6F4FF';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.31, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1676C4';
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, r * 0.03, r * 0.07, r * 0.045, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.12, r * 0.03, r * 0.07, r * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright gleaming pearl-silver crescent diadem
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -r * 0.38, r * 0.24, 0.2, Math.PI - 0.2, false);
    ctx.arc(0, -r * 0.48, r * 0.19, Math.PI - 0.35, 0.35, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#42E695';
    ctx.beginPath();
    ctx.arc(0, r * 0.58, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  } else {
    // Archivist Corvus: deep emerald-obsidian study, velvet scholar mantle, gilded raven half-mask & monocle
    const bg = ctx.createRadialGradient(0, -r * 0.2, r * 0.1, 0, 0, r);
    bg.addColorStop(0, '#1D563A');
    bg.addColorStop(0.68, '#0E281C');
    bg.addColorStop(1, '#07140E');
    ctx.fillStyle = bg;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Emerald quill plume rising behind shoulder
    ctx.save();
    ctx.translate(r * 0.35, -r * 0.22);
    ctx.rotate(0.45);
    ctx.fillStyle = '#3FD482';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.22, r * 0.12, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // High velvet scholar collar & mantle
    ctx.fillStyle = '#1B1A24';
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 1.05);
    ctx.lineTo(-r * 0.56, r * 0.08);
    ctx.lineTo(0, r * 0.46);
    ctx.lineTo(r * 0.56, r * 0.08);
    ctx.lineTo(r * 0.95, r * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#E0B85A';
    ctx.lineWidth = Math.max(1.2, r * 0.06);
    ctx.stroke();

    // Sculpted gilded raven archivist half-mask & head
    ctx.fillStyle = '#2A2530';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.12, r * 0.38, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8C162';
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, -r * 0.18);
    ctx.quadraticCurveTo(0, -r * 0.38, r * 0.36, -r * 0.18);
    ctx.lineTo(r * 0.24, r * 0.1);
    ctx.lineTo(0, r * 0.28);
    ctx.lineTo(-r * 0.24, r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6A470A';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Sharp glowing amber eyes + gilt monocle lens
    ctx.fillStyle = '#2B0C0B';
    ctx.beginPath();
    ctx.ellipse(-r * 0.14, -r * 0.08, r * 0.09, r * 0.055, 0.18, 0, Math.PI * 2);
    ctx.ellipse(r * 0.14, -r * 0.08, r * 0.09, r * 0.055, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6A4D';
    ctx.beginPath();
    ctx.arc(-r * 0.13, -r * 0.08, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.13, -r * 0.08, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Gold monocle rim on right eye
    ctx.beginPath();
    ctx.arc(r * 0.14, -r * 0.08, r * 0.125, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFF0A8';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }

  ctx.restore();

  // Inner subtle vignette & highlight ring
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(255, 244, 198, 0.6)';
  ctx.stroke();
  ctx.restore();
}

export function drawParlorCandle(ctx, cx, cy, scale, time, snuffed = false, onPlinth = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Grounded table-contact shadow & warm velvet light pool beneath the brass saucer
  if (!snuffed) {
    const pool = ctx.createRadialGradient(0, 12, 6, 0, 12, 64);
    pool.addColorStop(0, 'rgba(255, 204, 96, 0.34)');
    pool.addColorStop(0.55, 'rgba(255, 162, 54, 0.12)');
    pool.addColorStop(1, 'rgba(255, 140, 30, 0)');
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(0, 14, 64, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (onPlinth) {
    // Grounded carved walnut & brass parlor coaster resting on the baize
    ctx.beginPath();
    ctx.ellipse(0, 18, 30, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(3, 8, 6, 0.62)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 14, 27, 11.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3A2112';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CFA244';
    ctx.stroke();
  }

  // Contact shadow immediately under brass dish
  ctx.beginPath();
  ctx.ellipse(0, 15, 20, 8.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(4, 9, 7, 0.65)';
  ctx.fill();

  // Brass holder saucer
  ctx.beginPath();
  ctx.ellipse(0, 12, 18, 8, 0, 0, Math.PI * 2);
  const saucer = ctx.createLinearGradient(-18, 6, 18, 18);
  saucer.addColorStop(0, '#F5D57C');
  saucer.addColorStop(0.5, '#A97822');
  saucer.addColorStop(1, '#583A0B');
  ctx.fillStyle = saucer;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#FCE6A4';
  ctx.stroke();

  // Melted ivory wax pillar
  roundedRectPath(ctx, -9, -8, 18, 20, 4);
  const wax = ctx.createLinearGradient(-9, 0, 9, 0);
  wax.addColorStop(0, '#F7EBD1');
  wax.addColorStop(0.65, '#E4CFA5');
  wax.addColorStop(1, '#B3996F');
  ctx.fillStyle = wax;
  ctx.fill();

  // Wax top ellipse & wick
  ctx.beginPath();
  ctx.ellipse(0, -8, 9, 3.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = snuffed ? '#C9BCA3' : '#FFF7E0';
  ctx.fill();
  ctx.strokeStyle = '#2B1F16';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(0, -13);
  ctx.stroke();

  if (snuffed) {
    // Rising twilight smoke ribbon when lanterns are out
    ctx.strokeStyle = 'rgba(164, 184, 212, 0.48)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(-6, -24, 8, -32, Math.sin(time * 1.4) * 5, -44);
    ctx.stroke();
  } else {
    const sway = Math.sin(time * 7.3 + cx) * 1.6;
    const flick = 0.94 + Math.sin(time * 13.1 + cy) * 0.08;

    // Warm candlelight halo
    const glow = ctx.createRadialGradient(sway * 0.4, -20, 2, 0, -18, 52 * flick);
    glow.addColorStop(0, 'rgba(255, 224, 128, 0.52)');
    glow.addColorStop(0.45, 'rgba(255, 162, 52, 0.2)');
    glow.addColorStop(1, 'rgba(255, 130, 30, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -18, 52 * flick, 0, Math.PI * 2);
    ctx.fill();

    // Outer amber flame teardrop
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(-8, -17, -5 + sway * 0.5, -26, sway, -31 * flick);
    ctx.bezierCurveTo(5 + sway * 0.5, -26, 8, -17, 0, -12);
    ctx.closePath();
    const fg = ctx.createLinearGradient(0, -12, 0, -31);
    fg.addColorStop(0, '#FF8C2B');
    fg.addColorStop(0.6, '#FFD24C');
    fg.addColorStop(1, '#FFF8D4');
    ctx.fillStyle = fg;
    ctx.fill();

    // Hot white-gold flame core
    ctx.beginPath();
    ctx.ellipse(sway * 0.25, -17, 2.8, 5.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF2';
    ctx.fill();
  }
  ctx.restore();
}

export function drawWoodenDeckTray(ctx, x, y, w, h) {
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, 9);
  const wood = ctx.createLinearGradient(x, y, x + w, y + h);
  wood.addColorStop(0, '#4E2D1A');
  wood.addColorStop(0.5, '#341C0F');
  wood.addColorStop(1, '#221108');
  ctx.fillStyle = wood;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#B88930';
  ctx.stroke();

  // Recessed felt well inside wooden tray
  roundedRectPath(ctx, x + 5, y + 5, w - 10, h - 10, 6);
  ctx.fillStyle = '#0D261E';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(236, 198, 114, 0.35)';
  ctx.stroke();
  ctx.restore();
}

export function drawLanternCoin(ctx, cx, cy, r, lit = true) {
  ctx.save();
  ctx.translate(cx, cy);
  if (lit) {
    const halo = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.75);
    halo.addColorStop(0, 'rgba(255, 218, 96, 0.65)');
    halo.addColorStop(1, 'rgba(255, 170, 40, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.75, 0, Math.PI * 2);
    ctx.fill();
  }
  // Physical beveled coin rim + thickness shadow
  ctx.beginPath();
  ctx.arc(0, 1.8, r, 0, Math.PI * 2);
  ctx.fillStyle = lit ? '#694408' : '#181410';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  if (lit) {
    g.addColorStop(0, '#FFF5B8');
    g.addColorStop(0.55, '#F0BD42');
    g.addColorStop(1, '#9A6510');
  } else {
    g.addColorStop(0, '#4E4438');
    g.addColorStop(1, '#26201A');
  }
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = lit ? '#FFE894' : '#584E42';
  ctx.stroke();

  // Inner embossed diamond pip
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.48);
  ctx.lineTo(r * 0.36, 0);
  ctx.lineTo(0, r * 0.48);
  ctx.lineTo(-r * 0.36, 0);
  ctx.closePath();
  ctx.fillStyle = lit ? '#FFFDF0' : '#3A3229';
  ctx.fill();
  ctx.restore();
}
