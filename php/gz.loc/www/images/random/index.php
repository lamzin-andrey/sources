<?php

include $_SERVER["DOCUMENT_ROOT"].'/lib/captcha/captcha.php';

function init_cp() {
	@session_start();
	$captcha = new CCaptcha();
	$_SESSION['ccode'] = $captcha->getKeyString();
}
init_cp();