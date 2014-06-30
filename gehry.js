$(function() {
    var designer = document.getElementById("designer");
    var context = designer.getContext("2d");

    var overlay = document.getElementById("overlay");
    var overlayContext = overlay.getContext("2d");

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
        RECT: "rect"
    }

    var mode = modes.POINTING;
    var startLoc;

    var events = { 
        mousemove: function mousemove (e) {
            var loc = mouseloc(e);

            overlayContext.clearRect(0, 0, overlay.width, overlay.height);

            if (mode == modes.PENCIL) {
                context.beginPath();
                context.rect(loc.left, loc.top, loc.width, loc.height);
                context.fill();
            } else if (mode == modes.RECT) {
                context.beginPath();
                var rect = boundingRect(loc, startLoc);
                context.rect(rect.left, rect.top, rect.width, rect.height);
                context.fill();
            }

            overlayContext.beginPath();
            overlayContext.arc(loc.x, loc.y, 5, 0, 2 * Math.PI);
            overlayContext.strokeStyle = "rgb(255, 0, 0)";
            overlayContext.lineWidth = 3;
            overlayContext.stroke();
        },
        mousedown: function mousedown(e) {
            var loc = mouseloc(e);

            context.beginPath();
            context.moveTo(loc.x, loc.y);
            if (e.shiftKey) {
                mode = modes.RECT;
                startLoc = loc;
            } else {
                mode = modes.PENCIL;
            }
        },
        mouseup: function mouseup(e) {
            events.mousemove(e)
            mode = modes.POINTING;
        }
    };

    overlay.addEventListener("mousedown", events.mousedown, false);
    overlay.addEventListener("mousemove", events.mousemove, false);
    overlay.addEventListener("mouseup", events.mouseup, false);

    var width = designer.width, height = designer.height;
    for (var i = 0; i <= width; i += 16) {
        context.beginPath();
        context.strokeStyle = "rgb(200, 200, 200)";
        context.moveTo(i, 0);
        context.lineTo(i, height);
        context.stroke();
    }

    for (var i = 0; i < height; i += 16) {
        context.beginPath();
        context.styleStyle = "rgb(200, 200, 200)";
        context.moveTo(0, i);
        context.lineTo(width, i);
        context.stroke();
    }
});

