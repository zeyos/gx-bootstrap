(function() {
    var data = [
        {'customername': 'HyperFlyer', 'customernum': '1003', 'lastmodified': '1220454105'},
        {'customername': 'InScreen Design', 'customernum': '1004', 'lastmodified': '1220454283'},
        {'customername': 'GlobalSpin Travel Agency', 'customernum': '1005', 'lastmodified': '1220454466'},
        {'customername': 'nTronic AG', 'customernum': '1001', 'lastmodified': '1220453517'},
        {'customername': 'CleanTexx', 'customernum': '1002', 'lastmodified': '1220454105'}
    ];
    var Table = new gx.bootstrap.Table(null, {
        'cols': [
            {'label': 'Name', 'id': 'customername'},
            {'label': 'Number', 'id': 'customernum', 'text-align': 'right'},
            {'label': 'Last change', 'id': 'lastmodified'}
        ],
        'structure': function(row) {
            return [
                row.customername,
                row.customernum,
                new Date(row.lastmodified * 1000).format('%d.%m.%Y %H:%M')
            ];
        },
        'data': data,
        'scroll': true,
        'selectable': true,
        'onClick': function(row) {
            console.log(row.customernum);
        },
        'onFilter': function(col, mode) {
            alert(col.id + ': ' + mode);
        }
    });

    // Demo Injection
    $(document.body).adopt(__({'children': [
        {'tag': 'h5', 'html': 'gx.bootstrap.Table'},
        {'class': 'b-1', 'child': Table.display()},
        {'class': 'p-10 bg-E', 'children': {
            btnTableEmpty : {'tag': 'button', 'class': 'btn btn-default mright-10', 'html': 'Empty', 'onClick': function() {
                Table.empty();
            }},
            btnTableSet : {'tag': 'button', 'class': 'btn btn-default mright-10', 'html': 'Set data', 'onClick': function() {
                Table.setData(data);
            }},
            btnAddData : {'tag': 'button', 'class': 'btn btn-default mright-10', 'html': 'Add data', 'onClick': function() {
                var temp = Array.clone(data);
                temp.push({'customername': 'Another One', 'customernum': '12102', 'lastmodified': '1220454105'});
                Table.setData(temp);
            }},
            btnGetSelection : {'tag': 'button', 'class': 'btn btn-default', 'html': 'Get selection (console)', 'onClick': function() {
                console.log(Table.getSelection());
            }}
        }}
    ]}));
})();
