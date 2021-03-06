window.onload = function () {
	var placeholder = document.getElementById("readerField");
	var reader = new InteractiveAdventureReader(placeholder);

	/*var btn_menuSave = document.getElementById("btn_menuSave");
	btn_menuSave.onclick = function() {
		var story = reader.save();
		var uri = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(story));
		var dlAnchorElem = document.getElementById('downloadAnchorElem');
		dlAnchorElem.setAttribute("href",     uri     );
		dlAnchorElem.setAttribute("download", story.name+".json");
		dlAnchorElem.click();
	};*/

	function importSave(file) {
		var levelToLoad = JSON.parse(file);
		var checksum = levelToLoad.hash;
		delete levelToLoad.hash;
		(document.getElementById(levelToLoad.levelid).onclick)(false);
		//document.getElementById(levelToLoad.levelid).click(false);
		levelToLoad.trace.forEach(function(obsel) {
			var button = document.getElementById(obsel.group);
			button.click();
		});
	}


	function loadFile() {
		var fileinput = document.getElementById("fileinput");
		if(fileinput.files[0] != undefined) {
			var file = fileinput.files[0];

			if (file.type.match('application/json')) {
				var reader = new FileReader();

				reader.onload = function(){
					importSave(reader.result);
				};
				reader.readAsText(file);
	    	} else {
				window.alert(translate("save_wrongFormat"));
			}
		}
	}
};

