(function() {
    var CheckButton = new gx.bootstrap.CheckButton(null, {
        size: 'lg', // The Bootstrap size modifier (lg: large, xs: small)
        value: 1,
        label: ['I am checked', 'I am unchecked']
    });

    // Demo Injection
    $(document.body).adopt(__({
        'children': [{
            'tag': 'h5',
            'html': 'gx.bootstrap.CheckButton'
        }, {
            'class': 'pad-10',
            'children': [{
                'tag': 'label',
                'html': 'Selection demo:'
            }, {
                'class': 'pad-5',
                'child': CheckButton
            }]
        }, {
            'class': 'p-10 bg-E',
            'children': {
                btnCheckGetValue: {
                    'tag': 'button',
                    'class': 'btn btn-primary mright-10',
                    'html': 'Get value',
                    'onClick': function() {
                        alert(CheckButton.get() ? 'Checked' : 'Unchecked');
                    }
                },
                btnCheckToggle: {
                    'tag': 'button',
                    'class': 'btn btn-default',
                    'html': 'Toggle value',
                    'onClick': function() {
                        CheckButton.toggle();
                    }
                }
            }
        }]
    }));
})();