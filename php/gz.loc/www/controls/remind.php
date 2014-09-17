<?php
require_once DR . "/lib/classes/mail/SampleMail.php"; 
require_once DR . "/lib/shared.php"; 
class CRemindAction {
	public $id;
	public $login;
	public function __construct() {
		if (@$_GET["status"] !== null && !count($_POST)) {
			$this->login = @$_SESSION["remlogin"];
		}
		if ( count($_POST) ) {
			$_SESSION["remlogin"] = $this->login = $phone = Shared::preparePhone(@$_POST["login"]);
		}
		if (count($_POST) && @$_POST["cp"] != @$_SESSION["ccode"]) {
			$_SESSION["ok_msg"] = "Не верно введен текст с изображения";
			utils_302("/remind?status=1");
		}
		if (@$phone) {
			$row = dbrow("SELECT id, email, sms, rawpass FROM users WHERE phone = '{$phone}'");
			if ($row && trim($row["rawpass"])) {
				if (checkMail($row["email"])) {
					$r = $this->sendPwd($row, Shared::formatPhone($phone));
					if ($r) {
						$_SESSION["ok_msg"] = "Пароль отправлен на адрес электронной почты {$row['email']}";
						utils_302("/remind?status=0"); //Все ок
					} else {
						$_SESSION["ok_msg"] = "Не удалось отправить пароль на адрес электронной почты {$row['email']}<br>
Попробуйте повторить попытку позже.";
						utils_302("/remind?status=1");
					}
				} else {
					if ($row["sms"] != 1) {
						$_SESSION["ok_msg"] = "Если это ваш номер телефона, но вы не можете войти в почту или не указывали ее,
 придумайте пароль и отправьте его в sms на номер<br>8 918 735 36 57 с номера, который используете для входа на сайт.<br>
 (это обычное sms, его стоимость будет зависить только от вашего тарифного плана )<br> 
  Пароль будет вам отправлен в ответном смс.<p>  
После получения пароля рекомендуем указать в настройках существующий адрес электронной почты,<br> 
так как возможность восстановления пароля по смс разовая.";
						utils_302("/remind?status=0");
					} else {
						$_SESSION["ok_msg"] = "К сожалению, вы не указали адрес электронной почты при подаче объявления. Восстановление пароля невозможно.<br>
  Вы можете подать объявление указав другой телефонный номер.<p> 
  При подаче объявления рекомендуем указать существующий адрес электронной почты, так как без него восстановление пароля будет невозможно";
						utils_302("/remind?status=1");
					}
				}
			} else {
				$_SESSION["ok_msg"] = "В базе не найден пользователь с таким номером телефона.<br>
Вы можете подать объявление указав этот номер телефона и пароль и использовать их для доступа к своему объявлению.<br>
При подаче объявления рекомендуем указать существующий адрес электронной почты, так как без него восстановление пароля будет невозмжно";
				utils_302("/remind?status=0");
			}
		}
	}
	
	private function sendPwd($row, $phone) {
		//TODO check sendMail
		$mail = new SampleMail();
		$mail->setAddressFrom(array(SITE_EMAIL => SITE_EMAIL));
		$mail->setAddressTo(array($row['email'] => $row['email']));
		$mail->setSubject("Восстановлене пароля на сайте gazel.me");
		$mail->setPlainText("Здравствуйте!
Ваш пароль на сайте gazel.me для номера $phone {$row['rawpass']}. 
Не забывайте его больше!");
		return $mail->send();
	}
	
}

$rform = new CRemindAction();
