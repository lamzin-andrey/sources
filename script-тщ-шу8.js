(
	function () {
		var 
		/*========== Переменные для данной области видимости глобальные*/
		/*локализация @see lang.js*/
		T = PureJsCalendar.Locale,
		/*признак инпута, который надо сделать календарем*/
		CALENDAR = 'pjs-calendar',
		/*формат*/
		FORMAT = "d.m.Y";
		/*==========Конфиг CSS календаря использующихся для идентификации элементов в js (удобно, когда есть заранее неизвестная верстка) =============*/
		WRAPPER = 'pc-wrapper',
		ICON        = 'pc-icon',
		SET        = 'pc-set',
		BTN_PREV_YEAR = 'pc-yleft',
		BTN_NEXT_YEAR = 'pc-yright',
		BTN_PREV_MONTH = 'pc-mleft',
		BTN_NEXT_MONTH = 'pc-mright',
		ACTIVE_DAY = 'pc-a',
		NO_CURRENT_MONTH_DAY = 'pc-ina',
		MONTH_STRING = 'pc-m',
		YEAR_STRING = 'pc-y',
		ERROR_MESSAGE = 'pc-error',
		ERROR_BORDER = 'pc-border-error',
		SELECTED_DAY = 'pc-select-day',
		/*========== Псевдонимы для часто использующихся переменных*/
		D = document,
		W = window,
		URL = W.location.href;
		/*========== Инициализация*/
		if (W.attachEvent) {
			W.attachEvent("onload", onDomReady);
		} else {
			W.addEventListener("DOMContentLoaded", onDomReady, false);
		}
		function addEvent(obj, event, listener) {
			if (obj.attachEvent) {
				obj.attachEvent("on" + event, listener);
			} else {
				obj.addEventListener(event, listener, false);
			}
		}
		function $(i) {
			if (i.tagName || D == i) return i;
			return D.getElementById(i);
		}
		function hasClass(obj, css) {
			var c = obj.className, _css = css.replace(/\-/g, "\\-"), 
			re1 = new RegExp("^\\s?" + _css + "\\s*"), 
			re2 = new RegExp("\\s+" + _css + "(\\s+[\\w\\s]*|\\s*)$");
			if (c == css || re1.test(c) || re2.test(c)) {
				return true;
			}
			return false;
		}
		function $$(p, t, c) {
			p = $(p);
			if (!c) {
				return p.getElementsByTagName(t);
			} else {
				var ls = p.getElementsByTagName(t), arr = [], i;
				for (i = 0; i < ls.length; i++) {
					if (hasClass(ls[i], c)) {
						arr.push(ls[i]);
					}
				}
				return arr;
			}
		}
		function onDomReady() {
			PureJsCalendar.list = [];
			var ls = $$(D, "input", CALENDAR), i, node;
			for (i = 0; i < ls.length; i++) {
				PureJsCalendar.append(ls[i]);
			}
		}
		/*========== Функции манипуляции календарями из внешнего JS кода =============*/
		PureJsCalendar.append = function(input) {
			PureJsCalendar.list.push( {id:input.id, obj:new CPureJsCalendar(input)} );
		}
		
		/*========== Определение класса календаря =============*/
		function CPureJsCalendar(input) {
			var v = input.value, ls, bMonthLeft, bMonthRight, bYearLeft, bYearRight, calendarSet, self = this;
			this.qDay = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			//public:
			/**
			 * @desc Если удалось распарсить sDate устанавливает в сетке и инпутах эту дату
			 *       иначе устанавливает в сетке текущую
			 *Допустимы последовательности 
					 1|2, 1|2, 2|4
					 2|4, 1|2, 1|2
					 1|2, имя_месяца, 2|4
					 2|4, имя_месяца, 1|2
					 1|2, имя_месяца, 1|2
					 
			 * @param String sDate дата в строковом формате
			**/
			CPureJsCalendar.prototype.setDate = function(sDate) {
				var nums = String(sDate).match(/\d+/g), i, isValid = 1, y = 0, m = 0, d = 0, monthRoot, 
				dt = new Date(), currentDay = dt.getDate(), currentMonth = dt.getMonth() + 1, currentYear = dt.getFullYear();
				if (nums && L(nums)) {
					if (L(nums) == 3) {
						m = nums[1];
						if (L(nums[0]) == 4 && L(nums[2]) == 4) {
							isValid = 0;
						}
						if (isValid) {
							y = L(nums[0]) == 4 ? nums[0] : (L(nums[2]) == 4 ? nums[2] : 0);
							if (y == 0) {
								L(nums[2]) == 2 ? nums[2] : (L(nums[0]) == 2 ? nums[0] : 0);
							}
							d = L(nums[0]) == 2 ? nums[0] : (L(nums[2]) == 2 ? nums[2] : 0);
						}
					} else if (L(nums) == 2) {
						if (L(nums[0]) == 4 && L(nums[1]) == 4) {
							isValid = 0;
						}
						if (isValid) {
							y = L(nums[0]) == 4 ? nums[0] : (L(nums[1]) == 4 ? nums[1] : 0);
							if (y == 0) {
								L(nums[1]) == 2 ? nums[1] : (L(nums[0]) == 2 ? nums[0] : 0);
							}
							d = L(nums[0]) == 2 ? nums[0] : (L(nums[1]) == 2 ? nums[1] : 0);
						}
						if (isValid) {
							for (i = 1; i < L(T.MONTHS); i++) {
								monthRoot = T.MONTHS[i].substring(0, L(T.MONTHS[i]) - 1);
								if (sDate.indexOf(monthRoot) != -1) {
									m = i;
								}
							}
						}
					} else {
						d = nums[0];
					}
				}
				/* У нас ничего нет - ставим текущую дату */
				if (y == 0 && d == 0 && m == 0) {
					_setDate(currentDay, currentMonth, currentYear, currentDay, currentMonth, currentYear);
				}
				/* У нас есть год? - ставим год */
				if (y > 0 && d == 0 && m == 0) {
					_setDate(currentDay, currentMonth, y, currentDay, currentMonth, currentYear);
				}
				/* У нас есть год и месяц, - ставим год месяц */
				if (y > 0 && m > 0 && d == 0) {
					_setDate(currentDay, m, y, currentDay, currentMonth, currentYear);
				}
				/* У нас есть полная дата - ставим полную дату*/
				if (y > 0 && m > 0 && d > 0) {
					_setDate(d, m, y, currentDay, currentMonth, currentYear);
					//TODO записать в инпуты
					this.displayInput.value = _format(d, m, y);
					this.hiddenInput.value = _format(d, m, y, "Y-m-d");
				}
			}
			
			/**
			 * @desc Обработка клика на кнопке "предыдущий месяц"
			**/
			CPureJsCalendar.prototype.prevYear = function() {
				_changeYear(-1);
			}
			/**
			 * @desc Обработка клика на кнопке "следующий месяц"
			**/
			CPureJsCalendar.prototype.nextYear = function() {
				_changeYear(1);
			}
			/**
			 * @desc Обработка клика на кнопке "предыдущий месяц"
			**/
			CPureJsCalendar.prototype.prevMonth = function() {
				_changeMonth(-1);
			}
			/**
			 * @desc Обработка клика на кнопке "следующий месяц"
			**/
			CPureJsCalendar.prototype.nextMonth = function() {
				_changeMonth(1);
			}
			/*код конструктора */
			
			node = D.createElement("div");
			node.className = WRAPPER;
			node.innerHTML = _createTpl(input);
			input.parentNode.replaceChild(node, input);	
			this.input = node;
			ls = $$(node, "input");
			this.displayInput = ls[0];
			this.hiddenInput  = ls[1];
			this._set = calendarSet = $$(node, "table")  [0];
			this._set.onclick = function(){ return false;}
			this.setDate(v);
			bYearLeft     = $$(node, "img", BTN_PREV_YEAR)  [0];
			bYearRight    = $$(node, "img", BTN_NEXT_YEAR) [0];
			bMonthLeft    = $$(node, "img", BTN_PREV_MONTH)  [0];
			bMonthRight   = $$(node, "img", BTN_NEXT_MONTH) [0];
			bCalendarIcon = $$(node, "div", ICON)   [0];
			
			bYearLeft.onclick = this.prevYear;
			bYearRight.onclick = this.nextYear;
			
			bMonthLeft.onclick = this.prevMonth;
			bMonthRight.onclick = this.nextMonth;
			
			bCalendarIcon.onclick = _toggleCalendar;
			
			this.displayInput.onfocus = _showCalendar;
			this.displayInput.onkeydown = _resetDate;
			
			//private:
			/**
			 * @desc Переустановка даты при наборе ее в поле ввода
			**/
			function _resetDate(event) {
				console.log(event.keyCode);
				if ( event.keyCode > 34 && event.keyCode < 41 ) {
					return true;
				}
				setTimeout(
					function () {
						self.setDate( self.displayInput.value );
					}
					,1
				);
				
			}
			/**
			 * @desc Изменение месяца на n
			**/
			function _changeMonth(n) {
				var currentDateCell = $$(self._set, "td", SELECTED_DAY)[0], aDate = [], qDay = self.qDay;
				if (_validEngDate(currentDateCell, aDate)) {
					aDate[1] = parseInt(aDate[1]) + n;
					if (aDate[1] > 12) {
						aDate[1] = 1;
						aDate[0]++;
					}
					if (aDate[1] < 1) {
						aDate[1] = 12;
						aDate[0]--;
					}
					_normalizeDate(aDate, qDay);
					self.setDate(aDate[0] + "-" + aDate[1] + '-' +  aDate[2]);
				}
			}
			/**
			 * @desc Изменение года на n
			**/
			function _changeYear(n) {
				var currentDateCell = $$(self._set, "td", SELECTED_DAY)[0], aDate = [], qDay = self.qDay;
				if (_validEngDate(currentDateCell, aDate)) {
					aDate[0] = parseInt(aDate[0]) + n;
					if (aDate[0] < 1) {
						aDate[0] = 10000;
					}
					_normalizeDate(aDate, qDay);
					self.setDate(aDate[0] + "-" + aDate[1] + '-' +  aDate[2]);
				}
			}
			/**
			 * @desc Нормализация даты, чтобы не было 31 февраля и т п
			**/
			function _normalizeDate(aDate, qDay) {
				if (qDay[ parseInt(aDate[1]) ] < parseInt(aDate[2]) ) {
					aDate[2] = qDay[ aDate[1] ];
				}
				if (aDate[1] == '02' && aDate[2] == 29) {
					if (!_leapYear(aDate[0]) ) {
						aDate[2] = 28;
					}
				}
			}
			/**
			 * @desc Проверка, валидно ли введена дата, также заполняет массив oDate 
			**/
			function _validEngDate(currentDateCell, oDate) {
				if (currentDateCell) {
					var sDate = currentDateCell.getAttribute("data-date"), aDate = [];
					if (sDate) {
						aDate = sDate.split("-");
						if (aDate.length == 3) {
							oDate[0] = aDate[0];
							oDate[1] = aDate[1];
							oDate[2] = aDate[2];
							return true;
						}
					}
				}
				return false;
			}
			/**
			 * @desc Показать скрыть календарь
			**/
			function _toggleCalendar() {
				self._set.style.display = self._set.style.display == "block" ? null : "block";
			}
			/**
			 * @desc Скрыть календарь
			**/
			function _hideCalendar() {
				self._set.style.display = null;
			}
			/**
			 * @desc Показать календарь
			**/
			function _showCalendar() {
				self._set.style.display = "block";
			}
			/**
			 * @desc Вернуть строку в сткроковом формате
			 * Использует константу FORMAT или аргумент format
			 * Понимает
			 * dmYyF
			**/
			function _format(d, m, y, format) {
				var f = format?format:FORMAT,
					s = f.replace('d', d < 10 ? '0' + parseInt(d): d);
				s = s.replace('m', m < 10 ? '0' + parseInt(m): m);
				s = s.replace('Y', y);
				s = s.replace('y', String(y).substring(0, 2));
				s = s.replace('F', T.MONTHS2[m]);
				return s;
			}
			function _setDate(d, m, y, currentDay, currentMonth, currentYear) {
				m = parseInt(m);
				d = parseInt(d);
				var cells = $$(self._set, "td"), i, start, dt = new Date(y, m - 1, 1), offset = dt.getDay(), j, k = 0,
				    qDay  = self.qDay, nextMonth = m + 1, nextYear = y;
				if (_leapYear(y)) {
					qDay[2] = 29;
				} else {
					qDay[2] = 28;
				}
				if (offset == 0) offset = 7;
				//offset -= 1;
				start = offset == 1 ? 17 : 10 + offset - 1;
				if (nextMonth > 12) {
					nextMonth = 1;
					nextYear++;
				}
				for (i = start, j = 1; i < L(cells); i++, j++) {
					cells[i].className = cells[i].className.replace(SELECTED_DAY, '').replace(ACTIVE_DAY, '').replace(NO_CURRENT_MONTH_DAY, '');
					cells[i].innerHTML = (j <= qDay[m] ? j : ++k);
					cells[i].onclick = _onMouseSelectDate;
					if (j > qDay[m]) {
						cells[i].className = NO_CURRENT_MONTH_DAY;
						cells[i].setAttribute("data-date", _format(k, nextMonth, nextYear, "Y-m-d"));
					} else if(currentDay == j && currentMonth == m && currentYear == y){
						cells[i].className = ACTIVE_DAY;
						if(d == j){
							cells[i].className += ' ' + SELECTED_DAY;
						}
					} else if(d == j){
						cells[i].className = SELECTED_DAY;
					}
					
					if (j <= qDay[m]) {
						cells[i].setAttribute("data-date", _format(j, m, y, "Y-m-d"));
					}
				}
				$$(self._set, "span", MONTH_STRING)[0].innerHTML = T.MONTHS[m];
				$$(self._set, "span", YEAR_STRING)[0].innerHTML = y;
				if (m - 1 < 1) {
					y--;
					m = 12;
					if (_leapYear(y)) {
						qDay[2] = 29;
					} else {
						qDay[2] = 28;
					}
				}
				m--;
				
				for (i = start - 1, j = 0; i > 9; i--, j++) {
					cells[i].className = cells[i].className.replace(SELECTED_DAY, '').replace(ACTIVE_DAY, '').replace(NO_CURRENT_MONTH_DAY, '');
					cells[i].innerHTML = qDay[m] - j;
					cells[i].className = NO_CURRENT_MONTH_DAY;
					cells[i].setAttribute("data-date", _format(qDay[m] - j, m, y, "Y-m-d"));
					cells[i].onclick = _onMouseSelectDate;
				}
			}
			function _onMouseSelectDate() {
				self.setDate(this.getAttribute('data-date'));
			}
			function _createTpl(inp) {
				var i, j, Set = '', s, row;
				for (i = 0; i < 6; i++) {
					row = '';
					for (j = 0; j < 7; j++) {
						row += '<td></td>';
					}
					Set += '<tr>' + row + '</tr>';
				}
				s = tpl.replace('{set}', Set).replace(/\{id\}/g, inp.id).replace(/\{name\}/g, inp.name).replace('{value}', inp.value);
				return s;
			}
			function L(o) {
				return o.length;
			}
			function _leapYear(year) {
				year = Number(year);
				var r = false,
					y = year;
				if (y % 4 == 0) {
					if (y % 100 == 0){
						if (y % 400 == 0) return true;
							return false;
						}			
					return true;
				}
				return false;
			}
		}
		
		
			
			
		/*========== конец Определение класса календаря =============*/
		
		/*========== Шаблон html (@see CPureCalendar::createTpl)=============*/
		var tpl = '<input type="text" class="pjs-calendar pc-left" id="{id}" name="{name}" value="{value}"/><input type="hidden" id="pc-calindar-{id}" name="pc-calindar-{name}"/>\
<div class="pc-left ' + ICON + '">\
	<img src="/js/pjs-calendar/icon.png" />\
</div>\
<div class="pc-clear"></div>\
<table class="' + SET + '">\
	<tr class="' + ERROR_MESSAGE + '">\
		<td colspan="7"></td>\
	</tr>\
	<tr class="pc-year">\
		<td colspan="7">\
			<img src="/js/pjs-calendar/left.png" class="' + BTN_PREV_YEAR + '"/><span class="' + YEAR_STRING + '">2014</span><img src="/js/pjs-calendar/right.png" class="' + BTN_NEXT_YEAR + '"/>\
		</td>\
	</tr>\
	<tr class="pc-month">\
		<td colspan="7">\
			<img src="/js/pjs-calendar/left.png" class="' + BTN_PREV_MONTH + '"/><span class="' + MONTH_STRING + '">Сентябрь</span><img src="/js/pjs-calendar/right.png" class="' + BTN_NEXT_MONTH + '"/>\
		</td>\
	</tr>\
	<tr class="pc-week">\
		<td>' + T.MONDAY + '</td>\
		<td>' + T.TUESDAY + '</td>\
		<td>' + T.WEDNESDAY + '</td>\
		<td>' + T.THURSDAY + '</td>\
		<td>' + T.FRIDAY + '</td>\
		<td>' + T.SATURDAY + '</td>\
		<td>' + T.SUNDAY + '</td>\
	</tr>\
	{set}\
</table>';
	}
)()
