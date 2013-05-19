var uiir = uiir || {};

// TODO: Could be cleaner and better organized.
// TODO: Might want to add a few more comments.
// TODO: remove the TODO's, by actually doing.
uiir.engine = function(a, b, d) {

	// Debugging assistance
	var debug = { };
	
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
				pass: 80,
				input: 400,
				tick: 1000
			},
			loading: 600
		}
	};
	
	var timers = {
		inactivePassTimer: null,
		repeatedInputTimer: null
	};

	var waitHowLong = function() {
	}

	var setInactivityTimer = function(fromTurnEnd) {
	}
	
	var clearInactivityTimer = function() {
	}
	
	var setBlockingEndOfTurnTimer = function() {
	}
	
	var clearInput = function() {
		input.blocking = false;
		input.callback = null;
		input.gotKey = false;
		input.lastKey = 32;
		input.receiving = false;
		input.value = '';
	}
	
	var input = {
		blocking: false,
		callback: null,
		gotKey: false,
		lastKey: 32,
		receiving: false,
		value: ''
	};	
	

	var inactiveTurnProc = function() {
		clearInput();
		normalGameLoopProcOne();
	}
	
	var normalGameLoopProcOne = function() {
		// determine and execute callback
		// if receiving is not true, proc two after blocking timer
	}
	
	var normalGameLoopProcTwo = function() {
		// proc effects
		// proc ai
		// draw
		// restart tick and forced pass by inactivity
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

// Player function logic, by alphabet

	// H
	var doHyper = function() {
		
		if(!(isSpaceSubMode() || isFlyingSomething())) {
			landOrLaunchRocket();
			subMode("space");
		}
		else {
			hist.insert('Hyper');
			// there must be a better way...
			spacePosition.writing = 'x';
			hist.append(spacePosition.writing + ':');
		}
	}

	var procKey = function(key) {
		if(isSpaceSubMode() && spacePosition.writing != '') {
			hist.append(key);
			hist.insert(spacePosition.writing + ':');
			switch(spacePosition.writing)
			{
				case 'x': {
					spacePosition.x = key;
					spacePosition.writing = 'y';
				} break;
				case 'y': {
					spacePosition.y = key;
					spacePosition.writing = 'z';
				} break;
				case 'z': {
					spacePosition.z = key;
					spacePosition.writing = '';
										
				} break;
				default: {
					spacePosition.writing = '';
					return false;
				} break;
			}; // end switch
			if(spacePosition.writing == '') {
			var i = maps.length;
			var orb = '';
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
			return true;
		}
		return false;
	}

	// L
	// TODO: Quit being a toolbox and stop using acronyms
	// TODO: Devise a better plan for mode. Also, use a switch, buddy.
	var LoL = function() {
		var retval;
		hist.insert(isFlyingSomething() ? 'Land' : 'Launch');
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
			autoMovement(0, -1, config.timing.fly.plane);
		}
		else {
			var nx = playerPosition.x();
			var ny = playerPosition.y();
			if(isFlying.plane && myVehicles[myVehicles.length - 1].isPassable(currentMap().data[drawIndex(nx,ny,9,5,currentMap().size.x, currentMap().size.y,mapWrap)]))
			{
				clearAutoMovementTimer();
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
//			autoMovement(0, -1, config.timing.fly.rocket);
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
	var passTime = function() { // until game timing is in, this'll just be a history item addition.
		return hist.insert('Pass');
	}
	var passTimer = null;
	var startPassTimer = function() { 
		if(passTimer === null) {
			passTimer = setInterval(passTime, config.timing.pass);
		}
		return true;
	}
	var killPassTimer = function() { 
		if(passTimer !== null) {
			clearInterval(passTimer);
			passTimer = null;
		}
		return true;
	} 

	// X - (e)Xit
	var doXit = function() {
		if(!isFlyingSomething()) {
			hist.insert('Exit');
			var len = myVehicles.length - 1;
			if(len > 0) {
				hist.append(myVehicles[len].name);
				myVehicles.pop();
				if(debug.echoResultingVehicle) {
					hist.insert('Now ' + myVehicles[myVehicles.length - 1].name);
				}
				return doDraw();
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
		mode("zats");
		return true;
	}

	var unZats = function() {
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
			doDraw();
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
			return movePlayer(x,y);
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
	
	var allowDispatch = true;
	var iDoKbUpDown = function(key, up) {
		if(up === true) {
			kbState.up = key;
			allowDispatch = true;
		}
		else {
			kbState.down = key;
		}
		kbState.which = up ? 1 : 0;
		if(allowDispatch) {
			allowDispatch = false;
			kbState.flipBit((kbState.flipBit() + 1) % 3);
		}
		return true;
	}

	var iDoKbDispatch = ko.computed(function() {
		var fb = kbState.flipBit(); // does nothing but allow for computed
		if(kbState.which === 1) { // up
			if(kbState.up === 80 || kbState.up === 32) {
				// stop passing time
				killPassTimer(); // startPassTimer
			}
			allowDispatch = true;
		}
		else { // down
			switch(kbState.down) {
				case 219: iDoUp(); break;
				case 38: iDoUp(); break;
				case 186: iDoLeft(); break;
				case 37: iDoLeft(); break;
				case 222: iDoRight(); break;
				case 39: iDoRight(); break;
				case 191: iDoDown(); break;
				case 40: iDoDown(); break;
				case 80: startPassTimer(); break;
				case 32: startPassTimer(); break;
				case 65: kA(); break;
				case 66: kB(); break;
				case 67: kC(); break;
				case 68: kD(); break;
				case 69: kE(); break;
				case 70: kF(); break;
				case 71: kG(); break;
				case 72: kH(); break;
				case 73: kI(); break;
				case 74: kJ(); break;
				case 75: kK(); break;
				case 76: kL(); break;
				case 77: kM(); break;
				case 78: kN(); break;
				case 79: kO(); break;
				case 81: kQ(); break;
				case 82: kR(); break;
				case 83: kS(); break;
				case 84: kT(); break;
				case 85: kU(); break;
				case 86: kV(); break;
				case 87: kW(); break;
				case 88: kX(); break;
				case 89: kY(); break;
				case 90: kZ(); break;
				case 49: k1(); break;
				case 50: k2(); break;
				case 51: k3(); break;
				case 52: k4(); break;
				case 53: k5(); break;
				case 54: k6(); break;
				case 55: k7(); break;
				case 56: k8(); break;
				case 57: k9(); break;
				case 48: k0(); break;
				default: break;
			}
		}
		kbState.up = 0;
		kbState.down = 0;
		kbState.which = 1;
		return true;
	}, this);

	// player action interface functions
	var noOp = function(){}

	var k1 = function() { return true; }
	var k2 = function() { return true; }
	var k3 = function() { return true; }
	var k4 = function() { return true; }
	var k5 = function() { return true; }
	var k6 = function() { return true; }
	var k7 = function() { return true; }
	var k8 = function() { return true; }
	var k9 = function() { return true; }
	var k0 = function() { return hist.toggleScrollBar(); }
	var kA = function() { return true; }
	var kB = function() { return true; }
	var kC = function() { return true; }
	var kD = function() { return true; }
	var kE = function() { return true; }
	var kF = function() { return true; }
	var kG = function() { return true; }
	var kH = function() { return doHyper(); }
	var kI = function() { return true; }
	var kJ = function() { hist.insert('Jump - Wee!'); return true; }
	var kK = function() { return true; }
	var kL = function() { return LoL(); }
	var kM = function() { return true; }
	var kN = function() { return true; }
	var kO = function() { return true; }
	var kP = function() { return true; }
	var kQ = function() { return true; }
	var kR = function() { return true; }
	var kS = function() { return true; }
	var kT = function() { return true; }
	var kU = function() { return true; }
	var kV = function() { return true; }
	var kW = function() { return true; }
	var kX = function() { return doXit(); }
	var kY = function() { return true; }
	var kZ = function() {
		if(!isZatsMode()) {
			return doZats();
		}
		return unZats();
	}

	// player movement interface functions
	var iDoUp = function() { 
		hist.insert('North');
		turn(0,-1); 
	}
	var iDoDown = function() { 
		hist.insert('South');
		turn(0,1); 
	}
	var iDoLeft = function() { 
		hist.insert('West');
		turn(-1,0); 
	}
	var iDoRight = function() { 
		hist.insert('East');
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
		});
	}(); // IIFE

	// public interface into uiir.engine
	return {

		keyUpDown: iDoKbUpDown,
		debug: hist.insert,
		
		player: myPlayer,
		
		showSpace: isSpaceSubMode,
		showGame: isPlayMode,
		showLoading: isLoadingMode,
		showZats: isZatsMode,

		debug: debug // extensibility point
	};
}('canvas_one','canvas_two');

ko.applyBindings(uiir.engine);