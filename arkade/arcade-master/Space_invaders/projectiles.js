class laserProjectile {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	update() {
		this.y -= 5;
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x,this.y + 25);
		ctx.closePath();
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}