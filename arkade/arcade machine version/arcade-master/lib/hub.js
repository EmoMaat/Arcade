document.title = "Hub"; 

class Hub{
	constructor(){
		console.log("Loading Hub variables...");
		
		this.wrappers = [];
		this.current = {button:0, wrapper:0};
		this.scrolling = false;

		currentGame = "";
		var gameInt = 0;
		
		// how many wrappers are required
		var requiredWrappers = Math.ceil(games.length / 6);
		var requiredIcons = games.length - 1;
		
		// pre-config
		console.log("Loading Hub config...");
		move.smooth = false;
		move.multiplayer = false;
		HubControl = true;

		// here we build the items
		console.log("Loading Hub buttons...");
		for(var i = 0; i < requiredWrappers; i++){
			// restore the defaults
			var placementx = canvas.width / 6 + (i * canvas.width / 1.15);  //distance between each wrapper
			var placementy = canvas.height / 3.5;
			
			// add the wrapper to the array
			this.wrappers[i] = {
				// wrapper position values
				// these should not change independantly
				_x: canvas.width / 6 + (i * canvas.width / 1.15), 
				y: canvas.height / 3.5,

				// this will contain all the buttons
				buttons:[],

				set x (position){
					this._x = position; // save the target position

					// calculate the difference between the wrappers. (first and second represent all thereafter wrapper positions)
					var difference = hub.wrappers[0].buttons[1].defaultX - hub.wrappers[0].buttons[0].defaultX;
					
					for(var i = 0; i < Object.keys(this.buttons).length; i++){
						if(i == 3) // if i == 3 that means we are on a second row
							position = this._x;
						
						this.buttons[i].defaultX = position;
						
						position += difference; // we do not want the first loop interfering
					}
				}, get x(){ return this._x; },
			};

			// calculate how much items to draw
			if (requiredIcons < 6) {
				var r = 5 - requiredIcons;
				requiredIcons -= requiredIcons;
			} else {
				var r = 0;
				requiredIcons -= 6;
			}
			
			// here the items are created and pushed in a subwrapper
			// an subwrapper can contain at most 6 items
			for(var x = 0; x < 6 - r; x++){
				if(x == 3){placementx = canvas.width / 6 		// new row
								+ (i * canvas.width / 1.15);} 	// distance between each wrapper
				if(x >= 3){placementy = canvas.height / 1.55;} 	/* space between 1st and 2nd row */
				
				// check if the image exists
				var gameImage = this.ImgLoad(games[gameInt].replace(/\s/g, '').toLowerCase());
				var Button = new hubButton(placementx,placementy,games[gameInt],gameImage, games[gameInt]);
				
				this.wrappers[i].buttons.push(Button);

				gameInt++;
				
				// screen.width / 430 (amount of distance) = 4.0186046511627906976744186046512
				placementx += canvas.width / 4.0186046511627906976744186046512;
			}
			
			// in the end they are pushed in the main wrapper
			//this.wrappers[i] = hubSubWrapper;
		}
		console.log("Hub Loaded.");
	}
	
	update() {
		this.draw();	
		this.controlHandler();
		
		// we draw a black box so when moving up it moves under the hub title
		ctx.fillStyle = "#000";
		// ctx.fillRect(canvas.width/10,0,canvas.width/10*8,canvas.height/5); 
		
		ctx.fillStyle = "#fff";
		ctx.font = "100px segoe ui";
		ctx.textAlign = "center";
		ctx.fillText("GAME HUB",canvas.width/2,canvas.height/5 - 40);
		
		ctx.beginPath();
		ctx.strokeStyle = "#fff";
		ctx.moveTo(canvas.width/10,canvas.height/5);
		ctx.lineTo(canvas.width/10*9,canvas.height/5);
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.closePath();
	} 

