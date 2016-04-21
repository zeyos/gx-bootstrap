/**
 * @extends gx.core
 */
gx.bootstrap = {};/**
 * @class gx.bootstrap.CheckButton
 * @description Creates a checkbox button
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} size The button size (regular, mini, large)
 * @option {string} label The button label
 * @option {bool} value The initial field value
 *
 * @event change
 * @event check
 * @event uncheck
 *
 * @sample Datebox Simple datebox example.
 */
gx.bootstrap.CheckButton = new Class({
	gx: 'gx.bootstrap.CheckButton',
	Extends: gx.ui.Container,
	options: {
		'size': 'regular',
		'label': '&nbsp;',
		'value': false
	},
	class_checked: 'btn-success',
	class_unchecked: 'btn-warning',
	_checked: false,
	_disabled: false,
    _labelActive: false,
    _labelInactive: false,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);

			var btn_class = 'btn btn-default' + ( this.options.size == 'regular' ? '' : (' btn-'+this.options.size ) );

			this._display.group = new Element('div', {'class': 'btn-group'});
			this._display.root.adopt(this._display.group);

			this._display.button = new Element('button', {'class': btn_class});
			this._display.indicator = new Element('button', {'class': btn_class});
			this._display.group.adopt([this._display.indicator, this._display.button]);

			this._display.button.addEvent('click', function(event) {
				event.preventDefault();
				root.toggle();
			});
			this._display.indicator.addEvent('click', function(event) {
				event.preventDefault();
				root.toggle();
			});

            this.setLabel(this.options.label);

			if (this.options.value)
				this.check(1);
			else
				this.uncheck(1);
		} catch(e) { gx.util.Console('gx.bootstrap.CheckButton->initialize', e.message); }
	},

	/**
	 * @method setLabel
	 * @description Sets the button's label
	 * @param {string} label
	 */
	setLabel: function(label) {
        if (typeOf(label) == 'array') {
            this._labelInactive = label.pop();
            this._labelActive = label.pop();
            return;
        }
		
        this._labelInactive = label;
        this._labelActive = label;
	},

	/**
	 * @method get
	 * @description Returns the check value
	 * @return {bool}
	 */
	get: function() {
		return this._checked;
	},

	/**
	 * @method toggle
	 * @description Toggles between checked and unchecked
	 * @param {bool} suppress Suppress events
	 */
	toggle: function(suppress) {
		if (this._checked)
			this.uncheck(suppress);
		else
			this.check(suppress);

		return false;
	},

	/**
	 * @method check
	 * @description Sets the field value to "checked"
	 * @param {bool} suppress Suppress events
	 */
	check: function(suppress) {
		if ( this._disabled )
			return;

		this._display.indicator.removeClass(this.class_unchecked);
		this._display.indicator.addClass(this.class_checked);
		this._display.indicator.set('html', '&nbsp;<span class="glyphicon glyphicon-ok"></span>');
        this._display.button.set('html', this._labelActive);
		this._checked = true;

		if (suppress == null || !suppress) {
			this.fireEvent('change', true);
			this.fireEvent('check');
		}
	},

	/**
	 * @method uncheck
	 * @description Sets the field value to "unchecked"
	 * @param {bool} suppress Suppress events
	 */
	uncheck: function(suppress) {
		if ( this._disabled )
			return;

		this._display.indicator.removeClass(this.class_checked);
		this._display.indicator.addClass(this.class_unchecked);
		this._display.indicator.set('html', '&nbsp;<span class="glyphicon glyphicon-remove"></span>');
        this._display.button.set('html', this._labelInactive);
		this._checked = false;
		if (suppress == null || !suppress) {
			this.fireEvent('change', false);
			this.fireEvent('check');
		}
	},

	/**
	 * @method set
	 * @description Sets a value
	 * @param {bool} value
	 * @param value
	 */
	set: function(value) {
		if (value)
			this.check();
		else
			this.uncheck();
	},

	setDisabled: function(enable) {
		this._disabled = enable;
		this._display.indicator.disabled = enable;
		this._display.button.disabled = enable;
	}
});/**
 * @class gx.bootstrap.Checklist
 * @description Creates a checklist control and loads the contents from a remote URL.
 * @extends gx.ui.Container
 *
 * @option {int} height Component height
 * @option {bool} search Add a search field to the box
 * @option {string} method Request method
 * @option {string} url Request URL
 * @option {object} requestData Additional request data
 * @option {string} listValue The key name for element values
 * @option {function} listFormat Formatting function for the list output
 *
 * @event request
 * @event complete
 * @event failure
 *
 * @sample Checklist Simple checkboxes list example
 */
