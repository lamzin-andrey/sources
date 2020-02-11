// ==UserScript==
// @name        KillTroll
// @namespace   https://otvet.mail.ru*
// @include     https://otvet.mail.ru/*
// @include     https://touch.otvet.mail.ru/*
// @include     https://andryuxa.ru/*
// @include     http://mh.loc/*
// @version     1
// @grant       none
// ==/UserScript==

//minify with https://www.minifier.org/

/**
 * TODO
 * Пишем главную страницу TrollTech (FF only) и завершаем это дело.
 *  - Видео.
 *  
 * 
 * Упоминаем про этот прикольный заголовок, который в FF почему-то не работает. (а стоит ли?)
 * 
 * Там ещё заголовок скоро починят и для FF
 * 
 * 19 08 2019 Есть крайне неприятная запись в tk_userinfo - всё пусто кроме uid но uid типа правильный
 *
 * 
*/
//window.addEventListener('DOMContentLoaded', onReady); это не надо потому что ни при каком раскладе не работает
window.addEventListener('load', onReady);

//Desktop css
window.containerCss = 'pageQuestions';
window.itemCss = 'q--li';
window.userLinkCss = 'q--li--stat';
window.userLinkCssOnAnswerPage = "author a--author";
window.authUserAvatarLinkCss = 'pm-toolbar__button__inner_avatar';

//Mobile css
window.touchAuthUserAvatarLinkCss = 'nav-menu__profile';


window.CONTAINER = null;
window.KEY = 'KKTSTRGDATA';
window.KEY_SHARED = 'KKTSTRGDATA_MERGED';
window.SERVER_HOST = 'https://andryuxa.ru';
//window.SERVER_HOST = 'http://mh.loc';
window.SERVER = window.SERVER_HOST + '/p/trollkiller';

window.desktopAuthUserImageLoaded = false;
window.desktopAuthUserImage64data = '';


function onReady(){
	console.log('Run');
	if (!isDesktop()) {
		window.authUserAvatarLinkCss = window.touchAuthUserAvatarLinkCss;
	}
	/*if (location.host == 'touch.otvet.mail.ru') {
		ee(D, 'body')[0].innerHTML = 'Hello!';
		return;
	}*/

  /*
   * Это не надо, потому что history API и DOMContentLoaded не работает все равно (контейнер пуст)
   * if (window.KillTrollIsInit) {
    return;
  }
  window.KillTrollIsInit = true;*/
  if (location.host.indexOf('otvet.mail.ru') == -1) {
	storage('killtroll', 1);
	return;
  }

  //addStyle();
  setLinkListener();
  killTrolls();

  //check auth
  pureAjax(window.SERVER + '/checkauth.jn/', {}, (dt)=>{
	if (dt.uid) {
		onSuccessLogin(dt);
		getBanlist();
		setInterval(getBanlist, 120*1000);
	} else {
		window.KTKTUID = 0;
		storage('ktktUid', 0);
		setAuthView(false);
	}
  }, (a, b, c) => {
  }, 'POST');
  
  
  setInterval(() => {
	  setLinkListener();
	  killTrolls();
  }, 1*1000);/**/

  parseDesktopImage();
}


function killTrolls(){
	var list = getSharedListFromStorage();
	list = count(list) ? list : getListFromStorage();

	//Delete on strip page
	try {
		var c = getContainer();
		e4(c, userLinkCss, (item) => {
			var href = attr(item, 'href');
			if (list[href]) {
				var quest = item.parentNode.parentNode;
				quest.parentNode.removeChild(quest);
			}
		});
	} catch(e){;}
  
	//Delete on answers page
	try {
		e4(ee(D, 'body')[0], userLinkCssOnAnswerPage, (item) => {
			var href = attr(item, 'href');
			if (list[href]) {
				var quest = item.parentNode.parentNode;
			}
				quest.parentNode.removeChild(quest);
		});
	} catch(e){;}

	//Delete comments on answer page
	try {
		e4(ee(D, 'body')[0], 'h5', (item) => {
			var href = attr(item, 'href');
			if (href.indexOf('/profile/id') != -1 && list[href]) {
				var comm = item.parentNode.parentNode;
				var prnt = comm.parentNode;
				if (comm.className.indexOf('com--new') != -1) {
					prnt.removeChild(comm);
				}
			}
		});
	} catch(e){;}

	//TOUCH
	var imgList = indexByImg(list);
	//Delete on touch strip page
	try {
		e4(ee(D, 'body')[0], 'user-pic-default', (item) => {
			var url = getBgImageSUrl(item),
				name = item.parentNode.getElementsByClassName('user-name__text')[0];
				name = name.innerHTML ? name.innerHTML.trim() : '';
			if (imgList[url] && name == imgList[url].name) {
				var comm = item.parentNode.parentNode.parentNode;
				var prnt = comm.parentNode;
				if (comm.className == 'item ') {
					prnt.removeChild(comm);
				}
			}
		});
	} catch(e){;}

	//Delete on touch answers page
	try {
		e4(ee(D, 'body')[0], 'item__header__user-large', (item) => {
			var href = attr(item, 'href');
			if (list[href]) {
				var quest = item.parentNode.parentNode;
				quest.parentNode.removeChild(quest);
			}
		});
	} catch(e){
	};
}
/**
 * @description Установить для всех ссылок на профили пользователя  наш обработчик
*/
function setLinkListener() {
	//DESKTOP
	//desktop question page
  try {
    var c = getContainer();
    e4(c, userLinkCss, (item) => {
      var setted = attr(item, 'data-ktktsetted');
      if (!setted && attr(item, 'href').indexOf('/profile/id') == 0) {
        attr(item, 'data-ktktsetted', '1')
		item.onclick = onClickUserlink;
		item.style.color = '#00AA00';
      }

    });
  } catch(e){;}
  
	//on answer page
	try {
		e4(ee(D, 'body')[0], userLinkCssOnAnswerPage, (item) => {
			var setted = attr(item, 'data-ktktsetted');
			if (!setted) {
				attr(item, 'data-ktktsetted', '1')
				item.onclick = onClickUserlink;
				item.style.color = '#00AA00';
			}

		});
	} catch(e){;}
	//on comment page
	try {
		e4(ee(D, 'body')[0], 'h5', (item) => {
			var setted = attr(item, 'data-ktktsetted');
			var href = attr(item, 'href');
			if (!setted && href.indexOf('/profile/id') != -1) {
				attr(item, 'data-ktktsetted', '1')
				item.onclick = onClickUserlink;
				item.style.color = '#00AA00';
			}

		});
	} catch(e){;}

	//TOUCH
	//on touch answer page
	//item__header__child item__header__user item__header__user-large
	try {
		e4(ee(D, 'body')[0], 'item__header__user-large', (item) => {
			var setted = attr(item, 'data-ktktsetted');
			var href = attr(item, 'href');
			if (!setted && href.indexOf('/profile/id') != -1) {
				attr(item, 'data-ktktsetted', '1')
				item.onclick = onClickUserlink;
				var namelinks = cs(item, 'b-block user-name__text');
				if (namelinks[0]) {
					namelinks[0].style.color = '#00AA00';
				}
			}
		});
	} catch(e){;}
}
function getContainer() {
	window.CONTAINER = ec(ee(D, 'body')[0], window.containerCss)[0];
	return window.CONTAINER;
}
/**
 * @description Клик на сылке  с именем пользователя
*/
function onClickUserlink(e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	var o = e.target, name = o.innerHTML, link = attr(o, 'href'), 
		sImgUrl = '', aPicTagList;
	// for answer page
	if (!link) {
		link = attr(o.parentNode, 'href')
	}
	// / for answer page

	//for touch answer page
	if (!link) {
		while (!o || (o.tagName != 'A') ) {
			o = o.parentNode;
		}
		if ((o.tagName == 'A')) {
			link = attr(o, 'href')
		}
	}
	//get image url
	if (link) {
		aPicTagList = cs(o, 'user-pic-default');
		sImgUrl = getBgImageSUrl(aPicTagList[0]);
	}
	// / for touch answer page
	  

  	
	ktModal(name, link, sImgUrl);
	return false;
}