function InteractiveAdventureReader() {
	this._constructor_(arguments);
}
InteractiveAdventureReader.prototype = {
	DOMelem: "",
	savegame: "",
	story: "",
	mode: "visual-novel",

	imageDOM: "",
	optionDOM: "",
	choicesDOM_VN: "",
	choicesDOM_GB: "",
	characterDOM: "",
	textHolderDOM: "",
	textDOM: "",

	_constructor_: function (arguments) {
		var parent = arguments[0];
		//var story = arguments[1];
		//this.story = story;
		this.savegame = {
			storyID: "My Story",
			firstPlayDate: new Date(),
			lastPlayDate: new Date(),
			choices: [],
			currentSituation: "story.startingSituation",
			currentChild: -1,
			currentLine: -1
		};
		this._createDOMelem_(parent);
	},
	_createDOMelem_: function (parent) {
		var readerField = document.createElement("div");
		readerField.id = "reader";
		readerField.className = "visual-novel";

		var image = document.createElement("div");
		image.id = "readerImage";
		this.imageDOM = image;

		var option = document.createElement("div");
		option.id = "readerOption";	// Name will probably change
		this.optionDOM = option;

		var choices_VN = document.createElement("div");
		choices_VN.id = "readerChoices_VN";
		this.choicesDOM_VN = choices_VN;

		var choices_GB = document.createElement("div");
		choices_GB.id = "readerChoices_GB";
		this.choicesDOM_GB = choices_GB;

		var text = document.createElement("div");
		text.id = "readerText";
		this.textDOM = text;
		
		var textHolder = document.createElement("div");
		textHolder.id = "readerTextHolder";
		this.textHolderDOM = textHolder;

		var character = document.createElement("div");
		character.id = "readerCharacter";
		this.characterDOM = character;

		image.append(option);
		image.append(choices_VN);
		image.append(text);
		text.append(character);
		text.append(textHolder);
		text.append(choices_GB);
		readerField.append(image);

		this.DOMelem = readerField;
		parent.append(readerField);
	},
	_createChoiceDOM_: function (choice) {
		var chooseFunction = this.choose;
		var div = document.createElement("div");
		div.className = "choice"
		div.textContent = choice.name;
		// Bla bla bla
		div.onclick = function () {
			chooseFunction(choice);
		};
		// Bla bla bla
		return div;
	},
	changeMode: function (mode) {
		switch(mode) {
			case "gamebook":
				this.mode = "gamebook";
				this.DOMelem.classList.toggle("visual-novel",false);
				this.DOMelem.classList.toggle("gamebook",true);
				break;
			case "visual-novel":
				this.mode = "visual-novel";
				this.DOMelem.classList.toggle("visual-novel",true);
				this.DOMelem.classList.toggle("gamebook",false);
				break;
		}
	},
	dummyChoices: function () {
		var createChoiceDOMFunction = this._createChoiceDOM_;
		var choices = [{
					id: "choice001",
					name: "What's your name ?",
					link: "situation1"
				},
				{
					id: "choice002",
					name: "Tell me everything !",
					link: "situation2"
				}];
		switch (this.mode) {
			case "gamebook":
				parent = this.choicesDOM_GB;
				break;
			case "visual-novel":
				parent = this.choicesDOM_VN;
				this.toggleCharAndText();
				break;
			default:
		}
		choices.forEach(function(e) {
			var choiceElem = createChoiceDOMFunction(e);
			parent.append(choiceElem);
		});
	},
	displayChoices: function () {
		// Don't forget verifications
		var createChoiceDOMFunction = this._createChoiceDOM_;
		var parent; // Where to put choices to display
		switch (this.mode) {
			case "gamebook":
				parent = this.choicesDOM_GB;
				break;
			case "visual-novel":
				parent = this.choicesDOM_VN;
				this.toggleCharAndText();
				break;
			default:
		}
		this.story.situations[this.savegame.currentSituation].choices.forEach(function(e) {
			var choiceElem = createChoiceDOMFunction(e);
			parent.append(choiceElem);
		});

		// Hide character and text panels
		// Display choice panel
	},
	toggleCharAndText: function () {
		// Should try to do transition with opacity first and then, hide them completely
		if(this.textDOM.style.zIndex == -1 && this.characterDOM.style.zIndex == -1) {
			this.textDOM.style.zIndex = 1;
			//this.characterDOM.style.zIndex = 1;
			this.choicesDOM_VN.zIndex = -1;
		} else {
			this.textDOM.style.zIndex = -1;
			this.characterDOM.style.zIndex = -1;
			this.choicesDOM_VN.zIndex = 1;
		}
	},

	save: function () {
		this.savegame.lastModificationDate = new Date();
		return this.savegame;
	},
	load: function (savegameFile) {
		// Do some verification on the savegame
		this.savegame = savegameFile;
		this.init();
	},
	print: function () {
		console.log(this.savegame);
	},
	start: function () {
		if(this.savegame.currentSituation !== undefined && this.story.situations[this.savegame.currentSituation] !== undefined
		&& this.savegame.currentChild !== undefined && this.story.situations[this.savegame.currentSituation].content[this.savegame.currentChild] !== undefined) {
			// Display the current child of the current situation
		}
	},
	display: function (typeOfData, data) {
		switch (typeOfData) {
			case "text":
				if(this.story.type === "gamebook") {

				}
				break;
			default:

		}
	},
	executeAction: function (actionObject) {

	},
	next: function () {
		var situation = this.story.situations[this.savegame.currentSituation];
		var child = this.story.situations[this.savegame.currentSituation].content[this.savegame.currentChild+1]
		if(child !== undefined) {
			if(child.type === "text") {
				// Another verification on the current line...
				var line = child.content[this.savegame.currentLine+1];
				if(line !== undefined) {
					this.display("text", line);
					// Display the line of text
					this.savegame.currentLine++;
				} else {
					this.savegame.currentChild++;
					this.savegame.currentLine = -1;
					this.next();
				}
			} else if(child.type === "action") {
				// Do the action
				this.executeAction(child)
				this.savegame.currentChild++;
				if(child.continue) {
					// If the creator decided to force-load the next element
					this.next();
				}
			}
		} else {
			// Verify var situation isn't undefined
			if(situation.choices.length > 0) { // Check if there are choices
				this.displayChoices();
			} else {
				// Display the back cover of the gamebook
			}
		}
	},
	choose: function (choiceObject) {
		var situation = this.story.situations[choiceObject.link];
		if(situation !== undefined) {
			this.savegame.currentSituation = choiceObject.link;
			this.savegame.currentChild = -1;
			this.savegame.currentLine = -1;
			this.savegame.choices.push({
				id : choiceObject.id,
				date: new Date()
			});

			// Hide choice panel
			// Un-hide character and text panel

			this.next();
		}
	}
}
