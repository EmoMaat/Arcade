let hubInterval;
let gameInterval;
let menuInterval;
let highscoresInteval;
let escInterval;

let currentGame = "test";

let games = [
    "test"
];

let errorLogging = {
	controllerMissing:[
		false,	// singleplayer
		false,	// player 1
		false	// player 2
	]
}

var canvas = {
    width:1400,
    height:1080
}

let overlay = {
    hub:{active:false, object:{}},
    menu:{active:false, object:{}},
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
    
function quitOpenGame(){
    if(typeof window[currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game"] !== "undefined")
        if(typeof eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit") === "function")
		    eval(currentGame.charAt(0).toLowerCase() + currentGame.slice(1) + "Game.quit()");
}