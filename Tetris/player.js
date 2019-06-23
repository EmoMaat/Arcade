class TetrisPlayer{
    constructor(){
        this.matrix = new TetrisMatrix();
        this.queue = [new TetrisMatrix(), new TetrisMatrix()];

        this.position = {x:0,y:0};

        this.score = 0;
        this.combo = 0;
    }

    // set the first queued matrix as the current matrix and generate a new one
    ShiftQueue(){
        this.matrix = this.queue[0];
        this.queue.splice(0,1);
        this.queue.push(new TetrisMatrix());
        
        this.position.y = 0;
    }

    RotateMatrix(dir = -1){
        // transpose the matrix
        for(let y = 0; y < this.matrix.length; y++){
            for(let x = 0; x < y; x++){
                [
                    this.matrix[x][y],
                    this.matrix[y][x]
                ] = [
                    this.matrix[y][x],
                    this.matrix[x][y]
                ];
            }
        }

        // and flip the row/collum depening on the direction
        if(dir > 0)
            this.matrix.forEach(row => row.reverse());
        else
            this.matrix.reverse();
    }
}