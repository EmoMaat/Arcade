class PacManAI{
	constructor(wall_settings, space_map, intersection_map, tunnel, offset, ctx){
		this.ghosts = [];
		this.showPaths = false;
		this.eatables_eaten = 0;
		this.wall_settings = wall_settings;
		this.ctx = ctx;
		this.stuck = false;						// only used if a while got stuck in a infinite loop and the ai should be rebuilt

		this.createAI(wall_settings, space_map, intersection_map, tunnel, offset, ctx);

		this.fleeing = {
			state: false,
			deftimer: 600,
			timer:600,

			defflickertimer:20,
			flickertimer:20,
			flickerbool:false
		}

		this.scattering = {
			state:false
		}

		this.ghosthouse = {
			container:[1, 2, 3],

			release(ID){
				if(ID < arcade.game.object.ai.ghosts.length && this.container.length != 0)
					for(var c = 0; c < this.container.length; c++)
						if(this.container[c] == ID){
							arcade.game.object.ai.ghosts[this.container[c]].leaveGhosthouse();
							this.container.splice(c, 1);
						}
			},

			contain(ID){
				if(ID < arcade.game.object.ai.ghosts.length){
					arcade.game.object.ai.ghosts[ID].enterGhosthouse();
					this.container.push(ID);
				}
			}
		};

		// this contains the chase and scatter modes
		this.scatterTable = {
			//stages
			current:0,		// mode we are in
			stage:null,	// stage of the mode we are in, is null as it will be initialized later on
			timer:0,

			mode:[{
				level_low:1,	// from which level
				level_high:1, 	// to which level this applies

				stages:[
					7,	// scatter 0
					20,	// chase 0
					7,	// scatter 1
					20,	// chase 1
					5,	// scatter 2
					20,	// chase 2
					5,	// scatter 3
					-1	// chase 3 (indefinite)
				]
			},
			{
				level_low:2,
				level_high:4,

				stages:[
					7,
					20,
					7,
					20,
					5,
					1033,
					1/60,
					-1
				]
			},
			{
				level_low:5,
				level_high:255,

				stages:[
					5,
					20,
					5,
					20,
					5,
					1037,
					1/60,
					-1
				]
			}]
		};

		this.speedTable = {
			//stages
			current:0,		// mode we are in

			mode:[{
				level_low:1,	// from which level
				level_high:1, 	// to which level this applies

				pacman:0.8,
				ghosts:{
					normal:0.75,
					frightend:0.50
				}
			},
			{
				level_low:2,	// from which level
				level_high:4, 	// to which level this applies

				pacman:0.9,
				ghosts:{
					normal:0.85,
					frightend:0.55
				}
			},
			{
				level_low:5,	// from which level
				level_high:20, 	// to which level this applies

				pacman:1,
				ghosts:{
					normal:0.95,
					frightend:0.60
				}
			},
			{
				level_low:20,	// from which level
				level_high:255, 	// to which level this applies

				pacman:0.9,
				ghosts:{
					normal:0.95,
					frightend:0.60
				}
			}]
		};
		this.eatTable = {
			current:0,

			died:false,	// whether the player died in the current level
			counter:0,	// counter if the player died

			mode:[
				{
					level_low:1,
					level_high:1,

					eat_values:[
						0,			// Blinky
						0,			// Pinky
						30,		// Inky
						90		// Clyde
					],
				},
				{
					level_low:2,
					level_high:2,

					eat_values:[
						0,			// Blinky
						0,			// Pinky
						0,			// Inky
						50		// Clyde
					],
				},
				{
					level_low:3,
					level_high:3,

					eat_values:[
						0,			// Blinky
						0,			// Pinky
						0,			// Inky
						0			// Clyde
					],
				},
				[		// global counter
					0,
					7,
					14,
					32
				]
			]
		}

		this.updateGhostSettings();
	}

	createAI(wall_settings, space_map, intersection_map, tunnel, offset, ctx){
		this.ghosts.push(new PacManAI_Shell(wall_settings, space_map, intersection_map, tunnel, 0, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(wall_settings, space_map, intersection_map, tunnel, 1, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(wall_settings, space_map, intersection_map, tunnel, 2, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(wall_settings, space_map, intersection_map, tunnel, 3, offset, ctx));
	}

	updateGhostSettings(){
		for(var i = 0; i < this.ghosts.length; i++){
			this.ghosts[i].speed.default = Math.round(0.1 * this.speedTable.mode[this.speedTable.current].ghosts.normal * 1000) / 1000;
			this.ghosts[i].speed.current = Math.round(0.1 * this.speedTable.mode[this.speedTable.current].ghosts.normal * 1000) / 1000;
		}
	}

	update(pacman, ghosts){
		//console.log(this.fleeing.timer)
		this.scatterHandler();
		this.fleeingHandler();

		// releasing the ghosts
		if(!this.eatTable.died){
			for(g = 0; g < this.ghosts.length; g++){
				if(this.eatables_eaten >= this.eatTable.mode[this.eatTable.current].eat_values[g] && this.ghosts[g].ghosthouse.inside){
					this.ghosthouse.release(g);
					break;
				}
			}
		} else {
			for(g = 0; g < this.ghosts.length; g++){
				if(this.eatTable.counter >= this.eatTable.mode[this.eatTable.mode.length - 1][g] && this.ghosts[g].ghosthouse.inside){
					this.ghosthouse.release(g);
					break;
				}
			}
		}

		// update all ghosts
		for(var g = 0; g < this.ghosts.length; g++){
			// if the ghost was already eaten but is caught again, release
			if(this.ghosts[g]._waseaten && this.ghosts[g].ghosthouse.inside){
				this.ghosthouse.release(g);			// move the AI out of the ghosthouse
				this.ghosts[g].leaveGhosthouse();	// needs to be called as well for some reason
			}

			this.ghosts[g].update(pacman, ghosts);
		}
	}

	scatterHandler(){
		// handle the scatter stages
		if(this.scatterTable.timer == -1) {  // -1 is infinite
			for(var g = 0; g < this.ghosts.length; g++)
					if(!this.ghosts[g].eaten && !this.ghosts[g].ghosthouse.inside)
						this.ghosts[g].scattering = false;

		} else if(this.scatterTable.timer <= 0){ // if a timer is zero a new one should be placed
			// up the stage for next time
			if(this.scatterTable.stage == null)
				this.scatterTable.stage = 0;
			else if(this.scatterTable.stage + 1 < this.scatterTable.mode[this.scatterTable.current].stages.length)
				this.scatterTable.stage++;

			// get the time associated with the level and stage
			this.scatterTable.timer = this.scatterTable.mode[this.scatterTable.current].stages[this.scatterTable.stage]; //seconds
		} else {
			this.scatterTable.timer -= 0.05; // update time

			// if the stage is even, scatter
			if(this.scatterTable.stage % 2 == 0)
				for(var g = 0; g < this.ghosts.length; g++)
					if(!this.ghosts[g].eaten && !this.ghosts[g].ghosthouse.inside)
						this.ghosts[g].scattering = true;

			// else the stage is odd, attack
			if(this.scatterTable.stage % 2 != 0)
				for(var g = 0; g < this.ghosts.length; g++)
					if(!this.ghosts[g].eaten && !this.ghosts[g].ghosthouse.inside)
						this.ghosts[g].scattering = false;
		}
	}

	fleeingHandler(){
		// flickering of the ghosts
		if(this.fleeing.state){ // if the ghosts should be in the fleeing state
			if (this.fleeing.timer == 600){ // if we did not touch the timer yet
				// set all the fleeing states of the ghosts to true
				for(var i = 0; i < this.ghosts.length; i++)
					if(!this.ghosts[i].ghosthouse.inside){
						this.ghosts[i].fleeing = true;
						this.ghosts[i].speed.current *= this.speedTable.mode[this.speedTable.current].ghosts.frightend;
					}

				// decrease the timer
				this.fleeing.timer--;

			} else if(this.fleeing.timer > 0 && this.fleeing.timer < this.fleeing.deftimer * 0.3){
				if(this.fleeing.flickerbool){ // going on
					this.fleeing.flickertimer--;
					if (this.fleeing.flickertimer <= 0){
						this.fleeing.flickertimer = 0;
						this.fleeing.flickerbool = false;

						for(var i = 0; i < this.ghosts.length; i++){
							if(!this.ghosts[i].ghosthouse.inside && this.ghosts[i].fleeing){
								this.ghosts[i]._animate_fleeing = this.fleeing.flickerbool;
							}
						}
					}
				} else { // going off
					this.fleeing.flickertimer++;
					if (this.fleeing.flickertimer >= this.fleeing.defflickertimer){
						this.fleeing.flickertimer = this.fleeing.defflickertimer;
						this.fleeing.flickerbool = true;

						for(var i = 0; i < this.ghosts.length; i++){
							if(!this.ghosts[i].ghosthouse.inside && this.ghosts[i].fleeing){
								this.ghosts[i]._animate_fleeing = this.fleeing.flickerbool;
							}
						}
					}
				}
				this.fleeing.timer--;
			} else if(this.fleeing.timer <= 0){ // if the timer is run out
				this.fleeing.timer = this.fleeing.deftimer;
				this.fleeing.state = false;

				for(var i = 0; i < this.ghosts.length; i++){
					if(!this.ghosts[i].ghosthouse.inside && this.ghosts[i].fleeing){
						this.ghosts[i].speed.current = this.ghosts[i].speed.default * this.speedTable.mode[this.speedTable.current].ghosts.normal; // reset the speed to its default
						this.ghosts[i].fleeing = true;

						// the ghosts should turn when coming out of fleeing
						this.ghosts[i].force_uturn = true;
						let tries = 0;
						while(this.ghosts[i].force_uturn){
							if(tries > 100){
								this.ai = {};
								this.createAI();
								console.log("This while loop got probably stuck in an inifinite loop, and the ai has been rebuilt to prevent a timeout")
								break;
							}

							this.ghosts[i].move();
							tries++
						}

						this.ghosts[i].fleeing = false;
					}
				}
			} else
				this.fleeing.timer--;
		}
	}
}

/**
 * Shell with functions around the real AI
 */
class PacManAI_Shell{
	constructor(wall_settings, space_map, intersection_map, tunnel, ghostID, offset, ctx){
		// ---- init ----
		this.offset = offset;
		this.pathGenerator = new PacManPathGenerator(ghostID);
		this.ID = ghostID;
		this.pathColor = this.pathGenerator.GhostBeaviour.pathColor;
		this.back = 3; 							// up = 0, right = 1, down = 2, left = 3
		this.radius = window.width / 128;		// = 15
		this.ctx = ctx;

		this.wall_settings = wall_settings;
		this.space_map = space_map;
		this.intersection_map = intersection_map;
		this.tunnel = tunnel;
		this.path = [];

		this.debug = false;

		// ---- location ----
		this.x = this.pathGenerator.GhostBeaviour.x;
		this.y = this.pathGenerator.GhostBeaviour.y;
		this.node = {
			x:this.x,
			y:this.y
		};

		// next node AI will move to
		this.next_node = {
			x:this.x,
			y:this.y
		};

		// ---- targeting ----
		// only used to see if our path still leads us to pacman
		this.target = {x: 0, y: 0};

		// ---- states ----
		// AI eat variables

		this._customPath = false;			// whether a custom path is active
		this._fleeing = this.pathGenerator.GhostBeaviour.insideGhosthouse;
		this._animate_fleeing = false;		// whether the animation of fleeing should be active
		this._eaten = false;				// whether the AI is eaten
		this._waseaten = false;				// whether he was eaten before in this session

		this.disablemovement = false;		// disables AI movement
		this.force_uturn = false;			// forces a u-turn
		this.scattering = false;			// makes the AI scatter

		// speed of the AI
		this.speed = {
			current:0,
			default:0
		}

		// ghost house
		this.ghosthouse = {
			inside:this.pathGenerator.GhostBeaviour.insideGhosthouse,
			intransit:false,

			area:[
				{x:11,y:13},
				{x:18,y:17}
			]
		};

		this.node_tools = new PacManNodeTools(this.space_map, this.ghosthouse)
	}

	createAI(){
		this.ghosts.push(new PacManAI_Shell(this.wall_settings, space_map, intersection_map, tunnel, 0, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(this.wall_settings, space_map, intersection_map, tunnel, 1, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(this.wall_settings, space_map, intersection_map, tunnel, 2, offset, ctx));
		this.ghosts.push(new PacManAI_Shell(this.wall_settings, space_map, intersection_map, tunnel, 3, offset, ctx));
	}

	update(pacman, ghosts){
		// if the ghost is in transit
		if(this.ghosthouse.intransit)
			this.ghosthouseHandler();

		// else the ghost should update its path
		else
			this.generatePath(pacman, ghosts);

		this.move();
		this.draw();
	}

	generatePath(pacman, ghosts){
		if(!this.fleeing && this.atIntersection())
			// if scattering, generate a circular path to and around its home
			if(this.scattering)
				this.path = this.pathGenerator.scatter(this.node, this.next_node, this.back, this.space_map);
			else if(!this.stuckInTunnel() && !this.ghosthouse.intransit){
				this.path = this.pathGenerator.attack(pacman, ghosts, this.path, this.node, this.next_node, this.back, this.space_map, this.node_tools);
			}
	}

	move(){
		// EXPLANATION OF THE MOVE CODE
		/*
		if(this.x < this.path[0].x){
			if(this.x + this.speed.current > this.node.x + 1){	// if our movespeed moves the AI past the target
				this.x = this.node.x = this.path[0].x;  // update the position to the target
				if(this.path.length != 0)
					this.path.splice(0,1);				// remove the target from the path

				this.back = 4;
			} else if(this.y == Math.round(this.y)){	// if the AI is on a round y line
				this.x += this.speed.current;					// move the AI
				this.back = 4;							// set the back of the AI so he can't uturn
				this.next_node.x = this.node.x + 1; 	// make the target node always one further
			}
		}

		// teleporting
		// target_node must be always one ahead of the AI
		if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.next_node.x = 3; return false;}
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.next_node.x = 26; return false;}
		*/

		// just prevent movement
		if(this.disablemovement) {} else

		// if fleeing
		if(this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.next_node.x = 3; return false;}
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.next_node.x = 26; return false;}

			if(this.back == 3){
				if(this.x + this.speed.current > this.node.x + 1){
					this.x = this.node.x + 1;
					this.node.x += 1;

					if(this.force_uturn){
						this.back = 1;
						this.force_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed.current;
					this.next_node.x = this.node.x + 1;
				}
			}

			if(this.back == 1){
				if(this.x - this.speed.current < this.node.x - 1){
					this.x = this.node.x -= 1;

					if(this.force_uturn){
						this.back = 3;
						this.force_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed.current;
					this.next_node.x = this.node.x - 1;
				}
			}

			if(this.back == 0){
				if(this.y + this.speed.current > this.node.y + 1){
					this.y = this.node.y += 1;

					if(this.force_uturn){
						this.back = 2;
						this.force_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed.current;
					this.next_node.y = this.node.y + 1;
				}
			}

			if(this.back == 2){
				if(this.y - this.speed.current < this.node.y - 1){
					this.y = this.node.y -= 1;

					if(this.force_uturn){
						this.back = 0;
						this.force_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed.current;
					this.next_node.y = this.node.y - 1;
				}
			}

			if(this.x == this.next_node.x || this.y == this.next_node.y){
				// calculate the AI nodes
				if(this.back == 0)
					this.node.y = Math.floor(this.y);

				if(this.back == 1)
					this.node.x = Math.ceil(this.x);

				if(this.back == 2)
					this.node.y = Math.ceil(this.y);

				if(this.back == 3)
					this.node.x = Math.floor(this.x);
			}
		} else

		// if following a created path
		if(this.path[0] != undefined){
			if(this.x < this.path[0].x){
				if(this.x + this.speed.current > this.node.x + 1){
					this.x = this.path[0].x;
					this.back = 3;
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed.current;
					this.back = 3;
					this.next_node.x = this.node.x + 1;
				}
			} else

			if(this.x > this.path[0].x){
				if(this.x - this.speed.current < this.node.x - 1){
					this.x = this.path[0].x;
					this.back = 1;
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed.current;
					this.back = 1;
					this.next_node.x = this.node.x - 1;
				}
			} else

			if(this.y < this.path[0].y){
				if(this.y + this.speed.current > this.node.y + 1){
					this.y = this.path[0].y;
					this.back = 0;
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed.current;
					this.back = 0;
					this.next_node.y = this.node.y + 1;
				}
			} else

			if(this.y > this.path[0].y){
				if(this.y - this.speed.current < this.node.y - 1){
					this.y = this.path[0].y;
					this.back = 2;
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed.current;
					this.back = 2;
					this.next_node.y = this.node.y - 1;
				}
			}

			if(this.x == this.path[0].x && this.y == this.path[0].y){
				// calculate the AI nodes
				if(this.back == 0)
					this.node.y = Math.floor(this.y);

				if(this.back == 1)
					this.node.x = Math.ceil(this.x);

				if(this.back == 2)
					this.node.y = Math.ceil(this.y);

				if(this.back == 3)
					this.node.x = Math.floor(this.x);


				// rebuild path
				if(this.path.length != 0){
					this.path.splice(0,1);
				}
			}
		}

	}

	draw(x = this.x, y = this.y){
		if(this.debug){
			this.ctx.fillStyle = this.pathColor;
			for(var p = 0; p < this.path.length; p++){
				this.ctx.beginPath();
				this.ctx.arc(this.path[p].x * this.wall_settings.size + this.wall_settings.size + this.offset, this.path[p].y * this.wall_settings.size + this.wall_settings.size, 5, 0, 2 * Math.PI);
				this.ctx.fill();
			}
		}

		if(this.eaten){
			this.ctx.strokeStyle="#222";
		} else
			this.ctx.strokeStyle="white";

		this.ctx.lineWidth = 3;

		x += this.offset / this.wall_settings.size;

		x += 0.5;	// position correction
		y += 0.5;	// position correction


		this.ctx.beginPath();
		this.ctx.arc(x * this.wall_settings.size, y * this.wall_settings.size, this.radius, Math.PI, 0, false);
		this.ctx.moveTo(x * this.wall_settings.size - this.radius, y * this.wall_settings.size);

		// LEGS
		if (this._animate_fleeing){
			this.ctx.lineTo(x * this.wall_settings.size - this.radius, y * this.wall_settings.size + this.radius-this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size - this.radius + this.radius / 3, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size - this.radius + (this.radius / 3) * 2, y * this.wall_settings.size + this.radius-this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius/3, y * this.wall_settings.size + this.radius - this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size + (this.radius / 3) * 2, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size + this.radius - this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size);
		} else {
			this.ctx.lineTo(x * this.wall_settings.size - this.radius, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size - this.radius + this.radius / 3, y * this.wall_settings.size + this.radius - this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size - this.radius + (this.radius / 3) * 2, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size + this.radius - this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius / 3, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size + (this.radius / 3) * 2, y * this.wall_settings.size + this.radius - this.radius / 4);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size + this.radius);
			this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size);
		}

		this.ctx.moveTo(x * this.wall_settings.size - this.radius, y * this.wall_settings.size);
		this.ctx.lineTo(x * this.wall_settings.size + this.radius / 3, y * this.wall_settings.size - this.radius);

		this.ctx.moveTo(x * this.wall_settings.size - this.radius, y * this.wall_settings.size + this.radius / 2);
		this.ctx.lineTo(x * this.wall_settings.size + this.radius / 1.5, y * this.wall_settings.size - this.radius / 1.35);

		this.ctx.moveTo(x * this.wall_settings.size - this.radius / 1.1, y * this.wall_settings.size + this.radius / 1.1);
		this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size - this.radius / 2);

		this.ctx.moveTo(x * this.wall_settings.size - this.radius / 7, y * this.wall_settings.size + this.radius - this.radius / 7);
		this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size); // just a small number

		this.ctx.moveTo(x * this.wall_settings.size + (this.radius / 5) * 2, y * this.wall_settings.size + this.radius - this.radius / 10);
		this.ctx.lineTo(x * this.wall_settings.size + this.radius, y * this.wall_settings.size + this.radius - this.radius / 2);
		this.ctx.stroke();
	}

	/**
	 * Handles the enter and leaving of the ghosthouse
	 */
	ghosthouseHandler(){
		// enter the ghosthouse
		if(!this.ghosthouse.inside){
			if(this.path.length <= 1){
				this.disablemovement = true;
				this.path = [];

				// move the ghost to the x-axis center
				this.x = this.x < 14.5 - this.speed.current ? this.x += this.speed.current : this.x > 14.5 + this.speed.current ? this.x -= this.speed.current : this.x = 14.5;

				// move the ghost down
				if(this.x == 14.5)
					if(this.y < 14)
						this.y += this.speed.current;
					else{
						this.y = 14;
						this.node = {x:14, y:14};
						this.next_node = {x:13, y:14};
						this.ghosthouse = {inside: true, intransit: false};
						this.back = 1;

						this.speed.current = this.speed.default;
						this.eaten = false;

						this.disablemovement = false;
						this._fleeing = true;
					}
			}
		} else

		// leave the ghosthouse
		if(this.ghosthouse.inside){
			if(this.path.length <= 1){
				this.disablemovement = true;
				this.path = [];

				// move the ghost to the x-axis center
				this.x = this.x < 14.5 - this.speed.current ? this.x += this.speed.current : this.x > 14.5 + this.speed.current ? this.x -= this.speed.current : this.x = 14.5;

				// move the ghost down
				if(this.x == 14.5)
					if(this.y > 12)
						this.y -= this.speed.current;
					else{
						this.y = 12;
						this.node = {x:14, y:12};
						this.next_node = {x:15, y:12}
						this.back = 3;

						this.disablemovement = false;
						this._fleeing = false;
						this.ghosthouse = {inside: false, intransit: false};
					}
			}
		}
	}

	/**
	 * sets the state of fleeing
	 */
	set fleeing(state){
		if(!this.ghosthouse.inside)
			this._fleeing = state;

		this._animate_fleeing = state;

		if(state){
			this.path = [];
			this.force_uturn = true;
		}
	} get fleeing(){ return this._fleeing;};

	set eaten(state){
		this._eaten = state;

		if(state){
			// set the back to something non-existant so the pathfinding may search in all directions
			this.back = 4;
			this.speed.current = 0.3;
			this.enterGhosthouse();
		}
	} get eaten(){ return this._eaten; };

	/**
	 * let the ghost enter the box
	 */
	enterGhosthouse(){
		if(!this.ghosthouse.inside){
			this._animate_fleeing = false;
			this.ghosthouse.intransit = true;

			this.customPath({x:14,y:12});
		}
	}

	/**
	 * let the ghost leave the box
	 */
	leaveGhosthouse(){
		if(this.ghosthouse.inside){
			this.customPath({x:14,y:14});
			this.ghosthouse.intransit = true;
		}
	}

	/**
	 * customPath requires an x and y in one var, and returns a path, but its hidden vallue will be a boolean
	 * @param {*} destination target
	 */
	customPath(destination){
		this._fleeing = false;
		this.scattering = false;

		// create a path
		if(this.inTunnel())
			this.path = new PacMan_PathFinding({x:this.next_node.x, y:this.next_node.y},{x:destination.x,y:destination.y},this.space_map, "manhattan", 4);
		else
			this.path = new PacMan_PathFinding({x:this.next_node.x, y:this.next_node.y},{x:destination.x,y:destination.y},this.space_map, "manhattan", this.back);

		// check the path
		if(this.path[0].x != this.next_node.x || this.path[0].y != this.next_node.y){
			this.path.reverse(); 				// reverse the path
			this.path.push(this.next_node); 	// add target_node to the last place
			this.path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
			this.path.splice(0,1);
		}
	}

	/**
	 * checks whether an new path could or should be created
	 * @param {*} node node we are on
	 * @param {*} path path with nodes
	 * @param {*} intersection_map map with all intersections
	 */
	atIntersection(node = this.node, path = this.path, intersection_map = this.intersection_map){
		if(path.length == 0)
			return true;

		for(var i = 0; i < intersection_map.length; i++){
			if(node.x == intersection_map[i].x && node.y == intersection_map[i].y)
				return true;
		}
		return false;
	}
	/**
	 * generates a random direction excluding the back
	 * @param {*} next_node next node it is moving towards
	 * @param {*} space_map map with all the available spaces
	 */
	randomDir(next_node = this.next_node, space_map = this.space_map, back = this.back){
		var ret = [];
		for (let i = 0; i < space_map.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (space_map[i].x == next_node.x - 1 && space_map[i].y == next_node.y && back != 3){
				ret.push({x:space_map[i].x, y:space_map[i].y, cost:space_map[i].cost, back:1});
			}

			// right
			if (space_map[i].x == next_node.x + 1 && space_map[i].y == next_node.y && back != 1) {
				ret.push({x:space_map[i].x, y:space_map[i].y, cost:space_map[i].cost, back:3});
			}

			// down
			if (space_map[i].x == next_node.x && space_map[i].y == next_node.y + 1 && back != 2) {
				ret.push({x:space_map[i].x, y:space_map[i].y, cost:space_map[i].cost, back:0});
			}

			// top
			if (space_map[i].x == next_node.x && space_map[i].y == next_node.y - 1 && back != 0) {
				ret.push({x:space_map[i].x, y:space_map[i].y, cost:space_map[i].cost, back:2});
			}
		}

		if(ret.length > 0){
			return ret[Math.floor(Math.random() * ret.length)].back;
		}
	}

	stuckInTunnel(){
		// if we are in a tunnel, the pathfinding will be unable to create a path,
		// so we first move out of the tunnel
		if(this.inTunnel() && !this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.next_node.x = 3; return false;}
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.next_node.x = 26; return false;}

			// if stuck in tunnel tunnel
			if(this.back == 1 && this.x < 7 && this.node.y == 15){
				this.x -= this.speed.current;
				this.path = [];
				this.next_node.x = this.node.x - 1;

				return true;
			} else

			if(this.back == 3 & this.x > 22 && this.node.y == 15){
				this.x += this.speed.current;
				this.path = [];
				this.next_node.x = this.node.x + 1;

				return true;
			}
		}

		return false;
	}

	inTunnel(){
		for(var i = 0; i < this.tunnel.length; i++){
			if(this.next_node.x == this.tunnel[i].x && this.next_node.y == this.tunnel[i].y)
			return true;
		}

		// else not in tunnel
		return false;
	}
}

/**
 * Shell containing the AI and the scatter function, which is in every AI the same
 */
class PacManPathGenerator{
	constructor(ID){
		this.GhostBeaviour = ID == 0 ? new PacManAI_Oikake() : ID == 1 ? new PacManAI_Machibuse() : ID == 2 ? new PacManAI_Kimagure() : new PacManAI_Otoboke();
	}

	attack(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools){
		return this.GhostBeaviour.createPath(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools);
	}

	/**
	 * Creates a path to the home specified
	 * @param {*} node
	 * @param {*} next_node
	 * @param {*} back
	 * @param {*} home
	 * @param {*} space_map
	 */
	scatter(node, next_node, back, space_map, home = this.GhostBeaviour.home){
		var path = [];

		//if not on home ID 1, and our target is not home ID 1, create a path
		if(node.x == home[0].x && node.y == home[0].y){
			path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:home[1].x,y:home[1].y}, space_map, "manhattan", back);
		} else {
			path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:home[0].x,y:home[0].y}, space_map, "manhattan", back,);
		}

		// if our node we are already moving towards is not in our path, add it
		if(path[0].x != next_node.x || path[0].y != next_node.y){
			path.reverse(); 			// reverse the path
			path.push(next_node); 		// add target_node to the last place
			path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(path[0].x == node.x && path[0].y == node.y){
			path.splice(0,1);
		}

		return path;
	}
}

