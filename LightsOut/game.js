var lightsOutGame;

function LightsOut(){
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
	
		lightsOutGame = null;
	
	menuOverlay = new MenuOverlay();
	LightsOutMainMenuOverlay();
	
	menuOverlay.backgroundGame = new LightsOutGame();
	lightsOutGame = menuOverlay.backgroundGame;
	lightsOutGame.drawPlayer = false; 
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 15);
}

function LightsOutMainMenuOverlay(){
	menuOverlay.buttons = [
		new Button(120, canvas.height - 310, 400, 30, "START GAME", "newLightsOutGame()"),
		new Button(120, canvas.height - 230, 400, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"),
		new Button(120, canvas.height - 150, 400, 30, "HOW TO PLAY", "loadInstructions()"),
		new Button(120, canvas.height - 70, 400, 30,"EXIT", "loadHub()")
	];
}

///<Summary>
/// Creates a new instance of the game
///</Summary>
function newLightsOutGame(){	
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	OverlayIsActive = false;

	move.smooth = false;
	
	lightsOutGame = new LightsOutGame();
	
	gameInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		lightsOutGame.update();
	}, 15);
}

class LightsOutGame{
	constructor(){
		this.applyKeyDown = false; // 	under which the "Enter" key
		this.drawPlayer = true; // 		sidebar and overlay
		
		this.gridX = 680; // 	starting position
		this.gridY = 240; // 	starting position
		this.boxSizeX = 80; // 	width of a box
		this.boxSizeY = 80;	// 	height of a box
		this.boxMargin = 20; // spacing
		this.squareSize = 5; // grid
		this.squareSizeTMP = 0;
		
		// calculate starting position
		this.playerPosition = [Math.floor(this.squareSize / 2), Math.floor(this.squareSize / 2)]; // middle
		
		this.lightDimensions = []; // 	array containing the grid
		this.lights = 0; //				amount of lights
		this.timer = 0;
		
		this.sidebarItem = -1; // 			sidebar item that is selected
		this.sidebarHasControl = false; // 	if the sidebar has focus		
		this.sidebarItemLock = false; // 	if the item has focus
		
		this.difficulty = 8; // DIFFICULTY --> lower is harder
		this.populateLightDimensions();
		this.gamemode = "";
		
	}
	update() {
		// first we draw the boxes
		this.drawInterface();
		
		// this is so the input does not interfere with the the menu overlay
		if(!OverlayIsActive)
			this.inputEventHandler();
	}
	
