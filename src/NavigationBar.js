/**
 * @class gx.bootstrap.NavigationBar
 * @description Creates a tabbed navigation box
 * @extends gx.ui.Tabbox
 * @implements gx.util.Console
 *
 * @param {node} display: The target node
 *
 * @option {array} frames: The array containing the frames. [{name: STRING, title: STRING, content: NODE/HTML}]
 * @option {int} height: The height of the content area
 * @option {int} show: The first tab to show
 * @option {function} onChange: Called when the tab is changed
 *
 * @event change When the tab is changed
 */
gx.bootstrap.NavigationBar = new Class({
	gx: 'gx.bootstrap.Tabbox',
	Extends: gx.ui.Tabbox,
	options: {
	},
	_tabs: {},
	_buttons: {},

	/**
	 * @method build
	 * @description Builds the HTML frame (my vary for derived classes)
	 * @return {element}
	 */
	build: function() {

		try {
			this._display.root.addClass('tabbable');

			this._display = Object.merge({}, this._display, {
				'navbar'     : new Element('div', {'class': 'navbar'}),
				'navbarinner': new Element('div', {'class': 'navbar-inner'}),
                'title'      : new Element('div', {'class': 'brand'}),
				'tablist'    : new Element('ul', {'class': 'nav'}),
				'content'    : new Element('div', {'class': 'tab-content', 'styles': {'overflow': 'auto'}}),
				'buttons'    : new Element('div', {'style': 'float: right'}),
			});

			if (this.options.height)
				this._display.content.setStyle('height', this.options.height);

			this._display.navbarinner.adopt(this._display.title, this._display.tablist, this._display.buttons);
			this._display.navbar.adopt(this._display.navbarinner);
			this._display.root.adopt(this._display.navbar, this._display.content);

		} catch(e) { gx.util.Console('gx.bootstrap.NavigationBar->build', e.message); }

		return this._display.root;
	},

	/**
	 * @method setTitle
	 * @description Set title attributes
	 * @param {object} attributes
	 * @return {element}
	 */
    setTitle: function(attributes) {
    	switch (typeOf(attributes)) {
    		case 'element':
    			this._display.title.empty();
    			return this._display.title.adopt(attributes);
    		case 'string':
    			return this._display.title.set('html', attributes);
    		default:
    			return this._display.title.set(attributes);
    	}
    },

	/**
	 * @method setTabTitle
	 * @description Set title of a tab
	 * @param {string} name The name of the tab.
	 * @param {string} name The new title.
	 */
    setTabTitle: function(tab, title) {
        this._tabs[tab].getFirst('a').set({'html': title});
    },

	/**
	 * @method setNavigationButtons
	 * @description Set title of a tab
	 * @param {string} name The name of the tab.
	 * @param {string} name The new title.
	 */
	setNavigationButtons: function(buttons) {
		this._display.buttons.empty();
		this._display.buttons.adopt(buttons);
	},

	/**
	 * @method buildTab
	 * @description Builds the HTML element for a single tab
	 * @param {string} name
	 * @param {string} title
	 * @return {element}
	 */
	buildTab: function(name, title) {
		var root = this;

		var link = new Element('a', {'html': title.replace(/ /g, '&nbsp;')});
		var tab = new Element('li');
		tab.adopt(link);
		this._display.tablist.adopt(tab);
		link.addEvent('click', function() {
			root.openTab(name);
		});
		this._tabs[name] = tab;

		return tab;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {element} content
	 * @return {element}
	 */
	buildContent: function(content) {
		var wrapper = new Element('div', {'class': 'tab-pane'}).adopt(content);
		this._display.content.adopt(wrapper);
		return wrapper;
	},

	/**
	 * @method setHighlight
	 * @description Builds the HTML element for the content section
	 * @param {string} name The name of the tab
	 * @param {string} content The contents of the highlight
	 * @param {string} style The style class (default is "important")
	 * @return {void}
	 */
	setHighlight: function(name, content, style) {
		if (this._tabs[name] != null) {
			var span = this._tabs[name].getElement('span');
			if (span != null)
				span.destroy();

			if (style == null)
				style = 'important';

			if (content != null) {
				span = new Element('span', {'class': 'label label-'+style, 'html': content});
				span.inject(this._tabs[name], 'top');
			}
		}
	}
});
