function LightsOut(){
	new MenuInterface();
	arcade.menu.object.buttons = [
		["EXIT", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"],
		["START GAME", "newLightsOutGame()"]
	]

	arcade.menu.object.backgroundGame = arcade.game.object = new LightsOutGame(true);
}


function newLightsOutGame(){
	exit_open_game();
	exit_open_arcade();
	remove_all_canvases();

	arcade.game.object = new LightsOutGame();
	arcade.game.interval = new Interval(function(){
		arcade.game.object.update();
	}, 15);
}

class LightsOutGame{
	constructor(backgroundGame){
		this.applyKeyDown = false; // 	under which the "Enter" key
		this.drawPlayer = !backgroundGame; // 		sidebar and overlay

		this.boxSize = 80; // 	width and width of a box
		this.boxMargin = 20; // spacing
		this.squareSize = 5; // grid
		this.squareSizeTMP = 0;

		// calculate starting position
		this.playerPosition = {x:Math.floor(this.squareSize / 2),
							   y:Math.floor(this.squareSize / 2)}; // middle

		this.lightArena = []; // 	array containing the grid
		this.lights = 0; //				amount of lights
		this.timer = 0;

		this.sidebarItem = -1; // 			sidebar item that is selected
		this.sidebarHasControl = false; // 	if the sidebar has focus
		this.sidebarItemLock = false; // 	if the item has focus

		this.difficulty = 8; // DIFFICULTY --> lower is harder
		this.populatelightArena();

		// create a canvas containing the options
		let LightsOutCanvas = document.createElement('canvas');
		LightsOutCanvas.id = 'LightsOutCanvas';
		LightsOutCanvas.width = LightsOutCanvas.height = (this.lightArena.length * (this.boxMargin + this.boxSize + this.boxMargin));
		LightsOutCanvas.style.left = window.width / 2 - LightsOutCanvas.width / 2;
		LightsOutCanvas.style.bottom = window.height / 2 - LightsOutCanvas.width / 2;
		LightsOutCanvas.style.position = "absolute";
		LightsOutCanvas.style.cursor = "none";
		LightsOutCanvas.style.zIndex = 1;
		document.body.appendChild(LightsOutCanvas);

		this.canvas = document.getElementById("LightsOutCanvas");		// canvas stuff
		this.ctx = this.canvas.getContext("2d");	// canvas stuff

		this.optionsCtx = null;
		if (!backgroundGame){
			// create a canvas containing the options
			let LightsOutOptions = document.createElement('canvas');
			LightsOutOptions.id = 'LightsOutOptions';
			LightsOutOptions.width = 240;
			LightsOutOptions.height = 290;			// is set later
			LightsOutOptions.style.left = window.width / 2 - LightsOutCanvas.width / 2 - LightsOutOptions.width;
			LightsOutOptions.style.bottom = window.height / 2 - LightsOutOptions.height / 2;
			LightsOutOptions.style.position = "absolute";
			LightsOutOptions.style.cursor = "none";
			LightsOutOptions.style.zIndex = 1;
			document.body.appendChild(LightsOutOptions);

			this.optionsCanvas = document.getElementById("LightsOutOptions");		// canvas stuff
			this.optionsCtx = this.optionsCanvas.getContext("2d");	// canvas stuff
		}
	}

	update() {
		this.ctx.clearRect(0, 0, window.width, window.height);

		// first we draw the boxes
		this.redrawInterface();

		// this is so the input does not interfere with the the menu overlay
		if(this.optionsCtx != null)
			this.inputEventHandler();
	}

	inputEventHandler(){
		// key eventhandling
		// pretty straight forward
		if (move.left) { // left
			if(!this.sidebarHasControl){ // if the sidebar is in use
				if(this.playerPosition.y - 1 == -1){
					this.sidebarItem = 0; // select the topmost item
					this.drawPlayer = false; // remove the extra square box
					this.sidebarHasControl = true; // give the sidebar control

				} else if (this.playerPosition.y - 1 >= 0){
					this.playerPosition.y -= 1;
				}
			}
		}

		if (move.right) { // right
			if(!this.sidebarHasControl){
				if (this.playerPosition.y + 1 <= this.lightArena.length - 1){
					this.playerPosition.y += 1;
				}
			} else {
				if(!this.sidebarItemLock){
					this.sidebarItem = -1; // clear the list
					this.drawPlayer = true; // remove the extra square box
					this.sidebarHasControl = false; // remove control from the sidebar
				}
			}
		}

		if (move.up) { //  up
			map[38] = false;
			if(!this.sidebarHasControl){
				if (this.playerPosition.x - 1 >= 0){
					this.playerPosition.x -= 1;
				}
			} else if(!this.sidebarItemLock){ // if we do not have a lock on an item
				if(this.sidebarItem > 0){
					this.sidebarItem -= 1;
				}
			} else {
				if(this.sidebarItem == 0){
					if(this.difficulty + 1 <= 8){
						this.difficulty += 1;
					}
				} else {
					if(this.squareSize + 1 + this.squareSizeTMP <= 9){
						this.squareSizeTMP += 1;
					}
				}
			}
		}

		if (move.down) { // down
			if(!this.sidebarHasControl){
				if (this.playerPosition.x + 1 <= this.lightArena[this.playerPosition.y].length - 1){
					this.playerPosition.x += 1;
				}
			} else if(!this.sidebarItemLock){ // if we do not have a lock on an item
				if(this.sidebarItem < 2){
					this.sidebarItem += 1;
				}
			} else {
				if(this.sidebarItem == 0){
					if(this.difficulty - 1>= 2){
						this.difficulty -= 1;
					}
				} else {
					if(this.squareSize - 1 + this.squareSizeTMP >= 5){
						this.squareSizeTMP -= 1;
					}
				}
			}
		}

		if (map.Button0 || map[13]) { // apply key
			map.Button0 = map[13] = false
			if(!this.applyKeyDown){
				if (this.sidebarHasControl){
					if(this.sidebarItem != 2){
						if(this.sidebarItemLock){
							this.squareSize += this.squareSizeTMP;
							this.squareSizeTMP = 0;
							this.timer = 0;
							this.lightArena = [];
							this.populatelightArena();
							this.rebuildCanvasses();

							this.sidebarItemLock = false;
						} else {
							this.sidebarItemLock = true;
						}
					} else {
						map.Button0 = false;
						map[13] = false;

						LightsOut();
					}
				} else {
					this.convertBoxes();
				}
			}
			this.applyKeyDown = true;
		} else if (map.Button0 == false && !map[13]){
			this.applyKeyDown = false;
		}

		if(this.lights == 0 || this.lights == Math.pow(this.squareSize, 2)){
			var points = Math.round(this.squareSize * 0.6 * this.timer);
			new HighScoresInterface(currentGame, points);
		}
	}

	redrawInterface(){ // draws the boxes and the selected box
		this.timer += 1/60;
		let xpos = this.boxMargin;
		let ypos = this.boxMargin;
		this.ctx.fillStyle = "#fff";
		this.ctx.strokeStyle = "#fff";

		// Draw the boxes
		for (var x = 0; x < this.lightArena.length; x++){
			for (var y = 0; y < this.lightArena[x].length; y++){
				this.ctx.lineWidth = 6;
				this.ctx.strokeRect(xpos, ypos, this.boxSize, this.boxSize);
				if(this.lightArena[x][y] == 1)
					this.ctx.fillRect(xpos, ypos, this.boxSize, this.boxSize);

				// if the box is the selected one
				if(x == this.playerPosition.x && y == this.playerPosition.y && this.drawPlayer == true){
					this.ctx.strokeRect(xpos - (this.boxMargin * (2 / 3)), ypos - (this.boxMargin * (2 / 3)),
							this.boxSize + (this.boxMargin  * (4 / 3)), this.boxSize + (this.boxMargin  * (4 / 3)));

				}
				xpos += this.boxSize + (2 * this.boxMargin);
			}
			xpos = this.boxMargin;
			ypos += this.boxSize + (2 * this.boxMargin);
		}

		// draw the sidebar
		if(this.optionsCtx != null){
			this.optionsCtx.clearRect(0, 0, this.optionsCanvas.width, this.optionsCanvas.height);
			xpos = 35;
			ypos = 65;

			// BORDER
			this.optionsCtx.lineWidth = 6;
			this.optionsCtx.strokeRect(xpos - 30, ypos - 60, 230, 280);
			this.optionsCtx.lineWidth = 2;

			// DIFFICULTY
			if (this.sidebarItem == 0) { this.sidebarItemLock
				if (this.sidebarItemLock) { this.optionsCtx.lineWidth = 10;  } else { this.optionsCtx.lineWidth = 6; }
			} else { this.optionsCtx.lineWidth = 2; }

			this.optionsCtx.font = "20px verdana";
			this.optionsCtx.fillStyle = "white";
			this.optionsCtx.textAlign = "left";
			this.optionsCtx.fillText("Density: ", xpos, ypos - 8);

			this.optionsCtx.textAlign = "center";
			this.optionsCtx.fillText(this.difficulty, xpos + 150, ypos - 8);
			this.optionsCtx.strokeRect(xpos + 130, ypos - 35, 40, 40);

			// GRID
			if (this.sidebarItem == 1) { this.sidebarItemLock
				if (this.sidebarItemLock) { this.optionsCtx.lineWidth = 10;  } else { this.optionsCtx.lineWidth = 6; }
			} else { this.optionsCtx.lineWidth = 2; }
			let GridSize = this.squareSize + this.squareSizeTMP;

			this.optionsCtx.font = "20px verdana";
			this.optionsCtx.fillStyle = "white";
			this.optionsCtx.textAlign = "left";
			this.optionsCtx.fillText("Grid: ", xpos, ypos + 60 - 8);

			this.optionsCtx.textAlign = "center";
			this.optionsCtx.fillText(GridSize + "x" + GridSize, xpos + 140, ypos + 60 - 8);
			this.optionsCtx.strokeRect(xpos + 110, ypos + 25, 60, 40);

			// LIGHTS
			this.optionsCtx.font = "20px verdana";
			this.optionsCtx.fillStyle = "white";
			this.optionsCtx.textAlign = "left";
			this.optionsCtx.fillText("Time: ", xpos, ypos + 120 - 8);

			this.optionsCtx.textAlign = "center";
			this.optionsCtx.fillText(Math.round(this.timer), xpos + 150, ypos + 120 - 8);

			// BUTTON
			let backbuttonX = xpos + 30;
			let backbuttonY = ypos + 200;
			let backbuttonWidth = 110;
			let backbuttonHeight = 30;

			this.optionsCtx.beginPath();
			this.optionsCtx.moveTo(backbuttonX, backbuttonY);
			this.optionsCtx.lineTo(backbuttonX + backbuttonWidth, backbuttonY);
			this.optionsCtx.arc(backbuttonX, backbuttonY - backbuttonHeight, backbuttonHeight, 0.5*Math.PI, 1.5*Math.PI);
			this.optionsCtx.lineTo(backbuttonX + backbuttonWidth, backbuttonY - backbuttonHeight * 2);
			this.optionsCtx.moveTo(backbuttonX + backbuttonWidth, backbuttonY);
			this.optionsCtx.arc(backbuttonX + backbuttonWidth, backbuttonY - backbuttonHeight, backbuttonHeight, 0.5*Math.PI, 1.5*Math.PI, true);
			this.optionsCtx.strokeStyle = "white";
			if (this.sidebarItem == 2) { this.optionsCtx.lineWidth = 10; } else { this.optionsCtx.lineWidth = 3; }
			this.optionsCtx.stroke();
			this.optionsCtx.fillStyle = "black";
			this.optionsCtx.fill();
			this.optionsCtx.fillRect(backbuttonX, backbuttonY - backbuttonHeight * 2, backbuttonWidth, backbuttonHeight * 2);
			this.optionsCtx.closePath();
			this.optionsCtx.font = "20px verdana";
			this.optionsCtx.fillStyle = "white";
			this.optionsCtx.textAlign = "center";
			this.optionsCtx.fillText("Menu", backbuttonX + backbuttonWidth / 2, backbuttonY - backbuttonHeight + 8);
			if (this.selected) {
				this.optionsCtx.beginPath();
				this.optionsCtx.arc(backbuttonX - 70, backbuttonY - backbuttonHeight, 15, 0, 2 * Math.PI);
				this.optionsCtx.fillStyle = "white";
				this.optionsCtx.closePath();
			}
		}
	}

	populatelightArena(){
		// generate a new this.lightArena array which exists out of 0s
		for (var x = 0; x < this.squareSize; x++) {
			this.lightArena.push([]);
			for (var y = 0; y < this.squareSize; y++) {
				this.lightArena[x].push(0);
			}
		}

		if(this.difficulty < 2){this.difficulty = 2;}
			this.lights = Math.pow(this.squareSize, 2) - this.squareSize * this.difficulty;

		while(this.lights <= 2){
			this.lights += this.difficulty / 2;
		}

		this.lights = Math.ceil(this.lights); // prevent a . behind the whole number for the sidebar

		for (var light = 0; light < this.lights; light++) {
			var px;
			var py;
			var lightstate;

			// generate a random place for the light
			// and check if it is not already populated
			while (lightstate != 0){
				px = Math.floor(Math.random() * this.squareSize);
				py = Math.floor(Math.random() * this.squareSize);

				lightstate = this.lightArena[px][py];
			}

			if (lightstate == 0) {
				lightstate = 1;
			} else {
				lightstate = 0;
			}

			this.lightArena[px][py] = lightstate;
		}
	}

	convertBoxes(){
		// invert the state of je adjacent boxes and the one we are on

		// above of the player position
		if(this.playerPosition.x - 1 >= 0){
			if(this.lightArena[this.playerPosition.x - 1][this.playerPosition.y] == 1){
				this.lightArena[this.playerPosition.x - 1][this.playerPosition.y] = 0;
			} else {
				this.lightArena[this.playerPosition.x - 1][this.playerPosition.y] = 1;
			}
		}


		// below of the player position
		if(this.playerPosition.x + 1 <= this.lightArena[this.playerPosition.x].length - 1){
			if(this.lightArena[this.playerPosition.x + 1][this.playerPosition.y] == 1){
				this.lightArena[this.playerPosition.x + 1][this.playerPosition.y] = 0;
			} else {
				this.lightArena[this.playerPosition.x + 1][this.playerPosition.y] = 1;
			}
		}

		// left side of the player position
		if(this.playerPosition.y - 1 >= 0){
			if(this.lightArena[this.playerPosition.x][this.playerPosition.y - 1] == 1){
				this.lightArena[this.playerPosition.x][this.playerPosition.y - 1] = 0;
			} else {
				this.lightArena[this.playerPosition.x][this.playerPosition.y - 1] = 1;
			}
		}


		// right side of the player position
		if(this.playerPosition.y + 1 <= this.lightArena[this.playerPosition.y].length - 1){
			if(this.lightArena[this.playerPosition.x][this.playerPosition.y + 1] == 1){
				this.lightArena[this.playerPosition.x][this.playerPosition.y + 1] = 0;
			} else {
				this.lightArena[this.playerPosition.x][this.playerPosition.y + 1] = 1;
			}
		}

		// the player position
		if(this.lightArena[this.playerPosition.x][this.playerPosition.y] == 1){
			this.lightArena[this.playerPosition.x][this.playerPosition.y] = 0;
		} else {
			this.lightArena[this.playerPosition.x][this.playerPosition.y] = 1;
		}

		this.lights = 0;
		for (var x = 0; x < this.squareSize; x++) {
			for (var y = 0; y < this.squareSize; y++) {
				if(this.lightArena[x][y] == 1)
					this.lights += 1;
			}
		}
	}

	rebuildCanvasses(){
		// create a canvas containing the options
		this.canvas.width = this.canvas.height = (this.lightArena.length * (this.boxMargin + this.boxSize + this.boxMargin));
		this.canvas.style.left = window.width / 2 - this.canvas.width / 2;
		this.canvas.style.bottom = window.height / 2 - this.canvas.width / 2;

		// create a canvas containing the options
		this.optionsCanvas.style.left = window.width / 2 - this.canvas.width / 2 - this.optionsCanvas.width;
		this.optionsCanvas.style.bottom = window.height / 2 - this.optionsCanvas.height / 2;
	}
}