var title_text = new Image();
title_text.src = "Asteroids/src/title_text.png";
var selectedButton = 0;
var buttonPressed = false;
var menuUfoTime = 200;
var menuUfoTimer = 0;
var menuUfos = [];
var MoveUp = false;
var MoveDown = false;
menuAsteroids.push(new asteroid(randomNumber(0,canvas.width),randomNumber(0,canvas.height),randomNumber(0,360),50,2));
menuAsteroids.push(new asteroid(randomNumber(0,canvas.width),randomNumber(0,canvas.height),randomNumber(0,360),50,2));
menuAsteroids.push(new asteroid(randomNumber(0,canvas.width),randomNumber(0,canvas.height),randomNumber(0,360),50,2));
// menuUfos.push(new ufoObj(true));
function menu() {
	updateProjectiles();
	checkMenuCollision();
	for (i = 0; i < menuAsteroids.length; i++) {
		menuAsteroids[i].update();
		menuAsteroids[i].draw();
	}
	updateParticles();
	if (menuUfoTimer < menuUfoTime) {
		menuUfoTimer++;
	} else {
		menuUfoTimer = 0;
		if (menuUfos.length < 1) {
			menuUfos.push(new ufoObj(true));
		}
	}
	
	for (i = 0; i < menuUfos.length; i++) {
		menuUfos[i].update();
		menuUfos[i].draw();
		if (menuUfos[i].x > canvas.width + 50 || menuUfos[i].x < -50) {
			menuUfos[i].toUpdate = false;
		}
	}
	for (u = 0; u < menuUfos.length; u++) {
		if (!menuUfos[u].toUpdate) {
			menuUfos.splice(u,1);
		}
	}
	updateButtons();
	ctx.beginPath();
	ctx.moveTo(canvas.width/4,canvas.height/5);
	ctx.lineTo(canvas.width/4*3,canvas.height/5);
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.closePath();
	ctx.drawImage(title_text,canvas.width/4,canvas.height/5 - title_text.height + 60);
}

function checkMenuCollision() {
	var dx = 0;
	var dy = 0;
	var dist = 0;
	var newRad1 = 0;
	var newRad2 = 0;
	var pushed = false;
	for (a = 0; a < menuAsteroids.length; a++) {
		for (p = 0; p < projectiles.length; p++) {
			dx = menuAsteroids[a].x - projectiles[p].x;
			dy = menuAsteroids[a].y - projectiles[p].y;
			dist = Math.sqrt(dx*dx + dy*dy);
			if (dist < projectiles[p].radius + menuAsteroids[a].radius + 15) {
				spawnParticles(menuAsteroids[a].x,menuAsteroids[a].y,1,15);
				menuAsteroids[a].toUpdate = false;
				projectiles[p].toUpdate = false;
				newRad1 = (menuAsteroids[a].degrees-randomNumber(30,60));
				newRad2 = (menuAsteroids[a].degrees+randomNumber(30,60));
				if (pushed == false) {
					if (menuAsteroids[a].split == 2) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						menuAsteroids.push(new asteroid(menuAsteroids[a].x,menuAsteroids[a].y,newRad1,35,1));
						menuAsteroids.push(new asteroid(menuAsteroids[a].x,menuAsteroids[a].y,newRad2,35,1));
						if (projectiles[p].friendly) {player.score += 2;}
					} else if (menuAsteroids[a].split == 1) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						menuAsteroids.push(new asteroid(menuAsteroids[a].x,menuAsteroids[a].y,newRad1,20,0));
						menuAsteroids.push(new asteroid(menuAsteroids[a].x,menuAsteroids[a].y,newRad2,20,0));
						if (projectiles[p].friendly) {player.score += 5;}
					} else if (menuAsteroids[a].split == 0) {
						soundPlay('Asteroids/src/explosion_asteroid.wav',1);
						if (projectiles[p].friendly) {player.score += 7;}
					}
					
				pushed = true;
				}
			}
		}
	}
	for (q = 0; q < menuAsteroids.length; q++) {
		if (menuAsteroids[q].toUpdate == false) {
			menuAsteroids.splice(q,1);
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
				if (projectiles[s].y > ufos[uf].center.y) {
					if (segment_intersection(ufos[uf].center.x - 35, ufos[uf].center.y,ufos[uf].center.x + 35, ufos[uf].center.y,projectiles[s].x,projectiles[s].y,projectiles[s].px,projectiles[s].py)) {
						ufos[uf].toUpdate = false;
						player.score += 20;
						projectiles[s].toUpdate = false;
						soundPlay('Asteroids/src/ufo_exp.wav',1);
					}
				} else {
					var dx = projectiles[s].px - ufos[uf].center.x;
					var dy = projectiles[s].py - ufos[uf].center.y;
					var dist = Math.sqrt(dx*dx + dy*dy);
					if (dist < 25) {
						ufos[uf].toUpdate = false;
						player.score += 20;
						projectiles[s].toUpdate = false;
						soundPlay('Asteroids/src/ufo_exp.wav',1);
					}
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
		if (dist < player.radius + pickups[pu].radius) {
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