	draw(){
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// for every button update
		for (var w = 0; w < this.wrappers.length; w++){
			for (var b = 0; b < this.wrappers[w].buttons.length; b++) {
				this.wrappers[w].buttons[b].update();
			}
		}

		//halfwidthx = half the distance between most left item and left side of the bar under "GAME HUB"
		var halfwidthx = (canvas.width / 10 * 9 - (canvas.width / 6 * 2 + (canvas.width / 4.0186046511627906976744186046512) * 2)) / 2;
		//halfwidthy = half the distance between the middle and an item
		var halfwidthy = canvas.height / 2 - (canvas.height / 3.5 + canvas.height / 6);
		
		// check if we should make arrows pointing up or down
		if(this.current.wrapper - 1 !== -1 && !this.scrolling){			
			var x1 = canvas.width / 10 - (halfwidthx * 1.3);
			var x2 = canvas.width / 10;
			var x3 = canvas.width / 10;
			
			var y1 = canvas.height / 1.55 - halfwidthy * 2;
			var y2 = canvas.height / 1.55 - halfwidthy + (halfwidthy / 3);
			var y3 = canvas.height / 1.55 - halfwidthy * 3 - (halfwidthy / 3);
			
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			
			ctx.fillStyle = "#fff";
			ctx.fill();
		}
		if(this.current.wrapper + 1 !== this.wrappers.length && !this.scrolling){
			var x1 = canvas.width / 10 * 9 + (halfwidthx * 1.3);
			var x2 = canvas.width / 10 * 9;
			var x3 = canvas.width / 10 * 9;
			
			var y1 = canvas.height / 1.55 - halfwidthy * 2;
			var y2 = canvas.height / 1.55 - halfwidthy + (halfwidthy / 3);
			var y3 = canvas.height / 1.55 - halfwidthy * 3 - (halfwidthy / 3);
			
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			
			ctx.fillStyle = "#fff";
			ctx.fill();
		}
	}
	
	controlHandler() {
		if(this.scrolling)
			return;
		
		if(move.right){
			// do we need to scroll
			var scrolled = false;
			var isRight = false;
			var change = 0;

			// check if the selected button is on the right side
			for (var i = 2; i < this.wrappers[this.current.wrapper].buttons.length; i += 3) {
				if (i == this.current.button - (this.current.wrapper * 6)){
					isRight = true;	
					// deselect the current button
					this.wrappers[this.current.wrapper].buttons[this.current.button - (this.current.wrapper * 6)].selected = false;
					
					//scroll
					scrolled = this.scroll(1); // returns true if we are going to scroll
				}
			}

			// check if there are any problems in moving to the next wrapper
			if (scrolled && this.current.button - (this.current.wrapper * 6) + 4 > this.wrappers[this.current.wrapper].buttons.length)
				// we have scrolled so must move to the last button
				change = 1;

			// no problems in moving to the next wrapper
			else if (!isRight && this.current.button - (this.current.wrapper * 6) < this.wrappers[this.current.wrapper].buttons.length - 1)
				change = 1;
				
			else if(scrolled && isRight)
				// we were right and scrolled
				change = 4;
				
			// add the change to the selected button ID
			this.current.button += change;
		}
		
		if(move.left){
			// do we need to scroll
			var scrolled = false;
			var isLeft = false;
			var change = 0;
			
			for (var i = 0; i < this.wrappers[this.current.wrapper].buttons.length; i += 3) // check if the selected button is on the right side
				if (i == this.current.button - (this.current.wrapper * 6)){
					isLeft = true;
					
					// deselect the current button
					this.wrappers[this.current.wrapper].buttons[this.current.button - (this.current.wrapper * 6)].selected = false;
					
					//scroll
					scrolled = this.scroll(-1); // returns true if we are going to scroll
				}
			
			// check if we can move
			if (!isLeft && this.current.button - (this.current.wrapper * 6) <= this.wrappers[this.current.wrapper].buttons.length - 1)
				var change = 1;
				
			else if(scrolled && isLeft)
				// we were right and scrolled
				var change = 4;

			// add the change to the selected button ID
			this.current.button -= change;			
		}
		// move down
		if(this.current.button - (this.current.wrapper * 6) < this.wrappers[this.current.wrapper].buttons.length && move.down){
			// check if the selected button is on the bottom
			
			if(this.current.button - (this.current.wrapper * 6) + 3 < this.wrappers[this.current.wrapper].buttons.length)
				this.current.button += 3;
		}
		
		// move up
		if(this.current.button >= 0 && move.up){
			// check if the selected button is on the top
			if(this.current.button - 3 >= this.current.wrapper * 6 )
				this.current.button -= 3;
		}

		for (var i = 0; i < this.wrappers[this.current.wrapper].buttons.length; i++) {
			//console.log(this.current.button - (this.current.wrapper * 6))
			if (i == this.current.button - (this.current.wrapper * 6)) {
				if (map.Button5 || map[13]) {
					map.Button5 = false;
					this.wrappers[this.current.wrapper].buttons[i].loadGame();
				}
				this.wrappers[this.current.wrapper].buttons[i].selected = true;
			} else {
				this.wrappers[this.current.wrapper].buttons[i].selected = false;
			}
		}
	}

