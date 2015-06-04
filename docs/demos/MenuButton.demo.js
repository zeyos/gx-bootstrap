

(function() {

    var MenuButton = new gx.bootstrap.MenuButton(null,{
    	'size': 'mini',
		'style': '',
		'label': 'hallo',
		'entries': ["hallo","test"],
		'orientation': 'left',
		'direction': 'down'
    });

    (document.body).adopt(__({
        "children": [{
            'tag': 'h5',
            'html': 'gx.bootstrap.MenuButton'
        }, {
            'class': 'pad-10',
            'children': [{
                'child': MenuButton
            }]
        }]
    }))
})();