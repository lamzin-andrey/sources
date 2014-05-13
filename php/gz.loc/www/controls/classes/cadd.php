<?php
require_once DR . "/lib/shared.php";
require_once DR . "/lib/validators.php";
class CAdd {
	protected $cpError = 0;
	protected $imagePath;
	protected $is_moderate = 0;
	/**
	 * @var $checkPasswordState
	 * @see validateOther
	 * 0 - пароль был пуст
	 * 1 - пароль не пуст и его надо вставить
	 * 2 - пароль не пуст и его надо обновить
	 * 3 - пароль не пуст, но его не надо вставить
	 * 4 - пароль не пуст, и совпал
	 * */
	protected $checkPasswordState = 0;
	
	public  $errors = array();
	public  $successMessage = "Ваше объявление добавлено и будет размещено на сайте после проверки";
	public  $success = 0;
	
	public $title;
	public $name;
	public $price;
	public $addtext;
	public $phone;
	public $email;
	
	public function __construct() {
		$this->readPost();
		$this->checkCaptcha();
		$this->uploadHandler();
		if (count($_POST) == 0) {
			return;
		}
		$this->validateOther();
		$this->insert();
		$this->_exit();
	}
	/**
	 * @desc Считать переменные из пост в поля класса
	 * */
	protected function readPost() {
		$this->title = @$_POST["title"];
		$this->price = @$_POST["price"];
		$this->addtext = @$_POST["addtext"];
		$this->phone = @$_POST["phone"];
		if (!$this->phone) {
			$this->phone = @$_SESSION["phone"];
		}
		$this->email = @$_POST["email"];
		$this->name = @$_POST["name"];
		global $authorized;
		if ($authorized) {
			$_POST["name"] = $this->name = @$_SESSION["name"];
			$_POST["phone"] =$this->phone = @$_SESSION["viewphone"];
		} 
	}
	/**
	 * @desc Сохранить файл
	 * */
	protected function uploadHandler() {
		if ($this->cpError) {
			return;
		}
		if (count($_FILES)) {
			$file =  $_FILES["file"];
			if (!$file) {
				$file =  $_FILES["image"];
			}
			$ext = utils_getExt($file['name']);
			$name = md5($file['name'] . now());
			$subdir = date("Y") . "/" . date("m");
			$dest = DR . "/images/$subdir/$name.$ext";
			move_uploaded_file($file["tmp_name"], $dest);
			$mime = utils_getImageMime($dest, $w, $h);
			if ($mime) {//die($mime);
				if($w >= $h) {
		        	$new_size_w = MAX_WIDTH;
		        	$h = $h*MAX_WIDTH/$w;
		        	$w = $new_size_w;
				}
				else{
					$new_size_h = MAX_HEIGHT;
		        	$w = $w*MAX_HEIGHT/$h;
		        	$h = $new_size_h;
				}
				switch ($mime) {
					case "image/png":
						utils_pngResize($dest, $dest, $w, $h);
						break;
					case "image/gif":
						utils_gifResize($dest, $dest, $w, $h);
						break;
					case "image/jpeg":
						utils_jpgResize($dest, $dest, $w, $h, 100);
				}
			}
			if ($_GET["ajaxUpload"] == 1) {
				$dest = str_replace(DR, '', $dest);
				die(trim($dest));
			}
			$this->imagePath = str_replace(DR, '', $dest);
			// '/images/gpasy.jpeg'
		}
	}
	/**
	 * @desc Проверяем, введена ли вообще каптча
	 * */
	protected function checkCaptcha() {
		if (count($_POST) == 0 || count($_FILES)) {
			return;
		}
		if (@$_POST["cp"] != @$_SESSION["ccode"]) {
			$this->errors["cp"] = "Неверно введен текст с изображения";
			$this->cpError = 1;
		}
	}
	
