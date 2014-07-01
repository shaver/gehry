const GRIDSIZE = 16;
const PALETTE_WIDTH = 100;

require(["building"],
    function(Building) {

        var designerElt = document.getElementById("designer");
        var designer = designerElt.getContext("2d");

        var overlayElt = document.getElementById("overlay");
        var overlay = overlayElt.getContext("2d");

        var gridElt = document.getElementById("grid");
        var grid = gridElt.getContext("2d");


        function drawBuildings(buildings, context) {
            buildings.forEach(function(bldg) { bldg.draw(context); });
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
            PLACE_NEW: "place_new"
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
            if (!snappedMouseLoc)
                return;
            overlay.clearRect(0, 0, overlayElt.width, overlayElt.height);
            overlay.fillStyle = "rgb(255, 0, 0, 0.5)";
            overlay.beginPath();
            overlay.arc(snappedMouseLoc.x, snappedMouseLoc.y, 5, 0, 2 * Math.PI);
            overlay.fill();

            if (mode == modes.PLACE_NEW) {
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
            redrawGrid();
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

                if (e.altKey) {
                    mode = modes.PLACE_NEW;
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

                if (mode == modes.PLACE_NEW) {
                    // drop on the designer
                    var type = Building.TYPES[Building.getNextId() % Building.TYPES.length];
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

        function redrawGrid() {
            var width = designerElt.width - PALETTE_WIDTH, height = designerElt.height;
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
        }

        redraw();
});
