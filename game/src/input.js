// Twin Lanterns — mouse and keyboard input.
// Clicks land on either panel; the keyboard moves a reticle (arrow
// keys), switches panels (Tab), and marks with Enter or Space. H asks
// for a hint, M mutes, R restarts the scene, P or Esc pauses.

import { PANEL_W, PANEL_H, CLICK_SLOP } from './config.js';

// Convert a mouse event on a canvas into panel coordinates (the canvas
// is drawn at PANEL_W x PANEL_H and scaled by CSS).
export function eventToPanel(canvas, ev) {
  const box = canvas.getBoundingClientRect();
  const x = ((ev.clientX - box.left) / box.width) * PANEL_W;
  const y = ((ev.clientY - box.top) / box.height) * PANEL_H;
  return { x, y };
}

// Find the nearest unfound difference within reach of a click, or null.
export function pickDifference(differences, found, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const d of differences) {
    if (found.includes(d)) continue;
    const dx = d.x - x;
    const dy = d.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const reach = d.r + CLICK_SLOP;
    if (dist <= reach && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

// Wire the two canvases to a callback: onMark(panelIndex, x, y).
// Returns a function that unhooks the listeners.
export function bindCanvases(left, right, onMark) {
  const handler = (panel) => (ev) => {
    ev.preventDefault();
    const p = eventToPanel(ev.currentTarget, ev);
    onMark(panel, p.x, p.y);
  };
  const hLeft = handler(0);
  const hRight = handler(1);
  left.addEventListener('click', hLeft);
  right.addEventListener('click', hRight);
  return () => {
    left.removeEventListener('click', hLeft);
    right.removeEventListener('click', hRight);
  };
}

// The keyboard cursor: a reticle that lives on one panel at a time.
export function makeReticle() {
  return { x: PANEL_W / 2, y: PANEL_H / 2, panel: 0, visible: false };
}

const STEP = 14;
const STEP_FAST = 42;

// Handle one keydown while playing. Returns a command string for the
// game to act on, or null. The reticle object is moved in place.
export function handleKey(ev, reticle) {
  const k = ev.key;
  if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
    ev.preventDefault();
    reticle.visible = true;
    const step = ev.shiftKey ? STEP_FAST : STEP;
    if (k === 'ArrowLeft') reticle.x = Math.max(0, reticle.x - step);
    if (k === 'ArrowRight') reticle.x = Math.min(PANEL_W, reticle.x + step);
    if (k === 'ArrowUp') reticle.y = Math.max(0, reticle.y - step);
    if (k === 'ArrowDown') reticle.y = Math.min(PANEL_H, reticle.y + step);
    return 'reticle';
  }
  if (k === 'Tab') {
    ev.preventDefault();
    reticle.visible = true;
    reticle.panel = 1 - reticle.panel;
    return 'reticle';
  }
  if (k === 'Enter' || k === ' ') {
    ev.preventDefault();
    reticle.visible = true;
    return 'mark';
  }
  if (k === 'h' || k === 'H') return 'hint';
  if (k === 'm' || k === 'M') return 'mute';
  if (k === 'r' || k === 'R') return 'restart';
  if (k === 'p' || k === 'P' || k === 'Escape') return 'pause';
  return null;
}

// Clamp a reticle into its panel after a scene change.
export function resetReticle(reticle) {
  reticle.x = PANEL_W / 2;
  reticle.y = PANEL_H / 2;
  reticle.panel = 0;
  reticle.visible = false;
}