function ktModal(name, link, imgLink) {
	
	//TODO for touch parse z-index b-header
	window.onClickCloseKtDlg = function() {
		var r = e('ktKTDlg');
		r.parentNode.removeChild(r);
		r = e('ktktBg');
		r.parentNode.removeChild(r);
	}
	window.onClickBanBtn = function() {
		var nAMailId = link.replace(/[\D]/g, ''), occ = {'620174': 1};
		if (nAMailId in occ) {
			alert('Создателя TrollKiller нельзя забанить, потому что он не тролль, а эльф восьмидесятого уровня');
			return;
		}
		//Добавляю тролля в локальный лист и сохраняю его на сервере
		var list = getListFromStorage();
		if (!list[link]) {
			list[link] = {
				name: name,
				reason:e('ktKtRreason').value,
				link:link,
				img:e('ktKtTrollAvatar').value
			};
			storage(KEY, list);
		}

		//Добавляю тролля в общий лист и НЕ сохраняю его на сервере
		saveInSharedList(link, name, e('ktKtRreason').value, e('ktKtTrollAvatar').value);
		killTrolls();

		document.getElementById('sndGo').play();
		setTimeout(() =>{
			window.onClickCloseKtDlg();
			if (!isDesktop()) {
				window.location.href = 'http://' + location.host;
			}
		}, 1000);
		
	}
  var zi = isDesktop() ? 1000 : 1701;
  var vo = getViewport();
  var sw = vo.w;
  var sh = vo.h;
	var body = ee(D, 'body')[0],
		bg = appendChild(body, 'div', `&nbsp;`, {
			style: `
			background-color: rgba(255, 255, 255, 0.75);
			width:  ${sw}px;
			height: ${sh}px;
			top : 0px;
			left : 0px;
			position:fixed;
			z-index:${zi};
			`,
      id: 'ktktBg' 
		});
  
  zi++;
  
 	var dName = getDisplayName(name);
	var dlgData = getDlgTemplate(dName, name, link, zi, sw, sh, imgLink);

	appendChild(bg, 'div', dlgData.html,
	{
		style: dlgData.style,
		id: 'ktKTDlg'
	}
	);
	//Элементы управления формы
	e('KtDlgClose').onclick=window.onClickCloseKtDlg;
	e('rtrtGotoProdile').onclick=window.onClickCloseKtDlg;
	e('ktKtBanBtn').onclick=window.onClickBanBtn;
	e('rtrtGotoBanlist').onclick=onClickGotoBanList;
	e('ktKtMainEdit').onclick     = onClickGotoMainEdit;
	e('ktKtMainEditPicW').onclick = onClickGotoMainEdit;
	e('ktKtMainEditPic').onclick  = onClickGotoMainEdit;
	e('ktKtMainLogin').onclick = onClickGotoLoginForm;
	e('ktKtMainLoginPicW').onclick = onClickGotoLoginForm;
	e('ktKtMainLoginPic').onclick = onClickGotoLoginForm;
	e('ktktHomepageLink').onclick = onClickGotoHomepage;

	e('ktktPrldEIcon').onload = onLoadEditIcon;
	e('ktktPrldUIcon').onload = onLoadUserIcon;
	
	//Элементы управления списка
	e('rtrtGotoBanform').onclick = onClickGotoForm;
	e('rtrtGotoBanform2').onclick = onClickGotoForm;
	e('rtrtGotoBanform3').onclick = onClickGotoForm;
	//Элементы управления формы редактирования
	e('ktKtSaveEditItemBtn').onclick = onClickUpdateBtn;
	//Элементы управления формы логина
	e('ktKtLoginBtn').onclick = onClickLoginBtn;
	e('ktktLogin').onkeydown = onClickLoginBtn;
	e('ktktPassword').onkeydown = onClickLoginBtn;
	e('ktktLogin').onkeyup = onClickLoginBtn;
	e('ktktPassword').onkeyup = onClickLoginBtn;

	e('ktktRegLink').onclick = onClickRegLink;

	//authView
	if (window.KTKTUID && window.KTKTUID > 0) {
		setAuthView(true);
	}
	swapEditButton();
	swapUserButton();
	document.getElementById('sndReady').play();
}
function isDesktop() {
	return location.host != 'touch.otvet.mail.ru';
}
/**
 * @description Шаблон диалога для десктопа или для мобилки, в завивсмости от url
 * @param {String} dName  Отображаемое на диалоге имя тролля
 * @param {String} name   Полное имя тролля
 * @param {String} link   Ссылка на профиль тролля
 * @param {Number} zi     z-index окошка диалога
 * @param {Number} sw     ширина вьюпорта
 * @param {Number} sh     высота вьюпорта
 * @param {String} sImgLink     путь к аватару тролля
 * @return {Object} {html, style}
 */
