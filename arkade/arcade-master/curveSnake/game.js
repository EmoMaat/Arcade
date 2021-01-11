function CurveSnake() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	curveSnakeMainMenuOverlay();
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 20);
}

function curveSnakeMainMenuOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "START GAME", "startCurveSnake()"),
		new Button(120, canvas.height - 150, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"),
		new Button(120, canvas.height - 70, 400, 30,"EXIT", "loadHub()")
	];
}

class curveSnakeGame{
	constructor() {
		// this.bodyX = [];
		// this.bodyY = [];
		// this.food = "";
		// this.item = "";
		// this.itemCount = 0;
		// this.itemSpawned = false;
		// this.itemPresent = false;
		// this.snake = new curveSnakeObj;
		// spawnItem("food");
		gameInterval = new Inverval(updateCurveSnake,20);
	}
}

var gameCurveSnake;

function startCurveSnake() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
		
	OverlayIsActive = false;
	gameCurveSnake = new curveSnakeGame();
}