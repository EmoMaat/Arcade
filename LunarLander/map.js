class LunarLanderMap{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        // If this is true, the player has collided with the map
        this.playerCollision = false;

        // Is the x position of the left side of the window showing the map
        this.windowOffsetX = canvas.width / 2 - window.width / 2;

        // Contains the field which dictates whether the map should move instead of the player
        this.movehitbox = [
            {x: this.windowOffsetX + window.width * 0.2, y: window.height * 0.2},
            {x: this.windowOffsetX + window.width * 0.8, y: window.height * 0.8}
        ];

        // Moves the canvas to the center of the screen
        this.canvas.style.marginLeft -= this.windowOffsetX;

        // Contains all the terrain points
        this.terrain = [];

        // Contains all the langding spots point
        this.landingspot = {
            "1x":[],
            "2x":[],
            "4x":[],
            "5x":[]
        }

        // The zoom container
        this.zoom = {
            current:null,
            min:null,
            max:5,       // the zoom can only be 2x the original. This value will be overwritten with an absolute value
            strength:1.01,  // the speed of the zoom

            in_area: 200,
            out_area:400,
            hidden:false,
        }

        this.WIDTH = this.canvas.width;                 // Width of the map created
        this.MAX_HEIGHT = this.canvas.height * 0.4;
        this.MIN_HEIGHT = this.canvas.height;

        this.INIT_VECTORS = 6;          // how many points we want in each iteration
        this.INIT_MAX_ANGLE = 1;
        this.INIT_STUTTER_ANGLE = 3;    // the angle of a random mountain/trench in the terrain

        this.SMOOTH_MAX_ANGLE = 0.5;    // the max angle a smoothing can have
        this.SMOOTH_VECTORS = 4;        // how many vectors we want to push between vectors
        this.SMOOTH_ITERATIONS = 2;     // how many times we loop between points

        this.SPAWN_5X_CHANCE = 0.15;
        this.SPAWN_4X_CHANCE = 0.25;
        this.SPAWN_2X_CHANCE = 0.3;

        this.generate();

        // set the min, current and max
        this.zoom.min = this.zoom.current = Math.abs(this.terrain[2].x - this.terrain[1].x);
        this.zoom.max = this.zoom.min * this.zoom.max;

        this.ctx.fillStyle = "grey";
    }

    generate(){
        // generate rough terrain
        for(let vectorID = 0; vectorID < this.INIT_VECTORS + 1; vectorID++){
            let xPos, yPos;

            // we need to define the first one as there are no previous points
            if(vectorID == 0){
                xPos = vectorID * (this.WIDTH / this.INIT_VECTORS);
                yPos = Math.random() * (this.MIN_HEIGHT) + this.MAX_HEIGHT;
            } else {
                // get the previous vector to calculate the a new angle
                let _xPos = this.terrain[vectorID - 1].x;
                let _yPos = this.terrain[vectorID - 1].y;

                xPos = vectorID * (this.WIDTH / this.INIT_VECTORS);

                // calculate a random angle and random direction
                // and make sure it does not shoot out of the playfield
                // angle = (_yPos - yPos) / (_xPos - xPos) ==> yPos = angle * (_xPos - xPos) + _yPox
                let angle = Math.random() > 0.8 ? Math.random() * this.INIT_STUTTER_ANGLE : Math.random() * this.INIT_MAX_ANGLE;
                if(Math.random() >= 0.5)
                    if(angle * (_xPos - xPos) + _yPos <= this.MAX_HEIGHT)
                        yPos = -angle * (_xPos - xPos) + _yPos;
                    else
                        yPos = angle * (_xPos - xPos) + _yPos;
                else
                    if(-angle * (_xPos - xPos) + _yPos >= this.MIN_HEIGHT)
                        yPos = angle * (_xPos - xPos) + _yPos
                    else
                        yPos = -angle * (_xPos - xPos) + _yPos;
            }
            this.terrain.push(this.vector(xPos, yPos))
        }

        // smoother
        for(let iteration = 0; iteration < this.SMOOTH_ITERATIONS; iteration++){        // for each iteration
            for(let terrain_vector_id = this.terrain.length - 1; terrain_vector_id > 0;){     // get the position of which we are trying to smooth

                // store all smoothing in an array and add it later to the terrain
                let smoothed_vectors = [];

                // calculate the original slope which the plain terrain followed
                let line_slope = -(this.terrain[terrain_vector_id].y - this.terrain[terrain_vector_id - 1].y) / (this.terrain[terrain_vector_id].x - this.terrain[terrain_vector_id - 1].x)

                for(let vectorID = 0; vectorID < this.SMOOTH_VECTORS; vectorID++){       // create the same amount of points
                    let xPos, yPos;

                    // we need to define the first one as there are no previous vectors
                    if(vectorID == 0){
                        xPos = this.terrain[terrain_vector_id].x;
                        yPos = this.terrain[terrain_vector_id].y;
                    } else {
                        // the distance between each new vector
                        let jump = ((this.WIDTH / this.INIT_VECTORS) / Math.pow(this.SMOOTH_VECTORS, iteration + 1))

                        // get the previous vector to calculate the a new angle
                        let _xPos = smoothed_vectors[vectorID - 1].x;
                        let _yPos = smoothed_vectors[vectorID - 1].y + (line_slope * jump);

                        xPos = _xPos - jump;

                        // calculate a random angle and random direction
                        // angle = (_yPos - yPos) / (_xPos - xPos) ==> yPos = angle * (_xPos - xPos) + _yPox
                        let angle = Math.random() * this.SMOOTH_MAX_ANGLE;
                        if(Math.random() >= 0.5)
                            yPos = angle * (_xPos - xPos) + _yPos;
                        else
                            yPos = -angle * (_xPos - xPos) + _yPos;
                    }
                    smoothed_vectors.push(this.vector(xPos, yPos))

                }
                terrain_vector_id--;

                for(let v = 1; v < smoothed_vectors.length; v++){
                    // + 1 to prevent double adding of the first point
                    this.terrain.splice(terrain_vector_id + 1, 0, smoothed_vectors[v]);
                }
            }
        }

        // this.terrain.forEach(point => {
        //     point.x -= this.windowOffsetX;
        // });

        // check the map if there are any places we can transform into a landingspot
        // this requires a maximum angle of 0.12
        for(let v = this.terrain.length - 1; v > 0; v--){
            let rc = Math.abs((this.terrain[v].y - this.terrain[v - 1].y) / (this.terrain[v].x - this.terrain[v - 1].x));
            if(rc < 0.12){
                // check which multiplier it will be
                if(this.SPAWN_2X_CHANCE > Math.random()){
                    this.landingspot["2x"].push({
                        p1:v -1,
                        p2:v
                    });
                    v -= 10;
                } else

                if(this.SPAWN_4X_CHANCE > Math.random()){
                    this.landingspot["4x"].push({
                        p1:v -1,
                        p2:v
                    });
                    v -= 10;
                } else

                if(this.SPAWN_5X_CHANCE > Math.random()){
                    this.landingspot["5x"].push({
                        p1:v -1,
                        p2:v
                    });
                    v -= 10;
                } else

                {
                    this.landingspot["1x"].push({
                        p1:v -1,
                        p2:v
                    });
                    v -= 10;
                }
            }
        }

        this.render();
    }


    /**
     * tries to adjust the focus on the player taking in consideration the closeness to the terrain
     * @param {Object} hitbox contains a hitbox around which will be zoomed
     * @param {Object} pointer contains the plain hitbox which is required to adjust values
     */
    focus(hitbox, pointer){
        // Shift the map according to the player position
        this.shiftMap(hitbox, pointer);

        let x = (hitbox[3].x - hitbox[0].x) / 2,
            y = (hitbox[3].y - hitbox[0].y) / 2

        // Check the hitbox for zooming out for any collisions
        if(!this.collides(
            [{
                x:hitbox[0].x + x - this.zoom.out_area / 2,
                y:hitbox[0].y + y - this.zoom.out_area / 2
            }, {
                x:hitbox[0].x + x + this.zoom.out_area / 2,
                y:hitbox[0].y + y - this.zoom.out_area / 2
            },{
                x:hitbox[0].x + x - this.zoom.out_area / 2,
                y:hitbox[0].y + y + this.zoom.out_area / 2
            },{
                x:hitbox[0].x + x + this.zoom.out_area / 2,
                y:hitbox[0].y + y + this.zoom.out_area / 2
            }]
        )){
            if(this.zoom.current > this.zoom.min){
                // first calculate the difference between the player position before and after the zoom
                let offsetX = (hitbox[0].x * this.zoom.strength + (hitbox[1].x * this.zoom.strength - hitbox[0].x * this.zoom.strength) / 2)
                            - (hitbox[0].x + (hitbox[1].x - hitbox[0].x) / 2);
                let offsetY = (hitbox[0].y * this.zoom.strength + (hitbox[1].y * this.zoom.strength - hitbox[0].y * this.zoom.strength) / 2)
                            - (hitbox[0].y + (hitbox[1].y - hitbox[0].y) / 2);

                // zoom out of the player
                for(let v = 0; v < pointer.length; v++){
                    pointer[v].x = pointer[v].x / this.zoom.strength + offsetX;
                    pointer[v].y = pointer[v].y / this.zoom.strength + offsetY * 1.5;
                }

                // zoom out of the terrain (this one must loop backwards)
                for(let v = this.terrain.length - 1; 0 < v ; v--){
                    this.terrain[v].x = this.terrain[v].x / this.zoom.strength + offsetX;
                    this.terrain[v].y = this.terrain[v].y / this.zoom.strength + offsetY * 1.5;
                }

                // calculate the current zoom level
                this.zoom.current = Math.abs(this.terrain[2].x - this.terrain[1].x);

            }
        } else

        // Check the hitbox for zooming in for any collisions
        if(this.collides(
            [{
                x:hitbox[0].x + x - this.zoom.in_area / 2,
                y:hitbox[0].y + y - this.zoom.in_area / 2
            }, {
                x:hitbox[0].x + x + this.zoom.in_area / 2,
                y:hitbox[0].y + y - this.zoom.in_area / 2
            },{
                x:hitbox[0].x + x - this.zoom.in_area / 2,
                y:hitbox[0].y + y + this.zoom.in_area / 2
            },{
                x:hitbox[0].x + x + this.zoom.in_area / 2,
                y:hitbox[0].y + y + this.zoom.in_area / 2
            }]
        )){
            if(this.zoom.current < this.zoom.max){
                // first calculate the difference between the player position before and after the zoom
                let offsetX = (hitbox[0].x * this.zoom.strength + (hitbox[1].x * this.zoom.strength - hitbox[0].x * this.zoom.strength) / 2)
                            - (hitbox[0].x + (hitbox[1].x - hitbox[0].x) / 2);
                let offsetY = (hitbox[0].y * this.zoom.strength + (hitbox[1].y * this.zoom.strength - hitbox[0].y * this.zoom.strength) / 2)
                            - (hitbox[0].y + (hitbox[1].y - hitbox[0].y) / 2);

                // zoom in on the player
                for(let v = 0; v < pointer.length; v++){
                    pointer[v].x = pointer[v].x * this.zoom.strength - offsetX;
                    pointer[v].y = pointer[v].y * this.zoom.strength - offsetY * 1.5;
                }

                // zoom in on the terrain (this one must loop backwards)
                for(let v = this.terrain.length - 1; 0 < v ; v--){
                    this.terrain[v].x = this.terrain[v].x * this.zoom.strength - offsetX;
                    this.terrain[v].y = this.terrain[v].y * this.zoom.strength - offsetY * 1.5;
                }

                // calculate the current zoom level
                this.zoom.current = Math.abs(this.terrain[2].x - this.terrain[1].x);
            }

            if(this.collides(hitbox)){
                this.playerCollision = true;
                console.log(true)
            }
        }

        this.render(hitbox);
    }

    /**
     * Adjusts the player to stay inside the specified movehitbox
     * @param {Object} hitbox contains a hitbox around which will be zoomed
     * @param {Object} pointer contains the plain hitbox which is required to adjust values
     */
    shiftMap(hitbox, pointer){
        // check if the most left side of the visible map is larger than 0 and the right side smaller than the map
        if(this.canvas.width / 2 - window.width / 2 >= 0 &&
           this.canvas.width / 2 + window.width / 2 <= this.canvas.width){
            let offsetX = 0, offsetY = 0;
            // when moving left
            if(hitbox[0].x < this.movehitbox[0].x)
                offsetX = this.movehitbox[0].x - hitbox[0].x;

            // when moving to up
            if(hitbox[0].y < this.movehitbox[0].y)
                offsetY = this.movehitbox[0].y - hitbox[0].y;

            // when moving right
            if(hitbox[3].x > this.movehitbox[1].x)
                offsetX = this.movehitbox[1].x - hitbox[3].x;

            // when moving down
            if(hitbox[3].y > this.movehitbox[1].y)
                offsetY = this.movehitbox[1].y - hitbox[3].y;

            // Prevent unnecessary looping
            if(offsetX != 0 || offsetY != 0){
                // Adjust the player
                for (let h = 0; h < hitbox.length; h++){
                    pointer[h].x += offsetX;
                    pointer[h].y += offsetY;
                }

                // Adjust the terrain
                for (let t = 0; t < this.terrain.length; t++) {
                    const tPos = this.terrain[t];

                    tPos.x += offsetX;
                    tPos.y += offsetY;
                }
            }
        }
    }

    render(hitbox){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        if(!this.zoom.hidden && typeof hitbox !== "undefined"){

            let x = (hitbox[3].x - hitbox[0].x) / 2,
                y = (hitbox[3].y - hitbox[0].y) / 2

            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(
                hitbox[0].x + x - this.zoom.in_area / 2,
                hitbox[0].y + y - this.zoom.in_area / 2,
                this.zoom.in_area,
                this.zoom.in_area
            );
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(
                hitbox[0].x + x - this.zoom.out_area / 2,
                hitbox[0].y + y - this.zoom.out_area / 2,
                this.zoom.out_area,
                this.zoom.out_area
            );
            this.ctx.globalAlpha = 0.2;
            this.ctx.fillRect(
                this.movehitbox[0].x,
                this.movehitbox[0].y,
                this.movehitbox[1].x - this.movehitbox[0].x,
                this.movehitbox[1].y - this.movehitbox[0].y
            );
        }

        this.ctx.strokeStyle = "#fff";
        this.ctx.beginPath();

        this.ctx.moveTo(this.terrain[0].x, this.terrain[0].y);
        for(let v = 1; v < this.terrain.length; v++)
            this.ctx.lineTo(this.terrain[v].x, this.terrain[v].y);

        this.ctx.stroke();

        for(let landingtype in this.landingspot){
            for(let spot = 0; spot < this.landingspot[landingtype].length; spot++){
                this.ctx.font = "20px segoe ui";
                this.ctx.fillText(landingtype,this.terrain[this.landingspot[landingtype][spot].p1].x, 30);
            }
        }
    }

    /**
     * Checks whether something collides with the map
     * @param {Object} hitbox contains an x1,y1, x2,y2, forming a cube
     */
    collides(hitbox){
        // for every side of the hitbox of the player
        for(let side = 0; side < hitbox.length; side++){
            // get the coordinates of a side
            let P1 = {
                x:hitbox[side].x,
                y:hitbox[side].y
            };

            // if even, take the next one, if uneven, take second next one to make a vertical line
            let P2 = {
                x: side / 2 == Math.round(side / 2) ? hitbox[side + 1].x : side !== 3 ? hitbox[side + 2].x : hitbox[side - 2].x,
                y: side / 2 == Math.round(side / 2) ? hitbox[side + 1].y : side !== 3 ? hitbox[side + 2].y : hitbox[side - 2].y
            };

            // we add -1 and +1 so we are sure we do not skip any lines
            for(let vectors = this.get_nearest_terrain_index(P1.x) - 1; vectors < this.get_nearest_terrain_index(P2.x) + 1; vectors++){
                // get the coordinates of a line of the terrain
                if(typeof this.terrain[vectors] === "undefined" || typeof this.terrain[vectors + 1] === "undefined")
                    break;

                let T1 = {x:this.terrain[vectors].x, y:this.terrain[vectors].y};
                let T2 = {x:this.terrain[vectors + 1].x, y:this.terrain[vectors + 1].y};

                // magic (check wether the lines collide)
                let denominator = ((P2.x - P1.x) * (T2.y - T1.y)) - ((P2.y - P1.y) * (T2.x - T1.x));
                let numerator1 = ((P1.y - T1.y) * (T2.x - T1.x)) - ((P1.x - T1.x) * (T2.y - T1.y));
                let numerator2 = ((P1.y - T1.y) * (P2.x - P1.x)) - ((P1.x - T1.x) * (P2.y - P1.y));

                // Detect coincident lines
                if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

                let r = numerator1 / denominator;
                let s = numerator2 / denominator;

                // if one of the lines cross
                if((r >= 0 && r <= 1) && (s >= 0 && s <= 1)){
                    return true;
                }
            }
        }
    }

    /**
     * Finds the terrain point with the least x distance to the given x
     * @param {float} x value to search in terrain
     */
    get_nearest_terrain_index(xPos){
        for(let terrainID = 0; terrainID < this.terrain.length;){
            // while our terrain value is smaller x, increase the position
            if(this.terrain[terrainID].x < xPos)
                terrainID++
            else if(this.terrain[terrainID].x > xPos){
                if(typeof this.terrain[terrainID - 1] === "undefined")
                    return 1;

                // check which distance is greater: the left one to x, or the right one
                if(xPos - this.terrain[terrainID - 1].x < Math.abs(xPos - this.terrain[terrainID].x))
                    return terrainID;
                else
                    return terrainID;
            } else if (this.terrain[terrainID].x == xPos)
                return terrainID;
        }

        return false;
    }

    vector(xPos, YPos){
        return new Object({x:xPos, y:YPos});
    }
}