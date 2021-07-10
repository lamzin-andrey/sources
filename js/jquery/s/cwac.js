/**
 * CWAC - Core Web А Categories
 * Независящие от DOM функции работы с деревом категорий слева
*/
window.AppACME.CWAC = {
	
	/**@property {Array} bc хлебные крошки, сформированные при последнем запуске findByUrl */
	/**@property {String} lastUrl при последнем  ajax запросе списка компаний берется часть ссылки без query и ведущего слеша  */
	/**@property {Number} isSendReq при последнем  ajax запросе списка компаний устанавливается в 1  */
	/**@property {Number} popStateProc при клике на кнопку Назад браузера или устройства устанавливается в 1  */
	
				
	
	/** @property {Boolean} HISTORY_API false || true */
	HISTORY_API : !!(window.history && window.history.pushState),
	
	/**
	 * @description Инициализация работы с левым меню спец. категорий для web
	*/
	init:function() {
		var f = AppACME, o = f.CWAC, w = f.WAC;
		o.f = f;
		o.w = w;
		if (!o.isWebCategoriesTreePage()) {
			return;
		}
		AppACMEWebLibrary._get(o.onCategoriesTreeData, '/getcategoriestreejson', o.onFailLoadCTData);
	},
	/**
	 * @description
	*/
	onCategoriesTreeData:function(d) {
		var f = AppACME, o = f.CWAC, w = f.WAC;
		try {
			o.tree = d;
			w.getLinks().click(o.onClick);
			$(w.HTML_MOBILE_CATEGORY_BTN_ID).click(o.onMobileCategoryBtnClick);
			o.Lib = AppACMEWebLibrary;
			if (o.HISTORY_API) {
				$(window).bind('popstate', o.onPopState);
			}
			o.setDescriptionEllipsis();
			w.onLoadPage();
		} catch(e){o.tree = {};}
	},
	/**
	 * @description
	*/
	onFailLoadCTData:function() {
	},
	/**
	 * @description клик на элементе списка категорий
	*/
	onClick:function(evt) {
		evt.preventDefault();
		var f = AppACME, o = f.CWAC, w = f.WAC, sl = f.ShopList, target = evt.currentTarget,
			data, Lib = AppACMEWebLibrary, t, url;
		t = $(target).attr('href').replace(Lib.HTTP_HOST() );
		url = t = t.split('?')[0].replace(/^\//, '');
		
		data = o.findByUrl(t);
		if (data) {
			if (data.children && count(data.children)) {
				w.renderScopes(o.sort(data.children), data.id, o.onClick);
			} 
			if (o.isSendReq) {
				return;
			}
			if (data.seo && data.title) {
				w.setSeoData(data.seo, data.title);
				o.currentSeo = data.seo;
			}
			t = 'none';
			if(+data.allow_choose_shipping_type == 1 && jvars.showAddressInputs && $('#iStreet').val().trim() && $('#iHome').val().trim()) {
				t = 'block';
			}
			if (+data.allow_choose_shipping_type == 1 && t == 'none' && jvars.showAddressInputs) {
				o.needSetRequireLocationMsg = 1;
			}
			sl.setChooseShippingTypeFormContainerDisplay(t);
			Lib.lock('#goods-search');
			f.WAC.setActiveCss(data.id);
			o.isSendReq = 1;
			o.lastUrl = url;
			Lib._get(o.onCompaniesData, '/companiesjson?id=' + $(target).data('id'), o.onFailLoadCompaniesData);
			if (f.Desktop.isMobile() && o.categoriesIsShowed) {
				setTimeout(function(){
					o.onMobileCategoryBtnClick({preventDefault:function(){}});
				}, 1000);
			}
			
		}
	},
	/**
	 * @description 
	*/
	onCompaniesData:function(data) {
		//записать куда следует данные
		//вызвать  метод рендеринга скорее всего ShopList
		AppACME.CWAC.isSendReq = 0;
		if (data.shops.success && data.shops && data.shops.catalogs) {
			var pickup, delivery, f = AppACME, sl = f.ShopList, pCount, 
					dCount, o = f.CWAC;
			if (data.shops.catalogs_pickup || data.shops.catalogs_delivery) {
				if (data.shops.catalogs_pickup) {
					pickup = data.shops.catalogs_pickup;
					delivery = data.shops.catalogs;
					dCount = data.shops.total_count;
					pCount = data.shops.catalogs_pickup_total_count;
				} else {
					pickup = data.shops.catalogs;
					delivery = data.shops.catalogs_delivery;
					pCount = data.shops.total_count;
					dCount = data.shops.catalogs_delivery_total_count;
				}
				$(sl.HTML_DELIVERY_OBJECTS_DATA_ID).val(JSON.stringify(delivery));
				$(sl.HTML_PICKUP_OBJECTS_DATA_ID).val(JSON.stringify(pickup));
				$(sl.HTML_DELIVERY_OBJECTS_COUNT_INP_ID).val(dCount);
				$(sl.HTML_PICKUP_OBJECTS_COUNT_INP_ID).val(pCount);
				
				var chb = sl.getActiveShippingTypeCb();
				if (chb) {
					//есть разделение на доставку и самовывоз и пользователь может выбирать
					if (chb.id == 'delivery') {
						sl.onSelectShippingTypeDelivery({target:chb});;
					} else {
						sl.onSelectShippingTypePickup({target:chb});
					}
				} else {
					//есть разделение на доставку и самовывоз но пользователь не может выбирать
					o.renderShops(sl, data.shops);
				}
			} else {//вариант без разделения
				o.renderShops(sl, data.shops);
			}
			AppACMEWebLibrary.unlock('#goods-search');
			o.setBreadCrumbs();
			if (o.needSetRequireLocationMsg) {
				sl.setMessage(0, __('locationWarning'));
				o.needSetRequireLocationMsg = 0;
			}
			if (!o.popStateProc) {
				history.pushState(null, null, '/' + o.lastUrl);
			} else {
				o.popStateProc = 0;
			}
			if (o.currentSeo) {
				data.seoData.heading = o.currentSeo.heading ? o.currentSeo.heading : data.seoData.seoHeading;
				data.seoData.body = o.currentSeo.body ? o.currentSeo.body : data.seoData.seoBody;
				var tplIntro = data.seoData.seoIntro ? data.seoData.seoIntro : '';
				data.seoData.intro = o.currentSeo.intro ? o.currentSeo.intro : tplIntro;
				f.WAC.setSeoData(data.seoData);
				o.needSetSeoDataAfterLoad = false;
			}
		} else {
			//TODOalert('Вывести про ошибку что-то');
		}
	},
	/**
	 * @description отрисовка списка магазинов
	 * @param {AppACME.ShopList} sl 
	 * @param {Object} data 
	*/
	renderShops:function(sl, data) {
		$(sl.HTML_DELIVERY_OBJECTS_DATA_ID).val(JSON.stringify(data.catalogs));
		$(sl.HTML_DELIVERY_OBJECTS_COUNT_INP_ID).val(data.total_count);
		sl.filterByShippingType(sl.HTML_DELIVERY_OBJECTS_DATA_ID, sl.HTML_DELIVERY_OBJECTS_COUNT_INP_ID);
	},
	/**
	 * @description неудачная загрузка списка компаний
	*/
	onFailLoadCompaniesData:function() {
		AppACME.CWAC.isSendReq = 0;
		Lib.unlock('#goods-search');
	},
	/**
	 * @return {Boolean} true если открыта страница с категориями агрегатора в левом меню
	*/
	isWebCategoriesTreePage:function() {
		 return (jvars && jvars.isAgregateUseWebCategories && jvars.isShopsPage);
	},
	/**
	 * @description Поиск в дереве по url
	*/
	findByUrl:function(s) {
		var o = AppACME.CWAC;
		o.bc = [];
		return o.searchByIdRecursive(AppACME.CWAC.tree, s);
	},
	/**
	 * @description Поиск в дереве по id
	*/
	searchByIdRecursive:function($data, $id, lvl) {
		var $item, $o, i;
		lvl = lvl ? lvl : 0;
		//$data = __php2js_clone_argument__($data);
		if ($data instanceof Array) {
			for (i = 0; i < $data.length; i++) {
				$o = this.searchByIdRecursiveIteration($data[i], $id, lvl);
				if ($o.success) {
					return $o.result;
				}
			}
		} else if ($data instanceof Object) {
			for (i in $data) {
				$o = this.searchByIdRecursiveIteration($data[i], $id, lvl);
				if ($o.success) {
					return $o.result;
				}
			}
		}
		return null;
	},
	/**
	 * @description Поиск в дереве по id
	*/
	searchByIdRecursiveIteration:function($item, $id, lvl) {
		//console.log($item);
		var r = {}, bcItem = {};
		r.success = true;
		bcItem.link = '/' + $item.hfu_url;
		bcItem.title = $item.title;
		this.bc[lvl] = bcItem;
		if ($item.hfu_url == $id) {
			r.result = $item;
			if (this.bc.length > lvl) {
				this.bc.splice(lvl + 1);
			}
			return r;
		}
		if ($item.children) {
			$o = this.searchByIdRecursive($item.children, $id, ++lvl);
			if ($o) {
				r.result = $o;
				return r;
			}
		}
		r.success = false;
		return r;
	},
	/**
	 * @description Сортирует по полю sort
	*/
	sort:function(ls) {
		var a = [], i;
		for (i in ls) {
			if (+i) {
				a.push(ls[i]);
			}
		}
		a.sort(AppACME.CWAC.sortItreation);
		return a;
	},
	sortItreation:function(a, b) {
		if (+a.sort < +b.sort) {
			return -1;
		}
		return 1;
	},
	/**
	 * @description Установка хлебных крошек
	*/
	setBreadCrumbs:function() {
		this.bc.unshift({link : '/', title:jvars.agregateDisplayName});
		AppACME.BreadCrumbs.render(this.bc, function(){return true;});
	},
	/**
	 * @description Клик на кнопке Назад браузера
	*/
	onPopState:function() {
		var f = AppACME, o = f.CWAC, w = f.WAC, s;
		s = o.Lib.REQUEST_URI(1).split('?')[0].replace(/^\//, '');
		s = o.findByUrl(s);
		if (s && s.id) {
			s = $('#acw' + s.id);
			o.popStateProc = 1;
			o.onClick({target:s, currentTarget:s, preventDefault:function(){}});
			return;
		}
		window.location.reload();
	},
	/**
	 * @description Устанавливает многоточие при необходимости в тексте
	*/
	setDescriptionEllipsis:function() {
		var f = AppACME, o = f.CWAC, w = f.WAC, ls;
		if (o.isWebCategoriesTreePage() || (jvars && jvars.isSearchPage)) { //TODO  jvars.isSearchPage
			AppACMEWebLibrary.setEllipsis(w.HTML_PRODUCT_NAME_BLOCK_CSS);
		}
	},
	/**
	 * @description Клик на кнопке Категории в мобильной версии
	*/
	onMobileCategoryBtnClick:function(evt) {
		evt.preventDefault();
		var o = AppACME.CWAC, w = o.w, f = o.f, im = ' !important', d = 'display', b = 'block'  + im, n = 'none'  + im,
			shopList = $(f.ShopList.HTML_SEARCH_WIH_GOODS_TAB_CONTENT_ID),
			catList = $(w.HTML_TREE_CONTAINER_ID);
		if (o.categoriesIsShowed) {
			//скрываем категориии показываем список магазинов
			$(w.HTML_MOBILE_CATEGORY_BTN_ID).text(__('M_Btn_categories_text'));
			shopList[0].style = 'display :block !important';
			catList[0].style = 'display :none !important';
			o.categoriesIsShowed = 0;
		} else {
			$(w.HTML_MOBILE_CATEGORY_BTN_ID).text(__('M_Btn_categories_hide_text'));
			//catList.css('display', 'block!important');
			shopList[0].style = 'display :none !important';
			catList[0].style = 'display :block !important';
			o.categoriesIsShowed = 1;
		}
	}
};
