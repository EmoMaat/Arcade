class saucer {
	constructor(size) {
		if (Math.random() > 0.5) {
			this.x = -20;
		} else {
			this.x = canvas.width + 20;
		}
		this.y = Math.random()*(canvas.height - 400) + 200;
		this.size = size;
		
		
		this.shootCounter = 0;
		if (this.size == 1) {
			if (this.x == - 20) {
				this.speed = 0.75*(Math.random()*1.7 + 2)//Math.random() * 5 + 2;
			} else {
				this.speed = -0.75*(Math.random()*1.7 + 2)//-Math.random() * 5 + 1.5;
			}
			this.shootSpeed = 37;
			this.hitboxY = this.y + 5;
			this.hitbox = 30;
		} else {
			if (this.x == - 20) {
				this.speed = Math.random() * 2.5 + 4//Math.random() * 5 + 2;
			} else {
				this.speed = -(Math.random() * 2.5 + 4)//-Math.random() * 5 + 1.5;
			}
			this.shootSpeed = 26;
		}
		
		
		this.move = 0;
		this.moveTimer = 0;
		
		this.del = false;
	}
	update() {
		this.handleMovement();
		this.updatePositions();
		this.handleShooting();
		this.draw();
		if (asteroidsGame.backgroundGame) {
			if (this.size == 1) {
				astLSaucer.play();
			} else {
				astSSaucer.play();
			}
			
		}
	}
	handleMovement() {
		if (Math.random() > 0.983 && this.moveTimer == 0) {
			this.moveTimer = Math.floor(Math.random() * 40 + 35);
			if (Math.random() > 0.5) {
				this.move = -1*this.speed;
			} else {
				this.move = 1*this.speed;
			}
		}
		if (this.moveTimer > 0) {
			this.moveTimer--;
			if (this.y > 50 && this.move < 0) {
				this.y += this.move;
			}
			if (this.y < canvas.height - 50 && this.move > 0) {
				this.y += this.move;
			}
		}
		this.x += this.speed;
	}
	updatePositions() {
		if (this.size == 1) {
			this.hitboxY = this.y + 5;
			this.hitbox = 35;
		} else {
			this.hitboxY = this.y + 3;
			this.hitbox = 20;
		}
		
		if (this.x > canvas.width + 50 || this.x < -50) {
			this.del = true;
		}
	}
	handleShooting() {
		this.shootCounter++;
		if (this.shootCounter == this.shootSpeed) {
			this.shootCounter = 0;
			if (asteroidsGame.backgroundGame) {
				this.fire();
			} else {
				asteroidsGame.projectiles.push(new projectile(this.x,this.y,0,0,Math.random()*Math.PI * 2,false));
			}
			astSFire.currentTime = 0;;
			astSFire.play();
		}
	}
	fire() {
		this.tx = asteroidsGame.shuttles[Math.floor(Math.random() * asteroidsGame.shuttles.length)].x;
		this.ty = asteroidsGame.shuttles[Math.floor(Math.random() * asteroidsGame.shuttles.length)].y;
		this.dx = this.x - this.tx;
		this.dy = this.y - this.ty;
		this.tr = Math.atan2(this.dy,this.dx);
		this.inaccuracy = Math.random() * 2 * Math.PI;
		asteroidsGame.projectiles.push(new projectile(this.x,this.y,0,0,(this.tr + this.inaccuracy) + Math.PI,false));
	}
	draw() {
		ctx.beginPath();
		console.log(this.size);
		if (this.size == 1) {
			ctx.moveTo(this.x - 40,this.y + 10);
			ctx.lineTo(this.x + 40, this.y + 10);
			ctx.lineTo(this.x + 23, this.y + 27);
			ctx.lineTo(this.x - 23, this.y + 27);
			
			ctx.lineTo(this.x - 40, this.y + 10);
			ctx.lineTo(this.x - 21, this.y);
			ctx.lineTo(this.x + 21, this.y);
			ctx.lineTo(this.x + 40, this.y + 10);
			
			ctx.moveTo(this.x + 21,this.y);
			ctx.lineTo(this.x + 12, this.y - 15);
			ctx.lineTo(this.x - 12, this.y - 15);
			ctx.lineTo(this.x - 21, this.y);
		} else {
			ctx.moveTo(this.x - 20,this.y + 5);
			ctx.lineTo(this.x + 20, this.y + 5);
			ctx.lineTo(this.x + 11.5, this.y + 13.5);
			ctx.lineTo(this.x - 11.5, this.y + 13.5);
			
			ctx.lineTo(this.x - 20,this.y + 5);
			ctx.lineTo(this.x - 10.5,this.y);
			ctx.lineTo(this.x + 10.5,this.y);
			ctx.lineTo(this.x + 20,this.y + 5);
			
			ctx.lineTo(this.x + 11.5,this.y);
			ctx.lineTo(this.x + 6,this.y - 7.5);
			ctx.lineTo(this.x - 6,this.y - 7.5);
			ctx.lineTo(this.x - 11.5,this.y);
			
		}
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}