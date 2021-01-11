var pongGame;

function Pong(){
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	PongMainMenuOverlay();
	
	menuOverlay.backgroundGame = new PongGame("AI", "AI");
	pongGame = menuOverlay.backgroundGame;
	
	// GameSelectorOverlay();
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 15);
}

function PongMainMenuOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 230, 400, 30, "START GAME", "PongGameSelectorOverlay()"),
		new Button(120, canvas.height - 150, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(120, canvas.height - 70, 400, 30,"EXIT", "loadHub()")
	];
}

function PongGameSelectorOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 310, 400, 30, "Player vs AI", "newPongGame('Player', 'AI')"),
		new Button(120, canvas.height - 230, 400, 30, "AI vs Player", "newPongGame('AI', 'Player')"),
		new Button(120, canvas.height - 150, 400, 30, "Player vs Player", "newPongGame('Player', 'Player')"),
		new Button(120, canvas.height - 70, 400, 30, "Back", "PongMainMenuOverlay()")
	];
}


///<Summary>
/// Creates a new instance of the game
///</Summary>
/// Parameter user1 = player on the left
/// Parameter user2 = player on the right
function newPongGame(user1, user2){	
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
	OverlayIsActive = false;
	
	pongGame = new PongGame(user1, user2);
	
	gameInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		pongGame.update();
	}, 15);
}

class PongGame {
	constructor(user1, user2){		
		this.Players = [];
		this.Ball;
		this.gamemode = "";
		
		this.logging = false;
		
		move.p1.keybinding = "letter";
		move.p2.keybinding = "arrow";
		move.multiplayer = true;
		move.smooth = true;
		
		this.createPlayers(user1, user2);
	}
	
	createPlayers(user1, user2){
		console.log("p1.type = " + user1);
		console.log("p2.type = " + user2);
		
		// creates the according player type
		if(user1 == "Player" && user2 == "AI"){
			this.Players.push(new PongPlayer(1));
			this.Players.push(new PongAI(2));
			
		} else if(user1 == "AI" && user2 == "Player"){
			this.Players.push(new PongAI(1));
			this.Players.push(new PongPlayer(2));
			
		} else if(user1 == "Player" && user2 == "Player"){
			this.Players.push(new PongPlayer(1));
			this.Players.push(new PongPlayer(2));
			
		} else if(user1 == "AI" && user2 == "AI"){
			this.Players.push(new PongAI(1));
			this.Players.push(new PongAI(2));
		}
		
		this.Ball = new PongBall(this.Players);
	}
	
	update(){
		if(this.logging)
			console.clear();
		
		this.drawBackground();
		
		// we pass though the ball in case it is an AI
		this.Players[0].updatePaddle(this.Ball);
		this.Players[1].updatePaddle(this.Ball);
		this.drawScore();
		this.inputEventHandler();
		
		this.Ball.update();
		this.scoreWinner = this.Ball.checkCollision(this.Players);
		if(this.scoreWinner != null){
			if(this.scoreWinner == 0){ // player 0
				this.Players[0].points += 1;
				this.Ball = new PongBall(this.Players);
			} else if (this.scoreWinner == 1){ // player 1	
				this.Players[1].points += 1;			
				this.Ball = new PongBall(this.Players);
			}
		}
	}
	
	inputEventHandler(){
		// key eventhandling
		if(this.Players[0].type != "AI"){
			if(move.p1.up){ // w key (up)
				if (this.Players[0].y > canvas.height / 27){ // > 40
					this.Players[0].speed = -5;
				} else {
					this.Players[0].speed = 0;
				}
			}
			
			if(move.p1.down){ // s key (down)
				if (this.Players[0].y < (canvas.height - (canvas.height / 27)) - canvas.height / 6.75){
					this.Players[0].speed = 5;
				} else {
					this.Players[0].speed = 0;
				}
			}
			
			if(!move.p1.up && !move.p1.down)
				this.Players[0].speed = 0;
		}
		
		if(this.Players[1].type != "AI"){
			if (move.p2.up) { // up
				if (this.Players[1].y > 40){
					this.Players[1].speed = -5;
				} else {
					this.Players[1].speed = 0;
				}
			}
			
			if (move.p2.down) { // down
				if (this.Players[1].y < 1040 - 160){
					this.Players[1].speed = 5;
				} else {
					this.Players[1].speed = 0;
				}
			}
			
			if (!move.p2.up && !move.p2.down) {
				this.Players[1].speed = 0;
			}
		}
	}
	
	drawBackground (){
		ctx.beginPath();
		ctx.fillStyle = '#fff'; 
		
		ctx.fillRect(canvas.width / 64, 		// = 30
						canvas.height / 36,		// = 30
						canvas.width / 1.0378378378378378378378378378378, 	// = 1850
						canvas.height / 108		// = 10
					); // upper bar
		ctx.fillRect(canvas.width / 64, 
						canvas.height / 1.0384615384615384615384615384615,	// = 1040 
						canvas.width / 1.0378378378378378378378378378378, 	// = 1850
						canvas.height / 108		// = 10
					); // lower bar
		
		// striped middle bar
		for (var i = canvas.height / 36 + canvas.height / 57; i < canvas.height - ((canvas.height / 36) * 2 + canvas.height / 27) /* = 980 = 1080 - (30 * 2) - 40 */; i += canvas.height / 27){
			ctx.fillRect(canvas.width / 2 - 5 /*half line width*/, i += canvas.height / 27, canvas.width / 192, canvas.height / 36);
		}
		
		ctx.stroke();
		ctx.closePath();
	}
	
	drawScore(){
		ctx.font = '48pt Segoe UI';
		ctx.fillStyle = '#fff';
		ctx.textAlign = "center";
		
		ctx.fillText(this.Players[0].points,
						canvas.width / 4, // middle of left side
						canvas.height / 7.2 + 24 // = 150, 24 = fontHeight / 2
					);
		ctx.fillText(this.Players[1].points, 
						(canvas.width / 4) * 3, // middle of right side
						150 + 24  // = 150, 24 = fontHeight / 2
					);
	}
	
	Logging(state){
		this.logging = state;
		this.Ball.logging = state;
		return true;
	}
	
	quit() {
		
	}
}