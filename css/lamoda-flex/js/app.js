(
	function () {
		//utils
		var ua = navigator.userAgent.toLowerCase(), ieVersion, D = document, W = window;
		function $(i) {
			if (i&& i.tagName || D == i) return i;
			return D.getElementById(i);
		}
		function $$(p, t) { p = $(p); return p.getElementsByTagName(t); }
		function sz(o) {return (o&&o.length? o.length : 0)}
		function hasClass(obj, css) {
			var obj = $(obj);
			var c = obj.className, _css = css.replace(/\-/g, "\\-"), 
			re1 = new RegExp("^\\s?" + _css + "\\s*"), 
			re2 = new RegExp("\\s+" + _css + "(\\s+[\\w\\s]*|\\s*)$");
			if (c == css || re1.test(c) || re2.test(c)) {
				return true;
			}
			return false;
		}
		function removeClass(obj, css) {
			obj = $(obj);
			var c = obj.className, re = /[0-9a-zA-Z\-_]+/gm,
			arr = c.match(re),
			i, result = [];
			if (arr) for (i = 0; i < arr.length; i++) {
				if (arr[i] !== css) {
					result.push(arr[i]);
				}
			}
			obj.className = result.join(' ');
		}
		function addClass(obj, css) {
			obj = $(obj);
			removeClass(obj, css);
			obj.className += ' ' + css;
		}
		//onready
		/**
		 * @desc Патчим плейсхолдер и background у nav, header для ie < 10
		 * **/
		function patchHtml5Features() {
			if (ua.indexOf("msie") != -1) {
				ieVersion = parseInt(ua.replace(/.*msie[\w\s]+([0-9]{1,2})\..*/, '$1'));
				var list, headerList, sectionList, limit, i;
				//патч плейсхолдера для ie < 10
				if (ieVersion && ieVersion < 10) {
					list = $$(D, "input");
					for (i = 0; i < sz(list); i++) {
						if (list[i].type == "text"  && list[i].hasAttribute('placeholder')) {
							list[i].onfocus = 'clearPlaceholder()';
							list[i].onblur = 'setPlaceholder()';
							W.setPlaceholder( {target:list[i]} );
						}
					}
				}
				//добавляю бэкграунд у nav и header для ie < 9
				if (ieVersion && ieVersion < 9) {
					 list = $$(D, 'nav');
					 headerList = $$(D, 'header');
					 limit = sz(list) > sz(headerList) ? sz(list) : sz(headerList);
					 for (i = 0; i < limit; i++) {
						 if (i < sz(list)) {
							 replaceOnDiv(list[i]);
						 }
						 if (i < sz(headerList)) {
							 replaceOnDiv(headerList[i]);
						 }
					 }
				}
			}
		}
		
		if (W.attachEvent) {
			W.attachEvent("onload", patchHtml5Features);
			W.attachEvent("onload", initLangSelect);
		} else if (W.addEventListener) {
			W.addEventListener("DOMContentLoaded", initLangSelect, false);
		}
		/**
		 * @desc Меняю для IE < 9 nav, header (иначе бэкграунд не бэкграунд) на div @see patchHtml5Features
		 * **/
		function replaceOnDiv(htmlNode) {
			var p = htmlNode.parentNode,
				div = D.createElement('div');
				div.className = htmlNode.className;
				div.id = htmlNode.id;
				div.innerHTML = htmlNode.innerHTML;
				p.replaceChild(div, htmlNode);
		}
		/**
		 * @desc Для IE < 10 устанавливаю текст из плейсхолдера принудительно @see patchHtml5Features
		 * **/
		W.setPlaceholder = function(e) {
			if (String(e) == "undefined") {
				e = W.event;
			}
			var inp = e.target ? e.target : e.srcElement;
			if (!sz(inp.value)) {
				inp.value = inp.getAttribute('placeholder');
			}
		}
		/**
		 * @desc Для IE < 10 устанавливаю текст из плейсхолдера принудительно  @see patchHtml5Features
		 * **/
		W.clearPlaceholder = function() {
			var inp = W.event.srcElement;
			if (inp.value == inp.getAttribute('placeholder')) {
				inp.value = '';
			}
		}
		/**
		 * @desc Устанавливаю обработку события клика на выборе языка в меню
		 * **/
		function initLangSelect() {
			var langBtn = $("selectLang"),
				dropdown = $$(langBtn, "ul")[0],
				i;
			function toggleDropdown() {
				if (hasClass(dropdown, "hide")) {
					removeClass(dropdown, "hide");
				} else {
					addClass(dropdown, "hide");
				}
				return false;
			}
			langBtn.onclick = toggleDropdown;
		}
	}//end anoim function
)
()
