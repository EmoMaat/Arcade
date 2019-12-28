function Pong(){
    arcade.menu.object = new MenuInterface();
    arcade.menu.object.backgroundGame = new PongGame("AI", "AI");

    PongMainMenuOverlay();
}

function PongMainMenuOverlay(){
    arcade.menu.object.buttons = [];
    arcade.menu.object.buttons = [
        ["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "PongGameSelectorOverlay()"]
    ];
}

function PongGameSelectorOverlay(){
    arcade.menu.object.buttons = [];
	arcade.menu.object.buttons = [
        ["Back", "PongMainMenuOverlay()"],
        ["Player vs AI", "newPongGame('Player', 'AI')"],
		["AI vs Player", "newPongGame('AI', 'Player')"],
        ["Player vs Player", "newPongGame('Player', 'Player')"]
	];
}

function newPongGame(player1, player2){
    exit_open_game();
    exit_open_arcade();

	arcade.game.object = new PongGame(player1, player2);

	arcade.game.interval = new Interval(function(){
		arcade.game.object.update();
	}, 15);
}

class PongGame{
    constructor(Player1, Player2){
        this.window_scale = window.height / 1080;
        this.initCanvases();

        this.players = [];
        Player1 == "AI" ? this.players.push(new PongPlayer("AI", this.Player1Canvas)) : this.players.push(new PongPlayer("Player", this.Player1Canvas));
        Player2 == "AI" ? this.players.push(new PongPlayer("AI", this.Player2Canvas)) : this.players.push(new PongPlayer("Player", this.Player2Canvas));
        this.players.forEach(player => player.draw());

        move.multiplayer = true;
        move.player[0].continuous = true;
        move.player[1].continuous = true;
        move.player[0].keybinding = "wasd";
        move.player[1].keybinding = "arrows";

        this.players[0].speed = 6 * this.window_scale;
        this.players[1].speed = 6 * this.window_scale;

        if(this.players[0].type == "Player"){
            move.player[0]._up.setEventListener(() => {
                this.players[0].move(-5);

                if(this.players[0].y < 50 * this.window_scale)
                    this.players[0].move(+5);
            })
            move.player[0]._down.setEventListener(() => {
                this.players[0].move(+5);

                if(this.players[0].y + this.players[0].canvas.height > 1020 * this.window_scale)
                    this.players[0].move(-5);
            })
        }

        if(this.players[1].type == "Player"){
            move.player[1]._up.setEventListener(() => {
                this.players[1].move(-5);

                if(this.players[1].y < 50 * this.window_scale)
                    this.players[1].move(+5);
            })
            move.player[1]._down.setEventListener(() => {
                this.players[1].move(+5);

                if(this.players[1].y + this.players[1].canvas.height > 1020 * this.window_scale)
                    this.players[1].move(-5);
            })
        }

        this.UpdatePlayground();
        this.ResetPlayground();
    }

    update(){
        for(let p = 0; p < this.players.length; p++)
            if(this.players[p].type == "AI")
                // check if the ball is in the x range of the AI
                if((p === 0 && this.ball.x < (this.canvas.width * (2/5)) * this.window_scale) || (p === 1 && this.ball.x > (this.canvas.width * (3/5)) * this.window_scale))
                    this.players[p].CalculatePath(this.ball.y, this.window_scale);
                else
                    this.players[p].CalculatePath(this.canvas.height / 2, this.window_scale);

        this.CheckCollision();
        if(this.ball.SpawnTimer > 0)
            this.ball.SpawnTimer--;
        else
            this.ball.move();
    }

    initCanvases(){
        let playground = document.createElement('canvas');
        playground.id = 'playground';
        playground.width = window.width;
        playground.height = window.height;
        playground.style.position = "absolute";
        playground.style.cursor = "none";
        playground.style.zIndex = 1;
        document.body.appendChild(playground);

        this.canvas = document.getElementById("playground");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");

        let Player1 = document.createElement('canvas');
        Player1.id = 'Player1';
        Player1.width = 20 * this.window_scale;
        Player1.height = 180 * this.window_scale;
        Player1.style.top = window.height / 2 - Player1.height / 2;
        Player1.style.left = 30 * this.window_scale;
        Player1.style.position = "absolute";
        Player1.style.cursor = "none";
        Player1.style.zIndex = 1;
        document.body.appendChild(Player1);

        this.Player1Canvas = document.getElementById("Player1");		// canvas stuff

        let Player2 = document.createElement('canvas');
        Player2.id = 'Player2';
        Player2.width = 20 * this.window_scale;
        Player2.height = 180 * this.window_scale;
        Player2.style.top = window.height / 2 - Player2.height / 2;
        Player2.style.left = 1860 * this.window_scale;
        Player2.style.position = "absolute";
        Player2.style.cursor = "none";
        Player2.style.zIndex = 1;
        document.body.appendChild(Player2);

        this.Player2Canvas = document.getElementById("Player2");		// canvas stuff

        let Ball = document.createElement('canvas');
        Ball.id = 'Ball';
        Ball.width = 50 * this.window_scale;
        Ball.height = 50 * this.window_scale;
        Ball.style.top = window.height / 2 - Ball.height / 2;
        Ball.style.left = window.width / 2 - Ball.width / 2;
        Ball.style.position = "absolute";
        Ball.style.cursor = "none";
        Ball.style.zIndex = 1;
        document.body.appendChild(Ball);

        this.BallCanvas = document.getElementById("Ball");		// canvas stuff
    }

    // executed only once
    UpdatePlayground(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48pt SegoeUI';
        this.ctx.textAlign = "center";

        // create the top lines
        this.ctx.fillRect(30 * this.window_scale, 30 * this.window_scale, 1850 * this.window_scale, 20 * this.window_scale);    // upper bar
        this.ctx.fillRect(30 * this.window_scale, 1020 * this.window_scale, 1850 * this.window_scale, 20 * this.window_scale);    // lower bar

		// striped middle bar
		for (var y = 40 * this.window_scale; y < 1040 * this.window_scale; y += 60 * this.window_scale)
			this.ctx.fillRect(this.canvas.width / 2 - 10 * this.window_scale /*half line width*/,y, 20 * this.window_scale, 30 * this.window_scale);

        // score
        this.ctx.fillText(this.players[0].points,
                        this.canvas.width / 4, // middle of left side
                        150 * this.window_scale);
        this.ctx.fillText(this.players[1].points,
                        (this.canvas.width / 4) * 3, // middle of right side
                        150 * this.window_scale);
    }

    // checks whether the ball should bounce
    CheckCollision(){
        if(this.ball.scored !== false){
            if(this.ball.x < -100 || this.ball.x > this.canvas.width + 100)
                this.ProcessGoal(this.ball.scored)
        } else {
            if(this.ball.y - this.ball.radius <= 50  * this.window_scale)
                this.ball.bounce("y", 50 * this.window_scale + this.ball.radius);

            if(this.ball.y + this.ball.radius >= 1020  * this.window_scale)
                this.ball.bounce("y", 1020 * this.window_scale - this.ball.radius);

            // in diagonal range of player 0's bar
            for(let p = 0; p < this.players.length; p++){
                if(this.ball.x + this.ball.radius / 2 > this.players[p].x && this.ball.x - this.ball.radius / 2 < this.players[p].x + this.players[p].canvas.width){
                    let scored = p;
                    // bounce against bottom or top
                    if(this.ball.y - this.ball.radius <= this.players[p].y + this.players[p].canvas.height &&
                        this.ball.y - this.ball.radius >= this.players[p].y + this.players[p].canvas.height - 10)
                    this.ball.bounce("y", (this.players[p].y + this.players[p].canvas.height) * this.window_scale + this.ball.radius);

                    if(this.ball.y + this.ball.radius >= this.players[p].y &&
                        this.ball.y + this.ball.radius <= this.players[p].y + 10)
                    this.ball.bounce("y", this.players[p].y * this.window_scale - this.ball.radius);

                    // if the ball hits the player normally
                    if(this.ball.y > this.players[p].y && this.ball.y < this.players[p].y + this.players[p].canvas.height){
                        this.ball.radians += 0.3 * (this.players[p].center - this.ball.y) / this.players[p].center;
                        this.ball.speed += 0.01;
                        this.ball.bounce("x", this.players[p].x + (p === 0 ? this.players[p].canvas.width + this.ball.radius : - this.ball.radius))

                        this.players[0].hitpoint = null;
                        this.players[1].hitpoint = null;

                        scored = false;
                    }

                    if(scored !== false)
                        this.ball.scored = p === 0 ? 1 : 0;   // set the ID of the one who scored
                }
            }
        }
    }

    // check whether a goal is made
    ProcessGoal(player){
        this.players[player].points++;
        this.ResetPlayground();

        this.UpdatePlayground();
    }

    // resets the players to the center and spawns a new ball;
    ResetPlayground(){
        this.players[0].canvas.style.top = this.players[0].y = window.height / 2 - this.players[0].canvas.offsetHeight / 2;
        this.players[1].canvas.style.top = this.players[1].y = window.height / 2 - this.players[1].canvas.offsetHeight / 2;

        this.players[0].hitpoint = null;
        this.players[1].hitpoint = null;

        this.BallCanvas.style.top = window.height / 2 - this.BallCanvas.offsetHeight / 2;
        this.BallCanvas.style.left = window.width / 2 - this.BallCanvas.offsetWidth / 2;
        this.ball = new PongBall(this.BallCanvas);
        this.ball.draw();
    }
}