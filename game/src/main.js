// Game bootstrap: DPR-aware 1280x720 canvas, mouse/drag & keyboard controls, Gambit, Relic & Gilded Foil wiring.
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

const uiState = { hoveredUid: null, hoveredButtonId: null, draggingUid: null, dragStartX: 0, dragStartY: 0, dragX: 0, dragY: 0, dragMoved: false, toastMessage: '', toastTimer: 0 };
const viewport = { scale: 1, offsetX: 0, offsetY: 0, dpr: 1 };

const announce = (text) => { if (announcer) announcer.textContent = text; };
const showToast = (msg) => { uiState.toastMessage = msg; uiState.toastTimer = 2.1; };

engine.onEvent((type, p) => {
  if (shotParam) return;
  if (type === 'matchStart') { sound.cardDeal(); announce(`Match started vs ${p.rival.name} ${p.rival.title}.`); }
  else if (type === 'roundStart') { sound.cardDeal(); announce(`Round ${p.round}. Rival tell: ${p.telegraph.tellTag}.`); }
  else if (type === 'selectChange') sound.cardSelect(p.selected);
  else if (type === 'invalidAction') { sound.invalidBuzz(); showToast(p.reason); }
  else if (type === 'gambitToggle') {
    if (p.active) {
      sound.gambitGong(); anim.triggerShake(5, '#FFE072'); anim.spawnShockwave(CENTER_X, 184, '#FFE066', 130, 4);
      anim.spawnBurst(CENTER_X, 184, '#FFD459', 24, 170, 50); anim.spawnCallout(CENTER_X, 152, 'GAMBIT ×2 RAISED!', '#FFE278', 24);
      announce('Gambit ×2 raised! Double stakes active.');
    } else sound.cardSelect(false);
  } else if (type === 'cardForged') {
    sound.foilForge(); anim.triggerShake(4, '#FFE478');
    const sc = anim.cards.get(p.card.uid);
    anim.spawnShockwave(sc?.x ?? CENTER_X, sc?.y ?? 580, '#FFE478', 110, 4);
    anim.spawnBurst(sc?.x ?? CENTER_X, sc?.y ?? 580, '#FFE680', 22, 160, 50);
    anim.spawnCallout(sc?.x ?? CENTER_X, (sc?.y ?? 580) - 96, `✦ FORGED ${p.card.name.toUpperCase()}!`, '#FFF09E', 22);
    announce(`Forged ${p.card.name} into Gilded Foil for the rest of the run!`);
  } else if (type === 'relicDrafted') {
    sound.relicClaim(); announce(`Claimed relic & forged Gilded Foil card! Next rival: ${p.nextRival.name}.`);
  } else if (type === 'clash') {
    sound.clashImpact(p.winner === 'player', p.playerTrumps || p.counterBreak || p.gambitActive);
    if (p.winner === 'player') {
      const col = SUITS[p.playerTrick.leadSuit]?.bright ?? '#FFE066';
      anim.triggerShake(p.counterBreak || p.gambitActive ? 11 : 6, col);
      anim.spawnShockwave(CENTER_X, 294, '#FFE066', 185, 4.8); anim.spawnShockwave(418, 294, col, 130, 3.8);
      anim.spawnBurst(418, 294, col, p.counterBreak ? 34 : 24, 230, 75); anim.spawnCallout(418, 224, `-${p.damageToOpp} HP`, '#FFE066', 34);
      if (p.playerTrumps) anim.spawnCallout(CENTER_X, 240, p.counterBreak ? 'COUNTER-BREAK!' : 'TRUMP!', '#FFE584', 24);
    } else if (p.winner === 'opponent') {
      const col = SUITS[p.oppTrick.leadSuit]?.bright ?? '#FF665A';
      anim.triggerShake(8, '#FF5C52'); anim.spawnShockwave(862, 294, '#FF665A', 150, 4.2);
      anim.spawnBurst(862, 294, col, 24, 210, 55); anim.spawnCallout(862, 224, `-${p.damageToPlayer} HP`, '#FF786E', 34);
    } else {
      anim.triggerShake(5, '#E2C374'); anim.spawnShockwave(CENTER_X, 294, '#FFE072', 140, 3.5);
      anim.spawnBurst(CENTER_X, 294, '#FFE072', 20, 180, 40); anim.spawnCallout(CENTER_X, 240, 'CLASH TIE', '#FFE28A', 24);
    }
    if (p.playerHeal > 0) anim.spawnCallout(156, 560, `+${p.playerHeal} HP`, '#6BF09E', 24);
    if (p.oppHeal > 0) anim.spawnCallout(180, 96, `+${p.oppHeal} HP`, '#6BF09E', 22);
    announce(p.headline);
  } else if (type === 'victory') { sound.victoryFanfare(); anim.spawnVictoryFlourish(CENTER_X, 326); announce(`Victory! Defeated ${engine.rival.name} with score ${engine.playerScore}.`); }
  else if (type === 'defeat') { sound.defeatChord(); anim.spawnDefeatWisps(CENTER_X, 515); announce(`Defeat. ${engine.rival.name} outplayed you in Round ${engine.round}.`); }
});

