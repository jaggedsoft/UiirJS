var uiir = uiir || {};

/*--------=### Double Context ###=---------*/
//
//    Two-canvas manager so there's no
//    flickering when clearing or drawing.
//
//-----------------------------------------//


uiir.Draw = function (canvasOneId, canvasTwoId) {
	this.canvases = [ document.getElementById(canvasOneId),
	document.getElementById(canvasTwoId) ];

	this.contexts = [ this.canvases[0].getContext('2d'),
	this.canvases[1].getContext('2d')];

	this.current = 0;
}
uiir.Draw.prototype = function () {

	var back = function(c) {
		return (c + 1) % 2;
	}

	var doGetContext = function(contextArray, contextArrayIndex) {
		return contextArray[contextArrayIndex];
	}

	var doGetCanvas = function(v, n) {
		return v[n];
	}

	var doSwap = function(o, v, c) {
		var n = back(c); 
		var f = doGetCanvas(v, c);
		var b = doGetCanvas(v, n);
		o.current = n;
		f.style.visibility = 'hidden';
		b.style.visibility = 'visible';
		return true;
	}

	var doClear = function(contextArray, c) {
		doGetContext(contextArray, back(c)).clearRect(0, 0, 320, 160);
		return true;
	}

	/* interface functions */
	var iDoSwap = function() {
		return doSwap(this, this.canvases, this.current);
	}

	var iDoClear = function() {
		return doClear(this.contexts, this.current);
	}

	var iDoGetContextBack = function() {
		return doGetContext(this.contexts, back(this.current));
	}

	/* interface */
	return { 
		swap: iDoSwap,
		clear: iDoClear,
		draw: iDoGetContextBack
	};
}();
