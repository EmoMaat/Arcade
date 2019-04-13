
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
				eval("localStorage."+game+"VersusNames = ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
			if (typeof eval("localStorage."+game+"CoopScores") == "undefined") {
				eval("localStorage."+game+"CoopScores = [0,0,0,0,0]");
				eval("localStorage."+game+"CoopNames= ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
		}
	}
}

class HighScoresOverlay{
	constructor(game, scoredPoints){
		if(overlay.hub.active || overlay.menu.active || overlay.highscores.active || overlay.howtoplay.active || overlay.esc.active)
			return console.log("Trying to instanciate the HighScores while another overlay is still active.")

		console.log("Removing leftovers...")
		quitOpenGame();
		while(document.querySelectorAll("canvas").length > 1){
			let c = document.querySelectorAll("canvas").length - 1;
			document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
		}
		
		console.log("Loading HighScores...")

		this.game = game;
		this.scoredPoints = scoredPoints;
		this.highscore = scoredPoints > this.retrieveLocalArrayNum(game+"Scores")[4] ? true : false;

		this.NameWindow = {};
		this.HighScoreWindow = {};
		this.interval;

		// from here all canvases are loaded one by one
		this.canvas_Header();
		overlay.highscores.active = true;
		overlay.highscores.object = this;
	}

	canvas_Header(){
		this.HighScoreHeader = document.createElement('canvas');
		this.HighScoreHeader.id = 'HighScoreHeader';
		this.HighScoreHeader.width = canvas.width;
		this.HighScoreHeader.height = canvas.height / 5.4;
		this.HighScoreHeader.style.top = 0;
		this.HighScoreHeader.style.left = 0;
		this.HighScoreHeader.style.position = "absolute";
		this.HighScoreHeader.style.cursor = "none";
		document.body.appendChild(this.HighScoreHeader);

		this.HighScoreHeaderCanvas = document.getElementById("HighScoreHeader");		// canvas stuff
		this.HighScoreHeaderCtx = this.HighScoreHeaderCanvas.getContext("2d");			// canvas stuff

		this.HighScoreHeaderCtx.fillStyle = "#fff";
		this.HighScoreHeaderCtx.font = "70px segoe ui"
		this.HighScoreHeaderCtx.textAlign = "center"
		if(this.highscore){
			this.HighScoreHeaderCtx.fillText("NEW HIGHSCORE!",this.HighScoreHeaderCanvas.width/2,this.HighScoreHeaderCanvas.height/1.8);
			this.canvas_SaveScore();
		} else {
			this.HighScoreHeaderCtx.fillText("HIGH SCORES",this.HighScoreHeaderCanvas.width/2,this.HighScoreHeaderCanvas.height/1.8);
			this.canvas_loadHighScores();
		}

		this.HighScoreHeaderCtx.beginPath();
		this.HighScoreHeaderCtx.moveTo(this.HighScoreHeaderCanvas.width / 6, this.HighScoreHeaderCanvas.height / 1.2);
		this.HighScoreHeaderCtx.lineTo(this.HighScoreHeaderCanvas.width / 6 * 5, this.HighScoreHeaderCanvas.height / 1.2);
		this.HighScoreHeaderCtx.strokeStyle = "#fff";
		this.HighScoreHeaderCtx.lineWidth = 3;
		this.HighScoreHeaderCtx.stroke();
	}

	canvas_SaveScore(){		
		// give the ability to name
		this.namewindow = new NameWindow(this.scoredPoints);

		// assign the move event listeners
		move._left.setEventListener(()=>{
			this.namewindow.updateSelection("left")
		})
		move._right.setEventListener(()=>{
			this.namewindow.updateSelection("right")
		})
		move._up.continuous = true;
		move._up.hickup = true;
		move._up.setEventListener(()=>{
			this.namewindow.updateSelection("up")
		})
		move._down.continuous = true;
		move._down.hickup = true;
		move._down.setEventListener(()=>{
			this.namewindow.updateSelection("down")
		});

		// listen for accept or discard input
		var self = this;
		this.interval = new Interval(()=>{
			if(map[13] || gmap[0].buttonA){	//enter
				self.namewindow.optionButtons[0].execute();
				map[13] = false;
				gmap[0].buttonA = false;
			}
			if(map[27] || gmap[0].buttonB){	// esc
				self.namewindow.optionButtons[1].execute();
				map[13] = false;
				gmap[0].buttonB = false;
			}
		})
	}

