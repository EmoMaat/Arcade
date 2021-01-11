class bunkerBlock {
	constructor(x,y,img,rotate) {
		this.x = x;
		this.y = y;
		this.img = img;
		this.rotate = rotate;
		this.sy = 0;
	}
	update() {
		this.centerX = this.x + 15;
		this.centerY = this.y + 15;
		if (spaceInvadersGame.projectiles.length != 0) {
			this.dx = this.centerX - spaceInvadersGame.projectiles[0].x;
			this.dy = this.centerY - spaceInvadersGame.projectiles[0].y;
			this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
			if (this.distance < 20 && this.sy < 150) {
				//add 'damage' to bunker block
				this.sy += 30;
				//remove the projectile
				spaceInvadersGame.projectiles.splice(0,1);
			}
		}
		ctx.save();
		if (this.img === bunker_block_slanted) {
			ctx.translate(this.x + 15,this.y + 15);
			ctx.rotate((0.5*Math.PI)*this.rotate);
			ctx.drawImage(this.img,0,this.sy,30,30,-15,-15,30,30);
		} else {
			ctx.drawImage(this.img,0,this.sy,30,30,this.x,this.y,30,30);
		}
		ctx.restore();
	}
}