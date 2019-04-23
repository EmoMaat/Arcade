class HubInterface{
    constructor(){
        move.continuous = false;
        this.page = []
        this.current_button = 0;
        this._current_page = 0;
        this.in_tranzit = false;

        this.createCanvases();
        
        for(let p = 0; p < Math.ceil(games.length / 6); p++){
            this.page[p] = {
                _x: (this.canvas.width / 2) * (p + 1),  // always middle of the screen (centered)
				y: this.canvas.height / 2,            // always middle of the screen (centered)
                buttons: [],

                set x (value){
                    value = value - this._x;
                    this._x += value;

                    for(let b = 0; b < this.buttons.length; b++)
                        this.buttons[b].x += value;
					
				}, get x(){ return this._x; },
            };

            let querryButtons = games.length - p * 6 > 6 ? 6 : games.length - p * 6;
            for(let b = 0; b < querryButtons; b++){
                // if b > 2 a new row should be made
                let positioner_x = b < 3 ? b : b - 3;
                // 0.25 * b - half its width is the correct horizontal alignment
                let placement_x = this.canvas.width * ((positioner_x + 1) * 0.25) - this.canvas.width / 12.6;
                let placement_y = b < 3 ? this.canvas.height / 25: this.canvas.height / 2;

                this.page[p].buttons.push(new HubButton(
                    placement_x + this.canvas.width * p, 
                    placement_y, 
                    games[p * 6 + b], 
                    games[p * 6 + b].replace(/\s/g, ''), 
                    this.ctx
                ));
            }
        }

        interfaces.hub.active = true;
        interfaces.hub.object = this;

        move._right.setEventListener(()=>{
            if((this.current_button == 2 || this.current_button == 5) && !this.in_tranzit){
                if(this.current_page + 1 < this.page.length)
                    // if on the next page there are not enough buttons to switch from the bottom lane to the next,
                    // select the top button 
                    if(this.page[this.current_page + 1].buttons.length > 2){
                        this.current_page += 1;
                        // if this.current_button != 2, it is 5
                        this.current_button = this.current_button == 2 ? 0 : 3;
                    } else{
                        this.current_page += 1;
                        this.current_button = 0;
                    }
            } else if(!this.in_tranzit && this.current_button + 1 < this.page[this.current_page].buttons.length){
                this.current_button++;
            }
            this.update();
        });

        move._left.setEventListener(()=>{
            if((this.current_button == 0 || this.current_button == 3) && !this.in_tranzit){
                if(this.current_page - 1 >= 0){
                        this.current_page -= 1;
                        this.current_button = this.current_button == 0 ? 2 : 5;
                    }
            } else if(!this.in_tranzit)
                this.current_button--;
            this.update();
        });

        move._up.setEventListener(()=>{
            if(this.current_button > 2 && !this.in_tranzit){
                this.current_button -=3;
                this.update();
            }
        });

        move._down.setEventListener(()=>{
            if(this.current_button < 3 && !this.in_tranzit && this.current_button + 3 < this.page[this.current_page].buttons.length - 1){
                this.current_button +=3;
                this.update();
            }
        });

        this.interval = new Interval(()=>{
            if(map[13] || gmap[0].ButtonA){
                loadingBar(this.page[this.current_page].buttons[this.current_button].text, this.page[this.current_page].buttons[this.current_button].game)
            }
        });

        this.update();
    }

    exit(){
        interfaces.hub.object = {};
        interfaces.hub.active = false;
        this.interval.stop()
    }

    // change the current page upon vallue change
    set current_page(value){
        value = value - this._current_page;

        this.in_tranzit = true;

        var self = this;
        var distance = self.canvas.width;
        this.cp_interval = new Interval(function(){
            if(distance > 0){
                distance -= 20;
                for(let p = 0; p < self.page.length; p++){
                    self.page[p].x -= 20 * value;
                }
                self.update();
            } else{
                self.in_tranzit = false;
                self.cp_interval.stop();
                self.update();
            }
        }); 

        this._current_page += value;
    }
    get current_page(){ return this._current_page };

    update(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let p = 0; p < this.page.length; p++){
            for(let b = 0; b < this.page[p].buttons.length; b++){
                if(p == this.current_page){
                    this.page[p].buttons[b].selected = b == this.current_button;
                    this.page[p].buttons[b].update();
                } else {
                    this.page[p].buttons[b].selected = false;
                    this.page[p].buttons[b].update();
                }
            } 
        }

        /////
        // create the triangles
        /////

        //halfwidthx = half the distance between most left item and left side of the bar under "GAME HUB"
		var halfwidthx = (this.canvas.width / 10 * 9 - (this.canvas.width / 6 * 2 + (this.canvas.width / 4.0186046511627906976744186046512) * 2)) / 2;
		//halfwidthy = half the distance between the middle and an item
		var halfwidthy = this.canvas.height / 2 - (this.canvas.height / 4 + this.canvas.height / 8.5);
		
		// check if we should make arrows pointing up or down
		if(this.current_page - 1 >= 0 && !this.in_tranzit){			
			var x1 = this.canvas.width / 10 - (halfwidthx * 1.3);
			var x2 = this.canvas.width / 10;
			var x3 = this.canvas.width / 10;
			
			var y1 = this.canvas.height / 1.55 - halfwidthy * 2;
			var y2 = this.canvas.height / 1.55 - halfwidthy * 1.45;
			var y3 = this.canvas.height / 1.55 - halfwidthy * 1.25 - (halfwidthy * 1.25);
			
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.ctx.lineTo(x3, y3);
			
			this.ctx.fillStyle = "#fff";
			this.ctx.fill();
		}
		if(this.current_page + 1 !== this.page.length && !this.in_tranzit){
			var x1 = this.canvas.width / 10 * 9 + (halfwidthx * 1.3);
			var x2 = this.canvas.width / 10 * 9;
			var x3 = this.canvas.width / 10 * 9;
			
			var y1 = this.canvas.height / 1.55 - halfwidthy * 2;
			var y2 = this.canvas.height / 1.55 - halfwidthy * 1.45;
			var y3 = this.canvas.height / 1.55 - halfwidthy * 1.25 - (halfwidthy * 1.25);
			
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.ctx.lineTo(x3, y3);
			
			this.ctx.fillStyle = "#fff";
			this.ctx.fill();
		}
    }

    createCanvases(){
        let HubHeader = document.createElement('canvas');
		HubHeader.id = 'HubHeader';
		HubHeader.width = canvas.width;
		HubHeader.height = canvas.height / 3.2;
		HubHeader.style.left = 0;
		HubHeader.style.position = "absolute";
		HubHeader.style.cursor = "none";
		document.body.appendChild(HubHeader);

		this.HubHeaderCanvas = document.getElementById("HubHeader");		// canvas stuff
        this.HubHeaderCtx = this.HubHeaderCanvas.getContext("2d");			        // canvas stuff

        let HubInterface = document.createElement('canvas');
		HubInterface.id = 'HubInterface';
		HubInterface.width = canvas.width;
		HubInterface.height = Math.ceil(canvas.height - canvas.height / 3.2);
		HubInterface.style.top = Math.floor(canvas.height / 3.2);
		HubInterface.style.left = 0;
		HubInterface.style.position = "absolute";
		HubInterface.style.cursor = "none";
		document.body.appendChild(HubInterface);

		this.canvas = document.getElementById("HubInterface");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");			        // canvas stuff

		// the title and the line
		this.HubHeaderCtx.fillStyle = "#fff";
		this.HubHeaderCtx.font = "100px segoe ui";
		this.HubHeaderCtx.textAlign = "center";
		this.HubHeaderCtx.fillText("GAME HUB",this.HubHeaderCanvas.width/2,this.HubHeaderCanvas.height/1.75 - 40);
		
		this.HubHeaderCtx.beginPath();
		this.HubHeaderCtx.strokeStyle = "#fff";
		this.HubHeaderCtx.moveTo(this.HubHeaderCanvas.width/10,this.HubHeaderCanvas.height/1.5);
		this.HubHeaderCtx.lineTo(this.HubHeaderCanvas.width/10*9,this.HubHeaderCanvas.height/1.5);
		this.HubHeaderCtx.lineWidth = 4;
		this.HubHeaderCtx.stroke();
		this.HubHeaderCtx.closePath();
    }
}

