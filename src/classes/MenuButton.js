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
