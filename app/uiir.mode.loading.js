var uiir = uiir || {};
uiir.modes = uiir.modes || {};


	///	Loading - This is a completely no-op mode.
	///		  core will have a setToLoading 
	///		  function, which will allow the currently
	///		  executing functionality to do whatever it 
	///		  needs without downing anything but a 
	///		  loading screen.
	///


uiir.modes.LoadingMode = function(uiirCoreObject) {

	var that = this;
	var uiirCore = uiirCoreObject;
	var name = 'loading';

	// signature shouldn't really matter, 
	// but this is a little more explicit.
	var noopInputHandler = function(key, isUp) {
		return that;
	};


	var noop = function(dataStructure) {
		return that;
	};

	/// ModeAPI
	return {
		handleInput: noopInputHandler,
		start: noop,
		stop: noop,
		pause: noop,
		unpause: noop,
		name: name
	};
};