class asteroid {
	constructor(x,y,rad,speed,splitLvl) {
		this.x = x;
		this.y = y;
		this.radians = rad;
		this.speed = speed;
		this.splitLvl = splitLvl;
		this.radius = 20 + 15*this.splitLvl;
		this.rotate = 0;
		this.rotation = 0.01 + Math.random() * 0.04;//Math.random() / 25 + 0.001;
		
		this.size = 5 + this.splitLvl*2.5;
		this.points = [];
		this.sides = Math.floor(Math.random() * 8) + 12;
		for (let i = 0; i < this.sides; i++) {
			this.points.push(randomFloat(this.radius - this.size,this.radius + this.size));
		}
		this.angle = 2*Math.PI / this.sides;
		
		this.del = false;
	}
	update() {
		this.handleMovement();
		this.draw();
	}
	handleMovement() {
		this.velX = this.speed * Math.cos(this.radians);
		this.velY = this.speed * Math.sin(this.radians);
		this.x += this.velX;
		this.y += this.velY;
		
		this.rotate += this.rotation;
		
		if (this.x - this.radius > canvas.width) {
			this.x = 0;
		}
		if (this.x + this.radius < 0) {
			this.x = canvas.width;
		}
		if (this.y - this.radius > canvas.height) {
			this.y = 0;
		}
		if (this.y + this.radius < 0) {
			this.y = canvas.height;
		}
	}
	split() {
		if (this.splitLvl > 0) {
			asteroidsGame.asteroids.push(new asteroid(this.x,this.y,this.radians + 0.4,this.speed*1.1,this.splitLvl - 1));
			asteroidsGame.asteroids.push(new asteroid(this.x,this.y,this.radians - 0.4,this.speed*1.1,this.splitLvl - 1));
		}
		this.random = randomNumber(1,4);
		eval("astExp"+this.random+".currentTime = 0");
		eval("astExp"+this.random+".play()");
		this.del = true;
	}
	draw() {
		ctx.beginPath();
		for (let i = 0; i < this.points.length; i++) {
			this.newPosX = this.x + this.points[i] * Math.cos(this.angle*i+this.rotate);
			this.newPosY = this.y + this.points[i] * Math.sin(this.angle*i+this.rotate);
			ctx.lineTo(this.newPosX,this.newPosY);
		}
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.closePath();
		ctx.stroke();
	}
}

function soundPlay(src,volume) {
	this.sound = new Audio();
	this.sound.src = src;
	this.sound.volume = volume;
	this.sound.play();
}
var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
function segment_intersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return {x: x, y: y};
}

function randomNumber(min,max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomFloat(min,max) {
	return Math.random() * (max - min) + min;
}
function randomNegative(number) {
	if (randomNumber(1,3) == 2) {
		return -number;
	} else {
		return number;
	}
}
