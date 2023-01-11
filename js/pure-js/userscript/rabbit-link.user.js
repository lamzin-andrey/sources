// ==UserScript==
// @name     Add rabbit link!
// @namespace   http://ci.fines/job/105.test/*
// @include     http://ci.fines/job/105.test/*
// @version  1
// @grant    none
// ==/UserScript==

window.onload = start;

function start() {
  setInterval(() => {
	  onTick();
  }, 5 * 1000);
}

function e(i) {
	if (i && i.tagName) {
		return i;
	}
	return document.getElementById(i);
}

function onTick() {
  
	var linkId = "myrlink", link = e(linkId), out, s, start, end;
	if (link) {
    // alert("klink found!");
		return;
	}
	try {
    out = document.getElementsByClassName("console-output")[0];
    s = out.innerHTML;
    start = s.indexOf("rabbit.");
    end = s.indexOf(".ru ", start);
    if (end > start) {
      s = s.substring(start, end) + ".ru";
      link = appendChild(out, 'p', `<a id="${linkId}" href="http://${s}" target="_blank">${s}<a>`, {}, {});
    } else {
      alert('NoF!');
    }
  } catch(err) {
    alert(err);
  }
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
