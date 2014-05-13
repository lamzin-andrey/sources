(function ($, undefined) {
	$(document).ready(
		function (){
			initForm();
		}
	);
	/**
	 * @desc Инициализация формы
	 * */
	function initForm() {
		$("#iSubmit").attr("disabled", false);
		$("#iSubmit").attr("value", "Отправить запрос");
		$("#iSubmit").on("click", formSubmit);
		$("#loader").hide();
	}
	/**
	 * @desc Валидация и отправка формы
	 * */
	function formSubmit() {
		if (!validateURL()) {
			showError("Некорректный URL");
			return false;
		}
		if (!validateArgsOnSubmit()) {
			return false;
		}
		sendForm();
		return false;
	}
	/**
	 * @desc Отправка формы
	 * */
	function sendForm() {
		var data = {url:$("#url").val(), method:getMethod()/*,errDebug:1*/}, key, val, len = 0, req;
		$(".argname").each(
			function (i, inp) {
				key = $.trim(inp.value);
				if (key.length) {
					val = $(inp).parents("tr").find("input")[1].value;
					if ($.trim(val)) {
						data[key] = val;
						len++;
					}
				}
			}
		);
		$("#loader").slideDown(500);
		$("#output").slideUp(500);
		$("#iSubmit").attr("disabled", true);
		req = $.ajax({
			url  : window.location.href,
			data : data,
			dataType:"json",
			type:"post"
		});
		//req.done( function(data) {onSuccess(data)}); //done ????? никогда!!
		//req.fail ????? всегда!
		req.complete(function(data) {onComplete(data)});
	}
	/**
	 * @desc Получить выбраный метод http запроса
	 * @return String method
	 * */
	function getMethod() {
		return ( $("#iPost").prop("checked") ? "post" : "get");
	}
	/**
	 * @desc Обработка успешного ответа от сервера
	 * */
	function onSuccess(data) {
		if (data.remoteErrorStatus != 200) {
			$("#output").removeClass("bg-light-green").addClass("bg-rose").html("Ошибка выполнения http запроса:<br>Код ошибки " + data.remoteErrorStatus + "<br>Текст ошибки " + data.remoteErrorText);
			return;
		}
		var s = data.html, i, q = '';
		try {
			s = $.parseJSON(s);
			for (i in s) {
				q += addDt(i, s[i]);
			}
			s = '<dl>' + q  + '</dl>';
		} catch(e) {;}
		console.log(s);
		$("#output").addClass("bg-light-green").removeClass("bg-rose").html(s);
	}
	/**
	 * @desc Используется при форматировании ответа сервера в json формате
	 * */
	function addDt(defineName, defineValue) {
		return ('<dt>' + defineName + '</dt><dd>' + defineValue + '</dd>');
	}
	/**
	 * @desc Обработка ответа от сервера
	 * */
	function onComplete(data) {
		$("#loader").slideUp(500);
		var text = data.statusText, status = data.status;
		if (status == 200) {
			onSuccess(data.responseJSON);
		} else {
			onError(data);
		}
		$("#output").slideDown("100%");
		$("#iSubmit").attr("disabled", false);
	}
	
	/**
	 * @desc Ошибка при запросе к серверу на котором лежит это приложение 
	 * */
	function onError(err) {
		var text = err.statusText, status = err.status;
		$("#output").removeClass("bg-light-green").addClass("bg-rose").html("<b>Это ошибка запросу к скрипту на</b> " + window.location.href + ".<br>Ошибка выполнения http запроса:<br>Код ошибки " + status + "<br>Текст ошибки " + text);
	}
	/**
	 * @desc ПРоверка, введен ли коректный url
	 * */
	function validateURL() {
		var s = $("#url").val(),
			re = new RegExp("^https?\\:\\/\\/");
		if (!re.test(s)) {
			return false;
		}
		return true;
	}
	/**
	 * @desc ПРоверка, на правильность именн аргуменотв
	 * */
	function validateArgsOnSubmit() {
		var errorsArgName = [], re, L = 'я', M = 'а', v;
		$(".argname").each(
			function (i, inp) {
				v = $.trim(inp.value);
				if (v.length == 0) {
					return;
				}
				re = /^[\D][a-zA-Z0-9_]+$/;
				if (!re.test(v)) {
					errorsArgName.push("Параметр " + (i + 1));
				}
			}
		);
		if (errorsArgName.length) {
			if (errorsArgName.length == 1) {
				M = 'и';
				L = 'е';
			}
			showError("Пол" + L + "\n" + errorsArgName.join(', ') + "\nсодерж" + M + "т недопустимые символы.\nВы можете использовать цифры, латинские буквы и знак подчеркивания");
			return false;
		}
		return true;
	}
	/**
	 * @desc А здесь можно будет что-то красивое и эффектное сделать при желании
	 * */
	function showError(s) {
		alert(s);
	}
})(jQuery)
