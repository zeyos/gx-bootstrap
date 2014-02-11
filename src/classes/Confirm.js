/**
 * @class gx.bootstrap.Confirm
 * @description Acting like browser native confirm.
 * @extends gx.ui.Dropup
 *
 * @option {function} refuse Called if user cancel operation.
 * @option {function} accept Called if user accept operation.
 */
gx.bootstrap.Confirm = new Class({
    Extends: gx.bootstrap.Dropup,

    options: {
        'width': 'auto',
        'refuse': function(){},
        'accept': function(){},
        'closable': true
    },

    initialize: function(options) {
        if ( typeOf(options.content) == 'string' )
            options.content = new Element('h3', {'html': ''+options.content, 'style': 'margin-top:35px;'});

        var root = this;
        if ( options.footer == null ) {
            options.footer = [
                new Element('button', {
                    'class': 'btn btn-danger',
                    'html': '<span class="glyphicon glyphicon-remove"></span> Cancel',
                    'events': {
                        'click': function() {
                            root.hide();
                        }
                    }
                }),
                new Element('button', {
                    'class': 'btn btn-default',
                    'html': '<span class="glyphicon glyphicon-ok"></span> Ok',
                    'events': {
                        'click': function() {
                            root.hide(true);
                            root.options.accept();
                        }
                    }
                })
            ];
        }

        this.parent(options);

        this.show();
    },
    hide: function(suppress) {
        this.parent();
        this.destroy();

        if ( suppress !== true )
            this.options.refuse();
    }
});