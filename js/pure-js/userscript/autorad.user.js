// ==UserScript==
// @name        Autosong
// @namespace   http://www.avtoradio.ru/*
// @include     http://www.avtoradio.ru/
// @version     1
// @grant       none
// ==/UserScript==
window.ready = 0;
window.onload=function() {
  window.ready = 1;
}
setInterval(onTime, 1000);
function onTime() {
  if(!window.ready) {
   return;
  }
  //...
  var ls = document.getElementsByClassName('TitleSongAir');
  var current = trim(ls[0].innerText);
  var last = window.localStorage.getItem('lastSong');
  if (current != '...' && current != 'Реклама' && current != 'Новости') {
      if (current != last) {
        var form = '<iframe id="injectconnect" name="connect"></iframe><form action="http://gazel.me/js/gate/auto.php" method="POST" id="injectform" target="connect"><input id="injectsong" name="song" value="' + current + '"></form>';
        console.log('current = ' + current);
        console.log('last = ' + last);
        window.localStorage.setItem('lastSong', current);
        if (!document.getElementById('injectconnect')) {
          document.body.innerHTML += form;
          setTimeout(function(){
            injectsong.value = current;
            injectform.submit();
            console.log('submit ' + current);
          }, 1000);
        } else {
          injectsong.value = current;
          injectform.submit();
          console.log('submit ' + current);
        }
        
      }
  }
}

function S(s){
  return String(s);
}


function trim(s) {
	s = S(s).replace(/^\s+/mig, '');
	s = S(s).replace(/\s+$/mig, '');
	return s;
}
