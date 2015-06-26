<?php
usleep(50000); //чтобы успел get процесс запуститься

include dirname(__FILE__) . '/Request.php';

$request = new Request(false);
$mail = $argv[1];
$session = $argv[2];
$n = $argv[3];
$referer = $argv[4];
$xmail = $argv[5];

$uniq = round( (rand(1, 9999) / 1000) * 999999);
$data = array(
	'domain' => 'webagent.mail.ru',
	'email'   => $mail,
	'rnum' =>    'bmaster',
	'uniq'	=> $uniq,
	'x-email'	=> $xmail
);
$get = '?r='. (round(rand(1, 9999) / 1000) * 0x1E5) .'&sdc=1&session=' . $session;
$response = $request->execute("http://jim{$n}.mail.ru/wp"  . $get, $data, $referer, $proc_new, true, true);
print_r($response);
