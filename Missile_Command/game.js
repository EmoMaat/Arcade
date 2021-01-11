var missileTitle = new Image();
missileTitle.src = "Missile_Command/src/title.png";

function MissileCommand() {
	HubControl = false;
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	MissileCommandMainMenuOverlay();
	
	menuOverlay.backgroundGame = new MissileGame(true);
	menuOverlay.backgroundGame.overlay = true;
	missileCommandGame = menuOverlay.backgroundGame;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
		ctx.drawImage(missileTitle,canvas.width/2 - missileTitle.width*0.6/2,150,missileTitle.width*0.6,missileTitle.height*0.6);
	}, 20);
}

function MissileCommandMainMenuOverlay() {
	move.smooth = false;
	menuOverlay.buttons = [
		new Button(canvas.width/2 - 200, canvas.height - 500, 400, 30, "START GAME", "newMissileGame()"),
		new Button(canvas.width/2 - 200, canvas.height - 420, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0,true)"),
		new Button(canvas.width/2 - 200, canvas.height - 340, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(canvas.width/2 - 200, canvas.height - 260, 400, 30, "EXIT", "loadHub()")
	];
}

function newMissileGame() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	OverlayIsActive = false;
	
	missileCommandGame = new MissileGame();
	
	gameInterval = new Interval(missileCommandGame.update,10);
}

var cityAward1Sound = new Audio();
var cityAward2Sound = new Audio();
var cityCountSound = new Audio();
var emptySoundMC = new Audio();
var endSoundMC = new Audio();
var explosionSoundMC = new Audio();
var fireSoundMC = new Audio();
var lowMC = new Audio();
var missileCountSound = new Audio();
var roundStartSoundMC = new Audio();
var planeSound = new Audio();

planeSound.src = "Missile_Command/src/sounds/plane.mp3";
cityCountSound.src = "Missile_Command/src/sounds/citycount.mp3";
cityAward1Sound.src = "Missile_Command/src/sounds/cityaward1.mp3";
cityAward2Sound.src = "Missile_Command/src/sounds/cityaward2.mp3";
emptySoundMC.src = "Missile_Command/src/sounds/empty.mp3";
endSoundMC.src = "Missile_Command/src/sounds/end.mp3";
explosionSoundMC.src = "Missile_Command/src/sounds/explosion.mp3";
fireSoundMC.src = "Missile_Command/src/sounds/fire.mp3";
lowMC.src = "Missile_Command/src/sounds/low.mp3";
missileCountSound.src = "Missile_Command/src/sounds/missilecount.mp3";
roundStartSoundMC.src = "Missile_Command/src/sounds/roundstart.mp3";


planeSound.addEventListener('ended', function() {
	if (!missileCommandGame.backgroundGame) {
		this.currentTime = 0;
		this.play();
	}
	
}, false);

