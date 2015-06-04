(function() {

    var timebox = new gx.bootstrap.Timebox();
  
    (document.body).adopt(__({
        "children": [{
                'tag': 'h5',
                'html': 'gx.bootstrap.Timebox'
            }, {
                'class': 'pad-10',
                'children': [{
                    'class': 'pad-5',
                    'children': [{
                    'class': 'btn',
                    'tag': "button",
                    'text':"Show",
                    'onClick': function() {
                        timebox.build();
                   }
                }]
                }]
            }]
        }))
})();