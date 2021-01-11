class PacManAI{
	constructor(wallSettings, spaceMap, intersectionMap, tunnel, ghosts){
		this.ghosts = [];
		this.showPaths = false;
		this.eatables_eaten = 0;
		this.wallSettings = wallSettings;

		this.ghosts.push(new PacManAI_Oikake(wallSettings, spaceMap, intersectionMap, tunnel));
		this.ghosts.push(new PacManAI_Machibuse(wallSettings, spaceMap, intersectionMap, tunnel));
		this.ghosts.push(new PacManAI_Kimagure(wallSettings, spaceMap, intersectionMap, tunnel));
		this.ghosts.push(new PacManAI_Otoboke(wallSettings, spaceMap, intersectionMap, tunnel));

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

		this.ghosts_eaten = [];
		this.box = {
			container:[1, 2, 3],

			release(ID){
				if(ID < pacManGame.ai.ghosts.length && this.container.length != 0)
					for(var c = 0; c < this.container.length; c++)
						if(this.container[c] == ID){
							pacManGame.ai.ghosts[this.container[c]].leavebox = true;
							this.container.splice(c, 1);
						}
			},

			contain(ID){
				if(ID < pacManGame.ai.ghosts.length){
					pacManGame.ai.ghosts[ID].enterbox = true;
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
	
	updateGhostSettings(){
		for(var i = 0; i < this.ghosts.length; i++){
			this.ghosts[i].defspeed = 0.1 * this.speedTable.mode[this.speedTable.current].ghosts.normal; 
			this.ghosts[i].speed = 0.1 * this.speedTable.mode[this.speedTable.current].ghosts.normal;
			
			this.ghosts[i].eaten.speed = 0.3;
			this.ghosts[i].eaten.blinkrate = 300;
			this.ghosts[i].eaten.blinkspeed = 15;
		}
	}

	update(pacman, ghosts){
		// flickering of the ghosts
		if(this.fleeing.state){ // if the ghosts should be in the fleeing state		
			if (this.fleeing.timer == 600){ // if we did not touch the timer yet
				// set all the fleeing states of the ghosts to true
				for(var i = 0; i < this.ghosts.length; i++)
					if(!this.ghosts[i].inbox){
						this.ghosts[i].fleeing = true;
						this.ghosts[i].speed *= this.speedTable.mode[this.speedTable.current].ghosts.frightend;
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
							if(!this.ghosts[i].inbox && this.ghosts[i].fleeing){
								this.ghosts[i]._fleeing_animate = this.fleeing.flickerbool;
							}
						}
					}
				} else { // going off
					this.fleeing.flickertimer++;
					if (this.fleeing.flickertimer >= this.fleeing.defflickertimer){
						this.fleeing.flickertimer = this.fleeing.defflickertimer;
						this.fleeing.flickerbool = true;
						
						for(var i = 0; i < this.ghosts.length; i++){
							if(!this.ghosts[i].inbox && this.ghosts[i].fleeing){
								this.ghosts[i]._fleeing_animate = this.fleeing.flickerbool;
							}
						}
					}
				}  
				this.fleeing.timer--;
			} else if(this.fleeing.timer <= 0){ // if the timer is run out
				this.fleeing.timer = this.fleeing.deftimer;
				this.fleeing.state = false;
				
				for(var i = 0; i < this.ghosts.length; i++){
					if(!this.ghosts[i].inbox && this.ghosts[i].fleeing){
						this.ghosts[i].speed = this.ghosts[i].defspeed * this.speedTable.mode[this.speedTable.current].ghosts.normal; // reset the speed to its default
						this.ghosts[i].fleeing = true;

						// the ghosts should turn when coming out of fleeing
						this.ghosts[i].allow_uturn = true;
						while(this.ghosts[i].allow_uturn)
							this.ghosts[i].move();
						
						this.ghosts[i].fleeing = false;
					}
				}
			} else
				this.fleeing.timer--;
		} else

		// handle the scatter stages
		if(this.scatterTable.timer == -1) {  // -1 is infinite				
			for(var g = 0; g < this.ghosts.length; g++)
					if(!this.ghosts[g].eaten.state && !this.ghosts[g].inbox)
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
					if(!this.ghosts[g].eaten.state && !this.ghosts[g].inbox)
						this.ghosts[g].scattering = true;

			// else the stage is odd, attack
			if(this.scatterTable.stage % 2 != 0)
				for(var g = 0; g < this.ghosts.length; g++)
					if(!this.ghosts[g].eaten.state && !this.ghosts[g].inbox)
						this.ghosts[g].scattering = false;
		}
		
		// releasing the ghosts
		if(!this.eatTable.died){
			for(g = 0; g < this.ghosts.length; g++){
				if(this.eatables_eaten >= this.eatTable.mode[this.eatTable.current].eat_values[g] && this.ghosts[g].inbox){
					this.box.release(g);
					break;
				}
			}
		} else {
			for(g = 0; g < this.ghosts.length; g++){
				if(this.eatTable.counter >= this.eatTable.mode[this.eatTable.mode.length - 1][g] && this.ghosts[g].inbox){
					this.box.release(g);
					break;
				}
			}
		}
		
		if(!this.fleeing.state && this.ghosts_eaten.length != 0)
			this.ghosts_eaten = [];
		
		// update all ghosts
		for(var i = 0; i < this.ghosts.length; i++){
			this.ghosts[i].update(pacman, ghosts);

			if(this.ghosts[i].fleeing){
				if(pacman.x == this.ghosts[i].node.x && pacman.y == this.ghosts[i].node.y){
					this.ghosts[i].eaten.state = true;
					this.ghosts[i].speed = this.ghosts[i].eaten.speed;
					this.ghosts[i].allow_uturn = true;

					// when fleeing, if certain conditions are met and allow_uturn is true,
					// the ai will turn. This means move until allow_uturn is false
					while(this.ghosts[i].allow_uturn)
						this.ghosts[i].move();

					this.ghosts[i].fleeing = false;
					this.box.contain(i);

					this.ghosts_eaten.push(i);
				}
			} else if (this.ghosts[i].eaten.state && this.ghosts[i].path.length == 0)
				this.box.contain(i);
		
			// debugging
			if(this.showPaths){
				ctx.fillStyle = this.ghosts[i].pathColor;
				for(var p = 0; p < this.ghosts[i].path.length; p++){
					ctx.beginPath();
					ctx.arc(this.ghosts[i].path[p].x * this.wallSettings.size + this.wallSettings.size, this.ghosts[i].path[p].y * this.wallSettings.size + this.wallSettings.size, 5, 0, 2 * Math.PI);
					ctx.fill(); 
				}
			}
		}
	}
}

class PacManAI_Oikake{
	constructor(wallSettings, spaceMap, intersectionMap, tunnel, size = canvas.width / 128 /* = 15*/){
		this.name = "Oikake";
		this.pathColor = "red";
		this.color = 255; 		// only white or grey colors, so only one value
		this.defspeed = 0;		// globaly set
		this.speed = 0; 		// 0.022

		this.inbox = false;				// whether the ai is in the box
		this.leavebox = false;			// if set to true the ai will try to leave the box
		this.enterbox = false;			// if set to true the ai will try to enter the box
		this.disablemovement = false;	// disables the ais movement
		this._customPath = false;
		this.scattering = false;		// scatter boolean
		this._fleeing = false; 			// fleeing hidden boolean, getter and setter defined in this class
		this._fleeing_animate = false;	// whether we should change the ghost' appearance
		this.allow_uturn = false;		// whether or not the ai may make a uturn
		// if both are false, the AI will be chasing 

		this.home = [{x: 27, y: 2}, {x: 26, y: 2}];	// place to go if scatteringing
		this.target = {x: 0, y: 0}; 				// only used to see if our path still leads us to pacman

		this.x = 14;
		this.y = 12;
		this.node = {
			x:this.x,
			y:this.y
		};

		// next node AI will move to
		this.target_node = {
			x:this.x,
			y:this.y
		};

		// box
		this.box = [
			{x:11,y:13},
			{x:18,y:17},
		];

		// AI eat variables
		this.eaten = {
			state:false,
			speed:0,		// globaly set

			blinkrate:0,	// globaly set
			blinkcurrent:0, // globaly set
			blinkspeed:0,	// globaly set
			blinkbool:true	// true is going on, false is going off
		}

		this.back = 3; // up = 0, right = 1, down = 2, left = 3 
		this.radius = size;
		
		this.wallSettings = wallSettings;
		this.tunnel = tunnel;
		this.spaceMap = spaceMap;
		this.intersectionMap = intersectionMap;
		this.path = [];
		
		this.debug = false;
	}
	
	/**
	 * 
	 * @param {Object} pacman position of the player
	 * @param {Object} ghosts required for Kimagure AI / Inky AI
	 */
	update(pacman, ghosts){
		this.updatePath(pacman);
		this.move();
		this.draw(this.x, this.y);
	}

	updatePath(pacman){
		if(this.leavebox){
			if(!this.inbox){
				console.log("already outside the box");
				this.leavebox = false;
				return;
			}

			this._fleeing = false;
			this.customPath = {x:14,y:14};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y >= 12)
					this.y -= this.speed;
				else if(this.y < 12){
					this.y = 12;
					this.node.y = 12; this.target_node.y = 12;
					this.disablemovement = false;
					this.leavebox = false;
					this.inbox = false;
					this.fleeing = false;
					this._customPath = false;
				}
			}
		} else

		if(this.enterbox){
			if(this.inbox){
				console.log("already inside the box");
				this.enterbox = false;
				return;
			}

			this.customPath = {x:14,y:12};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y <= 14)
					this.y += this.speed;
				else if(this.y > 14){
					this.y = 14;
					this.node.y = 14; this.target_node.y = 14;
					this.disablemovement = false;
					this.enterbox = false;
					this._customPath = false;
					this._fleeing = true;
					this._fleeing_animate = false;
					this.inbox = true;
					this.speed = this.defspeed;
					this.eaten.state = false;
				}
			}
		} else

		// if the AI is scatteringing
		if(this.scattering && this.atIntersection()){
			var checkpath = false;
		
			//if not on home ID 1, and our target is not home ID 1, create a path
			if(this.node.x == this.home[0].x && this.node.y == this.home[0].y && 
				(this.target.x != this.home[1].x || this.target.y != this.home[1].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[1].x; this.target.y = this.home[1].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back);
			} else

			// if not on home ID 0, and our target is not home ID 0, create a path
			if(this.node.x != this.home[0].x && this.node.y != this.home[0].y &&
				(this.target.x != this.home[0].x || this.target.y != this.home[0].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[0].x; this.target.y = this.home[0].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back);
			}
			
			if(checkpath){
				// if our node we are already moving towards is not in our path, add it
				if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
					this.path.reverse(); 				// reverse the path
					this.path.push(this.target_node); 	// add target_node to the last place
					this.path.reverse();				// reverse again
				}

				// if we are already on this.path[0], remove
				if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
					this.path.splice(0,1);
				}
			}
		} else

		if(this.atIntersection()){
			// if pacman leaves the target tile, calculate a new path to that target tile
			if((pacman.x != this.target.x || pacman.y != this.target.y) || this.path.length == 0){
				if(!this.stuckInTunnel() && !this.fleeing && !this.scattering && !this.eaten.state){
					// debugging will return the whole class instead of only a path
					if(this.debug){
						this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:pacman.x,y:pacman.y},this.spaceMap, "manhattan", this.back, true);
						this.path = this.PacMan_PathFinding.path;
					} else
						this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:pacman.x,y:pacman.y},this.spaceMap, "manhattan", this.back);

					// if our node we are already moving towards is not in our path, add it
					if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
						this.path.reverse(); 				// reverse the path
						this.path.push(this.target_node); 	// add target_node to the last place
						this.path.reverse();				// reverse again
					}

					this.target.x = pacman.x; this.target.y = pacman.y;
				}
			}
		}

		// the eaten state is handeled by the system and not the AI itself

		// fleeing is random at each intersection so we have a complete seperate move function for it

		// show chosen path and examined paths
		if(this.debug){
			for(var i = 0; i < this.path.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "30px Arial";
				ctx.beginPath();
				ctx.fillText(this.path[i].h, this.path[i].x * 28 + 9, (this.path[i].y + 0.5) * 28 + 9);
				ctx.stroke();
			}

			for(var i = 0; i < this.PacMan_PathFinding.closedset.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "10px Arial";
					ctx.beginPath();
					ctx.fillText(this.PacMan_PathFinding.closedset[i].h,this.PacMan_PathFinding.closedset[i].x * 28 + 9, (this.PacMan_PathFinding.closedset[i].y + 0.5) * 28 + 9);
					ctx.stroke();
			}
		}
	}
	
	move(){
		// EXPLANATION OF THE MOVE CODE
		/*
		if(this.x < this.path[0].x){
			if(this.x + this.speed > this.node.x + 1){	// if our movespeed moves the AI past the target
				this.x = this.node.x = this.path[0].x;  // update the position to the target
				if(this.path.length != 0)
					this.path.splice(0,1);				// remove the target from the path

				this.back = 4;
			} else if(this.y == Math.round(this.y)){	// if the AI is on a round y line
				this.x += this.speed;					// move the AI
				this.back = 4;							// set the back of the AI so he can't uturn
				this.target_node.x = this.node.x + 1; 	// make the target node always one further
			}
		}

		// teleporting
		// target_node must be always one ahead of the AI
		if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}
		*/

		// just prevent movement
		if(this.disablemovement) {} else

		// if fleeing
		if(this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			if(this.back == 3){
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.node.x + 1; 
					this.node.x += 1;
					
					if(this.allow_uturn){
						this.back = 1;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;
					this.target_node.x = this.node.x + 1;
				}
			}

			if(this.back == 1){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.node.x -= 1; 
					
					if(this.allow_uturn){
						this.back = 3;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.target_node.x = this.node.x - 1;
				}
			}

			if(this.back == 0){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.node.y += 1; 
					
					if(this.allow_uturn){
						this.back = 2;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.target_node.y = this.node.y + 1;
				}
			}

			if(this.back == 2){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.node.y -= 1; 
					
					if(this.allow_uturn){
						this.back = 0;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.target_node.y = this.node.y - 1;
				}	
			}

			if(this.x == this.target_node.x || this.y == this.target_node.y){
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
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.path[0].x;  			
					this.back = 3;
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;				
					this.back = 3;						
					this.target_node.x = this.node.x + 1;
				}
			} else
			
			if(this.x > this.path[0].x){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.path[0].x; 
					this.back = 1;
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.back = 1;
					this.target_node.x = this.node.x - 1;
				}	
			} else

			if(this.y < this.path[0].y){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.path[0].y; 
					this.back = 0;	
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.back = 0;
					this.target_node.y = this.node.y + 1;
				}
			} else
			
			if(this.y > this.path[0].y){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.path[0].y; 
					this.back = 2;
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.back = 2;
					this.target_node.y = this.node.y - 1;
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

	draw(x, y){
		if(this.eaten.state){
			if(this.eaten.blinkbool){ // going on
				this.eaten.blinkcurrent -= this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent <= 0){
					this.eaten.blinkcurrent = 0;
					this.eaten.blinkbool = false;
				}
			} else { // going off
				this.eaten.blinkcurrent += this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent >= this.eaten.blinkrate){
					this.eaten.blinkcurrent = this.eaten.blinkrate;
					this.eaten.blinkbool = true;
				}
			}   

			var color = (this.eaten.blinkcurrent / this.eaten.blinkrate) * this.color;
			ctx.strokeStyle="rgb("+ color + "," + color + "," + color + ")"; 
		} else
			ctx.strokeStyle="rgb("+ this.color + "," + this.color + "," + this.color + ")"; 
		
		ctx.lineWidth = this.wallSettings.border_thickness - 2;
		
		x += 0.5;	// position correction
		y += 0.5;	// position correction

		ctx.beginPath();
		ctx.arc(x * this.wallSettings.size, y * this.wallSettings.size, this.radius, Math.PI, 0, false);
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);

		// LEGS
		if (this._fleeing_animate){
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius/3, y * this.wallSettings.size + this.radius - this.radius / 4);	
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		} else {
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		}

		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);
		ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size - this.radius);
		
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius / 2);
		ctx.lineTo(x * this.wallSettings.size + this.radius / 1.5, y * this.wallSettings.size - this.radius / 1.35);

		ctx.moveTo(x * this.wallSettings.size - this.radius / 1.1, y * this.wallSettings.size + this.radius / 1.1);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size - this.radius / 2);

		ctx.moveTo(x * this.wallSettings.size - this.radius / 7, y * this.wallSettings.size + this.radius - this.radius / 7);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size); // just a small number
		
		ctx.moveTo(x * this.wallSettings.size + (this.radius / 5) * 2, y * this.wallSettings.size + this.radius - this.radius / 10);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 2);
		ctx.stroke(); 
	}

	set fleeing(state){
		if(!this.inbox)
			this._fleeing = state;

		this._fleeing_animate = state;
		if(state){
			this.path = [];
			this.allow_uturn = true;
		}
	};
	get fleeing(){ return this._fleeing;};

	/**
	 * customPath requires an x and y in one var, and returns a path, but its hidden vallue will be a boolean
	 */
	set customPath(destination){
		this._customPath = true;

		// debugging will return the whole class instead of only a path
		if(this.debug){
			this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back, true);
			this.path = this.PacMan_PathFinding.path;
		} else
			this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back);

		// check the path
		if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
			this.path.reverse(); 				// reverse the path
			this.path.push(this.target_node); 	// add target_node to the last place
			this.path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
			this.path.splice(0,1);
		}
	};
	get customPath(){ return this.path;};

	atIntersection(){
		if(this.path.length == 0)
			return true;

		for(var i = 0; i < this.intersectionMap.length; i++){
			if(this.node.x == this.intersectionMap[i].x && this.node.y == this.intersectionMap[i].y)
				return true;
		}
		return false;
	}

	randomDir(){
		this.ret = [];
		for (let i = 0; i < this.spaceMap.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (this.spaceMap[i].x == this.target_node.x - 1 && this.spaceMap[i].y == this.target_node.y && this.back != 3){
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:1}); 
			}	
		
			// right
			if (this.spaceMap[i].x == this.target_node.x + 1 && this.spaceMap[i].y == this.target_node.y && this.back != 1) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:3});
			}	
	
			// down
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y + 1 && this.back != 2) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:0});
			}	
	
			// top
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y - 1 && this.back != 0) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:2});
			}
		}

		if(this.ret.length > 0){
			return this.ret[Math.floor(Math.random() * this.ret.length)].back;
		}
	}

	stuckInTunnel(){
		// if we are in a tunnel, the pathfinding will be unable to create a path,
		// so we first move out of the tunnel
		if(this.inTunnel() && !this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			// if stuck in tunnel tunnel
			if(this.back == 1 && this.x < 7 && this.node.y == 15){
				this.x -= this.speed;
				this.path = [];
				this.target_node.x = this.node.x - 1;

				return true;
			} else

			if(this.back == 3 & this.x > 22 && this.node.y == 15){
				this.x += this.speed;
				this.path = [];
				this.target_node.x = this.node.x + 1;

				return true;
			}
		}

		return false;
	}

	inTunnel(){
		for(var i = 0; i < this.tunnel.length; i++){
			if(this.target_node.x == this.tunnel[i].x && this.target_node.y == this.tunnel[i].y)
			return true;
		}

		// else not in tunnel
		return false;
	}
}

