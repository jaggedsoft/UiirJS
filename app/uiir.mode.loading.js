var uiir = uiir || {};
uiir.modes = uiir.modes || {};


	///	Loading - This is a completely no-op mode.
	///		  core will have a setToLoading 
	///		  function, which will allow the currently
	///		  executing functionality to do whatever it 
	///		  needs without doing anything but setting
	///		  a loading screen.
	///

// NOTES: 
// Does it really make any sense at all to have a mode that
// does NOTHING? I need to revisit that.

uiir.modes.LoadingMode = function(uiirCoreObject) {

	var that = this; // Duh. Prefer "self." Get a handle on class vs module. Seems like I have been really inconsistent.
	var uiirCore = uiirCoreObject;
	var name = 'loading';

	// signature shouldn't really matter, 
	// but this is a little more explicit.
	function noopInputHandler(key, isUp) {
		return that;
	}


	function noop(dataStructure) {
		return that;
	} // Umm... why the extra function when both of these are identical?

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