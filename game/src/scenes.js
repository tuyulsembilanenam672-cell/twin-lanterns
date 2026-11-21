// Twin Lanterns — the three scenes.
// Every scene is drawn twice from one function: variant 0 is the left
// picture, variant 1 is the right picture with the seven differences
// applied. All art is procedural canvas drawing; nothing is loaded.
// A difference is { id, x, y, r, label }: its centre and click radius
// in panel coordinates (640 x 480), and a short name for the HUD log.

import { PANEL_W, PANEL_H } from './config.js';
import { sceneRandom, scatter, range } from './random.js';

// --- small drawing helpers ---------------------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function text(ctx, str, x, y, size, color, align) {
  ctx.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// A paper lantern: glowing round body with ribs and tassels.
function paperLantern(ctx, x, y, r, body, glow) {
  if (glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.1);
    g.addColorStop(0, 'rgba(255, 190, 90, 0.55)');
    g.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ellipse(ctx, x, y, r, r * 1.15, body);
  ctx.strokeStyle = 'rgba(120, 40, 20, 0.55)';
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * (0.35 + Math.abs(i) * 0.28), r * 1.15, 0, -0.5, 0.5);
    ctx.stroke();
  }
  rect(ctx, x - r * 0.3, y - r * 1.15 - 5, r * 0.6, 5, '#8a6d3b');
  rect(ctx, x - r * 0.3, y + r * 1.15, r * 0.6, 5, '#8a6d3b');
  line(ctx, x, y + r * 1.15 + 5, x, y + r * 1.15 + 16, '#c0392b', 2);
}

// --- Scene 1: Lantern Market -------------------------------------------
// A night street: stalls under strings of lanterns, a cat on a crate.