function getDlgTemplate(dName, name, link, zi, sw, sh, sImgLink) {
	if (!isDesktop()) {
		return getMobileDlgTemplate(dName, name, link, zi, sw, sh, sImgLink);
	}
	return getDesktopDlgTemplate(dName, name, link, zi, sw, sh);
}
/**
 * @description Шаблон диалога для десктопа
 * @param {String} dName  Отображаемое на диалоге имя тролля
 * @param {String} name   Полное имя тролля
 * @param {String} link   Ссылка на профиль тролля
 * @param {Number} zi     z-index окошка диалога
 * @param {Number} sw     ширина вьюпорта
 * @param {Number} sh     высота вьюпорта
 * @return {Object} {html, style}
 */
function getDesktopDlgTemplate(dName, name, link, zi, sw, sh) {
	var r = {};
	var W = 480;
	var H = 320;
	var x = Math.round( (sw - W) / 2 ),
		y = Math.round( (sh - H) / 2 );
	r.html = `
	<!-- #0000FF, #0000FF, #5555FF, #bbbbFF, #0000FF 
	#000, #555, #999, #fff, #000
	-->
	<audio id="sndReady">
		<source src="data:audio/mp3;base64,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">
	</audio>
	<audio id="sndGo">
		<source src="data:audio/mp3;base64,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">
	</audio>
		<div  style="background:linear-gradient(#0000FF, #0000FF, #5555FF, #bbbbFF, #0000FF); 
				background-color:#000;" >
			<div class="ktkt-close" style="padding:4px; font-size:1rem; text-align:right;" id="KtDlgClose" >
				<span style="float: left;
								display: inline-block;
								font-weight: bold;
								color: white;
								margin-left: 22px;
								line-height: 2.0rem;
								vertical-align: bottom;

				">TrollKiller</span>
				
				<img style="opacity:0;width:1px;height:1px;"  src="${SERVER_HOST}/i/e24.png" id="ktktPrldEIcon">
				<img style="opacity:0;width:1px;height:1px;" src="${SERVER_HOST}/i/u24.png" id="ktktPrldUIcon">
			
				<span style="background-color: #F00; background:linear-gradient(to left top, red,  #FFF, red); 
								cursor: pointer;color: #FFF;display: inline-block;
								margin-bottom: 3px;font-weight: bold;padding: 0;border-radius: 4px;border: #fff 2px solid;">&nbsp;X&nbsp;</span>
				<div style="clear:both"></div>
			</div>
		</div>
		<div id="ktktBanForm" style="padding:10px;">
			<div class="ktkt-heading" style="font-size:1.5rem;  margin-bottom: 10px;">
				<img src="${SERVER_HOST}/i/logotroll5.jpg" style="max-width: 64px;display: inline-block;float: left;margin-right: 1rem;" >
				<span id="ktKtMainName">${dName}</span>
				<span style="display:inline-block;background-color: #1618A6;
							cursor: pointer;color: #FFF;
							display: inline-block;
							margin-left: 3px;
							font-weight: bold;border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
							
							title="Редактировать"
							data-name="${name}" data-link="${link}" id="ktKtMainEdit"
							>Р</span>
				<!-- Image Edit button (display:inline-block) -->
				<span style="display:none;background-color: #1618A6;
					cursor: pointer;color: #FFF;
					margin-left: 3px;
					border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
					
					title="Редактировать"
					data-name="${name}" data-link="${link}" id="ktKtMainEditPicW"
					>
					<img style="vertical-align: middle;margin-left: 1px;" 
						src="${SERVER_HOST}/i/e24.png"
						id="ktKtMainEditPic"
						title="Редактировать"
						data-name="${name}" data-link="${link}" id="ktKtMainEditPicW"
						>
				</span>
				

				<span style="display:inline-block;background-color: #1618A6;
							cursor: pointer;color: #FFF;
							display: inline-block;
							margin-left: 3px;
							font-weight: bold;border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
							
							title="Логин"
							data-name="${name}" data-link="${link}" id="ktKtMainLogin"
							>Л</span>
				
				<!-- Image Login button -->
				<span style="display:none;background-color: #1618A6;
					cursor: pointer;color: #FFF;
					margin-left: 3px;
					border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
					
					title="Логин"
					data-name="${name}" data-link="${link}" id="ktKtMainLoginPicW"
					>
					<img style="vertical-align: middle;margin-left: 1px;" 
						src="${SERVER_HOST}/i/u24.png"
						id="ktKtMainLoginPic"
						title="Логин"
						data-name="${name}" data-link="${link}"
						>
				</span>

				<div style="clear:both;"></div>

			</div>
			<div class="ktkt-body" style="">
				<div style="">
					<input type="hidden"  id="ktKtTrollAvatar" value="">
					<label>Причина</label>
					<textarea id="ktKtRreason" rows="4" style="width:99%; margin-bottom:10px;resize: none;"></textarea>
					<div style="text-align:right">
						<a href="${SERVER_HOST}/portfolio/web/userscripts/trollkiller/" id="ktktHomepageLink"
							style="margin-bottom: 10px;display: inline-block;text-align: right;">Сайт TrollKiller</a>
					</div>
				</div>

				<div style="float:right">
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 32px;line-height:40px;">
			  			<a href="${link}" id="rtrtGotoProdile">Перейти в профиль пользователя</a>
					</div>
			
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
					<a href="javascript:;" id="rtrtGotoBanlist">Список</a>
					</div>

					<div class="poll-left q--li--text" style="float:left; color:">
						<input type="button" value="Забанить!" id="ktKtBanBtn">
					</div>
					<div class="clearfix" style="clear:both;"></div>
				</div>
				<div class="clearfix" style="clear:both;"></div>
			</div>
		</div>
		<div id="ktktBanList" style="display:none;padding:10px;" >
			<div class="ktkt-heading" style="font-size:2rem;  margin-bottom: 10px;">Отстрелянные:</div>
			<div id="ktktBanlistContainer" class="ktkt-list" style="max-height:170px;height:170px; overflow-y:scroll;border:1px solid black">
			</div>
			<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
			  <a href="javascript:;" id="rtrtGotoBanform">К форме</a>
			</div>
		</div>
		<div id="ktktEditForm" style="display:none;padding:10px;" >
			<div style="">
				<div>
					<input type="text" id="ktktEName">
					<div>
					<input type="hidden" id="ktktELink">
				</div>
				</div>
				<div>
					<textarea id="ktktEreason" rows="4" style="width:99%; margin-bottom:60px;resize: none;"></textarea>
				</div>


				<div style="float:right">
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
						<a href="javascript:;" id="rtrtGotoBanform2">К форме</a>
					</div>

					<div class="poll-left q--li--text" style="float:left; color:">
						<input type="button" value="Сохранить" id="ktKtSaveEditItemBtn">
					</div>
					<div class="clearfix" style="clear:both;"></div>
				</div>
				<div class="clearfix" style="clear:both;"></div>

				
			</div>
		</div>

		<div id="ktktLoginForm" style="display:none;padding:10px;" >
			<div>
				<div style="margin-bottom:12px;">
					<input style="
					min-height: 32px;
					width:96%;
					font-size: 20px;"
					
					type="text" id="ktktLogin" placeholder="Логин в TrollKiller">
				</div>
				<div  style="margin-bottom:12px;">
					<input style="
					min-height: 32px;
					width:96%;
					font-size: 20px;"
					
					type="password" id="ktktPassword"  placeholder="Пароль в TrollKiller">
				</div>

				<div id="ktktViewErrorWrap" style="background-color: #F9D0C7;
							color: #AA0000;
							border-radius: 4px;
							display:none
							">
					<p id="ktktViewError" style="padding: 6px 20px;"></p>
				</div>

				<div style="float:right">
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
						<a href="javascript:;" id="rtrtGotoBanform3">К форме</a>
					</div>
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
						<a href="${SERVER_HOST}/portfolio/web/userscripts/trollkiller/signup/" id="ktktRegLink">Регистрация в TrollKiller</a>
					</div>

					<div class="poll-left q--li--text" style="float:left;">
						<input 
							style="width:63px;
									height:32px;
									padding-left:0px;
							"

						type="button" value="Вход" id="ktKtLoginBtn">
					</div>
					<div class="clearfix" style="clear:both;"></div>
				</div>
				<div class="clearfix" style="clear:both;"></div>
			</div>
		</div>
	`;

	r.style = `font-family:arial;
		position:absolute;
		z-index:${zi};
		left:${x}px;
		top:${y}px;
		background-color:#FFF;
		border:#000 solid 1px;
		padding:0px;
			width:${W}px;
			height:${H}px;
	`;
	return r;
}

