// ==UserScript==
// @name        Pma gzip Exporter
// @namespace   https://ruvip16.hostiman.ru/phpmyadmin/*
// @namespace   http://localhost/phpmyadmin/*
// @version     1
// @grant       none
// ==/UserScript==

window.addEventListener('load', onStartPma);
var d = document;
function e(i){ return  d.getElementById(i);}
function onStartPma(){
  tick();
  setInterval(tick, 700);
}

function tick(){
  var sel = e('compression');
  if (sel) {
    selectByValue(sel, 'gzip');
  } 
}

/**
 * @description Выделяет элемент выпадающего списка по его value
 * @return {Boolean} если удалось найти такое значение и выделить, true
*/
function selectByValue(g, v) {
  for (var i = 0; i < g.options.length; i++) {
    if (g.options[i].value == v) {
      g.options[i].selected = true;
      g.selectedIndex = i;
      return true;
    }
  }
}
