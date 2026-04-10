<?php
// For php 7
$_ENV['AWS_SUPPRESS_PHP_DEPRECATION_WARNING'] = true;

require __DIR__ . "/aws/vendor/autoload.php";
use Aws\S3\S3Client;

class LandAws {
	private S3Client $s3;
	private string $accessKey  = '';
	private string $secretKey  = '';
	private string $bucketName  = '';
	
	public function __construct(string $accessKey, string $secretKey, string $bucketName)
	{
		$this->accessKey = $accessKey;
		$this->secretKey = $secretKey;
		$this->bucketName = $bucketName;
		$this->s3 = new S3Client([
			"version" => "latest",
			"endpoint" => "https://storage.yandexcloud.net",
			"region" => "ru-central1",
			"credentials" => [
				"key" => $this->accessKey,
				"secret" => $this->secretKey
			],
			// Дополнительные настройки для Yandex Cloud
			"use_path_style_endpoint" => true,
			"http" => [
				"connect_timeout" => 60,
				"timeout" => 60
			]
		]);
	}
	
	/**
	 * Возвращает url в случае успеха или пустую строку.
	 * Спокойно перезаписывает файл.
	*/
	public function send(string  $localPath, string $remotePath):string
	{
		if (file_exists($localPath)) {
			$c = file_get_contents($localPath);
			return $this->sendc($remotePath, $c);
		}
		return '';
	}
	
	/**
	 * Возвращает url в случае успеха или пустую строку.
	 * Спокойно перезаписывает файл.
	*/
	public function sendc(string  $remotePath, string $content):string
	{
		try {
			$a = $this->_sendc($content, $remotePath);
			if (isset($a['url']) && trim($a['url'])) {
				return trim($a['url']);
			}
			
			
		} catch (Exception $e) {
			;
		}
		return '';
	}

	public function read(string $remotePath):string
	{
		$bucketName = $this->bucketName;
		$s3 = $this->s3;
		try {
			// Получаем объект из бакета
			$result = $s3->getObject([
				'Bucket' => $bucketName,
				'Key' => $remotePath
			]);
			
			// Читаем содержимое как строку
			$content = (string) $result['Body'];
			
			return $content;
			
		} catch (Aws\S3\Exception\S3Exception $e) {
			// Если файл не найден (404), возвращаем пустую строку
			if ($e->getStatusCode() == 404) {
				return '';
			}
			
			// Для других ошибок можно либо вернуть пустую строку, либо пробросить исключение
			// Здесь возвращаем пустую строку и логируем ошибку
			error_log("Error reading file from S3: " . $e->getMessage());
			return '';
			
		} catch (Exception $e) {
			// Любые другие ошибки
			error_log("Unexpected error reading file: " . $e->getMessage());
			return '';
		}
	}


	public function exists(string $remotePath):bool
	{
		if (!$this->_exists($remotePath)) {
			return $this->directoryExists($remotePath);
		}
		return true;
	}

	private function _exists(string $remotePath):bool
	{
		$bucketName = $this->bucketName;
		$s3 = $this->s3;
		try {
			$result = $s3->listObjects([
				'Bucket' => $bucketName,
				'Prefix' => $remotePath,
				'MaxKeys' => 1
			]);
			
			return !empty($result['Contents']);
			
		} catch (Exception $e) {
			return false;
		}
	}

	/**
	 * Проверяет существование каталога (маркера)
	 */
	public function directoryExists(string $directoryPath):bool
	{
		$bucketName = $this->bucketName;
		$s3 = $this->s3;
		// Убеждаемся, что путь заканчивается на /
		$directoryPath = rtrim($directoryPath, '/') . '/';
		
		try {
			$result = $s3->listObjects([
				'Bucket' => $bucketName,
				'Prefix' => $directoryPath,
				'MaxKeys' => 1
			]);
			
			return !empty($result['Contents']);
			
		} catch (Exception $e) {
			return false;
		}
	}
	
	public function delete(string $remotePath):bool
	{
		$bucketName = $this->bucketName;
		$s3 = $this->s3;
		
		try {
			// Удаляем файл
			$result = $s3->deleteObject([
				'Bucket' => $bucketName,
				'Key' => $remotePath
			]);
			
			return true;
			
		} catch (Exception $e) {
			return false;
		}
	}

	
	/**
	 * @return array<string, mixed> 
	*/
	private function _sendc(string $content, string $remotePath) {
		$s3 = $this->s3; // предполагаем, что $s3 клиент уже создан и доступен глобально
		$bucketName = $this->bucketName;
		
		// Разделяем путь на каталог и имя файла
		$pathParts = explode('/', $remotePath);
		$fileName = array_pop($pathParts);
		$directoryPath = implode('/', $pathParts);
		
		try {
			// Проверяем, существует ли "каталог" (в S3 каталоги виртуальные)
			// В S3 нет реальных каталогов, поэтому просто проверяем, есть ли объекты с таким префиксом
			if (!empty($directoryPath)) {
				// Создаем маркер каталога (опционально)
				// Можно создать пустой объект с именем каталога, заканчивающимся на /
				$directoryMarker = $directoryPath . '/';
				
				// Проверяем, существует ли уже маркер каталога
				try {
					$s3->headObject([
						'Bucket' => $bucketName,
						'Key' => $directoryMarker
					]);
				} catch (Aws\S3\Exception\S3Exception $e) {
					// Если объект не найден (404), создаем маркер каталога
					if ($e->getStatusCode() == 404) {
						$s3->putObject([
							'Bucket' => $bucketName,
							'Key' => $directoryMarker,
							'Body' => '',
							'ContentType' => 'application/x-directory'
						]);
					} else {
						throw $e; // Пробрасываем другие ошибки
					}
				}
			}
			
			// Загружаем файл
			$result = $s3->putObject([
				'Bucket' => $bucketName,
				'Key' => $remotePath,
				'Body' => $content,
				'ContentType' => $this->_mimeContentTypeFromFilename($fileName) // Определяем MIME тип
			]);
			
			return [
				'success' => true,
				'path' => $remotePath,
				'url' => $result['ObjectURL'] ?? null,
				'message' => 'File uploaded successfully'
			];
			
		} catch (Exception $e) {
			return [
				'success' => false,
				'path' => $remotePath,
				'url' => null,
				'error' => $e->getMessage()
			];
		}
	}

	// Вспомогательная функция для определения MIME типа
	private function _mimeContentTypeFromFilename(string $filename) {
		$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
		$mimeTypes = [
			'txt' => 'text/plain',
			'html' => 'text/html',
			'css' => 'text/css',
			'js' => 'application/javascript',
			'json' => 'application/json',
			'xml' => 'application/xml',
			'jpg' => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'png' => 'image/png',
			'gif' => 'image/gif',
			'pdf' => 'application/pdf',
			'zip' => 'application/zip',
			'mp4' => 'video/mp4',
			'mp3' => 'audio/mpeg',
		];
		
		return $mimeTypes[$ext] ?? 'application/octet-stream';
	}

}