class MissileGame {
	constructor(backgroundGame) {
		this.targets = []; //for the little crosses when you fire a missile
		this.missiles = []; //player's missiles
		this.rockets = []; //alien's missiles
		this.explosions = []; //all explosions
		this.missileBatteries = [new missileBattery(137.5, canvas.height - 75), new missileBattery(911.5, canvas.height - 75), new missileBattery(1789.5, canvas.height - 75)];
		this.smartBombs = [];
		this.planes = [];
		this.satelites = [];
		this.cities = [];
		this.citiesDestroyed = 0; //if reaches 3, end of the round.
		this.cityCheck = [true,true,true,true,true,true]; //specify which cities are not destroyed
		this.fired = [false, false, false] //check for all 3 batteries; otherwise they would fire full auto
		this.missileTarget = new targetCursor();
		this.enemyTargets = this.cities.concat(this.missileBatteries); //array of all missile targets
		this.cities_targeted = []; //keep track of which cities are targeted, so only three can be targeted at the same time
		this.score = 0;
		this.wave = 1;
		this.waveMultiplier = 1;
		this.cityCount = 6; //how many cities does the player have? important to keep track of at the start of a new round
		
		this.potentialBonusCities = 0;
		this.rewardedBonusCities = 0;
		this.availableBonusCities = this.potentialBonusCities - this.rewardedBonusCities;
		
		//wave controlling variables:
		this.roundStarted = false;
		this.overlayTimer = 0; 						//for waiting untill the round starts
		this.missileTimer = 3500; 					//timer for spawning missiles
		this.timerMin = 350;
		this.timerMax = 550;
		this.missileTimerMax = randomNumber(this.timerMin,this.timerMax) //limit for missileTimer
		this.missileAmount = randomNumber(4,7); 	//random number between 1 and 4, each time missileTimer reaches amount, spawn 1 to 4 missiles.
		this.missilesPerWave = 8; 					//set the max missiles allowed per wave
		this.missileCounter = 0;					//keep track of the amount of missiles spawned:
		this.waveMissileSpeed = 0.8;
		this.firstWaveMissiles = 4;
		this.firstWavePlanes = 0;
		this.firstWaveSatelites = 0;
		this.speedMultiplier = 1;
		this.planeChance = 0;
		this.sateliteChance = 0;
		this.smartBombChance = 0;
		this.smartBombAmount = 0;
		this.explosionSpeedMultiplier = 1;
		
		//round end variables:
		this.endRound = false;
		this.roundEndTimer = 0;
		this.missilePoints = 0; //bonus points awarded for missiles
		this.cityPoints = 0; //bonus points awarded for cities
		this.counting = false; //specifies wether missiles or cities should be counted
		this.countTimer = 0; //timer for counting missiles and cities
		this.bonusMissiles = 0;
		this.bonusCities = [];
		this.finished = false;
		this.cityIndex = 0;
		this.awardCities = false;
		this.overlayDelay = 0;
		this.gameOverChecker = []; //check if there are cities left
		
		//round startup variables:
		this.roundStartTimer = 0;
		this.pushedCities = false;
		
		//sprites:
		this.bonusMissileImg = new Image();
		this.bonusMissileImg.src = "Missile_Command/src/rocket_white.png";
		
		this.backgroundGame = backgroundGame;
		if (this.backgroundGame) {
			this.wave = 11;
		}
		this.roundstarted = false;
		move.smooth = true;
		
		this.gamemode = "";
		self = this;
	}
	
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (!self.backgroundGame) {
			self.updateGameObjects(); //missiles, smartbombs, aliens, planes, etc.
			self.missileTarget.update();
			self.checkFire();
			ctx.save();
			ctx.scale(0.75,0.75);
			ctx.translate(0,screen.height*0.35);
			self.drawCities();
			self.drawGround();
			self.handleBatteries();
			ctx.restore();
			self.drawScore();
			if (!self.firstRound) {
				setWave();
				self.roundStartOverlay();
			} else {
				self.handleRounds();
			}
			self.handleCityAward();
		} else {
			self.updateGameObjects(); //missiles, smartbombs, aliens, planes, etc.
			ctx.save();
			ctx.scale(0.75,0.75);
			ctx.translate(0,screen.height*0.35);
			self.drawCities();
			self.drawGround();
			self.handleBatteries();
			ctx.restore();
			if (!self.firstRound) {
				setWave();
				self.roundStartOverlay();
			} else {
				self.handleRounds();
			}
		}
		
		
	}
	
	handleCityAward() {
		self.potentialBonusCities = Math.floor(self.score / 8000);
		self.availableBonusCities = self.potentialBonusCities - self.rewardedBonusCities;
	}
	
	roundStartOverlay() {
		//give the player the correct amount of cities back: (after deleting them while counting)
		if (!self.pushedCities) {
			if (!missileCommandGame.backgroundGame) {
				roundStartSoundMC.currentTime = 0;
				roundStartSoundMC.play();
			}
			if (self.cityCheck[0]) {
				self.cities.push(new city(290,canvas.height - 95,false));
			} else {
				self.cities.push(new city(290,canvas.height - 95,true));
			}
			if (self.cityCheck[1]) {
				self.cities.push(new city(487,canvas.height - 85,false));
			} else {
				self.cities.push(new city(487,canvas.height - 85,true));
			} 
			if (self.cityCheck[2]) {
				self.cities.push(new city(660,canvas.height - 80,false));
			} else {
				self.cities.push(new city(660,canvas.height - 80,true));
			}
			if (self.cityCheck[3]) {
				self.cities.push(new city(1045,canvas.height - 95,false));
			} else {
				self.cities.push(new city(1045,canvas.height - 95,true));
			}
			if (self.cityCheck[4]) {
				self.cities.push(new city(1290,canvas.height - 120,false));
			} else {
				self.cities.push(new city(1290,canvas.height - 120,true));
			}
			if (self.cityCheck[5]) {
				self.cities.push(new city(1500,canvas.height - 90,false));
			} else {
				self.cities.push(new city(1500,canvas.height - 90,true));
			}
			self.pushedCities = true;
			self.enemyTargets = self.cities.concat(self.missileBatteries);
		}
			
		self.missileBatteries = [new missileBattery(137.5, canvas.height - 75), new missileBattery(911.5, canvas.height - 75), new missileBattery(1789.5, canvas.height - 75)];
		if (!self.backgroundGame) {
			this.roundStartTimer++;
			if (this.roundStartTimer > 40) {
				ctx.font = "50px segoe ui";
				ctx.textAlign = "center";
				ctx.fillText("ROUND " + self.wave,canvas.width/2,canvas.height / 4);
				
			}
			if (this.roundStartTimer > 90) {
				ctx.fillText(self.waveMultiplier + "x  POINTS",canvas.width/2,canvas.height/4 + 130);
			}
			if (this.roundStartTimer > 150) {
				ctx.textAlign = "center";
				ctx.fillText("DEFEND",canvas.width/3,canvas.height/5*3);
				ctx.fillText("CITIES",canvas.width/3*2,canvas.height/5*3);
			}
			if (this.roundStartTimer > 250) {
				self.endRound = false;
				self.newRound();
				self.firstRound = true;
			}
		} else {
			self.endRound = false;
			self.newRound();
			self.firstRound = true;
		}
		
	}
	
	newRound() { //reset all vars for a new round here
		self.missileTarget.activated = true;
		self.overlayTimer = 0; 						//for waiting untill the round starts
		self.missileTimer = -1; 						//timer for spawning missiles
		self.missileCounter = 0;	
		self.firstWave = true;
		
		self.endRound = false;
		self.roundEndTimer = 0; //timer for various overlays
		
		self.roundOverlayTimer = 0; //timer used to show various overlays at different times at the start of each round
		
		//reset endround vars so it can run again
		self.endRound = false;
		self.roundEndTimer = 0;
		self.missilePoints = 0; //bonus points awarded for missiles
		self.cityPoints = 0; //bonus points awarded for cities
		self.counting = false; //specifies wether missiles or cities should be counted
		self.countTimer = 23; //timer for counting missiles and cities
		self.bonusMissiles = 0;
		self.bonusCities = [];
		self.finished = false;
		self.cityIndex = 0;
		self.waveMissileSpeed = 1;
		self.awardCities = false;
		self.overlayDelay = 0;
		
		//reset startround vars
		self.roundStartTimer = 0;
		self.pushedCities = false;
	}
	
	updateGameObjects() {
		//enemy missiles:
		for (let i = 0; i < self.rockets.length; i++) {
			self.rockets[i].update();
		}
		for (let i = 0; i < self.rockets.length; i++) {
			if (self.rockets[i].del) {
				self.rockets.splice(i,1);
			}
		}
		
		//friendly missiles:
		for (let i = 0; i < self.missiles.length; i++) {
			self.missiles[i].update();
		}
		for (let i = 0; i < self.missiles.length; i++) {
			if (self.missiles[i].del) {
				self.missiles.splice(i,1);
			}
		}
		
		//smartBombs:
		for (let i = 0; i < self.smartBombs.length; i++) {
			self.smartBombs[i].update();
			if (self.smartBombs[i].del) {
				self.smartBombs.splice(i,1);
			}
		}
		
		//planes:
		for (let i = 0; i < self.planes.length; i++) {
			self.planes[i].update();
			if (self.planes[i].dir && self.planes[i].x > canvas.width + 90) {
				self.planes.splice(i,1);
			} else if (!self.planes[i].dir && self.planes[i].x < -90) {
				self.planes.splice(i,1);
			}
			
		}
		//satelites:
		for (let i = 0; i < self.satelites.length; i++) {
			self.satelites[i].update();
			if (self.satelites[i].dir && self.satelites[i].x > canvas.width + 90) {
				self.satelites.splice(i,1);
			} else if (!self.satelites[i].dir && self.satelites[i].x < -90) {
				self.satelites.splice(i,1)
			}
		}
		
		//explosions + collisions:
		for (let i = 0; i < self.explosions.length; i++) {
			self.explosions[i].update();
			//check for collisions with objects:
			for (let r = 0; r < self.rockets.length; r++) {
				let dx = self.rockets[r].x - self.explosions[i].x;
				let dy = self.rockets[r].y - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < 3 + self.explosions[i].explosionradius) { //3 is the radius of the rocket
					self.rockets[r].target.x = self.rockets[r].x;
					self.rockets[r].target.y = self.rockets[r].y;
					self.rockets[r].explosion();
				}
			}
			
			//check for collisions with cities
			for (let c = 0; c < self.cities.length; c++) {
				let dx = (self.cities[c].centerX*0.75) - self.explosions[i].x;
				let dy = (self.cities[c].centerY) - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < self.explosions[i].explosionradius) {
					self.cityCheck[c] = false;
					self.cities[c].destroyed = true;
					self.enemyTargets = self.cities.concat(self.missileBatteries); //update possible targets so destroyed targets cant be targeted
				}
			}
			
			//check for collisions with batteries
			for (let b = 0; b < self.missileBatteries.length; b++) {
				let dx = (self.missileBatteries[b].centerX*0.75) - self.explosions[i].x;
				let dy = self.missileBatteries[b].centerY - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < self.explosions[i].explosionradius) {
					self.missileBatteries[b].destroyed = true;
					self.missileBatteries[b].missiles = 0;
				}
			}
			
			//check for collisions with planes
			for (let p = 0; p < self.planes.length; p++) {
				let dx = self.planes[p].centerX - self.explosions[i].x;
				let dy = self.planes[p].centerY - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < 25 + self.explosions[i].explosionradius) {
					self.explosions.unshift(new explosion(self.planes[p].centerX, self.planes[p].centerY));
					self.planes.splice(p,1);
					self.score += 100 * self.waveMultiplier;
					if (!missileCommandGame.backgroundGame) {
						explosionSoundMC.currentTime = 0;
						explosionSoundMC.play();
					}
				}
			}
			
			//check for collisions with satelites
			for (let p = 0; p < self.satelites.length; p++) {
				let dx = self.satelites[p].centerX - self.explosions[i].x;
				let dy = self.satelites[p].centerY - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < 20 + self.explosions[i].explosionradius) {
					self.explosions.unshift(new explosion(self.satelites[p].centerX, self.satelites[p].centerY));
					self.satelites.splice(p,1);
					self.score += 100 * self.waveMultiplier;
					if (!missileCommandGame.backgroundGame) {
						explosionSoundMC.currentTime = 0;
						explosionSoundMC.play();
					}
				}
			}
			
			//check for collisions with smartbombs, only for points
			for (let s = 0; s < self.smartBombs.length; s++) {
				let dx = self.smartBombs[s].x - self.explosions[i].x;
				let dy = self.smartBombs[s].y - self.explosions[i].y;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if (distance < 10 + self.explosions[i].explosionradius) {
					self.score += 100 * self.waveMultiplier;
					if (!missileCommandGame.backgroundGame) {
						explosionSoundMC.currentTime = 0;
						explosionSoundMC.play();
					}
				}
			}
		}
		for (let i = 0; i < self.explosions.length; i++) {
			if (self.explosions[i].exploded) {
				self.explosions.splice(i,1);
			}
		}
		
		//soundplay for plane & satelite:
		if ((self.planes.length > 0 || self.satelites.length > 0)) {
			if (!missileCommandGame.backgroundGame) {
				planeSound.play();
			}
		} else {
			planeSound.pause();
		}
	}
	
	handleBatteries() {
		for (let i = 0; i < self.missileBatteries.length; i++) {
			self.missileBatteries[i].update();
		}
	}
	
	drawCities() {
		//cities:
		for (let i = 0; i < self.cities.length; i++) {
			self.cities[i].update();
		}
	}
	
	handleRounds() {
		if (!self.roundStarted) {
			self.newRound();
			self.roundStarted = true; //start of round here
		} else {
			if (self.missileTimer == -1 && self.firstWave) { //implies that it is the first missile wave of the round
				for (let i = 0; i < self.firstWaveMissiles; i++) {
					spawnMissile();
				}
				for (let i = 0; i < self.firstWavePlanes; i++) {
					spawnPlane();
				}
				for (let i = 0; i < self.firstWaveSatelites; i++) {
					spawnSatelite();
				}
			}

			if (self.missileTimer < self.missileTimerMax && self.missileTimer != -1) {
				self.missileTimer++;
			} else {
				for (let i = 0; i < self.missileAmount; i++) {
					if (self.missileCounter < self.missilesPerWave && !self.firstWave) {
						spawnMissile();
						self.missileAmount = randomNumber(1,5);
						self.missileCounter++;
					}
				}
				self.missileTimer = 0;
				self.missileTimerMax = randomNumber(self.timerMin,self.timerMax);
			}
			
			if (self.missileCounter < self.missilesPerWave && self.missileCounter > 0) {
				if (Math.random() < self.smartBombChance) {
					spawnSmartBomb();
				}
				if (Math.random() < self.planeChance && self.planes.length == 0) {
					spawnPlane();
				}
				if (Math.random() < self.sateliteChance && self.satelites.length == 0) {
					spawnSatelite();
				}
			}
			
			if (self.missileTimer > 0) {
				self.firstWave = false;
			}
			
			if (self.rockets.length == 0 && self.missileCounter >= self.missilesPerWave && self.explosions.length == 0 && self.planes.length == 0 && self.satelites.length == 0 && self.smartBombs.length == 0) { // round end here
				self.endRound = true;
			}
		}
		if (self.endRound && !self.backgroundGame) {
			self.finishRound(); // count cities and missiles, draw overlay, etc.
		} else {
			cityCountSound.pause();
		}
		if(self.backgroundGame && self.endRound) {
			missileCommandGame = new MissileGame(true);
		}
	}
	
	finishRound() {
		self.missileTarget.activated = false;
		if (!self.finished) {
			if (!self.counting) { //specifies wether missiles or cities are being counted
				self.roundEndTimer++;
			} else {
				if (self.countType == "missile") {
					self.startMissileCount();
				} else if (self.countType == "city") {
					self.startCityCount();
				}
			}
			ctx.fillStyle = "#fff";
			if (self.roundEndTimer > 20) {
				ctx.font = "bold 40px segoe ui";
				ctx.textAlign = "center";
				ctx.fillText("BONUS POINTS",canvas.width/2,canvas.height/4);
			}
			if (self.roundEndTimer > 50) {
				ctx.font = "35px segoe ui";
				ctx.textAlign = "left";
				ctx.fillText(self.missilePoints,canvas.width/2 - 320,canvas.height/4 + 105);
				//draw all bonus missiles
				for (let i = 0; i < self.bonusMissiles; i++) {
					ctx.fillStyle = "#fff";
					ctx.drawImage(self.bonusMissileImg,canvas.width/2 - 250 + i*20, canvas.height/4 + 73,self.bonusMissileImg.width*0.8,self.bonusMissileImg.height*0.8);
				}
			}
			if (self.roundEndTimer == 51) {
				self.counting = true;
				self.countType = "missile";
			}
			if (self.roundEndTimer > 100) {
				ctx.fillText(self.cityPoints,canvas.width/2 - 320,canvas.height/4 + 300);
				//draw all bonus cities:
				for (let i = 0; i < self.bonusCities.length; i++) {
					self.bonusCities[i].update();
				}
			}
			if (self.roundEndTimer == 101) {
				self.counting = true;
				self.countType = "city";
				if (self.cityCount < 6 && self.availableBonusCities > 0) {
					self.awardCities = true;
					self.overlayDelay = 270;
				} else {
					self.awardCities = false;
					self.overlayDelay = 0;
				}
			}
			if (self.awardCities) {
				if (self.roundEndTimer > 150) {
					ctx.textAlign = "center";
					ctx.font = "50px segoe ui";
					ctx.fillText("BONUS CITY!",canvas.width/2,canvas.height/4 + 480);
				}
				if (self.roundEndTimer == 150) {
					//two different sounds, random
					if (Math.random() > 0.5) {
						cityAward1Sound.currentTime = 0;
						cityAward1Sound.play();
					} else {
						cityAward2Sound.currentTime = 0;
						cityAward2Sound.play();
					}
				}
				if (self.roundEndTimer > 420) {
					self.awardCities = false;
					for (let i = 0; i < self.cityCheck.length; i++) {
						if (self.availableBonusCities > 0 && !self.cityCheck[i]) {
							console.log(self.cityCheck[i]);
							self.cityCheck[i] = true;
							self.rewardedBonusCities += 1;
							self.availableBonusCities = self.potentialBonusCities - self.rewardedBonusCities;
						}
					}
				}
			} else {
				for (let i = 0; i < self.cityCheck.length; i++) {
					if (self.cityCheck[i]) {
						self.gameOverChecker.push(true);
					} else {
						self.gameOverChecker.push(false);
					}
				}
				if (!self.gameOverChecker.includes(true) && self.availableBonusCities <= 0) {
					loadHighscores(currentGame,self.score);
				} else {
					if (self.roundEndTimer > 150 + self.overlayDelay) {
					ctx.fillStyle = "#000";
					ctx.fillRect(0,0,canvas.width,canvas.height);
					}
					if (self.roundEndTimer >= 200+ self.overlayDelay) {
						self.finished = true;
						self.wave += 1;
						setWave();
					}
					self.gameOverChecker = [];
				}
			}
			
		}
		if (self.finished) {
			self.roundStartOverlay();
		}
	}
	
	startMissileCount() {
		console.log("counting...");
		for (let i = 0; i < self.missileBatteries.length; i++) {
			if (self.missileBatteries[i].missiles > 0) {
				var index = i; //set index to first battery with more than 0 missiles
				break;
			}
		}
		//check if the batteries are not empty:
		//if they are, stop the rest of the function and continue to the next sequence in the overlay
		if (self.missileBatteries[0].missiles == 0 && self.missileBatteries[1].missiles == 0 && self.missileBatteries[2].missiles == 0) {
			self.counting = false; //stop the function
			self.roundEndTimer++; //next sequence in overlay
		}
		//if still counting, delete one missile from the array and add one to bonusMissiles every 9 lÖÖps.
		if (self.counting) {
			if (self.countTimer < 9) {
				self.countTimer++;
			} else {
				missileCountSound.currentTime = 0;
				missileCountSound.play();
				self.missileBatteries[index].missiles--;
				self.bonusMissiles++;
				self.missilePoints += 5*self.waveMultiplier;
				self.score += 5*self.waveMultiplier;
				self.countTimer = 0;
			}
		}
	}
	
	startCityCount() {
		if (self.cities.length == 0) {
			self.counting = false;
			self.roundEndTimer++;
		}
		if (self.counting) {
			if (self.countTimer < 23) {
				if (self.cityCheck[self.cityIndex]) {
					self.countTimer++;
				} else {
					self.countTimer = 23;
				}
			} else {
				if (self.cityCheck[self.cityIndex]) {
					self.bonusCities.push(new city(canvas.width/2 -200 + (self.bonusCities.length * 150),canvas.height/2 + 20));
					self.cityPoints += 100*self.waveMultiplier;
					self.score += 100*self.waveMultiplier;
					cityCountSound.currentTime = 0;
					cityCountSound.play();
				}
				self.countTimer = 0;
				self.cityCount = self.bonusCities.length;
				console.log(self.cities);
				self.cities.splice(0,1);
				self.cityIndex++;
			}
		}
	}
	
	checkFire() {
		if (self.missileTarget.activated) {
			this.target = {x: self.missileTarget.x, y: self.missileTarget.y};
			if (!self.fired[1]) {
				if (map.Button0 || map[88]) { // fire from middle battery (using 'x' key)
					if (self.missileBatteries[1].missiles > 0) {
						self.missiles.push(new missile(929*0.75,screen.height-135*0.75 + 20,this.target,14*missileCommandGame.speedMultiplier,true));
						self.missileBatteries[1].missiles--;
					}
					if (self.missileBatteries[1].missiles <= 0) {
						emptySoundMC.currentTime = 0;
						emptySoundMC.play();
					} else {
						fireSoundMC.currentTime = 0;
						fireSoundMC.play();
					}
					self.fired[1] = true;
				}
			}
			if (!self.fired[0]) {
				if (map.Button2 || map[90]) { //fire from left battery (using 'z' key)
					if (self.missileBatteries[0].missiles > 0) {
						self.missiles.push(new missile(150*0.75,screen.height-133*0.75 + 20,this.target,6.5*missileCommandGame.speedMultiplier,true));
						self.missileBatteries[0].missiles--;
					}
					if (self.missileBatteries[0].missiles == 0) {
						emptySoundMC.currentTime = 0;
						emptySoundMC.play();
					} else {
						fireSoundMC.currentTime = 0;
						fireSoundMC.play();
					}
					self.fired[0] = true;
				}
			}
			if (!self.fired[2]) {
				if (map.Button1 || map[67]) { //fire from right battery (using 'c' key)
					if (self.missileBatteries[2].missiles > 0) {
						self.missiles.push(new missile(1812*0.75,screen.height-135*0.75 + 20,this.target,6.5*missileCommandGame.speedMultiplier,true));
						self.missileBatteries[2].missiles--;
					}
					if (self.missileBatteries[2].missiles == 0) {
						emptySoundMC.currentTime = 0;
						emptySoundMC.play();
					} else {
						fireSoundMC.currentTime = 0;
						fireSoundMC.play();
					}
					self.fired[2] = true;
				}
			}
			if (!map.Button0 && !map[88]) {
				self.fired[1] = false;
			}
			if (!map.Button2 && !map[90]) {
				self.fired[0] = false;
			}
			if (!map.Button1 && !map[67]) {
				self.fired[2] = false;
			}
		}
	}
	
	drawGround() {
		ctx.scale(1,1);
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		ctx.lineTo(0,canvas.height - 100);
		ctx.lineTo(70,canvas.height - 125);
		ctx.bezierCurveTo(72,canvas.height -145,100,canvas.height -150,110,canvas.height -133);
		ctx.lineTo(205,canvas.height - 133); //center line of left missile battery
		ctx.quadraticCurveTo(225,canvas.height - 165,245,canvas.height - 133);
		ctx.lineTo(290,canvas.height - 85); //1st city pos
		ctx.lineTo(400,canvas.height - 85);
		ctx.quadraticCurveTo(420,canvas.height - 120,450,canvas.height - 85); //2nd city
		ctx.lineTo(660,canvas.height - 85); //660 > 780
		ctx.bezierCurveTo(680,canvas.height - 60,760,canvas.height - 60,780,canvas.height - 85); //3rd city from l's crater
		ctx.lineTo(820,canvas.height - 95);
		ctx.lineTo(870,canvas.height - 130);
		ctx.quadraticCurveTo(880,canvas.height-155,905,canvas.height - 130); //middle left boble
		ctx.lineTo(953,canvas.height - 130); //center line of middle missile battery
		ctx.quadraticCurveTo(968,canvas.height - 158,995,canvas.height - 130) //middle right bobble
		ctx.lineTo(1017,canvas.height - 95);
		ctx.lineTo(1045,canvas.height - 95); //1045 > 1170
		ctx.bezierCurveTo(1065,canvas.height - 70,1150,canvas.height - 70,1170,canvas.height - 95); //4th city's crater
		ctx.lineTo(1260,canvas.height - 95);
		ctx.lineTo(1290,canvas.height - 120);
		ctx.quadraticCurveTo(1345,canvas.height - 95,1400,canvas.height - 120); //5th city's crater
		ctx.lineTo(1417,canvas.height - 108);
		ctx.lineTo(1427,canvas.height - 90);
		ctx.lineTo(1500,canvas.height - 90);
		ctx.bezierCurveTo(1520,canvas.height - 65,1605,canvas.height - 65,1625,canvas.height - 90); //6th city's crater
		ctx.lineTo(1675,canvas.height - 95);
		ctx.lineTo(1718,canvas.height - 125);
		ctx.bezierCurveTo(1718,canvas.height - 142,1755,canvas.height - 150,1764,canvas.height - 135);
		ctx.lineTo(1860,canvas.height - 135);
		ctx.bezierCurveTo(1860,canvas.height-142,1875,canvas.height - 155,1895,canvas.height - 132);
		ctx.lineTo(canvas.width + 500,canvas.height - 50);
		ctx.lineTo(canvas.width + 500,canvas.height);
		ctx.closePath();
		ctx.fillStyle = "#fff";
		ctx.fill();
	}
	
	drawScore() {
		ctx.font = "50px segoe ui";
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#000";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.strokeText(self.score,canvas.width/4,60);
		ctx.fillText(self.score,canvas.width/4,60);
	}
	quit() {
		planeSound.pause();
		cityCountSound.pause();
		cityAward1Sound.pause();
		cityAward2Sound.pause();
		emptySoundMC.pause();
		endSoundMC.pause();
		explosionSoundMC.pause();
		fireSoundMC.pause();
		lowMC.pause();
		missileCountSound.pause();
		roundStartSoundMC.pause();
	}
}

