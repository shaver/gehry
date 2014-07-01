$(function() {
    const GRIDSIZE = 16;

    var designerElt = document.getElementById("designer");
    var designer = designerElt.getContext("2d");

    var overlayElt = document.getElementById("overlay");
    var overlay = overlayElt.getContext("2d");

    var gridElt = document.getElementById("grid");
    var grid = gridElt.getContext("2d");

    function Building(type, loc) {
        this.type = type;
        this.id = Building._counter++;
        this.updateLoc(loc);
    };

    Building.TYPES = {
        "FORGE": { name: "Forge", key: "w f", size: Size(3, 3), color: "blue", symbol: "F" },
        "SMELTER": { name: "Smelter", key: "e s", size: Size(3, 3), color: "green", symbol: "S" },
    };

    Building._counter = 1;

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

    function drawBuildings(buildings, context) {
        buildings.forEach(function(bldg) { bldg.draw(context); });
    }

    function Size(w, h) {
        return { width: w, height: h};
    }
    function snap(val) {
        return val - val % GRIDSIZE + GRIDSIZE / 2;
    }

    function mouseloc(e) {
        var cell = { };
        var eltrect = e.target.getBoundingClientRect();

        cell.rawX = e.clientX - eltrect.left;
        cell.rawY = e.clientY - eltrect.top;

        cell.x = snap(cell.rawX);
        cell.y = snap(cell.rawY);
        cell.width = GRIDSIZE;
        cell.height = GRIDSIZE;

        cell.top = cell.y - GRIDSIZE / 2;
        cell.left = cell.x - GRIDSIZE / 2;
        cell.bottom = cell.top + cell.height;
        cell.right = cell.left + cell.width;

        return cell;
    }

    function boundingRect(loc1, loc2) {
        var rect = { };

        rect.top = Math.min(loc1.top, loc2.top);
        rect.bottom = Math.max(loc1.bottom, loc2.bottom);
        rect.left = Math.min(loc1.left, loc2.left);
        rect.right = Math.max(loc1.right, loc2.right);

        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;

        return rect;
    }

    var modes = {
        POINTING: "pointing",
        PENCIL: "pencil",
        RECT: "rect",
        DRAG3x3: "drag3x3"
    }

    var mode = modes.POINTING;
    var startLoc = null;
    var snappedMouseLoc = null;
    var draggedBuilding = null;
    var cursorBuilding = null;
    var placedBuildings = [];

    function startDraggingBuilding(bldg, loc) {
        draggedBuilding = bldg;
        cursorBuilding = new Building(bldg.type, loc)
    }

    function stopDraggingBuilding(loc) {
        if (draggedBuilding) {
            draggedBuilding.updateLoc(loc);
            draggedBuilding = null;
            cursorBuilding = null;
        }
    }

    function maybeDragBuilding(loc) {
        if (cursorBuilding) {
            cursorBuilding.updateLoc(loc);
        }
    }

    function redrawDesigner() {
        designer.clearRect(0, 0, designerElt.width, designerElt.height);
        drawBuildings(placedBuildings.filter(function(bldg) {
            var isDragged = draggedBuilding && (bldg.id == draggedBuilding.id);
            return !isDragged;
        }), designer);
    }

    function redrawOverlay() {
        overlay.clearRect(0, 0, overlayElt.width, overlayElt.height);
        overlay.fillStyle = "rgb(255, 0, 0, 0.5)";
        overlay.beginPath();
        overlay.arc(snappedMouseLoc.x, snappedMouseLoc.y, 5, 0, 2 * Math.PI);
        overlay.fill();

        if (mode == modes.DRAG3x3) {
            overlay.beginPath();
            overlay.fillStyle = "rgba(128, 0, 128, 0.5)";
            overlay.fillRect(snappedMouseLoc.left, snappedMouseLoc.top, 3 * GRIDSIZE, 3 * GRIDSIZE);
        }

        if (draggedBuilding) {
            overlay.save();
            overlay.globalAlpha = 0.5;
            draggedBuilding.draw(overlay);
            cursorBuilding.draw(overlay);
            overlay.restore();
        }
    }

    function redraw() {
        redrawOverlay();
        redrawDesigner();
    }

    var events = {
        mousemove: function mousemove (e) {
            snappedMouseLoc = mouseloc(e);
            maybeDragBuilding(snappedMouseLoc);
            redraw();
        },
        mousedown: function mousedown(e) {
            if (e.button != 0) {
                return;
            }

            var loc = mouseloc(e);

             if (e.shiftKey) {
                mode = modes.RECT;
                startLoc = loc;
            } else if (e.altKey) {
                mode = modes.DRAG3x3;
            } else {
                var bldg = Building.forLocation(placedBuildings, loc);
                if (bldg) {
                    startDraggingBuilding(bldg, loc);
                } else {
                    mode = modes.PENCIL;
                }
            }
            events.mousemove(e);
        },
        mouseup: function mouseup(e) {
            if (e.button != 0) {
                return;
            }

            var loc = mouseloc(e);

            if (mode == modes.DRAG3x3) {
                // drop on the designerElt
                var type = Building.TYPES[Building._counter % 2 ? "FORGE" : "SMELTER"];
                placedBuildings.push(new Building(type, loc));
            }
            stopDraggingBuilding(loc);
            mode = modes.POINTING;
            events.mousemove(e)
        }
    };

    overlayElt.addEventListener("mousedown", events.mousedown, false);
    overlayElt.addEventListener("mousemove", events.mousemove, false);
    overlayElt.addEventListener("mouseup", events.mouseup, false);

    var width = designerElt.width, height = designerElt.height;
    for (var i = 0; i <= width; i += 16) {
        grid.beginPath();
        grid.strokeStyle = "rgb(200, 200, 200)";
        grid.moveTo(i, 0);
        grid.lineTo(i, height);
        grid.stroke();
    }

    for (var i = 0; i < height; i += 16) {
        grid.beginPath();
        grid.styleStyle = "rgb(200, 200, 200)";
        grid.moveTo(0, i);
        grid.lineTo(width, i);
        grid.stroke();
    }
});

