function blockObj(x,y,color) {
	this.x = x;
	this.y = y;
	this.xMax = this.x + blockWidth;
	this.yMax = this.y + blockWidth;
	this.color = color;
	this.toUpdate = true;
	
	this.update = function() {
		if (this.toUpdate) {
			this.xMax = this.x + blockWidth;
			this.yMax = this.y + blockWidth;
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y , blockWidth, blockWidth);
			ctx.lineWidth = 3;
			ctx.strokeStyle = "#000";
			ctx.strokeRect(this.x, this.y , blockWidth, blockWidth);
		}
	}
}

function shape0() { // I shape
	this.positions = [
		{y: 0*blockWidth, x: 0*blockWidth},
		{y: 1*blockWidth, x: 0*blockWidth},
		{y: 2*blockWidth, x: 0*blockWidth},
		{y: 3*blockWidth, x: 0*blockWidth}
	];
	this.P = {y: this.positions[1].y, x: this.positions[1].x};
}

function shape1() { //o shape
	this.positions = [
		{y: 0*blockWidth, x: 0*blockWidth},
		{y: 1*blockWidth, x: 0*blockWidth},
		{y: 0*blockWidth, x: 1*blockWidth},
		{y: 1*blockWidth, x: 1*blockWidth},
	];
	this.P = {y: (this.positions[0].y + this.positions[1].y)/2, x: (this.positions[0].x + this.positions[2].x)/2}; //take the center x and y for the whole cube, so the cube rotates around it's own center
}

function shape2() { //s shape
	this.positions = [
		{y: 0*blockWidth, x: 1*blockWidth},
		{y: 0*blockWidth, x: 2*blockWidth},
		{y: 1*blockWidth, x: 0*blockWidth},
		{y: 1*blockWidth, x: 1*blockWidth}
	];
	this.P = {y: this.positions[0].y, x: this.positions[0].x};
}

function shape3() {
	this.positions = [
		{y: 0*blockWidth, x: 0*blockWidth},
		{y: 0*blockWidth, x: 1*blockWidth},
		{y: 1*blockWidth, x: 1*blockWidth},
		{y: 1*blockWidth, x: 2*blockWidth}
	];
	this.P = {y: this.positions[2].y, x: this.positions[2].x};
}

function shape4() {
	this.positions = [
		{y: 0*blockWidth, x: 0*blockWidth},
		{y: 1*blockWidth, x: 0*blockWidth},
		{y: 2*blockWidth, x: 0*blockWidth},
		{y: 2*blockWidth, x: 1*blockWidth}
	];
	this.P = {y: this.positions[1].y, x: this.positions[1].x};
}

function shape5() {
	this.positions = [
		{y: 0*blockWidth, x: 1*blockWidth},
		{y: 1*blockWidth, x: 1*blockWidth},
		{y: 2*blockWidth, x: 1*blockWidth},
		{y: 2*blockWidth, x: 0*blockWidth}
	];
	this.P = {y: this.positions[1].y, x: this.positions[1].x};
}

function shape6() {
	this.positions = [
		{y: 1*blockWidth, x: 0*blockWidth},
		{y: 1*blockWidth, x: 1*blockWidth},
		{y: 1*blockWidth, x: 2*blockWidth},
		{y: 0*blockWidth, x: 1*blockWidth}
	];
	this.P = {y: this.positions[1].y, x: this.positions[1].x};
}