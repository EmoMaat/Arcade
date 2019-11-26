class LunarLanderPlayer{
    constructor(canvas, fuel){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.windowOffsetX = canvas.width / 2 - window.width / 4;

        this.result = [];

        this.radians = 0;
        this.fuel = 800;
        this.thrust = 0;
        this.height = 25;

        this.hitbox = [
            {
                x:0 * window.scale + this.windowOffsetX,
                y:0 * window.scale + canvas.height / 4
            },
            {
                x:this.height * window.scale + this.windowOffsetX,
                y:0           * window.scale + canvas.height / 4
            },
            {
                x:0           * window.scale + this.windowOffsetX,
                y:this.height * window.scale + canvas.height / 4
            },
            {
                x:this.height * window.scale + this.windowOffsetX,
                y:this.height * window.scale + canvas.height / 4
            },
        ];

        // The current matrix for rotation purposes
        this.matrix = [
            {x: 1,  y: 0,  z: 0},
            {x: 0,  y: 1,  z: 0}
        ];

        this.updateZoomHitbox = false;
    }

    update(){
        this.UserInputHandler();
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

    rotate(angle){
        // Precalculate some values
        let hitbox_x = Math.round(this.hitbox[0].x),
            hitbox_y = Math.round(this.hitbox[0].y),
            height = Math.floor(this.height / 3)        // IDK why it has to be 3 instead of 2

        // Translate to the center of the player
        this.translate(hitbox_x + height, hitbox_y + height);

        // Calculate the new matrix of the player
        let cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.transform(cos, -sin, 0, sin, cos, 0);

        // translate back
        this.translate(-hitbox_x - height, -hitbox_y - height);
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

        // Multiply the matrices
        newMatrix[0].x = this.matrix[0].x * x0 + this.matrix[0].y * x1;
        newMatrix[0].y = this.matrix[0].x * y0 + this.matrix[0].y * y1;
        newMatrix[0].z = this.matrix[0].x * z0 + this.matrix[0].y * z1 + this.matrix[0].z;

        newMatrix[1].x = this.matrix[1].x * x0 + this.matrix[1].y * x1;
        newMatrix[1].y = this.matrix[1].x * y0 + this.matrix[1].y * y1;
        newMatrix[1].z = this.matrix[1].x * z0 + this.matrix[1].y * z1 + this.matrix[1].z;

        // Make the identity matrix equal to the temp
        this.matrix = newMatrix;
    }

    draw(){
        let hitbox = this.processHitbox();
        this.ctx.globalAlpha = 1;
        this.ctx.strokeStyle = "red";

        if(hitbox.length > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(hitbox[0].x, hitbox[0].y);

            for(var i = 1, p; p = hitbox[i++];)
                this.ctx.lineTo(p.x, p.y);

            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
}