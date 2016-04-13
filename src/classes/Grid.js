/**
 * @class gx.bootstrap.Grid
 * @description Helper class to create easy bootstrap grids (container-fluid).
 * @extends gx.core.Settings
 *
 */
gx.bootstrap.Grid = new Class({
  Extends: gx.core.Settings,

  AT_ROOT: 1,
  AT_ROW: 2,
  AT_CELL: 3,

  options: {
    classes: ['md'], // Can be array of one or more of 'xs' | 'sm' | 'md' | 'lg' (bootstrap)
    rowLength: 12,
    automatedRows: true,
    nested: false,
  },

  /*
  isAt: null,
  rowLength: null,
  current: null,
  */
  parentGrid: null,
  initialize: function(display, options, parentGrid) {
    this.parentGrid = parentGrid;

    if ( typeof options === 'string' )
      options = {classes: [options]};

    this.parent(options);

    if ( typeof this.options.classes === 'string' )
      this.options.classes = [this.options.classes];

    this.parseClasses(this.options.classes);

    if ( !display )
      display = new Element('div');

    if ( this.options.nested !== true )
      display.addClass('container-fluid');

    this.root = display;

    this.isAt = this.AT_ROOT;
    this.current = this.root;
    this.options.rowLength = parseInt(this.options.rowLength);
    this.rowLength = this.options.rowLength;
  },

  toParent: function() {
    return this.parentGrid;
  },

  grid: function(display, options) {
    if ( typeof options === 'string' )
      options = {classes: [options]};

    var nestedGrid = new gx.bootstrap.Grid(display, Object.merge({}, this.options, {nested: true}, options || {}), this);
    this.current.adopt(nestedGrid);

    return nestedGrid;
  },

  row: function() {
    var parent = this.current;

    if ( this.isAt === this.AT_CELL )
      parent = this.root;
    else if ( this.isAt === this.AT_ROW )
      parent = parent.getParent();

    this.current = new Element('div.row');
    this.isAt = this.AT_ROW;
    this.rowLength = 0;

    parent.adopt(this.current);
    return this;
  },

  /**
   * Get current row or create one if none exists.
   * @return {Element}
   */
  currentRow: function() {
    if ( this.isAt === this.AT_CELL )
      return this.current.getParent();
    else if ( this.isAt === this.AT_ROW )
      return this.current;

    return this.row();
  },

  /**
   * Allowing various notions for grid columns classes and width. Like:
   * (3, '4:xs', '5', 'xs:6')
   * =>
   *
   * [3]
   * [4, "xs"]
   * ["5"]
   * [6, "xs"]
   *
   * @param  {[type]} arg
   * @return {[type]}
   */
  parseCellClassesFromPrimitive: function(arg) {
    if ( typeof arg === 'number' )
      return [arg];

    var s = String(arg).split(':');
    var l = s[0];
    var r = s[1];

    if ( !r )
      return [l];

    var lp = parseInt(l);
    if ( !Number.isNaN(lp) ) {
      return [lp, r];
    }

    return [
      parseInt(r),
      l,
    ];
  },

  cell: function() {
    var cell = new Element('div');
    var arg, type, sizes = [], children = [];

    var i, l;

    if ( arguments.length > 0 ) {
      for ( i = 0, l = arguments.length; i < l; i++ ) {
        arg = arguments[i];
        type = typeof arg;
        if ( type === 'number' )
          sizes.push([arg]);
        else if ( type === 'string' )
          sizes.push(this.parseCellClassesFromPrimitive(arg));
        else {
          children.push(arg);
        }
      }
    }

    if ( children.length > 0 )
      cell.adopt(children);

    if ( sizes.length === 0 )
      sizes.push([this.options.rowLength - this.rowLength]);

    var size;
    for ( i = 0, l = sizes.length; i < l; i++ ) {
      size = sizes[i];
      this.applyClasses(size[0], cell, size[1] ? this.parseClasses(size[1]) : null);
    }

    size = sizes[0];

    if ( this.options.automatedRows && this.rowLength >= this.options.rowLength ) {
      this.row();
    }

    var parent = this.current;
    if ( this.isAt === this.AT_CELL )
      parent = parent.getParent();
    else if ( this.isAt === this.AT_ROOT )
      parent = this.row();

    this.isAt = this.AT_CELL;
    this.rowLength += parseInt(size);
    this.current = cell;

    parent.adopt(this.current);
    return this;
  },

  toElement: function() {
    return this.root;
  },

  applyClasses: function(size, element, classes) {
    var i = 0;
    classes = classes || this.options.classes;
    var l = classes.length;
    for ( ; i < l; i++ ) {
      element.addClass(classes[i] + size);
    }
  },

  parseClasses: function(classes) {
    if ( typeof classes === 'string' )
      return ['col-' + classes + '-'];

    classes.forEach(function(name, index) {
      classes[index] = 'col-' + name + '-';
    });

    return classes;
  }
});
