Grid = function (mapText) {
    var self = {};

    self.GREY_TILE = "0";
    self.GREEN_TILE = "1";
    self.BLUE_TILE = "2";
    self.SPEED_HALF_TILE = "3";
    self.DAMAGE_TEN_TILE = "4";
    self.ONE_WAY_LEFT_DOWN_TILE = "5";

    self.Damage_AMOUNT = 0;
    self.SPEED_MULTIPLIER = 0;

    self.CanUp = false;
    self.CanDown = false;
    self.CanLeft = false;
    self.CanRight = false;

    self.GREEN_CONNECTED_TILES = [self.GREEN_TILE, self.SPEED_HALF_TILE, self.DAMAGE_TEN_TILE, self.ONE_WAY_LEFT_DOWN_TILE];

    self.grid = mapText.split("\n");

    self.width =  self.grid.length;
    self.height = self.grid[0].length;
    self.maxSize = 3;

    self.get = function (x, y) {
        return self.grid[y][x];
    }

    self.isOOB = function (x, y, size) {
        return x < 0 || y < 0 || (x + size) > self.width || (y + size) > self.height;
    }

    self.validTiles = function (x, y) {
        if (self.GREEN_CONNECTED_TILES.includes(self.get(x,y))) {
            return self.GREEN_CONNECTED_TILES;
        } else {
            return [self.get(x,y)]
        }
    }

    self.getDamage = function (x, y) {
        if (self.get(x,y) == self.DAMAGE_TEN_TILE) {
            return self.Damage_AMOUNT;
        } else {
            return 0;
        }
    }

    self.getSpeedMultiplier = function (x, y) {
        let tileValue = self.get(x, y);
        if (tileValue == self.SPEED_HALF_TILE) {
            return self.SPEED_MULTIPLIER; //Tile makes you move half as fast, which means g value should be multiplied by 2.
        } else {
          return 1.0;
        }
    }

    self.getValidActions = function (x, y, actions) {
        if (self.get(x,y) == self.ONE_WAY_LEFT_DOWN_TILE) {
            let action_cando = [];
            if(self.CanDown){
                action_cando.push(actions[0]);
            }
            if(self.CanUp){
                action_cando.push(actions[1]);
            }
            if(self.CanRight){
                action_cando.push(actions[2]);
            }
            if(self.CanLeft){
                action_cando.push(actions[3]);
            }
            if (actions.length > 4) {
              if(self.CanRight && self.CanDown){
                  action_cando.push(actions[4]);
              }
              if(self.CanLeft && self.CanUp){
                  action_cando.push(actions[5]);
              }
              if(self.CanUp && self.CanRight){
                  action_cando.push(actions[6]);
              }
              if(self.CanDown && self.CanLeft){
                  action_cando.push(actions[7]);
              }
          }
            return action_cando;
        } else {
            return actions;
        }
    }
    return self;
}
