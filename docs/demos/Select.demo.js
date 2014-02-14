(function () {
	/*
	var gSelect = new gx.bootstrap.Select(null, {
		'url': window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + 'data/select.json',
		'width': '300px'
	});
	*/

	var SelectPrio = new gx.bootstrap.SelectPrio();
	var SelectFilter = new gx.bootstrap.SelectFilter();

	(new Request({url: './data/select.json', onSuccess: function(json) {
		SelectFilter.setData(JSON.decode(json));
	}})).send();

	// Demo Injection
	$(document.body).adopt(__({'children': [
		{'tag': 'h5', 'html': 'gx.bootstrap.Select'},
		{'class': '', 'children': [
			{'tag': 'label', 'html': 'Selection demo:'},
			SelectPrio,
			SelectFilter
		]},
		{'class': 'p-10 bg-E', 'children': {
			btnSelectValue : {'tag': 'button', 'class': 'btn btn-primary', 'html': 'Get selection', 'onClick': function() {
				alert(JSON.encode(SelectFilter.getSelected()));
			}},
			btnSelectReset : {'tag': 'button', 'class': 'btn btn-default', 'html': 'Reset', 'onClick': function() {
				SelectFilter.set();
			}}
		}}
	]}));
})();
