/**
 * @class gx.bootstrap.Select
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string}          height          Default: 200px
 * @option {string}          selectionPrefix An optional prefix displayed in front of the selected value
 * @option {string}          icon            The glyphikon icon (default: chevron-down)
 * @option (string)          resetable       If set, add an additional list option to reset the selection (e.g. "Select all")
 * @option {string}          textboxClass    Additional textbox class
 * @option {array}           data            Default data
 * @option {string|function} elementIndex    The ID format (default key is "ID"; specify function to overwrite)
 * @option {string|function} elementLabel    Element label or alternative list format (Default returns a:"elem.name")
 * @option {string|function} elementSelect   The label for selected elements or alternative format function
 * @option {object}          elementDefault  Represents a default element, e.g. for "empty" selections
 *
 * @event select When an element is selected
 * @event noselect When no element is selected
 *
 */
gx.bootstrap.Select = new Class({
	gx: 'gx.bootstrap.Select',
	Extends: gx.ui.Container,
	options: {
		'height'         : '200px',
		'allowEmpty'     : false,
		'selectionLabel' : false,
		'icon'           : 'chevron-down',
		'resetable'      : false,
		'textboxClass'   : false,
		'data'           : null,
		'listFormat'     : null,
		'elementIndex'   : 'ID',
		'elementLabel'   : 'name',
		'elementSelect'  : 'name',
		'elementDefault' : null,
		/* Messages */
		'msg'            : {
			'noSelection': 'No Selection'
		}
	},
	_closed    : true,
	_selected  : null,
	_search    : '',
	elementSelection: null,
	_running   : false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this._display.root.addClass('bs-select');

			this._display.textbox = new Element('input', {
				'type'       : 'text',
				'class'      : 'form-control',
				'placeholder': '('+this.getMessage('noSelection')+')'
			});
			if (this.options.textboxClass)
				this._display.textbox.addClass(this.options.textboxClass);

			this._display.dropdown = new Element('ul', {
				'class': 'dropdown-menu',
				'styles': {
					'height': this.options.height
				}
			});

			this._display.root.adopt([
				new Element('span', {'class': 'glyphicon glyphicon-'+this.options.icon}),
				this._display.textbox,
				this._display.dropdown
			]);

			// Initialize keyboard controls
			this.fxScoll = new Fx.Scroll(this._display.dropdown, {
				offset: {
					y: -100
				}
			});
			this._display.textbox.addEvents({
				'click': function () {
					this.show();
				}.bind(this),
				'focus': function () {
					this.show();
				}.bind(this),
				'blur': function () {
					this.hide.delay(500, root);
				}.bind(this),
				'keypress': function (event) {
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
				}.bind(this),
				'keydown': function (event) {
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
				}.bind(this),
				'keyup': function (event) {
					if ( event.key == 'esc' ) {
						this.hide();
					} else if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();

						var li;
						if (this.elementSelection == null) {
							if(event.key == 'down')
								li = this._display.dropdown.getFirst();
							else
								li = this._display.dropdown.getLast();
						} else {
							if(event.key == 'down') {
								li = this.elementSelection.getNext();
								if (li == null && this.elementSelection == this._display.dropdown.getLast())
									li = this._display.dropdown.getFirst();
							} else {
								li = this.elementSelection.getPrevious();
								if (li == null && this.elementSelection == this._display.dropdown.getFirst())
									li = this._display.dropdown.getLast();
							}
						}

						if (li != null) {
							if (this.elementSelection != null)
								this.elementSelection.removeClass('active');
							this.elementSelection = li;
							this.elementSelection.addClass('active');
							this.fxScoll.toElement(this.elementSelection);
						}

						return;
					} else if ( event.key == 'enter' ) {
						if (this.elementSelection != null) {
							var a = this.elementSelection.getElement('a');
							if (a != null)
								a.fireEvent('click');
						}

						return;
					}

					if ( this.search != null )
						this.search();
					else
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this)
			});

			if (gx.util.isFunction(this.options.elementIndex))
				this.getId = this.options.elementIndex.bind(this);

			if (gx.util.isFunction(this.options.elementLabel))
				this.getLink = this.options.elementLabel.bind(this);

			if (gx.util.isFunction(this.options.elementSelect))
				this.showSelection = this.options.elementSelect.bind(this);

			if (gx.util.isArray(this.options.data))
				this.buildList(this.options.data);
		} catch(e) {
			e.message = 'gx.bootstrap.Select: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method set
	 * @description Sets the selected element
	 * @param {object} selection The element to select
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	set: function (selection, noEvents) {
		this._selected = selection;
		return this.update(noEvents != false);
	},

	/**
	 * @method update
	 * @description Updates the select box according to its state of selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	update: function (noEvents) {
		if (noEvents == null || !noEvents)
			this.fireEvent(this._selected == null ? 'noselect' : 'select', this._selected);

		this.showSelection();
		this.hide();

		return this;
	},

	showSelection: function() {
		this._display.textbox.set('value', this._selected == null ? '' : this._selected[this.options.elementSelect]);
	},

	/**
	 * @method getID
	 * @description Returns the ID of the selected element
	 */
	getId: function (elem) {
		return elem[this.options.elementIndex];
	},

	/**
	 * Returns the element's link
	 *
	 * @param  {object} elem
	 * @return {element}
	 */
	getLink: function(elem) {
		return new Element('a', {'html': elem[this.options.elementLabel]});
	},

	/**
	 * @method buildList
	 * @description Builds a list of links from the provided array
	 * @param {array} list The provided array
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	buildList: function (list) {
		var root = this;
		try {
			this._display.dropdown.empty();
			this.elementSelection = null;

			if (this.options.resetable) {
				this._display.dropdown.adopt(__({'tag': 'li', 'child':
					{'tag': 'a', 'class': 'reset', 'html': this.options.resetable, 'onClick': function() {
						this.set();
					}.bind(this)}
				}));
			}

			var addCLink = function (link, el) {
				link.addEvent('click', function () {
					root.set(el);
				});
			};

			if ( this.options.elementDefault != null )
				list = [this.options.elementDefault].append(list);

			var len = list.length;

			for ( i = 0 ; i < len ; i++ ) {
				var li = new Element('li');

				var contents;
				if (list[i] == null)
					continue;

				contents = this.getLink(list[i]);

				var a = this.getLink(list[i]);
				this._display.dropdown.adopt(li.adopt(a));
				addCLink(a, list[i]);
			}
		} catch(e) {
			gx.util.Console('gx.bootstrap.Select->buildList', e.message);
		}

		return this;
	},

	/**
	 * @method show
	 * @description Shows the select box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	show: function () {
		if ( this._display.textbox.disabled )
			return this;

		this._display.root.addClass('open');
		// this._display.textbox.set('value', this._search);
		this._display.textbox.focus();

		return this.search();
	},

	/**
	 * @method hide
	 * @description Hides the select box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	hide: function () {
		if (!this.isOpen())
			return this;

		this._display.root.removeClass('open');
		// this._search = this._display.textbox.value;

		return this.update();
	},

	/**
	 * Returns if the list box is open
	 *
	 * @return {bool}
	 */
	isOpen: function() {
		return this._display.root.hasClass('open');
	},

	/**
	 * @method getValue
	 * @description Alias for getID
	 */
	getValue: function () {
		return this.getId();
	},

	/**
	 * @method getSelected
	 * @description Returns the selected element
	 */
	getSelected: function () {
		return this._selected;
	},

	/**
	 * @method reset
	 * @description Resets the selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	reset: function (noEvents) {
		this._display.listbox.empty();
		this.elementSelection = null;

		return this.set(null, noEvents);
	},

	/**
	 * @method enable
	 * @description Enables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	enable: function () {
		this._display.textbox.erase('disabled');
		return this;
	},

	/**
	 * @method disable
	 * @description Disables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	disable: function () {
		this._display.textbox.set('disabled', true);
		return this;
	}
});

gx.bootstrap.SelectPrio = new Class({
	gx: 'gx.bootstrap.SelectDyn',
	Extends: gx.bootstrap.Select,
	options: {
		elementIndex: 'value',
		data: [
			{'value': 0, 'color': '#008000', 'symbol': '■□□□□', 'label': 'lowest'},
			{'value': 1, 'color': '#ffc000', 'symbol': '■■□□□', 'label': 'low'},
			{'value': 2, 'color': '#ff8000', 'symbol': '■■■□□', 'label': 'medium'},
			{'value': 3, 'color': '#ff4000', 'symbol': '■■■■□', 'label': 'high'},
			{'value': 4, 'color': '#c00000', 'symbol': '■■■■■', 'label': 'highest'}
		],
		msg: {
			'lowest' : 'Lowest',
			'low'    : 'Low',
			'medium' : 'Medium',
			'high'   : 'High',
			'highest': 'Highest'
		}
	},
	initialize: function (display, options) {
		var root = this;
		try {
			for (var i = 0 ; i < data.length ; i++) {
				this.options.data[i].name = this.options.data[i].symbol + ' | ' + this.getMessage(this.options.data[i].label);
			}
			this.parent(display, options);
		} catch(e) {
			e.message = 'gx.bootstrap.SelectDyn: ' + e.message;
			throw e;
		}
	},

	/**
	 * Returns the element's link
	 *
	 * @param  {object} elem
	 * @return {element}
	 */
	getLink: function(elem) {
		return new Element('a', {'html': elem.name, 'styles': {'color': elem.color}});
	}
});
