var uiir = uiir || {};

/*--------=### Player View Model ###=---------*/
//
//
//--------------------------------------------//

uiir.Command = function(commandName, cmd) {

	if(typeof(commandName) === 'undefined') {
		throw 'Missing parameter \'commandName\' in Command(???, ???).';
	}
	if(!(typeof(cmd) === 'function')) {
		throw 'Missing or invalid parameter \'cmd\' in Command(\'' + commandName + '\', ???). It should be a function.';
	}
	
	var _name = commandName;
	var _cmd = cmd;

	var getName = function() {
		return _name;
	};
	var doInvocation = function() {
		return _cmd();
	};
	
	return {
		invoke: doInvoke,
		name: getName(),
		type: 'uiir.
	};	
}
