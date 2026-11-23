// Spring-physics card motion, 3D flip interpolation, clash shockwave rings, callouts, and themed particles.

export class SpringCard {
  constructor(uid, x, y, rot = 0, scale = 1, flip = 1) {
    this.uid = uid; this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.tx = x; this.ty = y; this.rot = rot; this.trot = rot;
    this.scale = scale; this.tscale = scale; this.flip = flip; this.tflip = flip;
    this.glow = 0; this.tglow = 0;
  }

  setTarget(x, y, rot = 0, scale = 1, flip = 1, glow = 0) {
    this.tx = x; this.ty = y; this.trot = rot; this.tscale = scale; this.tflip = flip; this.tglow = glow;
  }

  snapToTarget() {
    this.x = this.tx; this.y = this.ty; this.vx = 0; this.vy = 0;
    this.rot = this.trot; this.scale = this.tscale; this.flip = this.tflip; this.glow = this.tglow;
  }

  step(dt) {
    const c = Math.min(0.05, dt);
    this.vx += ((this.tx - this.x) * 210 - this.vx * 22) * c;
    this.vy += ((this.ty - this.y) * 210 - this.vy * 22) * c;
    this.x += this.vx * c; this.y += this.vy * c;
    const k = 1 - Math.exp(-14 * c);
    this.rot += (this.trot - this.rot) * k;
    this.scale += (this.tscale - this.scale) * k;
    this.glow += (this.tglow - this.glow) * k;
    const fs = 6.5 * c;
    if (this.flip < this.tflip) this.flip = Math.min(this.tflip, this.flip + fs);
    else if (this.flip > this.tflip) this.flip = Math.max(this.tflip, this.flip - fs);
  }
}

export class AnimationEngine {
  constructor() {
    this.time = 0; this.cards = new Map(); this.particles = []; this.callouts = []; this.rings = [];
    this.shake = 0; this.flash = 0; this.flashColor = '#FFD459'; this.motes = [];
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    this.motes = [];
    let s = 1337;
    const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i < 36; i += 1) {
      this.motes.push({ x: 40 + r() * 1200, y: 40 + r() * 640, r: 1.2 + r() * 2.4, vx: (r() - 0.5) * 9, vy: -5 - r() * 11, phase: r() * Math.PI * 2, alpha: 0.16 + r() * 0.32 });
    }
  }

  ensureCard(uid, x = 96, y = 310, faceUp = false) {
    let sc = this.cards.get(uid);
    if (!sc) { sc = new SpringCard(uid, x, y, -0.18, 0.72, faceUp ? 1 : -1); this.cards.set(uid, sc); }
    return sc;
  }

  pruneCards(active) { for (const uid of this.cards.keys()) if (!active.has(uid)) this.cards.delete(uid); }
  snapAll() { for (const sc of this.cards.values()) sc.snapToTarget(); }

  triggerShake(intensity = 8, flashColor = null) {
    this.shake = Math.max(this.shake, intensity);
    if (flashColor) { this.flash = 0.45; this.flashColor = flashColor; }
  }

  spawnShockwave(x, y, color = '#FFE066', maxR = 175, lw = 4.5) {
    this.rings.push({ x, y, r: 22, maxR, color, lw, life: 0.65, maxLife: 0.65 });
  }

  spawnCallout(x, y, text, color = '#FFD459', size = 28) {
    this.callouts.push({ x, y, vy: -34, text, color, size, life: 1.5, maxLife: 1.5 });
  }

  spawnBurst(x, y, color, count = 26, spread = 210, upward = 60, seed = 0) {
    let s = (seed || Math.floor((this.time + 1) * 9973) + Math.floor(x * 13 + y * 7)) >>> 0;
    const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i < count; i += 1) {
      const a = r() * Math.PI * 2; const spd = (0.35 + r() * 0.85) * spread;
      this.particles.push({
        x: x + (r() - 0.5) * 28, y: y + (r() - 0.5) * 24,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - upward, gravity: 165 + r() * 105,
        size: 2.8 + r() * 4.8, color, life: 0.8 + r() * 0.85, maxLife: 1.65,
        shape: r() > 0.4 ? 'diamond' : 'spark', rot: r() * Math.PI * 2, vrot: (r() - 0.5) * 8,
      });
    }
  }

  spawnVictoryFlourish(cx = 640, cy = 326) {
    this.spawnShockwave(cx, cy, '#FFE270', 270, 4);
    this.spawnBurst(cx, cy, '#FFD866', 48, 360, 130, 701);
    this.spawnBurst(cx - 190, cy + 10, '#FF7A52', 24, 240, 110, 702);
    this.spawnBurst(cx + 190, cy + 10, '#5BE29A', 24, 240, 110, 703);
    this.spawnBurst(cx, cy - 35, '#FFF4C2', 26, 290, 140, 704);
  }

  spawnDefeatWisps(cx = 640, cy = 515) {
    this.spawnShockwave(cx, cy, '#E05252', 190, 3.5);
    this.spawnBurst(cx, cy, '#899EB8', 28, 140, 80, 901);
    this.spawnBurst(cx - 70, cy + 25, '#D44A4A', 20, 160, 50, 902);
  }

  step(dt, isDefeat = false) {
    const c = Math.min(0.05, dt);
    this.time += c;
    for (const sc of this.cards.values()) sc.step(c);
    this.shake = Math.max(0, this.shake - c * 28);
    this.flash = Math.max(0, this.flash - c * 1.4);

    for (const m of this.motes) {
      m.x += (m.vx + Math.sin(this.time * 0.9 + m.phase) * 7) * c;
      m.y += (isDefeat ? m.vy * 0.45 : m.vy) * c;
      if (m.y < 26) { m.y = 694; m.x = ((m.x + 173) % 1200) + 40; }
      if (m.x < 30) m.x = 1250; else if (m.x > 1250) m.x = 30;
    }
    for (let i = this.rings.length - 1; i >= 0; i -= 1) {
      const g = this.rings[i];
      g.life -= c;
      if (g.life <= 0) { this.rings.splice(i, 1); continue; }
      const p = 1 - g.life / g.maxLife;
      g.r = 22 + (g.maxR - 22) * (1 - (1 - p) * (1 - p));
    }
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= c;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += p.gravity * c; p.x += p.vx * c; p.y += p.vy * c; p.vx *= 0.985; p.rot += p.vrot * c;
    }
    for (let i = this.callouts.length - 1; i >= 0; i -= 1) {
      const o = this.callouts[i];
      o.life -= c;
      if (o.life <= 0) { this.callouts.splice(i, 1); continue; }
      o.y += o.vy * c; o.vy *= 0.95;
    }
  }
}
