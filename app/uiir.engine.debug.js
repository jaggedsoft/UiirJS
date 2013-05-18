
var addDebug = function() {
	debugger;
	if(!(typeof(uiir.engine) === 'undefined')) {
	
		uiir.engine.debug = uiir.engine.debug || {};

		uiir.engine.debug.showMoveCoords = true;
		uiir.engine.debug.echoResultingVehicle = true;
	}
}();