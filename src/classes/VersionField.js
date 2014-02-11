/**
 * @class gx.bootstrap.Field
 * @description Creates a single field for a gx.bootstrap.Field and gx.bootstrap.Form
 * @extends gx.ui.Container
 *
 * @param {element|string} display The display element
 *
 * @option {string} label The title for the fieldset
 * @option {object} type The field type: text, password, file, checkbox, select
 * @option {object} default The default value
 * @option {string} description The field description
 * @option {string} hightlight The default highlight class (error, warning, success)
 */
gx.bootstrap.VersionField = new Class({

	gx: 'gx.bootstrap.VersionField',

	Extends: gx.ui.Container,

	options: {

	},

	_display: {},

	initialize: function(options) {
		var root = this;
		try {
            this.parent(null, options);
            this._display.major = this.createSelect(1, 9);
            this._display.minor = this.createSelect(0, 99);
            this._display.maintenance = this.createSelect(0, 9);
			this._display.root.adopt(
                this._display.major,
                this._display.minor,
                this._display.maintenance
            );

            this._display.major.addEvent('change', function(event){
				root.fireEvent('change', [event]);
			});
            this._display.minor.addEvent('change', function(event){
				root.fireEvent('change', [event]);
			});
            this._display.maintenance.addEvent('change', function(event){
				root.fireEvent('change', [event]);
			});

		} catch(e) { gx.util.Console('gx.bootstrap.VersionField->initialize', e.message); }
	},
	/**
	 * @method getValue
	 * @description Get the current field value
	 * @return {string|bool|null}
	 */
	getValue: function() {
        return this._display.major.get('value') + this._display.minor.get('value') + this._display.maintenance.get('value');
	},
	/**
	 * @method setValue
	 * @description Sets a single form value
	 * @param {mixed} value
	 */
	setValue: function(version) {
        version = version+'';
        this._display.major.selectedIndex = version.substr(0,1) - 1;
        this._display.minor.selectedIndex = version.substr(1,2);
        this._display.maintenance.selectedIndex = version.substr(3,1);
	},
	/**
	 * @method createSelect
	 * @description Helper to create select elements
	 * @param {mixed} value
	 */
    createSelect: function(from, to) {
        var select = new Element('select.form-control', {'style': 'width:80px; display: inline;'});
        var add = (''+to).length;
        for ( i = from; i <= to; i++ ){
            var value = ''+i;
            while ( value.length < add ) {
                value = '0' + value;
            }
            select.adopt(new Element('option', {'value': value, 'html': value}));
        }
        return select;
    }
});

gx.bootstrap.VersionField.format = function(version) {
    version = version + '';
    return version.substr(0,1) + '.' + version.substr(1,2) + '-' + version.substr(3,1);
}