// ==UserScript==
// @name        GetStat
// @namespace   http://www.liveinternet.ru/stat/gazel.me/*
// @include     http://www.liveinternet.ru/stat/gazel.me/*
// @version     1
// @grant       none
// ==/UserScript==

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

function getCountUp() {
  var s = 'количество просмотров разных страниц', counter = 0, lTd;
  var tds = eee('td', document, function(td){
      if (td.innerHTML.indexOf(s) != -1) {
        if (counter == 1) {
          lTd = td;
        }
         counter++;
      }
  });
  counter = 0;
  if (lTd) {
    while (true) {
      lTd = lTd.parentNode;
      if (!lTd) {
        alert('Not found P!');
        break;
      }
      if (lTd.tagName == 'P') {
        counter = 1;
        break;
      }
    }
  }

  if (counter) {
    tds = ee('table', lTd);
    if (tds[1]) {
      var sum = 0;
      eee('tr', tds[1], function(tr){
        tds = ee('td', tr);
        if (tds[1] && tds[2]) {
            if (~tds[1].innerHTML.indexOf('/cabinet/up')) {
                var i = +tds[2].innerHTML;
                sum += i;
            }
        }
      });
      alert(sum + ' поднятий');
    }
  }
}
getCountUp();
