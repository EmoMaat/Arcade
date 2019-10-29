class MenuInterface {
	constructor() {
		if(interfaces.hub.active || interfaces.menu.active || interfaces.highscores.active || interfaces.howtoplay.active || interfaces.esc.active)
			return console.log("Trying to instanciate the MenuInterface while another interfaces is still active.")

		move.multiplayer = false;
		move.continuous = false;
		interfaces.menu.active = true;
		map[13] = gmap[0].buttonA = false;

		// this contains all the buttons in the menu
		this._buttons = [];
		this.selected = 0;

		// the background game variables
		this._backgroundGame = null; // = new GameName();

		// create a canvas containing the options
		let MenuInterface = document.createElement('canvas');
		MenuInterface.id = 'MenuInterface';
		MenuInterface.width = 550;
		MenuInterface.height = 0;			// is set later
		MenuInterface.style.left = 0;
		MenuInterface.style.bottom = 0;
		MenuInterface.style.position = "absolute";
		MenuInterface.style.cursor = "none";
		MenuInterface.style.zIndex = 999;
		document.body.appendChild(MenuInterface);

		this.MenuInterfaceCanvas = document.getElementById("MenuInterface");		// canvas stuff
		this.MenuInterfaceCtx = this.MenuInterfaceCanvas.getContext("2d");	// canvas stuff

		move._up.setEventListener(()=>{
			if (move.up)
				if (this.selected > 0)
					this.selected -= 1;

			this.update();
		});
		move._down.setEventListener(()=>{
			if (move.down)
				if (this.selected < this._buttons.length - 1)
					this.selected += 1;

			this.update();
		});

		var self = this;
		this.interval = new Interval(() => {
			// this handles the background game
			if (self.backgroundGame != null)
				self.backgroundGame.update();

			if (gmap[0].buttonA || map[13])
				for (var i = 0; i < self._buttons.length; i++)
					if (i == self.selected){
						map[13] = false;
						gmap[0].buttonA = false;

						self._buttons[i].execute();
						self.selected = 0;
						break;
					}
		});

		interfaces.menu.active = true;
		interfaces.menu.object = this;
	}

	update() {
		// draw the buttons
		this.MenuInterfaceCtx.clearRect(0, 0, this.MenuInterfaceCanvas.width, this.MenuInterfaceCanvas.height);
		for (var i = 0; i < this._buttons.length; i++) {
			if (i == this.selected) { // the selected one should look different
				this._buttons[i].selected = true;
				if (gmap[0].buttonA || map[13]) { // if we want to use one of the buttons
					map[13] = false;
					gmap[0].buttonA = false;

					this._buttons[i].execute();
					this.selected = 0;
					break;
				}
			} else {
				this._buttons[i].selected = false;
			}
			this._buttons[i].draw();
		}
	}

	exit(){
		this.interval.stop();
		if(document.getElementById("MenuInterface") !== null)
			document.getElementById("MenuInterface").parentElement.removeChild(document.getElementById("MenuInterface"));
		if(document.getElementById("MenuInterfaceTitle") !== null)
			document.getElementById("MenuInterfaceTitle").parentElement.removeChild(document.getElementById("MenuInterfaceTitle"));


		if(typeof interfaces.game.object.exit !== "undefined")
			if(typeof interfaces.game.object.exit === "function")
				interfaces.menu.object.backgroundGame.exit();

		interfaces.menu.active = false;
		interfaces.menu.object = {};

		move._up.setEventListener(null);
		move._down.setEventListener(null);
	}

	set backgroundGame(object){
		this._backgroundGame = object;
		interfaces.game.interval = this.interval;
		move.continuous = false;
		move.multiplayer = false;
	} get backgroundGame(){ return this._backgroundGame;}

	set header(src = ""){
		if(src !== ""){
			// create a canvas containing the options
			let MenuInterfaceTitle = document.createElement('canvas');
			MenuInterfaceTitle.id = 'MenuInterfaceTitle';
			MenuInterfaceTitle.width =  window.width;
			MenuInterfaceTitle.height = 150;
			MenuInterfaceTitle.style.top = 50;
			MenuInterfaceTitle.style.left = 0;
			MenuInterfaceTitle.style.position = "absolute";
			MenuInterfaceTitle.style.cursor = "none";
			MenuInterfaceTitle.style.zIndex = 999;
			document.body.appendChild(MenuInterfaceTitle);

			this.MenuInterfaceTitleCanvas = document.getElementById("MenuInterfaceTitle");		// canvas stuff
			this.MenuInterfaceTitleCtx = this.MenuInterfaceTitleCanvas.getContext("2d");	// canvas stuff

			var self = this;
			this._header = new Image();
			this._header.onload = function(){
				self.MenuInterfaceTitleCtx.drawImage(self.header, self.MenuInterfaceTitleCanvas.width / 2 - self.header.width / 2, 0)
			}
			this._header.src = "MidnightMotorists/sprites/title.png";

			this.MenuInterfaceTitleCtx.drawImage(this._header, 30, 10, 300, 100)
		}
	 }get header(){ return this._header;}

	set buttons(array){
		this._buttons = [];
		this.selected = 0;
		// make the canvas onlt as high as required
		this.MenuInterfaceCanvas.height = 50 + 80 * array.length;
		// build the array bottom up
		for(let b = array.length - 1; b >= 0; b--)
		this._buttons.push(
				new Button(80, this.MenuInterfaceCanvas.height - 50 - 80 * b, 400, 30, array[b][0], array[b][1], this.MenuInterfaceCtx)
			)

		// reload the canvas
		this.update();
	} get buttons() {return this._buttons; }
}

