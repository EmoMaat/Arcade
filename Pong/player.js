class PongPlayer{	
	constructor(userNumber){
		this.type = "Player";
		this.points = 0;
		
		if(userNumber == 1) { 
			this.x = canvas.width / 64; 	// = 30
			this.enemyID = 2;
		} 				
		if(userNumber == 2) { 
			this.x = canvas.width / 1.032258064516129;		// = 1860
			this.enemyID = 1;
		}
		
		this.width = canvas.width / 96; 		// = 20
		this.height = canvas.height / 7.5;	 	// = 180
		
		this.y = canvas.height / 2 - this.height / 2; 	// = 460
		this.center = canvas.height / 2;				// = 540
		this.speed = 0;
	}
	
	updatePaddle(Ball, Players){
		ctx.fillStyle = "#fff";
		
		this.y += this.speed;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.stroke();
		ctx.closePath();
		
		this.center = this.y + this.height / 2;
	}
}