/**
 * @description Тут всё, что связанно с оплатой картами и независящее (мало зависящее) от DOM
 * Пока что это просто код из CRfi18
*/
class CCardPayment {
    constructor() {
        /** @property _isCardTokenExists {Boolean} true когда получены данные о том, что существуем токен карты */
        this. _isCardTokenExists = false;

        /** @property HTML_CARD_DATA_MODAL_ID {String} идентификатор модального окна с ифреймом подгружающим форму ввода данных карты  */
        this.HTML_CARD_DATA_MODAL_ID = '#cardIframeModal';

        /** @property HTML_CARD_DATA_IFRAME_ID {String} идентификатор ифрейма, подгружающего форму ввода данных карты */
        this.HTML_CARD_DATA_IFRAME_ID = '#cardIframe';

        /** @property HTML_INPUT_APPROVED_DOMAIN_ID {String} идентификатор скрытого инпута, содержащего адрес домена, с которого может быть загружен контент в iframe */
        this.HTML_INPUT_APPROVED_DOMAIN_ID = '#iApprovedOrigin';

        /** @property HTML_CARD_IFRAME_WRAP_ID {String} идентификатор контейнера, содержащего iframe */
        this.HTML_CARD_IFRAME_WRAP_ID = '#cardIframeWr';

        /**@property {String} STORAGE_TS_KEY */
        this.STORAGE_TS_KEY = 'rfi18ts';

        /** @property {Boolean} _requestPaymentStatusIsSended true когда обрабатывается запрос статуса платежа */
        this._requestPaymentStatusIsSended = false;

        /**@property {String} _successMessage Сообщение об успешном оформлении заказа. Устанавливаестя в this.processPaymentInfo */
        this._successMessage = '';

        /**@property {Boolean} Принимает true, когда в ответ от сервиса оплаты пришло сообщение о том, что необходима 3ds авторизация. Устанавливаестя в this.processPaymentInfo */
        this._is3dsPayment = false;

        /** @param {Boolean} recurrentNextMode когда есть recurrent_order_id  пользователь может выбрать оплату не картами. В таких случаях  recurrentNextMode =  false */
        
        window.addEventListener('message', this.onMessage, false);
        
    }
    /**
     * @description Приём сообщения от iframe
    */
    onMessage(data) {
        if (!AppACME.CoreCart.isCartPage()) {
            return;
        }
        let origin = data.origin,
            f = AppACME,
            o = f.oRfi18,
            oCart = f.Cart,
            domain = o.getApprovedDomain()
        ;
        if (!domain || (origin != domain && origin != AppACMEWebLibrary.HTTP_HOST()) ) {
            if (!~origin.indexOf('yandex.ru')) {
                console.log(sprintf(__('rfi-security-error'), origin + ', expect ' + domain));
            }
            return;
        }
        data = data.data;
        if (typeof(data) == 'string') {
            if (data == 'success') {
                //закрываем модал и отправляем форму
                o.closeModal();
                AppACME.Messages.success(__('rfi-payment-init-process'));
                o._isCardTokenExists = true;
                AppACME.CoreCart.sendOrder();
                $(oCart.HTML_SEND_ORDER_BUTTON_ID).prop('disabled', true);
            }
        } else if (typeof(data) == 'object') {
            if (data.status == 'error') {
                $(oCart.HTML_SEND_ORDER_BUTTON_ID).prop('disabled', false);
                if (data.message) {
                    let msg =  sprintf(__('rfi-unable-get-card-token'), data.message);
                    if (this.isFormContaintsMultiplePaymentVariants) {
                        msg += ' ' + __('rfi-you-can-choose-other-var');
                    } else {
                        msg += ' ' + __('rfi-you-can-try-later');
                    }
                    AppACME.Messages.fail(msg);
                }
            }
        }
   }
    /**
     * @description Если форма оплаты содержит инпут оплаты картами и он выбран и нет данных о полученном токене оплаты  и не установлена галка "Использовать предыдущий введенный номер карты ", вернет true
    */
    isNeedCardToken() {
        if (this.isFormContaintsCardPaymentVariant() && this.isCardPaymentVariantActive && !this._isCardTokenExists && !this.isNeedUsePrevCardData()) {
            return true;
        }
        return false;
    }
    /**
     * @description Если форма оплаты содержит инпут оплаты картами и он выбран и есть данные о полученном токене оплаты, вернет true
    */
    isCardPayment() {
        if (this.isFormContaintsCardPaymentVariant() && this.isCardPaymentVariantActive && (this._isCardTokenExists || this.isNeedUsePrevCardData()) ) {
            return true;
        }
        return false;
    }
    /**
     * @description Показывает диалог ввода данных карты
    */
    requestCardToken()  {
        let iframe = $(this.HTML_CARD_DATA_IFRAME_ID), src = iframe.attr('src'), 
        f = AppACME, iframeId, nCallCounter = 0,
        /** @var {AppACME.Cart} oCart  */
        oCart = f.Cart,
        /** @var {AppACME.AuthMarker} mark  */
        mark = AppACME.AuthMarker;
        if (!mark.getMarker()) {
            AppACMEWebLibrary._post({}, this.onSuccessGetAuthMarker, '/c/setmarkerforce', this.onFailGetAuthMarker);
            return;
        }
        nCallCounter = +src.split('#')[1];
        nCallCounter = nCallCounter ? nCallCounter : 0;
        nCallCounter++;
        src = src.split('#')[0];
        src = window.AppACMEWebLibrary.setGetVar(src, 'a', oCart.getShopId().replace('cart-', ''), false, '');
        src = window.AppACMEWebLibrary.setGetVar(src, 'b', mark.getMarker(), false, '');
        iframeId = iframe.attr('id');
        iframe.remove();
        iframe = $('<iframe></iframe>');
        iframe.attr('id', iframeId);
        iframe.attr('src', src + '#' + nCallCounter);
        $(this.HTML_CARD_IFRAME_WRAP_ID).append(iframe);
        this.openModal();
    }
    onSuccessGetAuthMarker(){
        if (!AppACME.AuthMarker.getMarker()) {
            AppACME.Messages.fail(__('Unable_get_stamp') + '. ' +  __('try-cookies-on'));
        } else {
            AppACME.AuthMarker.forceStoreMarker();
            AppACME.oRfi18.requestCardToken();
        }
    }
    onFailGetAuthMarker() {
        AppACME.Messages.fail(__('Unable_get_stamp') + '. ' +  __('try-cookies-on'));
    }
    closeModal(){
        $(this.HTML_CARD_DATA_MODAL_ID).modal('hide');
    }
    openModal() {
        $(this.HTML_CARD_DATA_MODAL_ID).modal('show');
    }
    /**
     * @description Получить uri домена, с которого могут приходить postMessage сообщения
     * @return String
    */
    getApprovedDomain() {
        let inp = $(this.HTML_INPUT_APPROVED_DOMAIN_ID);
        if (inp[0]){
            return inp.val().trim();
        }
        return '';
    }
    /**
     * @description Запускает таймер запросов статуса платежа
    */
    runCheckPaymentStatusTimer() {
        AppACME.CoreCart.sec5Listeners['_checkPaymentStatusListenerId'] = this.onTimeCheckPaymentStatus;
    }
    /**
     * @description Делает запрос состояния оплаты заказа
    */
    onTimeCheckPaymentStatus(){
        let o = AppACME.oRfi18;
        if (o._requestPaymentStatusIsSended) {
            return;
        }
        o._requestPaymentStatusIsSended = true;
        AppACMEWebLibrary._get(o.onDataPaymentStatus, '/checkpaymentstatus', ()=>{o._requestPaymentStatusIsSended = false;});
    }
    /**
     * @description Обработка данных о статусе последнего платежа
    */
    onDataPaymentStatus(d){
        let f = AppACME, o = f.oRfi18, bSuccess;
        o._requestPaymentStatusIsSended = false;
        if (d.status == 'success' && d.message) {
            bSuccess = AppACME.CoreCart.clearShopCart(0, d.sid);
            if (bSuccess) {
                f.Messages.success(d.message);
                AppACMEWebLibrary.storage(o.STORAGE_TS_KEY, null);
                AppACME.CoreCart.sec5Listeners['_checkPaymentStatusListenerId'] = null;
            }
        }
    }
    /**
     * @description При необходимости изменяет сообщение об успешном создании заказа
     * (Добавляет информацию, что заказ оплачен либо поставлен в очередь на оплату (инициирован) )
     * @param {Object} data ответ платежной системы (на данный момент это РФИ)
     * @param {String} successMessage сообщение об успешном оформлении заказа по умолчанию
     * @return String  
     */
    patchSuccessMessage(data, successMessage)   {
        if (data && data.status == 'success') {
            let buf = data;
            if (!buf.runCheckStatusTimer && buf.transaction_status == 'success' || buf.transaction_status == 'payed') {
                successMessage += '<p>' + __('rfi-payment-success') + '</p>';
            }
            if (buf.runCheckStatusTimer) {
                successMessage += '<p>' + buf.message + '</p>';
                //this.runCheckPaymentStatusTimer();
                AppACMEWebLibrary.storage(this.STORAGE_TS_KEY, time());
            }
        }
        return successMessage;
    }
    /**
     * @description При необходимости изменяет сообщение об успешном создании заказа (@see patchSuccessMessage)
     * Изменяет this._successMessage
     * Изменяет this._is3dsPayment
     * @param {Object} data ответ платежной системы (на данный момент это РФИ)
     * @param {String} successMessage сообщение об успешном оформлении заказа по умолчанию
     */
    processPaymentInfo(data, successMessage)   {
        this._successMessage = this.patchSuccessMessage(data, successMessage);
        if (data && data.is3ds) {
            this._is3dsPayment = true;
        } else {
            this._is3dsPayment = false;
        }
    }
    /**
     * @return String сообщение об успешном оформлении заказа, возможно с информацией об успешном платеже или успешной инициации платежа
    */
    getSuccessMessage(){
        return this._successMessage;
    }
    /**
     * @return Boolean true если платеж требует 3ds авторизации
    */
    is3dsPayment(){
        return this._is3dsPayment;
    }
    /**
     * @description Перенаправляет на старницу банка для подтверждения карты через sms
    */
    action3ds(){
        if (this._is3dsPayment){
            let Lib = AppACMEWebLibrary, f = AppACME;
            setTimeout(()=>{
                location.href = $(this.HTML_INPUT_APPROVED_DOMAIN_ID).val() + '/card/3ds/?b=' + f.AuthMarker.getMarker() + '&retryUrl=' + location.href + '&a=' + f.Cart.getShopId().replace('cart-', '');
            }, 100);
        }
    }
    /**
     * @description Проверяет, не надо ли запустить проверку последнего платежа
     */
    checkPaymentStatus(){
        let Lib = AppACMEWebLibrary, ts = parseInt(Lib.storage(this.STORAGE_TS_KEY), 10);
        //Если с момента последнего оплаченного заказа прошло  менее 5 минут, попробуем ео запросить
        if (ts && time() - ts < 300) {
            this.runCheckPaymentStatusTimer();
        }
    }
    /**
	 * @description Показать или скрыть чекбокс отписки от рекуррентных платежей.
     * Соответственно устанавливается поле  recurrentNextMode
	*/
	setRecurrentCheckboxMode() {
		let o = this;
        o.isFormContaintsCardPaymentVariant();
        //В списке выбран способ оплаты картами и существует id рекуррентного платежа
		if (o.isCardPaymentVariantActive && +AppACME.RFI_RECURRENT_ID) {
            o.setReccurrentCheckboxVisible(true);
			o.recurrentNextMode = true;
		} else {
            o.setReccurrentCheckboxVisible();
			o.recurrentNextMode = false;
		}
    }
    /**
     * @description Показываем при необходимости контролы управления подпиской рекуррентного платежа
    */
    initRecurrentControls() {
        if (+AppACME.RFI_RECURRENT_ID) {
           this.setRecurrentCheckboxMode();
        } else {
           this.showRecurrentChb();//define in heir depends from theme
        }
    }
    /**
     * @description При необходимости добавляет в data необходимые поля, связанные с оплатой картами
     * @param {Object} data объект с полями, которые будут отправлены на сервер
     * @return Object аргумент, дополненный при необходимости полями
     */
    patchRequest(data){
        let o = this;
        if (o.isCardPayment()) {
            data.rfi18 = 1;
            data.isCardPayment = 1;
        }
        if (o.isNeedRememberMyCardData()) {//define in heir
            data.rememberMyCard = 1;
        }
        if (o.isNeedUsePrevCardData()) {
            data.useOldCardData = 1;
        }
        return data;
    }
    /**
     * @description Обработка ответа платежной системы при неудачной инициализации платежа
     * Добавляет в messages сообщения и возвращает их.
     * Если ошибка связана с потеряным токеном карты или неудачным рекуррентным платежем типа next,
     *  вернет строку 'return' что можно использовать во внешнем коде для изменеия поведения
     * @param {Object} rfi18PaymentInfo 
     * @param {any} messages 
     * @return any String | messages
    */
    processErrorMessages(rfi18PaymentInfo, messages){
        if (rfi18PaymentInfo && rfi18PaymentInfo.message) {
            if (rfi18PaymentInfo.recurrentNextError || this.isNeedUsePrevCardData()) {
                rfi18PaymentInfo.loseCardToken = true;
                AppACME.RFI_RECURRENT_ID = 0;
                this.initRecurrentControls();
            }
            if (rfi18PaymentInfo.loseCardToken) {
                this.requestCardToken();
                AppACME.Messages.fail(__('rfi-enter-card-data-again'));
                return 'return';
            }
            if (typeof(messages) == 'array' || (messages instanceof Array) ) {
                messages.push(rfi18PaymentInfo.message);
            }
        }
        return messages;
    }
    /**
	 * @description Обработка клика на чекбоксе для отказа от рекуррентных платежей
	*/
	onUnsubscribeRecurrentChb() {
		var o = this;
		if ($(o.HTML_RECURRENT_OFF_CHB_ID).prop('checked') == true) {
			return;
        }
        o._lastfri_recurrent_id = AppACME.RFI_RECURRENT_ID;
        AppACME.RFI_RECURRENT_ID = 0;
        o.initRecurrentControls();
		AppACMEWebLibrary._post({sid:AppACME.Cart.getShopId().replace('cart-', '')}, (d)=>{o.onDataCancelRecurrent(d);}, '/rfi18cancelrecurrent', ()=>{o.onFailCancelRecurrent();});
    }
    /**
     * @description Обработка ответа сервера об отвязке карты
     * @param {Object} d данные об операции отвязки карты
    */
    onDataCancelRecurrent(d) {
        var o = this;
        if (d.status == 'success') {
            AppACME.RFI_RECURRENT_ID = 0;
            o.initRecurrentControls();
            AppACME.Messages.success(d.message);
        }
        if (d.status == 'error') {
            this.onFailCancelRecurrent();
            if (d.message) {
                AppACME.Messages.fail(d.message);
            }
        }
    }
    /**
     * @description Обработка неудачной отправки запроса на отвязку карты
    */
    onFailCancelRecurrent() {
        var o = this;
        AppACME.RFI_RECURRENT_ID = o._lastfri_recurrent_id;
        o.initRecurrentControls();
    }
}
