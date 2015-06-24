<?php
require_once dirname(__FILE__) . '/Request.php';
require_once dirname(__FILE__) . '/Client.php';
//require_once dirname(__FILE__) . '/websocket-php/lib/Client.php';
class CApplication {
	/** @var username */
	private $_username = 'tguest';
	private $_domain = 'list.ru';
	private $_password = '5aTam9ijMR10285';
	private $_session = 0;
	private $_server_n = 0;
	private $_page_uniq = 0;
	
	public function __construct() {
		
		//$request = new Request(false);
		
		if ($response = $this->_login($post_process, $get_process)) {
			$ls = $this->_getMailList();
			foreach ($ls as $mail) {
				echo "checked mail '$mail'...\n";
				$flag = $this->_mailIsValid($mail, $post_process, $get_process);
				var_dump($flag);
				if ($flag === -1) { //session expired
					$this->_login($post_process, $get_process);
					$flag = $this->_mailIsValid($mail, $post_process, $get_process);
					if ($flag === -1) {
						throw new Exception("Unable login as WebAgent user");
					}
				}
				if ($flag) {
					echo "mail '$mail' is valid!\n";
					//$this->_appendValidMail();
				} else {
					//TODO code or remove me!
					echo "Error:mail '$mail' is INvalid!!!!!\n";
				}
				sleep( rand(1, 10) );
				die;
			}
		} else {
			throw new Exception('login fail');
		}
	}
	/**
	 * @desc login as _username _password
	 * @param curl_resource &$post_process
	 * @param curl_resource &$get_process
	 * @return bool true if login success
	*/
	private function _login(&$post_process, &$get_process) {
		$tmp = $this->_createConnection($session, $n, $page_uniq);
		curl_close($tmp);
		echo "\n\n==============FIRST===============\n\n";
		$post_process = $this->_createConnection($session, $n, $page_uniq);
		echo "\n\n==============SECOND===============\n\n";
		$get_process = $this->_createConnection($session, $n, $page_uniq);
		$this->_session = $session;
		$this->_server_n = $n;
		$this->_page_uniq = $page_uniq;
		//TODO check all statuses and cookies
		return true;
	}
	/**
	 * todo make check expired session
	 * @return bool | -1 if web agent session expiored
	*/
	private function _mailIsValid($mail, $post_proc, $get_proc) {
		$request = new Request(false);
		echo  "try check mail ... \n";
		$r = rand(10000, 99999);
		echo "Get segment \n";
		$n = $this->_server_n;
		$page_uniq = $this->_page_uniq;
		$session = $this->_session;
		$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
		$url = "http://jim{$n}.mail.ru/connect?session={$session}&with_login=1&status=online&show_xstatus=1&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&r={$r}&rnum=bmaster&stream_segment_ack=0";
		$response = $request->execute($url,  array(), $referer_2, $get_proc, false, true);
		print_r($response);
		//die;

		echo  "prepare get connection ... \n";
		$r = (round(rand(1, 9999) / 1000) * 0x1E5);
		$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
		$url = "http://jim{$n}.mail.ru/connect?session={$session}&r={$r}&stream_segment_ack=1&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&rnum=bmaster";
		$request->prepare($url,  array(), $referer_2, $get_proc, true);
		
		echo  "post request ... \n";
		//check one mail
		
		$uniq = round( (rand(1, 9999) / 1000) * 999999);
		$referer = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default3&xdm_p=1";
		$data = array(
			'domain' => 'webagent.mail.ru',
			'email'   => $mail,
			'rnum' =>    'bmaster',
			'uniq'	=> $uniq,
			'x-email'	=> $this->_username . '@' . $this->_domain
		);
		$get = '?r='. (round(rand(1, 9999) / 1000) * 0x1E5) .'&sdc=1&session=' . $session;
		$proc = $request->prepare("http://jim{$n}.mail.ru/wp"  . $get, $data, $referer, $proc, true);
		
		$results = $request->multy(array($get_proc, $proc), true);
		print_r($data);
		print_r($results);
		
		if (isset($results[0]->responseText)) {
			$data = json_decode( $results[0]->responseText, true );
			print_r($data);
			if (isset($data[0][1]['error']) && $data[0][1]['error'] == 'no user') {
				return false;
			}
			if (isset($data[0][1]['result'][0]['email']) && $data[0][1]['result'][0]['email'] == $mail) {
				return true;
			}
		}
		return -1;
	}
	/**
	 * @desc
	 * @param
	*/
	private function _createConnection(&$session = null, &$N = null, &$page_uniq = null) {
		if (!$N) {
			$n = rand(1, 31); //jimN
		} else {
			$n = $N;
		}
		if (!$session) {
			$request = new Request();
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
			$referer = 'http://webagent.mail.ru/r/webagent/popup.html';
			$rdata = $request->execute($referer, array(), '', $proc, false);
			$response = $request->execute($url, $data, $referer, $proc, false);
			//print_r($response); die;
			//Считаю, что залогинен, т к при неверном пароле ответ 302, а сейчас 200
			print_r($response);
		
			echo "try get sdc...\n";
		
			$referer_2 = 'http://jiml.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default1&xdm_p=1';
			$response = $request->execute($referer_2,  array(), $referer, $proc, false, true);
			$url = 'https://auth.mail.ru/sdc?from=http%3A%2F%2Fjiml.mail.ru%2Fuser%2Fstatus&JSONP_call=wa_3iojinovkfm';
			
			$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
			print_r($response);
		
			if (!$N) {
				echo("will try get 'jimN'...\n");
				$url = 'http://jiml.mail.ru/user/status';
				$get = '?x-email=' . $this->_username . '@' . $this->_domain . '&rnum=bmaster&r=' . rand(10000, 99999);
				$response = $request->execute($url . $get,  array(), $referer_2, $proc, false, true);
				
				print_r($response);
				$userData = json_decode($response->responseText, true);;
				if (isset( $userData[0][1]['body']['user']['status']['jimServer'] )) {
					$n = preg_replace("#[\D]#", '', $userData[0][1]['body']['user']['status']['jimServer']);
					$N = $n;
					echo "n = $n\n";
				}
			}
		
			echo "try get p.. \n";
			$url = "http://rs.mail.ru/d706711.gif?rnd=" . (rand(1, 9999) / 1000);
			$response = $request->execute($url,  array(), $referer, $proc, false, true);
			print_r($response);
		
			echo "try get sdc for  server '{$n}'....";
			$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
			$url = "https://auth.mail.ru/sdc?from=http%3A%2F%2Fjim{$n}.mail.ru%2Fconnect&JSONP_call=wa_kgrw8ges9fq";
			$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
		
			print_r($response);
		} else {
			$request = new Request(false);
		}
		
		echo "try connect...\n";
		if (!$session) {
			$session = round( (rand(1,9999) / 10000) * 0x1E5);
		}
		if (!$page_uniq) {
			$page_uniq = round( (rand(1,9999) / 10000) * 0x1E5);
		}
		$r = rand(10000, 99999);
		$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
		$url = "http://jim{$n}.mail.ru/connect?session={$session}&with_login=1&status=online&show_xstatus=1&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&r={$r}&rnum=bmaster";
		echo "(url = '{$url}'\n)";
		$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
		print_r($response);
		return $proc;
	}
	/**
	 * @desc Получает список адресов со страницы https://www.dropbox.com/s/k2a34efmp49s0qd/142email.txt?dl=0
	 * @return bool true if login success
	*/
	private function _getMailList() {
		$source = dirname(__FILE__) . '/data/mail_list.txt';
		if (!file_exists($source)) {
			throw new Exception("MAIL LIST NOT FOUND!");
		}
		$list = explode("\n", file_get_contents($source));
		$result = array();
		//$reg = "#^[\w]+@[\w]+\.[\w]{2,4}#";	 
		$reg = "/^[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+$/i";
		foreach ($list as $mail) {
			$mail = trim($mail);
			if ($mail) {
				$f = preg_match($reg, $mail, $m);
				if ($f) {
					$result[] = $mail;
				} else {
					echo "mail '{$mail}' was ignored\n";
				}
			}
		}
		return $result;
	}
	/**
	 * @desc Добавляет адрес в список валидных
	 * @return bool
	*/
	private function _appendValidMail($mail) {
		
	}
}
new CApplication();