class PacManAI_Machibuse{
	constructor(wallSettings, spaceMap, intersectionMap, tunnel, size = canvas.width / 128 /* = 15*/){
		this.name = "Machibuse";
		this.pathColor = "pink";
		this.color = 200; 		// only white or grey colors, so only one value
		this.defspeed = 0;		// globaly set
		this.speed = 0.1; 		//0.022

		this.inbox = true;				// whether the ai is in the box
		this.leavebox = false;			// if set to true the ai will try to leave the box
		this.enterbox = false;			// if set to true the ai will try to enter the box
		this.disablemovement = false;	// disables the ais movement
		this._customPath = false;
		this.scattering = false;		// scatter boolean
		this._fleeing = true; 			// fleeing hidden boolean, getter and setter defined in this class
		this._fleeing_animate = false;	// whether we should change the ghost' appearance
		this.allow_uturn = false;		// whether or not the ai may make a uturn
		// if both are false, the AI will be chasing 

		this.home = [{x: 2, y: 2}, {x: 3, y: 2}];	// place to go if scatteringing
		this.target = {x: 0, y: 0}; 				// only used to see if our path still leads us to pacman

		this.x = 13;
		this.y = 15;
		this.node = {
			x:this.x,
			y:this.y
		};

		// next node AI will move to
		this.target_node = {
			x:this.x,
			y:this.y
		};

		// goal of the ai
		this.pacmanTarget = {
			x:0,
			y:0
		};

		// box
		this.box = [
			{x:11,y:13},
			{x:18,y:17},
		];

		// AI eat variables
		this.eaten = {
			state:false,
			speed:0,		// globaly set

			blinkrate:0,	// globaly set
			blinkcurrent:0, // globaly set
			blinkspeed:0,	// globaly set
			blinkbool:true	// true is going on, false is going off
		}

		this.back = 3; // up = 0, right = 1, down = 2, left = 3  
		this.radius = size;
		
		this.wallSettings = wallSettings;
		this.tunnel = tunnel;
		this.spaceMap = spaceMap;
		this.intersectionMap = intersectionMap;
		this.path = [];
		
		this.debug = false;
	}
	
