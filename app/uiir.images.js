var uiir = uiir || {};
uiir.images = uiir.images || {};

/*--------=### Images ###=---------*/
//
//    Builds the graphical representations
//    of all terrain, creatures, and objects
//
//    TODO: 
//	1) Build the mob and object images
//	2) Replace these with binary file content (has to be possible...)
//         in order to reduce the number of http requests.  These images
//         number fewer than 100, and are less than 1k a pop.  Big potential
//         for optimization
//      3) In the proces of 2, sort out the situation below where there are
//         duplicates.
//      4) Turn this into a preloader -- the game really shouldn't start
//         unless all of the images are loaded, including the water 
//         (separate, in the background class)
//
//-----------------------------------------//

uiir.images.Image = function(imageName) {

	var path = './i/',  // this. is. so. gross.
		extention = '.png',
		i = new Image(16,16); // dying for a better variable name, here.

	i.src = path + imageName + extention;

	return i;
};

// iife without the statement syntax? What. Was. I. Doing?
// When's this being executed? I'd assume immediately.
// I'm guessing this defines uiir.images.init as undefined.
// this could be re-done to actually be an iife, but it 
// might be smarter to allow this to be defined, then
// execute it when we plan to instead of leaving it to
// include order.  Maybe looking into AMD would be a good 
// idea now?

// I also think my whole approach to images, here, blows.
// I'd be interested in seeing how other james prefetch/cache
// images. Maybe browserquest, though perhaps that's sprites?

uiir.images.init = function() {


	// TODO: Reorder these names to something smart :|
	var terrainNames = [ 'grass', 'brick', 'forest', 'swamp', 'field', 'mountains', 'wall', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'SPACE' ],
	objectNames = [ 'sign', 'door', 'timedoor', 'village', 'town', 'castle', 'weapon', 'armor' ],
	mobNames = [ 'fighter', 'thief', 'wizard', 'cleric', 'orc', 'demon', 'pikedemon', 'wingeddemon', 'guard', 'merchant', 'jester', 'king', 'seamonster', 'ship', 'minax' ],
	playerNames = [ 'fighter', 'thief', 'wizard', 'cleric' ],
	vehicleNames = [ 'boat', 'horse', 'plane', 'rocket' ],
	i = 0;

	uiir.images.terrains = [];
	uiir.images.players = [];
	uiir.images.vehicles = [];
	
	uiir.images.objectImages = [];
	uiir.images.mobImages = [];

	
	for(i = 0; i < terrainNames.length; ++i) {
		uiir.images.terrains.push(new uiir.images.Image(terrainNames[i]));
	}
	for(i = 0; i < playerNames.length; ++i) {
		uiir.images.players.push(new uiir.images.Image(playerNames[i]));
	}
	for(i = 0; i < vehicleNames.length; ++i) {
		uiir.images.vehicles.push(new uiir.images.Image(vehicleNames[i]));
	}
}();