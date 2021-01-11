class Lander {
	constructor(x,y,fuel,throttle,maxThrust) {
		this.x = x;
		this.y = y;
		this.fuel = fuel;
		this.aborting = false;
		this.abortTimer = 0;
		
		this.flameFlicker = 0;
		this.maxThrust = maxThrust;
		this.thrust = 0;
		this.throttle = throttle;
		this.radians = 1.5*Math.PI;
		this.velX = 3; //3
		this.velY = 0;
		this.rotationVel = 0;
		this.landed = false;
		
		this.size = 10;
		this.hitbox;
		
		this.fixVelX = false; //bool used to set velX to 0 if it is displayed like that.
		
		this.explosionAngles = [];
		this.anglesCalculated = false;
		this.exploding = false;
		this.touchGround = false; //boolean used to determine wether or not the vessel has touched the ground, so that it won't calculate wether it has landed or crashed again. only the first time it is accurate
		
		this.calculatedLandingScore = false;
		
		this.segmentPoints = [];
		this.intersection;
		
		this.mapX = this.x;
		
		this.relativeX;
		this.altitude = 0;
		
		//offsets for explosion of vehicle:
		this.capsuleOffset = {
			x: 0,
			y: 0
		}
		this.leftLegOffset = {
			x: 0,
			y: -4.5
		}
		this.rightLegOffset = {
			x: 0,
			y: -4.5
		}
		this.fueltankOffset = {
			x: 0,
			y: -4.5
		}
		this.engineOffset = {
			x: 0,
			y: -4.5
		}
		
		//sounds:
		this.thrustSound = new Audio();
		this.thrustSound.src = "LunarLander/src/thrust.mp3";
		this.thrustVolume = 0;
		
		this.explodeSound = new Audio();
		this.explodeSound.src = "LunarLander/src/explode.mp3";
	}
	
	update() {
		this.size = 8*lunarLanderGame.playerZoom; //8
		this.burnFuel();
		this.handleMovement();
		
		this.hitbox = this.calculateHitbox(this.radians,this.x,this.y,this.x - 1.5*this.size,this.y - this.size,2.9*this.size,this.size * 3);
		this.calculateAltitude();
		this.calculateMisc();
		this.draw();
	}
	
	burnFuel() {
		this.fuel -= this.thrust*(20/lunarLanderGame.zoom) * lunarLanderGame.burnRate;
		this.thrustVolume = this.thrust/this.maxThrust;
		if (this.thrustVolume > 1) {
			this.thrustVolume = 1;
		}
		
		this.thrustSound.volume = this.thrustVolume;
		
		this.thrustSound.play();
		this.flameAmount += 1.07;
		if (this.thrustVolume == 0) {
			this.flameAmount = 0;
		}
		
		this.thrustGauge = (this.thrust/this.maxThrust)*70;
		
		if (this.fuel < 0) {
			this.fuel = 0;
			this.thrust = 0;
		}
	}
	
	handleMovement() {
		//fix radians so it is always as small as possible:
		if (this.radians >= 2*Math.PI) {
			this.radians = 0;
		}
		if (this.radians < 0) {
			this.radians = 2*Math.PI;
		}
		
		if (lunarLanderGame.backgroundGame) {
			console.log(this.radians);
			if (!lunarLanderGame.rotate) {
				if (!lunarLanderGame.zoomed) {
					if (move.right && (this.radians < 0.5*Math.PI || this.radians > 1.4*Math.PI) && !this.landed) {
						this.radians += 0.04;
					}
					if (move.left && (this.radians > 1.5*Math.PI || this.radians < 0.6*Math.PI) && !this.landed) {
						this.radians -= 0.04;
					}
				} else {
					if (move.right && (this.radians < 0.5*Math.PI || this.radians > 1.4*Math.PI) && !this.landed) {
						this.radians += 0.018;
					}
					if (move.left && (this.radians > 1.5*Math.PI || this.radians < 0.6*Math.PI) && !this.landed) {
						this.radians -= 0.018;
					}
				}
				
			} else {
				if (move.right && !this.landed) {
					this.rotationVel += 0.00143;
				}
				if (move.left && !this.landed) {
					this.rotationVel -= 0.00143;
				}
			}
			
			if (!lunarLanderGame.gauge) {
				if ((map.Button0 || map[38]) && this.thrust < this.maxThrust && this.fuel > 0) {
					this.thrust += this.throttle;
				} else if (!(map.Button0 || map[38]) && this.thrust > 0 && this.fuel > 0) {
					this.thrust -= this.throttle;
				}
			} else {
				if ((map.Button0 || map[38]) && this.thrust < this.maxThrust && this.fuel > 0) {
					this.thrust += this.throttle;
					
				}
				if (map.Button1 || map[40]) {
					this.thrust -= this.throttle;
				}
				if ((map.Button2 || map[32]) && this.fuel > 0) {
					this.aborting = true;
					
				}
				if (this.aborting) {
					this.abort();
				}
			}
			
			if (this.thrust < 0) {
				this.thrust = 0;
			}
			if (move.down && this.thrust > 0) {
				// this.thrust -= 0.0005;
			}
		}
		if (this.fuel > 0) {
			this.velX += Math.sin(this.radians)*this.thrust;
			this.velY += -Math.cos(this.radians)*this.thrust;
		}
		this.mapX += this.velX;
		this.velY += lunarLanderGame.g;
		this.velX *= lunarLanderGame.friction;
		this.velY *= lunarLanderGame.friction;
		if ((this.x < 350 && this.velX < 0) || (this.x > canvas.width - 350 && this.velX > 0)) {
			lunarLanderGame.map.offsetX -= this.velX;
		}
		if (!lunarLanderGame.zoomed) {
			if ((this.y < 100 && this.velY < 0) || (this.y > canvas.height - 500 && this.velY > 0)) {
				lunarLanderGame.map.offsetY -= this.velY;
			}
		} else {
			if ((this.y < 100 && this.velY < 0) || (this.y > canvas.height - 200 && this.velY > 0)) {
				lunarLanderGame.map.offsetY -= this.velY;
			}
		}
		
	}
	
	abort() {
		this.rotationVel = 0;
		if (this.radians > Math.PI) {
			this.radians += 0.1;
		}
		if (this.radians < Math.PI) {
			this.radians -= 0.1;
		}

		if ((this.radians < 0.1 && this.radians > 0) || (this.radians > -0.15 && this.radians < 0)) {
			this.radians = 0;
		}
		if (this.radians == 0) {
			this.abortTimer++;
			this.maxThrust = (1.8*lunarLanderGame.maxThrust) * lunarLanderGame.zoom;
			this.thrust = 0.02 * lunarLanderGame.zoom;
			if (this.abortTimer > 100 || (move.right || move.left || map.Button0 || map.Button1 || map[40] || map[38])) {
				this.aborting = false;
				this.maxThrust = lunarLanderGame.maxThrust * lunarLanderGame.zoom;
				this.thrust = this.maxThrust
				this.abortTimer = 0;
			}
		}
	}
	
	calculateHitbox(angle,ox,oy,x,y,w,h) {
		const xAx = Math.cos(angle);  // x axis x
		const xAy = Math.sin(angle);  // x axis y
		x -= ox;  // move rectangle onto origin
		y -= oy; 
		return [[ // return array holding the resulting points
			x * xAx - y * xAy + ox,   // Get the top left rotated position
			x * xAy + y * xAx + oy,   // and move it back to the origin
			], [
				(x + w) * xAx - y * xAy + ox,   // Get the top right rotated position
				(x + w) * xAy + y * xAx + oy,   
			], [
				(x + w) * xAx - (y + h) * xAy + ox,   // Get the bottom right rotated position
				(x + w) * xAy + (y + h) * xAx + oy,   
			], [
				x * xAx - (y + h) * xAy + ox,   // Get the bottom left rotated position
				x * xAy + (y + h) * xAx + oy,   
			]
		]; 
	}
	
	calculateAltitude() {
		//calculate altitude:
		for (let i = 0; i < lunarLanderGame.map.fullmap.length - 1; i++) {
			//get the two points surrounding the segment beneath the lander
			if (lunarLanderGame.map.fullmap[i+1].x > this.x && lunarLanderGame.map.fullmap[i-1].x < this.x) {
				this.segmentPoints.push({x:lunarLanderGame.map.fullmap[i].x, y: lunarLanderGame.map.fullmap[i].y});
			}
		}
		if (this.segmentPoints.length == 2) {
			this.intersection = segment_intersection(
				this.segmentPoints[0].x,this.segmentPoints[0].y,this.segmentPoints[1].x,this.segmentPoints[1].y,
				this.x,this.y + (this.size*2.5 - 7),this.x,5000
			);
			this.relativeX = this.intersection.x;
			this.altitude = (-((this.y + 6 + (this.size*2.5)) - this.intersection.y))/lunarLanderGame.zoom + 7;
		}
		if (this.segmentPoints.length == 1) {
			this.intersection = {x: this.segmentPoints[0].x, y: this.segmentPoints[0].y};
			this.relativeX = this.intersection.x;
			this.altitude = (-((this.y + (this.size*2.5)) - this.intersection.y))/lunarLanderGame.zoom;
		}
		
		//calculate if the lander is above a landing spot or not:
		this.landingMultiplier = 1;
		for (let i = 0; i < lunarLanderGame.map.landingSpots2x.length; i++) {
			if (this.segmentPoints[1].x == lunarLanderGame.map.landingSpots2x[i].x1) {
				ctx.fillStyle = "#00ff00";
				// ctx.fillRect(lunarLanderGame.map.landingSpots2x[i].x1,lunarLanderGame.map.landingSpots2x[i].y1,3,-50);
				// ctx.fillRect(lunarLanderGame.map.landingSpots2x[i].x2,lunarLanderGame.map.landingSpots2x[i].y2,3,-50);
				this.landingMultiplier = 2;
				this.removeIndex = i;
			}
		}
		for (let i = 0; i < lunarLanderGame.map.landingSpots4x.length; i++) {
			if (this.segmentPoints[1].x == lunarLanderGame.map.landingSpots4x[i].x1) {
				ctx.fillStyle = "#0000ff";
				// ctx.fillRect(lunarLanderGame.map.landingSpots4x[i].x1,lunarLanderGame.map.landingSpots4x[i].y1,3,-50);
				// ctx.fillRect(lunarLanderGame.map.landingSpots4x[i].x2,lunarLanderGame.map.landingSpots4x[i].y2,3,-50);
				this.landingMultiplier = 4;
				this.removeIndex = i;
			}
		}
		for (let i = 0; i < lunarLanderGame.map.landingSpots5x.length; i++) {
			if (this.segmentPoints[1].x == lunarLanderGame.map.landingSpots5x[i].x1) {
				ctx.fillStyle = "#ff0000";
				// ctx.fillRect(lunarLanderGame.map.landingSpots5x[i].x1,lunarLanderGame.map.landingSpots5x[i].y1,3,-50);
				// ctx.fillRect(lunarLanderGame.map.landingSpots5x[i].x2,lunarLanderGame.map.landingSpots5x[i].y2,3,-50);
				this.landingMultiplier = 5;
				this.removeIndex = i;
			}
		}
		
		if (!this.touchGround) {
			if (isNaN(this.altitude) || this.touchGround) {
				if (!this.calculatedLandingScore) {
					this.landingScore = Math.abs(this.velX) + Math.abs(this.velY);
					this.calculatedLandingScore = true;
				}
				if ((Math.abs(this.velX) < 0.6 && Math.abs(this.velY) < 0.4) && (this.radians < 0.145 || this.radians > (2*Math.PI) - 0.145)) {
					this.landed = true;
					this.exploding = false;
				} else {
					this.landed = false;
					this.exploding = true;
				}
				this.thrust = 0;
				this.touchGround = true;
			}
		}
		if (this.touchGround) {
			this.velY = 0;
			this.velX = 0;
		}
		
		if (this.landed) {
			this.altitude = 0;
			this.thrust = 0;
		}
		if (this.exploding) {
			this.thrust = 0;
			this.explode();
		}
		
		this.segmentPoints = [];
		this.x += this.velX;
		this.y += this.velY;
		if (!this.landed) {
			this.radians += this.rotationVel;
		}
	}
	
	calculateMisc() {
		this.displayVelX = Math.floor(Math.abs(this.velX*26/lunarLanderGame.zoom));
		this.displayVelY = Math.floor(Math.abs(this.velY*26/lunarLanderGame.zoom));
		
		if (this.displayVelX == 0 && !this.fixVelX) {
			this.velX = 0;
			this.fixVelX = true;
		}
		if (this.displayVelX != 0) {
			this.fixVelX = false;
		}
	}
	
	explode() {
		if (!this.anglesCalculated) {
			for (let i = 0; i < 5; i++) {
				this.explosionAngles.push(Math.PI*Math.random());
			}
			this.anglesCalculated = true;
		}
		this.capsuleOffset.x += Math.cos(this.explosionAngles[0]) * 2;
		this.capsuleOffset.y += Math.sin(this.explosionAngles[0]) * 2;
		
		this.leftLegOffset.x += Math.cos(this.explosionAngles[1]) * 2;
		this.leftLegOffset.y += Math.sin(this.explosionAngles[1]) * 2;
		
		this.rightLegOffset.x += Math.cos(this.explosionAngles[2]) * 2;
		this.rightLegOffset.y += Math.sin(this.explosionAngles[2]) * 2;
		
		this.fueltankOffset.x += Math.cos(this.explosionAngles[3]) * 2;
		this.fueltankOffset.y += Math.sin(this.explosionAngles[3]) * 2;
		
		this.engineOffset.x += Math.cos(this.explosionAngles[4]) * 2;
		this.engineOffset.y += Math.sin(this.explosionAngles[4]) * 2;
	}
	
	draw() {
		//draw hitbox:
		ctx.beginPath();
		ctx.moveTo(this.hitbox[0][0],this.hitbox[0][1]);
		for (let i = 1; i < this.hitbox.length; i++) {
			ctx.lineTo(this.hitbox[i][0],this.hitbox[i][1]);
		}
		ctx.closePath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#ff0000";
		// ctx.stroke();
		
		ctx.save();
		ctx.translate(this.x,this.y);
		ctx.rotate(this.radians);
		
		//draw capsule
		ctx.beginPath();
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 1;
		if (lunarLanderGame.zoomed) {
			ctx.moveTo(this.size*Math.cos((Math.PI/8)) - 2.5 + this.capsuleOffset.x,this.size*Math.sin((Math.PI/8)) - 1.5 + this.capsuleOffset.y);
		} else {
			ctx.moveTo(this.size*Math.cos((Math.PI/8)),this.size*Math.sin((Math.PI/8)));
		}
		
		for (let i = 1; i <= 8; i++) {
			ctx.lineTo((this.size*0.8)*Math.cos(i*2*Math.PI/8 + (Math.PI/8)) + this.capsuleOffset.x,(this.size*0.8) * Math.sin(i*2*Math.PI/8 + (Math.PI/8)) + this.capsuleOffset.y);
		}
		ctx.stroke();
		
		//draw fuel tank
		ctx.fillStyle = "#000";
		ctx.fillRect(-this.size + (this.fueltankOffset.x * lunarLanderGame.playerZoom), this.size + (this.fueltankOffset.y * lunarLanderGame.playerZoom), 2*this.size,0.4*this.size);
		ctx.strokeRect(-this.size + (this.fueltankOffset.x * lunarLanderGame.playerZoom), this.size + (this.fueltankOffset.y * lunarLanderGame.playerZoom), 2*this.size,0.4*this.size);
		
		//draw left leg
		ctx.beginPath();
		ctx.moveTo(-0.7*this.size + (this.leftLegOffset.x * lunarLanderGame.playerZoom), this.size + 0.4*this.size + (this.leftLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(-1.4*this.size + (this.leftLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.leftLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(-1.6*this.size + (this.leftLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.leftLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(-1.2*this.size + (this.leftLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.leftLegOffset.y * lunarLanderGame.playerZoom));
		ctx.stroke();
		
		//draw right leg
		ctx.beginPath();
		ctx.moveTo(0.7*this.size + (this.rightLegOffset.x * lunarLanderGame.playerZoom), this.size + 0.4*this.size + (this.rightLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(1.4*this.size + (this.rightLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.rightLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(1.6*this.size + (this.rightLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.rightLegOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(1.2*this.size + (this.rightLegOffset.x * lunarLanderGame.playerZoom), this.size + 1.5*this.size + (this.rightLegOffset.y * lunarLanderGame.playerZoom));
		ctx.stroke();
		
		//draw flame:
		this.flameFlicker = 2*lunarLanderGame.playerZoom*Math.sin(this.flameAmount);
		if (this.thrust > 0) {
			ctx.beginPath();
			ctx.moveTo(-0.62*this.size, this.size + 0.8*this.size - 2);
			ctx.lineTo(0,this.size + 0.4*this.size + ((this.thrust/lunarLanderGame.zoom)*(2200 * lunarLanderGame.playerZoom)+this.flameFlicker) - 2);
			ctx.lineTo(0.62*this.size, this.size + 0.8*this.size - 2);
			ctx.closePath();
			ctx.stroke();
		}
		
			//draw engine
		ctx.beginPath();
		ctx.moveTo(-0.4*this.size + (this.engineOffset.x * lunarLanderGame.playerZoom), this.size + 0.4*this.size + (this.engineOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(0.4*this.size + (this.engineOffset.x * lunarLanderGame.playerZoom), this.size + 0.4*this.size + (this.engineOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(0.75*this.size + (this.engineOffset.x * lunarLanderGame.playerZoom), this.size + 1.2*this.size + (this.engineOffset.y * lunarLanderGame.playerZoom));
		ctx.lineTo(-0.75*this.size + (this.engineOffset.x * lunarLanderGame.playerZoom), this.size + 1.2*this.size + (this.engineOffset.y * lunarLanderGame.playerZoom));
		ctx.closePath();
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.stroke();
		
		
		ctx.restore();
	}
}