/**
 * @description Шаблон диалога для десктопа
 * @param {String} dName  Отображаемое на диалоге имя тролля
 * @param {String} name   Полное имя тролля
 * @param {String} link   Ссылка на профиль тролля
 * @param {Number} zi     z-index окошка диалога
 * @param {Number} sw     ширина вьюпорта
 * @param {Number} sh     высота вьюпорта
 * @param {String} sImgLink     путь к аватару тролля
 * @return {Object} {html, style}
 */
function getMobileDlgTemplate(dName, name, link, zi, sw, sh, sImgLink) {
	var r = {};
	var x = 0,
		y = 0;
	r.html = `<div class="ktktdlg">
	<!-- #0000FF, #0000FF, #5555FF, #bbbbFF, #0000FF 
	#000, #555, #999, #fff, #000
	-->
	<audio id="sndReady">
		<source src="data:audio/mp3;base64,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">
	</audio>
	<audio id="sndGo">
		<source src="data:audio/mp3;base64,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">
	</audio>
	<style>
	.ktktdlg input[type=button].btn, .ktktdlg input[type=submit].btn, .ktktdlg a.btn {
		padding: 5px 4px 1px;
		border-radius: 4px;
		font-weight: bold;
		color: white;
		text-align: center;
		background-color: #20DF4C;
		background: linear-gradient(to top, #0ECD3A, #55DE76, #55DE76, #03AE2A);
		min-height: 24px;
		margin: 0 auto;
		cursor: pointer;
		border:none;
		text-shadow: 1px 1px 0px black, 0 0 1px green;
		font-family:'noto sans';
		font-size: 12px;
	}
	.ktktdlg input[type=button].btn:hover, .ktktdlg input[type=submit].btn:hover, .ktktdlg a.btn:hover{
		background-color : #18CF3C;
		background: linear-gradient(to top, #0ECD3A, #80EE9A, #80EE9A, #0ECD3A);
		cursor:pointer;
	}

	.ktktdlg input[type=button].btn, .ktktdlg input[type=submit].btn {padding: 7px 14px;}

	.ktktdlg a.btn  {
		color:#fff;
		text-decoration:none;
		display:inline-block;
		padding:7px 12px;
	}

	.ktktdlg .mt-2 {
		margin-top:0.5rem;
	}

	.ktktdlg .mb-2 {
		margin-bottom:0.5rem;
	}
	
	</style>
		<div  style="background:linear-gradient(#0000FF, #0000FF, #5555FF, #bbbbFF, #0000FF); 
				background-color:#000;" >
			<div class="ktkt-close" style="padding:4px; font-size:1rem; text-align:right;" id="KtDlgClose" >
				<span style="float: left;
								display: inline-block;
								font-weight: bold;
								color: white;
								margin-left: 22px;
								line-height: 2.0rem;
								vertical-align: bottom;

				">TrollKiller</span>
				
				<img style="opacity:0;width:1px;height:1px;"  src="${SERVER_HOST}/i/e24.png" id="ktktPrldEIcon">
				<img style="opacity:0;width:1px;height:1px;" src="${SERVER_HOST}/i/u24.png" id="ktktPrldUIcon">
			
				<span style="background-color: #F00; background:linear-gradient(to left top, red,  #FFF, red); 
								cursor: pointer;color: #FFF;display: inline-block;
								margin-bottom: 3px;font-weight: bold;padding: 0;border-radius: 4px;border: #fff 2px solid;">&nbsp;X&nbsp;</span>
				<div style="clear:both"></div>
			</div>
		</div>
		<div id="ktktBanForm" style="padding:10px;">
			<div class="ktkt-heading" style="font-size:1.5rem;  margin-bottom: 10px;">
				<img src="${SERVER_HOST}/i/logotroll5.jpg" style="max-width: 64px;display: inline-block;float: left;margin-right: 1rem;max-width:40px;" >
				<span style="
					display: inline-block;
    				margin-bottom: 12px;
				"
				id="ktKtMainName">${dName}</span>
				<span style="display:inline-block;background-color: #1618A6;
							cursor: pointer;color: #FFF;
							display: inline-block;
							margin-left: 3px;
							font-weight: bold;border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
							
							title="Редактировать"
							data-name="${name}" data-link="${link}" id="ktKtMainEdit"
							>Р</span>
				<!-- Image Edit button (display:inline-block) -->
				<span style="display:none;background-color: #1618A6;
					cursor: pointer;color: #FFF;
					margin-left: 3px;
					border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
					
					title="Редактировать"
					data-name="${name}" data-link="${link}" id="ktKtMainEditPicW"
					>
					<img style="vertical-align: middle;margin-left: 1px;" 
						src="${SERVER_HOST}/i/e24.png"
						id="ktKtMainEditPic"
						title="Редактировать"
						data-name="${name}" data-link="${link}" id="ktKtMainEditPicW"
						>
				</span>
				
				

				<span style="display:inline-block;background-color: #1618A6;
							cursor: pointer;color: #FFF;
							display: inline-block;
							margin-left: 3px;
							font-weight: bold;border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
							
							title="Логин"
							data-name="${name}" data-link="${link}" id="ktKtMainLogin"
							>Л</span>
				
				<!-- Image Login button -->
				<span style="display:none;background-color: #1618A6;
					cursor: pointer;color: #FFF;
					margin-left: 3px;
					border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
					
					title="Логин"
					data-name="${name}" data-link="${link}" id="ktKtMainLoginPicW"
					>
					<img style="vertical-align: middle;margin-left: 1px;" 
						src="${SERVER_HOST}/i/u24.png"
						id="ktKtMainLoginPic"
						title="Логин"
						data-name="${name}" data-link="${link}"
						>
				</span>
				<div style="clear:both;"></div>
			</div>
			<div class="ktkt-body" style="">
				<div style="">
					<label>Причина</label>
					<textarea id="ktKtRreason" rows="4" style="width:99%; margin-bottom:10px;resize: none;"></textarea>
				</div>
				<div class="q--li--text" style="">
					<input type="button" value="Забанить!" id="ktKtBanBtn" class="btn">
					<input type="hidden"  id="ktKtTrollAvatar" value="${sImgLink}">
				</div>
				<div  class="mt-2">
					<a class="btn" href="javascript:;" id="rtrtGotoBanlist">Список Забаненых</a>
				</div>
				<div class="mt-2">
					<a class="btn" href="${link}" id="rtrtGotoProdile">Перейти в профиль пользователя</a>
				</div>
				<hr>
				<div style="text-align:right" class="mt-2">
					<a class="btn" href="${SERVER_HOST}/portfolio/web/userscripts/trollkiller/" id="ktktHomepageLink"
						style="margin-bottom: 28px;display: inline-block;text-align: right;">Сайт TrollKiller</a>
				</div>
			</div>
		</div>
		<div id="ktktBanList" style="display:none;padding:10px;" >
			<div class="ktkt-heading" style="font-size:2rem;  margin-bottom: 10px;">Отстрелянные:</div>
			<div id="ktktBanlistContainer" class="ktkt-list" style="max-height:170px;height:170px; overflow-y:scroll;border:1px solid black">
			</div>
			<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
			  <a class="btn" href="javascript:;" id="rtrtGotoBanform">К форме</a>
			</div>
		</div>
		<div id="ktktEditForm" style="display:none;padding:10px;" >
			<div style="">
				<div>
					<input type="text" id="ktktEName">
					<div>
					<input type="hidden" id="ktktELink">
				</div>
				</div>
				<div>
					<textarea id="ktktEreason" rows="4" style="width:99%; margin-bottom:10px;resize: none;"></textarea>
				</div>


				
				<div class="mt-2" style="font-size: 0.75rem;margin-right: 15px;line-height:40px;">
					<a class="btn" href="javascript:;" id="rtrtGotoBanform2">К форме</a>
				</div>

				<div class="mt-2">
					<input class="btn" type="button" value="Сохранить" id="ktKtSaveEditItemBtn">
				</div>
					
				
				

				
			</div>
		</div>

		<div id="ktktLoginForm" style="display:none;padding:10px;" >
			<div>
				<div style="margin-bottom:12px;">
					<input style="
					min-height: 32px;
					width:96%;
					font-size: 20px;"
					
					type="text" id="ktktLogin" placeholder="Логин в TrollKiller">
				</div>
				<div  style="margin-bottom:12px;">
					<input style="
					min-height: 32px;
					width:96%;
					font-size: 20px;"
					
					type="password" id="ktktPassword"  placeholder="Пароль в TrollKiller">
				</div>

				<div id="ktktViewErrorWrap" style="background-color: #F9D0C7;
							color: #AA0000;
							border-radius: 4px;
							display:none
							">
					<p id="ktktViewError" style="padding: 6px 20px;"></p>
				</div>

				<div style="float:right">
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
						<a href="javascript:;" id="rtrtGotoBanform3">К форме</a>
					</div>
					<div class="poll-left" style="float: left;font-size: 0.75rem;margin-right: 15px;line-height:40px;">
						<a href="${SERVER_HOST}/portfolio/web/userscripts/trollkiller/signup/" id="ktktRegLink">Регистрация в TrollKiller</a>
					</div>

					<div class="poll-left q--li--text" style="float:left;">
						<input 
							style="width:63px;
									height:32px;
									padding-left:0px;
							"

						type="button" value="Вход" id="ktKtLoginBtn">
					</div>
					<div class="clearfix" style="clear:both;"></div>
				</div>
				<div class="clearfix" style="clear:both;"></div>
			</div>
		</div>
		</div> <!-- ktktdlg -->
	`;

	r.style = `font-family:arial;
		position:absolute;
		z-index:${zi};
		left:${x}px;
		top:${y}px;
		background-color:#FFF;
		border:#000 solid 1px;
		padding:0px;
		width:100%;
		height:100%;
		max-width:798px;
	`;
	return r;
}

