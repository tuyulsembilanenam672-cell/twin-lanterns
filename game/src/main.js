// Twin Lanterns — the game itself.
// A state machine over three scenes: start screen, playing, scene
// clear, win, and time-up. It owns the clock, the score, the hints,
// the HUD, and the animation loop that repaints both panels.

import {
  PANEL_W,
  PANEL_H,
  SCENE_SECONDS,
  FIND_POINTS,
  COMBO_STEP,
  COMBO_CAP,
  MISS_POINTS,
  MISS_SECONDS,
  HINT_POINTS,
  HINTS_PER_SCENE,
  HINT_RING_MS,
  TIME_BONUS_PER_SECOND,
  SCENES,
  STAR_CUTS,
} from './config.js';
import { getScene } from './scenes.js';
import { drawPanel, makeBurst, drawBursts } from './render.js';
import {
  bindCanvases,
  makeReticle,
  resetReticle,
  handleKey,
  pickDifference,
} from './input.js';
import {
  playFind,
  playMiss,
  playHint,
  playSceneClear,
  playWin,
  playLose,
  playClick,
  isMuted,
  setMuted,
} from './audio.js';

// --- DOM ---------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const leftCanvas = $('left-panel');
const rightCanvas = $('right-panel');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

leftCanvas.width = PANEL_W;
leftCanvas.height = PANEL_H;
rightCanvas.width = PANEL_W;
rightCanvas.height = PANEL_H;

// --- State ---------------------------------------------------------------

const game = {
  screen: 'start', // start | playing | paused | scene-clear | win | lose
  sceneIndex: 0,
  found: [], // differences found in this scene, in find order
  score: 0,
  combo: 0,
  hintsLeft: HINTS_PER_SCENE,
  hint: null, // { diff, until }
  secondsLeft: SCENE_SECONDS,
  lastTick: 0,
  bursts: [],
  missFlash: 0, // timestamp of the last wrong click, for the red flash
  totalFound: 0,
  startedAt: 0,
  best: 0,
};

try {
  game.best = Number(localStorage.getItem('twin-lanterns-best') || 0) || 0;
} catch (e) {
  game.best = 0;
}

function scene() {
  return getScene(game.sceneIndex);
}

function foundCount() {
  return game.found.length;
}

function remainCount() {
  return scene().differences.length - game.found.length;
}

// --- HUD -----------------------------------------------------------------

function show(id, visible) {
  $(id).classList.toggle('hidden', !visible);
}

function updateHud() {
  const s = scene();
  $('scene-name').textContent = `${game.sceneIndex + 1} · ${s.name}`;
  $('score').textContent = String(game.score);
  $('best').textContent = String(Math.max(game.best, game.score));
  $('found-count').textContent = String(foundCount());
  $('remain-count').textContent = String(remainCount());
  $('hints-left').textContent = String(game.hintsLeft);
  const mins = Math.floor(game.secondsLeft / 60);
  const secs = Math.floor(game.secondsLeft % 60);
  $('timer').textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  $('timer').classList.toggle('low', game.secondsLeft <= 20);
  $('time-fill').style.width = `${(game.secondsLeft / SCENE_SECONDS) * 100}%`;
  $('time-fill').classList.toggle('low', game.secondsLeft <= 20);
  // Dots: one per difference, filled as they are found.
  const dots = $('dots');
  dots.innerHTML = '';
  for (const d of s.differences) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (game.found.includes(d) ? ' found' : '');
    dot.title = game.found.includes(d) ? d.label : 'Not found yet';
    dots.appendChild(dot);
  }
  $('hint-btn').disabled = game.hintsLeft <= 0 || game.screen !== 'playing';
  $('mute-btn').textContent = isMuted() ? 'Sound: off (M)' : 'Sound: on (M)';
}

function logLine(text) {
  const log = $('log');
  const line = document.createElement('div');
  line.textContent = text;
  log.prepend(line);
  while (log.children.length > 4) log.removeChild(log.lastChild);
}

// --- Screens ---------------------------------------------------------------

function setScreen(name) {
  game.screen = name;
  show('start-screen', name === 'start');
  show('scene-clear-screen', name === 'scene-clear');
  show('win-screen', name === 'win');
  show('lose-screen', name === 'lose');
  show('pause-screen', name === 'paused');
  show('play-area', name === 'playing' || name === 'paused');
  updateHud();
}

