/**
 * @class gx.bootstrap.Select
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string} method Request method
 * @option {string} url Request URL
 * @option {string} height The height of the select box + 'px', default is '100px'
 * @option {string} width The width of the select box + 'px', default is '150px'
 * @option {object} requestData Additional request data
 * @option {string} requestParam Parameter for the request, default is 'search'
 * @option {string} listValue The key name for element values
 * @option {function} listFormat Formatting function for the list output
 * @option {function} formatID Formatting function for the list output
 * @option {function} decodeResponse Calls JSON.decode
 *
 * @event request When the list is requested
 * @event select When an element is selected
 * @event noselect When no element is selected
 *
 * @sample Select Simple search in select box example.
 */
gx.bootstrap.Select = new Class({

	gx: 'gx.bootstrap.Select',

	Extends: gx.ui.Container,

	options: {
		'enableLoader'   : undefined,
		'disableLoader'  : undefined,
		'method'         : 'GET',
		'url'            : 'index.php',
		'height'         : '100px',
		'width'          : '180px',
		'requestData'    : {},
		'requestParam'   : 'search',
		'searchFilter'   : undefined,
		'localOptions'   : null,
		'allowEmpty'     : false,
		'icon'           : 'list-alt',

		/**
		 * A string to use as the component's label or an object to pass to "Element.set()".
		 */
		'label'          : '',

		'orientation'    : 'left',
		'default'        : '*',
		'textFormat'     : null,
		'listFormat'     : function (elem) {
			return elem.name;
		},
		'formatID'       : function (elem) {
			return elem.Id;
		},
		'decodeResponse' : function (json) {
			return JSON.decode(json);
		},
		'reset'          : false,
		/* Messages */
		'msg'            : {
			'de'         : {
				'noSelection': 'Keine Auswahl'
			},
			'noSelection': 'No Selection'
		}
	},

	_running   : false,
	_closed    : true,
	_lastSearch: false,
	_selected  : null,
	_search    : '',

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			if (this.options.textFormat == null)
				this.options.textFormat = this.options.listFormat;

			this._display.root.addClass('bs-select input-prepend');
			this._display.textbox = new Element('input', {
				'type'  : 'text',
				'class' : 'left',
				'styles': {'width': this.options.width}
			});
			var iconMarkup = ( this.options.icon ? '<i class="icon-'+this.options.icon+'"></i>' : '' );

			this._display.symbol = new Element('span')
				.addEvent('click', function (event) {
					event.stopPropagation();
					root.show();
				});

			if ( this.options.label && (typeof(this.options.label) === 'object') ) {
				var labelOptions = Object.clone(this.options.label);
				var labelText    = ( labelOptions.html == null ? String(labelOptions.text).htmlSpecialChars() : labelOptions.html );
				labelOptions.html = iconMarkup+( labelOptions.text ? ' '+labelOptions.text : '' );
				delete labelOptions.text;
				this._display.symbol.set(labelOptions);
			} else if (iconMarkup != '' || (this.options.label && this.options.label != '')) {
				this._display.symbol.set('html', iconMarkup+( this.options.label ? ' '+this.options.label : '' ))
			}

			this._display.symbol.addClass('add-on');

			this._display.navbar = new Element('div', {'class': 'navbar', 'styles': {'position': 'absolute'}});
			this._display.dropdown = new Element('div', {'class': 'dropdown'});
			this._display.frame = new Element('div', {'class': 'dropdown-menu bs-select-menu'});
			this._display.dropdown.adopt(this._display.frame);
			this._display.navbar.adopt(this._display.dropdown);

			this._display.listbox = new Element('div', {
				'styles': {
					'height': this.options.height,
					'overflow': 'auto'
				}
			});

			this._display.frame.adopt(this._display.listbox);

			if ( this.options.orientation == 'left' )
				this._display.root.adopt([this._display.symbol, this._display.textbox]);
			else {
				this._display.root.addClass('bs-select-append');
				this._display.root.adopt([this._display.textbox, this._display.symbol]);
			}

			this._display.root.adopt([
				new Element('div', {'class': 'clear'}),
				this._display.navbar
			]);

			this._display.textbox.addEvents({
				'focus': function () {
					root.show();
				},
				'keyup': function () {
					root.search();
				},
				'blur': function () {
					root.hide.delay(500, root);
				}
			});

			this._display.textbox.setStyle('font-style', 'italic');
			this._display.textbox.value = '('+this.getMessage('noSelection')+')';
		} catch(e) {
			gx.util.Console('gx.bootstrap.Select->initialize', gx.util.parseError(e) );
		}
	},

	/**
	 * @method search
	 * @description Initiates a search request
	 * @param {string} search The search string
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	search: function (search) {
		var root = this;
		try {
			if ( search == null )
				search = this._display.textbox.value.trim();
			if ( search == '' || search == null )
				search = this.options['default'];
			// search === this._lastSearch strict comparison is necessary.
			// Because on focus select: '' != false => results in false -> no search will be executed
			// only '' !== false => results in true
			if ( search === this._lastSearch ) {

			} else if ( this.options.localOptions ) {
				this._lastSearch = search;
				this.buildList(
					this.options.searchFilter
					? this.options.searchFilter(this.options.localOptions, this._lastSearch)
					: this.options.localOptions
				);

			} else if ( this._running !== true ) {
				this.fireEvent('request');
				this._running = true;
				this._lastSearch = search;
				var data = this.options.requestData;

				if ( !this.options.searchFilter ) {
					if (typeOf(this.options.requestParam) == 'function')
						data = this.options.requestParam(data, search);
					else
						data[this.options.requestParam] = search;
				}

				var reqOptions = {
					'method'   : root.options.method,
					'url'      : root.options.url,
					'data'     : data,
					'onSuccess': function (json) {
						root.evalResponse(json);
					},
					'onFailure': function () {
						alert('Request failed');
					}
				};
				if ( typeOf(root.options.enableLoader) == 'function' ) {
					reqOptions.onRequest = root.options.enableLoader;

				}
				if ( typeOf(root.options.disableLoader) == 'function' ) {
					reqOptions.onComplete = root.options.disableLoader;

				}
				req = new Request(reqOptions);

				req.send();
			}
		} catch(e) {
			gx.util.Console('gx.bootstrap.Select->search', e.message);
		}

		return this;
	},

	/**
	 * @method evalResponse
	 * @description Evaluates the response: Decodes the JSON, calls buildList with the result and then calls search
	 * @param {string} json The JSON response to evaluate
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	evalResponse: function (json) {
		try {
			var obj = this.options.decodeResponse(json);
			if ( typeOf(obj) == 'array' )
				this.buildList(
					this.options.searchFilter
					? this.options.searchFilter(obj, this._lastSearch)
					: obj
				);
			else
				gx.util.Console('gx.bootstrap.Select->evalResponse.', 'Invalid object type. Array expected.');
		} catch(e) { gx.util.Console('gx.bootstrap.Select->evalResponse', gx.util.parseError(e)); }

		this._running = false;
		this.search();
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
			this._display.listbox.empty();

			if (this.options.reset) {
				this._display.listbox.adopt(new Element('a', {'styles': {'text-align': 'center', 'font-style': 'italic'}, 'html': this.options.reset}).addEvent('click', function() {
					root.set();
				}));
			}

			var odd = true;
			var addCLink = function (link, el) {
				link.addEvent('click', function () {
					root.set(el);
				});
			};

			if ( this.options.allowEmpty )
				list = [ null ].append(list);

			var len = list.length;

			for (i = 0 ; i < len ; i++) {
				var link = new Element('a');
				if ( odd )
					link.set('class', 'odd');

				var contents = (
					( (list[i] == null) && (typeof(this.options.allowEmpty) === 'string') )
					? this.options.allowEmpty
					: this.options.listFormat(list[i])
				);
				if ( typeOf(contents).match(/^elements?$/) )
					link.empty().adopt(contents);
				else
					link.set('html', contents);

				this._display.listbox.adopt(link);
				odd = !odd;
				addCLink(link, list[i]);
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

		this._display.frame.setStyle('display', 'block');
		this._display.textbox.set('value', this._search);
		this._display.textbox.focus();
		this._closed = false;

		return this.search();
	},

	/**
	 * @method hide
	 * @description Hides the select box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	hide: function () {
		if ( this._closed )
			return this;

		this._closed = true;
		this._display.frame.setStyle('display', 'none');
		this._search = this._display.textbox.value;

		return this.update();
	},

	/**
	 * @method update
	 * @description Updates the select box according to its state of selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	update: function (noEvents) {
		if ( this._selected == null ) {
			if (noEvents == null || !noEvents)
				this.fireEvent('noselect');
			this._display.textbox.setStyle('font-style', 'italic');
			this._display.textbox.value = '('+this.getMessage('noSelection')+')';
		} else {
			if (noEvents == null || !noEvents)
				this.fireEvent('select', this._selected);
			this._display.textbox.setStyle('font-style', 'normal');
			this._display.textbox.value = this.options.textFormat(this._selected);
		}

		return this;
	},

	/**
	 * @method setRequestData
	 * @param {object} The default request data
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	setRequestData: function (data) {
		this.options.requestData = data;
		return this;
	},

	/**
	 * @method set
	 * @description Sets the selected element
	 * @param {object} selection The element to select
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	set: function (selection) {
		this._selected = selection;
		return ( this._closed ? this.update(true) : this.hide() );
	},

	/**
	 * @method getID
	 * @description Returns the ID of the selected element
	 */
	getId: function () {
		return (
			this._selected == null
			? undefined
			: this.options.formatID(this._selected)
		);
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
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	reset: function () {
		this._display.listbox.empty();

		this._selected   = null;
		this._lastSearch = false;

		return this.update();
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
