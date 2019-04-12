let hubInterval;
let gameInterval;
let menuInterval;
let highscoresInteval;
let escInterval;

let currentGame;

let errorLogging = {
	controllerMissing:[
		false,	// singleplayer
		false,	// player 1
		false	// player 2
	]
}

let overlay = {
    hub:{active:false, object:{}},
    game:{active:false, object:{}},
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
    