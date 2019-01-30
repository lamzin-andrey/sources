<?php
function msg($s) {
	print "$s\n";
}

function cpoint($msg = '', $cmd = '') {
	global $dbg_start_time, $dbg_total_start_time;
	if ($cmd == 'set') {
		if (!$dbg_total_start_time) {
			$dbg_total_start_time = microtime(true);
		}
		$dbg_start_time = microtime(true);
		if ($msg) {
			print "{$msg}\n";
		}
	} else {
		$time = microtime(true) - $dbg_start_time;
		print $msg . ': ' . "{$time}\n";
		if ($cmd == 'total') {
			$time = microtime(true) - $dbg_total_start_time;
			print 'Total: ' . "{$time}\n";
		}
	}
}

class SimpleTestEngine {
	protected $_task;              //устанавливается пользователем: тестируемая задача
	protected $_method;            //устанавливается пользователем: тестируемая функция (класса)
	private $_list = array();      //список определенных пользователем функций в тестировочном классе
	private $_errors = array();    //массив ошибок
	private $_current_work_method; //текущий метод определенный пользователем
	
	public function __construct($app) {
		$this->app = $app;
		$methods = get_class_methods($this);
		foreach ($methods as $m) {
			if (strpos($m, 'test') === 0) {
				$this->reg($m);
			}
		}
	}
	public  function run() {
		foreach ($this->_list as $test_method) {
			msg("call $test_method");
			$this->_current_work_method = $test_method;
			$this->_method = 'unknown';
			$this->_task = 'unknown';
			$this->$test_method($this->app, $this->_errors);
		}
		msg("=======================================");
		$c = count($this->_errors);
		if ($c == 0) {
			msg("OK");
		} else {
			msg("ERRORS ({$c}):");
		}

		foreach ($this->_errors as $e) {
			msg($e."\n");
		}

	}
	private function reg($m) {
		$this->_list[] = $m;
	}
	public function setTask($s) {
		$this->_task = $s;
		msg('task: '. $s);
	}
	public function setTestingMethodName($s) {
		$this->_method = $s;
		msg('test method '. $s .'...');
	}
	public function addError($s) {
		$this->_errors[] = "workMethod: {$this->_current_work_method}, execute method {$this->_method}, task {$this->_task}: {$s}";
	}
	public function expect($real, $expected) {
		$this->addError("Expected {$expected}, got {$real}");
	}
}