	/**
	 * @desc Проверка всех остальных полей
	 * */
	protected function validateOther() {
		if ($this->cpError) {
			return;
		}
		Validators::is_require("title", "Заголовок объявления", $this->errors);
		Validators::is_require("addtext", "Текст объявления", $this->errors);
		Validators::is_require("name", "Имя или название компании", $this->errors);
		Validators::is_require("phone", "Телефон", $this->errors);
		if (count($this->errors)) {
			return;
		}
		//far/near
		if (!intval(@$_POST["far"]) && !intval(@$_POST["near"]) && !intval(@$_POST["piknik"])) {
			$this->errors['distance'] = "Вы не указали расстояние на которое готовы поехать. Выберите один из вариантов из \"Межгород\", \"По городу\" или \"За город\"";
			return;
		}
		//type
		if (!intval(@$_POST["people"]) && !intval(@$_POST["box"]) && !intval(@$_POST["term"])) {
			$this->errors['autotype'] = "Вы не указали тип вашего автомобиля. Выберите один из вариантов из \"Пассажирская\", \"Грузовая\" или \"Термобудка\"";
			return;
		}
		//location
		if (!intval(@$_POST["city"]) && !intval(@$_POST["region"])) {
			$this->errors['city'] = "Выберите мегаполис или город";
			return;
		}
		//phone
		$phone = $this->preparePhone(@$_POST["phone"]);
		$len = strlen($phone);
		if ($len  < 5 || $len > 16) {
			$this->errors['phone'] = "В номере телефона должно быть от пяти до пятнадцати цифр";
			return;
		}
		//password
		if (trim( @$_POST["pwd"] )) {
			$this->checkPasswordState = 1;
			$rawpass = substr( str_replace(' ', '', @$_POST["pwd"]), 0, 32);
			if ( strlen($rawpass) < 6 || strlen($rawpass) > 32 ) {
				$this->errors["pwd"] = "Длина пароля должна быть от шести до тридцати двух символов";
				return; 
			}
			$cmd = "SELECT id, rawpass, email FROM users WHERE phone = '$phone'";
			$data = query($cmd, $nR);
			if ($nR) {//если строка есть
				$row = $data[0];
				if (trim($row["rawpass"]) && $row["rawpass"] != trim(@$_POST["pwd"])) { //пароль не пуст и не совпадает
					$this->errors["pwd"] = "Для этого номера телефона уже задан пароль отличный от того, что вы ввели.<br>
Если вы хотите поднять, отредактировать, скрыть или удалить какое-то из раннее поданых объявлений, но не помните 
пароль, <a href='/remindpassword' target='_blank'>пройдите на страницу восстановления пароля</a>.<br>
Для публикации объявления сейчас вы также можете оставить поля пароль и email незаполнеными.";
					$this->checkPasswordState = 3;
					return;
				} elseif (trim($row["rawpass"]) && $row["rawpass"] == trim(@$_POST["pwd"])) {
					$this->checkPasswordState = 4;
				} elseif( !trim($row["rawpass"]) ) {
					$this->checkPasswordState = 2;
				}
			} else {
				$this->checkPasswordState = 1;
			}
		}
		//email
		if (trim( @$_POST["email"] )) {
			if ( !checkMail($_POST["email"]) ) {
				$this->errors["email"] = "Такого email не бывает";
				return; 
			}
			$m = $_POST["email"];
			$cmd = "SELECT phone, email FROM users WHERE email = '$m'";
			$data = query($cmd, $nR);
			$row = @$data[0];
			if ($nR && @$row["phone"] != $phone) {
				$this->errors["email"] = "Такой email уже используется";
				return;
			}
		}
	}
	
	private function preparePhone($phone) {
		return Shared::preparePhone($phone);
	} 
	
