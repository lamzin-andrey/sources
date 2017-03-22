// ==UserScript==
// @name        BitbuckGrab
// @namespace   https://bitbucket.org/*
// @include     https://bitbucket.org/*
// @version     1
// @grant       none
// ==/UserScript==


var Cnf = {
	'name' : 'Andrey Lamzin',
	'container' : 'commit-list',
	'elem' : 'tr',
};


function e(i) {return document.getElementById(i);}

function ee(tag, parent) {
  if (!parent) {
      parent = document;
  }
  return parent.getElementsByTagName(tag);
}

function eee(tag, parent, callback) {
  var ls = ee(tag, parent), i;
  for (i = 0; i < ls.length; i++) {
     callback(ls[i]);
  }
}
var w = window, d = document, b = d.body, wlh = w.location.href;
w.onload = function() {
	b.onkeypress = bbOnKeyPress;
}
function bbOnKeyPress(evt) {
	if(evt.code == 'KeyC' && evt.ctrlKey) {
		console.log('ok 1');
		createReport();
	}
}

function trim(s) {
	s = s.replace(/^\s+/, '');
	s = s.replace(/\s+#/, '');
	return s;
}

function createReport() {
	var ls = d.getElementsByClassName(Cnf.container)[0];
	if (!ls) return;
	var yesterdayFound = 0, report = [];
	eee(Cnf.elem, ls, function(tr) {
		if (yesterdayFound != 0) {
			return;
		}
		var dateTd = tr.getElementsByClassName('date')[0], date;
		if (dateTd) {
			date = trim(dateTd.innerText).toLowerCase();
		}
		var authorTd = tr.getElementsByClassName('user')[0];
		
		if (authorTd) {
			var s = trim(authorTd.innerText);
			if (s == Cnf.name) {
				if (date == 'yesterday') {
					yesterdayFound = 1;
				} else {
					if (tr.getAttribute('class').indexOf('merge') == -1) {
						var linkTd = tr.getElementsByClassName('hash')[0];
						if (linkTd) {
							var link = ee('a', linkTd)[0];
							if (link && link.getAttribute) {
								//console.log('ok 6');
								var url = 'https://bitbucket.org' + link.getAttribute('href');
								var sTd = tr.getElementsByClassName('subject')[0];
								if (sTd && trim(sTd.innerText).indexOf('fc-') == 0) {
									return;
									//url = trim(sTd.innerText) + ' ' + date + ' ' + url;
								}
								report.push(url); 
							}
						}
					}
				}
			}
		}
	});
	console.log(report);
	alert(report.join('\n'));
}
