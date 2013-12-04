/**
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
				'height': root.options.height+'px',
				'overflow': 'auto'
			}});
			this._display.root.adopt(this._display.frame);
			this._display.root.addClass('b');
			this._display.root.addClass('bs-checklist');
			this._display.root.setStyle('width', root.options.width);
			if (this.options.search) {
				this._display.search = {
					'box': new Element('div', {'class': 'b_b p2_t p2_r p2_l'}),
					'txt': new Element('input', {'type': 'text', 'styles': {'width': (root.options.width - 50)+'px'}})
				};
				this._display.search.box.inject(this._display.root, 'top');
				this._display.search.box.adopt(__({'class': 'bs-select input-prepend', 'children': [
					{'tag': 'span', 'class': 'add-on', 'child': {'tag': 'i', 'class': 'icon-search'}},
					this._display.search.txt
				]}));
				this._display.search.txt.addEvent('keyup', function() {
					root.search(root._display.search.txt.value);
				});
			}
			this._display.table = new Element('table', {'class': 'table table-striped'});
			if (this.options.onClick)
				this._display.table.addEvent('click', this.options.onClick);
			this._display.frame.adopt(this._display.table);

			if (this.options.url)
				this.loadFromURL(this.options.url, this.options.requestData);
			if (isArray(this.options.data))
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
			this._display.table.empty();
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
				'input': new Element('input', {'type': 'checkbox', 'value': item[this.options.listValue]})
			}

			//console.log('item: ' + JSON.encode(item) + ' format: ' + this.options.listFormat + ' label: ' + elem.label + ' value: ' + elem.value + ' input: ' + elem.input);

			elem.row = new Element('tr');
			var td1 = new Element('td', {'width': 18});
			td1.adopt(elem.input);
			elem.row.adopt(td1);
			var td2 = new Element('td', {'html': elem.label});
			td2.addEvent('click', function() {
				elem.input.checked = !elem.input.checked;
				if ( elem.input.checked )
					elem.row.addClass('active');
				else
					elem.row.removeClass('active');
			});
			elem.row.adopt(td2);
			this._display.table.adopt(elem.row);
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
				elem.input.checked = false;
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
				elem.input.checked = values.contains(elem.input.get('value'));
				if ( elem.input.checked )
					elem.row.addClass('active');
				else
					elem.row.removeClass('active');
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
				if (elem.input.checked) {
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
			this._display.table.empty();

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
