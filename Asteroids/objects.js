class shuttle {
	constructor(ctx, x,player,respawn) {
		this.ctx = ctx;
		this.x = x;
		this.y = window.height/2;
		this.radius = 30;

		this.thrust = 0.15
		this.turnSpeed = 0.09;
		this.radians = 0;
		this.velX = 0;
		this.velY = 0;

		this.outerThrustMultiplier = 0.5;
		this.extended = false;

		this.canFire = true;
		this.fireCounter = 0;

		this.respawn = respawn || false;
		this.spawnProtection = true;
		this.protectionCounter = 0;
		this.spawnCounter = 0;
		this.respawnCounter = 0;
		this.toUpdate = true;

		this.player = player;
	}
	update() {
		if (this.respawn) {
			this.respawnCounter++;
			if (this.respawnCounter > 50) {
				this.toUpdate = true;
				this.respawn = false;
			}
		} else {
			if (this.toUpdate) {
				this.handleMovement();
				this.handleFire();
				this.draw();
			} else {
				this.respawn();
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
				}
			break;
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
			if (this.canFire && (map[96] || map.Button4)) {
				arcade.game.object.projectiles.push(new projectile(this.ctx, this.px,this.py,this.radians - Math.PI,true));
				this.canFire = false;
			}
		} else {
			if (this.canFire && (map[32] || map.Button5)) {
				arcade.game.object.projectiles.push(new projectile(this.ctx, this.px,this.py,this.radians - Math.PI,true));
				this.canFire = false;
			}
		}

		if (!this.canFire) {
			this.fireCounter++;
			if (this.fireCounter > 30) {
				this.canFire = true;
				this.fireCounter = 0;
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
}
function soundPlay(src,volume) {
	this.sound = new Audio();
	this.sound.src = src;
	this.sound.volume = volume;
	this.sound.play();
}
var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
function segment_intersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return {x: x, y: y};
}

function randomNumber(min,max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomFloat(min,max) {
	return Math.random() * (max - min) + min;
}
function randomNegative(number) {
	if (randomNumber(1,3) == 2) {
		return -number;
	} else {
		return number;
	}
}

class asteroid {
	constructor(x,y,rad,speed,splitLvl) {
		this.x = x;
		this.y = y;
		this.radians = rad;
		this.speed = speed;
		this.splitLvl = splitLvl;
		this.radius = 20 + 15*this.splitLvl;
		this.rotate = 0;
		this.rotation = 0.01 + Math.random() * 0.04;//Math.random() / 25 + 0.001;

		this.size = 5 + this.splitLvl*2.5;
		this.points = [];
		this.sides = Math.floor(Math.random() * 8) + 12;
		for (let i = 0; i < this.sides; i++) {
			this.points.push(randomFloat(this.radius - this.size,this.radius + this.size));
		}
		this.angle = 2*Math.PI / this.sides;

		this.del = false;
	}
	update() {
		this.handleMovement();
		this.draw();
	}
	handleMovement() {
		this.velX = this.speed * Math.cos(this.radians);
		this.velY = this.speed * Math.sin(this.radians);
		this.x += this.velX;
		this.y += this.velY;

		this.rotate += this.rotation;

		if (this.x - this.radius > window.width) {
			this.x = 0;
		}
		if (this.x + this.radius < 0) {
			this.x = window.width;
		}
		if (this.y - this.radius > window.height) {
			this.y = 0;
		}
		if (this.y + this.radius < 0) {
			this.y = window.height;
		}
	}
	split() {
		if (this.splitLvl > 0) {
			arcade.game.object.asteroids.push(new asteroid(this.x,this.y,this.radians + 0.3,this.speed*1.1,this.splitLvl - 1));
			arcade.game.object.asteroids.push(new asteroid(this.x,this.y,this.radians - 0.3,this.speed*1.1,this.splitLvl - 1));
		}
		this.del = true;
	}
	draw() {
		this.ctx.beginPath();
		for (let i = 0; i < this.points.length; i++) {
			this.newPosX = this.x + this.points[i] * Math.cos(this.angle*i+this.rotate);
			this.newPosY = this.y + this.points[i] * Math.sin(this.angle*i+this.rotate);
			this.ctx.lineTo(this.newPosX,this.newPosY);
		}
		this.ctx.fillStyle = "#000";
		this.ctx.fill();
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = 2;
		this.ctx.closePath();
		this.ctx.stroke();
	}
}

class projectile {
	constructor(x,y,radians,friendly) {
		this.x = x;
		this.y = y;
		this.radians = radians;
		this.friendly = friendly;
		this.speed = 10;
		this.color = 255;
		this.dist = 0;
		this.oX = x;
		this.oY = y;
	}
	update() {
		this.x += this.speed * Math.cos(this.radians);
		this.y += this.speed * Math.sin(this.radians);

		this.dx = this.x - this.oX;
		this.dy = this.y - this.oY;
		this.dist = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
		if (this.friendly) {
			if (this.dist > 500) {
				this.color -= 30;
			}
		} else {
			if (this.dist > 900) {
				this.color -= 30;
			}
		}
		if (this.color < 0) {
			this.del = true
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