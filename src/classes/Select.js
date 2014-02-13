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
		'height'         : '200px',
		'requestData'    : {},
		'requestParam'   : 'search',
		'searchFilter'   : undefined,
		'localOptions'   : null,
		'allowEmpty'     : false,
		'icon'           : 'chevron-down',

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
		'textboxClass'   : false,
		/* Messages */
		'msg'            : {
			'de'         : {
				'noSelection': 'Keine Auswahl'
			},
			'noSelection': 'No Selection'
		},
		'requestFunc'    : null
	},

	_running   : false,
	_closed    : true,
	_lastSearch: false,
	_selected  : null,
	_search    : '',
	elementSelection: null,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			if (this.options.textFormat == null)
				this.options.textFormat = this.options.listFormat;

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
				'focus': function () {
					this.show();
				}.bind(this),
				'blur': function () {
					this.hide.delay(500, root);
				}.bind(this),
				'keypress': function (event) {
					if (event.key == 'up' || event.key == 'down') {
						event.preventDefault();
						return;
					}
				}.bind(this),
				'keydown': function (event) {
					if (event.key == 'up' || event.key == 'down') {
						event.preventDefault();
						return;
					}
				}.bind(this),
				'keyup': function (event) {
					if (event.key == 'esc') {
						this.select();
					} else if (event.key == 'up' || event.key == 'down') {
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
					} else if (event.key == 'enter') {
						if (this.elementSelection != null) {
							var a = this.elementSelection.getElement('a');
							if (a != null)
								a.fireEvent('click');
						}

						return;
					}

					this.search();
				}.bind(this)
			});

			// Overwrite the default request function
			if (gx.util.isFunction(this.options.requestFunc))
				this.request = this.options.requestFunc.bind(this);
		} catch(e) {
			e.message = 'gx.bootstrap.Select: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method request
	 * @description Performs the search request
	 * @param {object} data
	 * @returns void
	 */
	request: function(data) {
		var reqOptions = {
			'method'   : this.options.method,
			'url'      : this.options.url,
			'data'     : data,
			'onSuccess': function (json) {
				this.evalResponse(this.options.decodeResponse(json));
			}.bind(this),
			'onFailure': function () {
				// alert('Request failed');
			}.bind(this)
		};

		if ( typeOf(this.options.enableLoader) == 'function' )
			reqOptions.onRequest = this.options.enableLoader;

		if ( typeOf(this.options.disableLoader) == 'function' )
			reqOptions.onComplete = this.options.disableLoader;

		req = new Request(reqOptions);

		req.send();
	},

	/**
	 * @method search
	 * @description Initiates a search request
	 * @param {string} search The search string
	 * @returns Returns this instance (for method chaining).
	 */
	search: function (search) {
		var root = this;
		try {
			if ( search == null )
				search = this._display.textbox.value.trim();
			if ( search == '' || search == null )
				search = this.options['default'];

			if ( search === this._lastSearch ) {
				// search === this._lastSearch strict comparison is necessary.
				// Because on focus select: '' != false => results in false -> no search will be executed
				// only '' !== false => results in true
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

				// Perform the request
				this.request(data);
			}
		} catch(e) {
			e.message = 'gx.bootstrap.Select: ' + e.message;
			throw e;
		}

		return this;
	},

	/**
	 * @method evalResponse
	 * @description Evaluates the response: Decodes the JSON, calls buildList with the result and then calls search
	 * @param {string} data
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	evalResponse: function (data) {
		try {
			if ( typeOf(data) == 'array' )
				this.buildList(
					this.options.searchFilter
					? this.options.searchFilter(data, this._lastSearch)
					: data
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
			this._display.dropdown.empty();

			if (this.options.reset) {
				this._display.dropdown.adopt(__({'tag': 'li', 'child':
					{'tag': 'a', 'class': 'reset', 'html': this.options.reset, 'onClick': function() {
						this.set();
					}.bind(this)}
				}));
			}

			var addCLink = function (link, el) {
				link.addEvent('click', function () {
					root.set(el);
				});
			};

			if ( this.options.allowEmpty )
				list = [ null ].append(list);

			var len = list.length;

			for (i = 0 ; i < len ; i++) {
				var li = new Element('li');

				var contents;
				if (list[i] == null) {
					if (gx.util.isString(this.options.allowEmpty))
						contents = this.options.allowEmpty;
					else
						continue;
				} else {
					contents = this.options.listFormat(list[i]);
				}

				var a = gx.util.isElement(contents) ? contents : new Element('a', {'html': contents});
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

		this._display.root.removeClass('open');
		this._closed = true;
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
			this._display.textbox.erase('value');
		} else {
			if (noEvents == null || !noEvents)
				this.fireEvent('select', this._selected);
			this._display.textbox.set('value', this.options.textFormat(this._selected));
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
