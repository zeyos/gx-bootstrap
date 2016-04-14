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

/**
 * Zeyos svg icon.
 */
Templates.register('zeyosSvgIcon', function(e, d) {
  var icon = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  icon.setAttribute('viewBox', '0 0 64 64');
  var pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');

  var path;
  if ( d === 'inventory' )
    path = 'M51.5,6.1l-11.2,4.1,1.6,4.2-6,2.2-1.6-4.2-11.2,4.1c-0.9,0.3-1.3,1.2-1,2.1l10.3,28.3c0.3,0.9,1.2,1.3,2.1,1l11.2-4.1-1.6-4.2,6-2.2,1.6,4.2,11.2-4.1c0.9-0.3,1.3-1.2,1-2.1l-10.3-28.3c-0.3-0.9-1.2-1.4-2.1-1zm-14.4,49.9l-1.5-4,21.5-7.8,1.5,4-21.5,7.8zm-10.7-5.8c-3.7,1.4-5.6,5.4-4.2,9.1s5.4,5.6,9.1,4.2,5.6-5.4,4.2-9.1-5.4-5.5-9.1-4.2zm3.7,10.1c-1.9,0.7-3.9-0.3-4.7-2.1s0.3-3.9,2.1-4.7c1.9-0.7,3.9,0.3,4.7,2.1,0.8,1.9-0.2,4-2.1,4.7zm-29.4-54.8l-0.7,4.2,10,1.8,14,38.6,4.1-1.5-14.8-40.9-12.6-2.2z';
  else if ( d === 'storage' )
    path = 'M60.995,4h-57.99c-0.57419,0-1.0048,0.4306-1.0048,1.0048v57.99c0,0.57378,0.4306,1.0048,1.0048,1.0048h57.99c0.57379,0,1.0048-0.431,1.0048-1.005v-57.99c0.144-0.43058-0.287-1.0048-1.005-1.0048zm-1.005,2.1531v26.842h-55.837v-26.842h55.837zm-23.253,55.837h-9.4737v-20.526h9.4737v20.526zm2.1531,0v-21.531c0-0.57416-0.43064-1.0048-1.0048-1.0048h-11.627c-0.57415,0-1.0048,0.43062-1.0048,1.0048v21.53h-21.1v-26.842h55.837v26.842h-21.1zm-28.565-49.952,8.3254,0,0,14.354-8.3254,0zm17.368,0,8.3254,0,0,14.354-8.3254,0zm17.512,0,8.3254,0,0,14.354-8.3254,0zm0,28.421,8.3254,0,0,14.354-8.3254,0zm-34.88,0,8.3254,0,0,14.354-8.3254,0z';

  pathElement.setAttribute('d', path);
  icon.appendChild(pathElement);

  return icon;
});

})();