	canvas_loadHighScores(){
		while(document.querySelectorAll("canvas").length > 1){
			let c = document.querySelectorAll("canvas").length - 1;
			if(document.querySelectorAll("canvas")[c].id !== "HighScoreHeader"){
				document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
			}
		}

		this.highscorewindow = new HighScoreWindow(this.scoredPoints, this.retrieveLocalArray(this.game+"Names"), this.retrieveLocalArrayNum(this.game+"Scores"))
	
		// assign the move event listeners
		move._left.setEventListener(()=>{
			if(this.highscorewindow.selected > 0){
				this.highscorewindow.selected--;
				this.highscorewindow.update()
			}
		})
		move._right.setEventListener(()=>{
			if(this.highscorewindow.selected < this.highscorewindow.buttons.length - 1){
				this.highscorewindow.selected++;
				this.highscorewindow.update()
			}
		})

		// listen for accept or discard input
		var self = this;
		this.interval = new Interval(()=>{
			if(map[13] || gmap[0].buttonA){	//enter
				self.highscorewindow.buttons[self.highscorewindow.selected].execute();
				map[13] = false;
				gmap[0].buttonA = false;
			}
		})
	}

	saveHighScore(game = null,score = null,name = "") {
		if(game == null)
			game = this.game;
		
		if(score == null)
			score = this.scoredPoints;

		if(name == "")
			for(let b = 0; b < this.namewindow.charButtons.length; b++)
				name += this.namewindow.charButtons[b].value;

		// get the scores and names associated with the given game
		let arrScore = this.retrieveLocalArrayNum(game+"Scores");
		let arrName = this.retrieveLocalArray(game+"Names");

		// check which place is supposed to be replaced
		for (var i = 0; i < arrScore.length; i++)
			if (score > arrScore[i])
				break;

		arrScore.splice(i,1,score); 	// replace the new score with the old one
		arrName.splice(i,1,name); 	// same for names
		
		eval("localStorage."+game+"Scores = arrScore"); //replace the old arrays with the new ones
		eval("localStorage."+game+"Names = arrName");

		this.canvas_loadHighScores();
	}

	retrieveLocalArray(localName) {
		// get the values as a string, and remove any commas
		return localStorage.getItem(localName).split(',');
	}

	retrieveLocalArrayNum(localName) {
		// console.log(localName);
		// get the values as a string, and remove any commas
		let items = localStorage.getItem(localName).split(',');
		for (let i = 0; i < items.length; i++)
			//now convert the 'stringed' numbers into numberical numbers
			items[i] = Number(items[i]);
		
		return items;
	}

	purge(){
		while(document.querySelectorAll("canvas").length > 0){
			let c = document.querySelectorAll("canvas").length - 1;
			document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
		}

		this.interval.stop();
		
		move.continuous = false;
		move.hickup = false;
		overlay.highscores.active = false;
		overlay.highscores.object = {};
	}
	
	toHub() {
		this.purge();
		loadHub();
	}
	
	toMenu() {
		this.purge();
		forceLoad(currentGame);
		alert();
	}
	
	restartGame() {
		this.purge();
		eval("new"+currentGame+"Game()");
	}
}

class HighScoreWindow{
	constructor(score, names, scores){
		this.createCanvases();

		this.HighScoreListCtx.fillStyle = "#fff";
		this.HighScoreListCtx.textAlign = "center"
		this.HighScoreListCtx.font = "50px segoe ui";
		this.HighScoreListCtx.fillText("YOUR SCORE: " + score,canvas.width/6*3, 70);

		for (let i = 0; i < scores.length; i++) {
			this.HighScoreListCtx.textAlign = "left";
			this.HighScoreListCtx.fillText((i+1), canvas.width / 4, 100 + 65 *(i+1))
			this.HighScoreListCtx.textAlign = "center";
			this.HighScoreListCtx.fillText(names[i], canvas.width / 2, 100 + 65 *(i+1))
			this.HighScoreListCtx.textAlign = "right";
			this.HighScoreListCtx.fillText(scores[i] ,canvas.width * 0.75,100 + 65 *(i+1));
		}

		this.selected = 1;

		this.buttons = [
			new Button(this.canvas.width/4 - 65,200,130,40,"    HUB","overlay.highscores.object.toHub()", this.ctx),
			new Button(this.canvas.width/2 - 65,200,130,40,"  RESTART","overlay.highscores.object.restartGame()", this.ctx),
			new Button(this.canvas.width/1.5 + 65,200,130,40,"    MENU","overlay.highscores.object.toMenu()", this.ctx)
		];

		this.update();
	}