function resizeCanvas() {
  const vw = Math.max(320, window.innerWidth); const vh = Math.max(240, window.innerHeight);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
  viewport.scale = scale; viewport.offsetX = (vw - STAGE_W * scale) / 2; viewport.offsetY = (vh - STAGE_H * scale) / 2; viewport.dpr = dpr;
}

function clientToStage(cx, cy) {
  const r = canvas.getBoundingClientRect();
  return { x: (cx - r.left - viewport.offsetX) / viewport.scale, y: (cy - r.top - viewport.offsetY) / viewport.scale };
}

function hitTestPlayerHand(sx, sy) {
  if (engine.phase !== PHASES.SELECT || engine.rulesOpen) return null;
  for (let i = engine.playerHand.length - 1; i >= 0; i -= 1) {
    const card = engine.playerHand[i]; const sc = anim.cards.get(card.uid); if (!sc) continue;
    const hw = (HAND_CARD_W * sc.scale) / 2; const hh = (HAND_CARD_H * sc.scale) / 2;
    if (sx >= sc.x - hw && sx <= sc.x + hw && sy >= sc.y - hh && sy <= sc.y + hh) return card;
  }
  return null;
}

const restartMatch = () => engine.startMatch(engine.rivalIndex, engine.seed + 17, engine.playerRelics.length > 0);

function handleButtonAction(btn) {
  if (!btn) return;
  const id = btn.id;
  if (id === 'btn-mute') { sound.toggleMute(); announce(sound.muted ? 'Sound muted.' : 'Sound enabled.'); }
  else if (id === 'btn-rules' || id === 'btn-rules-title') { engine.rulesOpen = !engine.rulesOpen; sound.cardSelect(true); }
  else if (id === 'btn-close-rules') { engine.rulesOpen = false; sound.cardSelect(false); }
  else if (id === 'btn-start') engine.startMatch(engine.rivalIndex, initialSeed + Math.floor(anim.time * 10));
  else if (id.startsWith('rival-')) { engine.setRival(btn.data); sound.cardSelect(true); }
  else if (id === 'btn-play') engine.playSelectedTrick();
  else if (id === 'btn-gambit') engine.toggleGambitRaise();
  else if (id === 'btn-forge') engine.forgeSelectedCard();
  else if (id === 'btn-cycle') engine.cycleSelectedCards();
  else if (id === 'btn-continue') engine.advanceFromClash();
  else if (id === 'btn-reset' || id === 'btn-rematch') restartMatch();
  else if (id.startsWith('relic-')) engine.pickRelicAndAdvance(btn.data);
  else if (id === 'btn-next-rival') engine.nextRival();
  else if (id === 'btn-title') { engine.phase = PHASES.TITLE; engine.rulesOpen = false; sound.cardSelect(false); }
}

canvas.addEventListener('pointermove', (ev) => {
  const pt = clientToStage(ev.clientX, ev.clientY);
  if (uiState.draggingUid) {
    uiState.dragX = pt.x; uiState.dragY = pt.y;
    if (Math.hypot(pt.x - uiState.dragStartX, pt.y - uiState.dragStartY) > 10) uiState.dragMoved = true;
    canvas.style.cursor = 'grabbing'; return;
  }
  const btn = hud.hitTestButton(pt.x, pt.y); uiState.hoveredButtonId = btn ? btn.id : null;
  const card = btn ? null : hitTestPlayerHand(pt.x, pt.y); uiState.hoveredUid = card ? card.uid : null;
  canvas.style.cursor = btn || card ? 'pointer' : 'default';
});

canvas.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  sound.ensureContext();
  const pt = clientToStage(ev.clientX, ev.clientY);
  const btn = hud.hitTestButton(pt.x, pt.y); if (btn) { handleButtonAction(btn); return; }
  if (engine.rulesOpen) { engine.rulesOpen = false; return; }
  const card = hitTestPlayerHand(pt.x, pt.y);
  if (card) {
    uiState.draggingUid = card.uid; uiState.dragStartX = pt.x; uiState.dragStartY = pt.y;
    uiState.dragX = pt.x; uiState.dragY = pt.y; uiState.dragMoved = false; canvas.setPointerCapture?.(ev.pointerId);
  }
});

