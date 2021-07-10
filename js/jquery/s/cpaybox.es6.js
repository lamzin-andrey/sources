/**
 * @description Тут всё, что связанно с оплатой через Paybox независящее (мало зависящее) от DOM
*/
class CPaybox extends CCardPayment{
    constructor() {
        super();
        /**@property _redirectUrl - url на который надо перенаправить пользователя для того чтобы он мог там ввести данные для оплаты */
        this._redirectUrl = '';
    }
    /**
     * @description Нет необходимости совершать сложные манипуляции
    */
    isNeedCardToken() {
        return false;
    }
    /**
     * //TODO этот возможно не надо вообще перегружать. А вот перегрузку isCardPayment сохранить
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
     * @description Если форма оплаты содержит инпут оплаты картами и он выбран и есть данные о полученном токене оплаты, вернет true
    */
   isCardPayment() {
        if (this.isFormContaintsCardPaymentVariant() && this.isCardPaymentVariantActive) {
            return true;
        }
        return false;
    }
    /**
     * @description При необходимости изменяет сообщение об успешном создании заказа (@see patchSuccessMessage)
     * Изменяет this._successMessage
     * Изменяет this._is3dsPayment TODO actualize
     * @param {Object} data ответ платежной системы
     * @param {String} successMessage сообщение об успешном оформлении заказа по умолчанию
     */
    processPaymentInfo(data, successMessage) {
        this._successMessage = this.patchSuccessMessage(data, successMessage);
        if (data && data.status == 'success' && data.url) {
            this._redirectUrl = data.url;
        }
        /*if (data && data.is3ds) {
            this._is3dsPayment = true;
        } else {
            this._is3dsPayment = false;
        }*/
    }
    /**
     * @description При необходимости изменяет сообщение об успешном создании заказа
     * (Добавляет информацию, о том, что пользователь будет переправлен на страницу ввода данных для оплаты
     * @param {Object} data ответ платежной системы
     * @param {String} successMessage сообщение об успешном оформлении заказа по умолчанию
     * @return String  
     */
    patchSuccessMessage(data, successMessage)   {
        if (data && data.status == 'success') {
            let buf = data;
            //TODO по обстоятельствам, что там к нам придёт?
            if (buf.url) {
                successMessage =  __('paybox-let-go-input-card-data');
                //На всякий случай
                AppACMEWebLibrary.storage(this.STORAGE_TS_KEY, time());
            }
            /* TODO это скорее всего не надо
            if (buf.runCheckStatusTimer) {
                successMessage += '<p>' + buf.message + '</p>';
                AppACMEWebLibrary.storage(this.STORAGE_TS_KEY, time());
            }*/
        }
        return successMessage;
    }
    is3dsPayment(){
        return false;
    }
    /**
     * TODO всё по обстоятельствам
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
                AppACME.RFI_RECURRENT_ID = 0;
                this.initRecurrentControls();
                messages.push(__('rfi-enter-card-data-again'));
            }
            if (typeof(messages) == 'array' || (messages instanceof Array) ) {
                messages.push(rfi18PaymentInfo.message);
            }
        }
        return messages;
    }
    /**
     * @description Мы просто отправляем пользователя на url полученный при инициализации платежа, он там введет данные карты
    */
    isRedirectAlgorithm(){
        return true;
    }
    /**
     * @description Мы просто отправляем пользователя на url полученный при инициализации платежа, он там введет данные карты
     * @return Boolean true усли определен _redirectUrl  и начато перенаправление на него
    */
    actionRedirect() {
        if (this._redirectUrl) {
            setTimeout(()=>{location.href = this._redirectUrl;}, 100);
            return true;
        }
        return false;
    }
}
