var uiir = uiir || {};

/*--------=### Player View Model ###=---------*/
//
//    Player is a collection of collections
//    of player attributes ans inventory.
//    
//    Player knows nothing about the
//    concept of location or position.
//
//--------------------------------------------//

uiir.Player = function(playerName) {

	var myDescription = {
		name: playerName,
		gender: "male",
		race: "human",
		type: "fighter",
	}

	// This is the only set of values which actually
	// needs to be observable.  Zats items do not, as
	// doZats can be rewritten to re-apply bindings
	// That'll work out a little better, and I'm going 
	// to be replacing everything else with an inventory
	// item and using taking advantage of ko's ability
	// to bind visibility to a function something like 
	// 'count > 0'
	var myBasics = {
		hits: ko.observable(400),
		gold: ko.observable(400),
		experience: ko.observable(0),
		food: ko.observable(400)
	}

	var isDead = ko.computed(function() {
		return myBasics.hits() <= 0;
	}, this);
	var myLevel = ko.computed(function() {
		var e = myBasics.experience();
		return (e - (e % 1000))  / 1000;
	}, this);
	
	// stats will be set at a base of ten each, and
	// modified by character creation once.  it'll 
	// be straight-up loaded along with all else after
	// that.
	var myStats = {
		agility: ko.observable(10), // dexterity?
		strength: ko.observable(10),
		stamina: ko.observable(10),
		intelligence: ko.observable(10),
		wisdom: ko.observable(10),
		charisma: ko.observable(10)
	}
	
	var myTools = {
		keys: ko.observable(0),
		tools: ko.observable(0),
		torches: ko.observable(0)	
	}
	var myInventory = {
		ankhs: ko.observable(0),	
		blueTassles: ko.observable(0),
		brassButtons: ko.observable(0),
		greenIdols: ko.observable(0),
		rings: ko.observable(0),
		skullKeys: ko.observable(0),
		strangeCoins: ko.observable(0),
		triLithiums: ko.observable(0)
	}
	var myWeapons = {
		daggers: ko.observable(0),
		maces: ko.observable(0),
		axes: ko.observable(0),
		bows: ko.observable(0),
		swords: ko.observable(0),
		greatSwords: ko.observable(0),
		lightSwords: ko.observable(0),
		phazors: ko.observable(0),
		quickSwords: ko.observable(0)
	}
	
	var myArmor = {
		cloth: ko.observable(0),
		leather: ko.observable(0),
		chain: ko.observable(0),
		plate: ko.observable(0),
		vaccuum: ko.observable(0),
		reflect: ko.observable(0), // is this a thing?
		power: ko.observable(0)
	}

	var myClericSpells = {
		passwall: ko.observable(0)
	}

	var myWizardSpells = {
		magicMissle: ko.observable(0)
	}

	// TODO: replace with ko templating when using inventory items.
	//       This would also support user-custom inventory (hot shit.)
	var getString = function(mustExceed, isActually, thenWrite, currentString) {
		if( mustExceed < isActually) {
			if(currentString.length > 0) {
				thenWrite = ', ' + thenWrite
			}
			return thenWrite + ': ' + isActually;	
		}
		return '';
	};

	var myArmorString = ko.computed(function() {
		var n = 0;
		var s = '';
		s += getString(n, myArmor.cloth(), 'cloth', s);
		s += getString(n, myArmor.leather(), 'leather', s);
		s += getString(n, myArmor.chain(), 'chain', s);
		s += getString(n, myArmor.plate(), 'plate', s);
		s += getString(n, myArmor.vaccuum(), 'vaccuum', s);
		s += getString(n, myArmor.reflect(), 'reflect', s);
		s += getString(n, myArmor.power(), 'power', s);
		return s;
	}, this);


	var myWeaponsString = ko.computed(function() {
		var n = 0;
		var s = '';
		s += getString(n, myWeapons.daggers(), 'daggers', s);
		s += getString(n, myWeapons.maces(), 'maces', s);
		s += getString(n, myWeapons.axes(), 'axes', s);
		s += getString(n, myWeapons.bows(), 'bows', s);
		s += getString(n, myWeapons.swords(), 'swords', s);
		s += getString(n, myWeapons.greatSwords(), 'great swords', s);
		s += getString(n, myWeapons.lightSwords(), 'light swords', s);
		s += getString(n, myWeapons.phazors(), 'phazors', s);
		s += getString(n, myWeapons.quickSwords(), 'quickswords', s);
		return s;
	}, this);

	var mySpellsString = ko.computed(function() {
		var n = 0;
		var s = '';
		s += getString(n, myClericSpells.passwall(), 'passwall', s);
		s += getString(n, myWizardSpells.magicMissle(), 'magic missle', s);
		return s;
	}, this);

	var myInventoryString = ko.computed(function() {
		var n = 0;
		var s = '';
		//s += getString(n, , '', s);
		return s;
	}, this);


	return {
		name: myDescription.name,
		description: myDescription,
		hits: myBasics.hits,
		isDead: isDead,
		gold: myBasics.gold,
		expr: myBasics.experience,
		level: myLevel,
		food: myBasics.food,
		tools: myTools,
		stats: myStats,
		weapons: myWeapons,
		weaponsList: myWeaponsString,
		armor: myArmor,
		armorList: myArmorString,
		clericSpells: myClericSpells,
		wizardSpells: myWizardSpells,
		spellsList: mySpellsString,
		inventory: myInventory,
		inventoryList: myInventoryString
	};
}