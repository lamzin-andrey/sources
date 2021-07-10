// ==UserScript==
// @name        Mail Ru Horoscope Parser
// @namespace   https://horo.mail.ru*
// @include     https://horo.mail.ru*
// @version     1
// @grant       none
// ==/UserScript==

window.addEventListener('load', startMruHoroParser);

// https://horo.mail.ru/prediction/aries/tomorrow/
function startMruHoroParser() {
  
  var iframeContainer = document.createElement('div');
  iframeContainer.innerHTML = `<iframe src="http://my.site/articles/horoscope/index.html" style="display:none;width:800px; height:600px;" >`;
  document.getElementsByTagName('body')[0].appendChild(iframeContainer);
  
	window.recHost = 'http://sl.loc';
  window.recHost = 'http://my.site';
	window.linkTpl = 'https://horo.mail.ru/prediction/{sign}/tomorrow/';
	window.signs = [
		'aries',
		'taurus',
		'gemini',
		'cancer',
		'leo',
		'virgo',
		'libra',
		'scorpio',
		'sagittarius',
		'capricorn',
		'aquarius',
		'pisces'
	];
  //alert('b getStory');
	var o = getStory();
  
	
	if (!o) {
		o = {};
	}
  
	
	var sign = '';
	for (var i = 0; i < window.signs.length; i++) {
		if (!o[window.signs[i]]) {
			sign = window.signs[i];
			break;
		}
	}
	
	if (!sign) {
    var rnd = Math.round(Math.random() * 100);
    console.log('rnd', rnd);
    setTimeout(() => {
      window.location.reload();
    }, rnd * 1000);
		return;
	}
	
	var link = window.linkTpl.replace('{sign}', sign);
  //alert(link);
	
	var url = window.location.href;
	url = url.split('#')[0];
	url = url.split('?')[0];
	console.log('Calculate url = ' + url);
  
	if (url != link) {
		window.location.href = link;
		return;
	}
 
	
	window.ival = setInterval(() => {
		var text = parseText(); //TODO
		if (text) {
			var data = {
				content_block:  text,
				signName: sign
			};
      if (!window.reqIsSended) {
        window.reqIsSended = true;
      	pureAjax(window.recHost + '/din/n/acategories/horosave.jn', data, onSuccessSend, onNull, 'POST');
      }
		}
	}, 5000);
}


function parseText() {
  var ls = document.getElementsByClassName('article_prediction'), i;
  console.log('Count predicates ' + ls.length);
  if (ls[0]) {
  	return ls[0].innerHTML;
  }
  return '';
}


function onSuccessSend(data) {
  window.reqIsSended = false;
  console.log('get data', data);
	if (data.status == 'ok') {
    clearInterval(window.ival);
		var sign = data.s;
		var o = getStory();
    if (!o) {
      o = {};
    }
		o[sign] = 1;
		setStory(o);
    startMruHoroParser();
	}
}

function getStory() {
	var s = localStorage.getItem('mruHoroParser-' + date('Y-m-d')),
		o;
	if (s) {
		try {
			o = JSON.parse(s);
		} catch(e) {
			console.log('Unable parse JSON DATA');
		}
	} else {
		console.log('Empty S');
	}
	
	return o;
}

function setStory(o) {
	var s = JSON.stringify(o);
	localStorage.setItem('mruHoroParser-' + date('Y-m-d'), s);
}

function onNull(data) {
  window.reqIsSended = false;
	console.log(data);	
}