function loadingBar(text, game){
    if(document.getElementById("loadingBar") != null)
        return console.log("A loading bar is already active")

    exit_open_game();
    exit_open_interfaces();
    remove_all_canvases();
    
    currentGame = game;

    // create a element
    let loadingBar = document.createElement('canvas');
    loadingBar.id = 'loadingBar';
    loadingBar.width = canvas.width;
    loadingBar.height = canvas.height;
    loadingBar.style.position = "absolute";
    loadingBar.style.cursor = "none";
    document.body.appendChild(loadingBar);

    var lcanvas = document.getElementById("loadingBar");		// canvas stuff
    var ctx = lcanvas.getContext("2d");			        // canvas stuff

    // We draw a fake progressbar
    var counter = 0, factor = 1;
	var timer = new Interval(() => { // timer function for progress bar
		counter = counter + factor;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.font = '48pt Segoe UI';
		ctx.strokeStyle = "rgb(50, 50, 50)"; 
		ctx.textAlign = "center";
		
		ctx.fillText("Loading " + text + "...", canvas.width / 2, 500 + 24 /* fontHeight / 2*/);
	
		ctx.beginPath();
		ctx.lineWidth = 14;
		ctx.rect(canvas.width / 4, 600, canvas.width / 2 , 30); 
		ctx.fillStyle = '#fff'; 
		ctx.fillRect(canvas.width / 4, 600, counter * (canvas.width / 2) / 100, 30);
		
		ctx.stroke();
		ctx.closePath();
		
		// setting the progressvalue of the bar
		if (counter >= 10 && counter <= 59) {
			damping = Math.floor(Math.random() * (300 - 25)) + 6;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter >= 60 && counter < 100) {
			damping = Math.floor(Math.random() * (50 - 25)) + 3;
			factor = Math.max((100 - counter) / damping, '0.5');
		} else if (counter > 100) {
			// remove the loading bar
            timer.stop();

            // start the given function
            load(game)
		};
	}, 20);
}

function load(game){
    exit_open_game();
    exit_open_interfaces();
    remove_all_canvases();

    // make sure () only appears once
    eval(game.replace("()", '') + "()");
}