(
	function () {
		window.onload = onReady;
		function $(i) {return document.getElementById(i);}
		function $$(m, i) {return m.getElementsByTagName(i);}
		window.App = {}
		
		/**
		 * @desc Устанавливаю обработчики и делаю кнопку submit 
		 * доступной для отправки
		 * **/
		function onReady() {
			$("msgform").onsubmit = validateInputs;
			$("body").onkeydown = $("body").onkeyup = stripTags;
			$("email").onkeyup =  uniqueEmailValidate;
			$("sub").disabled = false;
		}
		/**
		 * @desc Валидация
		 **/
		function validateInputs() {
			if ( noEmptyValidate()
			     && emailValidate()
			     && uniqueEmailValidate()
			   ) {
				   stripTags();
				   return true;
			} else {
				return false;
			}
		}
		/**
		 * @desc проверка на совпадение email
		 * @return bool true если валиден
		 **/
		function uniqueEmailValidate() {
			var arr = $("emailList").innerHTML.split(','), xhr, i;
			for (i = 0; i < arr.length; i++) {
				if (arr[i] == $("email").value) {
					showDuplicateEmailError();
				}
			}
			if (window.App.emailRequestSended) {
				$("sub").disabled = false;
				return;
			}
			xhr = new XMLHttpRequest();
			$("sub").disabled = true;;
			xhr.onreadystatechange = function () {
				if (this.readyState == 4) {
					if (this.status == 200) {
						onUniqueEmailData(this.responseText);
					} else {
						onUniqueEmailRequestFail();
					}
				} else {
					onUniqueEmailRequestFail();
				}
			}
			window.App.emailRequestSended = true;
			xhr.open("POST", window.location.href);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send("email=" + encodeURIComponent($("email").value) + "&action=checkEmail");
		}
		/**
		 * @desc Обработка удачного аякс запроса уникальности email
		 **/
		function onUniqueEmailData(data) {
			window.App.emailRequestSended = false;
			$("sub").disabled = false;
			try {
				data = JSON.parse(data);
			} catch(e) {
				return;
			}
			var email = data.email,
			    isDuplicate = data.isDuplicate;
			if (isDuplicate) {
				showDuplicateEmailError();
			} else {
				var arr = $("emailList").innerHTML.split(',');
				arr.push(email);
				$("emailList").innerHTML = arr.join(',');
			}
		}
		/***/
		function showDuplicateEmailError() {
			alert("Такой email уже существует");
		}
		/**
		 * @desc Обработка неудачного аякс запроса уникальности email
		 **/
		function onUniqueEmailRequestFail() {
			window.App.emailRequestSended = false;
			$("sub").disabled = false;
		}
		/**
		 * @desc Валидация email
		 * @return bool true если валиден
		 **/
		function emailValidate() {
			var pattern = /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]{2,6}$/i,
			    email = trim($("email").value);
			if (!pattern.test(email)) {
				alert("Некорректный email");
				return false;
			} else {
				return true;
			}
		}
		/**
		 * @desc Валидация непустых полей
		 * @return bool true если валидны
		 **/
		function noEmptyValidate() {
			var email = trim($("email").value),
			    body = trim($("body").value);
			if (email.length && body.length) {
				return true;
			} else {
				alert("Поля не могут быть пустыми");
				return false;
			}
		}
		
		function trim(s) {
			return s.replace(/\s+$/g, '').replace(/^\s+/g, '');
		}
		/**
		 * @dewc Вырезаем все html теги при попытке их ввести и при отправке
		 * */
		function stripTags() {
			var body = trim($("body").value);
			var re = /<[^>]+>/mig;
			if (re.test(body)) {
				/*console.log("here tag!");
				console.log(body.replace(re, ''));*/
				var pos = getCaretPosition($("body"));
				$("body").value = body.replace(re, '');
				setCaretPosition($("body"), pos);
			}
		}
		
		/**
		 * Установка позиции курсора в текстовом поле
		 * **/
		function setCaretPosition(input, pos)  {
			var doBlur = 0;
			if (input != document.activeElement) {
				doBlur = 1;
			}
			if ((!pos)&&(pos !== 0)) return;
			var f = 0;
			try {f = input.setSelectionRange;}
				catch(e){;}
			if(f) {
				input.focus();		
				try{
					input.setSelectionRange(pos,pos);
				}catch(e){
					//если находится в контейнере с style="display:none" выдает ошибку
				}
			} else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
			if (doBlur) {
				input.blur();
			}	
		}

		/**
		 * Получение позиции курсора в текстовом поле
		 * **/
		function getCaretPosition(input)  {
			var doBlur = 0;
			if (input != document.activeElement) {
				doBlur = 1;
			}
			var pos = 0;
			// IE Support
			if (document.selection) {		
				if (input.value.length == 0) return;
				input.focus ();
				var sel = document.selection.createRange ();
				sel.moveStart ('character', -input.value.length);
				pos = sel.text.length;
			}
			// Firefox support
			else if (input.selectionStart || input.selectionStart == '0'){
				pos = input.selectionStart;		
			}
			if (doBlur) {
				input.blur();
			}
			return pos;
		}
		
	} //end wrapper
) 
() 
