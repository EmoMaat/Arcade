class MenuOverlay {
	constructor() {
		// this contains all the buttons in the menu
		this.buttons = [];
		this.selected = 0;
		OverlayIsActive = true;

		// the background game variables
		this._backgroundGame = null; // = new GameName();
	}

	update() {
		// this handles the background game
		if (this.backgroundGame != null)
			this.backgroundGame.update();

		// we check for key events
		if (move.down){ //joystick down, selects game beneath current game
			if (this.selected < this.buttons.length - 1){
				this.selected += 1;
			}
		}


		if (move.up) //joystick up, selects game above current game
			if (!MoveUp && this.selected > 0)
				this.selected -= 1;

		// draw the buttons
		for (var i = 0; i < this.buttons.length; i++) {
			if (i == this.selected) { // the selected one should look different
				this.buttons[i].selected = true;
				if (map.Button5 || map[13]) { // if we want to use one of the buttons
					map[13] = false;
					map.Button5 = false;

					this.buttons[i].execute();
					this.selected = 0;

					break;
				}
			} else {
				this.buttons[i].selected = false;
			}
			this.buttons[i].draw();
		}
	}

	set backgroundGame(object){
		this._backgroundGame = object;
		move.smooth = false;
		move.multiplayer = false;
	}
	get backgroundGame(){ return this._backgroundGame;}
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
		if (this.context == undefined) {
			this.context = ctx;
		}
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
		this.context.font = "20px segoe ui";
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

class EscOverlay {
	constructor() {
		var newOverlayCanvasElement = document.createElement('canvas');
		newOverlayCanvasElement.id = 'EscOverlay';				// ID tag
		newOverlayCanvasElement.width = canvas.width;			// set the size to the original canvas
		newOverlayCanvasElement.height = canvas.height;			// set the size to the original canvas
		newOverlayCanvasElement.style.position = "absolute";	// make it fixed
		newOverlayCanvasElement.style.top = 0;					// so it covers
		newOverlayCanvasElement.style.left = 0;					// the original canvas
		newOverlayCanvasElement.style.cursor= "none";					// hide the cursor
		document.body.appendChild(newOverlayCanvasElement);

		this.overlayCanvas = document.getElementById("EscOverlay");		// canvas stuff
		this.overlayCtx = this.overlayCanvas.getContext("2d");			// canvas stuff

		EscOverlayIsActive = true; 	// set this to true so we won't create a second instance if we hit esc again
		HubControl = false;			// remove control from the hub

		this.selected = 0;
		this.blink = 0;					// for the blinking of "Paused"
		this.smooth_state = move.smooth;
		this.multiplayer_state = move.multiplayer;

		// .quit() is mostly used for stopping audio as clearing classes won't work
		if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
			eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

		gameInterval.pause();
		move.smooth = false;
		move.multiplayer = false;

		// "this" is not available in the setInterval so we save the instance
		var self = this;

		// buttons present in the overlay
		this.buttons = [
			new Button(this.overlayCanvas.width / 2 - this.overlayCanvas.width / 9.8, this.overlayCanvas.height / 2.16, this.overlayCanvas.width / 4.8, this.overlayCanvas.height / 36, "Continue", "escOverlay.close()", self.overlayCtx),
			new Button(this.overlayCanvas.width / 2 - this.overlayCanvas.width / 9.8, this.overlayCanvas.height / 2.16 + this.overlayCanvas.height / 13.5, this.overlayCanvas.width / 4.8, this.overlayCanvas.height / 36, "Exit to menu", "escOverlay.menu()", self.overlayCtx),
			new Button(this.overlayCanvas.width / 2 - this.overlayCanvas.width / 9.8, this.overlayCanvas.height / 2.16 + (this.overlayCanvas.height / 13.5) * 2, this.overlayCanvas.width / 4.8, this.overlayCanvas.height / 36, "Exit to hub", "escOverlay.hub()", self.overlayCtx)
		];

		// the interval of the overlay
		this.interval = new Interval(function () {
			self.overlayCtx.clearRect(0, 0, self.overlayCanvas.width, self.overlayCanvas.height);
			self.overlayCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
			self.overlayCtx.fillRect(0, 0, self.overlayCanvas.width, self.overlayCanvas.height);

			self.update();
		}, 15);
	}
	update() {
		// this handles the background game
		if (this.backgroundGame != null)
			this.backgroundGame.update();

		// we check for key events
		if (move.down) { //joystick down, selects game beneath current game
			if (this.selected < this.buttons.length - 1) {
				this.selected += 1;
			}
		}

		if (move.up) { //joystick up, selects game above current game
			if (this.selected > 0) {
				this.selected -= 1;
			}
		}

		// draw the buttons
		for (var i = 0; i < this.buttons.length; i++) {
			if (i == this.selected) { // the selected one should look different
				this.buttons[i].selected = true;
				if (map.Button5 || map[13]) { // if we want to use one of the buttons
					map[13] = false;
					map.Button5 = false;

					this.buttons[i].execute();
					this.selected = 0;

					break;
				}
			} else {
				this.buttons[i].selected = false;
			}
			this.buttons[i].draw();
		}
		if (this.blink <= 50) {
			this.overlayCtx.font = '48pt segoe ui';
			this.overlayCtx.fillStyle = '#fff';
			this.overlayCtx.textAlign = "center";
			this.overlayCtx.fillText("Paused", this.overlayCanvas.width / 2, 300 - 10);

			this.blink++;
		} else if (this.blink > 50 && this.blink <= 100) {
			this.blink++;
		} else {
			this.blink = 0;
		}
	}
	close() {
		EscOverlayIsActive = false;
		this.interval.stop();
		move.smooth = this.smooth_state;
		move.multiplayer = this.multiplayer_state;

		gameInterval.resume() //we resume the game
		this.removeOverlay();
	}
	menu() {
		if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
			eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

		gameInterval.stop();

		EscOverlayIsActive = false;
		this.interval.stop();

		eval(currentGame)();
		this.removeOverlay();
	}
	hub() {
		if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
			eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

		gameInterval.stop();

		EscOverlayIsActive = false;
		this.interval.stop();

		this.removeOverlay();
		loadHub();
	}

	removeOverlay() {
		var EscOverlay = document.getElementById("EscOverlay");
		EscOverlay.parentElement.removeChild(EscOverlay);
	}
}

/// <Summary>
/// creates an interval with the ability to pause it
/// </Summary>
/// Parameter callback = code to be executed
/// Parameter interval = speed of the updating
class Interval {
	constructor(callback, interval = 15) {
		this.task = callback; 	// save the code
		this.speed = interval;	// save the speed

		this.ID = setInterval(this.task, this.speed);
		this.startTime = new Date();
		this.remaining = 0;
		this.state = 1; //  0 = running, 1 = suspended, 2 = resuming
	}

	pause() {
		// calculate how much of the timer is left
		this.remaining = this.speed - (new Date() - this.startTime);
		clearInterval(this.ID); // clear the interval
		this.state = 1;
	}

	resume() {
		if (this.state != 1) return;

		this.state = 2;
		setTimeout(this.timeoutCallback, this.remaining); // set a timeout with the remaining time in the loop
		this.ID = setInterval(this.task, this.speed); //set the interval again, after clearing it
	}

	timeoutCallback() {
		if (this.state != 2) return;

		this.startTime = new Date();
		this.state = 0;
	}

	stop() {
		clearInterval(this.ID);

		this.task = null;
		this.speed = null;
		this.ID = null;
		this.startTime = null;
		this.remaining = null;
		this.state = null;
	}
}

function exitAsteroids() {
	console.log("exitAsteroids got called in: " + currentGame);
}