function startScene(index) {
  game.sceneIndex = index;
  game.found = [];
  game.combo = 0;
  game.hintsLeft = HINTS_PER_SCENE;
  game.hint = null;
  game.secondsLeft = SCENE_SECONDS;
  game.bursts = [];
  resetReticle(reticle);
  logLine(`Scene ${index + 1}: ${scene().name} — find all 7 differences.`);
  setScreen('playing');
  game.lastTick = performance.now();
}

function startGame() {
  game.score = 0;
  game.totalFound = 0;
  game.startedAt = Date.now();
  playClick();
  startScene(0);
}

function sceneClear() {
  const bonus = Math.floor(game.secondsLeft) * TIME_BONUS_PER_SECOND;
  game.score += bonus;
  playSceneClear();
  $('clear-title').textContent = `${scene().name} — complete!`;
  $('clear-detail').textContent =
    `All 7 differences found. Time bonus +${bonus} points.`;
  $('clear-score').textContent = `Score: ${game.score}`;
  const last = game.sceneIndex === SCENES.length - 1;
  $('next-btn').textContent = last ? 'See the results' : 'Next scene';
  setScreen('scene-clear');
}

function winGame() {
  playWin();
  const stars = STAR_CUTS.filter((c) => game.score >= c).length;
  $('win-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('win-score').textContent = `Final score: ${game.score}`;
  $('win-found').textContent =
    `You found all ${game.totalFound} differences across 3 scenes.`;
  if (game.score > game.best) {
    game.best = game.score;
    try {
      localStorage.setItem('twin-lanterns-best', String(game.best));
    } catch (e) {
      // Best score is a nicety; the game plays on without it.
    }
    $('win-best').textContent = 'A new best score!';
  } else {
    $('win-best').textContent = `Best score: ${game.best}`;
  }
  setScreen('win');
}

function loseGame() {
  playLose();
  $('lose-detail').textContent =
    `Time ran out on ${scene().name} with ${remainCount()} difference${remainCount() === 1 ? '' : 's'} still hidden.`;
  setScreen('lose');
}

// --- Playing ---------------------------------------------------------------

const reticle = makeReticle();

function onMark(panel, x, y) {
  if (game.screen !== 'playing') return;
  if (remainCount() === 0) return; // scene already cleared, overlay on its way
  const diff = pickDifference(scene().differences, game.found, x, y);
  if (diff) {
    game.found.push(diff);
    game.totalFound += 1;
    const gained = FIND_POINTS + Math.min(game.combo * COMBO_STEP, COMBO_CAP);
    game.score += gained;
    game.combo += 1;
    game.bursts.push(makeBurst(diff.x, diff.y));
    playFind();
    logLine(`Found ${diff.label} (+${gained}). ${remainCount()} to go.`);
    if (remainCount() === 0) {
      updateHud();
      setTimeout(sceneClear, 650);
    }
  } else {
    game.combo = 0;
    game.score = Math.max(0, game.score - MISS_POINTS);
    game.secondsLeft = Math.max(0, game.secondsLeft - MISS_SECONDS);
    game.missFlash = performance.now();
    playMiss();
    logLine(`Nothing there — ${MISS_SECONDS}s and ${MISS_POINTS} points.`);
  }
  updateHud();
}

function useHint() {
  if (game.screen !== 'playing') return;
  if (game.hintsLeft <= 0) {
    logLine('No hints left in this scene.');
    return;
  }
  const remaining = scene().differences.filter((d) => !game.found.includes(d));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_POINTS);
  game.hint = { diff, until: performance.now() + HINT_RING_MS };
  playHint();
  logLine(`Hint: look near ${diff.label} (−${HINT_POINTS} points).`);
  updateHud();
}

// --- Buttons ---------------------------------------------------------------

$('start-btn').addEventListener('click', startGame);
$('next-btn').addEventListener('click', () => {
  playClick();
  if (game.sceneIndex === SCENES.length - 1) winGame();
  else startScene(game.sceneIndex + 1);
});
$('again-btn').addEventListener('click', () => {
  playClick();
  startGame();
});
$('lose-retry-btn').addEventListener('click', () => {
  playClick();
  startScene(game.sceneIndex);
});
$('hint-btn').addEventListener('click', useHint);
$('mute-btn').addEventListener('click', () => {
  setMuted(!isMuted());
  updateHud();
});
$('pause-btn').addEventListener('click', () => {
  if (game.screen === 'playing') {
    setScreen('paused');
  } else if (game.screen === 'paused') {
    setScreen('playing');
    game.lastTick = performance.now();
  }
});
$('resume-btn').addEventListener('click', () => {
  playClick();
  setScreen('playing');
  game.lastTick = performance.now();
});
$('restart-btn').addEventListener('click', () => {
  playClick();
  startScene(game.sceneIndex);
});
$('quit-btn').addEventListener('click', () => {
  playClick();
  setScreen('start');
});

