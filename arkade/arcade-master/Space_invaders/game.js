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
		new Button(canvas.width/2 - 200, canvas.height - 150, 400, 30, "HIGHSCORES", "loadHighscores('" + currentGame + "', 0)"),
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
		
		this.cannon = new Cannon();
		
		//objects stored in arrays:
		this.projectiles = [];
		this.bunkers = [];
		this.aliens = [];
		this.motherships = [];
		
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
		this.firstLoop = true;
		
		//vars for alien spawning:
		this.spawnCounter = -5; //vertical spawn pos * 5
		this.alienPos = 0; //horizontal spawn pos
		this.aliensSpawned = false;
		
		this.spawnBunkers();
	}
	
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (!this.aliensSpawned) {
			this.spawnAliens();
		}
		//first handle alienmovement, after that handle all updates and collisions.
		if (this.aliensSpawned) {
			this.handleAlienMovement();
		}
		this.handleUpdates(); //handles general updates
		this.handleCollisions(); //checks for collisions
		this.delelteEntities(); //removes entities which are set to be removed
	
		//draw 'ground'
		ctx.beginPath();
		ctx.moveTo(0,canvas.height - 30);
		ctx.lineTo(canvas.width,canvas.height - 30);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 3;
		ctx.stroke();
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
				console.log(this.maxR.centerX);
			}
			if (this.maxL.centerX <= 97 && this.switched) {
				this.alienVertical += 43 + 1/3;
				this.switched = false;
				this.direction = 1;
				console.log(this.maxL.centerX);
			}
		
			
			this.count = 0;
			
			eval("beep"+this.beep+".currentTime = 0");
			eval("beep"+this.beep+".play()");
			//go to the next beep in the music:
			if (this.beep < 4) {
				this.beep++;
			} else {
				this.beep = 1;
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
						this.aliens[a].explosionTimer++;;
						this.projectiles.splice(p,1);
						this.rate -= 2.2;
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
					}
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
					this.aliens.push(new Alien(alienType3,513 + 85*i,200));
				}
			} else if (this.spawnCounter == 10) { // 2nd row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType2,513 - 0.5*(64 - 48) + 85*i,280));
				}
			} else if (this.spawnCounter == 15) { //3rd row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType2,513 - 0.5*(64 - 48) + 85*i,360));
				}
			} else if (this.spawnCounter == 20) { //4th row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType1,513 - 0.5*(75 - 48) + 85*i,440));
				}
			} else if (this.spawnCounter == 25) { //5th row
				for (let i = 0; i < 11; i++) {
					this.aliens.push(new Alien(alienType1,513 - 0.5*(75 - 48) + 85*i,520));
				}
				this.aliensSpawned = true;
			}
		}
	}
}