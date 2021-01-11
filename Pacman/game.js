var pacManGame;

function PacMan(){
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	menuOverlay = new MenuOverlay();
	PacManMainMenuOverlay();

	menuOverlay.backgroundGame = new PacManGame();
	pacManGame = menuOverlay.backgroundGame;

	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 15);
}

function PacManMainMenuOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "START GAME", "newPacManGame()"),
		new Button(120, canvas.height - 150, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0, true)"),
		new Button(120, canvas.height - 70, 400, 30,"EXIT", "loadHub()")
	];
}

function newPacManGame(){	
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	OverlayIsActive = false;
	
	pacManGame = new PacManGame();
	
	gameInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		pacManGame.update();
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
		this.ai = new PacManAI(this.wall, this.map.space, this.map.intersections, this.map.tunnel);
		this.player = new PacManPlayer(this.wall, this.map.walls);

		this.haseaten = false;		// if we eat either a eatable or powerup, this will be true and processed
		this.def_eattimer = 240; 	// 4 x 60 sec
		this.eattimer = 240;		// if this is below 0, release a ghost

		this.eatables_eaten = 0;
		this.powerups_eaten = 0;
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
			state:false,		// whether the countdown has run out
			def_timer:270,		// 350
			timer:270
		}
		this.gamemode = "";
	}
	
	update(){
		// move the drawn part with a certain offset
		ctx.save();
		ctx.translate(canvas.width/2 - (30 * this.wall.size) / 2,canvas.height / 2 - (33 * this.wall.size) / 2);
		
		// draw the map
		this.map.draw(this.wall);
		
		// if in the overlay
		if(!OverlayIsActive){
			// update the game system
			this.interactionHandler();
			this.eatablesHandler();
			this.readyHandler();
			this.infobarHandler();

			// if not ready, only draw
			if(this.ready.state){
				// update the ai and player
				pacmanBgsound.play();

				this.player.update();
				this.ai.update({x: this.player.node.x, y: this.player.node.y, angle:this.player.angle}, this.ai.ghosts);
			} else {
				pacmanBgsound.pause();
				pacmanReady.play();

				this.player.mouth_angle = 0.1;
				this.player.draw();
				
				for(var g = 0; g < this.ai.ghosts.length; g++){
					this.ai.ghosts[g].draw(this.ai.ghosts[g].x, this.ai.ghosts[g].y);
				}
			}
		} else {
			this.ai.box.release(2);
			this.ai.box.release(3);
			
			for(var g = 0; g < this.ai.ghosts.length; g++){
				if(!this.ai.ghosts[g].fleeing)
					this.ai.ghosts[g].fleeing = true;
					
				this.ai.ghosts[g]._fleeing_animate = false;
			}
		
			this.ai.update({x: this.player.node.x, y: this.player.node.y, angle:this.player.angle}, this.ai.ghosts);
		}
		
		ctx.restore();
	}
	
	restoreLevel(){
		var globalcounter = this.ai.eatTable.counter;
		
		this.player = new PacManPlayer(this.wall, this.map.walls);
		this.ai = new PacManAI(this.wall, this.map.space, this.map.intersections, this.map.tunnel);
		
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
		this.ready.timer = this.ready.def_timer;
			
		this.map = new PacManMap(); 
		
		this.modeTableHandler();
		this.restoreLevel();
	}
	
	readyHandler(){
		if(this.ready.timer > 0){
			this.ready.timer--;
			pacmanBgsound.pause();
		} else {
			this.ready.timer = this.ready.def_timer;
			this.ready.state = true;
		}
	}
	
	infobarHandler(){
		for(var l = 0; l < this.lives; l++){
			var img = new Image(); 
			img.src = "PacMan/src/PacMan.png";
			ctx.drawImage(img, this.wall.size * 1.5 * (l + 1), (this.map.size.rows + 2) * this.wall.size);
		}

		ctx.font = "30px Arial";
		ctx.fillStyle ="white";
		ctx.fillText("POINTS: " + this.points,this.wall.size * 10, (this.map.size.rows + 3) * this.wall.size); 
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
				this.powerups_eaten++;
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
	
	// check if the player is caught by a ghost
	interactionHandler(){
		for(var g = 0; g < this.ai.ghosts.length; g++){
			if(this.ai.ghosts[g].node.x == this.player.node.x && this.ai.ghosts[g].node.y == this.player.node.y && this.player.powered.state == 0){
				// the player is caught
				
				pacmanDeath.play();

				this.player.eaten = true;
				
				for(var e = 0; e < this.ai.ghosts.length; e++){
					this.ai.ghosts[e].disablemovement = true;
				}
				
				if(this.player.nodraw && this.lives != 0)
					this.restoreLevel();
				else if(this.player.nodraw && this.lives == 0)
					loadHighscores("PacMan", this.points);
			}
		}
		
		if(this.eatables_eaten == 240)
			this.levelUp();

		for(var g = 0; g < this.ai.ghosts_eaten.length; g++){
			var isNew = true;
			for(var a = 0; a < this.ghosts_eaten.length; a++){
				if(this.ghosts_eaten[a] == this.ai.ghosts_eaten[g])
					isNew = false;
			}

			if(isNew){
				console.log(this.ai.ghosts_eaten.length);
				this.ghosts_eaten.push(this.ai.ghosts_eaten[g]);
				this.points += 400 * this.ghosts_eaten.length;

				pacmanGhosteaten.play();
			}
		}
	}
}