define(["building"], function(Building) {
    var element, overlay;
    var draggedBuilding = null, placingBuilding = null;
    var designer;

    const Modes = { PLACE_NEW: "place_new", DRAG_BUILDING: "drag_building" };
    var mode = null;

    function draw(loc) {
        if (!loc)
            return;

        overlay.clearRect(0, 0, element.width, element.height);

        if (mode == Modes.PLACE_NEW) {
            overlay.beginPath();
            overlay.fillStyle = "rgba(128, 0, 128, 0.5)";
            overlay.fillRect(loc.left, loc.top, 3 * GRIDSIZE, 3 * GRIDSIZE);
        }

        if (draggedBuilding || placingBuilding) {
            overlay.save();
            overlay.globalAlpha = 0.5;
            draggedBuilding && draggedBuilding.drawAt(overlay, loc);
            placingBuilding && placingBuilding.drawAt(overlay, loc);
            overlay.restore();
        }

        // overlay.fillStyle = "rgb(255, 0, 0, 0.5)";
        // overlay.beginPath();
        // overlay.arc(loc.x, loc.y, 5, 0, 2 * Math.PI);
        // overlay.fill();


    }

    function dragStart(building, loc) {
        draggedBuilding = building;
        this.draw(loc);
    }

    function dragCancel(loc) {
        draggedBuilding = null;
        this.draw(loc);
    }

    function dragMove(loc) {
        this.draw(loc);
    }

    function dragDrop(loc) {
        if (draggedBuilding) {
            draggedBuilding.updateLoc(loc);
            draggedBuilding = null;
            designer.draw(loc);
        }

        if (placingBuilding) {
            designer.placeNewBuilding(placingBuilding, loc);
            placingBuilding = null;
        }
        this.draw(loc);
    }

    function startPlaceNew(type, loc) {
        placingBuilding = new Building(type, loc);
        this.draw(loc);
    }

    var Overlay = {
        draw: draw,
        dragStart: dragStart,
        dragMove: dragMove,
        dragCancel: dragCancel,
        dragDrop: dragDrop,
        startPlaceNew: startPlaceNew,
        setDesigner: function setDesigner(d) {
            designer = d;
        },
        setElement: function setElement(elt) {
            element = elt;
            overlay = elt.getContext("2d");
        },
    };

    return Overlay;

});

