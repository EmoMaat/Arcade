var lunarScreen = 1;
var landerImg = new Image();
landerImg.src = "LunarLander/src/lander.png";

var lunarDifficulty = 1;
var gravity;
var friction;
var rotate;
var gauge;
var lunarTitle = new Image();
lunarTitle.src = "LunarLander/src/title.png";

function LunarLander() {
	HubControl = false;
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
        overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	LunarLanderMainMenuOverlay();
	
	menuOverlay.backgroundGame = new LunarLanderGame(false);
	menuOverlay.backgroundGame.overlay = true;
	lunarLanderGame = menuOverlay.backgroundGame;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
		ctx.drawImage(lunarTitle,canvas.width/2 - lunarTitle.width/2,lunarTitle.height - 40);
		if (lunarScreen == 2) {
			ctx.fillStyle = "#000";
			ctx.fillRect(700,canvas.height-370,720,310);
			ctx.lineWidth = 2;
			ctx.strokeRect(700,canvas.height-370,720,310);
			ctx.drawImage(landerImg,730,canvas.height-320,landerImg.width*0.7,landerImg.height*0.7);
			ctx.font = "bold 40px segoe ui";
			ctx.fillStyle = "#fff";
			ctx.textAlign = "center";
			switch (menuOverlay.selected) {
				case 0:
					ctx.fillText("TRAINING MISSION",700 + 720/2,canvas.height - 400);
					ctx.font = "30px segoe ui";
					ctx.textAlign = "left";
					ctx.fillText("Light gravity",1030,canvas.height - 285);
					ctx.fillText("Friction from atmosphere",1030,canvas.height - 235);
					ctx.fillText("Controlled rotation",1030,canvas.height - 185);
					ctx.fillText("Controlled thrust",1030,canvas.height - 135);
					break;
				case 1:
					ctx.fillText("CADET MISSION",700 + 720/2,canvas.height - 400);
					ctx.font = "30px segoe ui";
					ctx.textAlign = "left";
					ctx.fillText("Moderate gravity",1030,canvas.height - 285);
					ctx.fillText("No friction",1030,canvas.height - 235);
					ctx.fillText("Controlled rotation",1030,canvas.height - 185);
					ctx.fillText("Thrust gauge",1030,canvas.height - 135);
					break;
				case 2:
					ctx.fillText("PRIME MISSION",700 + 720/2,canvas.height - 400);
					ctx.font = "30px segoe ui";
					ctx.textAlign = "left";
					ctx.fillText("Strong gravity",1030,canvas.height - 285);
					ctx.fillText("No friction",1030,canvas.height - 235);
					ctx.fillText("Controlled rotation",1030,canvas.height - 185);
					ctx.fillText("Thrust gauge",1030,canvas.height - 135);
					break;
				case 3:
					ctx.fillText("COMMAND MISSION",700 + 720/2,canvas.height - 400);
					ctx.font = "30px segoe ui";
					ctx.textAlign = "left";
					ctx.fillText("Moderate gravity",1030,canvas.height - 285);
					ctx.fillText("No friction",1030,canvas.height - 235);
					ctx.fillText("Rotational momentum",1030,canvas.height - 185);
					ctx.fillText("Thrust gauge",1030,canvas.height - 135);
				break;
			}
			ctx.beginPath();
			ctx.moveTo(130,canvas.height - 270);
			ctx.lineTo(130,canvas.height - 170);
			ctx.lineTo(90,canvas.height - 220);
			ctx.closePath();
			ctx.fill();
			if (move.left) {
				LunarLanderMainMenuOverlay();
			}
		}
	}, 20);
}
function LunarLanderMainMenuOverlay() {
	menuOverlay.selected = 0;
	lunarScreen = 1;
	menuOverlay.buttons = [
		new Button(canvas.width/2 - 200, canvas.height - 310, 400, 30, "SELECT MISSION", "loadMissionButtons()"),
		new Button(canvas.width/2 - 200, canvas.height - 230, 400, 30, "HIGHSCORES", "loadHighscores('" + currentGame + "', 0,true)"),
		new Button(canvas.width/2 - 200, canvas.height - 150, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(canvas.width/2 - 200, canvas.height - 70, 400, 30, "EXIT", "loadHub()")
	];
}
function loadMissionButtons() {
	menuOverlay.selected = 0;
	lunarScreen = 2
	menuOverlay.buttons = [
		new Button(200, canvas.height - 310, 400, 30, "TRAINING MISSION", "selectMission(1)"),
		new Button(200, canvas.height - 230, 400, 30, "CADET MISSION", "selectMission(2)"),
		new Button(200, canvas.height - 150, 400, 30, "PRIME MISSION", "selectMission(3)"),
		new Button(200, canvas.height - 70, 400, 30, "COMMAND MISSION", "selectMission(4)")
	];
}
function selectMission(mission) {
	lunarDifficulty = mission;
	newLunarLanderGame();
}

function newLunarLanderGame(background) {
	 if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	clearInterval(gameInterval);
	clearInterval(overlayInterval);
	OverlayIsActive = false;
	
	lunarLanderGame = new LunarLanderGame(true);
	move.smooth = true;
	
	gameInterval = new Interval(updateLunarGame,20);
}

function updateLunarGame() {
	lunarLanderGame.update();
}

class LunarLanderGame {
	constructor(backgroundgame) {
		this.zoom = 1;
		this.playerZoom = 1;
		this.zoomed = false;
		this.backgroundGame = backgroundgame;
		
		this.map = new terrainMap();
		this.generated = false;
		this.landerSpawned = 0;
		this.segmentPoints = [];
		this.intersection = 0;
		this.explosionTimer = 0;
		
		this.offsetCounter = 0;
		this.testPosition = 0;
		this.testOffset = 0;
		
		this.score = 0;
		this.time = {
			min: "0",
			sec: "00"
		};
		
		this.landingMessages = [
			"A PERFECT LANDING",
			"THE COLUMBIA HAS LANDED",
			"THE EAGLE HAS LANDED",
			"THAT WAS A GREAT LANDING",
			"YOU HAVE LANDED"
		];
		this.hardLandingMessages = [
			"YOU ARE HOPELESSLY MAROONED",
			"YOUR TRIP IS ONE WAY",
			"YOU ARE TRAPPED 240.000 MILES FROM HOME"
		];
		this.crashMessages = [
			"YOU JUST DESTROYED A 100 MEGABUCK LANDER",
			"YOU CREATED A TWO MILE CRATER",
			"DESTROYED"
		];
		this.destroyedPartsMessages = [
			"AUXILARY FUEL TANKS DESTROYED",
			"COMMUNICATION SYSTEMS DESTROYED"
		];
		
		switch(lunarDifficulty) {
			case 1:
				this.g = 0.0025;
				this.friction = 0.9983;
				this.rotate = false;
				this.gauge = false;
				this.throttle = 0.001;
				this.maxThrust = 0.008;
				
				this.fuelChance = 50;
				this.burnRate = 1.5;
				break;
			case 2:
				this.g = 0.005;
				this.friction = 1;
				this.rotate = false;
				this.gauge = true;
				this.throttle = 0.0002;
				this.maxThrust = 0.0097;
				
				this.fuelChance = 50;
				this.burnRate = 0.9;
			break;
			case 3:
				this.g = 0.007;
				this.friction = 1;
				this.rotate = false;
				this.gauge = true;
				this.throttle = 0.0002;
				this.maxThrust = 0.009;
				
				this.fuelChance = 50;
				this.burnRate = 0.87;
			break;
			case 4:
				this.g = 0.006;
				this.friction = 1;
				this.rotate = true;
				this.gauge = true;
				this.throttle = 0.0002;
				this.maxThrust = 0.009;
				
				this.fuelChance = 50
				this.burnRate = 0.8;
			break;
		}
		
		this.lander = new Lander(250,501,750,this.throttle,this.maxThrust);
		this.gamemode = "";
	}
	
	spawnLander() {
		for (let i = 0; i < lunarLanderGame.map.fullmap.length - 1; i++) {
			if (lunarLanderGame.map.fullmap[i+1].x > this.lander.x && lunarLanderGame.map.fullmap[i-1].x < this.lander.x) {
				this.segmentPoints.push({x:lunarLanderGame.map.fullmap[i].x, y: lunarLanderGame.map.fullmap[i].y});
			}
		}
		if (this.segmentPoints.length == 2) {
			this.intersection = segment_intersection(
				this.segmentPoints[0].x,this.segmentPoints[0].y,this.segmentPoints[1].x,this.segmentPoints[1].y,
				this.lander.x,-10000,this.lander.x,50000
			);
		}
		if (this.segmentPoints.length == 1) {
			this.intersection = {x: this.segmentPoints[0].x, y: this.segmentPoints[0].y};
		}
		this.lander.y = this.intersection.y - 800;
		
		this.map.offsetY = -lunarLanderGame.lander.y + 100;
		this.map.offsetX = lunarLanderGame.lander.x;
		
		this.lander.velX = 2;
	}
	
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);;
		this.lander.update();
		if (!this.generated) {
			this.map.generate();
			this.generated = true;
		}
		this.landerSpawned++;
		if (this.landerSpawned == 1) {
			this.spawnLander();
		}
		if (this.landerSpawned > 2) {
			this.landerSpawned = 2;
		}
		//some controlls for moving the camera around the map
			if (map[75]) {
				this.map.offsetY = 8;
				this.offsetCounter += 8;
			}
			if (map[73]) {
				this.map.offsetY = -8;
			}
			
			if (map[74]) {
				this.map.offsetX = 16;
			}
			if (map[76]) {
				this.map.offsetX = -16;
			}
		//
		
		
		if (map[18]) {
			
		}
		this.controllZoom();
		this.controllRounds();
		this.map.render();
		this.drawUI();
		this.map.offsetX = 0;
		this.map.offsetY = 0;
	}
	
	controllRounds() {
		if (this.lander.exploding || this.lander.landed) {
			if (this.explosionTimer == 0 && this.lander.exploding) {
				this.lander.explodeSound.play();
			}
			this.explosionTimer++;
			
			if (this.explosionTimer > 250) {
				this.leftoverFuel = this.lander.fuel + this.extraFuel
				if (this.leftoverFuel <= 0 && this.backgroundGame) {
					loadHighscores(currentGame,this.score);
				} else {
					this.touchPoint = {x: this.lander.x, y: this.lander.y};
					this.map.zoomIn(0,0,1/3.5);
					this.zoom = 1;
					this.playerZoom = 1;
					this.zoomed = false;
					this.explosionTimer = 0;
					
					//remove landing spot:
					if (this.lander.landingMultiplier > 1) { //if landingMultiplier == 1, that means you have not landed on a landing spot, thus no need to remove one
						eval("this.map.landingSpots"+this.lander.landingMultiplier+"x.splice("+this.lander.removeIndex+",1)");
					}
					
					
					this.map.offsetX = -75;
					
					this.lander = new Lander(250,this.touchPoint.y - 1200,this.leftoverFuel,this.throttle,this.maxThrust);
					this.testPosition = this.lander.y; //set test position
					while (this.testPosition < 265) { //250 is the desired y position for the lander to start on
						this.testPosition += 1; //add 1 to the test position, since it will always be lower than 0
						this.testOffset += 1; //also add 1 to testOffset, to calculate which offset to apply.
					}
					this.map.offsetY = this.testOffset; //apply the calculated offset
				}
			}
		} else {
			this.testPosition = 0;
			this.testOffset = 0;
		}
	}
	
	controllZoom() {
		if (!this.lander.landed) {
			if (this.lander.altitude < 150 && !this.zoomed && this.landerSpawned == 2) {
				this.map.zoomIn(this.lander.relativeX,this.lander.y,3.5);
				this.zoom = 3.5;
				this.playerZoom = 2;
				this.zoomed = true;
			}
			if (this.lander.altitude > 180 && this.zoomed) {
				this.map.zoomIn(this.lander.relativeX,this.lander.y,1/3.5);
				this.zoom = 1;
				this.playerZoom = 1;
				this.zoomed = false;
				this.lander.velX *= 1/3.5;
				this.lander.velY *= 1/3.5;
			}
		}
		
	}
	
	drawUI() {
		ctx.font = "20px segoe ui";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "left";
		ctx.fillText("SCORE:",130,90);
		ctx.fillText(this.score,210,90);
		ctx.fillText("TIME:",130,115);
		ctx.fillText(this.time.min+":"+this.time.sec,210,115);
		ctx.fillText("FUEL",130,140);
		ctx.fillText(Math.floor(this.lander.fuel),210,140);
		
		ctx.fillText("ALTITUDE",canvas.width - 400,90);
		ctx.fillText("HORIZONTAL SPEED",canvas.width - 400,115);
		ctx.fillText("VERTICAL SPEED",canvas.width - 400,140);
		ctx.textAlign = "right";
		ctx.fillText(Math.floor(this.lander.altitude),canvas.width-130,90);
		ctx.fillText(Math.floor(Math.abs(this.lander.velX*26/this.zoom)),canvas.width-130,115);
		ctx.fillText(Math.floor(Math.abs(this.lander.velY*26/this.zoom)),canvas.width-130,140);
		
		ctx.strokeStyle = "#fff";
		ctx.beginPath();
		if (Math.floor(this.lander.velX*26/this.zoom) > 0) {
			ctx.moveTo(canvas.width-110,108);
			ctx.lineTo(canvas.width-70,108);
			ctx.lineTo(canvas.width-80,102);
			ctx.lineTo(canvas.width-80,114);
			ctx.lineTo(canvas.width-70,108);
		} else if (Math.floor(this.lander.velX*26/this.zoom) < 0) {
			ctx.moveTo(canvas.width-70,108);
			ctx.lineTo(canvas.width-110,108);
			ctx.lineTo(canvas.width-100,102);
			ctx.lineTo(canvas.width-100,114);
			ctx.lineTo(canvas.width-110,108);
		}
		ctx.fill();
		ctx.stroke();
		ctx.stroke();
		ctx.stroke();
		
		ctx.beginPath();
		if (Math.floor(this.lander.velY*26/this.zoom) > 0) {
			ctx.moveTo(canvas.width-95,120);
			ctx.lineTo(canvas.width-95,155);
			ctx.lineTo(canvas.width-100,145);
			ctx.lineTo(canvas.width-89,145);
			ctx.lineTo(canvas.width-95,155);
		} else if (Math.floor(this.lander.velY*26/this.zoom) < 0) {
			ctx.moveTo(canvas.width-95,155);
			ctx.lineTo(canvas.width-95,120);
			ctx.lineTo(canvas.width-89,130);
			ctx.lineTo(canvas.width-100,130);
			ctx.lineTo(canvas.width-95,120);
		}
		ctx.fill();
		ctx.stroke();
		ctx.stroke();
		ctx.stroke();
		
		ctx.lineWidth = 1;
		ctx.fillRect(canvas.width - 430,140,10,-this.lander.thrustGauge);
		ctx.strokeRect(canvas.width - 430,140,10,-70);
		ctx.strokeRect(canvas.width - 430,140,10,-70);
		
		// console.log(Math.floor((1/0.2) + 50 * 5));
		
		//draw end text
		ctx.textAlign = "center";
		ctx.font = "25px segoe ui";
		if ((this.lander.exploding || this.lander.landed) && this.backgroundGame) {
			if (this.explosionTimer > 30) {
				if (this.lander.landed) {
					if (this.lander.landingScore < 0.7 && this.lander.landingScore > 0.28) {
						if (this.explosionTimer == 31) {
							this.score += Math.floor(25 * this.lander.landingMultiplier) * lunarDifficulty;
							this.random = Math.random();
							if (this.random > 0.4) {
								this.extraFuel = -Math.floor(Math.random() * 60);
							} else if (this.random < 0.4) {
								this.extraFuel = Math.floor((1/this.lander.landingScore) + (10*this.lander.landingMultiplier) * this.lander.landingMultiplier * 0.4);
							}
							
							this.landMsg = this.hardLandingMessages[Math.floor(Math.random() * this.hardLandingMessages.length)];
						}
						if (this.extraFuel > 0) {
							ctx.fillText(Math.floor(this.extraFuel) + " FUEL UNITS EARNED",canvas.width/2,canvas.height/2 - 75);
						} else if (this.extraFuel < 0) {
							ctx.fillText(Math.abs(Math.floor(this.extraFuel)) + " FUEL UNITS LOST",canvas.width/2,canvas.height/2 - 75);
						}
						ctx.fillText("YOU LANDED HARD",canvas.width/2,canvas.height/2 - 250);
						ctx.fillText(this.landMsg,canvas.width/2,canvas.height/2 - 200);
						ctx.fillText(Math.floor(25*this.lander.landingMultiplier) * lunarDifficulty + " POINTS",canvas.width/2,canvas.height/2 - 125);
					} else if (this.lander.landingScore < 0.28) {
						if (this.explosionTimer == 31) {
							this.score += Math.floor(50 * this.lander.landingMultiplier) * lunarDifficulty;
							this.extraFuel = 0;
							// this.extraFuel = Math.floor((1/this.lander.landingScore) + (10*this.lander.landingMultiplier) * this.lander.landingMultiplier);
							this.extraFuel = this.fuelChance + Math.random()*200
							this.landMsg = this.landingMessages[Math.floor(Math.random() * this.landingMessages.length)];
						}
						
						if (this.extraFuel != 0) {
							ctx.fillText(Math.floor(this.extraFuel) + " FUEL UNITS EARNED",canvas.width/2,canvas.height/2 - 75);
						}
						ctx.fillText("CONGRATULATIONS",canvas.width/2,canvas.height/2 - 250);
						ctx.fillText(this.landMsg,canvas.width/2,canvas.height/2 - 200);
						ctx.fillText(Math.floor(50*this.lander.landingMultiplier) * lunarDifficulty + " POINTS",canvas.width/2,canvas.height/2 - 125);
					}
				} else {
					if (this.explosionTimer == 31) {
						this.score += 15 * lunarDifficulty;
						this.landMsg = this.crashMessages[Math.floor(Math.random() * this.crashMessages.length)];
						this.destroyMsg = this.destroyedPartsMessages[Math.floor(Math.random() * this.destroyedPartsMessages.length)];
						this.extraFuel = -Math.floor(Math.random() * 150);
					}
					ctx.fillText(this.destroyMsg,canvas.width/2,canvas.height/2 - 330);
					ctx.fillText(Math.abs(Math.floor(this.extraFuel)) + " FUEL UNITS LOST",canvas.width/2,canvas.height/2 - 280);
					ctx.fillText(this.landMsg,canvas.width/2,canvas.height/2 - 200);
					ctx.fillText(15 * lunarDifficulty+" POINTS",canvas.width/2,canvas.height/2 - 140);
				}	
			}
			if (this.explosionTimer > 230) {
				ctx.fillStyle = "#000";
				ctx.fillRect(0,0,canvas.width,canvas.height);
			}
		}
	}
	quit() {
		
	}
}