function onLoadEditIcon() {
	window.isEditIconLoaded = true;
	swapEditButton();
}

function swapEditButton() {
	if (!window.isEditIconLoaded) {
		return;
	}
	e('ktKtMainEditPicW').style.display = 'inline-block';
	e('ktKtMainEdit').style.display = 'none';
}

function onLoadUserIcon() {
	window.isUserIconLoaded = true;
	setAuthView(isAuth());
}

function swapUserButton() {
	if (!window.isUserIconLoaded) {
		return;
	}
	e('ktKtMainLoginPicW').style.display = 'inline-block';
	e('ktKtMainLogin').style.display = 'none';
}

function onClickRegLink() {
	window.onClickCloseKtDlg();
	return true;
}

function onClickGotoHomepage() {
	window.onClickCloseKtDlg();
	return true;
}

function onClickLoginBtn(ev) {
	
	if (ev.keyCode && ev.keyCode != 13) {
		console.log('ev.keyCode != 13, return true');
		return true;
	}
	ev.preventDefault();

	e('ktktViewErrorWrap').style.display = 'none';
	e('ktktViewError').innerHTML = '';
	pureAjax(window.SERVER + '/login.jn/', {l:e('ktktLogin').value, p:e('ktktPassword').value}, onSuccessLogin, onFailLogin, 'POST');
	return true;
}

