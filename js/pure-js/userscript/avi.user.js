// ==UserScript==
// @name        AgavaTool
// @namespace   https://www.agava.com/*
// @include     https://www.agava.com/*
// @version     1
// @grant       none
// ==/UserScript==
var GATE_PWD = '*****';
var SITEONE = 'http://';
var SITETWO = 'http://';
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
function trim(s) {
	s = s.replace(/^\s+/, '');
	s = s.replace(/\s+#/, '');
	return s;
}
var w = window, d = document, b = d.body, wlh = w.location.href;
/**
 * @class iParser
 * 
 * @var {Number} areaW - ширина "стакана"
 * @var {Array}  workGrid - массив i, j, представляющий собой сетку тетриса i - строки, j - столюбцы
 * @var {Object x, y}  workGridCellSz - размеры ячейки workGrid
 * @var {Number}  workGridNumRow      - количество строк в сетке
 * @var {Number}  workGridNumCell     - количество столбцов в сетке
 * @var {iParserToolFigure}  figure        - активная на данный момент фигура
*/
function iParser() {
	var o = this;
	//высота изображения с каптчей
	o.IMG_HEIGHT = 50;
	
	//ширина одного символа (пока работаю с простейшим но нереальным примером)
	o.NUM_WIDTH = 22;
	
	//Позиции символов
	o.NUM_POSITIONS = [];
	o.NUM_POSITIONS[2] = 63;
	o.NUM_POSITIONS[3] = 86;
	o.NUM_POSITIONS[4] = 122;
	o.NUM_POSITIONS[5] = 146;
	o.NUM_POSITIONS[6] = 168;
	o.NUM_POSITIONS[7] = 207;
	o.NUM_POSITIONS[8] = 231;
	o.NUM_POSITIONS[9] = 267;
	o.NUM_POSITIONS[10] = 292;
	
	//Данные символов
	o.ONE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAAAj0lEQVRYhe3TMQ6BMRiA4SdGBzGJQRzAaHAecQeT04iDGJzCZJA/wmKQSn/RdiC+N+nUfM83NCWKouiHGuCA2+M0a/2ENoPnuLSGZzglaDW8yKBV8ArXDFoEj7BPkK4W3nh9pDOWtXA6fMQ0c1cEd9hi2LP0Y3iHcc/SInjyZmnznxdwwAEHHHDAXwhH/9AdKrCWH5lQffIAAAAASUVORK5CYII=';
	o.TWO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAABkklEQVRYhe3WsUtVURzA8Q8hESER4RTxEIlocJBwaIgIcXJ0ahQRpwaJBoeW/gKnhoaGRmmOCAcJhwbHBgcRCZGHiESIPB4iNpxXnM47vt691wcO9wtn+v1+X875nXN/XGpqamquKGN4jS/4gWO00cQmVvCsiHAEqzjDeR9rExP/k453dtSPMF4tPL9Ierek9M9qYyonXs0kN7HcOckwrmMU8/ieyd/t5PzlQSbpK+5cdDwM4V2mbjFOepME93G7hzRmLan9HAfXk+DLPqWEJxfX7sXBwyT4sID4ZlLbioMNzOGDcAE3CohvJeJmgdqeTCXijcsSf0zEry5DOp1I27hXVTqGg0S8UlXaEC45lm4JL6Q094UxGkt/KvZEu3ik+/gneFJFOiMM+1j6C0+rSF/gNJEeYrKs8BreJsJzbAu9LkUD3zLSDb3HaU+mcZSRvhfmcCkWdfezjYWyQljK7PIAj6tIZzPSbaHXpWkIX086VysPlE+J9EzBv5wcE7pbUHUhPKGBiHcGJW4NSlxT8y+/ATu0D60jVuwgAAAAAElFTkSuQmCC';
	o.THREE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAAB1UlEQVRYhe3WPWhTURjG8R8SRIoEEZEiUjqIFBEHB3Fw6FicHEWKiFMHkSJODi4O4iROTlKKiDiLiEMmBwfp0MFBRIKUIuIgUiQEKXE4N3BycnM/QgaH+8A7vc/7v++555NGjRo1+o91Bc/xBXvoYxfvsI6jdYHn8QmDktjD7arQy1lnZdA43qJVBD2LXk3oMJ4VgT/kFHSwgnbW1SJu4UeOdzkPupxjfFzQxDy+Jv5XecaNxLSNA0XDE+YjrtnNM3UT040SKMwlNf0800IG28w+cqIC+EgC/l6hppKuqvCP62pJ6HAI3cfFaWEtXBBWyx+j3T6YBnjM5I3Tw51pOz03AdrHmpLtXKSVCeBhfBMmsrZWsYWXwkbqGP/HAzyZtvNYbTwUVkMMvzcLOGE0MfgvTs0K/iKBFx1etXQpAW/PCtxOwL/j5AKuC7Pexcka4IMJuBcn0xthtQb4dFLbjZOdJPm6Bng9qX0TJ+8myX2cqQBtYyepXYsN88av/Y84XACdEx4vcc3P7GMjepSYBsIr6KYwua0MtiQ8VNLrbKzbuIOtHHPV2CwYnePCAq8L3VDh+DyEp8K+LwPuqHajj2gR9/FeuN/6+IXPwvlwTdgcjRpV0D9F5v0R76/p6gAAAABJRU5ErkJggg==';
	o.FOUR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAAA0ElEQVRYhe3UIQ7CQBBG4RcEAoEiKCQSja7mBByAE3AAboDmBByAoNFoJBKJQiAQDSkG0QzTzXZ3EIT5k1W7+VLzCj6fz/eDmwNV7ZhsBNy+AR8EagIvFTQbngAPa7gLnBrQLHgdQJPhAnhaw33gIpCdBbwVwBUY5MKyrgqYve+SYa2uTe0+GZZ1nYFeLizrKoGpeNMa1upaKe9awVpdR6CTC8u67sC44W00XPBZ1yLwPgrW6tqHviIW1uoaWsChn0vqcTi+xKaZQQ477PvvvQBVUgUO/JTZOwAAAABJRU5ErkJggg==';
	o.FIVE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAABlUlEQVRYhe2WL0gEQRSHP+Q4RAwiIiIih8ghh5gMYhCjiMFoMMgFEaNJLthETGaTGAybRUQMchjEJIYLIiKH4RARw7FBjmUNs8reu9m9OZkFwf3BS/PeN2/evPkDqVKlSvXHNAj4v7RYLSQF3k4K7CQFfhDOU+0CTNQNeCFoA8jaAM/QnG3FBhRgQ4AdW+BDAS7ZAt8K8JItsCvAOdTmbQJl4D3weQJOTCeeENA6MAdUie/dcpBApFZEgItqN5ODUQMmo8D7hpAoqwJ9OvCFxrmOujvyqFpngWFgGTjT+B/rwDXh9AFMRy0vUEnENNDUexRYC2Z9RtXcRLJFrfV+UYAvbYHztG6iFfUIsGsLnEkKPEBMKd7E4EgH4HliNu9KDBY7AB+I2J3woGz0O0PoEOogfcd5qC75UY7mt84HdttAe4FrEXOqc5Svhw+cA4uo31FXACsAW8CL8HWBMR24H3jUwE3MA1bjljdO+4tdB12Pg4Yzd2ituc4qwKwJNKwCsAfcAK/AJ6rf74Ej1Ocx0yk01X/WFwOnEekxZZAEAAAAAElFTkSuQmCC';
	o.SIX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAACAElEQVRYhe2WP0hbURjFfxSREEIQKUFESnFwEunYwbmIFEcRkVJKcRApIpk6dCkdOkjpWKSDiHQQBxGRh3TqXIqDhFCKgwSREkREJISQDvfd8HJyk3efOBR8B+6Sc74fN9+7/yBVqlSp/lPlgAVgGygBF8ANUAEOgBUgnxT6CvgLNGPGJfDSB/gA2PQA6vgQB966BdSO+W7Q147wMVAExjE9zwJPgXWgIdmz0G9TDjiX4CHQ1+PfPXfAX2hoWQJVoNADavVF6nY18EsCKx5QgAmpq0TNYTEvgYwnuKfmBLx5F1CANQEv3hV4T8CTES+P+bABZjnVMDvyJ/AR0+OuOhLw4/D3Jcz50GtTNDCtc54ZFQkPABsxQB3lyIRaupbQp4RQO0o683qXYD2c+TPgIWYX5jF9XQVOHDVfo2Ddlk3gD/DE1beIMsCOYzJjNlATswo8ioFG4WWpf2fNqhhFT6iVnoo/rFESYzQheFTqW+dFIEZ/QnC/1Nes8VmM4YTgnNRfWWNejJmE4HGpL1ujQPuSCxKCiwLeiprfxZz1hObpPBLaaqfp7NO0B/RQ6s5wfPwDCTWAb8AUMBIW5DA9LQKnkm9iHjodKmC28m0OoCaOi1TherH6jADHm0KVBd5jHoBxwCvgLeZp5q0hzC2yD/wOITXMKgiAN8BgEmCq+65/uLw16gp/qD0AAAAASUVORK5CYII=';
	o.SEVEN = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAABBElEQVRYhe3UoYqCQRTF8X8wicFgMInBIAYfQDaI+ABiMHxBjL6GYR9go5hkwyajwWAQH8Bn+IKILMbFIDIGFWcuGIQThJ0DU3+cuXcYiImJiXmDOPGJMA5YP5v3qxl66BYoKtAmcLqhZ6ClQAvAjkfbLwUKMPfQFMgq0D7hwjoKtAAcPHShQAEmHnoG6gq0fsPu8FSBwvXaftuKAm0QLuxHgULY1iGabc2gKwUK4UtwQE+B5oA/Dz0AGQU8IGw7VqAASwN/KNA8j2/RAb8KFCAhbPutgqcGTlRwauCyAi0ZVDbfroHnKvjTwCMVPDPwQAVvDNxWwXsDV1Xw0cA5FRzzX3MBqHW3z0O/QDgAAAAASUVORK5CYII=';
	o.EIGHT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAACA0lEQVRYhe3WMWgUURAG4I/jCEEOCUFCiiBXBCuLFNYWFiksQgoRERERSWUhIiLpLYKFWIqISLAQSWUhIhKCSCqRQ0QkiIQUFpJCQghHkFjsnaxzL5t3VoL3w1Tz//++2Z2ZtwwwwAAD/KMYxzxeYQM72MY6nuMaRvoxrGMBbewdEFu4mWM6jOUMwxhLqFUZP/kL027c28/0ZIK8hstoYqgTTVzB18D9iamU8eNA/IDDFdWN4HPQ3E8R4wmmK0y7mE1U2IOdQBrOMG4EzXaK9COQGhnGh4JmK0V6E0inM4yng+ZtijQXSK3OiapO+z5o5lLEGlYD8SMu4qii1eqYwIVOrsxdVTEkI3gZBDmxjNGK6n7jTKLMVHzC+RxDOI5n8pZQG4uKV1WJq9jNMExtudn9TC8lBCs4q/hgQ4pOmFTsj1bg7uJUNB3TOyALB1RXw8Og2RBadD5x0hzU8C5o/+jlOHUzmcZwLmhflJObIZnVkx2MB+23cjJ2Qr0P43rQtsvJ7yE51ofxkaDdLCfjlOVsti5mgrZVTt4JycU+jJeD9m45OaW4DMuE6xmmt4NmDyci6WmC1MINxf5oKKZvQjGNKwn+Uurpo4rLsN890Y0vig+ZxKTeKz0n1nBsP9MuGnggb8vt4pHq/48eNHFL8be5rrjatxWL5rVivzT7MRzgf8cvUHQ45jrRWBoAAAAASUVORK5CYII=';
	o.NINE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAAB+UlEQVRYhe2WsUscQRjFf4gcImIhEkTCISISRMRCLPM3hJQhiFiIiIWkCBJsJAQRESsRqxQpUoQUKUIQqxCOIEEOixRBRETCFSJHEDnkkEvx7cLcu9nbHbAIZB9Ms+99v92dnW9mIVeuXLn+UY0Aa8B3oALcAlXgENgExkOB3cAuUAcaKeMDMJAFOgiUMwDdUQGm2kELwFEgNB5V4FESeMtTcAWsAhNAT3TzIvDc82ZHQIdCHwA1CZaj60nqAN5JzZyGliXwB3jYBhqrAPxy6n5q4LOANzJAYy1IbdMyPBNzOgA8KrWLrnktZm8AuFtq37rmrZidAeAuqf3qmr/FHAwAj0jtiWuWxHwWAF6S2ivXfCOmd7F71AOcS+2NG5gUswHspcB7gQNP3Z0GdS3H3TcLDGMfqYAtr2XgwpNvYAuhSUVsfkI3oO3oKd2ubdFjbKfKCv1E6zquJM3dGPAjBVgHXkX5fvGOk8CxngLvsXavYV/7GDuWhp3clID308BZNSfgnfsC7wl4/r7ApwJuOb0rEhjKAJ2Qmgtf6IuEVjKAdRrWfaFFCVVTnnqG5saokXCc9WFd48IvgRfY1ljAfk6e4G//1+1e7aWnIMsoRTduq4+B0EOs+1LVSevGktTW29iuF6RR7O+ojH3IOjbn37C/0GIoMNf/rr8XZStX6pnrUgAAAABJRU5ErkJggg==';
	o.ZERO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAyCAYAAABYiSsbAAABw0lEQVRYhe2VsUoDQRiEP4KEICISJIiItYi1WIqFiFiIiJWkEAsRCwkiQcRWgg9gJWJhISIiqUR8hCApJA8QgqSQEEIIIqLF3ck6Xu5uY2NxA1vNzJf8e7t3ECtWrFj/VBkgB9wDNaADNIEKcAdkgUFbaB5oA58hq+VmI+k8AlDXVRh0uweot3a7QdNAQ8IfwCkwDfTj7OlMl6nqQNIPnJdgC5gNmG7F/WGzs+EXrEhoMwDq6VA6jxoYl0CDLmOJBnAm83rvwJAZyAr4OgLU0410V03zRMycBTgn3RPTLIq5YAFelG7RNEtiTlmAp6RbNs2amBkLcEa6NdNsiZmyAPdLt2Wab2ImLMB90n0zTb1BttLXwLfe//CPE9LtmOZf9jgl3aZpVsUctgDrqaia5pOYExbgSemWTPNWzDkL8Lx0f9y8gpjbFuAd6RZMc03MCwvwpXTXTXNUzDrOwQ9TEniV7piGyhLYigDelc6zX2hPQh1gKQC6zO9Xwb5fMM3vi/IBnOF8mQfc5X2l9TXQcBm+OpKwzdoJmI4k8NADNNIpSgDHOHscBmwDB1GgpkZwHug9zv1v4zysF3eqfTcTK1ZEfQFWVByHgHiKbgAAAABJRU5ErkJggg==';
	o.EXAMPLES = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
	
	o.NUM_MAP = {'ZERO':0, 'ONE':1, 'TWO':2, 'THREE':3, 'FOUR':4, 'FIVE':5, 'SIX':6, 'SEVEN':7, 'EIGHT':8, 'NINE':9};
	
	//Переменные отвечающие за предотвращения сообщения о том, что браузер слишком долго не отвечает пока забил, в конце концов не сложно на "Продолжить" нажать
	
	//Итераторы
	
	//Итератор по массиву NUM_POSITIONS
	o.ITER_NUM_POSITIONS = 2;
	//Итератор по imageData
	o.ITER_IDATA = 0;
	
	//
	
	//Принимает true когда время вышло 
	o.isTimeout = false;
}

/**
 * @description Запускает процесс сравнения
 * @param {HtmlCanvas} canvasWithCaptcha объект холста, на котором уже отрисована каптча 
 * @param {HtmlCanvas} canvasForNum объект холста, на котором будет отрисована очередная цифра
 * @return String пока пусть сразу возвращает
*/
iParser.prototype.start = function(canvasWithCaptcha, canvasForNum) {
	var o = this;
	
	//Предотвращение сообщения о том, что браузер слишком долго не отвечает - пока забил, в конце концов не сложно на "Продолжить" нажать
	/*o.ITER_NUM_POSITIONS = 2;
	o.ITER_IDATA = 0;
	o.isTimeout = false;
	setInterval( function() {o.checkTimeout();}, 1000);*/
	
	var i, j, fragmentImageData, numImageData, k, imageDataSize,
	
		/** @var {Array} info массив равен числу символов в каптче
		 * Каждый элемент массива содержит массив из 10 чисел.
		 * Число равно числу совпадений цветов точек в  fragmentImageData и очередным numImageData*/
		  
		info = [], infoI = 0, 
		//infoItem - ссылка на элемент info
		infoItem,
		pixelIsEquiv = false,
		
		//Наибольшее число совпадений для очередного EXAMPLES[m]
		maxWeight,
		//m соответствующее maxWeight
		maxWeightM,
		
		//результат - массив с цифрами
		result = [];
	
	//Последовательно копируем каждую цифру в canvasForNum (или просто получаем её imageData)
	for (k = 2; k < 11; k++) {
		console.log('Work with symbol ' + k + '...');
		infoItem = [];
		info.push(infoItem);
		
		//по возможности монохромить!
		fragmentImageData = o.getFragment(k, canvasWithCaptcha);
		
		//Перебираем все примеры цифр
		maxWeight = 0;
		maxWeightM = 0;
		for (m = 0; m < o.EXAMPLES.length; m++) {	//EXAMPLES = ['ONE', 'TWO', ...]
			console.log('Check ' + o.EXAMPLES[m] + ' for symbol ' + k + '...');
			// по возможности монохромить!
			numImageData = o.getExampleImageData(m, canvasForNum);
			
			infoItem.push(0);
			
			
			//Сравниваем (Да, длину на всякий случай берём меньшую)
			imageDataSize = fragmentImageData.data.length < numImageData.data.length ? fragmentImageData.data.length : numImageData.data.length;
			
			
			var aUniq = {}, cA, cB;
			
			for (i = 0; i < imageDataSize; i += 4) {
				pixelIsEquiv = false;
				
				//var sKey = fragmentImageData.data[i + 0] + '-' + fragmentImageData.data[i + 1] + '-' + fragmentImageData.data[i + 2];
				//aUniq[sKey] = 1;
				
				cA = fragmentImageData.data[i + 3] < 50 ? 0 : 1;
				cB = numImageData.data[i + 3] < 50 ? 0 : 1;
				
				if (
							/*fragmentImageData.data[i] == numImageData.data[i]
						&&	fragmentImageData.data[i + 1] == numImageData.data[i + 1]
						&&	fragmentImageData.data[i + 2] == numImageData.data[i + 2]/**/
						cA == cB
					) {
					pixelIsEquiv = true;
				}
				
				if (pixelIsEquiv) {
					infoItem[m]++;
				}
			}
			if (infoItem[m] > maxWeight) {
				maxWeight = infoItem[m];
				maxWeightM = m;
			}
			
		}
		result.push( /*o.NUM_MAP[*/ /*o.EXAMPLES[*/ maxWeightM /*]*/ /*]*/ );
		infoI++;
		
	}
	console.log(result);
	return ('8 9' + result[0] + result[1] + ' ' + result[2] + result[3] + result[4] + ' ' + result[5] + result[6] + ' ' + result[7] + result[8] );
}

iParser.prototype.getFragment = function(k, canvasWithCaptcha) {
	var ctx = canvasWithCaptcha.getContext('2d'), o = this;
	return ctx.getImageData(o.NUM_POSITIONS[k], 0, o.NUM_WIDTH, o.IMG_HEIGHT);
}
iParser.prototype.getExampleImageData = function(m, canvasForNum) {
	var img = new Image(), o = this;
	
	var ctx = canvasForNum.getContext('2d');
	ctx.clearRect(0, 0, o.NUM_WIDTH, o.IMG_HEIGHT);
	img.setAttribute('src', o[o.EXAMPLES[m] ]);
	ctx.drawImage(img, 0, 0, img.width, img.height);
	return ctx.getImageData(0, 0, o.NUM_WIDTH, o.IMG_HEIGHT);
}




w.onload = function() {
	w.onkeypress = b.onkeyup = aviOnKeyPress;
  w.u1 = SITEONE;
  w.u2 = SITETWO;
  w.uact = w.u1;
  setInterval(()=>{
    var bd = b, ls, i, buf = [], sz;
    ls = document.getElementsByClassName('b-popups');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
    ls = document.getElementsByClassName('b-popup-overlay');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
    
    ls = document.getElementsByClassName('popup-content');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
  }, 500);
	(function(){var D=document,W=window;function $(i){if(i&&i.tagName||D==i){return i}return D.getElementById(i)}function $$(p,c){p=$(p);return p.getElementsByTagName(c)}function hasClass(obj,css){var obj=$(obj);var c=obj.className,_css=css.replace(/\-/g,"\\-"),re1=new RegExp("^\\s?"+_css+"\\s*"),re2=new RegExp("\\s+"+_css+"(\\s+[\\w\\s]*|\\s*)$");if(c==css||re1.test(c)||re2.test(c)){return true}return false}function removeClass(obj,css){obj=$(obj);var c=obj.className,re=/[0-9a-zA-Z\-_]+/gm,arr=c.match(re),i,result=[];if(arr){for(i=0;i<arr.length;i++){if(arr[i]!==css){result.push(arr[i])}}}obj.className=result.join(" ")}function addClass(obj,css){obj=$(obj);removeClass(obj,css);obj.className+=" "+css}window.getViewport=function(){var w=W.innerWidth,h=W.innerHeight;if(!w&&D.documentElement&&D.documentElement.clientWidth){w=D.documentElement.clientWidth}else{if(!w){w=D.getElementsByTagName("body")[0].clientWidth}}if(!h&&D.documentElement&&D.documentElement.clientHeight){h=D.documentElement.clientHeight}else{if(!h){h=D.getElementsByTagName("body")[0].clientHeight}}return{w:w,h:h}};W.appWindow=function(id,s,onclose,clear){var bgId="popupbg",winId="popup",current="current_wnd_content",content="appWindowPopup",tmp,winW,winH,vp=getViewport(),w=vp.w,h=vp.h;appWindowClose();W.appCloseCallback=onclose;if(!$(id)){return}if(clear){var ls=$$(id,"input"),i,lt=$$(id,"textarea");for(i=0;i<(ls.length>lt.length?ls.length:lt.length);i++){if(ls[i]&&ls[i].name!="authenticity_token"){if(ls[i].type!="checkbox"&&ls[i].type!="button"&&ls[i].type!="submit"){ls[i].value=""}else{ls[i].checked=false}}if(lt[i]){lt[i].value=""}}}$(winId).style="";$(content).style="";if(s){$("popuptitle").innerHTML=s}$(winId).style.opacity=0;removeClass(bgId,"hide");removeClass(winId,"hide");tmp=D.createElement("div");$$(D,"body")[0].appendChild(tmp);tmp.id=current;swapNodes(id,tmp);removeClass(id,"hide");removeClass(content,"scrollx");removeClass(content,"scrolly");$(content).appendChild($(id));$(id).opacity=0;winW=$(winId).offsetWidth;winH=$(winId).offsetHeight;if(winW<w&&winH<h){with($(winId).style){left=Math.round((w-winW)/2)+"px";top=Math.round((h-winH)/2)+"px"}}else{with($(winId).style){left="0px";top="0px";width="100%";height=h+"px";overflowX="scroll";overflowY="scroll"}}if($(id).offsetWidth>$(content).offsetWidth){addClass(content,"scrollx");$(content).style.maxWidth=(w-5)+"px"}if($(id).offsetHeight>(h-35)){addClass(content,"scrolly");$(content).style.maxHeight=(h-40)+"px"}with($(bgId).style){width=w+"px";height=h+"px"}$(winId).style.opacity=1;$(id).setAttribute("data-srcid",id);$(id).id="execute_block"};W.swapNodes=function(b1,b2){b1=$(b1);b2=$(b2);var t=D.createElement("i"),p1=b1.parentNode,p2=b2.parentNode;p1.replaceChild(t,b1);p2.replaceChild(b1,b2);p1.replaceChild(b2,t);delete t};window.appWindowClose=function(){var bgId="popupbg",winId="popup",current="current_wnd_content",execute="execute_block",old=$(execute);addClass(bgId,"hide");addClass(winId,"hide");if($(current)){if(old){old.id=old.getAttribute("data-srcid");swapNodes(current,old);addClass(old,"hide")}$(current).parentNode.removeChild($(current))}if(W.appCloseCallback instanceof Function){W.appCloseCallback()}};W.showLoader=function(){var bgId="loaderbg",ldId="ldrbig",vp=getViewport(),w=vp.w,h=vp.h;removeClass(bgId,"hide");with($(bgId).style){width=w+"px";height=h+"px"}removeClass(ldId,"hide");with($(ldId).style){opacity=0;left=Math.round((w-$(ldId).offsetWidth)/2)+"px";top=Math.round((h-$(ldId).offsetHeight)/2)+"px";opacity=1;position="absolute"}};W.hideLoader=function(){addClass("ldrbig","hide");addClass("loaderbg","hide")};function addResources(){addCss();addHtml()}function addCss(){var style=D.createElement("style");style.innerHTML='.hide{display:none}.popupbg{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABQSURBVFiF7c5BDYAwAACxMa3zghMc8p+GPRpCclXQ637eNX5kfh04VVgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtQ0cEALewERBRQAAAABJRU5ErkJggg==") repeat;position:fixed;width:100%;left:0;top:0;z-index:1}.adminpopup{background-color:#d7d8f3;background:linear-gradient(to bottom,#80a8d1,#478bd2);border-radius:9px 9px 0 0;border:1px solid #c3d1d7;min-width:250px;z-index:2;position:fixed;left:0;top:0;color:black;box-shadow:3px 7px 5px 0 #a0bac7}#popuptitle{float:left;font-weight:bold;margin:7px 0 0 21px;color:white}.popup-close{float:right;margin:6px 14px 0 8px;cursor:pointer}.popup-close img{width:24px;height:24px}.popup-content{background-color:white;margin:0 6px 4px 6px;overflow:hidden}.scrolly{overflow-y:scroll !important}.scrollx{overflow-x:scroll !important}.tmce{width:100%}.w700{min-width:700px}#ldrbig{position:absolute}.z6{z-index:6 !important}img.loader{z-index:7;position:fixed}.both{clear:both}';D.head.appendChild(style)}function addHtml(){s='<div class="adminpopup hide" id="popup"><div class="popup-title-area"><div id="popuptitle">..</div><div class="popup-close" id="closeOut"><img id="closeIn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASRSURBVFiF5ZfLbxNXFMZ/4xkn8fhFggQOCbFDNpUq1ATRsimq6C6ikD6QEEFABQjKpkLECv0T2kW6KFJt51VFlFUX/AVdVBWqKlh00QoECfYkTgTOy87Y49d4bhfEbiAeJ62CWPRIdzPfnfOd851zz52RhBC8SXO8UXZAAfjk7NkO4BvgA6DzNXMmgV+Am3fv3JmXPh4c3A/8AbQB+P1+ukMhHI6dFceyLOKJBJlMpvpoBehVgBGgzev18tXQEN1dXTtK/KrFZ2f5emQEXdfbgBH5rYMHvwM84evXORAMYlnWa10+r5eenh5+vXcPYLcCBFRVJRQMUiyXKZbLmKbJTp8NCVAUhWank1AwiKqqGIYRUAA6OzoolErouRwVy7J1ktV1JIcDt9tdF88bBma5jNfvt/UhOxx43W46Ozp4/OTJi1MggLVsFrNSsSfPZpkYG6OpqYnPL17E5XK9hBfyeaampsjlcly+fBmfTRCWZbGWzdYUdgCUSiXKpokQou7S19YYjcV4lkoxm0wyOT6OYRg1PG8Y/DA5SULTWFxaYnR0lHQ6beuvbJqUSqV/AjBN07Zp9EyGaDTKs+fPqVQqVCoVtLk5JsbGMAwDwzCYnJggrmk1PLW4SCwaJbOyYuvXNE1gfRBVpdkku64zGouRWlrahCVmZxkfG0MCtLm5TXhqcZHvo1GuXr1qW45aAEKIugFIQmDk81RseiOeSNg6BigUCrCe8atWvYNq466eTM2qynA4zO62tn993lt37WL4xg1Ur7cuXjXHRgXqbpRlhoeGaA8EajXeagX27OFmOIzU1GTrd1sKVFfJshgeGqI7GNySPNTVxXA4TLlBUhsVqDXhVt8Fy+k0+ULBth9qdS8WWU6ncalqw33bLoFlWRi5HLFolISmbVn7hKYRjUTIZbMN9227BFXymXh82z0Q1zQikQhZXd+yBA0VKBYKxKJRpp8+3TZ5LYhEgmgkQt4w/rsCnYEAPQcO2JJ8evIknw0M2OLdoRD7A4Gtm1BQfxLOp1J8ceUKqsvFT3fvvoRdPHeOj06cAMCtqoxPTb2EDxw/zqVLl4jXmZJVzloA2ExCgGlN48L587hVlcnbtwH48to1jh07hjY/D0B/fz8ej4dvb90C4Ozp0wyeOcO0ptX1WeWsBeBwOLCEQLLZ+zge59SpU6iqisfj4b0jR9AWFmq4trDA+0eP4nG7eZ5KMTAwwON43J57nRNAkWUZSZbJGwYtLS22Lz2amaG/v59CsUgimdyEJ5JJ3unro6W5mUczM/aZ8+KOcMgyTkVB8Xm9wjJNKbO2RqFQQFVVZFlGkjbr8XB6uqFju3rDi5NWqVQwDINiqYSwLHw+n1D2BQKpxeXlvdlslpwksbK62pBkJ0ysl3tfe3tKOdzXN/Pb/ft708vLKE4n1Ml8h9kR67fl4d7ep9JfDx/2rqbTP//+4EGbaZqYQjT8NtyO1U1BkpBlmRZFwel08u6hQ6u7/P4PJSEESysrb+u6/mO5XG5HCJfY0ACN9KjXJxsJ674vSXmnLC/4vN5zra2tf0r/+7/jvwEDrW44yW5LnAAAAABJRU5ErkJggg==" /></div></div><div class="both"></div>		<div class="popup-content" id="appWindowPopup"></div></div><div class="popupbg hide"id="popupbg"></div>';if(D.body){D.body.innerHTML=D.body.innerHTML+s}else{D.write(s)}}addResources()})();
	b.innerHTML += '<div id="reportwindow" class="hide"><form action="' + w.uact + '" method="POST" enctype="multipart/form-data" target="_blank">'
	+ i('Город', 'iCity') +
	i('Регион', 'iRegion') + 
  '<label><input type="radio" name="utype" id="u1"> 1</label><label><input type="radio" name="utype" id="u2"> 2</label>' + 
  transportType() + 
  i('Заголовок', 'iTitle') +
  '<textarea id="iBody" name="iBody" style="resize:none;width:650px;height:250px" rows="5"></textarea>' +
  i('Цена', 'iPrice') +
  '<div><input type="file" id="iPhoto" name="iPhoto"></div>' +
  '<input type="hidden"  name="pwd" value="' + GATE_PWD + '">' +
  i('Телефон', 'iPhone') +
  i('Имя', 'iName') +
  '<div><img id="imPhone" src="#" > <br><canvas  id="cPhone" width="317" height="50"></canvas> | <canvas  id="iOneNum" width="22" height="50"></canvas> </div>' +
  '<div style="float:left"><input type="submit" name="bCheck" value="Проверить телефон"></div>' +
  '<div style="float:left"><input type="checkbox" name="nosh"  value="1" checked> Не перемещать</div>' +
  '<input type="hidden" id="orly" name="orly">' + 
    '<div style="float:left; padding-left:100px"><input type="submit" name="bSend" value="Сохранить"></div>' +
    '<div style="clearfix:both;"></div>' + 
  '</form></div>';
  
  e('closeOut').onclick = appWindowClose;
	e('closeIn').onclick = appWindowClose;
}
function aviOnKeyPress(evt) {
  console.log('call aviOnKeyPress');
	if(evt.code == 'KeyC' && evt.ctrlKey) {
		createExportForm();
	}
}
function setact(evt) {
  if (evt.currentTarget.id == 'u1' || evt.target.id == 'u1') {
    w.uact = w.u1;
  }
  if (evt.currentTarget.id == 'u2' || evt.target.id == 'u2') {
    w.uact = w.u2;
  }
  e('execute_block').getElementsByTagName('form')[0].setAttribute('action', w.uact);
}
function createExportForm() {
	//var ls = d.getElementsByClassName();
  closeAborigen();
  appWindow('reportwindow', 'Hello', function(){});
  e('popup').style['z-index'] = 3*1000;
  e('iCity').value = getSelectedText(e('region'));
  e('iRegion').value = e('region').options[1].text;
  e('iTitle').value = d.getElementsByClassName('title-info-title-text')[0].innerText;
  var iBodyRaw = d.getElementsByClassName('item-description-text')[0];
  iBodyRaw = iBodyRaw ? iBodyRaw : d.getElementsByClassName('item-description-html')[0];
  e('iBody').value = iBodyRaw.innerHTML;
  normalizeIBody();
  var priceData = d.getElementsByClassName('js-item-price')[0];
  e('iPrice').value = priceData && priceData.innerText ? priceData.innerText : '1';
  e('iName').value = d.getElementsByClassName('seller-info-name')[0].innerText.trim();
  
  normalizeIPrice();
  //set url
  e('orly').value = w.location.href;
  //set action
  e('u1').onchange = setact;
  e('u1').onclick = setact;
  e('u2').onchange = setact;
  e('u2').onclick = setact;
  var imageWrapper = d.getElementsByClassName('js-item-phone-react')[0];
  if (!imageWrapper) {
    imageWrapper = d.getElementsByClassName('item-phone-button_with-img')[0];
  }
  var image = imageWrapper.getElementsByTagName('img')[0];
  
  e('imPhone').onload = function(){
    e('cPhone').getContext('2d').drawImage(e('imPhone'), 0, 0, e('imPhone').width, e('imPhone').height);
		var drimIt = 0, drimInt = setInterval(function(){
      try {
        var oParser = new iParser();
        //console.log(oParser);
        var pData = oParser.start(e('cPhone'), e('iOneNum'));
        e('iPhone').value = pData;
      } catch(e) {
        console.log('Error on parse phone' + e);
      }
      drimIt++;
      if (drimIt > 5) {
        clearInterval(drimInt);
      }
    }, 1000); 

    
  }
  
  e('imPhone').setAttribute('src', image.getAttribute('src'));//старый вариант с рисунком
  
  
  console.log('end create exp form');
}
function normalizeIPrice() {
  var s = e('iPrice').value, i, inTag, q = '', ch;
  s = s.replace(/[\s]/, '');
  i = parseInt(s);
  if (isNaN(i)) {
    i = 1;
  }
  e('iPrice').value = i;
}
function normalizeIBody() {
  var s = e('iBody').value, i, inTag, q = '', ch;
  while (~s.indexOf('<br>')) {
    s = s.replace('<br>', '\n');
  }
  for (i = 0; i < s.length; i++) {
  	ch = s.charAt(i);
    if (ch == '<') {
  		inTag = true;
		}
  	if (ch == '>') {
  		inTag = false;
  		continue;
		}
    if (!inTag)
  		q += ch;
  }
  e('iBody').value = q.trim();
}
function transportType() {
  return '<div class="right prmf">\
				<input name="people" id="people" value="1" type="checkbox"> <label for="people">Пассажирская</label>				<input name="box" id="box" value="1" type="checkbox"> <label for="box">Грузовая</label>				<input name="term" id="term" value="1" type="checkbox"> <label for="term">Термобудка</label>				<input name="far" id="far" value="1" type="checkbox"> <label for="far">Межгород</label>				<input name="near" id="near" value="1" type="checkbox"> <label for="near">По городу</label>				<input name="piknik" id="piknik" value="1" type="checkbox"> <label for="piknik">За город (пикник)</label>			</div>';
}
//========libs=====
function i(labelText, id) {
  return '<div><label>' + labelText + '</label><input name="' + id + '" id="' + id +'"></div>';
}
function getSelectedText(sel) {
	if (!sel || !sel.tagName == 'SELECT') {
		return '';
	}
	var o = getOptionByValue(sel, sel.value);
	if (o && o.text) {
		return o.text;
	}
	return '';
}
function getOptionByValue(select, n) {
	var i, ls = select.getElementsByTagName('option');
	for (i = 0; i < ls.length; i++) {
		if ( ls[i].value == n ) {
			return ls[i];
		}
	}
	return null;
}

function closeAborigen(){
  var bd = document.getElementsByTagName('body')[0], ls, i, buf = [], sz;
  ls = document.getElementsByClassName('b-popups');
  sz = ls.length;
  for (i = sz - 1; i > -1; i--) {
    ls[i].parentNode.removeChild(ls[i]);
  }
  ls = document.getElementsByClassName('b-popup-overlay');
  sz = ls.length;
  for (i = sz - 1; i > -1; i--) {
    ls[i].parentNode.removeChild(ls[i]);
  }
  bd.classList.remove('popup-locked-scroll');
}
