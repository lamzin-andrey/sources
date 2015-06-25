<?php
require_once dirname(__FILE__) . '/Request.php';
class CWebAgentEmulator {
	/** @var _username Имя пользователя */
	private $_username = 'tguest';
	/** @var _domain Домен */
	private $_domain = 'list.ru';
	/** @var _password пароль */
	private $_password = '5aTam9ijMR10285';
	/** @var _verbose выводить ли сообщения в консоль о ходе процесса*/
	private $_verbose = false;
	/** @var _web_agent_release номер релиза web агента*/
	private $_release = 467;
	/** @var _session сессия ссоединения с webagent server*/
	private $_session = 0;
	/** @var _server_n номер сервера jim */
	private $_server_n = 0;
	/** @var _page_uniq  идентификатор страницы */
	private $_page_uniq = 0;
	/** @var _segment */
	private $_segment = 0;
	/** @var _jiml_referer  реферер jiml сервера по умолчанию */
	private $_default_jiml_referer = 'http://jiml.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F{release}&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default1&xdm_p=1';
	/** @var _jiml_referer  реферер jimN сервера по умолчанию */
	private $_default_jimN_referer = 'http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F{release}&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1';
	/** @var _control_cookie  список имен куки для контроля успешной авторизации (host_cookieName)*/
	private $_control_cookie = array('jiml.mail.ru_sdc', 'jim{N}.mail.ru_sdc', 'mail.ru_Mpop', 'mail.ru_Mpop', 'auth.mail.ru_ssdc', 'auth.mail.ru_ssdc_info', 'mail.ru_t', 'mail.ru_mrcu');
	public function __construct() {
		$this->_default_jiml_referer = str_replace('{release}', $this->_release, $this->_default_jiml_referer);
		$this->_default_jimN_referer = str_replace('{release}', $this->_release, $this->_default_jimN_referer);
		file_put_contents(dirname(__FILE__) . '/output/no.txt', '');
		file_put_contents(dirname(__FILE__) . '/output/yes.txt', '');
		if ($this->_login($post_process, $get_process)) {
			$ls = $this->_getMailList();
			foreach ($ls as $mail) {
				$this->_log("will check mail '{$mail}'");
				$flag = $this->_mailIsValid($mail, $post_process, $get_process);
				var_dump($flag);
				if ($flag === -1) { //session expired
					$this->_login($post_process, $get_process);
					$flag = $this->_mailIsValid($mail, $post_process, $get_process);
					if ($flag === -1) {
						throw new Exception('Unable login as WebAgent user');
					}
				}
				if ($flag) {
					$this->_appendValidMail($mail);
				} else {
					$this->_appendInvalidMail($mail);
				}
				$pause = rand(2, 10);
				echo "sleep {$pause} seconds...\n";
				sleep($pause);
			}
			$this->_closeConnection($post_process);
			$this->_closeConnection($get_process);
		} else {
			throw new Exception('Unable login as WebAgent user');
		}
	}
	/**
	 * @desc login as _username _password
	 * @param curl_resource &$post_process
	 * @param curl_resource &$get_process
	 * @param curl_resource &$another_get_process
	 * @return bool true if login success
	*/
	private function _login(&$post_process, &$get_process) {
		$this->_closeConnection($post_process);
		$this->_closeConnection($get_process);
		$this->_segment = 0;
		$tmp = $this->_createConnection($session, $n, $page_uniq, $error_code, $error_url);
		curl_close($tmp);
		if ($error_code) {
			throw new Exception("Unable login as WebAgent user! Requested url '{$error_url}'\n return status {$error_code} ");
		}
		$this->_log("\n\n==============FIRST===============\n\n");
		$post_process = $this->_createConnection($session, $n, $page_uniq);
		$this->_log("\n\n==============SECOND===============\n\n");
		$get_process = $this->_createConnection($session, $n, $page_uniq);
		$this->_session = $session;
		$this->_server_n = $n;
		$this->_page_uniq = $page_uniq;
		return $this->_checkCookie();
	}
	/**
	 * @desc
	 * @return bool true если все необходимые куки получены
	*/
	private function _checkCookie() {
		$this->_control_cookie[1] = str_replace('{N}', $this->_server_n, $this->_control_cookie[1]);
		$request = new Request(false);
		$cookie = $request->getCookie();
		foreach ($this->_control_cookie as $ck) {
			if (!isset($cookie[$ck])) {
				$this->_log('Not found cookie "'. $ck .'"');
				return false;
			}
		}
		return true;
	}
	/**
	 * todo make check expired session
	 * @return bool | -1 if web agent session expired
	*/
	private function _mailIsValid($mail, $post_proc, $get_proc) {
		$request = new Request(false);
		echo("try check mail '{$mail}'...\n");
		$r = rand(10000, 99999);
		$n = $this->_server_n;
		
		$page_uniq = $this->_page_uniq;
		$session = $this->_session;
		//$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
		$referer_2 = str_replace('{$n}', $n, $this->_default_jimN_referer);
		
		if (!$this->_segment) {
			echo "Get segment\n";
			$url = "http://jim{$n}.mail.ru/connect?session={$session}&with_login=1&status=online&show_xstatus=1&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&r={$r}&rnum=bmaster&stream_segment_ack=0";
			$response = $request->execute($url,  array(), $referer_2, $get_proc, false, true);
			if ($this->_verbose) {
				print_r($response);
			}
			$this->_segment = 1;
		}
		$this->_log('prepare get connection');
		$r = (round(rand(1, 9999) / 1000) * 0x1E5);
		//$referer_2 = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default2&xdm_p=1";
		$url = "http://jim{$n}.mail.ru/connect?session={$session}&r={$r}&stream_segment_ack={$this->_segment}&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&rnum=bmaster";
		$request->prepare($url,  array(), $referer_2, $get_proc, true);
		
		$this->_log('prepare post connection');
		//check one mail
		$uniq = round( (rand(1, 9999) / 1000) * 999999);
		//$referer = "http://jim{$n}.mail.ru/communicate.html?usedBranch=master&path=u%2Fwebagent%2Frelease%2F467&xdm_e=http%3A%2F%2Fwebagent.mail.ru&xdm_c=default3&xdm_p=1";
		$data = array(
			'domain' => 'webagent.mail.ru',
			'email'   => $mail,
			'rnum' =>    'bmaster',
			'uniq'	=> $uniq,
			'x-email'	=> $this->_username . '@' . $this->_domain
		);
		$get = '?r='. (round(rand(1, 9999) / 1000) * 0x1E5) .'&sdc=1&session=' . $session;
		$proc = $request->prepare("http://jim{$n}.mail.ru/wp"  . $get, $data, $referer_2, $proc, true);
		
		$results = $request->multy(array($get_proc, $proc));
		$this->_segment++;
		if ($this->_verbose) {
			print_r($data);
			print_r($results);
		}
		if (isset($results[0]->responseText)) {
			$data = json_decode( $results[0]->responseText, true );
			if ($this->_verbose) {
				print_r($data);
			}
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
	 * @desc устанавливает новое соединение с сервером веб агента или использует старое
	 * @param int &$session сессия webAgent
	 * @param int &$N       номер jim сервера
	 * @param int &$page_uniq идентификатор страницы
	 * @param int &$error_code = 0 принимает не 0 если хотя бы один из статусов ответов от сервера > 400
	 * @param int &$error_url = '' принимает значение url первого ресурса, ответ которого  > 400
	*/
	private function _createConnection(&$session = null, &$N = null, &$page_uniq = null, &$error_code = 0, &$error_url = '') {
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
			$referer = 'http://webagent.mail.ru/r/webagent/popup.html';
			$rdata = $request->execute($referer, array(), '', $proc, false);
			$response = $request->execute($url, $data, $referer, $proc, false);
			$this->_setConnectionErrorCode($url, $error_code, $error_url, $response);
			if ($this->_verbose) {
				$this->_log('POST ' . $url);
				print_r($response);
			}
			$this->_log('try get sdc for jiml');
			$referer_2 = $this->_default_jiml_referer;
			$response = $request->execute($referer_2,  array(), $referer, $proc, false, true);
			$this->_setConnectionErrorCode($referer_2, $error_code, $error_url, $response);
			
			$url = 'https://auth.mail.ru/sdc?from=http%3A%2F%2Fjiml.mail.ru%2Fuser%2Fstatus&JSONP_call=wa_3iojinovkfm';
			$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
			$this->_setConnectionErrorCode($url, $error_code, $error_url, $response);
			if ($this->_verbose) {
				$this->_log('GET ' . $url);
				print_r($response);
			}
		
			if (!$N) {
				$this->_log('try get \'jimN\'');
				$url = 'http://jiml.mail.ru/user/status';
				$get = '?x-email=' . $this->_username . '@' . $this->_domain . '&rnum=bmaster&r=' . rand(10000, 99999);
				$response = $request->execute($url . $get,  array(), $referer_2, $proc, false, true);
				$this->_setConnectionErrorCode($url . $get, $error_code, $error_url, $response);
				if ($this->_verbose) {
					$this->_log('GET ' . $url);
					print_r($response);
				}
				$userData = json_decode($response->responseText, true);
				if (isset( $userData[0][1]['body']['user']['status']['jimServer'] )) {
					$n = preg_replace("#[\D]#", '', $userData[0][1]['body']['user']['status']['jimServer']);
					$N = $n;
					$this->_log("jimN = {$n}");
				}
			}
		
			$this->_log('try get "p" cookie');
			$url = "http://rs.mail.ru/d706711.gif?rnd=" . (rand(1, 9999) / 1000);
			$response = $request->execute($url,  array(), $referer, $proc, false, true);
			$this->_setConnectionErrorCode($url, $error_code, $error_url, $response);
			if ($this->_verbose) {
				$this->_log('GET ' . $url);
				print_r($response);
			}
			$this->_log("try get sdc for  server '{$n}'");
			$referer_2 = str_replace('{$n}', $n, $this->_default_jimN_referer);
			$url = "https://auth.mail.ru/sdc?from=http%3A%2F%2Fjim{$n}.mail.ru%2Fconnect&JSONP_call=wa_kgrw8ges9fq";
			$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
			$this->_setConnectionErrorCode($url, $error_code, $error_url, $response);
			if ($this->_verbose) {
				$this->_log('GET ' . $url);
				print_r($response);
			}
		} else {
			$request = new Request(false);
		}
		
		$this->_log("try connect");
		if (!$session) {
			$session = round( (rand(1,9999) / 10000) * 0x1E5);
		}
		if (!$page_uniq) {
			$page_uniq = round( (rand(1,9999) / 10000) * 0x1E5);
		}
		$r = rand(10000, 99999);
		$referer_2 = str_replace('{$n}', $n, $this->_default_jimN_referer);
		$url = "http://jim{$n}.mail.ru/connect?session={$session}&with_login=1&status=online&show_xstatus=1&page_uniq={$page_uniq}&realm=webagent.mail.ru&sdc=1&x-email={$this->_username}%40{$this->_domain}&r={$r}&rnum=bmaster";
		$response = $request->execute($url,  array(), $referer_2, $proc, false, true);
		$this->_setConnectionErrorCode($url, $error_code, $error_url, $response);
		if ($this->_verbose) {
			$this->_log('GET ' . $url);
			print_r($response);
		}
		return $proc;
	}
	/**
	 * @desc Получает список адресов со страницы https://www.dropbox.com/s/k2a34efmp49s0qd/142email.txt?dl=0
	 * @return array
	*/
	private function _getMailList() {
		$source = dirname(__FILE__) . '/data/mail_list.txt';
		if (!file_exists($source)) {
			throw new Exception("MAIL LIST NOT FOUND!");
		}
		$list = explode("\n", file_get_contents($source));
		$result = array();	 
		$reg = "/^[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+$/i";
		foreach ($list as $mail) {
			$mail = trim($mail);
			if ($mail) {
				$f = preg_match($reg, $mail, $m);
				if ($f) {
					$result[$mail] = $mail;
				} else {
					$msg =  "mail '{$mail}' was ignored";
					echo "\033[41m" . $msg . "\033[m\n";
					$this->_appendInvalidMail($mail);
				}
			}
		}
		return array_values($result);
	}
	/**
	 * @desc Добавляет адрес в список валидных
	 * @return bool
	*/
	private function _appendValidMail($mail) {
		return (bool)file_put_contents(dirname(__FILE__) . '/output/yes.txt', $mail . "\n", FILE_APPEND);
	}
	/**
	 * @desc Добавляет адрес в список невалидных
	 * @return bool
	*/
	private function _appendInvalidMail($mail) {
		return (bool)file_put_contents(dirname(__FILE__) . '/output/no.txt', $mail . "\n", FILE_APPEND);
	}
	/**
	 * @desc освободить ресурсы
	*/
	private function _closeConnection($curl_resource) {
		if ($curl_resource) {
			try {
				@curl_close($curl_resource);
			} catch(Exception $E) {
				echo "Catch error on curl_close";//TODO remove me
			}
		}
	}
	/**
	 * @desc вывод информации
	*/
	private function _log($s) {
		if ($this->_verbose) {
			echo "{$s}...\n";
		}
	}
	/**
	 * @see _createConnection
	 * @desc помогает сохранить кодл ошибки при запросе очередного url при установлении соединения. Запоминается первый из вернувших ошибку
	 * @param string $url
	 * @param int &$error_code
	 * @param string &$error_url
	 * @param stdClass $response
	*/
	private function _setConnectionErrorCode($url, &$error_code, &$error_url, $response) {
		if (!$error_code && $response->responseStatus > 400) {
			$error_code = $response->responseStatus;
			$error_url = $url;
		}
	}
}
new CWebAgentEmulator();
