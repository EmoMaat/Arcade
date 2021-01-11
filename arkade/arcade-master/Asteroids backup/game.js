function Asteroids() {
	HubControl = false;
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	AsteroidsMainMenuOverlay();
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menu();
		menuOverlay.update();
	}, 20);
}

function AsteroidsMainMenuOverlay() {
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "START GAME", "newAsteroidsGame()"),
		new Button(120, canvas.height - 150, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"),
		new Button(120, canvas.height - 70, 400, 30, "EXIT", "exitAsteroids()")
	];
}

function exitAsteroids() {
	player = "";
	player = new shuttle();
	asteroids = [];
	asteroidamount = 1;
	lifes = [new playerLifeObj(30),new playerLifeObj(80),new playerLifeObj(130)];
	projectiles = [];
	ufos = [];
	pickups = [];
	particles = [];
}

function newAsteroidsGame() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
		
	OverlayIsActive = false;
	gameInterval = new Interval("updateFunction()",20);
}
