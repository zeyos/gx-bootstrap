(function() {
    var SelectPrio = new gx.bootstrap.SelectPrio();

    var SelectFilter = new gx.bootstrap.SelectFilter();
    (new Request({
        url: './data/select.json',
        onSuccess: function(json) {
            SelectFilter.setData(JSON.decode(json));
        }
    })).send();

    var SelectDyn = new gx.bootstrap.SelectDyn(null, {
        'url': window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1) + 'data/select.php',
        'onRequestSuccess': function(json) {
            this.setData(JSON.decode(json));
        }
    });

    // Demo Injection
    $(document.body).adopt(__({
        'children': [{
            'tag': 'h5',
            'html': 'gx.bootstrap.Select'
        }, {
            'class': 'pad-10',
            'children': [{
                'tag': 'label',
                'html': 'Selection demo:'
            }, {
                'class': 'pad-5',
                'child': SelectPrio
            }, {
                'class': 'pad-5',
                'child': SelectFilter
            }, {
                'class': 'pad-5',
                'child': SelectDyn
            }]
        }, {
            'class': 'p-10 bg-E',
            'children': {
                btnSelectValue: {
                    'tag': 'button',
                    'class': 'btn btn-primary mright-10',
                    'html': 'Get selection',
                    'onClick': function() {
                        alert(JSON.encode(SelectFilter.getSelected()));
                    }
                },
                btnSelectReset: {
                    'tag': 'button',
                    'class': 'btn btn-default',
                    'html': 'Reset',
                    'onClick': function() {
                        SelectFilter.set();
                    }
                }
            }
        }]
    }));
})();