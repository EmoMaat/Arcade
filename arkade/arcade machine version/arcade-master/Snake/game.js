function Snake() {
	HubControl = false;
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	SnakeMainMenuOverlay();
	
	menuOverlay.backgroundGame = new SnakeBackgroundGame();
    menuOverlay.backgroundGame.overlay = true;
	snakeGame = menuOverlay.backgroundGame;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 20);
}

function SnakeMainMenuOverlay() {
	menuOverlay.buttons = [
		new Button(120, canvas.height - 310, 400, 30, "START GAME", "newSnakeGame()"),
		new Button(120, canvas.height - 230, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0,true)"),
		new Button(120, canvas.height - 150, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(120, canvas.height - 70, 400, 30, "EXIT", "loadHub()")
	];
}


function findScreenSize() {
	var sizes = [];
	var i = 0;
	for (let i = 0; i < screen.width; i++) {
		if (screen.width % i == 0 && screen.height % i == 0) {
			console.log(screen.width / i, screen.height / i, i); 
			sizes.push(i);
		}
	}
	console.log(sizes);
}

const snakeWidth = screen.width / 30; //30 seems to work for both width and height
const snakeHeight = screen.height / 30 * (screen.width/screen.height);

class SnakeGame {
	constructor() {
		this.snake = new SnakeObj(0,0);
		this.snakeFood = new snakeFoodObj();
		this.gameOver = false;
		this.drawHighscores = false; //to stop the food from drawing on the highscore screen (for some reason it does)
		this.screenCounter = 0;
		this.gamemode = "";
		self = this;
	}
	update() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		self.snake.update();
		if (self.snake.x == self.snakeFood.x - (snakeWidth / 2) - 24 && self.snake.y == self.snakeFood.y - (snakeHeight / 2) - 24) {
			self.snake.length++;
			self.newFood();
			console.log(self.snakeFood.x,self.snakeFood.y);
		}
		self.snakeFood.draw();
		self.drawScores();
		for (let i = 0; i < self.snake.body.length; i++) {
			if ((self.snake.x == self.snake.body[i].x && self.snake.y == self.snake.body[i].y) ||
				(self.snake.x > screen.width - snakeWidth || self.snake.x < 0 || self.snake.y > screen.height || self.snake.y < 0)) {
				if (!self.gameOver)
					self.snake.body.splice(self.snake.body.length,1);
				
				self.gameOver = true;
			}
		}
		if (self.gameOver) {
			self.gameOverScreen();
		} else {
		}
	}
	drawScores() {
		ctx.textAlign = "center";
		ctx.strokeStyle = "#000";
		ctx.font = " bold 40px segoe ui";
		ctx.strokeText("SCORE: " + self.snake.length,screen.width/2,45);
		ctx.font = "40px segoe ui";
		ctx.fillStyle = "#fff";
		ctx.fillText("SCORE: " + self.snake.length,screen.width/2,45);
	}
	newFood() {
		self.snakeFood = new snakeFoodObj();
		for (let i = 0; i < self.snake.body.length; i++) {
			if (self.snakeFood.x == self.snake.body[i].x && self.snakeFood.y == self.snake.body[i].y) {
				self.snakeFood = new snakeFoodObj();
				break;
			}
		}
	}
	gameOverScreen() {
		self.screenCounter++;
		ctx.textAlign = "center";
		if (self.screenCounter > 10) {
			ctx.font = "80px segoe ui";
			ctx.fillText("GAME OVER",screen.width/2,screen.height/2 - 50);
		}
		if (self.screenCounter > 55) {
			ctx.font = "45px segoe ui";
			ctx.fillText("YOUR SCORE: " + self.snake.length,screen.width/2,screen.height/2 + 50);
		}
		if (self.screenCounter > 160) {
			loadHighscores(currentGame,self.snake.length);
		}
	}
	quit() {
		
	}
}

class SnakeBackgroundGame {
	constructor() {
		this.snake = new SnakeObj(canvas.width/2 - canvas.width/4,snakeHeight);
		this.snake.length = 10;
		this.tickCount = 0;
		this.dir = 0;
		self = this;
	}
	update() {
		self.tickCount++;
		self.snake.update();
		if (self.tickCount % (7*14) == 0) {
			// alert();
			self.tickCount = 0;
			if (self.dir < 3) {
				self.dir++;
			} else {
				self.dir = 0;
			}
			self.snake.dir = self.dir;
		}
	}
	quit() {
		
	}
}

function newSnakeGame() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
		
	OverlayIsActive = false;
	
	snakeGame = new SnakeGame();
	
	gameInterval = new Interval(snakeGame.update,20);
}