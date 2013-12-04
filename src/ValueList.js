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
