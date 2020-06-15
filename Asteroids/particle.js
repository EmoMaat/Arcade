function particle(ctx, x,y,size) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this.velX = randomNegative((2*Math.random()));
	this.velY = randomNegative((2*Math.random()));
	this.size = size;
	this.color = 255;
	this.toUpdate = true;
	this.update = function() {
		if (this.toUpdate) {
			this.x += this.velX;
			this.y += this.velY;
			this.velX *= 0.99;
			this.velY *= 0.99;
			this.speed = Math.sqrt(this.velX*this.velX + this.velY*this.velY);
			if (this.speed < 1.5) {
				this.color -= 40;
			}
			this.ctx.beginPath();
			this.ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
			this.ctx.fillStyle = "rgb(" + this.color + "," + this.color + "," + this.color + ")";
			// this.ctx.fillRect(this.x,this.y,this.size,this.size);
			this.ctx.fill();
			this.ctx.closePath();
		}
		if (this.color <= 5) {
			this.toUpdate = false;		}
	}
}

function spawnParticles(ctx, x,y,size,amount) {
	for (i = 0; i < amount; i++) {
		arcade.game.object.particles.push(new particle(ctx, x,y,size));
	}
}

// spawnParticles(200,200,1,20);