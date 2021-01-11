function snake_menu() {
	this.update = function() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 3;
		ctx.strokeRect(11.5,0,1896.5,1050);
		for (i = 0; i < buttonsSnake.length; i++) {
			buttonsSnake[i].draw();
		}
		handleSelectedButtonSnake();
	}
	
}
var menuSnake = new snake_menu();
var buttonsSnake = [];

function handleSelectedButtonSnake() {
	for (i = 0; i < buttonsSnake.length; i++) {
		if (i == selectedButton) {
			buttonsSnake[i].selected = true;
		} else {
			buttonsSnake[i].selected = false;
		}
		if (map.Button0 && i == selectedButton && !joystickPressed) {
			joystickPressed = true;
			buttonsSnake[i].runFunction();
		}
	}
	if (map.axis2 == 1 && !joystickPressed && selectedButton < buttonsSnake.length - 1) {
		selectedButton++;
		joystickPressed = true;
	}
	if (map.axis2 == -1 && !joystickPressed && selectedButton > 0) {
		selectedButton--;
		joystickPressed = true;
	}
	if (map.axis2 == 0 && map.axis2 == 0 && map.Button0 == false) {
		joystickPressed = false;
	}
}
function startSnake() {
	clearInterval(gameInterval)
	gameInterval = setInterval(snakeLoop,20);
}
buttonsSnake.push(new buttonObj(canvas.width/2 - 200,canvas.height - 500,"             START GAME",400,30,"startSnake()",true));
buttonsSnake.push(new buttonObj(canvas.width/2 - 200,canvas.height - 420,"             SET DIFFICULTY",400,30,"setDifficulty()",true));
buttonsSnake.push(new buttonObj(canvas.width/2 - 200,canvas.height - 340,"             HOW TO PLAY",400,30,"function here"));
buttonsSnake.push(new buttonObj(canvas.width/2 - 200,canvas.height - 260,"EXIT",400,30,"loadHub()"));