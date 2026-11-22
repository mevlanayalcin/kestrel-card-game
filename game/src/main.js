// Game bootstrap: responsive 1280x720 DPR canvas, mouse/drag & keyboard controls, and main loop.
import { SUITS } from './cards.js';
import { MatchEngine, PHASES } from './rules.js';
import { AnimationEngine } from './anim.js';
import { SoundEngine } from './audio.js';
import { TableRenderer, STAGE_W, STAGE_H, HAND_CARD_W, HAND_CARD_H, CENTER_X } from './renderer.js';
import { HudRenderer } from './hud.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('table-canvas');
const announcer = document.getElementById('status-announcer');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotParam = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '7', 10);
const initialSeed = Number.isFinite(seedParam) ? seedParam : 7;

const engine = new MatchEngine(initialSeed);
const anim = new AnimationEngine();
const sound = new SoundEngine();
const renderer = new TableRenderer();
const hud = new HudRenderer();

const uiState = {
  hoveredUid: null,
  hoveredButtonId: null,
  draggingUid: null,
  dragStartX: 0,
  dragStartY: 0,
  dragX: 0,
  dragY: 0,
  dragMoved: false,
  toastMessage: '',
  toastTimer: 0,
};

const viewport = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  dpr: 1,
};

function announce(text) {
  if (announcer) announcer.textContent = text;
}

function showToast(msg) {
  uiState.toastMessage = msg;
  uiState.toastTimer = 2.1;
}

// Wire engine gameplay events to animations, particles, sound, and ARIA announcements
engine.onEvent((type, payload) => {
  if (shotParam) return;
  if (type === 'matchStart') {
    sound.cardDeal();
    announce(`Match started against ${payload.rival.name} ${payload.rival.title}.`);
  } else if (type === 'roundStart') {
    sound.cardDeal();
    announce(`Round ${payload.round}. Rival intent: ${payload.telegraph.tellTag}.`);
  } else if (type === 'selectChange') {
    sound.cardSelect(payload.selected);
  } else if (type === 'invalidAction') {
    sound.invalidBuzz();
    showToast(payload.reason);
  } else if (type === 'clash') {
    const c = payload;
    sound.clashImpact(c.winner === 'player', c.playerTrumps || c.counterBreak);
    if (c.winner === 'player') {
      const suitCol = SUITS[c.playerTrick.leadSuit]?.bright ?? '#FFE066';
      anim.triggerShake(c.counterBreak ? 11 : 6, suitCol);
      anim.spawnBurst(410, 290, suitCol, c.counterBreak ? 34 : 22, 220, 75);
      anim.spawnCallout(410, 250, `-${c.damageToOpp} ♥`, '#FFE066', 32);
      if (c.playerTrumps) anim.spawnCallout(CENTER_X, 236, c.counterBreak ? 'COUNTER-BREAK!' : 'TRUMP +3!', '#FFE584', 24);
    } else if (c.winner === 'opponent') {
      const suitCol = SUITS[c.oppTrick.leadSuit]?.bright ?? '#FF665A';
      anim.triggerShake(8, '#FF5C52');
      anim.spawnBurst(852, 290, suitCol, 22, 200, 55);
      anim.spawnCallout(852, 250, `-${c.damageToPlayer} ♥`, '#FF786E', 32);
    } else {
      anim.triggerShake(5, '#E2C374');
      anim.spawnBurst(CENTER_X, 296, '#FFE072', 20, 180, 40);
      anim.spawnCallout(CENTER_X, 240, 'CLASH TIE -2 ♥', '#FFE28A', 24);
    }
    if (c.playerHeal > 0) anim.spawnCallout(132, 540, `+${c.playerHeal} ♥`, '#6BF09E', 24);
    if (c.oppHeal > 0) anim.spawnCallout(132, 114, `+${c.oppHeal} ♥`, '#6BF09E', 22);
    announce(c.headline);
  } else if (type === 'victory') {
    sound.victoryFanfare();
    anim.spawnVictoryFlourish(CENTER_X, 490);
    announce(`Victory! You defeated ${engine.rival.name} with score ${engine.playerScore}.`);
  } else if (type === 'defeat') {
    sound.defeatChord();
    anim.spawnDefeatWisps(CENTER_X, 490);
    announce(`Defeat. ${engine.rival.name} outplayed you in Round ${engine.round}.`);
  }
});

