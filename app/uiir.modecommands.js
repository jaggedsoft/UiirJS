var uiir = uiir || {};

/// A collection of key/command pairs and a mode to which they apply
/// for use in action delegation dependent on game mode
uiir.ModeKeyCommands = function(mode, defaultCmd) {

	// ## Ctor guards (throw on bad or missing parameters)

	if(typeof(mode) === 'undefined') {
		throw 'Missing parameter \'mode\' in ModeKeyCommands(???, ???).';
	}
	if(!(typeof(defaultCmd) === 'function')) {
		throw 'Missing or invalid parameter \'defaultCmd\' in ModeKeyCommands(\'' + mode + '\', ???). It should be a function.';
	}


	// ## Data members

	var _mode = mode;
	var _cmds = [ defaultCmd, null, null, null, null, null, null, null, null, null, null, 
		 null, null, null, null, null, null, null, null, null, null, 
		 null, null, null, null, null, null, null, null, null, null, 
		 null, null, null, null, null, null, null, null, null, null, null, null ];


	// ## Private functions

	/// determine array index for a command by input key
	var mapKey = function(inKey) {
		var outKey = 0;
		if ((inKey > 36) && (inKey < 41)) {
			// arrows index 37 to 40
			outKey = inKey;
		}
		if ((inKey > 64) && (inKey < 91)) {
			// letter array index 11 to 36
			outKey = inKey - 54;
		}
		else if ((inKey > 47) && (inKey < 58)) {
			// numbers index 1 to 10
			outKey = inKey - 47;
		}
		else { // special chracter or invalid -- switch/case
			switch (inKey) {
				case 32: { // space
					outKey = 40;
				} break;
				case 27: { // esc
					outKey = 41;
				} break;
				case 186:
				case 59: { // left
					outKey = 37;
				} break;
				case 219: { // up
					outKey = 38;
				} break;
				case 222: { // right
					outKey = 39;
				} break;
				case 191: { // down
					outKey = 40;
				} break;
				default: { // default or invalid
					outKey = 0;
				} break;
			} // end switch 
	 	} // end key if block
		return outKey;
	}; // end mapKey


	// ## Public functions (returned by the public interface)

	/// Map a command to a given key.
	/// Optionally, just overwriting if the key is already mapped to a command,
	/// but throwing by default.
	/// Optionally, the key may already have been mapped, but mapping is
	/// executed by default.
	var addKeyCommand = function(key, cmd, overwriteDuplicateRatherThanExcept, keyAlreadyTranslated) {
		if(typeof(key) === 'undefined') {
			throw 'ModeKeyCommands: Missing parameter \'key\' in addKeyCommand for mode \'' + _mode + '\'.';
		}
		if(!(typeof(cmd) === 'function')) {
			throw 'ModeKeyCommands: Missing or invalid parameter \'cmd\' in addKeyCommand for mode \'' + _mode + '\'. It should be a function.';
		}

		overwriteDuplicateRatherThanExcept = (typeof(overwriteDuplicateRatherThanExcept) === 'undefined') ? false : overwriteDuplicateRatherThanExcept;
		keyAlreadyTranslated = (typeof(keyAlreadyTranslated) === 'undefined') ? false : keyAlreadyTranslated;
		key = keyAlreadyTranslated ? key : mapKey(key);

		if(key == 0) {
			throw 'ModeKeyCommands: Cannot use addKeyCommand to redefine default command for mode \'' + _mode + '\'. Use resetDefaultCommand instead.';
		}
		if(_cmds[key] == null || overwriteDuplicateRatherThanExcept) {
			_cmds[key] = cmd;
		}
		else {
			throw 'ModeKeyCommands: Command for mode \'' + _mode + '\', key \'' + key + '\', already defined.'
		}
		return true;
	}; // end of addKeyCommand

	/// Map a command to a given key.
	/// Optionally, just overwriting if the key is already mapped to a command,
	/// but throwing by default.
	/// 'key' directly relates to the underlying array, no mapping needed.
	var addPremappedKeyCommand = function(key, cmd, overwriteDuplicateRatherThanExcept) {
		return addKeyCommand(key, cmd, overwriteDuplicateRatherThanExcept, true);
	};

	/// Reassign default command mapping
	var resetDefaultCommand = function(cmd) {
		if(!(typeof(cmd) === 'function')) {
			throw 'ModeKeyCommands: Missing or invalid parameter \'cmd\' in resetDefaultCommand for mode \'' + _mode + '\'. It should be a function.';
		}
		_cmds[0] = cmd;
		return true;
	};

	/// For a given keypress code, return the associated command
	var getCommandByKey = function(key) {
		var retVal = mapKey(key);
		retVal = (typeof(_cmds[retVal]) === 'function') ? retVal : 0;
		return _cmds[retVal];
	};

	var getDefaultCommand = function() {
		return getCommandByKey(0);
	};
 
	// ## Public interface

	return {
		add: addPremappedKeyCommand,
		cmd: getCommandByKey,
		defaultCmd: getDefaultCommand,
		map: addKeyCommand,
		mode: _mode,
		resetDefaultCommand: resetDefaultCommand
	};

} // end ModeKeyCommands


