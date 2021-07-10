window.AppACME = window.AppACME || {};

/**
 * @object Управление меткой авторизации
*/
window.AppACME.AuthMarker = {
	/** @property {String} STORAGE_MARKER_KEY */
	STORAGE_MARKER_KEY: 'STORAGE_MARKER_KEY',
	/** @property {Number} in days */
	expires: 730,
	/** @property {String}  */
	COOKIE_NAME: 'am',
	/**
	 *@param {Object} lib  функции и константы из Immediately функции 
	 *@param {Array} registredClasses массив объектов, принимающих данные, зависящие от stamp, например Favorites. Кажждый элемент массива - объект, ключ - имя класса, значение - объект, который должен иметь метод onSuccess, в него будут передаваться данные
	 *  Например, для избранного {Favorites:{onSuccess:function(data){} } }
	*/
	init:function(lib, registredClasses) {
		this.lib = lib;
		this.registredClasses = registredClasses;
		var am = this.am = this.COOKIE_NAME;
		if (!$.cookie(am)) {
			if (localStorage && localStorage.getItem) {
				var marker = localStorage.getItem(this.STORAGE_MARKER_KEY);
				if (marker) {
					$.cookie(am, marker, {expires:this.expires, path: '/'});
					lib._post({}, this.onSuccess, '/c/setmarker', this.onFail);
				}
			}
		} else if ($.cookie(am)) {
			if (localStorage && localStorage.getItem) {
				var marker = localStorage.getItem(this.STORAGE_MARKER_KEY);
				if (!marker) {
					localStorage.setItem(this.STORAGE_MARKER_KEY, $.cookie(am));
				}
			}
		}
	},
	/** 
	 * TODO для перехода на мобильную авторизацию:
	 * .....
	 * /end TODO
	 * 
	 * @description В случае если в ответе есть массив registredData вызывает для каждого элемента, присутствующего к тому же в AuthMarker.registredClasses метод onSuccess(data.registredData[i])
	 * @param {Object} data - данные об успешной либо неуспешной получении маркера авторизации 
	*/
	onSuccess:function(data) {
		console.log(data);
		var self =  window.AppACME.AuthMarker;
		if (data && data.registredData) {
			var handlers = self.registredClasses,
				registredData = data.registredData,
				i, className, fullClassName;
			for (i = 0; i < registredData.length; i++) {
				className = registredData[i].className;
				if( registredData[i].data) {
					if ( handlers[className] && handlers[className].onSuccess instanceof Function) {
						handlers[className].onSuccess(registredData[i].data);
					} 
				} else if (registredData[i].errorInfo){
					if ( handlers[className] && handlers[className].onError instanceof Function) {
						handlers[className].onError(registredData[i].errorInfo, registredData[i].sourceData);
					} 
				}
			}
		}
	},
	/**
	 * @description Пытается найти в данных массив registredData а в нем элемент с ключом key
	 * @param {Array} data
	 * @param {String} key
	 * @return {Object}||{Null}
	*/
	getFromRegistredData: function (data, key) {
		var i;
		if (data && data.registredData && (data.registredData instanceof Array)) {
			for (i = 0; i < data.registredData.length; i++) {
				if (data.registredData[i].className == key) {
					return data.registredData[i].data;
				}
			}
		}
		console.log(data);
		return null;
	},
	/**
	 * @description Сохраняет маркер из куки в localStorage если его там нет
	*/
	storeMarker:function() {
		var o = AppACME.AuthMarker;
		if (localStorage) {
			var key = o.STORAGE_MARKER_KEY, marker, v = $.cookie(o.COOKIE_NAME);
			if (!localStorage.getItem(key) && v) {
				localStorage.setItem(key, $.cookie(o.COOKIE_NAME));
			} else if (localStorage.getItem(key)) {
				marker = localStorage.getItem(key);
				$.cookie(o.COOKIE_NAME, marker, {expires:o.expires, path: '/'});
			}
		}
	},
	/**
	 * @description 
	 * Сохраняет маркер из куки в localStorage даже если он там есть
	*/
	forceStoreMarker:function() {
		if (localStorage) {
			var key = this.STORAGE_MARKER_KEY, v = $.cookie(this.COOKIE_NAME);
			if (v) {
				localStorage.setItem(key, $.cookie(this.COOKIE_NAME));
			}
		}
	},
	/**
	 * @description Восстанавливает маркер в куки из localStorage если его в куке нет
	*/
	restoreMarker : function() {
		if (localStorage) {
			var key = this.STORAGE_MARKER_KEY, marker, v = $.cookie(this.COOKIE_NAME);
			if (localStorage.getItem(key) && !v) {
				marker = localStorage.getItem(key);
				$.cookie(this.COOKIE_NAME, marker, {expires:this.expires, path: '/'});
			}
		}
	},
	dropMarker: function() {
		if (localStorage) {
			console.log('Call drop cookie');
			var key = this.STORAGE_MARKER_KEY;
			if (localStorage.getItem(key)) {
				localStorage.removeItem(key);
				$.removeCookie(this.COOKIE_NAME);
			}
		}
	},
	/**
	 * @description Возвращает маркер авторизации если он есть
	 * @return String
	*/
	getMarker: function() {
		var o = AppACME.AuthMarker, k = $.cookie(o.COOKIE_NAME);
		k = k ? k : localStorage.getItem(o.STORAGE_MARKER_KEY);
		return k;
	}
};
