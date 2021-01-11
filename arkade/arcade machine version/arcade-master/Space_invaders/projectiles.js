class laserProjectile {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	update() {
		this.y -= 5;
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x,this.y + 25);
		ctx.closePath();
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}

function alienProjectile(x,y,type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.del = false;
	this.update = function() {
		ctx.save();
		ctx.translate(this.x,this.y);
		if (type == 0) {
			ctx.scale(spaceInvadersGame.alienProjectileScale,1);
			ctx.drawImage(projectile1,-projectile1.width/2,0,1.2*projectile1.width,1.2*projectile1.height);
			this.y += 2.5;
		} else {
			ctx.scale(1,spaceInvadersGame.alienProjectileScale);
			ctx.drawImage(projectile2,0,-projectile2.height/2 + 5);
			this.y += 2;
		}
		ctx.restore();
		if (this.y > 1500) {
			this.del = true;
		}
	}
}