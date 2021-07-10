/**
 * Класс наследуется от CGeoDecoderBase см. также его описание.
 * Реализует интерфейс IGeoDecoder http://wiki.apideliverycity.ru/doku.php?id=geojs#igeodecoder
 * Экземпляр класса (объект типа AppACME.CGeoDecoder) доступен как AppACME.geo.geodecoder;
 * См. также комментарий к классу CYandexGeoDecoder
*/
AppACME = window.AppACME || {};
AppACME.CGeoDecoder = function(subject) {
	//проверить, надо ли явно выполнять parent::__construct- но скорее всего надо
	AppACME.CGeoDecoder.superclass.__construct.call(this, subject);
	/*console.log('this._activeServiceMapProvider'); TODO это ок без галп, если и с галп ок, то удалить
	console.log(this._activeServiceMapProvider);
	console.log('If topped not Yandex - NEED call parent::__construct()!');
	* /
	/* @property {Object} _geodecoders Коллекция конкретных геокодеров (один для яндекса и один джля гугла будет добавлен когда надо будет)*/
	this._geodecoders = {};
	this._geodecoders[this.YANDEX] = new AppACME.CYandexGeoDecoder(subject);
	/* @property {Object} _loadedDecoders Объект заполняется по мере вызовов onConcreteMapServiceLoad. Как только его размер сравгняется с размером _geodecoders будет вызван onMapServiceLoad */
	this._loadedDecoders = {};
	//когда у нас появится класс для гугла - раскомментировать
	//this._geodecoders[this.GOOGLE] = new AppACME.CGoogleGeoDecoder(subject);
	
	this.verbose = false;

	this.setMapServiceProvider(this._activeServiceMapProvider);
}
extend(AppACME.CGeoDecoderBase, AppACME.CGeoDecoder);
var P = AppACME.CGeoDecoder.prototype;

