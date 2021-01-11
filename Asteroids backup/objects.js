function asteroid(x,y,deg,radius,split) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.sides = randomNumber(12,20);
	this.rotate = 0;
	this.angle = ((2 * Math.PI) / this.sides);
	this.circles = [];
	this.rotateAmount = randomNumber(3,7) / 100;
	this.degrees = deg;
	this.radians = this.degrees * Math.PI/180;
	this.velX = Math.cos(this.radians) * randomNumber(2,7);
	this.velY = Math.sin(this.radians) * randomNumber(2,7);
	this.toUpdate = true;
	this.split = split;
	if (randomNumber(1,3) == 1) {
		this.velX = -this.velX;
	}
	if (randomNumber(1,3) == 1) {
		this.velY = -this.velY;
	}
	for (i = 0; i < this.sides; i++) {
		this.circles.push(randomNumber(this.radius - 10,this.radius + 10));
	}
	this.update = function() {
		if (this.toUpdate == true) {
			this.rotate += this.rotateAmount;
			this.x += this.velX;
			this.y += this.velY;
			if (this.x - this.radius > canvas.width) {
				this.x = 0;
			}
			if (this.x + this.radius < 0) {
				this.x = canvas.width;
			}
			if (this.y - this.radius > canvas.height) {
				this.y = 0;
			}
			if (this.y + this.radius < 0) {
				this.y = canvas.height;
			}
		}
	}
	this.draw = function() {
		if (this.toUpdate == true) {
			ctx.beginPath();
			for (d = 0; d < this.sides; d++) {
				this.newPosX = this.x + this.circles[d] * Math.cos(this.angle*d+this.rotate);
				this.newPosY = this.y + this.circles[d] * Math.sin(this.angle*d+this.rotate);
				ctx.lineTo(this.newPosX,this.newPosY);
			}
			ctx.fillStyle = "#000";
			ctx.fill();
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2;
			ctx.closePath();
			ctx.stroke();
		}
	}
}

function ufoObj(menu) {
	if (randomNumber(1,3) == 2) {
		this.x = 0;
		this.random = "+";
	} else {
		this.x = canvas.width;
		this.random = "-";
	}
	this.y = randomNumber(60,canvas.height - 60);
	this.xMax = this.x + 70;
	this.yMax = this.y + 70;
	this.center = {x: this.x + 35, y: this.y + 35};
	this.rotation = 0;
	this.turn = true;
	this.radians = this.rotation;
	this.shootCounter = 0;
	this.toUpdate = true;
	this.update = function() {
		if (this.toUpdate) {
			this.xMax = this.x + 70;
			this.yMax = this.y + 70;
			this.center = {x: this.x + 35, y: this.y + 35};
			eval("this.x += " + this.random + "3"); //3
			if (this.rotation < 20 && this.turn) {
				this.rotation++;
			} else {
				this.turn = false;
			}
			if (this.rotation > -20 && !this.turn) {
				this.rotation--;
			} else {
				this.turn = true;
			}
			this.radians = this.rotation * Math.PI/180;
			this.shootCounter++;
			if (this.shootCounter > 100) {
				this.fire();
				this.shootCounter = 0;
			}
			if (this.random == "+") {
				if (this.x > canvas.width + 20) {
					ufos.splice(0,1);
				}
			} else {
				if (this.xMax < -20) {
					ufos.splice(0,1);
				}
			}
		}
	}
	this.fire = function() {
		if (this.toUpdate) {
			soundPlay('Asteroids/src/ufo_shot.wav',1);
			if (menu && menuAsteroids.length >= 1) {
				this.randomIndex = randomNumber(0,menuAsteroids.length-1);
				projectiles.push(new projectile(this.center.x,this.center.y,menuAsteroids[this.randomIndex].x,menuAsteroids[this.randomIndex].y,10,1500,false,0));
			} else if (!menu) {
				projectiles.push(new projectile(this.center.x,this.center.y,player.x,player.y,10,1500,false,0));
			}
		}
	}
	this.draw = function() {
		if (this.toUpdate) {
			ctx.beginPath();
			ctx.save();
			ctx.translate(this.center.x,this.center.y);
			ctx.rotate(this.radians);
			ctx.moveTo(-35,0);
			ctx.lineTo(35,0);
			ctx.closePath();
			ctx.strokeStyle = "rgba(255,255,255,1)";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
			ctx.save();
			ctx.beginPath();
			ctx.translate(this.center.x,this.center.y);
			ctx.rotate(this.radians);
			eval("ctx.arc(0" + this.random + 0 + ",0,22,Math.PI,2*Math.PI)");
			ctx.closePath();
			ctx.strokeStyle = "rgba(255,255,255,1)";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
			ctx.save();
			ctx.translate(this.center.x,this.center.y);
			ctx.rotate(this.radians);
			ctx.strokeStyle = "rgba(255,255,255,1)";
			ctx.lineWidth = 2;
			eval("ctx.strokeRect(-17.5" + this.random + 0 + ",0,35,7)");
			ctx.restore();
		}
	}
}