class EscInterface {
	constructor() {
		if(interfaces.hub.active || interfaces.menu.active || interfaces.highscores.active || interfaces.howtoplay.active || interfaces.esc.active)
			return console.log("Trying to instanciate the EscInterface while another interfaces is still active.")

			// create a canvas containing the options
		let EscOptions = document.createElement('canvas');
		EscOptions.id = 'EscOptions';
		EscOptions.width = window.width;
		EscOptions.height = window.height;
		EscOptions.style.top = 0;
		EscOptions.style.left = 0;
		EscOptions.style.position = "absolute";
		EscOptions.style.cursor = "none";
		EscOptions.style.zIndex = 999;
		document.body.appendChild(EscOptions);

		this.EscOptionsCanvas = document.getElementById("EscOptions");		// canvas stuff
		this.EscOptionsCtx = this.EscOptionsCanvas.getContext("2d");			// canvas stuff

		// create a canvas containing the the blinking word "paused"
		let EscBlink = document.createElement('canvas');
		EscBlink.id = "EscBlink";
		EscBlink.width = 200;	// required width for the text
		EscBlink.height = 60;	// required height for the text
		EscBlink.style.top = this.EscOptionsCanvas.height * (1/6);
		EscBlink.style.left = this.EscOptionsCanvas.width / 2 - EscBlink.width / 2;
		EscBlink.style.position = "absolute";
		EscBlink.style.cursor = "none";
		EscBlink.style.zIndex = 999;
		document.body.appendChild(EscBlink);

		this.EscBlinkCanvas = document.getElementById("EscBlink");		// canvas stuff
		this.EscBlinkCtx = this.EscBlinkCanvas.getContext("2d");			// canvas stuff

		this.selected = 0;
		this.blink = 0;
		this.continuous_state = move.continuous;
		this.multiplayer_state = move.multiplayer;

		move.continuous = false;
		move.multiplayer = false;

		// "this" is not available in the setInterval so we save the instance
		var self = this;

		// buttons present in the interfaces
		this.buttons = [
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Continue", "interfaces.esc.object.exit()", self.EscOptionsCtx),
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16 + this.EscOptionsCanvas.height / 13.5, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Exit to menu", "interfaces.esc.object.menu()", self.EscOptionsCtx),
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16 + (this.EscOptionsCanvas.height / 13.5) * 2, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Exit to hub", "interfaces.esc.object.hub()", self.EscOptionsCtx)
		];

		self.EscOptionsCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
		self.EscOptionsCtx.fillRect(0, 0, self.EscOptionsCtx.width, self.EscOptionsCtx.height);

		// we check for key events
		move._up.setEventListener(function(){
			if (self.selected > 0)
				self.selected -= 1;

			self.update();
		});

		// we check for key events
		move._down.setEventListener(function(){
			if (self.selected < self.buttons.length - 1)
				self.selected += 1;

			self.update();
		});

		// the update the pause blinking
		this.interval = new Interval(function () {
			self.EscBlinkCtx.clearRect(0, 0, self.EscBlinkCanvas.width, self.EscBlinkCanvas.height);
			if (self.blink <= 50) {
				self.EscBlinkCtx.font = '48pt segoe ui';
				self.EscBlinkCtx.fillStyle = '#fff';
				self.EscBlinkCtx.textAlign = "center";
				self.EscBlinkCtx.fillText("Paused", self.EscBlinkCanvas.width / 2, self.EscBlinkCanvas.height - 10);
				self.blink++;
			} else if (self.blink > 50 && self.blink <= 100) {
				self.blink++;
			} else {
				self.blink = 0;
			}

			if (gmap[0].buttonA || map[13])
				for (var i = 0; i < self.buttons.length; i++)
					if (i == self.selected){
						map[13] = false;
						gmap[0].buttonA = false;

						self.buttons[i].execute();
						self.selected = 0;
						break;
					}
		}, 15);

		this.update();

		interfaces.game.interval.pause()
		interfaces.esc.active = true;
		interfaces.esc.object = this;
	}
	update() {
		// draw the buttons
		this.EscOptionsCtx.clearRect(0, 0, this.EscOptionsCanvas.width, this.EscOptionsCanvas.height);

		for (var i = 0; i < this.buttons.length; i++) {
			if (i == this.selected) { // the selected one should look different
				this.buttons[i].selected = true;
				if (gmap[0].buttonA || map[13]) { // if we want to use one of the buttons
					map[13] = false;
					gmap[0].buttonA = false;

					this.buttons[i].execute();
					this.selected = 0;
					break;
				}
			} else {
				this.buttons[i].selected = false;
			}
			this.buttons[i].draw()
		}
	}
	exit() {
		this.interval.stop();
		interfaces.esc.active = false;
		interfaces.esc.object = {};

		if(document.getElementById("EscOptions") !== null && document.getElementById("EscBlink") !== null){
			document.getElementById("EscOptions").parentElement.removeChild(document.getElementById("EscOptions"))
			document.getElementById("EscBlink").parentElement.removeChild(document.getElementById("EscBlink"))
		}

		move.continuous = this.continuous_state;
		move.multiplayer = this.multiplayer_state;

		move._up.setEventListener(null);
		move._down.setEventListener(null);

		interfaces.game.interval.resume() //we resume the game
	}
	menu() {
		exit_open_game();
		exit_open_interfaces();
		remove_all_canvases();

		interfaces.game.interval.stop();

		load(currentGame);
	}
	hub() {
		exit_open_game();
		exit_open_interfaces();
		remove_all_canvases();

		interfaces.game.interval.stop();

		loadingBar("Hub", 'new HubInterface');
	}
}

