<?php
if ( @$_GET["PHPSESSID"] ) {
    @session_id( @$_GET["PHPSESSID"]);
}
@session_start();
$token = @$_SESSION["utoken"];
if (!$token) {
    $token = $_SESSION["utoken"] = md5( strtotime( date("Y-m-d H:i:s") ) );
}
if (count($_POST)) {
	if ($token && ($token != @$_REQUEST["utk"] && $token != @$_REQUEST["token"])) {
		die("Неверный ключ");
	}
}
@date_default_timezone_set("Europe/Moscow");
require_once dirname(__FILE__)."/config.php";
require_once LIB_ROOT."/functions.php";

$javascript = utils_addScript("global", "var utoken='$token';");
?>