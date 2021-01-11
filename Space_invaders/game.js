function SpaceInvaders() {
	HubControl = false;
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
        overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	SpaceInvadersMainMenuOverlay();
	
	menuOverlay.backgroundGame = new SpaceInvadersGame(true);
	menuOverlay.backgroundGame.overlay = true;
	spaceInvadersGame = menuOverlay.backgroundGame;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0,0,canvas.width,canvas.height);
		menuOverlay.update();
	}, 5);
}

function SpaceInvadersMainMenuOverlay() {
	menuOverlay.selected = 0;
	menuOverlay.buttons = [
		new Button(canvas.width/2 - 200, canvas.height - 230, 400, 30, "START", "newSpaceInvadersGame(false)"),
		new Button(canvas.width/2 - 200, canvas.height - 150, 400, 30, "HIGHSCORES", "loadHighscores('" + currentGame + "', 0,true)"),
		new Button(canvas.width/2 - 200, canvas.height - 70, 400, 30, "EXIT", "loadHub()")
	];
}

function newSpaceInvadersGame(background) {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	clearInterval(gameInterval);
	clearInterval(overlayInterval);
	OverlayIsActive = false;
	
	spaceInvadersGame = new SpaceInvadersGame(background)
	move.smooth = true;
	
	gameInterval = new Interval(updateSpaceInvaders,5);
}

function updateSpaceInvaders() {
	spaceInvadersGame.update();
}

class SpaceInvadersGame {
	constructor(background) {
		this.background = background;
		this.score = 0;
		this.cannon = new Cannon();
		
		//objects stored in arrays:
		this.projectiles = [];
		this.alienProjectiles = [];
		this.bunkers = [];
		this.aliens = [];
		this.motherships = [];
		
		if (this.background)
			this.motherships.push(new Mothership());
		
		//vars for moving aliens:
		this.alienVertical = 0;
		this.alienMove = 0;
		this.alienSy = 0;
		this.rate = 150; //150
		this.direction = 1;
		this.switched = false;
		
		this.count = 0;
		this.beep = 1;
		
		this.maxR = {x:0};
		this.maxL = {x:canvas.width};
		this.maxY = {y:0};
		
		//bottom line on 1st wave at y = 450
		//drop by 50 each time
		
		//vars for waves:
		this.wave = 1;
		this.roundEndTimer = 0;
		this.waveCycles = 0;
		this.firstLoop = true;
		
		this.gameEndTimer = 0;
		this.invaded = false;
		this.destroyed = false;
		
		//vars for alien spawning:
		this.spawnCounter = -5; //vertical spawn pos * 5
		this.alienPos = 0; //horizontal spawn pos
		this.aliensSpawned = false;
		
		this.alienProjectileScale = 1;
		this.alienProjectileCounter = 0;
		this.gamemode = "";
		this.spawnBunkers();
		lowPitchUfo.pause();
	}
	
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (!this.aliensSpawned) {
			this.spawnAliens();
		}
		//first handle alienmovement, after that handle all updates and collisions.
		if (this.aliensSpawned) {
			this.handleAlienMovement();
			this.handleAlienShooting();
		}
		ctx.save();
		ctx.scale(0.75,0.75);
		ctx.translate(0,screen.height*0.1);
		this.handleUpdates(); //handles general updates
		this.handleCollisions(); //checks for collisions
		this.delelteEntities(); //removes entities which are set to be removed
		this.handleWaves();
		ctx.restore();
		//draw 'ground'
		ctx.beginPath();
		ctx.moveTo(0,canvas.height - 30);
		ctx.lineTo(screen.width,screen.height - 30);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 3;
		ctx.stroke();

		if (this.maxY.y > 1000 || this.destroyed)  {
				this.gameEndTimer++;
			if (!this.destroyed) {
				this.invaded = true;
			}
		}

