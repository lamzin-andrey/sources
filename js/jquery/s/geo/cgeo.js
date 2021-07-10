/**
 * Класс организовывает взаимодействие между классами реализующими функционал геолокации.
 * Реализует интерфейс ConcreteSubject паттерна наблюдатель http://wiki.apideliverycity.ru/doku.php?id=geojs#%D0%BF%D0%B0%D1%82%D1%82%D0%B5%D1%80%D0%BD_%D0%BD%D0%B0%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C
*/
AppACME = window.AppACME || {};
/**
 * @constructor
 * @description Инициализация подсистемы гео. Здесь создаются экземпляры наблюдателей 
 * 				и им передается ссылка на предмет наблюдения.
 * 				Если вы создали новый класс реализующий интерфейс IMainGeoForm http://wiki.apideliverycity.ru/doku.php?id=geojs#imaingeoform
 * 				(например у вас новая тема оформления)
 * 				Добавьте его имя как строку в массив _observers
*/
AppACME.CGeo = function() {
	var _observers = 
	[	'CGeoDecoder',
		'MainGeoForm',
		'MapModalDialog',
		'LeftMenuCitySwitcher',
		'FirstRunPopupCitySwitcher',
		'MobileGeoForm'
	], i, s, o;
	
	AppACME.CGeo.superclass.__construct.call(this);

	this.verbose = false;
	
	/**@property {IGeoDecoder} geodecoder объект через который декодируем координаты и адреса. Инкаппсулирует работу с Яндексом и гуглом */
	this.geodecoder    = null;
	
	/**@property {Boolean} lockForSubmit true когда вызвался один из листенеров onCityInListChange или onGeodataSubmit. Пока не будет обработано одно из этих событий, все последющие игнроируются. */
	this.lockForSubmit = false;
	
	/** @property {IMainGeoForm} maingeoform объект через который взаимодействуем с главной геоформой http://wiki.apideliverycity.ru/doku.php?id=geojs#%D1%87%D1%82%D0%BE_%D1%82%D0%B0%D0%BA%D0%BE%D0%B5_maingeoform */
	this.maingeoform  = null;
	
	/** @property {IMainModalDialog} modal -  объект через который взаимодействуем с модальным окном с картой  */
	this.modal = null;
	
	/**@property {String} sCountry переданное через setState значение страны */
	/**@property {String} sCity переданное через setState значение города*/
	/**@property {String} street переданное через setState значение улицы */
	/**@property {String} sNumber переданное через setState значение номера дома */
	/**@property {String} sAddressString переданное через setState значение адресной строки (например в модале окна в текущем дизайне адресная строка пришедшая от яндекса ) */
	this.sCountry = this.sCity = this.street = this.sNumber = this.sAddressString = '';
	
	/**@property {Boolean} _reinitEmptyCoordinatesProcess В том случае, когда после загрузки страницы координаты неизвестны, экземпляр класса делает запрос к сервису гео (Яндекс, Гугл и т п) отдавая на декодирование непустое имя города. Полученные координаты передаются на сервер для сохранения в нашей БД. Свойство принимает true когда отправлен запрос координат с целью сохранить изх в нашей базе данных как координаты города (cities.lat cities.lng)*/
	this._reinitEmptyCoordinatesProcess = false;
	
	//Сюда код ожидания карт и по готовности НЕ ВЫНОСИМ НИ В КАКОМ ВИДЕ. 
	//Вместо этого у декодера существует очередь вызовов функций, которая разбирается после созданиея карт, (получение/установку марекра и прочее в этом духе).
	//Тогда все запрошенные действия выполнятся, когда карты будут загружены.
	for (i = 0; i < _observers.length; i++) {
		s = _observers[i];
		if (AppACME[s] instanceof Function) {
			o = new AppACME[s](this);
			try {
				if (o.provideInterface('IGeoDecoder') && !this.geodecoder) {
					if (AppACME.Yamap) {
						o.addReadyEventListener(AppACME.Yamap, AppACME.Yamap.onYamapsInit);
					}
					this.geodecoder = o;
				}
				if (o.provideInterface('IMapModalDialog') && !this.modal) {
					this.modal = o;
				}
			} catch(e) {
				throw new Error('Class ' + s + ' require extends class Observer or CMainGeoForm!');
			}
			if (s == 'MainGeoForm' && !this.maingeoform) {
				this.maingeoform = o;
			}
		}
	}
	//устанавливаем текущий адрес
	/** @property {String} initialStreet  нужно для того, чтобы понять, есть у нас сохраненная улица в адресе или нет. Иначе будет добавлено наимегнование центральной улицы города */
	this.street = this.initialStreet = this.maingeoform.getStreet();
	/** @property {String} initialHome  нужно для того, чтобы понять, есть у нас сохраненный номер дома в адресе или нет. Иначе будет может быть наименование центрального дома города */
	this.sNumber = this.initialHome = this.maingeoform.getNumber();
	this.sCity = this.maingeoform.getCity().trim();
	
	
	
	if (this.maingeoform.getLat() && this.maingeoform.getLon()) {
		this.geodecoder.decodeCoordinates(this.maingeoform.getLat(), this.maingeoform.getLon(), [ [this, this.onInitCoordinatesLoaded] ]);
	} else {
		if (!this.sCity) {
			var self = this;
			setTimeout(function(){
				self.notify();
			}, 500);
		} else {
			if(this.maingeoform.exists()) {
				this._reinitEmptyCoordinatesProcess = true;
				this.geodecoder.decodeAddressString(this.sCity, [[this, this.onInitCoordinatesLoaded]]);
			}
		}
	}
	
	/* @property {Object} {sCity, sCountry, street, sNumber} исходные параметры запроса */
	this.req = {};
}
extend(Subject, AppACME.CGeo);
var P = AppACME.CGeo.prototype;

