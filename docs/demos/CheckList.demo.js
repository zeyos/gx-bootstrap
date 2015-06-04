(function() {

    var CheckList = new gx.bootstrap.Checklist(null, {
        'height': 200,
        'getItemValue': function(elem) {

            return elem.label;
        },
        'url': window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1) + 'data/checklist.php'

    });


    $(document.body).adopt(__({

        "children": [{
                'tag': 'h5',
                'html': 'gx.bootstrap.CheckList'
            }, {
                'class': 'pad-10',
                'children': [{
                    'class': 'pad-5',
                    'child': CheckList
                }]
            },
            {   
                "class":"btn btn-info",
                "text":"Get value",
                "tag":"button",
                'onClick': function() {
                    var value = CheckList.getValues();
                    alert(value.join());
                }
            }
        ]
    }))
})();