<?php
require_once APP_ROOT . '/cshinglemethod.php';
class CApplication {
	public $result = null;
	public $microtime = null;
	public function __construct() {
		$this->_processRequest();
	}
	
	private function _processRequest() {
		if ( $this->postValue('action') == 'compareShingle' && $this->postValue('text1') && $this->postValue('text2') ) {
			$start = microtime(true);
			$shingleMethod = new CShingleMethod(3);
			$this->result = round ($shingleMethod->compare( $this->postValue('text1'), $this->postValue('text2') ), 2);
			$this->microtime = microtime(true) - $start;
		}
	}
	
	public function postValue($varname) {
		if (isset($_POST[$varname])){
			return $_POST[$varname];
		} else {
			return null;
		}
	}
}