class HighScoresInterface{
	constructor(game, scoredPoints){
		console.log("Removing leftovers...")

		exit_open_game();
		exit_open_interfaces();
		remove_all_canvases();

		console.log("Loading HighScores...")

		this.game = game.replace(/\s/,'');
		this.scoredPoints = scoredPoints;
		this.highscore = scoredPoints > this.retrieveLocalArrayNum(this.game+"Scores")[4] ? true : false;

		this.NameWindow = {};
		this.HighScoreWindow = {};
		this.interval;

		// from here all canvases are loaded one by one
		this.canvas_Header();
		interfaces.highscores.active = true;
		interfaces.highscores.object = this;
	}

	canvas_Header(){
		this.HighScoreHeader = document.createElement('canvas');
		this.HighScoreHeader.id = 'HighScoreHeader';
		this.HighScoreHeader.width = window.width;
		this.HighScoreHeader.height = window.height / 5.4;
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
				map[27] = false;
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

	exit(){
		while(document.querySelectorAll("canvas").length > 0){
			let c = document.querySelectorAll("canvas").length - 1;
			document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
		}

		this.interval.stop();

		move.continuous = false;
		move.hickup = false;
		move._left.setEventListener(null);
		move._right.setEventListener(null);
		move._up.setEventListener(null);
		move._down.setEventListener(null);
		interfaces.highscores.active = false;
		interfaces.highscores.object = {};
	}

	toHub() {
		this.exit();
		loadingBar('hub', 'new HubInterface')
	}

	toMenu() {
		this.exit();
		load(currentGame);
	}

	restartGame() {
		this.exit();
		eval("new"+currentGame+"Game()");
	}
}

class HighScoreWindow{
	constructor(score, names, scores){
		this.createCanvases();

		this.HighScoreListCtx.fillStyle = "#fff";
		this.HighScoreListCtx.textAlign = "center"
		this.HighScoreListCtx.font = "50px segoe ui";
		this.HighScoreListCtx.fillText("YOUR SCORE: " + score, window.width/6*3, 70);

		for (let i = 0; i < scores.length; i++) {
			this.HighScoreListCtx.textAlign = "left";
			this.HighScoreListCtx.fillText((i+1),  window.width / 4, 100 + 65 *(i+1))
			this.HighScoreListCtx.textAlign = "center";
			this.HighScoreListCtx.fillText(names[i],  window.width / 2, 100 + 65 *(i+1))
			this.HighScoreListCtx.textAlign = "right";
			this.HighScoreListCtx.fillText(scores[i] , window.width * 0.75,100 + 65 *(i+1));
		}

		this.selected = 1;

		this.buttons = [
			new Button(this.canvas.width/2 - this.canvas.width / 4,200,130,40,"     HUB","interfaces.highscores.object.toHub()", this.ctx),
			new Button(this.canvas.width/2 - 65,200,130,40,"  RESTART","interfaces.highscores.object.restartGame()", this.ctx),
			new Button(this.canvas.width/2 + this.canvas.width / 4 - 130,200,130,40,"    MENU","interfaces.highscores.object.toMenu()", this.ctx)
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
		this.HighScoreList.width =  window.width;
		this.HighScoreList.height =  window.height / 2.4;
		this.HighScoreList.style.top =  window.height / 5.4;
		this.HighScoreList.style.left = 0;
		this.HighScoreList.style.position = "absolute";
		this.HighScoreList.style.cursor = "none";
		document.body.appendChild(this.HighScoreList);

		this.HighScoreListCanvas = document.getElementById("HighScoreList");		// canvas stuff
		this.HighScoreListCtx = this.HighScoreListCanvas.getContext("2d");			// canvas stuff

		this.HighScoreOptions = document.createElement('canvas');
		this.HighScoreOptions.id = 'HighScoreOptions';
		this.HighScoreOptions.width =  window.width;
		this.HighScoreOptions.height = Math.ceil( window.height -  window.height / 5.4 -  window.height / 2.4);
		this.HighScoreOptions.style.top = Math.floor( window.height / 5.4 +  window.height / 2.4);
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
			new Button(this.canvas.width/2 - 230 - 120,450,230,40,"SAVE","interfaces.highscores.object.saveHighScore()", this.ctx),
			new Button(this.canvas.width/2 + 120,450,270,40,"DON'T SAVE","interfaces.highscores.object.canvas_loadHighScores()", this.ctx),
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
					this.ctx.moveTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) - 60), 100);
					this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) - 60), 160);
					this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) - 60) - 40, 130);
					this.ctx.fill();
				}
				// arrow right
				if(this.selected < this.charButtons.length - 1){
					this.ctx.beginPath();
					this.ctx.moveTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) + 60), 100);
					this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) + 60), 160);
					this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (b + 1) + 60) + 40, 130);
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
		this.HighScoreSaver.width =  window.width;
		this.HighScoreSaver.height =  window.height / 8.3;
		this.HighScoreSaver.style.paddingTop =  window.height / 21.6;
		this.HighScoreSaver.style.top =  window.height / 5.4;
		this.HighScoreSaver.style.left = 0;
		this.HighScoreSaver.style.position = "absolute";
		this.HighScoreSaver.style.cursor = "none";
		document.body.appendChild(this.HighScoreSaver);

		this.HighScoreSaverCanvas = document.getElementById("HighScoreSaver");		// canvas stuff
		this.HighScoreSaverCtx = this.HighScoreSaverCanvas.getContext("2d");			// canvas stuff

		this.HighScoreOptions = document.createElement('canvas');
		this.HighScoreOptions.id = 'HighScoreOptions';
		this.HighScoreOptions.width =  window.width;
		this.HighScoreOptions.height = Math.ceil( window.height -  window.height / 5.4 -  window.height / 8.3 -  window.height / 10.8);
		this.HighScoreOptions.style.paddingTop = Math.floor( window.height / 21.6);
		this.HighScoreOptions.style.top =  window.height / 5.4 +  window.height / 8.3 +  window.height / 21.6;
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
		this.ctx.fillText(this.value,( window.width / 2 - 3 * 180) + 180 * (this.id + 1),160);
		// arrow up
		this.ctx.beginPath();
		this.ctx.moveTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)) - 25, 50);
		this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)) + 25, 50);
		this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)), 15);
		this.ctx.fill();
		// arrow down
		this.ctx.beginPath();
		this.ctx.moveTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)) - 25, 210);
		this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)) + 25, 210);
		this.ctx.lineTo(( window.width / 2 - 3 * 180) + (180 * (this.id + 1)), 245);
		this.ctx.fill();
	}
}

