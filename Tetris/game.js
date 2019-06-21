function Tetris(){
    new MenuInterface();

    interfaces.menu.object.backgroundGame = new MidnightMotoristsGame();
    interfaces.menu.object.header = "MidnightMotorists/sprits/title.png";
    interfaces.menu.object.buttons = [
		["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "newTetrisGame()"]
	];
}

function newTetrisGame(){
    exit_open_game();
    exit_open_interfaces();
    
    // interfaces.menu.object.backgroundGame.audioMenu.pause();
	
	interfaces.game.object = new TetrisGame();
	
	interfaces.game.interval = new Interval(function(){ 
		interfaces.game.object.update();
	}, 15);
}

class TetrisGame{
    constructor(){

        let MidnightMotoristsCanvas = document.createElement('canvas');
        MidnightMotoristsCanvas.id = 'MidnightMotoristsCanvas';
        MidnightMotoristsCanvas.width = canvas.width;
        MidnightMotoristsCanvas.height = canvas.height;
        MidnightMotoristsCanvas.style.left = 0;
        MidnightMotoristsCanvas.style.zIndex = 1;
        MidnightMotoristsCanvas.style.position = "absolute";
        MidnightMotoristsCanvas.style.cursor = "none";
        document.body.appendChild(MidnightMotoristsCanvas);

        this.canvas = document.getElementById("MidnightMotoristsCanvas");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");			        // canvas stuff
    }
}