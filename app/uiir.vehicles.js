var uiir = uiir || {};
uiir.vehicles = uiir.vehicles || {};

/*--------=### Vehicles View Model ###=---------*/
//
//    .
//    .
//
//----------------------------------------------//

uiir.vehicles.Vehicle = function(vehicleName, vehicleTileIndex, terrainArray, flyType) {
	var passableArray = terrainArray;
	var flyMode = flyType;
	var name = vehicleName;
	var tileIndex = vehicleTileIndex;
	var checkPassability = function(terrain) { 
		var i = passableArray.length;
		while(i--) {
			if(passableArray[i] === terrain) {
				return true;
			}
		}
		return false;
	}
	return {
		isPassable: checkPassability,
		name: name,
		flyMode: flyMode,
		vehicleTileIndex: tileIndex
	};
};

uiir.vehicles.flyModes = ['none', 'fly', 'orbit'];

uiir.vehicles.onFoot = new uiir.vehicles.Vehicle('none', -1, [0, 1, 2, 3, 4], 0);
uiir.vehicles.plane = new uiir.vehicles.Vehicle('plane', 2, [0, 1], 1);
uiir.vehicles.rocket = new uiir.vehicles.Vehicle('rocket', 3, [], 2);
uiir.vehicles.boat = new uiir.vehicles.Vehicle('boat', 0, [99], 0);
uiir.vehicles.horse = new uiir.vehicles.Vehicle('horse', 1, [0, 1, 2, 3, 4], 0);
