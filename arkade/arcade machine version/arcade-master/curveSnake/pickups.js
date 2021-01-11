function curveFoodObj() {
	this.x = Math.random() * canvas.width;
	this.y = Math.random() * canvas.height;
	this.radius = 15;
	this.color = "#FFF";
	
	this.update = function() {
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
		
		this.collisionCheck(); //checks collision with snake.
	}
	
	this.collisionCheck = function() {
		this.dx = curveSnake.x - this.x;
		this.dy = curveSnake.y - this.y;
		this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
		if (this.distance < curveSnake.radius + this.radius) {
			this.pickup();
		}
	}
	
	this.pickup = function() {
		curveSnake.length += Math.floor(Math.random() * 28) + 8;
		curveFood = new curveFoodObj(); //reset food, spawns new one.
	}
}

var curveFood = new curveFoodObj();