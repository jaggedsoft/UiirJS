var uiir = uiir || {};

/*--------=### Command History ###=---------*/
//
//    DOM manipulator to convey output 
//    of actions to user
//
//    Includes sidebar switcher
//
//-----------------------------------------//

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
	if(!(typeof(commandHistoryShellSelector) === 'undefined')) {
		$shellSelector = $(commandHistoryShellSelector);
		if($shellSelector.length <= 0) {
			$shellSelector = null;
		}
	}

	var isWritingEnabled = true;

	// ### functions ###

	var append = function(msg) {
		if(isWritingEnabled) {
			if($(collectionSelector).size() <= 0) {
				insert('');
			}
			$(firstChildSelector).append(msg);
		}
		return isWritingEnabled;
	}
	
	var insert = function(msg) {
		if(isWritingEnabled) {
			if($(collectionSelector).size() > historySize) {
				clear();
			}
			$(mainSelector).append(itemOpen + msg + itemClose);
		}
		return isWritingEnabled;
	}

	var clear = function() {
		$(mainSelector ).html('');
	};


	var enable = function(shouldEnable) {
		isWritingEnabled = shouldEnable;
	};

	var toggleScrollBar = function() {
		if($shellSelector != null) {
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
}