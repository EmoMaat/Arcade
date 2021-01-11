var pacManGame;

function Pacman(){
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	menuOverlay = new MenuOverlay();
	//PacManMainMenuOverlay();

	menuOverlay.backgroundGame = new PacManGame();
	pacManGame = menuOverlay.backgroundGame;

	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 15);
}
/*
function PacManMainMenuOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "START GAME", "newPacManGame()"),
		new Button(120, canvas.height - 150, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"),
		new Button(120, canvas.height - 70, 400, 30,"EXIT", "loadHub()")
	];
}
*/
function newPacManGame(){	
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	OverlayIsActive = false;
	
	pongGame = new PacManGame(user1, user2);
	
	gameInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		pongGame.update();
	}, 15);
}

class PacManGame{
	constructor(){
		move.smooth = true;

		this.wall = {
			size: canvas.width / 68.571428571428571428571428571429, // = 28
			thickness: 10 ,//canvas.width / 384, 			// = 5, thickness of the borders, 1 is limit
			
			border_thickness: canvas.width / 384, 	// = 5, line widt of the borders in px
			color:"white",
			
			debug:{color_flat:"green", color_1corner:"orange", color_3corner:"yellow", color_closed:"purple",color_alone:"red"}
		};
		
		this.powerup = {
			color:"white", 		// either HEX or color name
			size: canvas.width / 274.28571428571428571428571428571	// = 7, size in px
		};
		
		this.eatable = {
			color:"white", 	// either HEX or color name
			size: canvas.width / 960	// = 2, size in px
		};
		
		this.map = new PacManMap();
		this.player = new PacManPlayer(this.wall, this.map.walls);
		this.ai = new PacManAI(this.wall, this.map.space, this.map.intersections, this.map.tunnel);

		this.haseaten = false;		// if we eat either a eatable or powerup, this will be true and processed
		this.def_eattimer = 240; 	// 4 x 60 sec
		this.eattimer = 240;		// if this is below 0, release a ghost

		this.eatables_eaten = 0;
		this.powerups_eaten = 0;

		this.level = 0;
		this.points = 0;
		
		this.modeTableHandler();
	}
	
	update(){ move.smooth = true;
		// move the drawn part with a certain offset
		//ctx.save();
		//ctx.translate(canvas.width/2 - (30 * this.wall.size) / 2,canvas.height / 2 - (33 * this.wall.size) / 2);
		
		// draw the map
		this.map.draw(this.wall);

		// update the game system
		this.eatablesHandler();
		this.systemHandler();

		// update the ai and player
		this.player.update();
		this.ai.update({x: this.player.node.x, y: this.player.node.y, angle:this.player.angle}, this.ai.ghosts);
		
		//ctx.restore();
	}
	
	modeTableHandler(){
		for(var m = 0; m < this.ai.speedTable.mode.length; m++){
			if(this.level >= this.ai.speedTable.mode[m].level_low && this.level < this.ai.speedTable.mode[m].level_high){
				this.ai.speedTable.current = m;
			}
		}
	}
	
	eatablesHandler(){
		for(var e = 0; e < this.map.eatable.length; e++){
			if(this.player.node.x == this.map.eatable[e].x && this.player.node.y == this.map.eatable[e].y && !this.map.eatable[e].eaten){
				this.map.eatable[e].eaten = true;
				this.eatables_eaten++;
				this.points += 10;
				this.haseaten = true;
			}
		}

		for(var p = 0; p < this.map.powerup.length; p++){
			if(this.player.node.x == this.map.powerup[p].x && this.player.node.y == this.map.powerup[p].y && !this.map.powerup[p].eaten){
				this.map.powerup[p].eaten = true;
				this.powerups_eaten++;
				this.points += 50;

				this.haseaten = true;
				this.ai.fleeing.state = true;
			}
		}
		
		// draw powerups
		for (var p = 0; p < this.map.powerup.length; p++){
			if(!this.map.powerup[p].eaten){
				ctx.beginPath(); // if not eaten
				ctx.fillStyle = this.powerup.color; 
			
				ctx.arc((this.map.powerup[p].x + 1) * this.wall.size - this.wall.size / 2,
					(this.map.powerup[p].y + 1) * this.wall.size - this.wall.size / 2,
					this.powerup.size,0,2*Math.PI);
						
				ctx.fill();
			}
		}
		
		// draw powerups
		for (var e = 0; e < this.map.eatable.length; e++){
			if(!this.map.eatable[e].eaten){ // if not eaten
				ctx.beginPath();
				ctx.fillStyle = this.eatable.color; 
			
				ctx.arc((this.map.eatable[e].x + 1) * this.wall.size - this.wall.size / 2,
					(this.map.eatable[e].y + 1) * this.wall.size - this.wall.size / 2,
					this.eatable.size,0,2*Math.PI);
						
				ctx.fill();
			}
		}	
	}

	/**
	 * This updates the game AI handling
	 */
	systemHandler(){
		if(this.haseaten){
			this.haseaten = false;

			this.eattimer = this.def_eattimer;
		}

		if(this.eattimer <= 0){
			//this.ai.box.release();
			this.eattimer = this.def_eattimer;
		} else 
			this.eattimer--;
	}
}