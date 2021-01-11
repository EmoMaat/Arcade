class defenderBackground {
	constructor(size) {
		this.size = size;
		this.map0 = [];
		this.map1 = [];
		this.increment = 40;
		this.slope = -30;
		this.mountainSize = Math.random() * 5 + 1;
		this.groundHeight = canvas.height - 150;
		this.maxMountainSpacing = 300;
	}
	generate() {
		for (let i = 0 ; i < 40; i++) {
			if (i == 0) { //generate first mountain
				this.map0.push(new mountain(Math.random()*200, this.mountainSize, this.slope, this.increment, this.groundHeight));
			} else {
				this.map0.push(new mountain(this.map0[i-1].mountainEnd + (Math.random()*this.maxMountainSpacing), this.mountainSize, this.slope, this.increment, this.groundHeight))
			}
			this.mountainSize = Math.random() * 5 + 1;
		}
		this.mapSize = this.map0[this.map0.length - 1].mountainEnd;
		//move the map to middle
		for (let i = 0; i < this.map0.length; i++) {
			this.map0[i].mountainStart -= this.mapSize/2;
			this.map0[i].mountainTopX -= this.mapSize/2;
			this.map0[i].mountainEnd -= this.mapSize/2;
		}
	}
	draw() {
		ctx.beginPath();
		ctx.moveTo(0,this.groundHeight);
		for (let i = 0; i < this.map0.length - 1; i++) {
				ctx.lineTo(this.map0[i].mountainStart,this.groundHeight + this.map0[i].inequalities.startY);
				ctx.lineTo(this.map0[i].mountainTopX,this.map0[i].mountainTopY);
				ctx.lineTo(this.map0[i].mountainEnd,this.map0[i].groundHeight + this.map0[i].inequalities.endY);
				ctx.stroke();
		}
	}
	moveMap() {
		for (let i = 0; i < this.map0.length; i++) {
			this.map0[i].mountainStart -= defenderGame.cameraOffset;
			this.map0[i].mountainTopX -= defenderGame.cameraOffset;
			this.map0[i].mountainEnd -= defenderGame.cameraOffset;
		}
	}
}

class mountain {
	constructor(x,mountainSize,slope,increment,groundHeight) {
		this.mountainSize = mountainSize;
		this.slope = slope;
		this.increment = increment;
		this.groundHeight = groundHeight;
		this.mountainStart = x;
		this.mountainTopY = (this.mountainSize * this.slope) + this.groundHeight;
		this.mountainTopX = (this.mountainSize * this.increment) + this.mountainStart;
		this.mountainEnd = (2 * (this.mountainSize * this.increment) + this.mountainStart);
		this.inequaliySize = this.mountainSize * 10;
		this.inequalities = {
			startY: (Math.random() * this.inequaliySize) - (this.inequaliySize/2),
			endY: (Math.random() * this.inequaliySize) - (this.inequaliySize/2)
		};
	}
}
