(function() {

    var popup = new gx.bootstrap.Popup({
        "title": "Header",
        "content": "Body",
        "footer": new Element("button", {
            "class": "btn btn-warning",
            "text": "close"
        }).addEvent("click", function() {
            popup.hide();
        })
    });

    (document.body).adopt(__({
        "children": [{
            'tag': 'h5',
            'html': 'gx.bootstrap.popup'
        }, {
            'class': 'pad-10',
            'children': [{
                'class': 'btn btn-warning',
                'tag': "button",
                'text': "Popup",
                'onClick': function() {
                    popup.show();
                }
            }]
        }]
    }))
})();