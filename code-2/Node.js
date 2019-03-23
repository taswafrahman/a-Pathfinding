// The Node class to be used in your search algorithm.
// This should not need to be modified to complete the assignment
Node = function (x, y, parent, action, g, h, agentHealth) {
    var self = {};
    self.x = x;
    self.y = y;
    self.action = action;
    self.parent = parent;
    self.g = g;
    self.h = h;
    self.agentHealth = agentHealth;
    return self;
}
