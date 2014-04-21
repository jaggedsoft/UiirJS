var uiir = uiir || {};

uiir.EngineCore = function(configStructure) {

	var that = this;

	var config = configStructure;
	
	// Command History -- move into core.output?
	var hist = new uiir.CommandHistory(config.history.target, 
					   config.history.item, 
					   config.history.size, 
					   config.history.shell);

	// Player
	var player = new uiir.Player('Josser'); // todo: put location on player

	var playerPosition = {
		x: -2,
		y: -2
	}; // is there some reason we shouldn't put x,y location on the Player?

	// Player's vehicles. These may be pointers, 
	// but they don't so much belong here, and should be
	// moved into player like position should be.
	var vehicles = [ uiir.vehicles.onFoot, uiir.vehicles.plane ];

	// Player effects
	var playereffects = {};
	playereffects.consumeFood = function() {
		// todo: fix this
		// probably this'll go into the game mode
		//
		// if(input.lastKey == 80 && config.retainLegacyBugs.passPConsumesNothing) {
		//	return false; // P key negates food consumption
		// }
		var tempFood = player.food() - 1;
		if(tempFood < 0) {
			var tempHits = player.hits() - 1;
			if(tempHits >= 0) {
				player.hits(tempHits);
			}
		}
		else {
			player.food(tempFood);
		}
	}

	// Tiles -- todo: condense to one array 
	var tiles = {};
	tiles.tl = uiir.images.terrains;	// terrain
	tiles.ptl = uiir.images.players;	// players
	tiles.vtl = uiir.images.vehicles;	// vehicles
	tiles.mtl = uiir.images.players;	// mobs




//########## Modes ##############################
		/// Common API for different modes
		///
		///	handleInput	
		///	start
		///	pause
		///	unpause
		///	restart (?)
		///	name

	var modes = {};
	modes['game'] = null; // new uiir.modes.GameMode(that);
	modes['zats'] = null; //new uiir.modes.ZatsMode(that);
	modes['loading'] = null; //new uiir.modes.LoadingMode(that);
	modes['title'] = null;
	modes['space'] = null;
	modes['create'] = null;
	modes['dungeon'] = null;
	modes['current'] = ko.observable(null);
		// there may be a better way to do current. I'm a little
		// concerned about the overhead of hitting an observable
		// with every key press.


  //@ direct mode manipulation
	modes.get = function() {
		return modes['current']().name;
	};

	modes.set = function(nameString) {
		if(nameString) {
			if(modes[nameString]) {
				modes['current'](modes[nameString]);
			}
		}
	};


  //@ mode transitions
	modes.transition = {};
	modes.transition.data = {};
		//	{
		//		transitionMode: null,
		//		selfTerminating: false,
		//		endTransition: {
		//			switchToMode: null,
		//			callback: null,
		//			callbackParams : null
		//		},
		//		timing: { // tick / ms conversion necessary?
		//			minimum_ms: 0,
		//			transition_entered: null,
		//		}
		//	};

	modes.transition.set = function(dataStructure) {
		//	on beginTransition:
		// check for existence of switchToMode. If it exists, it should 
		// be a string name. Reset this variable with the core mode by 
		// the specified name.  Otherwise, set it to the current mode.
		// TODO: I really ought to be doing more input
		//	 validation.

		dataStructure.endTransition = dataStructure.endTransition || {};
		dataStructure.timing = dataStructure.timing || {};

		if(dataStructure.endTransition.switchToMode) {
			dataStructure.endTransition.switchToMode = modes[dataStructure.endTransition.switchToMode];
		}
		else {
			dataStructure.endTransition.switchToMode = modes['current']();
		}
		var hasTiming = false;
		if(dataStructure.timing.minimum_ms) {
			if(dataStructure.timing.minimum_ms > 0) {
				hasTiming = true;
				dataStructure.timing.transition_entered = (new Date()).getTime();
			}
		} 

		if(dataStructure.selfTerminating) {
			if(hasTiming) {
				dataStructure.timing.timeout = setTimeout(modes.transition.end, (dataStructure.timing.minimum_ms));
			}
		}

		modes.transition.data = dataStructure;
		modes.set(dataStructure.transitionMode);
	};

	modes.transition.end = function() {
		//	 on end transition:
		// check for an existing minimum_ms > 0
		// check for an existing entered transition < now
		// if both don't exist, carry on
		// if both exist, calculate the difference in ms between now and
		//    when transitioning started, if that is < minimum_ms, 
		//    set a recursive timer
		// carrying on...
		// check for a callback, and if it exists, call it with the 
		// callbackParams, then set mode to switchToMode
		var d = modes.transition.data;

		// check minimum timing
		// TODO: Add the check that entered exists and if < now (otherwise ignore timing)
		if(d.timing.minimum_ms) {
			if(d.timing.minimum_ms > 0) {
				clearTimeout(d.timing.timeout);
				d.timing.timeout = null;
				var elapsedTime_ms = (new Date()).getTime() - d.timing.transition_entered;
				if(elapsedTime_ms < d.timing.minimum_ms) {
					d.timing.timeout = setTimeout(modes.transition.end, (d.timing.minimum_ms - elapsedTime_ms));
					return false;
				}
			}
		}

		// do any callback and switch to whatever mode
		if(d.endTransition.callback) {
			d.endTransition.callback(d.endTransition.callbackParams);
		}
		modes['current'](d.endTransition.switchToMode);
		modes.transition.data = {};
		return true;
	};

  //@ Transition functions
	var transitionfunctions = {};
	transitionfunctions.loading = function(dataStructure) {
		dataStructure.transitionMode = 'loading';
		modes.transition.set(dataStructure);
	}

	transitionfunctions.zats = function(callbackStructure) {
		var data = {
			transitionMode: 'zats',
			selfTerminating: false,
			endTransition: {
				callback: callbackStructure.callback,
				callbackParams : callbackStructure.callbackParams
			},
			timing: { // tick / ms conversion necessary?
				minimum_ms: 0,
				transition_entered: null,
			}
		};
		ko.applyBindings(uiir.engine);
		modes['zats'].start();
		modes.transition.set(data);
	}


//########## END: Modes ################################################
//###############  Note: More mode exists after api assignment      ####
//###############        so that mode ctors get a fleshed-out core  ####
//###############        this is one reason NOT to touch the modes  ####
//###############        collection directly from a mode instance,  ####
//###############        but rather, to use the transitions and     ####
//###############        their associated functions, or to use the  ####
//###############        mode get/set functions directly	    ####
//######################################################################

	// Set return api onto 'that' (mode ctors below required it)
	// prep the return api
		that.config = config;
		that.hist = hist;
		that.modes = modes;
		that.player = player;
		that.playerPosition = playerPosition;
		that.tiles = tiles;
		that.vehicles = vehicles;

		// functions
			// player effects
		that.consumeFood = playereffects.consumeFood;
			// transition
		that.loading = transitionfunctions.loading;
		that.zats = transitionfunctions.zats;


	// mode set using 'that'
	modes['game'] = new uiir.modes.GameMode(that);
	modes['zats'] = new uiir.modes.ZatsMode(that);

	that.ctimeout = modes['game'].ctimeout;
	that.cinterval = modes['game'].cinterval;

	// return public api 'that'
	return that;
};





