	scroll(motion){
		if(motion != -1 && motion != 1){
			console.log( "Input can only be 1 (right) or -1 (left).");
			return false;
		}
		
		if(this.current.wrapper + motion == -1 || this.current.wrapper + motion == this.wrappers.length){
			console.log("Limit reached.");
			return false;
		}

		this.current.wrapper += motion;
		this.scrolling = true;
		
		// motion = -1 => left
		// motion = 1 => right
		this.distance = canvas.width / 1.15;
		this.scrollSpeed = 35;
		this.motion = motion;
		
		// "this" is not available in the setInterval so we save the instance
		var self = this;
		
		// we create an interval so there seems to be a slide
		this.interval = setInterval(function(){ 
			// go left
			if (self.motion == -1){
				if(0 < self.distance){
					self.distance -= self.scrollSpeed; // when we hit zero we are at an other wrapper
					for(var w = 0; w < Object.keys(self.wrappers).length; w++){
						self.wrappers[w].x += self.scrollSpeed;
					}
				} else {

					self.scrolling = false;
					clearInterval(self.interval);
				}
			}
			
			// go right
			if (motion == 1){
				if(0 < self.distance){
					self.distance -= self.scrollSpeed;
					for(var w = 0; w < Object.keys(self.wrappers).length; w++){
						self.wrappers[w].x -= self.scrollSpeed;
					}
				} else {

					self.scrolling = false;
					clearInterval(self.interval);
				}
			}
		}, 5);
		return true;
	}
	
	ImgLoad(ImgName) {
	    var ImgObject = new Image();
	    var oImg = new Image();
		
	    oImg.src="lib/src/" + ImgName + ".png";
	    oImg.onload=function(){ImgObject.src=oImg.src}
	    oImg.onerror=function(){ImgObject.src="lib/src/blank.png"}
		
		return ImgObject;
	}
}

class hubButton {
	constructor(x, y, boxText, boxImg, game, resize){
		this.defaultX = x;
		this.defaultY = y
		this.x = x;
		this.y = y;
		this.boxText = boxText.toUpperCase();
		this.boxImg = boxImg;
		this.selected = false;
		this.width = canvas.width / 6.3;
		this.height = canvas.height / 6.3;
		this.resizeScale = 0; 						// sizes the boxes
		
		this.game = game;
		// this.game = this.game.toLowerCase();
	}
	loadGame(){
		loadGame(this.game)
	}
	update() {
		if (this.resizeScale < 0)
			this.resizeScale += 1;
		
		if (this.resizeScale > 0)
			this.resizeScale -= 1;
		
		if (this.selected) {
			this.lineWidth = 5;
			this.height = canvas.height / 4.2 + this.resizeScale;
			this.width = canvas.width / 4.2 + this.resizeScale;
			this.x = this.defaultX - this.width / 6.3 - this.resizeScale / 2;
			this.y = this.defaultY - this.height / 6.3 - this.resizeScale / 2;
			ctx.font = "45px segoe ui";
			ctx.textAlign = "center";
			ctx.lineWidth = 5;
			ctx.fillText(this.boxText,this.x + this.width/2,this.y + this.height + 70);
			
		} else {
			this.lineWidth = 3;
			this.height = canvas.height / 6;
			this.width = canvas.width / 6;
			this.x = this.defaultX;
			this.y = this.defaultY;
			ctx.font = "30px segoe ui";
			ctx.textAlign = "center";
			ctx.lineWidth = 3
			ctx.fillText(this.boxText,this.x + this.width/2,this.y + this.height + 50);
		}
		ctx.strokeStyle = "#fff";
		ctx.strokeRect(this.x,this.y,this.width,this.height);
		ctx.drawImage(this.boxImg,this.x + 3,this.y + 3,this.width - 5,this.height - 5);
	}
}


