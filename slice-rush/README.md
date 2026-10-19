# AIQU Slice Rush

A webcam hand-tracking game that tracks your index fingertip as the blade: swipe through the glowing orbs and monsters, and avoid the spiky bomb.

Everything is in one file (`slice-rush.html`). 

## How to play

1. Stand back so the camera can see your hand (the game tells you if you are too close or too far).
2. Swipe your index finger like a sword to slice orbs and monsters.
3. Do not slice the spiky bomb.

| Object | Effect |
|---|---|
| Pink / sky orb | +1 point |
| Monster | +2 points |
| Golden orb | +5 points (in Survival it also restores a life) |
| Ice orb | +2 points and 3 seconds of slow motion |
| Bomb | -5 points (in Survival it costs a life) |

Slicing quickly in a row builds a combo, which adds bonus points.

### Game modes

- **Casual**: 60 seconds at a relaxed pace.
- **Challenge**: 60 seconds, and objects get faster and more frequent over time.
- **Survival**: 3 lives, no timer. Bombs and monsters that fall uncut cost a life. Lasts as long as you do.

Each mode has its own leaderboard.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Start (on the welcome screen) |
| `1` `2` `3` | Pick Casual / Challenge / Survival |
| `Esc` | Quit the current round |
| `M` | Mute / unmute |
| `F` | Fullscreen |
| `D` | Show FPS |
| `L` | Toggle lite (performance) mode |

Lite mode switches on automatically if the game runs slowly.

## Running it

The game needs a webcam and an internet connection.

Hand tracking (MediaPipe Hands) is loaded from a CDN, so the computer needs an internet connection the first time the page loads.

## Troubleshooting

- **Tracking stops during a game (rare).** Close the browser completely, reopen it, and load the page again. Refreshing the page alone may not be enough.
- **"Camera unavailable" / mouse mode.** Allow camera access in the browser's address bar, make sure no other app is using the camera, and reload. In mouse mode the game still works, but **scores are not saved**, because the mouse is much easier than hand tracking.
- **"Hand tracking failed to load".** Check the internet connection (the tracking library comes from a CDN) and reload.
- **The game feels slow.** Press `L` for lite mode, close other tabs, and use Chrome or Edge.
- **Hand is not detected well.** Use even lighting, keep the hand fully in frame, and follow the "step closer / step back" hint during the countdown.
- **Leaderboard looks empty or out of date.** It refreshes every 30 seconds. If the network is down, the board falls back to scores saved in that browser only.

## Leaderboard

Scores are saved in two places:

- **Browser storage** (`localStorage`), per computer. The **Export CSV** button downloads these.
- **Supabase** (online)

## Tuning

Game balance lives in the `MODES` object near the top of the script (spawn rates, bomb chance, speed ramp, lives). The distance range for "too close / too far" is `HAND_MIN` and `HAND_MAX`.

## Built with

- Plain HTML, CSS and JavaScript (canvas)
- [MediaPipe Hands](https://github.com/google-ai-edge/mediapipe) for hand tracking
- [Supabase](https://supabase.com) for the online leaderboard