		if (this.invaded && !this.destroyed) {
			ctx.font = "45px segoe ui";
			ctx.textAlign = "center";
			ctx.fillStyle = "#fff";
			ctx.fillText("THE ALIENS HAVE INVADED",screen.width/2,screen.height/3); 
		}
		if (this.destroyed && !this.invaded) {
			ctx.font = "45px segoe ui";
			ctx.textAlign = "center";
			ctx.fillStyle = "#fff";
			ctx.fillText("YOU HAVE BEEN DESTROYED",screen.width/2,screen.height/3); 
			this.cannon.destroyed = true;
		}
		
		if (this.gameEndTimer > 300) {
			ctx.fillText("GAME OVER",screen.width/2,screen.height/3 + 100); 
		}
		
		if (this.gameEndTimer > 750) {
			loadHighscores(currentGame,this.score);
		}
		if (this.cannon.lives < 0) {
			this.destroyed = true;
		}
	}
	
	handleAlienMovement() {
		if (this.count < this.rate) {
			this.count++;
		} else {
			this.alienMove += 20*this.direction;
			// this.alienVertical += 43 + 1/3;
			
			//filter the posistion of the most left, right and bottom alien
			
			for (let i = 0; i < this.aliens.length; i++) {
				if (this.aliens[i].x > this.maxR.x) {
					this.maxR = this.aliens[i];
				}
				if (this.aliens[i].x < this.maxL.x) {
					this.maxL = this.aliens[i];
				}
				if (this.aliens[i].y > this.maxY.y) {
					this.maxY = this.aliens[i];
				}
			}
			
			if (this.maxR.centerX >= 1826 && !this.switched) {
				this.alienVertical += 43 + 1/3;
				this.switched = true;
				this.direction = -1;
			}
			if (this.maxL.centerX <= 97 && this.switched) {
				this.alienVertical += 43 + 1/3;
				this.switched = false;
				this.direction = 1;
			}
			
			this.count = 0;
			if (this.aliens.length > 0) {
				eval("beep"+this.beep+".currentTime = 0");
				eval("beep"+this.beep+".play()");
				//go to the next beep in the music:
				if (this.beep < 4) {
					this.beep++;
				} else {
					this.beep = 1;
				}
			}	
			if (this.alienSy != 0) {
				this.alienSy -= 51;
			} else {
				this.alienSy += 51;
			}	
		}
		
		//randomly spawn mothership:
		if (Math.random() > 0.99972 && this.motherships.length == 0) { //0.99972
			this.motherships.push(new Mothership());
		}
	}
	
	handleAlienShooting() {
		if (this.alienProjectileCounter < 15) {
			this.alienProjectileCounter++;
		} else {
			this.alienProjectileCounter = 0;
			this.alienProjectileScale = -this.alienProjectileScale;
		}
		if (Math.random() > 0.9982) { //0.9982
			let randomIndex = Math.floor(Math.random()*10); //select random row
			let bottomY = 0;
			for (let i = 0; i < this.aliens.length; i++) {
				if (this.aliens[i].row == this.aliens[randomIndex].row) { //check if the alien is in the same row as the selected random index
					if (this.aliens[i].centerY > bottomY) { //filter out the lowest y position of that row
						bottomY = this.aliens[i].centerY;
					}
				}
			}
			this.alienProjectiles.push (new alienProjectile(this.aliens[randomIndex].centerX,bottomY,Math.round(Math.random())));
		}
	}
	
	handleUpdates() {
		this.cannon.update();
		
		for (let i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].update();
			if (this.projectiles[i].y < -10) {
				this.projectiles.splice(i,1);
			}
		}
		
		for (let i = 0; i < this.bunkers.length; i++) {
			this.bunkers[i].update();
		}
		
		for (let i = 0; i < this.aliens.length; i++) {
			this.aliens[i].update();
		}
		for (let i = 0; i < this.motherships.length; i++) {
			this.motherships[i].update();
		}
		
		for (let i = 0; i < this.alienProjectiles.length; i++) {
			this.alienProjectiles[i].update();
		}
		if (!this.background) {
			for (let i = 0; i < this.cannon.lives; i++) {
				ctx.drawImage(cannonImg,1150 + this.cannon.livesX,50,cannonImg.width*0.9,cannonImg.height*0.9);
				this.cannon.livesX += cannonImg.width + 30;
			}
			this.cannon.livesX = 0;
			ctx.fillStyle = "#fff";
			ctx.font = "50px segoe ui";
			ctx.textAlign = "left";
			ctx.fillText("SCORE   " + this.score,200,100);
			ctx.fillText("LIVES",1000,100);
		}
	}
	
	handleCollisions() {
		if (this.projectiles.length > 0) {
			for (let p = 0; p < this.projectiles.length; p++) {
				var pro = this.projectiles[p];
				
				//aliens
				for (let a = 0; a < this.aliens.length; a++) {
					var al = this.aliens[a]
					let dx = pro.x - al.centerX;
					let dy = pro.y - al.centerY;
					let dist = Math.sqrt(dx*dx + dy*dy);
					if (dist < al.type.radius) {
						if (this.aliens[a].explosionTimer == 0) {
							this.rate -= 2.2;
						}
						this.aliens[a].explosionTimer++;
						this.score += this.aliens[a].type.award;
						this.projectiles.splice(p,1);
						alienDestroy.currentTime = 0;
						alienDestroy.play();
					}
				}
				//motherships
				for (let m = 0; m < this.motherships.length; m++) {
					var ms = this.motherships[m];
					//define the corners of the hitbox:
					let xL = ms.x;
					let xR = ms.x + mother_ship.width*1.2;
					let yU = ms.y;
					let yD = ms.y + mother_ship.height*1.2;
					
					//AABB collision check for the hitbox:
					if (pro.x > xL && pro.x < xR && pro.y < yD && pro.y > yU) {
						
						//calculate distance from center bottom position on the ship to calculate accuracy of shot
						let dx = pro.x - ms.centerX; //central x pos
						let dy = pro.y - yD; //bottom y pos
						let dist = Math.sqrt(dx*dx + dy*dy);
						var reward = 100;
						// alert(dist);
						if (dist < 10) {
							reward = 300;
						} else if (dist < 20 && dist > 10) {
							reward = 250;
						} else if (dist < 30 && dist > 20) {
							reward = 200;
						}
						if (ms.explosionTimer == 0) { //only remove projectile if the ship isnt already destroyed
							this.projectiles.splice(p,1);
						}
						ms.explosionTimer += 1;
						ms.reward = reward;
						this.score += reward;
					}
				}
			}
		}
		if (this.alienProjectiles.length > 0) {
			for (let ap = 0; ap < this.alienProjectiles.length; ap++) {
				for (let b = 0; b < this.bunkers.length; b++) {
					let dx = this.bunkers[b].centerX - this.alienProjectiles[ap].x;
					let dy = this.bunkers[b].centerY - this.alienProjectiles[ap].y;
					let dist = Math.sqrt(dx*dx + dy*dy);
					if (dist < 20 && this.bunkers[b].sy < 150) {
						this.bunkers[b].sy += 30;
						this.alienProjectiles[ap].del = true;
					}
				}
				let dx = this.cannon.centerX - this.alienProjectiles[ap].x;
				let dy = this.cannon.centerY - this.alienProjectiles[ap].y;
				let dist = Math.sqrt(dx*dx + dy*dy);
				if (dist < cannonImg.width/2 + 5 && !this.cannon.hit) {
					this.cannon.lives = -1;
					this.cannon.hit = true;
					this.alienProjectiles.splice(ap,1);
				}
			}
		}
	}
	
	delelteEntities() {
		for (let i = 0; i < this.aliens.length; i++) {
			if (this.aliens[i].del) {
				this.aliens.splice(i,1);
			}
		}
		for (let i = 0; i < this.motherships.length; i++) {
			if (this.motherships[i].del) {
				this.motherships.splice(i,1);
			}
		}
		for (let i = 0; i < this.alienProjectiles.length; i++) {
			if (this.alienProjectiles[i].del) {
				this.alienProjectiles.splice(i,1);
			}
		}
	}
	
	handleWaves() {
		if (this.aliensSpawned) {
			if (this.aliens.length == 0) { //wave complete
				this.roundEndTimer++;
				if (this.roundEndTimer > 100) {
					this.alienVertical = 0;
					this.alienMove = 0;
					this.rate = 150;
					this.beep = 1;
					this.wave++;
					if (this.wave % 10 == 0) { //check if a wave cycle is completed, if so, store update the amount of cycles
						this.waveCycles++;
					}
					this.aliensSpawned = false;
					this.roundEndTimer = 0;
				}
			}
		}
	}
	
	spawnBunkers() {
		for (let i = 0; i < 5; i++) {
			this.bunkers.push(new bunkerBlock(0 + (i*384 + 130),1080 - 230,bunker_block));
			this.bunkers.push(new bunkerBlock(0 + (i*384 + 130),1080 - 260,bunker_block));
			this.bunkers.push(new bunkerBlock(0 + (i*384 + 130),1080 - 290,bunker_block_slanted,2));
			this.bunkers.push(new bunkerBlock(60 + (i*384 + 130),1080 - 290,bunker_block));
			this.bunkers.push(new bunkerBlock(30 + (i*384 + 130),1080 - 290,bunker_block));
			this.bunkers.push(new bunkerBlock(90 + (i*384 + 130),1080 - 290,bunker_block_slanted,3));
			this.bunkers.push(new bunkerBlock(90 + (i*384 + 130),1080 - 260,bunker_block));
			this.bunkers.push(new bunkerBlock(90 + (i*384 + 130),1080 - 230,bunker_block));
			this.bunkers.push(new bunkerBlock(60 + (i*384 + 130),1080 - 260,bunker_block_slanted,1));
			this.bunkers.push(new bunkerBlock(30 + (i*384 + 130),1080 - 260,bunker_block_slanted,0));
		}
	}
	
	spawnAliens() {
		this.spawnCounter += 0.5;
		if (this.spawnCounter % 5 == 0) {
			if (this.spawnCounter == 5) { //top row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType3,513 + 85*i,200 + (43 + 1/3)*((this.wave - (10*this.waveCycles))-1)));
					this.aliens[i].row = i;
				}
			} else if (this.spawnCounter == 10) { // 2nd row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType2,513 - 0.5*(64 - 48) + 85*i,280 + (43 + 1/3)*((this.wave - (10*this.waveCycles))-1)));
					this.aliens[i + 11].row = i;
					// console.log(this.aliens[i].row);
				}
			} else if (this.spawnCounter == 15) { //3rd row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType2,513 - 0.5*(64 - 48) + 85*i,360 + (43 + 1/3)*((this.wave - (10*this.waveCycles))-1)));
					this.aliens[i + 22].row = i;
				}
			} else if (this.spawnCounter == 20) { //4th row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType1,513 - 0.5*(75 - 48) + 85*i,440 + (43 + 1/3)*((this.wave - (10*this.waveCycles))-1)));
					this.aliens[i + 33].row = i;
				}
			} else if (this.spawnCounter == 25) { //5th row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType1,513 - 0.5*(75 - 48) + 85*i,520 + (43 + 1/3)*((this.wave - (10*this.waveCycles))-1)));
					this.aliens[i + 44].row = i;
				}
				this.aliensSpawned = true;
				this.spawnCounter = 0;
			}
		}
	}
	quit() {
		alienFire.pause();
		alienDestroy.pause();
		explosionSound.pause();
		shootSound.pause();
		lowPitchUfo.pause();
	}
}
