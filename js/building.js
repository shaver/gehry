define(function() {
    function Building(type, loc) {
        this.type = type;
        this.id = _counter++;
        this.updateLoc(loc);
    };

    const TYPES = [
        { type: "FORGE", name: "Forge", key: "w f", width: 3, height: 3, color: "blue", symbol: "F" },
        { type: "SMELTER", name: "Smelter", key: "e s", width: 4, height: 3, color: "red", symbol: "S" },
        { type: "DEPOT", name: "Trade depot", key: "D", width: 5, height: 5, color: "green", symbol: "D"}
    ];

    var _counter = 1;

    Building.prototype.updateLoc = function(loc) {
        loc.width = this.type.width * GRIDSIZE;
        loc.height = this.type.height * GRIDSIZE;
        loc.right = loc.x + loc.width;
        loc.bottom = loc.y + loc.height;
        this.loc = loc;
    };

    Building.prototype.drawAt = function drawAt(context, loc) {
        var btype = this.type;
        var width = btype.width * GRIDSIZE, height = btype.height * GRIDSIZE;
        context.beginPath();
        context.fillStyle = btype.color;
        context.fillRect(loc.left, loc.top, width, height);

        context.font = GRIDSIZE * 0.75 + "px sans-serif";
        var metrics = context.measureText(btype.symbol);
        context.fillStyle = "white";
        context.fillText(btype.symbol,
                         loc.left + width / 2 - metrics.width / 2,
                         loc.top + height / 2 + metrics.width / 2);
    }
    Building.prototype.draw = function(context) {
        this.drawAt(context, this.loc);
    }

    Building.forLocation = function(buildings, loc) {
        var bldgs = buildings.filter(function(bldg) {
            var inside = loc.x > bldg.loc.left && loc.x < bldg.loc.right &&
                  loc.y > bldg.loc.top && loc.y < bldg.loc.bottom;
            return inside;
        });
        // return the one drawn last, which is the one it looks like we're clicking
        return bldgs[bldgs.length - 1];
    }

    Building.TYPES = TYPES;

    Building.getNextId = function() { return _counter; }

    return Building;    
});