function drawMarket(ctx, variant) {
  const W = PANEL_W;
  const H = PANEL_H;
  const rnd = sceneRandom(0);

  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#141b33');
  sky.addColorStop(0.6, '#2c2350');
  sky.addColorStop(1, '#4a2b52');
  rect(ctx, 0, 0, W, 300, sky);

  // Stars, seeded so both panels share them.
  const stars = scatter(rnd, 46, 10, 8, W - 20, 150, 18);
  for (const s of stars) {
    const tw = 0.5 + rnd() * 0.5;
    circle(ctx, s.x, s.y, 1 + rnd() * 1.2, `rgba(255, 244, 200, ${tw})`);
  }
  // Difference 6: one extra star on the right picture.
  if (variant === 1) {
    circle(ctx, 90, 60, 2.4, 'rgba(255, 244, 200, 0.95)');
    circle(ctx, 90, 60, 5, 'rgba(255, 244, 200, 0.25)');
  }

  // Moon. Difference 2: crescent on the left, full on the right.
  circle(ctx, 540, 70, 26, '#f7ead0');
  circle(ctx, 540, 70, 26, 'rgba(247, 234, 208, 0.18)');
  if (variant === 0) {
    circle(ctx, 552, 62, 22, '#2c2350');
  }
  circle(ctx, 530, 62, 4, 'rgba(190, 170, 130, 0.5)');
  circle(ctx, 548, 78, 3, 'rgba(190, 170, 130, 0.5)');

  // Distant rooftops.
  ctx.fillStyle = '#241a33';
  poly(ctx, [[0, 300], [0, 250], [60, 228], [120, 250], [120, 300]], '#241a33');
  poly(ctx, [[110, 300], [110, 238], [190, 210], [270, 238], [270, 300]], '#1d1530');
  poly(ctx, [[260, 300], [260, 246], [340, 224], [420, 246], [420, 300]], '#241a33');
  poly(ctx, [[410, 300], [410, 240], [500, 214], [590, 240], [590, 300]], '#1d1530');
  poly(ctx, [[580, 300], [580, 252], [640, 232], [640, 300]], '#241a33');
  // A few lit windows in the distance.
  rect(ctx, 150, 250, 12, 16, '#ffd98a');
  rect(ctx, 300, 256, 12, 16, '#ffd98a');
  rect(ctx, 470, 252, 12, 16, '#ffd98a');

  // Street.
  const street = ctx.createLinearGradient(0, 300, 0, H);
  street.addColorStop(0, '#6d4a34');
  street.addColorStop(1, '#3d2a1e');
  rect(ctx, 0, 300, W, H - 300, street);
  // Cobble hints.
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const y = 318 + i * 26;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + 8);
    ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const x = 30 + i * 64;
    ctx.beginPath();
    ctx.moveTo(x, 310);
    ctx.lineTo(x - 14, H);
    ctx.stroke();
  }

  // String of lanterns across the top.
  ctx.strokeStyle = '#2a1c12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(320, 138, 640, 96);
  ctx.stroke();
  const cordY = (x) => 96 + (138 - 96) * (1 - Math.pow((x - 320) / 320, 2)) * 0.9;
  paperLantern(ctx, 80, cordY(80) + 26, 15, '#e74c3c', true);
  paperLantern(ctx, 320, cordY(320) + 30, 18, '#e67e22', true);
  paperLantern(ctx, 560, cordY(560) + 26, 15, '#e74c3c', true);
  // Difference 1: the middle lantern on its own short string is missing
  // on the right picture.
  if (variant === 0) {
    line(ctx, 200, 108, 200, 122, '#2a1c12', 2);
    paperLantern(ctx, 200, 138, 16, '#f1c40f', true);
  }

  // Left stall: striped awning, counter, jars.
  poly(ctx, [[60, 170], [250, 170], [262, 210], [48, 210]], '#7a3b2e');
  // Difference 4: awning stripes red on the left, teal on the right.
  const stripe = variant === 0 ? '#c0392b' : '#16a085';
  for (let i = 0; i < 5; i++) {
    poly(ctx, [[66 + i * 38, 170], [98 + i * 38, 170], [100 + i * 38, 210], [70 + i * 38, 210]], stripe);
  }
  rect(ctx, 58, 210, 196, 10, '#5d2d22');
  rect(ctx, 64, 220, 12, 96, '#6d4a34');
  rect(ctx, 236, 220, 12, 96, '#6d4a34');
  rect(ctx, 56, 316, 200, 16, '#8a5a3b');
  // Jars on the counter.
  ellipse(ctx, 96, 300, 16, 20, '#d35400');
  ellipse(ctx, 96, 288, 12, 8, '#e67e22');
  ellipse(ctx, 140, 302, 14, 18, '#27ae60');
  ellipse(ctx, 140, 290, 10, 7, '#2ecc71');
  ellipse(ctx, 180, 300, 16, 20, '#8e44ad');
  ellipse(ctx, 180, 288, 12, 8, '#9b59b6');
  ellipse(ctx, 222, 302, 13, 17, '#c0392b');
  // Hanging sign under the awning.
  rect(ctx, 120, 226, 72, 34, '#f5e6c8');
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 2;
  ctx.strokeRect(120, 226, 72, 34);
  // Difference 7: the sign shows a circle on the left, a star on the right.
  if (variant === 0) {
    circle(ctx, 156, 243, 9, '#c0392b');
  } else {
    poly(ctx, [[156, 233], [159, 240], [167, 240], [161, 245], [163, 253], [156, 248], [149, 253], [151, 245], [145, 240], [153, 240]], '#c0392b');
  }

  // Right stall: fruit basket and a round sign.
  rect(ctx, 400, 260, 150, 14, '#5d2d22');
  rect(ctx, 408, 274, 12, 110, '#6d4a34');
  rect(ctx, 530, 274, 12, 110, '#6d4a34');
  rect(ctx, 402, 384, 146, 14, '#8a5a3b');
  // Basket of apples. Difference 5: five apples on the left, four on
  // the right (the middle one is gone).
  ellipse(ctx, 475, 252, 52, 14, '#8a6d3b');
  const apples = [[440, 242], [462, 234], [484, 240], [506, 234], [496, 246]];
  apples.forEach(([ax, ay], i) => {
    if (variant === 1 && i === 2) return;
    circle(ctx, ax, ay, 10, '#c0392b');
    circle(ctx, ax - 3, ay - 3, 3, '#e74c3c');
    line(ctx, ax, ay - 10, ax + 3, ay - 14, '#27ae60', 2);
  });
  // Round sign on a pole.
  line(ctx, 520, 210, 520, 260, '#2a1c12', 3);
  circle(ctx, 520, 196, 22, '#f5e6c8');
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(520, 196, 22, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, '茶', 520, 197, 22, '#7a3b2e');

  // Cat sitting on a crate, bottom right.
  rect(ctx, 560, 400, 62, 52, '#7a5230');
  rect(ctx, 560, 400, 62, 8, '#8a6238');
  line(ctx, 572, 400, 572, 452, 'rgba(0,0,0,0.25)', 2);
  line(ctx, 610, 400, 610, 452, 'rgba(0,0,0,0.25)', 2);
  // Cat body.
  ellipse(ctx, 591, 388, 22, 18, '#3b3b4d');
  circle(ctx, 591, 362, 14, '#3b3b4d');
  poly(ctx, [[580, 352], [584, 338], [590, 350]], '#3b3b4d');
  poly(ctx, [[602, 352], [598, 338], [592, 350]], '#3b3b4d');
  // Tail, curled up.
  ctx.strokeStyle = '#3b3b4d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(612, 392);
  ctx.quadraticCurveTo(628, 380, 622, 362);
  ctx.stroke();
  // Eyes.
  circle(ctx, 586, 360, 2.5, '#f1c40f');
  circle(ctx, 596, 360, 2.5, '#f1c40f');
  // Difference 3: the cat's collar is red on the left, teal on the right.
  ctx.strokeStyle = variant === 0 ? '#c0392b' : '#16a085';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(591, 372, 11, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  circle(ctx, 591, 384, 3, '#f1c40f');

  // Soft vignette so the panels feel like one picture.
  const vig = ctx.createRadialGradient(320, 240, 200, 320, 240, 460);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

const MARKET_DIFFS = [
  { id: 'lantern', x: 200, y: 138, r: 22, label: 'the yellow lantern' },
  { id: 'moon', x: 540, y: 70, r: 26, label: 'the moon' },
  { id: 'collar', x: 591, y: 374, r: 18, label: "the cat's collar" },
  { id: 'awning', x: 140, y: 190, r: 24, label: 'the awning stripes' },
  { id: 'apple', x: 484, y: 240, r: 18, label: 'an apple' },
  { id: 'star', x: 90, y: 60, r: 14, label: 'a star' },
  { id: 'sign', x: 156, y: 243, r: 20, label: 'the sign symbol' },
];

// --- Scene 2: The Old Greenhouse ---------------------------------------
// Morning light through glass, shelves of seedlings, a butterfly.

function drawGreenhouse(ctx, variant) {
  const W = PANEL_W;
  const H = PANEL_H;
  const rnd = sceneRandom(1);

  // Warm morning sky seen through the glass.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#bfe3ee');
  sky.addColorStop(0.6, '#e8f3d8');
  sky.addColorStop(1, '#f7e8b0');
  rect(ctx, 0, 0, W, 300, sky);
  circle(ctx, 566, 66, 30, '#fff3c4');
  circle(ctx, 566, 66, 44, 'rgba(255, 243, 196, 0.35)');

  // Glass roof beams.
  ctx.strokeStyle = '#7d9b6a';
  ctx.lineWidth = 6;
  line(ctx, 0, 0, 200, 120, '#7d9b6a', 6);
  line(ctx, 640, 0, 440, 120, '#7d9b6a', 6);
  line(ctx, 0, 120, 640, 120, '#7d9b6a', 6);
  // Window panes on the back wall.
  ctx.strokeStyle = '#8aa37a';
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    ctx.strokeRect(40 + i * 150, 140, 120, 120);
    line(ctx, 100 + i * 150, 140, 100 + i * 150, 260, '#8aa37a', 3);
    line(ctx, 40 + i * 150, 200, 160 + i * 150, 200, '#8aa37a', 3);
  }
  // Difference 6: the sunbeam through the roof is there on the left,
  // gone on the right.
  if (variant === 0) {
    const beam = ctx.createLinearGradient(420, 0, 560, 300);
    beam.addColorStop(0, 'rgba(255, 244, 180, 0.5)');
    beam.addColorStop(1, 'rgba(255, 244, 180, 0)');
    poly(ctx, [[430, 0], [520, 0], [600, 300], [470, 300]], beam);
  }

  // Floor: warm wood.
  const floor = ctx.createLinearGradient(0, 300, 0, H);
  floor.addColorStop(0, '#a9805a');
  floor.addColorStop(1, '#7d5a38');
  rect(ctx, 0, 300, W, H - 300, floor);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 330 + i * 30);
    ctx.lineTo(W, 336 + i * 30);
    ctx.stroke();
  }

  // Potting bench along the bottom.
  rect(ctx, 30, 350, 580, 18, '#6d4a2e');
  rect(ctx, 44, 368, 14, 112, '#5d3d24');
  rect(ctx, 582, 368, 14, 112, '#5d3d24');

  // Shelf of seedlings on the left wall.
  rect(ctx, 40, 170, 150, 12, '#6d4a2e');
  rect(ctx, 40, 250, 150, 12, '#6d4a2e');
  // Difference 4: an extra small pot on the top shelf, right picture only.
  const potsTop = variant === 0
    ? [[62, 158], [108, 158], [152, 158]]
    : [[62, 158], [108, 158], [152, 158], [182, 158]];
  for (const [px, py] of potsTop) {
    poly(ctx, [[px - 12, py], [px + 12, py], [px + 9, py + 14], [px - 9, py + 14]], '#b5651d');
    circle(ctx, px, py - 6, 9, '#3f7d3a');
    circle(ctx, px - 6, py - 10, 6, '#4c9a45');
    circle(ctx, px + 6, py - 10, 6, '#57a84e');
  }
  for (const [px, py] of [[62, 238], [108, 238], [152, 238]]) {
    poly(ctx, [[px - 12, py], [px + 12, py], [px + 9, py + 14], [px - 9, py + 14]], '#a0522d');
    circle(ctx, px, py - 5, 8, '#2e7d32');
  }

  // Big potted flower, centre left. Difference 2: its bloom is red on
  // the left, yellow on the right.
  poly(ctx, [[180, 330], [230, 330], [222, 368], [188, 368]], '#b5651d');
  line(ctx, 205, 330, 205, 268, '#2e7d32', 5);
  ellipse(ctx, 186, 300, 16, 8, '#2e7d32');
  ellipse(ctx, 224, 288, 16, 8, '#388e3c');
  const bloom = variant === 0 ? '#e53935' : '#fdd835';
  for (let p = 0; p < 6; p++) {
    const a = (p / 6) * Math.PI * 2;
    ellipse(ctx, 205 + Math.cos(a) * 16, 256 + Math.sin(a) * 16, 11, 11, bloom);
  }
  circle(ctx, 205, 256, 10, '#ff8f00');

  // A leafy plant with a snail. Difference 5: the snail is there on the
  // left, gone on the right.
  line(ctx, 330, 350, 330, 280, '#2e7d32', 5);
  ellipse(ctx, 306, 306, 26, 12, '#388e3c');
  ellipse(ctx, 356, 296, 26, 12, '#43a047');
  ellipse(ctx, 330, 268, 20, 10, '#2e7d32');
  if (variant === 0) {
    ellipse(ctx, 322, 300, 9, 7, '#8d6e63');
    circle(ctx, 331, 294, 4, '#6d4c41');
    line(ctx, 330, 290, 326, 284, '#6d4c41', 2);
    line(ctx, 333, 290, 336, 284, '#6d4c41', 2);
  }

  // Watering can on the bench, right side. Difference 3: its spout wears
  // a rose head on the left, and is plain on the right.
  rect(ctx, 420, 380, 70, 44, '#5d8aa8');
  ellipse(ctx, 455, 380, 35, 10, '#6d9ab8');
  line(ctx, 490, 392, 528, 366, '#5d8aa8', 8);
  if (variant === 0) {
    circle(ctx, 532, 364, 10, '#4a768f');
    for (let i = 0; i < 5; i++) {
      circle(ctx, 526 + (i % 3) * 5, 360 + Math.floor(i / 3) * 6, 1.5, '#2c4a5a');
    }
  }
  line(ctx, 420, 388, 404, 372, '#5d8aa8', 7);
  // A few water drops under the spout on the left only.
  if (variant === 0) {
    circle(ctx, 534, 396, 3, 'rgba(120, 190, 230, 0.9)');
    circle(ctx, 540, 412, 2.5, 'rgba(120, 190, 230, 0.9)');
  }

  // Hanging planters from the roof.
  function hanger(x, y) {
    line(ctx, x, 120, x, y, '#5d3d24', 2);
    poly(ctx, [[x - 22, y], [x + 22, y], [x + 16, y + 20], [x - 16, y + 20]], '#8d6e63');
    circle(ctx, x - 8, y - 8, 9, '#43a047');
    circle(ctx, x + 8, y - 8, 9, '#388e3c');
    circle(ctx, x, y - 14, 9, '#4caf50');
  }
  hanger(300, 168);
  hanger(380, 160);
  // Difference 7: a third hanging planter on the right picture.
  if (variant === 1) hanger(560, 172);

  // Butterfly. Difference 1: present on the left, gone on the right.
  if (variant === 0) {
    const bx = 480;
    const by = 120;
    poly(ctx, [[bx, by], [bx - 16, by - 12], [bx - 14, by + 8]], '#ff8a65');
    poly(ctx, [[bx, by], [bx + 16, by - 12], [bx + 14, by + 8]], '#ff7043');
    poly(ctx, [[bx, by], [bx - 12, by + 4], [bx - 10, by + 16]], '#ffb74d');
    poly(ctx, [[bx, by], [bx + 12, by + 4], [bx + 10, by + 16]], '#ffa726');
    line(ctx, bx, by, bx, by + 4, '#4e342e', 2);
    circle(ctx, 478, by - 6, 1.5, '#4e342e');
    circle(ctx, 484, by - 6, 1.5, '#4e342e');
  }

  // Soft light wash.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, 'rgba(255, 250, 220, 0.12)');
  wash.addColorStop(1, 'rgba(255, 250, 220, 0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
}

