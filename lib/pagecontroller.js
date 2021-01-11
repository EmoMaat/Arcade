var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var HubControl = true;
var ActiveGame = "";
// var gameIntervalSpeed = 0;

// we initialize but not assign, the most important variables here
var gameInterval;
var overlayInterval;
var hubInterval;
var menuOverlay;
var escOverlay;

// these are for global use but need initalization
var currentGame = "";
var currentGameInterval = 0;
var EscOverlayIsActive = false;
var OverlayIsActive = false;
var gameLoading = false;

var MoveRight = false;
var MoveLeft = false;
var MoveUp = false;
var MoveDown = false;
var escButtonPressed = false;
var selectButtonPressed = false;

var borderOverlay = true; //for border drawing on bigger monitors (when lowering res to 1440*900)

// the games
var games = [
	"Asteroids",
	"PacMan",
	"Lunar Lander",
	"Midnight Motorists ",
	"Space Invaders",
	"Missile Command",
	"Pong",
	"Tetris",
	"Lights Out",
	"Snake"
];

window.onload = function (event){
	canvas.width = screen.width;
	canvas.height = screen.height;
	// forceLoad("PacMan");

}
canvas.width = screen.width;
canvas.height = screen.height;

// mapping keystrokes and storing them for global use
// works with gamepad as well
var map = {};
onkeydown = onkeyup = function(e){
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';

	if((map[27]) && !gameLoading){ // if we hit the esc button and are not loading a game
		map[27] = false;

		if(!EscOverlayIsActive && !HubControl && !OverlayIsActive){
			escOverlay = new EscOverlay();
		} else if(EscOverlayIsActive && !HubControl && !OverlayIsActive){
			escOverlay.close();
			escOverlay = null;
		}
	}
}

// contains the movement
// set smooth to false if you want to register a keypress and keyhold only as keypress
var move = {
	_smooth:false,
	_multiplayer: false,

	_left: false,
	left_isPressed: false,

	_right: false,
	right_isPressed: false,

	_down: false,
	down_isPressed: false,

	_up: false,
	up_isPressed: false,

	set smooth(state){
		this._smooth = state;
		this.p1._smooth = state;
		this.p2._smooth = state;

		this.left_isPressed = false;
		this.right_isPressed = false;
		this.down_isPressed = false;
		this.up_isPressed = false;
		this.action_isPressed = false;
	}, get smooth(){ return this._smooth; },

	set multiplayer(state){
		this._multiplayer = state;
		this.p1.multiplayer = state;
		this.p2.multiplayer = state;
	}, get multiplayer(){ return this._multiplayer; },

	// left
	set left(state){
		if(!this.multiplayer){
			this._left = state;
			this.left_isPressed = state;
		}
	},
	get left(){
		if(!this.multiplayer){
			var return_data = this._left;

			if(!this._smooth)
				this._left = false;

			return return_data;
		}
	},


	// right
	set right(state){
		if(!this.multiplayer){
			this._right = state;
			this.right_isPressed = state;
		}
	},
	get right(){
		if(!this.multiplayer){
			var return_data = this._right;

			if(!this._smooth)
				this._right = false;

			return return_data;
		}
	},

	// down
	set down(state){
		if(!this.multiplayer){
			this._down = state;
			this.down_isPressed = state;
		}
	},
	get down(){
		if(!this.multiplayer){
			var return_data = this._down;

			if(!this._smooth)
				this._down = false;

			return return_data;
		}
	},

	// up
	set up(state){
		if(!this.multiplayer){
			this._up = state;
			this.up_isPressed = state;
		}
	},
	get up(){
		if(!this.multiplayer){
			var return_data = this._up;

			if(!this._smooth)
				this._up = false;

			return return_data;
		}
	},

	p1:{
		// keybinding options: letter, arrow, gamepad
		_keybinding:"arrow",
		multiplayer:false,
		_smooth:false,

		_left: false,
		left_isPressed: false,

		_right: false,
		right_isPressed: false,

		_down: false,
		down_isPressed: false,

		_up: false,
		up_isPressed: false,

		set keybinding(state){
			if(state != "letter" && state != "arrow" && state != "gamepad"){
				console.log("'" + state + "' is not a keybinding.");
				console.log("Available keybindings: letter, arrow, gamepad");
			} else {
				this._keybinding = state;
				console.log("p1.keybinding = " + state);
			}
		}, get keybinding(){ return this._keybinding},

		set left(state){
			if(this.multiplayer){
				this._left = state;
				this.left_isPressed = state;
			}
		},
		get left(){
			if(this.multiplayer){
				var return_data = this._left;

				if(!this._smooth)
					this._left = false;

				return return_data;
			}
		},


		// right
		set right(state){
			if(this.multiplayer){
				this._right = state;
				this.right_isPressed = state;
			} else {
				this._right = state;
				this.right_isPressed = state;
			}
		},
		get right(){
			if(this.multiplayer){
				var return_data = this._right;

				if(!this._smooth)
					this._right = false;

				return return_data;
			}
		},

		// down
		set down(state){
			if(this.multiplayer){
				this._down = state;
				this.down_isPressed = state;
			}
		},
		get down(){
			if(this.multiplayer){
				var return_data = this._down;

				if(!this._smooth)
					this._down = false;

				return return_data;
			}
		},

		// up
		set up(state){
			if(this.multiplayer){
				this._up = state;
				this.up_isPressed = state;
			}
		},
		get up(){
			if(this.multiplayer){
				var return_data = this._up;

				if(!this._smooth)
					this._up = false;

				return return_data;
			}
		}
	},
	p2:{
		// keybinding options: letter, arrow, gamepad
		_keybinding:"gamepad",
		multiplayer:false,
		_smooth:false,

		_left: false,
		left_isPressed: false,

		_right: false,
		right_isPressed: false,

		_down: false,
		down_isPressed: false,

		_up: false,
		up_isPressed: false,

		set keybinding(state){
			if(state != "letter" && state != "arrow" && state != "gamepad"){
				console.log("'" + state + "' is not a keybinding");
				console.log("Available keybindings: letter, arrow, gamepad");
			} else {
				this._keybinding = state;
				console.log("p2.keybinding = " + state);
			}
		}, get keybinding(){ return this._keybinding},

		set left(state){
			if(this.multiplayer){
				this._left = state;
				this.left_isPressed = state;
			}
		},
		get left(){
			if(this.multiplayer){
				var return_data = this._left;

				if(!this._smooth)
					this._left = false;

				return return_data;
			}
		},


		// right
		set right(state){
			if(this.multiplayer){
				this._right = state;
				this.right_isPressed = state;
			} else {
				this._right = state;
				this.right_isPressed = state;
			}
		},
		get right(){
			if(this.multiplayer){
				var return_data = this._right;

				if(!this._smooth)
					this._right = false;

				return return_data;
			}
		},

		// down
		set down(state){
			if(this.multiplayer){
				this._down = state;
				this.down_isPressed = state;
			}
		},
		get down(){
			if(this.multiplayer){
				var return_data = this._down;

				if(!this._smooth)
					this._down = false;

				return return_data;
			}
		},

		// up
		set up(state){
			if(this.multiplayer){
				this._up = state;
				this.up_isPressed = state;
			}
		},
		get up(){
			if(this.multiplayer){
				var return_data = this._up;

				if(!this._smooth)
					this._up = false;

				return return_data;
			}
		},
	}
};

