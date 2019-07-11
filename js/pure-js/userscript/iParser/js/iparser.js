/**
 * @class iParser
 * 
 * Собственно, сам "анализатор" каптчи
 * 
 * 
 * Определена ширина цифры- 22 покамест самый простой пример, цифры без искажений.
 * 
 * Далее добавить 8 ректов разноцветных и для всех определить иксы
 * 
 * Координаты для цифр (цифры нумерукем с нуля):
 * 
 * 2  - >  63
 * 3  - >  86
 * 4  - > 122 
 * 5  ->  146
 * 6  ->  168
 * 7  ->  207
 * 8  ->  231
 * 9  ->  231
 * 10 ->  267
 * 11 ->  292
 * 
 * 
 * 
 * Далее вырезать примеры циферок (возможно, не используя se2d)
 * 
 * Далее, пилить алгоритм распознавания
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
		//console.log(o.NUM_MAP);
		result.push( /*o.NUM_MAP[*/ /*o.EXAMPLES[*/ maxWeightM /*]*/ /*]*/ );//NUM_MAP - отображение типа 'ZERO' : 0
		infoI++;
		
		//console.log(aUniq);
		//console.log(fragmentImageData);
		//break;
	}
	console.log(result);
	return ('8 9' + result[0] + result[1] + ' ' + result[2] + result[3] + result[4] + ' ' + result[5] + result[6] + ' ' + result[7] + result[8] );
}

/**
 * по возможности монохромить!
 * @description Получить ImageData фрагмента canvasWithCaptcha со смещением NUM_POSITIONS[k] и шириной NUM_WIDTH
 * @param {Number} k
 * @param {HtmlCanvas} canvasWithCaptcha
 * @param {HtmlCanvas} canvasForNum - если понадобится сюда вставим скопированую циферку
 * @return ImageData
*/
iParser.prototype.getFragment = function(k, canvasWithCaptcha) {
	var ctx = canvasWithCaptcha.getContext('2d'), o = this;
	return ctx.getImageData(o.NUM_POSITIONS[k], 0, o.NUM_WIDTH, o.IMG_HEIGHT);
}
/**
 * по возможности монохромить!
 * @description Получить ImageData примера цифры смещением 0 и шириной NUM_WIDTH
 * @param {Number} m - индекс в EXAMPLES
 * @param {HtmlCanvas} canvasForNum - сюда вставим пример циферки
 * @return ImageData
*/
iParser.prototype.getExampleImageData = function(m, canvasForNum) {
	var img = new Image(), o = this;
	
	var ctx = canvasForNum.getContext('2d');
	ctx.clearRect(0, 0, o.NUM_WIDTH, o.IMG_HEIGHT);
	img.setAttribute('src', o[o.EXAMPLES[m] ]);
	ctx.drawImage(img, 0, 0, img.width, img.height);
	return ctx.getImageData(0, 0, o.NUM_WIDTH, o.IMG_HEIGHT);
}