	/**
	 * 
	 * @param {Object} pacman position of the player
	 * @param {Object} ghosts required for Kimagure AI / Inky AI
	 */
	update(pacman, ghosts){
		this.updatePath(pacman);
		this.move();
		this.draw(this.x, this.y);
	}

	updatePath(pacman){
		if(this.leavebox){
			if(!this.inbox){
				console.log("already outside the box");
				this.leavebox = false;
				return;
			}

			this._fleeing = false;
			this.customPath = {x:14,y:14};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y >= 12)
					this.y -= this.speed;
				else if(this.y < 12){
					this.y = 12;
					this.node.y = 12; this.target_node.y = 12;
					this.disablemovement = false;
					this.leavebox = false;
					this._fleeing = false;
					this._customPath = false;
					this.inbox = false;
				}
			}
		} else

		if(this.enterbox){
			if(this.inbox){
				console.log("already inside the box");
				this.enterbox = false;
				return;
			}

			this.customPath = {x:14,y:12};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y <= 14)
					this.y += this.speed;
				else if(this.y > 14){
					this.y = 14;
					this.node.y = 14; this.target_node.y = 14;
					this.disablemovement = false;
					this.enterbox = false;
					this._customPath = false;
					this._fleeing = true;
					this._fleeing_animate = false;
					this.inbox = true;
					this.speed = this.defspeed;
					this.eaten.state = false;
				}
			}
		} else

		// if the AI is scatteringing
		if(this.scattering && this.atIntersection()){
			var checkpath = false;
		
			//if not on home ID 1, and our target is not home ID 1, create a path
			if(this.node.x == this.home[0].x && this.node.y == this.home[0].y && 
				(this.target.x != this.home[1].x || this.target.y != this.home[1].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[1].x; this.target.y = this.home[1].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back);
			} else

			// if not on home ID 0, and our target is not home ID 0, create a path
			if(this.node.x != this.home[0].x && this.node.y != this.home[0].y &&
				(this.target.x != this.home[0].x || this.target.y != this.home[0].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[0].x; this.target.y = this.home[0].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back);
			}
			
			if(checkpath){
				// if our node we are already moving towards is not in our path, add it
				if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
					this.path.reverse(); 				// reverse the path
					this.path.push(this.target_node); 	// add target_node to the last place
					this.path.reverse();				// reverse again
				}

				// if we are already on this.path[0], remove
				if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
					this.path.splice(0,1);
				}
			}
		} else if (this.atIntersection()){

			// Machibuse will always try to get 4 tiles in front of PacMan
			// pacmans angle is his face
			switch(pacman.angle){
				case 0:
					this.pacmanTarget.x = pacman.x;
					this.pacmanTarget.y = pacman.y - 4;
					break;
				case 1:
					this.pacmanTarget.x = pacman.x + 4;
					this.pacmanTarget.y = pacman.y;
					break;
				case 2:
					this.pacmanTarget.x = pacman.x;
					this.pacmanTarget.y = pacman.y + 4;
					break;
				case 3:
					this.pacmanTarget.x = pacman.x - 4;
					this.pacmanTarget.y = pacman.y;
					break;
			}

			if(this.isWall(this.pacmanTarget.x, this.pacmanTarget.y))
				this.pacmanTarget = this.getNearestSpaceFrom({x:this.pacmanTarget.x, y:this.pacmanTarget.y});

			if((this.pacmanTarget.x != this.target.x || this.pacmanTarget.y != this.target.y) || this.path.length == 0){
				if(!this.stuckInTunnel() && !this.fleeing && !this.scattering && !this.eaten.state){
					// debugging will return the whole class instead of only a path
					if(this.debug){
						this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back, true);
						this.path = this.PacMan_PathFinding.path;
					} else
						this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back);

					// if our node we are already moving towards is not in our path, add it
					if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
						this.path.reverse(); 				// reverse the path
						this.path.push(this.target_node); 	// add target_node to the last place
						this.path.reverse();				// reverse again
					}

					this.target.x = this.pacmanTarget.x; this.target.y = this.pacmanTarget.y;
				}
			}
		}

		// fleeing is random at each intersection so we have a complete seperate move function for it

		// show chosen path and examined paths
		if(this.debug){
			for(var i = 0; i < this.path.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "30px Arial";
				ctx.beginPath();
				ctx.fillText(this.path[i].h, this.path[i].x * 28 + 9, (this.path[i].y + 0.5) * 28 + 9);
				ctx.stroke();
			}

			for(var i = 0; i < this.PacMan_PathFinding.closedset.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "10px Arial";
					ctx.beginPath();
					ctx.fillText(this.PacMan_PathFinding.closedset[i].h,this.PacMan_PathFinding.closedset[i].x * 28 + 9, (this.PacMan_PathFinding.closedset[i].y + 0.5) * 28 + 9);
					ctx.stroke();
			}
		}
	}
	
	move(){
		// EXPLANATION OF THE MOVE CODE
		/*
		if(this.x < this.path[0].x){
			if(this.x + this.speed > this.node.x + 1){	// if our movespeed moves the AI past the target
				this.x = this.node.x = this.path[0].x;  // update the position to the target
				if(this.path.length != 0)
					this.path.splice(0,1);				// remove the target from the path

				this.back = 4;
			} else if(this.y == Math.round(this.y)){	// if the AI is on a round y line
				this.x += this.speed;					// move the AI
				this.back = 4;							// set the back of the AI so he can't uturn
				this.target_node.x = this.node.x + 1; 	// make the target node always one further
			}
		}

		// teleporting
		// target_node must be always one ahead of the AI
		if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}
		*/
		// just prevent movement
		if(this.disablemovement) {} else

		// if fleeing
		if(this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			if(this.back == 3){
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.node.x + 1; 
					this.node.x += 1;
					
					if(this.allow_uturn){
						this.back = 1;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;
					this.target_node.x = this.node.x + 1;
				}
			}

			if(this.back == 1){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.node.x -= 1; 
					
					if(this.allow_uturn){
						this.back = 3;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.target_node.x = this.node.x - 1;
				}
			}

			if(this.back == 0){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.node.y += 1; 
					
					if(this.allow_uturn){
						this.back = 2;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.target_node.y = this.node.y + 1;
				}
			}

			if(this.back == 2){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.node.y -= 1; 
					
					if(this.allow_uturn){
						this.back = 0;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.target_node.y = this.node.y - 1;
				}	
			}

			if(this.x == this.target_node.x || this.y == this.target_node.y){
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
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.path[0].x;  			
					this.back = 3;
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;				
					this.back = 3;						
					this.target_node.x = this.node.x + 1;
				}
			} else
			
			if(this.x > this.path[0].x){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.path[0].x; 
					this.back = 1;
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.back = 1;
					this.target_node.x = this.node.x - 1;
				}	
			} else

			if(this.y < this.path[0].y){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.path[0].y; 
					this.back = 0;	
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.back = 0;
					this.target_node.y = this.node.y + 1;
				}
			} else
			
			if(this.y > this.path[0].y){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.path[0].y; 
					this.back = 2;
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.back = 2;
					this.target_node.y = this.node.y - 1;
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

	draw(x, y){
		if(this.eaten.state){
			if(this.eaten.blinkbool){ // going on
				this.eaten.blinkcurrent -= this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent <= 0){
					this.eaten.blinkcurrent = 0;
					this.eaten.blinkbool = false;
				}
			} else { // going off
				this.eaten.blinkcurrent += this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent >= this.eaten.blinkrate){
					this.eaten.blinkcurrent = this.eaten.blinkrate;
					this.eaten.blinkbool = true;
				}
			}   

			var color = (this.eaten.blinkcurrent / this.eaten.blinkrate) * this.color;
			ctx.strokeStyle="rgb("+ color + "," + color + "," + color + ")"; 
		} else
			ctx.strokeStyle="rgb("+ this.color + "," + this.color + "," + this.color + ")"; 

		ctx.lineWidth = this.wallSettings.border_thickness - 2;
		
		x += 0.5;	// position correction
		y += 0.5;	// position correction

		ctx.beginPath();
		ctx.arc(x * this.wallSettings.size, y * this.wallSettings.size, this.radius, Math.PI, 0, false);
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);

		// LEGS
		if (this._fleeing_animate){
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius/3, y * this.wallSettings.size + this.radius - this.radius / 4);	
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		} else {
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		}

		ctx.moveTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		ctx.lineTo(x * this.wallSettings.size - this.radius / 3, y * this.wallSettings.size - this.radius);
		
		ctx.moveTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius / 2);
		ctx.lineTo(x * this.wallSettings.size - this.radius / 1.5, y * this.wallSettings.size - this.radius / 1.35);

		ctx.moveTo(x * this.wallSettings.size + this.radius / 1.1, y * this.wallSettings.size + this.radius / 1.1);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size - this.radius / 2);

		ctx.moveTo(x * this.wallSettings.size + this.radius / 7, y * this.wallSettings.size + this.radius - this.radius / 7);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size); // just a small number
		
		ctx.moveTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius - this.radius / 2);
		ctx.stroke(); 
	}

	set fleeing(state){
		if(!this.inbox)
			this._fleeing = state;
			
		this._fleeing_animate = state;
		if(state){
			this.path = [];
			this.allow_uturn = true;
		}
	};
	get fleeing(){ return this._fleeing;};

	/**
	 * customPath requires an x and y in one var, and returns a path, but its hidden vallue will be a boolean
	 */
	set customPath(destination){
		this._customPath = true;

		// debugging will return the whole class instead of only a path
		if(this.debug){
			this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back, true);
			this.path = this.PacMan_PathFinding.path;
		} else
			this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back);

		// check the path
		if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
			this.path.reverse(); 				// reverse the path
			this.path.push(this.target_node); 	// add target_node to the last place
			this.path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
			this.path.splice(0,1);
		}
	};
	get customPath(){ return this.path;};

	atIntersection(){
		if(this.path.length == 0)
			return true;

		for(var i = 0; i < this.intersectionMap.length; i++){
			if(this.node.x == this.intersectionMap[i].x && this.node.y == this.intersectionMap[i].y)
				return true;
		}
		return false;
	}

	/**
	 * Finds the nearest space from a certain point
	 * @param {*} node contains at least an x and y
	 */
	getNearestSpaceFrom(node){
		if(!this.isWall(node.x, node.y))
			return node;

		this.closedset = [];		// nodes which have been evaluated and have no more use
		this.openset = [];			// nodes which have been evaluated but can serve as pointer
		this.neighbours = [];		// neighbours of the current node
		this.openset.push(node);

		while(this.openset.length !== 0){	
			var currentNode = this.openset[0]; // get the first item from the openset
			
			for (let i = 0; i < this.openset.length; i++){
				if(this.openset[i].x == currentNode.x && this.openset[i].y == currentNode.y)
					this.openset.splice(i, 1);
			}
			this.closedset.push(currentNode);

			// add the neighbours which just have been checked to the array
			if(!this.inArray(this.closedset, {x:currentNode.x - 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x - 1, y:currentNode.y});
			
			if(!this.inArray(this.closedset, {x:currentNode.x + 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x + 1, y:currentNode.y});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y + 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y + 1});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y - 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y - 1});


			var neighbours_length = this.neighbours.length;
			for (let n = 0; n < neighbours_length; n++){
				// left
				if (!this.isWall(this.neighbours[n].x - 1, this.neighbours[n].y))
					return {x:this.neighbours[n].x - 1, y:this.neighbours[n].y};
				
				// right
				if (!this.isWall(this.neighbours[n].x + 1, this.neighbours[n].y))
					return {x:this.neighbours[n].x + 1, y:this.neighbours[n].y};
				
				// down
				if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y + 1))
					return {x:this.neighbours[n].x, y:this.neighbours[n].y + 1};
				
				// top
				if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y - 1))
					return {x:this.neighbours[n].x, y:this.neighbours[n].y - 1};

				// add the currentNode to the closedset
				this.openset.push(this.neighbours[n]);
			}
		}
	}

	inArray(array, node){
		for (var i = 0; i < array.length; i++){
			if(node.x == array[i].x && node.y == array[i].y)
				return true;
		}
		return false
	}

	/**
     * checks if a position is a wall
     * @param {direction} x 
     * @param {direction} y 
     */
    isWall(x, y){
		var isWall = true;

        // if in the box it should be treated as a wall
		if(!(this.box[0].x < x && this.box[1].x > x && 
			this.box[0].y < y && this.box[1].y > y)){
			
			for (let i = 0; i < this.spaceMap.length; i++){
				if(this.spaceMap[i].x == x && this.spaceMap[i].y == y)
					isWall = false;
			}
		}
        return isWall;
	}

	randomDir(){
		this.ret = [];
		for (let i = 0; i < this.spaceMap.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (this.spaceMap[i].x == this.target_node.x - 1 && this.spaceMap[i].y == this.target_node.y && this.back != 3){
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:1}); 
			}	
		
			// right
			if (this.spaceMap[i].x == this.target_node.x + 1 && this.spaceMap[i].y == this.target_node.y && this.back != 1) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:3});
			}	
	
			// down
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y + 1 && this.back != 2) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:0});
			}	
	
			// top
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y - 1 && this.back != 0) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:2});
			}
		}

		if(this.ret.length > 0){
			return this.ret[Math.floor(Math.random() * this.ret.length)].back;
		}
	}

	stuckInTunnel(){
		// if we are in a tunnel, the pathfinding will be unable to create a path,
		// so we first move out of the tunnel
		if(this.inTunnel() && !this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			// if stuck in tunnel tunnel
			if(this.back == 1 && this.x < 7 && this.node.y == 15){
				this.x -= this.speed;
				this.path = [];
				this.target_node.x = this.node.x - 1;

				return true;
			} else

			if(this.back == 3 & this.x > 22 && this.node.y == 15){
				this.x += this.speed;
				this.path = [];
				this.target_node.x = this.node.x + 1;

				return true;
			}
		}

		return false;
	}

	inTunnel(){
		for(var i = 0; i < this.tunnel.length; i++){
			if(this.target_node.x == this.tunnel[i].x && this.target_node.y == this.tunnel[i].y)
			return true;
		}

		// else not in tunnel
		return false;
	}
}

