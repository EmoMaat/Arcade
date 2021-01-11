var asteroidsScreen = 0;
function Asteroids() {
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
        overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	AsteroidsMainMenuOverlay();
	
	menuOverlay.backgroundGame = new AsteroidsGame(false,0);
	menuOverlay.backgroundGame.overlay = true;
	asteroidsGame = menuOverlay.backgroundGame;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0,0,canvas.width,canvas.height);
		menuOverlay.update();
		ctx.drawImage(astTitle,canvas.width/2 - astTitle.width/2,-30);
		if (asteroidsScreen == 2) {
			if (menuOverlay.selected == 0) {
				// ctx.fillText("Play together to score as high as possible",590,canvas.height - 255);
			} else if (menuOverlay.selected == 1) {
				// ctx.fillText("Play against eachother for the highest score",590,canvas.height - 173);
			} 
		}
	},20);
}

function AsteroidsMainMenuOverlay() {
	menuOverlay.selected = 0;
	asteroidsScreen = 0;
	menuOverlay.buttons = [
		new Button(120, canvas.height - 310, 400, 30, "START GAME", "asteroidsSelectMenu()"),
		new Button(120, canvas.height - 230, 400, 30, "HIGH SCORES", "asteroidsHighscores()"),
		new Button(120, canvas.height - 150, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(120, canvas.height - 70, 400, 30, "EXIT", "loadHub()")
	];
}

function asteroidsSelectMenu() {
	menuOverlay.selected = 0;
	asteroidsScreen = 1;
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "1 PLAYER", "newAsteroidsGame(true,1,'')"),	
		new Button(120, canvas.height - 150, 400, 30, "2 PLAYERS", "asteroidsGamemodes()"),
		new Button(120, canvas.height - 70, 400, 30, "BACK", "AsteroidsMainMenuOverlay()")
	];
}

function asteroidsGamemodes() {
	menuOverlay.selected = 0;
	asteroidsScreen = 2;
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "CO-OPERATIVE", "newAsteroidsGame(true,2,'coop')"),
		new Button(120, canvas.height - 150, 400, 30, "VERSUS", "newAsteroidsGame(true,2,'versus')"),
		new Button(120, canvas.height - 70, 400, 30, "BACK", "AsteroidsMainMenuOverlay()")
	];
}

function asteroidsHighscores() {
	// loadHighscores("AsteroidsVersus",0);
	menuOverlay.selected = 0;
	asteroidsScreen = 2;
	menuOverlay.buttons = [
	new Button(120, canvas.height - 310, 400, 30, "SINGLEPLAYER", "loadHighscores('" + currentGame + "', 0,true)"),
		new Button(120, canvas.height - 230, 400, 30, "CO-OPERATIVE","coopHighscores()"),
		new Button(120, canvas.height - 150, 400, 30, "VERSUS","versusHighscores()"),
		new Button(120, canvas.height - 70, 400, 30, "BACK", "AsteroidsMainMenuOverlay()")
	];
	
}

function versusHighscores() {
	loadHighscores("AsteroidsVersus",0,true);
}

function coopHighscores() {
	loadHighscores("AsteroidsCoop",0,true);
}

function newAsteroidsGame(background,players,gamemode) {
	 if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	OverlayIsActive = false;
	
	asteroidsGame = new AsteroidsGame(background,players,gamemode);
	move.smooth = true;
	
	gameInterval = new Interval(updateAsteroids,20);
}

function updateAsteroids() {
	asteroidsGame.update();
}

