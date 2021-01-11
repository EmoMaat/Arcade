function SnakeObj(x,y) {
	this.x = x;
	this.y = y;
	this.body = [];
	this.length = 3;
	this.dir = 0;
	this.moveCount = 0;
	this.changeDir = [];
	
	this.update = function() {
		this.previousX = this.x;
		this.previousY = this.y;
		if (!snakeGame.gameOver) 
			this.handleMovement();
		
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x,this.y,snakeWidth - 5,snakeHeight - 5);
		for (let i = 0; i < this.body.length; i++) {
			this.body[i].draw();
		}
	}
	
	this.handleMovement = function() {
		if (this.moveCount < 6) {
			this.moveCount++;
		} else {
			if (!(this.body.length < this.length - 1)) //splice if there are too many bodyParts:
				this.body.splice(0, 1);
			
			//always add a new bodyPart to the body:
			this.body.push(new bodyPart(this.previousX, this.previousY));
			
			//move
			if (this.dir == 0) {
				this.x += snakeWidth;
			} else if (this.dir == 1) {
				this.y += snakeHeight;
			} else if (this.dir == 2) {
				this.x -= snakeWidth;
			} else if (this.dir == 3) {
				this.y -= snakeHeight;
			}
			this.moveCount = 0;
			if (this.changeDir) {
				this.changeDir = false;
			}
		}
		if (map.Button1&& this.dir != 2 && !this.changeDir) {
			this.changeDir = true;
			this.dir = 0;
		}
			
		
		if (map.Button0 && this.dir != 3 && !this.changeDir){
			this.changeDir = true;
			this.dir = 1;
		}
			
		
		if (map.Button2 && this.dir != 0 && !this.changeDir) {
			this.changeDir = true;
			this.dir = 2;
		}
			
		
		if (map.Button3 && this.dir != 1 && !this.changeDir) {
			this.changeDir = true;
			this.dir = 3;
		}
	}
}

function bodyPart(x,y) {
	this.x = x;
	this.y = y;
	this.draw = function() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x,this.y,snakeWidth - 5,snakeHeight - 5);
	}
}