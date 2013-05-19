var uiir = uiir || {};

/*--------=### Scrolling background ###=---------*/
//
//    Animates the water so I don't
//    need a gif creation program.
//
//    Also does the initial fadeIn and title
//    rotation.
//
//    This is an SoC problem as it stands.
//    TODO: Refactor the fade effects into
//          its own class.
//
//
// <rambling aside that doesn't belong here warning>
//
//    As it stands, there will be a gazillion
//    little js files.  This is ok, because
//    we won't need to worry about ordering or
//    even the number of requests once load and
//    save game is implemented -- we'll have a
//    WebAPI and all of the release goodies we
//    want, including bundles.  Otherwise, we'll
//    need to make release version js that 
//    includes all of the logic in one file and
//    probably minifies it.  Most of this script
//    will end up being less consequential by
//    size than an http request.
//
//-----------------------------------------------//

uiir.background = function(bg, ms) {
	
	/* variables */
	var titles = ['#huiir', '#hult'];
	var fadeSpeed = 1950;
	var titleDurations = [5850, 7800];


	var bx = 0;
	var by = 0;
	var dy = 0;
	var started = 0;
	var dbg = document.getElementById(bg);
	var speed = ms || 150;
	var scrollInterval = null;

	/* functions */
	function scroll() {
		bx += 7;
		by += 13;
		bx %= 96;
		by %= 192;
		dbg.style.backgroundPosition = bx + "px " + by + "px";
	}

	function titleStart() {
		var initDelay = fadeSpeed + 5200;
		var titleDelay = initDelay + 500;

		$('.canvas_blacking').fadeOut(initDelay);
		$('#shellWidth').fadeIn(initDelay);

		setTimeout(function() { return titleFIn(0); }, titleDelay);
	}
	function titleFIn(i) {
		$(titles[i]).fadeIn(fadeSpeed);
		setTimeout(function() { return titleFOut(i); }, (fadeSpeed + titleDurations[i]));
		return true;
	}
	function titleFOut(i) {
		$(titles[i]).fadeOut(fadeSpeed);
		setTimeout(function(fadespeed) { return titleFIn((i+1)%2); }, (fadeSpeed * 1.3));
		return true;
	}

	var doStart = function() {
		if(started == 0){
			started = 1;
			titleStart();
			doAlterSpeed(speed);
		}
	}
	
	var doAlterSpeed = function(sp) {
		speed = sp;
		clearInterval(scrollInterval);
		scrollInterval = setInterval(scroll, speed);
	}

	/* interface */
	return {
		start: doStart,
		alterSpeed: doAlterSpeed
	};
};