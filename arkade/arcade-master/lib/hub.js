document.title = "Hub"; 
 
// hub wrapper 
var hubWrapper = {
	scroll: function(motion){
		if(motion != -1 && motion != 1){
			console.log( "Input can only be 1 (right) or -1 (left).");
			return false;
		}
		
		if(this.currentWrapper + motion == -1 || this.currentWrapper + motion == Object.keys(this.wrappers).length){
			console.log("Limit reached.");
			return false;
		}

		this.currentWrapper += motion;
		hub.Scrolling[0] = true;
		
		// motion = -1 => left
		// motion = 1 => right
		this.distance = canvas.width / 1.15;
		this.scrollSpeed = 35;
		this.motion = motion;
		
		// "this" is not available in the setInterval so we save the instance
		var self = this;
		
		// we create an interval so there seems to be a slide
		this.interval = setInterval(function(){ 
			if (self.motion == -1){
				if(0 < self.distance){
					self.distance -= self.scrollSpeed; // when we hit zero we are at an other wrapper
					for(var w = 0; w < Object.keys(self.wrappers).length; w++){
						self.wrappers[w].x += self.scrollSpeed;
					}
				} else {
					eval(hub.Scrolling[1]);
					hub.Scrolling[0] = false;
					clearInterval(self.interval);
				}
			}
			
			// same thing but reversed
			if (motion == 1){
				if(0 < self.distance){
					self.distance -= self.scrollSpeed;
					for(var w = 0; w < Object.keys(self.wrappers).length; w++){
						self.wrappers[w].x -= self.scrollSpeed;
					}
				} else {
					eval(hub.Scrolling[1]);
					hub.Scrolling[0] = false;
					clearInterval(self.interval);
				}
			}
		}, 5);
		return true;
	},
	currentWrapper:0,
	wrappers:{}
};

class Hub{
	constructor(){
		console.log("Loading Hub variables...");
		
		this.buttons = [];
		this.Scrolling = [false];

		this.currentButtonID = 0; 
		
		// how many wrappers are required
		var requiredWrappers = Math.ceil(games.length / 6);
		var requiredIcons = games.length - 1;
		var gameInt = 0;
		
		// pre-config
		console.log("Loading Hub config...");
		move.smooth = false;
		move.multiplayer = false;
		HubControl = true;

		// here we build the items
		console.log("Loading Hub buttons...");
		
		for(var i = 0; i < requiredWrappers; i++){
			// restore the defaults
			var placementx = canvas.width / 6
							+ (i * canvas.width / 1.15);  //distance between each wrapper
			var placementy = canvas.height / 3.5;
			
			var hubSubWrapper = {
				// wrapper position values
				// these should not change independantly
				_x: canvas.width / 6 + (i * canvas.width / 1.15), //y
				_y: canvas.height / 3.5,	
				
				// storage for the buttons
				items:{},
				
				// these setters and getters change the whole content of a wrapper
				set x (position){
					this._x = position;
					var difference = hubWrapper.wrappers[0].items[1].defaultX - hubWrapper.wrappers[0].items[0].defaultX;
					
					for(var i = 0; i < Object.keys(this.items).length; i++){
						if(i == 3) // if i == 3 that means we are on a second row
							position = this._x;
						
						this.items[i].defaultX = position;
						
						position += difference; // we do not want the first loop interfering
					}
				}, get x(){ return this._x; },
				
				set y (position){
					this._y = position;	
					var difference = hubWrapper.wrappers[0].items[3].defaultY - hubWrapper.wrappers[0].items[0].defaultY;
					
					for(var i = 0; i < Object.keys(this.items).length; i++){
						if(i == 3) // if i == 3 that means we are on a second row
							position += difference;
						
						this.items[i].defaultY = position;
					}
				}, get y(){ return this._y; }
			};

			// calculate how much items to draw
			if (requiredIcons < 6) {
				var r = 5 - requiredIcons;
				// var x = 0;
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
				
				var gameName = games[gameInt].replace(/\s/g, '');
				gameName = gameName.toLowerCase();
				
				// check if the image exists
				var gameImage = this.ImgLoad(gameName);
				
				var Button = new hubButton(placementx,placementy,games[gameInt],gameImage, games[gameInt]);
				this.buttons.push(Button);
				hubSubWrapper.items[x] = Button;
				gameInt++;
				
				// screen.width / 430 (amount of distance) = 4.0186046511627906976744186046512
				placementx += canvas.width / 4.0186046511627906976744186046512;
			}
			
			// in the end they are pushed in the main wrapper
			hubWrapper.wrappers[i] = hubSubWrapper;
		}
		console.log("Hub Loaded.");
	}
	
	updateHub() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		currentGame = "";
		
		//halfwidthx = half the distance between most left item and left side of the bar under "GAME HUB"
		var halfwidthx = (canvas.width / 10 * 9 - (canvas.width / 6 * 2 + (canvas.width / 4.0186046511627906976744186046512) * 2)) / 2;
		//halfwidthy = half the distance between the middle and an item
		var halfwidthy = canvas.height / 2 - (canvas.height / 3.5 + canvas.height / 6);
		
