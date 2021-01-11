function missile(x,y,tar,speed,friendly,target) {
	this.x = x;
	this.y = y;
	this.startX = x;
	this.startY = y;
	this.target = tar;
	this.speed = speed;
	this.split = false;
	this.friendly = friendly;
	if (this.friendly) {
		this.flicker = 2; //creates the flickering effect for the missile;
		this.flickerCount = randomNumber(0,7); //nesecary for not flickering non stop
	} else {
		this.flicker = "#fff";
		this.flickerCount = 0; //nesecary for not flickering non stop
	}
	this.flickerRadius = 0;
	this.flickerBool = true;
	this.explode = false;
	this.crossSize = 1;
	
	this.exploded = false;
	this.del = false; //to check if the missile is done and needs to be deleted
	
	this.objectTarget = target || ""; //enemy missile's target (city or battery) stays undefined for friendly missiles
	
	this.update = function() {
		this.draw();
		this.addFlicker();
		this.move();
		if (!this.friendly) {
			this.handleSplit();
		}
	}
	
	this.move = function() {
		this.tx = this.target.x - this.x;
		this.ty = this.target.y - this.y;
		this.dist = Math.sqrt(this.tx*this.tx + this.ty*this.ty);
		
		this.velX = (this.tx/this.dist)*this.speed*0.75;
		this.velY = (this.ty/this.dist)*this.speed*0.75;
		
		if (this.explode) {
			this.explosion();
		}
		if (this.dist > 7 * missileCommandGame.speedMultiplier) {
			this.x += this.velX;
			this.y += this.velY;
		} else {
			this.explode = true;
		}
	}
	
	this.explosion = function() {
		if (!this.del) {
			missileCommandGame.explosions.unshift(new explosion(this.target.x,this.target.y));
			if (!this.friendly) {
				soundPlay("Missile_Command/src/sounds/explosion.mp3",1);
			}
			this.del = true;
			if (!this.friendly && this.dist > 7 * missileCommandGame.speedMultiplier) {
				missileCommandGame.score += 25 * missileCommandGame.waveMultiplier;
			}
		}
	}
	
	this.addFlicker = function() {
		if (this.friendly) {
			if (this.flickerCount < 7) {
				this.flickerCount += 0.5;
			} else {
				this.flicker = randomNumber(50,240);
				this.flickerCount = randomNumber(2,4);
			}
			if (this.flickerRadius < 4 && this.flickerBool) {
				this.flickerRadius += 0.4;
			}
			if (this.flickerRadius >= 4) {
				this.flickerBool = false;
				this.crossSize = 2.5;
			}
			if (this.flickerRadius > 0 && !this.flickerBool) {
				this.flickerRadius -= 0.4;
			}
			if (this.flickerRadius <= 0) {
				this.flickerBool = true;
				this.crossSize = 1;
			}
		} else {
			if (this.flickerCount < 7) {
				this.flickerCount++;
			} else {
				if (this.flicker == "#fff") {
					this.flicker = "#555";
				} else if (this.flicker == "#555") {
					this.flicker = "#fff";
				}
				this.flickerCount = 0;
			}
		}
	}
	
	this.handleSplit = function() {
		let dx = this.x - this.startX;
		let dy = this.y - this.startY;
		let distanceTraveled = Math.sqrt(dx*dx + dy*dy);
		if (distanceTraveled > 100 && distanceTraveled < 625) {
			if (Math.random() > 0.999865) { //tweak that number for optimazation for rocket splitting
				// alert("spliQt");
				this.split = true;
				this.splitPoint = {x: this.x, y: this.y};
			}
		}
		if (this.split) {
			for (let i = 0; i < randomNumber(1,5); i++) {
				spawnMissile(true, this.splitPoint);
			}
			this.split = false;
		}
	}
	
	this.draw = function() {
		if (!this.explode) {
			if (this.friendly) { //for drawing enemy missiles different
				ctx.beginPath();
				ctx.arc(this.x,this.y,5 + this.flickerRadius,0,2*Math.PI);
				ctx.fillStyle = "rgb("+this.flicker+","+this.flicker+","+this.flicker+")";
				ctx.fill();
				
				ctx.beginPath()
				ctx.moveTo(this.startX,this.startY);
				ctx.lineTo(this.x,this.y);
				ctx.strokeStyle = "#555";
				ctx.lineWidth = 2.5;
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(this.x,this.y,1,0,2*Math.PI);
				ctx.fillStyle = "#fff";
				ctx.fill();
				
				ctx.strokeStyle = "#fff"
				ctx.lineWidth = this.crossSize;
				ctx.beginPath();
				ctx.moveTo(this.target.x - 7,this.target.y - 7);
				ctx.lineTo(this.target.x + 7,this.target.y + 7);
				ctx.moveTo(this.target.x + 7,this.target.y - 7);
				ctx.lineTo(this.target.x - 7,this.target.y + 7);
				ctx.stroke();
			} else {
				ctx.beginPath();
				ctx.moveTo(this.x,this.y);
				ctx.lineTo(this.startX,this.startY);
				ctx.strokeStyle = "#333";
				ctx.lineWidth = 2.5;
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(this.x,this.y,3,0,2*Math.PI);
				ctx.fillStyle = this.flicker;
				ctx.fill();
			}
		}
		
	}
}

function explosion(x,y) {
	this.x = x;
	this.y = y;
	this.explosionradius = 0;
	this.colorCounter = 0;
	this.explosionColor = "#fff";
	this.explosionExpanded = false;
	this.exploded = false;
	
	this.update = function() {
		//draw
		if (this.colorCounter < 8) {
			this.colorCounter++;
		} else {
			if (this.explosionColor == "#111") {
				this.explosionColor = "#333";
			} else if (this.explosionColor == "#333") {
				this.explosionColor = "#fff";
			}else if (this.explosionColor == "#fff") {
				this.explosionColor = "#111";
			}
			this.colorCounter = 0;
		}
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.explosionradius,0,2*Math.PI);
		ctx.fillStyle = this.explosionColor;
		ctx.fill();
		
		if (this.explosionradius < 82*0.75 && !this.explosionExpanded) {
			this.explosionradius += 0.7*0.75 * missileCommandGame.explosionSpeedMultiplier;
		}
		if (this.explosionradius >= 82*0.75) {
			this.explosionExpanded = true;
		}
		if (this.explosionExpanded && this.explosionradius > 0) {
			this.explosionradius -= 0.55*0.75 * (missileCommandGame.explosionSpeedMultiplier/1.5);
		}
		if (this.explosionradius < 4 && this.explosionExpanded) {
			this.explosionradius = 0;
			this.exploded = true;
		}
	}
}