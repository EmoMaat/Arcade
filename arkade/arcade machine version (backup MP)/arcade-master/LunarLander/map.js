class terrainMap {
	constructor() {
		this.map = []; //map holds all undisplaced points of the map
		this.dmap = []; //holds all displaced points of the map
		
		this.map2 = [];
		this.dmap2 = [];
		
		this.fullmap = []; //holds all points
		
		this.landingSpots2x = [];
		this.landingSpots4x = [];
		this.landingSpots5x = [];
		this.zoom = 1; //zoom level
		
		this.stars = [];
		
		this.jitter = 2;
		this.max = 70;
		this.startY = canvas.height - 250;
		this.numPoints = 1000;
		this.stepX = 80;
		this.roughness = 10;
		this.previousY = 800;
		
		this.offsetX = 0;
		this.offsetY = 0;
	}
	
	generate() {
		this.map = [];
		this.dmap = [];
		this.map2 = [];
		this.dmap2 = [];
		this.previousY = 800;
		for (let i = 0; i < this.numPoints; i++) {
			//create a random peak sometimes for a mountain or a crater:
			if (Math.random() > 0.7) {
				this.jitter = 3.5;
			} else {
				this.jitter = 1;
			}
			if (Math.random() > 0.5) {
				this.map.push(new point(i*this.stepX, this.previousY - this.max*Math.random() * this.jitter));
			} else {
				this.map.push(new point(i*this.stepX, this.previousY +  this.max*Math.random() * this.jitter));
			}
			
			//check landingSpots:
			this.previousY = this.map[i].y;
		}
		
		this.getmidPoints();
		
		//combine both maps into one:
		for (let i = 0; i < this.map.length; i++) {
			this.map2.push(this.map[i]);
			this.map2.push(this.dmap[i]);
		}
		//last one is undefined, so delete it
		this.map2.splice(1999,1);
		
		this.getmidPoints2();
		
		for (let i = 0; i < this.map2.length; i++) {
			this.fullmap.push(this.map2[i]);
			this.fullmap.push(this.dmap2[i]);
		}
		this.fullmap.splice(this.fullmap.length - 1,1);
		
		//generate landing spots:
		for (let i = 0; i < this.fullmap.length; i++) {
			if (i >= 2) {
				let rc = Math.abs((this.fullmap[i].y - this.fullmap[i - 1].y) / (this.fullmap[i].x - this.fullmap[i - 1].x));
				if (rc < 0.15) { //0.1 is the threshold for the maximum 'steepness' of the ridge to be concidered safe for landing
					let rc2 = Math.abs((this.fullmap[i - 1].y - this.fullmap[i - 2].y) / (this.fullmap[i - 1].x - this.fullmap[i - 2].x));
					if (rc2 < 0.15) {
						//if it is nearly steep at all, make the two points the same so it is truly flat.
						this.fullmap[i].y =	this.fullmap[i-2].y;
						this.landingSpots2x.push({
							x1: this.fullmap[i].x,
							y1: this.fullmap[i].y,
							x2: this.fullmap[i-2].x,
							y2: this.fullmap[i-2].y
						});
						this.fullmap.splice(i-1,1);
					}
				}
			}
		}
		for (let i = 1; i < this.fullmap.length; i++) {
			if (Math.random() > 0.95 && i < this.fullmap.length - 1) { //create a random landing spot sometimes
				if (this.fullmap[i].x - this.fullmap[i- 1].x > 17) {
					this.fullmap.splice(i, 0, new point(this.fullmap[i].x - Math.random()*10,this.fullmap[i - 1].y));
					let length = this.fullmap[i].x - this.fullmap[i-1].x;
					if (length > 17) {
						if (length < 22) {
							this.landingSpots5x.push({
								x1: this.fullmap[i].x,
								y1: this.fullmap[i].y,
								x2: this.fullmap[i-1].x,
								y2: this.fullmap[i-1].y
							});
						} else {
							this.landingSpots4x.push({
								x1: this.fullmap[i].x,
								y1: this.fullmap[i].y,
								x2: this.fullmap[i-1].x,
								y2: this.fullmap[i-1].y
							});
						}
					}
				}
			}
		}
		//move the map so that the player spawns somewhere around the middle
		this.movePoints(-20000,0);
		
		//generate stars:
		for (let i = 0; i < 10000; i++) {
			this.stars.push(new star(Math.random()*80000 - 20000,Math.random()*10000 - 5000,Math.random() * 2));
		}
	}
	
	render() {
		this.fixOffset();
		
		//draw stars:
		for (let i = 0; i < this.stars.length; i++) {
			this.stars[i].draw();
		}
		
		//draw the moon:
		
		//first filter the points which are near the screen (we dont need to draw the entire map the whole time)
		for (let i = 0; i < this.fullmap.length; i++) {
			if (this.fullmap[i].x < 0 && this.fullmap[i].x > -200) {
				this.renderMin = i;
			}
			if (this.fullmap[i].x > canvas.width && this.fullmap[i].x < canvas.width + 200) {
				this.renderMax = i;
			}
		}
		
		
		ctx.beginPath();
		ctx.moveTo(this.fullmap[this.renderMin].x,this.fullmap[this.renderMin].y);
		for (let i = this.renderMin; i < this.renderMax; i++) {
			ctx.lineTo(this.fullmap[i].x, this.fullmap[i].y);			
		}
		ctx.lineTo(canvas.width,canvas.height + 10);
		ctx.lineTo(0,canvas.height + 10);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#fff";
		ctx.stroke();
		ctx.fillStyle = "#000";
		ctx.fill();
		
		//draw landing spots:
		ctx.fillStyle = "#fff";
		for (let i = 0; i < this.landingSpots2x.length; i++) {
			ctx.textAlign = "center";
			if (this.landingSpots2x[i].y1 > canvas.height - 50) {
				let dx = lunarLanderGame.lander.x - (0.5*(this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2));
				let dy = lunarLanderGame.lander.y - this.landingSpots2x[i].y1;
				let dist = Math.floor(Math.sqrt(dx*dx + dy*dy) / lunarLanderGame.zoom);
				ctx.font = "20px segoe ui";
				ctx.fillText("2X",(this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2 ,canvas.height - 25);
				ctx.font = "13px segoe ui";
				ctx.fillText("("+dist+")",(this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2 ,canvas.height - 48);
				ctx.beginPath();
				ctx.moveTo((this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2 - 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2 + 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2, canvas.height - 10);
				ctx.fill();
			} else {
				ctx.font = "20px segoe ui";
				ctx.fillText("2X",(this.landingSpots2x[i].x1 + this.landingSpots2x[i].x2)/2 ,this.landingSpots2x[i].y1 + 25);
			}
			
		}
		
		for (let i = 0; i < this.landingSpots5x.length; i++) {
			ctx.font = "20px segoe ui";
			ctx.textAlign = "center";
			if (this.landingSpots5x[i].y1 > canvas.height - 50) {
				ctx.textAlign = "center";
				let dx = lunarLanderGame.lander.x - (0.5*(this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2));
				let dy = lunarLanderGame.lander.y - this.landingSpots5x[i].y1;
				let dist = Math.floor(Math.sqrt(dx*dx + dy*dy) / lunarLanderGame.zoom);
				ctx.font = "20px segoe ui";
				ctx.fillText("5X",(this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2 ,canvas.height - 25);
				ctx.font = "13px segoe ui";
				ctx.fillText("("+dist+")",(this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2 ,canvas.height - 48);
				ctx.beginPath();
				ctx.moveTo((this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2 - 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2 + 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2, canvas.height - 10);
				ctx.fill();
			} else {
				ctx.font = "20px segoe ui";
				ctx.fillText("5X",(this.landingSpots5x[i].x1 + this.landingSpots5x[i].x2)/2 ,this.landingSpots5x[i].y1 + 25);
			}
			
			
		
		}
		
		for (let i = 0; i < this.landingSpots4x.length; i++) {
			ctx.font = "20px segoe ui";
			ctx.textAlign = "center";
			if (this.landingSpots4x[i].y1 > canvas.height - 50) {
				ctx.textAlign = "center";
				let dx = lunarLanderGame.lander.x - (0.5*(this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2));
				let dy = lunarLanderGame.lander.y - this.landingSpots4x[i].y1;
				let dist = Math.floor(Math.sqrt(dx*dx + dy*dy) / lunarLanderGame.zoom);
				ctx.font = "20px segoe ui";
				ctx.fillText("4X",(this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2 ,canvas.height - 25);
				ctx.font = "13px segoe ui";
				ctx.fillText("("+dist+")",(this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2 ,canvas.height - 48);
				ctx.beginPath();
				ctx.moveTo((this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2 - 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2 + 10, canvas.height - 20);
				ctx.lineTo((this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2, canvas.height - 10);
				ctx.fill();
			} else {
				ctx.font = "20px segoe ui";
				ctx.fillText("4X",(this.landingSpots4x[i].x1 + this.landingSpots4x[i].x2)/2 ,this.landingSpots4x[i].y1 + 25);
			}
		}
	}
	
	fixOffset() {
		//apply offset:
		for (let i = 0; i < this.fullmap.length; i++) {
			this.fullmap[i].x += this.offsetX;
			this.fullmap[i].y += this.offsetY;
		}
		
		for (let i = 0; i < this.landingSpots2x.length; i++) {
			this.landingSpots2x[i].x1 += this.offsetX;
			this.landingSpots2x[i].x2 += this.offsetX;
			
			this.landingSpots2x[i].y1 += this.offsetY;
			this.landingSpots2x[i].y2 += this.offsetY;
		}
		
		for (let i = 0; i < this.landingSpots4x.length; i++) {
			this.landingSpots4x[i].x1 += this.offsetX;
			this.landingSpots4x[i].x2 += this.offsetX;
			
			this.landingSpots4x[i].y1 += this.offsetY;
			this.landingSpots4x[i].y2 += this.offsetY;
		}
		
		for (let i = 0; i < this.landingSpots5x.length; i++) {
			this.landingSpots5x[i].x1 += this.offsetX;
			this.landingSpots5x[i].x2 += this.offsetX;
			
			this.landingSpots5x[i].y1 += this.offsetY;
			this.landingSpots5x[i].y2 += this.offsetY;
		}
		
		
		for (let i = 0; i < this.stars.length; i++) {
			this.stars[i].x += 0.45*this.offsetX;
			this.stars[i].y += 0.45*this.offsetY;
		}
		
		lunarLanderGame.lander.x += this.offsetX;
		lunarLanderGame.lander.y += this.offsetY;
	}
	
	zoomIn(px,py,zoomlvl) {
		let x = px;
		let y = py;
		let zoom = zoomlvl;
		for (let i = 0; i < this.fullmap.length - 1; i++) {
			this.fullmap[i].x *= zoom;
			this.fullmap[i].y *= zoom;
		}
		for (let i = 0; i < this.landingSpots2x.length; i++) {
				this.landingSpots2x[i].x1 *= zoom;
				this.landingSpots2x[i].x2 *= zoom;
				this.landingSpots2x[i].y1 *= zoom;
				this.landingSpots2x[i].y2 *= zoom;
			}
		for (let i = 0; i < this.landingSpots5x.length; i++) {
			this.landingSpots5x[i].x1 *= zoom;
			this.landingSpots5x[i].x2 *= zoom;
			this.landingSpots5x[i].y1 *= zoom;
			this.landingSpots5x[i].y2 *= zoom;
		}
		for (let i = 0; i < this.landingSpots4x.length; i++) {
			this.landingSpots4x[i].x1 *= zoom;
			this.landingSpots4x[i].x2 *= zoom;
			this.landingSpots4x[i].y1 *= zoom;
			this.landingSpots4x[i].y2 *= zoom;
		}
		
		for (let i = 0; i < this.stars.length; i++) {
			this.stars[i].x *= zoom;
			this.stars[i].y *= zoom;
		}
		lunarLanderGame.g *= zoom;
		
		this.offsetY = -lunarLanderGame.lander.y*zoom + 200; //150 = zooming altitude/distance
		this.offsetX = -lunarLanderGame.lander.x*zoom + canvas.width/2;
		
		lunarLanderGame.lander.x *= zoom;
		lunarLanderGame.lander.y *= zoom;
		
		lunarLanderGame.lander.throttle *= zoom;
		lunarLanderGame.lander.thrust *= zoom;
		lunarLanderGame.lander.maxThrust *= zoom;
		
		//zooming out makes you go too fast, so only apply to zooming in
		if (zoom > 1) {
			lunarLanderGame.lander.velX *= zoom;
			lunarLanderGame.lander.velY *= zoom;
		}
	}
	
	movePoints(px,py) {
		let x = px;
		let y = py;
		for (let i = 0; i < this.fullmap.length - 1; i++) {
			this.fullmap[i].x += x;
			this.fullmap[i].y += y;
		}
		for (let i = 0; i < this.landingSpots2x.length; i++) {
				this.landingSpots2x[i].x1 += x;
				this.landingSpots2x[i].x2 += x;
				this.landingSpots2x[i].y1 += y;
				this.landingSpots2x[i].y2 += y;
			}
		for (let i = 0; i < this.landingSpots5x.length; i++) {
			this.landingSpots5x[i].x1 += x;
			this.landingSpots5x[i].x2 += x;
			this.landingSpots5x[i].y1 += y;
			this.landingSpots5x[i].y2 += y;
		}
		for (let i = 0; i < this.landingSpots4x.length; i++) {
			this.landingSpots4x[i].x1 += x;
			this.landingSpots4x[i].x2 += x;
			this.landingSpots4x[i].y1 += y;
			this.landingSpots4x[i].y2 += y;
		}
	}
	
	getmidPoints() {
		for (let i = 0; i < this.map.length - 1; i++) {
			let p1 = this.map[i];
			let p2 = this.map[i+1];
			let d = {
				x: (p1.x + p2.x) / 2,
				y: (p1.y + p2.y) / 2
			};
			if (Math.random() > 0.5) {
				d.x += Math.random()*this.roughness * -1;
			}  else {
				d.x += Math.random()*this.roughness;
			}
			if (Math.random() > 0.5) {
				d.y += Math.random()*this.roughness * -1;
			}  else {
				d.y += Math.random()*this.roughness;
			}
 			this.dmap.splice(i ,0,d);
		}
	}
	
	getmidPoints2() {
		for (let i = 0; i < this.map2.length - 1; i++) {
			let p1 = this.map2[i];
			let p2 = this.map2[i+1];
			let d = {
				x: (p1.x + p2.x) / 2,
				y: (p1.y + p2.y) / 2
			};
			if (Math.random() > 0.5) {
				d.x += Math.random()*this.roughness * -1;
			}  else {
				d.x += Math.random()*this.roughness;
			}
			if (Math.random() > 0.5) {
				d.y += Math.random()*this.roughness * -1;
			}  else {
				d.y += Math.random()*this.roughness;
			}
 			this.dmap2.splice(i ,0,d);
		}
	}
}

class point {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}

class star {
	constructor(x,y,size) {
		this.x = x;
		this.y = y;
		this.size = size;
	}
	draw() {
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
		ctx.fillStyle = "#fff";
		ctx.fill();
	}
}