function movingBlock(x,y,block) {
	this.x = x;
	this.y = y;
	this.block = new block;
	this.blocks = [];
	this.canMoveRight = true;
	this.canMoveLeft = true;
	this.moveDown = true;
	this.calcBlocks = []; //array in which blocks are put to check if there is a collision

	for (let i = 0; i < this.block.positions.length; i++) {
		if (this.block.positions[i].x == this.block.P.x && this.block.positions[i].y == this.block.P.y) {
			this.blocks.push(new blockObj(this.block.positions[i].x + this.x, this.block.positions[i].y + this.y,"#fff")); //change color to highlight rotating block
		} else {
			this.blocks.push(new blockObj(this.block.positions[i].x + this.x, this.block.positions[i].y + this.y,"#fff"));
		}
		
	}
	this.update = function() {
		if (!tetrisGame.gameOver) {
			for (let i = 0; i < this.blocks.length; i++) {
				this.blocks[i].update();
			}
			if (!tetrisGame.backgroundGame) {
				if (move.up) {
					for (i = 0; i < this.blocks.length; i++) {
						// console.log(this.blocks[i].x, this.blocks[i].y);
					}
					this.rotate();
				}
				if (move.right && this.canMoveRight) {
					this.x += blockWidth; //change base position (relative offset)
					for (let i = 0; i < this.blocks.length; i++) { //change block positions
						this.blocks[i].x += blockWidth;
					}
				}
				if (move.left && this.canMoveLeft) {
					this.x -= blockWidth; //change base position (relative offset)
					for (let i = 0; i < this.blocks.length; i++) { //change block positions
						this.blocks[i].x -= blockWidth;
					}
				}
			}
		}
	}
	// console.log(this.block);
	this.rotate = function() {
		this.blockCheck = [];
		this.newVectors = [];
		this.calcBlocks = [];
		for (let i = 0; i < this.block.positions.length; i++) {
			this.V = new vector(this.blocks[i].y - this.y,this.blocks[i].x - this.x); //calculate vector from postion 0,0 to the block's position
			this.Vr = new vector(this.V.y - this.block.P.y, this.V.x - this.block.P.x); //calculate the relative vector from the rotation block and the block which gets rotated
			this.Vt = new vector((0 * this.Vr.y) + (-1 * this.Vr.x), (1 * this.Vr.y) + (0*this.Vr.x)); //calculate the new position by rotating the relative vector 90 degrees
			this.Vn = new vector(this.Vt.y + this.block.P.y, this.Vt.x + this.block.P.x); //add the new relative vector with the rotation vector to calculate absolute postition from postion 0,0
			
			//before updating imediatly, first check if it is possible (so no collisions with static blocks or outside of playable field)
			//first we save the new vectors in an array:
			this.newVectors.push(this.Vn);
		}
		
		//now we calculate the new positions for the blocks using the new vectors calculated
		for (let i = 0; i < this.newVectors.length; i++) {
			this.calcBlocks.push({x: this.newVectors[i].x + this.x, y: this.newVectors[i].y + this.y});
		}
		//here we check if one of the new blocks intersect with a static block, if so, push false to check array.
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			for (let b = 0; b < this.calcBlocks.length; b++) {
				if (tetrisGame.staticBlocks[i].x == this.calcBlocks[b].x && 
					tetrisGame.staticBlocks[i].y == this.calcBlocks[b].y) {
					
					this.blockCheck.push(false);
				} else {
					this.blockCheck.push(true);
				}
			}
		}
		//also calculate if any blocks will be positioned outside of the playable field: (new loop for better memory usage)
		for (let i = 0; i < this.calcBlocks.length; i++) {
			if (this.calcBlocks[i].x < tetrisGame.field.x || this.calcBlocks[i].x > tetrisGame.field.x + tetrisGame.field.width*blockWidth) {
				this.blockCheck.push(false);
			} else {
				this.blockCheck.push(true);
			}
		}
		
		//here we finish up by checking if the array is completely true; aka no blocks intersect.
		if (!(this.blockCheck.includes(false))) { //if thats the case, update the actual block positions :)
			for (let i = 0; i < this.calcBlocks.length; i++) { 
				this.blocks[i].x = this.calcBlocks[i].x;
				this.blocks[i].y = this.calcBlocks[i].y;
			}
		}
	}
}
