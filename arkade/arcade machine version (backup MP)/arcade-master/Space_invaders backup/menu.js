

function startSpaceinvaders() {
	clearInterval(gameInterval);
	gameInterval = setInterval(spaceLoop,5);
}