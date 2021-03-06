//check if the localStorage variables exist, otherwise set them to default values
//check if !game.includes("[") filters out all game names which are like '[To be added]'
// localStorage.clear();
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
				eval("localStorage."+game+"VersusNames = ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
			if (typeof eval("localStorage."+game+"CoopScores") == "undefined") {
				eval("localStorage."+game+"CoopScores = [0,0,0,0,0]");
				eval("localStorage."+game+"CoopNames= ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
		}
	}
}


var blackList = [
	"dries",
	"dreis",
	"dr1es",
	"dri3s",
	"dr13s",
	"dr3is",
	"dre1s",
	"dr31s",
	
	"pim  ",
	"pimm ",
	"pimmm",
	"p1mm ",
	"p1mmm",
	"p1m  ",
	"ppim ",
	"pp1m ",
	"ppimm",
	"pp1mm",
	"pppim",
	"ppp1m",
	" pim ",
	" p1m ",
	" ppim",
	" p1mm",
	" pp1m",
	" pimm",
	"ppim ",
	"pp1m ",
	"pimm ",
	"p1mm ",
	"  pim",
	"  p1m",
	
	"sofia",
	"s0fia",
	"sof1a",
	"sofi4",
	"s0f1a",
	"s0fi4",
	"s0f14",
	"sof14",
	"5ofia",
	"50fia",
	"5of1a",
	"50fi4",
	"5ofi4",
	"50f1a",
	"50f14",
	
	"merel",
	"m3rel",
	"mer3l",
	"m3r3l",
	"mere1",
	"m3re1",
	"mer31",
	"m3r31"
];

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
	// console.log(localName);
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
	arrScore.splice(index,0,newscore); //push new score in between the first higher and lower score
	arrScore.splice(arrScore.length - 1,1); //delete lowest score in array;
	arrName.splice(index,0,newname); //same for names
	arrName.splice(arrName.length - 1,1);
	
	eval("localStorage."+game+"Scores = arrScore"); //replace the old arrays with the new ones
	eval("localStorage."+game+"Names = arrName");
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


function loadHighscores(game, points,menu) {
	this.menu = menu || false;
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	console.log(eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game"));
	
	//this only works with a background game; not all games need to have one
	if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
		eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

	move.smooth = false;

	highscoreOverlay = new highScoreScreen(game, points,this.menu);
	highScoreInterval = setInterval(updateHighscoreScreen, 20);
}

function updateHighscoreScreen() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	highscoreOverlay.update();
}

var nextGame = true; //bool to make sure you don't immediately also press the first button in the menu and start the game again

class highScoreScreen {
	constructor(game, scoredPoints,menu) {
		console.log("Loading Highscores...");
		this.menu = menu;
		this.scoredPoints = scoredPoints;
		this.game = game;
		this.game = this.game.replace(/\s/g,'');
		this.names = retrieveLocalArray(this.game+"Names");
		this.scores = retrieveLocalArrayNum(this.game+"Scores");
		this.namePrompt = new nameWindow(canvas.width/2 - (141 + (2/3)) - (0.5*(56 + (2/3))), 640);
		this.c = 0;
		this.cbool = true;
		this.btn = new Button(canvas.width/2 - 125,850,250,50,"        CONTINUE","highscoreOverlay.updateScore()");
		if (this.menu) {
			this.menuButtons = [
				new Button(canvas.width/2 - 100, 770,200,40,"           BACK","toMenu()"),
			];
		} else {
			this.menuButtons = [
				new Button(canvas.width/2 - 130/2 - 130*2 + 20, 830,130,40,"  RESTART","restartGame()"),
				new Button(canvas.width/2 - 130/2, 830,130,40,"     MENU","toMenu()"),
				new Button(canvas.width/2 - 130/2 + 130*2 - 20, 830,130,40,"    LOBBY","exitGame()")
			];
		}
		this.executed = false;
		this.menuButtonsIndex = 0;
		this.highscore = this.newHighscore();
		this.popup = new popupWindow();
		this.showPopup = false;
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
				if (this.showPopup) {
					this.popup.update();
				}
				if (this.btn.selected && (map[13] || map.Button5) && !this.executed) {
					map.Button5 = false;
					map[13] = false;
					this.btn.execute();
					console.log(this.name);
					if (blackList.indexOf(this.name.toLowerCase()) > -1) {	
					} else {
						this.executed = true;
						this.highscore = false;
						this.names = retrieveLocalArray(this.game+"Names");
						this.scores = retrieveLocalArrayNum(this.game+"Scores");
					}
				} else {
					this.executed = false;
				}
			}
		} else {
			ctx.fillStyle = "#fff";
			ctx.font = "70px segoe ui"
			ctx.textAlign = "center"
			ctx.fillText("HIGH SCORES",canvas.width/2,canvas.height/5 - 40);
			ctx.beginPath();
			ctx.moveTo(canvas.width/6,180);
			ctx.lineTo(canvas.width/6*5,180);
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 3;
			ctx.stroke();
			ctx.font = "40px segoe ui";
			for (let i = 0; i < this.scores.length; i++) {
				ctx.textAlign = "left";
				ctx.fillText(i+1 + "      " + this.names[i],canvas.width/6*2, 285 + 65*i);
				ctx.textAlign = "right";
				ctx.fillText(this.scores[i],canvas.width/6 * 4,285 + 65*i);
			}
			ctx.textAlign = "center";
			ctx.font = "65px segoe ui";
			if (!this.menu) {
					ctx.fillText("YOUR SCORE: " + this.scoredPoints,canvas.width/2,670);
			}
			for (let i = 0; i < this.menuButtons.length; i++) {
				this.menuButtons[i].draw();
				if (i == this.menuButtonsIndex) {
					this.menuButtons[i].selected = true;
					console.log(this.executed);
					if ((map[13] || map.Button5) && nextGame) {
						map.Button5 = false;
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
				this.name = this.name + nextchar;
			} else {
				this.name = nextchar;
			}
		}
		if (blackList.indexOf(this.name.toLowerCase()) > -1) {
			this.showPopup = true;
		} else {
			if (eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.gamemode") !== "") {
				let gameMode = eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.gamemode");
				gameMode = gameMode.toString();
				let fixedGameMode = gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
				this.gameToLoad = currentGame + fixedGameMode;
			} else {
				this.gameToLoad = currentGame;
			}
			newScore(this.gameToLoad, this.scoredPoints, this.name);
		}
		
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

class popupWindow {
	constructor() {
		this.btn = new Button(canvas.width/2 - 75,canvas.height/2 + 120,150,50,"        OK","removeWindow(highscoreOverlay)");
		this.btn.selected = true;
	}
	update() {
		ctx.fillStyle = "#000";
		ctx.fillRect(canvas.width/2 - 300, canvas.height/2 - 170, 600,340);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 3;
		ctx.strokeRect(canvas.width/2 - 300, canvas.height/2 - 170, 600,340);
		ctx.font = "40px segoe ui";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center"
		ctx.fillText("UNSUPPORTED CHARACTERS",canvas.width/2,canvas.height/2 - 70);
		this.btn.draw();
		if (map.Button5 || map[13]) {
			this.btn.execute();
			map.Button5 = false;
			map[13] = false;
		}
	}
}

function removeWindow(cls) {
	cls.showPopup = false;
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
	map.Button5 = false;
}

function restartGame() {
	clearInterval(highScoreInterval);
	eval("new"+currentGame+"Game()");
	exitAsteroids();
}