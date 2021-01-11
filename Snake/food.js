function snakeFoodObj() {
	this.x = Math.round((Math.random()*(screen.width-snakeWidth)+snakeWidth)/snakeWidth)*snakeWidth;
	this.y = Math.round((Math.random()*(screen.height-snakeHeight)+snakeHeight)/snakeHeight)*snakeHeight;
	this.draw = function() {
		ctx.beginPath();
		ctx.arc(this.x - (snakeWidth / 2),this.y - (snakeHeight / 2),snakeWidth/3,0,2*Math.PI);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}