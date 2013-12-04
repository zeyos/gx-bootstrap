/**
 * @class gx.bootstrap.FieldImgUpload
 * @description Creates a image upload field. Images has fixed height and width. Returned value always null. Handle saving by upload form server side!
 * @extends gx.bootstrap.Field
 *
 * @param {object} options The options.
 *
 * @option {string} position 'regular' | 'large' for large sizes! | 'small' for small sizes
 * @option {integer} height
 * @option {integer} width
 * @option {string} inputname The form input name of the file send.
 * @option {string} uploadurl Upload url.
 * @option {object} params Alternative request parameters.
 * @option {string} imageurl Url to display the uploaded image.
 * @option {string} placeholder Url for a placeholder image.
 * @option {integer} finishdelay How long show green finished styling (error, success).
 * @option {function} showError Function to show errors. Defaults to show error by field highlighting.
 * @option {function} parseResponse Function to parse the upload request response.
 */
gx.bootstrap.FieldUpload = new Class({
	Extends: gx.bootstrap.Field,

	options: {
		position: 'regular',
		height: 60,
		width: 60,
		inputname: 'upload',

		uploadurl: './index.php',
		params: {},
		imageurl: '',
		placeholder: null,
		finishdelay: 2000,

		disabledMessage: 'Disabled',
		hintpos: 'bottom',

		showError: function(self, error) {
			self.error(error);
			console.log('gx.bootstrap.FieldImgUpload: Upload error', error);
		},

		parseResponse: function(self, response, callback) {
			var res;
			try {
				res = JSON.decode(response);
			} catch (e) {
				self.options.showError(self, 'Could not parse server response: ' + response);
				return;
			}

			if (res.error != null) {
				self.options.showError(self, res.error);

			} else {
				callback(res.result);
			}

		}
	},

	running: false,
	disabled: false,

	initialize: function(options) {
		if ( options.type == null )
			options.type = new Element('div');

		this.parent(options);

		this.create();
	},

	/**
	 * @method create
	 * @description Create the dom elements.
	 */
	create: function() {
		this._ui.root.addClass('gxBootsrapImgUpload ' + this.options.position);

		// adopt our controls on bottom of the help-block
		this._display.controlwrapper.adopt(this.options.type);

		var root = this;
		// will be invisible. this is for the clicking
		this._ui.select = __({
			'tag'     : 'input',
			'type'    : 'file',
			'title'   : 'Drop File or Click',
			'styles': {
				'height': this.options.height,
				'width': this.options.width
			},
			'onChange': function(){
				root.processFiles(this.files);
			},
			'onClick': function() {
				if ( root.running )
					return false;

				if ( root.disabled ) {
					root.displayDisabled();
					return false;
				}

				return true;
			}
		});

		this._ui.progressText = new Element('span', {
			'class': '',
			'html': '40 / 100'
		});
		this._ui.progressAbort = new Element('span', {
			'class': 'glyphicon glyphicon-remove',
			'events': {
				'click': this.abort.bind(this)
			}
		});
		this._ui.progress = new Element('div', {
			'class': 'progress-bar',
			'style': 'width: 40%;'
		});

		this._ui.image = new Element('div', {
			'class': 'image',
			'styles': {
				'height': this.options.height,
				'width': this.options.width
			}
		});

		this._ui.placeholder = new Element('img', {
			'class': 'placeholder',
			'src': ''
		});

		this._ui.image.adopt(
			this._ui.placeholder,
			new Element('div.textprogress').adopt(
				new Element('div.blend'),
				this._ui.progressText,
				this._ui.progressAbort,
				new Element('div.progress').adopt(
					this._ui.progress
				)
			),
			this._ui.select // must be on top!
		);

		if ( this.options.placeholder )
			this._ui.placeholder.setStyle('background-image', 'url(' + this.options.placeholder + ')');

		this.injectImageArea(this._ui.image);

		this.initDrop(this._ui.image);

		if ( this.options.default )
			this.setValue(this.options.default);
	},

	/**
	 * @method injectImageArea
	 * @description Create the dom elements. Supposed to override from clients for additional positioning
	 * @param {element} area The image area element
	 */
	injectImageArea: function(area) {
		if ( this.options.position == 'regular' || this.options.position == 'small' ) {
			area.inject(this._display.field);
			return;

		} // else if (this.options.position == 'wide')

		// inject into empty div to get absolute position relative to body content
		// and inject this absolute div inside a clearing floating div to get
		// positioning on the bottom of the label, description and highlighting
		new Element('div', {
			'styles': {
				'clear'   : 'both'
			}
		}).adopt(
			new Element('div', {
				'styles': {
					'position': 'absolute',
					'left'    : '0px'
				}
			}).adopt(area)

		).inject(this._display.root);

	},

	initDrop: function(area) {
		var root = this;
		area.ondragover = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.addClass('access');
			return false;
		};
		area.ondragenter = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.addClass('access');
			return false;
		};
		area.ondragleave = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.removeClass('access');
			return false;
		};
		area.ondragend = function() {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			area.removeClass('access');
			return false;
		};
		area.ondrop = function(event) {
			if ( root.running )
				return false;

			if ( root.disabled ) {
				root.displayDisabled();
				return false;
			}

			event.stopPropagation();
			event.preventDefault();

			if ( root.running )
				return;

			area.removeClass('access');
			root.processFiles(event.dataTransfer.files);
		};

	},

	/**
	 * @method processFiles
	 * @description Upload the selected files via ajax.
	 * @param File[] files Array of files to get uploaded.
	 **/
	processFiles: function(files) {
		var formData = new FormData();

		this.setActive();

		var file = files[0];
		formData.append(this.options.inputname, file);
		for ( var key in this.options.params )
			if ( this.options.params.hasOwnProperty(key) )
				formData.append(key, this.options.params[key]);

		var self = this;
		this.xhr = new XMLHttpRequest();
		this.xhr.open('POST', this.options.uploadurl);
		this.xhr.onload = function() {
			if ( this.status != 200 ) {
				self.options.showError(self, 'Invalid load status: ' + this.status);
				return;
			}

			self.progress(100);
			self.options.parseResponse(self, this.responseText, function(response){
				self.setImage(response);
				self.finish();

			});
		};

		this.xhr.onerror = function(event) {
			self.options.showError(self, 'Error: ' + res.error);
		};

		this.xhr.upload.onprogress = function (event) {
			if (event.lengthComputable) {
				var complete = (event.loaded / event.total * 100 | 0);
				self.progress(complete);
			}
		};
		this.xhr.send(formData);
	},
	/**
	 * @method setActive
	 * @description Show progress and set running true. Disable drop and click event.
	 **/
	setActive: function() {
		this.running = true;
		this.setHighlight();
		this._ui.progress.removeClass('progress-bar-success');
		this._ui.progress.removeClass('progress-bar-danger');
		this._ui.progress.removeClass('progress-bar-warning');
		this._ui.progress.setStyle('width', '0%');
		this._ui.image.addClass('active');
		this._ui.progressAbort.show();
	},
	/**
	 * @method abort
	 * @description Abort current upload.
	 **/
	abort: function() {
		if ( this.xhr )
			this.xhr.abort();

		this._ui.progressAbort.hide();
		this.setHighlight('', 'warning');
		this._ui.progress.addClass('progress-bar-warning');
		(function() {
			this.setHighlight();
			this._ui.progress.removeClass('progress-bar-warning');
			this._ui.image.removeClass('active');

		}.bind(this)).delay(this.options.finishdelay);

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method error
	 * @description Display error width field highlighting
	 **/
	error: function(error) {
		this.setHighlight(error, 'error');
		this._ui.progress.addClass('progress-bar-danger');
		this._ui.progressAbort.hide();

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method finish
	 * @description Finish successful upload. Activating drop and click events, hiding progress
	 **/
	finish: function() {
		this.setHighlight('', 'success');
		this._ui.progress.addClass('progress-bar-success');
		this._ui.progressAbort.hide();
		(function() {
			this.setHighlight();
			this._ui.progress.removeClass('progress-bar-success');
			this._ui.image.removeClass('active');

		}.bind(this)).delay(this.options.finishdelay);

		this._ui.select.erase('value');
		this.running = false;
	},
	/**
	 * @method progress
	 * @description Update progress visualization.
	 **/
	progress: function(percent) {
		this._ui.progress.setStyle('width', percent+'%');
		this._ui.progressText.set('html', percent+'%');
	},
	/**
	 * @method setValue
	 * @description Set image. Maybe be subclassed from clients for specific functionality.
	 **/
	setValue: function(src) {
		this.setImage(src);
	},
	getValue: function() {
		// no value cause handled by the php upload form!
		return null;
	},
	/**
	 * @method setImage
	 * @description Set the src attribute of the image placeholder.
	 **/
	setImage: function(src) {
		this._ui.placeholder.set('src', this.options.imageurl + src);
	},
	reset: function(){},

	setDisabled: function(disable) {
		this.disabled = disable;
		if ( this.disabled )
			this._ui.root.addClass('disabled');
		else
			this._ui.root.removeClass('disabled');
	},

	displayDisabled: function() {
		this.setHighlight(this.options.disabledMessage, 'warning');

		(function() {
			this.setHighlight();
		}).delay(2000, this);
	}
});