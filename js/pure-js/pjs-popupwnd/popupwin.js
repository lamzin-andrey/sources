(
		function () {
			var D = document,
			W = window;
			function $(i) {
				if (i&& i.tagName || D == i) return i;
				return D.getElementById(i);
			}
			function $$(p, c) {
				p = $(p);
				return p.getElementsByTagName(c);
			}
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
			//getviewport
			window.getViewport = function() {
				var w = W.innerWidth, h = W.innerHeight;
				if (!w && D.documentElement && D.documentElement.clientWidth) {
					w = D.documentElement.clientWidth;
				} else if (!w) {
					w = D.getElementsByTagName('body')[0].clientWidth;
				}
				if (!h && D.documentElement && D.documentElement.clientHeight) {
					h = D.documentElement.clientHeight;
				} else if (!h) {
					h = D.getElementsByTagName('body')[0].clientHeight;
				}
				return {w:w, h:h};
			}
			/**
			 * 
			 * @param string id идентификатор блока
			 * @param string s тайтл окна
			 * @param Function onclose вызывается перед закрытием окна
			 * @param Number clear говорит о том, что поля ввода следует очистить
			 * 
			 * */
			W.appWindow = function(id, s, onclose, clear) {
			var bgId = "popupbg",
			winId = "popup",
			current = "current_wnd_content",
			content = "appWindowPopup",
			tmp,
			winW,
			winH,
			vp = getViewport(),
			w = vp.w,
			h = vp.h;
			//вызвать appWindowClose
			appWindowClose();
			W.appCloseCallback = onclose;
			if (!$(id)) {
				return;
			}
			if (clear) {
				var ls = $$(id, "input"), i, lt = $$(id, "textarea");
				for (i = 0; i < (ls.length > lt.length ? ls.length : lt.length); i++) {
					if (ls[i] && ls[i].name != "authenticity_token" ) {
						if (ls[i].type != "checkbox" && ls[i].type != "button" && ls[i].type != "submit") {
							 ls[i].value = "";
						 } else {
							 ls[i].checked = false;
						 }
					}
					if (lt[i]) {
						lt[i].value = "";
					}
				}
			}
			$(winId).style = '';
			$(content).style ='';
			if (s) {
				$("popuptitle").innerHTML = s;
			}
			//Для фона и окна  - установить opacity в ноль а видимость в истину
			$(winId).style.opacity = 0;
			removeClass(bgId, "hide");
			removeClass(winId, "hide");
			 
			//Взять заданный див.
			//Заменить его созданным дивом current_wnd_content
			tmp = D.createElement("div");
			$$(D, "body")[0].appendChild(tmp);
			tmp.id = current;
			swapNodes(id, tmp);
			//Добавить в контент попапа.
			removeClass(id, "hide");
			removeClass(content, "scrollx");
			removeClass(content, "scrolly");
			$(content).appendChild( $(id) );
			
			//Определить размер
			$(id).opacity = 0;
			
			winW = $(winId).offsetWidth;
			winH = $(winId).offsetHeight;
			//Если меньше чем у вьюпорта, установить размеры окна в авто и отцентрировать
			if (winW < w && winH < h) {
				with ($(winId).style) {
					left = Math.round((w - winW) / 2) + 'px';
					top  = Math.round((h - winH) / 2) + 'px';
				}
			} else {//Иначе установить размеры как у вьюпорта.
				with ($(winId).style) {
					left = '0px';
					top  = '0px';
					width = '100%';
					height = h + 'px';
					overflowX = 'scroll';
					overflowY = 'scroll';
				}
			}
			if ($(id).offsetWidth > $(content).offsetWidth) {
				addClass(content, "scrollx");
				$(content).style.maxWidth = (w - 5) + "px";
			}
			if ($(id).offsetHeight > (h - 35) ) {
				addClass(content, "scrolly");
				$(content).style.maxHeight = (h - 40) + "px";
			}
			//Установить opacity в 1
			with ($(bgId).style) {
				width = w + 'px';
				height = h + 'px';
			}
			$(winId).style.opacity = 1;
			$(id).setAttribute("data-srcid", id);
			$(id).id = "execute_block";
		}
		W.swapNodes = function(b1, b2) {
			b1 = $(b1);
			b2 = $(b2);
			var t = D.createElement("i"),
			p1 = b1.parentNode, p2 = b2.parentNode;
			p1.replaceChild(t, b1);
			p2.replaceChild(b1, b2);
			p1.replaceChild(b2, t);
			delete t;
		}
		W.appWindowClose = function() {
			var bgId = "popupbg",
			winId = "popup",
			current = "current_wnd_content",
			execute = "execute_block",
			old = $(execute);
			//сделать невидимыми фон и окно
			//removeClass(bgId, "hide");
			//removeClass(winId, "hide");
			addClass(bgId, "hide");
			addClass(winId, "hide");
			//Если существует на странице див с идентификатором current_wnd_content
			if ($(current)) {
				//взять див с айди execute_block, получить его атрибут srcid, заменить его значением id 
				if (old) {
					old.id = old.getAttribute("data-srcid");
					//и заменить эти дивом current_wnd_content, 
					swapNodes(current, old);
					//не забыв сделать невидимым
					addClass(old, "hide");
				}
				//удалить див current_wnd_content
				$(current).parentNode.removeChild($(current));
			}
			if (W.appCloseCallback instanceof Function) {
				W.appCloseCallback();
			}
		}
		
		W.showLoader = function() {
			var bgId = "loaderbg",
				ldId = "ldrbig",
				vp = getViewport(),
				w = vp.w,
				h = vp.h;
			
			removeClass(bgId, "hide");
			with ($(bgId).style) {
				width = w + 'px';
				height = h + 'px';
			}
			removeClass(ldId, "hide");
			with ($(ldId).style) {
				opacity = 0;
				left = Math.round((w - $(ldId).offsetWidth) / 2) + 'px';
				top  = Math.round((h - $(ldId).offsetHeight) / 2) + 'px';
				opacity = 1;
				position = 'absolute';
			}
		}
		W.hideLoader = function() {
			addClass("ldrbig", "hide");
			addClass("loaderbg", "hide");
		}
		
		function addResources() {
			addCss();
			addHtml();
		}
		function addCss() {
			var style = D.createElement('style');
			style.innerHTML = '.hide{display:none}.popupbg{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABQSURBVFiF7c5BDYAwAACxMa3zghMc8p+GPRpCclXQ637eNX5kfh04VVgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtQ0cEALewERBRQAAAABJRU5ErkJggg==") repeat;position:fixed;width:100%;left:0;top:0;z-index:1}.adminpopup{background-color:#d7d8f3;background:linear-gradient(to bottom,#80a8d1,#478bd2);border-radius:9px 9px 0 0;border:1px solid #c3d1d7;min-width:250px;z-index:2;position:fixed;left:0;top:0;color:black;box-shadow:3px 7px 5px 0 #a0bac7}#popuptitle{float:left;font-weight:bold;margin:7px 0 0 21px;color:white}.popup-close{float:right;margin:6px 14px 0 8px;cursor:pointer}.popup-close img{width:24px;height:24px}.popup-content{background-color:white;margin:0 6px 4px 6px;overflow:hidden}.scrolly{overflow-y:scroll !important}.scrollx{overflow-x:scroll !important}.tmce{width:100%}.w700{min-width:700px}#ldrbig{position:absolute}.z6{z-index:6 !important}img.loader{z-index:7;position:fixed}.both{clear:both}';
			D.head.appendChild(style);
		}
		function addHtml() {
			s = '<div class="adminpopup hide" id="popup"><div class="popup-title-area"><div id="popuptitle">..</div><div class="popup-close" id="awcCloseOut"><img id="awcCloseIn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASRSURBVFiF5ZfLbxNXFMZ/4xkn8fhFggQOCbFDNpUq1ATRsimq6C6ikD6QEEFABQjKpkLECv0T2kW6KFJt51VFlFUX/AVdVBWqKlh00QoECfYkTgTOy87Y49d4bhfEbiAeJ62CWPRIdzPfnfOd851zz52RhBC8SXO8UXZAAfjk7NkO4BvgA6DzNXMmgV+Am3fv3JmXPh4c3A/8AbQB+P1+ukMhHI6dFceyLOKJBJlMpvpoBehVgBGgzev18tXQEN1dXTtK/KrFZ2f5emQEXdfbgBH5rYMHvwM84evXORAMYlnWa10+r5eenh5+vXcPYLcCBFRVJRQMUiyXKZbLmKbJTp8NCVAUhWank1AwiKqqGIYRUAA6OzoolErouRwVy7J1ktV1JIcDt9tdF88bBma5jNfvt/UhOxx43W46Ozp4/OTJi1MggLVsFrNSsSfPZpkYG6OpqYnPL17E5XK9hBfyeaampsjlcly+fBmfTRCWZbGWzdYUdgCUSiXKpokQou7S19YYjcV4lkoxm0wyOT6OYRg1PG8Y/DA5SULTWFxaYnR0lHQ6beuvbJqUSqV/AjBN07Zp9EyGaDTKs+fPqVQqVCoVtLk5JsbGMAwDwzCYnJggrmk1PLW4SCwaJbOyYuvXNE1gfRBVpdkku64zGouRWlrahCVmZxkfG0MCtLm5TXhqcZHvo1GuXr1qW45aAEKIugFIQmDk81RseiOeSNg6BigUCrCe8atWvYNq466eTM2qynA4zO62tn993lt37WL4xg1Ur7cuXjXHRgXqbpRlhoeGaA8EajXeagX27OFmOIzU1GTrd1sKVFfJshgeGqI7GNySPNTVxXA4TLlBUhsVqDXhVt8Fy+k0+ULBth9qdS8WWU6ncalqw33bLoFlWRi5HLFolISmbVn7hKYRjUTIZbMN9227BFXymXh82z0Q1zQikQhZXd+yBA0VKBYKxKJRpp8+3TZ5LYhEgmgkQt4w/rsCnYEAPQcO2JJ8evIknw0M2OLdoRD7A4Gtm1BQfxLOp1J8ceUKqsvFT3fvvoRdPHeOj06cAMCtqoxPTb2EDxw/zqVLl4jXmZJVzloA2ExCgGlN48L587hVlcnbtwH48to1jh07hjY/D0B/fz8ej4dvb90C4Ozp0wyeOcO0ptX1WeWsBeBwOLCEQLLZ+zge59SpU6iqisfj4b0jR9AWFmq4trDA+0eP4nG7eZ5KMTAwwON43J57nRNAkWUZSZbJGwYtLS22Lz2amaG/v59CsUgimdyEJ5JJ3unro6W5mUczM/aZ8+KOcMgyTkVB8Xm9wjJNKbO2RqFQQFVVZFlGkjbr8XB6uqFju3rDi5NWqVQwDINiqYSwLHw+n1D2BQKpxeXlvdlslpwksbK62pBkJ0ysl3tfe3tKOdzXN/Pb/ft708vLKE4n1Ml8h9kR67fl4d7ep9JfDx/2rqbTP//+4EGbaZqYQjT8NtyO1U1BkpBlmRZFwel08u6hQ6u7/P4PJSEESysrb+u6/mO5XG5HCJfY0ACN9KjXJxsJ674vSXmnLC/4vN5zra2tf0r/+7/jvwEDrW44yW5LnAAAAABJRU5ErkJggg==" /></div></div><div class="both"></div>		<div class="popup-content" id="appWindowPopup"></div></div><div class="popupbg hide"id="popupbg"></div>';
			if (D.body) {
				D.body.innerHTML = D.body.innerHTML + s;
			} else {
				D.write(s);
			}
			$("awcCloseOut").onclick=appWindowClose;
			//$("awcCloseIn").onclick=appWindowClose;
		}
		addResources();
	} //end anonim function
)
();
