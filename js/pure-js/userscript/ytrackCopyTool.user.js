// ==UserScript==
// @name     Youtrack copy tools
// @namespace   https://youtrack.rf-tech.ru/*
// @include     https://youtrack.rf-tech.ru/*
// @version  1
// @grant    none
// ==/UserScript==

window.onload = start;

function start() {
   setTimeout(function(){
	  var ls, i, btn;
	  // alert('Start');
	  ls = document.getElementsByTagName('code');
	  for (i = 0; i < ls.length; i++) {
		  btn = appendChild(ls[i].parentNode, 'input', '', {
			  value: 'Copy',
			  type: 'button'
		  });
		  insertBefore(ls[i], btn);
		  btn.onclick = function(evt) {
			onClickCopy(evt);
		  }
	  }
	  // alert('End');
   }, 8 * 1000); 
}

function onClickCopy(evt) {
	var trg = evt.target, code;
	code = trg.parentNode.getElementsByTagName('code')[0].innerHTML;
  navigator.clipboard.writeText(code).then(() => {
    alert('Скопировано');
  });
}

function appendChild(parent, tag, innerHTML, obj, dataObj) {
	var el = document.createElement(tag), i;
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
	parent.appendChild(el);
	
	return el;
}

function insertBefore(existsElement, newElement) {
	var parentElement = existsElement.parentNode;
	return parentElement.insertBefore(newElement, existsElement);
}
