(()=>{
    var url = new URL(decodeURIComponent(window.location.href));
    var id = url.searchParams.get("id");
    var game = url.searchParams.get("game");
    
    if(id !== null && id >= 0 && id < games.length)
        loadingBar(games[id], games[id].replace(/\s/,""))
    else if(game !== null){
        for(let g = 0; g < games.length; g++){
            if(games[g] == game){
                loadingBar(game, games[g].replace(/\s/,""))
                break;
            }
            if(g == games.length - 1)
                new HubInterface();
        }
    } else {
        new HubInterface();
    }

    // loadingBar("hub", (()=>{ new MenuInterface(); }))

    // new MenuInterface();

    // interfaces.menu.object.buttons = [
    //     ["START GAME", "newMidnightMotoristsGame()"],
    //     ["HIGH SCORES", "loadHighscores('kaas', 0,true)"],
    //     ["HOW TO PLAY", "loadInstructions()"],
    //     ["EXIT", "loadHub()"]
    // ];

    // new EscInterface();

    // new HighScoresInterface(currentGame, 10);

    // load(games[1]);
})()