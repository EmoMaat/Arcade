class saucer {
	constructor(ctx, size) {
		this.ctx = ctx;

		if (Math.random() > 0.5) {
			this.x = -20;
		} else {
			this.x = window.width + 20;
		}
		this.y = Math.random()*(window.height - 400) + 200;
		this.size = size;


		this.shootCounter = 0;
		if (this.size == 1) {
			if (this.x == - 20) {
				this.speed = Math.random()*1.7 + 2//Math.random() * 5 + 2;
			} else {
				this.speed = -(Math.random()*1.7 + 2)//-Math.random() * 5 + 1.5;
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
		if (arcade.game.object.backgroundGame) {
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
			if (this.y < window.height - 50 && this.move > 0) {
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

		if (this.x > window.width + 50 || this.x < -50) {
			this.del = true;
		}
	}
	handleShooting() {
		this.shootCounter++;
		if (this.shootCounter == this.shootSpeed) {
			this.shootCounter = 0;
			if (arcade.game.object.backgroundGame) {
				this.fire();
			} else {
				arcade.game.object.projectiles.push(new projectile(this.ctx, this.x,this.y,Math.random()*Math.PI * 2,false));
			}
			astSFire.currentTime = 0;;
			astSFire.play();
		}
	}
	fire() {
		let object = {}
		if (arcade.game.object.shuttles.length > 0){
			object = arcade.game.object.shuttles[Math.floor(Math.random() * arcade.game.object.shuttles.length)];
		} else if (arcade.game.object.asteroids.length > 0){
			object = arcade.game.object.asteroids[Math.floor(Math.random() * arcade.game.object.asteroids.length)];
		} else {
			object = {x:Math.random() * window.width, y: Math.random() * window.height};
		}
		this.tx = object.x;
		this.ty = object.y;
		this.dx = this.x - this.tx;
		this.dy = this.y - this.ty;
		this.tr = Math.atan2(this.dy,this.dx);
		this.inaccuracy = Math.random() * 2 * Math.PI;
		arcade.game.object.projectiles.push(new projectile(this.ctx, this.x,this.y,(this.tr + this.inaccuracy) + Math.PI,false));
	}
	draw() {
		this.ctx.beginPath();
		if (this.size == 1) {
			this.ctx.moveTo(this.x - 40,this.y + 10);
			this.ctx.lineTo(this.x + 40, this.y + 10);
			this.ctx.lineTo(this.x + 23, this.y + 27);
			this.ctx.lineTo(this.x - 23, this.y + 27);

			this.ctx.lineTo(this.x - 40, this.y + 10);
			this.ctx.lineTo(this.x - 21, this.y);
			this.ctx.lineTo(this.x + 21, this.y);
			this.ctx.lineTo(this.x + 40, this.y + 10);

			this.ctx.moveTo(this.x + 21,this.y);
			this.ctx.lineTo(this.x + 12, this.y - 15);
			this.ctx.lineTo(this.x - 12, this.y - 15);
			this.ctx.lineTo(this.x - 21, this.y);
		} else {
			this.ctx.moveTo(this.x - 20,this.y + 5);
			this.ctx.lineTo(this.x + 20, this.y + 5);
			this.ctx.lineTo(this.x + 11.5, this.y + 13.5);
			this.ctx.lineTo(this.x - 11.5, this.y + 13.5);

			this.ctx.lineTo(this.x - 20,this.y + 5);
			this.ctx.lineTo(this.x - 10.5,this.y);
			this.ctx.lineTo(this.x + 10.5,this.y);
			this.ctx.lineTo(this.x + 20,this.y + 5);

			this.ctx.lineTo(this.x + 11.5,this.y);
			this.ctx.lineTo(this.x + 6,this.y - 7.5);
			this.ctx.lineTo(this.x - 6,this.y - 7.5);
			this.ctx.lineTo(this.x - 11.5,this.y);

		}
		this.ctx.strokeStyle = "#fff";
		this.ctx.stroke();
	}
}