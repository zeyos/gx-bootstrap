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
		this._display.windows = new Element('div', {'class': 'gxMessage', 'styles': {
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
			var stat = new Element('div', {'class': 'gxMessageStatus'});
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
