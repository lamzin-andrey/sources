<?php
class CApplication {
	private $_config = array();
	/**
	 * @constructor
    */
	public function __construct() {
		$this->_readConfig();
	}
	/**
	 * @desc Считывает конфиг приложения
    */
	private function _readConfig() {
		$filename = dirname(__FILE__) . '/app.ini';
		$h = fopen($filename, 'r');
		$path = array();
		$line = 0;
		while ($s = fgets($h)) {
			$this->_addConfStr($s, $line);
			$line++;
		}
		fclose($h);
		
		//отладочный вывод
		var_dump($this->_config);
		echo "<pre>";
		print_r($this->_config);
		echo "</pre>";
	}
	/**
	 * @desc Добавляет строку в конфиг, бросает исключение, если строка не валидна
	 *         (точки подряд, нет =, пустой ключ, пустое значение)
    */
	private function _addConfStr($s, $line) {
		$pair = explode('=', $s);
		if (count($pair) == 2) {
			if (trim($pair[1]) == '') {
				throw new Exception('Invalid config data in line ' . $line . '. Empty value.');
			}
			$value = trim($pair[1], "\n '\"");
			if (strval($value) === strval( intval($value) )) {
				$value = intval($value);
			} elseif (strval($value) === strval( floatval($value) )) {
				$value = floatval($value);
			}else {
				if ($value === 'true') {
					$value = true;
				}
				if ($value === 'false') {
					$value = false;
				}
			}
			$raw_key_data = explode('.', trim($pair[0]));
			$pointer = &$this->_config;
			$j = 0;
			foreach ($raw_key_data as $item) {
				$key = trim($item);
				if ($key) {
					if (!isset($pointer[$key])) {
						$pointer[$key] = array();
					}
					$pointer = &$pointer[$key];
					$j++;
				} else {
					throw new Exception('Invalid config data in line ' . $line . '. Empty key or two or more dot.');
				}
			}
			if ($j) {
				$pointer = $value;
			}
		} else {
			throw new Exception('Invalid config data in line ' . $line . '. Separator = not found.');
		}
		
	}
}

//run
new CApplication();
