/**
 * Класс реализует общие для реализующих интерфейс IMainGeoForm функции
 * Описание IMainGeoForm http://wiki.apideliverycity.ru/doku.php?id=geojs#imaingeoform
 * Все классы, реализующие интерфейс IMainGeoForm 
 * должны наследоваться от этого класса.
*/
/**
 * @description
 * @constructor
 * @param {CGeo (ConcreteSubject)} subject
*/
AppACME.CMainGeoForm = function(subject) {
	/** @property {CGeo} subject конкретный предмет наблюдения - когда в нем что то меняется мы тоже что -то меняем  */
	this.subject = subject;
	AppACME.CMainGeoForm.superclass.__construct.call(this, subject);
	this.subject.attach(this);
	
	/** @property {Array} _interfaces хэш интерфейсов, по которому можно определить, реализует ли экземпляр класса тот или иной интерфейс  */
	this._interfaces = {IMainGeoForm:1};
	
	/** @property {Boolean} _textFieldsIsLock Стобы при печатании текст не пропадал @see _onInputTextChange */
	this._textFieldsIsLock = false;
	
	/** @property {Object} библиотека для удобного доступа к функциям */
	this.Lib = AppACMEWebAppLibrary;
	
	this.initSubmitAction();
	
	this.initTextChangeAction();

	this.verbose = false;
	
	/** @property {} */
	//this. = ;
}
extend(Observer, AppACME.CMainGeoForm);
var P = AppACME.CMainGeoForm.prototype;
//Pattern Observer
P.update = function() {
	this._update();
}
/**
 * @return true если на странице существует форма геолокации
*/
P.exists = function() {
	return $('#iLon')[0] ? true : false;
}
P._update = function() {
	var o = this, s = o.subject;
	o.setCity(s.sCity);
	if (!o._textFieldsIsLock) {
		o.setStreet(s.street);
		o.setNumber(s.sNumber);
	}
	//s.onInitCoordinatesLoaded();
}
/**
 * @description 
 * @param {String} s имя города ли населенного пункта
 * @param {Number} nCityId имя города ли населенного пункта
 * @return {allow:Boolean, isIdFound:Boolean}
 * 	 allow - true если s есть в списке городов
 * 	 isIdFound - true если nCityId совпал с id города
*/
P.isAllowCity = function(s, nCityId) {
	var o = this, a = o.getCitiesList(), i, r = {};
	if (o.verbose) {
		console.log('isAllowCity get s = "' + s + '", id = ' + nCityId );
	}
	for (i = 0; i < a.length; i++) {
		if (a[i] && a[i][1] == s ) {
			r.allow = true;
			r.isIdFound = false;
			if (parseInt(a[i][0]) === parseInt(nCityId)) {
				r.isIdFound = true;
			}
			return r;
		}
	}
	r.allow = r.isIdFound = false;
	return r;
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
 * @description Установить в инпуте выбранный город. В большинстве реализаций формы это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @param {String} name имя города
 * @param {Number} id идентификатор города
 * @param {String} hid элемента HtmlSelect, если передан берется список по нему, иначе по HTML_CITIES_LIST_ID
*/
P.setCity = function(name, id) {
	this._setCity(name, id);
}
/**
 * @see setCity
*/
P._setCity = function(s, id, hid) {
	var _id, o = this, sel;
	_id = hid ? hid : o.HTML_CITIES_LIST_ID;
	sel = $(_id)[0];
	if (sel) {
		o.Lib.selectByText(sel, s);
	}
}
/**
 * @description Получить наименование активного выбранного города. В большинстве реализаций формы это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @param {String} name имя города
 * @param {Number} id идентификатор города
 * @return {String}
*/
P.getCity = function(name, id) {
	var o = this, sel = $(o.HTML_CITIES_LIST_ID)[0];
	if (sel) {
		return o.Lib.getSelectedText(sel);
	}
	return '';
}
/**
 * @description Получить наименование активного выбранного города. В большинстве реализаций формы это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @param {String} name имя города
 * @param {Number} id идентификатор города
 * @return {String}
*/
/**
 * @description Получить массив городов В большинстве реализаций формы это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @param {String} id если передан берется список по нему, иначе по  HTML_CITIES_LIST_ID
 * @return Array of Array. Формат элемента: [id, имя_города]
*/
P.getCitiesList = function(id) {
	return r._getCitiesList(id);
}
/**
 * @see getCitiesList
*/
P._getCitiesList = function(id) {
	var _id, o = this, sel, j, i, r = [];
	_id = id ? id : o.HTML_CITIES_LIST_ID;
	sel = $(_id)[0];
	if (sel) {
		for (i = 0; i < sel.options.length; i++) {
			j = sel.options[i];
			r.push([j.value, j.text]);
		}
	}
	return r;
}
/**
 * @description Получить идентификатор активного выбранного города. В большинстве реализаций формы это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @param {String} name имя города
 * @param {String} id если передан берется список по нему, иначе по  HTML_CITIES_LIST_ID
 * @return {Number}
*/
P.getCityIdByName = function(name, id) {
	return this._getCityIdByName(name, id);
}
/**
 * @see getCityIdByName
*/
P._getCityIdByName = function(s, id) {
	var _id, o = this, L = o.Lib, j, n = 0, sel;
	_id = id ? id : o.HTML_CITIES_LIST_ID;
	sel = $(_id)[0];
	if (sel) {
		j = L.getOptionByText(sel, s);
		if (j && j.value) {
			n = parseInt(j.value);
			n = n ? n : 0;
		}
	}
	return n;
}
/**
 * Получить долготу из скрытого инпута (используется при загрузке страницы)
 * Расчет на то что на странице есть скрытый инпут с значением долготы
 * Перегрузите в наследнике при необходимости
 * @return {Number Float}
*/
P.getLat = function() {
	return parseFloat($('#iLat').val());
}
/**
 * @description Получить долготу из скрытого инпута (используется при загрузке страницы)
 * Расчет на то что на странице есть скрытый инпут с значением широты
 * Перегрузите в наследнике при необходимости
 * @return {Number Float}
*/
P.getLon = function() {
	return parseFloat($('#iLon').val());
}
/**
 * Установить долготу в скрытом инпуте (используется при загрузке страницы)
 * Расчет на то что на странице есть скрытый инпут с значением долготы
 * Перегрузите в наследнике при необходимости
 * @return {Number Float}
*/
P.setLat = function(n) {
	$('#iLat').val(parseFloat(n));
}
/**
 * @description Установить долготу в скрытом инпуте (используется при загрузке страницы)
 * Расчет на то что на странице есть скрытый инпут с значением широты
 * Перегрузите в наследнике при необходимости
 * @return {Number Float}
*/
P.setLon = function(n) {
	$('#iLon').val(parseFloat(n));
}
/**
 * @description Устанавливает имя улицы в отображаемый элемент формы. В большинстве реализаций формы это всё-таки обычное текстовое поле.
 * Данный метод работает с таким полем, вам надо только перегрузить HTML_STREET_INPUT_ID
 * Если у вас более сложный вариант, перегрузите метод в наследнике.
 * @param {String} s
*/
P.setStreet = function(s) {
	var i = $(this.HTML_STREET_INPUT_ID);
	if (i[0]) {
		i.val(s);
	}
}
/**
 * @description Устанавливает номер дома в отображаемый элемент формы. В большинстве реализаций формы это всё-таки обычное текстовое поле.
 * Данный метод работает с таким полем, вам надо только перегрузить HTML_HOME_INPUT_ID
 * Если у вас более сложный вариант, перегрузите метод в наследнике.
 * @param {String} sNumber
*/
P.setNumber = function(sNumber) {
	var i = $(this.HTML_HOME_INPUT_ID);
	if (i[0]) {
		i.val(sNumber);
	}
}
/**
 * @description возвращает имя улицы из отображаемого элемента формы. В большинстве реализаций формы это всё-таки обычное текстовое поле.
 * Данный метод работает с таким полем, вам надо только перегрузить HTML_STREET_INPUT_ID
 * Если у вас более сложный вариант, перегрузите метод в наследнике.
 * @param {String} s
 * @return {String}
*/
P.getStreet = function() {
	var i = $(this.HTML_STREET_INPUT_ID), s = '';
	if (i[0]) {
		s = i.val();
	}
	return s;
}
/**
 * @description Возвращает номер дома из отображаемого элемента формы. В большинстве реализаций формы это всё-таки обычное текстовое поле.
 * Данный метод работает с таким полем, вам надо только перегрузить HTML_HOME_INPUT_ID
 * Если у вас более сложный вариант, перегрузите метод в наследнике.
 * @param {String} s
 * @return {String}
*/
P.getNumber = function() {
	var i = $(this.HTML_HOME_INPUT_ID), s = '';
	if (i[0]) {
		s = i.val();
	}
	return s;
}
/**
 * @description возвращает id города на основе имени города из отображаемого элемента формы. Если не удалось найти вернет -1.
 * В большинстве реализаций формы выпадающий список городов это всё-таки выпадающий список HtmlSelect
 * Данный метод работает с таким списком. Если ук вас более сложный вариант, перегрузите метод в наследнике
 * @return {Number}
*/
P.getCityId = function() {
	return this.getCityIdByName(this.getCity() );
}
/**
 * @description Инициализация формы отправки, скорее всего будет достаточно перегрузить HTML_FORM_ID и HTML_FIND_BUTTON_ID
 * @return {Number}
*/
P.initSubmitAction = function() {
	var o = this;
	$(o.HTML_FORM_ID).bind('submit', function(e){
		e.preventDefault();
		//o.subject.geodecoder.decodeAddressString(o.subject._getAddressString(), []);
		o.subject.onGeodataSubmit();
	});
}
/**
 * @description Для большинства форм в настоящее время для улицы и дома используются простые поля ввода
 * Это обработка смены текста в них.
 * Если метод не будет работать или мешать, перегрузите его в наследнике
*/
P.initTextChangeAction = function() {
	var o = this, iStreet = $(o.HTML_STREET_INPUT_ID), iHome = $(o.HTML_HOME_INPUT_ID);
	iStreet = iStreet[0] ? iStreet : 0;
	iHome   = iHome[0] ? iHome : 0;
	if (iStreet && iHome) {
		iStreet.bind('keydown', function() {
			o._skipTextFieldsIsLock = o._textFieldsIsLock = true;
			setTimeout(function(){
				o._onInputTextChange();
			}, 500);
		});
		iHome.bind('keydown', function() {
			o._skipTextFieldsIsLock = o._textFieldsIsLock = true;
			setTimeout(function(){
				o._onInputTextChange();
			}, 500);
		});
	}
}
/**
 * initTextChangeAction
*/
P._onInputTextChange = function() {
	var o = this, g = o.subject, mf = o.subject.maingeoform;
	g.setState('', g.sCountry, o.getCity(), o.getStreet(), o.getNumber() );
	o._skipTextFieldsIsLock = false;
	setTimeout(function(){
		if (!o._skipTextFieldsIsLock) {
			o._textFieldsIsLock = false;
		}
	}, 1000);
	
}
