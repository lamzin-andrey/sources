'use strict';
/** Здесь только независимые от DOM функции */
window.AppACME = window.AppACME || {};
AppACME.CShopList = {
	/** @property {Boolean} HISTORY_API false || true */
	HISTORY_API :!!(window.history && window.history.pushState),
	/**
	 * @description Сообщение о пустых результатах поиска с ссылкой вернуться назад.
	 * @return String;
	*/
	getEmptyResultMsg:function() {
		var o = this, s;
		if (o.HISTORY_API) {
			s = '<a href="#" id="srchBackLink">' + __('messages._go_back_') + '</a>'
		} else {
			s = '<a href="/" >' + __('messages._go_main_') + '</a>'
		}
		return __('messages.Empty_ag_search_result_msg').replace('{back_link}', s);
	},
	onSrchBackLinkClick:function(e) {
		e.preventDefault();
		var o = AppACME.CShopList;
		if (o.HISTORY_API) {
			history.go(-1);
		} else {
			window.location.href = '/';
		}
	}
};
