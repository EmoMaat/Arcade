var alienProjectiles = [];
var bunkers = [];
var aliensInRow = [];
var alienSy = 0;
var alienHeight = 51;
var alienDirection = "right";
var alienVertical = 0;
var moveCounter = 0;
var gameSpeed = 120;
var alienMove = 0;
var alienProjectileScale = 1;
var alienProjectileCounter = 0;
var shootCounter = 0;
var newProjectile = {x:0,y:0};
var randomIndex;
var bottomY = 0;
var sound = 1;
var invadersScore = 0;
// alienProjectiles.push(new alienProjectile(1200,500,0));
function spaceLoop() {
	ctx.clearRect(0,0,1920,1080);
	ctx.beginPath();
	ctx.moveTo(0,1080-30);
	ctx.lineTo(1920,1080-30);
	ctx.closePath();
	ctx.stroke();
	if (moveCounter < gameSpeed) {
		moveCounter++;
	} else {
		moveCounter = 0;
		if (alienDirection == "right") {
			alienMove += 17;
		} else if (alienDirection == "left") {
			alienMove -= 17;
		}
		if (alienSy != 0) {
			alienSy -= alienHeight;
		} else {
			alienSy += alienHeight;
		}
		console.log(sound);
		eval("beep"+sound).play();
		eval("beep"+sound-1).currentTime = 0;
		sound++;
		if (sound > 4) {
			sound = 1;
		}
	}
	if (shootCounter < 80) {
		shootCounter++;
	} else {
		shootCounter = 0;
		randomIndex = randomNumber(0,aliens.length)
		newProjectile.x = aliens[randomIndex].x;
		for (let i = 0; i < aliens.length; i++) {
			if (aliens[i].x == newProjectile.x) {
				aliensInRow.push(aliens[i]);
				aliens[i].selected = true;
			}
		}
		for (let i = 0; i < aliensInRow.length; i++) {
			if (bottomY < aliensInRow[i].y) {
				bottomY = aliensInRow[i].y;
			}
		}
		if (Math.random() > 0.7) { //0.7
			alienProjectiles.push(new alienProjectile(newProjectile.x,bottomY,Math.round(Math.random())));
		}
		aliensInRow = [];
		bottomY = 0;
	}
	if (alienProjectileCounter < 20) {
		alienProjectileCounter++;
	} else {
		alienProjectileCounter = 0;
		alienProjectileScale = -alienProjectileScale;
	}
	for (let i = 0; i < aliens.length; i++) {
		aliens[i].update();
		if (aliens[i].x > 1830) {
			if (alienDirection== "right") {
				alienVertical += 35;
			}
			alienDirection = "left"
		}
		if (aliens[i].x < 30) {
			if (alienDirection == "left") {
				alienVertical += 35;
			}
			alienDirection = "right";
		}
	}
	for (let i = 0; i < alienProjectiles.length; i++) {
		alienProjectiles[i].update();
	}
	cannon.update();
	for (let i = 0; i < bunkers.length; i++) {
		bunkers[i].update();
		for (let u = 0; u < alienProjectiles.length; u++) {
			let dx = bunkers[i].centerX - alienProjectiles[u].x;
			let dy = bunkers[i].centerY - alienProjectiles[u].y;
			let distance = Math.sqrt(dx*dx + dy*dy);
			if (distance < 20 && bunkers[i].sy < 150) {
				bunkers[i].sy += 30;
				alienProjectiles.splice(u,1);
				break;
			}
		}
	}
	for (let i = 0; i < alienProjectiles.length; i++) {
		let dx = alienProjectiles[i].x - cannon.centerX;
		let dy = alienProjectiles[i].y - cannon.centerY;
		let distance = Math.sqrt(dx*dx + dy*dy);
		if (distance < cannonImg.width/2 + 5) {
			cannon.lives--;
			cannon.hit = true;
			alienProjectiles.splice(i,1);
			break;
		}
	}
	ctx.font = "50px segoe ui";
	ctx.textAlign = "left";
	ctx.fillText("SCORE   " + invadersScore,200,100);
	ctx.fillText("LIVES",1000,100);
	for (let i = 0; i < cannon.lives; i++) {
		ctx.drawImage(cannonImg,1150 + cannon.livesX,50,cannonImg.width*0.9,cannonImg.height*0.9);
		cannon.livesX += cannonImg.width + 30;
	}
	cannon.livesX = 0;
	if (aliens.length == 0) {
		wave++;
		resetAlienPos();
		spawnAliens();
	}
}

function alienProjectile(x,y,type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.update = function() {
		ctx.save();
		ctx.translate(this.x,this.y);
		if (type == 0) {
			ctx.scale(alienProjectileScale,1);
			ctx.drawImage(projectile1,-projectile1.width/2,0,1.2*projectile1.width,1.2*projectile1.height);
			this.y += 2.5;
		} else {
			ctx.scale(1,alienProjectileScale);
			ctx.drawImage(projectile2,0,-projectile2.height/2 + 5);
			this.y += 2;
		}
		ctx.restore();
	}
}