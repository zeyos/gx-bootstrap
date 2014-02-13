(function () {
	var gSelect = new gx.bootstrap.Select(null, {
		'url': window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + 'data/select.json',
		'width': '300px'
	});

	// Demo Injection
	$(document.body).adopt(__({'children': [
		{'tag': 'h5', 'html': 'gx.bootstrap.Select'},
		{'class': '', 'children': [
			{'tag': 'label', 'html': 'Selection demo:'},
			gSelect
		]},
		{'class': 'p-10 bg-E', 'children': {
			btnSelectValue : {'tag': 'button', 'class': 'btn btn-primary', 'html': 'Get selection', 'onClick': function() {
				alert(JSON.encode(gSelect.getSelected()));
			}},
			btnSelectReset : {'tag': 'button', 'class': 'btn btn-default', 'html': 'Reset', 'onClick': function() {
				gSelect.set();
			}}
		}}
	]}));
})();
