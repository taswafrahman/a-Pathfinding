Search_Student = function (grid, config) {
    let self = {};

    self.config = config;       // search configuration object
    //   config.actions = array of legal [x, y] actions
    //   config.actionCosts[i] = cost of config.actions[i]
    //   config.heuristic = 'diag', 'card', 'dist', or 'zero'
    self.grid = grid;           // the grid we are using to search
    self.sx = -1;               // x location of the start state
    self.sy = -1;               // y location of the start state
    self.gx = -1;               // x location of the goal state
    self.gy = -1;               // y location of the goal state
    self.size = 1;              // the square side length (size) of the agent
    self.maxSize = 3;           // the maximum size of an agent
    self.startingHealth = 5;
    self.noHealthSentinel = 100000000;

    self.inProgress = false;    // whether the search is in progress

    self.path = [];             // the path, if the search found one
    self.open = new BinaryHeap(function (x) { return x.h + x.g; });             // the current open list of the search (stores Nodes)
    self.closed = {};          // the current closed list of the search
    self.cost = 'Search Not Completed'; // the cost of the path found, -1 if no path
    self.sectors = [[], [], []];

    self.startSearch = function (sx, sy, gx, gy, size) {
        // deals with an edge-case with the GUI, leave this line here
        if (sx == -1 || gx == -1) { return; }

        self.inProgress = true;     // the search is now considered started
        self.sx = sx;               // set the x,y location of the start state
        self.sy = sy;
        self.gx = gx;               // set the x,y location of the goal state
        self.gy = gy;
        self.size = size;           // the size of the agent
        self.path = [];             // set an empty path
        self.closed = {};
        self.open = new BinaryHeap(function (x) { return x.h + x.g; });
        self.open.push(new Node(sx, sy, null, null, 0, 0, self.startingHealth));
        self.cost = -1;
        //-------for GridGUI use--------
        self.health = self.startingHealth;
        //-------for GridGUI use--------

        // TODO: everything else necessary to start a new search
    }

    self.estimateCost = function (x, y, gx, gy) {
        // compute and return the diagonal manhattan distance heuristic
        if (self.config.heuristic == 'diag') {
            let xDistance = Math.abs(gx - x);
            let yDistance = Math.abs(gy - y);
            return (Math.abs(xDistance - yDistance) * self.config.actionCosts[0]) +
             (Math.min(xDistance, yDistance) * self.config.actionCosts[4]);
        } else if (self.config.heuristic == 'card') {
            return Math.abs(gx - x) * self.config.actionCosts[0] + Math.abs(gy-y) * self.config.actionCosts[0];
        } else if (self.config.heuristic == 'dist') {
            return Math.sqrt(Math.abs(gx - x) * self.config.actionCosts[0] + Math.abs(gy-y) * self.config.actionCosts[0]);
        } else if (self.config.heuristic == 'zero') {
            return 0;
        }
    }

    self.isConnected = function (x1, y1, x2, y2, size) {
        return self.sectors[size - 1][x1][y1] == self.sectors[size - 1][x2][y2];
    }

    self.isLegalAction = function (x, y, size, action) {
        if (self.grid.isOOB(x, y, size)) {
            return false;
        }
        if (action[0] == 0 || action[1] == 0) {
            return !self.grid.isOOB(x + action[0], y + action[1], size) && (self.sectors[size - 1][x + action[0]][y + action[1]] == self.sectors[size - 1][x][y]);
        } else {
            return !self.grid.isOOB(x + action[0], y + action[1]) && (self.sectors[size - 1][x][y] == self.sectors[size - 1][x + action[0]][y + action[1]]) &&
                self.isLegalAction(x, y, size, [action[0], 0]) && self.isLegalAction(x, y, size, [0, action[1]]);
        }
    }

    self.canFit = function (x, y, action, size) {
        if (self.grid.isOOB(x, y, size) || self.grid.isOOB(x+action[0], y+action[1], size)) {
            return false
        }
        let validTiles = self.grid.validTiles(x, y);
        for (xdist = 0; xdist < size; xdist++) {
            for (ydist = 0; ydist < size; ydist++) {
                if (!validTiles.includes(self.grid.get(x + xdist + action[0], y + ydist + action[1]))) {
                    return false
                }
            }
        }
        return true
    }

    // Student TODO: Implement this function
    //
    // This function should compute and store the connected sectors discussed in class.
    // This function is called by the construct of this obself.sectors[size-1][x + action[0]ject before it is returned.
    //
    // Args:
    //    none
    //
    // Returns:
    //    none
    self.computeSectors = function () {
        self.setupSectors();
        let sectorValue = 1;
        for (size = 0; size < self.maxSize; size++) {
            for (widthIndex = 0; widthIndex <= self.grid.width; widthIndex++) {
                for (heightIndex = 0; heightIndex <= self.grid.height; heightIndex++) {
                    if (self.sectors[size][widthIndex][heightIndex] == 0) {
                        self.searchIterationBFS(widthIndex, heightIndex, size, sectorValue);
                        sectorValue = sectorValue + 1;
                    }
                }
            }
        }
    }

    self.setupSectors = function () {
        for (size = 0; size < self.maxSize; size++) {
            for (widthIndex = 0; widthIndex <= self.grid.width; widthIndex++) {
                self.sectors[size][widthIndex] = [];
                for (heightIndex = 0; heightIndex <= self.grid.height; heightIndex++) {
                    self.sectors[size][widthIndex][heightIndex] = 0;
                }
            }
        }
    }

    self.searchIterationBFS = function (x, y, size, sectorValue) {
        self.open.push(new Node(x, y, null, null, 0, 0, self.startingHealth));
        while (self.open.size() > 0) {
            let tempNode = self.open.pop();
            if (self.sectors[size][tempNode.x][tempNode.y] == 0) {
                self.sectors[size][tempNode.x][tempNode.y] = sectorValue;
                self.expandNodeBFS(tempNode, size + 1); //Calls function to expand and add nodes to the global open list variable
            }
        }
    }

    self.expandNodeBFS = function (tempNode, size) {
        for (let i = 0; i < self.config.actions.length; i++) {
            if (self.canFit(tempNode.x, tempNode.y, self.config.actions[i], size)) {
                self.open.push(new Node(tempNode.x + self.config.actions[i][0],
                    tempNode.y + self.config.actions[i][1], tempNode, self.config.actions[i], 0, 0), self.startingHealth);
            }
        }
    }

    //Expands the node passed as an argument. Adds the expanded nodes to the global open list variable. Only adds nodes to list if the node is valid to be moved to
    //Args:
    //     tempNode: node to expand
    //Return:
    //    None. Nodes are added to the open list instead of a new array. Improves memory/cpu usage, as a temporary array isn't created, which saves on gc runs.
    self.expandNode = function (tempNode, size) {
        let validActions = self.grid.getValidActions(tempNode.x, tempNode.y, self.config.actions);
        for (let i = 0; i < validActions.length; i++) {
            if (self.isLegalAction(tempNode.x, tempNode.y, size, validActions[i])) {
                let node = new Node(tempNode.x + validActions[i][0], tempNode.y +
                                    validActions[i][1], tempNode, validActions[i],
                                    tempNode.g + self.getActionCost(tempNode.x + validActions[i][0], tempNode.y + validActions[i][1], validActions[i]) +
                                        (tempNode.agentHealth <= 0 ? self.noHealthSentinel : 0),
                                    self.estimateCost(tempNode.x + validActions[i][0],
                                    tempNode.y + validActions[i][1], self.gx, self.gy),
                                    tempNode.agentHealth - self.grid.getDamage(tempNode.x + validActions[i][0], tempNode.y + validActions[i][1]));

                                    //-------for GridGUI use--------
                                    self.health = tempNode.agentHealth;
                                    //-------for GridGUI use--------
                let openNode = self.getFromOpen(node);
                if (openNode != null && openNode.g <= node.g) {
                    continue;
                }
                self.open.push(node);
            }
        }
    }

    self.searchIteration = function () {
        if (!self.inProgress) {
          return;
        }
        if (!self.isConnected(self.sx, self.sy, self.gx, self.gy, self.size)) {
            self.inProgress = false; // we don't need to search any more
            self.cost = -1; // no path was possible, so the cost is -1
            return;
        }
        if (self.open.size() > 0) {
            let tempNode = self.open.pop();
            if (tempNode.y == self.gy && tempNode.x == self.gx) {
                self.setPath(tempNode); //Sets global path variable by passing in the last node who's state matches the goal
                self.cost = tempNode.g;
                self.inProgress = false;
                return;
            }
            let hash = self.hashNode(tempNode); //Cache the hashed value of the node to avoid hashing it twice
            if (!(hash in self.closed)) {
                self.closed[hash] = tempNode;
                self.expandNode(tempNode, self.size); //Calls function to expand and add nodes to the global open list variable
            }
        } else {
            self.cost = -1;
            self.inProgress = false;
        }
    }

    //Sets the path variable to the path of actions taken to get to the node
    //Args:
    //    node: the last node we've reached, the one we want to get the path to.
    //Return:
    //    None. Nodes are added to the path list instead of added to a new array. Improves memory/cpu usage by reducing required gc runs.
    self.setPath = function (node) {
        while (node.action != null) {
            self.path.unshift([node.action[0], node.action[1]]);
            node = node.parent;
        }
    }

    //Converts a node into an integer hash, such that it can be used as a unique dictionary key.
    //Args:
    //    node: The node to get the hash of.
    //Returns:
    //    Hash of the node.
    self.hashNode = function (node) {
        return node.y * self.grid.width + node.x;
    }

    self.getOpen = function () {
        let array = [];
        for (let i = 0; i < self.open.size(); i++) {
            array.push([self.open.content[i].x, self.open.content[i].y]);
        }
        return array;
    }

    self.getClosed = function () {
        let array = [];
        for (let key in self.closed) {
            array.push([self.closed[key].x, self.closed[key].y]);  //Lookup node in dictionary, add the x and y value from the node to the arrray as an array.
        }
        return array;
    }

    self.getFromOpen = function (node) {
        let hash = self.hashNode(node);
        for (let i = 0; i < self.open.size(); i++) {
            if (self.hashNode(self.open.content[i]) == hash) {
                return self.open.content[i];
            }
        }
        return null;
    }

    self.getActionCost = function(x, y, action) {
        return self.config.actionCosts[self.config.actions.indexOf(action)] * self.grid.getSpeedMultiplier(x, y);
    }

    self.computeSectors();
    return self;
}
