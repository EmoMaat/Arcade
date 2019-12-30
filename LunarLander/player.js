class LunarLanderPlayer{
    constructor(canvas, fuel){
        this.windowOffsetX = canvas.width / 2 - window.width / 2;
        this.size = 25;

        this._radians = 0; // Real value is set below
        this.radiansAltered = false;

        this.fuel = 800;
        this.height = 300;
        this.thrust = 0;
        this.rotationVelocity = 0;

        this.hitbox = [
            {
                x:0 *         window.scale + this.windowOffsetX,
                y:0 *         window.scale + canvas.height / 4
            },
            {
                x:this.size * window.scale + this.windowOffsetX,
                y:0         * window.scale + canvas.height / 4
            },
            {
                x:0         * window.scale + this.windowOffsetX,
                y:this.size * window.scale + canvas.height / 4
            },
            {
                x:this.size * window.scale + this.windowOffsetX,
                y:this.size * window.scale + canvas.height / 4
            },
        ];

        this.initCanvas();

        // The current matrix for rotation purposes
        this.matrix = [
            {x: 1,  y: 0,  z: 0},
            {x: 0,  y: 1,  z: 0}
        ];

        this.rotate(0);
    }

    update(){
        this.UserInputHandler();
        this.draw();
    }

    UserInputHandler(){
        if(move.left){
            this.rotate(-Math.PI / 128);
        }
        if(move.right){
            this.rotate(Math.PI / 128);
        }

        if(move.up){
            this.thrust += 0.1;
        }
        if(move.down){
            this.thrust = 0;
        }

        let velX = Math.cos(this.radians) * this.thrust;
        let velY = Math.sin(this.radians) * this.thrust;

        // console.log(velX, velY)
        console.log(this.radians)

        for(let h = 0; h < this.hitbox.length; h++){
            this.hitbox[h].x += velX;
            this.hitbox[h].y += velY;
        }
    }

    processHitbox(){
        // Store the transformation in a new object, which can be retrieved
        let transformed = [];
        for (let h = 0; h < this.hitbox.length; h++) {
            let x = this.hitbox[h].x * this.matrix[0].x + this.hitbox[h].y * this.matrix[0].y + this.matrix[0].z,
                y = this.hitbox[h].x * this.matrix[1].x + this.hitbox[h].y * this.matrix[1].y + this.matrix[1].z;

            transformed.push({
                x: x,
                y: y
            });
        }

        return transformed;
    }

    rotate(radians){
        // Update the radians
        this.radians += radians;

        // Precalculate some values
        let hitbox_x = Math.round(this.hitbox[0].x),
            hitbox_y = Math.round(this.hitbox[0].y),
            size = Math.abs(this.hitbox[1].x - this.hitbox[0].x) / 2

        // Translate to the center of the player
        this.translate(hitbox_x + size, hitbox_y + size);

        // Calculate the new matrix of the player
        let cos = Math.cos(radians),
            sin = Math.sin(radians);
        this.transform(cos, -sin, 0, sin, cos, 0);

        // translate back
        this.translate(-hitbox_x - size, -hitbox_y - size);
    }

    translate(z0, z1) {
        this.transform(1, 0, z0, 0, 1, z1);
    }

    /**
     * Multiplies a with the matrix
     * @param {Array} matrix
     */
    transform(x0, y0, z0, x1, y1, z1){
        // Make an empty copy of the matrix
        let newMatrix = [
            {x: 0,  y: 0,  z: 0},
            {x: 0,  y: 0,  z: 0}
        ];

        // // Multiply the matrices
        newMatrix[0].x = this.matrix[0].x * x0 + this.matrix[0].y * x1;
        newMatrix[0].y = this.matrix[0].x * y0 + this.matrix[0].y * y1;
        newMatrix[0].z = this.matrix[0].x * z0 + this.matrix[0].y * z1 + this.matrix[0].z;

        newMatrix[1].x = this.matrix[1].x * x0 + this.matrix[1].y * x1;
        newMatrix[1].y = this.matrix[1].x * y0 + this.matrix[1].y * y1;
        newMatrix[1].z = this.matrix[1].x * z0 + this.matrix[1].y * z1 + this.matrix[1].z;

        // Make the identity matrix equal to the temp
        this.matrix = newMatrix;
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

    draw(){
        let hitbox = this.processHitbox();

        this.canvas.width = this.hitbox[0].x - this.hitbox[1].x;
        this.canvas.height = this.hitbox[0].y - this.hitbox[2].y;

        this.canvas.style.left = hitbox[0].x - window.width / 2;
        this.canvas.style.top  = hitbox[0].y

        this.canvas.style.transform = "rotate(" + this.radians * (180 / Math.PI) + "deg)";
        this.canvas.style.transformOrigin = "0% 0%";

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(0,0,this.hitbox[3].x - this.hitbox[0].x, this.hitbox[3].y - this.hitbox[0].y);
    }

    orientation(){
        // Check if east
        if(this._radians < Math.PI * (1/4) || this._radians > Math.PI * (7/4))
            return 'north';
        else if(this._radians < Math.PI * (3/4) && this._radians > Math.PI * (1/4))
            return 'east';
        else if(this._radians < Math.PI * (5/4) && this._radians > Math.PI * (3/4))
            return 'south';
        else
            return 'west';
    }

    set radians(value){
        this._radians = value;

        // If the orientation is larger than 2 PI, subtract it.
        while(this._radians >= Math.PI * 2)
            this._radians -= Math.PI * 2;

        // If the orientation is below 0, add 2 PI
        while(this._radians < 0)
            this._radians += Math.PI * 2;
    } get radians(){ return this._radians; }
}