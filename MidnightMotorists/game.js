
var motorTitle = new Image();
motorTitle.src = "MidnightMotorists/sprites/title.png";

function MidnightMotorists(){

	new MenuInterface();

    // interfaces.menu.object.backgroundGame = new MidnightMotoristsGame();
    interfaces.menu.object.buttons = [
		["GO TO HUB", "loadingBar('hub', 'new HubInterface')"],
		["HIGH SCORES", "new HighScoresInterface('" + currentGame + "', 0)"],
        ["START GAME", "newMidnightMotoristsGame()"]
	];

	// overlayInterval = new Interval(function(){ 
    //     //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.fillStyle = "black"
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
	// 	menuOverlay.update();
	// 	ctx.drawImage(motorTitle,canvas.width/2 - motorTitle.width/2,100);
	// }, 15);
}


function newMidnightMotoristsGame(){
    if(typeof gameInterval !== "undefined")
		gameInterval.stop();
	
	if(typeof overlayInterval !== "undefined")
		overlayInterval.stop();
    
    midnightMotoristsGame.audioMenu.pause();
	OverlayIsActive = false;
	
	midnightMotoristsGame = new MidnightMotoristsGame();
	
	gameInterval = new Interval(function(){ 
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		midnightMotoristsGame.update();
	}, 15);
}

class MidnightMotoristsGame{
	constructor(){
        this.overlay = false;       // whether a player should be involved
        this.newgame = true;        // whether we just started a new game
        this.points = 0;            // score of the player
        this.pointcooldown = 18000; // in this.distance
        this.finished = false;      // whether we crossed the last lap line
        move.smooth = true;

        this.random = Math.random()
        this.rainTheme = this.random < 0.1 ? true: false;
        
        if(this.rainTheme) {
            this.audioBackground = new Audio('MidnightMotorists/audio/SmashingWindshields.mp3');
			this.audioBackground.volume = 0.9;
		}
        else {
            this.audioBackground = new Audio('MidnightMotorists/audio/240BitsPerMile.mp3');
			this.audioBackground.volume = 0.6;
		}
		this.audioBackground.loop = true;
        this.audioMenu = new Audio('MidnightMotorists/audio/240BitsPerMile.mp3');
		this.audioMenu.volume = 0.6;
        // this.audioMenu.loop = true;
		this.window_scale = screen.height / 1080;

        this.maxspeed = 20;
        this.speedpoint = 0;
        this.speed = 0;
        this.distance = 0;

        this.raintimer = 0;
        this.rainbool = false;
        this.rainImage = new Image();

        // amount of lines you want on screen at the same time
        this.roadlineFrequency = 9;
        this.roadlines = [];
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
			[30000 * this.window_scale, 0], 
			[60000 * this.window_scale, 0], 
			[90000 * this.window_scale, 0], 
			[120000 * this.window_scale, 0]
		];

        // we give the roadlanes because it will randomly pick one of the middle ones
        this.getReady = 3600; // 15ms update speed * 60 fps * 4 seconds
        this.player = new MidnightMotoristsPlayer(300, this.roadlanes, this.window_scale, this.rainTheme);

        this.maxcars = 20;
        this.cartimer = 0;
        this.cars = [];
        for(var i = 0; i < 3; i++)
            this.generateCar();
		
