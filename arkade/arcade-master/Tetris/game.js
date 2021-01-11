function Tetris() {
	if(typeof gameInterval !== "undefined")
	gameInterval.stop();

	if(typeof overlayInterval !== "undefined")
        overlayInterval.stop();
	
	menuOverlay = new MenuOverlay();
	TetrisMainMenuOverlay();
	
	menuOverlay.backgroundGame = new TetrisGame(true);
    menuOverlay.backgroundGame.overlay = true;
	tetrisGame = menuOverlay.backgroundGame;
	
	move.smooth = false;
	
	overlayInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		menuOverlay.update();
	}, 20);
}

function TetrisMainMenuOverlay() {
	menuOverlay.buttons = [
		new Button(53, canvas.height - 170, 423, 30, "START GAME", "newTetrisGame(false)"),
		new Button(53, canvas.height - 90, 423, 30, "HIGH SCORES", "loadHighscores('" + currentGame + "', 0)"),
		new Button(53, canvas.height - 10, 423, 30, "EXIT", "loadHub()")
	];
}

var blockWidth = 53;

function vector(y,x) {
	this.y = y;
	this.x = x;
}

var tetrisGame;

class TetrisGame {
	constructor(backgroundGame) {
		this.backgroundGame = backgroundGame;
		this.gameCounter = 0;
		this.moveDownSpeed = 20;
		this.maxY = 0;
		this.maxLeft = 0;
		this.maxRight = 0;
		this.fullRowY = 0;
		this.staticBlocks = [];
		this.nextBlocks = [randomNumber(0,7),randomNumber(0,7)]; //next blocks to view
		this.field = new grid(canvas.width/2 - 16*blockWidth/2,10,16,20);
		this.firstLoop = true;
		this.testMoveUp = true;
		this.rowCounter = 0;
		this.score = 0;
		this.level = 1;
		this.assignedScore = true;
		this.gameOver = false;
		this.gameOverCounter = 0;
		
		//cheat sheet positions: 
		
		//fieldWidth = 16*blockWidth
		//space between field and screen = canvas.width/2 - 16*blockWidth/2
		
		this.nextWindow = new windowNext(canvas.width/2 - 16*blockWidth/2 + 16*blockWidth + (0.5*(canvas.width/2 - 16*blockWidth/2)),150);
		this.currentBlock = new movingBlock(this.field.width * blockWidth / 2 + this.field.x, this.field.y, randomShape());
	}
	
	spawnPreShapes() {
		spawnShape(shape0,this.field.x + 4*blockWidth, this.field.y + this.field.height*blockWidth - 4*blockWidth);
		spawnShape(shape1,this.field.x + 4*blockWidth, this.field.y + this.field.height*blockWidth - 6*blockWidth);
		// console.log("TESTTT");
	}
	
	newBlock() {
		if (!tetrisGame.gameOver) {
			tetrisGame.score += 10*(tetrisGame.level + 1);
			for (let i = 0; i < tetrisGame.currentBlock.blocks.length; i++) {
				tetrisGame.staticBlocks.push(tetrisGame.currentBlock.blocks[i]);
			}
			let shape = eval(tetrisGame.nextWindow.content[0]); //use eval to get 'shape' the value of the actual object instead of the 'stringed' object
			let testShape = new shape;
			for (let b = 0; b < tetrisGame.staticBlocks.length; b++) {
				for (let i = 0; i < testShape.positions.length; i++) {
					var pos = {
						x: tetrisGame.field.width * blockWidth / 2 + tetrisGame.field.x + testShape.positions[i].x,
						y: tetrisGame.field.y + testShape.positions[i].y
					}
				}
				if (pos.x == tetrisGame.staticBlocks[b].x && pos.y == tetrisGame.staticBlocks[b].y) {
					tetrisGame.gameOver = true;
				}
			}
			
			if (!tetrisGame.backgroundGame) {
				tetrisGame.currentBlock = new movingBlock(tetrisGame.field.width * blockWidth / 2 + tetrisGame.field.x, tetrisGame.field.y, shape); //now pass the shape object
			} else {
				tetrisGame.currentBlock = new movingBlock(Math.floor((Math.random() * 13))*blockWidth + tetrisGame.field.x, tetrisGame.field.y, shape); //now pass the shape object
			}
			
			tetrisGame.nextBlocks.splice(0,1);
			tetrisGame.nextBlocks.push(randomNumber(0,7));
			tetrisGame.nextWindow.updateContent();
		}
	}
	
