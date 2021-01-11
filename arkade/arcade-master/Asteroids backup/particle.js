function particle(x,y,size) {
	this.x = x;
	this.y = y;
	this.velX = randomNegative((1*Math.random()));
	this.velY = randomNegative((1*Math.random()));
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
			if (this.speed < 0.5) {
				this.color -= 20;
			}
			ctx.beginPath();
			ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
			ctx.fillStyle = "rgb(" + this.color + "," + this.color + "," + this.color + ")";
			// ctx.fillRect(this.x,this.y,this.size,this.size);
			ctx.fill();
			ctx.closePath();
		}
	}
}

function spawnParticles(x,y,size,amount) {
	for (i = 0; i < amount; i++) {
		particles.push(new particle(x,y,size));
	}
}

// spawnParticles(200,200,1,20);

function checkParticles() {
	for (i = 0; i < particles.length; i++) {
		if (particles[i].color <= 5) {
			particles[i].toUpdate = false;
		} 
	}
	for (i = 0; i < particles.length; i++) {
		if (!particles[i].toUpdate) {
			particles.splice(i,1);
		} 
	}
}