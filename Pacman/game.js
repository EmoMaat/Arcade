function Pacman(){
	new MenuInterface();
	arcade.menu.object.buttons = [
		["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
		["START GAME", "newPacManGame()"]
	];

	arcade.menu.object.backgroundGame = arcade.game.object = new PacManGame();
}

function newPacManGame(){
	exit_open_game();
	exit_open_arcade();

	arcade.game.object = new PacManGame();

	arcade.game.interval = new Interval(function(){
		arcade.game.object.update();
	}, 15);
}

class PacManGame{
	constructor(){
		move.continuous = true;
		this.window_scale = window.height / 1080;
		this.OverlayIsActiveActivated = false;
		this.offset = window.width / 2 - (900 * window.height / 1080) / 2;

		// create a canvas containing the options
		let PacManCanvas = document.createElement('canvas');
		PacManCanvas.id = 'PacManCanvas';
		PacManCanvas.width = window.width;
		PacManCanvas.height = window.height;			// is set later
		PacManCanvas.style.left = 0;
		PacManCanvas.style.bottom = 0;
		PacManCanvas.style.position = "absolute";
		PacManCanvas.style.cursor = "none";
		PacManCanvas.style.zIndex = 1;
		document.body.appendChild(PacManCanvas);

		this.canvas = document.getElementById("PacManCanvas");		// canvas stuff
		this.ctx = this.canvas.getContext("2d");	// canvas stuff

		this.map = new PacManMap(this.window_scale);
		this.ai = new PacManAI(this.map.settings, this.map.space, this.map.intersections, this.map.tunnel, this.offset, this.ctx);
		this.player = new PacManPlayer(this.map.settings, this.map.walls, this.offset, this.ctx);

		this.def_eattimer = 240; 	// 4 x 60 sec
		this.eattimer = 240;		// if this is below 0, release a ghost

		this.eatables_eaten = 0;
		this.ghosts_eaten = [];

		// this.sounds = {
			// chomp: new Audio("Pacman/src/chomp.wav"),
			// death: new Audio("Pacman/src/death.wav"),
			// ghosteaten: new Audio("Pacman/src/ghosteat.wav"),
			// ready: new Audio("Pacman/src/ready.wav"),
			// bgsound: new Audio("Pacman/src/bgsound.wav")
		// };

		this.lives = 2;
		this.level = 1;
		this.points = 0;

		this.modeTableHandler();

		this.ready = {
			state:false,
			timer:270,
			def_timer:270
		};
	}

	exit(){
		if(document.getElementById("PacManCanvas") !== null)
			document.getElementById("PacManCanvas").parentElement.removeChild(document.getElementById("PacManCanvas"))
		if(document.getElementById("PacManMap") !== null)
			document.getElementById("PacManMap").parentElement.removeChild(document.getElementById("PacManMap"))

		arcade.game.interval.stop();
		arcade.game.object = {};
	}

	update(){
		this.ctx.clearRect(0, 0, window.width, window.height);
		// if in the overlay
		if(!arcade.menu.active){
			// update the game system
			this.interactionHandler();
			this.eatablesHandler();
			this.readyHandler();
			this.infobarHandler();

			// if not ready, only draw
			if(this.ready.state){
				// update the ai and player
				pacmanBgsound.play();
				pacmanBgsound.volume = 0.7;
				pacmanReady.pause();

				this.player.update();
				this.ai.update({x: this.player.node.x, y: this.player.node.y, angle:this.player.angle}, this.ai.ghosts);
			} else {
				pacmanBgsound.pause();
				pacmanReady.play();

				this.player.mouth_angle = 0.1;
				this.player.draw();

				for(var g = 0; g < this.ai.ghosts.length; g++)
					this.ai.ghosts[g].draw();

			}
		} else {
			if(!this.OverlayIsActiveActivated){
				this.OverlayIsActiveActivated = true;
				this.ai.ghosthouse.release(2);
				this.ai.ghosthouse.release(3);

				for(var g = 0; g < this.ai.ghosts.length; g++){
					if(!this.ai.ghosts[g].fleeing)
						this.ai.ghosts[g].fleeing = true;

					this.ai.ghosts[g]._animate_fleeing = false;
				}
			}

			this.ai.update({x: this.player.node.x, y: this.player.node.y, angle:this.player.angle}, this.ai.ghosts);
		}
	}

	restoreLevel(){
		var globalcounter = this.ai.eatTable.counter;
		this.ghosts_eaten = [];

		this.player = new PacManPlayer(this.map.settings, this.map.walls, this.offset, this.ctx);
		this.ai = new PacManAI(this.map.settings, this.map.space, this.map.intersections, this.map.tunnel, this.offset, this.ctx);

		this.ai.eatTable.counter = globalcounter;
		this.ai.eatTable.died = true;

		this.ready.state = false;
		this.lives--;
	}

	levelUp(){
		this.level++;
		this.ai.eatTable.died = false;
		this.eatables_eaten = 0;
		this.ai.eatTable.counter = 0;
		this.ready.state = false;

		this.map = new PacManMap(this.window_scale);

		this.modeTableHandler();
		this.restoreLevel();
	}

	readyHandler(){
		if(this.ready.timer > 0 && !this.ready.state){
			this.ready.timer--;
			pacmanBgsound.pause();
		} else {
			this.ready.timer = 270;
			this.ready.state = true;
		}
	}

	infobarHandler(){
		for(var l = 0; l < this.lives; l++){
			var img = new Image();
			img.src = "PacMan/src/PacMan.png";
			this.ctx.drawImage(img, this.map.settings.size * 1.5 * (l + 1), (this.map.size.rows + 2) * this.map.settings.size);
		}

		this.ctx.font = "30px" + arcade.font;
		this.ctx.fillStyle ="white";
		this.ctx.fillText("POINTS: " + this.points,this.map.settings.size * 10, (this.map.size.rows + 3) * this.map.settings.size);
	}

	modeTableHandler(){
		for(var m = 0; m < this.ai.speedTable.mode.length; m++)
			if(this.level >= this.ai.speedTable.mode[m].level_low && this.level <= this.ai.speedTable.mode[m].level_high)
				this.ai.speedTable.current = m;

		for(var m = 0; m < this.ai.scatterTable.mode.length; m++)
			if(this.level >= this.ai.scatterTable.mode[m].level_low && this.level <= this.ai.scatterTable.mode[m].level_high)
				this.ai.scatterTable.current = m;

		for(var m = 0; m < this.ai.eatTable.mode.length; m++)
			if(this.level >= this.ai.eatTable.mode[m].level_low && this.level <= this.ai.eatTable.mode[m].level_high)
				this.ai.eatTable.current = m;
	}

	eatablesHandler(){
		for(var e = 0; e < this.map.eatable.length; e++){
			if(this.player.node.x == this.map.eatable[e].x && this.player.node.y == this.map.eatable[e].y && !this.map.eatable[e].eaten){
				this.map.eatable[e].eaten = true;

				pacmanChomp.currentTime = 0;
				pacmanChomp.play();

				if(!this.ai.eatTable.died)
					this.ai.eatables_eaten++;
				else
					this.ai.eatTable.counter++;

				this.eatables_eaten++;
				this.points += 10;
			}
		}

		for(var p = 0; p < this.map.powerup.length; p++){
			if(this.player.node.x == this.map.powerup[p].x && this.player.node.y == this.map.powerup[p].y && !this.map.powerup[p].eaten){
				this.map.powerup[p].eaten = true;
				this.points += 50;
				this.ghosts_eaten = [];

				this.player.powered.state = 1;
				this.player.powered.timer = 600;

				this.ai.fleeing.state = true;
				this.ai.fleeing.timer = this.ai.fleeing.deftimer;
			}
		}

		// draw powerups
		for (var p = 0; p < this.map.powerup.length; p++){
			if(!this.map.powerup[p].eaten){
				this.ctx.beginPath(); // if not eaten
				this.ctx.fillStyle = this.map.settings.powerup.color;

				this.ctx.arc((this.map.powerup[p].x + 1) * this.map.settings.size - this.map.settings.size / 2 + this.offset,
					(this.map.powerup[p].y + 1) * this.map.settings.size - this.map.settings.size / 2,
					this.map.settings.powerup.size,0,2*Math.PI);

				this.ctx.fill();
			}
		}

		// draw powerups
		for (var e = 0; e < this.map.eatable.length; e++){
			if(!this.map.eatable[e].eaten){ // if not eaten
				this.ctx.beginPath();
				this.ctx.fillStyle = this.map.settings.eatable.color;

				this.ctx.arc((this.map.eatable[e].x + 1) * this.map.settings.size - this.map.settings.size / 2 + this.offset,
					(this.map.eatable[e].y + 1) * this.map.settings.size - this.map.settings.size / 2,
					this.map.settings.eatable.size,0,2*Math.PI);

				this.ctx.fill();
			}
		}
	}

	// check if the player is caught by a ghost
	interactionHandler(){
		for(var g = 0; g < this.ai.ghosts.length; g++){
			// check if the player caught a ghost
			if (this.ai.ghosts[g].node.x == this.player.node.x && this.ai.ghosts[g].node.y == this.player.node.y && this.player.powered.state != 0 && !this.inArray(g, this.ghosts_eaten)){
				// update the score accordingly
				this.ghosts_eaten.push(g);
				this.ai.ghosthouse.contain(g);

				this.ai.ghosts[g].eaten = true;
				this.ai.ghosts[g]._waseaten = true;

				this.points += 400 * this.ghosts_eaten.length;

				//pacmanGhosteaten.play();
			} else

			// check if the player is caught
			if(this.ai.ghosts[g].node.x == this.player.node.x && this.ai.ghosts[g].node.y == this.player.node.y && this.ai.ghosts[g].eaten == false && (this.player.powered.state == 0 || this.inArray(g, this.ghosts_eaten)) || this.player.eaten){

				pacmanDeath.play();

				this.player.eaten = true;

				for(var e = 0; e < this.ai.ghosts.length; e++){
					this.ai.ghosts[e].disablemovement = true;
				}

				if(this.player.nodraw && this.lives != 0)
					this.restoreLevel();
				else if(this.player.nodraw && this.lives == 0)
					new HighScoresInterface("Pacman", this.points);
			}
		}

		if(this.eatables_eaten == 240)
			this.levelUp();
	}

	inArray(item, array){
		for (var i = 0; i < array.length; i++){
			if(item == array[i])
				return true;
		}
		return false;
	}
}