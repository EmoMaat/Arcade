function missileBattery(x,y) {
	this.missiles = 10;
	this.sprite = new Image();
	this.sprite.src = "Missile_Command/src/rocket.png";
	this.x = x;
	this.y = y;
	this.centerX = this.x + 17;
	this.centerY = this.y - 55;
	this.nextPos = {x: this.x, y: this.y};
	this.targetType = "battery";
	this.destroyed = false;
	this.soundPlayed = false;
	
	this.update = function() {
		for (let i = 0; i < (this.missiles); i++) {
			if (i == 0 && i < 1) {
				this.nextPos.x = this.x + this.sprite.width/2;
				this.nextPos.y = this.y - 50;
			}
			if (i >= 1 && i < 3) {
				this.nextPos.x = this.x + i*this.sprite.width*1.2 - this.sprite.width*1.3;
				this.nextPos.y = this.y - 35;	
			}
			if (i >= 3 && i < 6) {
				this.nextPos.x = this.x + i*this.sprite.width*1.2 - this.sprite.width*4.3;
				this.nextPos.y = this.y - 20;
			}
			if (i >= 6 && i < 10) {
				this.nextPos.x = this.x + i*this.sprite.width*1.2 - this.sprite.width*8.5;
				this.nextPos.y = this.y - 5;
			}
			ctx.drawImage(this.sprite,this.nextPos.x,this.nextPos.y,this.sprite.width/1.5,this.sprite.height/1.5);
		}
		
		if (!missileCommandGame.endRound) {
			if (this.missiles <= 3 && this.missiles > 0) {
				ctx.textAlign = "left";
				ctx.font = "bold 35px segoe ui";
				ctx.fillStyle = "#000";
				ctx.fillText("LOW",this.x - 20,this.y + 20);
				if (!this.soundPlayed) {
					soundPlay("Missile_Command/src/sounds/low.mp3",1);
					this.soundPlayed = true;
				}
			}
			if (this.missiles == 0) {
				ctx.textAlign = "left";
				ctx.font = "bold 35px segoe ui";
				ctx.fillStyle = "#000";
				ctx.fillText("OUT",this.x - 20,this.y + 20);
			}
		}
	}
}

function city(x,y,destroyed) {
	this.x = x;
	this.y = y;
	this.centerX = this.x + (125/2);
	this.centerY = this.y;
	this.destroyed = destroyed || false;
	this.targetType = "city";
	
	this.update = function() {
		if (!this.destroyed) {
			ctx.beginPath();
			ctx.moveTo(this.x,this.y);
			ctx.lineTo(this.x,this.y - 20);
			ctx.lineTo(this.x + 5,this.y - 25);
			ctx.lineTo(this.x + 5,this.y - 35);
			ctx.lineTo(this.x + 10,this.y - 60);
			ctx.lineTo(this.x + 15,this.y - 35);
			ctx.lineTo(this.x + 15,this.y - 15);
			ctx.lineTo(this.x + 25,this.y - 15);
			ctx.lineTo(this.x + 25,this.y - 40);
			ctx.lineTo(this.x + 30,this.y - 40);
			ctx.lineTo(this.x + 30,this.y - 70);
			ctx.lineTo(this.x + 45,this.y - 70);
			ctx.lineTo(this.x + 45,this.y - 30);
			ctx.quadraticCurveTo(this.x + 52,this.y - 18, this.x + 59, this.y - 30);
			ctx.lineTo(this.x + 59, this.y - 40);
			ctx.lineTo(this.x + 72,this.y - 65);
			ctx.lineTo(this.x + 72,this.y - 15);
			ctx.quadraticCurveTo(this.x + 76.5, this.y - 4, this.x + 82, this.y - 15);
			ctx.lineTo(this.x + 82,this.y - 45);
			ctx.lineTo(this.x + 90, this.y - 27);
			ctx.lineTo(this.x + 90, this.y - 8);
			ctx.lineTo(this.x + 97, this.y - 8);
			ctx.lineTo(this.x + 97, this.y - 35);
			ctx.lineTo(this.x + 101, this.y - 35);
			ctx.lineTo(this.x + 101, this.y - 55);
			ctx.lineTo(this.x + 110, this.y - 55);
			ctx.lineTo(this.x + 110, this.y - 35);
			ctx.lineTo(this.x + 114, this.y - 35);
			ctx.lineTo(this.x + 125, this.y - 0);
			ctx.lineTo(this.x + 125, this.y + 20);
			ctx.lineTo(this.x,this.y + 20);
			ctx.lineTo(this.x,this.y);
			ctx.closePath();
			ctx.fillStyle = "#fff";
			ctx.fill();
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000";
			ctx.stroke();
		}
	}
}

class plane {
	constructor(x,y,dir) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.sprite = new Image();
		this.sprite.src = "Missile_Command/src/plane.png";
		this.centerX = this.x + (this.sprite.width/2) - 5;
		this.centerY = this.y + 37;
	}
	
	update() {
		if (this.dir) {
			this.x += 1.1 * missileCommandGame.speedMultiplier;
			ctx.save();
			ctx.translate(this.x,this.y);
			ctx.scale(1,1);
			this.centerX = this.x + (this.sprite.width/2) - 5;
		} else if (!this.dir) {
			this.x -= 1.1 * missileCommandGame.speedMultiplier;
			ctx.save();
			ctx.translate(this.x,this.y);
			ctx.scale(-1,1);
			this.centerX = this.x + (this.sprite.width/2) - 76;
		}
		ctx.drawImage(this.sprite,0,0);
		ctx.restore();
		
		if (Math.random() > 0.99913) {
			spawnMissile(true,{x:this.centerX, y:this.centerY});
		}
	}
}

class satelite {
	constructor(x,y,dir) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.sprite = new Image();
		this.sprite.src = "Missile_Command/src/satelite.png";
		this.centerX = this.x + this.sprite.width/2;
		this.centerY = this.y + 20;
	}
	
	update() {
		if (this.dir) {
			this.x += 1.5 * missileCommandGame.speedMultiplier;
			ctx.save();
			ctx.translate(this.x,this.y);
			ctx.scale(1,1);
			this.centerX = this.x + this.sprite.width/2 - 6;
		} else if (!this.dir) {
			this.x -= 1.5 * missileCommandGame.speedMultiplier;
			ctx.save();
			ctx.translate(this.x,this.y);
			ctx.scale(-1,1);
			this.centerX = this.x - (this.sprite.width/2) + 6;		
		}
		ctx.drawImage(this.sprite,0,0,this.sprite.width*0.8,this.sprite.height*0.8);
		ctx.restore();
		
		if (Math.random() > 0.999) {
			spawnMissile(true,{x:this.centerX, y:this.centerY});
		}
	}
}