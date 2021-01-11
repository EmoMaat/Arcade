class defenderShip {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.minimalThrust = 2;
		this.velX = this.minimalThrust;
		this.velY = 0;
		this.maxHorizontalVel = 25;
		this.maxVerticalVel = 14;
		this.accelerate = 0.376; // thrust applied when 
		this.breakThrust = 0.3; // thrust applied when changing direction
		this.direction = 1;
		this.lastDirection = 1;
		this.changingDirection = false;
		
		this.scale = 0.8;
		
		this.borderLeft = 450;
		this.borderRight = canvas.width - 450 + (defenderSprite1.width*this.scale);
		
		this.shot = false;
		
		//for flame animation
		this.randomFlameTime = Math.floor(Math.random()*5);
		this.flameTimer = 0;
		this.flameRandom = Math.floor((Math.random()*3));
		this.flameHeight = defenderFlame1.height/6;
		this.flameWidth = defenderFlame1.width;
	}
	update() {
		move.smooth = true;
		this.control();
		this.applyMovement();
		this.getFlameState();
		this.draw();
		this.lastDirection = this.direction;
	}
	control() {
		if (this.direction) {
			this.vel = 1;
		} else {
			this.vel = -1;
		}
		//movement
		if (move.right && this.velX < this.maxHorizontalVel) {
			this.velX += this.accelerate;
			this.direction = 1;
		}
		if (move.left && this.velX > -this.maxHorizontalVel) {
			this.velX -= this.accelerate;
			this.direction = 0;
		}
		if (this.velX < 0 && this.velX < -this.maxHorizontalVel) {
			this.velX = -this.maxHorizontalVel;
		} else if (this.velX > 0 && this.velX > this.maxHorizontalVel) {
			this.velX = this.maxHorizontalVel;
		}
		
		if (move.down) {
			this.velY += this.accelerate*2;
		}
		if (move.up) {
			this.velY -= this.accelerate*2;
		}
		if (this.velY < 0 && this.velY < -this.maxVerticalVel) {
			this.velY = -this.maxVerticalVel;
		} else if (this.velY > 0 && this.velY > this.maxVerticalVel) {
			this.velY = this.maxVerticalVel;
		}
		
		//shooting
		if (map[32] || map.Button4) {
			if (!this.shot) {
				defenderGame.projectiles.push(new defenderLaser((this.x * this.scale) + (defenderSprite0.width/2*this.scale),(this.y - 4) * this.scale + (defenderSprite0.height*this.scale) - 5,this.direction));
				this.shot = true;
			}
		} else {
			this.shot = false;
		}
	}
	applyMovement() {
		//check if changed direction
		if (this.direction != this.lastDirection) {
			this.changingDirection = true;
		}
		if (this.changingDirection) {
			this.changeDir();
			this.accelerate = 0.2;
		} else {
			this.accelerate = 0.376;
		}
		
		//simulating thrust from engine, player's speed can't be 0 or in the wrong direction!
		if (this.direction == 0 && this.velX > -this.minimalThrust && !this.idle) {
			this.velX -= this.breakThrust;
		} else if (this.direction == 1 && this.velX < this.minimalThrust && !this.idle) {
			this.velX += this.breakThrust;
		} 
		
		//apply velocities to change position
		this.y += this.velY;
		
		//apply some friction to the velocities:
		this.velY *= 0.96;
		this.velX *= 0.995;
	}
	changeDir() {
		if (this.direction == 0 && this.x < this.borderRight) {
			this.x += 10;
			defenderGame.cameraOffset -= 10 - this.velX;
		} else if (this.direction == 1 && this.x > this.borderLeft) {
			this.x -= 10;
			defenderGame.cameraOffset += 10 + this.velX;
		} else {
			this.changingDirection = false;
		}
	}
	draw() {
		ctx.save();
		ctx.scale(this.scale,this.scale);
		if (this.direction) {
			ctx.drawImage(defenderSprite1,this.x,this.y);
			//draw flame, idle or active
			if (move.right) {
				ctx.drawImage(defenderFlame1, 0, this.flameState*this.flameHeight + 3*this.flameHeight, this.flameWidth, this.flameHeight, this.x - this.flameWidth - 16, this.y + 16, this.flameWidth, this.flameHeight);
			} else {
				ctx.drawImage(defenderFlame1, 0, this.flameState*this.flameHeight, this.flameWidth, this.flameHeight, this.x - this.flameWidth - 16, this.y + 16, this.flameWidth, this.flameHeight);
			}
		} else {
			ctx.drawImage(defenderSprite0,this.x,this.y);
			if (move.left) {
				ctx.drawImage(defenderFlame0, 0, this.flameState*this.flameHeight + 3*this.flameHeight, this.flameWidth,this.flameHeight, this.x + defenderSprite1.width + 16, this.y + 16, this.flameWidth, this.flameHeight);
			} else {
				ctx.drawImage(defenderFlame0, 0, this.flameState*this.flameHeight, this.flameWidth,this.flameHeight, this.x + defenderSprite1.width + 16, this.y + 16, this.flameWidth, this.flameHeight);
			}
			
		}
		ctx.restore();
	}
	getFlameState() {
		if (this.flameTimer >= this.randomFlameTime) {
			this.flameTimer = 0;
			this.flameState = Math.floor(Math.random()*3);
			this.randomFlameTime = Math.floor(Math.random()*5);
		} else {
			this.flameTimer++;
		}
	}
}

class defenderLaser {
	constructor(x,y,dir) {
		this.x = x;
		this.startX = x;
		this.y = y;
		this.dir = dir;
		if (this.dir) {
			this.vel = 1;
		} else {
			this.vel = -1;
		}
		this.velX = 10;
		this.trailPoints = [];
		this.trailCount = Math.floor(Math.random() * 10) + 15;
		for (let i = 0; i < this.trailCount; i++) {
			var trailLength = Math.floor(Math.random() * 20) + 10;
			if (i == 0) {
				var startPoint = this.x; //first trailPoint (at end of standard projectile)
			} else {
				var startPoint = this.trailPoints[i-1].end;
			}
			var endPoint = startPoint - trailLength * this.vel;
			this.trailPoints.push({start:startPoint,end:endPoint,drawn:false});
		}
	}
	update() {
		this.move();
		this.draw();
	}
	move() {
		this.velX += 1.1;
		var movement = (this.velX * this.vel) - (defenderGame.cameraOffset - defenderGame.player.velX)
		this.x += movement;
		for (let i = 0; i < this.trailPoints.length; i++) {
			this.trailPoints[i].start += movement;
			this.trailPoints[i].end += movement;
		}
	}
	draw() {
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x + (100*this.vel),this.y);
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.beginPath();
		ctx.lineWidth = 2;
		for (let i = 0; i < this.trailPoints.length; i += 2) {
			//only draws part of the trail that should be drawn in
			if (!this.trailPoints[i].drawn) {
				if (this.trailPoints[i].start >= this.startX && this.dir) {
					ctx.moveTo(this.trailPoints[i].start,this.y);
					ctx.lineTo(this.trailPoints[i].end,this.y);
					ctx.stroke();
					this.trailPoints[i].drawn = true;
				} else if (this.trailPoints[i].start <= this.startX && !this.dir) {
					ctx.moveTo(this.trailPoints[i].start,this.y);
					ctx.lineTo(this.trailPoints[i].end,this.y);
					ctx.stroke();
					this.trailPoints[i].draw = true;
				}
			} else {
				ctx.moveTo(this.trailPoints[i].start,this.y);
					ctx.lineTo(this.trailPoints[i].end,this.y);
					ctx.stroke();
			}
		}
	}
}