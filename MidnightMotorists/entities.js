class MidnightMotoristsPlayer{
    constructor(x, roadlanes, window_scale, rainTheme, ctx){
        this.roadlanes = roadlanes;
        this.speed = 10;
        this.kmph = 0;
        this.lap = 0;
    
        this.defaultcrashtime = 1000;
        this.crashtime = 0;
        this.angle = 0;
        this.crash = false;

        this.ctx = ctx;
        this.sprite = new Image();
        this.sprite.src = rainTheme ? "MidnightMotorists/sprites/player-n.png" : "MidnightMotorists/sprites/player.png";

        this.random = Math.random();
        this.lane = this.random > 0.5 ? 3 : 4;
        this.x = x;
        this.y = this.random > 0.5 ? roadlanes[3] : roadlanes[4]; // y in px, center.

        this.linetimer = 0;
        this.controlsdisabled = false;

		this.window_scale = window_scale;
        this.height = 77 * this.window_scale;
        this.width = 104 * this.window_scale;
    }

    update(){
        // middle line pushing
        if(this.y > window.height / 2 - this.width / 3 && this.y < window.height / 2){
            this.linetimer++;
            if(this.linetimer > 20){
                this.y--;
            }
        } else if(this.y >= window.height / 2 && this.y < window.height / 2 + this.width / 3){
            this.linetimer++;
            if(this.linetimer > 20){
                this.y++;
            }
        } else if(this.linetimer > 0){
            this.linetimer -= 0.5;
        }        

        this.keyhandler();
        this.draw();
    }

    keyhandler(){
        if(!this.controlsdisabled){
            if(move.up){
                if(this.y >= this.roadlanes[0]){
                    this.y -= this.speed;
                }
            }
            if(move.down){
                if(this.y <= this.roadlanes[7]){
                    this.y += this.speed;
                }
            }
            if(move.left){
                if(this.x >= window.width / 64){
                    this.x -= this.speed;
                }
            }
            if(move.right){
                if(this.x <= window.width - this.width - (window.width / 64)){
                    this.x += this.speed;
                }
            }
        }
    }

    draw(){
        if(this.crash){
            this.angle -= 0.2;

            if(this.crashtime < 0){
                this.crash = false;
                this.crashtime = 0;
                this.speed = 10;
            } else

            if(this.crashtime > 0)
                this.crashtime -= 15;
            else if(this.crashtime == 0){
                this.crashtime = this.defaultcrashtime;
                this.speed = 0;
            }

            this.ctx.save();                                                         // save the rest of the canvas
            this.ctx.translate(this.x + this.width / 2, this.y);                     // set the rotation point
            this.ctx.rotate(this.angle);                                             // rotate the image
            this.ctx.drawImage(this.sprite, -(this.width / 2), -(this.height / 2));  // draw
            this.ctx.restore();                                                      // restore the rest of the canvas
        } else
            this.ctx.drawImage(this.sprite, this.x, this.y - this.height / 2, this.sprite.width * this.window_scale, this.sprite.height * this.window_scale);

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle ="white";
        this.ctx.fillText("LAP:   " + (this.lap + 1),10,100); 
        this.ctx.fillText("KMPH:   " + Math.round(this.kmph),10,150); 
    }

    drawLine(x1, y1, x2, y2, opacity, lineWidth){
        var color = opacity;
        this.ctx.strokeStyle = "rgb("+ color + "," + color + "," + color + ")"; 
        //this.ctx.strokeStyle = "yellow";

		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();

        this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke(); 
    }
}

class MidnightMotoristsCar{
    constructor(x, lane, sprite, speed, window_scale, ctx){
        this.x = x; 
        this.y = lane; // y in px, center. SHOULD NOT CHANGE
        this.sprite = sprite;
        this.speed = speed;

        this.ctx = ctx;
		this.window_scale = window_scale;
        
        this.height = 73 * this.window_scale;
        this.width = 104 * this.window_scale;
    }

    update(){        
        this.ctx.drawImage(this.sprite, this.x, this.y - this.height / 2, this.sprite.width * this.window_scale, this.sprite.height * this.window_scale);
    }
}