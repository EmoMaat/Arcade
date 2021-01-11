var aliens = [];
function alien1Obj(x,y) {
	this.startX = x;
	this.startY = y;
	this.radius = (65+46)/4 + 3;
	this.award = 20;
	this.update = function() {
		this.x = this.startX + alienMove;
		this.y = y + alienVertical;
		this.centerX = this.x + alien1.width/2;
		this.centerY = this.y + alien1.height/4;
		ctx.drawImage(alien1,0,alienSy,65,46,this.x,this.y,65,46);
	}
}
function alien2Obj(x,y) {
	this.startX = x;
	this.startY = y;
	this.radius = (75+46)/4 + 5;
	this.award = 10;
	this.update = function() {
		this.x = this.startX + alienMove;
		this.y = y + alienVertical;
		this.centerX = this.x + alien2.width/2 - 2.5;
		this.centerY = this.y + alien2.height/4;
		ctx.drawImage(alien2,0,alienSy,75,46,this.x,this.y,70,46);
	}
}
function alien3Obj(x,y) {
	this.startX = x;
	this.startY = y;
	this.radius = (46+46)/4 + 3;
	this.award = 40;
	this.update = function() {
		this.x = this.startX + alienMove;
		this.y = y + alienVertical;
		this.centerX = this.x + alien2.width/2 - 14 + 8;
		this.centerY = this.y + alien2.height/4;
		ctx.drawImage(alien3,0,alienSy,46,46,this.x + 8,this.y,46,46);;
	}
}

function cannonObj() {
	this.x = 1920/2 - cannonImg.width/2;
	this.y = 1080 - 100;
	this.fired = false;
	this.laserProjectile = null;
	this.livesX = 0;
	this.lives = 3;
	this.hit = false;
	this.hitCounter = 0;
	this.hitSy = 0;
	this.toDraw = true;
	this.update = function() {
		this.centerX = this.x + cannonImg.width/2;
		this.centerY = this.y + cannonImg.height;
		this.handleShooting();
		if (map.axis1 == -1 && this.x + cannonImg.width < 1920 && !this.hit) {
			this.x += 2;
		}
		if (map.axis1 == 1 && this.x > 0 && !this.hit) {
			this.x -= 2;
		}
		if (!this.hit) {
			ctx.drawImage(cannonImg,this.x,this.y);
		} else {
			explosionSound.play();
			if (this.hitCounter < 200) {
				this.hitCounter++;
				if (this.toDraw) {
					ctx.drawImage(cannon_explosion,0,this.hitSy,83,55,this.x,this.y,83,55);
				}
				if (this.hitCounter % 20 == 0) {
					if (this.hitSy < 2*(cannonImg.height-3)) {
						this.hitSy += cannonImg.height - 3;
					} else {
						this.hitSy = 0;
					}
				}
			}
			if (this.hitCounter < 250 && this.hitCounter >= 200) {
				this.hitCounter++;
				this.toDraw = false;
			} else if (this.hitCounter >= 250) {
				this.toDraw = true;
				this.hit = false;
				this.x = canvas.width/2;
				this.hitCounter = 0;
			}
		}
	}
	this.handleShooting = function() {
		if (!this.fired && map.Button2 && !this.hit) {
			this.laserProjectile = new laserProjectileObj(this.x + cannonImg.width/2,this.y);
			this.fired = true;
			shootSound.play();
		}
		if (!this.fired) {
			this.laserProjectile = null;
		}
		if (this.laserProjectile != null) {
			this.laserProjectile.update();
			if (this.laserProjectile.y < -25) {
				this.laserProjectile = null;
				this.fired = false;
			}
		}
		if (this.laserProjectile != null) {
			for (i = 0; i < aliens.length; i++) {
				this.dx = aliens[i].centerX - this.laserProjectile.x;
				this.dy = aliens[i].centerY - this.laserProjectile.y;
				this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
				if (this.distance < aliens[i].radius) {
					invadersScore += aliens[i].award;
					aliens.splice(i,1);
					invaderKilled.play();
					if (gameSpeed > 35) {
						gameSpeed -= 1.57;
					}
					this.fired = false;
					this.laserProjectile = null;
					break;
				}
			}
		}
	}
}
var cannon = new cannonObj();