class targetCursor {
	constructor() {
		this.x = screen.width/2;
		this.y = screen.height/2;
		this.size = 12;
		this.activated = true; //set false do de-activate
	}
	
	update() {
		if (this.activated) {
			this.handleMove();
			this.draw();
		} 
	}
	
	handleMove() {
		if (missileCommandGame.speedMultiplier > 1) {
			var cursorSpeedMultiplier = (((missileCommandGame.speedMultiplier - 1) / 5) * 2) + 1;
		} else {
			var cursorSpeedMultiplier = 1;
		}
		
		cursorSpeedMultiplier *= 0.75;
		
		if (move.right && this.x + 2*this.size < canvas.width) {
			this.x += 8.5 * cursorSpeedMultiplier;
		}
		if (move.left && this.x - 2*this.size > 0) {
			this.x -= 8.5 * cursorSpeedMultiplier;
		}
		if (move.down && this.y < canvas.height - 200) {
			this.y += 7.5 * cursorSpeedMultiplier;
		}
		if (move.up && this.y > this.size*2) {
			this.y -= 7.5 * cursorSpeedMultiplier;
		}
	}
	
	draw() {
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 1;
		
		//4 corners:
		ctx.beginPath();
		
		ctx.moveTo(this.x - this.size, this.y - this.size);
		ctx.lineTo(this.x - this.size/2,this.y - this.size);
		ctx.moveTo(this.x - this.size, this.y - this.size);
		ctx.lineTo(this.x - this.size,this.y - this.size/2);
		
		ctx.moveTo(this.x + this.size, this.y - this.size);
		ctx.lineTo(this.x + this.size/2, this.y - this.size);
		ctx.moveTo(this.x + this.size, this.y - this.size);
		ctx.lineTo(this.x + this.size, this.y - this.size/2);
		
		
		ctx.moveTo(this.x - this.size, this.y + this.size);
		ctx.lineTo(this.x - this.size/2, this.y + this.size);
		ctx.moveTo(this.x - this.size, this.y + this.size);
		ctx.lineTo(this.x - this.size, this.y + this.size/2);
		
		
		ctx.moveTo(this.x + this.size, this.y + this.size);
		ctx.lineTo(this.x + this.size/2, this.y + this.size);
		ctx.moveTo(this.x + this.size, this.y + this.size);
		ctx.lineTo(this.x + this.size, this.y + this.size/2);
		
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}