gx.bootstrap.Checklist = new Class({
	gx: 'gx.bootstrap.Checklist',
	Extends: gx.ui.Container,
	options: {
		'height': 150,
		'width':  350,
		'search': true,
		'method': 'POST',
		'data':   false,
		'url':    false,
		'getItemValue': null,
		'requestData': {},
		'listValue':  'value',
		'listFormat': function(elem) {
			return elem.label;
		},
		'decodeResponse': function(json) {
			return JSON.decode(json);
		},
		'onClick': false
	},
	_elems: [],
	_bg: '',
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this._display.frame = new Element('div', {'styles': {
				'overflow': 'auto'
			}});

			if ( this.options.height )
				this._display.frame.setStyle('height', this.options.height);

			this._display.root.addClass('bs-checklist');

			this._display.root.setStyle('width', root.options.width);
			if (this.options.search) {
				var searchInput = new Element('input', {'type': 'text', 'class': 'form-control'})
					.addEvent('keyup', function(event) {
						root.search(event.target.value);
					});

				this._display.root.adopt(new Element('div', {'class': 'form-group input-group'}).adopt(
					new Element('span', {'class': 'input-group-addon'}).adopt(new Element('i', {'class': 'glyphicon glyphicon-search'})),
					searchInput
				));
			}

			this._display.root.adopt(this._display.frame);

			var table = new Element('table', {'class': 'table table-striped'}).setStyle('margin-bottom', '0px');
			this._display.tbody = new Element('tbody');
			if (this.options.onClick)
				table.addEvent('click', this.options.onClick);

			this._display.frame.adopt(table.adopt(this._display.tbody));

			if (this.options.url)
				this.loadFromURL(this.options.url, this.options.requestData);
			if (Array.isArray(this.options.data))
				this.set(this.options.data);
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->initialize', e.message); }
	},

	/**
	 * @method set
	 * @description Creates the item table
	 * @param {array} list: List of objects {ID, label}
	 */
	set: function(list) {
		try {
			this._display.tbody.empty();
			if (list == null)
				return;

			list.each(function(item) {
				this.addItem(item);
			}, this);
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->set', e.message); }
	},

	/**
	 * @method addItem
	 * @description Adds a new item row to the list
	 * @param {array} item Item row to add. Array that will be parsed through options.listFormat()
	 */
	addItem: function(item) {
		try {
			var elem = {
				'label': (this.options.listFormat != null) ? this.options.listFormat(item) : item,
				'value': ( this.options.getItemValue == null ? item.value : this.options.getItemValue(item) ),
				'input': new gx.bootstrap.CheckButton()
			};

			//console.log('item: ' + JSON.encode(item) + ' format: ' + this.options.listFormat + ' label: ' + elem.label + ' value: ' + elem.value + ' input: ' + elem.input);

			elem.row = new Element('tr');
			var td1 = new Element('td', {'width': 90});
			td1.adopt(elem.input);
			elem.row.adopt(td1);
			var td2 = new Element('td', {'html': elem.label});
			td2.addEvent('click', function() {
				elem.input.toggle();
			});
			elem.row.adopt(td2);
			this._display.tbody.adopt(elem.row);
			this._elems.push(elem);
			this._bg = this._bg == '' ? ' bg' : '';
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->addItem', e.message); }
	},

	/**
	 * @method search
	 * @description Evaluates a regular expression search query and displays the appropriate row
	 * @param {string} query The search query (regular expression)
	 */
	search: function(query) {
		try {
			var reg = new RegExp(query);
			this._elems.each(function(elem) {
				if (elem.value.search(reg) != -1)
					elem.row.setStyle('display', 'table-row');
				else
					elem.row.setStyle('display', 'none');
			}, this);
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->search', e.message); }
	},

	/**
	 * @method reset
	 * @description Unchecks all checkboxes
	 */
	reset: function() {
		try {
			this._elems.each(function(elem) {
				elem.input.uncheck();
			});
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->reset', e.message); }
	},

	/**
	 * @method setValues
	 * @description Sets a list of values and checks all matching checkboxes
	 * @param {array} values A flat array of values
	 */
	setValues: function(values) {
		try {
			this._elems.each(function(elem) {
				elem.input.set(values.contains(elem.value));
			});
			return values;
		} catch(e) {
			gx.util.Console('gx.bootstrap.Checklist->setValues', e.message);
			throw e;
		}
	},

	/**
	 * @method getValues
	 * @description Returns an array of all the checked boxes' values
	 * @param {string} key Aggregate by a specific key
	 */
	getValues: function(key) {
		try {
			var values = [];
			this._elems.each(function(elem) {
				if (elem.input.get()) {
					if (key == null)
						values.push(elem.value);
					else if (elem.value[key] != null)
						values.push(elem.value[key]);
				}
			});
			return values;
		} catch(e) {
			gx.util.Console('gx.bootstrap.Checklist->getValues', e.message);
			throw e;
		}
	},

	/**
	 * @method load
	 * @description Sends a request to the specified URL
	 * @param {string} url The URL to send the request to
	 * @param {object} data The request data
	 */
	loadFromURL: function(url, data, callback) {
		var root = this;
		try {
			this._elems = [];
			this._bg = '';
			this._display.tbody.empty();

			if (url == null) url = root.options.url;
			if (data == null) data = root.options.requestData;

			var req = new Request({
				'method': root.options.method,
				'url': url,
				'data': data,
				'onComplete': function() {
					root._display.frame.removeClass('loader');
				},
				'onSuccess': function(res) {
					try {
						var obj = root.options.decodeResponse(res);
						if (isArray(obj)) {
							root.set(obj);
							if (callback != null)
								callback(obj);
						} else {
							gx.util.Console('gx.bootstrap.Checklist->loadFromUrl', 'Invalid server answer: ' + res);
						}
					} catch(e) {
						gx.util.Console('gx.bootstrap.Checklist->loadFromUrl', e.message);
					}
				},
				'onRequest': function() {
					root._display.frame.addClass('loader');
				}
			});
			req.send();
		} catch(e) { gx.util.Console('gx.bootstrap.Checklist->loadFromUrl', e.message); }
	}
});
/**
 * @class gx.bootstrap.DataFilter
 * @description Client side data filtering.
 * @extends gx.core.Settings
 *
 * @param {object} display The root DOM element. Filters get adopt to this element.
 * @param {object} options
 *
 * @option {string|integer} elementWidth Default width for a filter element.
 *
 * @event filtered
 *
 */
gx.bootstrap.DataFilter = new Class({
	Extends: gx.ui.Container,

	Binds: [
		'clearFilter'
	],

	options: {
		elementWidth: '30%',
		notSelected: ' ',
		clearBtn: true
	},

	origin: null,
	filtered: null,

	filter: [],

	_theme: {
		root: 'gxBootstrapDataFilter form-inline'
	},

	initialize: function(display, options) {
		this.parent(display, options);
		this._ui.root.addClass(this._theme.root);

		this._ui.clear = new Element('div', {
			'style': 'clear:both;'
		});

		this._ui.clearBtn = new Element('button', {
			'class': 'btn btn-default',
			'type' : 'submit',
			'html': '<span class="glyphicon glyphicon-ban-circle"></span>'
		});

		this._ui.clearBtn.addEvent('click', this.clearFilter);

		this._ui.root.adopt(
			this.options.clearBtn ? this._ui.clearBtn : null,
			this._ui.clear
		);
	},

	addCustomElement: function(element) {
		element.inject(this._ui.clear, 'before');

		return this;
	},

	/**
	 * @method addSelectFilter
	 * @description Add a select field for filtering. Optiosn get created when calling this.initData().
	 * @param {string} label Placeholder element.
	 * @param {string|array|function} fields The fields from which we read the values for the options and will used to compare when filtering.
	 * @param {string|integer} width Width of the filter object. Default: this.options.elementWidth.
	 * @param {function} method The method used to compare. Has default method.
	 */
	addSelectFilter: function(identifier, label, fields, width, method) {
		var select = new Element('select', {
			'placeholder': label,
			'class': 'form-control'
		});

		if ( !width )
			width = this.options.elementWidth;

		if ( !method )
			method = this.selectFilter;

		var filter = {
			identifier : identifier,
			input      : select,
			fields     : typeOf(fields) != 'array' ? [fields] : fields,
			method     : method,
			type       : 'Select'
		};

		select.addEvent('change', function(event) {
			filter.value = event.target.get('value');
			this.doFilter();

		}.bind(this));

		var section = new Element('div' ,{
			'class': 'input-group',
			'styles': {
				'width': width
			}
		}).adopt(
			new Element('div', {'class': 'input-group-addon', 'html': label}),
			select
		);

		filter.section = section;
		section.inject(this._ui.clear, 'before');
		this.filter.push(filter);

		return this;
	},

	/**
	 * @method addFulltextFilter
	 * @description Add a input field for fulltext searching.
	 * @param {string|array|function} fields The fields which will used to search.
	 * @param {string} label Placeholder element or null for custom styling.
	 * @param {string|integer} width Width of the filter object. Default: this.options.elementWidth.
	 * @param {function} method The method used to compare. Has default method.
	 */
	addFulltextFilter: function(identifier, fields, label, width, method) {
		var input = new Element('input', {
			'placeholder': label,
			'class': 'form-control'
		});

		if ( !width )
			width = this.options.elementWidth;

		if ( !method )
			method = this.fulltextFilter;

		var filter = {
			identifier : identifier,
			input      : input,
			fields     : typeOf(fields) != 'array' ? [fields] : fields,
			method     : method,
			type       : 'Fulltext'
		};

		input.addEvent('keyup', function(event) {
			filter.value = event.target.get('value');
			//if ( filter.value.length < 3 )
			//	return filter.value = null;

			this.doFilter();

		}.bind(this));

		var section = new Element('div' ,{
			'class': 'input-group',
			'styles': {
				'width': width
			}
		});

		if ( label ) {
			section.adopt(
				new Element('div', {'class': 'input-group-addon', 'html': label}),
				input
			);
		} else {
			section.adopt(
				input,
				new Element('div', {'class': 'input-group-addon', 'html': '<span class="glyphicon glyphicon-search"></span>'})
			);
		}

		filter.section = section;
		section.inject(this._ui.clear, 'before');
		this.filter.push(filter);

		return this;
	},

	clearFilter: function() {
		this.filter.each(function(filter) {
			if ( filter.type == 'Select' ) {
				filter.input.selectedIndex = 0;

			} else if ( filter.type == 'Fulltext' ) {
				filter.input.set('value', '');
			}

			filter.value = null;

		}.bind(this));

		this.doFilter();
	},

	/**
	 * @method initData
	 * @description Initialize the data you want to filter. Call after adding the filter fields.
	 * @param {array} data The data you want to filter.
	 */
	initData: function(data) {
		this.origin = data;

		this.filter.each(function(filter) {
			var func = 'init' + filter.type + 'Filter';
			this[func](filter);

		}.bind(this));

		return this;
	},

	initSelectFilter: function(filter) {
		var trackedSelection = filter.input.selectedIndex;
		var values = {};

		this.origin.each(function(item, index) {
			for ( var i = 0; i < filter.fields.length; i++ ) {
				var field = filter.fields[i],
					label;

				if ( typeOf(field) == 'function' )
					field = field(item);
				else
					field = item[field];

				if ( typeOf(field) == 'object' ) {
					label = field.label;
					field = field.field;
				} else
					label = field;

				if ( values[field] == null )
					values[field] = label;
			}
		});

		var options = [];
		options.push(new Element('option', {
			'html': this.options.notSelected,
			'value': '',
			'selected': 'selected'
		}));
		Object.each(values, function(label, value) {
			options.push(new Element('option', {
				'html' : label,
				'value': value
			}));
		});

		filter.input
			.empty()
			.adopt(options);

		filter.input.selectedIndex = trackedSelection;
	},

	initFulltextFilter: function(filter) {

	},

	/**
	 * @method doFilter
	 * @description Filter data.
	 *
	 * @event filtered
	 */
	doFilter: function() {
		var root = this;
		this.filtered = Array.clone(this.origin);
		this.filter.each(function(filter) {
			if ( filter.value == null || filter.value == '' )
				return;

			root.filtered = root.filtered.filter(function(item, index) {
				var valid = false;
				for ( var i = 0; i < filter.fields.length; i++ ) {
					var value = filter.fields[i];

					if ( typeOf(value) == 'function' )
						value = value(item);
					else
						value = item[value];

					if ( typeOf(value) == 'object' )
						value = value.field;

					valid = filter.method(
						filter.value,
						value
					);

					if ( valid )
						break;
				}

				return valid;
			});
		});

		this.fireEvent('filtered', [this.filtered]);
		return this.filtered;
	},

	fulltextFilter: function(filterValue, fieldValue) {
		return new RegExp('.*' + filterValue + '.*', 'i').test(fieldValue);
	},

	selectFilter: function(filterValue, fieldValue) {
		return filterValue == fieldValue;
	},

	getFilter: function(identifier) {
		for ( var i = 0; i < this.filter.length; i++ ) {
			if ( this.filter[i].identifier == identifier )
				return this.filter[i];
		}

		return null;
	}
});
/**
 * @class gx.bootstrap.Field
 * @description Creates a single field for a gx.bootstrap.Field and gx.bootstrap.Form
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} label The title for the fieldset
 * @option {object} type The field type: text, password, file, checkbox, select
 * @option {object} default The default value
 * @option {string} description The field description
 * @option {string} hightlight The default highlight class (error, warning, success)
 * @option {array} horizontal Define this fields horizontal, false | bootstrap grid classes for label and input: ['col-md-2', 'col-md-6']
 * @option {array} hintpos Define the hint possition when using .setHintHiglights
 * @option {bool} highlighteffect Use effect for highlighting
 *
 * @event setValue
 */
gx.bootstrap.Field = new Class({

	gx: 'gx.bootstrap.Field',

	Extends: gx.ui.Container,

	options: {
		'label'           : '',
		'type'            : 'text',
		'description'     : '',
		'highlight'       : false,
		'default'         : null,
		'horizontal'      : ['col-md-3', 'col-md-9'],
		'hintpos'         : 'right',
		'highlighteffect' : false
	},

	_display: {},

	initialize: function(options) {
		var root = this;
		try {
			this.parent(new Element('div', {'class': 'form-group'}), options);

			this._display.label = new Element('label', {'class': 'control-label', 'for': '', 'html': this.options.label});
			if ( this.options.horizontal !== false ) {
				this._display.label.addClass(this.options.horizontal[0]);

			}

			// if form is not horizontal display hint highlight at label
			this._display.hint = this._display.label;

			this._display.highlight = new Element('span', {'class': 'help-block highlight'});
			this._display.description = new Element('span', {'class': 'help-block', 'html': this.options.description});
			this._display.root.adopt(this._display.label);

			this._display.controlwrapper = new Element('div');

			this.setField(this.options.type, options);
			this._display.hint.addClass('hint--fwidth hint--' + this.options.hintpos);
			this._display.controlwrapper.adopt(this._display.description, this._display.highlight);

		} catch(e) { gx.util.Console('gx.bootstrap.Field->initialize', e.stack); }
	},
	/**
	 * @method addFields
	 * @param {object} fields
	 */
	setLabel: function(label) {
		this._display.label.set('html', label);
	},

	setHelp: function(help) {
		this._display.description.setProperty('html', help);
	},
	/**
	 * @method addFields
	 * @param {string|element|object} field
	 * @param {object}
	 */
	setField: function(field, options) {
		if (this._display.field != null)
			return;

		var elem;

		var self = this;
		switch (typeOf(field)) {
			case 'element':
				this._display.field = field;
				this._type = 'element';
				elem = field;
				break;
			case 'string':
				this._type = field;
				switch (field) {
					case 'text':
					case 'password':
					case 'file':
					case 'checkbox':
					case 'string':
					case 'integer':
					case 'float':
						var inputType = field;
						if ( field == 'float' ||
							field == 'string' ||
							field == 'integer' )
							inputType = 'text';

						this._display.field = new Element('input', {'type': inputType});
						if (options['disabled'] != null)
							this._display.field.set('disabled', true);
						if (options['default'] != null)
							this._display.field.set('value', options['default']);
						if (options['checked'])
							this._display.field.checked = options['checked'];
						elem = this._display.field;

						if ( field == 'integer' )
							elem.addEvent('blur', function() {
								if(!/^\d*$/.test(this.get('value'))) {
									self.setHighlight('This field must be an integer!', 'error');

								} else {
									self.setHighlight();
								}
							});

						else if ( field == 'float' )
							elem.addEvent('blur', function() {
								if(!/^(\d+((\.|\,)\d+)?)*$/.test(this.get('value'))) {
									self.setHighlight('This field must be a floating point!', 'error');

								} else {
									self.setHighlight();
								}
							});

						break;
					case 'textarea':
						this._display.field = new Element('textarea');
						if (options['default'] != null)
							this._display.field.setProperty('html', options['default']);

						elem = this._display.field;
						break;
					case 'select':
						this._display.field = new Element('select');
						switch (typeOf(options.options)) {
							case 'array':
								options.options.each(function(opt) {
									var optElem = new Element('option', {'value': opt, 'text': opt});
									if (options['default'] != null && options['default'] == opt)
										optElem.setProperty('selected', 'selected');
									this._display.field.adopt(optElem);
								}.bind(this));
								break;
							case 'object':
								var option;
								for ( var key in options.options) {
									option = new Element('option', {'html': options.options[key], 'value': key});
									if (options['default'] != null && options['default'] == key)
										option.setProperty('selected', 'selected');

									this._display.field.adopt(option);
								}
								break;
						}
						elem = this._display.field;
						break;
					case 'optionlist':
						this._display.field = new Element('div');
						var def = options['default'] == null ? null : options['default'];
						switch (typeOf(options.options)) {
							case 'array':
								options.options.each(function(opt) {
									this._display.field.adopt(__({'children': [
										{'tag': 'input', 'name': options.id, 'type': 'radio', 'id': 'radiobtn', 'value': opt, 'checked': opt == def},
										' ' + opt
									]}));
								}.bind(this));
								break;
							case 'object':
								for (key in options.options) {
									this._display.field.adopt(__({'children': [
										{'tag': 'input', 'name': options.id, 'type': 'radio', 'id': 'radiobtn', 'value': key, 'checked': key == def},
										' ' + options.options[key]
									]}));
								}
								break;
						}
						elem = this._display.field;
						break;
					case 'checklist':
						this._display.field = new gx.bootstrap.Checklist(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'date':
						options.orientation = 'right';
						delete options.label;
						this._display.field = new gx.bootstrap.DatePicker(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'month':
						this._display.field = new gx.bootstrap.MonthPicker(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'time':
						this._display.field = new gx.bootstrap.Timebox(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'gxselect':
						delete options.label;
						this._display.field = new gx.bootstrap.Select(null, options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'multivalueeditor':
						this._display.field = new gx.bootstrap.MultiValueEditor(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'editor':
						this._display.field = new gx.bootstrap.Editor(null, options.options == null ? options : options.options);
						elem = $(this._display.field);
						this._type = 'gx';
						break;
					case 'html':
						elem = options.content == null ? new Element('div') : options.content;
						break;
				}
				break;
			case 'class':
				if ( options.options != null ) {
					field = new field(null, options.options);
				} else {
					field = new field(null, options);
				}

			case 'object':
				if (instanceOf(field, gx.ui.Container) && typeOf(field.display) == 'function') {
					this._display.field = field;
					this._type = 'gx';
					elem = $(field);
				}

				if ( this.options.value != null )
					this.setValue(this.options.value);
				break;
			default:
				return;
		}

		/*
		elem.getElements('textarea').addClass('form-control');
		elem.getElements('select').addClass('form-control');
		elem.getElements('input').addClass('form-control');
		*/
		var t = elem.get('tag');
		if ( t == 'textarea' || t == 'select' || t == 'input' )
			elem.addClass('form-control');

		if ( options != undefined && options.disabled != undefined )
			this.setDisabled(options.disabled);

		elem = this._display.controlwrapper.adopt(elem);

		if ( this.options.horizontal !== false ) {
			this._display.hint = this._display.controlwrapper;
			this._display.controlwrapper.addClass(this.options.horizontal[1]);
		}

		elem.inject(this._display.root);
	},
	/**
	 * @method getValue
	 * @description Get the current field value
	 * @return {string|bool|null}
	 */
	getValue: function() {
		switch (this._type) {
			case 'element':
			case 'text':
			case 'password':
			case 'file':
			case 'select':
			case 'textarea':
			case 'string':
			case 'integer':
			case 'float':
				return this._display.field.get('value');
			case 'optionlist':
				var selection;
				this._display.field.getElements('input').each(function(opt) {
					if (opt.checked)
						selection = opt.get('value');
				});
				return selection;
			case 'checkbox':
				return this._display.field.get('checked');
			case 'multivalueeditor':
				return this._display.field.getValue();
			case 'object':
			case 'gx':
			case 'editor':
				if (typeOf(this._display.field.getValue) == 'function')
					return this._display.field.getValue();
				if (typeOf(this._display.field.getValues) == 'function')
					return this._display.field.getValues();
				if (typeOf(this._display.field.get) == 'function')
					return this._display.field.get();
			default:
				return null;
		}
	},
	setDisabled: function(enable) {
		switch (this._type) {
			case 'element':
			case 'text':
			case 'password':
			case 'file':
			case 'select':
			case 'textarea':
			case 'checkbox':
			case 'multivalueeditor':
				this._display.field.disabled = enable;
				break;
			case 'optionlist':
				var selection;
				this._display.field.getElements('input').each(function(opt) {
					opt.disabled = enable;
				});
				break;
			case 'object':
			case 'gx':
				if (typeOf(this._display.field.disabled) == 'boolean')
					this._display.field.disabled = enable;
				if (typeOf(this._display.field.setDisabled) == 'function')
					this._display.field.setDisabled(enable);
				break;
		}
		return this;
	},
	/**
	 * @method setHighlight
	 * @description Get the current field value
	 * @param {stirng|bool} label The highlight description. If none set, the highlight will be removed
	 * @param {string} type The highlight class: error, success, warning*
	 * @return {string|bool}
	 */
	setHighlight: function(label, type) {
		this._display.root.removeClass('has-error');
		this._display.root.removeClass('has-success');
		this._display.root.removeClass('has-warning');

		var root = this;
		if (label == null || label === false || label == '') {
			if ( this.options.highlighteffect )
				(function() {
					root._display.highlight.removeClass('visible');
				}).delay(200);
			else
				root._display.highlight.removeClass('visible');

		} else {
			this._display.highlight.set('html', label);
			this._display.highlight.addClass('visible');

		}

		if (type != null) {
			switch (type) {
				case 'error':
				case 'success':
				case 'warning':
					if ( this.options.highlighteffect )
						(function() {
							root._display.root.addClass('has-' + type);
						}).delay(10);
					else
						root._display.root.addClass('has-' + type);

					break;
			}
		}

		return this;
	},
	/**
	 * @method setHintHighlight
	 * @description Highlight with the hint framework
	 * @param {stirng|bool} label The highlight description. If none set, the highlight will be removed
	 * @param {string} type The highlight class: error, success, warning*
	 * @return {string|bool}
	 */
	setHintHighlight: function(label, type) {
		this._display.root.removeClass('has-error');
		this._display.root.removeClass('has-success');
		this._display.root.removeClass('has-warning');

		var field = this._display.hint;
		field.removeClass('hint--always');
		field.removeClass('hint--error');
		field.removeClass('hint--success');
		field.removeClass('hint--warning');

		if (label == null || label == '' ) {
			if ( this.options.highlighteffect )
				(function() {
					field.erase('data-hint');
				}).delay(200);
			else
				field.erase('data-hint');

			return;
		}

		field.addClass('hint--' + type);
		this._display.root.addClass('has-' + type);
		field.set('data-hint', label);

		if ( this.options.highlighteffect )
			(function() {
				field.addClass('hint--always');
			}).delay(1);
		else
			field.addClass('hint--always');

		return this;

	},
	/**
	 * @method setValue
	 * @description Sets a single form value
	 * @param {mixed} value
	 */
	setValue: function(value) {
		switch (this._type) {
			case 'text':
			case 'password':
			case 'textarea':
				this._display.field.set('value', value);
				break;
			case 'select':
				var opt, i, opts = this._display.field.options;
				for ( i = 0; i < opts.length; i++ ) {
					if ( value == opts[i].get('value') ) {
						opts[i].selected = true;
						break;
					}
				}
				break;
			case 'checkbox':
				this._display.field.checked = value ? true : false;
				break;
			case 'optionlist':
				this._display.field.getElements('input').each(function(ipt) {
					if (ipt.get('value') == value)
						ipt.set('checked', true);
					else
						ipt.erase('checked');
				});
				break;
			case 'gx':
			case 'editor':
				if (typeOf(this._display.field.setValue) == 'function')
					this._display.field.setValue(value);
				else if (typeOf(this._display.field.setValues) == 'function')
					this._display.field.setValues(value);
				else if (typeOf(this._display.field.set) == 'function')
					this._display.field.set(value);
				break;
			default:
				if (this._display.field != null && this._display.field.get != null) {
					switch(this._display.field.get('tag')) {
						case 'input':
						case 'select':
							this._display.field.set('value', value);
							break;
					}
				}
				break;
		}

		this.fireEvent('setValue', [value]);

		return this;
	},
	/**
	 * @method reset
	 * @description Resets the form value
	 */
	reset: function() {
		if (typeOf(this._display.field.reset) == 'function')
			this._display.field.reset();
		else if (this.options['default'] != null )
			this.setValue(this.options['default']);
		else
			this.setValue();
	},

	getInput: function () {
		return this._display.field;
	},

	focus: function() {
		if (typeOf(this._display.field.focus) == 'function' || typeOf(this._display.field) == 'element')
			this._display.field.focus();
	}

});
/**
 * @class gx.bootstrap.FieldImgUpload
 * @description Creates a image upload field. Images has fixed height and width. Returned value always null. Handle saving by upload form server side!
 * @extends gx.bootstrap.Field
 *
 * @param {object} options The options.
 *
 * @option {string} position 'regular' | 'large' for large sizes! | 'small' for small sizes
 * @option {integer} height
 * @option {integer} width
 * @option {string} inputname The form input name of the file send.
 * @option {string} uploadurl Upload url.
 * @option {object} params Alternative request parameters.
 * @option {string} imageurl Url to display the uploaded image.
 * @option {string} placeholder Url for a placeholder image.
 * @option {integer} finishdelay How long show green finished styling (error, success).
 * @option {function} showError Function to show errors. Defaults to show error by field highlighting.
 * @option {function} parseResponse Function to parse the upload request response.
 */
gx.bootstrap.FieldUpload = new Class({
	Extends: gx.bootstrap.Field,

	options: {
		position: 'regular',
		height: 60,
		width: 60,
		inputname: 'upload',

		uploadurl: './index.php',
		params: {},
		imageurl: '',
		placeholder: null,
		finishdelay: 2000,

		disabledMessage: 'Disabled',
		hintpos: 'bottom',

		showError: function(self, error) {
			self.error(error);
			console.log('gx.bootstrap.FieldImgUpload: Upload error', error);
		},

		parseResponse: function(self, response, callback) {
			var res;
			try {
				res = JSON.decode(response);
			} catch (e) {
				self.options.showError(self, 'Could not parse server response: ' + response);
				return;
			}

			if (res.error != null) {
				self.options.showError(self, res.error);

			} else {
				callback(res.result);
			}

		}
	},

	running: false,
	disabled: false,

	initialize: function(options) {
		if ( options.type == null )
			options.type = new Element('div');

		this.parent(options);

		this.create();
	},

	/**
	 * @method create
	 * @description Create the dom elements.
	 */
	create: function() {
		this._ui.root.addClass('gxBootsrapImgUpload ' + this.options.position);

		// adopt our controls on bottom of the help-block
		this._display.controlwrapper.adopt(this.options.type);

		var root = this;
		// will be invisible. this is for the clicking
		this._ui.select = __({
			'tag'     : 'input',
			'type'    : 'file',
			'title'   : 'Drop File or Click',
			'styles': {
				'height': this.options.height,
				'width': this.options.width
			},
			'onChange': function(){
				root.processFiles(this.files);
			},
			'onClick': function() {
				if ( root.running )
					return false;

				if ( root.disabled ) {
					root.displayDisabled();
					return false;
				}

				return true;
			}
		});

		this._ui.progressText = new Element('span', {
			'class': '',
			'html': '40 / 100'
		});
		this._ui.progressAbort = new Element('span', {
			'class': 'glyphicon glyphicon-remove',
			'events': {
				'click': this.abort.bind(this)
			}
		});
		this._ui.progress = new Element('div', {
			'class': 'progress-bar',
			'style': 'width: 40%;'
		});

		this._ui.image = new Element('div', {
			'class': 'image',
			'styles': {
				'height': this.options.height,
				'width': this.options.width
			}
		});

		this._ui.placeholder = new Element('img', {
			'class': 'placeholder',
			'src': ''
		});

		this._ui.image.adopt(
			this._ui.placeholder,
			new Element('div.textprogress').adopt(
				new Element('div.blend'),
				this._ui.progressText,
				this._ui.progressAbort,
				new Element('div.progress').adopt(
					this._ui.progress
				)
			),
			this._ui.select // must be on top!
		);

		if ( this.options.placeholder )
			this._ui.placeholder.setStyle('background-image', 'url(' + this.options.placeholder + ')');

		this.injectImageArea(this._ui.image);

		this.initDrop(this._ui.image);

		if ( this.options.default )
			this.setValue(this.options.default);
	},

	/**
	 * @method injectImageArea
	 * @description Create the dom elements. Supposed to override from clients for additional positioning
	 * @param {element} area The image area element
	 */
	injectImageArea: function(area) {
		if ( this.options.position == 'regular' || this.options.position == 'small' ) {
			area.inject(this._display.field);
			return;

		} // else if (this.options.position == 'wide')

		// inject into empty div to get absolute position relative to body content
		// and inject this absolute div inside a clearing floating div to get
		// positioning on the bottom of the label, description and highlighting
		new Element('div', {
			'styles': {
				'clear'   : 'both'
			}
		}).adopt(
			new Element('div', {
				'styles': {
					'position': 'absolute',
					'left'    : '0px'
				}
			}).adopt(area)

		).inject(this._display.root);

	},

	initDrop: function(area) {
		var root = this;
		area.ondragover = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.addClass('access');
			return false;
		};
		area.ondragenter = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.addClass('access');
			return false;
		};
		area.ondragleave = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.removeClass('access');
			return false;
		};
		area.ondragend = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.removeClass('access');
			return false;
		};
		area.ondrop = function(event) {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			event.stopPropagation();
			event.preventDefault();

			if ( root.running )
				return;

			area.removeClass('access');
			root.processFiles(event.dataTransfer.files);
		};

	},

	/**
	 * @method processFiles
	 * @description Upload the selected files via ajax.
	 * @param File[] files Array of files to get uploaded.
	 **/
	processFiles: function(files) {
		var formData = new FormData();

		this.setActive();

		var file = files[0];
		formData.append(this.options.inputname, file);
		for ( var key in this.options.params )
			if ( this.options.params.hasOwnProperty(key) )
				formData.append(key, this.options.params[key]);

		var self = this;
		this.xhr = new XMLHttpRequest();
		this.xhr.open('POST', this.options.uploadurl);
		this.xhr.onload = function() {
			if ( this.status != 200 ) {
				self.options.showError(self, 'Invalid load status: ' + this.status);
				return;
			}

			self.progress(100);
			self.options.parseResponse(self, this.responseText, function(response){
				self.setImage(response);
				self.finish();

			});
		};

		this.xhr.onerror = function(event) {
			self.options.showError(self, 'Error: ' + res.error);
		};

		this.xhr.upload.onprogress = function (event) {
			if (event.lengthComputable) {
				var complete = (event.loaded / event.total * 100 | 0);
				self.progress(complete);
			}
		};
		this.xhr.send(formData);
	},
	/**
	 * @method setActive
	 * @description Show progress and set running true. Disable drop and click event.
	 **/
	setActive: function() {
		this.running = true;
		this.setHighlight();
		this._ui.progress.removeClass('progress-bar-success');
		this._ui.progress.removeClass('progress-bar-danger');
		this._ui.progress.removeClass('progress-bar-warning');
		this._ui.progress.setStyle('width', '0%');
		this._ui.image.addClass('active');
		this._ui.progressAbort.show();
	},
	/**
	 * @method abort
	 * @description Abort current upload.
	 **/
	abort: function() {
		if ( this.xhr )
			this.xhr.abort();

		this._ui.progressAbort.hide();
		this.setHighlight('', 'warning');
		this._ui.progress.addClass('progress-bar-warning');
		(function() {
			this.setHighlight();
			this._ui.progress.removeClass('progress-bar-warning');
			this._ui.image.removeClass('active');

		}.bind(this)).delay(this.options.finishdelay);

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method error
	 * @description Display error width field highlighting
	 **/
	error: function(error) {
		this.setHighlight(error, 'error');
		this._ui.progress.addClass('progress-bar-danger');
		this._ui.progressAbort.hide();

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method finish
	 * @description Finish successful upload. Activating drop and click events, hiding progress
	 **/
	finish: function() {
		this.setHighlight('', 'success');
		this._ui.progress.addClass('progress-bar-success');
		this._ui.progressAbort.hide();
		(function() {
			this.setHighlight();
			this._ui.progress.removeClass('progress-bar-success');
			this._ui.image.removeClass('active');

		}.bind(this)).delay(this.options.finishdelay);

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method progress
	 * @description Update progress visualization.
	 **/
	progress: function(percent) {
		this._ui.progress.setStyle('width', percent+'%');
		this._ui.progressText.set('html', percent+'%');
	},
	/**
	 * @method setValue
	 * @description Set image. Maybe be subclassed from clients for specific functionality.
	 **/
	setValue: function(src) {
		this.setImage(src);
	},
	getValue: function() {
		// no value cause handled by the php upload form!
		return null;
	},
	/**
	 * @method setImage
	 * @description Set the src attribute of the image placeholder.
	 **/
	setImage: function(src) {
		this._ui.placeholder.set('src', this.options.imageurl + src);
	},
	reset: function(){},

	setDisabled: function(disable) {
		this.disabled = disable;
		if ( this.disabled )
			this._ui.root.addClass('disabled');
		else
			this._ui.root.removeClass('disabled');
	},

	displayDisabled: function() {
		this.setHighlight(this.options.disabledMessage, 'warning');

		(function() {
			this.setHighlight();
		}).delay(2000, this);
	}
});/**
 * @class gx.bootstrap.Fieldset
 * @description Creates a fieldset
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} title The title for the fieldset
 * @option {object} fields The list of fields
 * @option {object} actions All action items & buttons
 * @option {array} horizontal Define this fields horizontal, false | bootstrap grid classes for label and input: ['col-md-2', 'col-md-6']
 * @option {boolean} columns Display the fields 2 columned
 * @option {bool} highlighteffect Use effect for highlighting
 */
gx.bootstrap.Fieldset = new Class({

	gx: 'gx.bootstrap.Fieldset',

	Extends: gx.ui.Container,

	options: {
		'size'            : 'regular',
		'title'           : null,
		'value'           : false,
		'horizontal'      : ['col-md-3', 'col-md-9'],
		'columns'         : false,
		'hintpos'         : 'right',
		'highlighteffect' : true
	},

	_theme: {
		horizontal: 'form-horizontal',
		columns: 'form-columns'
	},

	_fields: {},

	_currentcolumn: 0,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display == null ? new Element('fieldset') : display, options);

			if ( this.options.horizontal !== false )
				this._ui.root.addClass(this._theme.horizontal);

			if ( this.options.title != null )
				this._ui.root.adopt(new Element('legend', {'html': this.options.title}));

			this.initColumns(this.options.columns);
			this._ui.root.addClass(this._theme.columns);

			if ( typeOf(this.options.fields) == 'object' )
				this.addFields(this.options.fields);

		} catch(e) { gx.util.Console('gx.bootstrap.Fieldset->initialize', e.stack); }
	},

	initColumns: function(columns) {
		if ( !(typeof columns == 'number') )
			columns = 1;

		this._ui.columns = [];
		for ( var i = 0; i < columns; i++ ) {
			var column = new Element('div', {
				'class': 'column',
				'styles': {
					'float': 'left',
					'width': (100 / columns) + '%'
				}
			});

			this._ui.columns.push(column);
			this._ui.root.adopt(column);
		}

		this.options.columns = columns;
	},

	clear: function () {
		for (var i in this._fields) {
			if ( this._fields.hasOwnProperty(i) &&
				(this._fields[i] instanceof gx.bootstrap.Field) )
				$(this._fields[i]).destroy();
				delete this._fields[i];
		}

		this._fields = {};
	},

	hasField: function (id) {
		return ( this._fields[id] !== undefined );
	},

	/**
	 * @method addFields
	 * @param {object} fields
	 */
	addFields: function (fields) {
		for (id in fields) {
			if ( (fields[id] instanceof Element) || (fields[id] instanceof gx.ui.Container) )
				this.addFieldItem(id, fields[id]);

			else if ( typeOf(fields[id]) == 'object' && instanceOf(fields[id], gx.bootstrap.Field) )
				this.addFieldItem(id, fields[id]);

			else if ( fields[id].type != null )
				this.addField(id, fields[id].type, fields[id]);

			else if ( fields[id].field != null )
				this.addField(id, fields[id].field, fields[id]);
		}
	},

	addFieldItem: function (id, field) {
		if ( this.hasField(id) )
			throw new Error('Field "'+id+'" already exists.');

		this._fields[id] = field;
		this._ui.columns[this._currentcolumn].adopt($(field));
		this.nextColumn();
		return field;
	},

	nextColumn: function() {
		if ( this.options.columns == 1 )
			return;

		this._currentcolumn++;
		if ( this._currentcolumn == this.options.columns )
			this._currentcolumn = 0;
	},

	/**
	 * @method addField
	 * @param {String} id
	 * @param {String} type
	 * @param {Object} options
	 * @returns Returns the {@link gx.bootstrap.Field} object.
	 * @type gx.bootstrap.Field
	 */
	addField: function (id, type, options) {
		if ( options == null )
			options = {};

		if ( options.horizontal == null )
			options.horizontal = this.options.horizontal;

		if ( options.hintpos == null )
			options.hintpos = this.options.hintpos;

		if ( options.highlighteffect == null )
			options.highlighteffect = this.options.highlighteffect;

		return this.addFieldItem(id, new gx.bootstrap.Field(Object.merge(options || {}, {'id': id, 'type': type})));
	},

	/**
	 * @method getValue
	 * @param {string} fieldid The field ID
	 * @returns
	 */
	getValue: function (fieldid) {
		return (this._fields[fieldid] == null || this._fields[fieldid].getValue == undefined) ? null : this._fields[fieldid].getValue();
	},

	/**
	 * @method getValues
	 * @returns {object}
	 */
	getValues: function () {
		var values = {};
		var value;
		for (id in this._fields) {
			if ( String(id).substr(0, 2) != '__' )
				values[id] = this.getValue(id);
		}

		return values;
	},

	/**
	 * @method reset
	 * @description Resets all form fields
	 */
	reset: function () {
		for (id in this._fields)
			if (this._fields[id].reset != null)
				this._fields[id].reset();
	},

	/**
	 * @method focus
	 * @description Gets a single field object
	 * @param fieldid
	 */
	focus: function (fieldid) {
		if (this._fields[fieldid] != null)
			this._fields[fieldid].focus();
	},

	/**
	 * @method getField
	 * @description Gets a single field object
	 * @param fieldid
	 * @returns {object} The field object {field, frame, controls, type}
	 */
	getField: function (fieldid) {
		return this._fields[fieldid];
	},

	/**
	 * @method getFields
	 * @description Returns all fields
	 * @param {object} value
	 */
	getFields: function() {
		return this._fields;
	},

	/**
	 * @method setValue
	 * @description Sets a single form value
	 * @param {string} fieldid The field ID
	 * @param {mixed} value
	 */
	setValue: function (fieldid, value) {
		if ( this._fields[fieldid] != null ) {
			this._fields[fieldid].setValue(value);
		}
	},

	/**
	 * @method setValues
	 * @description Sets multiple form values
	 * @param {object} values
	 */
	setValues: function (values) {
		for (fieldid in values)
			this.setValue(fieldid, values[fieldid]);
	},

	/**
	 * @method setHighlights
	 * @description Sets the highlights for all fields
	 * @param {object} highlights The highlight properties {fieldid: STRING:message|OBJECT:{label, type}|false, ...}
	 * @param {string} type The default highlight type
	 * @return {int} Number of active highlights
	 */
	setHighlights: function (highlights, type) {
		if ( highlights == null )
			highlights = {};

		var count = 0;

		for (id in this._fields) {
			if (this._fields[id].setHighlight != null) {
				switch (typeOf(highlights[id])) {
					case 'string':
					case 'boolean':
						this._fields[id].setHighlight(highlights[id], type)
						count++;
						break;
					case 'object':
						this._fields[id].setHighlight(highlights[id].label, highlights[id].type);
						count++;
						break;
					default:
						this._fields[id].setHighlight();
						break;
				}
			}
		}

		return count;
	},
	setHintHighlights: function (highlights, type) {
		if ( highlights == null )
			highlights = {};

		var count = 0;

		for (id in this._fields) {
			if (this._fields[id].setHintHighlight != null) {
				switch (typeOf(highlights[id])) {
					case 'string':
					case 'boolean':
						this._fields[id].setHintHighlight(highlights[id], type)
						count++;
						break;
					case 'object':
						this._fields[id].setHintHighlight(highlights[id].label, highlights[id].type);
						count++;
						break;
					default:
						this._fields[id].setHintHighlight();
						break;
				}
			}
		}

		return count;
	}

});
/**
 * @class gx.bootstrap.Form
 * @description Creates a fieldset
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} title The title for the primary fieldset
 * @option {object} fields The list of fields
 * @option {object} actions All action items & buttons
 * @option {array} horizontal Define this fields horizontal, false | bootstrap grid classes for label and input: ['col-md-2', 'col-md-6']
 * @option {boolean} columns Display the fields 2 columned
 * @option {bool} highlighteffect Use effect for highlighting
 */
gx.bootstrap.Form = new Class({
	gx: 'gx.bootstrap.Form',
	Extends: gx.ui.Container,
	options: {
		'size': 'regular',
		'label': '',
		'value': false,
		'horizontal' : ['col-md-3', 'col-md-9'],
		'columns' : false,
		'hintpos' : 'right',
		'highlighteffect' : true
	},

	_fieldsets: [],
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display == null ? new Element('form') : display, options);

			if (typeOf(this.options.fields) == 'object') {
				this.addFieldset({'fields': this.options.fields, 'title': this.options.title});
			}

			if (this.options.actions != null)
				this.addActions(this.options.actions);

		} catch(e) { gx.util.Console('gx.bootstrap.Form->initialize', e.message); }
	},

	/**
	 * @method Add the action bar
	 * @param content
	 * @return {void}
	 */
	addActions: function(content) {
		if (this._ui.actions == null) {
			this._ui.actions = new Element('div', {'class': 'form-actions'});
			this._ui.actions.adopt(new Element('div.clear'));
			this._ui.root.adopt(this._ui.actions);
		}

		switch (typeOf(content)) {
			case 'array':
				content.each(function(c) {
					__(c).inject(this._ui.actions, 'top');
				}.bind(this));
				break;
			case 'element':
				content.inject(this._ui.actions, 'top');
				break;
			default:
				__(content).inject(this._ui.actions, 'top');
				break;
		}
	},
	/**
	 * @method addFieldset
	 * @param {gx.bootstrap.Fieldset} fieldset
	 * @return gx.bootstrap.Fieldset
	 */
	addFieldset: function(fieldset) {
		if ( fieldset.horizontal == null )
			fieldset.horizontal = this.options.horizontal;

		if ( fieldset.columns == null )
			fieldset.columns = this.options.columns;

		if ( fieldset.hintpos == null )
			fieldset.hintpos = this.options.hintpos;

		if ( fieldset.highlighteffect == null )
			fieldset.highlighteffect = this.options.highlighteffect;

		if (typeOf(fieldset) == 'object') {
			if (!instanceOf(fieldset, gx.bootstrap.Fieldset))
				fieldset = new gx.bootstrap.Fieldset(null, fieldset);
		}

		this._fieldsets.push(fieldset);

		if (this._ui.actions == null)
			this._ui.root.adopt($(fieldset));
		else
			$(fieldset).inject(this._ui.actions, 'before');

		return fieldset;
	},
	/**
	 * @method getValue
	 * @description Get the value from the fieldsets
	 * @param field
	 * @returns
	 */
	getValue: function(field) {
		var value;
		for (var i = 0, l = this._fieldsets.length; i < l; i++) {
			value = this._fieldsets[i].getValue(field);
			if (value != null)
				return value;
		}

		return null;
	},
	/**
	 * @method getValues
	 * @returns {object}
	 */
	getValues: function() {
		var values = {};
		this._fieldsets.each(function(fs) {
			values = Object.merge(values, fs.getValues());
		});

		return values;
	},
	/**
	 * @method getField
	 * @description Gets a single field object
	 * @param fieldid
	 * @returns {object} The field object {field, frame, controls, type}
	 */
	getField: function(fieldid) {
		var field;
		this._fieldsets.each(function(fs) {
			if (field)
				return;
			field = fs.getField(fieldid);
		});
		return field;
	},
	/**
	 * @method getFieldsets
	 * @description Gets all fieldsets
	 * @returns {array}
	 */
	getFieldsets: function() {
		return this._fieldsets;
	},
	/**
	 * @method setValue
	 * @description Sets a single form value
	 * @param {string} fieldid
	 * @param {mixed} value
	 */
	setValue: function(fieldid, value) {
		this._fieldsets.each(function(fs) {
			if (fs.getField(fieldid) != null)
				fs.setValue(fieldid, value);
		});
	},
	/**
	 * @method setValues
	 * @description Sets multiple form values
	 * @param {object} values
	 */
	setValues: function(values) {
		this._fieldsets.each(function(fs) {
			fs.setValues(values);
		});
	},
	/**
	 * @method setHighlights
	 * @description Sets the highlights for all fields
	 * @param {object} highlights The highlight properties {fieldid: message|object|false, ...}
	 * @param {string} type The default highlight type
	 * @return {int} Number of active highlights
	 */
	setHighlights: function(highlights, type) {
		var count = 0;

		this._fieldsets.each(function(fs) {
			count += fs.setHighlights(highlights, type);
		});

		return count;
	},
	setHintHighlights: function(highlights, type) {
		var count = 0;

		this._fieldsets.each(function(fs) {
			count += fs.setHintHighlights(highlights, type);
		});

		return count;
	},
	/**
	 * @method reset
	 * @description Reset all form fields
	 */
	reset: function() {
		this._fieldsets.each(function(fs) {
			fs.reset();
			fs.setHighlights();
			fs.setHintHighlights();
		});
	}
});
/**
 * @class gx.bootstrap.Grid
 * @description Helper class to create easy bootstrap grids (container-fluid).
 * @extends gx.core.Settings
 *
 */
gx.bootstrap.Grid = new Class({
  Extends: gx.core.Settings,

  AT_ROOT: 1,
  AT_ROW: 2,
  AT_CELL: 3,

  options: {
    classes: ['md'], // Can be array of one or more of 'xs' | 'sm' | 'md' | 'lg' (bootstrap)
    rowLength: 12,
    automatedRows: true,
    nested: false,
  },

  /*
  isAt: null,
  rowLength: null,
  current: null,
  */
  parentGrid: null,
  initialize: function(display, options, parentGrid) {
    this.parentGrid = parentGrid;

    if ( typeof options === 'string' )
      options = {classes: [options]};

    this.parent(options);

    if ( typeof this.options.classes === 'string' )
      this.options.classes = [this.options.classes];

    this.parseClasses(this.options.classes);

    if ( !display )
      display = new Element('div');

    if ( this.options.nested !== true )
      display.addClass('container-fluid');

    this.root = display;

    this.isAt = this.AT_ROOT;
    this.current = this.root;
    this.options.rowLength = parseInt(this.options.rowLength);
    this.rowLength = this.options.rowLength;
  },

  toParent: function() {
    return this.parentGrid;
  },

  grid: function(display, options) {
    if ( typeof options === 'string' )
      options = {classes: [options]};

    var nestedGrid = new gx.bootstrap.Grid(display, Object.merge({}, this.options, {nested: true}, options || {}), this);
    this.current.adopt(nestedGrid);

    return nestedGrid;
  },

  row: function() {
    var parent = this.current;

    if ( this.isAt === this.AT_CELL )
      parent = this.root;
    else if ( this.isAt === this.AT_ROW )
      parent = parent.getParent();

    this.current = new Element('div.row');
    this.isAt = this.AT_ROW;
    this.rowLength = 0;

    parent.adopt(this.current);
    return this;
  },

  /**
   * Get current row or create one if none exists.
   * @return {Element}
   */
  currentRow: function() {
    if ( this.isAt === this.AT_CELL )
      return this.current.getParent();
    else if ( this.isAt === this.AT_ROW )
      return this.current;

    return this.row();
  },

  /**
   * Allowing various notions for grid columns classes and width. Like:
   * (3, '4:xs', '5', 'xs:6')
   * =>
   *
   * [3]
   * [4, "xs"]
   * ["5"]
   * [6, "xs"]
   *
   * @param  {[type]} arg
   * @return {[type]}
   */
  parseCellClassesFromPrimitive: function(arg) {
    if ( typeof arg === 'number' )
      return [arg];

    var s = String(arg).split(':');
    var l = s[0];
    var r = s[1];

    if ( !r )
      return [l];

    var lp = parseInt(l);
    if ( !Number.isNaN(lp) ) {
      return [lp, r];
    }

    return [
      parseInt(r),
      l,
    ];
  },

  cell: function() {
    var cell = new Element('div');
    var arg, type, sizes = [], children = [];

    var i, l;

    if ( arguments.length > 0 ) {
      for ( i = 0, l = arguments.length; i < l; i++ ) {
        arg = arguments[i];
        type = typeof arg;
        if ( type === 'number' )
          sizes.push([arg]);
        else if ( type === 'string' )
          sizes.push(this.parseCellClassesFromPrimitive(arg));
        else {
          children.push(arg);
        }
      }
    }

    if ( children.length > 0 )
      cell.adopt(children);

    if ( sizes.length === 0 )
      sizes.push([this.options.rowLength - this.rowLength]);

    var size;
    for ( i = 0, l = sizes.length; i < l; i++ ) {
      size = sizes[i];
      this.applyClasses(size[0], cell, size[1] ? this.parseClasses(size[1]) : null);
    }

    size = sizes[0];

    if ( this.options.automatedRows && this.rowLength >= this.options.rowLength ) {
      this.row();
    }

    var parent = this.current;
    if ( this.isAt === this.AT_CELL )
      parent = parent.getParent();
    else if ( this.isAt === this.AT_ROOT )
      parent = this.row();

    this.isAt = this.AT_CELL;
    this.rowLength += parseInt(size);
    this.current = cell;

    parent.adopt(this.current);
    return this;
  },

  toElement: function() {
    return this.root;
  },

  applyClasses: function(size, element, classes) {
    var i = 0;
    classes = classes || this.options.classes;
    var l = classes.length;
    for ( ; i < l; i++ ) {
      element.addClass(classes[i] + size);
    }
  },

  parseClasses: function(classes) {
    if ( typeof classes === 'string' )
      return ['col-' + classes + '-'];

    classes.forEach(function(name, index) {
      classes[index] = 'col-' + name + '-';
    });

    return classes;
  }
});
/**
 * File providing general purpose html templates.
 *
 */
(function() {
  'use strict';

var arrSlice = Array.prototype.slice;

var Templates = gx.ui.Templates;

/**
 * Bootstrap icon
 *
 */
Templates.register('icon', function(e, d) {
  return e('span', '.=glyphicon glyphicon-' + d, arrSlice.call(arguments, 2));
});

/**
 * Bootstrap button
 *
 */
Templates.register('button', function(e, d) {
  if ( typeof d === 'string' )
    d = {type: d};

  return e(d.tag || 'button',

    d.label || '',
    '.=btn btn-' + (d.type || 'primary') + ' ' + (d.className || ''),
    d.ref ? ':=' + d.ref : null,
    arrSlice.call(arguments, 2)
  );
});


/**
 * Bootstrap panel.
 *

<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Panel title</h3>
  </div>
  <div class="panel-body">
    Panel content
  </div>
</div>

  */
Templates.register('panel', function(e, d) {
  var head = null;

  if ( d.head ) {
    head = e('div', '.=panel-heading',
      e('h3', '.=panel-title', d.head)
    );
  }

  return e('div', '.=panel panel-' + (d.type || 'default'),
    head,
    e('div', '.=panel-body',
      d.body || arrSlice.call(arguments, 2)
    )
  );
});

/**
 * Bootstrap form group.
 *
 * options {
 *    controlElement {Element} To provide your own form control element
 *    type {string} Form control element type
 *    ref {string} Id of the input element AND the value to store a reference to
 *        that very control: this._ui.inputField_myRefId
 *
 *    value
 *    label {string} Text string
 *    labelHtml {string} Html string
 *    placeholder
 *
 *    fullEmptyLabel {boolean} Add full with emtpy label. E.g. to properly
 *        place buttons in a horizontal form.
 * }
 *
 */
Templates.register('formGroup', function(e, d) {
  var id = d.ref || '';

  var label = e('label', '.=control-label', {'for': id});
  if ( d.label === false )
    label = null;
  else if ( d.label )
    label.appendText(String(d.label).htmlSpecialChars());
  else if ( d.labelHtml )
    label.set('html', d.labelHtml);

  if ( d.fullEmptyLabel )
    label.set('html', '&nbsp;').setStyle('width', '100%');

  var inputTag = 'input';
  if ( d.type === 'textarea' )
    inputTag = 'textarea';
  else if ( d.type === 'select')
    inputTag = 'select';

  var control;
  if ( d.controlElement ) {
    var obj = d.controlElement;
    control = $(d.controlElement);

  } else {
    control = e(inputTag,
      id ? ':=inputField_' + id : null,
      '.=form-control', {
      value: d.value || '',
      type: d.type || 'text',
      'placeholder': d.placeholder || '',
    });
  }

  if ( d.name )
    control.set('name', d.name);
  if ( d.id )
    control.set('name', d.id);
  if ( d.class )
    control.addClass(d.class);

  if (inputTag === 'select') {
    for ( var val in d.options ) {
      if ( !d.options.hasOwnProperty(val) )
        continue;

      control.adopt(e('option', d.options[val], {'value': val}));
    }
  }

  return e('div', '.=form-group',
    label,
    control,
    arrSlice.call(arguments, 2)
  );
});

})();
/**
 * @class gx.bootstrap.MenuButton
 * @description Creates a checkbox button
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} size The button size (regular, mini, large)
 * @option {string} label The button label
 * @option {array} entries The link entries
 * @option {string} orientation Horizontal orientation (left* | right)
 * @option {string} direction Vertial orientation (down* | up)
 *
 * @sample Datebox Simple datebox example.
 */
gx.bootstrap.MenuButton = new Class({
	gx: 'gx.bootstrap.MenuButton',
	Extends: gx.ui.Container,
	options: {
		'size': 'regular',
		'style': '',
		'label': '',
		'entries': [],
		'orientation': 'left',
		'direction': 'down'
	},
	class_checked: 'btn-success',
	class_unchecked: 'btn-warning',
	_checked: false,
	_style: false,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			
			var btn_class = 'dropdown-toggle btn' + ( this.options.size == 'regular' ? '' : (' btn-'+this.options.size ) );
			
			this._display.frame = new Element('div', {'class': 'btn-group'});
			this._display.button = new Element('button', {'class': btn_class});
			this._display.menu = new Element('ul', {'class': 'dropdown-menu'});
			
			
			if (this.options.direction == 'up')
				this._display.frame.addClass('dropup');
			if (this.options.orientation == 'right')
				this._display.menu.addClass('pull-right');
			
			this._display.frame.adopt([this._display.button, this._display.menu]);
			this._display.root.adopt(this._display.frame);
			
			if (this.options.style)
				this.setStyle(this.options.style);
			
			if (this.options.label)
				this.setLabel(this.options.label);
				
			if (typeOf(this.options.entries) == 'array')
				this.options.entries.each(function(label) {
					root.add(label);
				});
			
			this.setLabel(this.options.label);
		} catch(e) { gx.util.Console('gx.bootstrap.MenuButton->initialize', e.message); }
	},
	
	/**
	 * @method add
	 * @description Toggles between menu open and close
	 * @param {string|bool} label The element's label (If FALSE is used, a divider is added to the menu)
	 * @return {element} The link element
	 */
	add: function(label, icon) {
		if (!label) {
			this._display.menu.adopt(new Element('li', {'class': 'divider'}));
		} else {
			var link = new Element('a', {'html': (icon == null ? '' : '<i class="icon-'+icon+'"></i>') + label});
			this._display.menu.adopt(new Element('li').adopt(link));
			return link;
		}
	},
	
	/**
	 * @method toggle
	 * @description Toggles between menu open and close
	 */
	toggle: function() {
		this._display.frame.toggleClass('open');
	},
	
	/**
	 * @method open
	 * @description Opens the menu
	 */
	open: function() {
		this._display.frame.addClass('open');
	},
	
	/**
	 * @method close
	 * @description Closes the menu
	 */
	close: function() {
		this._display.frame.removeClass('open');
	},
	
	/**
	 * @method setLabel
	 * @description Sets the button's label
	 * @param {string} label
	 */
	setLabel: function(label) {
		this._display.button.set('html', label + '&nbsp;&nbsp;<span class="caret"></span>');
	},
	
	/**
	 * @method setStyle
	 * @description Sets the button's style class
	 * @param {string} style
	 */
	setStyle: function(style) {
		if (this._style)
			this._display.button.removeClass('btn-'+this_style);
		
		this._display.button.addClass('btn-'+style);
		this._style = style;
	}
});
/**
 * @class gx.bootstrap.Message
 * @description Displays a message box or status bar.
 * @extends gx.ui.Hud
 * @implements gx.com.Statusbar
 * @erquires Fx.Morph
 * @sample Message An example demonstrating message boxes and status bars.
 *
 * @param {string|node} display
 *
 * @option {int} messageWidth The width of the message
 * @option {float} opacity The opacity of the message
 * @option {int} duration The duration the message will stay
 * @option {bool} blend Apply a blend effect
 * @option {bool} fixed Set the message fixed
 * @option {string} x The x-value of the message's position
 * @option {string} y The y-value of the message's position
 */