// Scene picker on the start screen.
document.querySelectorAll('[data-scene]').forEach((btn) => {
  btn.addEventListener('click', () => {
    game.score = 0;
    game.totalFound = 0;
    playClick();
    startScene(Number(btn.dataset.scene));
  });
});

bindCanvases(leftCanvas, rightCanvas, onMark);

// --- Keyboard ---------------------------------------------------------------

document.addEventListener('keydown', (ev) => {
  if (game.screen === 'start') {
    if (ev.key === 'Enter') startGame();
    if (ev.key >= '1' && ev.key <= '3') {
      game.score = 0;
      game.totalFound = 0;
      startScene(Number(ev.key) - 1);
    }
    return;
  }
  if (game.screen === 'scene-clear' && ev.key === 'Enter') {
    $('next-btn').click();
    return;
  }
  if (game.screen === 'win' && ev.key === 'Enter') {
    startGame();
    return;
  }
  if (game.screen === 'lose' && ev.key === 'Enter') {
    startScene(game.sceneIndex);
    return;
  }
  if (game.screen === 'paused') {
    if (ev.key === 'p' || ev.key === 'P' || ev.key === 'Escape' || ev.key === 'Enter') {
      setScreen('playing');
      game.lastTick = performance.now();
    }
    return;
  }
  if (game.screen !== 'playing') return;
  const cmd = handleKey(ev, reticle);
  if (cmd === 'mark') {
    onMark(reticle.panel, reticle.x, reticle.y);
  } else if (cmd === 'hint') {
    useHint();
  } else if (cmd === 'mute') {
    setMuted(!isMuted());
    updateHud();
  } else if (cmd === 'restart') {
    startScene(game.sceneIndex);
  } else if (cmd === 'pause') {
    setScreen('paused');
  }
});

// --- Animation loop ---------------------------------------------------------------

function frame(now) {
  if (game.screen === 'playing') {
    // One-second clock.
    if (now - game.lastTick >= 1000) {
      const steps = Math.floor((now - game.lastTick) / 1000);
      game.lastTick += steps * 1000;
      game.secondsLeft = Math.max(0, game.secondsLeft - steps);
      if (game.secondsLeft <= 0) {
        updateHud();
        loseGame();
      }
      updateHud();
    }
    // Hint expiry.
    if (game.hint && now > game.hint.until) game.hint = null;
  }
  // Repaint while playing or paused; the start screen keeps its last
  // painted scene as a backdrop.
  if (game.screen !== 'start' || game.startedAt === 0) {
    drawPanel(leftCtx, scene(), 0, game.found, game.hint, reticle.panel === 0 ? reticle : null);
    drawPanel(rightCtx, scene(), 1, game.found, game.hint, reticle.panel === 1 ? reticle : null);
    const live = game.bursts.filter((b) => now - b.born < 500);
    if (live.length) {
      drawBursts(leftCtx, live);
      drawBursts(rightCtx, live);
    }
    game.bursts = live;
  }
  // Red flash on a wrong click.
  if (game.missFlash && now - game.missFlash < 220) {
    for (const c of [leftCanvas, rightCanvas]) {
      c.style.boxShadow = '0 0 0 4px rgba(231, 76, 60, 0.9)';
    }
  } else if (game.missFlash) {
    game.missFlash = 0;
    for (const c of [leftCanvas, rightCanvas]) c.style.boxShadow = '';
  }
  requestAnimationFrame(frame);
}

// Paint the first scene behind the start screen, so the title sits over
// the game itself.
drawPanel(leftCtx, scene(), 0, [], null, null);
drawPanel(rightCtx, scene(), 1, [], null, null);
updateHud();
requestAnimationFrame(frame);

// A handle for play-testing: the live game state, including where every
// difference in the current scene sits on the panel.
window.SPOT = {
  get state() {
    return {
      screen: game.screen,
      scene: game.sceneIndex,
      sceneName: scene().name,
      found: game.found.map((d) => d.id),
      remain: remainCount(),
      score: game.score,
      secondsLeft: Math.ceil(game.secondsLeft),
      hintsLeft: game.hintsLeft,
      differences: scene().differences.map((d) => ({ ...d })),
    };
  },
  start: startGame,
  startScene,
  hint: useHint,
};
