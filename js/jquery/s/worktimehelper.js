
/***
 * @class Это копия ShopHelper из ЛК
*/



function WorktimeHelper(ARGUMENTS) {
//CONSTRUCTOR_FRAGMENT
}

	/** @property int $hoursDifference сколько часов до открытия магазина */
    
    
    /** @property int $minutesDifference сколько минут до открытия магазина */
    
    
    /** @property int $secondsDifference сколько секунд до открытия магазина */
    
        
    /** @property array $_aWorkTimes нормализованный массив интервалов рабочего времени магазина */
    

WorktimeHelper.prototype._intvalFields = function($oWorkTimes) {
	if (!$oWorkTimes) {
		return;
	}
	$oWorkTimes.dof_start = intval($oWorkTimes.dof_start);
	$oWorkTimes.dof_end = intval($oWorkTimes.dof_end);
	$oWorkTimes.hour_start = intval($oWorkTimes.hour_start);
	$oWorkTimes.hour_end = intval($oWorkTimes.hour_end);
	$oWorkTimes.min_start = intval($oWorkTimes.min_start);
	$oWorkTimes.min_end = intval($oWorkTimes.min_end);	
}
WorktimeHelper.prototype.objToStr = function($oWorkTime) {
    return this._zN($oWorkTime.hour_start) + ':' + this._zN($oWorkTime.min_start) + ' - ' + this._zN($oWorkTime.hour_end) + ':' + this._zN($oWorkTime.min_end);
}
	/**
	 * @description Проверяет, принимает ли магазин в данное время заказы с учетом настройки принимать в нераьочее время
	 * @return bool true если принимает
	*/
    WorktimeHelper.prototype.allowCreateOrderByWorkTime = function($oUser) {
    
    var $aWorkTimes, $sTimezone, $now, $acceptOrder;
    
    $oUser = __php2js_clone_argument__($oUser);
    
    //принимает ли в любое время?

    if (this._isCompanyTakeOrdersInUnworkTime($oUser)) {
        return true;
    }
    $aWorkTimes = this._getCompanyWorkTimesarray($oUser);
    if (!count($aWorkTimes)) {//если компания не указала ни одного рабочего времени, считаем, что она работает всегда

        return true;
    }
    
    $sTimezone = this._getCompanyTimezone($oUser);
    if (!$sTimezone) {//если компания не указала временную зону, берем Московскую

        $sTimezone = '0';
    }
    $now = time();//TODO remove -3600

    $acceptOrder = this._isCompanyWorkNow($now, $aWorkTimes, $sTimezone);
    if (!$acceptOrder) {
        this._setTimeToAllowOrder($now, $sTimezone);
        this._aWorkTimes = [];
    }
    return $acceptOrder;
}

    /**
     * @description Устанавливает поля hoursDifference minutesDifference для формирования сообщения о нерабочем времени
     * @param int $currentTimeMoscow время в секундах по московскому времени
	 * @param string $sTimezone смещение таймзоны относительно Москвы, например '+1'
    */
    WorktimeHelper.prototype._setTimeToAllowOrder = function($currentTimeMoscow, $sTimezone) {
    
    var $time, $aWorkTimes, $dayOfWeekNumber, $aTime, $minInterval, $minIntervalFromStartOfWeek, $isFound, $oWorkTimes, $currentTimeFromStartOfWeek, $d, $daySeconds, $currentTime, $interval, phpjslocvar_0;
    
    $currentTimeMoscow = __php2js_clone_argument__($currentTimeMoscow);
    $sTimezone = __php2js_clone_argument__($sTimezone);
    
    $time = $currentTimeMoscow + this._getOffset($sTimezone);
    /** @var array $aWorkTimes массив интервалов рабюочего времени магазинаб формат элемента  {dof_start, dof_end, hour_start, hour_end, min_start, min_end} */
    $aWorkTimes = this._aWorkTimes;//нормализованый массив

    
    //День недели получаем из переведенного времени (по номеру дня выбираем из массива интервалов).

    $dayOfWeekNumber = date('N', $time);
    
    //время в секундах переводим во время в секундах от начала суток

    $time = date('H:i:s', $time);
    
    $aTime = explode(':', $time);
    $time = intval($aTime[0]) * 3600 + intval($aTime[1]) * 60 + intval($aTime[2]);
    
    /** @var int $minInterval минимальный интервал в секундах от начала текущего дня недели, нужен в том случае, если на этой неделе ещё есть интервалы, время в которых рабочее */
    $minInterval = 2000000; //seconds

    /** @var int $minIntervalFromStartOfWeek минимальный интервал в секундах от начала недели, нужен в том случае, если на этой неделе уже не осталось интервалов, время в которых рабочее */
    $minIntervalFromStartOfWeek = 2000000; //seconds 

    $isFound = false;
    
    for (phpjslocvar_0 in $aWorkTimes) { $oWorkTimes = $aWorkTimes[phpjslocvar_0];
        if ($oWorkTimes.dof_start <= $oWorkTimes.dof_end) {
            $currentTimeFromStartOfWeek = ($oWorkTimes.dof_start - 1) * 24 * 3600 + $oWorkTimes.hour_start * 3600 + $oWorkTimes.min_start * 60;
            if ($currentTimeFromStartOfWeek < $minIntervalFromStartOfWeek) {
                $minIntervalFromStartOfWeek = $currentTimeFromStartOfWeek;
            }
            if ($oWorkTimes.dof_start >= $dayOfWeekNumber || $oWorkTimes.dof_end >= $dayOfWeekNumber) {
                for ($d = $oWorkTimes.dof_start; $d <= $oWorkTimes.dof_end; $d++) {
                    if ($d < $dayOfWeekNumber) {
                        continue;
                    }
                    $daySeconds = $d - $dayOfWeekNumber;
                    $daySeconds = $daySeconds  < 0 ? 0 : $daySeconds;
                    $currentTime = $oWorkTimes.hour_start * 3600 + $oWorkTimes.min_start * 60 + $daySeconds * 24 * 3600;
                    
                    
                    if ($currentTime > $time) {
                        if ($currentTime - $time < $minInterval) {
                            $minInterval = $currentTime - $time;
                            this.hoursDifference = Math.floor($minInterval / 3600);
                            this.minutesDifference = Math.floor(Math.floor($minInterval - this.hoursDifference * 3600) / 60);
                            this.secondsDifference = $minInterval - this.hoursDifference * 3600 - this.minutesDifference * 60;
                            $isFound = true;
                        }
                    }
                }
            }
        }
        }//end foreach

    if (!$isFound) {//Выполняется только тогда, когда на этой неделе нет уже рабочих интервалов

        //прибавить к минимальному интервалу от начала недели  разницу от текущего до конца недели 

        //$time - время от начала текущего дня недели с учетом часового пояса компании

        
        $interval = $minIntervalFromStartOfWeek + this._getSecondsFromNowToEndOfWeek($time, $dayOfWeekNumber);
        this.hoursDifference = Math.floor($interval / 3600);
        this.minutesDifference = Math.floor(Math.floor($interval - this.hoursDifference * 3600) / 60);
        this.secondsDifference = $interval - this.hoursDifference * 3600 - this.minutesDifference * 60;
    }
}

	/**
     * @description Вычислить, входит ли текущее время в интервал указанный владельцем магазина
     * @param integer $time - время от начала текущего дня недели с учетом часового пояса компании
     * @param integer $weekOfDay - номер текущего дня недели с учетом часового пояса компании
     * @return integer время до конца недели в секундах
    */
    WorktimeHelper.prototype._getSecondsFromNowToEndOfWeek = function($time, $weekOfDay) {
    
    var $days, $r;
    
    $time = __php2js_clone_argument__($time);
    $weekOfDay = __php2js_clone_argument__($weekOfDay);
    
    $days  = (7 - $weekOfDay) * 24 * 3600; //осталось секунд до конца недели с полуночи текущего дня

    $r = (86400 - $time) + $days;
    return $r;
}

    /**
     * @description Вычислить, входит ли текущее время в интервал указанный владельцем магазина
     * @param string $sTimezone смещение в часах таймзоны компании относительно Москвы
     * @param StdClass $oWorkTimes {dof_start, dof_end, hour_start, hour_end, min_start, min_end} время работы компании по местному времени компании
     * @param integer  $currentTime текущее местное время в секундах (то есть в нем уже учтено смещение часового пояса)
     * @return bool true если можно принять заказ
    */
    WorktimeHelper.prototype._calculateAcceptTime = function($sTimezone, $oWorkTimes, $currentTime, $dbg) {
		
		this._intvalFields($oWorkTimes);
		
    var $is724, $safeHourEnd, $sDate, $startDay, $left, $right, $acceptOrder;
    $dbg = String($dbg) == 'undefined' ? 0 : $dbg;
    $dbg = __php2js_clone_argument__($dbg);
    $sTimezone = __php2js_clone_argument__($sTimezone);
    $oWorkTimes = __php2js_clone_argument__($oWorkTimes);
    $currentTime = __php2js_clone_argument__($currentTime);
    
    $is724 = false;
    if ($oWorkTimes.hour_end == 0 && $oWorkTimes.hour_start == 0 && $oWorkTimes.min_start == 0 && $oWorkTimes.min_end == 0 /*&& $oWorkTimes->dof_start == 1 && $oWorkTimes->dof_end == 7*/) {
        $is724 = true;
    }
    $safeHourEnd = $oWorkTimes.hour_end;
    $oWorkTimes.hour_end = $oWorkTimes.hour_end == 0 ?  24 : $oWorkTimes.hour_end;
    
    if (!$is724 && $oWorkTimes.hour_end == 24 && $oWorkTimes.hour_start == 0 && $oWorkTimes.dof_start == 1 && $oWorkTimes.dof_end == 7) {
        $oWorkTimes.hour_end = 0;
        }/**/
    if (!$is724 && $oWorkTimes.hour_end == 24 && $oWorkTimes.hour_start == 0) {
        $oWorkTimes.hour_end = 0;
        }/**/
    
    if ($oWorkTimes.hour_start > $oWorkTimes.hour_end) {
        $oWorkTimes.hour_end = $safeHourEnd;
        return true;
    }
    
    //Получить начало дня в секундах по местному времени

    
    //Здесь просто получаем 'Y-m-d 00:00:00' от currentTime 

    //	с целью проконтролировать его изменение и больше никаких офсетов не прибавляем

    $sDate = date('Y-m-d H:i:s', $currentTime);
    //$sDate = preg_replace("#[0-9]{2}\:[0-9]{2}\:[0-9]{2}" + $ + "#", '00:00:00', $sDate);
    $sDate = $sDate.replace(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}$/, '00:00:00');
    //echo "$sDate\n";

    if ($oWorkTimes.hour_end == 24 && date('H:i:s', $currentTime) == '00:00:00') {
        $sDate = date('Y-m-d H:i:s', $currentTime - 24*3600);
    }
    //echo "$sDate\n";

    $startDay = strtotime($sDate);
    //Время начала в секундах (левая граница интервала)

    $left = $startDay + $oWorkTimes.hour_start * 3600 + $oWorkTimes.min_start * 60;
    //Время окончания в секундах (правая граница интервала)

    $right = $startDay + $oWorkTimes.hour_end * 3600 + $oWorkTimes.min_end * 60;
    
    $acceptOrder = ($currentTime >= $left && $currentTime <= $right);
    
    if ($dbg) {
    }
    
    $oWorkTimes.hour_end = $safeHourEnd;
    return $acceptOrder;
}

	
	/**
	 * @return int смещение таймзоны в секундах
	*/
	WorktimeHelper.prototype._getOffset = function($sTimezone) {
    
    var $offset;
    
    $sTimezone = __php2js_clone_argument__($sTimezone);
    
    $offset = parseFloat($sTimezone) * 3600;
    return $offset;
}

	/**
	 * @description Возвращает true если компания работает в $currentTime
	 * @param int $currentTimeMoscow время в секундах по московскому времени
	 * @param array $aWorkTimes массив интервалов рабюочего времени магазинаб формат элемента  {dof_start, dof_end, hour_start, hour_end, min_start, min_end}
	 * @param string $sTimezone смещение таймзоны относительно Москвы, например '+1'
	*/
	WorktimeHelper.prototype._isCompanyWorkNow = function($currentTimeMoscow, $aWorkTimes, $sTimezone, $dbg) {
    var $time, $dayOfWeekNumber, $oWorkTimes, phpjslocvar_0;
    $dbg = String($dbg) == 'undefined' ? 0 : $dbg;
    $dbg = __php2js_clone_argument__($dbg);
    $currentTimeMoscow = __php2js_clone_argument__($currentTimeMoscow);
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    $sTimezone = __php2js_clone_argument__($sTimezone);
    
    //если не задан ни один интервал работы компании считаем, что она работает 7 /24

    if(count($aWorkTimes) == 0) {
        return true;
    }
    
    //Поскольку date на сервере возвращает в московском часовом поясе, переводим его в местное время компании и сравниваем.

    $time = $currentTimeMoscow + this._getOffset($sTimezone);
    
    //При переборе массива учитываем что day_start может быть больше чем day_end

    //Переставить их местами недостаточно!

    //Добавить метод, который удаляет такие элементы из массива а на их место вставляет правильные

    //то есть если у нас вс - ср будет запись 7 - 3

    //ее удаляем и вставляем 1-3 и 7

    $aWorkTimes = this._normalizeCompanyWorkTimes($aWorkTimes);
    //День недели получаем из переведенного времени (по номеру дня выбираем из массива интервалов).

    $dayOfWeekNumber = date('N', $time);
    for (phpjslocvar_0 in $aWorkTimes) { $oWorkTimes = $aWorkTimes[phpjslocvar_0];
		this._intvalFields($oWorkTimes);
        if ($oWorkTimes.dof_start <= $oWorkTimes.dof_end) {//те которые не удовлетворяют условию уже заменены на удовлетворяющие в _normalizeCompanyWorkTimes

            if ($oWorkTimes.dof_start <= $dayOfWeekNumber && $oWorkTimes.dof_end >= $dayOfWeekNumber) {
                if (this._calculateAcceptTime($sTimezone, $oWorkTimes, $time, $dbg)) {
                    return true;
                }
            }
        }
    }
    return false;
}

	/**
	 * !! Ручное тестирование
	 * @description Проверка, установлена ли у компании настройка "Принимать заказы в нерабочее время"
	 * @return bool true если компания принимает зпаказы в нерабочее время
	*/
	WorktimeHelper.prototype._isCompanyTakeOrdersInUnworkTime = function($oUser) {
    
    var $aParams, $r;
    
    $oUser = __php2js_clone_argument__($oUser);
    
    $aParams = Arr.pluck($oUser.params, 'value', 'param');
    $r = Helper.getDefaultParam('take_orders_after_hours', Arr.get($aParams, 'take_orders_after_hours', '1'));
    return $r;
}

	/**
	 * !! Ручное тестирование
	 * @description Получить все интервалы времени, указанные компанией как рабочие
	 * @return collection of object Model_User_Work_Time
	*/
	WorktimeHelper.prototype._getCompanyWorkTimesArray = function($oUser) {
    
    $oUser = __php2js_clone_argument__($oUser);
    
    return Model_User_Work_Time.find('all', {'where' : [['user_id', '=', $oUser.id]] });
}

	/**
	 * @description  есть если у нас есть элементы вида вс - ср   запись 7 - 3 ее удаляем и вставляем 1-3 и 7
	 * @params $aWorkTimes array of {dof_start, dof_end, hour_start, hour_end, min_start, min_end}
	*/
	WorktimeHelper.prototype._normalizeCompanyWorkTimes = function($aWorkTimes) {
    
    var $sz, $i, $item;
    
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    
    //При переборе массива учитываем что day_start может быть больше чем day_end

    //Переставить их местами недостаточно!

    //Добавить метод, который удаляет такие элементы из массива а на их место вставляет правильные

    //то есть если у нас вс - ср будет запись 7 - 3

    //ее удаляем и вставляем 1-3 и 7

    //Посмотреть, как правильно для 7 в бд создается и такую же создать.

    $aWorkTimes = array_values($aWorkTimes);
    $sz = count($aWorkTimes); //будет увеличиваться, но нам весь проходить не надо

    for ($i = 0; $i < $sz; $i++) {
        $item = $aWorkTimes[$i];
        if ($item.dof_start > $item.dof_end) {
            $aWorkTimes = this._appendNormalizeWorkTimesIntervals($aWorkTimes, $item);
        }
    }
    this._aWorkTimes = $aWorkTimes;
    return $aWorkTimes;
}

	/**
	 * @description если $item  вида вс - ср   (7 - 3)  вставляем 1 - 3 и 7
	 * @params $aWorkTimes array of {dof_start, dof_end, hour_start, hour_end, min_start, min_end}
	 * @params $item Model_User_Work_Time  {dof_start, dof_end, hour_start, hour_end, min_start, min_end}
	 * @return $aWorkTimes array of {dof_start, dof_end, hour_start, hour_end, min_start, min_end}
	*/
	WorktimeHelper.prototype._appendNormalizeWorkTimesIntervals = function($aWorkTimes, $item) {
    
    var $newItemHead, $newItemTail;
    
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    $item = __php2js_clone_argument__($item);
    
    if ($item.dof_start > $item.dof_end) {
        $newItemHead = new StdClass();
        $newItemHead.hour_start = $item.hour_start;
        $newItemHead.hour_end   = $item.hour_end;
        $newItemHead.min_start  = $item.min_start;
        $newItemHead.min_end    = $item.min_end;
        $newItemHead.dof_start  = $item.dof_start;
        $newItemHead.dof_end     = 7;
        $aWorkTimes.push($newItemHead);
        
        $newItemTail = new StdClass();
        $newItemTail.hour_start = $item.hour_start;
        $newItemTail.hour_end   = $item.hour_end;
        $newItemTail.min_start  = $item.min_start;
        $newItemTail.min_end    = $item.min_end;
        $newItemTail.dof_start  = 1;
        $newItemTail.dof_end    = $item.dof_end;
        $aWorkTimes.push($newItemTail);
    }
    return $aWorkTimes;
}

	
	/**
	 * !!Ручное тестирование
	 * @description Таймзона региона компании, смещение относительно Москвы(!)
	 * @return string like '+1'  || false
	*/
	WorktimeHelper.prototype._getCompanyTimezone = function($oUser) {
    
    var $data;
    
    $oUser = __php2js_clone_argument__($oUser);
    
    $data = Model_User_Param.find('first', {'where' : [
        ['user_id', '=', $oUser.id],
        ['param', '=', 'timezone'],
        ] });
    if ($data) {
        return $data.value;
    }
    return false;
}

	/**
	 * @description Сообщение, сколько ждать до открытия
	*/
	WorktimeHelper.prototype.getMessage = function() {
    
    var $hourLexema, $minutesLexema, $secondsLexema;
    
    $hourLexema    = Helper.pluralize(this.hoursDifference, '', 'час', 'часа', 'часов');
    $minutesLexema = Helper.pluralize(this.minutesDifference, '', 'минуту', 'минуты', 'минут');
    $secondsLexema = Helper.pluralize(this.secondsDifference, '', 'секунду', 'секунды', 'секунд');
    if (this.hoursDifference > 0) {
        return sprintf(__('message.order-error-work-time-full'), this.hoursDifference, $hourLexema, this.minutesDifference, $minutesLexema, this.secondsDifference, $secondsLexema);
    }
    if (this.hoursDifference == 0 && this.minutesDifference > 0) {
        return sprintf(__('message.order-error-work-time-min-sec'), this.minutesDifference, $minutesLexema, this.secondsDifference, $secondsLexema);
    }
    if (this.hoursDifference == 0 && this.minutesDifference == 0 && this.secondsDifference > 0) {
        return sprintf(__('message.order-error-work-time-sec'), this.secondsDifference, $secondsLexema);
    }
}

	/**
	 * @description Устанавливает поля created_at updated_at в соответствии с часовым поясом компании
	 * @param Model_Catalog_Order $oOrder
	*/
	WorktimeHelper.prototype.setOrderCreatedAtTimezone = function($oOrder) {
    
    var $oUser, $time;
    
    $oOrder = __php2js_clone_argument__($oOrder);
    
    $oUser = Model_User.find($oOrder.user_id);
    if ($oUser) {
        $time = strtotime($oOrder.created_at) + this._getOffset( this._getCompanyTimezone($oUser) );
        $oOrder.created_at = date('Y-m-d H:i:s', $time);
        $time = strtotime($oOrder.updated_at) + this._getOffset( this._getCompanyTimezone($oUser) );
        $oOrder.updated_at = date('Y-m-d H:i:s', $time);
    }
}

	/**
	 * @description Открыл метод _isCompanyWorkNow для удобства использования
	 * @params @see _isCompanyWorkNow
	*/
	WorktimeHelper.prototype.isCompanyWorkNow = function($now, $aWorkTimes, $sTimezone) {
    
    $now = __php2js_clone_argument__($now);
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    $sTimezone = __php2js_clone_argument__($sTimezone);
    
    return this._isCompanyWorkNow($now, $aWorkTimes, $sTimezone);
}

	/**
	 * @description Открыл метод _normalizeCompanyWorkTimes для удобства использования
	 * @params aWorkTimes
	*/
	WorktimeHelper.prototype.normalizeCompanyWorkTimes = function($aWorkTimes) {
    
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    
    return this._normalizeCompanyWorkTimes($aWorkTimes);
}

	/**
	 * @description Определяет, существует ли в данный день интервал времени работы, заказнчивающийся на 00:00
	 * @param array of string вида '08:00 - 13:00'
	 * @return StdClass {isOverflow:bool, nCurrentDayIntervalIndex:int}
	 * 	bool isOverflow  true когда интервал заканчивается на 00:00
	 *  int nCurrentDayIntervalIndex индекс в массиве $aWorkInterval того интервала, который заказнчивается на 00:00
	*/
	WorktimeHelper.prototype.intervalIsIOverflow = function($aWorkInterval) {
    
    var $result, $j, $i, $s;
    
    $aWorkInterval = __php2js_clone_argument__($aWorkInterval);
    
    $result = new StdClass();
    $result.isOverflow = false;
    $result.nCurrentDayIntervalIndex = -1;
    for ($j in $aWorkInterval) { $i = $aWorkInterval[$j];
        $s = this._getEndStrIntervalPart($i);
        if ($s == '00:00') {
            $result.nCurrentDayIntervalIndex = $j;
            $result.isOverflow = true;
            return $result;
        }
    }
    return $result;
}

	/**
	 * @description Определяет, существует ли интервал времени работы компании в день, следующий за $nDay, который начинается в полночь (то есть начинается с 00:00)
	 * @param array of array $aWorkDay ключи - индексы дней недели (1 - понедельник, 7 - воскресение), значения массивы строк вида  '08:00 - 13:00'
	 * @param int $nDay
	 * @return StdClass {isContinuous:bool, nextDayIndex:int, nSubArrayN:int}
	 *  bool isContinuous равно true когда существует интервал времени работы компании в день, следующий за $nDay, который начинается в полночь (то есть начинается с 00:00)
	 *  int  nextDayIndex номер дня, следующего за nDay
	 *  int  nSubArrayN   индекс элемента массива, содержащемся в $aWorkDay[nextDayIndex], в котоорм находитися строка, начинаю.щаяся с 00:
	*/
	WorktimeHelper.prototype.isNextDayStartInHalfnight = function($aWorkDay, $nDay, $nDbg) {
    var $result, $i, $s, $a;
    $nDbg = String($nDbg) == 'undefined' ? false : $nDbg;
    $nDbg = __php2js_clone_argument__($nDbg);
    $aWorkDay = __php2js_clone_argument__($aWorkDay);
    $nDay = __php2js_clone_argument__($nDay);
    
    $result = new StdClass();
    $result.isContinuous = false;
    $result.nSubArrayN   = -1;
    $result.nextDayIndex = ($nDay + 1) > 7 ? 1 : ($nDay + 1);
    if (isset($aWorkDay, $result.nextDayIndex)) {
        for ($i in $aWorkDay[$result.nextDayIndex]) { $s = $aWorkDay[$result.nextDayIndex][$i];
            $a = explode('-', $s);
            $s = trim($a[0]);
            if ($s == '00:00') {
                $result.isContinuous = true;
                $result.nSubArrayN = $i;
                return $result;
            }
        }
    }
    return $result;
}

	/**
	 * @param string $s строка вида '00:00 - 19:00'
	 * @return bool true если окончание временного интервала переданного в строке больше чем 05:59
	*/
	WorktimeHelper.prototype.needSplitInterval = function($s) {
    
    var $oHhMm, $h, $m;
    
    $s = __php2js_clone_argument__($s);
    
    $s = this._getEndStrIntervalPart($s);
    $oHhMm = this._parseHhMm($s);
    $h = $oHhMm.nH;
    $m = $oHhMm.nM;
    if ($h > 5) {
        return true;
        } else if($h == 5 && $m > 0){
        return true;
    }
    return false;
}

	/**
	 * @param string $s строка вида '00:00 - 19:00'
	 * @return string временный интервал, начало которого смещено на 5 часов вперед
	*/
	WorktimeHelper.prototype.splitInterval = function($s) {
    
    var $sEnd;
    
    $s = __php2js_clone_argument__($s);
    
    $sEnd  = this._getEndStrIntervalPart($s);
    return ('05:00 - ' + $sEnd);
}

	/**
	 * @param string $sInterval  строка вида '00:00 - 19:00'
	 * @param string $sInterval2  строка вида '00:00 - 19:00'
	 * @return string строка, объединенный интервал от начала первого до конца второго
	*/
	WorktimeHelper.prototype.addTimeToInterval = function($sInterval, $sInterval2) {
    
    var $a, $sEnd, $oEnd, $s, $m;
    
    $sInterval = __php2js_clone_argument__($sInterval);
    $sInterval2 = __php2js_clone_argument__($sInterval2);
    
    $a = explode('-', $sInterval);
    $sEnd = this._getEndStrIntervalPart($sInterval2);
    $oEnd = this._parseHhMm($sEnd);
    if ($oEnd.nH > 5 || ($oEnd.nH == 5 && $oEnd.nM > 0)) {
        $sEnd = '05:00';
    }
    $s = trim($a[0]) + ' - ' + $sEnd;
    if (preg_match("#^[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}" + $ + "#", $s, $m)) {
        return $s;
    }
    return $sInterval;
}

	/**
	 * @description Преобразует интервалы вида пн 09:00 - 00:00, вт 00:00 - 02:00 к виду 
	 *                 пн 09:00 - 02:00
	 *                 (вторник удалён)
	 * интервалы вида пн 09:00 - 00:00, вт 00:00 - 06:00 к виду 
	 *                 пн 09:00 - 05:00 
	 *                 вт 05:00 - 06:00
	 * @param array of array  $aWorkTimes Формат элемента массива:
	 * 		первый элемент: интервал дней недели в виде 2 - 5   (1 - понедельник, 7 - воскресение),
	 *      второй элемент: строка вида  '08:00 - 13:00'
	 * @return array of array ключи - дни недели, значения - интервалы, "скленные" как написано в @description
	*/
	WorktimeHelper.prototype.customizeWorktimeIntervals = function($aWorkTimes) {
    
    var $weekDays, $aWorkDay, $aWorkTime, $aWorkDays, $i, $oWorktimeHelper, $nDay, $workInterval, $oResult, $dbg, $nextDayInfo, $sNextInterval, $buf, $item, $s, phpjslocvar_0;
    
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    
    $weekDays = {
        1 : 1,//'mon',
        
        2 : 2,//'tue',
        
        3 : 3,//'wed',
        
        4 : 4,//'thu',
        
        5 : 5,//'fri',
        
        6 : 6,//'sat',
        
        7 : 7 //'sun',
        
        };
    $aWorkDay = [];
    for (phpjslocvar_0 in $aWorkTimes) { $aWorkTime = $aWorkTimes[phpjslocvar_0];
        $aWorkDays = explode(' - ', $aWorkTime[0]);
        if (count($aWorkDays) > 1) {
            if ($aWorkDays[0] <= $aWorkDays[1]) {
                for ($i = $aWorkDays[0]; $i <= $aWorkDays[1]; $i++) {
                    if (!isset($aWorkDay,$weekDays,$i)) {
                        $aWorkDay[$weekDays[$i]] = [$aWorkTime[1] ];
                        } else if(!in_array($aWorkTime[1], $aWorkDay[$weekDays[$i]])){
                        $aWorkDay[$weekDays[$i]].push($aWorkTime[1]);
                    }
                }
                } else {
                for ($i = $aWorkDays[0]; $i <= 7; $i++) {
                    if (!isset($aWorkDay,$weekDays,$i)) {
                        $aWorkDay[$weekDays[$i]] = [ $aWorkTime[1] ];
                        } else if(!in_array($aWorkTime[1], $aWorkDay[$weekDays[$i]])){
                        $aWorkDay[$weekDays[$i]].push($aWorkTime[1]);
                    }
                }
                for ($i = 1; $i <= $aWorkDays[1]; $i++) {
                    if (!isset($aWorkDay,$weekDays,$i)) {
                        $aWorkDay[$weekDays[$i]] = [$aWorkTime[1] ];
                        } else if(!in_array($aWorkTime[1], $aWorkDay[$weekDays[$i]])){
                        $aWorkDay[$weekDays[$i]].push($aWorkTime[1]);
                    }
                }
            }
        }
    }
    
    $oWorktimeHelper = new WorktimeHelper();
    for ($nDay in $aWorkDay) { $workInterval = $aWorkDay[$nDay];
        //если в определенный день заканчиваем в полночь

        $oResult = $oWorktimeHelper.intervalIsIOverflow($workInterval);
        $dbg = false;
        if ($oResult.isOverflow) {//->nCurrentDayIntervalIndex - индекс элемента массива в котором заказнчивается на 00:00

            
            //если в next день начинаем в полночь

            $nextDayInfo = $oWorktimeHelper.isNextDayStartInHalfnight($aWorkDay, $nDay);
            
            if ($nextDayInfo.isContinuous) {//$nextDayIndex  - номер след. дня в $aWorkDay, $nSubArrayN индекс элемента массива (в nextDay) в котором заказнчивается на 00:00

                $sNextInterval = $aWorkDay[$nextDayInfo.nextDayIndex][$nextDayInfo.nSubArrayN];
                //изменить или удалить интервал в next дне (удалитьл если он с 00 00 до 00 05 или меньше чем 05 00)

                if($oWorktimeHelper.needSplitInterval($aWorkDay[$nextDayInfo.nextDayIndex][$nextDayInfo.nSubArrayN])) {
                    $aWorkDay[$nextDayInfo.nextDayIndex][$nextDayInfo.nSubArrayN] = $oWorktimeHelper.splitInterval($aWorkDay[$nextDayInfo.nextDayIndex][$nextDayInfo.nSubArrayN]);
                    } else {
                    unset($aWorkDay[$nextDayInfo.nextDayIndex][$nextDayInfo.nSubArrayN]);
                }
                //переписать интервал в current дне

                if (!is_array($aWorkDay[$nDay])) {
                    $aWorkDay[$nDay] = [];
                }
                if (!isset($aWorkDay, $nDay, $oResult.nCurrentDayIntervalIndex)) {
                    $aWorkDay[$nDay][$oResult.nCurrentDayIntervalIndex] = '00:00 - 00:00';
                }
                $aWorkDay[$nDay][$oResult.nCurrentDayIntervalIndex] = $oWorktimeHelper.addTimeToInterval($aWorkDay[$nDay][$oResult.nCurrentDayIntervalIndex], $sNextInterval);
            }
        }
    }
    $buf = [];
    $weekDays = {
        1 : 'mon',
        2 : 'tue',
        3 : 'wed',
        4 : 'thu',
        5 : 'fri',
        6 : 'sat',
        7 : 'sun'
        };
    for ($nDay in $aWorkDay) { $item = $aWorkDay[$nDay];
        $s = join(', ', $item);
        if ($s) {
            $buf[$weekDays[$nDay]] = $s;
        }
    }
    $aWorkDay = $buf;
    return $aWorkDay;
}

	
	/**
	 * @param string $s строка вида '00:00 - 19:00'
	 * @return string окончание временного интервала переданного в строке
	*/
	WorktimeHelper.prototype._getEndStrIntervalPart = function($s) {
    
    var $a;
    
    $s = __php2js_clone_argument__($s);
    
    $s = trim($s);
    $a = explode('-', $s);
    $s = isset($a, "1") ? trim($a[1]) : '';
    return $s;
}

	/**
	 * @param string $s строка вида 00:10
	*/
	WorktimeHelper.prototype._parseHhMm = function($s) {
    
    var $a, $m, $h, $result;
    
    $s = __php2js_clone_argument__($s);
    
    $s = trim($s);
    $a = explode(':', $s);
    $m = isset($a, "1") ? $a[1] : 0;
    $h = intval(trim($a[0]));
    $m = intval(trim($m));
    $result = new StdClass();
    $result.nH = $h;
    $result.nM = $m;
    $result.sH = ($h < 10 ? ('0' + $h) : $h);
    $result.sM = ($m < 10 ? ('0' + $m) : $m);
    return $result;
}

	/**
	 * @description преобразует временные интервалы  из формата описанного в параметре _normalizeCompanyWorkTimes в формат описанный в параметре customizeWorktimeIntervals
	*/
	WorktimeHelper.prototype.prepareWorktimmeIntervals = function($aWorkTimes) {
    
    var $aR, $oWorkTime, $item, phpjslocvar_0;
    
    $aWorkTimes = __php2js_clone_argument__($aWorkTimes);
    
    $aR = [];
    for (phpjslocvar_0 in $aWorkTimes) { $oWorkTime = $aWorkTimes[phpjslocvar_0];
        $oWorkTime.hour_start = $oWorkTime.hour_start == 24 ? '0' : $oWorkTime.hour_start;
        $oWorkTime.hour_end = $oWorkTime.hour_end == 24 ? '0' : $oWorkTime.hour_end;
        $item = [$oWorkTime.dof_start + ' - ' + $oWorkTime.dof_end];
        $item.push(this.objToStr($oWorkTime));
        $aR.push($item);
    }
    return $aR;
}

	WorktimeHelper.prototype._zN = function($n) {
    
    $n = __php2js_clone_argument__($n);
    
    $n = $n < 10 ? ('0' + $n) : $n;
    return $n;
}
	
