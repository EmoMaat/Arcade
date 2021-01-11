function randomNumber(min,max) {
    return Math.floor(Math.random() * (max - min) + min);
}
var spacebar = "";
var interval = "";
var asteroids = [];
var projectiles = [];
var ufos = [];
var pickups = [];
var particles = [];
var buttons = [];
var menuAsteroids = [];
var gameRunning = false;
var ufo_timer = 0;
var lifes = [new playerLifeObj(30),new playerLifeObj(80),new playerLifeObj(130)];
var asteroidamount = 2;
var asteroidcount = asteroidamount;
function playerLifeObj(x) {
	this.x = x;
	this.radius = 25;
	this.y = 0 + 1.2 * this.radius;
	this.sides = 3;
	this.angle = (2*Math.PI) / this.sides;
	this.active = true;
	this.draw = function() {
		if (this.active) {
			ctx.beginPath();
			for (i = 0; i < this.sides; i++) {
				this.newX = this.x - this.radius * Math.cos(this.angle*i + 33);
				this.newY = this.y - this.radius * Math.sin(this.angle*i + 33);
				ctx.lineTo(this.newX,this.newY);
			}
			ctx.closePath();
			ctx.fillStyle = "#000";
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "#FFF";
			ctx.stroke();
		}
	}
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

function soundPlay(src,volume) {
	this.sound = new Audio();
	this.sound.src = src;
	this.sound.volume = volume;
	this.sound.play();
}

function setThrustVolume() {
	if (map[38] && player.thrustVolume < 1) {
		player.thrustVolume += 0.1;
	}
	if (!map[38] && player.thrustVolume > 0) {
		player.thrustVolume -= 0.1;
		if (player.thrustVolume < 0.15) {
			player.thrustVolume = 0;
		} 
	}
}

function randomNumber(min,max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomNegative(number) {
	if (randomNumber(1,3) == 2) {
		return -number;
	} else {
		return number;
	}
}