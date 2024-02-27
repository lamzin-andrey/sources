// ==UserScript==
// @name     Tilda Url Searcher
// @namespace   https://tilda.cc/projects*
// @include     https://tilda.cc/projects*
// @version  1
// @grant    none
// ==/UserScript==

window.HOST = "https://your.domain.com";


window.A = {
  cnt: 0,
  start() {
    console.log("Start!");
    try {
    	A.setLinks();
    } catch(err) {
      console.log(err);
    }
    A.ival = setInterval(() => {
      A.setLinks();
    }, 1000);
  },
  setLinks(){
    let ls = document.getElementsByTagName("a"), i, sz = ls.length, lnk;
    for (i = 0; i < sz; i++) {
      lnk = ls[i].getAttribute("href");
      console.log("process" + lnk);
      A.displayLnk(lnk, ls[i]);
    }
  },
  displayLnk(lnk, a) {
    let item, displayText;
    if (lnk.indexOf(HOST) == -1) {
      console.log("NF  " + HOST);
      return;
    }
    item = A.getPageItem(a);
    if (!item) {
      console.log("NF pageItem");
      return;
    }
    displayText = item.getElementsByClassName("td-page__td-title")[0];
    if (!displayText) {
      console.log("NF td-page__td-title");
      return;
    }
    displayText = item.getElementsByTagName("a")[0];
    if (!displayText) {
      console.log("NF a in td-page__td-title");
      return;
    }
    if (displayText.getAttribute("data-url-displayed") == 1) {
      A.cnt++;
      if (A.cnt > 1000) {
        clearInterval(A.ival);
      }
      return;
    }
    displayText.innerHTML += "<span> " + lnk.replace(HOST, "") + "</span>";
    displayText.setAttribute("data-url-displayed", 1);
    
  },
  getPageItem(a) {
    while (a) {
      a = a.parentNode;
      if (!a) {
        break;
      }
      if (a.tagName == "DIV" && String(a.getAttribute("id")).indexOf("page") == 0) {
        return a;
      }
    }
    
    return null;
  }
  
};

window.onload = A.start;


