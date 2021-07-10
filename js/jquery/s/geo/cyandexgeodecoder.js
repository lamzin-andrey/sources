/**
 * Класс наследуется от CGeoDecoderBase см. также его описание.
 * Реализует интерфейс IGeoDecoder http://wiki.apideliverycity.ru/doku.php?id=geojs#igeodecoder
 * Экземпляр данного класса - элемент массива CGeoDecoder._geodecoders. 
 * Все реализованные здесь методы вызываются не напрямую, а экземпляром класса CGeoDecoder. Он доступен как
 * AppACME.geo.geodecoder;
 * Когда необходима работа (имеется ввиду не в коде данного класса, а в коде использующем геолокацию)
 * одновременно с двумя сервисами карт, вы можете вызвать
 * 	AppACME.geo.geodecoder.setMapServiceProvider(AppACME.CGeoDecoder.YANDEX)  и тогда все вызовы методов
 *  AppACME.geo.geodecoder существующие в интерфейсе IGeoDecoder будут переадресованы данному классу
 *  если вам понадобился гугл - вызываете AppACME.geo.geodecoder.setMapServiceProvider(AppACME.CGeoDecoder.GOOGLE)
 *  и после этого все вызовы методов AppACME.geo.geodecoder существующие в интерфейсе IGeoDecoder
 *  будут переадресованы данному классу работающему с гуглом.
 * @note! Класс для гугла напишете сами, его не существует. И добавите его в _geodecoders конструктора CGeoDecoder
 *  (там одну строчку раскомментировать)
*/
AppACME = window.AppACME || {};
AppACME.CYandexGeoDecoder = function(subject) {
	var o = this;
	AppACME.CYandexGeoDecoder.superclass.__construct.call(o, subject);
	this.verbose = false;

	//setTimeout(function(){o._listenMapReady(); 10});
	o._listenMapReady();
	/* @property {Object} */
	//this. = ;
}
extend(AppACME.CGeoDecoderBase, AppACME.CYandexGeoDecoder);
var P = AppACME.CYandexGeoDecoder.prototype;

