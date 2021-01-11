class smartBomb {
	constructor(x,y,tar,speed,target) {
		this.x = x;
		this.y = y;
		this.target = tar; //x,y coords
		this.speed = speed;
		this.objectTarget = target; //actual targeted object (which city/battery)
		
		//drawing vars:
		this.flickerCount = 0;
		this.del = false;
	}
	
	update() {
		this.move();
		this.evadeExplosions();
		this.draw();
	}
	
	move() {
		this.tx = this.target.x - this.x;
		this.ty = this.target.y - this.y;
		this.dist = Math.sqrt(this.tx*this.tx + this.ty*this.ty);
		
		this.velX = (this.tx/this.dist)*this.speed;
		this.velY = (this.ty/this.dist)*this.speed;
		
		if (this.dist < 7) {
			this.explosion();
		}
	}
	
	explosion() {
		if (!this.del) {
			this.target.x = this.x;
			this.target.y = this.y;
			missileCommandGame.explosions.push(new explosion(this.target.x,this.target.y));
			this.del = true;
		}
	}
	
	evadeExplosions() {
		for (let i = 0; i < missileCommandGame.explosions.length; i++) {
			let exp = missileCommandGame.explosions[i];
			let dx = this.x - exp.x;
			let dy = this.y - exp.y;
			let theta = Math.atan2(dy,dx);
			let distance = Math.sqrt(dx*dx + dy*dy);
			
			//last number (10) determines how hard it is to destroy a smartBomb (the smaller the number, the smaller the explosion is needed to destroy a smartbomb)
			if (distance - 20 < exp.explosionradius + 10 && exp.explosionradius > 15)  { 
				this.x += Math.cos(theta)* (1 + (0.7 * missileCommandGame.explosionSpeedMultiplier)) * this.speed; //1.7 = 1 + the rate of which explosions expand (0.7)
				this.y += 2*Math.sin(theta)* (1 + (0.7 * missileCommandGame.explosionSpeedMultiplier)) * this.speed;
			}
			if (distance < exp.explosionradius + 13) {
				this.explosion();
			}
		}
		
		this.x += this.velX;
		this.y += this.velY;
	}
	
	draw() {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y + 10);
		ctx.lineTo(this.x + 3, this.y + 3);
		ctx.lineTo(this.x + 10, this.y);
		ctx.lineTo(this.x + 3, this.y - 3);
		ctx.lineTo(this.x, this.y - 10);
		ctx.lineTo(this.x - 3, this.y - 3);
		ctx.lineTo(this.x - 10, this.y);
		ctx.lineTo(this.x - 3, this.y + 3);
		if (this.flickerCount < 7) {
			this.flickerCount++;
		}
		if (this.flickerCount >= 7) {
			this.flickerCount++;
			ctx.moveTo(this.x,this.y);
			ctx.arc(this.x,this.y,4.5,0,2*Math.PI);
		}
		if (this.flickerCount > 14) {
			this.flickerCount = 0;
		}
		ctx.closePath();
		
		ctx.fillStyle = "#fff";
		ctx.fill();
	}
}