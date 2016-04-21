/**
 * File providing general purpose html templates.
 *
 */
(function() {
  'use strict';

var arrSlice = Array.prototype.slice;

var Templates = gx.ui.Templates;

/**
 * Bootstrap icon
 *
 */
Templates.register('icon', function(e, d) {
  return e('span', '.=glyphicon glyphicon-' + d, arrSlice.call(arguments, 2));
});

/**
 * Bootstrap button
 *
 */
Templates.register('button', function(e, d) {
  if ( typeof d === 'string' )
    d = {type: d};

  return e(d.tag || 'button',

    d.label || '',
    '.=btn btn-' + (d.type || 'primary') + ' ' + (d.className || ''),
    d.ref ? ':=' + d.ref : null,
    arrSlice.call(arguments, 2)
  );
});


/**
 * Bootstrap panel.
 *

<div class="panel panel-default">
  <div class="panel-heading">
    <h3 class="panel-title">Panel title</h3>
  </div>
  <div class="panel-body">
    Panel content
  </div>
</div>

  */
Templates.register('panel', function(e, d) {
  var head = null;

  if ( d.head ) {
    head = e('div', '.=panel-heading',
      e('h3', '.=panel-title', d.head)
    );
  }

  return e('div', '.=panel panel-' + (d.type || 'default'),
    head,
    e('div', '.=panel-body',
      d.body || arrSlice.call(arguments, 2)
    )
  );
});

/**
 * Bootstrap form group.
 *
 * options {
 *    controlElement {Element} To provide your own form control element
 *    type {string} Form control element type
 *    ref {string} Id of the input element AND the value to store a reference to
 *        that very control: this._ui.inputField_myRefId
 *
 *    value
 *    label {string} Text string
 *    labelHtml {string} Html string
 *    placeholder
 *
 *    fullEmptyLabel {boolean} Add full with emtpy label. E.g. to properly
 *        place buttons in a horizontal form.
 * }
 *
 */
Templates.register('formGroup', function(e, d) {
  var id = d.ref || '';

  var label = e('label', '.=control-label', {'for': id});
  if ( d.label === false )
    label = null;
  else if ( d.label )
    label.appendText(String(d.label).htmlSpecialChars());
  else if ( d.labelHtml )
    label.set('html', d.labelHtml);

  if ( d.fullEmptyLabel )
    label.set('html', '&nbsp;').setStyle('width', '100%');

  var inputTag = 'input';
  if ( d.type === 'textarea' )
    inputTag = 'textarea';
  else if ( d.type === 'select')
    inputTag = 'select';

  var control;
  if ( d.controlElement ) {
    var obj = d.controlElement;
    control = $(d.controlElement);

  } else {
    control = e(inputTag,
      id ? ':=inputField_' + id : null,
      '.=form-control', {
      value: d.value || '',
      type: d.type || 'text',
      'placeholder': d.placeholder || '',
    });
  }

  if ( d.name )
    control.set('name', d.name);
  if ( d.id )
    control.set('name', d.id);
  if ( d.class )
    control.addClass(d.class);

  if (inputTag === 'select') {
    for ( var val in d.options ) {
      if ( !d.options.hasOwnProperty(val) )
        continue;

      control.adopt(e('option', d.options[val], {'value': val}));
    }
  }

  return e('div', '.=form-group',
    label,
    control,
    arrSlice.call(arguments, 2)
  );
});

})();
