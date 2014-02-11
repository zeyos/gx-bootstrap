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
