class PongBall{	
	constructor(Players){
		this.size = 20;
		this.x = canvas.width / 2; 		// middle
		this.y = canvas.height / 2;		// middle
		
		this.spawnCounter = 0;
		this.speed = 10;
		this.startingAngle = Math.PI * (100 / 4) / 100; 	// 33% of PI
		this.missed = false;
		
		// calculate random velocities
		this.radians = Math.random() > 0.5 ? this.MathRandomBetween(0 + this.startingAngle, 0 - this.startingAngle) : this.MathRandomBetween(Math.PI + this.startingAngle, Math.PI	 - this.startingAngle);
		
		if(PongGame.logging){
			console.log("----------------------------------");
			console.log("Ball Velocity X: " + this.velx);
			console.log("Ball Velocity Y: " + this.vely);
		}
	}
	
	update(){
		// this is a timer preventing the ball from starting right away
		if (this.spawnCounter < 133) {
			this.spawnCounter++;
			ctx.arc(this.x , this.y, this.size,0,2*Math.PI);
		
			ctx.fill();
			ctx.closePath();
		} else {
			ctx.fillStyle = "#fff";
			
			// let rads = Math.atan2(this.vely, this.velx);
			this.velx = Math.cos(this.radians) * this.speed;
			this.vely = Math.sin(this.radians) * this.speed;
			
			this.x += this.velx;
			this.y += this.vely;
			ctx.arc(this.x, this.y,this.size,0,2*Math.PI);
			
			ctx.fill();
			ctx.closePath();
		}
	}
	
	checkCollision(Players){
		if (!this.missed){
			if(this.x < canvas.width / 64 	// = 30 (draw distance)
				+ canvas.width / 96 		// = 20 (bar width)
				+ this.size					// = 20 (ball width)
			) {
				if(Players[0].y < this.y && Players[0].y + canvas.height / 7.5 > this.y){
					this.x = canvas.width / 64 + canvas.width / 96 + this.size;
					let radians = Math.PI - this.radians;
					let distanceToCenter = this.y - (Players[0].center);
					
					if(this.y < Players[0].center - 10){ // 10 above center					
						if(this.vely > 0){ // if coming from above
							// make vely steeper
							radians += (distanceToCenter / 200);
							
							this.radians = radians;
						} else { // coming from below
							// make vely less steep
							radians -= (distanceToCenter / 200);
							
							this.radians = radians;
						}
						this.speed += this.MathRandomBetween(0.4, 0.99);
						
					} else if(this.y > Players[0].center + 10){ // 10 below center					
						if(this.vely > 0){ // if coming from above
							// make vely steeper
							radians -= (distanceToCenter / 250);
							
							this.radians = radians;
						} else { // coming from below
							// make vely less steep
							radians += (distanceToCenter / 250);
							
							this.radians = radians;
						}
						
						this.speed += this.MathRandomBetween(0.4, 0.99);
						
					} else { // in center
						this.radians = radians;
						this.speed += this.MathRandomBetween(0.4, 0.99);
					}		
					
					var audio = new Audio("Pong/audio/paddle.mp3")
					audio.play();
					
					if(Players[0].type == "AI"){ 
						Players[0].gotoCenter = true; 
						Players[0].newHitpoint(); // generate a new point for the AI to try to hit the ball
					}
				} else {
					this.missed = true;
				}
			}
			
			if(this.x > canvas.width - 
				(canvas.width / 64 			// = 30 (draw distance)
				+ canvas.width / 96 		// = 20 (bar width)
				+ this.size)				// = 20 (ball width)
			) {
				if(Players[1].y < this.y && Players[1].y + canvas.height / 7.5 > this.y){
					this.x = canvas.width - (canvas.width / 64 + canvas.width / 96 + this.size);
					let radians = Math.PI - this.radians;
					let distanceToCenter = this.y - (Players[1].center);
					
					if(this.y < Players[1].center - 10){ // 15 above center					
						if(this.vely > 0){ // if coming from above
							// make vely steeper
							radians += (distanceToCenter / 250);
							
							this.radians = radians;
						} else { // coming from below
							// make vely less steep
							radians -= (distanceToCenter / 250);
							
							this.radians = radians;
						}
						
						this.speed += this.MathRandomBetween(0.4, 0.99);
						
					} else if(this.y > Players[1].center + 10){ // 15 below center					
						if(this.vely > 0){ // if coming from above
							// make vely steeper
							radians -= (distanceToCenter / 250);
							
							this.radians = radians;
						} else { // coming from below
							// make vely less steep
							radians += (distanceToCenter / 250);
							
							this.radians = radians;
						}
						
						this.speed += this.MathRandomBetween(0.4, 0.99);
						
					} else { // in center				
						this.speed += this.MathRandomBetween(0.4, 0.99);
						this.radians = radians;
					}
					
					this.velx = -this.velx;

					var audio = new Audio("Pong/audio/paddle.mp3")
					audio.play();
					
					if(Players[1].type == "AI"){ 
						Players[1].gotoCenter = true; 
						Players[1].newHitpoint(); // generate a new point for the AI to try to hit the ball
					}
				} else {
					this.missed = true;
				}
			}
		}
		
		if(this.x < -40) {
			if(Players[0].type == "AI") {
				Players[0].gotoCenter = true; 
				Players[0].moveSpeed += 0.15;
			}
			if(Players[1].type == "AI")
				Players[1].gotoCenter = true;
			
			var audio = new Audio("Pong/audio/point.mp3")
			audio.play();

			this.missed = false;
			return 1; // player 0 lost a point
		}
		if(this.x > canvas.width + 40){
			if(Players[0].type == "AI") 
				Players[0].gotoCenter = true; 
			
			if(Players[1].type == "AI"){
				Players[1].gotoCenter = true; 
				Players[1].moveSpeed += 0.15;
			}

			var audio = new Audio("Pong/audio/point.mp3")
			audio.play();

			this.missed = false;
			return 0; // player 1 lost a point
		}
		
		// top bounce
		if(this.y <= canvas.height / 36 // upper line offset
			+ canvas.height / 108 		// upper line width
			+ canvas.width / 96 		// ball width
		) {
			this.y = canvas.height / 36 // upper line offset
				+ canvas.height / 108 	// upper line width
				+ canvas.width / 96;	// ball width
				
			this.radians = Math.PI * 2 - this.radians;

			var audio = new Audio("Pong/audio/wall.mp3")
			audio.play();
		}
		
		// bottom bounce
		if (this.y >= canvas.height
			- (canvas.height / 36 	// upper line offset
			+ canvas.height / 108 	// upper line width
			+ canvas.width / 96) 	// ball width
		){
			this.y = canvas.height
			- (canvas.height / 36 	// upper line offset
			+ canvas.height / 108 	// upper line width
			+ canvas.width / 96);	// ball width
				
			this.radians = Math.PI * 2 - this.radians;

			var audio = new Audio("Pong/audio/wall.mp3")
			audio.play();
		}
		
		if(pongGame.logging){	
			console.log("--- Ball ---");		
			console.log("Ball X: " + this.x);		
			console.log("Ball Y: " + this.y);		
			console.log("Ball VelX: " + this.velx);		
			console.log("Ball VelY: " + this.vely);	
			console.log("Ball Radians: " + this.radians);					
			console.log("Ball speed: " + this.speed);	
			console.log("");	
		}
	}
	
	MathRandomBetween(i1, i2){
		return Math.random() * (i1 - i2) + i2;
	}
}
