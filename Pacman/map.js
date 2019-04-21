class PacManMap{
	constructor(window_scale){
		this.window_scale = window_scale;
		this.scematic_view = false;
		// the inside is 29 eatable points heigh and 26 wide
		// and 26 wide
		this.size = {
			collums: 26 + 4, 	// four for the exterior walls
			rows: 28 + 4		// four for the exterior walls
		};

		this.settings = {
			offset_x: canvas.width / 2 - (900 * window_scale) / 2,
			offset_y: 0,

			size: 30 * window_scale, 	// = 28
			thickness: 10,
			
			border_thickness:5 * window_scale,
			color:"white",

			powerup: {
				color:"white", 											// either HEX or color name
				size: 7 * window_scale	// = 7, size in px
			},

			eatable: {
				color:"white", 				// either HEX or color name
				size: canvas.width / 960	// = 2, size in px
			},
			
			debug:{
				color_flat:"green",
				color_1corner:"orange",
				color_3corner:"yellow",
				color_closed:"purple",
				color_alone:"red"
			}
		};

		// create a canvas containing the options
		let PacManMap = document.createElement('canvas');
		PacManMap.id = 'PacManMap';
		PacManMap.width = canvas.width;
		PacManMap.height = canvas.height;
		PacManMap.style.left = 0;
		PacManMap.style.bottom = 0;
		PacManMap.style.position = "absolute";
		PacManMap.style.cursor = "none";
		document.body.appendChild(PacManMap);

		this.canvas = document.getElementById("PacManMap");		// canvas stuff
		this.ctx = this.canvas.getContext("2d");	// canvas stuff
		
		this.walls = [
			// row 0
			{x:0, y:0},{x:1, y:0},{x:2, y:0},{x:3, y:0},{x:4, y:0},{x:5, y:0},{x:6, y:0},{x:7, y:0},{x:8, y:0},{x:9, y:0},{x:10, y:0},{x:11, y:0},{x:12, y:0},{x:13, y:0},{x:14, y:0},{x:15, y:0},{x:16, y:0},{x:17, y:0},{x:18, y:0},{x:19, y:0},{x:20, y:0},{x:21, y:0},{x:22, y:0},{x:23, y:0},{x:24, y:0},{x:25, y:0},{x:26, y:0},{x:27, y:0},{x:28, y:0},{x:29, y:0},
			// row 1
			{x:0, y:1},{x:1, y:1},{x:2, y:1},{x:3, y:1},{x:4, y:1},{x:5, y:1},{x:6, y:1},{x:7, y:1},{x:8, y:1},{x:9, y:1},{x:10, y:1},{x:11, y:1},{x:12, y:1},{x:13, y:1},{x:14, y:1},{x:15, y:1},{x:16, y:1},{x:17, y:1},{x:18, y:1},{x:19, y:1},{x:20, y:1},{x:21, y:1},{x:22, y:1},{x:23, y:1},{x:24, y:1},{x:25, y:1},{x:26, y:1},{x:27, y:1},{x:28, y:1},{x:29, y:1},
			// row 2
			{x:0, y:2},{x:1, y:2},{x:14, y:2},{x:15, y:2},{x:28, y:2},{x:29, y:2},
			// row 3
			{x:0, y:3},{x:1, y:3},{x:3, y:3},{x:4, y:3},{x:5, y:3},{x:6, y:3},{x:8, y:3},{x:9, y:3},{x:10, y:3},{x:11, y:3},{x:12, y:3},{x:14, y:3},{x:15, y:3},{x:17, y:3},{x:18, y:3},{x:19, y:3},{x:20, y:3},{x:21, y:3},{x:23, y:3},{x:24, y:3},{x:25, y:3},{x:26, y:3},{x:28, y:3},{x:29, y:3},
			// row 4
			{x:0, y:4},{x:1, y:4},{x:3, y:4},{x:4, y:4},{x:5, y:4},{x:6, y:4},{x:8, y:4},{x:9, y:4},{x:10, y:4},{x:11, y:4},{x:12, y:4},{x:14, y:4},{x:15, y:4},{x:17, y:4},{x:18, y:4},{x:19, y:4},{x:20, y:4},{x:21, y:4},{x:23, y:4},{x:24, y:4},{x:25, y:4},{x:26, y:4},{x:28, y:4},{x:29, y:4},
			// row 5
			{x:0, y:5},{x:1, y:5},{x:3, y:5},{x:4, y:5},{x:5, y:5},{x:6, y:5},{x:8, y:5},{x:9, y:5},{x:10, y:5},{x:11, y:5},{x:12, y:5},{x:14, y:5},{x:15, y:5},{x:17, y:5},{x:18, y:5},{x:19, y:5},{x:20, y:5},{x:21, y:5},{x:23, y:5},{x:24, y:5},{x:25, y:5},{x:26, y:5},{x:28, y:5},{x:29, y:5},
			// row 6
			{x:0, y:6},{x:1, y:6},{x:28, y:6},{x:29, y:6},
			// row 7
			{x:0, y:7},{x:1, y:7},{x:3, y:7},{x:4, y:7},{x:5, y:7},{x:6, y:7},{x:8, y:7},{x:9, y:7},{x:11, y:7},{x:12, y:7},{x:13, y:7},{x:14, y:7},{x:15, y:7},{x:16, y:7},{x:17, y:7},{x:18, y:7},{x:20, y:7},{x:21, y:7},{x:23, y:7},{x:24, y:7},{x:25, y:7},{x:26, y:7},{x:28, y:7},{x:29, y:7},
			// row 8
			{x:0, y:8},{x:1, y:8},{x:3, y:8},{x:4, y:8},{x:5, y:8},{x:6, y:8},{x:8, y:8},{x:9, y:8},{x:11, y:8},{x:12, y:8},{x:13, y:8},{x:14, y:8},{x:15, y:8},{x:16, y:8},{x:17, y:8},{x:18, y:8},{x:20, y:8},{x:21, y:8},{x:23, y:8},{x:24, y:8},{x:25, y:8},{x:26, y:8},{x:28, y:8},{x:29, y:8},
			// row 9
			{x:0, y:9},{x:1, y:9},{x:8, y:9},{x:9, y:9},{x:14, y:9},{x:15, y:9},{x:20, y:9},{x:21, y:9},{x:28, y:9},{x:29, y:9},
			// row 10
			{x:0, y:10},{x:1, y:10},{x:2, y:10},{x:3, y:10},{x:4, y:10},{x:5, y:10},{x:6, y:10},{x:8, y:10},{x:9, y:10},{x:10, y:10},{x:11, y:10},{x:12, y:10},{x:14, y:10},{x:15, y:10},{x:17, y:10},{x:18, y:10},{x:19, y:10},{x:20, y:10},{x:21, y:10},{x:23, y:10},{x:24, y:10},{x:25, y:10},{x:26, y:10},{x:27, y:10},{x:28, y:10},{x:29, y:10},
			// row 11
			{x:0, y:10},{x:1, y:10},{x:2, y:10},{x:3, y:10},{x:4, y:10},{x:0, y:11},{x:1, y:11},{x:2, y:11},{x:3, y:11},{x:4, y:11},{x:5, y:11},{x:6, y:11},{x:8, y:11},{x:9, y:11},{x:10, y:11},{x:11, y:11},{x:12, y:11},{x:14, y:11},{x:15, y:11},{x:17, y:11},{x:18, y:11},{x:19, y:11},{x:20, y:11},{x:21, y:11},{x:23, y:11},{x:24, y:11},{x:25, y:11},{x:26, y:11},{x:27, y:11},{x:28, y:11},{x:29, y:11},
			// row 12
			{x:0, y:12},{x:1, y:12},{x:2, y:12},{x:3, y:12},{x:4, y:12},{x:5, y:12},{x:6, y:12},{x:8, y:12},{x:9, y:12},{x:20, y:12},{x:21, y:12},{x:23, y:12},{x:24, y:12},{x:25, y:12},{x:26, y:12},{x:27, y:12},{x:28, y:12},{x:29, y:12},
			// row 13
			{x:0, y:13},{x:1, y:13},{x:2, y:13},{x:3, y:13},{x:4, y:13},{x:5, y:13},{x:6, y:13},{x:8, y:13},{x:9, y:13},{x:11, y:13, nodraw:true},{x:12, y:13, nodraw:true},{x:13, y:13, nodraw:true},{x:14, y:13, nodraw:true},{x:15, y:13, nodraw:true},{x:16, y:13, nodraw:true},{x:17, y:13, nodraw:true},{x:18, y:13, nodraw:true},{x:20, y:13},{x:21, y:13},{x:23, y:13},{x:24, y:13},{x:25, y:13},{x:26, y:13},{x:27, y:13},{x:28, y:13},{x:29, y:13},
			// row 14
			{x:0, y:14},{x:1, y:14},{x:2, y:14},{x:3, y:14},{x:4, y:14},{x:5, y:14},{x:6, y:14},{x:8, y:14},{x:9, y:14},{x:11, y:14, nodraw:true},{x:18, y:14, nodraw:true},{x:20, y:14},{x:21, y:14},{x:23, y:14},{x:24, y:14},{x:25, y:14},{x:26, y:14},{x:27, y:14},{x:28, y:14},{x:29, y:14},
			// row 15 (empty)
			{x:11, y:15, nodraw:true},{x:18, y:15, nodraw:true},
			// row 16
			{x:0, y:16},{x:1, y:16},{x:2, y:16},{x:3, y:16},{x:4, y:16},{x:5, y:16},{x:6, y:16},{x:8, y:16},{x:9, y:16},{x:11, y:16, nodraw:true},{x:18, y:16, nodraw:true},{x:20, y:16},{x:21, y:16},{x:23, y:16},{x:24, y:16},{x:25, y:16},{x:26, y:16},{x:27, y:16},{x:28, y:16},{x:29, y:16},
			// row 17
			{x:0, y:17},{x:1, y:17},{x:2, y:17},{x:3, y:17},{x:4, y:17},{x:5, y:17},{x:6, y:17},{x:8, y:17},{x:9, y:17},{x:11, y:17, nodraw:true},{x:12, y:17, nodraw:true},{x:13, y:17, nodraw:true},{x:14, y:17, nodraw:true},{x:15, y:17, nodraw:true},{x:16, y:17, nodraw:true},{x:17, y:17, nodraw:true},{x:18, y:17, nodraw:true},{x:20, y:17},{x:21, y:17},{x:23, y:17},{x:24, y:17},{x:25, y:17},{x:26, y:17},{x:27, y:17},{x:28, y:17},{x:29, y:17},
			// row 18
			{x:0, y:18},{x:1, y:18},{x:2, y:18},{x:3, y:18},{x:4, y:18},{x:5, y:18},{x:6, y:18},{x:8, y:18},{x:9, y:18},{x:20, y:18},{x:21, y:18},{x:23, y:18},{x:24, y:18},{x:25, y:18},{x:26, y:18},{x:27, y:18},{x:28, y:18},{x:29, y:18},
			// row 19
			{x:0, y:19},{x:1, y:19},{x:2, y:19},{x:3, y:19},{x:4, y:19},{x:5, y:19},{x:6, y:19},{x:8, y:19},{x:9, y:19},{x:11, y:19},{x:12, y:19},{x:13, y:19},{x:14, y:19},{x:15, y:19},{x:16, y:19},{x:17, y:19},{x:18, y:19},{x:20, y:19},{x:21, y:19},{x:23, y:19},{x:24, y:19},{x:25, y:19},{x:26, y:19},{x:27, y:19},{x:28, y:19},{x:29, y:19},
			// row 20
			{x:0, y:20},{x:1, y:20},{x:2, y:20},{x:3, y:20},{x:4, y:20},{x:5, y:20},{x:6, y:20},{x:8, y:20},{x:9, y:20},{x:11, y:20},{x:12, y:20},{x:13, y:20},{x:14, y:20},{x:15, y:20},{x:16, y:20},{x:17, y:20},{x:18, y:20},{x:20, y:20},{x:21, y:20},{x:23, y:20},{x:24, y:20},{x:25, y:20},{x:26, y:20},{x:27, y:20},{x:28, y:20},{x:29, y:20},
			// row 21
			{x:0, y:21},{x:1, y:21},{x:14, y:21},{x:15, y:21},{x:28, y:21},{x:29, y:21},
			// row 22
			{x:0, y:22},{x:1, y:22},{x:3, y:22},{x:4, y:22},{x:5, y:22},{x:6, y:22},{x:8, y:22},{x:9, y:22},{x:10, y:22},{x:11, y:22},{x:12, y:22},{x:14, y:22},{x:15, y:22},{x:17, y:22},{x:18, y:22},{x:19, y:22},{x:20, y:22},{x:21, y:22},{x:23, y:22},{x:24, y:22},{x:25, y:22},{x:26, y:22},{x:28, y:22},{x:29, y:22},
			// row 23
			{x:0, y:23},{x:1, y:23},{x:3, y:23},{x:4, y:23},{x:5, y:23},{x:6, y:23},{x:8, y:23},{x:9, y:23},{x:10, y:23},{x:11, y:23},{x:12, y:23},{x:14, y:23},{x:15, y:23},{x:17, y:23},{x:18, y:23},{x:19, y:23},{x:20, y:23},{x:21, y:23},{x:23, y:23},{x:24, y:23},{x:25, y:23},{x:26, y:23},{x:28, y:23},{x:29, y:23},
			// row 24
			{x:0, y:24},{x:1, y:24},{x:5, y:24},{x:6, y:24},{x:23, y:24},{x:24, y:24},{x:28, y:24},{x:29, y:24},
			// row 25
			{x:0, y:25},{x:1, y:25},{x:2, y:25},{x:3, y:25},{x:5, y:25},{x:6, y:25},{x:8, y:25},{x:9, y:25},{x:11, y:25},{x:12, y:25},{x:13, y:25},{x:14, y:25},{x:15, y:25},{x:16, y:25},{x:17, y:25},{x:18, y:25},{x:20, y:25},{x:21, y:25},{x:23, y:25},{x:24, y:25},{x:26, y:25},{x:27, y:25},{x:28, y:25},{x:29, y:25},
			// row 26
			{x:0, y:26},{x:1, y:26},{x:2, y:26},{x:3, y:26},{x:5, y:26},{x:6, y:26},{x:8, y:26},{x:9, y:26},{x:11, y:26},{x:12, y:26},{x:13, y:26},{x:14, y:26},{x:15, y:26},{x:16, y:26},{x:17, y:26},{x:18, y:26},{x:20, y:26},{x:21, y:26},{x:23, y:26},{x:24, y:26},{x:26, y:26},{x:27, y:26},{x:28, y:26},{x:29, y:26},
			// row 27
			{x:0, y:27},{x:1, y:27},{x:8, y:27},{x:9, y:27},{x:14, y:27},{x:15, y:27},{x:20, y:27},{x:21, y:27},{x:28, y:27},{x:29, y:27},
			// row 28
			{x:0, y:28},{x:1, y:28},{x:3, y:28},{x:4, y:28},{x:5, y:28},{x:6, y:28},{x:7, y:28},{x:8, y:28},{x:9, y:28},{x:10, y:28},{x:11, y:28},{x:12, y:28},{x:14, y:28},{x:15, y:28},{x:17, y:28},{x:18, y:28},{x:19, y:28},{x:20, y:28},{x:21, y:28},{x:22, y:28},{x:23, y:28},{x:24, y:28},{x:25, y:28},{x:26, y:28},{x:28, y:28},{x:29, y:28},
			// row 29
			{x:0, y:29},{x:1, y:29},{x:3, y:29},{x:4, y:29},{x:5, y:29},{x:6, y:29},{x:7, y:29},{x:8, y:29},{x:9, y:29},{x:10, y:29},{x:11, y:29},{x:12, y:29},{x:14, y:29},{x:15, y:29},{x:17, y:29},{x:18, y:29},{x:19, y:29},{x:20, y:29},{x:21, y:29},{x:22, y:29},{x:23, y:29},{x:24, y:29},{x:25, y:29},{x:26, y:29},{x:28, y:29},{x:29, y:29},
			// row 30
			{x:0, y:30},{x:1, y:30},{x:28, y:30},{x:29, y:30},
			// row 30
			{x:0, y:31},{x:1, y:31},{x:2, y:31},{x:3, y:31},{x:4, y:31},{x:5, y:31},{x:6, y:31},{x:7, y:31},{x:8, y:31},{x:9, y:31},{x:10, y:31},{x:11, y:31},{x:12, y:31},{x:13, y:31},{x:14, y:31},{x:15, y:31},{x:16, y:31},{x:17, y:31},{x:18, y:31},{x:19, y:31},{x:20, y:31},{x:21, y:31},{x:22, y:31},{x:23, y:31},{x:24, y:31},{x:25, y:31},{x:26, y:31},{x:27, y:31},{x:28, y:31},{x:29, y:31},
			// row 31
			{x:0, y:32},{x:1, y:32},{x:2, y:32},{x:3, y:32},{x:4, y:32},{x:5, y:32},{x:6, y:32},{x:7, y:32},{x:8, y:32},{x:9, y:32},{x:10, y:32},{x:11, y:32},{x:12, y:32},{x:13, y:32},{x:14, y:32},{x:15, y:32},{x:16, y:32},{x:17, y:32},{x:18, y:32},{x:19, y:32},{x:20, y:32},{x:21, y:32},{x:22, y:32},{x:23, y:32},{x:24, y:32},{x:25, y:32},{x:26, y:32},{x:27, y:32},{x:28, y:32},{x:29, y:32}
		];

		this.intersections = [
			{x:7, y:2},{x:22, y:2},
			{x:2, y:6},{x:7, y:6},{x:10, y:6},{x:13, y:6},{x:16, y:6},{x:19, y:6},{x:22, y:6},{x:27, y:6},
			{x:7, y:9},{x:22, y:9},
			{x:13, y:12},{x:14,y:12},{x:16, y:12},
			{x:7, y:15},{x:10, y:15},{x:19, y:15},{x:22, y:15},
			{x:10, y:18},{x:19, y:18},
			{x:7, y:21},{x:10, y:21},{x:19, y:21},{x:22, y:21},
			{x:7, y:24},{x:10, y:24},{x:13, y:24},{x:16, y:24},{x:19, y:24},{x:22, y:24},
			{x:4, y:27},{x:25, y:27},
			{x:13, y:30},{x:16, y:30},
		]

		// here we dynamically create a map where you can move
		// add here the tiles of which the tunnels consist
		this.tunnel = [
			{x:0, y:15, cost:2}, {x:1, y:15, cost:2}, {x:3, y:15, cost:2}, {x:4, y:15, cost:2}, {x:5, y:15, cost:2}, {x:6, y:15, cost:2}, {x:7, y:15, cost:2}, 
			{x:23, y:15, cost:2}, {x:24, y:15, cost:2}, {x:25, y:15, cost:2}, {x:26, y:15, cost:2}, {x:27, y:15, cost:2}, {x:28, y:15, cost:2}, {x:29, y:15, cost:2}
		];

		// add any tiles you want with a different cost in the var beneath
		this.space = [];

		for(var i = 0; i < this.tunnel.length; i++)
			this.space.push(this.tunnel[i]);

		for(var row = 0; row < this.size.rows; row++){
			for(var collum = 0; collum < this.size.collums; collum++){

				var node = {x:collum, y:row, cost:0}; 	// create a node
				var is_wall = false;					// it only has to be true once
				var in_space = false;					// cannot add the same thing twice
				
				for(var w = 0; w < this.walls.length; w++){
					if(node.x == this.walls[w].x && node.y == this.walls[w].y)
						is_wall = true;
				}

				for(var s = 0; s < this.space.length; s++){
					if(node.x == this.space[s].x && node.y == this.space[s].y)
						in_space = true;
				}
				
				if(!is_wall && !in_space){ // if not a wall nor in this.space
					this.space.push(node);
				}
			}
		}
		
		this.powerup = [
			{x:2, y:4, eaten:false},{x:27, y:4, eaten:false},{x:2, y:24, eaten:false},{x:27, y:24, eaten:false}
		];
		
		this.eatable = [
			// row 2
			{x:2, y:2, eaten:false},{x:3, y:2, eaten:false},{x:4, y:2, eaten:false},{x:5, y:2, eaten:false},{x:6, y:2, eaten:false},{x:7, y:2, eaten:false},{x:8, y:2, eaten:false},{x:9, y:2, eaten:false},{x:10, y:2, eaten:false},{x:11, y:2, eaten:false},{x:12, y:2, eaten:false},{x:13, y:2, eaten:false},{x:16, y:2, eaten:false},{x:17, y:2, eaten:false},{x:18, y:2, eaten:false},{x:19, y:2, eaten:false},{x:20, y:2, eaten:false},{x:21, y:2, eaten:false},{x:22, y:2, eaten:false},{x:23, y:2, eaten:false},{x:24, y:2, eaten:false},{x:25, y:2, eaten:false},{x:26, y:2, eaten:false},{x:27, y:2, eaten:false},
			// row 3
			{x:2, y:3, eaten:false},{x:7, y:3, eaten:false},{x:13, y:3, eaten:false},{x:16, y:3, eaten:false},{x:22, y:3, eaten:false},{x:27, y:3, eaten:false},
			// row 4
			{x:7, y:4, eaten:false},{x:13, y:4, eaten:false},{x:16, y:4, eaten:false},{x:22, y:4, eaten:false},
			// row 5
			{x:2, y:5, eaten:false},{x:7, y:5, eaten:false},{x:13, y:5, eaten:false},{x:16, y:5, eaten:false},{x:22, y:5, eaten:false},{x:27, y:5, eaten:false},
			// row 6
			{x:2, y:6, eaten:false},{x:3, y:6, eaten:false},{x:4, y:6, eaten:false},{x:5, y:6, eaten:false},{x:6, y:6, eaten:false},{x:7, y:6, eaten:false},{x:8, y:6, eaten:false},{x:9, y:6, eaten:false},{x:10, y:6, eaten:false},{x:11, y:6, eaten:false},{x:12, y:6, eaten:false},{x:13, y:6, eaten:false},{x:14, y:6, eaten:false},{x:15, y:6, eaten:false},{x:16, y:6, eaten:false},{x:17, y:6, eaten:false},{x:18, y:6, eaten:false},{x:19, y:6, eaten:false},{x:20, y:6, eaten:false},{x:21, y:6, eaten:false},{x:22, y:6, eaten:false},{x:23, y:6, eaten:false},{x:24, y:6, eaten:false},{x:25, y:6, eaten:false},{x:26, y:6, eaten:false},{x:27, y:6, eaten:false},
			// row 7
			{x:2, y:7, eaten:false},{x:7, y:7, eaten:false},{x:10, y:7, eaten:false},{x:19, y:7, eaten:false},{x:22, y:7, eaten:false},{x:27, y:7, eaten:false},
			// row 8
			{x:2, y:8, eaten:false},{x:7, y:8, eaten:false},{x:10, y:8, eaten:false},{x:19, y:8, eaten:false},{x:22, y:8, eaten:false},{x:27, y:8, eaten:false},
			// row 9
			{x:2, y:9, eaten:false},{x:3, y:9, eaten:false},{x:4, y:9, eaten:false},{x:5, y:9, eaten:false},{x:6, y:9, eaten:false},{x:7, y:9, eaten:false},{x:10, y:9, eaten:false},{x:11, y:9, eaten:false},{x:12, y:9, eaten:false},{x:13, y:9, eaten:false},{x:16, y:9, eaten:false},{x:17, y:9, eaten:false},{x:18, y:9, eaten:false},{x:19, y:9, eaten:false},{x:22, y:9, eaten:false},{x:23, y:9, eaten:false},{x:24, y:9, eaten:false},{x:25, y:9, eaten:false},{x:26, y:9, eaten:false},{x:27, y:9, eaten:false},
			// row 10
			{x:7, y:10, eaten:false},{x:22, y:10, eaten:false},
			// row 11
			{x:7, y:11, eaten:false},{x:22, y:11, eaten:false},
			// row 12
			{x:7, y:12, eaten:false},{x:22, y:12, eaten:false},
			// row 13
			{x:7, y:13, eaten:false},{x:22, y:13, eaten:false},
			// row 14
			{x:7, y:14, eaten:false},{x:22, y:14, eaten:false},
			// row 15
			{x:7, y:15, eaten:false},{x:22, y:15, eaten:false},
			// row 16
			{x:7, y:16, eaten:false},{x:22, y:16, eaten:false},
			// row 17
			{x:7, y:17, eaten:false},{x:22, y:17, eaten:false},
			// row 18
			{x:7, y:18, eaten:false},{x:22, y:18, eaten:false},
			// row 19
			{x:7, y:19, eaten:false},{x:22, y:19, eaten:false},
			// row 20
			{x:7, y:20, eaten:false},{x:22, y:20, eaten:false},
			// row 21
			{x:2, y:21, eaten:false},{x:3, y:21, eaten:false},{x:4, y:21, eaten:false},{x:5, y:21, eaten:false},{x:6, y:21, eaten:false},{x:7, y:21, eaten:false},{x:8, y:21, eaten:false},{x:9, y:21, eaten:false},{x:10, y:21, eaten:false},{x:11, y:21, eaten:false},{x:12, y:21, eaten:false},{x:13, y:21, eaten:false},{x:16, y:21, eaten:false},{x:17, y:21, eaten:false},{x:18, y:21, eaten:false},{x:19, y:21, eaten:false},{x:20, y:21, eaten:false},{x:21, y:21, eaten:false},{x:22, y:21, eaten:false},{x:23, y:21, eaten:false},{x:24, y:21, eaten:false},{x:25, y:21, eaten:false},{x:26, y:21, eaten:false},{x:27, y:21, eaten:false},
			// row 22
			{x:2, y:22, eaten:false},{x:7, y:22, eaten:false},{x:13, y:22, eaten:false},{x:16, y:22, eaten:false},{x:22, y:22, eaten:false},{x:27, y:22, eaten:false},
			// row 23
			{x:2, y:23, eaten:false},{x:7, y:23, eaten:false},{x:13, y:23, eaten:false},{x:16, y:23, eaten:false},{x:22, y:23, eaten:false},{x:27, y:23, eaten:false},
			// row 24
			{x:3, y:24, eaten:false},{x:4, y:24, eaten:false},{x:7, y:24, eaten:false},{x:8, y:24, eaten:false},{x:9, y:24, eaten:false},{x:10, y:24, eaten:false},{x:11, y:24, eaten:false},{x:12, y:24, eaten:false},{x:13, y:24, eaten:false},{x:16, y:24, eaten:false},{x:17, y:24, eaten:false},{x:18, y:24, eaten:false},{x:19, y:24, eaten:false},{x:20, y:24, eaten:false},{x:21, y:24, eaten:false},{x:22, y:24, eaten:false},{x:25, y:24, eaten:false},{x:26, y:24, eaten:false},
			// row 25
			{x:4, y:25, eaten:false},{x:7, y:25, eaten:false},{x:10, y:25, eaten:false},{x:19, y:25, eaten:false},{x:22, y:25, eaten:false},{x:25, y:25, eaten:false},
			// row 26
			{x:4, y:26, eaten:false},{x:7, y:26, eaten:false},{x:10, y:26, eaten:false},{x:19, y:26, eaten:false},{x:22, y:26, eaten:false},{x:25, y:26, eaten:false},
			// row 27
			{x:2, y:27, eaten:false},{x:3, y:27, eaten:false},{x:4, y:27, eaten:false},{x:5, y:27, eaten:false},{x:6, y:27, eaten:false},{x:7, y:27, eaten:false},{x:10, y:27, eaten:false},{x:11, y:27, eaten:false},{x:12, y:27, eaten:false},{x:13, y:27, eaten:false},{x:16, y:27, eaten:false},{x:17, y:27, eaten:false},{x:18, y:27, eaten:false},{x:19, y:27, eaten:false},{x:22, y:27, eaten:false},{x:23, y:27, eaten:false},{x:24, y:27, eaten:false},{x:25, y:27, eaten:false},{x:26, y:27, eaten:false},{x:27, y:27, eaten:false},
			// row 28
			{x:2, y:28, eaten:false},{x:13, y:28, eaten:false},{x:16, y:28, eaten:false},{x:27, y:28, eaten:false},
			// row 29
			{x:2, y:29, eaten:false},{x:13, y:29, eaten:false},{x:16, y:29, eaten:false},{x:27, y:29, eaten:false},
			// row 30
			{x:2, y:30, eaten:false},{x:3, y:30, eaten:false},{x:4, y:30, eaten:false},{x:5, y:30, eaten:false},{x:6, y:30, eaten:false},{x:7, y:30, eaten:false},{x:8, y:30, eaten:false},{x:9, y:30, eaten:false},{x:10, y:30, eaten:false},{x:11, y:30, eaten:false},{x:12, y:30, eaten:false},{x:13, y:30, eaten:false},{x:14, y:30, eaten:false},{x:15, y:30, eaten:false},{x:16, y:30, eaten:false},{x:17, y:30, eaten:false},{x:18, y:30, eaten:false},{x:19, y:30, eaten:false},{x:20, y:30, eaten:false},{x:21, y:30, eaten:false},{x:22, y:30, eaten:false},{x:23, y:30, eaten:false},{x:24, y:30, eaten:false},{x:25, y:30, eaten:false},{x:26, y:30, eaten:false},{x:27, y:30, eaten:false}
		];

		this.draw();
	}
	
	verifyPositions(){
		var data_set = [];
		var seen_data_set = [];
		var double_item = [];
		var tmp, i = 0;
		
		// we add all the data to one array
		for (var t = 0; t < this.walls.length; t++){ data_set.push(this.walls[t]);}
		for (var t = 0; t < this.powerup.length; t++){ data_set.push(this.powerup[t]);}
		for (var t = 0; t < this.eatable.length; t++){ data_set.push(this.eatable[t]);}
		
		// now we add each object to a new array, and if it is already in that array
		// it is a duplicate
		for (var i = 0; i < data_set.length; i++) {
			var seen = false;
			for (var x = 0; x < seen_data_set.length; x++) {
				if(data_set[i].x == seen_data_set[x].x && data_set[i].y == seen_data_set[x].y)
					seen = true;
			}

			if(!seen){
				seen_data_set.push(data_set[i]);
			} else {
				double_item.push(data_set[i]);
			}
		}
		
		if(double_item.length > 0){
			console.log("Multiple duplicates have been found:");
			console.log(double_item);
		} else {console.log("no duplicates found.");}
		
		return double_item.length;
	}
	
	draw(){
		// ghost box
		var scale = this.settings.size / 2 - this.settings.thickness / 2;
		this.ctx.strokeStyle = this.settings.color;
		this.ctx.lineWidth = this.settings.border_thickness;
		this.ctx.beginPath();
		
		this.ctx.rect(this.settings.offset_x + (11 /*this.walls[11].x*/ * this.settings.size + scale),
			this.settings.offset_y + (13 /*this.walls[13].y*/ * this.settings.size + scale),
			18 /*this.walls[18].x*/ * this.settings.size - 11 /*this.walls[11].x*/ * this.settings.size + scale,
			17 /*this.walls[17].y*/ * this.settings.size - 13 /*this.walls[13].y*/ * this.settings.size + scale);
		this.ctx.rect(this.settings.offset_x + (11 /*this.walls[11].x*/ * this.settings.size + scale * 2),
			this.settings.offset_y + (13 /*this.walls[13].y*/ * this.settings.size + scale * 2),
			18 /*this.walls[18].x*/ * this.settings.size - 11 /*this.walls[11].x*/ * this.settings.size - scale,
			17 /*this.walls[17].y*/ * this.settings.size - 13 /*this.walls[13].y*/ * this.settings.size - scale);
		this.ctx.rect(this.settings.offset_x + (14 /*this.walls[11].x*/ * this.settings.size),
			this.settings.offset_y + (13 /*this.walls[13].y*/ * this.settings.size + scale),
			16 /*this.walls[18].x*/ * this.settings.size - 14 /*this.walls[11].x*/ * this.settings.size,
			13 /*this.walls[17].y*/ * this.settings.size - 13 /*this.walls[13].y*/ * this.settings.size + scale);
		this.ctx.stroke();
		this.ctx.closePath();

		// entrance
		this.ctx.beginPath();
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(this.settings.offset_x + (14 /*this.walls[11].x*/ * this.settings.size + this.settings.border_thickness / 2),
			this.settings.offset_y + (13 /*this.walls[13].y*/ * this.settings.size),
			16 /*this.walls[18].x*/ * this.settings.size - 14 /*this.walls[11].x*/ * this.settings.size - this.settings.border_thickness,
			13 /*this.walls[17].y*/ * this.settings.size - 13 /*this.walls[13].y*/ * this.settings.size + scale * 3);
		this.ctx.stroke();	

		this.ctx.closePath();

		this.ctx.beginPath();
		this.ctx.strokeStyle = "white";
		this.ctx.moveTo(this.settings.offset_x + (14 /*this.walls[14].x*/ * this.settings.size),
			this.settings.offset_y + (13 /*this.walls[13].y*/ * this.settings.size + scale * 1.5));
		this.ctx.lineTo(this.settings.offset_x + (16 /*this.walls[16].x*/ * this.settings.size),
			this.settings.offset_y + (13 /*this.walls[13]*/ * this.settings.size + scale * 1.5));
		this.ctx.stroke();

		for (var w = 0; w < this.walls.length; w++){
			this.ctx.beginPath();
			
			this.ctx.strokeStyle = this.settings.color;
			this.ctx.lineWidth = this.settings.border_thickness;
			
			var scale = this.settings.size / 2 - this.settings.thickness / 2;
			var circleRadius = scale;
			
			if(!this.walls[w].hasOwnProperty("nodraw")){
				
				// false means a wall in a corner
				var top_left_corner = true;
				var top_right_corner = true;
				var bottom_left_corner = true;
				var bottom_right_corner = true;
				
				// false means there is a wall on the side
				var left_side = true;
				var right_side = true;
				var bottom_side = true;
				var top_side = true;
				
				for(var o = 0; o < this.walls.length; o++){
					
					// corner 
					if(this.walls[w].x - 1 == this.walls[o].x && this.walls[w].y - 1 == this.walls[o].y)
						top_left_corner = false;
					
					if(this.walls[w].x + 1 == this.walls[o].x && this.walls[w].y - 1 == this.walls[o].y)
						top_right_corner = false;
					
					if(this.walls[w].x - 1 == this.walls[o].x && this.walls[w].y + 1 == this.walls[o].y)
						bottom_left_corner = false;
					
					if(this.walls[w].x + 1 == this.walls[o].x && this.walls[w].y + 1 == this.walls[o].y)
						bottom_right_corner = false;
					
					// sides
					if(this.walls[w].x - 1 == this.walls[o].x && this.walls[w].y == this.walls[o].y)
						left_side = false;
					
					if(this.walls[w].x + 1 == this.walls[o].x && this.walls[w].y == this.walls[o].y)
						right_side = false;
					
					if(this.walls[w].x == this.walls[o].x && this.walls[w].y + 1 == this.walls[o].y)
						bottom_side = false;
					
					if(this.walls[w].x == this.walls[o].x && this.walls[w].y - 1 == this.walls[o].y)
						top_side = false;
				}
				
				// if on left but not a corner
				if(left_side && !right_side && !bottom_side && !top_side){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_flat; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + ((this.walls[w].y * this.settings.size + scale)), this.settings.thickness, this.settings.thickness);
						this.ctx.stroke();
					}
				
					this.ctx.moveTo(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size));
					this.ctx.lineTo(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size));
				} else 
				
				// if on right but not a corner
				if(!left_side && right_side && !bottom_side && !top_side){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_flat; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
						this.ctx.stroke();
					}
					
					this.ctx.moveTo(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size - scale), this.settings.offset_y + (this.walls[w].y * this.settings.size));
					this.ctx.lineTo(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size - scale), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size));
				} else 
				
				// if top but not a corner
				if(!left_side && !right_side && !bottom_side && top_side){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_flat; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
						this.ctx.stroke();
					}
					
					this.ctx.moveTo(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale));
					this.ctx.lineTo(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale));
				} else 
				
				// if bottom but not a corner
				if(!left_side && !right_side && bottom_side && !top_side){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_flat; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.moveTo(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size - scale));
					this.ctx.lineTo(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size - scale));
				} else 
				
				
				// if top left with 1 corner
				if(!left_side && !right_side && !bottom_side && !top_side && top_left_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_1corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size), circleRadius,0*Math.PI,0.5*Math.PI, false);
				} else 
				
				// if right left with 1 corner
				if(!left_side && !right_side && !bottom_side && !top_side && top_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_1corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size), circleRadius, 1*Math.PI, 0.5*Math.PI, true);
				} else 
				
				// if bottom left with 1 corner
				if(!left_side && !right_side && !bottom_side && !top_side && bottom_left_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_1corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
						this.ctx.stroke();
					}
					
					this.ctx.arc(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size), circleRadius, 0*Math.PI, 1.5*Math.PI, true);
				} else 
				
				// if bottom right with 1 corner
				if(!left_side && !right_side && !bottom_side && !top_side && bottom_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_1corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
						this.ctx.stroke();
					}
					
					this.ctx.arc(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size), circleRadius, 1*Math.PI, 1.5*Math.PI, false);
				} else 
				
				
				// EXAMPLE: if there is a wall bottom right, then the wall must be a top left corner
				// if top left with 3 corners
				if(top_left_corner && top_right_corner && bottom_left_corner && !bottom_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_3corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size), circleRadius + this.settings.thickness,1.5*Math.PI,1*Math.PI, true);
				} else 
				
				// if top right with 3 corners
				if(top_left_corner && top_right_corner && !bottom_left_corner && bottom_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_3corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + ((this.walls[w].y + 1) * this.settings.size), circleRadius + this.settings.thickness,0*Math.PI,1.5*Math.PI, true);
				} else 
				
				// if bottom left with 3 corners
				if(top_left_corner && !top_right_corner && bottom_left_corner && bottom_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_3corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + ((this.walls[w].x + 1) * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size), circleRadius + this.settings.thickness,0.5*Math.PI,1*Math.PI, false);
				} else
				
				// if bottom right with 3 corners
				if(!top_left_corner && top_right_corner && bottom_left_corner && bottom_right_corner ){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_3corner; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
					
					this.ctx.arc(this.settings.offset_x + (this.walls[w].x * this.settings.size), this.settings.offset_y + (this.walls[w].y * this.settings.size), circleRadius + this.settings.thickness,0*Math.PI,0.5*Math.PI, false);
				} else 
				
				// if no corners but closed from all sides
				if(!left_side && !right_side && !bottom_side && !top_side
					&& !top_left_corner && !top_right_corner && !bottom_left_corner && !bottom_right_corner){
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_closed; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
				} else 
				
				// if not surrounded
				{
					if(this.scematic_view){
						this.ctx.fillStyle = this.settings.debug.color_alone; 
						this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					}
				}
									
				this.ctx.stroke();
			} else {
				if(this.scematic_view){
					this.ctx.fillStyle = this.settings.debug.color_alone; 
					this.ctx.strokeStyle = "yellow"; 
					this.ctx.lineWidth = 3;
					this.ctx.fillRect(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale), this.settings.thickness, this.settings.thickness);
					
					this.ctx.moveTo(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale));
					this.ctx.lineTo(this.settings.offset_x + (this.walls[w].x * this.settings.size + scale * 2), this.settings.offset_y + (this.walls[w].y * this.settings.size + scale * 2));
					this.ctx.stroke();
				}
			}
		}
	}
}