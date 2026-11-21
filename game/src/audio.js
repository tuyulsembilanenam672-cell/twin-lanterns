// Twin Lanterns — all sound is synthesized with WebAudio.
// No audio files are loaded; every effect is a few oscillators shaped
// by a gain envelope. Muted state lives here and is toggled with M.

let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = !!value;
}

// One note: an oscillator that fades out over `dur` seconds.
function note(freq, at, dur, type, vol) {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function now() {
  const ac = ctx();
  return ac ? ac.currentTime : 0;
}

// A bright two-note chime when a difference is found.
export function playFind() {
  const t = now();
  note(880, t, 0.16, 'sine', 0.22);
  note(1318.5, t + 0.07, 0.24, 'sine', 0.2);
}

// A low dull buzz for a wrong click.
export function playMiss() {
  const t = now();
  note(160, t, 0.18, 'sawtooth', 0.08);
  note(110, t + 0.05, 0.22, 'sawtooth', 0.07);
}

// A soft wooden tick for a hint.
export function playHint() {
  const t = now();
  note(1200, t, 0.07, 'triangle', 0.14);
  note(900, t + 0.09, 0.1, 'triangle', 0.12);
}

// A short rising arpeggio when a scene is completed.
export function playSceneClear() {
  const t = now();
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    note(f, t + i * 0.09, 0.3, 'triangle', 0.18);
  });
}

// A longer celebration for finishing the whole game.
export function playWin() {
  const t = now();
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => {
    note(f, t + i * 0.11, 0.34, 'triangle', 0.16);
  });
}

// A falling sigh for running out of time.
export function playLose() {
  const t = now();
  [392, 329.63, 261.63].forEach((f, i) => {
    note(f, t + i * 0.16, 0.4, 'sine', 0.16);
  });
}

// A single UI click for buttons.
export function playClick() {
  const t = now();
  note(660, t, 0.06, 'square', 0.05);
}
