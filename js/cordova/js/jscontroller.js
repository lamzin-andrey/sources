'use strict'
document.addEventListener('deviceready', init, false);
window.addEventListener('load', init, false);
function init() {
	$('#search')[0].onclick = function(e) {
		e.preventDefault();
		$_POST['word'] = word.value;
		hPanel.innerHTML = '';
		hResults.innerHTML = '...';
		
		var app, row, i, html = '';
		try {
			new App(onData, onProgress);
		}catch(e) {
			alert(e);
		}
	}
}
function onProgress(n, part) {
	hPanel.innerHTML = 'n = ' + n + ', part = ' + part;
}
function onData(app) {
	var i, row, html = '';
	if(app.n) {
		for (i in app.rows) {
			row = app.rows[i];
			html += '<div class="wordtext">' + row['description'] + '</div>';
			var humanSource = (row['source'] == 'sts' ? 'Современный толковый словарь' : 'Толковый словарь Даля');
			if (row['source'] == 'ozh') {
				humanSource = 'Толковый словарь Ожегова';
			}
			html += '<div class="src">' + humanSource + '</div>';
		}
		hResults.innerHTML = html;
	}
}
