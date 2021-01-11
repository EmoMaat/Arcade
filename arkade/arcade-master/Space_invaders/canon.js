class Cannon {
	constructor() {
		this.x = 1920/2 - cannonImg.width/2;
		this.y = 1080 - 100;
		this.fired = false;
		this.livesX = 0;
		this.lives = 3;
		this.hit = false;
		this.hitCounter = 0;
		this.hitSy = 0;
		this.toDraw = true;
	}
	
	update() {
		this.centerX = this.x + cannonImg.width/2;
		this.centerY = this.y + cannonImg.height;
		this.handleShooting();
		if (move.right && this.x + cannonImg.width < 1920 && !this.hit) {
			this.x += 2;
		}
		if (move.left && this.x > 0 && !this.hit) {
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
	handleShooting() {
		if (!this.fired && (map.Button2 || map[32]) && !this.hit) {
			spaceInvadersGame.projectiles.push(new laserProjectile(this.x + cannonImg.width/2,this.y));
			this.fired = true;
			shootSound.currentTime = 0;
			shootSound.play();
		}
		//reset fire when there is no projectile
		if (spaceInvadersGame.projectiles.length == 0) {
			this.fired = false;
		}
	}
}