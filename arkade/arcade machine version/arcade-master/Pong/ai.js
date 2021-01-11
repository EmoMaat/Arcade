class PongAI{
	constructor(userNumber){
		this.type = "AI";
		this.points = 0;
		this.userNumber = userNumber;
		this.gotoCenter = false;
		
		this.width = canvas.width / 96; 		// = 20
		this.height = canvas.height / 7.5; 		// = 180
		
		if(userNumber == 1) { this.x = canvas.width / 64; } 				// = 30
		if(userNumber == 2) { this.x = canvas.width / 1.032258064516129; }	// = 1860
		
		this.y = canvas.height / 2 - this.height / 2; 	// = 460
		this.center = canvas.height / 2;				// = 540
		this.speed = 0;
		this.moveSpeed = 6;
		this.HitInt;
		this.Hitpoint;
		this.newHitpoint();
	}
	
	updatePaddle(Ball){		
		this.center = this.y + this.height / 2;
		this.Hitpoint = this.center + this.HitInt;
		
		let interceptionX;
		let BallX;
		if (this.userNumber == 1){
			interceptionX = canvas.width / 3;
			BallX = Ball.x;
			
			if(pongGame.logging){
				console.log("--- AI Player 1 ---");
				console.log("Hitpoint from Center: " + this.HitInt);
				console.log("Hitpoint: " + this.Hitpoint);
				console.log("Center : " + this.center);
				console.log("");
			}
		}
		if (this.userNumber == 2){ //although very confusing, we have to invert these values 
			interceptionX = Ball.x;
			BallX = (canvas.width / 3) * 2;
			
			if(pongGame.logging){	
				console.log("--- AI Player 2 ---");
				console.log("Hitpoint from Center: " + this.HitInt);
				console.log("Hitpoint: " + this.Hitpoint);
				console.log("Center : " + this.center);
				console.log("");
			}
		}
				
		
		if(this.gotoCenter){ // already hit the ball so go to the center
			var requiredSpeed = this.calcSpeed(this.center, canvas.height / 2, this.moveSpeed);
			if(this.center == canvas.height / 2 &&
				interceptionX < BallX){ this.gotoCenter = false;} // disable lock when back in middle 
			this.speed = requiredSpeed;
		} else if (interceptionX > BallX){ // we need to hit the ball
			var requiredSpeed = this.calcSpeed(this.Hitpoint, Ball.y, this.moveSpeed);
			
			if(this.y + requiredSpeed < canvas.width / 64) {
				this.speed = 0;
			} else if(this.y + requiredSpeed > (canvas.width - canvas.width / 64) - this.height) {
				this.speed = 0;
			} else {
				this.speed = requiredSpeed;
			}
		} else {
			var requiredSpeed = this.calcSpeed(this.center, this.center, this.moveSpeed);
			this.speed = requiredSpeed;
		}
		
		ctx.fillStyle = "#fff";
		
		this.y += this.speed;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		
		ctx.stroke();
		ctx.closePath();
		
		this.center = this.y + this.height / 2;
	}
	
	/// <Summary>
	/// Calculate the the distance to a point in steps (Requires a loop or Interval)
	/// </Summary>
	/// Paramater p1 = place you are
	/// Paramater p2 = place to go to
	/// Paramater max = max speed / steps
	calcSpeed(p1, p2, max){
		var diff = -(p1 - p2);
		
		if(diff < 0 && diff < -(max - 1)) { // max speed left
			diff = -max;
		} else if(diff > 0 && diff > max - 1) { // max speed right
			diff = max;
		}
		return diff;
	}

	/// <Summary>
	/// create a random hitpoint
	/// </Summary>
	newHitpoint(){
		let min = 0;  // minimum hitpoint
		let max = 0.45; // maximum hitpoint
		
		if(Math.random() < 0.5){ // below center
			this.HitInt = -((Math.random() * (min - max) + max) * this.height / 2);
		} else { // above center
			this.HitInt = (Math.random() * (min - max) + max) * this.height / 2;
		}
	}
}