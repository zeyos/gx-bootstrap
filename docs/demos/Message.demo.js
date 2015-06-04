(function() {

    var message = new gx.bootstrap.Message();

    (document.body).adopt(__({
        "children": [{
                'tag': 'h5',
                'html': 'gx.bootstrap.Message'
            }, {
                'class': 'pad-10',
                'children': [{
                    'class': 'pad-5',
                    "children": [{
                    "class":"btn btn-success",
                    "text": "Message",
                    'tag':'button',
                    'onClick': function(){
                        message.addMessage();
                    }
                    }]
                }]
            }]
        }))
})();