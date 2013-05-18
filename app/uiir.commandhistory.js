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
	var firstChildSelector = collectionSelector + ':first';

	var itemOpen = '<' + itemType + '>';
	var itemClose = '</' + itemType + '>';

	var $shellSelector = null;
	if(!(typeof(commandHistoryShellSelector) === 'undefined')) {
		$shellSelector = $(commandHistoryShellSelector);
		if($shellSelector.length <= 0) {
			$shellSelector = null;
		}
	}


	// ### functions ###

	var doAppendItem = function(msg) {
		if($(collectionSelector).size() <= 0) {
			doInsertItem('');
		}
		$(firstChildSelector).append(' '+msg);
		return true;
	}
	
	var doInsertItem = function(msg) {
		if($(collectionSelector).size() > historySize) {
			$(mainSelector ).html('');
		}
		$(mainSelector).prepend(itemOpen + msg + itemClose);
		return true;
	}

	var doToggleScrollBar = function() {
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
		insert: doInsertItem,
		append: doAppendItem,
		toggleScrollBar: doToggleScrollBar
	};
}