/**
 * @description Декодирует строку в координаты. По окончанию вызывает обработчик
 *  onDecodeAddressString или​ onFailDecodeAddressString.
 *  Аргумент listeners необязательный,​ в него можно передать дополнительные обработчики,​ которые вызовутся после работы 
 * 	onDecodeAddressString. Элемент массива listeners - массив из двух элементов,​ первый - контекст,​ втоой функция.
 * В классе CGeoDecoderBase от которого должен наследоваться каждый класс, реализующий интерфейс IGeoDecoder 
 * есть метод decodeAddressString. Если в момент вызова процесс декодирования уже выполняется,​ данные помещаются в очередь
 *  FIFO для обработки и будут отправлены. когда закончится текущий процесс декодирования.
 * ​Отправка выполняется вызовом ​ данного метода - _decodeAddressString. 
 * Его реализуем здесь путём взаимодействия с сервисом карт.
 * @param String s
 * @param Array listeners
*/
P._decodeAddressString = function(s, listeners) {
	var o = this, myGeocoder, sbj = o.subject;
	try {
		if (o.verbose) {
			console.log(':: _decodeAddressString : bef call geocode');
		}
		myGeocoder = ymaps.geocode(s);
		myGeocoder.then(
			function (res) {
				o.onDecodeAddressString.apply(o, [res]);
			},
			function (err) {
				o.onFailDecodeAddressString.apply(o, [err]);
			}
		);
	} catch(e) {
		if (this.verbose) {
			console.log(e);
		}
	}
}
/**
 * @description
*/
P.onDecodeAddressString = function(res) {
	this._onDecodeResult(res);
}
/**
 * @description
*/
P._onDecodeResult = function(res, n) {
	var o = this;
	o._parseResponse(res, n);
	//Обязательно вызовите этот метод класса - родителя, он сделает за вас всю рутину по работе с геосервисами да и Предмет Наюлюдения обновит
	if (!n) {
		o.onDecodeAddressStringBase();
	} else {
		o.onDecodeCoordinatesBase();
	}
}
/**
 * @description
*/
P.onDecodeCoordinates = function(res) {
	//console.log(this);
	this._onDecodeResult(res, 1);
}
/**
 * @description
*/
P.onFailDecodeCoordinates = function(res) {
	this.onFailDecodeCoordinatesBase(err);
}
/**
 * @description
*/
P.onFailDecodeAddressString = function(res) {
	this.onFailDecodeAddressStringBase(err);
}
/**
 * @description При реализации этого метода надо используя поставщик карт, работу с которым реализуете,
 * 	получить объект карты и вернуть его. метод базвого класса CGeoDecoderBase::createMap
 * 	контролирует доступность сервиса геокарт и вызовет ваш _createMap как только сервис станет доступен.
 * Так как мы всегда можем явно задать конкретный поставщик карт перед вызовом createMap,
 * options мы тоже передаем (если хотим) для выбранного поставщика карт
 * @param {String} id идентификатор DOM элемента, Яндекс без него не может (без #)
 * @param {Object} options Опции при конфигурировании ЯКарт. См документацию яндекс
 * @param {Funciton} onClickEventListener Обработка события клика на карте, необязательный параметр
*/
P._createMap = function(id, options, onClickEventListener) {
	//try {
		options = options ? options : {
			center: [55.752883, 37.629748], 
			controls: ['zoomControl'],
			zoom: 9
		};
		if (this.verbose) {
			console.log(id);
		}
		var map = new ymaps.Map(id, options);
		if (onClickEventListener) {
			map.events.add('click', onClickEventListener);
		}
		return map;
	/*} catch(e) {
		console.log('CYandexGeoDecoder не удалось содать карту:');
		console.log(e);
	}*/
	return {};
}
/**
 * @description Перемещает маркер на карте
 * @param {Object} map Объект полученый вызовом IGeoDecoder::createMap
 * @param {Object} marker Объект полученый вызовом IGeoDecoder::addMarker
 * @param {Number} nLat 
 * @param {Number} nLon 
 * @param {Number} nZoom 
*/
P._moveMarker = function(map, marker, nLat, nLon, nZoom) {
	var coords = [nLat, nLon];
	marker.geometry.setCoordinates(coords, nZoom);
	map.setCenter(coords, nZoom);
}
/**
 * @description Перемещает маркер на карте
 * @param {Object} map Объект полученый вызовом IGeoDecoder::createMap
 * @param {Object} marker Объект полученый вызовом IGeoDecoder::addMarker
 * @param {Number} nLat 
 * @param {Number} nLon 
 * @param {Number} nZoom 
*/
P._getZoom = function(map) {
	if (map.getZoom instanceof Function) {
		return map.getZoom();
	}
	return 9;
}
/**
 * @description При реализации этого метода надо используя поставщик карт, работу с которым реализуете,
 * 	добавить на полученный объект карты маркер и вернуть полученный объект. 
 * 	Метод базвого класса CGeoDecoderBase::addMarker
 * 	контролирует доступность сервиса геокарт и вызовет ваш _createMap как только сервис станет доступен.
 * @param {Object} map полученный вызовом _createMap
 * @param {Number} nLat координата
 * @param {Number} nLon координата
 * @param {String} Заголовок маркера при клике
 * @param {String} Текст маркера при клике
 * @return {Object} marker
*/
P._addMarker = function(map, nLat, nLon, sTitle, sText) {
	var m = new ymaps.Placemark([nLat, nLon], {
			hintContent:sTitle,
			balloonContent: sText});
	//Тут я так опрометчиво вызываю geoObjects потому что подсистема geo должна гарантировать доступность сервиса карт на момент вызова функции
	map.geoObjects.add(m);
	map.setCenter([nLat, nLon], map.getZoom());
	return m;
}
/**
 * @description Декодирует координаты в строку. По окончанию вызывает обработчик onDecodeCoordinates или
 * onFailDecodeCoordinates. 
 *  В классе CGeoDecoderBase от которого должен наследоваться каждый класс, реализующий интерфейс IGeoDecoder 
 * 	есть метод decodeAddressString. Если в момент вызова процесс декодирования уже выполняется,​ данные помещаются 
 * 	в очередь FIFO для обработки и будут отправлены. когда закончится текущий процесс декодирования.
 * 	Отправка выполняется вызовом ​ данного метода - _decodeCoordinates.
 * Его реализуем здесь путём взаимодействия с сервисом карт.
 * @param Number nLat
 * @param Number nLon
 * @param Array listeners Формат listeners см. в описании decodeAddressString.
*/
P._decodeCoordinates = function(nLat, nLon, listener) {
	var o = this, myGeocoder = ymaps.geocode([nLat, nLon]);
	myGeocoder.then(
		function (res) {
			o.onDecodeCoordinates.apply(o, [res]);
		},
		function (err) {
			o.onFailDecodeCoordinates.apply(o, [err]);
		}
	);
}
/**
 * @description 
 * @return {String} текстовое наименование города. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку - название город
*/
P.getCity = function() {
	return this.sCity;
}
/**
 * @description 
 * @return {String} текстовое наименование страны. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку - название страны
*/
P.getCountry = function() {
	return this.sCountry;
}
/**
 * @description 
 * @return {String} строку с номером дома. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку -  номер дома
*/
P.getNumber = function() {
	return this.sNumber;
}
/**
 * @description 
 * @return {String}  текстовое наименование улицы . Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  текстовое наименование улицы
*/
P.getStreet = function() {
	return this.street;
}
/**
 * @description 
 * @return {Number}  числовое значение широты . Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  числовое значение широты
*/
P.getLat = function() {
	return this.nLat;
}
/**
 * @description 
 * @return {Number}  числовое значение долготы. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  числовое значение долготы
*/
P.getLon = function() {
	return this.nLon;
}
/**
 * @description 
 * @return {String} Вернет полученную от сервиса адресную строку , если гугл её не возвращает, построить самостоятельно (у яндекса одноименный метод есть).
*/
P.getAddressString = function() {
	return this.sAddressString;
}
/**
 * @description Разбор ответа от Яндекса, заполнение наших компонент 
 * адреса, они после этого станут доступны в get* методах интерфейса IGeoDecoder
 * @param res - результат от ЯЫндекса
 * @param {Boolean} isCoordinateResult true когда обрабатываем ответ от декодирования координат
*/
P._parseResponse = function(res, isCoordinateResult) {
	var o = this,
		names = [], s, i, j, buf = [], doContinue, coords;
	// Переберём все найденные результаты и
	// запишем имена найденный объектов в массив names.
	res.geoObjects.each(function (obj) {
		names.push(obj.properties.get('name'));
	});
	o._setAddressComponents(res.geoObjects, isCoordinateResult);
	//names.splice(1,1);
	for (i = 0; i < names.length; i++) {
		s = names[i];
		if (~s.indexOf('округ')) {
			continue;
		}
		doContinue = 0;
		for (j = 0; j < buf.length; j++) {
			if (~buf[j].indexOf(s)) {
				doContinue = 1;
				break;
			}
		}
		if (doContinue) {
			continue;
		}
		buf.push(s);
	}
	
	coords = res.geoObjects.get(0);
	if (coords) {
		o.sAddressString = buf.join(', ');
		coords = coords.geometry.getCoordinates();
		o.nLat = coords[0];
		o.nLon = coords[1];
	}
}
/**
 * @description @see _parseResponse
 * @param {Boolean} isCoordinateResult true когда обрабатываем ответ от декодирования координат
*/
P._setAddressComponents = function(objs, isCoordinateResult) {
	var i, j, o = this, k = 0, a, m, p = '', srv = AppACME.MapHelper, cid,
		currAddressLine, sbj = o.subject, s, responseCityListIsEmpty, f;
	o.street = 	o.sNumber = o.sCity = o.sCountry = p;
	objs.each(function(j, i) {
		if (k == 4) {
			
			return;
		}
		//get Address Line
		if (!currAddressLine) {
			currAddressLine = j.getAddressLine();
			currAddressLine = currAddressLine ? currAddressLine.trim() : '';
		}
		//get City Name
		if (!o.sCity) {
			a = j.getLocalities();
			if (!a || !a.length) {
				responseCityListIsEmpty = true;
			} else {
				responseCityListIsEmpty = false;
			}
			
			if (o.verbose) {
				console.log(a);
			}
			
			if (isset(a, 0)) {
				s = a[0].trim();
				for (m = 0; m < srv.citiesSign.length; m++) {
					s = s.replace(srv.citiesSign[m], '').trim();
				}
				if (s && (~s.indexOf(sbj.req.sCity) || isCoordinateResult) ) {
					if (!isCoordinateResult) {
						o.sCity = sbj.req.sCity;
					} else {
						o.sCity = s;
					}
					k++;
				}
			}
		}
		f = o.sCity || responseCityListIsEmpty;
		//get number of home
		if (!o.sNumber && f) {
			o.sNumber = j.getPremiseNumber();
			o.sNumber = o.sNumber ? o.sNumber.trim() : '';
			k++;
		}
		//get street
		if (!o.street && f) {
			o.street = j.getThoroughfare();
			o.street = o.street ? o.street.trim() : '';
			/*for (m = 0; m < srv.streets.length; m++) {
				o.street = o.street.replace(srv.streets[m], '').trim();
			}*/
			if (o.street) {
				//console.log('str = ' + o.street);
				k++;
			}
		}
		//get country
		if (!o.sCountry  && f) {
			o.sCountry = j.getCountry();
			o.sCountry = o.sCountry ? o.sCountry.trim() : '';
			if (o.sCountry) {
				k++;
			}
		}
	});
	if (o.sCountry && !o.sCity && currAddressLine) {//это сволочная подстава от яндекса при поиске адреса "Москва"
		cid = AppACME.geo ? AppACME.geo.maingeoform.getCityIdByName(currAddressLine) : sbj.maingeoform.getCityIdByName(currAddressLine);
		if (cid) {
			o.sCity = currAddressLine;
		} else {
			o.sCity = AppACME.geo.maingeoform.getCity();
		}
	}
}
/**
 * @description 
 * @param {Event} Объект события, нативный для используемого поставщика карт
 * @return {Array} координаты точки, по которой кликнули на карте
*/
P._getCoordinatesFromClickEventObject = function(evt) {
	return evt.get('coords');
}
/**
 * @description Ждем, пока загрузятся яндекс карты, как только, так вызываем
*/
P._listenMapReady = function() {
	var o = this, s, ival, g = o.subject.geodecoder;
	ival = setInterval(function(){
		if (window.ymaps && ymaps.ready && g) {
			ymaps.ready(function(){
				g.onConcreteMapServiceLoad(g.YANDEX);
			});
			clearInterval(ival);
		}
		if (!g) {
			g = o.subject.geodecoder;
		}
	}, 1000);
	
}
