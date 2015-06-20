<?php
require_once dirname(__FILE__) . '/Request.php';
require_once dirname(__FILE__) . '/Client.php';
class CApplication {
	/** @var username */
	private $_username = 'tguest';
	private $_domain = 'list.ru';
	private $_password = '5aTam9ijMR10285';
	
	public function __construct() {
		if ($response = $this->_login()) {
			echo('LOGIN SUCCESS');die;
			$ls = $this->_getMailList();
			foreach ($ls as $mail) {
				if ($this->_mailIsValid($mail)) {
					$this->_appendValidMail();
				} else {
					//TODO code or remove me!
				}
			}
		} else {
			throw new Expection('login fail');
		}
	}
	/**
	 * @desc login as _username _password
	 * @return bool true if login success
	*/
	private function _login() {
		$password_field_name = 'Password';
		$login_field_name = 'Login';
		$domain_field_name = 'Domain';
		$url = 'https://auth.mail.ru/cgi-bin/auth';
		
		$token = round( (rand(1, 9999) / 10000) * 999999);
		$data = array(
			'Password' => $this->_password,
			'Login'  => $this->_username,
			'Domain' => $this->_domain,
			'Page'   => 'http://r.mail.ru/clb1203896/webagent.mail.ru/r/webagent/popup.html?wa_embedlogin=' .  $token,
			'FailPage' => 'https://r.mail.ru/clb1203897/e.mail.ru/cgi-bin/login?email='.$this->_username.'@'. $this->_domain .'&fail=1&page=http%3A%2F%2Fwebagent.mail.ru%2Fr%2Fwebagent%2Fpopup.html%3Fwa_embedlogin%3D' . $token
		);
		//print_r($data);
		$request = new Request();
		$referer = 'http://webagent.mail.ru/r/webagent/popup.html';
		$rdata = $request->execute($referer, array()/*, '', $proc, false*/);
		//die($rdata->responseText);
		$response = $request->execute($url, $data, $referer, $proc, false);
		//Считаю, что залогинен, т к при неверном пароле ответ 302, а сейчас 200
		
		//check one mail
		// Запрос из постороннего источника заблокирован: 
		//Политика одного источника запрещает чтение удаленного ресурса на http://jim19.mail.ru/.
		// (Причина: отсутствует заголовок CORS 'Access-Control-Allow-Origin').
		/*$session = round( (rand(1,9999) / 10000) * 0x1E5);
		$uniq = round( (rand(1, 9999) / 1000) * 999999);
		$referer = 'http://jim19.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default3&xdm_p=1';
		
		
		$data = array(
			'domain' => 'webagent.mail.ru',
			'email'   => 'sonya3110@mail.ru',
			'rnum' =>    'bmaster',
			'uniq'	=> $uniq,
			'x-email'	=> $this->_username . '@' . $this->_domain
		);
		
		$get = '?r=36860&sdc=1&session=' . $session;
		$response = $request->execute('http://jim19.mail.ru'  . $get, $data, $referer, $proc, true, true);
		*/
		print_r($data);
		print_r($response);
		die;
	}
	/**
	 * @desc Получает список адресов со страницы https://www.dropbox.com/s/k2a34efmp49s0qd/142email.txt?dl=0
	 * @return bool true if login success
	*/
	private function _getMailList() {
	}
	/**
	 * @desc Отправляет форму поиска, если найден, возвращает true
	 * @return bool
	*/
	private function _mailIsValid() {
	}
	/**
	 * @desc Добавляет адрес в список валидных
	 * @return bool
	*/
	private function _appendValidMail($mail) {
		
	}
}
new CApplication();
