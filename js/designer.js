define(["building"], function(Building) {
   var element, context;
   var placedBuildings = [];

    function draw(loc) {
        context.clearRect(0, 0, element.width, element.height);
        placedBuildings.forEach(function(bldg) { bldg.draw(context); });
    }

    function placeNewBuilding(building, loc) {
        building.updateLoc(loc);
        placedBuildings.push(building);
        this.draw(loc);
    }

    function buildingForLocation(loc) {
        return Building.forLocation(placedBuildings, loc)
    }

    var Designer = {
        draw: draw,
        placeNewBuilding: placeNewBuilding,
        setElement: function setElement(elt) {
            element = elt;
            context = elt.getContext("2d");
        },
        buildingForLocation: buildingForLocation,
    };

    return Designer;
});