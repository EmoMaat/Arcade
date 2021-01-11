function spawnMissile(split,pos) {
	this.split = split || false;
	this.pos = pos || "";
	this.foundPos = false;
	// this.target = missileCommandGame.enemyTargets[randomNumber(0,missileCommandGame.enemyTargets.length)];
	this.toSpawn = true;
	this.cityCheckDestroyed = [];
	while (!this.foundPos) {
		this.target = missileCommandGame.enemyTargets[randomNumber(0,missileCommandGame.enemyTargets.length)];
		if (!this.target.destroyed) {
			this.foundPos = true;
		}
		//if all targets are destroyed, loop would get stuck. code down here makes sure it doesnt.
		for (let i = 0; i < missileCommandGame.cities.length; i++) {
			if (!missileCommandGame.cities[i].destroyed) { //check if the city[i] is destroyed or not
				this.cityCheckDestroyed.push(false); //if it isnt, push false
			} else {
				this.cityCheckDestroyed.push(true); //if it is, push true
			}
		}
		if (!this.cityCheckDestroyed.includes(false)) { //if it doesnt include false, it means all cities are destroyed.
			this.foundPos = true; //get out of the while loop
			this.toSpawn = false; //make sure the missile will not spawn
		}
	}
	if (this.toSpawn) {
		//now make the target's position the center of the object:
		if (this.target.targetType == "city") {
			this.tarPos = {
				x: 0.5*(this.target.x + (this.target.x+ 125)),
				y: this.target.y
			};
		} else {
			this.tarPos = {
				x: this.target.x + 15,
				y: this.target.y - 50
			};
		}
		if (this.target != "") {
			if (this.split) {
				missileCommandGame.rockets.push(new missile(this.pos.x,this.pos.y,this.tarPos,missileCommandGame.waveMissileSpeed*missileCommandGame.speedMultiplier,false,this.target));
			} else {
				missileCommandGame.rockets.push(new missile(randomNumber(300,canvas.width - 300),0,this.tarPos,missileCommandGame.waveMissileSpeed*missileCommandGame.speedMultiplier,false,this.target));
			}
		}
	}
	
}
function spawnSmartBomb() {
	this.x = randomNumber(0,canvas.width);
	this.y = 0;
	
	this.foundPos = false;
	this.toSpawn = true;
	this.cityCheckDestroyed = [];
	
	while (!this.foundPos) {
		this.target = missileCommandGame.enemyTargets[randomNumber(0,missileCommandGame.enemyTargets.length)];
		if (!this.target.destroyed) {
			this.foundPos = true;
		}
		//if all targets are destroyed, loop would get stuck. code down here makes sure it doesnt.
		for (let i = 0; i < missileCommandGame.cities.length; i++) {
			// console.log(missileCommandGame.cities[i].destroyed);
			if (!missileCommandGame.cities[i].destroyed) { //check if the city[i] is destroyed or not
				this.cityCheckDestroyed.push(false); //if it isnt, push false
			} else {
				this.cityCheckDestroyed.push(true); //if it is, push true
			}
		}
		if (!this.cityCheckDestroyed.includes(false)) { //if it doesnt include false, it means all cities are destroyed.
			this.foundPos = true; //get out of the while loop
			this.toSpawn = false; //make sure the missile will not spawn
		}
	}
	
	if (this.toSpawn) {
		//now make the target's position the center of the object:
		if (this.target.targetType == "city") {
			this.tarPos = {
				x: 0.5*(this.target.x + (this.target.x+ 125)),
				y: this.target.y
			};
		} else {
			this.tarPos = {
				x: this.target.x + 15,
				y: this.target.y - 50
			};
		}
		if (this.target != "") {
			missileCommandGame.smartBombs.push(new smartBomb(this.x,this.y,this.tarPos,missileCommandGame.speedMultiplier * 1.37,this.target));
		}
	}
}

function spawnPlane() {
	let dir = false;
	let x = 0;
	let y = randomNumber(canvas.height -550, canvas.height - 850);
	if (Math.random() > 0.5) {
		dir = true;
		x = -90;
	} else {
		dir = false;
		x = canvas.width + 90;
	}
	missileCommandGame.planes.push(new plane(x,y,dir));
}

function spawnSatelite() {
	let dir = false;
	let x = 0;
	let y = randomNumber(0, canvas.height -700);
	if (Math.random() > 0.5) {
		dir = true;
		x = -90;
	} else {
		dir = false;
		x = canvas.width + 90;
	}
	missileCommandGame.satelites.push(new satelite(x,y,dir));
}