class PacManAI_Kimagure{
	constructor(wallSettings, spaceMap, intersectionMap, tunnel, size = canvas.width / 128 /* = 15*/){
		this.name = "Kimagure";
		this.pathColor = "cyan";
		this.color = 150; 		// only white or grey colors, so only one value
		this.defspeed = 0;		// globaly set
		this.speed = 0.1; 		//0.022

		this.inbox = true;				// whether the ai is in the box
		this.leavebox = false;			// if set to true the ai will try to leave the box
		this.enterbox = false;			// if set to true the ai will try to enter the box
		this.disablemovement = false;	// disables the ais movement
		this._customPath = false;
		this.scattering = false;		// scatter boolean
		this._fleeing = true; 			// fleeing hidden boolean, getter and setter defined in this class
		this._fleeing_animate = false;	// whether we should change the ghost' appearance
		this.allow_uturn = false;		// whether or not the ai may make a uturn
		// if both are false, the AI will be chasing 

		this.home = [{x: 26, y: 30}, {x: 27, y: 30}];	// place to go if scatteringing
		this.target = {x: 0, y: 0}; 				// only used to see if our path still leads us to pacman

		this.x = 14;
		this.y = 15;
		this.node = {
			x:this.x,
			y:this.y
		};

		// next node AI will move to
		this.target_node = {
			x:this.x,
			y:this.y
		};

		// goal of the ai
		this.pacmanTarget = {
			x:0,
			y:0
		}

		// box
		this.box = [
			{x:11,y:13},
			{x:18,y:17},
		];

		// AI eat variables
		this.eaten = {
			state:false,
			speed:0,		// globaly set

			blinkrate:0,	// globaly set
			blinkcurrent:0, // globaly set
			blinkspeed:0,	// globaly set
			blinkbool:true	// true is going on, false is going off
		}

		this.back = 3; // up = 0, right = 1, down = 2, left = 3 
		this.radius = size;
		
		this.wallSettings = wallSettings;
		this.tunnel = tunnel;
		this.spaceMap = spaceMap;
		this.intersectionMap = intersectionMap;
		this.path = [];
		
		this.debug = false;
	}
	