	update(){
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		for(let b = 0; b < this.buttons.length; b++){
			this.buttons[b].selected = b == this.selected;
			this.buttons[b].draw();
		}
	}

	createCanvases(){
		this.HighScoreList = document.createElement('canvas');
		this.HighScoreList.id = 'HighScoreList';
		this.HighScoreList.width = canvas.width;
		this.HighScoreList.height = canvas.height / 2.4;
		this.HighScoreList.style.top = canvas.height / 5.4;
		this.HighScoreList.style.left = 0;
		this.HighScoreList.style.position = "absolute";
		this.HighScoreList.style.cursor = "none";
		document.body.appendChild(this.HighScoreList);

		this.HighScoreListCanvas = document.getElementById("HighScoreList");		// canvas stuff
		this.HighScoreListCtx = this.HighScoreListCanvas.getContext("2d");			// canvas stuff

		this.HighScoreOptions = document.createElement('canvas');
		this.HighScoreOptions.id = 'HighScoreOptions';
		this.HighScoreOptions.width = canvas.width;
		this.HighScoreOptions.height = Math.ceil(canvas.height - canvas.height / 5.4 - canvas.height / 2.4);
		this.HighScoreOptions.style.top = canvas.height / 5.4 + canvas.height / 2.4;
		this.HighScoreOptions.style.left = 0;
		this.HighScoreOptions.style.position = "absolute";
		this.HighScoreOptions.style.cursor = "none";
		document.body.appendChild(this.HighScoreOptions);

		this.canvas = document.getElementById("HighScoreOptions");		// canvas stuff
		this.ctx = this.canvas.getContext("2d");			// canvas stuff
	}
}

class NameWindow{
	constructor(score){
		this.scoredPoints = score;
		this.createCanvases();

		this.selected = 0;
		this.charButtons = [];
		this.optionButtons = [];

		for(let b = 0; b < 5; b++)
			this.charButtons.push(new NameWindowButton(b, this.ctx));

		this.optionButtons.push(
			new Button(this.canvas.width/2 - 230 - 120,450,230,40,"SAVE","overlay.highscores.object.saveHighScore()", this.ctx),
			new Button(this.canvas.width/2 + 120,450,270,40,"DON'T SAVE","overlay.highscores.object.canvas_loadHighScores()", this.ctx),
		);

		for(let b = 0; b < this.optionButtons.length; b++)
			this.optionButtons[b].selected = true;

		this.update();
	}
	updateSelection(movement){
		if(movement == "left" && this.selected > 0)
			this.selected--;

		if(movement == "right" && this.selected < this.charButtons.length - 1)
			this.selected++;

		if(movement == "up")
			if(this.charButtons[this.selected].charsetIndex > 0)
				this.charButtons[this.selected].charsetIndex--;
			else
				this.charButtons[this.selected].charsetIndex = this.charButtons[this.selected].charset.length - 1;

		if(movement == "down")
			if(this.charButtons[this.selected].charsetIndex < this.charButtons[this.selected].charset.length - 1)
				this.charButtons[this.selected].charsetIndex++;
			else
				this.charButtons[this.selected].charsetIndex = 0;

		this.update();
	}

