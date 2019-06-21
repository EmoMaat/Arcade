function MidnightMotorists(){
	new MenuInterface();

    interfaces.menu.object.backgroundGame = new MidnightMotoristsGame();
    interfaces.menu.object.header = "MidnightMotorists/sprites/title.png";
    interfaces.menu.object.buttons = [
		["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "newMidnightMotoristsGame()"]
	];
}


function newMidnightMotoristsGame(){
    exit_open_game();
    exit_open_interfaces();
    
    // interfaces.menu.object.backgroundGame.audioMenu.pause();
	
	interfaces.game.object = new MidnightMotoristsGame();
	
	interfaces.game.interval = new Interval(function(){ 
		interfaces.game.object.update();
	}, 15);
}

class MidnightMotoristsGame{
	constructor(){
        let MidnightMotoristsCanvas = document.createElement('canvas');
		MidnightMotoristsCanvas.id = 'MidnightMotoristsCanvas';
		MidnightMotoristsCanvas.width = canvas.width;
		MidnightMotoristsCanvas.height = canvas.height;
		MidnightMotoristsCanvas.style.left = 0;
		MidnightMotoristsCanvas.style.zIndex = 1;
		MidnightMotoristsCanvas.style.position = "absolute";
		MidnightMotoristsCanvas.style.cursor = "none";
		document.body.appendChild(MidnightMotoristsCanvas);

		this.canvas = document.getElementById("MidnightMotoristsCanvas");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");			        // canvas stuff

        this.newgame = true;        // whether we just started a new game
        this.points = 0;            // score of the player
        this.pointcooldown = 10000; // in this.distance
        this.finished = false;      // whether we crossed the last lap line
        move.continuous = true;
 
        this.rainTheme = Math.random() < 0.2 ? true: false;
        
        if(this.rainTheme && !interfaces.menu.active) {
            this.music = new Audio('MidnightMotorists/audio/SmashingWindshields.mp3');
            this.music.volume = 0.9;
            this.music.isAllowed = false;
            
            this.sprite = [
                new Image(),
                new Image()
            ]
            this.sprite[0].src = "MidnightMotorists/sprites/dir0-n.png"
            this.sprite[1].src = "MidnightMotorists/sprites/dir1-n.png"
		} else {
            this.music = new Audio('MidnightMotorists/audio/240BitsPerMile.mp3');
            this.music.volume = 0.6;
            this.music.isAllowed = false;
            
            this.sprite = [
                new Image(),
                new Image()
            ]
            this.sprite[0].src = "MidnightMotorists/sprites/dir0.png"
            this.sprite[1].src = "MidnightMotorists/sprites/dir1.png"
        }
        this.sprite[2] = new Image();
        this.sprite[2].src = "MidnightMotorists/sprites/lap.png";

        this.music.autoplay = true;
        this.music.loop = true;
		this.window_scale = canvas.height / 1080;

        this.maxspeed = 20;
        this.speedpoint = 0;
        this.speed = 0;
        this.distance = 0;

        this.raintimer = 0;
        this.rainbool = false;
        this.rainImage = new Image();

        // amount of lines you want on screen at the same time
        this.roadlineFrequency = 9;
        this.roadlines = this.createLine(this.roadlineFrequency, 0);

        // positions of the lanes for placing the other cars
        this.roadlanes = [110 * this.window_scale, 
			210 * this.window_scale, 
			360 * this.window_scale, 
			460 * this.window_scale, 
			620 * this.window_scale, 
			720 * this.window_scale, 
			870 * this.window_scale, 
			970 * this.window_scale
		]; // 0-7

        // contains the places where the laps should be drawn in this.distance. should be multidimensional to set flags
        this.laps = [
			30000 * this.window_scale, 
			60000 * this.window_scale, 
			90000 * this.window_scale, 
			120000 * this.window_scale
		];

        // we give the roadlanes because it will randomly pick one of the middle ones
        this.getReady = 3600; // 15ms update speed * 60 fps * 4 seconds
        
        this.player = new MidnightMotoristsPlayer(300, this.roadlanes, this.window_scale, this.rainTheme, this.ctx);

        this.maxcars = 20;
        this.cartimer = 0;
        this.cars = [];
        for(var i = 0; i < 3; i++)
            this.generateCar();
		
        this.drawBorderLines();
        
        this.music.play();
	}
	
	update(){
        if(this.music.played.length == 0)
            this.music.play();

        this.carPositionHandler();
        this.carGenerationHandler();
        if(!interfaces.menu.active){
            this.player.update();
            if(this.getReady >= 0){
                this.getReady -= 15;
                this.player.controlsdisabled = true;

                this.ctx.font = "240px Arial";
                this.ctx.fillStyle ="white";

                if(this.getReady > 2400){
                    this.ctx.lineWidth = 14;
                    this.ctx.font = "240px Arial";
                    this.ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    this.ctx.strokeText("3",canvas.width / 2 - this.ctx.measureText("3").width / 2,canvas.height / 2 + 90);

                    this.ctx.fillText("3",canvas.width / 2 - this.ctx.measureText("3").width / 2,canvas.height / 2 + 90);
                } else if(this.getReady > 1200){
                    this.ctx.lineWidth = 14;
                    this.ctx.font = "240px Arial";
                    this.ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    this.ctx.strokeText("2",canvas.width / 2 - this.ctx.measureText("2").width / 2,canvas.height / 2 + 90);

                    this.ctx.fillText("2",canvas.width / 2 - this.ctx.measureText("2").width / 2,canvas.height / 2 + 90); 
                } else if(this.getReady > 0){
                    this.ctx.lineWidth = 14;
                    this.ctx.font = "240px Arial";
                    this.ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    this.ctx.strokeText("1",canvas.width / 2 - this.ctx.measureText("1").width / 2,canvas.height / 2 + 90);

                    this.ctx.fillText("1",canvas.width / 2 - this.ctx.measureText("1").width / 2,canvas.height / 2 + 90); 
                }
            } else if(!this.finished){
                this.distance += this.speed;
                this.player.controlsdisabled = false;

                this.pointcooldown -= 15;
                if(this.pointcooldown <= 0)
                    this.points += 0.5;

                if(this.speed < 15){
                    if(this.speedpoint < 20)
                        this.speedpoint += 0.008;
                
                    this.speed = this.maxspeed - this.maxspeed * Math.pow(1.5, -this.speedpoint);
                }else if(this.speed < 20) // this is for the last 50 kmph so it will not take forever
                    this.speed += 0.01;
                    
                this.player.kmph = this.speed * 10 < 199.5 ? this.speed * 10 : 200;
            }

            if(this.finished){
                this.finished = true;
                this.player.controlsdisabled = true;

                if(this.speed > 0){
                    this.pointcooldown = 3600; // we use a random var as we don't need it anymore
                    this.speed -= 0.1;
                } else if(this.speed <= 0){
                    this.speed = 0;
                    this.pointcooldown -= 15;
                    if(this.music.volume >= 0.002)
                    this.music.volume -= 0.002;
                    if(this.pointcooldown < 0){
                        this.music.pause();
                        new HighScoresInterface("MidnightMotorists", Math.round(this.points));
                    }
                }

                this.player.kmph = this.speed * 10 < 199.5 ? this.speed * 10 : 200;

                this.ctx.lineWidth = 14;
                this.ctx.font = "120px Arial";
                this.ctx.strokeStyle = "rgb(50, 50, 50)"; 
                this.ctx.strokeText("FINISHED",canvas.width / 2 - this.ctx.measureText("FINISHED").width / 2,canvas.height / 2 + 45);

                this.ctx.lineWidth = 4;
                this.ctx.font = "120px Arial";
                this.ctx.fillStyle ="white";
                this.ctx.fillText("FINISHED",canvas.width / 2 - this.ctx.measureText("FINISHED").width / 2,canvas.height / 2 + 45);
            }

            if(this.rainTheme){
                if(this.rainbool){
                    this.raintimer--;
                    if (this.raintimer <= 0){
                        this.raintimer = 0;
                        this.rainbool = false;
                        
                        this.rainImage.src = "MidnightMotorists/sprites/rain1.png"
                    }
                } else {
                    this.raintimer++;
                    if (this.raintimer >= 20){
                        this.raintimer = 20;
                        this.rainbool = true;

                        this.rainImage.src = "MidnightMotorists/sprites/rain2.png"
                    }
                } 
            }

            this.ctx.drawImage(this.rainImage, 0,0, canvas.width, canvas.height);

            this.roadlinesShift(-this.speed);

            this.ctx.font = "30px Arial";
            this.ctx.fillStyle ="white";
            this.ctx.fillText(Math.round(this.points),canvas.width - 100,100); 
        }   
    }
    
    carPositionHandler(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
        // if we touch an other car
        for (let i = this.cars.length - 1; i >= 0; i--){
            if(this.cars[i].x + this.cars[i].width * 2 < 0 || this.cars[i].x - this.cars[i].width > canvas.width){
                this.cars.splice(i, 1);
                continue;
            }

            this.cars[i].x += this.cars[i].speed - this.speed;
            this.cars[i].update();

            if(!interfaces.menu.active)
            if(!(this.player.y - this.player.height / 2 > this.cars[i].y + this.cars[i].height / 2 || 
                 this.player.y + this.player.height / 2 < this.cars[i].y - this.cars[i].height / 2||
                 this.player.x                          > this.cars[i].x + this.cars[i].width ||
                 this.player.x + this.player.width      < this.cars[i].x
                )){
                    this.cars.splice(i, 1);
                    this.player.crash = true;
                    this.speedpoint = 0;
                    this.speed = 0;

                    if(this.pointcooldown < 7200)
                        this.pointcooldown = 7200;
            }
        }

        // draw a lap line / finish line
        if(!this.finished){
            if(this.distance + this.canvas.width > this.laps[this.player.lap]){
                this.ctx.drawImage(this.sprite[2], this.laps[this.player.lap] - this.distance, 20, this.sprite[2].width, canvas.height - 20);
                this.lapTimer = 100;
            } else if(this.distance <= this.laps[this.player.lap] && this.distance > this.laps[this.player.lap - 1]){
                if(this.lapTimer > 0){
                    this.cars = [];
                    this.lapTimer--;
                    this.ctx.lineWidth = 14;
                    this.ctx.font = "240px Arial";
                    this.ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    this.ctx.strokeText("Lap " + (this.player.lap + 1),canvas.width / 2 - this.ctx.measureText("Lap " + (this.player.lap + 1)).width / 2,canvas.height / 2 + 90);

                    this.ctx.fillText("Lap " + (this.player.lap + 1),canvas.width / 2 - this.ctx.measureText("Lap " + (this.player.lap + 1)).width / 2,canvas.height / 2 + 90); 
                }
            }
        }else 
            this.cars = [];
    }

    carGenerationHandler(){
        for(var l = this.player.lap; l < this.laps.length; l++){
            if(this.distance + this.player.x + this.player.width > this.laps[l]){
                if(l + 1 >= this.laps.length){
                    this.finished = true; 
                    this.cartimer = 0; 
                    break;
                }

                this.player.lap = l + 1;  
            }
        }

        // check if we should generate a new car
        var oldlapdistance = typeof this.laps[this.player.lap - 1] == "undefined" ? 0 : this.laps[this.player.lap - 1];
        var chance = this.cartimer * 0.035 * (1 - this.cars.length / this.maxcars) * (1 + 4 * this.player.lap) * ((this.distance + this.player.x + this.player.width - oldlapdistance) / (this.laps[this.player.lap] - oldlapdistance));

        if(Math.random() < chance){
            this.cartimer = 0;
            this.generateCar();
        }
        this.cartimer++;
    }
	generateCar(){
        var dir = Math.round(Math.random());
        var roadlane = dir == 0 ? Math.round(Math.random() * 3) : Math.round(Math.random() * 3) + 4; // 0 is an option as well

        if(this.player.controlsdisabled)
            while(roadlane == this.player.lane)
                roadlane = dir == 0 ? Math.round(Math.random() * 3) : Math.round(Math.random() * 3) + 4; // 0 is an option as well

        var xpos = dir == 0 ? canvas.width : 0 - 104; // car sprite width
        var speed = dir == 0 ? -(1.8 - Math.random()) : 1.8 - Math.random(); 
        var x = speed < this.speed ? canvas.width + 20 : xpos;

        this.cars.push(new MidnightMotoristsCar(x, this.roadlanes[roadlane], this.sprite[dir], speed,  this.window_scale, this.ctx));
    }

    roadlinesShift(amountX){
        for(var i = 0; i < this.roadlines.length; i++){
            if(this.roadlines[i][1] < 0){
                this.roadlines.splice(0,1);
                continue;
            }
            this.roadlines[i][0] += amountX;
            this.roadlines[i][1] += amountX;   
            
            if(this.roadlines[i][0] <= 0 && !(this.roadlines[this.roadlines.length - 1][1] > canvas.width * 1.5)){
                var newdottedline = this.createLine(this.roadlineFrequency, this.roadlines[this.roadlines.length - 1][1], 1);
                this.roadlines.push(newdottedline[0]);
            }
        }
        this.draw_dotted_lines();
    }

    /**
     * returns an array which contains a starting point and end point
     * @param {*} frequency distribution of the dotted lines over the screen in an amount
     * @param {*} start x position from where to calculate, zero by default
     * @param {*} amount amount of dotted lines you want to create, default is the frequency given 
     */
    createLine(frequency, start = 0, amount){
        var ret = [];
        var amountToCreate = amount || frequency;

        // customize your dotted line ratio here
        var spacebetween = (screen.width * (2/5)) / frequency;
        var size = (screen.width * (3/5)) / frequency; 

        var currentx = start;
        for(var i = 0; i < amountToCreate; i++){
            if(i == 0 && this.newgame){
                this.newgame = false;
                currentx += spacebetween / 2;
            }else 
                currentx += spacebetween;

            var x1 = currentx;
            var x2 = currentx += size;

            ret.push([x1, x2]);
        }

        return ret;
    }
    
    drawLine(x1, y1, x2, y2, opacity, lineWidth, ctx){
        var color = opacity;
        ctx.strokeStyle = "rgb("+ color + "," + color + "," + color + ")"; 

		ctx.lineWidth = lineWidth;
		ctx.beginPath();

        ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke(); 
    }

    draw_dotted_lines(){
        this.MidnightMotoristsTopMiddleLineCtx.clearRect(0,0,this.MidnightMotoristsTopMiddleLineCanvas.width, this.MidnightMotoristsTopMiddleLineCanvas.height)
        this.MidnightMotoristsBottomMiddleLineCtx.clearRect(0,0,this.MidnightMotoristsBottomMiddleLineCanvas.width, this.MidnightMotoristsBottomMiddleLineCanvas.height)
        // middle
        for(var i = 0; i < this.roadlines.length; i++){
            // top lines
            // horizontal white lines
            this.drawLine(this.roadlines[i][0] + 9, 18, this.roadlines[i][1] - 9, 18, 255, 14 * this.window_scale, this.MidnightMotoristsTopMiddleLineCtx);

            // horizontal grey lines
            this.drawLine(this.roadlines[i][0], 5, this.roadlines[i][1], 5, 50, 7 * this.window_scale, this.MidnightMotoristsTopMiddleLineCtx);
            this.drawLine(this.roadlines[i][0], 31, this.roadlines[i][1], 31, 50, 7 * this.window_scale, this.MidnightMotoristsTopMiddleLineCtx);

            // vertical filler
            this.drawLine(this.roadlines[i][0] + 3, 5, this.roadlines[i][0] + 3, 31, 50, 7 * this.window_scale, this.MidnightMotoristsTopMiddleLineCtx);
            this.drawLine(this.roadlines[i][1] - 3, 5, this.roadlines[i][1] - 3, 31, 50, 7 * this.window_scale, this.MidnightMotoristsTopMiddleLineCtx);


            // bottom lines
            // horizontal white lines
            this.drawLine(this.roadlines[i][0] + 9, 18, this.roadlines[i][1] - 9, 18, 255, 14 * this.window_scale, this.MidnightMotoristsBottomMiddleLineCtx);

            // horizontal grey lines
            this.drawLine(this.roadlines[i][0], 5, this.roadlines[i][1], 5, 50, 7 * this.window_scale, this.MidnightMotoristsBottomMiddleLineCtx);
            this.drawLine(this.roadlines[i][0], 31, this.roadlines[i][1], 31, 50, 7 * this.window_scale, this.MidnightMotoristsBottomMiddleLineCtx);

            // vertical filler
            this.drawLine(this.roadlines[i][0] + 3, 5, this.roadlines[i][0] + 3, 31, 50, 7 * this.window_scale, this.MidnightMotoristsBottomMiddleLineCtx);
            this.drawLine(this.roadlines[i][1] - 3, 5, this.roadlines[i][1] - 3, 31, 50, 7 * this.window_scale, this.MidnightMotoristsBottomMiddleLineCtx);

        }
    }

    drawBorderLines(){
        // the road lanes
        let MidnightMotoristsTopLine = document.createElement('canvas');
		MidnightMotoristsTopLine.id = 'MidnightMotoristsTopLine';
		MidnightMotoristsTopLine.width = canvas.width;
		MidnightMotoristsTopLine.height = 40;
		MidnightMotoristsTopLine.style.top = 20;
		MidnightMotoristsTopLine.style.left = 0;
		MidnightMotoristsTopLine.style.position = "absolute";
		MidnightMotoristsTopLine.style.cursor = "none";
		document.body.appendChild(MidnightMotoristsTopLine);

		this.MidnightMotoristsTopLineCanvas = document.getElementById("MidnightMotoristsTopLine");		// canvas stuff
        this.MidnightMotoristsTopLineCtx = this.MidnightMotoristsTopLineCanvas.getContext("2d");			        // canvas stuff

        let MidnightMotoristsMiddleLine = document.createElement('canvas');
		MidnightMotoristsMiddleLine.id = 'MidnightMotoristsMiddleLine';
		MidnightMotoristsMiddleLine.width = canvas.width;
		MidnightMotoristsMiddleLine.height = 40;
		MidnightMotoristsMiddleLine.style.top = canvas.height / 2 - 20;
		MidnightMotoristsMiddleLine.style.left = 0;
		MidnightMotoristsMiddleLine.style.position = "absolute";
		MidnightMotoristsMiddleLine.style.cursor = "none";
		document.body.appendChild(MidnightMotoristsMiddleLine);

		this.MidnightMotoristsMiddleLineCanvas = document.getElementById("MidnightMotoristsMiddleLine");		// canvas stuff
        this.MidnightMotoristsMiddleLineCtx = this.MidnightMotoristsMiddleLineCanvas.getContext("2d");			        // canvas stuff

        let MidnightMotoristsBottomLine = document.createElement('canvas');
		MidnightMotoristsBottomLine.id = 'MidnightMotoristsBottomLine';
		MidnightMotoristsBottomLine.width = canvas.width;
		MidnightMotoristsBottomLine.height = 40;
		MidnightMotoristsBottomLine.style.top = canvas.height - 60;
		MidnightMotoristsBottomLine.style.left = 0;
		MidnightMotoristsBottomLine.style.position = "absolute";
		MidnightMotoristsBottomLine.style.cursor = "none";
		document.body.appendChild(MidnightMotoristsBottomLine);

		this.MidnightMotoristsBottomLineCanvas = document.getElementById("MidnightMotoristsBottomLine");		// canvas stuff
        this.MidnightMotoristsBottomLineCtx = this.MidnightMotoristsBottomLineCanvas.getContext("2d");			        // canvas stuff

        // top
        this.drawLine(0, 5, canvas.width, 5, 50, 7 * this.window_scale, this.MidnightMotoristsTopLineCtx);
        this.drawLine(0, 18, canvas.width, 18, 255, 14 * this.window_scale, this.MidnightMotoristsTopLineCtx);
        this.drawLine(0, 31, canvas.width, 31, 50, 7 * this.window_scale, this.MidnightMotoristsTopLineCtx);

        // middle
        this.drawLine(0, 5, canvas.width, 5, 50, 7 * this.window_scale, this.MidnightMotoristsMiddleLineCtx);
        this.drawLine(0, 18, canvas.width, 18, 255, 14 * this.window_scale, this.MidnightMotoristsMiddleLineCtx);
        this.drawLine(0, 31, canvas.width, 31, 50, 7 * this.window_scale, this.MidnightMotoristsMiddleLineCtx);

        // bottom
        this.drawLine(0, 5, canvas.width, 5, 50, 7 * this.window_scale, this.MidnightMotoristsBottomLineCtx);
        this.drawLine(0, 18, canvas.width, 18, 255, 14 * this.window_scale, this.MidnightMotoristsBottomLineCtx);
        this.drawLine(0, 31, canvas.width, 31, 50, 7 * this.window_scale, this.MidnightMotoristsBottomLineCtx);

        let MidnightMotoristsTopMiddleLine = document.createElement('canvas');
		MidnightMotoristsTopMiddleLine.id = 'MidnightMotoristsTopMiddleLine';
		MidnightMotoristsTopMiddleLine.width = canvas.width;
		MidnightMotoristsTopMiddleLine.height = 40;
		MidnightMotoristsTopMiddleLine.style.top = canvas.height / 4 - 20;
		MidnightMotoristsTopMiddleLine.style.left = 0;
		MidnightMotoristsTopMiddleLine.style.position = "absolute";
		MidnightMotoristsTopMiddleLine.style.cursor = "none";
		document.body.appendChild(MidnightMotoristsTopMiddleLine);

		this.MidnightMotoristsTopMiddleLineCanvas = document.getElementById("MidnightMotoristsTopMiddleLine");		// canvas stuff
        this.MidnightMotoristsTopMiddleLineCtx = this.MidnightMotoristsTopMiddleLineCanvas.getContext("2d");			        // canvas stuff
        
        let MidnightMotoristsBottomMiddleLine = document.createElement('canvas');
		MidnightMotoristsBottomMiddleLine.id = 'MidnightMotoristsBottomMiddleLine';
		MidnightMotoristsBottomMiddleLine.width = canvas.width;
		MidnightMotoristsBottomMiddleLine.height = 40;
		MidnightMotoristsBottomMiddleLine.style.top = canvas.height / 2 + canvas.height / 4 - 40;
		MidnightMotoristsBottomMiddleLine.style.left = 0;
		MidnightMotoristsBottomMiddleLine.style.position = "absolute";
		MidnightMotoristsBottomMiddleLine.style.cursor = "none";
        document.body.appendChild(MidnightMotoristsBottomMiddleLine);

        this.MidnightMotoristsBottomMiddleLineCanvas = document.getElementById("MidnightMotoristsBottomMiddleLine");		// canvas stuff
        this.MidnightMotoristsBottomMiddleLineCtx = this.MidnightMotoristsBottomMiddleLineCanvas.getContext("2d");			        // canvas stuff
        
        this.draw_dotted_lines();
    }

    exit(){
        this.music.pause();
    }
}