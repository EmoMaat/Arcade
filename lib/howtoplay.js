var howtoplayInterval;
var instructionScreen;
class howtoplayScreen {
		constructor(game) {
			this.game = game;
			this.src = this.game.toLowerCase();
			this.img = new Image();
			this.img.src = "lib/instructions/"+this.src+".png";
			this.btn = new Button(canvas.width/2 - 130/2, 830,130,40,"     BACK","backToMenu()");
			this.btn.selected = true;
			this.title = currentGame.split(/(?=[A-Z])/).join(" ");
			self = this;
		}
		update() {
			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = "#fff";
			ctx.font = "50px segoe ui";
			ctx.textAlign = "center";
			ctx.drawImage(self.img,0,0);
			ctx.fillText("HOW TO PLAY: "+self.title.toUpperCase(),1440/2,100);
			self.btn.draw();
			
			if (map.Button5 || map[13]) {
				self.btn.execute();
			}
		}
}

function backToMenu() {
	clearInterval(howtoplayInterval);
	var gameName = currentGame.toString();
	gameName = gameName.charAt(0).toLowerCase() + gameName.slice(1);
	eval(gameName+"Game.quit()");
	forceLoad(currentGame);
	map[13] = false;
	map.Button5 = false;
}

function loadInstructions() {
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
        overlayInterval.stop();
	
	instructionScreen = new howtoplayScreen(currentGame);
	howtoplayInterval = setInterval(instructionScreen.update,20);
}