	update() {
		if (tetrisGame.firstLoop) {
			//spawn blocks pre game: (for testing purposes);
			// tetrisGame.spawnPreShapes();
			
			tetrisGame.firstLoop = false;
		}
		
		// console.log(tetrisGame.nextBlocks);
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) { //clear all rectangles at y = -300
			if (tetrisGame.staticBlocks[i].y == -300) {
				tetrisGame.staticBlocks.splice(i,1);
			}
		}
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		if (!tetrisGame.backgroundGame) {
			ctx.filLStyle = "#fff";
			ctx.font = "50px segoe ui";
			ctx.fillText("SCORE", 0.5*(canvas.width/2 - 16*blockWidth/2),150);
			ctx.beginPath();
			ctx.moveTo(0.5*(canvas.width/2 - 16*blockWidth/2) - 75, 150 + 25);
			ctx.lineTo(0.5*(canvas.width/2 - 16*blockWidth/2) + 75, 150 + 25);
			ctx.strokeStyle = "#fff";
			ctx.stroke();
			ctx.font = "80px segoe ui";
			ctx.fillText(tetrisGame.score, 0.5*(canvas.width/2 - 16*blockWidth/2),300);
		}
		
		tetrisGame.currentBlock.update();
		tetrisGame.field.update();
		tetrisGame.nextWindow.update();
		
		if ((map[40] || map.Button0) && !tetrisGame.backgroundGame) { //not using move because move.smooth is only needed for one key, which is not currently supported.
			tetrisGame.moveDownSpeed = 4;
		} else if (map[32] && !tetrisGame.backgroundGame) {
			tetrisGame.moveDownSpeed = 999999999;
		} else {
			tetrisGame.moveDownSpeed = 20;
		}
		
