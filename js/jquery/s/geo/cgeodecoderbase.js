/**
 * Класс организовывает взаимодействие между сервисами карт (Яндекс или/и Гугл)
 * Реализует интерфейс ConcreteObserver паттерна наблюдатель http://wiki.apideliverycity.ru/doku.php?id=geojs#%D0%BF%D0%B0%D1%82%D1%82%D0%B5%D1%80%D0%BD_%D0%BD%D0%B0%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C
 * Все классы, реализующие интерфейс IGeoDecoder http://wiki.apideliverycity.ru/doku.php?id=geojs#igeodecoder
 * должны наследоваться от этого класса.
*/
AppACME = window.AppACME || {};
/**
 * @description
 * @param {CGeo (ConcreteSubject)} subject
*/
AppACME.CGeoDecoderBase = function(subject) {
	/* @property {CGeo} subject конкретный предмет наблюдения - когда в нем что то меняется мы тоже что -то меняем  */
	this.subject = subject;
	
	/* @property {Array} _decodeQueue массив запросов на декодирование. Формат объекта {name:имя метода который надо вызвать, args: аргументы, которые надо ему передать (массив)}*/
	this._decodeQueue = [];
	
	/* @property (Array} currentListeners массив дополнительных обработчиков декодиррования адреса или координат. Формат элемента: массив из двух элементов. Первый это объект в контексте которого надо вызвать второйкак функцию. */
	this.currentListeners = [];
	
	/* @property {Array} _interfaces хэш интерфейсов, по которому можно определить, реализует ли экземпляыр класса тот или иной интерфейс  */
	this._interfaces = {IGeoDecoder:1};
	
	/* @property {Boolean} geoServiceIsLoaded true когда скрипты сервиса карт загружены и готовы к работе  */
	this.geoServiceIsLoaded = false;
	
	/* @property {Boolean} processIsRun true когда отправлен запрос к сервису карт */
	this.processIsRun = false;
	
	/* @property {Array} _decodeQueue массив запросов на вызов функций, использующих поставщик геокарт. Заполняется при вызове фметодов рабготающих с геокартами до того, как карты загружены. Формат элемента {ctx:контекст, в котором будет вызван метод mth, mth:метод который надо вызвать, args: аргументы, которые надо ему передать (массив), selfMethod:строка с именем метода определенного в этом классе или в его наследнике результат вызова каоторого будет передан в mth как аргумент, actualServiceMapProvider:актуальный на момент вызова запроса поставщик гео карт}*/
	this._mapQueue = [];
	
	/* @property {Boolean} _ignoreCallbacks  используется при очистке очереди колбеков. Перед очисткой очереди устанавливается в true после очистки false. Если по обработчику события запущен цикл выполнения колбеков, будет выполнен только текущий, прочие будут проигнорированы*/
	this._ignoreCallbacks = false;
	
	/* @property {String} YANDEX признак работы с yandex все запросы будут переадресованы к  CYandexGeoDecoder */
	this.YANDEX = 'yandex';
	
	/* @property {String} GOOGLE признак работы с google все запросы будут переадресованы к  CGoogleGeoDecoder (его пока нет!) */
	this.GOOGLE = 'google';
	
	/* @param {String} _activeServiceMapProvider строка, определяющая, какой именно сервис карт использовать, если сайт использует их несколько одновременно Значение может быть CGeoDecoder.YANDEX или CGeoDecoder.GOOGLE */
	this._activeServiceMapProvider = this.YANDEX;
	
	/* @param {Array} сторонние слушатели подписавшиеся на событие onMapServiceLoad*/
	this._readyListeners = [];
	
	/**@property {String} sCountry полученное в результате декодирования  значение страны */
	/**@property {String} sCity полученное в результате декодирования  значение города*/
	/**@property {String} street полученное в результате декодирования  значение улицы */
	/**@property {String} sNumber полученное в результате декодирования  значение номера дома */
	/**@property {String} sAddressString полученное в результате декодирования  значение адресной строки (например в модале окна в текущем дизайне адресная строка пришедшая от яндекса ) */
	this.sCountry = this.sCity = this.street = this.sNumber = this.sAddressString = '';
	/**@property {Number} nLat полученное в результате декодирования  значение координаты */
	/**@property {Number} nLon полученное в результате декодирования  значение координаты */
	this.nLat = this.nLon = 0;
	
	this.subject.attach(this);
	
	this.testStr = 'Это тестовая строка из CGeoDecoderBase';

	this.verbose = false;
}
extend(Observer, AppACME.CGeoDecoderBase);
var P = AppACME.CGeoDecoderBase.prototype;

