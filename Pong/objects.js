class PongPlayer{
    constructor(type, PlayerCanvas){
        this.type = type;
        this.ctx = PlayerCanvas.getContext("2d"); // we get the canvas only, meaning we should get the context
        this.canvas = PlayerCanvas;

        this.points = 0;
        this.hitpoint = null;

        this.y = this.canvas.offsetTop;
        this.x = this.canvas.offsetLeft;
        this.center = this.y + this.canvas.height / 2;
    }

    CalculatePath(target, window_scale){
        if(this.hitpoint == null)
            this.hitpoint = this.newHitpoint();

        let speed = this.CalculateMovement(this.center + this.hitpoint, target, this.speed)

        if(this.y + this.canvas.height + speed > 1020 * window_scale)
            this.y = 1020 * window_scale - this.canvas.height - speed;

        if(this.y - speed < 50 * window_scale)
            this.y = 50 * window_scale + speed;

        this.move(speed);
    }

    newHitpoint(){
		let min = 0;  // center
		let max = 0.45; // max distance in percent (50% is absolute max)
		
		if(Math.random() < 0.5){ // below center
			return -(Math.randombetween(min,max) * this.canvas.height / 2);
		} else { // above center
			return Math.randombetween(min,max) * this.canvas.height / 2;
		}
	}

    /**
     * calculates the max speed towards a point
     * @param {*} p1 place you are
     * @param {*} p2 place to go to
     * @param {*} max max speed
     */
    CalculateMovement(p1, p2, max){
        var diff = -(p1 - p2);
        
        if(diff < 0 && diff < -(max - 1)) { // max speed left
            diff = -max;
        } else if(diff > 0 && diff > max - 1) { // max speed right
            diff = max;
        }
        return diff;
    }

    draw(){
		this.ctx.fillStyle = "#fff";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.stroke();
		this.ctx.closePath();
    }
    
    move(movement){
        this.canvas.style.top = this.y += movement;
        this.center = this.y + this.canvas.height / 2;
    }
}

class PongBall{
    constructor(BallCanvas){
        this.canvas = BallCanvas;
        this.ctx = BallCanvas.getContext("2d"); // we get the canvas only, meaning we should get the context
        this.SpawnTimer = 120;  // 2 sec countdown
        this.scored = false;

        // calculate the center of the canvas
        this.x = this.canvas.offsetLeft + this.canvas.width / 2;
        this.y = this.canvas.offsetTop + this.canvas.height / 2;
        this.radius = this.canvas.width / 2;

        // speed and angle 
        this.speed = 10;
        this.radians = Math.random() > 0.5 ? Math.randombetween(-(Math.PI / 4), (Math.PI / 4)) : Math.randombetween(Math.PI - (Math.PI / 4), Math.PI + (Math.PI / 4));
    }

    draw(){
        this.ctx.fillStyle = "#fff";
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2 , this.canvas.height / 2, this.radius,0,2*Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
    }

    move(){
        this.velocityX = Math.cos(this.radians) * this.speed;
        this.velocityY = Math.sin(this.radians) * this.speed;    

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.canvas.style.left = this.x - this.canvas.width / 2;
        this.canvas.style.top = this.y - this.canvas.height / 2;
    }

    /**
     * 
     * @param {string} dir x or y, specifying if it bounced along the x or y axis
     * @param {*} position set a forced position
     */
    bounce(dir, position){
        if(dir == "y"){
            this.radians = Math.PI * 2 - this.radians ;
            this.canvas.style.top = this.y = position;
        }
        if(dir == "x"){
            this.radians = Math.PI - this.radians;
            this.canvas.style.left = this.x = position;
        }

        this.speed += Math.randombetween(0.4, 0.9)
    }
}
