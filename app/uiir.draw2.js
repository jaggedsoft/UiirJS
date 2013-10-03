uiir = uiir || {}

// Generation 2 drawing mechanism for Uiir.
// The API is different from generation 1 in several important ways:
// The API no longer will give the user direct canvas or drawing context access.
// Draw is now done by this structure, and writes based upon a 
// drawStructure passed to one of the two public functions.  One is intended
// for full drawing, and the other is intended to flash items onto the screen
// (for example, an attack attempt or hit). 
// -- futurecrafting below:
// Flash can do full view area flash
// as well -- so if we were to draw an inverse, we'd have that going for us.
// although the water wouldn't flash since it's separate.  Maybe we'll give 
// this access to an overlay frame which we could use to cover the canvas.
// Or we could copy the image content of the background scroller (maybe?) 
// then draw the visible canvas over the top, then inverse the colors 
// (is it possible?)
uiir.Canvas = function(canvasOne, canvasTwo) {	
	var that = this;

	// 0 to 19 for size in x direction.
	// this is useful only because tiles are square.
	that.coords = [];
	var i = 0;
	for(i = 0; i < 20; ++i) {
		that.coords.push(i * 16);
	}

	that.canvases = {};
	that.canvases[true] = document.getElementById(canvasOne);
	that.canvases[false] = document.getElementById(canvasTwo);
	that.contexts = {};
	that.contexts[true] = that.canvases[true].getContext('2d');
	that.contexts[false] = that.canvases[false].getContext('2d');
	that.current = true;

	//x full Draw - 20x10 on back buffer, bring to front
	//x flash Draw - Duplicate Front buffer to back, MxN on front buffer at offset of (V, W), delay a moment, bring back to front
	//x partial Draw - MxN on front buffer at offset (V, W)(is this useful?) 
	
	var cloneFrontToBack = function() {
		var front = that.current;
		var back = !front;
		that.contexts[back].drawImage(that.canvases[front], 0, 0);
		return that;
	};

	var clear = function() { // always clears back buffer
		that.contexts[!(that.current)].clearRect(0, 0, 320, 160);
		return that;
	};

	var swap = function() {
		var front = that.current;
		var back = !front;
		that.current = back;
		that.canvases[front].style.visibility = 'hidden';
		that.canvases[back].style.visibility = 'visible';
		return that;
	};

	var drawMN = function(drawStructure) {
		var a = drawStructure.arr;
		var x = drawStructure.size.x;
		var y = drawStructure.size.y;
		var ix = 0;
		var iy = y + drawStructure.size.oy;
		var c = that.contexts[drawStructure.front ? that.current : !(that.current)];
		var wx = 0;		
		var t = drawStructure.tiles;
		while(y--) {
			iy--;
			wx = x;
			ix = x + drawStructure.size.ox;
			while(wx--) {
				ix--;
				if(a[y][wx] || (a[y][wx] === 0)) {
					c.drawImage(t[a[y][wx]], that.coords[ix], that.coords[iy]);
				}
			}; // end x
		}; // end y
		return that;
	};

	var fullDraw = function(drawStructure) {
		// draw on the back buffer then bring the buffer to the front
		clear();
		drawStructure.front = false;
		drawStructure.size = { 
			x: 20,
			y: 10,
			ox: 0,
			oy: 0
		};
		drawMN(drawStructure);
		swap();
		return that;
	};

	var flashDraw = function(drawStructure) {
		// copy the canvas content front to back, draw on the front, swap to back
		drawStructure.front = true;
		cloneFrontToBack();
		drawMN(drawStructure);
		setTimeout(swap, drawStructure.delay || 150);
		return that;
	};

	return {
		drawFull: fullDraw,
		drawFlash: flashDraw
	};
};
