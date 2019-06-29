class PacManPlayer{
    constructor(wall_settings, wall_map, offset, ctx, size = window.width / 128 /* = 15*/){
        this.x = 14.5;
        this.y = 24;
        this.speed = 0.1;
        this.offset = offset;
        this.ctx = ctx;
		
		this.eaten = false;
		this.nodraw = false;
		this.disablemovement = false;

        this.node = {
            x:14,
            y:24
        }

        this.powered = {
            state: 0,           // 0 = normal 1 = powered 2 = ending
            size:2,             // pixel in wh will expand
            timer:600, 			// times it will switch
            current_size: 0,    // max will be 3 (px)
            shrinking: false    // switch
        }
		
		this.drawing = [
			{
				arc1:1.75,
				arc2:1.25,
			},
			{
				arc1:0.25,
				arc2:1.75,
			},
			{
				arc1:0.75,
				arc2:0.25,
			},
			{
				arc1:1.25,
				arc2:0.75,
			},
			
			0.75
		];

        this.mouth_angle = 0.25;    // Math.PI * 0.25 = 45 degrees
        this.mouth_closing = true;  // switch

        this.angle = 3;             // up = 0, right = 1, down = 2, left = 3 
        this.radius = size;
        this.wall_map = wall_map;
        this.wall_settings = wall_settings;
    }

    update(){
        this.updateOwnNode();

		if(!this.disablemovement)
			this.keyHandler();
		
		if(!this.nodraw)
			this.draw();
    }

    keyHandler(){
        if(move.right || this.angle == 1){
            if(!this.isWall(this.speed, 0)){ // is it a wall?
                if(this.x + this.speed > this.node.x + 1){ // are we going past a node
                    this.x = this.node.x + 1; // make our location the node
                } else if(this.y == Math.round(this.y)){ // so we can move in an other direction
                    this.x += this.speed;
                    this.angle = 1;
                }
            } else {
                this.x = this.node.x;
            }
        }

        if(move.left || this.angle == 3){
            if(!this.isWall(-this.speed, 0)){
                if(this.x - this.speed < this.node.x - 1){
                    this.x = this.node.x - 1;
                } else if(this.y == Math.round(this.y)){
                    this.x -= this.speed;
                    this.angle = 3;
                }
            } else {
                this.x = this.node.x;
            }
        }

        // remove noise after four digits
        this.x = Math.round(this.x * 1000) / 1000;

        if(move.down || this.angle == 2){
            if(!this.isWall(0, this.speed)){
                if(this.y + this.speed > this.node.y + 1){
                    this.y = this.node.y + 1;
                } else if(this.x == Math.round(this.x)){
                    this.y += this.speed;
                    this.angle = 2;
                }
            } else {
                this.y = this.node.y;
            }
        }

        if(move.up || this.angle == 0){
            if(!this.isWall(0, -this.speed)){
                if(this.y - this.speed < this.node.y - 1){
                    this.y = this.node.y - 1;
                } else if(this.x == Math.round(this.x)){
                    this.y -= this.speed;
                    this.angle = 0;
                }
            } else {
                this.y = this.node.y;
            }
        }

        // remove noise after four digits
        this.y = Math.round(this.y * 1000) / 1000;

        // teleport part
        if(this.node.x == 28 && this.node.y == 15){
            this.x = 2; this.node.x = 2;} 
        else if(this.node.x == 1 && this.node.y == 15){
            this.x = 27; this.node.x = 27;}
    }

    draw(){
        this.ctx.fillStyle="black";
        if (this.powered.state == 1){ // go to powered state
            this.ctx.lineWidth = this.wall_settings.border_thickness - 2 + this.powered.current_size;
            if(this.powered.current_size < this.powered.size) // expand till 1.5
                this.powered.current_size += 0.125;
			
			if(this.powered.timer < 600 * 0.3)
				this.powered.state = 2;
				
			this.powered.timer--;

        } else if (this.powered.state == 2){ // switch between 0 and 1
            this.ctx.lineWidth = this.wall_settings.border_thickness - 2 + this.powered.current_size;

            // flicker
            if(this.powered.shrinking){
                this.powered.current_size -= 0.125;
                if (this.powered.current_size <= 0){
                    this.powered.current_size = 0;
                    this.powered.shrinking = false;
                }
            } else {
                this.powered.current_size += 0.125;
                if (this.powered.current_size >= this.powered.size){
                    this.powered.current_size = this.powered.size;
                    this.powered.shrinking = true;
                }
            }
			
			this.powered.timer--;

            if(this.powered.timer <= 0){
                this.powered.state = 0;     // set the state to default
                this.powered.timer = 600;    // reset the timer for the next activation
            }                 

        } else { // default == not in powered state
            this.ctx.lineWidth = this.wall_settings.border_thickness - 2 + this.powered.current_size;
            if(this.powered.current_size > 0) // shrink till 0
                this.powered.current_size -= 0.125;
        }

		var x = this.x + 0.5 + this.offset / this.wall_settings.size;	// position correction
		var y = this.y + 0.5;	// position correction

        this.ctx.beginPath();

        // move to the center of pacman
        this.ctx.moveTo(x * this.wall_settings.size, y * this.wall_settings.size);

        this.ctx.strokeStyle="white";
        this.ctx.beginPath();
        // then we draw the outline border
		
		// if eaten, pacman should disappear
		if(this.eaten){
			this.disablemovement = true;
			if(this.mouth_angle > 0) {
					this.mouth_angle -= 0.01;
			} else {	
				// as all arcs need to either be + or - 0.75 from its original value, it is ok to only check the first one
				if(this.drawing[this.drawing.length - 1] > 0.01){
					// skip the last one for it is the counter
					for(var d = 0; d < this.drawing.length - 1; d++){
						this.drawing[d].arc1 += 0.01;
						this.drawing[d].arc2 -= 0.01;
					}
					this.drawing[this.drawing.length - 1] -= 0.01;
					
				} else {
					this.nodraw = true;
				}
			}
		}

        // draw the border and a line to the middle
        if(this.angle == 0) {
            // draw the circle
            this.ctx.arc(x * this.wall_settings.size, y * this.wall_settings.size, this.radius, Math.PI * (this.drawing[0].arc1 - this.mouth_angle), Math.PI * (this.drawing[0].arc2 + this.mouth_angle), false); // up
            
            // 0.08 = graphical correction
            // calculate the position of the gap of the circle
            var x0 = x * this.wall_settings.size - 0.8 + this.radius * -Math.cos((this.drawing[0].arc1 - this.mouth_angle) * Math.PI);
            var y0 = y * this.wall_settings.size + 0.8 + this.radius * Math.sin((this.drawing[0].arc2 + this.mouth_angle) * Math.PI);  

            var x1 = x * this.wall_settings.size + 0.8 + this.radius * Math.cos((this.drawing[0].arc1 - this.mouth_angle) * Math.PI);
            var y1 = y * this.wall_settings.size + 0.8 + this.radius * Math.sin((this.drawing[0].arc2 + this.mouth_angle) * Math.PI);  

            // draw the lines
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);
			
        } else if(this.angle == 1) {
            this.ctx.arc(x * this.wall_settings.size, y * this.wall_settings.size, this.radius, Math.PI * (this.drawing[1].arc1 - this.mouth_angle), Math.PI * (this.drawing[1].arc2 + this.mouth_angle), false); // right
        
            // 0.08 = graphical correction
            // calculate the position of the gap of the circle
            var x0 = x * this.wall_settings.size - 0.8 + this.radius * Math.cos((this.drawing[1].arc1 - this.mouth_angle) * Math.PI);
            var y0 = y * this.wall_settings.size + 0.8 + this.radius * -Math.sin((this.drawing[1].arc2 + this.mouth_angle) * Math.PI);  

            var x1 = x * this.wall_settings.size + 0.8 + this.radius * Math.cos((this.drawing[1].arc1 - this.mouth_angle) * Math.PI);
            var y1 = y * this.wall_settings.size - 0.8 + this.radius * Math.sin((this.drawing[1].arc2 + this.mouth_angle) * Math.PI);  

            // draw the lines
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

        } else if(this.angle == 2) {
            this.ctx.arc(x * this.wall_settings.size, y * this.wall_settings.size, this.radius, Math.PI * (this.drawing[2].arc1 - this.mouth_angle), Math.PI * (this.drawing[2].arc2 + this.mouth_angle), false); // down
        
            // 0.08 = graphical correction
            // calculate the position of the gap of the circle
            var x0 = x * this.wall_settings.size + 0.8 + this.radius * -Math.cos((this.drawing[2].arc1 - this.mouth_angle) * Math.PI);
            var y0 = y * this.wall_settings.size + 0.8 + this.radius * Math.sin((this.drawing[2].arc2 + this.mouth_angle) * Math.PI);  

            var x1 = x * this.wall_settings.size - 0.8 + this.radius * Math.cos((this.drawing[2].arc1 - this.mouth_angle) * Math.PI);
            var y1 = y * this.wall_settings.size + 0.8 + this.radius * Math.sin((this.drawing[2].arc2 + this.mouth_angle) * Math.PI); 

            // draw the lines
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

        } else {
            this.ctx.arc(x * this.wall_settings.size, y * this.wall_settings.size, this.radius, Math.PI * (this.drawing[3].arc1 - this.mouth_angle), Math.PI * (this.drawing[3].arc2 + this.mouth_angle), false); // left
        
            // 0.08 = graphical correction
            // calculate the position of the gap of the circle
            var x0 = x * this.wall_settings.size + 0.8 + this.radius * Math.cos((this.drawing[3].arc1 - this.mouth_angle) * Math.PI);
            var y0 = y * this.wall_settings.size - 0.8 + this.radius * -Math.sin((this.drawing[3].arc2 + this.mouth_angle) * Math.PI);  

            var x1 = x * this.wall_settings.size - 0.8 + this.radius * Math.cos((this.drawing[3].arc1 - this.mouth_angle) * Math.PI);
            var y1 = y * this.wall_settings.size + 0.8 + this.radius * Math.sin((this.drawing[3].arc2 + this.mouth_angle) * Math.PI);  

            // draw the lines
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x * this.wall_settings.size, y * this.wall_settings.size);
        }

        this.ctx.stroke();

		if(!this.eaten){
			// this animates the mouth movement
			var closingSpeed = 0.068; // mouth movement speed, must be equal or below 0.25
			if(this.mouth_closing){
				this.mouth_angle -= closingSpeed;
				if (this.mouth_angle <= 0){
					this.mouth_angle = 0;
					this.mouth_closing = false;
				}
			} else {
				this.mouth_angle += closingSpeed;
				if (this.mouth_angle >= 0.25){
					this.mouth_angle = 0.2499; // making it larger than 0.25 results in a flicker as it can't draw the circle
					this.mouth_closing = true;
				}
			}        
		}
    }
    /**
     * checks if movement is possible. One variable must be 0 
     * @param {direction} x either positive, negative or 0
     * @param {direction} y either positive, negative or 0
     */
    isWall(x = 0, y = 0){
        if(x == 0 && y == 0){
            return false;
        }

        for (let i = 0; i < this.wall_map.length; i++){
            // if x is positive
			if(x > 0){
                if (y == 0){
                    if(Math.ceil(this.x + x) == this.wall_map[i].x && Math.round(this.y) == this.wall_map[i].y){
                        return true;
                    }
                }
            } 
            // if x is negative
            else if(x < 0){
                if (y == 0){
                    if(Math.floor(this.x + x) == this.wall_map[i].x && Math.round(this.y) == this.wall_map[i].y){
                        return true;
                    }
                }
            } 
            // if x is 0
            else if (x == 0){
                if(y > 0){
                    if(Math.floor(this.x) == this.wall_map[i].x && Math.ceil(this.y + y) == this.wall_map[i].y){
                        return true;
                    }
                } else if (y < 0){
                    if(Math.floor(this.x) == this.wall_map[i].x && Math.floor(this.y + y) == this.wall_map[i].y){
                        return true;
                    }
                }
            }
        }

        return false;
    }

    updateOwnNode(){
        if(this.x + this.speed > this.node.x + 1)
            this.node.x += 1;

        if(this.x - this.speed < this.node.x - 1)
            this.node.x -= 1;

        if(this.y + this.speed > this.node.y + 1)
            this.node.y += 1;

        if(this.y - this.speed < this.node.y - 1)
            this.node.y -= 1;
    }
}