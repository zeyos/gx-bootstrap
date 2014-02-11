/**
 * @class gx.bootstrap.MultiValueEditor
 * @description Creates a multi value editor to edit values with multiple sub-values (array)
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string} width The width of the panel + 'px'
 */
gx.bootstrap.MultiValueEditor = new Class({

	Extends: gx.ui.Container,

	options: {
		'width'          : '296px',
		'options'		 : false,
		'default'		 : false
	},
	
	initialized: false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			//this._display.root.addClass('panel');
			this._display.root.setStyles({
				'border': '1px #d4d4d4 solid',
				'border-radius': '4px 4px 4px 4px',
    			'box-shadow': '0 1px 4px rgba(0, 0, 0, 0.067)'
			});
			
			if (this.options['default'])
				this.options.options = JSON.decode(this.options['default']);
			
			if (this.options.width)
				this._display.root.setStyle('width', this.options.width);
			
			// head
			this._display.txtAdd = new Element('input', {'type': 'text'}).setStyles({
				'margin-bottom'		: '0px',
				'padding'			: '0px 6px 0px 6px'
			});
			this._display.btnAdd = new Element('img', {'src': './assets/img/icons/plus2.png'}).setStyles({
				'vertical-align'	: 'center',
				'margin-left'		: '7px'
			})
			this._display.btnAdd.txt = this._display.txtAdd;
			this._display.btnAdd.root = this;
			this._display.btnAdd.addEvent('click', function() {
				var txtAdd = this.txt;
				if (txtAdd.value == '')
					return;
				if (typeOf(this.root.options.options) != 'array')
					this.root.options.options = new Array();
				this.root.options.options.push(txtAdd.value);
				this.root.refreshOptions();
				txtAdd.value = '';
			});
			this._display.head = new Element('div').setStyles({
				'border-bottom' : '1px #d4d4d4 solid',
				'padding'		: '6px'
			}).adopt(this._display.txtAdd).adopt(this._display.btnAdd);
			this._display.root.adopt(this._display.head);
			
			// options
			if (this.options.options) {
				this.refreshOptions();
			}
			
		} catch(e) {
			gx.util.Console('gx.bootstrap.MultiValueEditor->initialize', gx.util.parseError(e) );
		}
	},
	
	move: function(start, end) {
		if (this.options.options) {
			this.options.options.move(start, end);
			this.refreshOptions();
		}
	},
	
	refreshOptions: function() {
		if (!this.initialized) {
			this._display.optionsbox = new Element('div').setStyles({
				'padding'		: '4px'
			});
			this._display.optionstable = new Element('table', {'cellpadding': '3px', 'cellspacing': '2px'});
		}
		this._display.optionstable.empty();
		
		// fill table
		for (var i = 0; i < this.options.options.length; i++) {
			var value = this.options.options[i];
			var tr = new Element('tr');
			// text field
			var txtElem = new Element('input', {'type': 'text', 'value': value}).setStyles({
				'margin-bottom'		: '0px',
				'padding'			: '0px 6px 0px 6px'
			});
			var tdTxt = new Element('td').adopt(txtElem);
			tr.adopt(tdTxt);
			// delete field
			var tdRemove = new Element('td', {'html': '<img src="./assets/img/icons/minus.png" />'}).addEvent('click', function() {
				
			});
			tr.adopt(tdRemove);
			// move field
			var tdMove = new Element('td');
			var triangleUp = new Element('span', {'html': '&#9650;'}).addClass('cursorHand').setStyle('margin-right', '5px');
			triangleUp.mve = this;
			triangleUp.pos = i;
			triangleUp.addEvent('click', function() {
				this.mve.move(this.pos, this.pos - 1);
				this.mve.refreshOptions();
			});
			var triangleDown = new Element('span', {'html': '&#9660;'}).addClass('cursorHand');
			triangleDown.mve = this;
			triangleDown.pos = i;
			triangleDown.addEvent('click', function() {
				this.mve.move(this.pos, this.pos + 1);
				this.mve.refreshOptions();
			});
			if (i != 0)
				tdMove.adopt(triangleUp);
			if (i != this.options.options.length - 1)
				tdMove.adopt(triangleDown);
			tr.adopt(tdMove);
			this._display.optionstable.adopt(tr);
		}
		this._display.optionsbox.adopt(this._display.optionstable);
		if (!this.initialized) {
			this._display.root.adopt(this._display.optionsbox);
			this.initialized = true;
		}
	},
	
	getValue: function() {
		return JSON.encode(this.options.options);
	},
	
	setValue: function(value) {
		console.log('v', value);
		this.options.options = JSON.decode(value);
		//console.log(this.options.options);
		this.refreshOptions();
		return this;
	}

});