canvas.addEventListener('pointerup', (ev) => {
  const pt = clientToStage(ev.clientX, ev.clientY);
  if (!uiState.draggingUid) return;
  const uid = uiState.draggingUid; const moved = uiState.dragMoved;
  uiState.draggingUid = null; uiState.dragMoved = false; canvas.releasePointerCapture?.(ev.pointerId);
  if (moved && pt.y < 430) { if (!engine.selectedIds.includes(uid) && !engine.toggleSelectCard(uid)) return; if (engine.canPlaySelected()) engine.playSelectedTrick(); }
  else engine.toggleSelectCard(uid);
});

window.addEventListener('keydown', (ev) => {
  if (ev.repeat) return;
  sound.ensureContext(); const k = ev.key;
  if (k === 'Escape') { if (engine.rulesOpen) engine.rulesOpen = false; else if (engine.phase === PHASES.SELECT && engine.selectedIds.length) { engine.selectedIds = []; sound.cardSelect(false); } return; }
  if (k === 'm' || k === 'M') { sound.toggleMute(); return; }
  if (k === '?' || k === 'h' || k === 'H') { engine.rulesOpen = !engine.rulesOpen; return; }
  if (engine.rulesOpen) return;

  if (engine.phase === PHASES.TITLE) {
    if (k === 'ArrowLeft') { engine.setRival(engine.rivalIndex - 1); sound.cardSelect(true); }
    else if (k === 'ArrowRight') { engine.setRival(engine.rivalIndex + 1); sound.cardSelect(true); }
    else if (k === 'Enter' || k === ' ') { ev.preventDefault(); engine.startMatch(engine.rivalIndex, initialSeed); }
  } else if (engine.phase === PHASES.SELECT) {
    if (k >= '1' && k <= '6') engine.toggleSelectIndex(Number(k) - 1);
    else if (k === 'g' || k === 'G') engine.toggleGambitRaise();
    else if (k === 'f' || k === 'F') engine.forgeSelectedCard();
    else if (k === 'Enter' || k === ' ') { ev.preventDefault(); if (engine.canPlaySelected()) engine.playSelectedTrick(); else showToast('Select 1–3 cards first (keys 1–5)'); }
    else if (k === 'c' || k === 'C') engine.cycleSelectedCards();
    else if (k === 'r' || k === 'R') restartMatch();
  } else if (engine.phase === PHASES.CLASH && (k === 'Enter' || k === ' ')) { ev.preventDefault(); engine.advanceFromClash(); }
  else if (engine.phase === PHASES.VICTORY || engine.phase === PHASES.DEFEAT) {
    if (engine.phase === PHASES.VICTORY && k >= '1' && k <= '3') { const ch = engine.draftChoices[Number(k) - 1]; if (ch) engine.pickRelicAndAdvance(ch.id); }
    else if (k === 'r' || k === 'R') restartMatch();
    else if (k === 'Enter' || k === ' ') { ev.preventDefault(); if (engine.phase === PHASES.VICTORY) engine.nextRival(); else restartMatch(); }
  }
});

function drawFrame() {
  ctx.save(); ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
  ctx.fillStyle = '#0D1318'; ctx.fillRect(0, 0, canvas.width / viewport.dpr, canvas.height / viewport.dpr);
  ctx.translate(viewport.offsetX, viewport.offsetY); ctx.scale(viewport.scale, viewport.scale);
  renderer.render(ctx, engine, anim, uiState); hud.render(ctx, engine, anim, sound, uiState); ctx.restore();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.__LANTERN_TRICK__ = {
  engine, anim, sound, hud,
  getState: () => ({
    phase: engine.phase, round: engine.round, rival: engine.rival.name, rivalIndex: engine.rivalIndex,
    playerHp: engine.playerHp, oppHp: engine.oppHp, playerLanterns: engine.playerLanterns, playerScore: engine.playerScore,
    gambitActive: engine.gambitActive, relics: engine.playerRelics.slice(), gildedCount: Object.keys(engine.gildedCards).length,
    draftChoices: engine.draftChoices.map((r) => r.id), handSize: engine.playerHand.length, selectedCount: engine.selectedIds.length,
    buttons: hud.buttons.map((b) => ({ id: b.id, cx: b.x + b.w / 2, cy: b.y + b.h / 2 })),
  }),
};

if (shotParam) {
  stageShot(shotParam, initialSeed, engine, renderer, anim, uiState); drawFrame(); window.__SHOT_READY__ = true;
} else {
  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)); lastTime = now;
    if (uiState.toastTimer > 0) uiState.toastTimer = Math.max(0, uiState.toastTimer - dt);
    engine.step(dt); renderer.syncCardTargets(engine, anim, uiState); anim.step(dt, engine.phase === PHASES.DEFEAT); drawFrame();
    requestAnimationFrame(tick);
  }
  renderer.syncCardTargets(engine, anim, uiState); anim.snapAll(); requestAnimationFrame(tick);
}
