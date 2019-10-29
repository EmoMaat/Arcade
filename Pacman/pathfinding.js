class PacMan_PathFinding{
	/**
	 * returns an array with the path to the specified end point
	 * @param {Object} start contains at least an x and y
	 * @param {Object} end contains at least an x and y
	 * @param {Object} map contains all positions you can move to
	 * @param {Boolean} debug true returns the class instead of only an array, default is false
	 */
	constructor(start, end, map, heuristicsType = null, back = 5, debug = false){
		this.map = map
		this.start = start;
		this.end = end;

		this.diagonal = false;
		this.back = back;
		this._back = back; // safekeeping
		this.ret = [];

		this.heuristicsType = heuristicsType || "manhattan";

		if(this.heuristicsType == "diagonal")
			this.diagonal = true;

		//var tmp = new PathFinding({x:2,y:2},{x:16, y:2},pacManGame.map.space)

		this.closedset = [];	// The set of nodes already evaluated
		this.openset = []; 		// The set of currently discovered nodes that are not evaluated yet
		if(debug)
			this.path = this.findPath(this.start, this.end);
		else
			return this.findPath(this.start, this.end);
	}
	/**
	 * finds a path from the start to end point
	 * specified in the constructor
	 */
	findPath() {
		for(var i = 0; i < this.map.length; i++) {
			this.map[i].f = 0;
			this.map[i].g = 0;
			this.map[i].h = 0;
			this.map[i].parent = null;
		}

		if(this.end.x == this.start.x && this.end.y == this.start.y){
			//console.log("Pathfinding: Goal is same as start.");
			return [this.start];
		}

		// check if the end is reachable
		var is_reachable = false;
		for(var i = 0; i < this.map.length; i++)
			if(this.map[i].x == this.end.x && this.map[i].y == this.end.y)
				is_reachable = true;

		if(is_reachable){
			this.openset.push(this.start);
		} else {
			console.log("Pathfinding: Goal not reachable, unable to create path: x => "
			+ this.end.x + ", y => " + this.end.y);
			return [];
		}

		while (this.openset.length !== 0) {

			// get the node with the lowest F
			var lowestF = 0;
			for(var i = 0; i < this.openset.length; i++) {
				if(this.openset[i].f < this.openset[lowestF].f) { lowestF = i; }
			}

			var currentNode = this.openset[lowestF];

			// Check if goal has been discovered to build a path
			if (currentNode.x === this.end.x && currentNode.y === this.end.y) {
				var curr = currentNode;
				var ret = [];

				while(curr.parent) {
					ret.push(curr);
					curr = curr.parent;
				}
				return ret.reverse();
			}

			// Move current into closed set and out of the open set
			for (let i = 0; i < this.openset.length; i++){
				if(this.openset[i].x == currentNode.x && this.openset[i].y == currentNode.y)
					this.openset.splice(i, 1);
			}
			this.closedset.push(currentNode);

			// Get neighbous from the map
			if(typeof currentNode.back !== "undefined")
				this.back = currentNode.back;

			var neighbours = this.getNeighbours(currentNode);

			for (var i = 0; i < neighbours.length; i++) {
				// Get current step and distance from current to neighbor
				var gScore = currentNode.g + neighbours[i].cost;
				var gScoreIsBest = false;

				// Check for the neighbour in the closed set
				// then see if its cost is >= the stepCost, if so skip current neighbor
				for (var c = 0; c < this.closedset.length; c++){
					if(this.closedset[c].x == neighbours[i].x && this.closedset[c].y == neighbours[i].y)
						if(this.closedset[c].cost >= neighbours[i].cost)
							continue;
				}

				// Check for the neighbour in the open set
				var in_openset = false;
				for (var o = 0; o < this.openset.length; o++){
					if(this.openset[o].x == neighbours[i].x && this.openset[o].y == neighbours[i].y)
						in_openset = true;
				}

				// first time checking this node, so it is best
				if(!in_openset){
					// This the the first time we have arrived at this node, it must be the best
					// Also, we need to take the h (heuristic) score since we haven't done so yet

					gScoreIsBest = true;
					neighbours[i].h = this.heuristics(neighbours[i], this.end, this.heuristicsType)
					this.openset.push(neighbours[i]);
/*
					//if(typeof neighbours[i - 1] !== "undefined")
					if(neighbours[i].h < this.heuristics(currentNode, this.end, this.heuristicsType))
						continue;*/

				} else if(gScore < neighbours[i].g) {
					// We have already seen the node, but last time it had a worse g (distance from start)
					gScoreIsBest = true;
				}

				if(gScoreIsBest) {
					// Found an optimal (so far) path to this node.   Store info on how we got here and
					// just how good it really is...
					neighbours[i].parent = currentNode;
					neighbours[i].g = gScore;
					neighbours[i].f = neighbours[i].g + neighbours[i].h;
				}
			}
		}
	}

	/**
	 * gets distance between two points, not allowing diagonal movement
	 * Manhattan alogrithm
	 * @param {Object} node0 starting point
	 * @param {Object} node1 ending point
	 * @param {String} heuristics heuristics type (manhattan, diagonal, euclidian)
	 */
	heuristics(node0, node1, heuristics){
		// can only move horizonal and vertical
		if(heuristics == "manhattan"){
			var d1 = Math.abs(node1.x - node0.x);
			var d2 = Math.abs(node1.y - node0.y);
			return d1 + d2;
		}
	}

	/**
	 * returns an array with objects containing all neigbours
	 * @param {Object} node position
	 */
	getNeighbours(node) {
		this.ret = [];
		for (let i = 0; i < this.map.length; i++){
			// the number at the end is for knowing what the back is in case we take that path

			// left
			if (this.map[i].x == node.x - 1 && this.map[i].y == node.y && this.back != 3){
				this.retPush(this.map[i].x, this.map[i].y, this.map[i].cost, 1);
			}

			// right
			if (this.map[i].x == node.x + 1 && this.map[i].y == node.y && this.back != 1) {
				this.retPush(this.map[i].x, this.map[i].y, this.map[i].cost, 3);
			}

			// down
			if (this.map[i].x == node.x && this.map[i].y == node.y + 1 && this.back != 2) {
				this.retPush(this.map[i].x, this.map[i].y, this.map[i].cost, 0);
			}

			// top
			if (this.map[i].x == node.x && this.map[i].y == node.y - 1 && this.back != 0) {
				this.retPush(this.map[i].x, this.map[i].y, this.map[i].cost, 2);
			}
		}

		return this.ret;
	}

	retPush(addx, addy, addcost, PacBack){
		if (typeof this.addcost == undefined){
			if(x == this.start.x && addy == this.start.y)
				this.ret.push({x: addx, y:addy, cost:99999, back:PacBack});
			else
				this.ret.push({x: addx, y:addy, cost:addcost, back:PacBack});
		} else {
			this.ret.push({x: addx, y:addy, cost:1, back:PacBack});
		}
	}
}