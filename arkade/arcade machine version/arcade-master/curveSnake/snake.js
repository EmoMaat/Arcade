function updateCurveSnake() {
	curveSnake.update();
	curveFood.update();
}

function curveSnakeHead() {
	this.x = canvas.width/2;
	this.y = canvas.height/2;
	this.radius = 20;
	this.color = "#fff";
	this.speed = 8;
	this.powerup = "";
	this.body = []; //contains all coordinates of body parts.
	this.radians = 0; //movement angle in radians.
	this.turnSpeed = 0.08;
	this.length = 25; //defines the max length for the body.
	
	this.update = function() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (map[37])
			this.radians -= this.turnSpeed;
		if (map[39])
			this.radians += this.turnSpeed;
		
		this.velX = Math.cos(this.radians) * this.speed; //get the horizontal velocity of the snake.
		this.velY = Math.sin(this.radians) * this.speed; //get the vertical velocity of the snake.
		this.x += this.velX; //update x position.
		this.y += this.velY; //update y position.
		
		this.handleBody(); //handle the bodyParts.
		this.collisionCheck(); //check for collision with the body
		
		//draw the head;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
	}
	
	this.handleBody = function() {
		if (this.body.length >= this.length) { //delete body parts if the snake gets longer than it should be
			this.body.splice(0,1); //delete last body part from array, so the snake 'moves'.
		}
		this.body.push({x: this.x, y: this.y}); //always adding fresh bodyparts where the snake moves, so it 'draws' a line along it's path.
		
		//draw the bad boys:
		for (let i = 0; i < this.body.length; i++) {
			ctx.beginPath();
			ctx.arc(this.body[i].x,this.body[i].y,this.radius,0,2*Math.PI);
			if (i < this.body.length - 20 && this.length > 20) {
				this.color = "#FFF"; //change to other color to see the collision area
			} else {
				this.color = "#FFF";
			}
			ctx.fillStyle = this.color;
			ctx.closePath();
			ctx.fill();
		}
	}
	
	this.collisionCheck = function() {
		for (let i = 10; i < this.body.length; i++) { //start at i = 10, otherwise a collision would always occur.
			if (i < this.body.length - 10 && this.length > 10) {
				this.dx = this.x - this.body[i].x;
				this.dy = this.y - this.body[i].y;
				this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy); //calculate distance between bodypart and head.
				if (this.distance < 2*this.radius) {
					//code for dying goes here;
					curveSnake = "";
					curveSnake = new curveSnakeHead();
					alert("u dieded");
				}
			}
		}
	}
}

var curveSnake = new curveSnakeHead();