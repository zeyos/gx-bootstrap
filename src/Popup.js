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
	}

	this.unregister = function(popup) {
		this.popups.erase(popup);
	}

	window.addEvent('keypress', function(e) {
		if (e.key == 'esc') {
			var popup = this.popups.pop();
			if (popup != null)
				popup.hide();
		}
	}.bind(this));
})();

gx.bootstrap.Popup = new Class({
	gx: 'gx.bootstrap.Popup',
	Extends: gx.ui.Blend,
	options: {
		'color': '#000',
		'freezeColor': '#000',
		'opacity': '0.40',
		'z-index': 110,
		'position': 'fixed',
		'transition': 'quad:in',
		'duration': '300',
		'loader': false,
		'open': false,
		'content': null,
		'x': 'center',
		'y': 'center',
		'width': 600,
		'closable': true,
		'borderbox': true,
		'maxHeight': 'auto',
		'minHeight': 'auto'
	},
	isOpen: false,
	initialize: function(options) {
		var root = this;
		try {
			this.parent($(document.body), options);

			this.build();
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->initialize: ', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the popup
	 */
	build: function() {
		var root = this;
		try {
			this._display = Object.merge(this._display, {
				'modal': new Element('div', {
					'cellspacing': 0,
					'cellpadding': 0,
					'border': 0,
					'dir': 'ltr',
					'class': 'modal',
					'styles': {
						'width': (root.options.width + 42)+'px',
						'z-index': this.options['z-index'],
						'opacity': 0
					}
				}),
				'footer': new Element('div', {'class': 'modal-footer'}),
				'content': new Element('div', {'class': 'modal-body'})
			});

			if (this.options.title) {
				this._display.header = new Element('div', {'class': 'modal-header'});
				this._display.title = new Element('h3', {'html': this.options.title})
				this._display.header.adopt(this._display.title);
				this._display.modal.adopt(this._display.header);
			}

			if (this.options.content)
				this._display.content.adopt(this.options.content);

			this._display.modal.adopt(this._display.content);

			if (this.options.footer) {
				this._display.footer = new Element('div', {'class': 'modal-footer'});
				this._display.modal.adopt(this._display.footer.adopt(this.options.footer));
			}

			if (this.options.content)
				this.setContent(this.options.content);

			this._display.modal.inject(this._display.root);

			if (this.options.closable) {
				this._display.blend.addEvent('click', function() {
					root.hide();
				});

				var closeX = new Element('a', {'class': 'close', 'html': '×'})
				closeX.addEvent('click', function() {
					root.hide();
				});
				this._display.modal.adopt(closeX);
			}

			this._parent.addEvent('resize', function() {
				root.setPosition();
			});

			this._display.modal.setStyle('display', 'none');

			if ( this.options.minHeight )
				this._display.content.setStyle('minHeight', this.options.minHeight);


			if ( typeOf(this.options.maxHeight) == 'number' )
				root.setMaxHeight(this.options.maxHeight);

			else if ( this.options.maxHeight == 'auto' ) {
				window.addEvent('resize', function() {
					if ( !root.isOpen )
						return;

					root.setMaxHeight();
				});

				root.setMaxHeight();
			}

		} catch(e) { gx.util.Console('gx.bootstrap.Popup->build', e.message); }
	},

	/**
	 * @method setTitle
	 * @description Sets the title of the popup
	 * @param {string} title The title to set
	 */
	setTitle: function(title) {
		this._display.title.set('html', title);
	},

	/**
	 * @method setContent
	 * @description Sets the content of the popup
	 * @param {string} content The content to set
	 */
	setContent: function(content) {
		try {
			this._display.content.empty();
			switch (typeOf(content)) {
				case 'element':
				case 'elements':
				case 'textnode':
					this._display.content.adopt(content);
					break;
				case 'object':
					this._display.content.adopt(__(content));
					break;
				case 'string':
				case 'number':
					this._display.content.set('html', content);
					break;
			}
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->initialize', e.message); }
	},

	getContent: function() {
		return this._display.content;
	},

	setMaxHeight: function(height, adjust) {

		if ( !height ) {
			height = window.getSize().y;

			if ( adjust )
				height -= adjust;

			if ( this._display.footer )
				height -= this._display.footer.getSize().y;

			if ( this._display.header )
				height -= this._display.header.getSize().y;
		}

		this._display.content.setStyle('maxHeight', height);
	},

	/**
	 * @method setPosition
	 * @description Sets the popup position
	 * @param {string} x Horizontal position (left, right, center)
	 * @param {string} y Vertical position (top, bottom, center)
	 */
	setPosition: function(x, y) {
		var root = this;
		if (this.options.borderbox == false)
			return;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			this.getCoordinates();
			var coordinates = this._display.modal.getCoordinates();

			if (x == 'left')
				this._display.modal.setStyle('left', 0);
			else if (x == 'right')
				this._display.modal.setStyle('left', this._coordinates.width - coordinates.width);
			else if (x == 'center')
				this._display.modal.setStyle('left', (this._coordinates.width - coordinates.width)/2);
			else
				this._display.modal.setStyle('left', x);

			if (y == 'top')
				this._display.modal.setStyle('top', 0);
			else if (y == 'bottom')
				this._display.modal.setStyle('top', this._coordinates.height - coordinates.height);
			else if (y == 'center')
				this._display.modal.setStyle('top', (this._coordinates.height - coordinates.height)/2);
			else
				this._display.modal.setStyle('top', y);
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->setPosition: ', e.message); }
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
			this._display.blend.setStyle('z-index', zindex-1);

			var morph = new Fx.Morph(this._display.modal, {
				'onStart': function() {
					root._display.modal.setStyle('display', 'block');
				}
			});
			this.lock(1);
			morph.start({
				'opacity': 1
			});
			this.setPosition();
			this.isOpen = true;
			this.fireEvent('show', [options]);
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->show: ', e.message); }
	},

	/**
	 * @method hide
	 * @description Hides the popup
	 */
	hide: function() {
		var root = this;
		try {
			gx.bootstrap.PopupMeta.unregister(this)

			var morph = new Fx.Morph(this._display.modal, {
				'onComplete': function() {
					root._display.modal.setStyle('display', 'none');
				}
			});
			this.lock(0);
			morph.start({
				'opacity': 0
			});
			this.isOpen = false;
			this.fireEvent('hide');
		} catch(e) { gx.util.Console('gx.bootstrap.Popup->hide: ', e.message); }
	},

	destroy: function() {
		gx.bootstrap.PopupMeta.unregister(this);

		[
			this._ui.blend,
			this._display.blend,
			this._ui.modal,
			this._display.modal
		].each(function(item) {
			if ( item != null ) {
				item.destroy();
			}
		});

		delete this;

	},

	doDestroy: function() {
		this.destroy();
	}
});
