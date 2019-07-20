class LunarLanderPlayer{
    constructor(){
        this.hitbox = [
            {
                x:100 * window.scale,
                y:100 * window.scale
            },
            {
                x:125 * window.scale,
                y:100 * window.scale
            },
            {
                x:100 * window.scale,
                y:125 * window.scale
            },
            {
                x:125 * window.scale,
                y:125 * window.scale
            },
        ];

        this.updateZoomHitbox = false;

        this.initCanvas();
    }

    initCanvas(){
        let player = document.createElement('canvas');
        player.id = 'player';
        player.width = this.hitbox[1].x - this.hitbox[0].x;
        player.height = this.hitbox[2].y - this.hitbox[0].y;
        player.style.left = this.hitbox[0].x;
        player.style.top = this.hitbox[0].y;
        player.style.position = "absolute";
        player.style.cursor = "none";
        player.style.zIndex = 999;
        document.body.appendChild(player);

        this.canvas = document.getElementById("player");		// canvas stuff
        this.ctx = this.canvas.getContext("2d");
    }

    update(){
        this.UserInputHandler();
        this.PositionHandler();
        this.draw();
    }

    UserInputHandler(){
        // this.velX += Math.sin(this.radians) * this.thrust;
        // this.velY += -Math.cos(this.radians) * this.thrust;
        if(move.left){
            this.updateZoomHitbox = true;
            
            for(let h = 0; h < this.hitbox.length; h++)
                this.hitbox[h].x -= 3;
        }
        if(move.right){
            this.updateZoomHitbox = true;
            for(let h = 0; h < this.hitbox.length; h++)
                this.hitbox[h].x += 3;
        }
        if(move.up){
            this.updateZoomHitbox = true;
            for(let h = 0; h < this.hitbox.length; h++)
                this.hitbox[h].y -= 3;
        }
        if(move.down){
            this.updateZoomHitbox = true;
            for(let h = 0; h < this.hitbox.length; h++)
                this.hitbox[h].y += 3;
        }
    }

    PositionHandler(){}

    draw(){
        this.canvas.width = this.hitbox[1].x - this.hitbox[0].x;
        this.canvas.height = this.hitbox[2].y - this.hitbox[0].y;
        this.canvas.style.left = this.hitbox[0].x;
        this.canvas.style.top = this.hitbox[0].y;

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(0,0,this.hitbox[3].x - this.hitbox[0].x, this.hitbox[3].y - this.hitbox[0].y);
    }
}