/**
 * Contains tools used for calculation
 */
class PacManNodeTools{
	constructor(space_map, ghosthouse){
		this.space_map = space_map;

		this.ghosthouse = ghosthouse;
	}
	/**
	 * Finds the nearest space from a certain point
	 * @param {*} node contains at least an x and y
	 */
	getNearestSpaceFrom(node){
		if(!this.isWall(node.x, node.y))
			return node;

		var closedset = [];			// nodes which have been evaluated and have no more use
		var openset = [];			// nodes which have been evaluated but can serve as pointer
		var neighbours = [];		// neighbours of the current node
		openset.push(node);

		while(openset.length !== 0){
			var currentNode = openset[0]; // get the first item from the openset

			for (let i = 0; i < openset.length; i++){
				if(openset[i].x == currentNode.x && openset[i].y == currentNode.y)
					openset.splice(i, 1);
			}
			closedset.push(currentNode);

			// add the neighbours which just have been checked to the array
			if(!this.inArray(closedset, {x:currentNode.x - 1, y:currentNode.y}))
				neighbours.push({x:currentNode.x - 1, y:currentNode.y});

			if(!this.inArray(closedset, {x:currentNode.x + 1, y:currentNode.y}))
				neighbours.push({x:currentNode.x + 1, y:currentNode.y});

			if(!this.inArray(closedset, {x:currentNode.x, y:currentNode.y + 1}))
				neighbours.push({x:currentNode.x, y:currentNode.y + 1});

			if(!this.inArray(closedset, {x:currentNode.x, y:currentNode.y - 1}))
				neighbours.push({x:currentNode.x, y:currentNode.y - 1});


			for (let n = 0; n < neighbours.length; n++){
				// left
				if (!this.isWall(neighbours[n].x - 1, neighbours[n].y))
					return {x:neighbours[n].x - 1, y:neighbours[n].y};

				// right
				if (!this.isWall(neighbours[n].x + 1, neighbours[n].y))
					return {x:neighbours[n].x + 1, y:neighbours[n].y};

				// down
				if (!this.isWall(neighbours[n].x, neighbours[n].y + 1))
					return {x:neighbours[n].x, y:neighbours[n].y + 1};

				// top
				if (!this.isWall(neighbours[n].x, neighbours[n].y - 1))
					return {x:neighbours[n].x, y:neighbours[n].y - 1};

				// add the currentNode to the closedset
				openset.push(neighbours[n]);
			}

			neighbours = [];
		}
	}

