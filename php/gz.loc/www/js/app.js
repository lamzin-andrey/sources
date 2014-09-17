$(document).addEvent('domready', initalize); 
function initalize() {
	//localStorage.clear(); // TODO remove this str
	window.App = {};
	initLocationInputs();
	initAddForm();
	initAutorizeForm();
	initUserControls();
	initAjaxPaging();
	initActions();
}
function getvar(varname, defval) {
	var _GET  = Tool.parseData();
	return (to_i(_GET[varname]) ? to_i(_GET[varname]) : to_i(defval));
}
function onPageData (data) {
	$("bmore").getElements("img")[0].removeClass("hide").addClass("hide");
	$("bmore").getElements("span")[0].setStyle("display", "block-inline");
	App.pageRequestSend = 0;
	if (data.success == 1) {
		var items = data.items, paging = data.paging, strip = $("strip"), pg = $("paginator"), dy = Tool.viewportSize().h - 480;
		strip.innerHTML = strip.innerHTML + items;
		pg.innerHTML = paging;
		initAjaxPaging();
		//window.scrollBy(0, dy);
		App.ajPgDy = dy;
		App.ajPgLim = App.ajPgCurSc + dy;
		App.ajPgInterval = setInterval(
			function () {
				if (window.scrollY < App.ajPgCurSc) {
					window.scrollTo(0, App.ajPgCurSc);
				}
				if (to_i(App.ajPgB) && window.scrollY == App.ajPgB) {
					clearInterval(App.ajPgInterval);
					App.ajPgB = 0;
					return;
				}
				App.ajPgCurSc += Math.round(App.ajPgDy / 8);
				if (App.ajPgCurSc > App.ajPgLim) {
					App.ajPgCurSc = App.ajPgLim;
				}
				App.ajPgB = window.scrollY;
			}, 
			100
		);
		initGetPhone();
	}
}
function initAjaxPaging() {
	function av(obj, key, val) {
		obj[key] = getvar(key, val);
	}
	if ($("moreitems")) {
		$("moreitems").onclick = function() {
			if (App.pageRequestSend) {
				return false;
			}
			var data = {};
			av(data, "page", 1);
			//av(data, "region", 0);
			//av(data, "city", 0);
			data.region = to_i($("region").value) ? to_i($("region").value) : 0;
			data.city = to_i($("city").value) ? to_i($("city").value) : 0;
			if ($("banner-in").get("html").trim() == "Заказ ГАЗели в любом городе России") {
				data.region = data.city = 0;
			}
			av(data, "people", 0);
			av(data, "box", 0);
			av(data, "term", 0);
			av(data, "far", 0);
			av(data, "near", 0);
			av(data, "piknik", 0);
			data["ajax"] = 1;
			if (App.ajaxPage) {
				data["page"] = App.ajaxPage;
				App.ajaxPage++;
			} else {
				App.ajaxPage = data["page"] + 1;
			}
			data["page"]++;
			
			$("bmore").getElements("img")[0].removeClass("hide");
			$("bmore").getElements("span")[0].setStyle("display", "none"); //block-inline
			App.pageRequestSend = 1;
			
			App.ajPgCurSc = window.scrollY;
			window.scrollTo(0, App.ajPgCurSc - 1);
			
			Tool.post("/", data, onPageData);
			return false;
		}
	}
}
function onPublic(data) {
	$$(".dbtn").setProperty("disabled", null);
	if (to_i(data.publicId) > 0) {
		$("item-" + data.publicId).dispose();
	} else {
		alert("Произошла ошибка или у вас нет прав на выполнение этого действия.\nА может, вы просто удаляете уже удаленное объявление");
	}
}
function initActions() {
	$$(".mbtn").each(
		function(b) {
			b.onclick = function() {
				var id = this.getAttribute("data-id");
				this.disabled = "disabled";
				Tool.post("/actions", {id:id, action:'public'}, onPublic);
			}
		}
	);
	$$(".dbtn").each(
		function(b) {
			b.onclick = function() {
				var id = this.getAttribute("data-id");
				this.disabled = "disabled";
				Tool.post("/actions", {id:id, action:'delete'}, onPublic);
			}
		}
	);
	initGetPhone();
	
	$("uppb").onclick = function() {
		scrollUp();
	}
	window.onscroll = function() {
		if (window.scrollY > 5) {
			App.bUdirect = 1;
			animateUpBtn();
		} else {
			App.bUdirect = 0;
			animateUpBtn();
		}
	}
}
function animateUpBtn() {
	var b =$("uppb"), op;
	if (App.bUdirect == 1) {
		b.setStyle("display", "block");
	} else {
		//TODO
	}
	App.buInterval = setInterval(
		function() {
			var d = App.bUdirect == 1? 0.01 : -0.01;
			op = b.getStyle("opacity");
			op = op + d;
			if (op > 1.0 || op < 0.0) {
				if (App.bUdirect) {
					op = 1.0;
				} else {
					op = 0.0;
				}
			}
			b.setStyle("opacity", op);
			//exit
			if (App.bUdirect && op == 1.0) {
				clearInterval(App.buInterval);
			} else if (!App.bUdirect && op == 0.0){
				clearInterval(App.buInterval);
				b.setStyle("display", 'none');
			}
		}, 
		100
	);
}