		this.gamemode = "";
	}
	
	update(){
        if(this.overlay){
            this.audioMenu.play();
            this.draw_road();

            for (var i = 0; i < this.cars.length; i++){
                if(this.cars[i].x + this.cars[i].width < 0 || this.cars[i].x > canvas.width * 1.5)
                this.cars.splice(i, 1);

                this.cars[i].update();
            }

            this.cartimer++;
            if(this.cartimer > 75){
                this.cartimer = 0;
                this.generateCar();
            }
        } else {
            this.audioBackground.play();
            this.draw_road();
            this.player.update();

            if(this.getReady >= 0){
                this.getReady -= 15;
                this.player.controlsdisabled = true;

                ctx.font = "240px Arial";
                ctx.fillStyle ="white";

                if(this.getReady > 2400){
                    ctx.lineWidth = 14;
                    ctx.font = "240px Arial";
                    ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    ctx.strokeText("3",canvas.width / 2 - 140,canvas.height / 2 + 90);

                    ctx.fillText("3",canvas.width / 2 - 140,canvas.height / 2 + 90);
                } else if(this.getReady > 1200){
                    ctx.lineWidth = 14;
                    ctx.font = "240px Arial";
                    ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    ctx.strokeText("2",canvas.width / 2 - 140,canvas.height / 2 + 90);

                    ctx.fillText("2",canvas.width / 2 - 140,canvas.height / 2 + 90); 
                } else if(this.getReady > 0){
                    ctx.lineWidth = 14;
                    ctx.font = "240px Arial";
                    ctx.strokeStyle = "rgb(50, 50, 50)"; 
                    ctx.strokeText("1",canvas.width / 2 - 140,canvas.height / 2 + 90);

                    ctx.fillText("1",canvas.width / 2 - 140,canvas.height / 2 + 90); 
                }
            } else if(!this.finished){
                this.distance += this.speed;
                this.player.controlsdisabled = false;

                this.pointcooldown -= 15;
                if(this.pointcooldown <= 0)
                    this.points += 0.5;

                if(this.speed < 15){
                    if(this.speedpoint < 20)
                        this.speedpoint += 0.005;
                
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
                    if(this.pointcooldown < 0){
                        this.audioBackground.pause();
                        loadHighscores("Midnight Motorists", Math.round(this.points));
                    }
                }

                this.player.kmph = this.speed * 10 < 199.5 ? this.speed * 10 : 200;

                ctx.lineWidth = 14;
                ctx.font = "120px Arial";
                ctx.strokeStyle = "rgb(50, 50, 50)"; 
                ctx.strokeText("FINISHED",canvas.width / 2 - 300,canvas.height / 2 + 45);

                ctx.lineWidth = 4;
                ctx.font = "120px Arial";
                ctx.fillStyle ="white";
                ctx.fillText("FINISHED",canvas.width / 2 - 300,canvas.height / 2 + 45);
            }

            this.carGenerationHandler();
            this.carPositionHandler();

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

            ctx.drawImage(this.rainImage, 0,0, canvas.width, canvas.height);

            this.roadlinesShift(this.speed);

            ctx.font = "30px Arial";
            ctx.fillStyle ="white";
            ctx.fillText(Math.round(this.points),canvas.width - 100,100); 
        }
    }
    
    carPositionHandler(){
        // if we touch an other car
        for (var i = 0; i < this.cars.length; i++){
            if(this.cars[i].x + this.cars[i].width < 0)
                this.cars.splice(i, 1);

            this.cars[i].x += this.cars[i].speed - this.speed;
            this.cars[i].update();

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
    }

    carGenerationHandler(){
        for(var l = this.player.lap; l < this.laps.length; l += 1){
            if(this.distance + this.player.x + this.player.width > this.laps[l][0]){
                if(l + 1 == this.laps.length){
                    this.finished = true; 
                    this.cartimer = 0; 
                    this.laps[this.laps.length - 1][1] = 1;
                    break;
                }

                if(this.player.lap < l + 1){
                    this.cars = [];
                    this.cartimer = 0;

                    for(var i = 0; i < 5; i++)
                        this.generateCar();
                }    
                this.player.lap = l + 1;  
            }
        }

        // check if we should generate a new car
        var oldlapdistance = typeof this.laps[this.player.lap - 1] == "undefined" ? 0 : this.laps[this.player.lap - 1][0];
        var chance = this.cartimer * 0.0025 * (1 - this.cars.length / this.maxcars) * (1 + 0.65 * this.player.lap) * ((this.distance + this.player.x + this.player.width - oldlapdistance) / (this.laps[this.player.lap][0] - oldlapdistance)) * 7.5 * this.window_scale;
        if(Math.random() < chance){
            this.cartimer = 0;
            this.generateCar();
        }
        this.cartimer++;
    }
    
    draw_road(){
        // stationary lines
        // top
        this.drawLine(0, canvas.height / 36, canvas.width, canvas.height / 36, 50, 7 * this.window_scale);
        this.drawLine(0, canvas.height / 25, canvas.width, canvas.height / 25, 255, 14 * this.window_scale);
        this.drawLine(0, canvas.height / 19.5, canvas.width, canvas.height / 19.5, 50, 7 * this.window_scale);

        // middle
        this.drawLine(0, canvas.height / 2.049, canvas.width, canvas.height / 2.049, 50, 7 * this.window_scale);
        this.drawLine(0, canvas.height / 2, canvas.width, canvas.height / 2, 255, 14 * this.window_scale);
        this.drawLine(0, canvas.height / 1.953, canvas.width, canvas.height / 1.953, 50, 7 * this.window_scale);
       

        // bottom
        this.drawLine(0, canvas.height / 1.028, canvas.width, canvas.height / 1.028, 50, 7);
        this.drawLine(0, canvas.height / 1.040, canvas.width, canvas.height / 1.040, 255, 14);
        this.drawLine(0, canvas.height / 1.053, canvas.width, canvas.height / 1.053, 50, 7);

        // dotted lines
        for(var i = 0; i < this.roadlines.length; i++){
            // top lines
            // horizontal white lines
            this.drawLine(this.roadlines[i][0] + 9, canvas.height / 4 + 14, this.roadlines[i][1] - 9, canvas.height / 4 + 14, 255, 14 * this.window_scale);

            // horizontal grey lines
            this.drawLine(this.roadlines[i][0], canvas.height / 4.2 + 14, this.roadlines[i][1], canvas.height / 4.2 + 14, 50, 7 * this.window_scale);
            this.drawLine(this.roadlines[i][0], canvas.height / 3.82 + 14, this.roadlines[i][1], canvas.height / 3.82 + 14, 50, 7 * this.window_scale);

            // vertical filler
            this.drawLine(this.roadlines[i][0] + 3.5, canvas.height / 4.2 + 14, this.roadlines[i][0] + 3.5, canvas.height / 3.82 + 14, 50, 7 * this.window_scale);
            this.drawLine(this.roadlines[i][1] - 3.5, canvas.height / 4.2 + 14, this.roadlines[i][1] - 3.5, canvas.height / 3.82 + 14, 50, 7 * this.window_scale);


            // bottom lines
            // horizontal white lines
            this.drawLine(this.roadlines[i][0] + 9, canvas.height / 1.333 - 14, this.roadlines[i][1] - 9, canvas.height / 1.333 - 14, 255, 14 * this.window_scale);

            // horizontal grey lines
            this.drawLine(this.roadlines[i][0], canvas.height / 1.354 - 14, this.roadlines[i][1], canvas.height / 1.354 - 14, 50, 7 * this.window_scale);
            this.drawLine(this.roadlines[i][0], canvas.height / 1.313 - 14, this.roadlines[i][1], canvas.height / 1.313 - 14, 50, 7 * this.window_scale);

            // vertical filler
            this.drawLine(this.roadlines[i][0] + 3.5, canvas.height / 1.354 - 14, this.roadlines[i][0] + 3.5, canvas.height / 1.313 - 14, 50, 7 * this.window_scale);
            this.drawLine(this.roadlines[i][1] - 3.5, canvas.height / 1.354 - 14, this.roadlines[i][1] - 3.5, canvas.height / 1.313 - 14, 50, 7 * this.window_scale);

        }


        for(var d = 0; d < this.laps.length; d++){
            if(this.distance < this.laps[d][0] && this.laps[d][1] == 0){
                this.sprite = new Image();
                this.sprite.src = "MidnightMotorists/sprites/lap.png";
                ctx.drawImage(this.sprite, this.laps[d][0] - this.distance, 50);
            }
        }
    }

	generateCar(){
        var dir = Math.round(Math.random());
        var roadlane = dir == 0 ? Math.round(Math.random() * 3) : Math.round(Math.random() * 3) + 4; // 0 is an option as well

        if(this.player.controlsdisabled)
            while(roadlane == this.player.lane)
                roadlane = dir == 0 ? Math.round(Math.random() * 3) : Math.round(Math.random() * 3) + 4; // 0 is an option as well

        var speed = 2.5 - Math.random(); 
        var xpos = dir == 0 ? canvas.width : 0 - 104; // car sprite width
        var x = speed < this.speed ? canvas.width : xpos;

        this.cars.push(new MidnightMotoristsCar(x, this.roadlanes[roadlane], dir, speed,  this.window_scale, this.rainTheme));
    }

    roadlinesShift(amountX){
        for(var i = 0; i < this.roadlines.length; i++){
            if(this.roadlines[i][1] < 0){
                this.roadlines.splice(0,1);
                continue;
            }
            this.roadlines[i][0] -= amountX;
            this.roadlines[i][1] -= amountX;   
            
            if(this.roadlines[i][0] <= 0 && !(this.roadlines[this.roadlines.length - 1][1] > canvas.width * 1.5)){
                var newdottedline = this.createLine(this.roadlineFrequency, this.roadlines[this.roadlines.length - 1][1], 1);
                this.roadlines.push(newdottedline[0]);
            }
        }
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
    
    drawLine(x1, y1, x2, y2, opacity, lineWidth){
        var color = opacity;
        ctx.strokeStyle = "rgb("+ color + "," + color + "," + color + ")"; 

		ctx.lineWidth = lineWidth;
		ctx.beginPath();

        ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke(); 
    }

    quit(){
        this.audioBackground.pause();
        this.audioMenu.pause();
    }
}