		// check if we should make arrows pointing up or down
		if(hubWrapper.currentWrapper -1 !== -1 && !hub.Scrolling[0]){			
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
		if(hubWrapper.currentWrapper + 1 !== Object.keys(hubWrapper.wrappers).length && !hub.Scrolling[0]){
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
				
		hub.controlHub();
		
		for (let i = 0; i < hub.buttons.length; i++) {
			hub.buttons[i].update();
		}
		
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
	
	controlHub() {
		if(this.Scrolling[0]){
			return;
		}
		
		if(move.right){
			// do we need to scroll
			var scrolled = false;
			var isRight = false;
			
			for (var i = 2; i < hub.buttons.length; i += 3){ // check if the selected button is on the right side
				if (this.currentButtonID == i)
					isRight = true;	
			}
			
			if(isRight)
				scrolled = hubWrapper.scroll(1); // returns true if we are going to scroll
			
			// check if we can move
			if (!isRight && this.currentButtonID <= hub.buttons.length - 1){
				var positionChange = 1;
				
			} else if(scrolled && isRight){
				// we were right and scrolled
				var positionChange = 4;
				
			} else if (!scrolled && this.currentButtonID + 4 >= (hubWrapper.currentWrapper + 1) * 6){
				// we can't scroll because we are on the last right side
				var positionChange = 0;
				
			} else if (scrolled && this.currentButtonID + 4 > hub.buttons.length - 1){
				// we have scrolled so must move to the last button
				var positionChange = hub.buttons.length - 1 - this.currentButtonID;
			}
			
			// if this.Scrolling[0] == true, that means we have yet to finish scrolling
			// so we create a defferal and put it in this.Scrolling[1]
			if (!this.Scrolling[0]){
				this.currentButtonID += positionChange;
			} else {
				this.Scrolling[1] = "hub.currentButtonID += " + positionChange + ";";
			}
		}
		
		if(move.left){
			// do we need to scroll
			var scrolled = false;
			var isLeft = false;
			
			for (var i = 0; i < hub.buttons.length; i += 3){ // check if the selected button is on the right side
				if (this.currentButtonID == i)
					isLeft = true;	
			}
			
			if(isLeft)
				scrolled = hubWrapper.scroll(-1); // returns true if we are going to scroll
			
			// check if we can move
			if (!isLeft && this.currentButtonID <= hub.buttons.length - 1){
				var positionChange = 1;
				
			} else if(scrolled && isLeft){
				// we were right and scrolled
				var positionChange = 4;
				
			} else if (!scrolled && this.currentButtonID - 4 <= (hubWrapper.currentWrapper) * 6){
				// we can't scroll because we are on the last right side
				var positionChange = 0;
				
			}

			// if this.Scrolling[0] == true, that means we have yet to finish scrolling
			// so we create a defferal and put it in this.Scrolling[1]
			if (!this.Scrolling[0]){
				this.currentButtonID -= positionChange;
			} else {
				this.Scrolling[1] = "hub.currentButtonID -= " + positionChange + ";";
			}
		}
		
		if(this.currentButtonID >= 0 && move.down){
			var MayMoveDown = true;
			if(this.currentButtonID + 3 >= (hubWrapper.currentWrapper + 1) * 6){ // check if the selected button is on the bottom
				MayMoveDown = false;	
			}
			if(MayMoveDown){ // we are not on the bottom
				this.currentButtonID += 3;
			}
		}
		
		if(this.currentButtonID <= hub.buttons.length -1 && move.up){
			var MayMoveUp = true;
			if(this.currentButtonID - 3 < hubWrapper.currentWrapper * 6){ // check if the selected button is on the top
				MayMoveUp = false;	
			}
			if(MayMoveUp){ // we are not on the top
				this.currentButtonID -= 3;
			}
		}

		for (let i = 0; i < this.buttons.length; i++) {
			if (i == this.currentButtonID) {
				if (map.Button0 || map[13]) {
					this.buttons[i].loadGame();
				}
				this.buttons[i].selected = true;
			} else {
				this.buttons[i].selected = false;	
			}
		}
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
		
		this.game = game.replace(/\s/g, '');
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
			ctx.font = "60px segoe ui";
			ctx.textAlign = "center";
			ctx.lineWidth = 5;
			ctx.fillText(this.boxText,this.x + this.width/2,this.y + this.height + 70);
			
		} else {
			this.lineWidth = 3;
			this.height = canvas.height / 6;
			this.width = canvas.width / 6;
			this.x = this.defaultX;
			this.y = this.defaultY;
			ctx.font = "40px segoe ui";
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
hubInterval = setInterval(hub.updateHub,20);

function loadHub() {
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();

	if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
		eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");

	move.smooth = false;
	
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
		
		
		if (counter >= 10 && counter <= 59) {
			damping = Math.floor(Math.random() * (300 - 25)) + 6;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter >= 60 && counter < 100) {
			damping = Math.floor(Math.random() * (50 - 25)) + 3;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter > 100) {
			// when done loading we load the hub
			clearInterval(timer);
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			hubInterval = setInterval(hub.updateHub,20);
		};
	}, 20);
	
}

function loadGame(GameName){
	console.log(">> Loading " + GameName + "...");
	
	HubControl = false; //		give the hub no control
	gameLoading = true; // 		make the escape button not working while loading
	currentGame = GameName; //	so the escape knows which game to load
	
	clearInterval(hubInterval);
	
	// give the loading speed
	var speed;
	if(GameName == games[0]){ speed = 40; } 
	else if (GameName == games[1].replace(/\s/g, '')){ speed = 10; } 
	else if (GameName == games[2].replace(/\s/g, '')){ speed = 20; } 
	else if (GameName == games[3].replace(/\s/g, '')){ speed = 30; }
	else if (GameName == games[4].replace(/\s/g, '')){ speed = 20; }
	else if (GameName == games[5].replace(/\s/g, '')){ speed = 10; }
	
	// This is a fake loading bar
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
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			eval(GameName)(); // it works and is easy
		};
	}, speed);
}

function forceLoad(loadGame){
	HubControl = false; //		give the hub no control
	currentGame = loadGame; //	so the escape knows which game to load
	
	clearInterval(hubInterval);
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	eval(loadGame)();
}

