$(function() {
    var designer = document.getElementById("designer");
    var context = designer.getContext("2d");

    var overlay = document.getElementById("overlay");
    var overlayContext = overlay.getContext("2d");

    var grid = document.getElementById("grid");
    var gridContext = grid.getContext("2d");

    const GRIDSIZE = 16;
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

        console.log(JSON.stringify(loc1), JSON.stringify(loc2), JSON.stringify(rect));
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

            overlayContext.clearRect(0, 0, overlay.width, overlay.height);

            if (mode == modes.PENCIL) {
                context.fillRect(loc.left, loc.top, loc.width, loc.height);
            } else if (mode == modes.RECT) {
                var rect = boundingRect(loc, startLoc);
                context.fillRect(rect.left, rect.top, rect.width, rect.height);
            } else if (mode == modes.DRAG3x3) {
                overlayContext.fillStyle = "rgba(128, 0, 128, 0.5)";
                overlayContext.fillRect(loc.left, loc.top, 3 * GRIDSIZE, 3 * GRIDSIZE);
            }

            overlayContext.beginPath();
            overlayContext.arc(loc.x, loc.y, 5, 0, 2 * Math.PI);
            overlayContext.strokeStyle = "rgb(255, 0, 0)";
            overlayContext.lineWidth = 3;
            overlayContext.stroke();
        },
        mousedown: function mousedown(e) {
            if (e.button != 0) {
                return;
            }

            var loc = mouseloc(e);

            context.beginPath();
            context.moveTo(loc.x, loc.y);
            if (e.shiftKey) {
                mode = modes.RECT;
                startLoc = loc;
            } else if (e.altKey) {
                mode = modes.DRAG3x3;
            } else {
                mode = modes.PENCIL;
            }
        },
        mouseup: function mouseup(e) {
            if (e.button != 0) {
                return;
            }

            var loc = mouseloc(e);

            events.mousemove(e)
            if (mode == modes.DRAG3x3) {
                // drop on the designer
                context.fillRect(loc.left, loc.top, GRIDSIZE * 3, GRIDSIZE * 3);
            }
            mode = modes.POINTING;
        }
    };

    overlay.addEventListener("mousedown", events.mousedown, false);
    overlay.addEventListener("mousemove", events.mousemove, false);
    overlay.addEventListener("mouseup", events.mouseup, false);

    var width = designer.width, height = designer.height;
    for (var i = 0; i <= width; i += 16) {
        gridContext.beginPath();
        gridContext.strokeStyle = "rgb(200, 200, 200)";
        gridContext.moveTo(i, 0);
        gridContext.lineTo(i, height);
        gridContext.stroke();
    }

    for (var i = 0; i < height; i += 16) {
        gridContext.beginPath();
        gridContext.styleStyle = "rgb(200, 200, 200)";
        gridContext.moveTo(0, i);
        gridContext.lineTo(width, i);
        gridContext.stroke();
    }
});