function initGetPhone() {
	$$(".gn").each(
		function(b) {
			b.onclick = function() {
				var id = this.getAttribute("data-id"),
					li = $(this).getParent("li"), 
					please = li.getElements("div.please")[0],
					ldr = please.getElements("img.ldr")[0],
					trg = please.getElements("img.result")[0],
					link = this;
				please.removeClass("hide");
				trg.onload = function () {
					ldr.addClass("hide");
				}
				trg.onerror = function () {
					alert("Попробуйте запросить телефон еще раз");
					link.disabled = null;
					trg.addClass("hide");
				}
				trg.src = "/phones/" + id;
				trg.removeClass("hide");
				this.disabled = "disabled";
				
				return false;
			}
		}
	);
}
function initUserControls() {
	$$(".delitem").each(
		function (i) {
			i.onclick = function () {
				if (confirm("Это действие нельзя отменить! Вы действительно хотите удалить объявление?")) {
					return true;
				}
				return false;
			}
		}
	);
}
//
function onAuthorize(data) {
	if (data.success == 0) {
		$("autherror").removeClass("hide");
		$$(".aformwrap")[0].setStyle("height", "220px");
	} else {
		window.location.href = "/cabinet";
		$("autherror").removeClass("hide").addClass("hide");
		$$(".aformwrap")[0].setStyle("height", "170px");
	}
}
function initAutorizeForm() {
	if ($("alayer") && $("authlink")) {
		$("authlink").onclick = function() {
			if (to_i(uid)) {
				return true;
			}
			$("alayer").toggleClass("hide");
			$("login").focus();
			//mainsfrorm
			Tool.enableInputs("mainsfrorm",  !$("alayer").hasClass("hide") );
			
			return false;
		}
	}
	if ($("aop")) {
		$("aop").onclick = function() {
			Tool.post("/cabinet", {action:"login", phone:$("login").value, password:$("password").value}, onAuthorize);
		}
		$("password").onkeydown = function(e) {
			if (e.keyCode == 13) {
				Tool.post("/cabinet", {action:"login", phone:$("login").value, password:$("password").value}, onAuthorize);
			}
		}
	}
}
function initUploader() {
	try {
		var uploadReq = new Request.File({
			url: "/podat_obyavlenie?ajaxUpload=1",
			//onRequest: progress.setStyles.pass({display: 'block', width: 0}, progress),
			onProgress: function(event){
				var loaded = event.loaded, total = event.total;
				//progress.setStyle('width', parseInt(loaded / total * 100, 10).limit(0, 100) + '%');
			},
			onComplete: function(path){
				//progress.setStyle('width', '100%');
				$("upLdr").addClass("hide");
				$("addsubmit").disabled = false;
				$("ipath").value =  $("imgview").src = path.trim();
			}
		});
		for (var i = 0; i < sz($("image").files); i++) {
			uploadReq.append("file", $("image").files[i]);
		}
		$("upLdr").removeClass("hide");
		$("addsubmit").disabled = true;
		uploadReq.send();	
	} catch(e) {
		console.log(e);
		App.sendForm = true;
	}
}
function onAddAdv(data) {
	$("addsubmit").disabled = false;
	var i, s, arr = [];
	if (data.success == 0) {
		for (i in data) {
			if (i != "success") {
				arr.push(data[i]);
			}
		}
		s = arr.join("<p>");
		$("mainsfrormerror").set("html", s).setStyle("display", "block");
		$("mainsfrormsuccess").set("html", '').setStyle("display", "none");
		scrollUp();
	} else if (data.success == 1) {
		$("mainsfrormsuccess").set("html", '<p>' + data.msg + '</p>').setStyle("display", "block");
		$("mainsfrormerror").set("html", '').setStyle("display", "none");
		scrollUp();
		if (!window.noredir) {
			setTimeout( function() {
				s = '';
				if ($("people").checked) {
					s += "&people=1";
				}
				if ($("box").checked) {
					s += "&box=1";
				}
				if ($("term").checked) {
					s += "&term=1";
				}
				if ($("far").checked) {
					s += "&far=1";
				}
				if ($("near").checked) {
					s += "&near=1";
				}
				if ($("piknik").checked) {
					s += "&piknik=1";
				}
				window.location.href = "/?city=" + $("city").value /*+ "&country=" + $("country").value*/ + "&region=" + $("region").value + s;
			}, 5*1000);
		}
		$("add").getElements("input").each(
			function(i) {
				if (i.type != "checkbox" && i.type != "submit") {
					i.value = '';
				}
			}
		);
		$("addtext").value = "";
	}
}
function scrollUp() {
	window.App.scrollYDiv = 2;
	window.App.scrollYI = setInterval(up, 100);
}
function up() {
	var y = window.scrollY, dy = y - Math.round(y / window.App.scrollYDiv );
	if (dy < 1 || isNaN(dy)) dy = 0;
	window.scrollTo(0, dy);
	window.App.scrollYDiv -= 0.5;
	//console.log(dy);
	if (dy == 0) {
		clearInterval(window.App.scrollYI);
	}
}
function initAddForm() {
	if ($("add")) {
		$("add").onsubmit = function() {
			if (App.sendForm) {
				return true;
			}
			var data = {}, addr = window.location.href.split('?')[0];
			$("add").getElements("input").each(
				function(i) {
					if (i.type != "checkbox") {
						data[i.name] = i.value;
					} else {
						if (i.checked) {
							data[i.name] = 1;
						}
					}
				}
			);
			$("add").getElements("select").each(
				function(i) {
					data[i.name] = i.value;
				}
			);
			data.addtext = $("addtext").value;
			$("addsubmit").disabled = true;
			Tool.post(addr, data, onAddAdv);
			return false;
		}
		$("image").onchange = initUploader;
	}
	if ($("smbr")) {
		$("smbr").onclick = function() {
			$("cpi").src = "/images/random?e=" + Math.random();
			return false;
		}
	}
	if ($("people")) $("people").onchange = onSwitchType;
	if ($("box")) $("box").onchange = onSwitchType;
	if ($("term")) $("term").onchange = onSwitchType;
	
	$$("textarea").each(
		function (i) {
			var rel = i.getAttribute("rel");
			if (rel) {
				if ($(rel)) {
					$(rel).set("html", sz(i.value) + " / 1000");
				}
				i.onkeyup = function() {
					if ($(rel)) {
						$(rel).set("html", sz(i.value) + " / 1000");
					}
				}
			}
		}
	);
}
function onSwitchType() {
	if ($("ipath") && $("ipath").value == '' && $("imgview")) {
		if ($("box").checked) {
			$("imgview").src = "/images/gazel.jpg";
		} else if ($("term").checked) {
			$("imgview").src = "/images/term.jpg";
		} else if ($("people").checked) {
			$("imgview").src = "/images/gpasy.jpeg";
		}
	}
}
//locationgroup
function initLocationInputs() {
	//handlers
	if (/*!$("country") || */!$("region") || !$("city")) {
		return;
	}
	$("region").onchange = function() {
		var cid = to_i(this.options[this.options.selectedIndex].value);
		//if (cid) {
			Tool.cachepost("/location", {action:"city", regionId:cid}, onCityList);
			localStorage.setItem("region", cid);
		//}
	}
	$("city").onchange = function() {
		var cid = to_i(this.options[this.options.selectedIndex].value);
		//if (cid) {
			localStorage.setItem("city", cid);
		//}
	}
	Tool.cachepost("/location", {action:"country"}, onCountryList);
}
//loadcountries
function fillLocSelect(id, data, name, getLast, lex) {
	var sl = $(id), n = 1;
	sl.options.length = 0;
	sl.options[0] = new Option(lex, 0);
	if(sz(data.list)) {
		data.list.each(
			function (i) {
				sl.options[n] = new Option(i[name], i.id);
				n++;
			}
		);
	}
	//get last
	if (getLast) {
		if (fromRegionsPage() && $('selected' + id + 'id')) {
			localStorage.setItem(id, $('selected' + id + 'id').value);
		}
		if (to_i(localStorage.getItem(id))) {
			selectByValue(id, localStorage.getItem(id));
		}else {
			$(id).onchange();
		}
	}
}
function fromRegionsPage() {
	if (document.referrer) {
		if (Tool.host() == Tool.host(document.referrer)) {
			return true;
		}
	}
	return false;
}
function onCountryList(data) {
	//var id = "country";
	//fillLocSelect(id, data, id + "_name", true, "Выберите страну");
	Tool.cachepost("/location", {action:"region", countryId:3}, onRegionList);
	localStorage.setItem("country", 3);
}
//load regions
function onRegionList(data) {
	var id = "region";
	fillLocSelect(id, data, id + "_name", true, "Все регионы");
}
//load cities
function onCityList(data) {
	var id = "city";
	fillLocSelect(id, data, id + "_name", true, 'Все города');
}		

	