function bunkerBlock(x,y,img,rotate) {
	this.x = x;
	this.y = y;
	this.sy = 0;
	this.update = function() {
		this.centerX = this.x + 15;
		this.centerY = this.y + 15;
		if (cannon.laserProjectile != null) {
			this.dx = this.centerX - cannon.laserProjectile.x;
			this.dy = this.centerY - cannon.laserProjectile.y;
			this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
			if (this.distance < 20 && this.sy < 150) {
				this.sy += 30;
				cannon.laserProjectile = null;
				cannon.fired = false;
			}
		}
		ctx.save();
		if (img === bunker_block_slanted) {
			ctx.translate(this.x + 15,this.y + 15);
			ctx.rotate((0.5*Math.PI)*rotate);
			ctx.drawImage(img,0,this.sy,30,30,-15,-15,30,30);
		} else {
			ctx.drawImage(img,0,this.sy,30,30,this.x,this.y,30,30);
		}
		ctx.restore();
	}
}

var bunkerOffset = -50;
for (let i = 0; i < 5; i++) {
	bunkers.push(new bunkerBlock(300 + bunkerOffset,1080 - 230,bunker_block));
	bunkers.push(new bunkerBlock(300 + bunkerOffset,1080 - 260,bunker_block));
	bunkers.push(new bunkerBlock(300 + bunkerOffset,1080 - 290,bunker_block_slanted,2));
	bunkers.push(new bunkerBlock(360 + bunkerOffset,1080 - 290,bunker_block));
	bunkers.push(new bunkerBlock(330 + bunkerOffset,1080 - 290,bunker_block));
	bunkers.push(new bunkerBlock(390 + bunkerOffset,1080 - 290,bunker_block_slanted,3));
	bunkers.push(new bunkerBlock(390 + bunkerOffset,1080 - 260,bunker_block));
	bunkers.push(new bunkerBlock(390 + bunkerOffset,1080 - 230,bunker_block));
	bunkers.push(new bunkerBlock(360 + bunkerOffset,1080 - 260,bunker_block_slanted,1));
	bunkers.push(new bunkerBlock(330 + bunkerOffset,1080 - 260,bunker_block_slanted,0));
	bunkerOffset += 345;
}


function laserProjectileObj(x,y) {
	this.x = x;
	this.y = y;
	this.update = function() {
		this.y -= 5;
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x,this.y - 25);
		ctx.closePath();
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}
var alienX = 500;
if (wave <= 4) {
	var alienY = 500 + ((wave-1) * 30);
	var alienAmount = 4 + wave;
} else {
	var alienY = 500 + ((wave-1) * 30);
	var alienAmount = 8;
}

function resetAlienPos() {
	var alienX = 500;
	if (wave <= 4) {
		alienY = 500 + ((wave-1) * 40);
		alienAmount = 4 + wave;
	} else {
		alienY = 500 + ((wave-1) * 40);
		alienAmount = 8;
	}
	alienVertical = 0;
	alienMove = 0;
	gameSpeed = 120;
	alienType = 2;
}


var alienType = 2;
var alienImg = alien1;

function spawnAliens() {
	for (let u = 0; u < alienAmount; u++) {
		for (let i = 0; i < 11; i++) {
			switch (alienType) {
				case 1:
					aliens.push(new alien1Obj(alienX,alienY,alienImg));
				break;
				case 2:
					aliens.push(new alien2Obj(alienX,alienY,alienImg));
				break;
				case 3:
					aliens.push(new alien3Obj(alienX,alienY,alienImg));
				break;
			}
			
			alienX += 85;
		}
			if (wave <= 2) {
				if (u == 1) {
					alienType = 1;
				}
				if (u == 3) {
					alienType = 3;
				}
			} else if (wave >= 3) {
				if (u == 1) {
					alienType = 1
				}
				if (u == 4) {
					alienType = 3;
				}
			}
		alienY -= 80;
		alienX = 500;
	}
}
spawnAliens();
