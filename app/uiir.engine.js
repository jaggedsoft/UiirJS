var uiir = uiir || {};

/*

Notes: (in a block comment, because I'm stupid.)

1) Need to explicitly set the css width of the command queue, because some
	browsers (IE, I'm looking at you) don't size it to the container.
	This might actually be a good thing anyway -- be explicit.

2) In game mode there's a 2-level wrapper to input handling because I didn't
	fuck with the naming when I moved things over, unless it was to
	rename variables that are actually part of core.

3) Try to decide if it's better to set mode (a core call) from the mode's
	start or from an accessor on core.  Core's starting to look more
	and more like something that should be moved into its own file 
	and one with an RMP, like every other blasted thing I've done so
	far.

*/


// TODO: Could be cleaner and better organized.
// TODO: Might want to add a few more comments.
// TODO: remove the TODO's, by actually doing.

uiir.engine = function(a, b, d) {

	var that = this;

	var core = new uiir.EngineCore({
		backgroundTarget: 'backer',
		history: {
			item: 'div',
			shell: '#cmd_queue_shell',
			size: 100,
			target: '#cmd_queue'
		},
		output: {
			canvasOne: a,
			canvasTwo: b
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
				rocket: 110
			},
			walk: {
				tick: 1800,
				input: 400,
				pass: 80
			},
			loading: 600
		}
	});


//## API + Auto-executed bits:

	var autoExecutedStartup = function() {

		// start the whole screen fadein, the title fading, 
		// and the background water movement.  
		// TODO: Refactor background class for separation of concerns
		uiir.background(core.config.backgroundTarget, core.config.timing.background.normal).start();		

		//## start game mode
		core.modes['game'].start();

		// bind input for the api
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


	var keyUpDown = function(key, up) {
		core.modes['current']().handleInput(key, up);
		return that;
	};

	return {
		// debug observables
		ctimeout: core.ctimeout,
		cinterval: core.cinterval,
		// actual api
		mode: core.modes.get,
		player: core.player,
		keyUpDown: keyUpDown
	};

}('canvas_one','canvas_two');

ko.applyBindings(uiir.engine);





















