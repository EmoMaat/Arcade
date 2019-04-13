class MenuOverlay {
	constructor() {
		if(overlay.hub.active || overlay.menu.active || overlay.highscores.active || overlay.howtoplay.active || overlay.esc.active)
			return console.log("Trying to instanciate the MenuOverlay while another overlay is still active.")

		move.multiplayer = false;
		move.continuous = false;
		overlay.menu.active = true;

		// this contains all the buttons in the menu
		this._buttons = [];
		this.selected = 0;

		// the background game variables
		this._backgroundGame = null; // = new GameName();

		// create a canvas containing the options
		let MenuOverlay = document.createElement('canvas');
		MenuOverlay.id = 'MenuOverlay';
		MenuOverlay.width = 550;
		MenuOverlay.height = 0;			// is set later
		MenuOverlay.style.left = 0;
		MenuOverlay.style.bottom = 0;
		MenuOverlay.style.position = "absolute";
		MenuOverlay.style.cursor = "none";
		MenuOverlay.style.zIndex = 999;
		document.body.appendChild(MenuOverlay);

		this.MenuOverlayCanvas = document.getElementById("MenuOverlay");		// canvas stuff
		this.MenuOverlayCtx = this.MenuOverlayCanvas.getContext("2d");	// canvas stuff

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

		overlay.menu.active = true;
		overlay.menu.object = this;
	}

	update() {
		// draw the buttons
		this.MenuOverlayCtx.clearRect(0, 0, this.MenuOverlayCanvas.width, this.MenuOverlayCanvas.height);
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

	set backgroundGame(object){
		this._backgroundGame = object;
		move.continuous = false;
		move.multiplayer = false;
	} get backgroundGame(){ return this._backgroundGame;}

	set buttons(array){
		// make the canvas onlt as high as required
		this.MenuOverlayCanvas.height = 50 + 80 * array.length;
		// build the array bottom up
		for(let b = array.length - 1; b >= 0; b--)
		this._buttons.push(
				new Button(80, this.MenuOverlayCanvas.height - 50 - 80 * b, 400, 30, array[b][0], array[b][1], this.MenuOverlayCtx)
			)
		
		// reload the canvas
		this.update();
	} get buttons() {return this._buttons; }
}

class EscOverlay {
	constructor() {
		if(overlay.hub.active || overlay.menu.active || overlay.highscores.active || overlay.howtoplay.active || overlay.esc.active)
			return console.log("Trying to instanciate the EscOverlay while another overlay is still active.")
		
			// create a canvas containing the options
		let EscOptions = document.createElement('canvas');
		EscOptions.id = 'EscOptions';
		EscOptions.width = canvas.width;
		EscOptions.height = canvas.height;
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

		// overlay.esc.active = true; 	// set this to true so we won't create a second instance if we hit esc again 
		// HubControl = false;			// remove control from the hub

		this.selected = 0;
		this.blink = 0;
		this.continuous_state = move.continuous;
		this.multiplayer_state = move.multiplayer;

		// .quit() is mostly used for stopping audio and removing canvasses as clearing classes won't work
		// if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
			// eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

		// gameInterval.pause();
		move.continuous = false;
		move.multiplayer = false;

		// "this" is not available in the setInterval so we save the instance
		var self = this;

		// buttons present in the overlay		
		this.buttons = [
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Continue", "overlay.esc.object.close()", self.EscOptionsCtx),
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16 + this.EscOptionsCanvas.height / 13.5, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Exit to menu", "overlay.esc.object.menu()", self.EscOptionsCtx),
			new Button(this.EscOptionsCanvas.width / 2 - this.EscOptionsCanvas.width / 9.8, this.EscOptionsCanvas.height / 2.16 + (this.EscOptionsCanvas.height / 13.5) * 2, this.EscOptionsCanvas.width / 4.8, this.EscOptionsCanvas.height / 36, "Exit to hub", "overlay.esc.object.hub()", self.EscOptionsCtx)
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
				self.EscBlinkCtx.font = '48pt SegoeUI';
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

		overlay.esc.active = true;
		overlay.esc.object = this;
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
	close() {
		move.continuous_state = this.continuous_state;
		move.multiplayer = this.multiplayer_state;

		// gameInterval.resume() //we resume the game
		this.removeOverlay();
	}
	menu() {
		quitOpenGame();
		this.removeOverlay();

		gameInterval.stop();

		eval(currentGame)();
	}
	hub() {
		quitOpenGame();
		this.removeOverlay();

		gameInterval.stop();

		loadHub();
	}

	removeOverlay() {
		this.interval.stop();
		overlay.esc.active = false;
		overlay.esc.object = {};

		while(document.querySelectorAll("canvas").length > 1){
			let c = document.querySelectorAll("canvas").length - 1;
			document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
		}
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

/**
 * Creates a pausable interval
 * @param task task to be executed
 * @param speed speed of the update cycle
 */
class Interval {
	constructor(task, interval = 15) {
		this.task = task; 	// save the code
		this.speed = interval;	// save the speed

		this.ID = setInterval(this.task, this.speed);
		this.state = 0; //  0 = running, 1 = paused
	}

	pause() {
		if (this.state !== 0) return;
		// calculate how much of the timer is left
		clearInterval(this.ID); // clear the interval
		this.state = 1;
	}

	resume() {
		if (this.state !== 1) return;

		this.state = 0;
		this.ID = setInterval(this.task, this.speed); //set the interval again, after clearing it
	}

	stop() {
		clearInterval(this.ID);
		this.task = (() =>{});
		this.ID = -1;
		this.speed = 0;
		this.state = 0;
	}
}