// gamepad initialization
var gamepads = navigator.getGamepads();
if(gamepads[0] != null){
	var gamepad = gamepads[0];
	map.axis1 = 0;
	map.axis2 = 0;
	map.Button0 = gamepad.buttons[0].pressed;
	map.Button1 = gamepad.buttons[1].pressed;
	map.Button2 = gamepad.buttons[2].pressed;
	map.Button3 = gamepad.buttons[7].pressed;
	map.Button4 = gamepad.buttons[4].pressed;
	map.Button5 = gamepad.buttons[5].pressed;
	map.escButton = gamepad.buttons[6].pressed;
}
var gamepadInterval = setInterval(updateGamepad,5);

function updateGamepad() {
	gamepads = navigator.getGamepads();
	if(gamepads[0] != null){
		gamepad = gamepads[0];
		for (let i = 0; i < gamepad.buttons.length; i++) {
			if (gamepad.buttons[i].pressed) {
				// console.log(i);
			}
		}

		if (gamepad.axes[5] > 0.5) {
			map.axis1 = -1;
		} else if (gamepad.axes[5] < -0.5) {
			map.axis1 = 1;
		} else {
			map.axis1 = 0;
		}
		if (gamepad.axes[4] > 0.5) {
			map.axis2 = -1;
		} else if (gamepad.axes[4] < -0.5) {
			map.axis2 = 1;
		} else {
			map.axis2 = 0;
		}
		map.Button0 = gamepad.buttons[0].pressed;
		map.Button1 = gamepad.buttons[1].pressed;
		map.Button2 = gamepad.buttons[2].pressed;
		map.Button3 = gamepad.buttons[7].pressed;
		map.Button4 = gamepad.buttons[4].pressed;

		if((gamepad.buttons[5].pressed || map[13]) && !selectButtonPressed){
			map.Button5 = true;
			selectButtonPressed = true;
		}
	map.escButton = gamepad.buttons[6].pressed;
		//check if escButton is pressed (doesnt trigger the onKeyPress event)
		if((map.escButton) && !gameLoading && !escButtonPressed){ // if we hit the esc button and are not loading a game
			escButtonPressed = true;

			if(!EscOverlayIsActive && !HubControl && !OverlayIsActive){
				escOverlay = new EscOverlay();
			} else if(EscOverlayIsActive && !HubControl && !OverlayIsActive){
				escOverlay.close();
				escOverlay = null;
			}
		}
		//reset vars here, for single press controlls
		if (!map.escButton && !map[27]) {
			escButtonPressed = false;
		}
		if (!gamepad.buttons[5].pressed && !map[13]  && selectButtonPressed) {
			map.Button5 = false;
			selectButtonPressed = false;
		}
		//
	} else {
		map.axis1 = 0;
		map.axis2 = 0;
		map.Button0 = false;
		map.Button1 = false;
		map.Button2 = false;
		map.Button3 = false;
	}

	// ==========================
	// === MOVEMENT  HANDLING ===
	// ==========================

	// ===== MOVEMENT RIGHT =====
	if (map.axis1 == -1){ // joystick right
		if(!move.multiplayer){
			if(!move.right_isPressed)
				move.right = true;
		} else {
			if(move.p1.keybinding == "gamepad"){
				if(!move.p1.right_isPressed)
					move.p1.right = true;
			} else if (move.p2.keybinding == "gamepad"){
				if(!move.p2.right_isPressed)
					move.p2.right = true;
			}
		}

	} else if(map[39]){ // right arrow
		if(!move.multiplayer){
			if(!move.right_isPressed)
				move.right = true;
		} else {
			if(move.p1.keybinding == "arrow"){
				if(!move.p1.right_isPressed)
					move.p1.right = true;
			} else if (move.p2.keybinding == "arrow"){
				if(!move.p2.right_isPressed)
					move.p2.right = true;
			}
		}

	} else if(map[68]){ // D key
		if(!move.multiplayer){
			if(!move.right_isPressed)
				move.right = true;
		} else {
			if(move.p1.keybinding == "letter"){
				if(!move.p1.right_isPressed)
					move.p1.right = true;
			} else if (move.p2.keybinding == "letter"){
				if(!move.p2.right_isPressed)
					move.right = true;
			}
		}

	} else if(true){ //if none of them broke this chain, we need to check all these
		if (map.axis1 == 0) {
			move.right = false;

			if(move.p1.keybinding == "gamepad")
				move.p1.right = false;
			if (move.p2.keybinding == "gamepad")
				move.p2.right = false;
		}
		if(!map[39]) {
			move.right = false;

			if(move.p1.keybinding == "arrow")
				move.p1.right = false;
			if (move.p2.keybinding == "arrow")
				move.p2.right = false;
		}
		if(!map[68]) {
			move.right = false;

			if(move.p1.keybinding == "letter")
				move.p1.right = false;
			if (move.p2.keybinding == "letter")
				move.p2.right = false;

		}
	}

	// ===== MOVEMENT LEFT =====
	if (map.axis1 == 1){ // joystick left
		if(!move.multiplayer){
			if(!move.left_isPressed)
				move.left = true;
		} else {
			if(move.p1.keybinding == "gamepad"){
				if(!move.p1.left_isPressed)
					move.p1.left = true;
			} else if (move.p2.keybinding == "gamepad"){
				if(!move.p2.left_isPressed)
					move.p2.left = true;
			}
		}

	} else if(map[37]){ // left arrow
		if(!move.multiplayer){
			if(!move.left_isPressed)
				move.left = true;
		} else {
			if(move.p1.keybinding == "arrow"){
				if(!move.p1.left_isPressed)
					move.p1.left = true;
			} else if (move.p2.keybinding == "arrow"){
				if(!move.p2.left_isPressed)
					move.p2.left = true;
			}
		}

	} else if(map[65]){ // A key
		if(!move.multiplayer){
			if(!move.left_isPressed)
				move.left = true;
		} else {
			if(move.p1.keybinding == "letter"){
				if(!move.p1.left_isPressed)
					move.p1.left = true;
			} else if (move.p2.keybinding == "letter"){
				if(!move.p2.left_isPressed)
					move.left = true;
			}
		}

	} else if(true){ //if none of them broke this chain, we need to check all these
		if (map.axis1 == 0) {
			move.left = false;

			if(move.p1.keybinding == "gamepad")
				move.p1.left = false;
			if (move.p2.keybinding == "gamepad")
				move.p2.left = false;
		}
		if(!map[37]) {
			move.left = false;

			if(move.p1.keybinding == "arrow")
				move.p1.left = false;
			if (move.p2.keybinding == "arrow")
				move.p2.left = false;
		}
		if(!map[65]) {
			move.left = false;

			if(move.p1.keybinding == "letter")
				move.p1.left = false;
			if (move.p2.keybinding == "letter")
				move.p2.left = false;

		}
	}

	// ===== MOVEMENT UP =====
	if (map.axis2 == -1){ // joystick up
		if(!move.multiplayer){
			if(!move.up_isPressed)
				move.up = true;
		} else {
			if(move.p1.keybinding == "gamepad"){
				if(!move.p1.up_isPressed)
					move.p1.up = true;
			} else if (move.p2.keybinding == "gamepad"){
				if(!move.p2.up_isPressed)
					move.p2.up = true;
			}
		}

	} else if(map[38]){ // up arrow
		if(!move.multiplayer){
			if(!move.up_isPressed)
				move.up = true;
		} else {
			if(move.p1.keybinding == "arrow"){
				if(!move.p1.up_isPressed)
					move.p1.up = true;
			} else if (move.p2.keybinding == "arrow"){
				if(!move.p2.up_isPressed)
					move.p2.up = true;
			}
		}

	} else if(map[87]){ // W key
		if(!move.multiplayer){
			if(!move.up_isPressed)
				move.up = true;
		} else {
			if(move.p1.keybinding == "letter"){
				if(!move.p1.up_isPressed)
					move.p1.up = true;
			} else if (move.p2.keybinding == "letter"){
				if(!move.p2.up_isPressed)
					move.up = true;
			}
		}

	} else if(true){ //if none of them broke this chain, we need to check all these
		if(map.axis2 == 0) {
			move.up = false;

			if(move.p1.keybinding == "gamepad")
				move.p1.up = false;
			if(move.p2.keybinding == "gamepad")
				move.p2.up = false;
		}
		if(!map[38]) {
			move.up = false;

			if(move.p1.keybinding == "arrow")
				move.p1.up = false;
			if(move.p2.keybinding == "arrow")
				move.p2.up = false;
		}
		if(!map[87]) {
			move.up = false;

			if(move.p1.keybinding == "letter")
				move.p1.up = false;
			if(move.p2.keybinding == "letter")
				move.p2.up = false;

		}
	}

	// ===== MOVEMENT DOWN =====
	if (map.axis2 == 1){ // joystick down
		if(!move.multiplayer){
			if(!move.down_isPressed)
				move.down = true;
		} else {
			if(move.p1.keybinding == "gamepad"){
				if(!move.p1.down_isPressed)
					move.p1.down = true;
			} else if (move.p2.keybinding == "gamepad"){
				if(!move.p2.down_isPressed)
					move.p2.down = true;
			}
		}

	} else if(map[40]){ // down arrow
		if(!move.multiplayer){
			if(!move.down_isPressed)
				move.down = true;
		} else {
			if(move.p1.keybinding == "arrow"){
				if(!move.p1.down_isPressed)
					move.p1.down = true;
			} else if (move.p2.keybinding == "arrow"){
				if(!move.p2.down_isPressed)
					move.p2.down = true;
			}
		}

	} else if(map[83]){ // S key
		if(!move.multiplayer){
			if(!move.down_isPressed)
				move.down = true;
		} else {
			if(move.p1.keybinding == "letter"){
				if(!move.p1.down_isPressed)
					move.p1.down = true;
			} else if (move.p2.keybinding == "letter"){
				if(!move.p2.down_isPressed)
					move.down = true;
			}
		}

	} else if(true){ //if none of them broke this chain, we need to check all these
		if(map.axis2 == 0) {
			move.down = false;

			if(move.p1.keybinding == "gamepad")
				move.p1.down = false;
			if(move.p2.keybinding == "gamepad")
				move.p2.down = false;
		}
		if(!map[40]) {
			move.down = false;

			if(move.p1.keybinding == "arrow")
				move.p1.down = false;
			if(move.p2.keybinding == "arrow")
				move.p2.down = false;
		}
		if(!map[83]) {
			move.down = false;

			if(move.p1.keybinding == "letter")
				move.p1.down = false;
			if(move.p2.keybinding == "letter")
				move.p2.down = false;

		}
	}
};

function drawBorders() {
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(0,900);
	ctx.moveTo(1440,0);
	ctx.lineTo(1440,900);
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.stroke();
	ctx.stroke();
}
