// ==UserScript==
// @name        AgavaTool
// @namespace   https://www.agava.com/*
// @include     https://www.agava.com/*
// @version     1
// @grant       none
// ==/UserScript==
var GATE_PWD = '******';
function e(i) {return document.getElementById(i);}

function ee(tag, parent) {
  if (!parent) {
      parent = document;
  }
  return parent.getElementsByTagName(tag);
}

function eee(tag, parent, callback) {
  var ls = ee(tag, parent), i;
  for (i = 0; i < ls.length; i++) {
     callback(ls[i]);
  }
}
function trim(s) {
	s = s.replace(/^\s+/, '');
	s = s.replace(/\s+#/, '');
	return s;
}
var w = window, d = document, b = d.body, wlh = w.location.href;

w.onload = function() {
	w.onkeypress = b.onkeypress = aviOnKeyPress;
  setInterval(()=>{
    var bd = b, ls, i, buf = [], sz;
    ls = document.getElementsByClassName('b-popups');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
    ls = document.getElementsByClassName('b-popup-overlay');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
    
    ls = document.getElementsByClassName('popup-content');
    sz = ls.length;
    for (i = sz - 1; i > -1; i--) {
      ls[i].onkeypress = aviOnKeyPress;
    }
  }, 500);
	(function(){var D=document,W=window;function $(i){if(i&&i.tagName||D==i){return i}return D.getElementById(i)}function $$(p,c){p=$(p);return p.getElementsByTagName(c)}function hasClass(obj,css){var obj=$(obj);var c=obj.className,_css=css.replace(/\-/g,"\\-"),re1=new RegExp("^\\s?"+_css+"\\s*"),re2=new RegExp("\\s+"+_css+"(\\s+[\\w\\s]*|\\s*)$");if(c==css||re1.test(c)||re2.test(c)){return true}return false}function removeClass(obj,css){obj=$(obj);var c=obj.className,re=/[0-9a-zA-Z\-_]+/gm,arr=c.match(re),i,result=[];if(arr){for(i=0;i<arr.length;i++){if(arr[i]!==css){result.push(arr[i])}}}obj.className=result.join(" ")}function addClass(obj,css){obj=$(obj);removeClass(obj,css);obj.className+=" "+css}window.getViewport=function(){var w=W.innerWidth,h=W.innerHeight;if(!w&&D.documentElement&&D.documentElement.clientWidth){w=D.documentElement.clientWidth}else{if(!w){w=D.getElementsByTagName("body")[0].clientWidth}}if(!h&&D.documentElement&&D.documentElement.clientHeight){h=D.documentElement.clientHeight}else{if(!h){h=D.getElementsByTagName("body")[0].clientHeight}}return{w:w,h:h}};W.appWindow=function(id,s,onclose,clear){var bgId="popupbg",winId="popup",current="current_wnd_content",content="appWindowPopup",tmp,winW,winH,vp=getViewport(),w=vp.w,h=vp.h;appWindowClose();W.appCloseCallback=onclose;if(!$(id)){return}if(clear){var ls=$$(id,"input"),i,lt=$$(id,"textarea");for(i=0;i<(ls.length>lt.length?ls.length:lt.length);i++){if(ls[i]&&ls[i].name!="authenticity_token"){if(ls[i].type!="checkbox"&&ls[i].type!="button"&&ls[i].type!="submit"){ls[i].value=""}else{ls[i].checked=false}}if(lt[i]){lt[i].value=""}}}$(winId).style="";$(content).style="";if(s){$("popuptitle").innerHTML=s}$(winId).style.opacity=0;removeClass(bgId,"hide");removeClass(winId,"hide");tmp=D.createElement("div");$$(D,"body")[0].appendChild(tmp);tmp.id=current;swapNodes(id,tmp);removeClass(id,"hide");removeClass(content,"scrollx");removeClass(content,"scrolly");$(content).appendChild($(id));$(id).opacity=0;winW=$(winId).offsetWidth;winH=$(winId).offsetHeight;if(winW<w&&winH<h){with($(winId).style){left=Math.round((w-winW)/2)+"px";top=Math.round((h-winH)/2)+"px"}}else{with($(winId).style){left="0px";top="0px";width="100%";height=h+"px";overflowX="scroll";overflowY="scroll"}}if($(id).offsetWidth>$(content).offsetWidth){addClass(content,"scrollx");$(content).style.maxWidth=(w-5)+"px"}if($(id).offsetHeight>(h-35)){addClass(content,"scrolly");$(content).style.maxHeight=(h-40)+"px"}with($(bgId).style){width=w+"px";height=h+"px"}$(winId).style.opacity=1;$(id).setAttribute("data-srcid",id);$(id).id="execute_block"};W.swapNodes=function(b1,b2){b1=$(b1);b2=$(b2);var t=D.createElement("i"),p1=b1.parentNode,p2=b2.parentNode;p1.replaceChild(t,b1);p2.replaceChild(b1,b2);p1.replaceChild(b2,t);delete t};window.appWindowClose=function(){var bgId="popupbg",winId="popup",current="current_wnd_content",execute="execute_block",old=$(execute);addClass(bgId,"hide");addClass(winId,"hide");if($(current)){if(old){old.id=old.getAttribute("data-srcid");swapNodes(current,old);addClass(old,"hide")}$(current).parentNode.removeChild($(current))}if(W.appCloseCallback instanceof Function){W.appCloseCallback()}};W.showLoader=function(){var bgId="loaderbg",ldId="ldrbig",vp=getViewport(),w=vp.w,h=vp.h;removeClass(bgId,"hide");with($(bgId).style){width=w+"px";height=h+"px"}removeClass(ldId,"hide");with($(ldId).style){opacity=0;left=Math.round((w-$(ldId).offsetWidth)/2)+"px";top=Math.round((h-$(ldId).offsetHeight)/2)+"px";opacity=1;position="absolute"}};W.hideLoader=function(){addClass("ldrbig","hide");addClass("loaderbg","hide")};function addResources(){addCss();addHtml()}function addCss(){var style=D.createElement("style");style.innerHTML='.hide{display:none}.popupbg{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABQSURBVFiF7c5BDYAwAACxMa3zghMc8p+GPRpCclXQ637eNX5kfh04VVgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtcJaYa2wVlgrrBXWCmuFtQ0cEALewERBRQAAAABJRU5ErkJggg==") repeat;position:fixed;width:100%;left:0;top:0;z-index:1}.adminpopup{background-color:#d7d8f3;background:linear-gradient(to bottom,#80a8d1,#478bd2);border-radius:9px 9px 0 0;border:1px solid #c3d1d7;min-width:250px;z-index:2;position:fixed;left:0;top:0;color:black;box-shadow:3px 7px 5px 0 #a0bac7}#popuptitle{float:left;font-weight:bold;margin:7px 0 0 21px;color:white}.popup-close{float:right;margin:6px 14px 0 8px;cursor:pointer}.popup-close img{width:24px;height:24px}.popup-content{background-color:white;margin:0 6px 4px 6px;overflow:hidden}.scrolly{overflow-y:scroll !important}.scrollx{overflow-x:scroll !important}.tmce{width:100%}.w700{min-width:700px}#ldrbig{position:absolute}.z6{z-index:6 !important}img.loader{z-index:7;position:fixed}.both{clear:both}';D.head.appendChild(style)}function addHtml(){s='<div class="adminpopup hide" id="popup"><div class="popup-title-area"><div id="popuptitle">..</div><div class="popup-close" id="closeOut"><img id="closeIn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASRSURBVFiF5ZfLbxNXFMZ/4xkn8fhFggQOCbFDNpUq1ATRsimq6C6ikD6QEEFABQjKpkLECv0T2kW6KFJt51VFlFUX/AVdVBWqKlh00QoECfYkTgTOy87Y49d4bhfEbiAeJ62CWPRIdzPfnfOd851zz52RhBC8SXO8UXZAAfjk7NkO4BvgA6DzNXMmgV+Am3fv3JmXPh4c3A/8AbQB+P1+ukMhHI6dFceyLOKJBJlMpvpoBehVgBGgzev18tXQEN1dXTtK/KrFZ2f5emQEXdfbgBH5rYMHvwM84evXORAMYlnWa10+r5eenh5+vXcPYLcCBFRVJRQMUiyXKZbLmKbJTp8NCVAUhWank1AwiKqqGIYRUAA6OzoolErouRwVy7J1ktV1JIcDt9tdF88bBma5jNfvt/UhOxx43W46Ozp4/OTJi1MggLVsFrNSsSfPZpkYG6OpqYnPL17E5XK9hBfyeaampsjlcly+fBmfTRCWZbGWzdYUdgCUSiXKpokQou7S19YYjcV4lkoxm0wyOT6OYRg1PG8Y/DA5SULTWFxaYnR0lHQ6beuvbJqUSqV/AjBN07Zp9EyGaDTKs+fPqVQqVCoVtLk5JsbGMAwDwzCYnJggrmk1PLW4SCwaJbOyYuvXNE1gfRBVpdkku64zGouRWlrahCVmZxkfG0MCtLm5TXhqcZHvo1GuXr1qW45aAEKIugFIQmDk81RseiOeSNg6BigUCrCe8atWvYNq466eTM2qynA4zO62tn993lt37WL4xg1Ur7cuXjXHRgXqbpRlhoeGaA8EajXeagX27OFmOIzU1GTrd1sKVFfJshgeGqI7GNySPNTVxXA4TLlBUhsVqDXhVt8Fy+k0+ULBth9qdS8WWU6ncalqw33bLoFlWRi5HLFolISmbVn7hKYRjUTIZbMN9227BFXymXh82z0Q1zQikQhZXd+yBA0VKBYKxKJRpp8+3TZ5LYhEgmgkQt4w/rsCnYEAPQcO2JJ8evIknw0M2OLdoRD7A4Gtm1BQfxLOp1J8ceUKqsvFT3fvvoRdPHeOj06cAMCtqoxPTb2EDxw/zqVLl4jXmZJVzloA2ExCgGlN48L587hVlcnbtwH48to1jh07hjY/D0B/fz8ej4dvb90C4Ozp0wyeOcO0ptX1WeWsBeBwOLCEQLLZ+zge59SpU6iqisfj4b0jR9AWFmq4trDA+0eP4nG7eZ5KMTAwwON43J57nRNAkWUZSZbJGwYtLS22Lz2amaG/v59CsUgimdyEJ5JJ3unro6W5mUczM/aZ8+KOcMgyTkVB8Xm9wjJNKbO2RqFQQFVVZFlGkjbr8XB6uqFju3rDi5NWqVQwDINiqYSwLHw+n1D2BQKpxeXlvdlslpwksbK62pBkJ0ysl3tfe3tKOdzXN/Pb/ft708vLKE4n1Ml8h9kR67fl4d7ep9JfDx/2rqbTP//+4EGbaZqYQjT8NtyO1U1BkpBlmRZFwel08u6hQ6u7/P4PJSEESysrb+u6/mO5XG5HCJfY0ACN9KjXJxsJ674vSXmnLC/4vN5zra2tf0r/+7/jvwEDrW44yW5LnAAAAABJRU5ErkJggg==" /></div></div><div class="both"></div>		<div class="popup-content" id="appWindowPopup"></div></div><div class="popupbg hide"id="popupbg"></div>';if(D.body){D.body.innerHTML=D.body.innerHTML+s}else{D.write(s)}}addResources()})();
	b.innerHTML += '<div id="reportwindow" class="hide"><form action="http://gazel.me/gate" method="POST" enctype="multipart/form-data" target="_blank">'
	+ i('Город', 'iCity') +
	i('Регион', 'iRegion') + 
  transportType() + 
  i('Заголовок', 'iTitle') +
  '<textarea id="iBody" name="iBody" style="resize:none;width:650px;height:250px" rows="5"></textarea>' +
  i('Цена', 'iPrice') +
  '<div><input type="file" id="iPhoto" name="iPhoto"></div>' +
  '<input type="hidden"  name="pwd" value="' + GATE_PWD + '">' +
  i('Телефон', 'iPhone') +
  i('Имя', 'iName') +
  '<div><img id="imPhone" src="#" ></div>' +
  '<div style="float:left"><input type="submit" name="bCheck" value="Проверить телефон"></div>' +
  '<div style="float:left"><input type="checkbox" name="nosh"  value="1"> Не перемещать</div>' +
    '<div style="float:left; padding-left:100px"><input type="submit" name="bSend" value="Сохранить"></div>' +
    '<div style="clearfix:both;"></div>' + 
  '</form></div>';
  
  e('closeOut').onclick = appWindowClose;
	e('closeIn').onclick = appWindowClose;
}
function aviOnKeyPress(evt) {
	if(evt.code == 'KeyC' && evt.ctrlKey) {
		createExportForm();
	}
}

function createExportForm() {
	//var ls = d.getElementsByClassName();
  closeAborigen();
  appWindow('reportwindow', 'Hello', function(){});
  e('popup').style['z-index'] = 3*1000;
  e('iCity').value = getSelectedText(e('region'));
  e('iRegion').value = e('region').options[1].text;
  e('iTitle').value = d.getElementsByClassName('title-info-title-text')[0].innerText;
  var iBodyRaw = d.getElementsByClassName('item-description-text')[0];
  iBodyRaw = iBodyRaw ? iBodyRaw : d.getElementsByClassName('item-description-html')[0];
  e('iBody').value = iBodyRaw.innerHTML;
  normalizeIBody();
  var priceData = d.getElementsByClassName('js-item-price')[0];
  e('iPrice').value = priceData && priceData.innerText ? priceData.innerText : '1';
  e('iName').value = d.getElementsByClassName('seller-info-name')[0].innerText.trim();
  var imageWrapper = d.getElementsByClassName('item-phone-button_with-img')[0];
  var image = imageWrapper.getElementsByTagName('img')[0];
  e('imPhone').setAttribute('src', image.getAttribute('src'));
  normalizeIPrice();
}
function normalizeIPrice() {
  var s = e('iPrice').value, i, inTag, q = '', ch;
  s = s.replace(/[\s]/, '');
  i = parseInt(s);
  if (isNaN(i)) {
    i = 1;
  }
  e('iPrice').value = i;
}
function normalizeIBody() {
  var s = e('iBody').value, i, inTag, q = '', ch;
  while (~s.indexOf('<br>')) {
    s = s.replace('<br>', '\n');
  }
  for (i = 0; i < s.length; i++) {
  	ch = s.charAt(i);
    if (ch == '<') {
  		inTag = true;
		}
  	if (ch == '>') {
  		inTag = false;
  		continue;
		}
    if (!inTag)
  		q += ch;
  }
  e('iBody').value = q.trim();
}
function transportType() {
  return '<div class="right prmf">\
				<input name="people" id="people" value="1" type="checkbox"> <label for="people">Пассажирская</label>				<input name="box" id="box" value="1" type="checkbox"> <label for="box">Грузовая</label>				<input name="term" id="term" value="1" type="checkbox"> <label for="term">Термобудка</label>				<input name="far" id="far" value="1" type="checkbox"> <label for="far">Межгород</label>				<input name="near" id="near" value="1" type="checkbox"> <label for="near">По городу</label>				<input name="piknik" id="piknik" value="1" type="checkbox"> <label for="piknik">За город (пикник)</label>			</div>';
}
//========libs=====
function i(labelText, id) {
  return '<div><label>' + labelText + '</label><input name="' + id + '" id="' + id +'"></div>';
}
function getSelectedText(sel) {
	if (!sel || !sel.tagName == 'SELECT') {
		return '';
	}
	var o = getOptionByValue(sel, sel.value);
	if (o && o.text) {
		return o.text;
	}
	return '';
}
function getOptionByValue(select, n) {
	var i, ls = select.getElementsByTagName('option');
	for (i = 0; i < ls.length; i++) {
		if ( ls[i].value == n ) {
			return ls[i];
		}
	}
	return null;
}

function closeAborigen(){
  var bd = document.getElementsByTagName('body')[0], ls, i, buf = [], sz;
  ls = document.getElementsByClassName('b-popups');
  sz = ls.length;
  for (i = sz - 1; i > -1; i--) {
    ls[i].parentNode.removeChild(ls[i]);
  }
  ls = document.getElementsByClassName('b-popup-overlay');
  sz = ls.length;
  for (i = sz - 1; i > -1; i--) {
    ls[i].parentNode.removeChild(ls[i]);
  }
  bd.classList.remove('popup-locked-scroll');
}
