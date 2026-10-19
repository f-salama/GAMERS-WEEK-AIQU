# Rock Paper Scissors vs AI

A webcam-based Rock Paper Scissors game built by the AIQU AI Club for Gamers Week. Show your hand to the camera, make a move, and see if you can beat the machine. 

---

## How to Play

1. Open the game and allow camera access when the browser asks.
2. Click **Start** on the welcome screen.
3. Choose a mode:
   - **Casual:** play as many rounds as you like, just for fun. Press **Play** (or the **Space** key) to start each round.
   - **Challenge (60 seconds):** type your name first, then score as many points as you can before the timer runs out. Your score is saved to the leaderboard automatically when time is up.
4. The screen is split in two:
   - **YOU** (left): your live camera view.
   - **AI** (right): the AI's move, shown as a gently shaking hand.
5. Make your move when each round starts. The game captures your move over a 1-second window (when it says SHOOT!), so hold it steady.

### Challenge Scoring

- **Win:** 3 points, plus a **win-streak bonus**: +1 for each win already in a row (up to +3 extra per win)
- **Draw:** 1 point (keeps your streak alive)
- **Loss:** 0 points (resets your streak)
- **No hand seen:** 0 points and the time is still used (streak does not reset)

---

## Tips for the Best Results

These make a big difference to how well the game reads your hand:

- **Face your palm towards the camera for every move.** Rock, paper and scissors are all recognised best when the palm side of your hand faces the camera, not the side of your hand. (Avoid pointing directly at the camera as well)
- **Keep your whole hand inside the YOU frame**, with the fingers fully visible.
- **Hold the move steady** during the 1-second capture window. Avoid moving your hand around while it is being read.
- **Make clear shapes:**
  - Rock: a tight closed fist.
  - Paper: all five fingers open and spread slightly.
  - Scissors: only the index and middle fingers extended, the others folded.
- **Keep your hand a comfortable distance** from the camera (roughly an arm's length or a bit closer).
- **Only one player's hand should be in view** at a time.

### See How Your Move Is Identified

Two separate buttons above the game let you look behind the scenes:

- **Show hand (D):** draws the tracked hand skeleton over the camera, with a coloured dot on each fingertip (green = straight, yellow = half bent, red = curled), so you can see exactly what the camera sees.
- **Hand info (I):** shows technical details such as FPS and finger angles.

If the game keeps misreading your move, turn on **Show hand** and check that every finger is being tracked, then adjust your hand until the skeleton matches your gesture.

---

## Other Features

- **Light / dark mode:** use the round icon at the top right (or press **T**).
- **Sound:** turn the game sounds on or off with the **Sound** button.
- **Full screen:** use the **Full screen** button (or press **F**).
- **Leaderboard:** scores are saved in your browser and also submitted to a shared online leaderboard (Supabase) so scores stay consistent across devices at the booth. Players with the same score share the same rank.
- **CSV export:** download the leaderboard as a CSV file with the **Export CSV** button.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| Space | Start a round (Casual mode) |
| D | Show / hide the hand skeleton |
| I | Show / hide hand info |
| F | Full screen |
| T | Light / dark mode |

---

## Running the Game

The game requires camera access and an internet connection: the hand-tracking library and AI model are loaded online, and the online leaderboard needs a connection too. Use a modern browser with webcam support.

## Online Leaderboard Setup (Supabase)

The online leaderboard uses a Supabase project.

- If the internet connection fails, the game still works and scores are saved in the browser, then uploaded later when the connection returns.

## Troubleshooting

| Problem | What to try |
|---|---|
| Camera does not start | Allow camera permission in the browser, also close other apps using the camera |
| Moves are misread | Face your palm to the camera, hold the move steady, improve the lighting, and check the hand skeleton using **Show hand (D)**. |
| Game is slow or laggy | Close other browser tabs, or try a different web browser. |
| Scores do not appear on the online leaderboard | Check the internet connection. Scores are still saved in the browser. |

---

Enjoy
