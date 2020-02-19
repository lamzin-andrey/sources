//@depends jquery
//@depends oneslide.css
/**
 * @description Анимированный выезд экрана слева
 * @param {String} id контейнера, котрый будет показан
 * @param {Funciton} callback - вызовется после того, как на "слайд" будет добавлен необходимый контент (копия $('#' + id).html())
 * @param {Number} sleep  = 300 время задержки в миллисекундах перед стартом анимации появления слайда
 */
function oneslide(id, callback, sleep) {
    var hSlide = $('#oneslide');
    sleep = parseInt(sleep) ? parseInt(sleep) : 300;
    hSlide.html( $('#' + id).html() );
    callback();
    setTimeout(function(){
		hSlide.css('left', '-110%');
		hSlide.show();
		hSlide.removeClass('hide');
		hSlide.animate({
			'left' : '0%',
			'easing': 'swing',
			'duration': 'slow'
		});
	}, sleep);
    
	
}
/**
 * @description Анимированный "заезд" слайда. 
 */
function oneslideHide() {
	console.log('call oneslideHide');
	var hSlide = $('#oneslide');
	hSlide.animate({
		'left' : '-110%',
		'easing': 'swing',
		'duration': 'slow',
	}, function(){
		hSlide.hide();
		hSlide.addClass('hide');
		hSlide.html('');
	});
}
