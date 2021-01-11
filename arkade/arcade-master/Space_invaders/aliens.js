class Alien {
	constructor(type,x,y) {
		this.type = type;
		this.startX = x;
		this.startY = y;
		this.explosionTimer = 0;
		this.del = false;
	}
	update() {
		if (this.explosionTimer == 0) {
			this.x = this.startX + spaceInvadersGame.alienMove;
			this.y = this.startY + spaceInvadersGame.alienVertical;
			this.centerX = this.x + this.type.sprite.width/2;
			this.centerY = this.y + this.type.sprite.height/4;
			ctx.drawImage(this.type.sprite,0,spaceInvadersGame.alienSy,this.type.width,46,this.x,this.y,this.type.crop,46);
		} else {
			console.log(this.del);
			this.explosionTimer++;
			if (this.explosionTimer > 0) {
				ctx.drawImage(alien_explosion,this.centerX - alien_explosion.width/2,this.y);
			}
			if (this.explosionTimer > 30) {
				this.del = true;
			}
			
		}
	}
}

var alienType1 = {
	radius: 35.25,
	award: 10,
	sprite: alien1,
	width: 75,
	crop: 70
};

var alienType2 = {
	radius: 30.75,
	award: 20,
	sprite: alien2,
	width: 65,
	crop: 65
};

var alienType3 = {
	radius: 26,
	award: 30,
	sprite: alien3,
	width: 46,
	crop: 46
};

class Mothership {
	constructor() {
		if (Math.random() > 0.5) {
			this.direction = 1;
		} else {
			this.direction = -1;
		}
		if (this.direction == 1) {
			this.x = -1*(mother_ship.width*1.2);
		} else {
			this.x = canvas.width + mother_ship.width*1.2;
		}
		this.del = false;
		this.y = 130;
		this.reward = 0;
		this.explosionTimer = 0;
		this.textOffset = 0;
		this.fontsize = 30;
		this.textcolor = 255;
	}
	update() {
		if (this.explosionTimer == 0) {
			this.centerX = this.x + mother_ship.width*1.2/2;
			this.centerY = this.y + mother_ship.height*1.2/2;
			this.x += this.direction;
			if (this.x < -mother_ship.width*1.2 - 5 || this.x > canvas.width + mother_ship.width*1.2 + 5) {
				this.del = true;
			}
			ctx.drawImage(mother_ship,this.x,this.y,mother_ship.width*1.2,mother_ship.height*1.2);
		} else {
			this.explosionTimer++;
			if (this.explosionTimer > 0) {
				if (this.explosionTimer < 70) {
					ctx.drawImage(alien_explosion,this.centerX - alien_explosion.width*1.2/2,this.y,alien_explosion.width*1.2,alien_explosion.height*1.2);
				}
				if (this.explosionTimer > 30) {
					this.textcolor -= 1;
				}
				
				this.fontsize += 0.03;
				
				ctx.fillStyle = "rgb("+this.textcolor+","+this.textcolor+","+this.textcolor+")";
				ctx.font = this.fontsize+"px segoe ui";
				ctx.textAlign = "center";
				ctx.fillText(this.reward,this.centerX,this.centerY + this.textOffset);
				this.textOffset -= 0.3;
				if (this.textcolor <= 0) {
					this.del = true;
				}
			}
		}
		
	}
}