/**
 * @desc Аякс запрос к серверу, использует JSON
*/
function pureAjax(url, data, onSuccess, onFail, method) {
  
  /*let formId='horoFormT', iframeId = 'horoIframeT', formHtml = `<form action="${url}" method="POST" target="${iframeId}" id="${formId}">`, i, j;
  
  for (i in data) {
    formHtml += `<input type="hidden" name="${i}" value="${data[i]}">`;
  }
  formHtml += `</form><iframe name="${iframeId}" style="display:none" src="http://galaxyyoung.epizy.com/0.htm"/>`;
  
  var e = document.createElement('div');
  e.innerHTML = formHtml;
  document.getElementsByTagName('body')[0].appendChild(e);
  */
  
  
  
  //----------real xhr
	var xhr = new XMLHttpRequest();
	//подготовить данные для отправки
	var arr = []
	for (var i in data) {
		arr.push(i + '=' + encodeURIComponent(data[i]));
	}
	var sData = arr.join('&');
	//установить метод  и адрес
	//console.log("'" + url + "'");
	xhr.open(method, url, true);
	//console.log('Open...');
	//установить заголовок
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0');
 
	//обработать ответ
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var error = {};
			if (xhr.status == 200) {
        console.log('xhr.responseText:', xhr.responseText);
				try {
					var response = JSON.parse(String(xhr.responseText));
					onSuccess(response, xhr);
					return;
				} catch(e) {
					console.log(e);
					error.state = 1;
					error.info = 'Fail parse JSON';
				}
			}else {
				error.state = 1;
			}
			if (error.state) {
				onFail(xhr.status, xhr.responseText, error.info, xhr);
			}
		} else if (xhr.readyState > 3) {
			onFail(xhr.readyState, xhr.status, xhr.responseText, 'No ok', xhr);
		}
	}
	//отправить
	//console.log('bef send');
	xhr.send(sData);
	//console.log('aft send');
}


/**
 * @description 
 * @param {String} sDatetime 'Y-m-d H:i:s' (php date() format)
 * @return Количество секунд с 01.01.1970 до sDatetime
*/
function time(sDatetime) {
	var re = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}:[0-9]{2}:[0-9]{2}$/, arr = String(sDatetime).split(' '),
		sDate = arr[0],
		sTime = arr[1], d = new Date(),
		result,
		re2 = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
	if (!re.test(sDatetime) && !re2.test(sDatetime)) {
		return parseInt(new Date().getTime()/1000);
	}
	arr = sDate.split('-');
	d.setDate(parseInt(arr[2], 10));
	d.setFullYear(arr[0]);
	d.setMonth(parseInt(arr[1], 10) - 1);
	
	if (sTime) {
		arr = sTime.split(':');
		d.setHours(parseInt(arr[0], 10));
		d.setMinutes(parseInt(arr[1], 10));
		d.setSeconds(parseInt(arr[2], 10), 0);
	} else {
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0, 0);
	}
	result = parseInt(d.getTime()/1000);
	//Тут интересный баг старых android устройств (2.3.6 и 4.0.1) - они декодируют данные с учетом зимнего времени
	var ctrlDt = new Date(1582636002*1000), cd = new Date(result * 1000), m = cd.getMonth() + 1;
	if (ctrlDt.getHours() == 15) {
		if (m > 11 || m < 5) {
			result += 3600;
		}
	}/**/
	//конец фикса
	return result;
}

function _dateParseN(dt) {
	var n = dt.getDay();
	n = (n == 0 ? 7 : n);
	return n;
}
function date(pattern, ts){
	ts = ts ? ts : time();
	ts *= 1000;
	//Тут интересный баг старых android устройств (2.3.6 и 4.0.1) - они декодируют данные с учетом зимнего времени
	var ctrlDt = new Date(1582636002*1000), cd = new Date(ts), m = cd.getMonth() + 1;
	if (ctrlDt.getHours() == 15) {
		if (m > 11 || m < 5) {
			ts += (3600 * 1000);
		}
	}
	//конец фикса
	var dt = new Date(ts), map = {
		Y : dt.getFullYear(),
		y : dt.getYear(),
		m : dt.getMonth() + 1,
		d : dt.getDate(),
		H : dt.getHours(),
		N : _dateParseN(dt),
		i : dt.getMinutes(),
		s : dt.getSeconds()
	};
	var key;
	for (key in map) {
		if (key != 'N') {
			map[key] = +map[key] < 10 ? ('0' + map[key]) : map[key];
		}
		pattern = str_replace(key, map[key], pattern);
	}
	return pattern;
}
function str_replace(search, replace, subject, oCount) {
	if (oCount && (oCount instanceof Object)) {
		if (!oCount.v) {
			oCount.v = 0;
		}
	}
	while (subject.indexOf(search) != -1) {
		subject = subject.replace(search, replace);
		if (oCount && (oCount instanceof Object)) {
			oCount.v++;
		}
	}
	return subject;
}
