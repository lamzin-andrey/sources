'use strict'
//Здесь только функции корзины, независящие от DOM. Постепенно сюда перенесу все такие из cart.js
//Из DOM допускается получение значений скрытых инпутов с данными
window.AppACME = window.AppACME || {};

AppACME.CoreCart = {
	/** @property массив функций, вызываемых раз в минуту*/
	minuteListeners : [],
	
	/** @property массив функций, вызываемых раз в 10 минут */
	minutes10Listeners : [],
	
	/** @property массив функций, вызываемых раз в 5 секунд */
	sec5Listeners : {},
	
	/** @property {Object} Объект для хранения знаяений вводимых в оле ввода только для цифр */
	_prevNumValues : {},
    
	/**
	 * @description Устанавливает на инпуты телефона в форме заказов маску ввода. Устанавливает на инпуты ввода цифр в форме заказов маску ввода
	*/
	setPhoneInputMask() {
		var F = AppACME, arr = F.Cart.getPhonesInputs(), i, a, ms = '+7', curr = $('#currency').val(),
			format = " (000) 000-00-00";
		switch (curr) {
			case 'BYR':
				ms = '+375';
				format = " (00) 00-00-00";
				break;
			case 'BYN':
				ms = '+375';
				format = " (00) 000-00-00";
				break;
		}
		for (i = 0; i < arr.length; i++) {
			arr[i]
			
			a = {
				onKeyPress:function(b,c,d){
					if(b.indexOf(ms + " (89")!=-1||b.indexOf(s + " (79")!=-1) { 
						$(d).val(ms + " (9")
					}
				}
			};
			$(arr[i])
			.focus(function(){
				if(this.value.length==0){
					this.value = ms + " (";
					if(this.setSelectionRange)	{
						this.setSelectionRange(this.value.length,this.value.length)
					}
				}
			})
			.blur(function(){
				if(this.value== (ms + " (") ){
					this.value=""
				}
			})
			.mask(ms + format, a)
		}
		F.CoreCart.setNumberInputMask();
	},
	/**
	 * @description Определяет, надо ли показывать сообщение о минимальной сумме заказа 
	 *  Вызывается в Cart.setOrderButton в том случае, если форма оформления заказа не содержит варианта оплаты картами, так как при его использовании это сообщение выводится в результате валидации черновика
	*/
	setMinimalOrderMessage(){
		var cart = AppACME.Cart, s, total, n, rawTotal;
		if ($('#minOrderSum')[0]) {
			n = +$('#minOrderSum').val();
			rawTotal = AppACMEWebLibrary.storage('price_' + cart.getShopId());
			total = +rawTotal;
			if (rawTotal !== null && n > 0 && n > total) {
				s = __('orderSumVeriSmall').replace('{MINORDER}' , +$('#minOrderSum').val());
				AppACME.Messages.fail(s);
			}
		}
	},
	/**
	 * @description Определяет, надо ли показывать сообщение о том что магазин сейчас не работает
	 *  Вызывается в Cart.setOrderButton в том случае, если форма оформления 
	 *  заказа не содержит варианта оплаты картами, 
	 * так как при его использовании это сообщение выводится в результате валидации черновика
	*/
	setShopIsNotWorkNowMessage(){
		var cart = AppACME.Cart, s, k = 'ShopIsNotWorkNowMessageTS', n, 
			Lib = AppACMEWebLibrary;
		console.log('safe ts = ' + Lib.storage(k));
		console.log('time() = ' + time());
		if (time() - Lib.storage(k) <= 600) {
			return;
		}
		if ($('#shopIsWorkNowMsg')[0] && $('#shopIsWorkNow')[0]) {
			n = +$('#shopIsWorkNow').val();
			if (n == 0) {
				s = $('#shopIsWorkNowMsg').val();
				if (s.trim().length && s != '1') {
					console.log('Ye, it here');
					console.log('s = "' + s + '"' );
					AppACME.Messages.fail(s);
				}
				console.log('Set  safe  ts = ' + time() );
				Lib.storage(k, time());
			}
		}
	},
	/**
	 * @description Вывод информации об ошибке в форме оформления заказа
	 * @param {String} error
	 * @param {Object||Array} messages
	*/
	showError(error, messages){
		var s = error, aMessages = [], i, o = AppACME.Cart,
			sCurr = $(o.HTML_SHOP_CURRENCY_INP_ID).val(), sCurrSign;
		if (o.hideFailMessage) {
			return;
		}
		if (messages instanceof Array) {
			for (i = 0; i < messages.length; i++) {
				if (typeof(messages[i]) == 'string') {
					aMessages.push(messages[i]);
				}
			}
		} else if (messages instanceof Object) {
			for (i in messages) {
				if (typeof(messages[i]) == 'string') {
					aMessages.push(messages[i]);
				}
			}
		}
		if (aMessages.length) {
			s += '\n' + aMessages.join("\n");
		}
		if (trim(sCurr)) {
			sCurrSign = o.Lib.getCurrenciesArray()[sCurr] ? o.Lib.getCurrenciesArray()[sCurr] : sCurr;
			s = str_replace(sCurr, sCurrSign, s);
		}
		AppACME.Messages.fail(s);
		if (s.length && s != $('#shopIsWorkNowMsg').val()) {
			AppACME.CoreCart.setShopIsNotWorkNowMessage();
		}
	},
	/**
	 * @description показывает сообщение о необходимости ввести данные о местоположении пользователя при попытке заказа
	 * 	Используется при добавлении товара в корзину @see AppACME.Cart.addToCart
	 * @return {Boolean} true если алерт был показан
	*/
	showAlertRequireLocation() {
		if ($('#showAlertLocationRequire').val() == 1) {
			AppACME.Messages.success(__('You_need_set_location'));
			return true;
		}
		return false;
	},
	/**
	 *@return true если находимся на странице корзины или списка корзин или мобильной форме заказа
	*/
	isCartPage:function(){
		var s = window.location.href;
		if (~s.indexOf('/cart') || ~s.indexOf('/cartlist') || ~s.indexOf('/orderform')) {
			return true;
		}
		return false;
	},
	/**
	 * @description Показать необходимые сообщения 
	*/
	setInitialMessages() {
		var o = AppACME.Cart, cc = AppACME.CoreCart;
		
		
        if (cc.isCartPage()) {
            cc.setMinimalOrderMessage();//CoreCart defined in /js/s/ccart.js постепенно туда переедет весь код независящий от DOM
            cc.setShopIsNotWorkNowMessage();//CoreCart defined in /js/s/ccart.js постепенно туда переедет весь код независящий от DOM
        }
	},
	/**
	 * @description Показывает сообщение о времени работы раз в период (например в 10 минут) даже если пользователь заснул за монитором
	*/
	runUnworkMessageTimer() {
		var o = AppACME.CoreCart;
		setInterval(o.onTick, 600*1000);
		o.onTick();
	},
	/**
	 * @description Запрашивает с сервера время работы компании (оно может измениться)
	*/
	onTick() {
		var o = AppACME.CoreCart, sid = $('#shopId').val();
		if (!sid) {
			return;
		}
		if (!o.tickRequestSended) {
			o.tickRequestSended = 1;
			AppACMEWebLibrary._get(o.onTickData, '/getWorktime?sid=' + sid, o.onTickReqFail);
		}
	},
	/**
	 * @description Обработка полученного с сервера времени работы компании (оно может измениться)
	*/
	onTickData(d) {
		$('#shopIsWorkNow').val(d.v);
		$('#shopIsWorkNowMsg').val(d.m);
		var o = AppACME.CoreCart;
		o.tickRequestSended = 0;
		o.setShopIsNotWorkNowMessage();
	},
	/**
	 * @description Обработка ошибки получения с сервера времени работы компании
	*/
	onTickReqFail() {
		AppACME.CoreCart.tickRequestSended = 0;
	},
	/**
	 * @description Вызывается в начала работы AppACME.Cart.init
	*/
	onInitStart() {
		var Lib = AppACMEWebLibrary, s;
		if (Lib._GET('needreload') == 1) {
			window.locationChanged = 1;
			s = Lib.setGetVar(location.href, 'needreload', 'CMD_UNSET');
			location.href = s;
		}
		AppACME.CoreCart.setOrderFormField();
	},
	/**
	 * @description Вызывается в конце работы AppACME.Cart.init
	*/
	onInitEnd() {
		AppACME.OrderFormStorage.onRestoreListeners.push(AppACME.CoreCart.onRestoreOrderFormData);
		let cc = AppACME.CoreCart;
		cc.runMinutesTimer();
		cc.minutes10Listeners.push(cc.requestCartItems);
	},
	/**
	 * @description Вызывается после того, как в форме заказа восстановленны данные из кеша
	*/
	onRestoreOrderFormData() {
		var f = AppACME, o = f.Cart, cc = f.CoreCart, locForm = f.geo.maingeoform,
			sLocationFormCityName = locForm.getCity(),
			sLocationFormStreet = locForm.getStreet(),
			sLocationFormHome = locForm.getNumber(),
			
			iOrderFormCity = o.iOrderFormCity,
			iOrderFormHome = o.iOrderFormHome,
			iOrderFormStreet = o.iOrderFormStreet,
			iOrderFormAddress = o.iOrderFormAddress,
			a = []
			;
		// Город пока не копируем
		/*if (sLocationFormCityName && iOrderFormCity) {
			iOrderFormCity.val(sLocationFormCityName);
		}/**/
		if (sLocationFormStreet && iOrderFormStreet) {
			iOrderFormStreet.val(sLocationFormStreet);
		}
		if (sLocationFormHome && iOrderFormHome) {
			iOrderFormHome.val(sLocationFormHome);
		}
		if (iOrderFormAddress && sLocationFormCityName && sLocationFormHome && !iOrderFormHome && sLocationFormStreet && !iOrderFormStreet) {
			a.push(sLocationFormCityName);
			a.push(sLocationFormStreet);
			a.push(sLocationFormHome);
			a = AppACMEWebLibrary.removeEmptyItems(a);
			iOrderFormAddress.val(a.join(', '));
		}
	},
	/**
	 * @description Инициализует $Objects c полями ввода формы оформления заказа
	*/
	setOrderFormField(){
		var o = AppACME.Cart, 
			a = $('#ofi7'),
			b = $('#ofi8'),
			c = $('#ofi9'),
			d = $('#ofi1');
		o.iOrderFormCity = a[0] ? a : null;
		o.iOrderFormStreet = b[0] ? b : null;
		o.iOrderFormHome = c[0] ? c : null;
		o.iOrderFormAddress = d[0] ? d : null;
	},
	/**
	 * @description Запрос находящихся в корзине товаров и отправки их id на сервер для проверки, не удален ли товар
	*/
	requestCartItems(){
		let f = AppACME, cc = f.CoreCart, o = f.Cart, s = '', cart, ballsCart, Lib = o.Lib, q = s;
		cart = cc.getStoredCartObject();
		ballsCart = cc.getStoredCartBallsObject();
		cart = cart ? cart : {};
		ballsCart = ballsCart ? ballsCart : {};
		cart = array_keys(cart);
		ballsCart = array_keys(ballsCart);
		if (cart.length) {
			s = cart.join(',');
		}
		if (ballsCart.length) {
			q = ballsCart.join(',');
		}
		cart = s.split(',');
		cart = array_unique(cart);
		ballsCart = q.split(',');
		ballsCart = array_unique(ballsCart);
		if (cart.length || ballsCart.length) {
			s = cart.join(',');
			q = ballsCart.join(',');
			Lib._get(cc.onRequestCartItemSuccess, '/checkitemsjson?m=' + s + '&b=' + q, ()=>{});
		}
	},
	/**
	 * @description Сервер возвражает два массива id, первый - для обычных товаров, второй для товаров за баллы
	 * @return {Boolean} true если что-то изменилось в составе корзин
	*/
	onRequestCartItemSuccess(data) {
		if (data[2] != 'done') {
			return;
		}
		let f = AppACME, cc = f.CoreCart, cartItems = array_fill_keys(data[0], 1), ballsItems = array_fill_keys(data[1], 1),
			balls = cc.getStoredCartBallsObject(), cart = cc.getStoredCartObject(), i, newCart = {}, newBalls = {}, o = f.Cart;
		for (i in cart) {
			if (i in cartItems) {
				newCart[i] = cart[i];
			}
		}
		for (i in balls) {
			if (i in ballsItems) {
				newBalls[i] = balls[i];
			}
		}
		cc.saveCart(newCart);
		cc.saveBallsCart(newBalls);
		o.renderCountCart();
		if (!data[3]) {
			cc.setQuantityEachProductInCart();
		}
		if (JSON.stringify(cart) != JSON.stringify(newCart) || JSON.stringify(balls) != JSON.stringify(newBalls)) {
			return true;
		}
		return false;
	},
	/*(
	 * @description Возвращает объект с данными о товарах отложенных в корзину, ключи - id продуктов
	*/
	getStoredCartObject() {
		let o = AppACME.Cart, cart = o.Lib.storage(o.getShopId());
		cart = cart ? cart : {};
		return cart;
	},
	
	/**
	 * @description Возвращает объект с данными о товарах за баллы отложенных в корзину, ключи - id продуктов
	*/
	getStoredCartBallsObject() {
		let o = AppACME.Cart, s = o.getShopId().replace('cart-', ''), cart = o.Lib.storage(o.STORAGE_BALL_CART_PREFIX + s);
		cart = cart ? cart : {};
		return cart;
	},
	/**
	 * @description Сохраняет объект с данными о товарах за баллы отложенных в корзину
	*/
	saveCart(сart) {
		let o = AppACME.Cart;
		o.Lib.storage(o.getShopId(), сart);
	},
	/**
	 * @description Сохраняет объект с данными о товарах за баллы отложенных в корзину
	*/
	saveBallsCart(сart) {
		let o = AppACME.Cart, s = o.STORAGE_BALL_CART_PREFIX + String(o.getShopId()).replace('cart-', '');
		o.Lib.storage(s, сart);
	},
	/**
	 * @description Запуск таймеров, минутный, 10-минутный, 5-секундный
	*/
	runMinutesTimer(){
		let cc = AppACME.CoreCart, i, f;
		cc._minInterval = setInterval(()=>{
			for (i in cc.minuteListeners) {
				f = cc.minuteListeners[i];
				if (f instanceof Function) {
					f();
				}
			}
		}, 60*1000);

		cc._sec5Interval = setInterval(()=>{
			for (i in cc.sec5Listeners) {
				f = cc.sec5Listeners[i];
				if (f instanceof Function) {
					f();
				}
			}
		}, 5 * 1000);
		
		cc._min10Interval = setInterval(()=>{
			for (i in cc.minutes10Listeners) {
				f = cc.minutes10Listeners[i];
				if (f instanceof Function) {
					f();
				}
			}
		}, 600*1000);
	},
	/** 
	 * @description Установить для каждого товара в корзине его количество
	*/
	setQuantityEachProductInCart(dbg) {
		var o = AppACME.Cart, Lib = o.Lib, list = $(o.HTML_CART_ITEM_QUANTITY_CSS), vPrices =  $(o.HTML_CART_ITEM_PRICE_CSS), 
			cart, total = 0, n, currency, priceStorageKey = 'price_' + o.getShopId(), price, storageKey,
			cid, totalBalls = 0, sBalls, k, cc = AppACME.CoreCart, ru = Lib.REQUEST_URI(1),
			aNoRemovedItemsId = [];
		$(o.HTML_CART_TOTAL_WRAPPER).addClass('hide');
		$(o.HTML_CART_TOTAL_BALL_WRAPPER_ID).addClass('hide');
		if (list[0]) {
			
			storageKey = o.getShopId();
			cart = Lib.storage(storageKey);
			currency = $(o.HTML_SHOP_CURRENCY_INP_ID).val();
			var dump = o.Lib.getCurrenciesArray();
			currency = isset(o.Lib.getCurrenciesArray(), currency) ? o.Lib.getCurrenciesArray()[currency] : currency;
			if (cart instanceof Object) {
				
				list.each(function (i, j) {
					if (cart[$(j).data('id')]) {
						$(j).text(cart[$(j).data('id')]);
					}
				});
				if (vPrices[0]) {
				
					vPrices.each(function (i, j) {
						cid = $(j).data('id');
						//console.log(cid);
						aNoRemovedItemsId.push(cid);
						if (cart[cid]) {
							//console.log(cart[cid]);
							n = cart[$(j).data('id')] * $(j).data('oneitemprice');
							total += n;
							$(j).text(round(n, 2));
							
							if (o.isBallsProduct(cid)) {
								o.setCurrencyBallInCart($(j).parent().find('span')[1], j);
								total -= n;
								totalBalls += n;
								$(o.HTML_CART_TOTAL_ROW_ID).before($(j).parents('article').first());
							}
						} else {
							$(j).parents('article').remove();
						}
					});
					
					
					$('select[data-fieldtype=priceDropDown]').each(function(i, j){
						i =  Lib.getOptionByText(j, j.value);
						if (i && parseFloat($(i).data('price'))) {
							total += $(i).data('price');
						}
					});
					
					
					if (+total > 0) {
						$(o.HTML_CART_TOTAL_WRAPPER).removeClass('hide');
					}
					if (+totalBalls > 0) {
						$(o.HTML_CART_TOTAL_BALL_WRAPPER_ID).removeClass('hide');
					}
					if (+total == 0 && +totalBalls > 0) {
						$(o.HTML_CART_TOTAL_BALLS_LABEL_EXT).html(__('messages.Total'));
					} else {
						$(o.HTML_CART_TOTAL_BALLS_LABEL_EXT).html('&nbsp;');
					}
					Lib.storage(priceStorageKey, total);
					
                    
					$(o.HTML_CART_TOTAL_SUM_ID).text(round(total, 2));
					$(o.HTML_CART_TOTAL_CURRENCY_ID).html(currency);
					if (totalBalls) {
						$(o.HTML_CART_TOTAL_BALL_WRAPPER_ID).removeClass('hide');
						$(o.HTML_CART_TOTAL_BALL_SUM_ID).text(round(totalBalls, 2));
						sBalls = o.getStrBalls(totalBalls);
						$(o.HTML_CART_TOTAL_BALL_CURRENCY_ID).html(sBalls);
					} else {
						$(o.HTML_CART_TOTAL_BALL_WRAPPER_ID).addClass('hide');
					}
				}
			}
		} else {
			
			if (ru.indexOf('/cart') != -1 && ru.indexOf('/cartlist') == -1) {
				Lib.storage(o.getShopId(), {});
				cc.saveBallsCart({});
				o.renderCountCart();
				AppACME.Messages.success(__('attention-has-changes-check-cart'));
			}
		}
		
		if (aNoRemovedItemsId.length && ru.indexOf('/cart') != -1 && ru.indexOf('/cartlist') == -1) {
			var b = cc.onRequestCartItemSuccess([aNoRemovedItemsId, aNoRemovedItemsId, 'done', 1]);
			if (b) {
				AppACME.Messages.success(__('attention-has-changes-check-cart'));
			}
		}
		if (Lib.REQUEST_URI(1) !== '/orderform') {
			$(AppACME.ShopCatNavigator.HTML_PRODUCTS_CONTAINER_ID).removeClass('hide');
		}
    },
	/** 
	 * @description Отправить форму отправки заказа
	*/
	sendOrder:function() {
		var F = AppACME, o = F.Cart, Lib = o.Lib, requiredFieldIsValid = Lib.validateRequired(o.HTML_ORDER_FORM_ID),
			data = {}, cc = F.CoreCart;
		if (requiredFieldIsValid) {
			if (Lib.validateEmailAndPhone()) {
				//Если нет токена карты, запрашиваем его
				cc.disableOrderButton();
                //Если нет токена карты, запрашиваем его
                if (F.oRfi18.isNeedCardToken()) {
					cc.enableOrderButton();
                    return F.oRfi18.requestCardToken();
				}
				o.grabFields(o.HTML_ORDER_FORM_ID, data);
				data.items = o.grabItems();
				data = F.oRfi18.patchRequest(data);
				AppACME.AuthMarker.restoreMarker();
				$(window).scrollTop(0);
				Lib.storage('sh-' + o.STORAGE_ADD_CART_KEY + $('#shopId').val(), Lib.storage(o.STORAGE_ADD_CART_KEY + $('#shopId').val()));
				Lib._post(data, cc.onSendOrder, '/cart/order?q=' + o.getShopId().replace('cart-', ''), function(){
					cc.enableOrderButton();
					Lib.defaultFail();
				});
			}
        }
		return false;
	},
	/** 
	 * @description Обработка ответа на отправку заказа
	*/
	onSendOrder(data) {
		var f = AppACME, o = f.Cart, Lib = o.Lib;
		f.CoreCart.enableOrderButton();
		if (o.isNeedAuth(data)) {
			return false;
		}
		
		$('#preloader').hide();
		if (data.success) {
			if (AppACME.Userscripts && AppACME.Userscripts.run) {
				AppACME.Userscripts.run('onOrderSended', arguments);
			}
			$(o.HTML_CART_LIST_ID).html('');
			$(o.HTML_CART_SUCCESS_ID).toggleClass('hide');
			
			var navH = $('div.navbar').first().height(),
				navH2 = $('section.breadcrumbs').first().height(),
				footH = $('#main-footer').height(),
				h = navH + navH2 + footH, successMessage = '';
			
			$(o.HTML_CART_SUCCESS_ID).css('height', (Lib.getViewport().h - h) + 'px' );
			window.scrollTo(0, 0);
			successMessage = data.success;
			f.oRfi18.processPaymentInfo(data.rfi18PaymentInfo, successMessage);
			successMessage = f.oRfi18.getSuccessMessage();
			if (f.oRfi18.is3dsPayment()) {
				f.oRfi18.action3ds();
				return;
			}
			Lib.messageSuccess(successMessage);
			if (f.oRfi18.isRedirectAlgorithm()) {
				if (f.oRfi18.actionRedirect()) {
					return;
				}
			}
			Lib.storage(o.STORAGE_ADD_CART_KEY + $('#shopId').val(), null);
			o.hideFailMessage = 1;
			$(o.HTML_ORDER_FORM_ID).parent().addClass('hide');
			$(o.HTML_ORDER_FORM_ID).parent().parent().addClass('hide');
			$(o.HTML_ORDER_FORM_TOGGLE_ID).hide();
			Lib.storage( o.getShopId(), {} );
			AppACME.AuthMarker.storeMarker();
			
			$('footer').remove();
			$(window).scrollTop(0);
			window.scrollTop = 0;
			
			setTimeout(function(){
				window.location.href = $(AppACME.CoreWebClientAuth.HTML_HISTORY_BTN_ID).attr('href');
			}, 3 * 1000);
		} else if(data.error){
			data.messages = f.oRfi18.processErrorMessages(data.rfi18PaymentInfo, data.messages);
			if (data.messages == 'return') {
				return;
			}
			o.showError(data.error, data.messages);
		}
	},
	onClickSendOrderButton(){
		/** @see sendOrder */
	},
	/**
	 * @description Установить состояние кнопки оформления заказа недоступна
	*/
	disableOrderButton(){
		let o = AppACME.Cart;
		$(o.HTML_SEND_ORDER_BUTTON_ID).prop('disabled', true);
		$(o.HTML_SEND_ORDER_BUTTON_ID).text(__('SendingOrder'));
	},
	/**
	 * @description Установить состояние кнопки оформления заказа недоступна
	*/
	enableOrderButton(){
		let o = AppACME.Cart;
		$(o.HTML_SEND_ORDER_BUTTON_ID).prop('disabled', false);
		$(o.HTML_SEND_ORDER_BUTTON_ID).text(__('SendOrder'));
	},
	/**
	 * @description вернет массив jQuery инпутов для ввода только цифр
	*/
	getNumInputs() {
		return $(AppACME.Cart.HTML_ORDER_FORM_ID).find('input[data-type=nums]');
	},
	/**
	 * @description Устанавливает для поля ввода цифр только цифры
	*/
	setNumberInputMask(){
		let o = AppACME.CoreCart,
			ls = o.getNumInputs();
		ls.bind('input', function(e) {o.onInputInNumberField(e);});
	},
	/**
	 * @description Обработка ввода
	*/
	onInputInNumberField(e){
		e.preventDefault();
		let o = this,
			ls = o.getNumInputs(), i, j, s, k;
		for (i = 0; i < ls.length; i++) {
			j = $(ls[i]);
			s = j.val();
			s = s.replace(/\D/g, '');
			k = o._prevNumValues[j.attr('id')];
			if (!k) {
				o._prevNumValues[j.attr('id')] = '';
			}
			o._prevNumValues[j.attr('id')] = s ? s : k;
			s = s ? s : k;
			j.val(s);
		}
	},
	/**
	 * @description Очистить корзину в списке корзин
	 * @return {Boolean} true если удалось всё очистить
	*/
	clearShopCart(evt, shopId) {
		var s,
			o = AppACME.Cart;
		if (evt) {
			evt.preventDefault();
			if (evt.target.tagName == 'IMG') {
				evt.target = evt.target.parentNode;
			}
			s = evt.target.getAttribute('data-id');
			$(evt.target).parents(o.HTML_LIST_CART_ITEM_CSS).first().remove();
		} else {
			if (shopId) {
				s = shopId;
			} else {
				s = $('#shopId').val();
			}
		}
		if (s) {
			localStorage.removeItem('cart-' + s);
			localStorage.removeItem('ball-' + s);
			o.renderCountInCartList();
			return true;
		}
		return false;
	}
};
