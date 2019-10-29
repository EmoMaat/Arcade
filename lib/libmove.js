let map = {};
let move = {};
let gmap = [];
let gamepads = [];
let keyloggingInterval = (()=>{});

(()=> {
	onkeydown = onkeyup = function(e){
		e = e || event;
		map[e.keyCode] = e.type == 'keydown';
	}

	window.addEventListener("gamepadconnected", (e) => { GamepadConnectionHandler(e, true); });
	window.addEventListener("gamepaddisconnected", (e) => { GamepadConnectionHandler(e, true); });

	gmap[0] = {
		axis0: 0,
		axis1: 0,
		realAxisX: 0,
		realAxisY: 0,
		buttonA: false,
		buttonB: false,
		buttonX: false,
		buttonY: false,
		buttonLB: false,
		buttonRB: false,
		buttonLT: false,
		buttonRT: false,
		buttonBack: false,
		buttonStart: false
	};
	function GamepadConnectionHandler(event, connecting){
		let gamepad = event.gamepad;
		if(connecting){
			console.log("Connected a controller")
			gamepads[gamepad.index] = gamepad;
			let p = 0;
			if(!move.multiplayer){
				if(move.keybinding != "gamepad" && move.controllerId == null){
					move.keybinding = "gamepad";
					move.controllerId = gamepad.index;
				}
			} else
				for(p; p < move.player.length; p++)
					if(move.player[p].keybinding != "gamepad" && move.player[p].controllerId == null){
						move.player[p].keybinding == "gamepad";
						move.player[p].controllerId == gamepad.index;
						break;
					} else if(p == move.player.length - 1)
						p = -1;

			if(p !== -1)
				gmap[p] = {
					axis0: 0,
					axis1: 0,
					realAxisX: 0,
					realAxisY: 0,
					buttonA: gamepad.buttons[0].pressed,
					buttonB: gamepad.buttons[1].pressed,
					buttonX: gamepad.buttons[2].pressed,
					buttonY: gamepad.buttons[3].pressed,
					buttonLB: gamepad.buttons[4].pressed,
					buttonRB: gamepad.buttons[5].pressed,
					buttonLT: gamepad.buttons[6].pressed,
					buttonRT: gamepad.buttons[7].pressed,
					buttonBack: gamepad.buttons[8].pressed,
					buttonStart: gamepad.buttons[9].pressed
				};
		} else {
			console.log("Disconnected a controller")
			if(!move.multiplayer){
				if(move.keybinding == "gamepad" && gamepad.index == move.controllerId){
					move.keybinding = "wasd";
					move.controllerId = null;
				}
			} else
				for(let p = 0; p < move.player.length; p++)
					if(move.player[p].keybinding == "gamepad" && gamepad.index == move.player[p].controllerId){
						if(p == 0)
							move.player[p].keybinding = "wasd";
						else if(p == 1)
							move.player[p].keybinding = "arrows";
						else
							alert("keybindingError: move.keybinding cannot be set for player "+p+": not enough other keybindings vailable")
						move.player[p].controllerId = null;
						delete gamepads[gamepad.index];
						return;
					}
		}
	};

	keyloggingInterval = new Interval(() => {
		for(let g = 0; g < gamepads.length; g++){
			let gamepad = gamepads[g];

			if(gamepad.axes[0] <= -0.5)
				gmap[g].axis0 = -1;
			else if (gamepad.axes[0] >= 0.5)
				gmap[g].axis0 = 1;
			else
				gmap[g].axis0 = 0;

			if(gamepad.axes[1] <= -0.5)
				gmap[g].axis1 = -1;
			else if (gamepad.axes[1] >= 0.5)
				gmap[g].axis1 = 1;
			else
				gmap[g].axis1 = 0;

			gmap[g].realAxis0 = gamepad.axes[0]
			gmap[g].realAxis1 = gamepad.axes[1]

			gmap[g].buttonA = gamepad.buttons[0].pressed;
			gmap[g].buttonB = gamepad.buttons[1].pressed;
			gmap[g].buttonX = gamepad.buttons[2].pressed;
			gmap[g].buttonY = gamepad.buttons[3].pressed;
			gmap[g].buttonLB = gamepad.buttons[4].pressed;
			gmap[g].buttonRB = gamepad.buttons[5].pressed;
			gmap[g].buttonLT = gamepad.buttons[6].pressed;
			gmap[g].buttonRT = gamepad.buttons[7].pressed;
			gmap[g].buttonBack = gamepad.buttons[8].pressed;
			gmap[g].buttonStart = gamepad.buttons[9].pressed;
		}

		for(let p = 0; p < move.player.length; p++){
			if(move.player[p].keybinding == "arrows"){
				move.player[p].left = map[37];
				move.player[p].right = map[39];
				move.player[p].up = map[38];
				move.player[p].down = map[40];
			} else if(move.player[p].keybinding == "wasd"){
				move.player[p].left = map[65];
				move.player[p].right = map[68];
				move.player[p].up = map[87];
				move.player[p].down = map[83];
			} else if(move.player[p].keybinding == "gamepad" && typeof(gmap[p]) !== "undefined"){
				move.left = gmap[p].axis0 == -1;
				move.right = gmap[p].axis0 == 1;
				move.up = gmap[p].axis1 == -1;
				move.down = gmap[p].axis1 == 1;
			} else if(typeof(gmap[p]) === "undefined" && !errorLogging.controllerMissing[p + 1]){
				errorLogging.controllerMissing[p + 1] = true;
				console.log("Keybinding for player "+p+" set to 'gamepad', but neither controller nor a gamepad is found ")
			}
		}

		// if(move.left)
		// 	console.log("left")
		// if(move.right)
		// 	console.log("right")
		// if(move.up)
		// 	console.log("up")
		// if(move.down)
		// 	console.log("down")
	}, 40);
})();


