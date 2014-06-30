$(function() {
    var buildingTypes = {
        "FORGE": { name: "Forge", key: "w f", size: Size(3, 3), color: "blue" },
        "SMELTER": { name: "Smelter", key: "e s", size: Size(3, 3), color: "green" },
    };

    var buildings = [ ];

    var designerElt = document.getElementById("designer");
    var designer = designerElt.getContext("2d");

    var overlayElt = document.getElementById("overlay");
    var overlay = overlayElt.getContext("2d");

    var gridElt = document.getElementById("grid");
    var grid = gridElt.getContext("2d");

    var buildingCounter = 0;
    function addBuilding(type, loc) {
        var bldg = { type: type, id: buildingCounter++, loc: loc };
        buildings.push(bldg);
    }

    function drawBuildings(context) {
        buildings.forEach(function(bldg) {
            context.fillStyle = bldg.type.color;
            context.fillRect(bldg.loc.left, bldg.loc.top,
                             bldg.type.size.width * GRIDSIZE, bldg.type.size.height * GRIDSIZE);
        });
    }

    const GRIDSIZE = 16;

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
    var startLoc;

    var events = { 
        mousemove: function mousemove (e) {
            var loc = mouseloc(e);

            overlay.clearRect(0, 0, overlayElt.width, overlayElt.height);

            if (mode == modes.PENCIL) {
                designer.fillStyle = "black";
                designer.fillRect(loc.left, loc.top, loc.width, loc.height);
            } else if (mode == modes.RECT) {
                designer.fillStyle = "black";
                var rect = boundingRect(loc, startLoc);
                designer.fillRect(rect.left, rect.top, rect.width, rect.height);
            } else if (mode == modes.DRAG3x3) {
                overlay.fillStyle = "rgba(128, 0, 128, 0.5)";
                overlay.fillRect(loc.left, loc.top, 3 * GRIDSIZE, 3 * GRIDSIZE);
            }

            overlay.beginPath();
            overlay.arc(loc.x, loc.y, 5, 0, 2 * Math.PI);
            overlay.strokeStyle = "rgb(255, 0, 0)";
            overlay.lineWidth = 3;
            overlay.stroke();
        },
        mousedown: function mousedown(e) {
            if (e.button != 0) {
                return;
            }

            var loc = mouseloc(e);

            designer.beginPath();
            designer.moveTo(loc.x, loc.y);
            if (e.shiftKey) {
                mode = modes.RECT;
                startLoc = loc;
            } else if (e.altKey) {
                mode = modes.DRAG3x3;
            } else {
                mode = modes.PENCIL;
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
                addBuilding(buildingTypes[buildingCounter % 2 ? "FORGE" : "SMELTER"], loc);
                drawBuildings(designer);
                mode = modes.POINTING; // gross: redraw without drag cursor
            }
            events.mousemove(e)
            mode = modes.POINTING;
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

