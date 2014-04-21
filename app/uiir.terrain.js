var uiir = uiir || {};

/*--------=### Terrain class ###=---------*/
//
//    .
//    .
//
//-----------------------------------------//

uiir.terrain = {
	terrainProto: {
		image: null,
		insertedindex: -1,
		terrainEffects: [],
		applyOnBump: false,
		bump(inputStruct) {
			if(applyOnBump) {
				var f; 
				for (f=0; f < terrainEffects.length; f += 1) {
					if (typeof terrainEffects[f] === 'function') {
						terrainEffects[f](inputStruct);
					}
				}
			}
		}
	},
	createone: function(initializer) {
		var F = function(initStruct) {
			image = initStruct.image || image;
		};
		F.prototype = terrainProto;
		return new F(initializer)		
	}
};