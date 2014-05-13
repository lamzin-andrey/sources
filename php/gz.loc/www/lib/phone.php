<?php
require_once DR . "/lib/shared.php";
if ((int)$id) {
	$text = Shared::formatPhone( dbvalue("SELECT phone FROM main WHERE id = $id") );
	if (trim($text)) {
		$im = imagecreatefrompng( DR . "/images/blank.png");
		$font_color = imagecolorresolve($im, 0, 0, 0);
		imagettftext($im, 24, 0, 30, 30, $font_color, DR . "/lib/captcha/fonts/font4.ttf", $text);
		header('Cache-Control: no-store, no-cache, must-revalidate'); 
		header('Cache-Control: post-check=0, pre-check=0', FALSE); 
		header('Pragma: no-cache');  
		if (function_exists("imagepng")) {
			header("Content-Type: image/x-png");
			imagepng($im);
		}
	}
}