	inputEventHandler(){
		// key eventhandling
		// pretty straight forward
		if (move.left) { // left
			if(!this.sidebarHasControl){ // if the sidebar is in use
				if(this.playerPosition[1] - 1 == -1){
					this.sidebarItem = 0; // select the topmost item
					this.drawPlayer = false; // remove the extra square box
					this.sidebarHasControl = true; // give the sidebar control
					
				} else if (this.playerPosition[1] - 1 >= 0){
					this.playerPosition[1] -= 1;
				}
			}
		}
		
		if (move.right) { // right
			if(!this.sidebarHasControl){
				if (this.playerPosition[1] + 1 <= this.lightDimensions.length - 1){
					this.playerPosition[1] += 1;
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
				if (this.playerPosition[0] - 1 >= 0){
					this.playerPosition[0] -= 1;
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
				if (this.playerPosition[0] + 1 <= this.lightDimensions[this.playerPosition[1]].length - 1){
					this.playerPosition[0] += 1;
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
			if(!this.applyKeyDown){
				if (this.sidebarHasControl){
					if(this.sidebarItem != 2){
						if(this.sidebarItemLock){
							
							this.squareSize += this.squareSizeTMP;
							this.squareSizeTMP = 0;
							this.timer = 0;
							this.lightDimensions = [];
							this.populateLightDimensions();
							
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
			var points = (this.squareSize - 5) * 0.6 * this.timer;
			loadHighscores(currentGame, points);
		}
	}
	
	drawInterface(){ // draws the boxes and the selected box
		this.timer += 1/60;
		let xpos = this.gridX = (canvas.width - ((this.squareSize + (0.5 * Math.ceil((this.squareSize - 4) / 2))) * this.boxSizeX + (this.squareSize * this.boxMargin + this.boxMargin))) / 2;
		let ypos = this.gridY = (canvas.height - ((this.squareSize + (0.5 * Math.ceil((this.squareSize - 4) / 2))) * this.boxSizeY + (this.squareSize * this.boxMargin + this.boxMargin))) / 2;
		
		ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#fff";
		
		// Draw the boxes
		for (var x = 0; x < this.lightDimensions.length; x++){
			for (var y = 0; y < this.lightDimensions[x].length; y++){
				
				// we reverse the x and y so the positions are correct
				ctx.lineWidth = 6;
				ctx.strokeRect(xpos, ypos, this.boxSizeX, this.boxSizeY);
				if(this.lightDimensions[x][y] == 1)
					ctx.fillRect(xpos, ypos, this.boxSizeX, this.boxSizeY);
				
				// if the box is the selected one
				if(x == this.playerPosition[0] && y == this.playerPosition[1] && this.drawPlayer == true){
					ctx.strokeRect(xpos - (this.boxMargin * (2 / 3)), ypos - (this.boxMargin * (2 / 3)), 
							this.boxSizeX + (this.boxMargin  * (4 / 3)), this.boxSizeY + (this.boxMargin  * (4 / 3)));
					
				}
				xpos += this.boxSizeX + (2 * this.boxMargin);
			}
			xpos = this.gridX;
			ypos += this.boxSizeY + (2 * this.boxMargin);
		}
		
		// draw the sidebar
		if(!OverlayIsActive){
			xpos = this.gridX - 230;
			ypos = canvas.height / 2 - (100 - this.boxMargin * (Math.ceil((this.squareSize - 4) / 2) - (Math.ceil((this.squareSize - 4) / 2) - 1)));
			
			// BORDER
			ctx.lineWidth = 6;
			ctx.strokeRect(xpos - 30, ypos - 60, 230, 280);	
			ctx.lineWidth = 2;	

			// DIFFICULTY
			if (this.sidebarItem == 0) { this.sidebarItemLock
				if (this.sidebarItemLock) { ctx.lineWidth = 10;  } else { ctx.lineWidth = 6; }
			} else { ctx.lineWidth = 2; }	
			
			ctx.font = "20px verdana";
			ctx.fillStyle = "white";
			ctx.textAlign = "left";
			ctx.fillText("Density: ", xpos, ypos - 8);
			
			ctx.textAlign = "center";
			ctx.fillText(this.difficulty, xpos + 150, ypos - 8);
			ctx.strokeRect(xpos + 130, ypos - 35, 40, 40);
			
			// GRID
			if (this.sidebarItem == 1) { this.sidebarItemLock
				if (this.sidebarItemLock) { ctx.lineWidth = 10;  } else { ctx.lineWidth = 6; }
			} else { ctx.lineWidth = 2; }
			let GridSize = this.squareSize + this.squareSizeTMP;
			
			ctx.font = "20px verdana";
			ctx.fillStyle = "white";
			ctx.textAlign = "left";
			ctx.fillText("Grid: ", xpos, ypos + 60 - 8);
			
			ctx.textAlign = "center";
			ctx.fillText(GridSize + "x" + GridSize, xpos + 140, ypos + 60 - 8);
			ctx.strokeRect(xpos + 110, ypos + 25, 60, 40);
			
			// LIGHTS
			ctx.font = "20px verdana";
			ctx.fillStyle = "white";
			ctx.textAlign = "left";
			ctx.fillText("Time: ", xpos, ypos + 120 - 8);
			
			ctx.textAlign = "center";
			ctx.fillText(Math.round(this.timer), xpos + 150, ypos + 120 - 8);
			
			// BUTTON
			let backbuttonX = xpos + 30;
			let backbuttonY = ypos + 200;
			let backbuttonWidth = 110;
			let backbuttonHeight = 30;
			
			ctx.beginPath();
			ctx.moveTo(backbuttonX, backbuttonY);
			ctx.lineTo(backbuttonX + backbuttonWidth, backbuttonY);
			ctx.arc(backbuttonX, backbuttonY - backbuttonHeight, backbuttonHeight, 0.5*Math.PI, 1.5*Math.PI);
			ctx.lineTo(backbuttonX + backbuttonWidth, backbuttonY - backbuttonHeight * 2);
			ctx.moveTo(backbuttonX + backbuttonWidth, backbuttonY);
			ctx.arc(backbuttonX + backbuttonWidth, backbuttonY - backbuttonHeight, backbuttonHeight, 0.5*Math.PI, 1.5*Math.PI, true);
			ctx.strokeStyle = "white";
			if (this.sidebarItem == 2) { ctx.lineWidth = 10; } else { ctx.lineWidth = 3; }	
			ctx.stroke();
			ctx.fillStyle = "black";
			ctx.fill();
			ctx.fillRect(backbuttonX, backbuttonY - backbuttonHeight * 2, backbuttonWidth, backbuttonHeight * 2);
			ctx.closePath();
			ctx.font = "20px verdana";
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.fillText("Menu", backbuttonX + backbuttonWidth / 2, backbuttonY - backbuttonHeight + 8);
			if (this.selected) {
				ctx.beginPath();
				ctx.arc(backbuttonX - 70, backbuttonY - backbuttonHeight, 15, 0, 2 * Math.PI);
				ctx.fillStyle = "white";
				ctx.closePath();
			}
		}
	}
	
	populateLightDimensions(){
		// generate a new this.lightDimensions array which exists out of 0s		
		for (var x = 0; x < this.squareSize; x++) {
			this.lightDimensions.push([]);
			for (var y = 0; y < this.squareSize; y++) {
				this.lightDimensions[x].push(0);
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
				
				lightstate = this.lightDimensions[px][py];
			}
			
			if (lightstate == 0) {
				lightstate = 1;
			} else {
				lightstate = 0;
			}
			
			this.lightDimensions[px][py] = lightstate;
		}
	}
	
	convertBoxes(){
		// invert the state of je adjacent boxes and the one we are on
		
		// above of the player position
		if(this.playerPosition[0] - 1 >= 0){ 
			if(this.lightDimensions[this.playerPosition[0] - 1][this.playerPosition[1]] == 1){
				this.lightDimensions[this.playerPosition[0] - 1][this.playerPosition[1]] = 0;
			} else {
				this.lightDimensions[this.playerPosition[0] - 1][this.playerPosition[1]] = 1;
			}
		}
		
		
		// below of the player position
		if(this.playerPosition[0] + 1 <= this.lightDimensions[this.playerPosition[0]].length - 1){
			if(this.lightDimensions[this.playerPosition[0] + 1][this.playerPosition[1]] == 1){
				this.lightDimensions[this.playerPosition[0] + 1][this.playerPosition[1]] = 0;
			} else {
				this.lightDimensions[this.playerPosition[0] + 1][this.playerPosition[1]] = 1;
			}
		}
		
		// left side of the player position
		if(this.playerPosition[1] - 1 >= 0){ 
			if(this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] - 1] == 1){
				this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] - 1] = 0;
			} else {
				this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] - 1] = 1;
			}
		}
		
		
		// right side of the player position
		if(this.playerPosition[1] + 1 <= this.lightDimensions[this.playerPosition[1]].length - 1){
			if(this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] + 1] == 1){
				this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] + 1] = 0;
			} else {
				this.lightDimensions[this.playerPosition[0]][this.playerPosition[1] + 1] = 1;
			}
		}
		
		// the player position
		if(this.lightDimensions[this.playerPosition[0]][this.playerPosition[1]] == 1){
			this.lightDimensions[this.playerPosition[0]][this.playerPosition[1]] = 0;
		} else {
			this.lightDimensions[this.playerPosition[0]][this.playerPosition[1]] = 1;
		}
		
		this.lights = 0;
		for (var x = 0; x < this.squareSize; x++) {
			for (var y = 0; y < this.squareSize; y++) {
				if(this.lightDimensions[x][y] == 1)
					this.lights += 1;
			}
		}	
	}
	quit() {
		
	}
}