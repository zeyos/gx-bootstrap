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