const GREENHOUSE_DIFFS = [
  { id: 'butterfly', x: 480, y: 120, r: 20, label: 'the butterfly' },
  { id: 'bloom', x: 205, y: 256, r: 22, label: 'the big bloom' },
  { id: 'can', x: 532, y: 364, r: 20, label: 'the watering-can rose' },
  { id: 'pot', x: 182, y: 158, r: 18, label: 'a small pot' },
  { id: 'snail', x: 322, y: 298, r: 16, label: 'the snail' },
  { id: 'beam', x: 520, y: 120, r: 24, label: 'the sunbeam' },
  { id: 'planter', x: 560, y: 172, r: 20, label: 'a hanging planter' },
];

// --- Scene 3: Lighthouse Cove ------------------------------------------
// Dusk over the water: a striped lighthouse, boats, gulls and the moon.

function drawCove(ctx, variant) {
  const W = PANEL_W;
  const H = PANEL_H;
  const rnd = sceneRandom(2);

  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.55, '#7a4a6e');
  sky.addColorStop(1, '#e08a5a');
  rect(ctx, 0, 0, W, 280, sky);
  // Early stars.
  const stars = scatter(rnd, 30, 10, 8, 300, 110, 20);
  for (const s of stars) circle(ctx, s.x, s.y, 1 + rnd(), 'rgba(255, 240, 200, 0.8)');

  // Moon. Difference 7: full on the left, crescent on the right.
  circle(ctx, 90, 70, 24, '#f7ead0');
  if (variant === 1) circle(ctx, 101, 62, 20, '#4a3560');
  circle(ctx, 82, 62, 3.5, 'rgba(190, 170, 130, 0.5)');
  circle(ctx, 96, 78, 2.5, 'rgba(190, 170, 130, 0.5)');

  // Gulls. Difference 1: three on the left, two on the right.
  function gull(x, y, s) {
    ctx.strokeStyle = '#2b2350';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y);
    ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
    ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 10 * s, y);
    ctx.stroke();
  }
  gull(150, 92, 1);
  gull(210, 70, 0.85);
  if (variant === 0) gull(268, 96, 0.9);

  // Sea.
  const sea = ctx.createLinearGradient(0, 280, 0, H);
  sea.addColorStop(0, '#c97e4e');
  sea.addColorStop(0.25, '#5a6a8a');
  sea.addColorStop(1, '#2e3d5c');
  rect(ctx, 0, 280, W, H - 280, sea);
  // Wave lines.
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const y = 296 + i * 24;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const yy = y + Math.sin((x + i * 40) / 46) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Sun path on the water.
  const path = ctx.createLinearGradient(0, 280, 0, H);
  path.addColorStop(0, 'rgba(255, 190, 120, 0.5)');
  path.addColorStop(1, 'rgba(255, 190, 120, 0)');
  poly(ctx, [[270, 280], [370, 280], [430, 470], [210, 470]], path);

  // Rocky point and lighthouse, left-centre.
  poly(ctx, [[250, 480], [280, 330], [400, 330], [430, 480]], '#4a3f3a');
  poly(ctx, [[280, 330], [310, 300], [370, 300], [400, 330]], '#3d3430');
  ellipse(ctx, 340, 336, 68, 12, '#5a4a42');
  // Tower: white with red bands.
  poly(ctx, [[318, 320], [362, 320], [356, 180], [324, 180]], '#f5efe0');
  poly(ctx, [[320, 290], [360, 290], [358, 262], [322, 262]], '#c0392b');
  poly(ctx, [[322, 232], [358, 232], [356, 206], [324, 206]], '#c0392b');
  // Gallery and lamp room.
  rect(ctx, 314, 168, 52, 12, '#2b2350');
  rect(ctx, 324, 138, 32, 30, '#2b2350');
  // Difference 5: two lamp-room windows lit on the left, one on the right.
  rect(ctx, 328, 144, 8, 18, '#ffd98a');
  if (variant === 0) rect(ctx, 344, 144, 8, 18, '#ffd98a');
  else rect(ctx, 344, 144, 8, 18, '#3a3a55');
  poly(ctx, [[320, 138], [360, 138], [340, 122]], '#c0392b');
  circle(ctx, 340, 122, 3, '#ffd98a');
  // Difference 2: the beam shines on the left, and is off on the right.
  if (variant === 0) {
    const beam = ctx.createLinearGradient(356, 153, 560, 120);
    beam.addColorStop(0, 'rgba(255, 230, 150, 0.75)');
    beam.addColorStop(1, 'rgba(255, 230, 150, 0)');
    poly(ctx, [[356, 146], [560, 96], [560, 168], [356, 160]], beam);
    const glow = ctx.createRadialGradient(340, 153, 4, 340, 153, 46);
    glow.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
    glow.addColorStop(1, 'rgba(255, 230, 150, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(340, 153, 46, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sailboat. Difference 3: its sail is red on the left, white on the right.
  poly(ctx, [[470, 400], [540, 400], [505, 396]], '#5d3d24');
  rect(ctx, 480, 388, 46, 12, '#7a5230');
  line(ctx, 503, 396, 503, 316, '#3d2a1e', 4);
  poly(ctx, [[503, 320], [503, 388], [548, 388]], variant === 0 ? '#c0392b' : '#f5efe0');
  poly(ctx, [[503, 330], [503, 388], [472, 388]], '#e8dcc0');
  circle(ctx, 503, 314, 3, '#ffd98a');

  // Second boat, a rowboat near the rocks.
  ellipse(ctx, 150, 420, 34, 10, '#6d4a2e');
  line(ctx, 128, 412, 172, 412, '#3d2a1e', 3);
  circle(ctx, 138, 406, 5, '#3b3b4d');
  circle(ctx, 162, 408, 5, '#3b3b4d');

  // Buoy. Difference 4: present on the left, gone on the right.
  if (variant === 0) {
    ellipse(ctx, 180, 384, 12, 8, '#e67e22');
    poly(ctx, [[172, 380], [188, 380], [180, 362]], '#c0392b');
    circle(ctx, 180, 360, 3, '#f1c40f');
  }

  // Rocks in the water. Difference 6: one extra rock on the right.
  ellipse(ctx, 590, 440, 34, 14, '#3d3430');
  ellipse(ctx, 596, 430, 18, 10, '#4a3f3a');
  if (variant === 1) {
    ellipse(ctx, 556, 452, 22, 10, '#3d3430');
  }

  // Foreground shore at the bottom.
  poly(ctx, [[0, 480], [0, 452], [640, 452], [640, 480]], '#2e2620');
  // Grass tufts on the shore.
  ctx.strokeStyle = '#4c7a3a';
  ctx.lineWidth = 2;
  for (const gx of [40, 120, 220, 460, 600]) {
    line(ctx, gx, 462, gx - 4, 448, '#4c7a3a', 2);
    line(ctx, gx + 6, 462, gx + 8, 446, '#57a84e', 2);
    line(ctx, gx + 12, 462, gx + 16, 450, '#3f7d3a', 2);
  }
}

const COVE_DIFFS = [
  { id: 'gull', x: 268, y: 96, r: 18, label: 'a gull' },
  { id: 'beam', x: 430, y: 140, r: 26, label: 'the lighthouse beam' },
  { id: 'sail', x: 524, y: 352, r: 24, label: 'the sail' },
  { id: 'buoy', x: 180, y: 378, r: 16, label: 'the buoy' },
  { id: 'lamp', x: 344, y: 153, r: 16, label: 'a lamp-room window' },
  { id: 'rock', x: 556, y: 452, r: 18, label: 'a rock' },
  { id: 'moon', x: 90, y: 70, r: 22, label: 'the moon' },
];

// --- Registry ------------------------------------------------------------
// draw(ctx, variant) paints one panel; differences lists the seven
// clickable changes, in the same panel coordinates.

export const SCENE_DEFS = [
  { id: 'market', name: 'Lantern Market', draw: drawMarket, differences: MARKET_DIFFS },
  { id: 'greenhouse', name: 'The Old Greenhouse', draw: drawGreenhouse, differences: GREENHOUSE_DIFFS },
  { id: 'cove', name: 'Lighthouse Cove', draw: drawCove, differences: COVE_DIFFS },
];

export function getScene(index) {
  return SCENE_DEFS[index % SCENE_DEFS.length];
}
