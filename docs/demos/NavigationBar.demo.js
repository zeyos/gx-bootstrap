(function() {

    var navigationBar = new gx.bootstrap.NavigationBar({
        "frames":[{
            "name":"test",
            "title":"test",
            "content":"test"
        }]
    });



    (document.body).adopt(__({
        "children": [{
            'tag': 'h5',
            'html': 'gx.bootstrap.NavigationBar'
        }, {
            'class': 'pad-10',
            'children': [{
                'class': 'pad-5',
                'children': [{
                'child': navigationBar,
                "text":"add",
                'class': 'btn',
                'tag': "button",
                "onClick": function(){
                    navigationBar.addTab();
                }
            }]
            }]
        }]
    }))
})();