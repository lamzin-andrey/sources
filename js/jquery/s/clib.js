'use strict';
/** Здесь сейчас общия для двух тем оформления код.
 *  Связанный с особенностями темы оформления для темы modern в js/modern/lib.js
 * 											  для темы standart js/lib.js
*/

window.AppACMEWebLibrary = {
/** @property обозначения валют */
_currencies:{
	'RUR'  : '<i class="currency"></i>',
	'USD'  : '$',
	'BYN'  : 'BYN',
	'EUR'  : '<span class="fa fa-euro"></span>',
	'UAH'  : '<span style="font-size:16px">&#8372;</span>',
	'KZT'  : '<span style="font-size:16px">&#8376;</span>',
	'THB'  : '<span style="font-size:16px">&#3647;</span>',
	'KZT'  : '<span style="font-size:16px">&#8376;</span>'
},
/**
 * @description Индексирует массив по указанному полю
 * @param {Array} data
 * @param {String} id = 'id'
*/
indexBy: function (data, id, debug) {
	if (data && data.isIndexedObject) {
		return data;
	}
	id = id ? id : 'id';
	var i = 0, r = {order:[]}, j;
	
	/*$(data).each(function(i, j){
		if (j && j[id]) {
			r[j[id]] = j;
			r.order.push(j[id]);
		}
	});*/
	
	
	if (data instanceof Array) {
		for (i = 0; i < data.length; i++) {
			j = data[i];
			if (j && j[id]) {
				r[j[id]] = j;
				r.order.push(j[id]);
			}
		}
	} else if (data instanceof Object) {
		for (i in data) {
			j = data[i];
			if (j && j[id]) {
				r[j[id]] = j;
				r.order.push(j[id]);
			}
		}
	}
	
	r.isIndexedObject = 1;
	return r;
},
/**
 * @description Индексирует массив по указанному полю
 * @param {Array} data
 * @param {String} id = 'id'
 * @return {Object};
*/
storage:function(key, data) {
	var L = window.localStorage;
	if (L) {
		if (data === null) {
			L.removeItem(key);
		}
		if (!(data instanceof String)) {
			data = JSON.stringify(data);
		}
		if (!data) {
			data = L.getItem(key);
			if (data) {
				try {
					data = JSON.parse(data);
				} catch(e){;}
			}
		} else {
			L.setItem(key, data);
		}
	}
	return data;
},
/**
 * @description аналог php $_SERVER[REQUEST_URI]
 * @param {Boolean} base = falseif true return only part before '?'
 * @return {String};
*/
REQUEST_URI:function(base) {
	var s = window.location.href;
	s = s.replace(this.HTTP_HOST(s), '');
	if (base) {
		s = s.split('?')[0].split('#')[0];
	}
	return s;
},
/**
 * @description аналог php $_SERVER[HTTP_HOST]
 * @return String
*/
HTTP_HOST:function(s, cutScheme) {
	if (!s) {
		s = window.location.href;
	}
	s = s.split('/').slice(0, 3).join('/');
	if (cutScheme) {
		if (~s.indexOf('http://')) {
			s  = s.replace('http://', '');
		}
		if (~s.indexOf('https://')) {
			s  = s.replace('https://', '');
		}
	}
	return s;
},
/**
 * @description Средство установки переменной по умолчанию в TRUE
 * @return {String};
*/
True:function(val) {
	val = String(val) === 'undefined' ? true : val;
	return val;
},
/**
 * @description Получить значение GET переменной из url
 * @return {String};
*/
_GET: function(v, def, search) {
    if (!def) def = null;
    var s = window.location.href, buf = [], val, map = {};
    s = search ? search : s;
    while (s.indexOf(v + '[]') != -1) {
		val = this._GET(v  + '[]', def, s);
		if (!map[val]) {
			buf.push( decodeURIComponent(val) );
			map[val] = 1;
		}
		s = s.replace(v + '[]=' + val, '');
	}
	if (buf.length) {
		return buf;
	}
    var st = s.indexOf("?" + v + "=");
    if (st == -1) st = s.indexOf("&" + v + "=");
    if (st == -1) return def;
    var en = s.indexOf("&", st + 1);
    if ( en == -1 ) {
        return s.substring( st + v.length + 2);
    }
    return s.substring( st + v.length + 2, en );
},
/**
 * @description Размер вьюпорта
 * @return {String};
*/
getViewport: function() {
	var W = window, D = document, w = W.innerWidth, h = W.innerHeight;
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
},
/**
 * 
*/
isChrome:function() {
	return (window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1);
},
pagination:function ($page, $totalItems, $perPage, $itemInLine, $prevLabel, $nextLabel) {
	
	$itemInLine = $itemInLine  ? $itemInLine : 10;
	$prevLabel = $prevLabel  ? $prevLabel : '<';
	$nextLabel = $nextLabel  ? $nextLabel : '>';
	var $p = +$page, $maxpage, $maxnum, $start, $end, $o, $data, $i,
	    $k = 0, $isFirstPage = false;

	$maxpage = $maxnum = Math.ceil($totalItems / $perPage);
	if ($maxnum <= 1) {
		return [];
	}
	$start = $p - 1;
	$start = $start < 1 ? 1 : $start;
	$end = $p + $itemInLine;
	
	if ($end > $maxnum) {
		$end = $maxnum;
		$start = $end - $itemInLine;
		$start = $start < 1 ? 1 : $start;
	}
	
	$data = [];
		
	if ($start > 2) {
		$o = {};
		$o.n = 1;
		$data[$k] = $o;
		$k++;
		$isFirstPage = true;
		$start++;
	}
	if ($start > 1) {
		$o = {};
		$o.n = $start - 1;
		$o.text = $prevLabel;
		$data[$k] = $o;
		$k++;
	}
	for ($i = $start; $i <= $end; $i++) {
		$o = {};
		$o.n = $i;
		if ($i == $p) {
			$o.active = 1;
		}
		$data[$k] = $o;
		$k++;
	}
	if ($end + 1 < $maxnum) {
		$o = {};
		$o.n = $end + 1;
		$o.text = $nextLabel;
		$data[$k] = $o;
		$k++;
	}
	if ($end != $maxnum) {
		$o = {};
		$o.n = $maxnum;
		$data[$k] = $o;
		$k++;
	}
	return $data;
},
getCurrenciesArray:function() {
	if (AppACME && AppACME.currenciesMap) {
		return AppACME.currenciesMap;
	}
	var arr =  this._currencies;
	arr['rur'] = arr['RUR'];
	arr['TMM'] = trans('messages.tmm');
	arr['KGS'] = trans('messages.kgs');
	arr['SOM'] = trans('messages.sum');
	return arr;
},
pluralize: function($n, $root, $one, $less4, $more19) {
	var $m, $lex, $r, $i;
	$m = strval($n);
	if (strlen($m) > 1) {
		$m =  intval( $m[ strlen($m) - 2 ] + $m[ strlen($m) - 1 ] );
	}
	$lex = $root + $less4;
	if ($m > 20) {
		$r = strval($n);
		$i = intval( $r[ strlen($r) - 1 ] );
	   if ($i == 1) {
			$lex = $root + $one;
		} else {
			if ($i == 0 || $i > 4) {
			   $lex = $root + $more19;
			}
		}
	} else if ($m > 4 || $m == '00'|| $m == '0') {
		$lex = $root + $more19;
	} else if ($m == 1) {
		$lex = $root + $one;
	}
	return $lex;
},
unlock:function(xpath){
	if ($(xpath).data('position')) {
		$(xpath).css('position', $(xpath).data('position') );
	}
	$(xpath + ' .prelocker').remove();
},
/**
 * @param {$Object} container контейнер, в который добавляют новые свойства
 * @param {String} tag имя тега - шаблона, содержащего css tpl 
 * @param {Array} config Конфигурация, что на что заменять, элемент массива - объект {key, val}, key- placeholder (можно RegExp) в шаблоне, val - имя поля в элементе массиве data  или функция, в которую будет передан элемент данных и $Object шаблона (itemData, $oTpl, nK:номер_в списке)
 * @param {Array} data Массив элементов
 * @param {Boolean} clearContainer = true Флаг указывает, что надо очистить контейнер
 * @param {String} targetCss необязательный параметр, для более точного поиска элементов в контейнере. Если не передан, то вместо него используется tag
 * @param {String} tplCss
 * @param {$Object} oTemplate - шаблон html кода. Если передан, то шаблон не ищется  в контейнере
*/
render:function(container, tag, config, data, clearContainer, targetCss, tplCss, oTemplate) {
	clearContainer = this.True(clearContainer);
	targetCss = String(targetCss) == 'undefined' ? false : targetCss;
	tplCss = String(tplCss) == 'undefined' ? '.tpl' : tplCss;
	var selector = (targetCss ? targetCss : tag), 
		oTpl = ( oTemplate ? oTemplate : container.find(selector + tplCss).first() ),
		addTpl = tplCss.replace('.', ''),
		css = String( oTpl.attr('class') ).replace(addTpl, ''),
		tpl = oTpl.html(),
		s, i, it, j, newItem, k
	;
	if (!tpl) {
		return;
	}
	if (clearContainer) {
		container.find(selector).each(function(i, j){
			if (!$(j).hasClass(addTpl)) {
				$(j).remove();
			}
		});
	}
	k = 0;
	for (i in data) {
		it = data[i];
		s = tpl;
		for (j = 0; j < config.length; j++ ) {
			if (config[j].val instanceof Function) {
				s = s.replace(config[j].key, config[j].val(it, oTpl, k));
			} else {
				s = s.replace(config[j].key, it[ config[j].val ] );
			}
		}
		newItem = $('<' + tag + ' class="' + css + '">' + s + '</' + tag + '>');
		newItem = this.processTemplateImg(newItem);
		container.append(newItem);
		k++;
	}
},
/**
 * @description	Возвращает элемент sel со значением атрибута value = val
 * @param {HTMLSelect} sel
 * @param {String} val
 * @return HTMLOptionElement | Null
*/
__getOptionByValue:function(sel, val) {
	var ls = sel.getElementsByTagName('option'), i;
	for (i = 0; i < ls.length; i++) {
		if ($(ls[i]).attr('value') == val) {
			return ls[i];
		}
	}
	return null;
},
/**
 * @description	Возвращает элемент sel со значением текстового содержимого = val
 * @param {HTMLSelect} sel
 * @param {String} val
 * @return HTMLOptionElement | Null
*/
__getOptionByText:function(sel, val) {
	var ls = sel.getElementsByTagName('option'), i;
	for (i = 0; i < ls.length; i++) {
		if ($(ls[i]).text() == val) {
			return ls[i];
		}
	}
	return null;
},

/**
 * @description Устанавливает переменную в строке link. Заменяет в строке вида base?=a=v1&b=v2&c=v3 значение переменной varName. Если переменной нет, добавляет ее. 
 * @param {String } value может иметь значение CMD_UNSET, тогда переменная будет удалена
 * @param {Boolean} $checkByValue = false если true то наличие в ссылке переменной проверяется не по имени, а по имени и значению
 * @param {String} $unsetValue  = '' при  $checkByValue =  true && value == CMD_UNSET содержит значение, которое надо удалить (будет удалена строка varName=$unsetValue)
 * 
*/
setGetVar:function(link, varName, value, $checkByValue, $unsetValue) {
	value = decodeURIComponent(value);
	$checkByValue = String($checkByValue) == 'undefined' ? false : $checkByValue;
	$unsetValue = String($unsetValue) == 'undefined' ? '' : $unsetValue;
	$unsetValue = decodeURIComponent($unsetValue);
	link = decodeURIComponent(link);
	
	var sep = '&', arr = link.split('?'), base = arr[0], tail = arr[1], cmdUnset = 'CMD_UNSET', $searchStr;
	if (!tail) {
		sep = '';
		tail = '';
	}
	$searchStr = $checkByValue ? (varName + '=' + (value != cmdUnset ? value : $unsetValue)  ) : (varName + '=');
	if (!~tail.indexOf($searchStr)) {
		if (value != cmdUnset) {
			tail += sep + varName + '=' + value;
		}
	} else {
		if (value != cmdUnset) {
			if (!$checkByValue) {
				tail = tail.replace(new RegExp(varName + '=[^&]*'), varName + '=' + value);
			}
		} else {
			if (!$checkByValue) {
				varName = varName.replace('[', '\\[');
				varName = varName.replace(']', '\\]');
				tail = tail.replace(new RegExp(varName + '=[^&]*', 'g'), '').replace(/&&/g, '&').replace(/&$/, '');
				tail = tail.replace(/&$/g, '').replace(/^&/g, '');
			} else {
				tail = tail.replace(varName + '=' + $unsetValue, '');
				tail = tail.replace(/&&/g, '&');
				tail = tail.replace(/&$/g, '').replace(/^&/g, '');
			}
		}
	}
	link = tail ? (base + '?' + tail) : base;
	return link;
},
/**
 * @descripion Возвращает HTMLOptionElement атрибут value которого равен n
 * @param {HTMLSelectElement} select
 * @param {String} n
 * @return {HTMLOptionElement} | {Null}
*/
getOptionByValue:function(select, n) {
	var i, ls = select.getElementsByTagName('option');
	for (i = 0; i < ls.length; i++) {
		if ( ls[i].value == n ) {
			return ls[i];
		}
	}
	return null;
},
/**
 * @descripion Возвращает HTMLOptionElement текстовое содержимое которого равно n
 * @param {HTMLSelectElement} select
 * @param {String} n
 * @return {HTMLOptionElement} | {Null}
*/
getOptionByText:function(select, n) {
	n = $.trim(n);
	n = n.replace(/&gt;/g, '>');
	n = n.replace(/&lt;/g, '<');
	var i, ls = select.getElementsByTagName('option'), text;
	for (i = 0; i < ls.length; i++) {
		text = $.trim(ls[i].text );
		text = text.replace(/&gt;/g, '>');
		text = text.replace(/&lt;/g, '<');
		if ( text == n ) {
			return ls[i];
		}
	}
	return null;
},
getSelectedText:function(sel) {
	if (!sel || !sel.tagName == 'SELECT') {
		return '';
	}
	var o = this.getOptionByValue(sel, sel.value);
	if (o && o.text) {
		return o.text;
	}
	return '';
},
/**
 * @description Выделяет элемент выпадающего списка по его value
 * @return {Boolean} если удалось найти такое значение и выделить, true
*/
selectByValue:function (g, v) {
	for (var i = 0; i < g.options.length; i++) {
		if (g.options[i].value == v) {
			g.options[i].selected = true;
			g.selectedIndex = i;
			return true;
		}
	}
	return false;
},
/**
 * @description Выделяет элемент выпадающего списка по его text
 * @return {Boolean} если удалось найти такое значение и выделить, true
*/
selectByText:function (g, v) {
	for (var i = 0; i < g.options.length; i++) {
		if (g.options[i].text == v) {
			g.options[i].selected = true;
			g.selectedIndex = i;
			return true;
		}
	}
	return false;
},

/**
 * @description Проверяет, не надо ли добавить еще элементов
*/
checkAutoloadItems:function() {
	var b = document.body, w = $(b), o = AppACME.Orders,
		L = document.getElementsByTagName('main')[0].offsetHeight, dYScroll = 0;
	if (!L) {
		L = document.body.clientHeight -  AppACMEWebLibrary.getViewport().h;
	}
	if (!$('footer').height()) {
		dYScroll = 139;
	}
	if(window.scrollY >= L - 700 - dYScroll) {
		if (AppACME.ShopCatNavigator.isMobileSliderShow) {
			return;
		}
		//console.log('L = ' + L + ', Y = ' + window.scrollY);
		if (!o.autoloadProcess) {
			o.autoloadProcess = 1;
			setTimeout(function(){
				o.currentPage = o.currentPage ? o.currentPage + 1 : +AppACMEWebLibrary._GET('page', 1);
				if (o.previousAutoloadPage && o.previousAutoloadPage >= o.currentPage) {
					return;
				}
				if (AppACME.linkListener instanceof Function) {
					try {
						o.previousAutoloadPage = o.currentPage;
						AppACME.linkListener();
					} catch(e) {;}
				}
				//o.autoloadProcess = 0;
			}, 100);
		}
	}
},
/**
 * @description Сравнивает две строки без учета дефисов, пробелов и прочих знаков препинания
*/
isCmpStrings: function($s1, $s2) {
	$s1 = this._removeDisallowSymbols($s1);
	$s2 = this._removeDisallowSymbols($s2);
	return ( strtolower($s1) ==  strtolower($s2));
},
/**
 * @description Удаляет из строк все символы не буквы и не цифры
*/
_removeDisallowSymbols:function($s) {
	var $lS, $allow, $sz, $r, $i, $ch;
	$lS = mb_strtolower($s, 'UTF-8');
	$allow = 'abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';
	$sz = mb_strlen($s, 'UTF-8');
	$r = '';
	for ($i = 0; $i < $sz; $i++) {
		$ch = mb_substr($lS, $i, 1, 'UTF-8');
		if(mb_strpos($allow, $ch) !== false) {
			$r += mb_substr($s, $i, 1, 'UTF-8');
		}
	}
	return $r;
},
transliteUrl:function($string) {
	var $allow, $sz, $r, $i,  $ch;
	$string = str_replace("ё","e",$string);
	$string = str_replace("й","i",$string);
	$string = str_replace("ю","yu",$string);
	$string = str_replace("ь","",$string);
	$string = str_replace("ч","ch",$string);
	$string = str_replace("щ","sh",$string);
	$string = str_replace("ц","c",$string);
	$string = str_replace("у","u",$string);
	$string = str_replace("к","k",$string);
	$string = str_replace("е","e",$string);
	$string = str_replace("н","n",$string);
	$string = str_replace("г","g",$string);
	$string = str_replace("ш","sh",$string);
	$string = str_replace("з","z",$string);
	$string = str_replace("х","h",$string);
	$string = str_replace("ъ","",$string);
	$string = str_replace("ф","f",$string);
	$string = str_replace("ы","i",$string);
	$string = str_replace("в","v",$string);
	$string = str_replace("а","a",$string);
	$string = str_replace("п","p",$string);
	$string = str_replace("р","r",$string);
	$string = str_replace("о","o",$string);
	$string = str_replace("л","l",$string);
	$string = str_replace("д","d",$string);
	$string = str_replace("ж","j",$string);
	$string = str_replace("э","e",$string);
	$string = str_replace("я","ya",$string);
	$string = str_replace("с","s",$string);
	$string = str_replace("м","m",$string);
	$string = str_replace("и","i",$string);
	$string = str_replace("т","t",$string);
	$string = str_replace("б","b",$string);
	$string = str_replace("Ё","E",$string);
	$string = str_replace("Й","I",$string);
	$string = str_replace("Ю","YU",$string);
	$string = str_replace("Ч","CH",$string);
	$string = str_replace("Ь","",$string);
	$string = str_replace("Щ","SH",$string);
	$string = str_replace("Ц","C",$string);
	$string = str_replace("У","U",$string);
	$string = str_replace("К","K",$string);
	$string = str_replace("Е","E",$string);
	$string = str_replace("Н","N",$string);
	$string = str_replace("Г","G",$string);
	$string = str_replace("Ш","SH",$string);
	$string = str_replace("З","Z",$string);
	$string = str_replace("Х","H",$string);
	$string = str_replace("Ъ","",$string);
	$string = str_replace("Ф","F",$string);
	$string = str_replace("Ы","I",$string);
	$string = str_replace("В","V",$string);
	$string = str_replace("А","A",$string);
	$string = str_replace("П","P",$string);
	$string = str_replace("Р","R",$string);
	$string = str_replace("О","O",$string);
	$string = str_replace("Л","L",$string);
	$string = str_replace("Д","D",$string);
	$string = str_replace("Ж","J",$string);
	$string = str_replace("Э","E",$string);
	$string = str_replace("Я","YA",$string);
	$string = str_replace("С","S",$string);
	$string = str_replace("М","M",$string);
	$string = str_replace("И","I",$string);
	$string = str_replace("Т","T",$string);
	$string = str_replace("Б","B",$string);
	$string = str_replace(" ","_",$string);
	$string = str_replace('"',"",$string);
	$string = str_replace('.','',$string);
	$string = str_replace(',','',$string);
	$string = str_replace("'","",$string);
	$string = str_replace(",",'',$string);
	$string = str_replace('\\', '', $string);
	$string = str_replace('?', '', $string);
	$string = str_replace('/', '_', $string);
	$string = str_replace('&', 'and', $string);
	$allow = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	$string =  strtolower($string);
	$sz = strlen($string);
	$r = '';
	for ($i = 0; $i < $sz; $i++) {
		$ch = $string.charAt($i);
		if (~$allow.indexOf($ch)) {
			$r += $ch;
		}
	}
	return $r;
},
/**
 * @description Для каждой ссылки в jQuery объекте $nope имеющей data-href переписывает его значение в href если href="#"
 * @param {jQuery Object} $node
*/
processTemplateLinks:function($node) {
	$node.find('a').each(function(i, a){
		if (a.hasAttribute('data-href') && a.hasAttribute('href') && a.getAttribute('href') == '#') {
			a.setAttribute('href', a.getAttribute('data-href') );
		}
	});
	return $node;
},
/**
 * @description Выводит отформатированную дату 
 * @param {String} $r дата в формате Y-m-d H:i:s
 * @param {Boolean} $breakTime если true то в результате обрезается время
*/
formatDate : function($r, $breakTime, $useShortYear, $useToday) {
    var $a, $_d, $d, $t, $fmt, $now;
    $breakTime = String($breakTime) == 'undefined' ? false : $breakTime;
    $useShortYear = String($useShortYear) == 'undefined' ? false : $useShortYear;
    $useToday = String($useToday) == 'undefined' ? true : $useToday;
    
    
    $a = explode(" ", $r);
    $_d = $d = isset($a, "0") ? $a[0] : null;
    $t = isset($a, "1") ? $a[1] : null;
    $d = explode("-", $d);
    if ($useShortYear) {
        $d[0] = mb_substr(trim($d[0]), 2, 2);
    }
    $d = join('.', array_reverse($d));
    
    $t = explode(":", $t);
    $t.splice(2,1);
    $r = $d;
    
    $fmt = 'Y-m-d H:i:s';
    $now = explode(' ', date($fmt));
    $now = $now[0];
    
    if ($_d == $now && $useToday) {
        $r = trans('messages.today');
    }
    
    if (!$breakTime) {
    	$r += '<span>';
        $r += ' ' + trans('messages.time_at') + ' ' + join(':', $t);
        $r += '</span>';
    }
    return $r;
},
restreq:function(method, data, onSuccess, url, onFail){
	$('#preloader').show();
	$('#preloader').width(screen.width);
	$('#preloader').height(screen.height);
	$('#preloader div').css('margin-top', Math.round((screen.height - 350) / 2) + 'px');
	
	if (!url) {
		url = window.location.href;
	}
	url = this.setGetVar(url, 'csrfisold', 'CMD_UNSET');
	if (!onFail) {
		onFail = function(){
			AppACME.Messages.fail(__('messages.Default_fail'));
		};
	}
	switch (method) {
		case 'put':
		case 'patch':
		case 'delete':
			break;
	}
	$.ajax({
		method: method,
		data:data,
		url:url,
		dataType:'json',
		success:onSuccess,
		error:onFail
	});
},
_get:function(onSuccess, url, onFail) {
	AppACMEWebLibrary.restreq('get', {}, onSuccess, url, onFail);
},
/**
 * convert from php code here http://php2js.ru/translate_php_function/to_js_function.html
 * @description Разбивает блитнное число по порядкам пробелами
 * @param
 * @return
**/
formatNumber:function($n) {
	var $s, $a, $i, $b, $c;
	$n = intval($n);
	if ($n < 9999) {
		return strval($n);
	}
	$s = strval($n);
	$a = [];
	for ($i = 0; $i < strlen($s); $i++) {
		$a.push($s[$i]);
	}
	$a = array_reverse($a);
	$b = [];
	$c = [];
	for ($i = 0; $i < count($a); $i++) {
		$b.push($a[$i]);
		$c.push(1);
		if (count($c) > 2) {
			$b.push(' ');
			$c = [];
		}
	}
	$a = array_reverse($b);
	return join('', $a);
},
/**
 * @description Удаляет из массива пустые элементы if (!item)
 * @param  {Array} a 
 * @return {Array}
*/
removeEmptyItems:function(a){
	if (!(a instanceof Array)) {
		return a;
	}
	var i, j, b = [];
	for (i = 0; i < a.length; i++) {
		j = a[i];
		if (j) {
			b.push(j);
		}
	}
	return b;
},
fixSelectedSelect:function() {
	var ls = $('select'), i, c, j, o, sIndex;
	for (i = 0; i < ls.length; i++) {
		c = ls[i];
		//console.log(c);
		if (!c.options) {
			continue;
		}
		for (j = 0; j < c.options.length; j++) {
			o = c.options[j];
			if (o.hasAttribute('selected')) {
				if (o.value) {
					//console.log('select by value "' + o.value + '"');
					this.selectByValue(c, o.value);
				} else {
					//console.log('select by text "' + o.text + '"');
					this.selectByText(c, o.text);
				}
				break;
			}
		}
	}
},
redirectFromRecoveryLinkPage:function() {
	if (this.REQUEST_URI(1) == '/recoverylink') {
		setTimeout(function(){
			window.location.href = '/';
		}, 5 * 1000);
	}
},
capitalize:function(s) {
	if (!s) return s;
	var ch = s.charAt(0), uch = ch.toUpperCase();
	return s.replace(ch, uch);
},
/**
 * @description устанвливает многточие в многострочном тексте если он не помещается в область
 * @param {String} селектор элемента, текст в котором обрезаем
 * 
*/
setEllipsis:function(xpath) {
	var ls = $(xpath), i, j, mH, s = 'max-height', h, t, ov = 'overflow';
	for (i = 0; i < ls.length; i++) {
		j = $(ls[i]);
		if (!mH) {
			mH = parseInt(j.css(s));
		}

		if (mH) {
			t = j.text();
			j.css(s, 'none');
			j.css(ov, 'auto');
			h = j[0].offsetHeight;

			while (h > mH) {
				t = t.replace(/\.\.\.$/m, '');
				t = t.substring(0, t.length - 2) + '...';
				if (!t.trim()) {
					break;
				}
				j.text(t);
				h = j[0].offsetHeight;
			}
		}
		j.css('opacity', 1);
		j.css(s, mH + 'px').css(ov, 'hidden');
	}
},
/**
 * @description Заменяет input[data-tag=img] на img
*/
processTemplateImg:function(jObj){
	var hinp, img, hList, i;
	hList = jObj.find('input[data\-tag=img]');
	for (i = 0; i < hList.length; i++) {
		hinp = $(hList[i]);
		img = '<img src="' + hinp.attr('src') + '" class="' + hinp.attr('class') + '">';
		img = $(img);
		if (hinp.attr('data-onerror')) {
			img.attr('onerror', hinp.attr('data-onerror'));
		}
		if (hinp.attr('data-onload')) {
			img.attr('onload', hinp.attr('data-onload'));
		}
		if (hinp.attr('data-alt')) {
			img.attr('alt', hinp.attr('data-alt'));
		}
		hinp.after(img);
	}
	return jObj;
},
/**
 * @description {String} возвращает токен для POST отправок
*/
getToken:function() {
	var list = document.getElementsByTagName('meta'), i, t;
	for (i = 0; i < list.length; i++) {
		if ($(list[i]).attr('name') == 'app') {
			t = $(list[i]).attr('content');
			break;
		}
	}
	return t;
},
/**
 * @description Вызывается в app.js перед созданием объектов контроллеров
*/
preInit:function() {
	this.initCardPaymentSystem();
},
/**
 * @description Вызывается в app.js после создания объектов контроллеров
*/
postInit:function() {
	if ($('#csrfIsOld')[0] && parseInt($('#csrfIsOld').val(), 10)) {
	//if (parseInt(this._GET('csrfisold'), 10)) {
		var s = __('csrf_default_error');
		/*switch (this.REQUEST_URI(1)) {
			case '/cart':
			s = __('select_city_again');
		}*/
		AppACME.Messages.fail(s);
	}
},
/**
 * @description В зависимости от используемой системы оплаты создает экземпляр класса RFI 
 * 	или PAYBOX. Экземпляр класса в любом случае хранится в переменной AppACME.oRfi18
 * 
 * В зависимости от используемой темы оформления создает экземпляр класса CardPaymentDOMLibModern
 * или CardPaymentDOMLibStandart. Экземпляр класса в любом случае хранится в переменной 
 * AppACME.oCardPaymentDOMLib
 * 
*/
initCardPaymentSystem:function() {
	var f = AppACME;

	/* Это важный закоментированый кусок кода
	if (f.THEME == 'standart') {
		if (window.CardPaymentDOMLibStandart) {
			f.oCardPaymentDOMLib = new CardPaymentDOMLibStandart();
		}
	}
	if (f.THEME == 'modern') {
		if (window.CardPaymentDOMLibModern) {
			f.oCardPaymentDOMLib = new CardPaymentDOMLibModern();
		}
	}*/
	//Похоже,  что сейчас удаётся обойтись одним DOM хелпером для систем оплаты
	f.oCardPaymentDOMLib = new CardPaymentDOMLibModern();
	//когда наступят более тяжелые времена,  определим AppACME.THEME в partials/js/javascript_init_javascript_variables.blade.php для кадждой темы
	//и на основании закомментированного "Это важный закоментированиый кусок кода" выше создадим гибкую логику

	if (!f.PAYMENT_PROVIDER || f.PAYMENT_PROVIDER.trim() == '') {
		f.PAYMENT_PROVIDER = 'rfi';
	}
	if (f.PAYMENT_PROVIDER == 'rfi') {
		if (window.Rfi18) {
			f.oRfi18 = new Rfi18();
		}
	}
	if (f.PAYMENT_PROVIDER == 'paybox') {
		if (window.Paybox) {
			f.oRfi18 = new Paybox();
		}
	}
	
}
};//end Object
function extend(a,b){
	var c=new Function();
	c.prototype=a.prototype;
	b.prototype=new c();
	b.prototype.constructor=b;
	b.superclass=a.prototype;
	b.superclass.__construct = a;
}
function setAccordion() {
	var acc = document.getElementsByClassName("accordion");
	var i;
	for (i = 0; i < acc.length; i++) {
		acc[i].onclick = function(){
			this.classList.toggle("active");
			this.nextElementSibling.classList.toggle("show");
		}
	}
}
