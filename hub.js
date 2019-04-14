class HubInterface{
    constructor(){
        this.page = []
        this.current_button = 0;
        this._current_page = 0;
        this.in_tranzit = false;

        this.createCanvases();
        
        for(let p = 0; p < Math.ceil(games.length / 6); p++){
            // var placement_x = canvas.width / 6 + (p * canvas.width / 1.15);  //distance between each wrapper
			// var placement_y = canvas.height / 3.5;
            
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
                    games[p * 6 + b], "test.png", games[0], this.ctx
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

        this.update();
    }

    set current_page(value){
        value = value - this._current_page;

        var self = this;
        var distance = self.canvas.width;
        this.interval = new Interval(function(){
            self.in_tranzit = true;
            if(distance > 0){
                distance -= 10;
                for(let p = 0; p < self.page.length; p++){
                    self.page[p].x -= 10 * value;
                }
                self.update();
            } else{
                self.in_tranzit = false;
                self.interval.stop();
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
    }

    checkCollisions(){

    }
    
    draw(){
        
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