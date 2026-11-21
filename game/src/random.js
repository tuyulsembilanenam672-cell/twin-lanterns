// Twin Lanterns — tiny deterministic random numbers.
// The two panels of a scene must be pixel-identical except for the
// differences, so every decorative scatter (stars, speckles, petals)
// comes from a seeded generator, never from Math.random.

// mulberry32: small, fast, good enough for decoration.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A generator bound to one scene, so each scene's decoration is stable
// and different from the others.
export function sceneRandom(sceneIndex) {
  return mulberry32(0x9e3779b9 + sceneIndex * 7919);
}

// Pick a value in [min, max) from a generator.
export function range(rnd, min, max) {
  return min + rnd() * (max - min);
}

// Pick one item from an array with a generator.
export function pick(rnd, items) {
  return items[Math.floor(rnd() * items.length)];
}

// Scatter n points inside a rectangle, with a minimum gap between them
// so stars and speckles never clump into a blob.
export function scatter(rnd, n, x, y, w, h, gap) {
  const points = [];
  let guard = 0;
  while (points.length < n && guard < n * 60) {
    guard += 1;
    const px = x + rnd() * w;
    const py = y + rnd() * h;
    let ok = true;
    for (const p of points) {
      const dx = p.x - px;
      const dy = p.y - py;
      if (dx * dx + dy * dy < gap * gap) {
        ok = false;
        break;
      }
    }
    if (ok) points.push({ x: px, y: py });
  }
  return points;
}
