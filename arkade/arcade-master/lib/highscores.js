// localStorage.clear();

//check if the localStorage variables exist, otherwise set them to default values
//check if !game.includes("[") filters out all game names which are like '[To be added]'
for (let i = 0; i < games.length; i++) {
	let game = games[i].replace(/\s/g,'');
	if (!game.includes("[")) {
		if (typeof eval("localStorage."+game+"Scores") == "undefined") {
			eval("localStorage."+game+"Scores = [0,0,0,0,0]");
			eval("localStorage."+game+"Names = ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
		}
		//make two more for asteroids since it uses 3 different highscores
		if (game == "Asteroids") {
			if (typeof eval("localStorage."+game+"VersusScores") == "undefined") {
				eval("localStorage."+game+"VersusScores = [0,0,0,0,0]");
				eval("localStorage."+game+"VersusNames = ['VERSUS','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
			if (typeof eval("localStorage."+game+"CoopScores") == "undefined") {
				eval("localStorage."+game+"CoopScores = [0,0,0,0,0]");
				eval("localStorage."+game+"CoopNames= ['CO-OP','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
		}
	}
}
// localStorage.removeItem("AsteroidsCoopScores");
// localStorage.removeItem("AsteroidsVersusScores");
//log all localstorage vars:

// console.log("localStorages variables:");
// for (i = 0; i < localStorage.length; i++)   {
    // console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
// }

//retrieve a local array with strings:
function retrieveLocalArray(localName) {
	let arr = localStorage.getItem(localName);//first get the values as a string, seperated by commas
	let output = arr.split(','); //split the array from commas
	return output;
}

//retrieve a local numeric array:
function retrieveLocalArrayNum(localName) {
	let arr = localStorage.getItem(localName); //first get the values as a string, seperated by commas
	let output = arr.split(','); //split the array from commas
	for (let i = 0; i < output.length; i++) { //loop trough array with strings
		output[i] = Number(output[i]); //now convert the 'stringed' numbers into numberical numbers
	}
	return output;
}

function newScore(game,score,name) {
	let arrScore = retrieveLocalArrayNum(game+"Scores");
	let arrName = retrieveLocalArray(game+"Names");
	let newscore = score,
		newname = name;
	let lowerScores = [];
	for (let i = 0; i < arrScore.length; i++) {
		if (newscore > arrScore[i]) {
			var index = i;
			break;
		}
 	}
	console.log(newname);
	arrScore.splice(index,0,newscore); //push new score in between the first higher and lower score
	arrScore.splice(arrScore.length - 1,1); //delete lowest score in array;
	arrName.splice(index,0,newname); //same for names
	arrName.splice(arrName.length - 1,1);
	
	eval("localStorage."+currentGame+"Scores = arrScore"); //replace the old arrays with the new ones
	eval("localStorage."+currentGame+"Names = arrName");
}

var charset = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"," "];

class Char {
	constructor(character,selected) {
		this.selected = selected || false;
		this.character = character;
	}
}

var highScoreInterval;
var highScoreOverlay;


function loadHighscores(game, points) {
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	console.log(eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game"));
	
	//this only works with a background game; not all games need to have one
	if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
		eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

	move.smooth = false;

	highscoreOverlay = new highScoreScreen(game, points);
	highScoreInterval = setInterval(updateHighscoreScreen, 20);
}

function updateHighscoreScreen() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	highscoreOverlay.update();
}

var nextGame = true; //bool to make sure you don't immediately also press the first button in the menu and start the game again

class highScoreScreen {
	constructor(game, scoredPoints) {
		console.log("Loading Highscores...");

		this.scoredPoints = scoredPoints;
		this.game = game;
		this.game = this.game.replace(/\s/g,'');
		this.names = retrieveLocalArray(this.game+"Names");
		this.scores = retrieveLocalArrayNum(this.game+"Scores");
		this.namePrompt = new nameWindow(canvas.width/2 - (141 + (2/3)) - (0.5*(56 + (2/3))), 640);
		this.c = 0;
		this.cbool = true;
		this.btn = new Button(canvas.width/2 - 125,850,250,50,"        CONTINUE","highscoreOverlay.updateScore()");
		this.menuButtons = [
			new Button(canvas.width/6 * 2.2 - 150, 1000,150,50,"  RESTART","restartGame()"),
			new Button(canvas.width/6 * 3 - 125, 1000,150,50,"     MENU","toMenu()"),
			new Button(canvas.width/6 * 3.8 - 100, 1000,150,50,"    LOBBY","exitGame()")
		];
		this.executed = false;
		this.menuButtonsIndex = -1;
		this.highscore = this.newHighscore();
	}
	update() {
		if (this.highscore) {
			if (this.cbool) {
				this.c++;
			}
			ctx.font = "80px segoe ui";
			ctx.textAlign = "center";
			ctx.fillStyle = "#fff";
			if (this.c > 15) {
				ctx.fillText("NEW HIGHSCORE!",canvas.width/2, 150);
				ctx.beginPath();
				ctx.moveTo(canvas.width/6,180);
				ctx.lineTo(canvas.width/6*5,180);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 3;
				ctx.stroke();
			}
			if (this.c > 60) {
				ctx.font = "50px segoe ui";
				ctx.fillText("YOUR SCORE: " + this.scoredPoints,canvas.width/2, 300);
			}
			if (this.c > 105) {
				ctx.fillText("NAME: ",canvas.width/2, 450);
			}
			if (this.c > 150) {
				this.cbool = false;
				this.namePrompt.update();
				this.btn.draw();
				if (this.namePrompt.selected == this.namePrompt.chars.length) {
					this.btn.selected = true;
				} else {
					this.btn.selected = false;
				}
				if (this.btn.selected && (map[13] || map.Button0) && !this.executed) {
					this.btn.execute();
					this.executed = true;
					this.highscore = false;
					this.names = retrieveLocalArray(this.game+"Names");
					this.scores = retrieveLocalArrayNum(this.game+"Scores");
				} else {
					this.executed = false;
				}
			}
		} else {
			ctx.fillStyle = "#fff";
			ctx.font = "70px segoe ui"
			ctx.textAlign = "center"
			ctx.fillText("HIGH SCORES",canvas.width/2,150);
			ctx.beginPath();
			ctx.moveTo(canvas.width/6,180);
			ctx.lineTo(canvas.width/6*5,180);
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.font = "50px segoe ui";
			for (let i = 0; i < this.scores.length; i++) {
				ctx.textAlign = "left";
				ctx.fillText(i+1 + "      " + this.names[i],canvas.width/6*2, 325 + 75*i);
				ctx.textAlign = "right";
				ctx.fillText(this.scores[i],canvas.width/6 * 4,325 + 75*i);
			}
			ctx.textAlign = "center";
			ctx.font = "65px segoe ui";
			ctx.fillText("YOUR SCORE: " + this.scoredPoints,canvas.width/2,810);
			for (let i = 0; i < this.menuButtons.length; i++) {
				this.menuButtons[i].draw();
				if (i == this.menuButtonsIndex) {
					this.menuButtons[i].selected = true;
					console.log(this.executed);
					if ((map[13] || map.Button0) && nextGame) {
						this.menuButtons[i].execute();
						nextGame = false;
					} else {
						nextGame = true;
					}
				} else {
					this.menuButtons[i].selected = false;
				}
			}
			if (move.right && this.menuButtonsIndex < this.menuButtons.length - 1) {
				this.menuButtonsIndex++;
			}
			if (move.left && this.menuButtonsIndex > 0) {
				this.menuButtonsIndex--;
			}
		}
	}
	updateScore() {
		for (let i = 0; i < this.namePrompt.chars.length; i++) {
			let nextchar = this.namePrompt.chars[i].character.toString();
			if (i > 0) {
				var name = name + nextchar;
			} else {
				var name = nextchar;
			}
		}
		console.log(name,"before passing");
		newScore(currentGame, this.scoredPoints, name);
	}
	newHighscore() { //check if a new highscore has been made
		for (let i = 0; i < this.scores.length; i++) {
			if (this.scoredPoints > this.scores[i]) {
				return true;
				break;
			} else if (i == this.scores.length){
				return false;
			}
		}
	}
}

class nameWindow {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.counter = 0;
		this.chars = [];
		for (let i = 0 ; i < 5; i++) {
			this.chars.push(new Char("A"));
		}
		this.chars[0].selected = true;
		this.pressed = false;
		this.charsetIndex = 0;
		this.selected = 0;
	}
	update() {
		ctx.textAlign = "center";
		ctx.font = "90px segoe ui";
		for (let i = 0; i < this.chars.length; i++) {
			ctx.fillStyle = "#fff";
			if (this.chars[i].selected == true) {
				ctx.fillText(this.chars[i].character,this.x + 85*i,this.y);
				ctx.beginPath();
				ctx.moveTo((this.x + 85*i) - 25,this.y + 15);
				ctx.lineTo((this.x + 85*i) + 25,this.y + 15);
				ctx.lineTo((this.x + 85*i),this.y + 50);
				ctx.lineTo((this.x + 85*i) - 25,this.y + 15);
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo((this.x + 85*i) - 25,this.y - 15 - 62);
				ctx.lineTo((this.x + 85*i) + 25,this.y - 15 - 62);
				ctx.lineTo((this.x + 85*i),this.y - 50 - 62);
				ctx.lineTo((this.x + 85*i) - 25,this.y - 15 - 62);
				ctx.fill();
				if (move.up) {
					if (this.charsetIndex < charset.length - 1) {
						this.charsetIndex++;
					} else if (this.charsetIndex == charset.length - 1) {
						this.charsetIndex = 0;
					}
					this.chars.splice(i,1);
					this.chars.splice(i,0,new Char(charset[this.charsetIndex],true));
				} 
				if (move.down) {
					if (this.charsetIndex >= 0) {
						this.charsetIndex--;
					}
					if (this.charsetIndex <= 0) {
						console.log("test");
						this.charsetIndex = charset.length - 1;
					}
					this.chars.splice(i,1);
					this.chars.splice(i,0,new Char(charset[this.charsetIndex],true));
				}
			} else {
				ctx.fillStyle = "#fff";
				ctx.fillText(this.chars[i].character,this.x + 85*i,this.y);
			}
			if (move.right) {
				if (this.selected < this.chars.length) {
					this.selected++;
				}
				for (let i = 0; i < charset.length; i++) { //make sure the index is set at the character you are currently on:		
					if (this.chars[this.selected] != null) { //make sure the continue button doesnt get checked for character, because it doesnt have one and cause an error.
						if (this.chars[this.selected].character == charset[i]) {
							// console.log(this.chars[this.selected].character);
							this.charsetIndex = i;
							break;
						}
					}
				}
			}
			if (move.left) {
				if (this.selected > 0) {
					this.selected--;
				}
				for (let i = 0; i < charset.length; i++) {
					if (this.chars[this.selected] == charset[i]) {
						this.charsetIndex = i;
						break;
					}
				}
			}
			for (let i = 0; i < this.chars.length; i++) {
				if (i == this.selected) {
					this.chars[i].selected = true;
				} else {
					this.chars[i].selected = false;
				}
			}
		}
	}
}

function exitGame() {
	clearInterval(highScoreInterval);
	loadHub();
	exitAsteroids();
}

function toMenu() {
	clearInterval(highScoreInterval);
	forceLoad(currentGame);
	map[13] = false;
	map.Button0 = false;
}

function restartGame() {
	clearInterval(highScoreInterval);
	eval("new"+currentGame+"Game()");
	exitAsteroids();
}