function shuttle() {
	this.x = canvas.width/2;
	this.y = canvas.height/2;
	this.radius = 30;
	this.sides = 3;
	this.angle = (2*Math.PI) / this.sides;
	this.rotate = 0;
	this.thrust = 0.15;
	this.faceAngle = 0;
	this.testangle = 180;
	this.turnspeed = 5;
	this.velX = 0;
	this.velY = 0;
	this.fire = false;
	this.canFire = true;
	this.lifes = -1;
	this.hit = false;
	this.spawnCount = 0;
	this.toUpdate = true;
	this.score = 585;
	this.shots = 1;
	this.maxOffset = 25;
	this.fireRate = 25;
	this.fireCounter = 0;
	this.thrustVolume = 0;
	this.thrustSoundPlaying = false;
	this.thrustSound = new Audio();
	// this.thrustSound.src = "Asteroids/src/shuttle_thrust.wav";
	this.outerThrustMultiplier = 1;
	this.extended = false;
	this.update = function() {
		if (this.toUpdate) {
			setThrustVolume();
			this.fireCounter++;
			if (this.fireCounter > this.fireRate) {
				this.canFire = true;
			}
			if (map.axis1 == 1 || map[37]) {
				this.rotate += 2;
				this.testangle -= this.turnspeed;
			}
			if (map.axis1 == -1 || map[39]) {
				this.rotate -= 2;
				this.testangle += this.turnspeed
			}
			if ((map.Button2 == true || map[32]) && player.canFire == true) {
				player.fire = true;
				player.fireCounter = 0;
			}
			this.testradians = this.testangle/180*Math.PI;
			if (map.Button0 == true || map[38]) {
				this.velX += this.thrust * Math.cos(this.testradians);
				this.velY += this.thrust * Math.sin(this.testradians);
				if (this.thrustSound.currentTime > 9) {
					this.thrustSound.currentTime = 0;
				}
				if (!this.thrustSoundPlaying) {
					this.thrustSoundPlaying = true;
					this.thrustSound.play();
				}
				
			}
			if (!map.Button0 == true || map[38]) {
				this.thrustSoundPlaying = false;
				this.thrustSound.pause();
			}
			if (this.fire == true && this.canFire == true) {
				this.canFire = false;
				if (this.shots > 1) {
					this.offset = this.maxOffset;
				} else {
					this.offset = 0;
				}
				for (i = 0; i < player.shots; i++) {
					this.shotDegrees = this.testradians * 180/Math.PI + this.offset;
					projectiles.push(new projectile(this.px,this.py,0,0,10,500,true,this.shotDegrees*Math.PI/180));
					this.offset -= this.maxOffset * 2 / this.shots;
				}
				soundPlay('Asteroids/src/shot.wav',0.5);
				this.fire = false;
			}
			this.px = this.x - 40 * Math.cos(this.testradians);
			this.py = this.y - 40 * Math.sin(this.testradians);
			this.px2 = this.x - 30 * Math.cos(this.testradians + (2*Math.PI)/3);
			this.py2 = this.y - 30 * Math.sin(this.testradians + (2*Math.PI)/3);
			this.px3 = this.x - 30 * Math.cos(this.testradians + 2*(2*Math.PI)/3);
			this.py3 = this.y - 30 * Math.sin(this.testradians + 2*(2*Math.PI)/3);
			
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
			this.tpx = this.x - (20*this.outerThrustMultiplier) * Math.cos(this.testradians - Math.PI)+ Math.cos(this.testradians)*20;
			this.tpy = this.y - (20*this.outerThrustMultiplier) * Math.sin(this.testradians - Math.PI)+ Math.sin(this.testradians)*20;
			this.tpx2 = this.x - 10 * Math.cos(this.testradians + (2*Math.PI)/3) + Math.cos(this.testradians)*20;
			this.tpy2 = this.y - 10 * Math.sin(this.testradians + (2*Math.PI)/3)+ Math.sin(this.testradians)*20;
			this.tpx3 = this.x - 10 * Math.cos(this.testradians + 2*(2*Math.PI)/3)+ Math.cos(this.testradians)*20;
			this.tpy3 = this.y - 10 * Math.sin(this.testradians + 2*(2*Math.PI)/3)+ Math.sin(this.testradians)*20;
			
			this.x -= this.velX;
			this.y -= this.velY;
			if (this.x - this.radius > canvas.width) {
				this.x = 0;
			}
			if (this.x + this.radius < 0) {
				this.x = canvas.width;
			}
			if (this.y - this.radius > canvas.height) {
				this.y = 0;
			}
			if (this.y + this.radius < 0) {
				this.y = canvas.height;
			}
			this.velX *= 0.994;
			this.velY *= 0.994;
		}
	}
	this.draw = function() {
		if (this.toUpdate) {
			if (map.Button0 == true  || map[38]) {
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
			
			ctx.beginPath();
			ctx.lineTo(this.px,this.py);
			ctx.lineTo(this.px2,this.py2);
			ctx.lineTo(this.px3,this.py3);
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2;
			ctx.closePath();
			ctx.fillStyle = "#000";
			ctx.fill();
			ctx.stroke();
		}
	}
}
var player = new shuttle;

function projectile(x,y,tx,ty,speed,dist,friendly,rad) {
	this.x = x;
	this.y = y;
	this.width = 5;
	this.length = 25;
	this.radius = 5;
	if (friendly) {
		this.rad = rad;
	} else {
		this.rad = Math.atan2(this.y - ty,this.x - tx);
	}
	this.alpha = 1;
	this.velX = speed * Math.cos(this.rad);
	this.velY = speed * Math.sin(this.rad);
	this.dist = 0;
	this.toUpdate = true;
	this.friendly = friendly;
	this.update = function() {
		if (this.toUpdate == true) {
			this.x -= this.velX;
			this.y -= this.velY;
			this.px = this.x - this.length * Math.cos(this.rad);
			this.py = this.y - this.length * Math.sin(this.rad);
			this.dist += Math.abs(this.velX) + Math.abs(this.velY);
			if (this.dist > dist) {
				this.alpha -= 0.1;
			}
			if (this.alpha <= 0) {
				this.toUpdate = false;
			}
			if (this.x - this.radius > canvas.width) {
				this.x = 0;
				this.px = this.x - this.length;
			}
			if (this.x + this.radius < 0) {
				this.x = canvas.width;
				this.px = this.x + this.length;
			}
			if (this.y - this.radius > canvas.height) {
				this.y = 0;
				this.py = this.y - this.length;
			}
			if (this.y + this.radius < 0) {
				this.y = canvas.height;
				this.py = this.y + this.length;
			}
		}
	}
	this.draw = function() {
		ctx.strokeStyle = "rgba(255,255,255," + this.alpha + ")";
		ctx.lineWidth = 3;
		ctx.moveTo(this.px,this.py);
		ctx.lineTo(this.x,this.y);
		ctx.closePath();
		ctx.stroke();
	}
}

function pickup(type) {
	this.x = randomNumber(20,canvas.width - 20);
	this.y = randomNumber(20,canvas.height - 20);
	this.radius = 15;
	this.type = type;
	this.draw = function() {
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,255,255,1)";
		ctx.stroke();
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		if (type == "health") {
			ctx.font = "25px verdana";
			ctx.fillText("+",this.x,this.y + 8);
		} else {
			ctx.font = "18px verdana";
			ctx.fillText("\\|/",this.x,this.y + 8);
		}
	}
}