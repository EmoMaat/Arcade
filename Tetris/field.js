function grid(x, y, width, height) {
	this.x = x;
	this.y = y
	this.width = width
	this.height = height;
	
	this.update = function() {
		ctx.beginPath();
		ctx.moveTo(this.x - 3, this.y - 3);
		ctx.lineTo(this.x + this.width * blockWidth + 3, this.y);
		ctx.lineTo(this.x + this.width * blockWidth + 3, this.y + this.height * blockWidth + 3);
		ctx.lineTo(this.x - 3, this.y + this.height * blockWidth + 3);
		ctx.lineTo(this.x - 3, this.y);
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#fff";
		ctx.stroke();
	}
}
// tetrisGame.push(new blockObj(shape0.positions[i].x + tetrisGame.field.width/2 + tetrisGame.field.x, shape0.positions[i].y + this.y,"#fff"))


function windowNext(x, y) {
	this.x = x;
	this.y = y;
	this.offsetY = 3*blockWidth;
	this.offsetX = -blockWidth;
	this.blockNumbers = [0,0];
	this.content = [];
	this.blocks = [];
	
	this.update = function() {
		ctx.textAlign = "center";
		ctx.font = "50px segoe ui";
		ctx.fillText("NEXT",this.x + 125,this.y);
		
		ctx.beginPath();
		ctx.moveTo(this.x - 75 + 125, this.y + 25);
		ctx.lineTo(this.x + 75 + 125, this.y + 25);
		ctx.stroke();
		if (this.content.length < 2) {
			this.updateContent();
		}
		
		for (let i = 0; i < this.content.length; i++) { //loop trough the content to get the desired shape
			let shape = eval(this.content[i]);
			let block = new shape;
			
			for (let b = 0 ; b < block.positions.length; b++) { //now loop trough all positions of given shape, and add blocks
				this.blocks.push(new blockObj(block.positions[b].x + this.x + this.offsetX, block.positions[b].y + this.y + this.offsetY,"#fff"));
			}
			this.offsetY += 6*blockWidth;
		}
		this.offsetY = 3*blockWidth;
		ctx.translate(125,0);
		for (let i = 0; i < this.blocks.length; i++) { //loop trough blocks and draw them:
			this.blocks[i].update();
		}
	}
	
	this.updateContent = function() {
		this.blockNumbers = tetrisGame.nextBlocks;
		this.content = [];
		this.blocks = [];
		for (let i = 0; i < this.blockNumbers.length; i++) {
			let newBlock = "shape" + this.blockNumbers[i].toString();
			this.content.push(newBlock);
		}
	}
}