	isWall(x, y){
		var isWall = true;

		// if in the box it should be treated as a wall
		if(!(this.ghosthouse.area[0].x < x && this.ghosthouse.area[1].x > x &&
			this.ghosthouse.area[0].y < y && this.ghosthouse.area[1].y > y)){

			for (let i = 0; i < this.space_map.length; i++){
				if(this.space_map[i].x == x && this.space_map[i].y == y)
					isWall = false;
			}
		}
        return isWall;
	}

	inArray(array, node){
		for (var i = 0; i < array.length; i++){
			if(node.x == array[i].x && node.y == array[i].y)
				return true;
		}
		return false;
	}
}

/**
 * AI pathfinding
 */
class PacManAI_Oikake{
	constructor(){
		// defines place to go if scattering
		this.pathColor = "red";
		this.insideGhosthouse = false;

		this.x = 14;
		this.y = 12;
		this.home = [
			{x: 27, y: 2},
			{x: 26, y: 2}
		];
	}

	createPath(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools){
		// if pacman leaves the target tile, calculate a new path to that target tile
		if(current_path.length == 0 || (pacman.x != current_path[current_path.length - 1].x || pacman.y != current_path[current_path.length - 1].y)){
			var path = [];

			// debugging will return the whole class instead of only a path
			path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:pacman.x,y:pacman.y}, space_map, "manhattan", back);

