<?php //start 09 10
define("APP_ROOT", dirname(__FILE__));       //чтобы работало повсюду
require_once APP_ROOT . "/config.php";       //config
require_once APP_ROOT . "/CApplication.php"; //logic
$app = new CApplication();
require_once APP_ROOT . "/master.tpl.php";   //view