	/**
	 * 
	 * @param {Object} pacman position of the player
	 * @param {Object} ghosts required for Kimagure AI / Inky AI
	 */
	update(pacman, ghosts){
		this.updatePath(pacman, ghosts);
		this.move();
		this.draw(this.x, this.y);
	}

	updatePath(pacman, ghosts){
		if(this.leavebox){
			if(!this.inbox){
				console.log("already outside the box");
				this.leavebox = false;
				return;
			}

			this._fleeing = false;
			this.customPath = {x:14,y:14};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y >= 12)
					this.y -= this.speed;
				else if(this.y < 12){
					this.y = 12;
					this.node.y = 12; this.target_node.y = 12;
					this.disablemovement = false;
					this.leavebox = false;
					this._fleeing = false;
					this._customPath = false;
					this.inbox = false;
					this.fleeing = false;
				}
			}
		} else

		if(this.enterbox){
			if(this.inbox){
				console.log("already inside the box");
				this.enterbox = false;
				return;
			}

			this.customPath = {x:14,y:12};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y <= 14)
					this.y += this.speed;
				else if(this.y > 14){
					this.y = 14;
					this.node.y = 14; this.target_node.y = 14;
					this.disablemovement = false;
					this.enterbox = false;
					this._customPath = false;
					this._fleeing = true;
					this._fleeing_animate = false;
					this.inbox = true;
					this.speed = this.defspeed;
					this.eaten.state = false;
				}
			}
		} else

		// if the AI is scatteringing
		if(this.scattering && this.atIntersection()){
			var checkpath = false;
		
			//if not on home ID 1, and our target is not home ID 1, create a path
			if(this.node.x == this.home[0].x && this.node.y == this.home[0].y && 
				(this.target.x != this.home[1].x || this.target.y != this.home[1].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[1].x; this.target.y = this.home[1].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back);
			} else

			// if not on home ID 0, and our target is not home ID 0, create a path
			if(this.node.x != this.home[0].x && this.node.y != this.home[0].y &&
				(this.target.x != this.home[0].x || this.target.y != this.home[0].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[0].x; this.target.y = this.home[0].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back);
			}
			
			if(checkpath){
				// if our node we are already moving towards is not in our path, add it
				if(typeof(this.path[0].x == "undefined"))
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back);
				
				if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
					this.path.reverse(); 				// reverse the path
					this.path.push(this.target_node); 	// add target_node to the last place
					this.path.reverse();				// reverse again
				}

				// if we are already on this.path[0], remove
				if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
					this.path.splice(0,1);
				}
			}
		} else 
		
		if(this.atIntersection()){

			// Kimagure will use a dubble vector from Oikake to 2 tiles in front of pacman as target
			// pacmans angle is his face
			switch(pacman.angle){
				case 0:
					this.pacmanTarget.x = pacman.x;
					this.pacmanTarget.y = pacman.y - 2;
					break;
				case 1:
					this.pacmanTarget.x = pacman.x + 2;
					this.pacmanTarget.y = pacman.y;
					break;
				case 2:
					this.pacmanTarget.x = pacman.x;
					this.pacmanTarget.y = pacman.y + 2;
					break;
				case 3:
					this.pacmanTarget.x = pacman.x - 2;
					this.pacmanTarget.y = pacman.y;
					break;
			}

			// get the heuristics to the target
			this.pacmanTarget.x = this.pacmanTarget.x + (this.pacmanTarget.x - ghosts[0].node.x);
			this.pacmanTarget.y = this.pacmanTarget.y + (this.pacmanTarget.y - ghosts[0].node.y);

			// if the goal is outside the playgound, change to to the playground borders
			if(this.pacmanTarget.x > 30) this.pacmanTarget.x = 30; else if(this.pacmanTarget.x < 0) this.pacmanTarget.x = 0;
			if(this.pacmanTarget.y > 32) this.pacmanTarget.y = 32; else if(this.pacmanTarget.y < 0) this.pacmanTarget.y = 0;

			if(this.isWall(this.pacmanTarget.x, this.pacmanTarget.y))
				this.pacmanTarget = this.getNearestSpaceFrom({x:this.pacmanTarget.x, y:this.pacmanTarget.y});

			if((this.pacmanTarget.x != this.target.x || this.pacmanTarget.y != this.target.y) || this.path.length == 0){
				if(!this.stuckInTunnel() && !this.fleeing && !this.scattering && !this.eaten.state){
					// debugging will return the whole class instead of only a path
					if(this.debug){
						this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back, true);
						this.path = this.PacMan_PathFinding.path;
					} else
						this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back);

					// if our node we are already moving towards is not in our path, add it
					if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
						this.path.reverse(); 				// reverse the path
						this.path.push(this.target_node); 	// add target_node to the last place
						this.path.reverse();				// reverse again
					}

					this.target.x = this.pacmanTarget.x; this.target.y = this.pacmanTarget.y;
				}
			}
		}

		// fleeing is random at each intersection so we have a complete seperate move function for it

		// show chosen path and examined paths
		if(this.debug){
			for(var i = 0; i < this.path.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "30px Arial";
				ctx.beginPath();
				ctx.fillText(this.path[i].h, this.path[i].x * 28 + 9, (this.path[i].y + 0.5) * 28 + 9);
				ctx.stroke();
			}

			for(var i = 0; i < this.PacMan_PathFinding.closedset.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "10px Arial";
					ctx.beginPath();
					ctx.fillText(this.PacMan_PathFinding.closedset[i].h,this.PacMan_PathFinding.closedset[i].x * 28 + 9, (this.PacMan_PathFinding.closedset[i].y + 0.5) * 28 + 9);
					ctx.stroke();
			}
		}
	}
	
	move(){
		// EXPLANATION OF THE MOVE CODE
		/*
		if(this.x < this.path[0].x){
			if(this.x + this.speed > this.node.x + 1){	// if our movespeed moves the AI past the target
				this.x = this.node.x = this.path[0].x;  // update the position to the target
				if(this.path.length != 0)
					this.path.splice(0,1);				// remove the target from the path

				this.back = 4;
			} else if(this.y == Math.round(this.y)){	// if the AI is on a round y line
				this.x += this.speed;					// move the AI
				this.back = 4;							// set the back of the AI so he can't uturn
				this.target_node.x = this.node.x + 1; 	// make the target node always one further
			}
		}

		// teleporting
		// target_node must be always one ahead of the AI
		if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}
		*/

		// just prevent movement
		if(this.disablemovement) {} else

		// if fleeing
		if(this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			if(this.back == 3){
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.node.x + 1; 
					this.node.x += 1;
					
					if(this.allow_uturn){
						this.back = 1;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;
					this.target_node.x = this.node.x + 1;
				}
			}

			if(this.back == 1){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.node.x -= 1; 
					
					if(this.allow_uturn){
						this.back = 3;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.target_node.x = this.node.x - 1;
				}
			}

			if(this.back == 0){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.node.y += 1; 
					
					if(this.allow_uturn){
						this.back = 2;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.target_node.y = this.node.y + 1;
				}
			}

			if(this.back == 2){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.node.y -= 1; 
					
					if(this.allow_uturn){
						this.back = 0;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.target_node.y = this.node.y - 1;
				}	
			}

			if(this.x == this.target_node.x || this.y == this.target_node.y){
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
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.path[0].x;  			
					this.back = 3;
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;				
					this.back = 3;						
					this.target_node.x = this.node.x + 1;
				}
			} else
			
			if(this.x > this.path[0].x){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.path[0].x; 
					this.back = 1;
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.back = 1;
					this.target_node.x = this.node.x - 1;
				}	
			} else

			if(this.y < this.path[0].y){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.path[0].y; 
					this.back = 0;	
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.back = 0;
					this.target_node.y = this.node.y + 1;
				}
			} else
			
			if(this.y > this.path[0].y){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.path[0].y; 
					this.back = 2;
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.back = 2;
					this.target_node.y = this.node.y - 1;
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

	draw(x, y){
		if(this.eaten.state){
			if(this.eaten.blinkbool){ // going on
				this.eaten.blinkcurrent -= this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent <= 0){
					this.eaten.blinkcurrent = 0;
					this.eaten.blinkbool = false;
				}
			} else { // going off
				this.eaten.blinkcurrent += this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent >= this.eaten.blinkrate){
					this.eaten.blinkcurrent = this.eaten.blinkrate;
					this.eaten.blinkbool = true;
				}
			}   

			var color = (this.eaten.blinkcurrent / this.eaten.blinkrate) * this.color;
			ctx.strokeStyle="rgb("+ color + "," + color + "," + color + ")"; 
		} else
			ctx.strokeStyle="rgb("+ this.color + "," + this.color + "," + this.color + ")"; 

		ctx.lineWidth = this.wallSettings.border_thickness - 2;
		
		x += 0.5;	// position correction
		y += 0.5;	// position correction

		ctx.beginPath();
		ctx.arc(x * this.wallSettings.size, y * this.wallSettings.size, this.radius, Math.PI, 0, false);
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);

		// LEGS
		if (this._fleeing_animate){
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius/3, y * this.wallSettings.size + this.radius - this.radius / 4);	
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		} else {
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		}

		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);
		ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size - this.radius);
		
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius / 2);
		ctx.lineTo(x * this.wallSettings.size + this.radius / 1.5, y * this.wallSettings.size - this.radius / 1.35);

		ctx.moveTo(x * this.wallSettings.size - this.radius / 1.1, y * this.wallSettings.size + this.radius / 1.1);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size - this.radius / 2);

		ctx.moveTo(x * this.wallSettings.size - this.radius / 7, y * this.wallSettings.size + this.radius - this.radius / 7);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size); // just a small number
		
		ctx.moveTo(x * this.wallSettings.size + (this.radius / 5) * 2, y * this.wallSettings.size + this.radius - this.radius / 10);
		ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 2);
		ctx.stroke(); 
	}

	set fleeing(state){
		if(!this.inbox)
			this._fleeing = state;
			
		this._fleeing_animate = state;
		if(state){
			this.path = [];
			this.allow_uturn = true;
		}
	};
	get fleeing(){ return this._fleeing;};

	/**
	 * customPath requires an x and y in one var, and returns a path, but its hidden vallue will be a boolean
	 */
	set customPath(destination){
		this._customPath = true;

		// debugging will return the whole class instead of only a path
		if(this.debug){
			this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back, true);
			this.path = this.PacMan_PathFinding.path;
		} else
			this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back);

		// check the path
		if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
			this.path.reverse(); 				// reverse the path
			this.path.push(this.target_node); 	// add target_node to the last place
			this.path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
			this.path.splice(0,1);
		}
	};
	get customPath(){ return this.path;};

	atIntersection(){
		if(this.path.length == 0)
			return true;
			
		for(var i = 0; i < this.intersectionMap.length; i++){
			if(this.node.x == this.intersectionMap[i].x && this.node.y == this.intersectionMap[i].y)
				return true;
		}
		return false;
	}

	/**
	 * Finds the nearest space from a certain point
	 * @param {*} node contains at least an x and y
	 */
	getNearestSpaceFrom(node){
		if(!this.isWall(node.x, node.y))
			return node;

		this.closedset = [];		// nodes which have been evaluated and have no more use
		this.openset = [];			// nodes which have been evaluated but can serve as pointer
		this.neighbours = [];		// neighbours of the current node
		this.openset.push(node);

		while(this.openset.length !== 0){	
			var currentNode = this.openset[0]; // get the first item from the openset
			
			for (let i = 0; i < this.openset.length; i++){
				if(this.openset[i].x == currentNode.x && this.openset[i].y == currentNode.y)
					this.openset.splice(i, 1);
			}
			this.closedset.push(currentNode);

			// add the neighbours which just have been checked to the array
			if(!this.inArray(this.closedset, {x:currentNode.x - 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x - 1, y:currentNode.y});
			
			if(!this.inArray(this.closedset, {x:currentNode.x + 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x + 1, y:currentNode.y});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y + 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y + 1});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y - 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y - 1});


			var neighbours_length = this.neighbours.length;
				for (let n = 0; n < neighbours_length; n++){
					// left
					if (!this.isWall(this.neighbours[n].x - 1, this.neighbours[n].y))
						return {x:this.neighbours[n].x - 1, y:this.neighbours[n].y};
					
					// right
					if (!this.isWall(this.neighbours[n].x + 1, this.neighbours[n].y))
						return {x:this.neighbours[n].x + 1, y:this.neighbours[n].y};
					
					// down
					if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y + 1))
						return {x:this.neighbours[n].x, y:this.neighbours[n].y + 1};
					
					// top
					if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y - 1))
						return {x:this.neighbours[n].x, y:this.neighbours[n].y - 1};
	
					// add the currentNode to the closedset
					this.openset.push(this.neighbours[n]);
				}
		}
	}

	inArray(array, node){
		for (var i = 0; i < array.length; i++){
			if(node.x == array[i].x && node.y == array[i].y)
				return true;
		}
		return false
	}

	/**
     * checks if a position is a wall
     * @param {direction} x 
     * @param {direction} y 
     */
    isWall(x, y){
		var isWall = true;

		// if in the box it should be treated as a wall
		if(!(this.box[0].x < x && this.box[1].x > x && 
			this.box[0].y < y && this.box[1].y > y)){
			
			for (let i = 0; i < this.spaceMap.length; i++){
				if(this.spaceMap[i].x == x && this.spaceMap[i].y == y)
					isWall = false;
			}
		}
        return isWall;
	}

	randomDir(){
		this.ret = [];
		for (let i = 0; i < this.spaceMap.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (this.spaceMap[i].x == this.target_node.x - 1 && this.spaceMap[i].y == this.target_node.y && this.back != 3){
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:1}); 
			}	
		
			// right
			if (this.spaceMap[i].x == this.target_node.x + 1 && this.spaceMap[i].y == this.target_node.y && this.back != 1) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:3});
			}	
	
			// down
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y + 1 && this.back != 2) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:0});
			}	
	
			// top
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y - 1 && this.back != 0) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:2});
			}
		}

		if(this.ret.length > 0){
			return this.ret[Math.floor(Math.random() * this.ret.length)].back;
		}
	}

	stuckInTunnel(){
		// if we are in a tunnel, the pathfinding will be unable to create a path,
		// so we first move out of the tunnel
		if(this.inTunnel() && !this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			// if stuck in tunnel tunnel
			if(this.back == 1 && this.x < 7 && this.node.y == 15){
				this.x -= this.speed;
				this.path = [];
				this.target_node.x = this.node.x - 1;

				return true;
			} else

			if(this.back == 3 & this.x > 22 && this.node.y == 15){
				this.x += this.speed;
				this.path = [];
				this.target_node.x = this.node.x + 1;

				return true;
			}
		}

		return false;
	}

	inTunnel(){
		for(var i = 0; i < this.tunnel.length; i++){
			if(this.target_node.x == this.tunnel[i].x && this.target_node.y == this.tunnel[i].y)
			return true;
		}

		// else not in tunnel
		return false;
	}
}