			// if our node we are already moving towards is not in our path, add it
			if(path[0].x != next_node.x || path[0].y != next_node.y){
				path.reverse(); 			// reverse the path
				path.push(next_node); 		// add next_node to the last place
				path.reverse();				// reverse again
			}

			return path;
		} else
			return current_path;
	}
}

class PacManAI_Machibuse{
	constructor(){
		// defines place to go if scattering
		this.pathColor = "pink";
		this.insideGhosthouse = true;

		this.x = 13;
		this.y = 15;
		this.home = [
			{x: 2, y: 2},
			{x: 3, y: 2}
		];
	}

	createPath(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools){
		// Machibuse will always try to get 4 tiles in front of PacMan
		// pacmans angle is his face
		var pacmanTarget = {x:0, y:0};

		switch(pacman.angle){
			case 0:
				pacmanTarget.x = pacman.x;
				pacmanTarget.y = pacman.y - 4;
				break;
			case 1:
				pacmanTarget.x = pacman.x + 4;
				pacmanTarget.y = pacman.y;
				break;
			case 2:
				pacmanTarget.x = pacman.x;
				pacmanTarget.y = pacman.y + 4;
				break;
			case 3:
				pacmanTarget.x = pacman.x - 4;
				pacmanTarget.y = pacman.y;
				break;
		}

		if(node_tools.isWall(pacmanTarget.x, pacmanTarget.y))
			pacmanTarget = node_tools.getNearestSpaceFrom({x:pacmanTarget.x, y:pacmanTarget.y});

		if(current_path.length == 0 || (pacmanTarget.x != current_path[current_path.length - 1].x || pacmanTarget.y != current_path[current_path.length - 1].y)){
			// generate a path
			var path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:pacmanTarget.x,y:pacmanTarget.y}, space_map, "manhattan", back);

