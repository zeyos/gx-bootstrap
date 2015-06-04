(function() {

    var valueList = new gx.bootstrap.ValueList();

    (document.body).adopt(__({
        "children": [{
            'tag': 'h5',
            'html': 'gx.bootstrap.ValueList'
        }, {
            'class': 'pad-10',
            'children': [{
                'class': 'pad-5',
                'children': [{
                    'child': valueList
                }]
            }]
        }]
    }))
})();