		if (tetrisGame.gameCounter < tetrisGame.moveDownSpeed) {
			tetrisGame.gameCounter++;
		} else {
			tetrisGame.currentBlock.y += blockWidth;
			if (tetrisGame.currentBlock.moveDown) {
				for (let i = 0; i < tetrisGame.currentBlock.blocks.length; i++) {
					tetrisGame.currentBlock.blocks[i].y += blockWidth;
				}
			} else {
				for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
					for (let b = 0; b < tetrisGame.currentBlock.blocks.length; b++) {
						if ((tetrisGame.staticBlocks[i].x == tetrisGame.currentBlock.blocks[b].x && tetrisGame.staticBlocks[i].y == tetrisGame.currentBlock.blocks[b].yMax) && !tetrisGame.gameOver) {
							tetrisGame.newBlock();
							break;
						} else {
							tetrisGame.currentBlock.moveDown = true;
						}
					}
				}
			}
			tetrisGame.gameCounter = 0;
		}
		
		//check for block with the highest y value and get it's index: (to check if bottom of shape touches bottom of field)
		//also check for left x and right x
		for (let i = 0; i < tetrisGame.currentBlock.blocks.length; i++) {
			if (i == 0) {
				tetrisGame.maxY = 0;
				tetrisGame.maxLeft = 0;
				tetrisGame.maxLeft = 0;
			}
			if (tetrisGame.currentBlock.blocks[i].y > tetrisGame.currentBlock.blocks[tetrisGame.maxY].y) {
				tetrisGame.maxY = i;
			}
			if (tetrisGame.currentBlock.blocks[i].x < tetrisGame.currentBlock.blocks[tetrisGame.maxLeft].x) {
				tetrisGame.maxLeft = i;
			}
			if (tetrisGame.currentBlock.blocks[i].xMax > tetrisGame.currentBlock.blocks[tetrisGame.maxRight].xMax) {
				tetrisGame.maxRight = i;
			}
			// console.log(tetrisGame.currentBlock.blocks[tetrisGame.maxLeft].x);
		}
		
		//if bottom of shape touches a y position, spawn new block
		if (tetrisGame.currentBlock.blocks[tetrisGame.maxY].yMax > (tetrisGame.field.height - 1) * blockWidth + tetrisGame.field.y) { 
			tetrisGame.newBlock();
		}
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			tetrisGame.staticBlocks[i].update();
		}
		
		//check for collision
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			for (let b = 0; b < tetrisGame.currentBlock.blocks.length; b++) {
				if (tetrisGame.staticBlocks[i].x == tetrisGame.currentBlock.blocks[b].x && tetrisGame.staticBlocks[i].y == tetrisGame.currentBlock.blocks[b].yMax) {
					// tetrisGame.newBlock();
					tetrisGame.currentBlock.moveDown = false;
				}
			}
		}
		
		// check if block touches a side of the field and if there is a block to it's right
		var checkRight = [];
		var checkLeft = [];
		var testCheck = [];
		var passed = [];
		
		//check for every block in the moving shaoe if it is touching a static block, left or right.
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			for (let b = 0; b < tetrisGame.currentBlock.blocks.length; b++) {
				if (tetrisGame.staticBlocks[i].x == tetrisGame.currentBlock.blocks[b].x - blockWidth && //x - blockwidth checks for block left to pos
					tetrisGame.staticBlocks[i].y == tetrisGame.currentBlock.blocks[b].y) {				//y
					checkLeft.push(false);
				} else {
					checkLeft.push(true);
				}
				
				if (tetrisGame.staticBlocks[i].x == tetrisGame.currentBlock.blocks[b].x + blockWidth && //x + blockwidth checks for block right to pos
					tetrisGame.staticBlocks[i].y == tetrisGame.currentBlock.blocks[b].y) {				//y
					checkRight.push(false);
				} else {
					checkRight.push(true);
				}
			}
			
		}
		//go trough check array to finalise: (by doing it this way, it can't be set true again after being false)
		//first right:
		if (checkRight.includes(false) || tetrisGame.currentBlock.blocks[tetrisGame.maxRight].xMax >= tetrisGame.field.width * blockWidth + tetrisGame.field.x) {
			tetrisGame.currentBlock.canMoveRight = false;
			checkRight = [];
		} else {
			tetrisGame.currentBlock.canMoveRight = true;
			checkRight = [];
		}
		//then left:
		if (checkLeft.includes(false) || tetrisGame.currentBlock.blocks[tetrisGame.maxLeft].x <= tetrisGame.field.x) {
			tetrisGame.currentBlock.canMoveLeft = false;
			checkLeft = [];
		} else {
			tetrisGame.currentBlock.canMoveLeft = true;
			checkLeft = [];
		}
		
		//check if a line is completed: (by checking if there are [field.width] amount of blocks in the staticBlocks array wich share the same y value)
		for (let y = 0; y < tetrisGame.field.height; y++) { //go through all "y" positions of the field
			this.blockY = y * blockWidth + tetrisGame.field.y;
			this.counter = 0;
			for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
				if (tetrisGame.staticBlocks[i].y == this.blockY) {
					this.counter++;
				}
				if (this.counter == tetrisGame.field.width) {
					tetrisGame.fullRowY = tetrisGame.staticBlocks[i].y;
					tetrisGame.deleteRow();
					tetrisGame.rowCounter++;
					this.counter = 0;
					tetrisGame.assignedScore = false;
				}
			}
		}
		if (!tetrisGame.assignedScore) {
			console.log(tetrisGame.rowCounter);
			tetrisGame.assignScore();
			tetrisGame.assignedScore = true;
		}
		tetrisGame.rowCounter = 0;
		
		if (tetrisGame.gameOver) {
			if (!this.backgroundGame) {
				tetrisGame.gameOverCounter++;
				ctx.textAlign = "center"
				if (tetrisGame.gameOverCounter > 20) {
					ctx.font = "60px segoe ui";
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 5;
					ctx.strokeText("GAME OVER",canvas.width/2,canvas.height/3);
					ctx.fillStyle = "#fff";
					ctx.fillText("GAME OVER",canvas.width/2,canvas.height/3);
					
				}
				if (tetrisGame.gameOverCounter > 65) {
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 5;
					ctx.strokeText("YOUR SCORE: " + tetrisGame.score,canvas.width/2 - 3.5,canvas.height/3*2 - 3.5);
					ctx.fillText("YOUR SCORE: " + tetrisGame.score,canvas.width/2 - 3.5,canvas.height/3*2 - 3.5);
				}
				if (tetrisGame.gameOverCounter > 170) {
					loadHighscores(currentGame,tetrisGame.score);
				}
			} else {
				tetrisGame.gameOverCounter++;
				if (tetrisGame.gameOverCounter > 100) {
					tetrisGame = new TetrisGame(true);
				}
			}
		}
	}

	assignScore() {
		if (tetrisGame.staticBlocks.length == 0) {
			tetrisGame.score += 2000*(tetrisGame.level + 1);
		} else {
			switch (tetrisGame.rowCounter) {
				case 1:
					tetrisGame.score += 50*(tetrisGame.level + 1);
					break;
				case 2:
					tetrisGame.score += 150*(tetrisGame.level + 1);
					break;
				case 3:
					tetrisGame.score += 350*(tetrisGame.level + 1);
					break;
				case 4:
					tetrisGame.score += 1000*(tetrisGame.level + 1);
				break;
			}
		}
	}
	
	deleteRow() {
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			if (tetrisGame.staticBlocks[i].y == tetrisGame.fullRowY) {
				tetrisGame.staticBlocks[i].toUpdate = false;
			}
		}
		// tetrisGame.rowCounter = tetrisGame.rowCounter / tetrisGame.field.width;
		
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) { //moving blocks to another y pos, so they don't interfere (otherwise 2 rows would be deleted)
			if (tetrisGame.staticBlocks[i].toUpdate == false) {
				tetrisGame.staticBlocks[i].y = -300;
			}
		}
		
		for (let i = 0; i < tetrisGame.staticBlocks.length; i++) {
			if (tetrisGame.staticBlocks[i].y < tetrisGame.fullRowY) {
				tetrisGame.staticBlocks[i].y += blockWidth;
			}
		}
		tetrisGame.fullRowY = 0;
	}
}

function spawnShape(shape,x,y) {
	this.x = x;
	this.y = y;
	this.shape = new shape;
	for (let i = 0; i < this.shape.positions.length; i++) {
		tetrisGame.staticBlocks.push(new blockObj(this.shape.positions[i].x + this.x, this.shape.positions[i].y + this.y,"#fff"))
	}
}

function newTetrisGame() { 
	if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
		
	OverlayIsActive = false;
	
	tetrisGame = new TetrisGame();
	
	gameInterval = new Interval(tetrisGame.update,20);
}

function randomShape() {
	this.random = randomNumber(0,7);
	return eval("shape" + this.random);
}