			// if our node we are already moving towards is not in our path, add it
			if(path[0].x != next_node.x || path[0].y != next_node.y){
				path.reverse(); 				// reverse the path
				path.push(next_node); 	// add next_node to the last place
				path.reverse();				// reverse again
			}

			return path;
		} else
			return current_path;
	}
}

class PacManAI_Kimagure{
	constructor(){
		// defines place to go if scattering
		this.pathColor = "cyan";
		this.insideGhosthouse = true;

		this.x = 14;
		this.y = 15;
		this.home = [
			{x: 26, y: 30},
			{x: 27, y: 30}
		];
	}

	createPath(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools){
		// Kimagure will use a dubble vector from Oikake to 2 tiles in front of pacman as target
		// pacmans angle is his face
		var pacmanTarget = {x:0, y:0};

		switch(pacman.angle){
			case 0:
				pacmanTarget.x = pacman.x;
				pacmanTarget.y = pacman.y - 2;
				break;
			case 1:
				pacmanTarget.x = pacman.x + 2;
				pacmanTarget.y = pacman.y;
				break;
			case 2:
				pacmanTarget.x = pacman.x;
				pacmanTarget.y = pacman.y + 2;
				break;
			case 3:
				pacmanTarget.x = pacman.x - 2;
				pacmanTarget.y = pacman.y;
				break;
		}

		// get the heuristics to the target
		pacmanTarget.x = pacmanTarget.x + (pacmanTarget.x - ghosts[0].node.x);
		pacmanTarget.y = pacmanTarget.y + (pacmanTarget.y - ghosts[0].node.y);

		// if the goal is outside the playgound, change to to the playground borders
		if(pacmanTarget.x > 28) pacmanTarget.x = 28; else if(pacmanTarget.x < 2) pacmanTarget.x = 2;
		if(pacmanTarget.y > 30) pacmanTarget.y = 30; else if(pacmanTarget.y < 2) pacmanTarget.y = 0;

		if(node_tools.isWall(pacmanTarget.x, pacmanTarget.y))
			pacmanTarget = node_tools.getNearestSpaceFrom({x:pacmanTarget.x, y:pacmanTarget.y});

		if(current_path.length == 0 || (pacmanTarget.x != current_path[current_path.length - 1].x || pacmanTarget.y != current_path[current_path.length - 1].y)){
			var path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:pacmanTarget.x,y:pacmanTarget.y}, space_map, "manhattan", back);

