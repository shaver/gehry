define(function() {
    function Building(type, loc) {
        this.type = type;
        this.id = _counter++;
        this.updateLoc(loc);
    };

    const TYPES = [
        { type: "FORGE", name: "Forge", key: "w f", size: Size(3, 3), color: "blue", symbol: "F" },
        { type: "SMELTER", name: "Smelter", key: "e s", size: Size(4, 3), color: "red", symbol: "S" },
        { type: "DEPOT", name: "Trade depot", key: "D", size: Size(5, 5), color: "green", symbol: "D"}
    ];

    var _counter = 1;

    Building.prototype.updateLoc = function(loc) {
        loc.width = this.type.size.width * GRIDSIZE;
        loc.height = this.type.size.height * GRIDSIZE;
        loc.right = loc.x + loc.width;
        loc.bottom = loc.y + loc.height;
        this.loc = loc;
    };

    Building.prototype.draw = function(context) {
        var btype = this.type;

        context.beginPath();
        context.fillStyle = btype.color;
        var width = this.loc.width;
        var height = this.loc.height;
        context.fillRect(this.loc.left, this.loc.top, width, height);

        context.font = GRIDSIZE * 0.75 + "px sans-serif";
        var metrics = context.measureText(btype.symbol);
        context.fillStyle = "white";
        context.fillText(btype.symbol,
                         this.loc.left + width / 2 - metrics.width / 2,
                         this.loc.top + height / 2 + metrics.width / 2);
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

    function Size(w, h) {
        return { width: w, height: h};
    }

    Building.TYPES = TYPES;

    Building.getNextId = function() { return _counter; }

    return Building;    
});
