var uiir = uiir || {};
uiir.modes = uiir.modes || {};

uiir.modes.GameMode = function(uiirCoreObject) {

	var that = this;
	var core = uiirCoreObject;
	var config = core.config;
	var hist = core.hist;

// NOTE: Maybe leave out "unsorted" in the line below, and call it a day?
//######## Unsorted junk #####################################

	function inputHandler(key, isUp) {
		iHandleInputReceived(key, isUp);
		return that;
	}

	var timers = {
		counts: { 
			timeout: ko.observable(0),
			interval: ko.observable(0)
		},
		autoMovement: null,
		gameTick: null,
		lastGameTick_ms: 0,
		lastTickStop_ms: 0,
		nowTick_ms: 0
	},

	clearTimers = {
		autoMovement: function() {
			clearInterval(timers.autoMovement);
			timers.autoMovement = null;
			timers.counts.interval(timers.counts.interval() - 1);
		},
		gameTick: function() {
			clearTimeout(timers.gameTick);
			timers.gameTick = null;
			timers.counts.timeout(timers.counts.timeout() - 1);
		}
	},

	input = {
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

	function setAllowInputCallback(inputType, callback) {
		clearInput();
		input.acceptDetail = true;
		input.detailType = inputType;
		input.callback = callback;
	}

	function clearInput() {
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
	function iHandleInputReceived(key, up) { 
		if(up === true) { // key release
			return false; // for now
		}
		else {
			if(!(input.acceptAction || input.acceptDetail)) {
				if(isFlyingSomething()) {
					// looks like we're not doing anything here
				}
				return false; // blocking all input
			}
			else {
				input.lastKey = key;
				if(input.acceptAction) {
					// receiving an action input
					input.acceptAction = false; // block to stop extra input
					stopForceActionGameNormal();
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

	function iHandleInactionGameNormal() {
		// "if you choose not to decide, you still have made a choice."
		input.acceptAction = false; // block to stop extra input
		clearTimers.gameTick();
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
	function iDoPassKeyPress() { 
	}

	function iDoPassKeyRelease() { 
	}

	// movement
	function iDoMoveKeyPress() { 
	}

	function iDoMoveKeyRelease() { 
	}

	// Game Loop, Game>Normal
		// 1 Determine and Execute Action (player input or inaction)
	function iLoopGameNormalAction() { 
		// execute callback
		if(typeof(input.callback) === 'function') {
			input.callback();
		}
		else {
			// check if we are ignoring bad input.
			// if so, reset the inactivity timer.
			// otherwise execute an invalid action handler (notify error, pass with consume)
			hist.append('invalid action');
		}


		if(!input.acceptDetail) {
			setTimeout(function() {
				iLoopGameNormalDrawAndRepeat();
			}, waitHowLongGameNormal(true));
			timers.counts.timeout(timers.counts.timeout()+1);
		}
		return true;
	}

		// 2 Draw and Set Timer
	function iLoopGameNormalDrawAndRepeat() { 
		// doEffects
		core.consumeFood();
		// doAI
		// TODO: draw mobs and objects
		if(core.player.hits() > 0) {
			startForceActionGameNormal(true); // restart the gameTick
		}
	}

	// Game>Normal Inaction caused looping
	// frominitial parameter does nothing :( ... ?
	function startForceActionGameNormal(fromInitial) {
		clearInput();
		timers.lastGameTick_ms = (new Date()).getTime();
		input.acceptAction = true;
		if(!isFlyingSomething())
		{
			timers.gameTick = setTimeout(iHandleInactionGameNormal, waitHowLongGameNormal());
			timers.counts.timeout(timers.counts.timeout()+1);
		}
		hist.insert('CMD:&nbsp;');
		timers.lastTickStop_ms = 0;
	}

	function stopForceActionGameNormal() {
		timers.lastTickStop_ms = (new Date()).getTime();
		clearTimers.gameTick();
	}

	// Determine timing on tick start/restart
	function waitHowLongGameNormal() {
		var gk = input.gotKey,
			tickDelay = gk ? 
			((input.lastKey == 32 || input.lastKey == 80) ? 
				config.timing.walk.pass : 
				config.timing.walk.input) : 
			config.timing.walk.tick;
		
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
		return tickDelay;
	}



	// super temporary. going to replace with mode input mapping.
	// i realize it's bullshit -- again, temporary.
	function setCallbackByMode() {
		// get the current mask based upon lastKey
		// valid or !ignore invalid == process second state
			if(isFlyingSomething()) {
				switch(input.lastKey) {
					case 219: input.callback = iDoUp; break;
					case 38: input.callback = iDoUp; break;
					case 186: input.callback = iDoLeft; break;
					case 37: input.callback = iDoLeft; break;
					case 222: input.callback = iDoRight; break;
					case 39: input.callback = iDoRight; break;
					case 191: input.callback = iDoDown; break;
					case 40: input.callback = iDoDown; break;
					case 76: input.callback = kL; break;
					case 48: input.callback = k0; break;
					default: input.callback = null; break;
				}
			}
			else {
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
				}
			}
	}

	// Maps
	// NOTE: Hopefully this is temporary?
	//       the maps var below looks inadvisable.
	var maps = [ uiir.datafiles.map000, uiir.datafiles.map001 ], // array from uiir.datafiles.maps
		currentMapIndex = ko.observable(0),

		currentMap = ko.computed(function() {
						return maps[currentMapIndex()];
					}, this),	

		mapSize = { 
			x: 1,
			y: 1
		};

	function setMap(mapName, pX, pY) {
		var i = maps.length;
		while(i--) {
			if(maps[i].name == mapName) {
				currentMapIndex(i);
				if(typeof(pX) === 'undefined') {
					// get map start x y
					var ms = currentMap().start;
					core.playerPosition.x = (ms.x);
					core.playerPosition.y = (ms.y);
				}
				else {
					core.playerPosition.x = (pX);
					core.playerPosition.y = (pY);
				}
				mapSize.x = (currentMap().size.x);
				mapSize.y = (currentMap().size.y);
				mapWrap = currentMap().type === "world";
				viewMapIndices.fullyPopulate();
				drawToMapCanvas();
				return true;
			}
		}
	}

	function doLeaveTown() {

		core.loading({ timing: { minimum_ms: core.config.timing.loading }});

		if(isFlyingSomething()) {
			hist.enable(false);
			LoL();
			hist.enable(true);
		}

		stopForceActionGameNormal();

		// TODO: loading transition. -- previously: mode("loading");
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

		core.modes.transition.end();
		return true;
	}

	var mapWrap = false;

	// corrects the location 'n' so it either fits within the map 
	// (if it's wrapped), or -2 if not.
	function mapCorrect(n, isX) {
		var limit = isX ? mapSize.x : mapSize.y;
		if(n >= 0 && n < limit) {
			return n;
		}
		if(mapWrap) {
			return ((n + limit) % limit);
		}
		// oob!
		return -2;
	}

	// NOTE: SUPER terrible function naming. WTF, me?
	// Ahh, I see now they're the short names for keypress
	// handlers.  Still sucks.
	function k0() { return hist.toggleScrollBar(); }
	function kL() { return LoL(); }
	function kX() { return doXit(); }
	function kZ() { return doZats(); }

	// player movement interface functions
	// NOTE: names suck.
	function iDoUp() { 
		hist.append('North');
		turn(0,-1); 
	}

	function iDoDown() { 
		hist.append('South');
		turn(0,1); 
	}

	function iDoLeft() { 
		hist.append('West');
		turn(-1,0); 
	}

	function iDoRight() { 
		hist.append('East');
		turn(1,0); 
	}



// Player function logic, by alphabet

	// L
	// TODO: Quit being a toolbox and stop using acronyms
	// TODO: Devise a better plan for mode.
	function LoL() {
		var retval,
			flying = isFlyingSomething(),
			veh = core.vehicles[core.vehicles.length - 1];

		hist.append(flying ? 'Land' : 'Launch');

		// myPlayer.vehicle // in a computed?

		switch(uiir.vehicles.flyModes[veh.flyMode]) {
			case 'fly': { //"plane"
				if(!flying) {
					hist.append(veh.name);
				}
				retval = landOrLaunchPlane();
			} break;
			case 'orbit': { // "rocket": 
				if(!flying) {
					hist.append(veh.name);
				}
				retval = landOrLaunchRocket();
			} break;
			default: {
				hist.append('what??');
				retval = false;
			}
		} // end switch
		return retval;
	}

	function landOrLaunchPlane() {
		if(!isFlyingSomething()) {

			clearTimers.gameTick();
			clearInput();
			input.acceptAction = true;
			autoMovement(0, -1, config.timing.fly.plane);
		}
		else {
			var nx = core.playerPosition.x;
			var ny = core.playerPosition.y;
			if(isFlying.plane && core.vehicles[core.vehicles.length - 1].isPassable(currentMap().data[ny][nx]))
			{
				clearTimers.autoMovement();
				startForceActionGameNormal(true);
			}
			else {
				hist.append('--Not&nbsp;here!!!!!');
				return false;
			}
		}
		isFlying.plane = !(isFlying.plane);
		return true;
	}

	function landOrLaunchRocket() {
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
	function passTime() {
		hist.append('Pass');
		return true;
	}

	function passConsume() { // no need for extra alias
		return passTime();
	}

	// X - (e)Xit
	function doXit() {
		if(!isFlyingSomething()) {
			hist.append('Exit');
			var len = core.vehicles.length - 1;
			if(len > 0) {
				hist.append(core.vehicles[len].name);
				core.vehicles.pop();
			}
			else {
				// Which one? Make literals constants.
				// hist.append('what??');
				hist.append('- Think again, ' + core.player.name);
			}
		}
		drawPlayerTile();
		return false;
	}
	
	// Z - STATUS SCREEN TOGGLE - "Zats" because obviously Gariott wrote Steal before Status?
	function doZats() {
		pause();
		core.zats({ callback: unpause });
		return true;
	}


// Movement and vehicle state

	// Space // does not really fit here... TODO: move this
	

	// Flight
	var isFlying = {
		plane: false,
		rocket: false
	};

	function isFlyingSomething() {
		return isFlying.plane || isFlying.rocket;
	}



	// Simple Movement
	function movePlayer(x, y, checkMovement) {
		var retval;
		var nx = mapCorrect(core.playerPosition.x + x, true);
		var ny = mapCorrect(core.playerPosition.y + y, false);

		if(nx < 0 || ny < 0)
		{ // left town
			retval = doLeaveTown();
		}
		else {
			var allowMovement = true;
			if(checkMovement === true) {
				var veh = core.vehicles[core.vehicles.length - 1];
				allowMovement = veh.isPassable(currentMap().data[ny][nx]);
			}
			retval = allowMovement;
			if(allowMovement) {
				core.playerPosition.x = (nx);
				core.playerPosition.y = (ny);
				viewMapIndices.adjustForMovement(x, y);
			}
			else {
				hist.append('blocked');
			}
		}
		posMap();	
		return retval;
	}

	function turn(x, y) {
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
	};

	// timers.autoMovement

	function autoMovement(x, y, dt) {
		clearTimers.autoMovement();
		lastAutoMove.x = x;
		lastAutoMove.y = y;
		timers.counts.interval(timers.counts.interval()+1);
		timers.autoMovement = setInterval(function() { 
			movePlayer(x, y);
			return true; // umm?
		}, dt);
		return true;
	}


//######## End Of Unsorted junk ###############################



    var viewMapIndices = {
    	x: [0,1,2,3,4,5,6,7,8,9,10,11,1,13,14,15,16,17,18,19],
    	y: [0,1,2,3,4,5,6,7,8,9]
    };


	/// fully populate the view indices for accelerated calculation of 
	/// view to map x,y coordinates in preparation for draw // objects
	viewMapIndices.fullyPopulate = function() {  
		var px = core.playerPosition.x;
		var py = core.playerPosition.y;
		var viX = px - 9;
		var viY = py - 5;
		var idx = 0;
		var w = mapWrap;
		var sx = mapSize.x, sy = mapSize.y;
		for(idx = 0; idx < 20; idx++, viX++, viY++) {
			if(idx < 10) {
				viewMapIndices.y[idx] = (!w || (viY > 0 && viY < sy)) ? viY : ((viY + sy) % sy); 
			}
			viewMapIndices.x[idx] = (!w || (viX > 0 && viX < sx)) ? viX : ((viX + sx) % sx);
		}
	};

	/// correct view's map indices according to direction moved 
	/// (+/- 1 in x XOR y direction)
	viewMapIndices.adjustForMovement = function(x, y) {

		// 1. determine if it's x or y
		// 2. determine if it's an increment or decrement (bail if it's neither)
		// (a.) throw if |movement| != 1  (maybe -- I'll consider this later.  It'll be an efficiency hit that's probably completely unnecessary)
		// 3. generate the right number to be adding (existing extreme +/- 1 (if wrapping, + size % size)
		// 4. add/remove appropriately

		var xory = 'x';
		var incr = x;
		var sz = 20;
		var szmap = mapSize.x; 
		if(y) { // override with y - if not worried about efficiency, should safety check that it's x XOR y. This currently just assumes if !y, x
			xory = 'y';
			incr = y;
			sz = 10;
			szmap = mapSize.y;
		}
		incr = (incr > 0) ? 1 : -1;
		var vmi = viewMapIndices[xory];
		var newInt = vmi[((incr < 0) ? 0 : (sz-1))] + incr;
		if(mapWrap) {
			newInt = ((newInt + szmap) % szmap);
		}
		if(incr < 0) { // remove at end (pop), add at front (unshift)
			vmi.pop();
			vmi.unshift(newInt);	
		}
		else { // remove at front (shift), add at end (push)
			vmi.shift();
			vmi.push(newInt);	
		}
	};

	function drawToMapCanvas() {
		// get the canvas
			var mdc = document.getElementById('mapdrawcanvas');
		// get the context for it
			var ctx = mdc.getContext('2d');
		// size canvas to 1x1, invalidate it, and then size it to the map size
			mdc.width = 1;
			mdc.height = 1;
			ctx.clearRect(0, 0, 1, 1);
		// if the map wraps, add 1/2 view x and 1/2 view y to the size
		var tcm = currentMap();
		var oob = tcm.oobTile;
		var tmsX = tcm.size.x; // map size x
		var tmsY = tcm.size.y; // map size y
		var tmwrap = tcm.type === "world"; // map wraps
		var tvsX = 20; // view X
		var tvsY = 10; // view Y
		var tCsX = 16 * (tmsX + (tmwrap ? 0 : tvsX));
		var tCsY = 16 * (tmsY + (tmwrap ? 0 : tvsY));
		mdc.width = tCsX;
		mdc.height = tCsY;
		var tidxX = 0;
		var tidxY = 0;
		var dcY = 0;
		var dcX = 0;
		var txyidx = 0;
		var tilesLength = core.tiles.tl.length;
		var ttileidx = 0;
		// for each 0 to y
			for(tidxY = 0; tidxY < tmsY; tidxY++) {
			// for each 0 to x
				dcY = tidxY * 16;
				for(tidxX = 0; tidxX < tmsX; tidxX++) {
					// if not water, draw the image
					dcX = 16 * tidxX;
					ttileidx = tcm.data[tidxY][tidxX];
					if(typeof(ttileidx) !== 'undefined' && ttileidx < tilesLength && ttileidx >= 0) {
						ctx.drawImage(core.tiles.tl[ttileidx], dcX, dcY);
					}
				}
			}
		// if not wraps and not map fill is water
		if(!tmwrap && (typeof(oob) !== 'undefined')&& oob < tilesLength && oob >= 0) {
			var bX = 0;
			var bY = 0;
		// for 0 to 1/2 view x (ceil)
			bX = 16*tmsX;
			for(tidxX = 0; tidxX < tvsX; tidxX++) {
				// for 0 to y
				dcX = bX + ( tidxX * 16 );
				for(tidxY = 0; tidxY < tmsY; tidxY++) {
					dcY = tidxY * 16;
					// draw map fill image
					ctx.drawImage(core.tiles.tl[oob], dcX, dcY);
				}
			}
			// for 0 to 1/2 view y (ceil)
				// for 0 to x + 1/2 view x (ceil)
					// draw mmap fill image
			bX = 0;
			bY = 16*tmsY;
			for(tidxY = 0; tidxY < tvsY; tidxY++) {
				// for 0 to y
				dcY = bY + (tidxY * 16);
				for(tidxX = 0; tidxX < (tmsX + tvsX); tidxX++) {
					dcX = tidxX * 16;
					// draw map fill image
					ctx.drawImage(core.tiles.tl[oob], dcX, dcY);
				}
			}
		}
		// save the data image
		var canvasImageDataURL = mdc.toDataURL();
		var bgImageString = "url('" + canvasImageDataURL +"')";
		var themapbg = document.getElementById('mapbackground');
		themapbg.style.backgroundRepeat = 'repeat';
		themapbg.style.backgroundImage = bgImageString;
	}
	
	function posMap() {
		var dx = -16 * (core.playerPosition.x - 9);
		var dy = -16 * (core.playerPosition.y - 5);
		var themapbg = document.getElementById('mapbackground');
		themapbg.style.backgroundPosition = '' + dx + 'px ' + dy + 'px';
	}

	function drawPlayerTile() {
		var playTile = core.tiles.ptl[0];
		var vindex = core.vehicles[core.vehicles.length -1].vehicleTileIndex;
		if(vindex >= 0) {
			playTile = core.tiles.vtl[vindex];
		}
		var playerurl = "url('" + playTile.src + "')";
		document.getElementById('playertile').style.backgroundImage = playerurl;
	}

	function noop(dataStructure) {
		return that;
	}

	function pause() {
		stopForceActionGameNormal();
	}

	function  unpause() {
		hist.clear();
		drawPlayerTile();
		// TODO: calculate and draw the mobs and objects
		startForceActionGameNormal();
	}

	function start() {
		setMap('town');
		posMap();
		unpause();
		core.modes.set('game');
	}

	/// ModeAPI
	return {
		handleInput: inputHandler,
		start: start,
		stop: noop,
		pause: pause,
		unpause: unpause,
		name: 'game',
// debug
		ctimeout: timers.counts.timeout,
		cinterval: timers.counts.interval,
	};
};




















