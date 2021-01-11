function Defender() {
	new MenuInterface();
	arcade.game.object = new defenderGame(false);

	arcade.menu.object.backgroundGame = arcade.game.object = new defenderGame(true);
	arcade.menu.object.buttons = [
		["EXIT", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
		["START GAME", "newDefenderGame()"]
	]
}

function newDefenderGame(){
	exit_open_arcade();
	exit_open_game();

	arcade.game.object = new defenderGame(false);

	gameInterval = new Interval(function(){
		ctx.clearRect(0, 0, window.width, window.height);
		defenderGame.update();
	}, 15);
}

class defenderGame {
	constructor(backgroundGame) {
		this.background = new defenderBackground(window.width);
		this.background.generate();

		if (!backgroundGame){
			this.player = new defenderShip(450,600);
			this.projectiles = [];
			this.cameraOffset = this.background.mapLength/2;
		}
	}
	update() {
		if (!backgroundGame){
			this.cameraOffset = this.player.velX;
			this.player.update();
			this.updateProjectiles();
		}

		this.background.draw();
		this.background.moveMap();
	}
	updateProjectiles() {
		for (let i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].update();
		}
	}
}