			// if our node we are already moving towards is not in our path, add it
			if(path[0].x != next_node.x || path[0].y != next_node.y){
				path.reverse(); 			// reverse the path
				path.push(next_node); 		// add next_node to the last place
				path.reverse();				// reverse again
			}

			return path;
		} else
			return current_path;
	}
}

class PacManAI_Otoboke{
	constructor(){
		// defines place to go if scattering
		this.pathColor = "yellow";
		this.insideGhosthouse = true;

		this.x = 16;
		this.y = 15;
		this.home = [
			{x: 3, y: 30},
			{x: 2, y: 30}
		];
	}

	createPath(pacman, ghosts, current_path, node, next_node, back, space_map, node_tools){
		var pacmanTarget = {x:0, y:0};
		var pacmanRadius = 8;

		var posx = node.x - pacman.x;
		var posy = node.y - pacman.y;
		if (pacmanRadius > Math.sqrt((posx * posx) + (posy * posy))){
			//if not on home ID 1, and our target is not home ID 1, create a path
			if(node.x == this.home[0].x && node.y == this.home[0].y){
				path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:this.home[1].x,y:this.home[1].y}, space_map, "manhattan", back);
			} else {
				path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:this.home[0].x,y:this.home[0].y}, space_map, "manhattan", back,);
			}

			// if our node we are already moving towards is not in our path, add it
			if(path[0].x != next_node.x || path[0].y != next_node.y){
				path.reverse(); 			// reverse the path
				path.push(next_node); 		// add target_node to the last place
				path.reverse();				// reverse again
			}

			// if we are already on this.path[0], remove
			if(path[0].x == node.x && path[0].y == node.y){
				path.splice(0,1);
			}

			return path;

		} else
		// if pacman leaves the target tile, calculate a new path to that target tile
		if(current_path.length == 0 || (pacman.x != current_path[current_path.length - 1].x || pacman.y != current_path[current_path.length - 1].y)){
			var path = [];

			// debugging will return the whole class instead of only a path
			path = new PacMan_PathFinding({x:next_node.x, y:next_node.y},{x:pacman.x,y:pacman.y}, space_map, "manhattan", back);

			// if our node we are already moving towards is not in our path, add it
			if(path[0].x != next_node.x || path[0].y != next_node.y){
				path.reverse(); 			// reverse the path
				path.push(next_node); 		// add next_node to the last place
				path.reverse();				// reverse again
			}

			return path;
		} else
			return current_path;
	}
}
