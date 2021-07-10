/**
 * Класс реализует интерфейс Наблюдаителя Паттерна Наблюдатель  http://wiki.apideliverycity.ru/doku.php?id=geojs#%D0%BF%D0%B0%D1%82%D1%82%D0%B5%D1%80%D0%BD_%D0%BD%D0%B0%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C
 * TODO выпилить строку если правда Экземпляр класса  надеюсь что не нужен  // (объект типа AppACME.MapModalDialog) доступен как AppACME.geo.;
*/
AppACME = window.AppACME || {};
/**
 * @description
 * @constructor
 * @param {CGeo (ConcreteSubject)} subject
*/
AppACME.CMapModalDialog = function(subject) {
	this.verbose = false;
	/** @property {CGeo} subject конкретный предмет наблюдения - когда в нем что то меняется мы тоже что -то меняем  */
	this.subject = subject;
	
	this.subject.attach(this);
	
	/* @property {Array} _interfaces хэш интерфейсов, по которому можно определить, реализует ли экземпляыр класса тот или иной интерфейс  */
	this._interfaces = {IMapModalDialog:1, IObserver:1};
	
	/** @property {Object} Для удобного доступа к вспомогательным функциям */
	this.Lib = AppACMEWebAppLibrary;
	
	/** @property {Object Map} объект карты  */
	this.map = {};
	
	/** @property {Boolean} true когда карта создана  */
	this.mapCreated = false;
	
	/** @property {Boolean} если true после создания маркера, он будет перемещен */
	this.needMoveMarkerOnCreate = false;
	
	/** @property {Object Placemark} объект маркера на карте  */
	this.marker = {};
	
	/** @property {Boolean} true когда маркер создан  */
	this.markerCreated = false;
	
	/** @property {Number} defaultZoom масштаб карты по умолчанию  */
	this.defaultZoom = 9;
	
	/** @property {Number} defaultZoom текущий масштаб карты, устанавливается при обработке клика на карте   */
	this.currentZoom = this.defaultZoom;
	this.setListeners();
}
extend(Observer, AppACME.CMapModalDialog);
var P = AppACME.CMapModalDialog.prototype;
/**
 * @description Как только данные в одной из форм обновились (или пришли от сервиса карт), тоже обновляемся
*/
P.update = function() {
	var o = this;
	if (!o.isGuiFound()) {//в наследнике
		return;
	}
	o.setAddressString(o.subject._getAddressString(), o.needMoveMarkerOnCreate);
	o.needMoveMarkerOnCreate = false;
}
/**
 * @description 
 * @param String s имя интерфейса
 * @return {Boolean} true если обеспечиывает интерфейс
*/
P.provideInterface = function(s) {
	if (this._interfaces[s] === 1) {
		return true;
	}
	return false;
}
/**
 * @description Обработчик события клтка на кнопке модальног окна Найти на карте
 * @return
*/
P.onClickSearchOnMap = function() {
	var o = this;
	o.setAddressString(o.getAddressString(), true);
}
/**
 * @description Установит содержимое поля ввода адреса. Если вторым аргументом не передано явно false запросит координаты у сервиса геокарт и установит на карте маркер
 * @param {String} s 
 * @param {Boolean} setMarkerOnCart = true
*/
P.setAddressString = function(s, setMarkerOnCart) {
	var o = this;
	if (!o.isGuiFound()) {
		return;
	}
	setMarkerOnCart = o.Lib.True(setMarkerOnCart);
	o.iAddress.val(s);
	if (setMarkerOnCart) {
		o.subject.geodecoder.decodeAddressString(s, [[o, o.onGetPointCoordinates]]);
	}
}
/**
 * @description Вызывается когда получены координаты ,вычисленные геодекодером от адреса из адресной строки
 *  контекст длоэен быть правильный - данного класса
 * @return {} 
*/
P.onGetPointCoordinates = function() {
	var o = this, gdc = o.subject.geodecoder, lat = gdc.getLat(), lon = gdc.getLon();
	//по получении переместить маркер
	o.currentZoom = gdc.getZoom({}, function(){}, o.map);
	gdc.moveMarker(o.map, o.marker, lat, lon, o.currentZoom);
}