function resizeCanvas() {
  const vw = Math.max(320, window.innerWidth);
  const vh = Math.max(240, window.innerHeight);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);

  const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
  viewport.scale = scale;
  viewport.offsetX = (vw - STAGE_W * scale) / 2;
  viewport.offsetY = (vh - STAGE_H * scale) / 2;
  viewport.dpr = dpr;
}

function clientToStage(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left - viewport.offsetX) / viewport.scale,
    y: (clientY - rect.top - viewport.offsetY) / viewport.scale,
  };
}

function hitTestPlayerHand(sx, sy) {
  if (engine.phase !== PHASES.SELECT || engine.rulesOpen) return null;
  for (let i = engine.playerHand.length - 1; i >= 0; i -= 1) {
    const card = engine.playerHand[i];
    const sc = anim.cards.get(card.uid);
    if (!sc) continue;
    const hw = (HAND_CARD_W * sc.scale) / 2;
    const hh = (HAND_CARD_H * sc.scale) / 2;
    if (sx >= sc.x - hw && sx <= sc.x + hw && sy >= sc.y - hh && sy <= sc.y + hh) {
      return card;
    }
  }
  return null;
}

function handleButtonAction(button) {
  if (!button) return;
  const id = button.id;
  if (id === 'btn-mute') {
    sound.toggleMute();
    announce(sound.muted ? 'Sound muted.' : 'Sound enabled.');
  } else if (id === 'btn-rules' || id === 'btn-rules-title') {
    engine.rulesOpen = !engine.rulesOpen;
    sound.cardSelect(true);
  } else if (id === 'btn-close-rules') {
    engine.rulesOpen = false;
    sound.cardSelect(false);
  } else if (id === 'btn-start') {
    engine.startMatch(engine.rivalIndex, initialSeed + Math.floor(anim.time * 10));
  } else if (id.startsWith('rival-')) {
    engine.setRival(button.data);
    sound.cardSelect(true);
  } else if (id === 'btn-play') {
    engine.playSelectedTrick();
  } else if (id === 'btn-cycle') {
    engine.cycleSelectedCards();
  } else if (id === 'btn-continue') {
    engine.advanceFromClash();
  } else if (id === 'btn-reset' || id === 'btn-rematch') {
    engine.startMatch(engine.rivalIndex, engine.seed + 17);
  } else if (id === 'btn-next-rival') {
    engine.nextRival();
  } else if (id === 'btn-title') {
    engine.phase = PHASES.TITLE;
    engine.rulesOpen = false;
    sound.cardSelect(false);
  }
}

canvas.addEventListener('pointermove', (ev) => {
  const pt = clientToStage(ev.clientX, ev.clientY);
  if (uiState.draggingUid) {
    uiState.dragX = pt.x;
    uiState.dragY = pt.y;
    if (Math.hypot(pt.x - uiState.dragStartX, pt.y - uiState.dragStartY) > 10) {
      uiState.dragMoved = true;
    }
    canvas.style.cursor = 'grabbing';
    return;
  }

  const btn = hud.hitTestButton(pt.x, pt.y);
  uiState.hoveredButtonId = btn ? btn.id : null;
  const card = btn ? null : hitTestPlayerHand(pt.x, pt.y);
  uiState.hoveredUid = card ? card.uid : null;
  canvas.style.cursor = btn || card ? 'pointer' : 'default';
});

canvas.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  sound.ensureContext();
  const pt = clientToStage(ev.clientX, ev.clientY);

  const btn = hud.hitTestButton(pt.x, pt.y);
  if (btn) {
    handleButtonAction(btn);
    return;
  }

  if (engine.rulesOpen) {
    engine.rulesOpen = false;
    return;
  }

  const card = hitTestPlayerHand(pt.x, pt.y);
  if (card) {
    uiState.draggingUid = card.uid;
    uiState.dragStartX = pt.x;
    uiState.dragStartY = pt.y;
    uiState.dragX = pt.x;
    uiState.dragY = pt.y;
    uiState.dragMoved = false;
    canvas.setPointerCapture?.(ev.pointerId);
  }
});

