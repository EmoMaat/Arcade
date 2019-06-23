class TetrisMatrix{
    constructor(){
        let objects = [
            [   // L shape
                [0,1,0],
                [0,1,0],
                [0,1,1],
            ],
            [   // J shape
                [0,1,0],
                [0,1,0],
                [1,1,0],
            ],
            [   // o shape
                [1,1],
                [1,1]
            ],
            [   // T shape
                [0,0,0],
                [1,1,1],
                [0,1,0]
            ],
            [   // I shape
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0]
            ],
            [   // s shape
                [0,1,1],
                [1,1,0],
                [0,0,0]
            ],
            [   // z shape
                [1,1,0],
                [0,1,1],
                [0,0,0]
            ]
        ]
        return objects[Math.floor(Math.random() * objects.length)];
        // return objects[2];
    }
}