class PacManAI_Otoboke{
	constructor(wallSettings, spaceMap, intersectionMap, tunnel, size = canvas.width / 128 /* = 15*/){
		this.name = "Otoboke";
		this.pathColor = "yellow";
		this.color = 100; 		// only white or grey colors, so only one value
		this.defspeed = 0;		// globaly set
		this.speed = 0.1; 		// 0.022
		this.pacmanRadius = 8; 	// circle around pacman in which Otoboke will try not to be 

		this.inbox = true;				// whether the ai is in the box
		this.leavebox = false;			// if set to true the ai will try to leave the box
		this.enterbox = false;			// if set to true the ai will try to enter the box
		this.disablemovement = false;	// disables the ais movement
		this._customPath = false;
		this.scattering = false;		// scatter boolean
		this._fleeing = true; 			// fleeing hidden boolean, getter and setter defined in this class
		this._fleeing_animate = false;	// whether we should change the ghost' appearance
		this.allow_uturn = false;		// whether or not the ai may make a uturn
		// if both are false, the AI will be chasing 

		this.home = [{x: 3, y: 30}, {x: 2, y: 30}];	// place to go if scatteringing
		this.target = {x: 0, y: 0}; 				// only used to see if our path still leads us to pacman

		this.x = 16;
		this.y = 15;
		this.node = {
			x:this.x,
			y:this.y
		};

		// next node AI will move to
		this.target_node = {
			x:this.x,
			y:this.y
		};

		// goal of the ai
		this.pacmanTarget = {
			x:0,
			y:0
		}

		// box
		this.box = [
			{x:11,y:13},
			{x:18,y:17},
		];

		// AI eat variables
		this.eaten = {
			state:false,
			speed:0,		// globaly set

			blinkrate:0,	// globaly set
			blinkcurrent:0, // globaly set
			blinkspeed:0,	// globaly set
			blinkbool:true	// true is going on, false is going off
		}

		this.back = 3; // up = 0, right = 1, down = 2, left = 3  
		this.radius = size;
		
		this.wallSettings = wallSettings;
		this.tunnel = tunnel;
		this.spaceMap = spaceMap;
		this.intersectionMap = intersectionMap;
		this.path = [];
		
		this.debug = false;
	}
	
