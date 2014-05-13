<?
$to2 = "samsungmobyle@yandex.ru";

require_once dirname(__FILE__)."/SampleMail.php";
$mailer = new SampleMail();
$mailer->setSubject("Hello subject Это некая тема письма");
$mailer->setAddressFrom(array("shanser@mail.ru"=>"Hendler Бокоff"));
$mailer->setAddressTo(array("$to2"=>"Sender_1"));

//sample mail
/*$mailer->setPlainText("Привет! Хочешь, я угадаю как тебя зовут?");
$r = $mailer->send();
var_dump($r);
*/
//sample attach
/*$mailer->setPlainText("Привет! Хочешь, я угадаю как тебя зовут?");
$mailer->attachFile(dirname(__FILE__)."/test.jpg");
$r = $mailer->send();
var_dump($r);*/

//sample inline
$mailer->setPlainText("Привет! {smile1} Хочешь, я угадаю {photo}как тебя зовут?", 
array(
	"{smile1}" => dirname(__FILE__)."/dance.gif",
	"{photo}"  => dirname(__FILE__)."/wall.gif"
));

$r = $mailer->send();
var_dump($r);
?>