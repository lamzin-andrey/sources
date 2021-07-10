/** @class Яндекс карты для вкладки новости*/
window.AppACME = window.AppACME || {};
window.AppACME.Yamap  = {
	/** @property {String} HTML_YAMAP_CONTAINER_ID контейнера с картой*/
	HTML_YAMAP_CONTAINER_ID : "#yamap",
	
	/** @property {String} HTML_YAMAP_POINTS_ID с данными о точках самовывоза */
	HTML_YAMAP_POINTS_ID    : "#ymdata",
	
	/** @property {String} HTML_YAMAP_DZONE_DATA_ID с данными о зонах доставки */
	HTML_YAMAP_DZONE_DATA_ID    : "#ymdatazone",
	
	/** @property {Array} polygons полигоны Яндекс-карты */
	polygons    : [],
	
	init:function() {},
	onYamapsInit:function(){
		var o = AppACME.Yamap, data = $(o.HTML_YAMAP_POINTS_ID ).val(),
			dzoneData = $(o.HTML_YAMAP_DZONE_DATA_ID).val(),
			center, points = [];
		try {
			
			dzoneData = dzoneData ? dzoneData : '[]';
			data = data  ? data : '[]';
			data = JSON.parse(data);
			dzoneData = JSON.parse(dzoneData);
			
			//console.log(data);
			//console.log(dzoneData);
			var center = o.getCenter(data, points, dzoneData);
			var zoom = center.pop();
			//console.log(center);
			o.map = new ymaps.Map(o.HTML_YAMAP_CONTAINER_ID.replace('#', ''), {
				center: center, 
				zoom: zoom
			});
			for (i = 0; i < points.length; i++) {
				o.map.geoObjects.add(points[i]);
			}
			for (i = 0; i < dzoneData.length; i++) {
				o.drawPolygon(dzoneData[i].polygon);
			}
		}catch(e){
			data = null;
		}
	},
	/**
	 *@param {Array} data - данные о точках самовывоза
	 *@param {Array} points - массив, в который буду помещены точки
	 *@param {Array} dzoneData - данные о зонах доставки
	*/
	getCenter:function(data, points, dzoneData) {
		var i, lats = [], lngs = [], r =[], minLat, maxLat, minLong,
			maxLong, dX, dY, maxD, corrector = 1, dx = 0, o = this;
		for (i = 0; i < data.length; i++) {
			lats.push( data[i].lat );
			lngs.push( data[i].lng );
			points.push( o.prepareItem(data[i]) );
		}
		o.removePolygons();
		for (i = 0; i < dzoneData.length; i++) {
			/*lats.push( dzoneData[i].lat );
			lngs.push( dzoneData[i].lng );/**/
			o.grabPolygon(dzoneData[i].polygon, lats, lngs);
			points.push( o.prepareDeliveryItem(dzoneData[i]));
		}
		minLat  = Math.min.apply(null, lats);
		maxLat  = Math.max.apply(null, lats);
		minLong = Math.min.apply(null, lngs);
		maxLong = Math.max.apply(null, lngs);
		
		
		dY = maxLong - minLong;
		dX = maxLat - minLat;
		maxD = (dX > dY ? dX : dY);
		var zoom = 10;
		if (maxD > 1 && maxD < 10) {
			zoom = 6;
		} else if (maxD >= 10 && maxD < 20) {
			zoom = 4;
			
		} else if (maxD < 100 && maxD > 60) {
			zoom = 5;
			corrector = -1;
		} else if (maxD < 60 && maxD > 20) {
			zoom = 3;
		} else if (maxD > 100){
			zoom = 2;
			corrector = -1;
		} else if (maxD < 1 && maxD > 0.1){
			zoom = 10;
			dx = 0.15;
		} else if (maxD < 0.1 && maxD > 0.01){
			zoom = 11;
			dx = 0.01;
		} else {
			zoom = 10;
		}
		
		r.push(minLat + Math.round((maxLat - minLat) / 2));
		r.push(minLong  + dx + corrector * Math.round((maxLong - minLong) / 2));
		r.push(zoom);
		return r;
	},
	/**
	 * @description Готовит элемент списка для добавления на карту
	*/
	prepareItem:function(item) {
		//console.log(item.name);
		var r = new ymaps.Placemark([item.lat, item.lng],
			{
				hintContent:item.title,
				balloonContent: item.name
			}
		);
		return r;
	},
	/**
	 * @description Собирает координаты всех вершин всех полигонов
	*/
	grabPolygon:function(polygon, lats, lngs) {
		var i, j, p = polygon,
		c;//контур
		for (i = 0; i < p.length; i++) {
			c = p[i];
			for (j = 0; j < c.length; j++) {
				lats.push(c[j][0]);
				lngs.push(c[j][1]);
			}
		}
	},
	/**
	 *@description 
	*/
	prepareDeliveryItem:function(item) {
		var n = '<br>', s = ' ', r = new ymaps.Placemark([item.lat, item.lng],
			{
				hintContent:item.name,
				balloonContent: __('contacts-address-modal-form-delivery-cost') + s + intval(item.delivery_cost) + n + 
								__('Delivery_time') + s + intval(item.delivery_time) + n + 
								__('MinOrderSum') + s + intval(item.min_order_sum) + n/* + 
								__('MinOrderSumFree') + s + intval(item.min_order_sum_free) + n*/
			}
		);
		return r;
	},
	/**
	 *@description Удаляет все полигоны
	*/
	removePolygons:function() {
		var o = this;
		for (i = 0; i < o.polygons; i++) {
			o.map.geoObjects.remove(o.polygons[i]);
		}
	},
	/**
	 *@description Рисует все полигоны
	*/
	drawPolygon:function(p) {
		var oP = new ymaps.Polygon([
			// Координаты внешнего контура.
			p[0],
			(p[1] ? p[1] : []),
			(p[2] ? p[2] : [])
		], {
			//hintContent: "Многоугольник"
		}, {
			//fillColor: '#6699ff',
			// Делаем полигон прозрачным для событий карты.
			interactivityModel: 'default#transparent',
			strokeWidth: 4,
			opacity: 0.2
		});
		this.polygons.push(oP);
		this.map.geoObjects.add(oP);
	}
};

