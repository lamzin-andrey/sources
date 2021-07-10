'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShopsFilter = function () {

	/** @property int количество отфильтрованных элементов    */

	/** @property Request запрос для доступа к GET параметрам */

	/** @property array $items данные */

	/** @property array $filters уникальные значения кухонь  */

	/**
  * @description
 */

	function ShopsFilter($request, $items, $perPage) {
		_classCallCheck(this, ShopsFilter);
		this.request = $request;
		this.items = $items;
		this.sourceOrder = [];
		this.perPage = this.request.input('limit', $perPage);
		this.filters = [];
		this._initFilterProps();
	}
	
	_createClass(ShopsFilter, [{
		key: 'filter',
		/**
		 * @description filter() фильрует список магазинов в соответствии с настройками пользователя
		 * @return {Array}
		*/
		value: function filter() {
			this.sort();
			var $cuisine = this.request.input('cuisine', []),
			    $buf = [],
			    $i = void 0,
			    $length = count(this.items),
			    $s = void 0,
			    $k = 0,
			    $chunks = void 0,
			    $page = void 0,
			    /** $stdFilters - стандартные, потому что показываются всегда, независимо, на странице кухонь мы или нет*/
			    $stdFilters = this.request.input('f', []),
			    $byBallsOnly,
			    $byWorknow,
			    $bufStd = [];
			$buf = [];
			if (count($cuisine) > 0) {
				this._totalAfterFilter = 0;
				for ($i = 0; $i < $length; $i++) {
					if (count(array_intersect($cuisine, this.items[$i].array_snippet)) > 0) {
						$buf[$k] = this.items[$i];
						$k++;
						this._totalAfterFilter++;
					}
				}
			} else {
				$buf = this.items;
				this._totalAfterFilter = count($buf);
			}
			if (count($stdFilters) > 0) {
				this._totalAfterFilter = 0;
				$length = count($buf);
				$k = 0;
				$byBallsOnly = in_array('ballsOnly', $stdFilters);
				$byWorknow   = in_array('workNow', $stdFilters);
				for ($i = 0; $i < $length; $i++) {
					if (($byBallsOnly && $buf[$i].loyalty_shop_items == 1) || !$byBallsOnly) {
						if (($byWorknow && this._isWorkNow($buf[$i])) || !$byWorknow) {
							$bufStd[$k] = $buf[$i];
							$k++;
							this._totalAfterFilter++;
						}
					}
				}
				$buf = $bufStd;
			}
			$page = this.request.input('page', 1);
			$chunks = array_chunk($buf, this.perPage);
			$buf = isset($chunks[$page - 1]) ? $chunks[$page - 1] : [];
			return $buf;
		}
		/** TODO скорее всего рано или поздно понадобится */

	}, {
		key: 'sort',
		value: function sort() {
			var i, j, buf = [], key, popularKey = false, vBuf, a, b, w;
			switch (AppACME.ShopList.sortCriteria) {
				case AppACME.ShopList.SORT_BY_MIN_ORDER:
					key = 'minorder';
					break;
				case AppACME.ShopList.SORT_BY_PRICE_DELIVERY:
					key = 'deliverycost';
					break;
				case AppACME.ShopList.SORT_BY_DISTANCE:
					key = 'distance';
					break;
				case AppACME.ShopList.SORT_BY_TIME_DELIVERY:
					key = 'time';
					break;
				case AppACME.ShopList.SORT_BY_POPULAR:
					key = '';
					popularKey = true;
					break;
			}
			for (i = 0; i < this.items.length; i++) {
				for (j = 0; j < this.items.length; j++) {
					if (!popularKey && key) {
						a = this.prepareCost(this.getParamByKey(this.items[i], key));
						a = isNaN(a) ? Number.MAX_VALUE : a;
						b = this.prepareCost(this.getParamByKey(this.items[j], key));
						b = isNaN(b) ? Number.MAX_VALUE : b;
						if (a < b ) {
							vBuf = this.items[i];
							this.items[i] = this.items[j];
							this.items[j] = vBuf;
						}
					} else {
						a = this.items[i].sourceI;
						a = isNaN(a) ? 0 : a;
						b = this.items[j].sourceI;
						b = isNaN(b) ? 0 : b;
						if (a < b ) {
							vBuf = this.items[i];
							this.items[i] = this.items[j];
							this.items[j] = vBuf;
						}
					}
				}
			}
		}
	}, {
		key: 'getTotal',
		value: function getTotal() {
			return isset(this._totalAfterFilter) ? this._totalAfterFilter : count(this.items);
		}

		/**
   * @description Собирает все уникальные категории сниппетов из списка
  */
	 
	}, {
		key: 'prepareCost',
		value: function prepareCost(v) {
			v = String(v);
			var buf = v.split(/\s+/),  i, L = buf.length, w;
			for (i = 0; i < L; i++) {
				w = $.trim(buf[i]);
				if (w) {
					w = parseFloat(w.replace(/,/g, '.').replace(/[^0-9.,]/, ''));
					if (!isNaN(w)) {
						return w;
					}
				}
			}
			return parseInt('NaN');
		}

		/**
		  * @description Преобразует значение видв "от 500" в 500
  	    */

	}, {
		key: 'getParamByKey',
		value: function getParamByKey(item, key) {
			var buf = item.params, i, L = (buf && buf.length) ? buf.length : 0,
				fVal, sVal;
			for (i = 0; i < L; i++) {
				if (buf[i].title == key) {
					sVal = String(buf[i].value).replace(/,/gi, '.');
					fVal = parseFloat(sVal);
					if (String(fVal) === sVal) {
						buf[i].value = fVal;
					}
					
					if (buf[i].unit == 'kilometers') {
						return buf[i].value * 1000;
					}
					return buf[i].value;
				}
			}
			return '';
		}
		/**
		  * @description Получить значение параметра сортировки параметр
  	    */

	}, {
		key: '_initFilterProps',
		value: function _initFilterProps() {
			var $count = count(this.items),
			    $map = {},
			    $buf = [],
			    $i = void 0,
			    $j = void 0,
			    $length = void 0,
			    $k = 0,
			    $key = void 0,
			    $list = void 0,
			    $name = void 0;

			for ($i = 0; $i < $count; $i++) {
				if (!this.items[$i].sourceI) {
					this.items[$i].sourceI = $i + 1;
				}
				if (isset(this.items[$i].snippet)) {
					$list = explode(',', this.items[$i].snippet);
					$length = count($list);
					for ($j = 0; $j < $length; $j++) {
						$name = trim($list[$j]);
						$key = this._hash($name);
						if (!isset($map[$key])) {
							$map[$key] = 1;
							$buf[$k] = $name;
							$k++;
						}
					}
					this.items[$i].array_snippet = array_map(function ($i) {
						return trim($i);
					}, explode(',', this.items[$i].snippet));
				} else {
					this.items[$i].array_snippet = [];
				}
			}
			this.filters = $buf;
		}
	}, {
		key: '_hash',
		value: function _hash($s) {
			var i = void 0,
			    k = '';
			for (i = 0; i < $s.length; i++) {
				k += $s.charCodeAt(i);
			}
			return k;
		}
	}, {
	}, {
		key: '_isWorkNow',
		value: function _isWorkNow($companyInfo) {
			var $oWorktimeHelper, t;
			$companyInfo = __php2js_clone_argument__($companyInfo);
			$oWorktimeHelper = new WorktimeHelper();
			if (!isset($companyInfo, "work_times") || count($companyInfo.work_times) == 0) {
				return true;
			}
			t = time();
			return $oWorktimeHelper.isCompanyWorkNow(t, $companyInfo.work_times, $companyInfo.timezone);
		}
	}, {
		key: 'getFilters',
		value: function getFilters() {
			return this.filters;
		}
	}]);

	return ShopsFilter;
}();
