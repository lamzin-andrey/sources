/**
 * !! Здесь только код, никак не взаимодействующий с DOM
*/

window.AppACME = window.AppACME || {};
window.AppACME.ShopCatNavigator = window.AppACME.ShopCatNavigator || {};
/**
 * @object Страница товаров компании. Здесь только код, никак не взаимодействующий с DOM
*/
/**
 * @description Поменять ссылки на сортировку товаров при ajax запросах
*/
AppACME.ShopCatNavigator.setSortLink = function() {
	var o = AppACME.ShopCatNavigator, lib = AppACMEWebLibrary,
		sortByNameLink = o.getSortByNameLink(), //это в коде, спрецифичном для DOM темы TODO получить текущую ссылку на товары из контрола сортировки товаров
		sortByPriceLink = o.getSortByPriceLink(), //это в коде, спрецифичном для DOM темы  TODO получить текущую ссылку на товары из контрола сортировки товаров
		url = lib.REQUEST_URI(),
		a = sortByNameLink.split('?')[1],
		b = sortByPriceLink.split('?')[1],
		id = lib._GET('id', 'null');
	if (a && b) {
		url = url.split('?')[0] + '?' + a;
		url = lib.setGetVar(url, 'id', id);
		o.setSortByNameLink(url);
		url = url.split('?')[0] + '?' + b;
		url = lib.setGetVar(url, 'id', id);
		o.setSortByPriceLink(url);
	}
}
/**
 * @description Добавить в ссылку параметры соритровки
 * @param {Srting} h содержимое (url) ссылки в левом меню
*/
AppACME.ShopCatNavigator.setSortLinkInAjaxUrl = function(h) {
	var lib = AppACMEWebLibrary, o = AppACME.ShopCatNavigator, a, h, t;
	a = h.split('?');
	h = a[1] ? ('?' + a[1]) : '';
	t = lib._GET('orderby', 0);
	t ? (h = lib.setGetVar(h, 'orderby', t)) : '';
	t = lib._GET('limit', 0);
	t ? (h = lib.setGetVar(h, 'limit', t)) : '';
	t = lib._GET('desc', 0);
	t ? (h = lib.setGetVar(h, 'desc', t)) : '';
	return h;
}
/**
 * @description Добавить в ссылку фоормирующуюся при fdnjjgjluheprt cnhfybw параметры соритровки
 * @param {Srting} h содержимое (url) ссылки в левом меню
*/
AppACME.ShopCatNavigator.setSortParamsOnAutoload = function(url) {
	var lib = AppACMEWebLibrary, o = AppACME.ShopCatNavigator, a, h, t;
	t = o.setSortLinkInAjaxUrl(url);
	
	h = lib._GET('page', 0, url);
	h ? (t = lib.setGetVar(t, 'page', h)) : '';
	
	a = url.split('?');
	return (a[0] + t);
}
/**
 * @description обертка вокруг _get кеширующая данные в оперативной памяти
*/
AppACME.ShopCatNavigator.getUrl=function(onLoadData, url, onFailLoadData) {
	var o = this;
	if (!o.isAppendRequest) {
		AppACMEWebLibrary.lock(o.HTML_PRODUCTS_CONTAINER_ID);
	}
	o.requestSended = true;
	o.lastRequest = url;

	if (o.categoriesProducts[url]) {
		setTimeout(function(){
			onLoadData(o.categoriesProducts[url]);
		}, 10);
		return;
	}
	o._get(onLoadData, url, onFailLoadData);
}
/**
 * @description Установить содержимое seo интро в нужное место страницы с содержимым категории компании
 * @param {String} s
*/
AppACME.ShopCatNavigator.renderSeoIntro=function(s) {
	var o = this.getSeoIntroHtmlEl();
	if (!o.block && !o.place) {
		return;
	}
	if (s.trim()) {
		o.place.removeClass('hide');
		o.block.html(s);
	} else {
		o.place.addClass('hide');
		o.block.html('');
	}
	
}
