<?php
include_once dirname(__FILE__) . "/CFileProcessor.php";
include_once dirname(__FILE__) . "/CFileContext.php";



class CApplication {
	public function __construct() {
		//пусть есть несколько файлов 
		$data = array("info.txt", "readme.doc", "prices.xml");
		foreach ($data as $s) {
			try {
				new CFileContext($s);
			} catch(Exception $e) {
				//TODO попался например doc с расширением txt или еще что-то...
			}
		}
	}
}

new CApplication();