/// A collection of mappings between mode and key commands
/// and functions surrounding them and for adding/getting commands
uiir.ModeCommands = function(defaultCmd) {
	
	// ## Ctor guards (throw on bad or missing parameters)

	if(!(typeof(defaultCmd) === 'function')) {
		throw 'Missing or invalid parameter \'defaultCmd\' in ModeCommands(???). It should be a function.';
	}

	
	// ## Data members

	var _defaultCmd = defaultCmd; // used by add mode when
	var _defaultMode; // used by add/get when mode is unspecified
	var _modeKeyCommands = [];

	
	// ## Private functions

	var findModeIndex = function(mode, preventRecurse) {
		if(!(typeof(mode) === 'undefined' || mode == null || mode == "")) {
			var i = _modeKeyCommands.length;
			while(i--) {
				if(_modeKeyCommands[i].mode === mode) {
					return i;
				}
			};
		}
		if(!(typeof(_defaultMode) === 'undefined' || mode == _defaultMode || _defaultMode == null || _defaultMode == "")) {
			if(typeof(preventRecurse) === 'undefined' || !preventRecurse) {
				return findModeIndex(_defaultMode);
			}
		}
		return -1;
	}

	// ## Public functions (returned by the public interface)

	/// set default mode for application of add/get key commands, if not specified by call
	var setDefaultMode = function(defaultMode) {
		if(typeof(defaultMode) === 'undefined') {
			throw 'ModeCommands: Missing parameter \'defaultMode\' in setDefaultMode.';
		}
		if(findModeIndex(defaultMode, true) < 0) {
			throw 'ModeCommands: Invalid parameter \'defaultMode\' in setDefaultMode: value \'' + defaultMode + '\' does not exist in mode collection.';
		}
		_defaultMode = defaultMode;
		return true;
	};

	/// add a command mode (walk, zats, etc)
	var addMode = function(mode, defaultCmd, idm, idmdc) {
		if(typeof(mode) === 'undefined' || mode == null || mode == "") {
			throw 'ModeCommands: Missing parameter \'mode\' in addMode.';
		}

		if(!(typeof(defaultCmd) === 'function')) {
			defaultCmd = _defaultCmd;
		}

		var existingModeIndex = findModeIndex(mode, true);
		if(existingModeIndex > 0) {
			if(typeof(idm) === 'undefined' || idm !== true) {
				// error condition
				throw 'ModeCommands: Mode \'' + mode + '\' in addMode already exists. Sort out the duplicates, or if you are lazy, set ignore duplicate modes to true in the addMode function calls.';
			}
			if(_modeKeyCommands[existingModeIndex].defaultCmd() !== defaultCmd) {
				if(typeof(idmdc) === 'undefined' || idmdc !== true) {
					// error condition
					throw 'ModeCommands: DefaultCmd in otherwise duplicate mode \'' + mode + '\' in addMode differs from what already exists. Sort out the duplicates, or if you are lazy, set ignore duplicate mode default commands to true in the addMode function calls.';
				}				
			}
		} // end preexisting mode
		else {
			// add mode
			var newMode = new ModeKeyCommands(mode, defaultCmd);
			_modeKeyCommands.push(newMode);
		}
		return true;
	};

	/// add command mapping to mode
	var addCmd = function(key, cmd, mode, buildNonexistentModes) {
		var existingModeIndex = findModeIndex(mode);
		if(existingModeIndex < 0) {
		}
	};

	/// get command mapping from mode
	var getCmd = function(key, mode) {
	};
	
	// ## Public interface

	return {
	};

} // end ModeCommands

