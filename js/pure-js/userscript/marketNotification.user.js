// ==UserScript==
// @name        TinkoffInvest
// @namespace   https://www.tinkoff.ru/invest/stocks/SBER/*
// @include     https://www.tinkoff.ru/invest/stocks/SBER/*
// @version     1
// @grant       none
// ==/UserScript==

window.onload = function() {
  // CONFIG
  var lowLevelPrice = 197;
  var topLevelPrice = 200;
  var space = 1; //например если lowLevelPrice = 150 а space = 2 уведомления будут показыватсья в коридоре от 150 до 152
  var secondsBetweenAlerts = 30;
  var showRunNoticeButton = false;
  // /CONFIG
  
  
  var ls, i, span, lswrapp, j, div;
  
  
  setInterval(() =>{
  
    lswrapp = document.getElementsByTagName('body')[0].getElementsByTagName('div');
    
    for (j = 0; j < lswrapp.length; j++) {
        //SecurityPriceDetailsPure__wrapper_13Isw
        div = lswrapp[j];
        if (div.hasAttribute('class') && div.getAttribute('class').indexOf('SecurityPriceDetailsPure__wrapper') != -1 ) {
          
            ls = div.getElementsByTagName('span');          
          	for (i = 0; i < ls.length; i++) {
              if (ls[i].hasAttribute('class')) {
                span = ls[i].getAttribute('class');
                if (span.indexOf('Money__money_') != -1) {
                  var fPrice = parseFloat( String(ls[i].innerHTML).trim().replace(/[^\d,]/mig, '').trim().replace(',', '.') );
									var iPrice = parseInt(fPrice);
                  if ( (iPrice >= lowLevelPrice && iPrice <= (lowLevelPrice + space)) ||
                      
                       ( iPrice <= topLevelPrice && iPrice >= (topLevelPrice - space) )
                     ) {// /if
                    if (!window.lastTs || (time() - window.lastTs > secondsBetweenAlerts) ) {
                    	window.SimpleNotice.show('SBER price = ' + iPrice + '!', 'Hop!', laavatar);
                      window.lastTs = time();
                    }
                  }
                }
            }
            break;
        }
    }
    
    
  }
    
  },
  1000
  );
  
  if (showRunNoticeButton) {
    var div1 = document.createElement('div');
    div1.innerHTML = `Show Notice`;
    div1.style = 'z-index:9999; position:absolute; bottom:10px; right:30px; background-color:black; color:white; cursor:pointer;';
    document.getElementsByTagName('body')[0].appendChild(div1);
    div1.onclick = onClickShowNotice;
  }
  
  
  //reload page for imitate activity
  
  var nRelSec = rand(40, 200);
  console.log(nRelSec);
  
  setInterval(() => {
    window.location.reload();
  }, 
            nRelSec * 1000 );
  
}

function onClickShowNotice() {
  window.SimpleNotice.show('Test!', 'Test!', window.laavatar);
  alert(10);
}

window.SimpleNotice = {
	/**
	 * 
	 * @param {String} message 
	 * @param {String} title 
	 * @param {String} image 
	 */
	show:function(message, title, image){
		if (window.Notification) {
			function _notify(message, title, image) {
				var n = {};
				n.body = message;
				n.title = title;
				n.icon = image;
				n = new Notification(n.title, n);
				n.onclick = function() {
					window.focus();
					setTimeout(function(){
						n.close();}, 
					1000);
				}
			}
			if (Notification.permission === 'granted') {
				_notify(message, title, image);
			} else {
				if (!window.permissionNotifyRequested) {
					window.permissionNotifyRequested = 1;
					Notification.requestPermission(function(permission) {
						if (permission === 'granted') {
							_notify(message, title, image);
						}
					});
				}
			}
		}
	}
};

/**
 * @description 
 * @param {String} sDatetime 'Y-m-d H:i:s' (php date() format)
 * @return Количество секунд с 01.01.1970 до sDatetime
*/
function time(sDatetime) {
	var re = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}:[0-9]{2}:[0-9]{2}$/, arr = String(sDatetime).split(' '),
		sDate = arr[0],
		sTime = arr[1], d = new Date(),
		re2 = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
	if (!re.test(sDatetime) && !re2.test(sDatetime)) {
		return parseInt(new Date().getTime()/1000);
	}
	arr = sDate.split('-');
	d.setDate(parseInt(arr[2], 10));
	d.setFullYear(arr[0]);
	d.setMonth(parseInt(arr[1], 10) - 1);
	
	if (sTime) {
		arr = sTime.split(':');
		d.setHours(parseInt(arr[0], 10));
		d.setMinutes(parseInt(arr[1], 10));
		d.setSeconds(parseInt(arr[2], 10), 0);
	} else {
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0, 0);
	}
	return parseInt(d.getTime()/1000);
}

function rand(min, max) {
	var n = 0, k;
	while (n == 0) n = Math.round(Math.random()*(max-min))+min;
	k = Math.random();
	if (k > 0.5) {
		if (k > 0.75 && n == max - 1) {
			n++;
		} else if( n == min + 1){
			n--;
		}
	}
	return n;
}

window.laavatar = 'data:image/jpeg;base64,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';