function onSuccessLogin(data) {
	if (!onFailLogin(data)) {
		return;
	}
	if (parseInt(data.uid)) {
		window.KTKTUID = data.uid;
		storage('ktktUid', data.uid);
		setAuthView(true);
		gotoForm();
		getBanlist();
	}
}

function indexByImg(list) {
	var r = {}, i;
	for (i in list) {
		if (list[i].img) {
			r[list[i].img] = {...list[i]};
		}
	}
	return r;
}

function setAuthView(bState) {
	if (!e('ktKtMainLogin')) {
		return;
	}
	if (bState == true) {
		e('ktKtMainLogin').style.display = 'none';
		e('ktKtMainLoginPicW').style.display = 'none';
	} else {
		e('ktKtMainLogin').style.display = 'inline-block';
		swapUserButton();
	}
}

function onFailLogin(a, b, c) {
	if (a.status == 'ok'){
		return true;
	}
	if (!e('ktktViewErrorWrap')) {
		return false;
	}
	if (a.status == 'error' && a.msg) {
		e('ktktViewErrorWrap').style.display = 'block';
		e('ktktViewError').innerHTML = a.msg;
	} else {
		e('ktktViewErrorWrap').style.display = 'block';
		e('ktktViewError').innerHTML = 'Что-то пошло не так, регистрация в TrollKiller временно недоступна.';
	}
	return false;
}

function onClickGotoLoginForm(ev) {
	ev.preventDefault();
	ev.stopImmediatePropagation();
	var s = 'display';
	e('ktktBanForm').style[s] = 'none';
	e('ktktBanList').style[s] = 'none';
	e('ktktEditForm').style[s] = 'none';
	e('ktktLoginForm').style[s] = 'block';
	return false;
}

function onClickGotoMainEdit(ev) {
	var trg = ev.target, 
		link = attr(trg, 'data-link'),
		name = attr(trg, 'data-name'),
		reason = e('ktKtRreason').value;
	showEditForm(link, name, reason);
}

function onClickUpdateBtn() {
	var list = getListFromStorage(), i,
		link = e('ktktELink').value,
		name = e('ktktEName').value,
		img = e('ktKtTrollAvatar').value,
		reason = e('ktktEreason').value;
	if (!list[link]) {
		list[link] = {};
	}
	list[link].name = name;
	list[link].reason = reason;
	list[link].link = link;
	list[link].img = img;
	storage(KEY, list);

	saveInSharedList(link, name, reason, img);

	//Update main form data
	e('ktKtRreason').value = reason;
	e('ktKtMainName').innerHTML = name;
	gotoForm();
}

function saveInSharedList(link, name, reason, img) {
	//if (isAuth()) {
		var list = getSharedListFromStorage();
		if (count(list) && !list[link]) {
			list[link] = {
				name: name,
				reason:reason,
				img:img,
				link:link
			};
			storage(KEY_SHARED, list, false);
		}
	//}
}

function onClickGotoForm(ev) {
	ev.stopImmediatePropagation();
	ev.preventDefault();
	gotoForm();
	return false;
}

function gotoForm() {
	if (!e('ktktBanForm')) {
		return;
	}
	var s = 'display';
	e('ktktBanForm').style[s] = 'block';
	e('ktktBanList').style[s] = 'none';
	e('ktktEditForm').style[s] = 'none';
	e('ktktLoginForm').style[s] = 'none';
}

