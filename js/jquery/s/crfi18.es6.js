/**
 * @description Тут всё, что связанно с оплатой через РФИ без их модала и независящее (мало зависящее) от DOM
*/
class CRfi18 extends CCardPayment{
    constructor() {
        super();
    }
    /**
     * Для совместимости с интерфейсом CCardPayment
    */
    isRedirectAlgorithm() {
        return false;
    }
}
