# Break the AI Guard — AIQU booth game

Gamers Week · Qatar University · AI Association

Players chat with 5 robot guards and try to trick each one into leaking its password.

## 1. Start it (2 minutes)

You only need **Python 3** (free from python.org). On Windows, tick **"Add Python to PATH"** when you install it.

| Laptop | What to do |
|---|---|
| Windows | Double-click **START-WINDOWS.bat** |
| Mac | Double-click **START-MAC.command** (first time: right-click → Open) |
| Any | Open a terminal in this folder and run `python server.py` (or `python3 server.py`) |

The game opens in your browser at **http://localhost:8000**. Use Chrome and press **F11** for full screen.
To stop the game, close the black window or press **Ctrl+C** in it.

## 2. Turn on the live AI (optional but recommended)

With no key, the game uses **offline guards**. These follow fixed rules and need no internet, so the booth never breaks.
To make the guards real AI, open **config.json** and paste a key:



**Gemini (Google), if you'd rather use a free key**
1. Get a key at https://aistudio.google.com (Get API key).
2. Set `"provider": "gemini"`, paste the key into `"gemini_api_key"`, and set `"gemini_model"` to a Flash model name exactly as AI Studio shows it.

Save config.json and restart the server. The window should say **AI guards: LIVE**.

⚠️ Never share config.json or post it online; it contains your key.
If the internet drops during the event, the game automatically falls back to the offline guards for that message.

## 3. Run the booth

- **Staff panel:** press **Ctrl+Shift+S**, or tap the club logo 5 times. From there you can:
  - change the seconds per player
  - test the AI
  - force offline mode
  - set the default language
  - remove rude names from the scoreboard
  - skip a level (for demos)
  - paste the attendance form link, the Instagram link, or the join address (only works on the booth laptop itself)
- **QR codes:** the yellow card shows one QR code for Instagram (@aiqu.qa) and one for attendance. The attendance one shows "Link coming soon" until you paste the forms link in the staff panel (or put it in `config.json` as `"attendance_url"`).
- **Theme song:** an 8-bit loop starts after the first tap or key press. The **MUSIC** button turns it on or off. To use your own song, put an MP3 named `music.mp3` in the `public/` folder.
- **Scores** are saved in `scores.json`. The board shows today's top players; the Humans vs AI counter covers the whole event.
- **Second laptop or tablet:** keep the server running on one laptop and connect both to the same Wi-Fi. On the other device, open the "Other devices" address the server window shows (e.g. `http://192.168.1.20:8000`), or tap the **JOIN** button at the top of the game to get a QR code and a COPY button for it. If the address it shows is wrong (for example, a laptop with both Wi-Fi and a cable plugged in), paste the right IP in the staff panel under "Join address". All devices share one scoreboard. If university Wi-Fi blocks this, use a phone hotspot.

## 4. Change things

| What | Where |
|---|---|
| Guards: personality, weakness, hints, points | `public/game.js` → `LEVELS` |
| Password word list | `public/game.js` → `WORDS` |
| All screen text, English and Arabic (rules, labels…) | `public/game.js` → `T` |
| Colors and layout | `public/style.css` (colors are at the top in `:root`) |
| Port, AI model, attendance / Instagram links, join address | `config.json` |
| Theme song | put your own `public/music.mp3`, or edit `LEAD` / `BASS` in `public/game.js` |

## How it works

- `server.py` uses only Python's standard library. It serves the `public/` folder and saves scores to `scores.json`.
- It also forwards each chat message to the AI, so the API key never reaches the browser.
- Each player gets 5 random passwords, so people in line can't copy each other.
- Levels 3–5 run a real output filter in code that censors the password even when the AI "says" it. Players have to find the way around it.
- Opening `public/index.html` directly also works, in offline mode, with scores kept in that browser only.