/**
 * @description Событие, когда загруженf карта
 * @param {Object} map - объект через который можно взаимодействовать с картой передавая его как аргумент в методы IGeoDecoder::addMarker
 * @return {String}
*/
P.onMapCreate = function(map) {
	var o = this, g, nLat = 55.752883, nLon = 37.629748, mf;
	o.map = map;
	o.mapCreated = true;
	//TODO тут координаты получать из геодекодера, если их нет, то из geo если и там нет, то по умолчанию использовать эти
	if (o.markerCreated) {
		o.setPosition();
	} else {
		g = o.subject.geodecoder;
		mf = o.subject.maingeoform;
		if (g && g.getLat() && g.getLon()) {
			nLat = g.getLat();
			nLon = g.getLon();
		} else if (mf && mf.getLat() && mf.getLon()) {
			nLat = mf.getLat();
			nLon = mf.getLon();			
		} else {
			o.needMoveMarkerOnCreate = 1;
		}
		o.currentMarkerNLat = nLat;
		o.currentMarkerNLon = nLon;
		o.subject.geodecoder.addMarker(o, o.onMarkerCreate, o.map, nLat, nLon, '', '');
	}
}
/**
 * @description Событие, когда загруженf карта
 * @param {Object} map - объект через который можно взаимодействовать с маркером на карте передавая его как аргумент в методы IGeoDecoder::moveMarker
 * @return {String}
*/
P.onMarkerCreate = function(marker) {
	var o = this, g, nLat, nLon;
	o.marker = marker;
	o.markerCreated = true;
	g = o.subject.geodecoder;
	if (g && g.getLat() && g.getLon()) {
		nLat = g.getLat();
		nLon = g.getLon();
		if (nLat != o.currentMarkerNLat ) {
			o.needMoveMarkerOnCreate = false;
			g.moveMarker(o.map, o.marker, nLat, nLon, o.currentZoom);
		}
	} else if(o.needMoveMarkerOnCreate){
		o.setPosition();
	}
}

/**
 * @description Событие окончания декодирования координат после клика по карте в строку адреса
 * @param {Event} evt - событие клика на карте, нативное для используемого сервиса карт. Это значит что для работы с ним надо использовать методы IGeoDecoder
 * @return {String}
*/
P.onGetAddressString = function() {
	//контекст должен быть верным
	var o = this, g = o.subject.geodecoder;
	if (o.verbose) {
		console.log('call onGetAddressString');
	}
	//скорее всего ничего гне надо, само выполнится после получения координат
	//notify all
	//o.setAddressString(o.subject);
	//o.subject.notify();
}
P.onBtnConfirmClick = function() {
	this.subject.onGeodataSubmit();
}
/**
 * @description 
 * @param  {} 
 * @return {}
*/
P.setListeners = function() {
	var self = this;
	//TODO переписать если поля наследника окажутся доступными (последний клик сделан через поле)
	//"#selectOnMap"
	$(self.getSelectOnMapBtnId()).bind('click', function(evt){
		evt.preventDefault();
		self.open();
	});
	//
	$(self.getOrderFormAdddressInputCss()).bind('click', function(evt){
		evt.preventDefault();
		self.open(true);
	});
	//"#mSelectOnMap"
	$(self.getSelectOnMapMobileBtnId()).bind('click', function(evt){
		evt.preventDefault();
		self.open();
	});
	//".geolocation-form__modal-button_close"
	$(self.getCloseBtnSelector()).bind('click', self.close);
	
	//"#searchOnMapBtn"
	$(self.HTML_SEARCH_ON_MAP_BTN_ID).bind('click', function(evt){
		evt.preventDefault();
		self.onClickSearchOnMap();
	});	
	
	$(self.HTML_BTN_CONFIRM_ID).bind('click', function(evt){
		evt.preventDefault();
		self.onBtnConfirmClick();
	});
}
/**
 * @description Событие клика на карте
 * @param {Event} evt - событие клика на карте, нативное для используемого сервиса карт. Это значит что для работы с ним надо использовать методы IGeoDecoder
 * @return {String}
*/
P.onMapClick = function(evt) {
	if (this.verbose) {
		console.log('Click from parent!');
	}
	var g = AppACME.geo, o = g.modal, gdc = g.geodecoder, coords;
	//get coords
	coords = gdc.getCoordinatesFromClickEventObject(evt);
	o.currentZoom   = gdc.getZoom(o, o.onZoomData, o.map);
	gdc.moveMarker(o.map, o.marker, coords[0], coords[1], o.currentZoom);
	//get addr
	gdc.decodeCoordinates(coords[0], coords[1], [[o, o.onGetAddressString]]);//TODO onGetAddressString если не нужна удалить
}
/**
 * @description Устанавливает данные о масштабе карты, если они не были известны на момент запроса IGeoDDecoder:getZoom
*/
P.onZoomData = function(nZoom) {
	this.currentZoom = nZoom;
}
/**
 * @description Перемещает маркер в соответствии с указаном в строке адресом
*/
P.setPosition = function() {
	var o = this;
	s = o.getAddressString();
	if (s) {
		o.setAddressString(s);
	}
}
/**
 * @description Вызовите этот метод после открытия модального окна. 
 * Если карта не создана, создает. Если создана, перемещает маркер куда надо.
*/
P.actualizeMap = function() {
	var o = this;
	if (!o.mapCreated) {
		o.subject.geodecoder.createMap(o, o.onMapCreate, o.HTML_MAP_CONTAINER_ID_RAW, 0, o.onMapClick);
	}
	if (o.markerCreated) {
		o.setPosition();
	}
}
