let currentGame = "Snake";

var games = [
	"Asteroids",
	"Pacman",
	"Lunar Lander",
	"Midnight Motorists",
	"Space Invaders",
	"Missile Command",
	"Pong",
	"Tetris",
	"Lights Out",
	"Snake",
	"[To be added]",
	"[To be added]",
	"[Test]"
];

let errorLogging = {
	controllerMissing:[
		false,	// singleplayer
		false,	// player 1
		false	// player 2
	]
}


window.width = 1920;
window.height = 1080;
window.scale = window.height / 1080;


let interfaces = {
    hub:{active:false, object:{}},
    menu:{active:false, object:{}},
    game:{interval:null, object:{}},
    highscores:{active:false, object:{}},
    howtoplay:{active:false, object:{}},
    esc:{active:false, object:{}}
}

function logGamePadButtons(){setInterval(() => {
	var gamepad = navigator.getGamepads()[0]
		for(var b = 0; b < gamepad.buttons.length; b++){
				if(gamepad.buttons[b].pressed)
					console.log(b)
		}
    }, 40);}
    
function exit_open_game(){
    if(typeof interfaces.game.object.exit !== "undefined")
        if(typeof interfaces.game.object.exit === "function")
			interfaces.game.object.exit();

	if(typeof interfaces.menu.object.backgroundGame !== "undefined")
		if(typeof interfaces.menu.object.backgroundGame.exit !== "undefined")
			if(typeof interfaces.menu.object.backgroundGame.exit === "function")
				interfaces.menu.object.backgroundGame.exit();
            
    // stop any intervals running
    if(interfaces.game.interval != null)
        if(interfaces.game.interval.state !== 0)
            interfaces.game.interval.stop();
}

function exit_open_interfaces(){
	for(let key in interfaces){
		if(interfaces[key].active == true){
			interfaces[key].object.exit();
			interfaces[key].object = {}
			interfaces[key].active = false;
		}
	}
}

function remove_all_canvases(){
    while(document.querySelectorAll("canvas").length > 0){
        let c = document.querySelectorAll("canvas").length - 1;
        document.querySelectorAll("canvas")[c].parentElement.removeChild(document.querySelectorAll("canvas")[c]);
    }
}

/**
 * Random vallue between two numbers
 * @param {Int} i1 minimum
 * @param {Int} i2 maximum
 */
Math.randombetween = function(i1, i2){
	return Math.random() * (i1 - i2) + i2;
}

//check if the localStorage variables exist, otherwise set them to default values
//check if !game.includes("[") filters out all game names which are like '[To be added]'
for (let i = 0; i < games.length; i++) {
	let game = games[i].replace(/\s/g,'');
	if (!game.includes("[")) {
		if (typeof eval("localStorage."+game+"Scores") == "undefined") {
			eval("localStorage."+game+"Scores = [0,0,0,0,0]");
			eval("localStorage."+game+"Names = ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
		}
		//make two more for asteroids since it uses 3 different highscores
		if (game == "Asteroids") {
			if (typeof eval("localStorage."+game+"VersusScores") == "undefined") {
				eval("localStorage."+game+"VersusScores = [0,0,0,0,0]");
				eval("localStorage."+game+"VersusNames = ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
			if (typeof eval("localStorage."+game+"CoopScores") == "undefined") {
				eval("localStorage."+game+"CoopScores = [0,0,0,0,0]");
				eval("localStorage."+game+"CoopNames= ['NO SCORE','NO SCORE','NO SCORE','NO SCORE','NO SCORE']");
			}
		}
	}
}