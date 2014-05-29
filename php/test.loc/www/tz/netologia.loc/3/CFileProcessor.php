<?php
/**
 * Классы, реализующие обработку файлов (заготовка)
 * */
class CFileProcessor {
	public function __construct() {
		
	}
	
	public function load($filename) {
		
	}
	
	public function process() {
		
	}
}

class CtxtFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm txt Processor<br>";
	}
}

class CdocFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm doc Processor<br>";
	}
}

class CxmlFileProcessor extends CFileProcessor{
	public function process() {
		print "I'm xml Processor<br>";
	}
}

/*
 * Драйвер классов C*FileProcessorr
 * **/
class CApplication {
	public function __construct() {
		//пусть есть несколько файлов 
		$data = array("info.txt", "readme.doc", "prices.xml");
		foreach ($data as $s) {
			$ext = preg_replace("#.*\.([a-zA-Z0-9]+)$#", '$1', $s);
			if (class_exists("C". $ext ."FileProcessor")) {
				$cName = "C". $ext ."FileProcessor";
				$processor = new $cName();
				$processor->load($s);
				$processor->process();
			}
		}
	}
}

new CApplication();