canvas.addEventListener('pointerup', (ev) => {
  const pt = clientToStage(ev.clientX, ev.clientY);
  if (!uiState.draggingUid) return;
  const uid = uiState.draggingUid;
  const moved = uiState.dragMoved;
  uiState.draggingUid = null;
  uiState.dragMoved = false;
  canvas.releasePointerCapture?.(ev.pointerId);

  if (moved && pt.y < 430) {
    // Dragged onto the central table clash zone: select if not already selected, then play!
    if (!engine.selectedIds.includes(uid)) {
      const ok = engine.toggleSelectCard(uid);
      if (!ok) return;
    }
    if (engine.canPlaySelected()) {
      engine.playSelectedTrick();
    }
  } else {
    // Standard crisp click toggle
    engine.toggleSelectCard(uid);
  }
});

window.addEventListener('keydown', (ev) => {
  if (ev.repeat) return;
  sound.ensureContext();
  const key = ev.key;

  if (key === 'Escape') {
    if (engine.rulesOpen) {
      engine.rulesOpen = false;
    } else if (engine.phase === PHASES.SELECT && engine.selectedIds.length > 0) {
      engine.selectedIds = [];
      sound.cardSelect(false);
    }
    return;
  }

  if (key === 'm' || key === 'M') {
    sound.toggleMute();
    return;
  }

  if (key === '?' || key === 'h' || key === 'H') {
    engine.rulesOpen = !engine.rulesOpen;
    return;
  }

  if (engine.rulesOpen) return;

  if (engine.phase === PHASES.TITLE) {
    if (key === 'ArrowLeft') {
      engine.setRival(engine.rivalIndex - 1);
      sound.cardSelect(true);
    } else if (key === 'ArrowRight') {
      engine.setRival(engine.rivalIndex + 1);
      sound.cardSelect(true);
    } else if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      engine.startMatch(engine.rivalIndex, initialSeed);
    }
    return;
  }

  if (engine.phase === PHASES.SELECT) {
    if (key >= '1' && key <= '6') {
      engine.toggleSelectIndex(Number(key) - 1);
    } else if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      if (engine.canPlaySelected()) engine.playSelectedTrick();
      else showToast('Select 1–3 cards first (keys 1–5)');
    } else if (key === 'c' || key === 'C') {
      engine.cycleSelectedCards();
    } else if (key === 'r' || key === 'R') {
      engine.startMatch(engine.rivalIndex, engine.seed + 17);
    }
    return;
  }

  if (engine.phase === PHASES.CLASH) {
    if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      engine.advanceFromClash();
    }
    return;
  }

  if (engine.phase === PHASES.VICTORY || engine.phase === PHASES.DEFEAT) {
    if (key === 'r' || key === 'R') {
      engine.startMatch(engine.rivalIndex, engine.seed + 17);
    } else if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      if (engine.phase === PHASES.VICTORY) engine.nextRival();
      else engine.startMatch(engine.rivalIndex, engine.seed + 17);
    }
  }
});

function drawFrame() {
  ctx.save();
  ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.fillStyle = '#140D08';
  ctx.fillRect(0, 0, canvas.width / viewport.dpr, canvas.height / viewport.dpr);

  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.scale, viewport.scale);

  renderer.render(ctx, engine, anim, uiState);
  hud.render(ctx, engine, anim, sound, uiState);
  ctx.restore();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Expose clean debug/test handle for local headless verification
window.__LANTERN_TRICK__ = {
  engine,
  anim,
  sound,
  hud,
  getState: () => ({
    phase: engine.phase,
    round: engine.round,
    rival: engine.rival.name,
    playerHp: engine.playerHp,
    oppHp: engine.oppHp,
    playerLanterns: engine.playerLanterns,
    playerScore: engine.playerScore,
    handSize: engine.playerHand.length,
    selectedCount: engine.selectedIds.length,
    buttons: hud.buttons.map((b) => ({ id: b.id, cx: b.x + b.w / 2, cy: b.y + b.h / 2 })),
  }),
};

if (shotParam) {
  stageShot(shotParam, initialSeed, engine, renderer, anim, uiState);
  drawFrame();
  window.__SHOT_READY__ = true;
} else {
  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    if (uiState.toastTimer > 0) {
      uiState.toastTimer = Math.max(0, uiState.toastTimer - dt);
    }
    engine.step(dt);
    renderer.syncCardTargets(engine, anim, uiState);
    anim.step(dt, engine.phase === PHASES.DEFEAT);
    drawFrame();
    requestAnimationFrame(tick);
  }
  renderer.syncCardTargets(engine, anim, uiState);
  anim.snapAll();
  requestAnimationFrame(tick);
}
