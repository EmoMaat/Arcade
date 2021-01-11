function updateAsteroids() {
	for (i = 0; i < asteroids.length; i++) {
		asteroids[i].update();
		asteroids[i].draw();
	}
}

function updateParticles() {
	for (i = 0; i < particles.length; i++) {
		particles[i].update();
	}
}

function updateButtons() {
	for (i = 0; i < buttons.length; i++) {
		buttons[i].update();
		buttons[i].draw();
	}
}

function updatePickups() {
	for (i = 0; i < pickups.length; i++) {
		pickups[i].draw();
	}
}

function updateProjectiles() {
	for (i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();
	}
	for (p = 0; p < projectiles.length; p++) {
		if (projectiles[p].toUpdate == false) {
			projectiles.splice(p,1);
		}
	}
}

function checkCollision() {
	var dx = 0;
	var dy = 0;
	var dist = 0;
	var newRad1 = 0;
	var newRad2 = 0;
	var pushed = false;
	for (a = 0; a < asteroids.length; a++) {
		for (p = 0; p < projectiles.length; p++) {
			dx = asteroids[a].x - projectiles[p].x;
			dy = asteroids[a].y - projectiles[p].y;
			dist = Math.sqrt(dx*dx + dy*dy);
			if (dist < projectiles[p].radius + asteroids[a].radius + 15) {
				spawnParticles(asteroids[a].x,asteroids[a].y,1,15);
				asteroids[a].toUpdate = false;
				projectiles[p].toUpdate = false;
				newRad1 = (asteroids[a].degrees-randomNumber(30,60));
				newRad2 = (asteroids[a].degrees+randomNumber(30,60));
				if (pushed == false) {
					if (asteroids[a].split == 2) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						asteroids.push(new asteroid(asteroids[a].x,asteroids[a].y,newRad1,35,1));
						asteroids.push(new asteroid(asteroids[a].x,asteroids[a].y,newRad2,35,1));
						if (projectiles[p].friendly) {player.score += 2;}
					} else if (asteroids[a].split == 1) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						asteroids.push(new asteroid(asteroids[a].x,asteroids[a].y,newRad1,20,0));
						asteroids.push(new asteroid(asteroids[a].x,asteroids[a].y,newRad2,20,0));
						if (projectiles[p].friendly) {player.score += 5;}
					} else if (asteroids[a].split == 0) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						if (projectiles[p].friendly) {player.score += 7;}
					}
					
				pushed = true;
				}
			}
		}
		dx = asteroids[a].x - player.x;
		dy = asteroids[a].y - player.y;
		dist = Math.sqrt(dx*dx + dy*dy);
		if (dist < player.radius + asteroids[a].radius && player.hit == false) {
			player.lifes--;
			player.thrustSound.pause();
			player.hit = true;
			lifes.splice(lifes.length - 1,1);
			player.x = canvas.width/2;
			player.y = canvas.height/2;
			player.velX = 0;
			player.velY = 0;
			soundPlay('Asteroids/src/player_exp.wav',1);
		}
		if (player.hit && player.lifes > -1) {
			player.spawnCount++;
			if (player.spawnCount > 1 && player.spawnCount < 10) {
				player.toUpdate = false;
			}
			if (player.spawnCount >= 250) {
				player.spawnCount = 0;
				player.hit = false;
				player.toUpdate = true;
			}
		}
	}
	for (q = 0; q < asteroids.length; q++) {
		if (asteroids[q].toUpdate == false) {
			asteroids.splice(q,1);
		}
	}
	for (s = 0; s < projectiles.length; s++) {
		if (!projectiles[s].friendly) {
			if ((segment_intersection(player.px,player.py,player.px2,player.py2,projectiles[s].x,projectiles[s].y,projectiles[s].px,projectiles[s].py) ||
				segment_intersection(player.px2,player.py2,player.px3,player.py3,projectiles[s].x,projectiles[s].y,projectiles[s].px,projectiles[s].py) ||
				segment_intersection(player.px3,player.py3,player.px,player.py,projectiles[s].x,projectiles[s].y,projectiles[s].px,projectiles[s].py)) && player.hit == false) {
				player.lifes--;
				player.hit = true;
				player.toUpdate = false;
				lifes.splice(lifes.length - 1,1);
				player.velX = 0;
				player.velY = 0;
				soundPlay('Asteroids/src/player_exp.wav',1);
				projectiles[s].toUpdate = false;
			}
			if (player.hit && player.lifes > -1) {
				player.spawnCount++;
				player.x = canvas.width/2;
				player.y = canvas.height/2;
				if (player.spawnCount == 100) {
					player.spawnCount = 0;
					player.hit = false;
					player.toUpdate = true;
				}
			}
		}
		// check if projectiles hit ufo here
		for (uf = 0; uf < ufos.length; uf++) {
			if (projectiles[s].friendly) {
				var dx = projectiles[s].px - ufos[uf].center.x;
				var dy = projectiles[s].py - ufos[uf].center.y + 7;
				var dist = Math.sqrt(dx*dx + dy*dy);
				if (dist < 30) {
					ufos[uf].toUpdate = false;
					player.score += 50;
					projectiles[s].toUpdate = false;
					soundPlay('Asteroids/src/ufo_exp.wav',1);
				}
			}
		}
		for (ts = 0; ts < ufos.length; ts++) {
			if (ufos[ts].toUpdate == false) {
				ufos.splice(ts,1);
			}
		}
		if (projectiles[s].toUpdate == false) {
			projectiles.splice(s,1);
		}		
	}
	for (pu = 0; pu < pickups.length; pu++) {
		var dx = pickups[pu].x - player.x;
		var dy = pickups[pu].y - player.y;
		var dist = Math.sqrt(dx*dx + dy*dy);
		if (dist < player.radius + pickups[pu].radius + 5) {
			if (pickups[pu].type == "health") {
				player.lifes++;
				if (lifes.length > 0) {
					lifes.push(new playerLifeObj(lifes[lifes.length - 1].x + 50));
				} else {
					lifes.push(new playerLifeObj(30));
				}
				
			} else {
				if (player.shots < 5) {
					player.shots += 2;
					if (player.maxOffset > 25) {
						player.maxOffset += 13;
					}
					player.fireRate += 10;
				}
			}
			pickups.splice(pu,1);
			soundPlay('Asteroids/src/pickup.wav',1);
		}
	}
}
function spawnAsteroids() {
	for (u = 0; u < asteroidamount; u++) {
		asteroids.push(new asteroid(randomNumber(0,canvas.width),randomNumber(0,canvas.height),randomNumber(0,360),50,2));
	}
}
spawnAsteroids();
var deathScreenCounter = 0;
function drawLifes() {
	for (l = 0; l < lifes.length; l++) {
		lifes[l].draw();
	}
	if (player.lifes < 0) {
		player.toUpdate = false;
		deathScreenCounter++;
		ctx.fillStyle = "white";
		ctx.font = "100px verdana";
		ctx.textAlign = "center";
		if (deathScreenCounter > 40 && deathScreenCounter < 80) {
			ctx.strokeText("GAME         ",canvas.width/2,canvas.height/2 - 30);
		} else if (deathScreenCounter > 79) {
			ctx.strokeText("GAME OVER",canvas.width/2,canvas.height/2 - 30);
		}
		if (deathScreenCounter > 120) {
			ctx.strokeText("score: " + player.score,canvas.width/2,canvas.height/2 + 130);
		}
		if (deathScreenCounter > 200) {
			loadHighscores(player.score, currentGame);
		}
	}
	ctx.font = "40px verdana";
	ctx.fillStyle = "white";
	ctx.textAlign = "start";
	ctx.strokeText("score: " + player.score,canvas.width/2 - 75,50);
}

