//@depends bmenu.css
//Установите window.hActiveMenuItem для того элемента, который соответствует экрану, который открывается по умолчанию
/**
 * @description Анимированный выезд меню слева
 * @param {jQueryHtmlElement} bMenu Кнопка меню, будет скрыта
 * @param {jQueryHtmlElement} hMenuItems контейнер с элементами меню, будет показан
 */
function antMenuShow(bMenu, hMenuItems) {
    bMenu.hide();
	hMenuItems.css('left', '-110%');
	hMenuItems.show();
	hMenuItems.removeClass('hide');
	hMenuItems.animate({
		'left' : '0%',
		'easing': 'swing',
		'duration': 'slow'
	});
}
/**
 * @description Анимированный "заезд" меню слева. 
 * Используй window.bNeedQuitOnMenuHidden чтобы завершить работу приложения после заурытия меню
 * @param {jQueryHtmlElement} bMenu Кнопка меню, будет скрыта
 * @param {jQueryHtmlElement} hMenuItems контейнер с элементами меню, будет показан
 */
function antMenuHide(bMenu, hMenuItems) {
	hMenuItems.animate({
		'left' : '-110%',
		'easing': 'swing',
		'duration': 'slow',
	}, function(){
		console.log('done!');
		hMenuItems.hide();
		hMenuItems.addClass('hide');
		bMenu.show();
		if (window.bNeedQuitOnMenuHidden) {
			if (window.Qt) {
				Qt.quit();
			} else {
				window.close();
			}
		}
	});
}
/**
 * @description Делает переданный пункт меню невидимым
 * Использует window.hActiveMenuItem для определения, какой элемент меню активен в данный момент (его надо скрыть)
 * @param {*} newActiveMenuItem  
 */
function antSwitchMenuItem(newActiveMenuItem) {
	window.hActiveMenuItem.removeClass('hide');
	window.hActiveMenuItem = newActiveMenuItem;
	newActiveMenuItem.addClass('hide');
}