/**
 * @description Передаёт запрос на декодирование конкретному поставщику карт
 * @param {String} s
 * @param {Array} listeners
*/
P._decodeAddressString = function(s, listeners) {
	this._geodecoder._decodeAddressString(s, listeners);
}
/**
 * @description Передаёт запрос на декодирование координат конкретному поставщику карт
 * @param {Number} nLat
 * @param {Number} nLon
 * @param {Array} listeners
*/
P._decodeCoordinates = function(nLat, nLon, listeners) {
	this._geodecoder._decodeCoordinates(nLat, nLon, listeners);
}
/**
 * @description Передаёт запрос на создание карты конкретному поставщику карт
 * @param {String} id идентификатор DOM элемента, Яндекс без него не может (без #)
 * @param {Object} options Опции при конфигурировании ЯКарт. См документацию яндекс
 * @param {Funciton} onClickEventListener Обработка события клика на карте, необязательный параметр
 * @return {Object} map
*/
P._createMap = function(id, options, onClickEventListener) {
	return this._geodecoder._createMap(id, options, onClickEventListener);
}
/**
 * @description Передаёт запрос на перемещение маркера на карте конкретному поставщику карт
 * @param {Object} map Объект полученый вызовом IGeoDecoder::createMap
 * @param {Object} marker Объект полученый вызовом IGeoDecoder::addMarker
 * @param {Number} nLat 
 * @param {Number} nLon 
 * @param {Number} nZoom 
*/
P._moveMarker = function(map, marker, nLat, nLon, nZoom) {
	return this._geodecoder._moveMarker(map, marker, nLat, nLon, nZoom);
}
/**
 * @description Передаёт запрос на получение масштаба карты конкретному поставщику карт
 * @param {Object} map Объект полученый вызовом IGeoDecoder::createMap
*/
P._getZoom = function(map) {
	return this._geodecoder._getZoom(map);
}
/**
 * @description Передаёт запрос на установку маркера на карте конкретному поставщику карт
 * @param {Object} map полученный вызовом _createMap
 * @param {Number} nLat координата
 * @param {Number} nLon координата
 * @param {String} Заголовок маркера при клике
 * @param {String} Текст маркера при клике
 * @return {Object} marker
*/
P._addMarker = function(map, nLat, nLon, sTitle, sText) {
	return this._geodecoder._addMarker(map, nLat, nLon, sTitle, sText);
}
/**
 * @description 
 * @return {String} текстовое наименование города. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку - название город
*/
P.getCity = function() {
	return this._geodecoder.getCity();
}
/**
 * @description 
 * @return {String} текстовое наименование страны. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку - название страны
*/
P.getCountry = function() {
	return this._geodecoder.getCountry();
}
/**
 * @description 
 * @return {String} строку с номером дома. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученную от сервиса карт строку -  номер дома
*/
P.getNumber = function() {
	return this._geodecoder.getNumber();
}
/**
 * @description 
 * @return {String}  текстовое наименование улицы . Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  текстовое наименование улицы
*/
P.getStreet = function() {
	return this._geodecoder.getStreet();
}
/**
 * @description 
 * @return {Number}  числовое значение широты . Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  числовое значение широты
*/
P.getLat = function() {
	return this._geodecoder.getLat();
}
/**
 * @description 
 * @return {Number}  числовое значение долготы. Если слушатели событий onDecodeAddressString или onDecodeCoordinates ещё не вызывались, вернет пустую строку. Иначе полученное от сервиса карт  числовое значение долготы
*/
P.getLon = function() {
	return this._geodecoder.getLon();
}
/**
 * @description 
 * @return {String} Вернет полученную от сервиса адресную строку , если гугл её не возвращает, построить самостоятельно (у яндекса одноименный метод есть).
*/
P.getAddressString = function() {
	return this._geodecoder.getAddressString();
}
/**
 * @description 
 * @param {Event} Объект события, нативный для используемого поставщика карт
 * @return {Array} координаты точки, по которой кликнули на карте [nLat, nLon]
*/
P.getCoordinatesFromClickEventObject = function(evt) {
	return this._geodecoder._getCoordinatesFromClickEventObject(evt);
}
/**
 * @description Событие вызывается, когда для поставщика карт, работу с которым вы реализуете
 * 	(реализуя интерфейс IGeoDecoder) стали доступны скрипты поставщика 
 * (например для яндекса сначала становится доступным объект window.ymaps и вы можете дождаться события ymaps.ready 
 * 	в котором и вызовите AppACME.geo.geodecoder.onConcreteMapServiceLoad(AppACME.CGeoDecoder.YANDEX);
 * Если проект использует несколько сервисов карт одновременно, экземпляр класса CGeoDecoder вызовет 
 * this.onMapServiceLoad когда для каждого сервиса будет вызвано событие onConcreteMapServiceLoad, 
 * вам не придется для этого ничего делать
 * @param {String} s строка CGeoDecoder.YANDEX или CGeoDecoder.GOOGLE
*/
P.onConcreteMapServiceLoad = function(s) {
	var o = this;
	o._loadedDecoders[s] = 1;
	if (o.count(o._loadedDecoders) == o.count(o._geodecoders)) {
		o.onMapServiceLoad();
	}
}
/**
 * @description Устанавливает конкретный поставщик карт, с которым работаем
 * @param {String} s CGeoDecoder.YANDEx или GOOLE
 * Если в очереди _mapQueue есть запросы на вызов функций, которые должны быть вызваны только тогда, когда карты загружены, вызывает их все от первой до последней.
*/
P.setMapServiceProvider = function(s) {
	this._activeServiceMapProvider = s;
	this._geodecoder = this._geodecoders[s];//определены в CGeoDecoder
}

P.count = function(data) {
	if (!data) {
		return 0;
	}
	if (data instanceof Array || isset(data.length)) {
		return data.length;
	}
	var i, c = 0;
	for (i in data) c++;
	return c;
}
