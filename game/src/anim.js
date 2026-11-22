// Spring-physics card motion, 3D flip interpolation, floating callouts, and themed particle system.

export class SpringCard {
  constructor(uid, x, y, rot = 0, scale = 1, flip = 1) {
    this.uid = uid;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.tx = x;
    this.ty = y;
    this.rot = rot;
    this.trot = rot;
    this.scale = scale;
    this.tscale = scale;
    // flip: 1 = face up, -1 = face down
    this.flip = flip;
    this.tflip = flip;
    this.glow = 0;
    this.tglow = 0;
    this.z = 0;
  }

  setTarget(x, y, rot = 0, scale = 1, flip = 1, glow = 0) {
    this.tx = x;
    this.ty = y;
    this.trot = rot;
    this.tscale = scale;
    this.tflip = flip;
    this.tglow = glow;
  }

  snapToTarget() {
    this.x = this.tx;
    this.y = this.ty;
    this.vx = 0;
    this.vy = 0;
    this.rot = this.trot;
    this.scale = this.tscale;
    this.flip = this.tflip;
    this.glow = this.tglow;
  }

  step(dt) {
    const clamped = Math.min(0.05, dt);
    const stiffness = 210;
    const damping = 22;
    const ax = (this.tx - this.x) * stiffness - this.vx * damping;
    const ay = (this.ty - this.y) * stiffness - this.vy * damping;
    this.vx += ax * clamped;
    this.vy += ay * clamped;
    this.x += this.vx * clamped;
    this.y += this.vy * clamped;

    const k = 1 - Math.exp(-14 * clamped);
    this.rot += (this.trot - this.rot) * k;
    this.scale += (this.tscale - this.scale) * k;
    this.glow += (this.tglow - this.glow) * k;

    const flipSpeed = 6.5 * clamped;
    if (this.flip < this.tflip) this.flip = Math.min(this.tflip, this.flip + flipSpeed);
    else if (this.flip > this.tflip) this.flip = Math.max(this.tflip, this.flip - flipSpeed);
  }
}

export class AnimationEngine {
  constructor() {
    this.time = 0;
    this.cards = new Map();
    this.particles = [];
    this.callouts = [];
    this.shake = 0;
    this.flash = 0;
    this.flashColor = '#FFD459';
    this.motes = [];
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    this.motes = [];
    let s = 1337;
    const rand = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < 34; i += 1) {
      this.motes.push({
        x: 40 + rand() * 1200,
        y: 40 + rand() * 640,
        r: 1.2 + rand() * 2.4,
        vx: (rand() - 0.5) * 9,
        vy: -5 - rand() * 11,
        phase: rand() * Math.PI * 2,
        alpha: 0.16 + rand() * 0.32,
      });
    }
  }

  ensureCard(uid, spawnX = 132, spawnY = 330, startFaceUp = false) {
    let sc = this.cards.get(uid);
    if (!sc) {
      sc = new SpringCard(uid, spawnX, spawnY, -0.18, 0.72, startFaceUp ? 1 : -1);
      this.cards.set(uid, sc);
    }
    return sc;
  }

  pruneCards(activeUids) {
    for (const uid of this.cards.keys()) {
      if (!activeUids.has(uid)) this.cards.delete(uid);
    }
  }

  snapAll() {
    for (const sc of this.cards.values()) sc.snapToTarget();
  }

  triggerShake(intensity = 8, flashColor = null) {
    this.shake = Math.max(this.shake, intensity);
    if (flashColor) {
      this.flash = 0.45;
      this.flashColor = flashColor;
    }
  }

  spawnCallout(x, y, text, color = '#FFD459', size = 26) {
    this.callouts.push({
      x,
      y,
      vy: -38,
      text,
      color,
      size,
      life: 1.45,
      maxLife: 1.45,
    });
  }

  spawnBurst(x, y, color, count = 26, spread = 210, upward = 60, seed = 0) {
    let s = (seed || Math.floor((this.time + 1) * 9973) + Math.floor(x * 13 + y * 7)) >>> 0;
    const rand = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < count; i += 1) {
      const angle = rand() * Math.PI * 2;
      const speed = (0.35 + rand() * 0.85) * spread;
      this.particles.push({
        x: x + (rand() - 0.5) * 28,
        y: y + (rand() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - upward,
        gravity: 170 + rand() * 110,
        size: 2.5 + rand() * 4.5,
        color,
        life: 0.75 + rand() * 0.85,
        maxLife: 1.6,
        shape: rand() > 0.45 ? 'diamond' : 'spark',
        rot: rand() * Math.PI * 2,
        vrot: (rand() - 0.5) * 8,
      });
    }
  }

  spawnVictoryFlourish(cx = 630, cy = 490) {
    this.spawnBurst(cx, cy, '#FFD866', 48, 360, 150, 701);
    this.spawnBurst(cx - 180, cy + 10, '#FF7A52', 24, 240, 120, 702);
    this.spawnBurst(cx + 180, cy + 10, '#5BE29A', 24, 240, 120, 703);
    this.spawnBurst(cx, cy - 45, '#FFF4C2', 28, 310, 160, 704);
  }

  spawnDefeatWisps(cx = 630, cy = 350) {
    this.spawnBurst(cx, cy, '#899EB8', 28, 130, 80, 901);
    this.spawnBurst(cx - 70, cy + 30, '#D44A4A', 18, 150, 50, 902);
  }

  step(dt, isDefeat = false) {
    const clamped = Math.min(0.05, dt);
    this.time += clamped;

    for (const sc of this.cards.values()) sc.step(clamped);

    this.shake = Math.max(0, this.shake - clamped * 28);
    this.flash = Math.max(0, this.flash - clamped * 1.4);

    for (const mote of this.motes) {
      mote.x += (mote.vx + Math.sin(this.time * 0.9 + mote.phase) * 7) * clamped;
      mote.y += (isDefeat ? mote.vy * 0.45 : mote.vy) * clamped;
      if (mote.y < 26) {
        mote.y = 694;
        mote.x = ((mote.x + 173) % 1200) + 40;
      }
      if (mote.x < 30) mote.x = 1250;
      if (mote.x > 1250) mote.x = 30;
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= clamped;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * clamped;
      p.x += p.vx * clamped;
      p.y += p.vy * clamped;
      p.vx *= 0.985;
      p.rot += p.vrot * clamped;
    }

    for (let i = this.callouts.length - 1; i >= 0; i -= 1) {
      const c = this.callouts[i];
      c.life -= clamped;
      if (c.life <= 0) {
        this.callouts.splice(i, 1);
        continue;
      }
      c.y += c.vy * clamped;
      c.vy *= 0.95;
    }
  }
}