P.getState = function() {
	return this;
}
//Координаты выпилил и правильно сделал
P.setState = function(sAddressString, sCountry, sCity, street, sNumber/* TODO выпилить если не понадобится и из доки тоже , fromInput = false, fromDecoder = false*/) {
	this.req.sAddressString = this.sAddressString = sAddressString;
	if (this.verbose) {
		console.log(this.street);
	}
	
	this.req.sCountry = this.sCountry = sCountry;
	
	if (sCity.trim()) {
		this.req.sCity = this.sCity    = sCity;
	}
	
	if (street) {
		this.req.street = this.street   = street;
	}
	if (sNumber) {
		this.sNumber  = sNumber;
	}
	if (this.verbose) {
		console.log('I get state!');
		console.log(this);
	}
	this.notify();
}
/*
 * @description Событие смены города в выпадающем списке. Если вы хотите, чтобы 
 * после смены города в списке отправлялись его координты на сервер,
 * вызовите этот метод в классе реализующем IMainGeoForm например в в обоработчике select.onchange
 * @param {String} name имя города
 * @param {Number} id города - сейчас у нас это id категории агрегатора
*/
P.onCityInListChange = function(name, assignedCategoryId) {
	/*if (this.lockForSubmit) {
		return;
	}*/
	this.lockForSubmit = true;//У нас есть запрос на отправку формы с данными о локации на сервер, пока его не отправим остальные действия пользователя по смене параметров игнорируем.
	//Событие смены города, валидация
	//@return {allow:Boolean, isIdFound:Boolean}
	var info = {},
		o;
	//совпадает ли имя города? Если нет то выходим тут
	if (!this._validate(info, name, assignedCategoryId, true)) {
		return;
	}
	//Событие смены города, смотрим, если декодирование завершено,
	o = this.geodecoder;
	this.req.sCity = name;
	if (!this.geodecoder.procIsRun()) {
		if (!info.isIdFound) {//Город найден в списке, но у него не тот id
			assignedCategoryId = 0;
		}
		//совпадает имя города Если да и пусты улица и дом и есть координаты, то ок (отправляем данные на сервер). Если нет, то: 
		if (o.getStreet() == '' && o.getNumber() == '' && o.getLat() && o.getLon() && name && this.sCity && trim(this.sCity) == trim(this.name)) {
			this._send();
		} else {
			//Если нет, то запрашиваем координаты города и отправим данные тут же после получения координат (передали дополнительный колбек _send)
			o.decodeAddressString(this.addNamePrefix(name), [[this, this._send]]);//Создает очередь запросов к декодеру
		}
	//Событие смены города, смотрим, если не декодирование завершено,
	} else {
		 //В текущей очереди запросов декодирования в каждом элементе очищаем очередь колбеков
		 o.clearQueue();
		 o.clearAllAdditionalCallbacks();//очищает очередь колбеков в каждом элементе очереди запросов на декодирование. Первым делом ставит флаг ИгнорироватьКолбеки, пройдя всю очередь снимает его. И текущую очередь колбеков тоже очищает
		 o.decodeAddressString(this.addNamePrefix(name), [[this, this._send]]);//Запросим координаты выбранного города и тут же отправим их
	}
}
/*
Это событие нажатие кнопки Отправить формы или Enter в поле ввода.
* Аргументов нет и это нормально. 
* Потому что у нас на странице куча форм геолокации (минимум две).
* Слушатель события (который уже подписан на него, вы переписываете только этот класс связанный с DOM)
* запросит данные у ConcreteSubject (Observer)
*/
P.onGeodataSubmit = function() {
	/*if (this.lockForSubmit) {
		return;
	}*/
	var info = {}, o = this.geodecoder;
	if (!this._validate(info)) {
		return;
	}
	this.lockForSubmit = true;//У нас есть запрос на отправку формы с данными о локации на сервер, пока его не отправим остальные действия пользователя по смене параметров игнорируем.
	//если декодирование не выполняется в момент события, если есть координаты, отправляем.
	if (!o.procIsRun()) {
		//если есть координаты, отправляем.
		if (o.getLat() && o.getLon() && (o.street == this.maingeoform.getStreet()) && (o.sNumber == this.maingeoform.getNumber())) {
			this._send();
			return;
		} else {
			// если нет координат, отправляем запрос декодеру передавая текущий адрес наблюдателя 
			try {
				o.decodeAddressString(this._getAddressString(), [[this, this._send]]);
			} catch(e) {
				if (this.verbose) {
					console.log(e);
				}
			}
		}
	} else {
		//o.decodeAddressString(this._getAddressString(), [[this, this._send]]);
		o.setCurrentAdditionalListeners([[this, this._send]]);
	}
}
/**
 * @description Валидация данных перед отправкой. Если не переданы явно, возьмет из полей этого класса
*/
P._validate = function(info, cityName, assignedCategoryId, noValidateStreetAndHome){
	if (!cityName) {
		cityName = this.sCity;
	}
	if (!assignedCategoryId) {
		assignedCategoryId = this.maingeoform.getCityIdByName(cityName);
	}
	var r = this.maingeoform.isAllowCity(cityName, assignedCategoryId);
	info.isIdFound = r.isIdFound;
	info.allow = r.allow;
	if (!info.allow) {
		AppACME.Messages.fail(__('This_city_nt_present_on_cite'));
		this.lockForSubmit = false;
		return false;
	}
	/*if (!noValidateStreetAndHome) {
		if (!AppACME.useCoordinatesOfCityFromSelect && (!this.street || !this.sNumber)) {
			AppACME.Messages.fail(__('messages.address.set.street_and_home'));
			return false;
		}
	}*/
	return true;
}
/**
 * @return {String} собирает адрес из собственных полей установленых методом setState
*/
P._getAddressString = function() {
	var a = [], i, o = this, s, id, srcCityName, sCity;
	(o.sCountry ? (a.push(o.sCountry) ) : 0);
	srcCityName = o.sCity;
	console.log('CGeo::_getAddressString');
	console.log('o.sCity = ' + o.sCity);
	
	if (o.sCity) {
		o.req.sCity = o.sCity;
		sCity = this.addNamePrefix(o.sCity);
		console.log('sCity = ' + o.sCity);
	}
	(sCity ? (a.push(sCity) ) : 0);
	(o.street ? (a.push(o.street) ) : 0);
	(o.sNumber ? (a.push(o.sNumber) ) : 0);
	s = a.join(', ');
	o.sAddressString = String(o.sAddressString);
	if (s.length < o.sAddressString.length && (!sCity || o.sAddressString.indexOf(srcCityName) != -1) ) {
		console.log('s = ' + o.sAddressString);
		s = o.sAddressString;
	}
	return s;
}
/**
 * @description отправка данных о геолокации на наш сервер. Метод должен вызываться только когда геодекодирование завершено.
 * Данные о компонентах адреса , как сейчас и сделано ДОЛЖНЫ получаться только из декодера
*/
P._send = function() {
	var o = this, frm, gdc = o.geodecoder, s;
	this._createHiddenForm();
	frm = this.hiddenForm;
	
	s = frm.iCity.value = gdc.getCity();
	frm.iCategoryId.value = o.maingeoform.getCityIdByName(s);
	frm.iCountry.value = gdc.getCountry();
	frm.iHome.value = gdc.getNumber();
	
	frm.iLat.value = gdc.getLat();
	frm.iLon.value = gdc.getLon();
	//TODO если после тестов все ок удалить комментарий frm.iRadius.value = 10;
	frm.iStreet.value = gdc.getStreet();
	frm._token.value = AppACMEWebAppLibrary.getToken();
	frm.submit();
}
/**
 * @description добавляет на страницу форму сплошь из скрытых полей. Отправляем на сервер именно её
*/
P._createHiddenForm = function() {
	if (this.hiddenForm) {
		return;
	}
	var b = $(document.getElementsByTagName('body')[0]), ps = '<input name="isPrelandingPage" value="1" type="hidden">', o = this;
	if (!o.maingeoform.isPrelandingPage) {
		ps = '';
	}
	o.hiddenForm = $('<form action="/switchlocation" method="POST">' + ps + '\
	<input name="iCity" type="hidden">\
	<input name="iCategoryId" type="hidden">\
	<input name="iCountry" type="hidden">\
	<input name="iStreet" type="hidden">\
	<input name="iHome" type="hidden">\
	<input name="iLat" type="hidden">\
	<input name="iLon" type="hidden">\
	<input name="_token" type="hidden">\
	<input type="submit" style="display:none;">\
	')
	b.append(this.hiddenForm);
	o.hiddenForm = this.hiddenForm[0];
}
/**
 * @description @see описание  _reinitEmptyCoordinatesProcess
*/
P.onInitCoordinatesLoaded = function() {
	if (!this._reinitEmptyCoordinatesProcess) {
		return;
	}
	var o = this, gdc = o.geodecoder._geodecoder;
	if (o.sCity && gdc.nLat && gdc.nLon) {
		AppACMEWebAppLibrary._post({name:o.sCity, lat:gdc.nLat, lng:gdc.nLon}, function(){o.onSuccessSetCityCoordinates();}, '/setcitycoordinates', function(){o.onSuccessSetCityCoordinates();});
	}
}
/**
 * @description @see описание  _reinitEmptyCoordinatesProcess
*/
P.onSuccessSetCityCoordinates = function(d) {
	this.maingeoform.setLat(this.geodecoder._geodecoder.nLat);
	this.maingeoform.setLon(this.geodecoder._geodecoder.nLon);
	this._reinitEmptyCoordinatesProcess = false;
}
/**
 * @description Добавляет к имени населенного пункта название региона если они доступны
 * @param {String} s
*/
P.addNamePrefix = function(s) {
	var o = this, id = o.maingeoform.getCityIdByName(s), hash;
	if (id && $('#regions')[0]) {
		try {
			hash = JSON.parse($('#regions').val());
			if (hash[id]) {
				s = hash[id] + ', ' + s;
			}
		} catch(e) {;}
	}
	return s;
}
