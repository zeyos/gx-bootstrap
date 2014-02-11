/**
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