gx.bootstrap.Message = new Class({
	Extends: gx.ui.Hud,
	options: {
		'messageWidth': 300,
		'opacity': 0.9,
		'duration': 3000,
		'blend': false,
		'fixed': true,
		'z-index': 120,
		'margintop': '50px',
		'x': 'center',
		'y': 'top'
	},
	initialize: function(display, options) {
		var root = this;
		this.parent(display, options);
		this._messages = new Array();
		this._display.windows = new Element('div', {'class': 'gx-bootstrap-message', 'styles': {
			'width': root.options.messageWidth,
			'margin-top': this.options.margintop,
			'position': 'absolute',
			'z-index': root.options['z-index']+1
		}});
		this.add('messages', this._display.windows, {'x': root.options.x, 'y': root.options.y}, root.options.fixed);
		this.show('messages');
	},

	/**
	 * @method addMessage
	 * @description Adds a Message
	 * @param {string} msg The message text
	 * @param {string} iconClass The icon class
	 * @param {bool} closable User can close the message
	 * @param {bool} blend Apply a blend effect
	 * @param {bool} autoclose Message will close automatically
	 */
	addMessage: function(msg, iconClass, closable, blend, autoclose) {
		var root = this;
		var elem = new Element('div', {
			'class': 'bs-message alert alert-'+(iconClass == null ? 'info' : iconClass),
			'styles': {
				'position': 'static',
				'opacity': 0,
				'z-index': root.options['z-index']+2
			}
		});

		if (closable != false) {
			var closeX = new Element('x', {'class': 'close', 'html': '×'})
			elem.adopt(closeX);
			closeX.addEvent('click', function() {
				root.closeMessage(elem);
			});
		}

		switch (typeOf(msg)) {
			case 'element':
			case 'elements':
			case 'textnode':
				elem.adopt(msg);
				break;
			case 'object':
				elem.adopt(__(msg));
				break;
			case 'string':
			case 'number':
				var fico_icon = 'info';
				switch (iconClass) {
					case 'error':
						fico_icon = 'warning';
						break;
					case 'success':
						fico_icon = 'check';
						break;
				}
				elem.adopt(new Element('div', {'class': 'bs-message-inner fico-'+fico_icon, 'html': msg}));
				// elem.set('html', msg);
				break;
		}

		this._display.windows.adopt(elem);
		var tween = new Fx.Morph(elem, {'duration': 'short'})
		if (blend == true) this.showBlend();
		tween.start({
			'opacity': root.options.opacity
		});
		this._messages.push(elem);
		if (root.options.duration > 0 && autoclose !== false)
			root.closeMessage.delay(root.options.duration, this, elem);
		return elem;
	},

	/**
	 * @method closeMessage
	 * @description Closes a message box
	 * @param {node} elem The message's element
	 */
	closeMessage: function(elem) {
		var root = this;
		var tween = new Fx.Morph(elem, {
			onComplete: function() {
				root._messages.erase(elem);
				elem.destroy();
				if (root._messages.length < 1)
					root.hideBlend();
			}
		});
		elem.setStyle('overflow', 'hidden');
		tween.start({
			'opacity': 0,
			'height': 0
		});
	},

	/**
	 * @method clear
	 * @description Removes all open message boxes
	 */
	clear: function() {
		var root = this;
		this._messages.each(function(elem) {
			root.closeMessage(elem);
		});
		this._messages = [];
		this.hideBlend();
	},

	/**
	 * @method showStatus
	 * @description Shows a status bar
	 * @param {float} progress The progress made
	 * @param {string} message The message to display
	 * @param {bool} blend Apply a blend effect
	 */
	showStatus: function(progress, message, blend) {
		if (this._display.status == null) {
			var stat = new Element('div', {'class': 'gx-bootstrap-message-status'});
			this._display.status = this.addMessage(stat, null, false, blend, false)
			this._statusbar = new gx.com.Statusbar(stat, {
				'message': message,
				'progress': progress
			});
		} else
			this.incProgress(progress, message);
	},

	/**
	 * @method hideStatus
	 * @description Hides the status bar
	 */
	hideStatus: function() {
		var root = this;
		if (this._display.status != null) {
			this.closeMessage(this._display.status);
			this._display.status = null;
			this._statusbar = null;
		}
	},

	/**
	 * @method incProgress
	 * @description Increases the progress of the status bar
	 * @param {float} progress The amount by which to increase the progress
	 * @param {string} message The message to display
	 */
	incProgress: function(progress, message) {
		if (this._statusbar != null)
			this._statusbar.incProgress(progress, message);
	},

	/**
	 * @method setProgress
	 * @description Sets the progress of the status bar
	 * @param {float} progress The progress to set
	 * @param {string} message The message to display
	 * @param {object} tween The tween
	 */
	setProgress: function(progress, message, tween) {
		if (this._statusbar != null)
			this._statusbar.setProgress(progress, message, tween);
	}
});
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
/**
 * @class gx.bootstrap.NavigationBar
 * @description Creates a tabbed navigation box
 * @extends gx.ui.Tabbox
 * @implements gx.util.Console
 *
 * @param {node} display: The target node
 *
 * @option {array} frames: The array containing the frames. [{name: STRING, title: STRING, content: NODE/HTML}]
 * @option {int} height: The height of the content area
 * @option {int} show: The first tab to show
 * @option {function} onChange: Called when the tab is changed
 *
 * @event change When the tab is changed
 */
