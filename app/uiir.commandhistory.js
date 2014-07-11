var uiir = uiir || {};

/*--------=### Command History ###=---------*/
//
//    DOM manipulator to convey output 
//    of actions to user
//
//    Includes sidebar switcher
//
//-----------------------------------------//

// NOTE: 
//       Check that this class is being used in a way where it's
//       injected into the Uiir engine, and not just tacked 
//       into use.
//       This is the memory of the player actions, and messages
//       back to the player, so it's possible we'd want to be able
//       to swap this around, should I discover something about 
//       this sucks... and it's ENTIRELY possible that something
//       about this sucks.  Straight away, I'm string building 
//       HTML. Even using this class, that should be written to
//       build nodes in memory with ctors, not by typing junk out.

uiir.CommandHistory = function(commandHistoryTargetSelector, historyItemType, commandHistorySize, commandHistoryShellSelector) { 
	
	// ### fields ###

	var mainSelector = commandHistoryTargetSelector;
	var itemType = historyItemType;
	var historySize = commandHistorySize;
	
	var collectionSelector = mainSelector + ' > ' + itemType;
	var firstChildSelector = collectionSelector + ':last';

	var itemOpen = '<' + itemType + '>';
	var itemClose = '</' + itemType + '>';

	var $shellSelector = null;
	if(typeof(commandHistoryShellSelector) !== 'undefined') {
		$shellSelector = $(commandHistoryShellSelector);
		if($shellSelector.length <= 0) {
			$shellSelector = null;
		}
	}

	var isWritingEnabled = true;

	// ### functions ###

	function append(msg) {
		if(isWritingEnabled) {
			if($(collectionSelector).size() <= 0) {
				insert('');
			}
			$(firstChildSelector).append(msg);
		}
		return isWritingEnabled;
	}
	
	function insert(msg) {
		if(isWritingEnabled) {
			if($(collectionSelector).size() > historySize) {
				clear();
			}
			$(mainSelector).append(itemOpen + msg + itemClose);
		}
		return isWritingEnabled;
	}

	function clear() {
		$(mainSelector ).html('');
	}


	function enable(shouldEnable) {
		isWritingEnabled = shouldEnable;
	}

	function toggleScrollBar() {
		if(!!$shellSelector) {
			var dir = $shellSelector.css('direction');
			dir = dir.split("").reverse().join("");
			$shellSelector.css('direction',dir);
			return true;
		}
		return false;
	}

	// ### interface ###
	return {
		insert: insert,
		append: append,
		enable: enable,
		clear: clear,
		toggleScrollBar: toggleScrollBar
	};
};