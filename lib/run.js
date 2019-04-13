new MenuOverlay();

overlay.menu.object.buttons = [
    ["START GAME", "newMidnightMotoristsGame()"],
    ["HIGH SCORES", "loadHighscores('kaas', 0,true)"],
    ["HOW TO PLAY", "loadInstructions()"],
    ["EXIT", "loadHub()"]
];

new EscOverlay();

new HighScoresOverlay("test", 10);