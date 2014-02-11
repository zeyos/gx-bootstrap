/**
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

			if (this.options.value)
				this.check(1);
			else
				this.uncheck(1);

			this.setLabel(this.options.label);
		} catch(e) { gx.util.Console('gx.bootstrap.CheckButton->initialize', e.message); }
	},

	/**
	 * @method setLabel
	 * @description Sets the button's label
	 * @param {string} label
	 */
	setLabel: function(label) {
		this._display.button.set('html', label);
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
});