# twin-lanterns

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tuyulsembilanenam672-cell/twin-lanterns/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tuyulsembilanenam672-cell/twin-lanterns/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Lanterns is a complete spot-the-difference game that plays offline in a desktop browser. Two near-identical pictures sit side by side in each of three hand-drawn scenes — a lantern market at night, an old greenhouse in the morning, and a lighthouse cove at dusk — and every scene hides 7 differences. Click them on either picture to ring them, beat the clock, and carry your score through all three scenes.

Everything is drawn procedurally on canvas and every sound is synthesized with WebAudio: no images, fonts, or audio files are loaded, and the game makes no network requests. Keyboard play works too: arrow keys move a reticle, Tab switches pictures, Enter marks a difference, H asks for a hint, M mutes, R restarts the scene, P pauses.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Any static file server works too — `game/` is plain static files.

## How to play

- Click a difference on either picture to mark it. Found differences get a numbered gold ring on both pictures.
- A wrong click costs 3 seconds and 10 points. Finds in a row build a combo bonus.
- Hints (H) ring an unfound difference for a few seconds and cost 30 points; 3 per scene.
- Finish a scene to earn a time bonus, then move on. Find all 21 differences to win.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sq78y28z&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
