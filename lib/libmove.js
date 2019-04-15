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
		
		if(!move.multiplayer){
			if(move.keybinding == "arrows"){
				move.left = map[37];
				move.right = map[39];
				move.up = map[38];
				move.down = map[40];
			} else if(move.keybinding == "wasd"){
				move.left = map[65];
				move.right = map[68];
				move.up = map[87];
				move.down = map[83];
			} else if(move.keybinding == "gamepad" && typeof(gmap[0]) !== "undefined"){
				move.left = gmap[0].axis0 == -1;
				move.right = gmap[0].axis0 == 1;
				move.up = gmap[0].axis1 == -1;
				move.down = gmap[0].axis1 == 1;
			} else if(typeof(gmap[0]) === "undefined" && !errorLogging.controllerMissing[0]){
				errorLogging.controllerMissing[0] = true;
				console.log("Keybinding set to 'gamepad', but neither controller nor a gamepad is found ")
			}

		} else if(move.multiplayer)
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
				} else if(move.keybinding == "gamepad" && typeof(gmap[g]) !== "undefined"){
					move.left = gmap[g].axis0 == -1;
					move.right = gmap[g].axis0 == 1;
					move.up = gmap[g].axis1 == -1;
					move.down = gmap[g].axis1 == 1;
				} else if(typeof(gmap[g]) === "undefined" && !errorLogging.controllerMissing[g + 1]){
					errorLogging.controllerMissing[g + 1] = true;
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

	move = {
		keybinding: "wasd",			// keybinding. Either "wasd", "arrows" or "gamepad"
		controllerId: null,			// ID that stores the connected gamepad identifier
		_multiplayer: false,		// whether multiplayer is enabled 
		_continuous:false,			// whether continuous keylogging is enabled for all movements
		player:[],					// stores all the instances for multiplayer
		
		set multiplayer(state){
			this._multiplayer = state;
			if(state){
				this.player[0] = this.playerObject;
				this.player[1] = this.playerObject;
			} else
				this.player = null;
		}, get multiplayer(){ return this._multiplayer },

		set continuous(state){
			this._continuous = state;
			this._left.continuous = state;
			this._right.continuous = state;
			this._up.continuous = state;
			this._down.continuous = state;
		}, get continuous (){ return this._continuous},

		set hickup(state){
			this._left.hickup = state;
			this._right.hickup = state;
			this._up.hickup = state;
			this._down.hickup = state;
		},
		_left:{
			state:false,		// represents the virtual state of the key
			pressed:false,		// represents the phisycal state of the key
			listener: null,		// storage for a listener
			_continuous:false,	// whether continuous keylogging is enabled for this particular key
			_hickup: {			// whether a hickcup after the first keylog is enabled
				state:false,
				defTimer:10,
				timer:10
			},

			set continuous(state){
				this._continuous = state;
				if(!state)
					this._hickup.state = state;
			},
			
			set hickup(state){
				if(this._continuous || !state)
					this._hickup.state = state;
				else
					console.log("Please enable continuous logging for: move.left");
			}, get hickup (){ return this._hickup.state},

			setEventListener: function(func){ 
				console.log("For resetting the listener, make it null and not an empty function")
				this.listener = func; 
			}
		},
		_right:{
			state:false,
			pressed:false,
			listener: null,
			_continuous:false,
			_hickup: {
				state:false,
				defTimer:10,
				timer:10
			},

			set continuous(state){
				this._continuous = state;
				if(!state)
					this._hickup.state = state;
			}, get continuous (){ return this._continuous},
			
			set hickup(state){
				if(this._continuous || !state)
					this._hickup.state = state;
				else
					console.log("Please enable continuous logging for: move.right");
			}, get hickup (){ return this._hickup.state},

			setEventListener: function(func){ 
				console.log("For resetting the listener, make it null and not an empty function")
				this.listener = func; 
			}
		},
		_up:{
			state:false,
			pressed:false,
			listener: null,
			_continuous:false,
			_hickup: {
				state:false,
				defTimer:10,
				timer:10
			},

			set continuous(state){
				this._continuous = state;
				if(!state)
					this._hickup.state = state;
			}, get continuous (){ return this._continuous},
			
			set hickup(state){
				if(this._continuous || !state)
					this._hickup.state = state;
				else
					console.log("Please enable continuous logging for: move.up");
			}, get hickup (){ return this._hickup.state},

			setEventListener: function(func){ 
				console.log("For resetting the listener, make it null and not an empty function")
				this.listener = func; 
			}
		},
		_down:{
			state:false,
			pressed:false,
			listener: null,
			_continuous:false,
			_hickup: {
				state:false,
				defTimer:10,
				timer:10
			},

			set continuous(state){
				this._continuous = state;
				if(!state)
					this._hickup.state = state;
			}, get continuous (){ return this._continuous},
			
			set hickup(state){
				if(this._continuous || !state)
					this._hickup.state = state;
				else
					console.log("Please enable continuous logging for: move.down");
			}, get hickup (){ return this._hickup.state},

			setEventListener: function(func){ 
				console.log("For resetting the listener, make it null and not an empty function")
				this.listener = func; 
			}
		},

		set left(state){
			// if press is not registered, set the state 
			if(!this._left.pressed)
				this._left.state = state;
			this._left.pressed = state;

			// if hickup is enabled, override the code above
			if(this._left._hickup.state && state)
				if(this._left._hickup.timer == this._left._hickup.defTimer){
					this._left.state = true;
					this._left._hickup.timer--;
				} else if(this._left._hickup.timer >= 0){
					this._left.state = false;
					this._left._hickup.timer--;
				} else if (this._left._hickup.timer < 0){
					this._left.state = true;
				}
			if (this._left._hickup.state && !state){
				this._left._hickup.timer = this._left._hickup.defTimer;
				this._left.state = false;
			}

			// if there is a listener set, execute the listener and then the same code present in "get left()",
			// as a listener is also a way of getting
			if(this._left.listener !== null && this._left.state){
				this._left.listener();		
				var return_data = this._left.state;
			
				if(!this._left._continuous)
					this._left.state = false;
				
				return return_data;  
			}
		},
		get left(){
			var return_data = this._left.state;
			
			if(!this._left._continuous)
				this._left.state = false;
			
			return return_data;  
		},

		set right(state){
			if(!this._right.pressed)
				this._right.state = state;
			this._right.pressed = state;

			if(this._right._hickup.state && state)
				if(this._right._hickup.timer == this._right._hickup.defTimer){
					this._right.state = true;
					this._right._hickup.timer--;
				} else if(this._right._hickup.timer >= 0){
					this._right.state = false;
					this._right._hickup.timer--;
				} else if (this._right._hickup.timer < 0){
					this._right.state = true;
				}
			if (this._right._hickup.state && !state){
				this._right._hickup.timer = this._right._hickup.defTimer;
				this._right.state = false;
			}

			if(this._right.listener !== null && this._right.state){
				this._right.listener();
				var return_data = this._right.state;
			
				if(!this._right._continuous)
					this._right.state = false;
				
				return return_data;  
			}
		},
		get right(){
			var return_data = this._right.state;
			
			if(!this._right._continuous)
				this._right.state = false;
			
			return return_data;  
		},
		set up(state){
			if(!this._up.pressed)
				this._up.state = state;
			this._up.pressed = state;

			if(this._up._hickup.state && state)
				if(this._up._hickup.timer == this._up._hickup.defTimer){
					this._up.state = true;
					this._up._hickup.timer--;
				} else if(this._up._hickup.timer >= 0){
					this._up.state = false;
					this._up._hickup.timer--;
				} else if (this._up._hickup.timer < 0){
					this._up.state = true;
				}
			if (this._up._hickup.state && !state){
				this._up._hickup.timer = this._up._hickup.defTimer;
				this._up.state = false;
			}

			if(this._up.listener !== null && this._up.state){
				this._up.listener();
				var return_data = this._up.state;
			
				if(!this._up._continuous)
					this._up.state = false;
				
				return return_data;  
			}
		},
		get up(){
			var return_data = this._up.state;
			
			if(!this._up._continuous)
				this._up.state = false;
			
			return return_data;  
		},
		set down(state){
			if(!this._down.pressed)
				this._down.state = state;
			this._down.pressed = state;

			if(this._down._hickup.state && state)
				if(this._down._hickup.timer == this._down._hickup.defTimer){
					this._down.state = true;
					this._down._hickup.timer--;
				} else if(this._down._hickup.timer >= 0){
					this._down.state = false;
					this._down._hickup.timer--;
				} else if (this._down._hickup.timer < 0){
					this._down.state = true;
				}
			if (this._down._hickup.state && !state){
				this._down._hickup.timer = this._down._hickup.defTimer;
				this._down.state = false;
			}

			if(this._down.listener !== null && this._down.state){
				this._down.listener();
				var return_data = this._down.state;
			
				if(!this._down._continuous)
					this._down.state = false;
				
				return return_data;  
			}
		},
		get down(){
			var return_data = this._down.state;
			
			if(!this._down._continuous)
				this._down.state = false;
			
			return return_data;  
		},

		playerObject:{
			keybinding:"arrows",
			controllerId: null,
			_continuous:false,

			set continuous(state){
				this._continuous = state;
				this._left.continuous = state;
				this._right.continuous = state;
				this._up.continuous = state;
				this._down.continuous = state;
			}, get continuous() { return _continuous; },

			_left:{
				state:false,
				pressed:false,
				listener: null,
				_continuous:false,
				_hickup: {
					state:false,
					defTimer:10,
					timer:10
				},
		
				set continuous(state){
					this._continuous = state;
					if(!state)
						this._hickup.state = state;
				}, get continuous (){ return this._continuous},
				
				set hickup(state){
					if(this._continuous || !state)
						this._hickup.state = state;
					else
						console.log("Please enable continuous logging for: move.left");
				}, get hickup (){ return this._hickup.state},

				setEventListener: function(func){ 
					console.log("For resetting the listener, make it null and not an empty function")
					this.listener = func; 
				}
			},
			_right:{
				state:false,
				pressed:false,
				listener: null,
				_continuous:false,
				_hickup: {
					state:false,
					defTimer:10,
					timer:10
				},
		
				set continuous(state){
					this._continuous = state;
					if(!state)
						this._hickup.state = state;
				}, get continuous (){ return this._continuous},
				
				set hickup(state){
					if(this._continuous || !state)
						this._hickup.state = state;
					else
						console.log("Please enable continuous logging for: move.right");
				}, get hickup (){ return this._hickup.state},

				setEventListener: function(func){ 
					console.log("For resetting the listener, make it null and not an empty function")
					this.listener = func; 
				}
			},
			_up:{
				state:false,
				pressed:false,
				listener: null,
				_continuous:false,
				_hickup: {
					state:false,
					defTimer:10,
					timer:10
				},
		
				set continuous(state){
					this._continuous = state;
					if(!state)
						this._hickup.state = state;
				}, get continuous (){ return this._continuous},
				
				set hickup(state){
					if(this._continuous || !state)
						this._hickup.state = state;
					else
						console.log("Please enable continuous logging for: move.up");
				}, get hickup (){ return this._hickup.state},

				setEventListener: function(func){ 
					console.log("For resetting the listener, make it null and not an empty function")
					this.listener = func; 
				}
			},
			_down:{
				state:false,
				pressed:false,
				listener: null,
				_continuous:false,
				_hickup: {
					state:false,
					defTimer:10,
					timer:10
				},
		
				set continuous(state){
					this._continuous = state;
					if(!state)
						this._hickup.state = state;
				}, get continuous (){ return this._continuous},
				
				set hickup(state){
					if(this._continuous || !state)
						this._hickup.state = state;
					else
						console.log("Please enable continuous logging for: move.down");
				}, get hickup (){ return this._hickup.state},

				setEventListener: function(func){ 
					console.log("For resetting the listener, make it null and not an empty function")
					this.listener = func; 
				}
			},
		
			set left(state){
				if(!this._left.pressed)
					this._left.state = state;
				this._left.pressed = state;
		
				if(this._left._hickup.state && state)
					if(this._left._hickup.timer == this._left._hickup.defTimer){
						this._left.state = true;
						this._left._hickup.timer--;
					} else if(this._left._hickup.timer >= 0){
						this._left.state = false;
						this._left._hickup.timer--;
					} else if (this._left._hickup.timer < 0){
						this._left.state = true;
					}
				if (this._left._hickup.state && !state){
					this._left._hickup.timer = this._left._hickup.defTimer;
					this._left.state = false;
				}

				if(this._left.listener !== null){
					this.listener();
					var return_data = this._left.state;
				
					if(!this._left._continuous)
						this._left.state = false;
					
					return return_data;  
				}
			},
			get left(){
				var return_data = this._left.state;
				
				if(!this._left._continuous)
					this._left.state = false;
				
				return return_data;  
			},
		
			set right(state){
				if(!this._right.pressed)
					this._right.state = state;
				this._right.pressed = state;
		
				if(this._right._hickup.state && state)
					if(this._right._hickup.timer == this._right._hickup.defTimer){
						this._right.state = true;
						this._right._hickup.timer--;
					} else if(this._right._hickup.timer >= 0){
						this._right.state = false;
						this._right._hickup.timer--;
					} else if (this._right._hickup.timer < 0){
						this._right.state = true;
					}
				if (this._right._hickup.state && !state){
					this._right._hickup.timer = this._right._hickup.defTimer;
					this._right.state = false;
				}

				if(this._right.listener !== null && this._right.state){
					this._right.listener();
					var return_data = this._right.state;
				
					if(!this._right._continuous)
						this._right.state = false;
					
					return return_data;  
				}
			},
			get right(){
				var return_data = this._right.state;
				
				if(!this._right._continuous)
					this._right.state = false;
				
				return return_data;  
			},
			set up(state){
				if(!this._up.pressed)
					this._up.state = state;
				this._up.pressed = state;
		
				if(this._up._hickup.state && state)
					if(this._up._hickup.timer == this._up._hickup.defTimer){
						this._up.state = true;
						this._up._hickup.timer--;
					} else if(this._up._hickup.timer >= 0){
						this._up.state = false;
						this._up._hickup.timer--;
					} else if (this._up._hickup.timer < 0){
						this._up.state = true;
					}
				if (this._up._hickup.state && !state){
					this._up._hickup.timer = this._up._hickup.defTimer;
					this._up.state = false;
				}

				if(this._up.listener !== null && this._up.state){
					this._up.listener();
					var return_data = this._up.state;
				
					if(!this._up._continuous)
						this._up.state = false;
					
					return return_data;  
				}
			},
			get up(){
				var return_data = this._up.state;
				
				if(!this._up._continuous)
					this._up.state = false;
				
				return return_data;  
			},
			set down(state){
				if(!this._down.pressed)
					this._down.state = state;
				this._down.pressed = state;
		
				if(this._down._hickup.state && state)
					if(this._down._hickup.timer == this._down._hickup.defTimer){
						this._down.state = true;
						this._down._hickup.timer--;
					} else if(this._down._hickup.timer >= 0){
						this._down.state = false;
						this._down._hickup.timer--;
					} else if (this._down._hickup.timer < 0){
						this._down.state = true;
					}
				if (this._down._hickup.state && !state){
					this._down._hickup.timer = this._down._hickup.defTimer;
					this._down.state = false;
				}

				if(this._down.listener !== null && this._down.state){
					this._down.listener();
					var return_data = this._down.state;
				
					if(!this._down._continuous)
						this._down.state = false;
					
					return return_data;  
				}
			},
			get down(){
				var return_data = this._down.state;
				
				if(!this._down._continuous)
					this._down.state = false;
				
				return return_data;  
			}
		}
	}
})()