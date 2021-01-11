class MidnightMotoristsPlayer{
    constructor(x, roadlanes, rainTheme){
        this.roadlanes = roadlanes;
        this.speed = 10;
        this.kmph = 0;
        this.lap = 0;
    
        this.defaultcrashtime = 1000;
        this.crashtime = 0;
        this.angle = 0;
        this.crash = false;

        this.sprite = new Image();
        this.sprite.src = rainTheme ? "MidnightMotorists/sprites/player-n.png" : "MidnightMotorists/sprites/player.png";

        this.random = Math.random();
        this.lane = this.random > 0.5 ? 3 : 4;
        this.x = x;
        this.y = this.random > 0.5 ? roadlanes[3] : roadlanes[4]; // y in px, center.

        this.linetimer = 0;
        this.controlsdisabled = false;

        this.height = 73;
        this.width = 104;
    }

    update(){
        if(this.y > canvas.height / 2 - this.width / 3 && this.y < canvas.height / 2){
            this.linetimer++;
            if(this.linetimer > 20){
                this.y--;
            }
        }else if(this.y >= canvas.height / 2 && this.y < canvas.height / 2 + this.width / 3){
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
                if(this.x >= canvas.width / 64){
                    this.x -= this.speed;
                }
            }
            if(move.right){
                if(this.x <= canvas.width - this.width - (canvas.width / 64)){
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

            ctx.save();                                                         // save the rest of the canvas
            ctx.translate(this.x + this.width / 2, this.y);                     // set the rotation point
            ctx.rotate(this.angle);                                             // rotate the image
            ctx.drawImage(this.sprite, -(this.width / 2), -(this.height / 2));  // draw
            ctx.restore();                                                      // restore the rest of the canvas
        } else
            ctx.drawImage(this.sprite, this.x, this.y - this.height / 2);

        ctx.font = "30px Arial";
        ctx.fillStyle ="white";
        ctx.fillText("LAP:   " + this.lap,10,100); 
        ctx.fillText("KMPH:   " + Math.round(this.kmph),10,150); 
    }

    drawLine(x1, y1, x2, y2, opacity, lineWidth){
        var color = opacity;
        ctx.strokeStyle = "rgb("+ color + "," + color + "," + color + ")"; 
        //ctx.strokeStyle = "yellow";

		ctx.lineWidth = lineWidth;
		ctx.beginPath();

        ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke(); 
    }
}

class MidnightMotoristsCar{
    constructor(x, lane, direction, speed, rainTheme){
        this.x = x; 
        this.y = lane; // y in px, center. SHOULD NOT CHANGE
            
        this.sprite = new Image();
        this.dir = direction;
        
        if(this.dir == 0){
            this.sprite.src = rainTheme ? "MidnightMotorists/sprites/dir0-n.png" : "MidnightMotorists/sprites/dir0.png";
            this.speed = -speed; // going forwards
        } else {
            this.sprite.src = rainTheme ? "MidnightMotorists/sprites/dir1-n.png" : "MidnightMotorists/sprites/dir1.png";
            this.speed = speed; // going backwards
        }

        this.height = 73;
        this.width = 104;
    }

    update(){
        this.x += this.speed;

        this.draw();
    }

    draw(){
        ctx.drawImage(this.sprite, this.x, this.y - this.height / 2);
    }
}