<?php
include_once dirname(__FILE__) . "/CFileProcessor.php";

/*
 * Драйвер классов C*FileProcessorr
 * **/
class CFileContext {
	public function __construct($s) {
		$ext = preg_replace("#.*\.([a-zA-Z0-9]+)$#", '$1', $s);
		if (class_exists("C". $ext ."FileProcessor")) {
			$cName = "C". $ext ."FileProcessor";
			$processor = new $cName();
			$processor->load($s);
			$processor->process();
		}
	}
}