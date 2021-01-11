var backgroundC = document.getElementById("backgroundC");
var backgroundCtx = backgroundC.getContext("2d");
var planetC = document.getElementById("planetC");
var planetCtx = planetC.getContext("2d");

var mouse = {x:0,y:0,click:false,scrl:0};

var interval = setInterval(triggerLoop,20);

function triggerLoop() {
	game.update();
}

//functions, classes etc.

function perlinNoise(size,inc,seed) {
	this.size = size;
	this.inc = inc;
	this.seed = seed || Math.random() * 10;
	var yoff = 0;
	var noise = new Perlin(this.seed);
	this.pixels = planetCtx.getImageData(0,0,this.size,this.size);
	for (var y = 0; y < this.pixels.height; y++) {
		var xoff = 0;
		for (var x = 0; x < this.pixels.width; x++) {
			var index = (x + y * this.pixels.width) * 4;
			var r = noise.noise(xoff,yoff,0) * 255;
			this.pixels.data[index+0] = r;
			this.pixels.data[index+1] = r;
			this.pixels.data[index+2] = r;
			this.pixels.data[index+3] = 255;
			xoff += this.inc;
		}
		yoff += this.inc;
	}
	//for drawing:
	// planetCtx.putImageData(this.pixels,0,0);
	
	return this.pixels;
}

function noise(table,xoff,yoff) {
	var table = table;
	var xoff = xoff;
	var yoff = yoff;
	for (let x = 0; x < table.width; x++) {
		for (let y = 0; y < table.height; y++) {
			if (Math.floor(xoff) == x && Math.floor(yoff) == y) {
				return (x + y * table.width) * 4;
			}
		}
	}
	
	return 0;
}

function fixPos(x,y) {
	var x = x;
	var y = y;
	console.log(mouse.x,mouse.y);
	for (let i = 0; i < game.planets.length; i++) {
		
	}
}

class offsetPoint {
	constructor(value,drawOffset) {
		this.value = value;
		this.drawOffset = drawOffset;
	}
}

class vector {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	getLength() {
		let length = Math.sqrt(this.x*this.x + this.y*this.y);
		return length;
	}
	getDirection() {
		let phi = Math.atan2(y,x);
		return phi;
	}
}



//event listeners
window.addEventListener('wheel',function(e) {
	if (e.deltaY < 0) {
		mouse.scrl = 1;
	} else if (e.deltaY > 0) {
		mouse.scrl = -1;
	}
	// fixPos();
});
backgroundC.onmousemove = function(e) { 
    mouse.x = e.pageX; 
    mouse.y = e.pageY; 
}