
var addDebug = function() {
	debugger;
	if(!(typeof(uiir.engine) === 'undefined')) {
	
		uiir.engine.debug = uiir.engine.debug || {};

		uiir.engine.debug.echoResultingVehicle = false;
		uiir.engine.debug.showMoveCoords = false;
		uiir.engine.debug.write = { 
			show: {
				inputAcceptingAction: false,
				waitHowLong: true
			},
			waitHowLong: {
				tickDelayInitial: false,
				tickDelayFinal: false
			}
		}
	}
}();