class Charset {
	constructor() {
		return ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"," "];
	}
}

class Button {
	constructor(x = 0, y = 0, width = 20, height = 10, text = "Button", onclick, context) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.text = text;
		this.onclick = onclick;
		this.selected = false;
		this.context = context;
	}

	execute() {
		eval(this.onclick);
	}

	draw() {
		this.context.beginPath();
		this.context.moveTo(this.x, this.y);
		this.context.lineTo(this.x + this.width, this.y);
		this.context.arc(this.x, this.y - this.height, this.height, 0.5 * Math.PI, 1.5 * Math.PI);
		this.context.lineTo(this.x + this.width, this.y - this.height * 2);
		this.context.moveTo(this.x + this.width, this.y);
		this.context.arc(this.x + this.width, this.y - this.height, this.height, 0.5 * Math.PI, 1.5 * Math.PI, true);
		this.context.strokeStyle = "white";
		if (this.selected) {
			this.context.lineWidth = 10;
		} else {
			this.context.lineWidth = 3;
		}
		this.context.stroke();
		this.context.fillStyle = "black";
		this.context.fill();
		this.context.fillRect(this.x, this.y - this.height * 2, this.width, this.height * 2);
		this.context.closePath();
		this.context.font = "20px Verdana";
		this.context.fillStyle = "white";
		this.context.textAlign = "left";
		this.context.fillText(this.text, this.x + 10, this.y - this.height + 8);
		if (this.selected) {
			this.context.beginPath();
			this.context.arc(this.x - 70, this.y - this.height, 15, 0, 2 * Math.PI);
			this.context.fillStyle = "white";
			this.context.closePath();
		}
	}
}


