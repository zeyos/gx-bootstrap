/**
 * @class gx.bootstrap.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Table
 * @implements gx.util.Console
 * @sample Table
 *
 * @event click
 * @event dblclick
 * @event filter
 * @event rowAdd
 * @event addData
 * @event setData
 * @event complete
 * @event beforeRowAdd
 * @event afterRowAdd
 *
 * @option {array} cols The table column structure
 * @option {function} structure Formatting row data into columns (returns an array)
 * @option {array} data The list data
 * @option {bool} onClick when a row is clicked
 * @option {bool} onFilter when a filter is set
 * @option {bool} onRowAdd when a row is added
 * @option {bool} onStart when the table is being rendered
 * @option {bool} onComplete when the table is rendered completely
 */
gx.bootstrap.Table = new Class({
	gx: 'gx.bootstrap.Table',
	Extends: gx.ui.Table,

	theme: {
		'asc': 'asc',
		'desc': 'desc',
		'th': 'th',
		'filter': 'filter',
		'table_body': 'fixed table table-striped table-hover',
		'table_head': 'fullw table-head',
		'filter_elem': 'span'
	}
});
