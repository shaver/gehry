$(function() {
    var designer = document.getElementById("designer");
    var context = designer.getContext("2d");

    var overlay = document.getElementById("overlay");
    var overlayContext = overlay.getContext("2d");

    var started = false;

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
        cell.top = cell.x - GRIDSIZE / 2;
        cell.left = cell.y - GRIDSIZE / 2;
        cell.bottom = cell.top + GRIDSIZE;
        cell.right = cell.left + GRIDSIZE;

        return cell;
    }

    var events = { 
        mousemove: function mousemove (e) {
            var loc = mouseloc(e);

            if (started) {
                context.strokeStyle = "black";
                context.lineTo(loc.x, loc.y);
                context.stroke();
            }

            overlayContext.clearRect(0, 0, overlay.width, overlay.height);
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
            started = true;
        },
        mouseup: function mouseup(e) {
            events.mousemove(e)
            started = false;
        }
    };

    overlay.addEventListener("mousedown", events.mousedown, false);
    overlay.addEventListener("mousemove", events.mousemove, false);
    overlay.addEventListener("mouseup", events.mouseup, false);

    var width = designer.width, height = designer.height;
    for (var i = 0; i < width; i += 16) {
        context.beginPath();
        context.strokeStyle = "rgb(200, 200, 200)";
        context.moveTo(0, i);
        context.lineTo(height, i);
        context.stroke();
    }

    for (var i = 0; i < height; i += 16) {
        context.beginPath();
        context.styleStyle = "rgb(200, 200, 200)";
        context.moveTo(i, 0);
        context.lineTo(i, width);
        context.stroke();
    }
});