/**
 * @description Добавляет в очередь данные (строку административного адреса) для запроса на обработку или отправляет запрос на обработку если очередь пуста
 * @param String s
 * @param Array listeners @see this.currentListeners
*/
P.decodeAddressString = function(s, listeners) {
	var o = this;
	if (o.procIsRun()) {
		o._addInDecodeQueue('decodeAddressString', [s, listeners]);
	} else {
		o.processIsRun = true;
		o.currentListeners = listeners ? listeners : [];
		try {
			o._decodeAddressString(s, listeners);//это реализуется в наследнике
		} catch(e) {
			o.processIsRun = false;
		}
	}
}
/**
 * @description Добавляет в очередь данные (координаты) для запроса на обработку или отправляет запрос на обработку если очередь пуста
 * @param String s
 * @param Array listeners @see this.currentListeners
*/
P.decodeCoordinates = function(nLat, nLon, listeners) {
	var o = this;
	listeners = listeners ? listeners: [];
	if (o.procIsRun()) {
		o._addInDecodeQueue('decodeCoordinates', [nLat, nLon, listeners]);
	} else {
		o.processIsRun = true;
		o.currentListeners = listeners ? listeners : [];
		try {
			o._decodeCoordinates(nLat, nLon, listeners);//это реализуется в наследнике
		} catch(e) {
			o.processIsRun = false;
		}
	}
}
/**
 * @description Обработка успешного декодирования строки адреса
*/
P.onDecodeCoordinatesBase = function() {//в конкретном приемнике парсим ответ от сервиса карт и вызываем этот метод.
	var o = this;
	var geo, t, item, i, ctx, mth;
	geo = AppACME.geo ? AppACME.geo : (o && o.subject ? o.subject : null);
	if (!geo) {
		o.clearAll();
		throw new Error('Unable get CGeo context');
		return;
	}
	t = geo.geodecoder;
	
	//оповестили всех, что пришли координаты
	if (this.verbose) {
		console.log('Пришли координаты а улица равна ' + t.getStreet());
	}
	t.subject.setState(t.getAddressString(), t.getCountry(), t.getCity(), t.getStreet(), t.getNumber() );
	t.processIsRun = false;
	//вызвали все слушатели
	t._runAdditioonalListeners();//TODO тут вероятно засада: если хоть один дополнительный 
								//listener установит в итоге  t.processIsRun = true, значит все последующие могут быть 
								//неоднократно добавлены в очередь. Как избежать, думать. И возможно, что на самом деле проблемы нет.
								
	if (t.procIsRun()) {//кто то из дополнительных слушателей задействовал на уже, значит в очередь пока не лезем.
		return;
	}
	//забрали из очереди следующего ждуна и выполнили запрос к сервису геокарт
	t._runNextQueueItem();
}
/**
 * @description Обработка не успешного декодирования строки адреса. Сбрасываем флаг ожидания и берем из очереди следующий запрос если он там есть
*/
P.onFailDecodeCoordinatesBase = function(err) { //в конкретном при неудаче получения ответа от сервиса карт вызываем этот метод.
	AppACME.Messages.success( __('address.Addres.not.found.try.again') );
	var geo = AppACME.geo, t = geo.geodecoder, item, i, ctx, mth;
	t.processIsRun = false;
	t._runNextQueueItem();
}
/**
 * @description Очищает очередь запросов на декодирование
*/
P.clearQueue = function() {
	this._decodeQueue = [];
}
/**
 * @description Очищает очередь дополнительных обработчиков в каждом запросе на декодирование
 *  Первым делом ставит флаг ИгнорироватьКолбеки, пройдя всю очередь снимает его. 
 *  Текущую очередь колбеков тоже очищает
*/
P.clearAllAdditionalCallbacks = function() {
	var i, a = 	this._decodeQueue, j, o, p, k, q;
	this.currentListeners = [];
	this._ignoreCallbacks = true;
	for (i = 0; i < a.length; i++) {
		o = a[i].args;
		for (j = 0; j < o.length; j++) {
			p = o[j];
			if (p instanceof Array && p[0]) {
				q = p[0];
				if ( (q instanceof Array) && q.length == 2 && (q[0] instanceof Object) && (q[1] instanceof Function) ) {
					this._decodeQueue[i].args[j] = [];
					break;
				}
			}
		}
	}
	this._ignoreCallbacks = false;
}
/**
 * @description Обработка успешного декодирования строки адреса
*/
P.setCurrentAdditionalListeners = function(listeners) {
	this.currentListeners = listeners ? listeners : [];
}
/**
 * @description Обработка успешного декодирования строки адреса
*/
P.onDecodeAddressStringBase = function() { //в конкретном приемнике парсим ответ от сервиса карт и вызываем этот метод.
	var o = this;
	var geo, t, item, i, ctx, mth;
	geo = AppACME.geo ? AppACME.geo : (o && o.subject ? o.subject : null);
	if (!geo) {
		o.clearAll();
		t.processIsRun = false;
		throw new Error('Unable get CGeo context');
		return;
	}
	t = geo.geodecoder;
	
	//оповестили всех, что пришли координаты
	t.subject.setState(t.getAddressString(), t.getCountry(), t.getCity(), t.getStreet(), t.getNumber() );
	t.processIsRun = false;
	//вызвали все слушатели
	t._runAdditioonalListeners();
	if (t.procIsRun()) {//кто то из дополнительных слушателей задействовал на уже, значит в очередь пока не лезем.
		return;
	}
	//забрали из очереди следующего ждуна и выполнили запрос к сервису геокарт
	t._runNextQueueItem();
}
/**
 * @description Вызываем в случае фатальной ошибки
*/
P.clearAll = function() {
	o.clearQueue();
	o.clearAllAdditionalCallbacks();
	o.currentListeners = [];
	o.processIsRun = false;
	//o._mapQueue = []; пока не чистим
}
/**
 * @description Обработка не успешного декодирования строки адреса. Сбрасываем флаг ожидания и берем из очереди следующий запрос если он там есть
*/
P.onFailDecodeAddressStringBase = function(err) { //в конкретном при неудаче получения ответа от сервиса карт вызываем этот метод.
	AppACME.Messages.success( __('address.Addres.not.found.try.again') );
	AppACME.Messages.success( __('address.Addres.not.found.try.again') );
	var geo = AppACME.geo, t = geo.geodecoder, item, i, ctx, mth;
	t.processIsRun = false;
	t._runNextQueueItem();
}
/**
 * @description Вызов всех дополнительных обработчиков, добавленых при вызове decode* функций
*/
P._runAdditioonalListeners = function() {
	var t = this, i;
	for (i = 0; i < t.currentListeners.length; i++) {
		if (t._ignoreCallbacks) {
			continue;
		}
		if (t.currentListeners[i] instanceof Array) {
			ctx = t.currentListeners[i][0];
			mth = t.currentListeners[i][1];
			if ((ctx instanceof Object) && (mth instanceof Function) ) {
				mth.apply(ctx);
			}
		}
	}
}
/**
 * @description Извлекает из очериди очередной запрос на выполнение функциии и выполняет его
 * @param String sFunctionName
 * @param Array listeners
*/
P._runNextQueueItem = function() {
	var t = this, item;
	if (t._decodeQueue.length > 0) {
		item = t._decodeQueue.shift();
		if (t[item.name] instanceof Function) {
			t[item.name].apply(t, item.args);
		}
	}
}
/**
 * @description Добавляет в очередь данные для вызова собственного метода с именем sFunctionName когда процесс ожидания ответа от геосервиса будет завершен.
 * @param String sFunctionName
 * @param Array listeners
*/
P._addInDecodeQueue = function(sFunctionName, args) {
	var o = {};
	o.name = sFunctionName;
	o.args = args;
	this._decodeQueue.push(o);
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
 * @description 
 * @return {Boolean} true если отправлен запрос на декодирование или сервис ещё не доступен
*/
P.procIsRun = function() {
	return (this.processIsRun || !this.geoServiceIsLoaded);
}
/**
 * @description За счет этого метода мы перестаем зависеть от Яндекса или гугла, просто получаем себе еще одну карту.
 * 				Если на момент вызова createMap карта ещё не доступна, ваш запрос будет добавлен в очередь.
 * 				Как только скрипты сервиса карт будут загружены, 
 * 				будет вызвана функция method в контексте объекта context а ей передан уже готовый объект карты
 * @param {Object}   context
 * @param {Function} method
 * @param {String} id идентификатор DOM элемента, Яндекс без него не может (без #)
 * @param {Object} options Опции при конфигурировании ЯКарт. См документацию яндекс
 * @param {Funciton} onClickEventListener Обработка события клика на карте, необязательный параметр
*/
P.createMap = function(context, method, id, options, onClickEventListener) {
	var o = this, a = [id, options, onClickEventListener];
	if (o.geoServiceIsLoaded) {
		a = [o._createMap(id, options, onClickEventListener)];//_createMap реализован в  классе - наследнике работающем с сервисом
		method.apply(context, a);
	} else {
		o._addInMapDependsCallback('_createMap',  o._activeServiceMapProvider, context, method, a);
	}
}
/**
 * @description Мы добавляем объекты на карту используя собственный addMarker и за счёт этого избавляемся 
 * 		от зависимости от поставщика карт. Если на момент вызова addMarker карта ещё не доступна, 
 * 		ваш запрос будет добавлен в очередь. Как только скрипты сервиса карт будут загружены, будет 
 * 		вызвана функция method в контексте объекта context и ей будут переданы прочие аргументы.
 * 		Object map класса использующего данный метод никогда не должен быть null или undefined, 
 * 		он должен всегда содержать хотя бы "пустой" Объект {}
 * @param {Object} context
 * @param {Function} method
 * @param {Object} map не должен быть undefined  или null, если карты не загружены на момент вызова, пусть содержит пустой объект
 * @param {Number} nLat
 * @param {Number} nLon
 * @param {String} sTitle
 * @param {String} sText
*/
P.addMarker = function(context, method,  map, nLat, nLon, sTitle, sText) {
	var o = this, a = [map, nLat, nLon, sTitle, sText];
	if (o.geoServiceIsLoaded) {
		method.apply(context, [o._addMarker(map, nLat, nLon, sTitle, sText)]);
	} else {
		o._addInMapDependsCallback('_addMarker', o._activeServiceMapProvider, context, method, a);
	}
}
/**
 * @description Метод имеет все особенности moveMarker
 * @param {Object} context
 * @param {Function} method
 * @param {Object} map не должен быть undefined  или null, если карты не загружены на момент вызова, пусть содержит пустой объект 
*/
P.getZoom = function(context, method,  map) {
	var o = this, a = [map], ret = false;
	if (o.geoServiceIsLoaded) {
		ret = o._getZoom(map);
		method.apply(context, [ret]);
	} else {
		o._addInMapDependsCallback('_getZoom', o._activeServiceMapProvider, context, method, a);
	}
	return ret;
}
/**
 * @description Добавляет в очередь запросы на вызов функций, которые должны быть вызваны только тогда, когда 
 * @param {String} sFunction имя функции которая будет вызвана в контексте данного класса (или его наследника) с целью получить геообъект
 * @param {String} sActiveServiceMapProvider актуальный на момент вызова функции поставщик карт
 * @param {Object} context
 * @param {Function} method
 * @param {Array} args
*/
P._addInMapDependsCallback = function(sFunction, sActiveServiceMapProvider, context, method, args) {
	var o = {};
	o.ctx = context;
	o.mth = method;
	o.args = args;
	o.selfMethod = sFunction;
	o.actualServiceMapProvider = sActiveServiceMapProvider;
	this._mapQueue.push(o);
}
/**
 * @description Это событие должно вызыватсья только тогда, когда загружены все поставщики карт. Например если сайт станет одновременно использовать карты google и yandex, этот обработчик вызывать только тогда, когда и ymaps и google.geocoder станет доступным.
 *  Если в очереди _mapQueue есть запросы на вызов функций, которые должны быть вызваны только тогда, когда карты загружены, вызывает их все от первой до последней.
*/
P.onMapServiceLoad = function() {
	var i, o = this, j, safe, r;
	if (!o._geodecoder) {
		o.setMapServiceProvider(_activeServiceMapProvider);
	}
	o.geoServiceIsLoaded = true;
	o._runAdditioonalListeners();
	for (i = 0; i < o._mapQueue.length; i++) {
		j = o._mapQueue[i];
		if (o[j.selfMethod] && (o[j.selfMethod] instanceof Function) ) {
			safe = o._activeServiceMapProvider;
			r = o[j.selfMethod].apply(o, j.args);
			if ( (j.mth instanceof Function) && (j.ctx instanceof Object) ) {
					o.setMapServiceProvider(j.actualServiceMapProvider);
				try {
					j.mth.apply(j.ctx, [r]);
				}catch(e) {
					o.setMapServiceProvider(safe);
				}
			}
			o.setMapServiceProvider(safe);
		}
	}
	//Если в очереди на запросы есть уже запросы, всыполним их
	o._runNextQueueItem();
	// и подписанных на событие загрузки карт тожже оповещаем
	for (i = 0; i < o._readyListeners.length; i++) {
		j = o._readyListeners[i];
		if ( (j.mth instanceof Function) && (j.ctx instanceof Object) ) {
			try {
				j.mth.apply(j.ctx);
			}catch(e) {;}
		}
	}
}
/**
 * @description если какие-то классы, не существующие пока в проектиуемой структуре не существуют, они могут нуждаться в обработке события, когда все карты готовы
 * Добавьте в них код AppACME.geo.geodecoder.addReadyEventListener(this. this.onMapReady);
 * Object context
 * Function callback
*/
P.addReadyEventListener = function(context, callback) {
	var o = {};
	o.ctx = context;
	o.mth = callback;
	this._readyListeners.push(o);
}
/**
 * @description За счет этого метода мы перестаем зависеть от Яндекса или гугла, просто передвигаем абстрактный маркер на абстрактной карте.
 * 				Если на момент вызова  карта ещё не доступна, ваш запрос будет добавлен в очередь.
 * 				Как только скрипты сервиса карт будут загружены, 
 * 				будет вызвана функция класса, реализующего работу с конкретным сервислм карт
 * @param {Object} map Объект полученый вызовом IGeoDecoder::createMap
 * @param {Object} marker Объект полученый вызовом IGeoDecoder::addMarker
 * @param {Number} nLat 
 * @param {Number} nLon 
 * @param {Number} nZoom 
*/
P.moveMarker = function(map, marker, nLat, nLon, nZoom) {
	var o = this, a = [map, marker, nLat, nLon, nZoom];
	if (o.geoServiceIsLoaded) {
		o._moveMarker(map, marker, nLat, nLon, nZoom);//_moveMarker реализован в  классе - наследнике работающем с сервисом карт
	} else {
		o._addInMapDependsCallback('_moveMarker',  o._activeServiceMapProvider, 0, 0, a);
	}
}
//Pattern Observer - для совместимости
P.update = function() {}