class HubButton {
	constructor(x, y, text, game, ctx){
		this.x = x;
		this.y = y;
		this.width =  window.width / 6.3;
		this.height =  window.height / 6.3;
		this.text = text;
		this.selected = false;
		this.game = game;
		this.ctx = ctx;
		this.loadError = true;

		let img = new Image();
	    let oImg = new Image();
	    oImg.src="img/hub/" + game.toLowerCase().replace(/\s/g, '') + ".png";
	    oImg.onload=function(){
			img.src=oImg.src;
			interfaces.hub.object.update();
		}
		oImg.onerror=function(){img.src="img/hub/blank.png"}
		this.img = img;
	}
	update() {
		this.ctx.textAlign = "center";
		this.ctx.strokeStyle = "#fff";
		this.ctx.fillStyle = "#fff";
		if (this.selected) {
			this.ctx.font = "45px segoe ui";
			this.ctx.lineWidth = 5;
			this.ctx.fillText(this.text.toUpperCase(),this.x + this.width/2,this.y + this.height + (this.width / this.height * 70));
			this.ctx.strokeRect(
				this.x - this.width / 6.3,
				this.y - this.height / 6.3,
				this.width + this.width / 3.15,
				this.height + this.width / 3.15
			);
			this.ctx.drawImage(this.img,
				this.x - this.width / 6.3 + 5,
				this.y - this.height / 6.3 + 5,
				this.width + this.width / 3.15 - 10,
				this.height + this.width / 3.15 - 10
			);
		} else {
			this.ctx.font = "30px segoe ui";
			this.ctx.lineWidth = 3;
			this.ctx.fillText(this.text.toUpperCase(),this.x + this.width/2,this.y + this.height + 40);
			this.ctx.strokeRect(
				this.x,
				this.y,
				this.width,this.height
			);
			this.ctx.drawImage(this.img,
				this.x + 3,
				this.y + 3,
				this.width - 6,
				this.height - 6
			);
		}
	}
}

/**
 * Creates a pausable task
 * @param task task to be executed
 */
class Interval {
	constructor(task) {
		var self = this;
		this.task = ()=>{
			task();

			// if the state is not running, don't execute the loop
			if(self.state === 1)
				requestAnimationFrame(this.task);
		};

		// execute once to start the recursive chain
		this.ID = requestAnimationFrame(this.task)
		this.state = 1; //  0 = stopped, 1 = running, 2 = paused
	}

	pause() {
		// change the state, breaking the loop
		this.state = 2;
	}

	resume() {
		this.state = 1;

		// restart the chain
		requestAnimationFrame(this.task)
	}

	stop() {
		clearInterval(this.ID);
		this.task = (() =>{});
		this.ID = -1;
		this.speed = 0;
		this.state = 0;
	}
}