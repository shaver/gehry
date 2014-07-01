const GRIDSIZE = 16;
const PALETTE_WIDTH = 100;

require(["building", "overlay", "designer"], function(Building, overlay, designer) {
        var designerElt = document.getElementById("designer");
        designer.setElement(designerElt);

        var overlayElt = document.getElementById("overlay");
        overlay.setElement(overlayElt);
        overlay.setDesigner(designer);

        var gridElt = document.getElementById("grid");
        var grid = gridElt.getContext("2d");

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

        function redraw(loc) {
            redrawGrid(loc);
            overlay.draw(loc);
            designer.draw(loc);
        }

        var events = {
            mousemove: function mousemove (e) {
                var loc = mouseloc(e);
                overlay.dragMove(loc);
                redraw(loc);
            },

            mousedown: function mousedown(e) {
                if (e.button != 0) {
                    return;
                }

                var loc = mouseloc(e);

                if (e.altKey) {
                    var type = Building.TYPES[Building.getNextId() % Building.TYPES.length];
                    overlay.startPlaceNew(type, loc);
                } else {
                    var bldg = designer.buildingForLocation(loc);
                    if (bldg) {
                        overlay.dragStart(bldg, loc);
                    }
                }
                events.mousemove(e);
            },

            mouseup: function mouseup(e) {
                if (e.button != 0) {
                    return;
                }

                var loc = mouseloc(e);
                events.mousemove(e)
                overlay.dragDrop(loc);
                mode = modes.POINTING;
            }
        };

        overlayElt.addEventListener("mousedown", events.mousedown, false);
        overlayElt.addEventListener("mousemove", events.mousemove, false);
        overlayElt.addEventListener("mouseup",   events.mouseup,   false);

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
