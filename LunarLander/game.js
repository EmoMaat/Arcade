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

    this.collision_chance = 0;//300;   // actually an interval, so its starting point will be high
    this.collision_timer = 0;

	interfaces.game.object = new LunarLanderGame();

	interfaces.game.interval = new Interval(function(){
		interfaces.game.object.update();
	}, 15);
}

class LunarLanderGame{
    constructor(){
        this.initCanvases();
        move.continuous = true;

        this.map = new LunarLanderMap(this.canvas);
        this.player = new LunarLanderPlayer(this.canvas);

        this.map.render();

    }

    update(){

        // if(this.player.updateZoomHitbox){
            this.map.focus(this.player.processHitbox(), this.player.hitbox);
            // this.player.updateZoomHitbox = false;
        // }
        this.player.update();

    }

    initCanvases(){
        let map = document.createElement('canvas');
        map.id = 'map';
        map.width = window.width * 2;
        map.height = window.height;
        map.style.position = "absolute";
        map.style.cursor = "none";
        map.style.zIndex = 1;
        document.body.appendChild(map);

        this.canvas = document.getElementById("map");		// canvas stuff
    }
}
