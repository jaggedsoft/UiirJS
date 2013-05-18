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

	var path = './i/';
	var extention = '.png';
	
	var i = new Image(16,16);
	i.src = path + imageName + extention;

	return i;
};

uiir.images.terrains = new Array();
uiir.images.players = new Array();
uiir.images.vehicles = new Array();

uiir.images.objectImages = new Array();
uiir.images.mobImages = new Array();

uiir.images.init = function() {
	// TODO: Reorder these names to something smart :|
	var terrainNames = [ 'grass', 'brick', 'forest', 'swamp', 'field', 'mountains', 'wall', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'SPACE' ];
	var objectNames = [ 'sign', 'door', 'timedoor', 'village', 'town', 'castle', 'weapon', 'armor' ]
	var mobNames = [ 'fighter', 'thief', 'wizard', 'cleric', 'orc', 'demon', 'pikedemon', 'wingeddemon', 'guard', 'merchant', 'jester', 'king', 'seamonster', 'ship', 'minax' ];
	var playerNames = [ 'fighter', 'thief', 'wizard', 'cleric' ];	
	var vehicleNames = [ 'boat', 'horse', 'plane', 'rocket' ];
	
	var i = 0;
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