	protected function sendPwd($row, $phone) {
		//TODO sendMail
		$mail = new SampleMail();
		$mail->setAddressFrom(array(SITE_EMAIL));
		$mail->setAddressTo(array($row['email']));
		$mail->setSubject("Восстановлене пароля на сайте gazel.me");
		$mail->setPlainText("Здравствуйте!
Ваш пароль на сайте gazel.me для номера $phone {$row['rawpass']}. 
Не забывайте его больше!");
		return $mail->send();
	}
	
	/**
	 * @desc Вставка при отсутствии ошибок
	 * */
	protected function insert() {
		if (count($this->errors)) {
			return;
		}
		$region = (int)@$_POST["region"];
		$city = (int)@$_POST["city"];
		$people = (int)@$_POST["people"];
		$box = (int)@$_POST["box"];
		$term = (int)@$_POST["term"];
		$far = (int)@$_POST["far"];
		$near = (int)@$_POST["near"];
		$piknik = (int)@$_POST["piknik"];
		
		$phone = $this->preparePhone($_POST["phone"]);
		$price = doubleval( str_replace(',', '.', $_POST["price"]) );
		
		$title = $this->deinject(@$_POST["title"]);
		$addtext = $this->deinject(@$_POST["addtext"]);
		$name = $this->deinject(@$_POST["name"]);
		$rawpass = $pwd = '';
		$email = @$_POST["email"];
		if ( trim(@$_POST["pwd"]) ) {
			$rawpass = substr( str_replace(' ', '', @$_POST["pwd"]), 0, 32);
			$pwd = md5($rawpass);
		}
		
		$image = "/images/gpasy.jpeg";
		if ($box) {
			$image = "/images/gazel.jpg";
		}else if ($term) {
			$image = "/images/term.jpg";
		}
		if (utils_getImageMime(DR . @$_POST["ipath"])) {
			$image = @$_POST["ipath"];
		}else if (!@$_POST["xhr"] && $this->imagePath) {//нет ipath значит либо не было либо отправка простым постом
			$image = $this->imagePath;
		}
		
		$select = "SELECT id FROM main WHERE phone = $phone AND title = '$title' AND addtext = '$addtext' AND is_deleted != 1";
		if (dbvalue($select)) {
			$this->errors[] = "Вы уже публиковали это объявление. <br>Вы можете войти в личный кабинет и поднять его. <br>Как логин используйте свой номер телефона, пароль будет отправлен вам на email указанный при подаче объявления.<br>Если вы не помните email используйте ссылку Восстановление пароля.";
			return;
		}
		$is_moderate = $this->is_moderate;
		$codename = utils_translite_url(utils_cp1251($title));
		$insert = "INSERT INTO main (region, city, people, price, box, term, far, near, piknik, title, image, name, 
		                       addtext, phone, is_moderate, codename) 
		VALUES ($region, $city, $people, $price, $box, $term, $far, $near, $piknik, '$title', '$image', '$name', '$addtext', '$phone', $is_moderate, '$codename')";
		$id = query($insert);
		if ($id) {
			
			$d = dbvalue("SELECT max(delta) FROM main");
			$d += 1;
			query("UPDATE main SET delta = $d WHERE id = $id");
			
			$update = "phone = '$phone'";
			if ($this->checkPasswordState == 0) {
				$this->success = 1;
				return;
			}
			if ($this->checkPasswordState == 1 || $this->checkPasswordState == 2) {
				$update = "rawpass = '$rawpass', pwd = '$pwd'";
			}
			$cmd  = "INSERT INTO users (phone, pwd, rawpass, email) VALUES ( '$phone', '$pwd', '$rawpass', '$email') ON DUPLICATE KEY UPDATE $update";
			$uid = query($cmd);
			
			$d = dbvalue("SELECT max(delta) FROM users");
			$d += 1;
			query("UPDATE users SET delta = $d WHERE id = $uid");
			
			$this->success = 1;
		}
	}
	/**
	 * @desc Возвращаем сообщения об ошибках или статус ок
	 * */
	protected function _exit() {
		if (count($this->errors)) {
			if (@$_POST["xhr"]) {
				$this->errors["success"] = "0";
				print json_encode($this->errors);
				exit;
			}
		}
		if (@$_POST["xhr"]) {
			$data = array("success" => 1, "msg" => $this->successMessage);
			print json_encode($data);
			exit;
		}
		/*echo "<pre>";
		print_r($this->errors);
		echo "</pre>";
		die (__FILE__ . ", " . __LINE__); /**/
	}
	/**
	 * @desc Удаляем xss sql
	 * */
	protected function deinject($s) {
		return Shared::deinject($s);
	}
}
