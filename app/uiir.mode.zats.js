var uiir = uiir || {};
uiir.modes = uiir.modes || {};


	///	Zats -	This is also an (almost) completely no-op mode.
	///		There will be one item in input handling which
	///		will cover all key presses, which will call the
	///		core's returnFromZats function.
	///		core's showZats function will capture the current
	///		mode, set zats, call the captured mode's pause 
	///		function, and returnFromZats will call the captured
	///		mode's unpause function.
	///

	// zats should always be pause/unpause of current mode
	// loading could be pause/unpause, but might actually be
	// the unpause of a completely different mode


uiir.modes.ZatsMode = function(uiirCoreObject) {

	var that = this;
	var uiirCore = uiirCoreObject;
	var name = 'zats';
	var acceptInput = false;

	function inputHandler(key, isUp) {
		if(acceptInput) { // eats input for a period of time
			uiirCore.modes.transition.end();
		}
		return that;
	}

	function reinit() {
		acceptInput = false; // eat input for a period of time
		setTimeout(function() { acceptInput = true; }, 750);
	}

	function noop(dataStructure) {
		return that;
	}

	/// ModeAPI
	return {
		handleInput: inputHandler,
		start: reinit,
		stop: noop,
		pause: noop,
		unpause: noop,
		name: name
	};
};