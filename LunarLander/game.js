function LunarLander(){
    newLunarLanderGame(0);

    // interfaces.menu.object = new MenuInterface();
    // interfaces.menu.object.backgroundGame = new PongGame("AI", "AI");

    // LunarLanderMainMenuOverlay();
}

function LunarLanderMainMenuOverlay(){
    interfaces.menu.object.buttons = [
        ["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "LunarLanderGameSelectorOverlay()"]
    ];
}

function LunarLanderGameSelectorOverlay(){
	interfaces.menu.object.buttons = [
        ["Back", "LunarLanderMainMenuOverlay()"],
        ["Player vs AI", "newLunarLanderGame('Player', 'AI')"],
		["AI vs Player", "newLunarLanderGame('AI', 'Player')"],
        ["Player vs Player", "newLunarLanderGame('Player', 'Player')"]
	];
}

function newLunarLanderGame(difficulty){
    exit_open_game();
    exit_open_interfaces();
	
	interfaces.game.object = new LunarLanderGame();
	
	interfaces.game.interval = new Interval(function(){ 
		interfaces.game.object.update();
	}, 15);
}

class LunarLanderGame{
    constructor(){
        this.initCanvases();

        this.map = new LunarLanderMap();

        this.ctx.strokeStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.moveTo(0,0);
        this.ctx.lineTo(10, 10);

        // for(let v = 1; v < this.map.length; v++)
            // this.ctx.lineTo(this.map[v].x, this.map[v].y);
        this.ctx.stroke(); 
    }

    update(){}

    initCanvases(){
        let playground = document.createElement('canvas');
        playground.id = 'playground';
        playground.width = window.width;
        playground.height = window.height;
        playground.style.position = "absolute";
        playground.style.cursor = "none";
        playground.style.zIndex = 1;
        document.body.appendChild(playground);

        this.canvas = document.getElementById("playground");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");
    }
}
