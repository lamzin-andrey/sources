/** @class Страница истории заказов */
window.AppACME = window.AppACME || {};
/**
 * @object 
*/
var Orders = {
	/** @property {String} контейнер истории заказов*/
	HTML_ORDERS_CONTAINER_ID : '#orders',
	
	/** @property {String} контейнер мобильной истории заказов*/
	HTML_MOBILE_ORDERS_CONTAINER_ID : '#mOrders',
	
	/** @property {String} шаблон товара */
	HTML_PRODUCT_ITEM_ID     : '#orderShopItem',
	
	/** @property {String} контейнер с данными */
	HTML_ORDERS_DATA_ID      : '#ordersData',
	
	/** @property {String} контейнер с данными о валютах*/
	HTML_CURRENCIES_DATA_ID  : '#currenciesData',
	
	/** @property {String} контейнер с элементами пагинации */
	HTML_PAGINATION_CONTAINER_ID : '#shopPaging',
	
	/** @property {String} инпут с данными сколько показывать на странице заказов */
	HTML_PERPAGE_INPUT_ID    :     '#ordersPerPage',
	
	/** @property {String} css шаблона контейнера товаров*/
	HTML_PRODUCTS_CONTAINER_CSS :  '.order-shop-item',
	
	/** @property {String} css элемента содержащего data атрибут с идентификатором товара */
	HTML_ITEM_PRICE_A_CSS :  ' .item-price a',
	
	/** @property {String} css элемента содержащего data атрибут с идентификатором товара */
	HTML_ITEM_CART_NO_EXISTS_CSS : '.cart-noexists',
	
	/** @property {String} css элемента содержащего data атрибут с идентификатором товара */
	HTML_ITEM_CART_ADD_CSS : '.cart-add',

	/** @property {String} css  кнопки Повторить заказ */
	HTML_ORDER_REPEAT_CSS : '.btn-order-repeat',
	
	/** @property {String} css  блока с заказом */
	HTML_ORDER_CONTAINER_CSS : '.order-shop-item-container',
	
	/** @property {String} id окна с сообщением об изменении в заказе */
	HTML_ORDER_CHANGES_MESSAGE_MODAL_ID : '#orderIsChangeModal',
	
	/** @property {String} css кнопок закрывающих окно с сообщением */
	HTML_ORDER_CHANGES_MESSAGE_MODAL_BUTTONS_CSS : '.order-change',
	
	/** @property {String} css кнопки показывающей модальное окно */
	HTML_ORDER_SHOW_EXT_INFO_CSS : '.show-order-ext-info',
	
	/** @property {String} css блока с контентом дополнительного содержимого */
	HTML_ORDER_EXT_INFO_CONTENT_CSS : '.order-extend-info',
	
	/** @property {String} id модального окна с дополонительно информацией по товару*/
	HTML_ORDER_EXT_INFO_MODAL_ID : '#modalOrderInfo',

	/** @property {String} id блока модального окна в который надо вставить дополонительную информациею по товару*/
    HTML_ORDER_EXT_BLOCK_IN_MODAL: '#orderInfoContent',
    
    /** @property STORAGE_ORDERS_KEY ключ в локальном хранилище данных о заказах */
	STORAGE_ORDERS_KEY: 'SO_K',

	/** @property STORAGE_LAST_RELOAD ключ в локальном хранилище, хранит время последнего сброса данных */
	STORAGE_LAST_RELOAD : 'SO_LRK',
	
	/** @property {String} HTML_MESSAGE_CSS селектор сообщений связанных с имторией заказов */
	HTML_MESSAGE_CSS : '.orders-message',
	
	/** @property {String} HTML_ORDER_LIST_HEADING_ID id заголовка списка заказов для десктопа*/
	HTML_ORDER_LIST_HEADING_ID:'#historyDesktopHeading',
    
    /** @property {Number} autoloadProcess 1 когда происходит процесс автозагрузки при прокрутки страницы*/
    autoloadProcess : 0,
    
    /** @property {Number} currentPage */
    currentPage : 1,
    
    /** @property {String} HTML_BTN_INFO_CSS селектор кнопки "Подробнее" для десктопа*/
    HTML_BTN_INFO_CSS : '.j-btn-more',
    
    /** @property {String} HTML_BTN_INFO_MOB_CSS селектор кнопки "Подробнее" в мобильной версии */
	HTML_BTN_INFO_MOB_CSS : '.j-btn-more-mob',
	
	/**
	 *@param {Object} 
	*/
	init:function(lib) {
		console.log('Call orders.init');
		var s = 'company_new_hfu', Lib = AppACMEWebLibrary;
		if (!Lib.storage(s)) {
			window.localStorage.removeItem(this.getHistoryKey());
			Lib.storage(s, 1);
		}
		/** @property {Object}  сюда будет записана для каждой компании валюта самого позднего заказа */
		this.shopCurrency = {};
		this.lib = lib;
		this.setListeners();
		if (/*Lib.REQUEST_URI(1) == '/all_history' && */ AppACME.oRfi18) {
			console.log('Мы таки-запустим checkPaymentStatus');
			AppACME.oRfi18.checkPaymentStatus();
		}
	},
	setListeners:function() {
		var o = this, data = $(o.HTML_ORDERS_DATA_ID).val(), lib = o.lib,
			lastOrderId;
		try {
			data = JSON.parse(data);
			if (data && data.orders) {
				data = data.orders;
			}
			this.currencies = JSON.parse( $(o.HTML_CURRENCIES_DATA_ID).val() );
			this.data = data;
			if (data instanceof Array) {
				o.autoloadProcess = 1;
				AppACME.linkListener = o.onNeedMoreItems;
				lastOrderId = o.getLastOrderIdFromCache();
				if (lastOrderId) {
					lib._get(o.onLoadNewOrders, '/all_history_news_json?i=' + lastOrderId, o.onFailLoadNewOrders);
				} else {
					lib._get(o.onLoadFirstOrders, '/all_history_json', o.onFailLoadFirstOrders);
				}
			}
		}catch(e) {}
		$(o.HTML_ITEM_CART_NO_EXISTS_CSS).click(function(){ return false;});
	},
	/**
	 * @description Обработка клика на кнопке подробнее в десктоп-версии
	*/
	onClickInfoButtonDesk:function(evt) {
		var o = this, nId = parseInt(evt.target.attr('data-id'), 10);
		o.MODE_LOAD_ITEM_DATA = 'Desktop';
		o.REQUESTED_ONE_ITEM_ID = nId;
		o.loadItemData(nId);
	},
	/**
	 * @description Обработка клика на кнопке подробнее в мобильной версии
	*/
	onClickInfoButtonMobile:function(evt) {
		var o = this, nId = parseInt(evt.target.attr('data-id'), 10);
		o.MODE_LOAD_ITEM_DATA = 'Mobile';
		o.REQUESTED_ONE_ITEM_ID = nId;
		o.loadItemData(nId);
	},
	/**
	 * @description Загрузка данных об одном элементе истории товара
	 * @param {Number} nId идентификатор заказа
	*/
	loadItemData:function(nId) {
		var o = this;
		if (o.MODE_LOAD_ITEM_DATA != 'Mobile') {
			AppACMEWebLibrary.lock('#modalOrderInfo .modal-content');
		} else {
			//TODO если не может блокировать переданный jQ элемент, доработать
			AppACMEWebLibrary.lock('.j-details-container-' + nId);
		}
		AppACMEWebLibrary._get(function(data){o.onLoadItemData(data);}, '/historyitem?i=' + nId, function(a){o.onFailLoadItemData(a);});
	},
	/**
	 * @description Успешная загрузка данных об одном элементе истории товара
	 * @param {Object} data данные об одном заказе
	*/
	onLoadItemData:function(data) {
		var o = this;
		if (!o.onFailLoadItemData(data)) {
			return;
		}
		if (o.MODE_LOAD_ITEM_DATA == 'Mobile') {
			AppACME.OrdersModern.refreshOrderViewMobile(data.order);//TODO в темозвисимом класс
		} else {
			AppACME.OrdersModern.refreshOrderViewDesktop(data.order);//TODO в темозвисимом класс
		}
		o.resetOrderInfoInCache(data.order);//TODO
	},
	/**
	 * TODO
	 * @description Неуспешная загрузка данных об одном элементе истории товара
	 * 
	*/
	onFailLoadItemData:function(a) {
		
	},
	onLinkClick:function(evt) {
		/*console.log('L = '  +  AppACME.Orders.data.orders.length );
		
		if (AppACME.Orders.data.orders.length == 50 && !window.DDD) {
			console.log(AppACME.Orders.data);
			window.DDD = 1;
		}
		if (AppACME.Orders.data.orders.length == 100 && !window.DDDs) {
			console.log(AppACME.Orders.data);
			window.DDDs = 1;
		}
		console.log('currentPage = '  +  AppACME.Orders.currentPage );*/
		
		var o = AppACME.Orders, p = (evt ? AppACMEWebLibrary._GET('page', 0, $(evt.target).attr('href')) : o.currentPage - 1),
			data = array_chunk(o.data.orders, $(o.HTML_PERPAGE_INPUT_ID).val()),
			nextPage = array_chunk(o.data.orders, $(o.HTML_PERPAGE_INPUT_ID).val())[p], i, j,
			config = [
				{key: '[DATE]', val: o.renderDate},
				{key: new RegExp('\\[ID\\]', 'gmi'), val: 'id'},
				{key:new RegExp('\\[ORDER_SYS_ID\\]', 'gmi'), val: 'sys_order_id'},
				{key:'[ORDER_SHOP_ITEM]', val : o.renderItems},
				{key:new RegExp('\\[ORDER_BUYER_DATA\\]', 'gmi'), val : o.renderBuyer},
				{key:new RegExp('\\[totalPrice\\]', 'gmi'), val : o.totalPrice},
				{key:new RegExp('\\[totalPriceBalls\\]', 'gmi'), val : o.totalPriceBalls},
				{key:new RegExp('\\[STATUS\\]', 'gmi'), val : 'status'},
				{key:new RegExp('\\[review_rating\\]', 'gmi'), val : o.showReviewButton},
				{key:new RegExp('\\[COMPANY_NAME\\]', 'gmi'), val : o.renderCompanyName},
				{key:new RegExp('\\[IMAGE\\]', 'gmi'), val : o.renderCompanyLogo},
				{key:new RegExp('\\[HFU_URL\\]', 'gmi'), val : o.renderCompanyUrl},
				{key:new RegExp('\\[totalQuantity\\]', 'gmi'), val : o.totalQuantity}
			], currentData = [];
		//console.log( array_chunk(o.data.orders, $(o.HTML_PERPAGE_INPUT_ID).val()) );
		
		if (nextPage) {
			//for (j = 0; j <= p; j++) {
				//nextPage = data[j];
				for (i = 0; i < nextPage.length; i++) {
					currentData.push( nextPage[i] );
				}
			//}
		} else if(!evt) {
			if (o.data.orders.length < o.data.total_orders) {
				if (!o.requsetSended) {
					o.requsetSended = true;
					o.currentPageStored = o.currentPage;
					o.lib._get(o.onLoadOrders, '/historyjson?offset=' + o.data.orders.length, o.onFailLoadOrders);
				}
			} else {
				o.currentPage--;
			}
			return false;
		}
		data = currentData;
		AppACMEWebLibrary.render($(o.HTML_ORDERS_CONTAINER_ID), 'div', config, data, false, 'div.orders-history-item');
		config[4] = {key:'[ORDER_BUYER_DATA]', val : o.renderBuyerMobile};
		config[3] = {key:'[ORDER_SHOP_ITEM]', val : o.renderItemsMobile};
		window.dbgtp = 1;
		AppACMEWebLibrary.render($(o.HTML_MOBILE_ORDERS_CONTAINER_ID), 'div', config, data, false, 'div.mobile-hstory-item');
		$(o.HTML_ORDER_SHOW_EXT_INFO_CSS).click(o.onInfoClick);
		$(o.HTML_ORDER_REPEAT_CSS).click(o.onRepeatClick);
		$(AppACME.Reviews.HTML_REVIEW_BTN_ADD_CSS).click(AppACME.Reviews.onClickAddReviewButton);
		setAccordion();
		AppACME.Pagination.setData(o.onLinkClick, o.data.orders.length, $(o.HTML_PERPAGE_INPUT_ID).val());
		return false;
	},
	/**
	 * @description Отрисовка данных о товарах в мобильной версии приложения
	*/
	renderItemsMobile:function(item, $tpl) {
		var items = item.items, pContainer, productItemTpl, productItemCss, productItemTagName,
			productTpl, $o, o = AppACME.Orders, i, j, s, tContainer, currency, q = '';
		o.initShopCurrency(item);
		if (items.length) {
			$o = $tpl.find('.js-order-items-tpl' + '.tpl').first();
			productTpl = $o.html();
			for (i = 0; i < items.length; i++) {
				s = productTpl.replace('[TITLE]', items[i].title);
				s = s.replace('[QUANTITY]', items[i].quantity);
				s = s.replace('[ITEM_ID]', items[i].id);
				currency = item.shop.currency;
				if (o.shopCurrency[item.shop.sid]) {
					currency = o.shopCurrency[item.shop.sid].v;
				}
				currency = (AppACME.currenciesMap && AppACME.currenciesMap[currency]) ? AppACME.currenciesMap[currency] : currency;
				if (items[i].is_loyalty_product == 1) {
					currency = AppACME.Cart.getStrBalls( round(items[i].quantity * items[i].price) );
				}
				s = s.replace('[PRICE]', String( round(items[i].quantity * items[i].price, 2) ).replace('.', ',') + ' ' + currency );
				q += s;
			}
		}
		return q;
	},
	renderItems:function(item, $tpl) {
		var items = item.items, pContainer, productItemTpl, productItemCss, productItemTagName,
			productTpl, $o, o = AppACME.Orders, i, j, s, tContainer, currency = item.shop.currency;
		o.initShopCurrency(item);
		if (items.length) {
			$o = $tpl.find(o.HTML_PRODUCTS_CONTAINER_CSS + '.tpl').first();
			pContainer = $o.parent();
			productItemCss = $o.attr('class').replace('tpl', '');
			productItemTagName = $o[0].tagName.toLowerCase();
			productItemTpl = $(o.HTML_PRODUCT_ITEM_ID).html();
			
			pContainer.find(productItemTagName).each(function(i, j){
				j = $(j);
				if (!j.hasClass('tpl')) {
					j.remove();
				}
			});
			tContainer = $('<ul class="hide"></ul>');
			for (i = 0; i < items.length; i++) {
				j = items[i];
				s = productItemTpl.replace('[TITLE]', j.title);
				
				if (o.shopCurrency[item.shop.sid]) {
					currency = o.shopCurrency[item.shop.sid].v;
				}
				currency = o.currencies[currency] ? o.currencies[currency] : currency;
				if (j.is_loyalty_product == 1) {
					currency = AppACME.Cart.getStrBalls(j.price, round(j.price * j.quantity));
				}
				s = s.replace('[PRICE]', String(round(j.price * j.quantity, 2)).replace('.', ',') + ' ' + currency);
				s = s.replace('[QUANTITY]', j.quantity);
				s = s.replace(/\[ID\]/gm, j.id);
				
				if (j.photos && j.photos[0] && j.photos[0].thumbnail_url) {
					s = s.replace('data-src="src"', 'src="' + j.photos[0].thumbnail_url + '" onerror="onErrorLoadHistoryProductImage"');
				} else {
					s = s.replace('data-src="src"', 'src="/img/productListNoImage.png"'); //TODO config!
					o.initReloadImages();
				}
				var jObj = $('<' + productItemTagName + ' class="' + productItemCss + '" data-id="' + j.id + '">' + s + '</' + productItemTagName + '>');
				// jObj = AppACMEWebLibrary.processTemplateImg(jObj);
				tContainer.append(jObj);
			}
			s = tContainer.html();
			tContainer.remove();
			return s;
		}
	},
	/**
	 * @description Рендеринг данных о заказе
	*/
	renderBuyerMobile:function(item, $tpl) {
		var tpl = $tpl.find('.js-mobile-order-shop-buyer.tpl').first().html(), tContainer = $('<div></div>'), i, s, map = {};
		for (i = 0; i < item.fields.length; i++) {
			if (!map[item.fields[i].title] && $.trim(item.fields[i].description)) {
				s = tpl.replace('[TITLE]', item.fields[i].title);
				s = s.replace('[DESCRIPTION]', item.fields[i].description);
				tContainer.append($(s));
				map[item.fields[i].title] = 1;
			}
		}
		s = tContainer.html();
		return s;
	},
	renderBuyer:function(item, $tpl) {
		var tpl = $tpl.find('.order-shop-buyer.tpl').first().html(), tContainer = $('<div></div>'), i, s, map = {};
		for (i = 0; i < item.fields.length; i++) {
			if (!(item.fields instanceof Object)) {
				try {
					item.fields = JSON.parse(item.fields);
				} catch(e){;}
			}
			if (!map[item.fields[i].title] && $.trim(item.fields[i].description)) {
				s = tpl.replace('[TITLE]', item.fields[i].title);
				s = s.replace('[DESCRIPTION]', item.fields[i].description);
				tContainer.append($(s));
				map[item.fields[i].title] = 1;
			}
		}
		s = tContainer.html();
		return s;
	},
	/**
	 * @description Рендеринг кнопки Оставить отзыв
	*/
	showReviewButton:function(item, $tpl) {
		return ( (item.review && item.review.review_rating && $.trim(item.review.review_rating)) ? 'hide' : '');
	},
	/**
	 * @description Рендеринг имени компании (и ее логотипа?)
	*/
	renderDate:function(item, $tpl) {
		return AppACMEWebLibrary.formatDate(item.date);
	},
	/**
	 * @description Рендеринг имени компании (и ее логотипа?)
	*/
	renderCompanyName:function(item, $tpl) {
		return item.shop.company_name;
	},
	/**
	 * @description Рендеринг логотипа компании 
	*/
	renderCompanyLogo:function(item, $tpl) {
		var sDef = this.getDefault();
		var src = this.parseSrc(item);
		if (src == sDef) {
			AppACME.Orders.initReloadImages();
		}
		return '<img onerror="AppACME.Orders.onErrorLoadHistoryCompanyLogo" class="img-responsive project-image shop-image" width="100" alt="' + item.shop.company_name + '" src = "' + src + '">';
	},
	parseSrc:function(item) {
		var sDef = this.getDefault();
		(item.shop.logotype_url ? item.shop.logotype_url : (item.shop.logotype_thumbnail ? item.shop.logotype_thumbnail : sDef) )
	},
	getDefault:function(){
		return '/img/productListNoImage.png';
	}
	/**
	 * @description Рендеринг ссылку на компанию
	*/
	renderCompanyUrl:function(item, $tpl) {
		/*if (AppACME.hfuEnabled) {
			return '/company/' + AppACMEWebLibrary.transliteUrl(item.shop.company_name);
		}*/
		var sh = item.shop, cid = (sh.agregate_scope_ids && sh.agregate_scope_ids[0]) ? sh.agregate_scope_ids[0] : '0';
		return ('/b/' + sh.sid + '/' + cid + '/' + sh.id);
	},
	totalQuantity:function(item, $tpl) {
		var i, q = 0;
		for (i = 0; i < item.items.length; i++) {
			q += item.items[i].quantity;
		}
		return q;
	},
	totalPrice:function(item, $tpl) {
		var o = AppACME.Orders, i, q = 0, cur = item.shop.currency, curData = o.currencies, defCur = item.shop.currency, map;
		
		o.initShopCurrency(item);
		if (o.shopCurrency[item.shop.sid]) {
			cur = o.shopCurrency[item.shop.sid].v;
		}
		for (i = 0; i < item.items.length; i++) {
			if (!cur && curData[item.items[i].currency]) {
				cur = curData[item.items[i].currency];
			}
			if (!defCur) {
				defCur = item.items[i].currency;
			}
			if (item.items[i].is_loyalty_product == 0) {
				q += item.items[i].price * item.items[i].quantity;
			}
		}
		
		if (item.fields && (item.fields instanceof Array)) {
			for (i = 0; i < item.fields.length; i++) {
				if (item.fields[i] && +item.fields[i].price) {
					q = +q + +item.fields[i].price;
				}
			}
		}
		map = AppACMEWebLibrary.getCurrenciesArray();
		cur = cur && map && map[cur] ? map[cur] : cur;
		return q + ' ' + cur;
	},
	totalPriceBalls:function(item, $tpl) {
		var i, q = 0;
		for (i = 0; i < item.items.length; i++) {
			if (item.items[i].is_loyalty_product == 1) {
				q += item.items[i].price * item.items[i].quantity;
			}
		}
		// return q + ' ' + AppACME.Cart.getStrBalls(round(q));
		return q;
	},
	/**
	 * @description Запрашивает актуальную информацию о товаре
	*/
	getProductsInfo:function(evt){
		var o = AppACME.Orders, ids = [], uq = {},
			btn = $(evt.target), ls = btn.parents(o.HTML_ORDER_CONTAINER_CSS).first().find(o.HTML_PRODUCTS_CONTAINER_CSS);
		ls.each(function(i, j){
			j = $(j);
			i = j.data('id');
			if (!uq[i]) {
				uq[i] = 1;
				ids.push(i);
			}
			
		});
		o.lib._post({ids:ids, oi:btn.data('id')}, o.onProductsInfo, '/history/info', o.onFailLoadProductsInfo);
	},
	/**
	 * @description Обрабатывает ошибку запроса актуальной информации о товаре
	*/
	onFailLoadProductsInfo:function() {
		AppACME.Orders.lib.defaultFail();
	},
	/**
	 * @description Обрабатывает актуальную информацию о товаре. Если все товары есть в наличии и стоимость их не изменилась, значит все ок, вызываем добавление в корзину	*/
	onProductsInfo:function(data) {
		var o = AppACME.Orders, orderId = data.id, isChanges = 0, id,
			oldPriceSum, oldQ, availableProducts = [], price,
			sid, showAlertLocationRequire = data.showAlertLocationRequire,
			order, item;
		if (data.error && data.info == 'emptyList') {
			isChanges = 1;
		}
		sid = data.sid;
		data = AppACMEWebLibrary.indexBy(data.list);
		
		$('#modalOrderN' + orderId).first().find(o.HTML_PRODUCTS_CONTAINER_CSS).each(function(i, j){
			j = $(j);
			if (j.hasClass('tpl')) {
				return;
			}
			id = j.data('id');
			//есть ли он в ответе?
			if (!data[id]) {
				console.log('it here 1');
				isChanges = 1;
			} else {
				//не добавляем товары за баллы при повторном заказе в принципе
				if (data[id].is_loyalty_product == 1) {
					return;
				}
				//доступен ли для заказа?
				if (data[id].allow_order != 1) {
					console.log('it here 2');
					isChanges = 1;
				} else {
					//не изменилась ли стоимость?
					order = o.getOrderById(orderId);
					if (order) {
						item = o.getItemFromOrderById(order, id);
					}
					oldPriceSum = item && item.price ? item.price : 0;
					oldQ = item && item.quantity ? item.quantity : 0;
					console.log(o.data);
					price = data[id].discount_price ? data[id].discount_price : data[id].price;
					if (price * oldQ != oldPriceSum * oldQ) {
						isChanges = 1;
					}
					//есть в ответе, доступен для заказа, надо добавить в корзину
					console.log('oldQ = ' + oldQ);
					console.log('oldPriceSum = ' + oldPriceSum);
					console.log('id = ' + id);
					availableProducts.push({id:id, q:oldQ});
					
				}
			}
		});
		$('#showAlertLocationRequire').val(showAlertLocationRequire);
		o.availableProducts = availableProducts;
		console.log(availableProducts);
		window.global_sid = sid;
		if (isChanges) {
			$(o.HTML_ORDER_CHANGES_MESSAGE_MODAL_ID).modal('show');
		} else {
			o.addToCart();
		}
	},
	/**
	 * @description Проверяет, не надо ли добавить еще французских булок
	 * @param {Array} of {id,q(uantity)} availableProducts 
	*/
	addToCart:function() {
		var i, o = AppACME.Orders, a = o.availableProducts, 
			s = $('#showAlertLocationRequire').val();
		for (i = 0; i < a.length; i++) {
			o.lib.addToCart(a[i].id, a[i].q);
			if (s == '1') {
				break;
			}
		}
		if (s == '0') {
			setTimeout(function(){
				window.location.href = $(o.lib.HTML_CART_LINK_ID).attr('href');
			}, 500);
		}
	},
	/**
	 * @description Проверяет, не надо ли добавить еще французских булок
	*/
	onNeedMoreItems:function() {
		var o = AppACME.Orders;
		if (!o.data) {
			return;
		}
		setTimeout(function(){
			o.autoloadProcess = 0;
			try {
				o.onLinkClick();
			}catch(e){;};
		}, 500);
		
	},
	/*checkAutoloadItems:function() {
		var b = document.body, w = $(b), o = AppACME.Orders;
		if(window.scrollY >= document.body.clientHeight - AppACMEWebLibrary.getViewport().h - 100) {
			if (!o.autoloadProc) {
				o.autoloadProc = 1;
				setTimeout(function(){
					
					o.currentPage = o.currentPage ? o.currentPage + 1 : +AppACMEWebLibrary._GET('page', 1);
					o.onLinkClick();
					o.autoloadProc = 0;
				}, 500);
			}
		}
	},*/
	/**
	 * @description Клик на кнопке Повторить заказ
	*/
	onRepeatClick:function(evt) {
		AppACME.Orders.getProductsInfo(evt);
	},
	/**
	 * @description Клик на кнопке Подробнее
	*/
	onInfoClick:function(evt) {
		onClickInfoButtonDesk(evt);
		var o = AppACME.Orders, html = $(evt.target).parents(o.HTML_ORDER_CONTAINER_CSS).first()
			.find(o.HTML_ORDER_EXT_INFO_CONTENT_CSS ).first().html();
		$(o.HTML_ORDER_EXT_BLOCK_IN_MODAL).html(html);
		$(o.HTML_ORDER_EXT_INFO_MODAL_ID).modal('show');
		return false;
	},
	/**
	 * @description Обработка успешной подгрузки истории заказов
	*/
	onLoadOrders:function(data) {
		var i, o = AppACME.Orders;
		if (data.orders && data.orders.length) {
			for (i = 0; i < data.orders.length; i++) {
				o.data.orders.push( data.orders[i] );
			}
		}
		//o.currentPage;
		o.currentPage  = o.currentPageStored;
		o.onLinkClick();
		setTimeout(function(){
			o.requsetSended = false;
		}, 2000);
	},
	/**
	 * @description Обработка неуспешной подгрузки истории заказов
	*/
	onFailLoadOrders:function() {
		AppACME.Orders.requsetSended = false;
	},
	/**
	 * @description Возвращает id самого первого заказа из кеша приложения
	 * @return {Number} id самого первого заказа из кеша приложения
	*/
	getLastOrderIdFromCache:function() {
		var o = AppACME.Orders, lib = AppACMEWebLibrary,
			data = lib.storage(o.getHistoryKey());
		if (data && isset(data, 'orders', 'length') && data.orders.length > 0) {
			return data.orders[0].sys_order_id;//TODO check it!
		}
		return 0;
	},
	/**
	 * @description Обработка данных о заказах полученных из ajax запроса
	*/
	onLoadFirstOrders:function(data) {
		var o = AppACME.Orders, lib = AppACMEWebLibrary;
		if (isset(data, 'orders', 'length') && data.orders.length > 0) {
			lib.storage(o.getHistoryKey(), data);
			//выводим первую страницу
			o.renderFirstPage(data);
		} else {
			$(o.HTML_MESSAGE_CSS).text( __('messages.Your_order_history_is_empty') );
		}
	},
	/**
	 * @description Устанавливает слушатели событий интерактивных элементов списка заказа
	*/
	setOrdersListeners:function(){
		var o = AppACME.Orders;
		$(o.HTML_ORDER_REPEAT_CSS).click(o.onRepeatClick);
		$(o.HTML_ORDER_SHOW_EXT_INFO_CSS).click(o.onInfoClick);
		$(o.HTML_ORDER_CHANGES_MESSAGE_MODAL_BUTTONS_CSS).click(o.addToCart);
		o.autoloadProcess = 0;
	},
	/**
	 * @description Отрисовывает первую страницу заказов
	*/
	renderFirstPage:function(data) {
		var o = AppACME.Orders, reviewOrderId = localStorage.getItem('reviewOrderId');
		try {$(o.HTML_ORDERS_DATA_ID).val( JSON.stringify(data) )} catch(e){;};
		o.data = data;
		if (data.orders && data.orders.length) {
			$(o.HTML_ORDER_LIST_HEADING_ID).removeClass('hide');
			$(o.HTML_MESSAGE_CSS).addClass('hide');
			o.onLinkClick();
			//устанавливаем все обработчики, которые раньше ставились по загрузке
			o.setOrdersListeners();
		} else {
			$(o.HTML_MESSAGE_CSS).text( __('messages.Your_order_history_is_empty') );
		}
		if (AppACMEWebLibrary.REQUEST_URI(1) == '/all_history' && reviewOrderId) {
			if ($('button[data-id=' + reviewOrderId + ']')[0]) {
				AppACME.Reviews.onClickAddReviewButton({target:$('button[data-id=' + reviewOrderId + ']')[0]});
				localStorage.removeItem('reviewOrderId')
			}
		}
	},
	/**
	 * @description Обработка данных о заказах полученных из ajax запроса
	*/
	onLoadNewOrders:function(data) {
		var o = AppACME.Orders, lib = AppACMEWebLibrary, old, i, j;
		if (isset(data, 'orders', 'length')) {
			var old = lib.storage(o.getHistoryKey());
			if (old && old.orders && data.orders) {
				
				for (i = 0; i < data.orders.length; i++) {
					data.orders[i].items = array_values(data.orders[i].items);
				}
				for (i = 0; i < old.orders.length; i++) {
					data.orders.push(old.orders[i]);
				}
				old.orders = data.orders;
				lib.storage(o.getHistoryKey(), old);
				//выводим первую страницу
				o.renderFirstPage(old);
			} else {
				//clear storage call setListeners
				localStorage.clear(o.getHistoryKey());
				o.setListeners();
			}
		} else {
			$(o.HTML_MESSAGE_CSS).text( __('messages.Your_order_history_is_empty') );
		}
	},
	/**
	 * @description Обработка ошибки снти при попытке запросить историю заказов
	*/
	onFailLoadNewOrders:function(a,b,c,d){
		$(o.HTML_MESSAGE_CSS).text( __('messages.Default_fail') );
	},
	/**
	 * @description Обработка ошибки снти при попытке запросить историю заказов
	*/
	onFailLoadFirstOrders:function(a,b,c,d){
		$(o.HTML_MESSAGE_CSS).text( __('messages.Default_fail') );
	},
	/**
	 * @return String id ключа localStorage с которым храняться данные исотрии заказов пользователя. Это префикс o.STORAGE_ORDERS_KEY + кука авторизации
	*/
	getHistoryKey:function() {
		return (AppACME.Orders.STORAGE_ORDERS_KEY + '-' + AppACME.AuthMarker.getMarker());
	},
	/**
	 * @description проходит по массиву закаов и сохраняет в AppACME.Orders.shopCurrency валюту самого позднего заказа.
	*/
	initShopCurrency:function(item) {
		var o = AppACME.Orders, i, j,
		/** @var safeTs сохраненный для компании заказа timestamp валюты заказа */
		safeTs,
		/** @var {ts, v} safeDate сохраненные для компании заказа данные о валюте заказа */
		safeData;
		j = item;
		if (j.shop && j.shop.sid) {
			console.log('Found sid ' + j.shop.sid);
			safeData = o.shopCurrency[j.shop.sid] ? o.shopCurrency[j.shop.sid] : 0;
			if (!safeData) {
				console.log('Write first data, cur = '  + j.shop.currency + ', ts = ' + strtotime(j.created_at));
				safeData = {};
				safeData.ts = strtotime(j.created_at);
				safeData.v  = j.shop.currency;
				o.shopCurrency[j.shop.sid] = safeData;
			}
			safeTs = safeData.ts;
			if (j.created_at && strtotime(j.created_at) > safeTs) {
				o.shopCurrency[j.shop.sid].v  = j.shop.currency;
				o.shopCurrency[j.shop.sid].ts  = strtotime(j.created_at);
			}
		}
		
	},
	/**
	 * @param {Number} orderId Идентификатор заказа системный
	 * @param {Number} id      Идентификатор товара
	 * @return Number
	 */
	getOldQuantity:function(orderId, id){
		var o = AppACME.Orders, order = o.getOrderById(orderId),
			item, q;
		if (order){
			item = o.getItemFromOrderById(order, id);
		}
		if (item && item.quantity) {
			q = +item.quantity;
			q = q ? q : 0;
			return q;
		}
		return -1;
	},
	/**
	 * @param {Number} orderId Идентификатор заказа системный
	 * @return mixed Object or Null
	 */
	getOrderById:function(orderId){
		var o = AppACME.Orders, d = o.data, i;
		d = d.orders ? d.orders : [];
		for (i = 0; i < d.length; i++) {
			if (d[i].sys_order_id == orderId) {
				return d[i];
			}
		}
		return null;
	},
	/**
	 * @param {Number} id Идентификатор товара
	 * @param {Object} Данные о заказе
	 * @return mixed Object or Null
	*/
	getItemFromOrderById:function(order, id){
		var o = order, d = o.items, i;
		for (i = 0; i < d.length; i++) {
			if (d[i].id == id) {
				return d[i];
			}
		}
		return null;
	},
	/**
	 * @description Если ещё не инициализован запрос изображений компаний и товаров, хранящихся в локальном хранилище, инициализировать перезапрос
	*/
	initReloadImages:function() {
		console.log('onErrorLoadHistoryCompanyLogo call initReloadImages');
		var o = AppACME.Orders, Lib = AppACMEWebLibrary;
		//если со времени проследнего сброса данных прошло более часа
		if (time() - intval(Lib.storage(o.STORAGE_LAST_RELOAD)) > 3600) {
			console.log('onErrorLoadHistoryCompanyLogo Ye, it More');
			//Сохраним время последнего заказа
			Lib.storage(o.STORAGE_LAST_RELOAD, time() );
			//Удалим данные о заказах
			localStorage.removeItem(o.getHistoryKey());
			//Запросим их заново
			console.log('onErrorLoadHistoryCompanyLogo call reload...');
			location.reload(true);
		} else {
			console.log('time = ' + time() + ', ival = ' + intval(Lib.storage(o.STORAGE_LAST_RELOAD)));
		}
	},
	/**
	 * @description Вызывается при ошибке загрузок изображений компаний или товаров
	*/
	onErrorLoadHistoryCompanyLogo:function() {
		console.log('onErrorLoadHistoryCompanyLogo call onErrorLoadHistoryCompanyLogo');
		var o = AppACME.Orders;
		if (!o.reloadStorageIsRun) {
			o.reloadStorageIsRun = true;
			console.log('onErrorLoadHistoryCompanyLogo bef call initReloadImages');
			o.initReloadImages();
		}
	},
	/**
	 * @description Вызывается при ошибке загрузок изображений компаний или товаров
	*/
	onErrorLoadHistoryProductImage:function() {
		AppACME.Orders.onErrorLoadHistoryCompanyLogo();
	}
};
window.AppACME.Orders = Orders;
