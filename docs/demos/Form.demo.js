(function() {


    var formular = new gx.bootstrap.Form();
    var fieldset = new gx.bootstrap.Fieldset();
    var field = new gx.bootstrap.Field();

    (document.body).adopt(__({
        "children": [{
            'tag': 'h5',
            'html': 'gx.bootstrap.Form'
        }, {
            'class': 'pad-10',
            'children': [{
                'class': 'pad-5',
                'children': formular,
                "children": [{
                    "child": fieldset,
                    "children": [{
                    "child": field
                }]
                }]
            }]
        }]
    }))
})();