	update(){
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		for(let b = 0; b < 5; b++){
			this.charButtons[b].selected = b == this.selected;
			this.charButtons[b].update();

			if(this.charButtons[b].selected){
				// arrow left
				if(this.selected > 0){
					this.ctx.beginPath();
					this.ctx.moveTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) - 60), 100);
					this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) - 60), 160);
					this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) - 60) - 40, 130);
					this.ctx.fill();
				}
				// arrow right
				if(this.selected < this.charButtons.length - 1){
					this.ctx.beginPath();
					this.ctx.moveTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) + 60), 100);
					this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) + 60), 160);
					this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (b + 1) + 60) + 40, 130);
					this.ctx.fill();
				}
			}
		}
		this.optionButtons[1].draw();
		this.optionButtons[0].draw();	

		this.ctx.font = "20px Verdana";
		this.ctx.strokeStyle = "white";
		this.ctx.lineWidth = 2;

		this.ctx.fillText("Enter   /    A", this.optionButtons[0].x + 110, this.optionButtons[0].y - this.optionButtons[0].height + 8)
		this.ctx.strokeRect(this.optionButtons[0].x + 105, this.optionButtons[0].y - this.optionButtons[0].height * 1.5, 64, this.optionButtons[0].height)
		this.ctx.beginPath();
		this.ctx.arc(this.optionButtons[0].x + 228.5, this.optionButtons[0].y - this.optionButtons[0].height, 20, 0, 2 * Math.PI);
		this.ctx.stroke();

		this.ctx.fillText("Esc   /    B", this.optionButtons[1].x + 170, this.optionButtons[1].y - this.optionButtons[1].height + 8)
		this.ctx.strokeRect(this.optionButtons[1].x + 165, this.optionButtons[0].y - this.optionButtons[1].height * 1.5, 45, this.optionButtons[1].height)
		this.ctx.beginPath();
		this.ctx.arc(this.optionButtons[1].x + 268.5, this.optionButtons[1].y - this.optionButtons[1].height, 20, 0, 2 * Math.PI);
		this.ctx.stroke();	
	}

	async createCanvases(){
		this.HighScoreSaver = document.createElement('canvas');
		this.HighScoreSaver.id = 'HighScoreSaver';
		this.HighScoreSaver.width = canvas.width;
		this.HighScoreSaver.height = canvas.height / 8.3;
		this.HighScoreSaver.style.paddingTop = canvas.height / 21.6;
		this.HighScoreSaver.style.top = canvas.height / 5.4;
		this.HighScoreSaver.style.left = 0;
		this.HighScoreSaver.style.position = "absolute";
		this.HighScoreSaver.style.cursor = "none";
		document.body.appendChild(this.HighScoreSaver);

		this.HighScoreSaverCanvas = document.getElementById("HighScoreSaver");		// canvas stuff
		this.HighScoreSaverCtx = this.HighScoreSaverCanvas.getContext("2d");			// canvas stuff

		this.HighScoreOptions = document.createElement('canvas');
		this.HighScoreOptions.id = 'HighScoreOptions';
		this.HighScoreOptions.width = canvas.width;
		this.HighScoreOptions.height = Math.ceil(canvas.height - canvas.height / 5.4 - canvas.height / 8.3 - canvas.height / 10.8);
		this.HighScoreOptions.style.paddingTop = canvas.height / 21.6;
		this.HighScoreOptions.style.top = canvas.height / 5.4 + canvas.height / 8.3 + canvas.height / 21.6;
		this.HighScoreOptions.style.left = 0;
		this.HighScoreOptions.style.position = "absolute";
		this.HighScoreOptions.style.cursor = "none";
		document.body.appendChild(this.HighScoreOptions);

		this.canvas = document.getElementById("HighScoreOptions");		// canvas stuff
		this.ctx = this.canvas.getContext("2d");			// canvas stuff

		this.HighScoreSaverCtx.fillStyle = "#fff";
		this.HighScoreSaverCtx.textAlign = "center"
		this.HighScoreSaverCtx.font = "50px segoe ui";
		this.HighScoreSaverCtx.fillText("SCORE: " + this.scoredPoints,this.HighScoreSaverCanvas.width/2, this.HighScoreSaverCanvas.height / 3);
		
		this.HighScoreSaverCtx.fillText("ENTER YOUR NAME",this.HighScoreSaverCanvas.width/2, this.HighScoreSaverCanvas.height / 1.1);
	}
}

class NameWindowButton{
	constructor(id, ctx){
		this.selected = false;
		this.charsetIndex = 0;
		this.charset = new Charset();
		this.value = this.charset[this.charsetIndex];

		this.ctx = ctx;
		this.id = id;
	}
	update(){
		this.value = this.charset[this.charsetIndex];

		this.ctx.fillStyle = "#fff";
		this.ctx.textAlign = "center";

		if(this.selected)
			this.ctx.font = "bold 90px segoe ui";
		else
			this.ctx.font = "90px segoe ui";

		// char value
		this.ctx.fillText(this.value,(canvas.width / 2 - 3 * 180) + 180 * (this.id + 1),160);
		// arrow up
		this.ctx.beginPath();
		this.ctx.moveTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)) - 25, 50);
		this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)) + 25, 50);
		this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)), 15);
		this.ctx.fill();
		// arrow down
		this.ctx.beginPath();
		this.ctx.moveTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)) - 25, 210);
		this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)) + 25, 210);
		this.ctx.lineTo((canvas.width / 2 - 3 * 180) + (180 * (this.id + 1)), 245);
		this.ctx.fill();
	}
}

class Charset {
	constructor() {
		return ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"," "];
	}
}