class AsteroidsGame {
	constructor(backgroundgame,players,gamemode) {
		this.backgroundGame = backgroundgame;
		this.gamemode = gamemode;
		console.log(backgroundgame);
		
		this.asteroids = [];
		if (!this.backgroundGame) {
			for (let i = 0; i < 5; i++) {
				this.asteroids.push(new asteroid(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*(2*Math.PI),2+Math.random()*4,2));
			}
		} else {
			this.asteroids.push(new asteroid(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*(2*Math.PI),2+Math.random()*4,2));
			this.asteroids.push(new asteroid(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*(2*Math.PI),2+Math.random()*4,2));
		}
		
		this.saucers = [];
		this.powerups = [];
		this.projectiles = [];
		this.particles = [];
		this.players = players;
		this.shuttles = [];
		this.round = 1;
		if (!this.backgroundgame) {
			if (this.players == 2) {
				this.shuttles.push(new shuttle(canvas.width/3 + (canvas.width/3*1),0,3,false));
				this.shuttles.push(new shuttle(canvas.width/3 + (canvas.width/3*0),1,3,false));
			}
			if (this.players == 1) {
				this.shuttles.push(new shuttle(canvas.width/2,0,3,false));
			}
		}
		
		this.backgroundSoundCounter = 0; // counter for when to play a sound
		this.backgroundSoundSpeed = 100; //determines how fast the sounds are played (always divisible by two)
		
		this.score = 0;
		
		this.endRound = false;
		this.roundEndCounter = 0;
		this.gameEndCounter = 0;
	}
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		this.updateShuttles();
		this.updateAsteroids();
		this.updateSaucers();
		this.updateProjectiles();
		this.handleCollisions();
		this.handleRounds();
		this.handleSounds();
		this.drawUi();
	}
	updateShuttles() {
		for (let i = 0; i < this.shuttles.length; i++) {
			this.shuttles[i].update();
		}
	}
	updateAsteroids() {
		for (let i = 0; i < this.asteroids.length; i++) {
			this.asteroids[i].update();
		}
		for (let i = 0; i < this.asteroids.length; i++) {
			if (this.asteroids[i].del) {
				this.asteroids.splice(i,1);
			}
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].update();
		}
		for (let i = 0; i < this.particles.length; i++) {
			if (!this.particles[i].toUpdate) {
				this.particles.splice(i,1);
			}
		}
		if (this.asteroids.length == 0 && this.saucers.length == 0) {
			this.endRound = true;
		}
	}
	updateSaucers() {
		for (let i = 0; i < this.saucers.length; i++) {
			this.saucers[i].update();
		}
		for (let i = 0; i < this.saucers.length; i++) {
			if (this.saucers[i].del) {
				this.saucers.splice(i,1);
			}
		}
		if (this.backgroundGame) {
			if (this.saucers.length == 0 && Math.random() > 0.9988) {
				this.saucers.push(new saucer(Math.round(Math.random())));
			}
		} else {
			if (this.saucers.length == 0 && Math.random() > 0.98) {
				this.saucers.push(new saucer(Math.round(Math.random())));
			}
		}
		
	}
	updateProjectiles() {
		for (let i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].update();
		}
		for (let i = 0; i < this.projectiles.length; i++) {
			if (this.projectiles[i].del) {
				this.projectiles.splice(i,1);	
			}
		}
	}
	handleCollisions() {
		//projectiles >
		for (let p = 0; p < this.projectiles.length; p++) {
			// > asteroids
			for (let a = 0; a < this.asteroids.length; a++) {
				let dx = this.projectiles[p].px - this.asteroids[a].x;
				let dy = this.projectiles[p].py - this.asteroids[a].y;
				let dist = Math.sqrt(dx*dx + dy*dy);
				if (dist < this.asteroids[a].radius + 10) {
					this.projectiles[p].del = true;
					this.asteroids[a].split();
					if (this.backgroundSoundSpeed > 20) { //set a maximum value
						this.backgroundSoundSpeed -= 2;
					}
					//award points to correct player (by checking the projectile's source):
					if (this.projectiles[p].friendly) {
						if (this.asteroids[a].splitLvl == 2) {
							this.shuttles[this.projectiles[p].source].score += 20;
						} else if (this.asteroids[a].splitLvl == 1) {
							this.shuttles[this.projectiles[p].source].score += 50;
						} else if (this.asteroids[a].splitLvl == 0) {
							this.shuttles[this.projectiles[p].source].score += 100;
						}
					}
					console.log(this.backgroundSoundSpeed);
					spawnParticles(this.projectiles[p].px,this.projectiles[p].py,1.5,Math.floor(Math.random()*10 + 10));
				}
			}
			
			//projectiles from saucers >
			if (!this.projectiles[p].friendly) {
				// > shuttles
				for (let s = 0; s < this.shuttles.length; s++) { 
					if ((segment_intersection(this.projectiles[p].x,this.projectiles[p].y,this.projectiles[p].px,this.projectiles[p].py, this.shuttles[s].px,this.shuttles[s].py,this.shuttles[s].px2,this.shuttles[s].py2) ||
						segment_intersection(this.projectiles[p].x,this.projectiles[p].y,this.projectiles[p].px,this.projectiles[p].py, this.shuttles[s].px2,this.shuttles[s].py2,this.shuttles[s].px3,this.shuttles[s].py3) ||
						segment_intersection(this.projectiles[p].x,this.projectiles[p].y,this.projectiles[p].px,this.projectiles[p].py, this.shuttles[s].px3,this.shuttles[s].py3,this.shuttles[s].px,this.shuttles[s].py))
						&& !this.shuttles[s].spawnProtection) {
						if (this.shuttles[s].lifes > 0) {
							this.shuttles[s].lifes--;
							this.shuttles[s].thrusting = false;
							this.shuttles[s].respawn = true;
						} else {
							this.shuttles[s].toUpdate = false;
						}
							this.projectiles[p].del = true;
							astExp1.play();
						}
				}
			}
			//projectiles from shuttles >
			if (this.projectiles[p].friendly) {
				// > saucers
				for (let u = 0; u < this.saucers.length; u++) {
					let dx = this.projectiles[p].px - this.saucers[u].x;
					let dy = this.projectiles[p].py - this.saucers[u].hitboxY;
					let dist = Math.sqrt(dx*dx + dy*dy);
					if (dist < this.saucers[u].hitbox) {
						this.saucers[u].del = true;
						this.projectiles[p].del = true;
						let random = randomNumber(1,4);
						eval("astExp"+random+".currentTime = 0");
						eval("astExp"+random+".play()");
						//award points to score:
						if (this.saucers[u].size == 1) {
							this.shuttles[this.projectiles[p].source].score += 800;
						} else if (this.saucers[u].size == 0) {
							this.shuttles[this.projectiles[p].source].score += 1000;
						}
					}
				}
			}
		}
		
		//asteroids >
		for (let a = 0; a < this.asteroids.length; a++) {
			// > shuttles
			for (let s = 0; s < this.shuttles.length; s++) {
				if (!this.shuttles[s].spawnProtection && this.shuttles[s].toUpdate) {
					let dx = this.asteroids[a].x - this.shuttles[s].x;
					let dy = this.asteroids[a].y - this.shuttles[s].y;
					let dist = Math.sqrt(dx*dx + dy*dy);
					if (dist < this.asteroids[a].radius + 10 + this.shuttles[s].radius) {
						this.asteroids[a].split();
						spawnParticles(this.asteroids[a].x,this.asteroids[a].y,1.5,Math.floor(Math.random()*10 + 10));
						if (this.shuttles[s].lifes >= 0) {
							this.shuttles[s].lifes--;
							this.shuttles[s].respawn = true;
							this.shuttles[s].thrusting = false;
						} else {
							this.shuttles[s].toUpdate = false;
						}
					}
				}
			}
		}
	}
	handleRounds() {
		if (this.endRound) {
			this.nextRound(this.round);
		}
		if (this.shuttles.length > 0) {
			if (this.gamemode == "") {
				if (this.shuttles[0].lifes < 0) {
					this.gameEndCounter++;
					if (this.gameEndCounter > 40) {
						ctx.font = "60px segoe ui";
						ctx.fillStyle = "#FFF";
						ctx.textAlign = "center";
						ctx.fillText("GAME OVER",canvas.width/2,canvas.height/3);
					}
					if (this.gameEndCounter > 90) {
						ctx.fillText("YOUR SCORE: " + this.shuttles[0].score,canvas.width/2,canvas.height/3 + 80);
					}
					if (this.gameEndCounter > 200) {
						loadHighscores(currentGame,this.shuttles[0].score);
					}
				}
			} else {
				//TEST IF WORKS!!!
				if (this.shuttles[0].lifes < 0 && this.shuttles[1].lifes < 0) {
					this.gameEndCounter++;
					ctx.font = "60px segoe ui";
					ctx.fillStyle = "#FFF";
					ctx.textAlign = "center";
					if (this.gamemode == "versus") {
						if ((this.shuttles[0].score > this.shuttles[1].score)) {
							if (this.gameEndCounter > 40) {
								ctx.fillText("PLAYER 1 WON!",canvas.width/2,canvas.height/3);
							}
							if (this.gameEndCounter > 90) {
								ctx.fillText("WITH A SCORE OF: " + this.shuttles[0].score,canvas.width/2,canvas.height/3 + 80)
							}
							if (this.gameEndCounter > 200) {
								loadHighscores(currentGame+"Versus",this.shuttles[0].score);
							}
						} else {
							if (this.gameEndCounter > 40) {
								ctx.fillText("PLAYER 2 WON!",canvas.width/2,canvas.height/3);
							}
							if (this.gameEndCounter > 90) {
								ctx.fillText("WITH A SCORE OF: " + this.shuttles[1].score,canvas.width/2,canvas.height/3 + 80)
							}
							if (this.gameEndCounter > 200) {
								loadHighscores(currentGame+"Versus",this.shuttles[1].score);
							}
							
						}
					} else {
						this.gameEndCounter++;
						if (this.gameEndCounter > 40*2) {
							ctx.font = "60px segoe ui";
							ctx.fillStyle = "#FFF";
							ctx.textAlign = "center";
							ctx.fillText("GAME OVER",canvas.width/2,canvas.height/3);
						}
						if (this.gameEndCounter > 90*2) {
							let score = Number(this.shuttles[0].score) + Number(this.shuttles[1].score);
							ctx.fillText("YOUR SCORE: " + score,canvas.width/2,canvas.height/3 + 80);
						}
						if (this.gameEndCounter > 200*2) {
							loadHighscores(currentGame+"Coop",Number(this.shuttles[0].score) + Number(this.shuttles[1].score));
						}
					}
				}
			}
		}
		
	}
	
	nextRound(wave) {
		if (this.roundEndCounter == 0) {
			this.round++;
		}
		this.roundEndCounter++;
		if (this.roundEndCounter == 20) {
			for (let i = 0; i < this.players; i++) {
				this.shuttles[i].velX = 0;
				this.shuttles[i].velY = 0;
			}
		}
		if (this.roundEndCounter > 20) {
			this.projectiles = [];
			ctx.fillStyle = "#000";
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		if (this.roundEndCounter > 40 && this.roundEndCounter < 100) {
			ctx.fillStyle = "#fff";
			ctx.textAlign = "center";
			ctx.font = "50px segoe ui";
			ctx.fillText("ROUND " + wave,canvas.width/2,canvas.height/2);
		}
		if (this.roundEndCounter == 140) {
			//spawn number of asteroids according to wave + 1
			for (let i = 0; i < wave + 1; i++) {
				this.asteroids.push(new asteroid(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*(2*Math.PI),2+Math.random()*4,2));
			}
			this.backgroundSoundSpeed = 100;
			this.backgroundSoundCounter = 0;
			//reset positions for players
			for (let i = 0; i < this.players; i++) {
				this.shuttles[i].y = canvas.height/2;
				//reset x positions for each player:
				if (this.players == 1) {
					this.shuttles[i].x = canvas.width/2;
				}
				if (this.players == 2) {
					this.shuttles[i].x = canvas.width/3 + (canvas.width/3*i);
				}
				this.shuttles[i].spawnProtection = true; //also give back spawnProtection
			}
			this.roundEndCounter = 0;
			this.endRound = false;
		}
	}
	handleSounds() {
		if (this.backgroundGame) {
			this.backgroundSoundCounter++;
			if (this.backgroundSoundCounter > this.backgroundSoundSpeed) {
				this.backgroundSoundCounter = this.backgroundSoundSpeed; //to make sure it cannot get above the maximum when the max gets lowered
			}
			if (this.backgroundSoundCounter == this.backgroundSoundSpeed/2 && !this.endRound) {
				astThumpLo.play();
			}
			if (this.backgroundSoundCounter == this.backgroundSoundSpeed && !this.endRound) {
				astThumpHi.play();
				this.backgroundSoundCounter = 0;
			}
		}
		if (this.players == 1) {
			if (this.shuttles[0].thrusting) {
				astThrust.play();
			} else {
				astThrust.pause();
				astThrust.currentTime = 0;
			}
			if (!this.shuttles[0].toUpdate) {
				astThrust.pause();
				astThrust.currentTime = 0;
			}
		} else if (this.players == 2) {
			if (this.shuttles[0].thrusting || this.shuttles[1].thrusting) {
				astThrust.play();
			} else {
				astThrust.pause();
				astThrust.currentTime = 0;
			}
			if (!this.shuttles[0].toUpdate && !this.shuttles[1].toUpdate) {
				astThrust.pause();
				astThrust.currentTime = 0;
			}
			if (!map[38] && !map[87] && !map.Button3 && !map.axis1 == -1) {
				astThrust.pause();
				astThrust.currentTime = 0;
			}
			for (let i = 0; i < this.shuttles.length; i++) {
				if (!this.shuttles[i].toUpdate) {
					this.shuttles[i].thrusting = false;
				}
			}
		}
	}
	drawUi() {
		ctx.fillStyle = "#fff";
		ctx.font = "50px segoe ui";
		if (this.gamemode == "coop") {
			ctx.textAlign = "center";
			ctx.fillText(this.shuttles[0].score + this.shuttles[1].score,canvas.width/2,50);
		}
		if (this.gamemode == "versus") {
			ctx.textAlign = "right";
			ctx.fillText(this.shuttles[0].score,canvas.width - 300,50);
			ctx.textAlign = "left";
			ctx.fillText(this.shuttles[1].score,200,50);
		}
		if (this.gamemode == "") {
			ctx.textAlign = "left";
			ctx.fillText(this.shuttles[0].score,200,50);
		}
		
		if (this.shuttles.length > 0) {
			for (let s = 0; s < this.shuttles.length; s++) {
				let offset = 0;
				if (this.players == 2) {
					offset = 910;
					if (s == 1) {
						offset = 0;
					}
				}
				for (let i = 0; i < this.shuttles[s].lifes; i++) {
					ctx.drawImage(astLife,(200 + offset)+50*i,80,astLife.width*0.8,astLife.height*0.8);
				}
			}	
				
		}
		
	}
	quit() {
	}
}


