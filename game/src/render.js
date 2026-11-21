// Twin Lanterns — painting the two panels and everything on top of them.
// render.js owns the canvases: it draws each scene's two pictures,
// the numbered rings on found differences, the pulsing hint ring, the
// keyboard reticle, and the little burst that pops on a find.

import { PANEL_W, PANEL_H } from './config.js';

// Draw one panel: the scene at `variant`, then the found markers.
export function drawPanel(ctx, scene, variant, found, hint, reticle) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  scene.draw(ctx, variant);
  // Rings on every found difference, numbered in find order.
  found.forEach((diff, i) => {
    drawFoundRing(ctx, diff, i + 1);
  });
  // The hint ring, if one is showing on this panel.
  if (hint) drawHintRing(ctx, hint.diff, hint.until - performance.now());
  // The keyboard reticle, if the player is steering with keys.
  if (reticle && reticle.visible) drawReticle(ctx, reticle);
  ctx.restore();
}

// A gold ring with a number, drawn over a found difference on both
// panels so the player sees the pair at once.
function drawFoundRing(ctx, diff, number) {
  const pulse = 1 + Math.sin(performance.now() / 280) * 0.04;
  const r = diff.r * pulse;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 9, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 213, 74, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Number badge at the ring's top.
  ctx.beginPath();
  ctx.arc(diff.x, diff.y - r - 8, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd54a';
  ctx.fill();
  ctx.strokeStyle = '#7a4a00';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4a2e00';
  ctx.fillText(String(number), diff.x, diff.y - r - 7);
}

// A dashed ring that breathes around the hinted difference.
function drawHintRing(ctx, diff, msLeft) {
  const fade = Math.max(0, Math.min(1, msLeft / 800));
  const breathe = 1 + Math.sin(performance.now() / 160) * 0.12;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * fade;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, (diff.r + 8) * breathe, 0, Math.PI * 2);
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = '#7ee2ff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7ee2ff';
  ctx.fillText('?', diff.x, diff.y - diff.r - 16);
  ctx.restore();
}

// The keyboard cursor: a crosshair that the arrow keys move.
function drawReticle(ctx, reticle) {
  const { x, y } = reticle;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x, y + 18);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();
}

// A short-lived burst of sparks at a found difference. The game keeps
// a list of bursts and calls drawBursts every frame while any live.
export function makeBurst(x, y) {
  const parts = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * (30 + (i % 4) * 14),
      vy: Math.sin(a) * (30 + (i % 4) * 14),
      life: 1,
    });
  }
  return { parts, born: performance.now() };
}

export function drawBursts(ctx, bursts) {
  const t = performance.now();
  for (const b of bursts) {
    const age = (t - b.born) / 500;
    if (age >= 1) continue;
    for (const p of b.parts) {
      const x = p.x + p.vx * age;
      const y = p.y + p.vy * age + 26 * age * age;
      ctx.globalAlpha = 1 - age;
      ctx.beginPath();
      ctx.arc(x, y, 3.5 * (1 - age) + 1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd54a';
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