function onClickGotoBanList(ev) {
	ev.stopImmediatePropagation();
	ev.preventDefault();
	var s = 'display';
	e('ktktBanForm').style[s] = 'none';
	e('ktktEditForm').style[s] = 'none';
	e('ktktBanList').style[s] = 'block';
	var list = getSharedListFromStorage(), i;
	list = count(list) ? list : getListFromStorage();
	e('ktktBanlistContainer').innerHTML = '';
	for (i in list) {
		var dName = getDisplayName(list[i].name);
		appendChild('ktktBanlistContainer', 'div', `
		<div style="">
			<b title="${list[i].reason}" style="float:left;display:inline-block;">
				<a class="ktktlist-item-v" href="${list[i].link}" target="_blank">${dName}</a>
			</b>
			<span style="float:right;
							display:inline-block;
							background-color: #F00;
							color:#FFF;
							cursor: pointer;
							margin-bottom: 3px;
							font-weight: bold;
							padding: 4px;
							border-radius: 4px;
							border: #d0bfbf 2px solid;"

							data-name="${list[i].name}" data-link="${list[i].link}" data-reason="${list[i].reason}" class="ktktlist-item-r"
							>X</span>

			<span style="float:right;display:inline-block;background-color: #1618A6;
							cursor: pointer;color: #FFF;
							display: inline-block;
							margin-bottom: 3px;
							font-weight: bold;border-radius: 4px;border: #c0c1e4 2px solid;padding:4px 6px;"
							
							title="Редактировать"
							data-name="${list[i].name}" data-link="${list[i].link}" data-reason="${list[i].reason}" class="ktktlist-item-e"
							>Р</span>
			<div style="clear:both;"></div>
		</div>
		`);
	}
	e4( e('ktktBanlistContainer'), 'ktktlist-item-r', (item) => {
		item.onclick = (ev) =>{
			var trg = ev.target, 
				link = attr(trg, 'data-link'),
				name = attr(trg, 'data-name'),
				dName = getDisplayName(name),
				reason = attr(trg, 'data-reason');
			if (confirm(`Разбанить пользователя ${dName} забаненого за "${reason}"?`)) {
				delete list[link];
				var itemDiv = trg.parentNode.parentNode;
				itemDiv.parentNode.removeChild(itemDiv);
				storage(KEY, list);
				var shList = getSharedListFromStorage();
				delete shList[link];
				storage(KEY_SHARED, shList, false);
			}
		}
	} );
	e4( e('ktktBanlistContainer'), 'ktktlist-item-e', (item) => {
		item.onclick = (ev) =>{
			var trg = ev.target, 
				link = attr(trg, 'data-link'),
				name = attr(trg, 'data-name'),
				reason = attr(trg, 'data-reason');
			showEditForm(link, name, reason);
		}
	} );
	/*e4( e('ktktBanlistContainer'), 'ktktlist-item-v', (item) => {
		item.onclick = (ev) =>{
			window.onClickCloseKtDlg();
			return true;
		}
	} );*/
	return false;
}

function mergeServerAndLocalData(arr) {
	/*
	 * Тут может захотеться помудрить, получать также getSharedListFromStorage и мержить ещё и с ним если он не пуст.
	 * Этого делать не надо: новые тролли добавляются в локальный лист (и в общий, на минуточку). 
	 * Если с сервера пришел новый общий лист, он тут мержится с локальным, так что всё гуд.
	*/
	let i, local = getListFromStorage(), co,
		shared = {...local};

	for (i = 0; i < arr.length; i++) {
		co = new Object();
		co.link = '/profile/id' + arr[i].a_mail_id + '/';
		co.name = arr[i].nick;
		co.reason = arr[i].reason;
		if (!shared[co.link]) {
			shared[co.link] = co;
		}
	}
	storage(window.KEY_SHARED, shared, false);
}

function count(o) {
	var n = 0;
	for (var i in o) {
		n++;
	}
	return n;
}

function getBanlist() {
	if (!window.KTKTUID) {
		return;
	}
	pureAjax(window.SERVER_HOST + '/portfolio/web/userscripts/trollkiller/d/' + window.KTKTUID + '.json?' + Math.random(), {},
		(dt) => {
			mergeServerAndLocalData(dt);
		},
		(a, b, c) => {
			if (a == 404) {
				createServerBanList();
			}
		},
		'GET');
}
function createServerBanList() {
	if (!window.KTKTUID) {
		return;
	}
	pureAjax(window.SERVER + '/createlist.jn/', {i:window.KTKTUID},
		(dt) => {
			if (dt.status == 'ok') {
				getBanlist();
			}
		},
		(a, b, c) => {},
		'POST');
}
function getDisplayName(name) {
	var L = 20;
	if (name.length > L) {
		return (name.substring(0, L) + '...');
	}
	return name;
}

function showEditForm(link, name, reason) {
	e('ktktELink').value = link;
	e('ktktEName').value = name;
	e('ktktEreason').value = reason;

	var s = 'display';
	e('ktktBanForm').style[s] = 'none';
	e('ktktEditForm').style[s] = 'block';
	e('ktktBanList').style[s] = 'none';
}

function getListFromStorage() {
	return _getListFromStorage(KEY);
}

function getSharedListFromStorage() {
	var key = KEY_SHARED;
	return _getListFromStorage(KEY_SHARED);
}

function _getListFromStorage(key) {
	var list = storage(key);
	list = list ? list : {};
	return list;
}

//TODO поом что-то придумать
function addStyle() {
	var body = ee(D, 'body')[0];
	appendChild(body, 'style', `
		.ktKtTest {
			color:red;
		}
	`, {'data-ap': 100});
}
/**
 * @param {String} data if data was object it already String
 */
function sendToServer(data) {
	if (window.KTKTUID == 0) {
		return;
	}
	var user = getUserData();//stringify {img, link, name}
	pureAjax(window.SERVER + '/savelist.jn/', {d:data, u:user}, (dt)=>{
		if (dt.status == 'error' && dt.msg == 'Войдите') {
			window.KTKTUID = 0;
			setAuthView(false);
		}
	}, (a, b, c) => {
		  console.log(a);
		  console.log('b', b);
		  console.log('c', c);
	  }, 'POST');
}
/**
 * @return {img, link, name}
 */
function getUserData() {
	var list = cs(D, window.authUserAvatarLinkCss), s = '',
		ret = {img:s, link:s, name: s}, o;
	if (list && list[0]) {
		o = list[0];
		ret.name = parseTitle(o);
		ret.img = parseImg(o);
		ret.link = attr(o, 'href');
	}
	return JSON.stringify(ret);
}

function parseImg(o) {
	if (window.authUserAvatarLinkCss == window.touchAuthUserAvatarLinkCss) {
		return parseTouchImg(o);
	}
	return parseDeskImg(o);
}

function parseTouchImg(o) {
	var list = ee(o, 'img');
	if (list && list[0]) {
		return imgToDataUri(list[0]);
	}
	return '';
}
function parseDeskImg(o) {
	if (window.desktopAuthUserImageLoaded) {
		return window.desktopAuthUserImage64data;
	}
	return '';
}

function parseDesktopImage() {
	var list = cs(D, window.authUserAvatarLinkCss), s,
		o, img;
	if (list && list[0]) {
		o = cs(list[0], 'pm-toolbar__button__icon__img');
		if (o && o[0]) {
			o = o[0];
			if (o.style && o.style.backgroundImage) {
				s = getBgImageSUrl(o);
				img = new Image();
				img.onload = onLoadAuthUserImg;
				img.onerror = () =>{ console.log('Error load image!'); }
				img.src = s;
			}
		}
	}
}

