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
		return this.popups.length;
	}

	$(document.body).addEvent('keyup', function(event) {
		if (event.key == 'esc') {
			var popup = this.popups.getLast();
			if (popup != null && popup.options.closable)
				popup.hide();
		}
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
		'clickable'  : false
	},
	isOpen: false,
	initialize: function(options) {
		var root = this;
		try {
			this.parent(options);

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
			if (this.options['width'])
				this._display.dialog.setStyle('width', this.options['width']);

			// Adopt the content
			if (this.options.content)
				this._display.body.adopt(__(this.options.content));

			// Set the footer
			if (this.options.footer)
				this._display.footer.adopt(__(this.options.footer));

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
	}
});
