// ==UserScript==
// @name        BitbuckGrab
// @namespace   http://http://82.202.248.106/server-status106
// @include     http://82.202.248.106/server-status106
// @version     1
// @grant       none
// ==/UserScript==
window.onload=init;
function init() {
  window.appsort = {};
  setTableLinks();
}
function setTableLinks() {
  var ls, i, ths, j;
  ls = document.getElementsByTagName('table');
  for (i = 0; i < ls.length; i++) {
    ths = ls[i].getElementsByTagName('th');
    for (j = 0; j < ths.length; j++) {
      var s = ths[j].innerHTML;
      ths[j].innerHTML = '<a href="#">' + s + '</a>'
    }
    ths = ls[i].getElementsByTagName('a');
    for (j = 0; j < ths.length; j++) {
      ths[j].onclick = onClickSort;
    }
  }
}

function onClickSort(evt) {
  console.log(evt.target);
  var a = evt.target;
  var th = evt.target.parentNode;
  var tr = th.parentNode;
  var t = tr.parentNode;
  var table = t.parentNode;
  console.log(tr);
  console.log(table);
  
  var ls = tr.getElementsByTagName('th'), i, s = a.innerText.trim(), targetIdx = -1;
  for (i = 0; i < ls.length; i++) {
    if (ls[i].innerText.trim() == s) {
      console.log('found as i = ' + i);
      targetIdx = i;
    }
  }
  if (targetIdx == -1) {
    return false;
  }
  //сортируем
  var trs = table.getElementsByTagName('tr'), j, aData = [], k;
  for (j = 1; j < trs.length; j++) {
    ls = trs[j].getElementsByTagName('td');
    if (ls[targetIdx]) {
      var aItem = [];
      for (k = 0; k < ls.length; k++) {
        //if (k != targetIdx) {
        	aItem.push(ls[k].innerText.trim());
        /*} else {
          var cv = parseFloat(ls[targetIdx].innerText.trim());
          if (cv) {
            aItem.push( cv );
          } else {
            aItem.push(ls[targetIdx].innerText.trim() );
          }
        }*/
      }
      aData.push(aItem);
    }
  }
  
  
  var cond = window.appsort.direct ? window.appsort.direct : 'up';
  if (cond == 'up') {
    window.appsort.direct = 'dw';
  } else {
    window.appsort.direct = 'up';
  }
  
  for (i = 0; i < aData.length; i++) {
    for (j = 0; j < aData.length; j++) {
      var bCond = aData[i][targetIdx] < aData[j][targetIdx];
      if (cond == 'up') {
        bCond = aData[i][targetIdx] > aData[j][targetIdx];
      }
      if (bCond) {
        var buf = aData[i];
        aData[i] = aData[j];
        aData[j] = buf;
      }
    }
  }
  
  //Set values
  for (j = 1; j < trs.length; j++) {
    ls = trs[j].getElementsByTagName('td');
    if (ls[targetIdx]) {
      for (k = 0; k < ls.length; k++) {
        if (aData[j - 1] && aData[j - 1][k]) {
        	ls[k].innerText = aData[j - 1][k];
        }
      }
    }
  }
  
  return false;
}
