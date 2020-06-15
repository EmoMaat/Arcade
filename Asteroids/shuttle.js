class shuttle {
	constructor(ctx, x,player,lifes,respawn) {
		this.ctx = ctx;
		this.x = x;
		this.y = window.height/2;
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

		this.lifes = lifes;
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
			this.toUpdate = false;
			this.velX = 0;
			this.velY = 0;
			this.x = window.width/2;
			this.y = window.height/2;
			this.respawnCounter++;
			if (this.respawnCounter > 50) {
				this.toUpdate = true;
				this.respawn = false;
				this.respawnCounter = 0;
				this.spawnProtection = true;
				this.radians = 0;
			}
		} else if (!this.respawn && !arcade.game.object.endRound) {
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

		if (this.x > window.width) {
			this.x = 0;
		}
		if (this.x < 0) {
			this.x = window.width;
		}
		if (this.y > window.height) {
			this.y = 0;
		}
		if (this.y < 0) {
			this.y = window.height;
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
				arcade.game.object.projectiles.push(new projectile(this.ctx, this.px,this.py,this.radians - Math.PI,true,0));
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
				arcade.game.object.projectiles.push(new projectile(this.ctx, this.px,this.py,this.radians - Math.PI,true,1));
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
		this.ctx.beginPath();
		this.ctx.lineTo(this.px,this.py);
		this.ctx.lineTo(this.px2,this.py2);
		this.ctx.lineTo(this.px3,this.py3);
		this.ctx.strokeStyle = this.color;
		this.ctx.lineWidth = 2;
		this.ctx.closePath();
		this.ctx.fillStyle = "#000";
		this.ctx.fill();
		this.ctx.stroke();

		//draw flame
		if (this.player == 0) {
			if (map[38] || map.axis2 == -1) {
				this.ctx.beginPath();
				this.ctx.lineTo(this.tpx,this.tpy);
				this.ctx.lineTo(this.tpx2,this.tpy2);
				this.ctx.lineTo(this.tpx3,this.tpy3);
				this.ctx.strokeStyle = "#fff";
				this.ctx.lineWidth = 2;
				this.ctx.closePath();
				this.ctx.fillStyle = "#fff";
				this.ctx.fill();
				this.ctx.stroke();
			}
		} else {
			if (map[87] || map.Button3) {
				this.ctx.beginPath();
				this.ctx.lineTo(this.tpx,this.tpy);
				this.ctx.lineTo(this.tpx2,this.tpy2);
				this.ctx.lineTo(this.tpx3,this.tpy3);
				this.ctx.strokeStyle = "#fff";
				this.ctx.lineWidth = 2;
				this.ctx.closePath();
				this.ctx.fillStyle = "#fff";
				this.ctx.fill();
				this.ctx.stroke();
			}
		}

	}
	handleLifeRewards() {
		if (arcade.game.object.gamemode == "" || arcade.game.object.gamemode == "versus") {
			this.rewardAmount = Math.floor(this.score / 8000);
		} else if (arcade.game.object.gamemode == "coop") {
			this.rewardAmount = Math.floor((arcade.game.object.shuttles[0].score + arcade.game.object.shuttles[1].score) / 8000);
		}
		if (this.rewardAmount > this.lifesAwarded) {
			this.lifes++;
			this.lifesAwarded++;
		}
	}
}



class projectile {
	constructor(ctx, x,y,radians,friendly,source) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
		this.radians = radians;
		this.friendly = friendly;
		this.source = source; //specifies from which player the projectile is from (to assign points)

		this.speed = 10;
		this.color = 255;
		this.dist = 0;
		this.oX = x;
		this.oY = y;
	}
	update() {
		//calculate how much it moves in two components:
		this.dx = this.speed * Math.cos(this.radians);
		this.dy = this.speed * Math.sin(this.radians);

		//add the distance (pythagoras) to the total distance traveled:
		this.dist += Math.sqrt(this.dx*this.dx + this.dy*this.dy);

		//update positions by the two components
		this.x += this.dx;
		this.y += this.dy;

		if (this.friendly) {
			if (this.dist > 500) {
				this.color -= 30;
			}
		} else {
			if (this.dist > 700) {
				this.color -= 30;
			}
		}
		if (this.color < 0) {
			this.del = true
		}

		if (this.x > window.width) {
			this.x = 0;
		}
		if (this.x < 0) {
			this.x = window.width;
		}
		if (this.y > window.height) {
			this.y = 0;
		}
		if (this.y < 0) {
			this.y = window.height;
		}
		this.draw();
	}
	draw() {
		this.px = this.x + 25*Math.cos(this.radians);
		this.py = this.y + 25*Math.sin(this.radians);
		this.ctx.beginPath();
		this.ctx.moveTo(this.x,this.y);
		this.ctx.lineTo(this.px,this.py);
		this.ctx.closePath();
		this.ctx.strokeStyle = "rgb("+this.color+","+this.color+","+this.color+")";
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	}
}