// hub initialization
var hub = new Hub();
hubInterval = new Interval(function(){hub.update();},20);

/**
 * Load the hub
 */
function loadHub() {
	// stop any intervals running
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	// execute .quit() function
	if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
		eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

	move.smooth = false;
	
	// We draw a fake progressbar
	var counter = 0; var factor = 1;
	var timer = setInterval(function () { // timer function for progress bar
		counter = counter + factor;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.font = '48pt Segoe UI';
		ctx.strokeStyle = "rgb(50, 50, 50)"; 
		ctx.textAlign = "center";
		
		ctx.fillText("Loading Hub...", canvas.width / 2, 500 + 24 /* fontHeight / 2*/);
	
		ctx.beginPath();
		ctx.lineWidth = 14;
		ctx.rect(canvas.width / 4, 600, canvas.width / 2 , 30); 
		ctx.fillStyle = '#fff'; 
		ctx.fillRect(canvas.width / 4, 600, counter * (canvas.width / 2) / 100, 30);
		
		ctx.stroke();
		ctx.closePath();
		
		// setting the progressvalue of the bar
		if (counter >= 10 && counter <= 59) {
			damping = Math.floor(Math.random() * (300 - 25)) + 6;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter >= 60 && counter < 100) {
			damping = Math.floor(Math.random() * (50 - 25)) + 3;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter > 100) {
			// when done loading we load the hub
			clearInterval(timer);

			// start the hub
			hubInterval = new Interval(hub.update(),20);
		};
	}, 20);
	
}

function loadGame(GameName){
	console.log(">> Loading " + GameName + "...");
	
	HubControl = false; //		give the hub no control
	gameLoading = true; // 		make the escape button not working while loading
	currentGame = GameName.replace(/\s/g, ''); //	so the escape knows which game to load
	
	hubInterval.stop();
	
	// set the loading speed
	var speed;
	if(GameName == games[0]){ speed = 40; } 
	else if (GameName == games[1].replace(/\s/g, '')){ speed = 10; } 
	else if (GameName == games[2].replace(/\s/g, '')){ speed = 20; } 
	else if (GameName == games[3].replace(/\s/g, '')){ speed = 30; }
	else if (GameName == games[4].replace(/\s/g, '')){ speed = 20; }
	else if (GameName == games[5].replace(/\s/g, '')){ speed = 10; }
	
	// We draw a fake progressbar
	var counter = 0; var factor = 1;
	var timer = setInterval(function () { // timer function for progress bar
		counter = counter + factor;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.font = '48pt Segoe UI';
		ctx.strokeStyle = "rgb(50, 50, 50)";
		ctx.textAlign = "center";
		
		ctx.fillText("Loading " + GameName + "...", canvas.width / 2, 500 + 24 /* fontHeight / 2*/);
	
		ctx.beginPath();
		ctx.lineWidth = 14;
		ctx.rect(canvas.width / 4, 600, canvas.width / 2 , 30); 
		ctx.fillStyle = '#fff'; 
		ctx.fillRect(canvas.width / 4, 600, counter * (canvas.width / 2) / 100, 30);
		
		ctx.stroke();
		ctx.closePath();
		
		
		if (counter >= 10 && counter <= 59) {
			damping = Math.floor(Math.random() * (300 - 25)) + 6;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter >= 60 && counter < 100) {
			damping = Math.floor(Math.random() * (50 - 25)) + 3;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter > 100) {
			// when done loading we load the game
			gameLoading = false;
			clearInterval(timer);
			
			eval(GameName.replace(/\s/g, ''))();
		};
	}, speed);
}

function forceLoad(loadGame){
	HubControl = false; //		give the hub no control
	currentGame = loadGame.replace(/\s/g, ''); //	so the escape knows which game to load
	
	hubInterval.stop();
	
	eval(loadGame.replace(/\s/g, ''))();
}