	/**
	 * 
	 * @param {Object} pacman position of the player
	 * @param {Object} ghosts required for Kimagure AI / Inky AI
	 */
	update(pacman, ghosts){
		this.updatePath(pacman);
		this.move();
		this.draw(this.x, this.y);
	}

	updatePath(pacman){
		if(this.leavebox){
			if(!this.inbox){
				console.log("already outside the box");
				this.leavebox = false;
				return;
			}

			this._fleeing = false;
			this.customPath = {x:14,y:14};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y >= 12)
					this.y -= this.speed;
				else if(this.y < 12){
					this.y = 12;
					this.node.y = 12; this.target_node.y = 12;
					this.disablemovement = false;
					this.leavebox = false;
					this._fleeing = false;
					this._customPath = false;
					this.inbox = false;
				}
			}
		} else

		if(this.enterbox){
			if(this.inbox){
				console.log("already inside the box");
				this.enterbox = false;
				return;
			}

			this.customPath = {x:14,y:12};
			if(this.path.length == 0){
				this.disablemovement = true;

				if(this.y <= 14)
					this.y += this.speed;
				else if(this.y > 14){
					this.y = 14;
					this.node.y = 14; this.target_node.y = 14;
					this.disablemovement = false;
					this.enterbox = false;
					this._customPath = false;
					this._fleeing = true;
					this._fleeing_animate = false;
					this.inbox = true;
					this.speed = this.defspeed;
					this.eaten.state = false;
				}
			}
		} else
		
		// if the AI is scatteringing
		if(this.scattering && this.atIntersection()){
			var checkpath = false;
		
			//if not on home ID 1, and our target is not home ID 1, create a path
			if(this.node.x == this.home[0].x && this.node.y == this.home[0].y && 
				(this.target.x != this.home[1].x || this.target.y != this.home[1].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[1].x; this.target.y = this.home[1].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[1].x,y:this.home[1].y},this.spaceMap, "manhattan", this.back);
			} else

			// if not on home ID 0, and our target is not home ID 0, create a path
			if(this.node.x != this.home[0].x && this.node.y != this.home[0].y &&
				(this.target.x != this.home[0].x || this.target.y != this.home[0].y)){
				// set our target so we don't run over this code all the time
				this.target.x = this.home[0].x; this.target.y = this.home[0].y;
				checkpath = true;

				// debugging will return the whole class instead of only a path
				if(this.debug){
					this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back, true);
					this.path = this.PacMan_PathFinding.path;
				} else
					this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.home[0].x,y:this.home[0].y},this.spaceMap, "manhattan", this.back);
			}
			
			if(checkpath){
				// if our node we are already moving towards is not in our path, add it
				if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
					this.path.reverse(); 				// reverse the path
					this.path.push(this.target_node); 	// add target_node to the last place
					this.path.reverse();				// reverse again
				}

				// if we are already on this.path[0], remove
				if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
					this.path.splice(0,1);
				}
			}
		} else 
		
		if (this.atIntersection()){

			var posx = this.node.x - pacman.x;
			var posy = this.node.y - pacman.y;
			if (this.pacmanRadius > Math.sqrt((posx * posx) + (posy * posy))){

				// go to home ID 0 if to close to pacman
				if((this.pacmanTarget.x != this.home[0].x || this.pacmanTarget.y != this.home[0].y) &&
					(this.node.x != this.home[0].x || this.node.y != this.home[0].y)){

					this.pacmanTarget.x = this.home[0].x; this.pacmanTarget.y = this.home[0].y;
				} else
				
				// go to home ID 1 if just passed home ID 0
				if((this.node.x == this.home[0].x && this.node.y == this.home[0].y) && 
					(this.pacmanTarget.x != this.home[1].x || this.pacmanTarget.y != this.home[1].y)) {
					checkpath = true;
					this.pacmanTarget.x = this.home[1].x; this.pacmanTarget.y = this.home[1].y;

				}
			} else {
				this.pacmanTarget.x = pacman.x; this.pacmanTarget.y = pacman.y;}

			if(this.isWall(this.pacmanTarget.x, this.pacmanTarget.y))
				this.pacmanTarget = this.getNearestSpaceFrom({x:this.pacmanTarget.x, y:this.pacmanTarget.y});

			if((this.pacmanTarget.x != this.target.x || this.pacmanTarget.y != this.target.y) || this.path.length == 0){
				if(!this.stuckInTunnel() && !this.fleeing && !this.scattering && !this.eaten.state){
					// debugging will return the whole class instead of only a path
					if(this.debug){
						this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back, true);
						this.path = this.PacMan_PathFinding.path;
					} else
						this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:this.pacmanTarget.x,y:this.pacmanTarget.y},this.spaceMap, "manhattan", this.back);

					// if our node we are already moving towards is not in our path, add it
					if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
						this.path.reverse(); 				// reverse the path
						this.path.push(this.target_node); 	// add target_node to the last place
						this.path.reverse();				// reverse again
					}

					this.target.x = this.pacmanTarget.x; this.target.y = this.pacmanTarget.y;
				}
			}
		}

		// fleeing is random at each intersection so we have a complete seperate move function for it

		// show chosen path and examined paths
		if(this.debug){
			for(var i = 0; i < this.path.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "30px Arial";
				ctx.beginPath();
				ctx.fillText(this.path[i].h, this.path[i].x * 28 + 9, (this.path[i].y + 0.5) * 28 + 9);
				ctx.stroke();
			}

			for(var i = 0; i < this.PacMan_PathFinding.closedset.length; i++){
				ctx.fillStyle = "yellow";
				ctx.font = "10px Arial";
					ctx.beginPath();
					ctx.fillText(this.PacMan_PathFinding.closedset[i].h,this.PacMan_PathFinding.closedset[i].x * 28 + 9, (this.PacMan_PathFinding.closedset[i].y + 0.5) * 28 + 9);
					ctx.stroke();
			}
		}
	}
	
	move(){
		// EXPLANATION OF THE MOVE CODE
		/*
		if(this.x < this.path[0].x){
			if(this.x + this.speed > this.node.x + 1){	// if our movespeed moves the AI past the target
				this.x = this.node.x = this.path[0].x;  // update the position to the target
				if(this.path.length != 0)
					this.path.splice(0,1);				// remove the target from the path

				this.back = 4;
			} else if(this.y == Math.round(this.y)){	// if the AI is on a round y line
				this.x += this.speed;					// move the AI
				this.back = 4;							// set the back of the AI so he can't uturn
				this.target_node.x = this.node.x + 1; 	// make the target node always one further
			}
		}

		// teleporting
		// target_node must be always one ahead of the AI
		if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}
		*/

		// just prevent movement
		if(this.disablemovement) {} else

		// if fleeing
		if(this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			if(this.back == 3){
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.node.x + 1; 
					this.node.x += 1;
					
					if(this.allow_uturn){
						this.back = 1;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;
					this.target_node.x = this.node.x + 1;
				}
			}

			if(this.back == 1){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.node.x -= 1; 
					
					if(this.allow_uturn){
						this.back = 3;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.target_node.x = this.node.x - 1;
				}
			}

			if(this.back == 0){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.node.y += 1; 
					
					if(this.allow_uturn){
						this.back = 2;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.target_node.y = this.node.y + 1;
				}
			}

			if(this.back == 2){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.node.y -= 1; 
					
					if(this.allow_uturn){
						this.back = 0;
						this.allow_uturn = false;
					} else
						this.back = this.randomDir();
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.target_node.y = this.node.y - 1;
				}	
			}

			if(this.x == this.target_node.x || this.y == this.target_node.y){
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
				if(this.x + this.speed > this.node.x + 1){
					this.x = this.path[0].x;  			
					this.back = 3;
				} else if(this.y == Math.round(this.y)){
					this.x += this.speed;				
					this.back = 3;						
					this.target_node.x = this.node.x + 1;
				}
			} else
			
			if(this.x > this.path[0].x){
				if(this.x - this.speed < this.node.x - 1){
					this.x = this.path[0].x; 
					this.back = 1;
				} else if(this.y == Math.round(this.y)){
					this.x -= this.speed; 
					this.back = 1;
					this.target_node.x = this.node.x - 1;
				}	
			} else

			if(this.y < this.path[0].y){
				if(this.y + this.speed > this.node.y + 1){
					this.y = this.path[0].y; 
					this.back = 0;	
				} else if(this.x == Math.round(this.x)){
					this.y += this.speed; 
					this.back = 0;
					this.target_node.y = this.node.y + 1;
				}
			} else
			
			if(this.y > this.path[0].y){
				if(this.y - this.speed < this.node.y - 1){
					this.y = this.path[0].y; 
					this.back = 2;
				} else if(this.x == Math.round(this.x)){
					this.y -= this.speed;
					this.back = 2;
					this.target_node.y = this.node.y - 1;
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

	draw(x, y){
		if(this.eaten.state){
			if(this.eaten.blinkbool){ // going on
				this.eaten.blinkcurrent -= this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent <= 0){
					this.eaten.blinkcurrent = 0;
					this.eaten.blinkbool = false;
				}
			} else { // going off
				this.eaten.blinkcurrent += this.eaten.blinkspeed;
				if (this.eaten.blinkcurrent >= this.eaten.blinkrate){
					this.eaten.blinkcurrent = this.eaten.blinkrate;
					this.eaten.blinkbool = true;
				}
			}   

			var color = (this.eaten.blinkcurrent / this.eaten.blinkrate) * this.color;
			ctx.strokeStyle="rgb("+ color + "," + color + "," + color + ")"; 
		} else
			ctx.strokeStyle="rgb("+ this.color + "," + this.color + "," + this.color + ")"; 

		ctx.lineWidth = this.wallSettings.border_thickness - 2;
		
		x += 0.5;	// position correction
		y += 0.5;	// position correction

		ctx.beginPath();
		ctx.arc(x * this.wallSettings.size, y * this.wallSettings.size, this.radius, Math.PI, 0, false);
		ctx.moveTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size);

		// LEGS
		if (this._fleeing_animate){
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius-this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius/3, y * this.wallSettings.size + this.radius - this.radius / 4);	
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		} else {
			ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size - this.radius + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius / 3, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + (this.radius / 3) * 2, y * this.wallSettings.size + this.radius - this.radius / 4);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius);
			ctx.lineTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		}

		ctx.moveTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size);
		ctx.lineTo(x * this.wallSettings.size - this.radius / 3, y * this.wallSettings.size - this.radius);
		
		ctx.moveTo(x * this.wallSettings.size + this.radius, y * this.wallSettings.size + this.radius / 2);
		ctx.lineTo(x * this.wallSettings.size - this.radius / 1.5, y * this.wallSettings.size - this.radius / 1.35);

		ctx.moveTo(x * this.wallSettings.size + this.radius / 1.1, y * this.wallSettings.size + this.radius / 1.1);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size - this.radius / 2);

		ctx.moveTo(x * this.wallSettings.size + this.radius / 7, y * this.wallSettings.size + this.radius - this.radius / 7);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size); // just a small number
		
		ctx.moveTo(x * this.wallSettings.size - this.radius + this.radius / 3, y * this.wallSettings.size + this.radius - this.radius / 4);
		ctx.lineTo(x * this.wallSettings.size - this.radius, y * this.wallSettings.size + this.radius - this.radius / 2);
		ctx.stroke(); 
	}

	set fleeing(state){
		if(!this.inbox)
			this._fleeing = state;
			
		this._fleeing_animate = state;
		if(state){
			this.path = [];
			this.allow_uturn = true;
		}
	};
	get fleeing(){ return this._fleeing;};

	/**
	 * customPath requires an x and y in one var, and returns a path, but its hidden vallue will be a boolean
	 */
	set customPath(destination){
		this._customPath = true;

		// debugging will return the whole class instead of only a path
		if(this.debug){
			this.PacMan_PathFinding = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back, true);
			this.path = this.PacMan_PathFinding.path;
		} else
			this.path = new PacMan_PathFinding({x:this.target_node.x, y:this.target_node.y},{x:destination.x,y:destination.y},this.spaceMap, "manhattan", this.back);

		// check the path
		if(this.path[0].x != this.target_node.x || this.path[0].y != this.target_node.y){
			this.path.reverse(); 				// reverse the path
			this.path.push(this.target_node); 	// add target_node to the last place
			this.path.reverse();				// reverse again
		}

		// if we are already on this.path[0], remove
		if(this.path[0].x == this.node.x && this.path[0].y == this.node.y){
			this.path.splice(0,1);
		}
	};
	get customPath(){ return this.path;};

	atIntersection(){
		if(this.path.length == 0)
			return true;

		for(var i = 0; i < this.intersectionMap.length; i++){
			if(this.node.x == this.intersectionMap[i].x && this.node.y == this.intersectionMap[i].y)
				return true;
		}

		return false;
	}

	/**
	 * Finds the nearest space from a certain point
	 * @param {*} node contains at least an x and y
	 */
	getNearestSpaceFrom(node){
		if(!this.isWall(node.x, node.y))
			return node;

		this.closedset = [];		// nodes which have been evaluated and have no more use
		this.openset = [];			// nodes which have been evaluated but can serve as pointer
		this.neighbours = [];		// neighbours of the current node
		this.openset.push(node);

		while(this.openset.length !== 0){	
			var currentNode = this.openset[0]; // get the first item from the openset
			
			for (let i = 0; i < this.openset.length; i++){
				if(this.openset[i].x == currentNode.x && this.openset[i].y == currentNode.y)
					this.openset.splice(i, 1);
			}
			this.closedset.push(currentNode);

			// add the neighbours which just have been checked to the array
			if(!this.inArray(this.closedset, {x:currentNode.x - 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x - 1, y:currentNode.y});
			
			if(!this.inArray(this.closedset, {x:currentNode.x + 1, y:currentNode.y}))
				this.neighbours.push({x:currentNode.x + 1, y:currentNode.y});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y + 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y + 1});

			if(!this.inArray(this.closedset, {x:currentNode.x, y:currentNode.y - 1}))
				this.neighbours.push({x:currentNode.x, y:currentNode.y - 1});


			var neighbours_length = this.neighbours.length;
			for (let n = 0; n < neighbours_length; n++){
				// left
				if (!this.isWall(this.neighbours[n].x - 1, this.neighbours[n].y))
					return {x:this.neighbours[n].x - 1, y:this.neighbours[n].y};
				
				// right
				if (!this.isWall(this.neighbours[n].x + 1, this.neighbours[n].y))
					return {x:this.neighbours[n].x + 1, y:this.neighbours[n].y};
				
				// down
				if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y + 1))
					return {x:this.neighbours[n].x, y:this.neighbours[n].y + 1};
				
				// top
				if (!this.isWall(this.neighbours[n].x, this.neighbours[n].y - 1))
					return {x:this.neighbours[n].x, y:this.neighbours[n].y - 1};

				// add the currentNode to the closedset
				this.openset.push(this.neighbours[n]);
			}
		}
	}

	inArray(array, node){
		for (var i = 0; i < array.length; i++){
			if(node.x == array[i].x && node.y == array[i].y)
				return true;
		}
		return false
	}

	/**
     * checks if a position is a wall
     * @param {direction} x 
     * @param {direction} y 
     */
    isWall(x, y){
		var isWall = true;
		
        // if in the box it should be treated as a wall
		if(!(this.box[0].x < x && this.box[1].x > x && 
			this.box[0].y < y && this.box[1].y > y)){
			
			for (let i = 0; i < this.spaceMap.length; i++){
				if(this.spaceMap[i].x == x && this.spaceMap[i].y == y)
					isWall = false;
			}
		}
        return isWall;
	}

	randomDir(){
		this.ret = [];
		for (let i = 0; i < this.spaceMap.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (this.spaceMap[i].x == this.target_node.x - 1 && this.spaceMap[i].y == this.target_node.y && this.back != 3){
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:1}); 
			}	
		
			// right
			if (this.spaceMap[i].x == this.target_node.x + 1 && this.spaceMap[i].y == this.target_node.y && this.back != 1) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:3});
			}	
	
			// down
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y + 1 && this.back != 2) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:0});
			}	
	
			// top
			if (this.spaceMap[i].x == this.target_node.x && this.spaceMap[i].y == this.target_node.y - 1 && this.back != 0) {
				this.ret.push({x:this.spaceMap[i].x, y:this.spaceMap[i].y, cost:this.spaceMap[i].cost, back:2});
			}
		}

		if(this.ret.length > 0){
			return this.ret[Math.floor(Math.random() * this.ret.length)].back;
		}
	}

	stuckInTunnel(){
		// if we are in a tunnel, the pathfinding will be unable to create a path,
		// so we first move out of the tunnel
		if(this.inTunnel() && !this.fleeing){
			// tunnel teleport part
			if(this.x >= 28 && this.y == 15){
				this.x = 2; this.node.x = 2; this.target_node.x = 3; return false;} 
			else if(this.x <= 1 && this.y == 15){
				this.x = 27; this.node.x = 27; this.target_node.x = 26; return false;}

			// if stuck in tunnel tunnel
			if(this.back == 1 && this.x < 7 && this.node.y == 15){
				this.x -= this.speed;
				this.path = [];
				this.target_node.x = this.node.x - 1;

				return true;
			} else

			if(this.back == 3 & this.x > 22 && this.node.y == 15){
				this.x += this.speed;
				this.path = [];
				this.target_node.x = this.node.x + 1;

				return true;
			}
		}

		return false;
	}

	inTunnel(){
		for(var i = 0; i < this.tunnel.length; i++){
			if(this.target_node.x == this.tunnel[i].x && this.target_node.y == this.tunnel[i].y)
			return true;
		}

		// else not in tunnel
		return false;
	}
}
