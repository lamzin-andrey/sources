<?php
class CApplication {
	/**
	 * @var array Массив возможных HTTP статус кодов
	 */
	private $codes = array(0=>'Domain Not Found',
	               100=>'Continue',
	               101=>'Switching Protocols',
	               200=>'OK',
	               201=>'Created',
	               202=>'Accepted',
	               203=>'Non-Authoritative Information',
	               204=>'No Content',
	               205=>'Reset Content',
	               206=>'Partial Content',
	               300=>'Multiple Choices',
	               301=>'Moved Permanently',
	               302=>'Found',
	               303=>'See Other',
	               304=>'Not Modified',
	               305=>'Use Proxy',
	               307=>'Temporary Redirect',
	               400=>'Bad Request',
	               401=>'Unauthorized',
	               402=>'Payment Required',
	               403=>'Forbidden',
	               404=>'Not Found',
	               405=>'Method Not Allowed',
	               406=>'Not Acceptable',
	               407=>'Proxy Authentication Required',
	               408=>'Request Timeout',
	               409=>'Conflict',
	               410=>'Gone',
	               411=>'Length Required',
	               412=>'Precondition Failed',
	               413=>'Request Entity Too Large',
	               414=>'Request-URI Too Long',
	               415=>'Unsupported Media Type',
	               416=>'Requested Range Not Satisfiable',
	               417=>'Expectation Failed',
	               500=>'Internal Server Error',
	               501=>'Not Implemented',
	               502=>'Bad Gateway',
	               503=>'Service Unavailable',
	               504=>'Gateway Timeout',
	               505=>'HTTP Version Not Supported');
	
	public function __construct() {
		//debug
		/*if (@$_REQUEST["errDebug"] == 1) {
			header("HTTP/1.1 404 Not Found");
			die;
		} else if(count($_POST)){
			die (json_encode(array("html" => "<p>Какой-то параграф с текстом</p>", "remoteErrorStatus" => 500, "remoteErrorText" => "Internal Server Error")) );
		}*/
		if (count($_POST)) {
			$success = $this->prepareArgs($url, $data, $message);
			if (!$success) {
				$this->json("remoteErrorStatus", '--', "remoteErrorText", $message); //$this->json содержит exit
			}
			$response = $this->request($url, $data);
			if ($response->responseStatus != 200) {
				$this->json("remoteErrorStatus", $response->responseStatus, "remoteErrorText", $response->responseStatusText);
			} else {
				$this->json("html", $response->responseText, "remoteErrorStatus", $response->responseStatus);
			}
		}
	}
	/**
	 * @desc  Проверяет поля POST запроса, есть ли все необходимые в наличии и нет ли недопустимых имен переменных 
	 * @param string &$url - url, на который надо сделать запрос 
	 * @param array  &$args - ассоциативный массив аругментов иих значений, если метод - POST
	 * @param string &message - сообщение об ошибке, если нет необходимых для воопроса данных
	 * @return bool  - true если удалось подготовить данные к запросу  
	 **/
	private function prepareArgs(&$url, &$args, &$message) {
		$method = @$_POST["method"];
		if ($method != "get" && $method != "post") {
			$message = "Не удалось определить требуемый метод запроса";
			return false;
		}
		if (!preg_match("/^https?\\:\\/\\//", @$_POST["url"], $m)) {
			$message = "Некорректный url";
			return false;
		}
		$url = $_POST["url"];
		unset($_POST["method"]);
		unset($_POST["url"]);
		$tail = array(); //на случай, если метод гет, сразу собираем в хвост
		$badNames  = array();
		foreach($_POST as $k => $i) {
			$tail[] = "$k=" . urlencode($i);
			if (!preg_match("#^[\D][a-zA-Z0-9_]+$#", $k, $m)) {
				$badNames[] = $k;
			}
		}
		if (count($badNames)) {
			$message = "недопустимые символы в именах переменных:<br/>\n" . join("<br/>\n", $badNames);
			return false;
		}
		
		if ($method == "post") {
			//TODO проверить, а не надо ли чего с кириллицей сотворить
			$args = $_POST;
		} else {
			
			foreach($_POST as $k => $i) {
				$tail[] = "$k=" . urlencode($i);
			}
			if (count($tail)) {
				$url .= "?" . join("&", $tail);
			}
		}
		return true;
	}
	/**
	 * @desc  отправляем запрос на сервер
	 * @param string $url
	 * @param array  $args
	 * @param string $userAgent = ''
	 * @param string $referer = ''
	 * @return stdClass {responseText, responseStatus. responseStatusText}
	 **/
	private function request($url, $args = array(), $userAgent = '', $referer = '') {
		$process = curl_init($url);
		curl_setopt($process, CURLOPT_HEADER, 0);
		if(count($args) > 0) {
			curl_setopt($process, CURLOPT_POSTFIELDS, $args);
		}
		
		$headers = array (
			'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
		); 
		curl_setopt($process, CURLOPT_HTTPHEADER,$headers); 
		
		if ($referrer) {
	    	curl_setopt($process, CURLOPT_REFERER, $referrer);
		}
		curl_setopt($process, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($process, CURLOPT_COOKIEFILE, dirname(__FILE__) . '/tmp/cookiefile');
		curl_setopt($process, CURLOPT_COOKIEJAR, dirname(__FILE__) . '/tmp/cookiefile');
		if ($userAgent) {
			curl_setopt($process, CURLOPT_USERAGENT, $userAgent);
		}
		@curl_setopt($process, CURLOPT_FOLLOWLOCATION, 1);
		$response = curl_exec($process);
		$httpCode = curl_getinfo($process, CURLINFO_HTTP_CODE);
		curl_close($process);
		$obj->responseText = $response;
		$obj->responseStatus = $httpCode;
		$obj->responseStatusText = $this->codes[$httpCode];
		return $obj;
	}
	/**
	 * @desc выдает в поток данные в json формате
	 * четные аргументы - ключи, нечетные - значения 
	 * */
	private function json() {
		$sz = func_num_args();
		for ($i = 0; $i < $sz; $i++) {
			if ($i + 1 < $sz) {
	 			$data[func_get_arg($i)] = func_get_arg($i + 1);
	 			$i++;
			}
	   }
	   exit(json_encode($data));
	}
}