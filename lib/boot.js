(()=>{
    var url = new URL(decodeURIComponent(window.location.href));
    var id = url.searchParams.get("id");

    if(id !== null && id >= 0 && id < games.length)
        loadingBar(games[id], games[id].replace(/\s/,""))
    else
        new HubInterface();

    // loadingBar("hub", (()=>{ new MenuInterface(); }))

    // new MenuInterface();

    // arcade.menu.object.buttons = [
    //     ["START GAME", "newMidnightMotoristsGame()"],
    //     ["HIGH SCORES", "loadHighscores('kaas', 0,true)"],
    //     ["HOW TO PLAY", "loadInstructions()"],
    //     ["EXIT", "loadHub()"]
    // ];

    // new EscInterface();

    // new HighScoresInterface(currentGame, 10);

    load(games[7]);
})()