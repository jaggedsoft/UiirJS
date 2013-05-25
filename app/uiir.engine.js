var uiir = uiir || {};

// TODO: Could be cleaner and better organized.
// TODO: Might want to add a few more comments.
// TODO: remove the TODO's, by actually doing.
uiir.engine = function(a, b, d) {

	// Debugging assistance
	var debug = { 
		out: function(message, show) {
			if((!(typeof(show) === 'undefined')) && show == true) {
				hist.insert(message);
			}
			return false;
		}
	};
	
	// Config
	var config = {
		backgroundTarget: 'backer',
		history: {
			item: 'div',
			shell: '#cmd_queue_shell',
			size: 100,
			target: '#cmd_queue'
		},
		retainLegacyBugs: { // for switchable fidelity to ult2
			bumpSwampInShipDamage: true,
			invincibleGuardInEachCity: true, // definitely not a bug, but stupid.
			passPConsumesNothing: true, // prob not a bug.
			shipDuplication: true
		},
		timing: {
			background: {
				hurry: 50,
				normal: 130
			},
			fly: {
				plane: 80,
				rocket: 80
			},
			walk: {
				tick: 1800,
				input: 400,
				pass: 80
			},
			loading: 600
		}
	};

	var timers = {
		lastGameTick_ms: 0,
		lastTickStop_ms: 0,
		nowTick_ms: 0,
		gameTick: 0
	};

	var clearTimers = {
		gameTick: function() {
			debug.out('clearing gameTick');
			clearTimeout(timers.gameTick);
			timers.gameTick = null;
		}
	}

	var mode = {
		game: true,
		load: false,
		zats: false,	
		sub: {
			create: false,
			// dead: myPlayer.isdead(), // calculated by player health eval
			dungeon: false,
			// flying: isFlyingSomething(),
			normal: true,
			repeater: false,
			space: false,
			title: false			
		}
	};

	var input = {
		acceptAction: false,
		acceptDetail: false,
		callback: null,
		detailType: null,
		detailTypes: {
			singleKey: 11
		},
		gotKey: false,
		lastKey: null,
		value: null
	};

	var setAllowInputCallback = function(inputType, callback) {
		clearInput();
		input.acceptDetail = true;
		input.detailType = inputType;
		input.callback = callback;
	}

	var clearInput = function() {
		input.acceptAction = false;
		input.acceptDetail = false;
		input.detailType = null;
		input.callback = null;
		input.gotKey = false;
		input.lastKey = null;
		input.value = null;
		return true;
	}

	// input dispatch
	var iHandleInputReceived = function(key, up) { 
		if(up === true) { // key release
			return false; // for now
		}
		else {
			if(!(input.acceptAction || input.acceptDetail)) {
				return false; // blocking all input
			}
			else {
				input.lastKey = key;
				if(input.acceptAction) {
					// receiving an action input
					input.acceptAction = false; // block to stop extra input
					stopForceActionGameNormal();
					debug.out('accepted input');
					input.gotKey = true;
					setCallbackByMode();
					// if ignoring invalid input, and invalid, restart tick (not standard -- add later)
					// otherwise...
					return iLoopGameNormalAction();
				}
				else {
					// input.acceptDetail -- receiving solicited input
					if((input.detailType % 2) == 1) { // single input
						input.value = key; // not actually how this should be done
						return iLoopGameNormalAction();
					}
				}
			}
		}
		return true;
	}

	var iHandleInactionGameNormal = function() {
		// "if you choose not to decide, you still have made a choice."
		input.acceptAction = false; // block to stop extra input
		clearTimers.gameTick();
		debug.out('received no input');
					input.gotKey = true;
					input.lastKey = 32;
		input.callback = passConsume;
		return iLoopGameNormalAction();
	}

	// Repeated input function control
	// Note: this is not auto movement,
	// it is timed acceptance of input
	// between certain keydown/keyup

	// passing time
	var iDoPassKeyPress = function() { 
	}

	var iDoPassKeyRelease = function() { 
	}

	// movement
	var iDoMoveKeyPress = function() { 
	}

	var iDoMoveKeyRelease = function() { 
	}

	// Game Loop, Game>Normal
		// 1 Determine and Execute Action (player input or inaction)
	var iLoopGameNormalAction = function() { 
		// execute callback
		if(typeof(input.callback) === 'function') {
			debug.out('firing tick callback (input: ' + input.gotKey + ')');
			input.callback();
		}
		else {
			// check if we are ignoring bad input.
			// if so, reset the inactivity timer.
			// otherwise execute an invalid action handler (notify error, pass with consume)
			hist.append('invalid action');
		}


		if(!input.acceptDetail) {
			debug.out('setting timeout tick part 2');
			setTimeout(function() {
				debug.out('firing tick part 2');
				iLoopGameNormalDrawAndRepeat();
			}, waitHowLongGameNormal(true));
		}
		return true;
	}

		// 2 Draw and Set Timer
	var iLoopGameNormalDrawAndRepeat = function() { 
		// doEffects
		consumeFood();
		// doAI
		doDraw();
		if(myPlayer.hits() > 0) {
			startForceActionGameNormal(true); // restart the gameTick
		}
	}

	// Game>Normal Inaction caused looping
	var startForceActionGameNormal = function(fromInitial) {
		clearInput();
		timers.lastGameTick_ms = (new Date()).getTime();
		debug.out('accepting input', debug.write.show.inputAcceptingAction);
		input.acceptAction = true;
		timers.gameTick = setTimeout(iHandleInactionGameNormal, waitHowLongGameNormal());
		hist.insert('CMD:');
		debug.out('gameTick timer set');
		timers.lastTickStop_ms = 0;
	}

	var stopForceActionGameNormal = function() {
		timers.lastTickStop_ms = (new Date()).getTime();
		clearTimers.gameTick();
	}

	// Determine timing on tick start/restart
	var waitHowLongGameNormal = function(showDebugAnyway) {
		var gk = input.gotKey;
		var tickDelay = gk ? 
			((input.lastKey == 32 || input.lastKey == 80) ? 
				config.timing.walk.pass : 
				config.timing.walk.input) : 
			config.timing.walk.tick;
		debug.out('tickDelay: ' + tickDelay, (showDebugAnyway || debug.write.show.waitHowLong) && debug.write.waitHowLong.tickDelayInitial)
		if(gk && (timers.lastTickStop_ms > timers.lastGameTick_ms)) {
			// restarting an interrupted timer
			tickDelay -= (timers.lastTickStop_ms - timers.lastGameTick_ms);
		}
		else {
			if(gk) { // todo: is this part right?
				tickDelay -= ((new Date()).getTime() - timers.lastGameTick_ms);
			}
		}
		if(tickDelay < 1) {
			tickDelay = 1;
		}
		debug.out('tickDelay: ' + tickDelay, (showDebugAnyway || debug.write.show.waitHowLong) && debug.write.waitHowLong.tickDelayFinal)
		return tickDelay;
	}



	// super temporary. going to replace with mode input mapping.
	// i realize it's bullshit -- again, temporary.
	var setCallbackByMode = function() {
		// get the current mask based upon lastKey
		// valid or !ignore invalid == process second state
		switch(input.lastKey) {
			case 219: input.callback = iDoUp; break;
			case 38: input.callback = iDoUp; break;
			case 186: input.callback = iDoLeft; break;
			case 37: input.callback = iDoLeft; break;
			case 222: input.callback = iDoRight; break;
			case 39: input.callback = iDoRight; break;
			case 191: input.callback = iDoDown; break;
			case 40: input.callback = iDoDown; break;
			case 80: input.callback = passConsume; break;
			case 32: input.callback = passConsume; break;
			case 76: input.callback = kL; break;
			case 88: input.callback = kX; break;
			case 90: input.callback = kZ; break;
			case 48: input.callback = k0; break;
			default: input.callback = null; break;
		};
	}

	// Command History
	var hist = new uiir.CommandHistory(config.history.target, 
					   config.history.item, 
					   config.history.size, 
					   config.history.shell);

		// Player
	var myPlayer = new uiir.Player('Josser');
	
	// we don't need these to be observable
	// since they're not going into the UI.
	// TODO: REMOVE OBSERVABLE
	var playerPosition = {
		x: ko.observable(-2),
		y: ko.observable(-2)
	};

	var myVehicles = [ uiir.vehicles.onFoot, uiir.vehicles.plane ];
	
	// Tiles
	var tl = uiir.images.terrains;	// terrain
	var ptl = uiir.images.players;	// players
	var vtl = uiir.images.vehicles;	// vehicles
	var mtl = uiir.images.players;	// mobs

	// Maps
	var maps = [ uiir.datafiles.map000, uiir.datafiles.map001 ]; // array from uiir.datafiles.maps
	var currentMapIndex = ko.observable(0);
	var currentMap = ko.computed(function() {
		return maps[currentMapIndex()];
	}, this);	

	var mapSize = { 
		x: 1,
		y: 1
	};

	var setMap = function(mapName, pX, pY) {
		var i = maps.length;
		while(i--) {
			if(maps[i].name == mapName) {
				currentMapIndex(i);
				if(typeof(pX) === 'undefined') {
					// get map start x y
					var ms = currentMap().start;
					playerPosition.x(ms.x);
					playerPosition.y(ms.y);
				}
				else {
					playerPosition.x(pX);
					playerPosition.y(pY);
				}
				mapSize.x = currentMap().size.x;
				mapSize.y = currentMap().size.y;
				mapWrap = currentMap().type === "world";
				return true;
			}
		}
	}

	var doLeaveTown = function() {
		if(isFlyingSomething()) {
			LoL();
		}
		mode("loading");
		// todo: fix x y
		// note: it just so happens that the one map in ultima 2 
		// which is shared by two entrance portals (city/castle/etc)
		// is LB's castle, which is in the same x,y in each place.
		// To support a system where one town/etc is enterable 
		// from more than one map, and from different x,y, the
		// engine should remember the last map.name.x,y -- probably 
		// on a stack in case i want to support multiple levels
		// of city, but for now: map.exitTo
		var e2 = currentMap().exitTo;
		setMap(e2.map, e2.x, e2.y);
		doDraw();

		setTimeout(function() {
			mode("play");
		}, 400);
		return true;
	}

	var mapWrap = false;

	var mapCorrect = function(n, isX) {
		var limit = isX ? mapSize.x : mapSize.y;
		if((!mapWrap) && (n < 0 || n >= limit)) {
			return -2;
		}
		return ((n + limit) % limit);
	};

	// Mode (Game, Stats, Player Creation, Loading Screen (really?), Space, Dungeon (not fun, not looking forward to it, sorry Gariott.)
	var mode = ko.observable("play");
	var subMode = ko.observable("none");
	var spacePosition = spacePosition || {
		x: 5,
		y: 5,
		z: 5,
		writing: ''
	};

	var isPlayMode = ko.computed(function() {
		return mode() == "play";
	}, this);

	var isSpaceSubMode = ko.computed(function() {
		return subMode() == "space";
	}, this);

	var isZatsMode = ko.computed(function() {
		return mode() == "zats";
	}, this);

	var isLoadingMode = ko.computed(function() {
		return mode() == "loading";
	}, this);


// effects and outcomes
	var consumeFood = function() {
		if(input.lastKey == 80 && config.retainLegacyBugs.passPConsumesNothing) {
			return false; // P key negates food consumption
		}
		var tempFood = myPlayer.food() - 1;
		if(tempFood < 0) {
			var tempHits = myPlayer.hits() - 1;
			if(tempHits >= 0) {
				myPlayer.hits(tempHits);
			}
		}
		else {
			myPlayer.food(tempFood);
		}
	}

// Player function logic, by alphabet

	// L
	// TODO: Quit being a toolbox and stop using acronyms
	// TODO: Devise a better plan for mode.
	var LoL = function() {
		var retval;
		hist.append(isFlyingSomething() ? 'Land' : 'Launch');
		var veh = myVehicles[myVehicles.length - 1];
		// myPlayer.vehicle // in a computed?
		switch(uiir.vehicles.flyModes[veh.flyMode]) {
			case 'fly': { //"plane"
				hist.append(veh.name);
				retval = landOrLaunchPlane();
			} break;
			case 'orbit': { // "rocket": 
				hist.append(veh.name);
				retval = landOrLaunchRocket();
			} break;
			default: {
				hist.append('what??');
				retval = false;
			}
		}; // end switch
		return retval;
	}

	var landOrLaunchPlane = function() {
		if(!isFlyingSomething()) {
			clearTimeout(procTimer);
			input.bypassWalkTimer = true;
			autoMovement(0, -1, config.timing.fly.plane);
		}
		else {
			var nx = playerPosition.x();
			var ny = playerPosition.y();
			if(isFlying.plane && myVehicles[myVehicles.length - 1].isPassable(currentMap().data[drawIndex(nx,ny,9,5,currentMap().size.x, currentMap().size.y,mapWrap)]))
			{
				clearAutoMovementTimer();
				input.bypassWalkTimer = false;
				procTimer = setTimeout(procTickOne);
			}
			else {
				hist.append('- Not here!!!');
				return false;
			}
		}
		isFlying.plane = !(isFlying.plane);
		return true;
	}

	var landOrLaunchRocket = function() {
		if(!isFlyingSomething()) {
			// move to initiate orbit
			// autoMovement(0, -1, config.timing.fly.rocket);
		}
		else if(isFlying.rocket)
		{ // land -- need death for some terrain here
			clearAutoMovementTimer();
		}
		else {
			return false;
		}
		isFlying.rocket = !(isFlying.rocket);
		return true;
	}
	
	// P - PASS (going to be a little tricky because the button is bullsh*t)
	var passTime = function() {
		hist.append('Pass');
		return true;
	}
	var passConsume = function() { // no need for extra alias
		return passTime();
	}

	// X - (e)Xit
	var doXit = function() {
		if(!isFlyingSomething()) {
			hist.append('Exit');
			var len = myVehicles.length - 1;
			if(len > 0) {
				hist.append(myVehicles[len].name);
				myVehicles.pop();
					debug.out('Now ' + myVehicles[myVehicles.length - 1].name, debug.echoResultingVehicle);
				//return doDraw();
			}
			else {
				// Which one? Make literals constants.
				// hist.append('what??');
				hist.append('- Think again, ' + myPlayer.name);
			}
		}
		return false;
	}
	
	// Z - STATUS SCREEN TOGGLE - "Zats" because obviously Gariott wrote Steal before Status?
	var doZats = function() {
		setAllowInputCallback(input.detailTypes.singleKey, unZats);
		mode("zats");
		return true;
	}

	var unZats = function() {
		clearInput();
		mode("play"); // this'll need to change if allowing zats in other modes
		return true;
	}



// Movement and vehicle state

	// Space // does not really fit here... TODO: move this
	

	// Flight
	var isFlying = {
		plane: false,
		rocket: false
	};

	var isFlyingSomething = function() {
		return isFlying.plane || isFlying.rocket;
	}



	// Simple Movement
	var movePlayer = function(x, y, checkMovement) {
		var retval;
		var nx = mapCorrect(playerPosition.x() + x, true);
		var ny = mapCorrect(playerPosition.y() + y, false);

		if(nx < 0 || ny < 0)
		{ // left town
			retval = doLeaveTown();
		}
		else {
			var allowMovement = true;
			if(checkMovement === true) {
				var a = drawIndex(nx,ny,9,5,currentMap().size.x, currentMap().size.y, mapWrap);
				var veh = myVehicles[myVehicles.length - 1];
				allowMovement = veh.isPassable(currentMap().data[a]);
			}
			retval = allowMovement;
			if(allowMovement) {
				playerPosition.x(nx);
				playerPosition.y(ny);
			}
			else {
				hist.append('blocked');
			}
		}
		if(debug.showMoveCoords) {
			hist.append(''+playerPosition.x()+','+playerPosition.y());
		}
		return retval;
	}

	var turn = function(x, y) {
		var retval;
		if(!isFlyingSomething()) {
			retval = movePlayer(x, y, true);
		}
		else {
			if(isFlying.plane) {
				retval = autoMovement(x, y, config.timing.fly.plane);
			}
			else if(isFlying.rocket) { } // purposely do nothing
		}
		return retval;
	}



	// Auto Movement
	var lastAutoMove = {
		x: 0,
		y: 0
	}
	var autoMovementTimer = null;

	var clearAutoMovementTimer = function() {
		clearInterval(autoMovementTimer);
		return true;
	}

	var autoMovement = function(x, y, dt) {
		clearAutoMovementTimer();
		lastAutoMove.x = x;
		lastAutoMove.y = y;
		autoMovementTimer = setInterval(function() { 
			movePlayer(x,y);
			return doDraw();
		}, dt);
		return true;
	}



	// Draw View
	var dc = new uiir.Draw(a, b);
	var drawIndex = function(px,py,x,y,mapX,mapY,iswrap) {
		px += (x - 9);
		py += (y - 5);
		if(iswrap) {
			if(0 > px || mapX) { 
				px += mapX;
				px %= mapX;
			}
			if(0 > py || mapY) {
				py += mapY;
				py %= mapY
			}
		}
		else {
			if(0 > px || mapX <= px || 0 > py || mapY <= py) {
				return -2;
			}
		}
		return px+(py*mapX);
	};
	var doDraw = function() {
	 	dc.clear();
		var d = dc.draw();
		var w = mapWrap;
		var px = playerPosition.x();
		var py = playerPosition.y();
		var vx = 0; //viewIndices;
		var vy = 0; //
		var m = currentMap();
		var sx = m.size.x;
		var sy = m.size.y;
		for(vx = 0; vx < 20; ++vx) {
			for(vy = 0; vy < 10; ++vy) {
				var a = drawIndex(px,py,vx,vy,sx,sy,w);
				var t = (a < 0) ? m.oobTile : m.data[a];
				if(t > 7) { }
				else {
					d.drawImage(tl[t], (16*vx), (16*vy));					
				}
			}
		}
		var playTile = ptl[0];
		var vindex = myVehicles[myVehicles.length -1].vehicleTileIndex;
		if(vindex >= 0) {
			playTile = vtl[vindex];
		}
		d.drawImage(playTile, 144, 80); // correct index with player tile
		dc.swap();
		return true;
	}
	
	var k0 = function() { return hist.toggleScrollBar(); }
	var kL = function() { return LoL(); }
	var kX = function() { return doXit(); }
	var kZ = function() {
		if(!isZatsMode()) {
			return doZats();
		}
		return unZats();
	}

	// player movement interface functions
	var iDoUp = function() { 
		hist.append('North');
		turn(0,-1); 
	}
	var iDoDown = function() { 
		hist.append('South');
		turn(0,1); 
	}
	var iDoLeft = function() { 
		hist.append('West');
		turn(-1,0); 
	}
	var iDoRight = function() { 
		hist.append('East');
		turn(1,0); 
	}


	// Auto-executed bits:
	var autoExecutedStartup = function() {
		// set starting map and player position
		setMap('town');
		// start the whole screen fadein, the title fading, 
		// and the background water movement.  
		// TODO: Allow for ctor tweaking of speed 
		//       settings and maybe other goodies
		// TODO: Refactor background class for separation of concerns
		uiir.background(config.backgroundTarget, config.timing.background.normal).start();		
		// draw it
		doDraw();
		$(document).ready(function() {
			var $body = $('body');
			$body.keydown(function(event) { 
				return uiir.engine.keyUpDown(event.which, false);
			});
			$body.on('keyup', function(event) { 
				return uiir.engine.keyUpDown(event.which, true);
			});
			$body.focus();
			startForceActionGameNormal();
		});
	}(); // IIFE

	// public interface into uiir.engine
	return {
		showGame: isPlayMode,
		showLoading: isLoadingMode,
		showZats: isZatsMode,
		showSpace: isSpaceSubMode,
		
		player: myPlayer, // gateway to screen access of player stats

		keyUpDown: iHandleInputReceived, // iDoKbUpDown, // control (hardware or virtual keyboard and fake kb (button rows))
		
		debugWrite: hist.insert, // if we really must write from page code... :(
		debug: debug // extensibility point	
	};
}('canvas_one','canvas_two');

ko.applyBindings(uiir.engine);