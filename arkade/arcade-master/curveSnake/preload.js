// var canvas = document.getElementById("canvas"),
	// ctx = canvas.getContext("2d"),
	
// var map = {};

// onkeydown = onkeyup = function(e){
    // e = e || event;
    // map[e.keyCode] = e.type == 'keydown';
// }

class curveSnakeGame{
	constructor() {
		this.bodyX = [],
			bodyY = [],
			food = "",
			item = "",
			itemCount = 0,
			itemSpawned = false,
			itemPresent = false,
			snake = new snakeObj;
			spawnItem("food");
			gameInterval = new Interval(update,20);
	}
}

// var curveSnakeGame = new curveSnakeGame();

// function randomNumber(min,max) {
    // return Math.floor(Math.random() * (max - min) + min);
// }