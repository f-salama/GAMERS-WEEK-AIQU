AIQU JEOPARDY - GAMERS WEEK EDITION
===================================

Files:
- index.html        -> the 3 screens (team setup, game board, final leaderboard) + question popup
- styles.css        -> all colours/theme (Gamers Week purple/orange/yellow/red + AIQU logo pink-blue)
- script.js         -> game logic, settings, and the questions
- assets/aiqu-logo.png, esports-logo.png, sponsor-logo.png -> AIQU, QU Esport and sponsor (Bag) logos, shown together on every screen

HOW TO PLAY:
1. Open index.html in a browser (full screen / F11 works great on a projector).
2. Enter the team names (2 to 30 teams). Empty names become "Team 1", "Team 2"...
3. Click a tile. The question shows up.
4. The host picks which team is answering.
5. The host presses Correct or Incorrect.
   - Correct   -> that team gets the points. The answer is shown. Back to the board.
   - Incorrect -> the question goes to another team (teams that already missed are greyed out).
                  The answer stays hidden. If every team misses, nobody gets the points.
   - "Show Answer" lets the host peek at the answer while judging.
   - "Change Team" fixes a mis-click. "Skip" closes a question nobody wants to answer.
6. When all 35 questions are done, the top 3 leaderboard appears.
   (Teams on the same score share a rank.)

OTHER BUTTONS:
- Show Results : ends the game early and shows the leaderboard (e.g. if time runs out)
- Reset Game   : back to team setup (asks first)
- Play Again    : same teams, scores cleared
- New Teams     : back to a blank team setup

HOW TO EDIT QUESTIONS:
1. Open script.js in any code editor
2. Find the gameData array
3. Change category names, questions and answers
4. Keep 5 clues in each category (the board has 5 rows) and 7 categories

SETTINGS (top of script.js):
- MIN_TEAMS / MAX_TEAMS     : how many teams are allowed
- POINTS_LOST_ON_WRONG      : false = wrong answer just passes the question (default)
                              true  = wrong answer also takes the points away
- TEAM_COLORS               : the colour given to each team (repeats after 8 teams)
- COMPACT_SCOREBOARD_FROM   : with more teams than this, the scoreboard uses smaller cards

SPACING (top of styles.css, in :root):
- --wide-logo-scale / --sponsor-logo-scale (in .logo-row) : size of the esports and sponsor logos relative to ours
- --word-gap : extra space between words (0.3em is roughly double). Raise it for more, 0 turns it off.

COLOURS (top of styles.css, in :root):
- Gamers Week palette : --gw-bg, --gw-purple-1, --gw-orange, --gw-yellow, --gw-red ...
- AIQU logo colours   : --logo-pink, --logo-blue

NOTE: the arcade font loads from the internet. Without wifi the page still works,
it just uses a normal font instead.
