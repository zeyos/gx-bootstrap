(function() {


    var multiValueEditor = new gx.bootstrap.MultiValueEditor();
    (document.body).adopt(__({
        "children": [{
                'tag': 'h5',
                'html': 'gx.bootstrap.MultiValueEditor'
            }, {
                'class': 'pad-10',
                'children': [{
                    'class': 'pad-5',
                    'child': multiValueEditor,   
                }]
            }]
        }))
})();