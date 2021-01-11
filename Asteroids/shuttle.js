class shuttle {
	constructor(x,player,lifes,respawn) {
		this.x = x;
		this.y = canvas.height/2;
		this.radius = 30;
		
		this.thrust = 0.15
		this.turnSpeed = 0.09;
		this.radians = 0;
		this.velX = 0;
		this.velY = 0;
		this.thrusting = false;
		
		this.outerThrustMultiplier = 0.5;
		this.extended = false;
		
		this.canFire = true;
		this.startFireCounter = false;
		this.fireCounter = 0;
		
		this.lifes = 0;
		this.respawn = respawn || false;
		this.spawnProtection = true;
		this.protectionCounter = 0;
		this.spawnCounter = 0;
		this.respawnCounter = 0;
		this.toUpdate = true;
		
		this.score = 0;
		this.player = player;
		this.lifesAwarded = 0;
	}
	update() {
		if (this.respawn) {
			if (this.lifes >= 0) {
				this.toUpdate = false;
				this.velX = 0;
				this.velY = 0;
				this.x = canvas.width/2;
				this.y = canvas.height/2;
				this.respawnCounter++;
				if (this.respawnCounter > 50) {
					this.toUpdate = true;
					this.respawn = false;
					this.respawnCounter = 0;
					this.spawnProtection = true;
					this.radians = 0;
				}	
			} else {
				this.toUpdate = false;
			}
			
		} else if (!this.respawn && !asteroidsGame.endRound) {
			if (this.toUpdate) {
				this.handleMovement();
				this.handleFire();
				this.draw();
				this.handleLifeRewards();
			} else {
				// this.respawn();
			}
		}
	}
	handleMovement() {
		switch(this.player) {
			case 0:
				if (map[39] || map.axis1 == -1) {
					this.radians += this.turnSpeed;
				}
				if (map[37] || map.axis1 == 1) {
					this.radians -= this.turnSpeed;
				}
				if (map[38] || map.axis2 == -1) {
					this.velX += this.thrust * Math.cos(this.radians);
					this.velY += this.thrust * Math.sin(this.radians);
					this.thrusting = true;
				}
			break;
			case 1:
				if (map[68] || map.Button1) {
					this.radians += this.turnSpeed;
				}
				if (map[65] || map.Button2) {
					this.radians -= this.turnSpeed;
				}
				if (map[87] || map.Button3) {
					this.velX += this.thrust * Math.cos(this.radians);
					this.velY += this.thrust * Math.sin(this.radians);
					this.thrusting = true;
				}
			break;
		}
		if (!(map[87] || map.Button3) && !(map[38] || map.axis2 == -1)) {
			this.thrusting = false;
		}
		
		this.x -= this.velX;
		this.y -= this.velY;
		this.velX *= 0.994;
		this.velY *= 0.994;
		
		if (this.x > canvas.width) {
			this.x = 0;
		}
		if (this.x < 0) {
			this.x = canvas.width;
		}
		if (this.y > canvas.height) {
			this.y = 0;
		}
		if (this.y < 0) {
			this.y = canvas.height;
		}
		if (this.spawnProtection) {
			this.spawnCounter++;
			if (this.spawnCounter > 100 && this.spawnProtection) {
				this.spawnProtection = false;
				this.spawnCounter = 0;
			}
		}
	}
	handleFire() {
		if (this.player == 0) {
			if (this.canFire && (map[16] || map.Button4)) {
				asteroidsGame.projectiles.push(new projectile(this.px,this.py,this.velX,this.velY,this.radians - Math.PI,true,0));
				this.canFire = false;
				astFire.currentTime = 0;
				astFire.play();
			}
			if (!map[16] && !map.Button4) {
				this.canFire = true;
			} else {
				this.canFire = false;
			}
		} else {
			if (this.canFire && (map[32] || map.Button5)) {
				asteroidsGame.projectiles.push(new projectile(this.px,this.py,this.velX,this.velY,this.radians - Math.PI,true,1));
				this.canFire = false;
				astFire.currentTime = 0;
				astFire.play();
			}
			if (!map[32] && !map.Button5) {
				this.canFire = true;
			} else {
				this.canFire = false;
			}
		}
	}
	draw() {
		//calculate points for triangle as shuttle
		this.px = this.x - 40 * Math.cos(this.radians);
		this.py = this.y - 40 * Math.sin(this.radians);
		this.px2 = this.x - 30 * Math.cos(this.radians + (2*Math.PI)/3);
		this.py2 = this.y - 30 * Math.sin(this.radians + (2*Math.PI)/3);
		this.px3 = this.x - 30 * Math.cos(this.radians + 2*(2*Math.PI)/3);
		this.py3 = this.y - 30 * Math.sin(this.radians + 2*(2*Math.PI)/3);
		
		//add flame extending
		if (this.outerThrustMultiplier <= 1.5 && !this.extended) {
			this.outerThrustMultiplier += 0.1;
		}
		if (this.outerThrustMultiplier > 1.4) {
			this.extended = true;
		}
		if (this.outerThrustMultiplier > 1 && this.extended) {
			this.outerThrustMultiplier -= 0.1;
		}
		if (this.outerThrustMultiplier <= 1) {
			this.extended = false;
		}
		//calculate points for flame
		this.tpx = this.x - (20*this.outerThrustMultiplier) * Math.cos(this.radians - Math.PI)+ Math.cos(this.radians)*20;
		this.tpy = this.y - (20*this.outerThrustMultiplier) * Math.sin(this.radians - Math.PI)+ Math.sin(this.radians)*20;
		this.tpx2 = this.x - 10 * Math.cos(this.radians + (2*Math.PI)/3) + Math.cos(this.radians)*20;
		this.tpy2 = this.y - 10 * Math.sin(this.radians + (2*Math.PI)/3)+ Math.sin(this.radians)*20;
		this.tpx3 = this.x - 10 * Math.cos(this.radians + 2*(2*Math.PI)/3)+ Math.cos(this.radians)*20;
		this.tpy3 = this.y - 10 * Math.sin(this.radians + 2*(2*Math.PI)/3)+ Math.sin(this.radians)*20;
		
		if (this.spawnProtection) {
			this.protectionCounter++;
			if (this.protectionCounter >= 10) {
				this.color = "#666";
			} if (this.protectionCounter >= 20) {
				this.color = "#fff";
				this.protectionCounter = 0;
			}
		}
		
		//draw shuttle
		ctx.beginPath();
		ctx.lineTo(this.px,this.py);
		ctx.lineTo(this.px2,this.py2);
		ctx.lineTo(this.px3,this.py3);
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;
		ctx.closePath();
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.stroke();
		
		//draw flame
		if (this.player == 0) {
			if (map[38] || map.axis2 == -1) {
				ctx.beginPath();
				ctx.lineTo(this.tpx,this.tpy);
				ctx.lineTo(this.tpx2,this.tpy2);
				ctx.lineTo(this.tpx3,this.tpy3);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 2;
				ctx.closePath();
				ctx.fillStyle = "#fff";
				ctx.fill();
				ctx.stroke();
			}
		} else {
			if (map[87] || map.Button3) {
				ctx.beginPath();
				ctx.lineTo(this.tpx,this.tpy);
				ctx.lineTo(this.tpx2,this.tpy2);
				ctx.lineTo(this.tpx3,this.tpy3);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 2;
				ctx.closePath();
				ctx.fillStyle = "#fff";
				ctx.fill();
				ctx.stroke();
			}
		}
		
	}
	handleLifeRewards() {
		if (asteroidsGame.gamemode == "" || asteroidsGame.gamemode == "versus") {
			this.rewardAmount = Math.floor(this.score / 8000);
		} else if (asteroidsGame.gamemode == "coop") {
			this.rewardAmount = Math.floor((asteroidsGame.shuttles[0].score + asteroidsGame.shuttles[1].score) / 8000);
		}
		if (this.rewardAmount > this.lifesAwarded) {
			this.lifes++;
			this.lifesAwarded++;
		}
	}
}