function updateUfos() {
	for (i = 0; i < ufos.length; i++) {
		ufos[i].draw();
		ufos[i].update();
	}
}
function updateFunction() {
	clearInterval(gameInterval);
	ctx.fillStyle = "#000";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	checkCollision();
	updateProjectiles();
	updateAsteroids();
	updateParticles();
	player.draw();
	player.update();
	drawLifes();
	updateUfos();
	drawFix();
	updatePickups();
	checkParticles();
	asteroidcount = asteroids.length;
	if (asteroidcount == 0) {
		asteroidamount++;
		asteroidcount = asteroidamount;
		spawnAsteroids();
		if (randomNumber(1,4) == 2) {
			pickups.push(new pickup("shot"));
		} else {
			pickups.push(new pickup("health"));
		}
	}
	ufo_timer++;
	if (ufo_timer == 1000) { //1500 == 30 seconds
		ufos.push(new ufoObj(false));
		ufo_timer = 0;
	}
}
/*var interval = "";
window.onload = function() {
	// menuInterval = setInterval(menu,20);
}*/

function drawFix() {
	ctx.beginPath();
	ctx.arc(-100,-100,5,0,2*Math.PI);
	ctx.strokeStyle = "rgba(255,255,255,1)";
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
}

function start(fnc,speed) {
	interval = setInterval(fnc,speed);
}