function getBgImageSUrl(o) {
	if (!o || !o.style || !o.style.backgroundImage) {
		return '';
	}
	var s = o.style.backgroundImage.replace('url(', '');
	s = s.replace(')', '');
	s = s.replace(/"/g, '');
	s = s.replace(/'/g, '');
	s = s.replace(/^\/\//, 'https://');
	return s;
}

function onLoadAuthUserImg() {
	window.desktopAuthUserImageLoaded = true;
	window.desktopAuthUserImage64data = imgToDataUri(this);
}

function parseTitle(o) {
	if (window.authUserAvatarLinkCss == window.touchAuthUserAvatarLinkCss) {
		return parseTouchTitle(o);
	}
	return parseDeskTitle(o);
}
function parseDeskTitle(o) {
	var s = attr(o, 'title'),
		a = s.split(',');
	if (a.length > 0) {
		return a[1].trim();
	}
	return '';
}

function parseTouchTitle(o) {
	var list = cs(o, 'nav-menu__profile__name');
	if (list && list[0]) {
		return list[0].innerHTML;
	}
	return '';
}

function isAuth() {
	if (window.KTKTUID) {
		return true;
	}
	return false;
}
//---------------micronlib----------------
var D = document,
W = window, S = String;
function e(i) {
	if (i && i.tagName || D == i) return i;
	return D.getElementById(i);
}
W.micron$ = e;
function ee(p, c) {
	p = e(p);
	return p.getElementsByTagName(c);
}
function ec(p, cn) {
	return cs(p, cn);
}
function e3(p, c, callback) {
	var i, ls = ee(p, c);
	for (i = 0; i < ls.length; i++) {
		callback(ls[i]);
	}
}
function e4(p, cn, callback) {
	var i, ls = ec(p, cn);
	for (i = 0; i < ls.length; i++) {
		callback(ls[i]);
	}
}
W.micron$$ = ee;
function cs(p, c) {
	p = e(p);
	if (p.getElementsByClassName) {
		return p.getElementsByClassName(c);
	}
	return [];
}
function hasClass(obj, css) {
	var obj = e(obj);
	var c = obj.className, _css = css.replace(/\-/g, "\\-"), 
	re1 = new RegExp("^\\s?" + _css + "\\s*"), 
	re2 = new RegExp("\\s+" + _css + "(\\s+[\\w\\s]*|\\s*)$");
	if (c == css || re1.test(c) || re2.test(c)) {
		return true;
	} 
	return false;
}
function removeClass(obj, css) {
	obj = e(obj);
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
	obj = e(obj);
	removeClass(obj, css);
	obj.className += ' ' + css;
}
//getviewport
function getViewport() {
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
function appendChild(parent, tag, innerHTML, obj, dataObj) {
	var el = D.createElement(tag), i;
	if (obj) {
		for (i in obj) {
			if (obj[i] instanceof Function) {
				el[i] =  obj[i];
			} else {
				el.setAttribute(i, obj[i]);
			}
		}
	}
	if (dataObj) {
		for (i in dataObj) {
			el.setAttribute('data-' + i, dataObj[i]);
		}
	}
	el.innerHTML = innerHTML;
	e(parent).appendChild(el);
	return el;
}
function sz(a) {
	return a.length;
}
function attr(o, name, val) {
	o = e(o);
	if (val) {
		o.setAttribute(name, val);
	}
	if (o.hasAttribute(name)) {
		return o.getAttribute(name);
	}
	return '';
}
function stl(o, s, v) {
	o = e(o);
	o.style[s] = v;
}
function show(o, v) {
	v = v ? v : 'block';
	stl(o, 'display', v);
}
function hide(o) {
	stl(o, 'display', 'none');
}
function trim(s) {
	s = S(s).replace(/^\s+/mig, '');
	s = S(s).replace(/\s+$/mig, '');
	return s;
}
function In(a) {
	var i, o = {};
	if (a instanceof Array) {
		for (i = 0; i < sz(a); i++) {
			o[a[i]] = 1;
		}
	} else if (a instanceof Object) {
		for (i in a) {
			o[a[i]] = 1;
		}
	} else {
		for (i = 0; i < sz(arguments); i++) {
			o[arguments[i]] = 1;
		}
	}
	return o;
}
/**
 * Внимание, функция пропатчена
 * TODO пропатчить, чтобы отправляла данные на сервер если пользователь авторизован
 * @description Индексирует массив по указанному полю
 * @param {Array} data
 * @param {String} id = 'id'
 * @param {Boolean} _sendToServer = true
 * @return {Object};
*/
function storage(key, data, _sendToServer = true) {
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
			if (_sendToServer) {
				sendToServer(data);
			}
		}
	}
	return data;
}
/**
 * @description Преобразовывается изображение в dataUri
 * @param {Image} 
 * @return {String}
*/
function imgToDataUri(i) {
	var canvas;
	try {
		canvas = document.createElement('canvas');
		canvas.width = i.naturalWidth;
		canvas.height = i.naturalHeight;
		canvas.getContext('2d').drawImage(i, 0, 0);
		var r = canvas.toDataURL('image/png');
		delete canvas;
		return r;
	} catch(e) {
		if (canvas) {
			delete canvas;
		}
	}
	return false;
}

/**
 * @desc Аякс запрос к серверу, использует JSON
*/
function pureAjax(url, data, onSuccess, onFail, method) {
	var xhr = new XMLHttpRequest();
	//подготовить данные для отправки
	var arr = [];
	console.log('send to:' + url, data);
	for (var i in data) {
		arr.push(i + '=' + encodeURIComponent(data[i]));
	}
	var sData = arr.join('&');
	//установить метод  и адрес
	xhr.open(method, url, true);
	//установить заголовок
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	//обработать ответ
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var error = {};
			if (xhr.status == 200) {
				try {
					var response = JSON.parse(String(xhr.responseText));
					console.log(response);
					onSuccess(response, xhr);
					return;
				} catch(e) {
					/*console.log(String(xhr.responseText));
					console.log(e);*/
					error.state = 1;
					error.info = 'Fail parse JSON';
				}
			}else {
				error.state = 1;
			}
			if (error.state) {
				onFail(xhr.status, xhr.responseText, error.info, xhr);
			}
		} 
	}
	//отправить
	xhr.send(sData);
}
