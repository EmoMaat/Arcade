function Tetris(){
    new MenuInterface();

    arcade.menu.object.backgroundGame = new TetrisGame();
    arcade.menu.object.buttons = [
		["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "newTetrisGame()"]
	];
}

function newTetrisGame(){
    exit_open_game();
    exit_open_arcade();

	arcade.game.object = new TetrisGame();

	arcade.game.interval = new Interval(function(){
		arcade.game.object.update();
	}, 15);
}

class TetrisGame{
    constructor(){
        // build the playground
        this.gridcollums = 16;
        this.gridrows = 20;
        this.grid = [];
        for(let r = 0; r < this.gridrows; r++)
            this.grid.push(new Array(this.gridcollums).fill(0))

        this.window_scale = window.height / 1080
        this.blockSize = 40 * this.window_scale;
        this.gameover = false;

        this.initCanvas();

        this.player = new TetrisPlayer();
        this.player.position.x = Math.ceil(this.grid[0].length / 2) - 1;

        // timers (60 = 1 second)
        this.dropTimer = 0;
        this.dropInterval = 60;
        this.dropMinInterval = 14;
        this.gameoverTimer = 240;

        if(!arcade.menu.active){
            // keychecking
            move._left.setEventListener(() => {
                this.player.position.x--;
                if(this.MatrixCollides())
                    this.player.position.x++;
            });
            move._right.setEventListener(() => {
                this.player.position.x++;
                if(this.MatrixCollides())
                    this.player.position.x--;
            });

            move._right.setEventListener(() => {
                this.player.position.x++;
                if(this.MatrixCollides())
                    this.player.position.x--;
            });

            move._down.continuous = true;
            move._down.setEventListener(() => {
                this.dropTimer++;
                if(this.dropTimer >= this.dropMinInterval){
                    this.player.position.y++;
                    this.dropTimer = 0;
                }
            });
        }

        if(!arcade.menu.active){
            this.UpdateQueueCanvas();
            this.UpdateScoreCanvas();
        }
    }

    update(){
        if(!this.gameover){
            if ((gmap[0].buttonA || map[13]) && !arcade.menu.active){
                this.player.RotateMatrix();
                if(this.MatrixCollides())           // if we collide with a wall
                    this.player.RotateMatrix(1);    // rotate back

                map[13] = false;
                gmap[0].buttonA = false;
            }

            this.updateCurrentMatrixPosition();
            if(this.MatrixCollides()){
                // can we place new blocks on the first line without collision?
                if(this.player.position.y === 0)
                    if(!arcade.menu.active)
                        this.gameover = true;
                    else { // if we are in the menu, just clear the grid
                        this.grid = [];
                        for(let r = 0; r < this.gridrows; r++)
                            this.grid.push(new Array(this.gridcollums).fill(0))
                    }

                else {
                    this.MergeMatrixWithGrid();
                    this.player.position.x = Math.floor(this.grid[0].length / 2) - 1;
                    this.player.ShiftQueue();
                    if(!arcade.menu.active)
                        this.UpdateQueueCanvas();
                }
            }
            this.UpdateGridCanvas();
        } else {
            this.gameoverTimer--;
            // game over
            if (this.gameoverTimer > 180) {
                this.ctx.strokeStyle = "black";
                this.ctx.strokeText("GAME OVER", this.canvas.width / 2, this.canvas.height / 3);
                this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 3);
            }
            if(this.gameoverTimer <= 0) {
                new HighScoresInterface(currentGame, this.player.score);
            }
        }
    }

    // creates all required windowes
    initCanvas(){
        let TetrisGameCanvas = document.createElement('canvas');
        TetrisGameCanvas.id = 'TetrisGameCanvas';
        TetrisGameCanvas.width = this.gridcollums * this.blockSize + 4;
        TetrisGameCanvas.height = this.gridrows * this.blockSize + 4;
        TetrisGameCanvas.style.left = (window.width / 2) - TetrisGameCanvas.width / 2;
        TetrisGameCanvas.style.top = (window.height / 6) * 0.5;
        TetrisGameCanvas.style.zIndex = 1;
        TetrisGameCanvas.style.position = "absolute";
        TetrisGameCanvas.style.cursor = "none";
        document.body.appendChild(TetrisGameCanvas);

        this.canvas = document.getElementById("TetrisGameCanvas");		// window stuff
        this.ctx = this.canvas.getContext("2d");			        // window stuff

        this.ctx.strokeStyle = "#ffffff";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 4;
        this.ctx.textAlign = "center";
		this.ctx.font = "100px " + arcade.font;

        if(!arcade.menu.active){
            let TetrisNextCanvas = document.createElement('canvas');
            TetrisNextCanvas.id = 'TetrisNextCanvas';
            TetrisNextCanvas.width = window.width / 8;
            TetrisNextCanvas.height = (window.height / 6) * 4.5;
            TetrisNextCanvas.style.left = (window.width * (3/4)) //+ window.width / 4;
            TetrisNextCanvas.style.top = (window.height / 6) * 0.5;
            TetrisNextCanvas.style.zIndex = 1;
            TetrisNextCanvas.style.position = "absolute";
            TetrisNextCanvas.style.cursor = "none";
            document.body.appendChild(TetrisNextCanvas);

            this.TetrisNextCanvas = document.getElementById("TetrisNextCanvas");		// window stuff
            this.TetrisNextCtx = this.TetrisNextCanvas.getContext("2d");			        // window stuff

            this.TetrisNextCtx.strokeStyle = "#ffffff";
            this.TetrisNextCtx.fillStyle = "white";
            this.TetrisNextCtx.lineWidth = 5;
            this.TetrisNextCtx.font = "50px " + arcade.font;
            this.TetrisNextCtx.textAlign = "center";


            let TetrisScoreCanvas = document.createElement('canvas');
            TetrisScoreCanvas.id = 'TetrisScoreCanvas';
            TetrisScoreCanvas.width = window.width / 8;
            TetrisScoreCanvas.height = (window.height / 6) * 4.5;
            TetrisScoreCanvas.style.left = window.width / 8;
            TetrisScoreCanvas.style.top = (window.height / 6) * 0.5;
            TetrisScoreCanvas.style.zIndex = 1;
            TetrisScoreCanvas.style.position = "absolute";
            TetrisScoreCanvas.style.cursor = "none";
            document.body.appendChild(TetrisScoreCanvas);

            this.TetrisScoreCanvas = document.getElementById("TetrisScoreCanvas");		// window stuff
            this.TetrisScoreCtx = this.TetrisScoreCanvas.getContext("2d");			        // window stuff

            this.TetrisScoreCtx.strokeStyle = "#ffffff";
            this.TetrisScoreCtx.fillStyle = "white";
            this.TetrisScoreCtx.lineWidth = 5;
            this.TetrisScoreCtx.font = "50px " + arcade.font;
            this.TetrisScoreCtx.textAlign = "center";

        }
    }

    UpdateScoreCanvas(){
        this.TetrisScoreCtx.clearRect(0, 0, this.TetrisScoreCanvas.width, this.TetrisScoreCanvas.height);

		this.TetrisScoreCtx.fillText("SCORE",this.TetrisScoreCanvas.width / 2, this.TetrisScoreCanvas.height * 0.1);

		this.TetrisScoreCtx.beginPath();
		this.TetrisScoreCtx.moveTo(this.TetrisScoreCanvas.width - this.TetrisScoreCanvas.width * 0.9, this.TetrisScoreCanvas.height * 0.15);
		this.TetrisScoreCtx.lineTo(this.TetrisScoreCanvas.width * 0.9, this.TetrisScoreCanvas.height * 0.15);
        this.TetrisScoreCtx.stroke();

        this.TetrisScoreCtx.fillText(this.player.score,this.TetrisScoreCanvas.width / 2, this.TetrisScoreCanvas.height * 0.25);


		this.TetrisScoreCtx.fillText("COMBO",this.TetrisScoreCanvas.width / 2, this.TetrisScoreCanvas.height * 0.4);

		this.TetrisScoreCtx.beginPath();
		this.TetrisScoreCtx.moveTo(this.TetrisScoreCanvas.width - this.TetrisScoreCanvas.width * 0.9, this.TetrisScoreCanvas.height * 0.45);
        this.TetrisScoreCtx.lineTo(this.TetrisScoreCanvas.width * 0.9, this.TetrisScoreCanvas.height * 0.45);

        this.TetrisScoreCtx.fillText(this.player.combo,this.TetrisScoreCanvas.width / 2, this.TetrisScoreCanvas.height * 0.55);
        this.TetrisScoreCtx.stroke();
    }

    // draws the queue
    UpdateQueueCanvas(){
        this.TetrisNextCtx.clearRect(0, 0, this.TetrisNextCanvas.width, this.TetrisNextCanvas.height);
		this.TetrisNextCtx.fillText("NEXT",this.TetrisNextCanvas.width / 2, this.TetrisNextCanvas.height * 0.1);

		this.TetrisNextCtx.beginPath();
		this.TetrisNextCtx.moveTo(this.TetrisNextCanvas.width - this.TetrisNextCanvas.width * 0.9, this.TetrisNextCanvas.height * 0.145);
		this.TetrisNextCtx.lineTo(this.TetrisNextCanvas.width * 0.9, this.TetrisNextCanvas.height * 0.145);
        this.TetrisNextCtx.stroke();

        this.player.queue[0].forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0){
                    let positioning = this.player.queue[0].length / 2 % 0 ? -0.5 : 0;
                    this.TetrisNextCtx.fillRect((x + 2 * this.window_scale + positioning) * this.blockSize + 4,
                                      (y + 5) * this.blockSize + 4,
                                      this.blockSize - 4,
                                      this.blockSize - 4
                    );
                }
            });
        });

        this.player.queue[1].forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0){
                    let positioning = this.player.queue[0].length / 2 % 0 ? -0.5 : 0;
                    this.TetrisNextCtx.fillRect((x + 2 * this.window_scale + positioning) * this.blockSize + 4,
                                      (y + 10) * this.blockSize + 4,
                                      this.blockSize - 4,
                                      this.blockSize - 4
                    );
                }
            });
        });
    }

    // used to draw all blocks
    UpdateGridCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeRect(0,0,this.canvas.width,this.canvas.height);

        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0){
                    this.ctx.fillRect(x * this.blockSize + 4,
                                      y * this.blockSize + 4,
                                      this.blockSize - 4,
                                      this.blockSize - 4
                    );
                }
            });
        });
        this.player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0){
                    this.ctx.fillRect((x + this.player.position.x) * this.blockSize + 4,
                                      (y + this.player.position.y) * this.blockSize + 4,
                                      this.blockSize - 4,
                                      this.blockSize - 4
                    );
                }
            });
        });
    }

    MatrixCollides(){
        for(let y = 0; y < this.player.matrix.length; y++){
            for(let x = 0; x < this.player.matrix[y].length; x++){
                if(this.player.matrix[y][x] !== 0 &&         // are we checking a non block player matrix entity?
                  (this.grid[y + this.player.position.y] &&     // does the row we are on exist?
                   this.grid[y + this.player.position.y][x + this.player.position.x]) !== 0){   // are we on a tile which is already occupied?
                    return true;
                }
            }
        }
        return false;
    }

    MergeMatrixWithGrid(){
        // merge the location of the player matrix in the grid
        // move 1 position back as the merge will come after a move
        this.player.position.y--;
        this.player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value !== 0)
                    this.grid[y + this.player.position.y][x + this.player.position.x] = value;
            });
        });

        if(!arcade.menu.active){
            this.player.score += 20;    // for every new block add 20 points
            this.ProcessMatrixPoints();
            this.UpdateScoreCanvas();
        }
    }

    ProcessMatrixPoints(){
        let removed_rows = 0;
        for(let r = 0; r < this.grid.length; r++){
            let non_filled_row = false;
            for(let c = 0; c < this.grid[r].length; c++){
                if(this.grid[r][c] == 0){ // if there is a non filled place in the row we can skip the row
                    non_filled_row = true;  // for the skipping of the first for loop
                    break;                  // for stopping of this for loop
                }
            }
            if(non_filled_row)
                continue;

            // the whole row was filled! Remove the row and add a new one to the top
            this.grid.splice(r,1);
            this.grid.unshift(new Array(this.gridcollums).fill(0));
            removed_rows++;
        }

        // check if there are any filled places in the grid
        let grid_is_empty = true;
        for(let r = 0; r < this.grid.length; r++)
            for(let c = 0; c < this.grid[r].length; c++)
                if(this.grid[r][c] == 1)
                    grid_is_empty = false;

        if(removed_rows !== 0){
            this.player.combo++;
            if(grid_is_empty)
                this.player.score += 2000 * this.player.combo;
            else{
                switch(removed_rows){
                    case 1:
                        this.player.score += 50 * this.player.combo;
                        break;
                    case 2:
                        this.player.score += 150 * this.player.combo;
                        break;
                    case 3:
                        this.player.score += 350 * this.player.combo;
                        break;
                    case 4:
                        this.player.score += 1000 * this.player.combo;
                        break;
                }
            }
        } else
            this.player.combo = 0;
    }

    // every 60th execution the player y position will move 1 down
    updateCurrentMatrixPosition(){
        this.dropTimer++;
        if(this.dropTimer >= this.dropInterval){
            this.player.position.y++;
            this.dropTimer -= this.dropInterval;
        }
    }
}