class MoveKey{
	constructor(){
		this._state = false;			// represents the virtual state of the key
		this.pressed = false;			// represents the phisycal state of the key
		this.listener =  null;			// storage for a listener

		this._logOnce = true;	// whether continuous keylogging is enabled for this particular key
		this._cooldown = {
			state: false,
			defTimer: 10,
			timer: 10
		};
	}

	/**
	 * Set the state of the key
	 * @param state state of the key
	 */
	set state(state){
		// if press is not registered, set the state
		if(!this.pressed)
			this._state = state;

		this.pressed = state;

		// if cooldown is enabled, override the code above
		if(this.cooldown.state && state){
			if(this.cooldown.timer == this.cooldown.defTimer){
				this._state = true;
				this.cooldown.timer--;
			} else if(this.cooldown.timer >= 0){
				this._state = false;
				this.cooldown.timer--;
			} else if (this.cooldown.timer < 0){
				this._state = true;
			}
		}

		if (this.cooldown.state && !state){
			this.cooldown.timer = this.cooldown.defTimer;
			this._state = false;
		}

		// if there is a listener set, execute the listener and then the same code present in "get left()",
		// as a listener is also a way of getting
		if(this.listener !== null && this.state){
			this.listener();

			// var return_data = this.state;

			// if(!this._continuous)
			// 	this.state = false;

			// return return_data;
		}
	}

	/**
	 * Get the state of the key
	 */
	get state(){
		var return_data = this._state;

		// If we should only log the press once, reset the state
		if(this._logOnce)
			this._state = false;

		return return_data;
	}

	/**
	 * Sets the state of the logging
	 */
	set logOnce(state){
		this._logOnce = state;

		// If the state is false, the cooldown can be reset
		if(!state)
			this.cooldown = state;
	}
	get continuous (){ return this._logOnce}

	set cooldown(state){
		if(!this._logOnce || !state)
			this._cooldown.state = state;
		else
			console.log("Please enable continuous logging for: move.left");
	}
	get cooldown (){ return this._cooldown.state}

	setEventListener(func){
		this.listener = func;
	}
}

class MovePlayer{
	constructor(keybinding, controllerID){
		this.keybinding = keybinding || "wasd";
		this.controllerID = controllerID || null;
		this._logPressOnce = false;

		this._left = new MoveKey();
		this._right = new MoveKey();
		this._up = new MoveKey();
		this._down = new MoveKey();
	}

	set logPressOnce(state){
		this._logPressOnce = state;
		this._left.logOnce = state;
		this._right.logOnce = state;
		this._up.logOnce = state;
		this._down.logOnce = state;
	}
	get logPressOnce (){ return this.logPressOnce}

	/**
	 * Getter and setter for left key
	 */
	get left(){ return this._left.state; }
	set left(state){ this._left.state = state; }

	/**
	 * Getter and setter for left key
	 */
	get right(){ return this._right.state; }
	set right(state){ this._right.state = state; }

	/**
	 * Getter and setter for left key
	 */
	get up(){ return this._up.state; }
	set up(state){ this._up.state = state; }

	/**
	 * Getter and setter for left key
	 */
	get down(){ return this._down.state; }
	set down(state){ this._down.state = state; }
}

class Move{
	constructor(){
		this.multiplayer = false;
		this.player = [new MovePlayer()];
	}

	set multiplayer(state){
		if(state)
			this.player = [new MovePlayer(), new MovePlayer()];
		else
			this.player = [new MovePlayer()];
	}
	get multiplayer(){ return this.multiplayer; }

	/**
	 * Sets the logPressOnce
	 */
	set logPressOnce(state){
		this.player[0].logPressOnce = state;
		this.player[0]._left.logOnce = state;
		this.player[0]._right.logOnce = state;
		this.player[0]._up.logOnce = state;
		this.player[0]._down.logOnce = state;
	}
	get logPressOnce (){ return this.logPressOnce}


	/**
	 * Getter and setter for left key
	 * Accesser for left key values
	 */
	get left(){ return this.player[0]._left.state; }
	set left(state){ this.player[0]._left.state = state; }

	get _left(){ return this.player[0]._left; }

	/**
	 * Getter and setter for right key
	 * Accesser for right key values
	 */
	get right(){ return this.player[0]._right.state; }
	set right(state){ this.player[0]._right.state = state; }

	get _right(){ return this.player[0]._right; }

	/**
	 * Getter and setter for up key
	 * Accesser for up key values
	 */
	get up(){ return this.player[0]._up.state; }
	set up(state){ this.player[0]._up.state = state; }

	get _up(){ return this.player[0]._up; }

	/**
	 * Getter and setter for down key
	 * Accesser for down key values
	 */
	get down(){ return this.player[0]._down.state; }
	set down(state){ this.player[0]._down.state = state; }

	get _down(){ return this.player[0]._down; }
}

move = new Move();