gx.bootstrap.NavigationBar = new Class({
	gx: 'gx.bootstrap.Tabbox',
	Extends: gx.ui.Tabbox,
	options: {
	},
	_tabs: {},
	_buttons: {},

	/**
	 * @method build
	 * @description Builds the HTML frame (my vary for derived classes)
	 * @return {element}
	 */
	build: function() {

		try {
			this._display.root.addClass('tabbable');

			this._display = Object.merge({}, this._display, {
				'navbar'     : new Element('div', {'class': 'navbar'}),
				'navbarinner': new Element('div', {'class': 'navbar-inner'}),
                'title'      : new Element('div', {'class': 'brand'}),
				'tablist'    : new Element('ul', {'class': 'nav'}),
				'content'    : new Element('div', {'class': 'tab-content', 'styles': {'overflow': 'auto'}}),
				'buttons'    : new Element('div', {'style': 'float: right'}),
			});

			if (this.options.height)
				this._display.content.setStyle('height', this.options.height);

			this._display.navbarinner.adopt(this._display.title, this._display.tablist, this._display.buttons);
			this._display.navbar.adopt(this._display.navbarinner);
			this._display.root.adopt(this._display.navbar, this._display.content);

		} catch(e) { gx.util.Console('gx.bootstrap.NavigationBar->build', e.message); }

		return this._display.root;
	},

	/**
	 * @method setTitle
	 * @description Set title attributes
	 * @param {object} attributes
	 * @return {element}
	 */
    setTitle: function(attributes) {
    	switch (typeOf(attributes)) {
    		case 'element':
    			this._display.title.empty();
    			return this._display.title.adopt(attributes);
    		case 'string':
    			return this._display.title.set('html', attributes);
    		default:
    			return this._display.title.set(attributes);
    	}
    },

	/**
	 * @method setTabTitle
	 * @description Set title of a tab
	 * @param {string} name The name of the tab.
	 * @param {string} name The new title.
	 */
    setTabTitle: function(tab, title) {
        this._tabs[tab].getFirst('a').set({'html': title});
    },

	/**
	 * @method setNavigationButtons
	 * @description Set title of a tab
	 * @param {string} name The name of the tab.
	 * @param {string} name The new title.
	 */
	setNavigationButtons: function(buttons) {
		this._display.buttons.empty();
		this._display.buttons.adopt(buttons);
	},

	/**
	 * @method buildTab
	 * @description Builds the HTML element for a single tab
	 * @param {string} name
	 * @param {string} title
	 * @return {element}
	 */
	buildTab: function(name, title) {
		var root = this;

		var link = new Element('a', {'html': title.replace(/ /g, '&nbsp;')});
		var tab = new Element('li');
		tab.adopt(link);
		this._display.tablist.adopt(tab);
		link.addEvent('click', function() {
			root.openTab(name);
		});
		this._tabs[name] = tab;

		return tab;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {element} content
	 * @return {element}
	 */
	buildContent: function(content) {
		var wrapper = new Element('div', {'class': 'tab-pane'}).adopt(content);
		this._display.content.adopt(wrapper);
		return wrapper;
	},

	/**
	 * @method setHighlight
	 * @description Builds the HTML element for the content section
	 * @param {string} name The name of the tab
	 * @param {string} content The contents of the highlight
	 * @param {string} style The style class (default is "important")
	 * @return {void}
	 */
	setHighlight: function(name, content, style) {
		if (this._tabs[name] != null) {
			var span = this._tabs[name].getElement('span');
			if (span != null)
				span.destroy();

			if (style == null)
				style = 'important';

			if (content != null) {
				span = new Element('span', {'class': 'label label-'+style, 'html': content});
				span.inject(this._tabs[name], 'top');
			}
		}
	}
});
/**
 * @class gx.bootstrap.Popup
 * @description Displays a message box or status bar.
 * @extends gx.ui.Blend
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 *
 * @option {string} color The color of the blend mask
 * @option {string} freezeColor The freeze color
 * @option {int} z-index The 'z' index
 * @option {float} opacity The opacity of the popup
 * @option {string} position The position modifier
 * @option {string} transition MooTools Fx.Transition function
 * @option {string} duration Blend effect duration
 * @option {bool} loader Show a loader bar
 * @option {bool} open Open on initialization
 * @option {object} content The content of the popup
 * @option {string} x The x coordinate of the popup
 * @option {string} y The y coordinate of the popup
 *
 * @sample Popup A sample popup window
 */
gx.bootstrap.PopupMeta = new (function() {
	this.zindex = 100;
	this.popups = [];

	this.register = function(popup) {
		this.popups.push(popup);
		this.zindex = this.zindex + 2;
		return this.zindex;
	};

	this.unregister = function(popup) {
		this.popups.erase(popup);
		return this.popups.length;
	};

	window.addEvent('domready', function() {
		$(document.body).addEvent('keyup', function(event) {
			if (event.key == 'esc') {
				var popup = this.popups.getLast();
				if (popup != null && popup.options.closable)
					popup.hide();
			}
		}.bind(this));
	}.bind(this));
})();

gx.bootstrap.Popup = new Class({
	gx: 'gx.bootstrap.Popup',
	Extends: gx.core.Settings,
	options: {
		'color'      : '#000',
		'freezeColor': '#000',
		'opacity'    : '0.40',
		'position'   : 'fixed',
		'transition' : 'quad:in',
		'duration'   : '300',
		'loader'     : false,
		'open'       : false,
		'content'    : null,
		'x'          : 'center',
		'y'          : 'center',
		'closable'   : true,
		'borderbox'  : true,
		'maxHeight'  : 'auto',
		'minHeight'  : 'auto',
		'clickable'  : false,
		'destroyOnHide': false,
	},
	isOpen: false,
	initialize: function(options) {
		var root = this;
		try {
			this.parent(options);

			this.build();

			if ( this.options.destroyOnHide === true ) {
				var popup = this;
				this.addEvent('hide', function() {
					(function() {
						popup.destroy();
						popup = null;

					}).delay(150);
				});
			}

		} catch(e) { gx.util.Console('gx.bootstrap.Popup->initialize: ', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the popup
	 */
	build: function() {
		var root = this;
		try {
			this._display = {
				'domBody' : $(document.body),
				'backdrop': new Element('div', {'class': 'modal-backdrop fade'}),
				'modal'   : new Element('div', {'class': 'modal fade'}),
				'dialog'  : new Element('div', {'class': 'modal-dialog'}),
				'content' : new Element('div', {'class': 'modal-content'}),
				'header'  : new Element('div', {'class': 'modal-header'}),
				'footer'  : new Element('div', {'class': 'modal-footer'}),
				'body'    : new Element('div', {'class': 'modal-body'}),
				'cross'   : new Element('button', {'class': 'close', 'html': '&times;'}),
				'title'   : new Element('h4', {'class': 'modal-title', 'html': this.options.title})
			};
			this._display.domBody.adopt(this._display.modal);
			this._display.modal.adopt(this._display.dialog);
			this._display.dialog.adopt(this._display.content);
			this._display.content.adopt([this._display.header, this._display.body, this._display.footer]);
			this._display.header.adopt([this._display.cross, this._display.title]);

			// Adjust the default width (600px)
			if (this.options.width)
				this._display.dialog.setStyle('width', this.options.width);

			// Adopt the content
			if (this.options.content)
				this._display.body.adopt(__(this.options.content));

			// Set the footer
			if (typeOf(this.options.footer) == 'array')
				this._display.footer.adopt(this.options.footer);
			else if ( this.options.footer )
				this._display.footer.adopt(__(this.options.footer));
			else
				this._display.footer.destroy();

			// Set the title
			this.setTitle(this.options.title);

			// Add the closing functions
			if (this.options.closable) {
				this._display.cross.addEvent('click', function() { root.hide(); });

				if (this.options['clickable'])
					this._display.backdrop.addEvent('click', function() { root.hide(); });
			} else {
				this._display.cross.destroy();
			}

			if ( this.options.type )
				this._display.header.addClass('text-' + this.options.type);

		} catch(e) { gx.util.Console('gx.bootstrap.Popup->build', e.message); }
	},

	/**
	 * @method setTitle
	 * @description Sets the title of the popup
	 * @param {string} title The title to set
	 */
	setTitle: function(title) {
		if (!title) {
			this._display.header.setStyle('display', 'none');
			return;
		}
		this._display.header.erase('style');
		this._display.title.set('html', title);
	},

	/**
	 * @method setContent
	 * @description Sets the content of the popup
	 * @param {string} content The content to set
	 */
	setContent: function(content) {
		try {
			this._display.body.empty();
			switch (typeOf(content)) {
				case 'element':
				case 'elements':
				case 'textnode':
				case 'array':
					this._display.body.adopt(content);
					break;
				case 'object':
					this._display.body.adopt(__(content));
					break;
				case 'string':
				case 'number':
					this._display.body.set('html', content);
					break;
			}
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->initialize', e.message); }
	},

	/**
	 * Returns the body element
	 * @return {Element}
	 */
	getContent: function() {
		return this._display.body;
	},

	/**
	 * @method show
	 * @description Shows the popup
	 */
	show: function(options) {
		var root = this;
		try {
			var zindex = gx.bootstrap.PopupMeta.register(this);
			this._display.modal.setStyle('z-index', zindex);
			this._display.backdrop.setStyle('z-index', zindex-1);

			this._display.domBody.adopt(this._display.backdrop);
			this._display.modal.setStyle('display', 'block');
			(function() {
				root._display.backdrop.addClass('in');
				root._display.modal.addClass('in');
				root._display.domBody.addClass('modal-open');
			}).delay(100);

			this.isOpen = true;
			this.fireEvent('open');
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->show: ', e.message); }
	},

	/**
	 * @method hide
	 * @description Hides the popup
	 */
	hide: function() {
		var root = this;
		try {
			this._display.backdrop.removeClass('in');
			this._display.modal.removeClass('in');
			(function() {
				root._display.modal.setStyle('display', 'none');
				root._display.backdrop.dispose();
				if (gx.bootstrap.PopupMeta.unregister(root) == 0)
					root._display.domBody.removeClass('modal-open');
			}).delay(100);

			this.isOpen = false;
			this.fireEvent('hide');
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->hide: ', e.message); }
	},

	destroy: function() {
		this._display.modal.destroy();
		this._display.backdrop.destroy();
		delete this._display;

		this.parent();
	}
});

gx.bootstrap.PopupAlert = function(title, msg, options) {
	if ( typeof options === 'string' )
		options = {type: options};

	options = Object.merge({
		title: title,
		content: msg,
		width: 400,
		destroyOnHide: true
	}, options || {});

	var okBtn = new Element('button', {
		'html': 'Ok',
		'class': 'btn btn-primary'
	});

	options.footer = okBtn;

	var popup = new gx.bootstrap.Popup(options);
	popup.show();

	return new Promise(function(resolve, reject) {
		okBtn.addEvent('click', function() {
			if ( typeof options.onOk === 'function' )
				if ( options.onOk() === false )
					return;

			popup.hide();
			resolve();
		});

		okBtn.focus();
	});
};

/*const*/ gx.bootstrap.PopupConfirmCanceled = {};

gx.bootstrap.PopupConfirm = function(title, msg, options) {
	if ( typeof options === 'string' )
		options = {type: options};

	options = Object.merge({
		title: title,
		content: msg,
		width: 400,
		destroyOnHide: true,
		modal: true,
		onOk: false,
	}, options || {});

	var okBtn = new Element('button', {
		'html': 'Ok',
		'class': 'btn btn-primary'
	});

	var cancelBtn = new Element('button', {
		'html': 'Cancel',
		'class': 'btn btn-default'
	});

	options.footer = [cancelBtn, okBtn];

	var popup = new gx.bootstrap.Popup(options);
	popup.show();

	return new Promise(function(resolve, reject) {
		cancelBtn.addEvent('click', function() {
			popup.hide();
			resolve(gx.bootstrap.PopupConfirmCanceled);
		});

		okBtn.addEvent('click', function() {
			if ( typeof options.onOk === 'function' )
				if ( options.onOk() === false )
					return;

			popup.hide();
			resolve();
		});

		if ( document && document.activeElement && typeof document.activeElement.blur === 'function' ) {
			document.activeElement.blur();
		}

	});
};
/**
 * @class gx.bootstrap.Select
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
 *
 * @option {string}          height          Default: auto
 * @option {string}          selectionPrefix An optional prefix displayed in front of the selected value
 * @option {string}          icon            The glyphikon icon (default: chevron-down)
 * @option (string)          resetable       If set, add an additional list option to reset the selection (e.g. "Select all")
 * @option {string}          textboxClass    Additional textbox class
 * @option {array}           data            Default data
 * @option {string|function} elementIndex    The ID format (default key is "ID"; specify function to overwrite)
 * @option {string|function} elementLabel    Element label or alternative list format (Default returns a:"elem.name")
 * @option {string|function} elementSelect   The label for selected elements or alternative format function
 * @option {object}          elementDefault  Represents a default element, e.g. for "empty" selections
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 *
 * @event show     When the selection list is shown
 * @event hide     When the selection list is hidden
 * @event select   When an element is selected
 * @event noselect When no element is selected
 *
 */
gx.bootstrap.Select = new Class({
	gx: 'gx.bootstrap.Select',
	Extends: gx.ui.Container,
	options: {
		'height'         : 'auto',
		'allowEmpty'     : false,
		'selectionLabel' : false,
		'icon'           : 'chevron-down',
		'resetable'      : false,
		'textboxClass'   : false,
		'data'           : null,
		'elementIndex'   : 'ID',
		'elementLabel'   : 'name',
		'elementSelect'  : 'name',
		'elementDefault' : null,
		'value'          : null,
		/* Messages */
		'msg'            : {
			'noSelection': 'No Selection'
		}
	},
	_closed    : true,
	_selected  : null,
	_currentElem: null,
	_running   : false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this._display.root.addClass('gx-bootstrap-select');

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
					'max-height': this.options.height
				}
			});

			this._display.icon = new Element('span', {'class': 'glyphicon glyphicon-'+this.options.icon});

			this._display.root.adopt([
				this._display.icon,
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
					this.hide.delay(300, root);
				}.bind(this),
				'keypress': function (event) {
					if ( event.key == 'tab' )
						return;
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
					if ( this.search == null )
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this),
				'keydown': function (event) {
					if ( event.key == 'tab' )
						return;
					if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();
						return;
					}
					if ( this.search == null )
						event.preventDefault(); // Do nothing for simple select boxes
				}.bind(this),
				'keyup': function (event) {
					if ( event.key == 'tab' )
						return;

					if ( event.key == 'esc' ) {
						this.hide();
					} else if ( event.key == 'up' || event.key == 'down' ) {
						event.preventDefault();

						// this.show();

						var li;
						if (this._currentElem == null) {
							if(event.key == 'down')
								li = this._display.dropdown.getFirst(':not(.hidden)');
							else
								li = this._display.dropdown.getLast(':not(.hidden)');
						} else {
							if(event.key == 'down') {
								li = this._currentElem.getNext(':not(.hidden)');
								if (li == null && this._currentElem == this._display.dropdown.getLast(':not(.hidden)'))
									li = this._display.dropdown.getFirst(':not(.hidden)');
							} else {
								li = this._currentElem.getPrevious(':not(.hidden)');
								if (li == null && this._currentElem == this._display.dropdown.getFirst(':not(.hidden)'))
									li = this._display.dropdown.getLast(':not(.hidden)');
							}
						}

						if (li != null) {
							if (this._currentElem != null)
								this._currentElem.removeClass('selected');
							this._currentElem = li;
							this._currentElem.addClass('selected');
							this.fxScoll.toElement(this._currentElem);
						}

						return;
					} else if ( event.key == 'enter' ) {
						if (this._currentElem != null) {
							var a = this._currentElem.getElement('a');
							if (a != null)
								a.fireEvent('click');
						}

						return;
					}

					if ( this.search != null ) {
						// this.show();
						this.search();
					} else
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
				this.setData(this.options.data);

			if (this.options.value != null && gx.util.isString(this.options.elementIndex)) {
				this.options.data.each(function(entry) {
					if (entry[this.options.elementIndex] == this.options.value)
						this.set(entry, true);
				}.bind(this));
			}
		} catch(e) {
			e.message = 'gx.bootstrap.Select->initialize: ' + e.message;
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

		// This conforms to vanilla js reading value like input.value.
		this.value = this.getId();

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

		this.showSelection(this._selected);
		this.hide();

		return this;
	},

	showSelection: function() {
		this._display.textbox.set('value', this.getSelectionDisplayValue());
	},

	getSelectionDisplayValue: function() {
		return this._selected == null ? '' : this._selected[this.options.elementSelect];
	},

	/**
	 * @method getID
	 * @description Returns the ID of the selected element
	 */
	getId: function (elem) {
		if (elem != null)
			return elem[this.options.elementIndex];

		if (this._selected != null)
			return this._selected[this.options.elementIndex];

		return null;
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
	 * @method setData
	 * @description Builds a list of links from the provided array
	 * @param {array} list The provided array
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	setData: function (list) {
		var root = this;
		try {
			this._display.dropdown.empty();
			this._currentElem = null;

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
				if (list[i] == null)
					continue;

				var li = new Element('li');
				var a = this.getLink(list[i]);

				li.store('data', list[i]);
				li.store('key', i);
				this._display.dropdown.adopt(li.adopt(a));
				addCLink(a, list[i]);
			}
		} catch(e) {
			e.message = 'gx.bootstrap.Select->setData: ' + e.message;
			throw e;
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
		this._display.textbox.focus();

		this.fireEvent('show');
		return this;
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
		this.clearCursor();

		this.fireEvent('hide');
		return this.update();
	},

	/**
	 * @method isOpen
	 * @description Returns if the list box is open
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
	 * @method clearCursor
	 * @description Removes the current list selection
	 */
	clearCursor: function() {
		if (this._currentElem == null)
			return;

		this._currentElem.removeClass('selected');
		this._currentElem = null;
	},

	/**
	 * @method reset
	 * @description Resets the selection
	 * @param {bool} noEvents Do not throw events
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
	reset: function (noEvents) {
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
	},

	toElement: function() {
		return this._display.root;
	}
});

/**
 * @class gx.bootstrap.SelectPrio
 * @description Creates a priority select box
 * @extends gx.bootstrap.Select
 */
gx.bootstrap.SelectPrio = new Class({
	gx: 'gx.bootstrap.SelectPrio',
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
		},
		value: 0
	},

	showSelection: function() {
		this._display.textbox.set('value', this._selected == null ? '' : this._selected.symbol + ' | ' + this.getMessage(this._selected.label));
	},

	getLink: function(elem) {
		return new Element('a', {'html': elem.symbol + ' | ' + this.getMessage(elem.label), 'styles': {'color': elem.color}});
	}
});

/**
 * @class gx.bootstrap.SelectFilter
 * @description Creates a filterable search list
 * @extends gx.bootstrap.Select
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
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
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 * @option {array}           searchfields    List of searchable object fields inside
 *
 */
gx.bootstrap.SelectFilter = new Class({
	gx: 'gx.bootstrap.SelectFilter',
	Extends: gx.bootstrap.Select,
	options: {
		'height'      : '200px',
		'searchfields': ['name']
	},
	_lastSearch: null,

	initialize: function (display, options) {
		var root = this;
		try {
			this.addEvent('show', function() {
                this._display.textbox.set('value', this._lastSearch);
				this.search();
			}.bind(this));
            this.addEvent('hide', function() {
                this._display.textbox.erase('value');
            }.bind(this));

			this.parent(display, options);
		} catch(e) {
			e.message = 'gx.bootstrap.SelectFilter->initialize: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method search
	 * @description Initiates a search request
	 * @returns Returns this instance (for method chaining).
	 */
	search: function () {
		try {
			var query = this._display.textbox.get('value');
			if (this._lastSearch == query)
				return;

			var selectionDisplayValue = this.getSelectionDisplayValue();
			if ( this._selected && query == selectionDisplayValue )
				return;

			this.clearCursor();
			this._lastSearch = query;
			this._searchQuery(query);

		} catch(e) {
			e.message = 'gx.bootstrap.SelectFilter->search: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method search
	 * @description Performs a search
	 * @returns Returns this instance (for method chaining).
	 */
	_searchQuery: function (query) {
		try {
			this._display.dropdown.getElements('li').each(function(li) {
				var data = li.retrieve('data', {});
				this.options.searchfields.each(function(field) {
					if (query == '') {
						li.removeClass('hidden');
						return;
					}
					switch (typeOf(data[field])) {
						case 'number':
							data[field] = data[field].toString();
						case 'string':
							if (data[field].test(query, 'i')) {
								li.removeClass('hidden');
								return;
							}
					}
					li.addClass('hidden');
				}.bind(this));
			}.bind(this));
		} catch(e) {
			e.message = 'gx.bootstrap.SelectFilter->_searchQuery: ' + e.message;
			throw e;
		}
	},

	/**
	 * @method showLoader
	 * @description Show the loader icon
	 * @return gx.bootstrap.SelectDyn
	 */
	showLoader: function() {
		this._display.icon.set('class', 'glyphicon glyphicon-refresh');
		return this;
	},

	/**
	 * @method hideLoader
	 * @description Hide the loader icon and restore the default icon
	 * @return gx.bootstrap.SelectDyn
	 */
	hideLoader: function() {
		this._display.icon.set('class', 'glyphicon glyphicon-'+this.options.icon);
	}
});

/**
 * @class gx.bootstrap.SelectDyn
 * @description Creates a dynamic select box with searchable conent
 * @extends gx.bootstrap.Select
 *
 * @param  {element|string}  display         The display element
 * @param  {object}          options
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
 * @option {string|int}      value           Specifies the default/preset value or simple lists
 * @option {string}          url             The request URL
 * @option {string}          method          The request method (default: GET)
 * @option {string|function} queryParam      The query paramter or a function that returns the request data object (e.g. {search: QUERY, entity: ...})
 * @option {object}          requestData     Default request data
 *
 * @event show     When the selection list is shown
 * @event hide     When the selection list is hidden
 * @event select   When an element is selected
 * @event noselect When no element is selected
 *
 */
gx.bootstrap.SelectDyn = new Class({
	gx: 'gx.bootstrap.SelectDyn',
	Extends: gx.bootstrap.SelectFilter,
	options: {
		'url': './',
		'method': 'GET',
		'queryParam': 'query',
		'parseDefault': false,
		'requestData': {},
		'requestHeader': {},
	},
	_requestChain:[],
	_firstLoad: false,

	initialize: function (display, options) {
		var root = this;
		try {
			if (options.onRequestSuccess == null)
				this.options.parseDefault = true;


			this.addEvent('show', function() {
				if (this._firstLoad)
					return;

				this.search();
				this._firstLoad = true;
			}.bind(this));

			this.parent(display, options);

			if (gx.util.isFunction(this.options.queryParam))
				this.getRequetData = this.options.queryParam.bind(this);

			if (this.options.parseDefault) {
				this.addEvent('requestSuccess', function(json) {
					var r = gx.util.parseResult(json);
					this.setData(gx.util.isArray(r) ? r : []);
				}.bind(this))
			}
		} catch(e) {
			e.message = 'gx.bootstrap.SelectDyn->initialize: ' + e.message;
			throw e;
		}
	},

	getRequetData: function(query, data) {
		data[this.options.queryParam] = query;
		return data;
	},

	_searchQuery: function(query) {
		var r = new Request({
			'method'   : this.options.method,
			'url'      : this.options.url,
			'data'     : this.getRequetData(query, Object.clone(this.options.requestData)),
			'header'   : this.options.requestHeader,
			'onRequest': function() {
				this.showLoader();
			}.bind(this),
			'onComplete': function() {
				this.hideLoader();
				var next = this._requestChain.pop();
				if (next != null && next != r) {
					this._requestChain = []; // Reset the chain, only execute the next request
					next.send();
				}
			}.bind(this),
			'onSuccess': function (json) {
				this.fireEvent('requestSuccess', json);
			}.bind(this),
			'onFailure': function () {
				this.fireEvent('requestFailure');
			}.bind(this)
		});
		this._requestChain.push(r);

		if (this._requestChain.length == 1)
			r.send();
	}
});


gx.bootstrap.SelectDynREST = new Class({
	gx: 'gx.bootstrap.SelectDyn',
	Extends: gx.bootstrap.SelectFilter,
	options: {
		'entity': '',
		'requestData': {},
		'limit': 50,
	},
	_requestChain:[],
	_firstLoad: false,

	data: null,

	initialize: function (display, options) {
		if (options.onRequestSuccess == null)
			this.options.parseDefault = true;


		this.addEvent('show', function() {
			if (this._firstLoad)
				return;

			this.search();
			this._firstLoad = true;
		}.bind(this));

		this.parent(display, options);
	},

	_searchQuery: function(searchText) {
		this.showLoader();

		gx.zeyosREST.Factory.getRESTmodel()
			.listQuery(this.options.entity)
			.limit(this.options.limit)
			.search(searchText)
			.run()
			.then(function(res) {
				this.hideLoader();
				this.data = res.result;
				this.setData(res.result);

			}.bind(this))
			.catch(function(e) {
				this.hideLoader();
				throw e;
			}.bind(this));
	},

	setEntityId: function(id) {
		var item;
		if ( this.data ) {
			item = this.data.findBy('ID', id);
		}

		if ( item ) {
			this.set(item);
			return Promise.resolve();
		}

		if ( !id )
			return Promise.resolve();

		this.showLoader();
		return gx.zeyosREST.Factory.getRESTmodel()
			.itemQuery(this.options.entity, id)
			.run()
			.then(function(res) {
				this.hideLoader();
				if ( res && typeOf(res.result) ) {
					this.set(res.result);
				}

			}.bind(this))
			.catch(function(e) {
				this.hideLoader();
				throw e;
			}.bind(this));
	}
});

/**
 * @class gx.bootstrap.Tabbox
 * @description Creates a tabbed box
 * @extends gx.ui.Tabbox
 * @implements gx.util.Console
 *
 * @param {node} display: The target node
 *
 * @option {array} frames: The array containing the frames. [{name: STRING, title: STRING, content: NODE/HTML}]
 * @option {int} height: The height of the content area
 * @option {int} show: The first tab to show
 * @option {function} onChange: Called when the tab is changed
 *
 * @event change When the tab is changed
 */
gx.bootstrap.Tabbox = new Class({
	gx: 'gx.bootstrap.Tabbox',
	Extends: gx.ui.Tabbox,
	options: {
		'frames': [],
		'height': false,
		'show': 1,
		'onChange': false
	},
	_tabs: {},
	/**
	 * @method build
	 * @description Builds the HTML frame (my vary for derived classes)
	 * @return {element}
	 */
	build: function() {
		try {
			this._display.root.addClass('tabbable');

			this._display = Object.merge({}, this._display, {
				'tablist': new Element('ul', {'class': 'nav nav-tabs'}),
				'content': new Element('div', {'class': 'tab-content', 'styles': {'overflow': 'auto'}})
			});

			if (this.options.height)
				this._display.content.setStyle('height', this.options.height);
			this._display.root.adopt(this._display.tablist);
			this._display.root.adopt(this._display.content);

		} catch(e) { gx.util.Console('gx.bootstrap.Tabbox->build', e.message); }
	},

	/**
	 * @method buildTab
	 * @description Builds the HTML element for a single tab
	 * @param {string} name
	 * @param {string} title
	 * @return {element}
	 */
	buildTab: function(name, title) {
		var root = this;

		var link = new Element('a', {'html': title.replace(/ /g, '&nbsp;')});
		var tab = new Element('li');
		tab.adopt(link);
		this._display.tablist.adopt(tab);
		link.addEvent('click', function() {
			root.openTab(name);
		});
		this._tabs[name] = tab;

		return tab;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {element} content
	 * @return {element}
	 */
	buildContent: function(content) {
		var wrapper = new Element('div', {'class': 'tab-pane'}).adopt(content);
		this._display.content.adopt(wrapper);
		return wrapper;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {string} name The name of the tab
	 * @param {string} content The contents of the highlight
	 * @param {string} style The style class (default is "important")
	 * @return {void}
	 */
	setHighlight: function(name, content, style) {
		if (this._tabs[name] != null) {
			var span = this._tabs[name].getElement('span');
			if (span != null)
				span.destroy();

			if (style == null)
				style = 'important';

			if (content != null) {
				span = new Element('span', {'class': 'label label-'+style, 'html': content});
				span.inject(this._tabs[name], 'top');
			}
		}
	}
});
/**
 * @class gx.bootstrap.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Table
 * @implements gx.util.Console
 * @sample Table
 *
 * @event click
 * @event dblclick
 * @event filter
 * @event rowAdd
 * @event addData
 * @event setData
 * @event complete
 * @event beforeRowAdd
 * @event afterRowAdd
 *
 * @option {array} cols The table column structure
 * @option {function} structure Formatting row data into columns (returns an array)
 * @option {array} data The list data
 * @option {bool} onClick when a row is clicked
 * @option {bool} onFilter when a filter is set
 * @option {bool} onRowAdd when a row is added
 * @option {bool} onStart when the table is being rendered
 * @option {bool} onComplete when the table is rendered completely
 */
gx.bootstrap.Table = new Class({
    gx     : 'gx.bootstrap.Table',
    Extends: gx.ui.Table,

    _theme: {
        filterAsc   : 'asc',
        filterDesc  : 'desc',
        unfiltered  : '',
        th          : 'th',
        filter      : 'filter',
        filterElem  : 'span',
        mainTable   : 'fixed table table-striped table-hover',
        mainThead   : 'fullw table-head',
        mainTheadRow: '',
        mainTbody   : '',
        wrapper     : '',
        emptyCol    : '',
        headerTable : '',
        tbodyTr     : '',
        oddRow      : false,
        colCheck    : 'table-col-check'
    }
});
/**
 * @class gx.bootstrap.Timebox
 * @description Creates a box for times, separating hours, minutes and seconds
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {float} time The initial time of the element
 * @option {string} unit The default input unit (seconds, minutes, hours)
 * @option {bool} seconds Also display the seconds (default is hours:minutes)
 * @option {bool} prefix The box will support negative numbers
 * @option {bool} readonly
 *
 * @event change
 * @event disabled
 *
 * @sample Timebox Simple timebox example.
 */
gx.bootstrap.Timebox = new Class({

	gx: 'gx.bootstrap.Timebox',

	Extends: gx.ui.Timebox,

	options: {
		'time'       : 0,
		'unit'       : 'seconds',
		'seconds'    : true,
		'prefix'     : false,
		'readonly'   : false,
		'disabled'   : false,
		'orientation': 'left',
		'icon'       : false,

		/**
		 * A string to use as the component's label or an object to pass to "Element.set()".
		 */
		'label'          : ''
	},

	/**
	 * @method build
	 * @description Builds the timebox
	 */
	build: function() {
		var root = this;
		try {
			this._display.root.addClass('bs-timebox');
			this._display.root.addClass('input-append');

			if ( this.options.label || this.options.icon ) {
				this._display.root.addClass('input-prepend');

				var iconMarkup = ( this.options.icon ? '<i class="icon-'+this.options.icon+'"></i>' : '' );

				this._display.label = new Element('span');

				if ( this.options.label && (typeof(this.options.label) === 'object') ) {
					var labelOptions = Object.clone(this.options.label);
					var labelText    = ( labelOptions.html == null ? String(labelOptions.text).htmlSpecialChars() : labelOptions.html );
					labelOptions.html = iconMarkup+( labelOptions.text ? ' '+labelOptions.text : '' );
					delete labelOptions.text;
					this._display.label.set(labelOptions);
				} else {
					this._display.label.set('html', iconMarkup+( this.options.label ? ' '+this.options.label : '' ))
				}

				this._display.label.addClass('add-on');

				this._display.root.adopt(this._display.label);
			}

			this._display.hours = new Element('input', {'type': 'text'});
			this._display.root.adopt(this._display.hours);
			this._display.hours.addEvent('change', function() {
				root.update();
			});
			this._display.minutes = new Element('input', {'type': 'text', 'styles': {'border-radius': 0}});
			this._display.root.adopt(new Element('span', {'class': 'separator', 'html': ':'}));
			this._display.root.adopt(this._display.minutes);
			this._display.minutes.addEvent('change', function() {
				root.update();
			});

			var readOnly = ( this.options.readonly && !gx.ui.Timebox.legacyMode );
			var disabled = ( this.options.disabled || (gx.ui.Timebox.legacyMode && this.options.readonly) );

			if ( this.options.seconds ) {
				this._display.seconds = new Element('input', {'type': 'text', 'styles': {'border-radius': 0}});
				this._display.root.adopt(new Element('span', {'class': 'separator', 'html': ':'}));
				this._display.root.adopt(this._display.seconds);
				this._display.seconds.addEvent('change', function() {
					root.update();
				});
				if ( readOnly )
					this._display.seconds.set('readonly', 'readonly');
				if ( disabled )
					this._display.seconds.set('disabled', 'disabled');
			}

			if ( readOnly ) {
				this._display.hours.set('readonly', 'readonly');
				this._display.minutes.set('readonly', 'readonly');
			}

			if ( disabled )
				this.disable();

			if ( this.options.prefix ) {
				this._display.prefix = new Element('button', {
					'class': 'btn btn-success',
					'html': '&nbsp;<i class="icon-plus"></i>'
				});
				this._display.root.adopt(this._display.prefix);
				this._display.prefix.addEvent('click', function() {
					if ( !root.options.disabled && (!gx.ui.Timebox.legacyMode || !root.options.readonly) )
						root.setPrefix(!root._prefix);
				});
			}

		} catch(e) {
			gx.util.Console('gx.bootstrap.Timebox->build', e.message);
		}
	},

	/**
	 * @method setPrefix
	 * @description Sets the prefix
	 * @param {element} prefix The prefix
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	setPrefix: function(prefix) {
		try {
			if ( this._display.prefix ) {
				this._prefix = prefix;
				if ( this._prefix ) {
					this._display.prefix.removeClass('btn-danger');
					this._display.prefix.addClass('btn-success');
					this._display.prefix.set('html', '&nbsp;<i class="icon-plus"></i>');
				} else {
					this._display.prefix.removeClass('btn-success');
					this._display.prefix.addClass('btn-danger');
					this._display.prefix.set('html', '&nbsp;<i class="icon-minus"></i>');
				}
			}
		} catch(e) {
			gx.util.Console('gx.bootstrap.Timebox->setPrefix', e.message);
		}

		return this;
	}

});
'use strict';

/**
 * @class gx.bootstrap.ValueList
 * @description Creates a multi value editor to edit values with multiple sub-values (array)
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {string} width The width of the panel + 'px'
 */
gx.bootstrap.ValueList = new Class({

	Extends: gx.ui.Container,

	options: {
		'deletable'		 : true
	},

	initialized: false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this._display.root.addClass('bs-valuelist');
			if (this.options.deletable)
				this._display.root.addClass('bs-valuelist-deletable');

			var span = new Element('span', {'styles': {'position': 'absolute', 'left': '-100000px', 'padding': '10px'}}).inject($(document.body));
			this._display.textbox = new Element('input', {'type': 'text'}).addEvents({
				'keydown': function(event) {
					if (event.key == 'enter' && this.get('value') != '') {
						root.addValue(this.get('value'));
						this.erase('value');
					} else {
						span.set('html', this.get('value'));
						this.setStyle('width', span.offsetWidth);
					}
				},
				'focus': function() {
					root._display.root.addClass('focus');
				},
				'blur': function() {
					root._display.root.removeClass('focus');
					if (this.get('value') != '') {
						root.addValue(this.get('value'));
						this.erase('value');
					}
				}
			});

			this._display.list = new Element('ul');
			this._display.root.adopt([this._display.list, this._display.textbox, new Element('div', {'class': 'clear'})]);
			this._display.root.addEvent('click', function() {
				root._display.textbox.focus();
			});

			this.sortable = new Sortables(this._display.list);

		} catch(e) {
			gx.util.Console('gx.bootstrap.ValueList->initialize', gx.util.parseError(e) );
		}
	},

	focus: function() {
		this._display.textbox.focus();
	},

	addValue: function(value) {
		var root = this;
		var li = new Element('li', {'html': value}).addEvent('click', function() {
			root.fireEvent('click')
		});
		li.store('value', value);
		if (this.options.deletable) {
			li.adopt(new Element('span').addEvent('click', function() {
				li.destroy();
			}));
		}
		this._display.list.adopt(li);

		if (this.sortable != null)
			this.sortable.addItems(li);
	},

	getValues: function() {
		var values = [];
		this._display.list.getElements('li').each(function(li) {
			values.push(li.retrieve('value'));
		});
		return values;
	},

	setValues: function(values) {
		if (this.sortable != null)
			this.sortable.removeItems(this._display.list.getElements('li')).destroy();

		if (values == null)
			return;

		values.each(function(value) {
			this.addValue(value);
		}.bind(this));
	},

	disable: function() {
		this._display.textbox.setStyle('display', 'none');
		this._display.root.removeClass('bs-valuelist-deletable');
		this._display.root.addClass('bs-valuelist-readonly');
		delete this.sortable;
	},

	enable: function() {
		this._display.textbox.setStyle('display', 'inline-block');
		this._display.root.removeClass('bs-valuelist-readonly');
		this.sortable = new Sortables(this._display.list);
		if (this.options.deletable)
			this._display.root.addClass('bs-valuelist-deletable');
	}

});