class projectile {
	constructor(x,y,parentVelX,parentVelY,radians,friendly,source) {
		this.x = x;
		this.y = y;
		this.radians = radians;
		this.friendly = friendly;
		this.source = source; //specifies from which player the projectile is from (to assign points)
		this.parentVelX = parentVelX;
		this.parentVelY = parentVelY;
		
		this.timer = 0; //timer for deleting the projectile after a while
		this.speed = 10;
		this.color = 255;
		this.dist = 0;
		this.oX = x;
		this.oY = y;
	}
	update() {
		//calculate how much it moves in two components:
		this.dx = this.speed * Math.cos(this.radians) - this.parentVelX*0.65;
		this.dy = this.speed * Math.sin(this.radians) - this.parentVelY*0.65;
		
		this.timer++;
		
		//update positions by the two components
		this.x += this.dx;
		this.y += this.dy;
		
		if (this.friendly) {
			if (this.timer > 35) {
				this.color -= 30;
			}
		} else {
			if (this.timer > 45) {
				this.color -= 30;
			}
		}
		if (this.color < 0) {
			this.del = true
		}
		
		if (this.x > canvas.width) {
			this.x = 0;
		}
		if (this.x < 0) {
			this.x = canvas.width;
		}
		if (this.y > canvas.height) {
			this.y = 0;
		}
		if (this.y < 0) {
			this.y = canvas.height;
		}
		this.draw();
	}
	draw() {
		this.px = this.x + 25*Math.cos(this.radians);
		this.py = this.y + 25*Math.sin(this.radians);
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.px,this.py);
		ctx.closePath();
		ctx.strokeStyle = "rgb("+this.color+","+this.color+","+this.color+")";
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}
