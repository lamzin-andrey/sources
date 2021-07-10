/** Здесь только функции не зависящие от DOM */
window.AppACME = window.AppACME || {};
/**
 * @object 
*/
var CoreWebClientAuth = {
	/** @properties {String} идентификаторы формы регистрации*/
	HTML_REG_FORM_ID             : '#regForm',
	HTML_REG_PASSWORD_INPUT_ID   : '#password',
	HTML_REG_PASSWORD_C_INPUT_ID : '#passwordRepeat',
	HTML_REG_EMAIL_INPUT_ID      : '#email',
	HTML_REG_AGREEMENT_INPUT_ID  : '#agreementCb',
	HTML_REG_MODAL_ID            : '#regModal',
	HTML_REGISTER_POPUP_LINK_ID  : '#fromRegisterFormEntry',
	
	/** @properties {String} идентификаторы формы логина */
	HTML_LOGIN_FORM_ID             : '#loginForm',
	HTML_LOGIN_PASSWORD_INPUT_ID   : '#lpassword',
	HTML_LOGIN_EMAIL_INPUT_ID      : '#login',
	HTML_LOGIN_MODAL_ID            : '#loginModal',

	/** @properties {String} идентификаторы формы смены пароля */
	HTML_CHANGE_PASS_BLOCK_ID               : '#change_password_block',
	HTML_CHANGE_PASS_FORM_ID                : '#change_password',
	HTML_CHANGE_PASS_CURR_PASS_INPUT_ID     : '#current_password',
	HTML_CHANGE_PASS_NEW_PASS_INPUT_ID      : '#new_password',
	HTML_CHANGE_PASS_NEW_PASS_REP_INPUT_ID  : '#new_password_repeat',
	HTML_CHANGE_PASS_FAIL_ALERT_ID          : '.alert-danger',
	HTML_CHANGE_PASS_SUCCESS_ALERT_ID       : '.alert-success',
	
	/** @properties {String} идентификаторы формы восстановления пароля */
	HTML_RECOVERY_FORM_ID          : '#recoveryForm',
	HTML_RECOVERY_EMAIL_INPUT_ID   : '#recoveremail',
	HTML_RECOVERY_MODAL_ID         : '#pwdRecModal',
	
	/** @property {String} идентификатор кнопки Вход */
	HTML_SHOW_POPUP_BTN_ID         : '#navbarEnterLink',
	
	/** @property {String} идентификатор кнопки Регистрация */
	HTML_SIGNUP_BTN_ID         : '#navbarRegLink',
		
	/** @property {String} идентификатор кнопки Выход */
	HTML_LOGOUT_BTN_ID         : '#navbarLogoutLink',
	HTML_LOGOUT_MOBILE_BTN_ID  : '#mLogout',
	
	/** @property {String} идентификатор ссылки Мои заказы */
	HTML_HISTORY_BTN_ID         : '#historyLink',
	
	/** @property {String}  */
	HTML_PERSON_INFO_BLOCK_ID  : '#navbarPerson',
	
	/** @property {String}  */
	HTML_PROFILE_BTN_ID : '#profileLink',
	
	/** @property {String} id вывода баллов пользователя на навбаре */
	HTML_CURRENT_BALLS_VIEW_ID : '#points',
	
	/**
	 *@param {Object} 
	*/
	init:function(lib) {
		var o = this;
		o.lib = lib;
		o.setListeners();
		o.fbToken();
		o.vkToken();
		o.mruToken();
		o.checkReviewLogin();
		o.redirectFromComfirmPage();
	},
	setListeners:function() {
		var o = this;
		$(o.HTML_REG_FORM_ID).bind('submit', o.onRegFormSubmit);
		$(o.HTML_LOGIN_FORM_ID).bind('submit', o.onLoginFormSubmit);
		$(o.HTML_RECOVERY_FORM_ID).bind('submit', o.onRecoveryFormSubmit);
		$(o.HTML_CHANGE_PASS_FORM_ID).bind('submit', o.onChangePassFormSubmit);
		$(o.HTML_LOGOUT_BTN_ID).click(o.onLogout);
		$(o.HTML_LOGOUT_MOBILE_BTN_ID).click(o.onLogout);
		
		$(o.HTML_REGISTER_POPUP_LINK_ID).click(function(evt){ // '#fromRegisterFormEntry'
			if ($(o.HTML_LOGIN_MODAL_ID).css('display') == 'none') {
				$(o.HTML_LOGIN_MODAL_ID).modal('show');
			}
		});
		
		$(o.HTML_SHOW_POPUP_BTN_ID).click(function(evt){
			$.cookie('ar', window.location.href, {path: '/'});
		});

	},
	/**
	 * 
	*/
	onRegFormSubmit:function(evt) {
		evt.preventDefault();
		var o = AppACME.CoreWebClientAuth, isValid, data = {};
		isValid = o.lib.validateRequired(o.HTML_REG_FORM_ID) && o.lib.validateEmail(o.HTML_REG_FORM_ID) && o.checkPasswords();
		if (isValid) {
			data.password = $(o.HTML_REG_PASSWORD_INPUT_ID).val();
			data.passwordRepeat = $(o.HTML_REG_PASSWORD_C_INPUT_ID).val();
			data.email    = $(o.HTML_REG_EMAIL_INPUT_ID).val();
			data.agreementCb    = $(o.HTML_REG_AGREEMENT_INPUT_ID).prop('checked');
			o.lib._post(data, o.onRegSuccess, '/signup', o.onRegFail);
		}
		return false;
	},
	/**
	 * 
	*/
	onLoginFormSubmit:function(evt) {
		evt.preventDefault();
		var o = AppACME.CoreWebClientAuth, isValid, data = {};
		isValid = o.lib.validateRequired(o.HTML_LOGIN_FORM_ID) && o.lib.validateEmail(o.HTML_LOGIN_FORM_ID);
		if (isValid) {
			o._sendLoginData($(o.HTML_LOGIN_EMAIL_INPUT_ID).val(), $(o.HTML_LOGIN_PASSWORD_INPUT_ID).val(), o);
		}
		return false;
	},
	/**
	 * 
	*/
	onRecoveryFormSubmit:function(evt) {
		evt.preventDefault();
		var o = AppACME.CoreWebClientAuth, isValid, data = {};
		isValid = o.lib.validateRequired(o.HTML_RECOVERY_FORM_ID) && o.lib.validateEmail(o.HTML_RECOVERY_FORM_ID);
		if (isValid) {
			data.email    = $(o.HTML_RECOVERY_EMAIL_INPUT_ID).val();
			o.lib._post(data, o.onRecoverySuccess, '/recovery', o.onRecoveryFail);
		}
		return false;
	},
	/**
	 *
	 */
	onChangePassFormSubmit:function() {
		var o = AppACME.CoreWebClientAuth, isValid, data = {};
		$(o.HTML_CHANGE_PASS_BLOCK_ID).find(o.HTML_CHANGE_PASS_FAIL_ALERT_ID).addClass('hide');
		$(o.HTML_CHANGE_PASS_BLOCK_ID).find(o.HTML_CHANGE_PASS_SUCCESS_ALERT_ID).addClass('hide');
		isValid = o.lib.validateRequired(o.HTML_CHANGE_PASS_FORM_ID);
		if (isValid) {
			data.currentPassword = $(o.HTML_CHANGE_PASS_CURR_PASS_INPUT_ID).val();
			data.newPassword    = $(o.HTML_CHANGE_PASS_NEW_PASS_INPUT_ID).val();
			data.passwordRepeat    = $(o.HTML_CHANGE_PASS_NEW_PASS_REP_INPUT_ID).val();
			o.lib._post(data, o.onChangePassSuccess, '/changePassword', o.onChangePassFail);
		}
		return false;
	},
	/**
	 * @return {Boolean} true если пароли совпадают
	*/
	checkPasswords:function() {
		var p = this, r = ($(p.HTML_REG_PASSWORD_INPUT_ID).val() === $(p.HTML_REG_PASSWORD_C_INPUT_ID).val() );
		//TODO set Error
		if (!r) {
			p.lib.setFormErrorByPlaceholder(p.HTML_REG_PASSWORD_C_INPUT_ID, __('messages.Passwords_is_different'));
		}
		return r;
	},
	onRegSuccess:function(data) {
		var i, o = AppACME.CoreWebClientAuth;
		if (data.error) {
			if (data.error instanceof Object) {
				for (i in data.error) {
					if ($('#' + i)[0]) {
						o.lib.setFormErrorByPlaceholder('#' + i, data.error[i]);
					}
				}
			} else {
				o.lib.messageFail(data.error);
			}
		} else {
			$(o.HTML_REG_MODAL_ID).modal('hide');
			AppACME.AuthMarker.forceStoreMarker();
			o._sendLoginData($(o.HTML_REG_EMAIL_INPUT_ID).val(), $(o.HTML_REG_PASSWORD_INPUT_ID).val(), o);
		}
	},
	onRegFail:function(data) {
		if (data && data.responseJSON && data.responseJSON.error) {
			CoreWebClientAuth.onRegSuccess(data.responseJSON);
		} else {
			CoreWebClientAuth.lib.messageFail(__('messages.Unable_register_user_try_later'));
		}
	},
	onLoginSuccess:function(data) {
		var i, o = CoreWebClientAuth, oV = AppACME.WebClientAuth;
		if (data.error) {
			if (data.error instanceof Object) {
				for (i in data.error) {
					if ($('#' + i)[0]) {
						o.lib.setFormErrorByPlaceholder('#' + i, data.error[i]);
					}
				}
			} else {
				o.lib.messageFail(data.error);
			}
		} else {
			oV.showUserNavbar(data);
			AppACME.AuthMarker.forceStoreMarker();
			if (AppACME.Desktop.isMobile()) {
				window.location.href = window.location.href;
			}
		}
	},
	onLoginFail:function(data) {
		if (data && data.responseJSON && data.responseJSON.error) {
			CoreWebClientAuth.onLoginSuccess(data.responseJSON);
		} else {
			CoreWebClientAuth.lib.messageFail(__('messages.Unable_login_try_later'));
		}
	},
	onChangePassSuccess:function(data) {
		var i, o = CoreWebClientAuth;
		if (data.error) {
			if (data.error instanceof Object) {
				$(o.HTML_CHANGE_PASS_BLOCK_ID).find(o.HTML_CHANGE_PASS_FAIL_ALERT_ID).removeClass('hide');
				for (i in data.error) {
					$(o.HTML_CHANGE_PASS_BLOCK_ID).find(o.HTML_CHANGE_PASS_FAIL_ALERT_ID).find('p').text(data.error[i]);
					if ($('#' + i)[0]) {
						o.lib.setFormErrorByPlaceholder('#' + i, data.error[i]);
					}
				}
			} else {
				o.lib.messageFail(data.error);
			}
		} else {
			$(o.HTML_CHANGE_PASS_BLOCK_ID).find(o.HTML_CHANGE_PASS_SUCCESS_ALERT_ID).removeClass('hide');
			$(o.HTML_LOGIN_MODAL_ID).modal('hide');
			AppACME.AuthMarker.forceStoreMarker();
			$(o.HTML_SHOW_POPUP_BTN_ID).addClass('hide');
			$(o.HTML_LOGOUT_BTN_ID).addClass('show');
			$(o.HTML_HISTORY_BTN_ID).addClass('show');
			$(o.HTML_PERSON_INFO_BLOCK_ID).text(data.name);
		}
	},
	onChangePassFail:function(data) {
		if (data && data.responseJSON && data.responseJSON.error) {
			CoreWebClientAuth.onChangePassSuccess(data.responseJSON);
		} else {
			CoreWebClientAuth.lib.messageFail(__('messages.Unable_change_password_user_try_later'));
		}
	},
	onRecoverySuccess:function(data) {
		var i, o = CoreWebClientAuth;
		if (data.error) {
			if (data.error instanceof Object) {
				for (i in data.error) {
					if ($('#' + i)[0]) {
						o.lib.setFormErrorByPlaceholder('#' + i, data.error[i]);
					}
				}
			} else {
				o.lib.messageFail(data.error);
			}
		} else {
			$(o.HTML_RECOVERY_MODAL_ID).modal('hide');
			o.lib.messageSuccess(data.msg);
		}
	},
	onRecoveryFail:function(data) {
		if (data && data.responseJSON && data.responseJSON.error) {
			CoreWebClientAuth.onRecoverySuccess(data.responseJSON);
		} else {
			CoreWebClientAuth.lib.messageFail(__('messages.Unable_login_try_later'));
		}
	},
	onLogout:function() {
		//AppACME.AuthMarker.dropMarker();
		setTimeout(function(){ window.location.href = '/logout'; }, 1000);
		return false;
	},
	/*====================FACEBOOK====================================*/
	fbToken:function() {
		var o = this, s, Lib = AppACMEWebLibrary;
		if (Lib.REQUEST_URI(1) == '/fbl') {
			s = window.location.hash.replace('#', '?');
			s = Lib._GET('access_token', 0, s);
			if (s) {
				o.lib._post({token:s}, o.onSendFbToken, '/fbl.json', o.onFailSendFbToken);
			}
		}
	},
	onSendFbToken:function(data){
		var o = AppACME.CoreWebClientAuth;
		if (data.error) {
			o.lib.messageFail(data.error);
			if (data.info == 'showFbLoginForm') {
				$(o.HTML_LOGIN_MODAL_ID).modal('show');
			}
		} else {
			var needReloadPage = true, message;
			if (data.reviewsWarning && AppACME.Reviews.lastTryReviewId && data.reviewsAuthType) {
				message = AppACME.Reviews.createRewiewsWarningMessage(o.getSocnetName(data.reviewsAuthType), data.reviewsAuthType);
				if (message) {
					needReloadPage = false;
					o.lib.messageFail(message);
				}
			}
			if (needReloadPage) {
				AppACME.AuthMarker.forceStoreMarker();
				var t = $.cookie('ar') ? $.cookie('ar') : '/';
				setTimeout(function(){window.location.href = t;}, 1000);
			}
		}
	},
	getSocnetName:function(socNetId) {
		switch (socNetId) {
			case 'fb':
				return 'Facebook';
			case 'vk':
				return 'Vkontakte';
			case 'mru':
				return 'Mail.Ru';
		}
		return '';
	},
	onFailSendFbToken:function(){
		AppACME.CoreWebClientAuth.lib.defaultFail();
	},
	/*============================VK===================================*/
	vkToken:function() {
		var o = this, s, Lib = AppACMEWebLibrary;
		if (Lib.REQUEST_URI(1) == '/vkl.json') {
			if (vkLoginSuccess) {
				AppACME.AuthMarker.forceStoreMarker();
				var t = $.cookie('ar') ? $.cookie('ar') : '/';
				setTimeout(function(){window.location.href = t;}, 1000);
			}
		}
	},
	mruToken:function() {
		var o = this, s, Lib = AppACMEWebLibrary;
		if (Lib.REQUEST_URI(1) == '/mrl.json') {
			if (mruLoginSuccess) {
				AppACME.AuthMarker.forceStoreMarker();
				var t = $.cookie('ar') ? $.cookie('ar') : '/';
				setTimeout(function(){window.location.href = t;}, 1000);
			}
		}
	},
	/**
	 * @description Отправка данных логин / пароль
	*/
	_sendLoginData:function(login, password, o) {
		var data = {};
		data.password = password;
		data.email    = login;
		o.lib._post(data, o.onLoginSuccess, '/signin', o.onLoginFail);
	},
	/**
	 * @description при необходимости показывает окно авторизации чтобы оставить отзыв
	*/
	checkReviewLogin:function() {
		var o = AppACMEWebLibrary;
		if(window.AppACME.showLoginFormReview) {
			$.cookie('ar', '/all_history', {path: '/'});
			$('#loginModal').modal('show');
			o.storage('reviewOrderId', o._GET('id'));
		}
	},
	/**
	 * @description редирект на главную через пять секунд со страницы восстановления пароля
	*/
	redirectFromComfirmPage:function() {
		if (AppACMEWebLibrary.REQUEST_URI().indexOf('/restore/client/confirm/') === 0) {
			setTimeout(function() {
				location.href = '/';
			}, 5*1000);
		}
	}
	
};
window.AppACME.CoreWebClientAuth = CoreWebClientAuth;
