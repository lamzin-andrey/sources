#!/usr/bin/env php
<?php

class LPinger {
    private $configDir;
    private $configFile;
    private $dataFile;
    private $pingOutputFile;
    private $pingErrorFile;
    
    public function __construct() {
        $homeDir = getenv('HOME');
        $this->configDir = $homeDir . '/.config/lpinger';
        $this->configFile = $this->configDir . '/conf.php';
        $this->dataFile = $this->configDir . '/lastresult.php';
        $this->pingOutputFile = '/tmp/lpingout.txt';
        $this->pingErrorFile = '/tmp/lpingerr.txt';
    }
    
    public function run($args) {
        if (in_array('--help', $args)) {
            $this->showHelp();
            return;
        }
        
        if (in_array('--data', $args)) {
            $this->showData();
            return;
        }
        
        // Основной режим - пингование доменов
        $this->pingDomains();
    }
    
    private function showHelp() {
        echo "1 Создайте файл ~/.config/lpinger/conf.php\n\n";
        echo "2 Заполните его интересующими доменами в таком формате:\n";
        echo "====BOF====\n";
        echo "<?php\n";
        echo "\$domains = [\n";
        echo "\t'chat.deepseek.com',\n";
        echo "\t'wkard.ru',\n";
        echo "\t'vkard.ru',\n";
        echo "\t'andryuxa.ru',\n";
        echo "\t'pchat.com.ru',\n";
        echo "\t'w7z.ru'\n";
        echo "];\n";
        echo "====EOF====\n\n";
        echo "3 Добавьте в кронтаб запуск раз в час\n";
    }
    
    private function showData() {
        if (!file_exists($this->dataFile)) {
            echo "Нет данных. Запустите программу без параметров для сбора данных.\n";
            return;
        }
        
        include $this->dataFile;
        
        if (empty($data)) {
            echo "Нет данных.\n";
            return;
        }
        
        echo "domain\t\tIP\t\t\tupdated time\n";
        foreach ($data as $domain => $info) {
            echo $domain . "\t" . $info[0] . "\t" . $info[1] . "\n";
        }
    }
    
    private function pingDomains() {
        // Проверяем и создаем конфигурационный файл если нужно
        $domains = $this->loadConfig();
        
        // Загружаем существующие данные
        $existingData = $this->loadExistingData();
        
        // Пингуем каждый домен
        foreach ($domains as $domain) {
            $ip = $this->pingDomain($domain);
            
            if ($ip !== false) {
                // Обновляем данные только если удалось получить IP
                $existingData[$domain] = [
                    $ip,
                    date('Y-m-d H:i:s')
                ];
            }
        }
        
        // Сохраняем обновленные данные
        $this->saveData($existingData);
    }
    
    private function loadConfig() {
        // Создаем директорию если не существует
        if (!is_dir($this->configDir)) {
            mkdir($this->configDir, 0755, true);
        }
        
        // Если файла конфигурации нет, создаем его
        if (!file_exists($this->configFile)) {
            $defaultConfig = "<?php\n";
            $defaultConfig .= "\$domains = [\n";
            $defaultConfig .= "\t'chat.deepseek.com',\n";
            $defaultConfig .= "\t'wkard.ru',\n";
            $defaultConfig .= "\t'vkard.ru',\n";
            $defaultConfig .= "\t'andryuxa.ru',\n";
            $defaultConfig .= "\t'pchat.com.ru',\n";
            $defaultConfig .= "\t'w7z.ru'\n";
            $defaultConfig .= "];\n";
            
            file_put_contents($this->configFile, $defaultConfig);
        }
        
        // Загружаем конфигурацию
        echo "Will include {$this->configFile}\n";
        include $this->configFile;
        
        if (!is_array($domains)) {
            echo "Ошибка: неверный формат конфигурационного файла\n";
            exit(1);
        }
        
        return $domains;
    }
    
    private function loadExistingData() {
        if (file_exists($this->dataFile)) {
            include $this->dataFile;
            return is_array($data) ? $data : [];
        }
        return [];
    }
    
    private function pingDomain($domain) {
        $command = "ping {$domain} -c 4 > {$this->pingOutputFile} 2>{$this->pingErrorFile}";
        exec($command, $output, $returnCode);
        
        if (!file_exists($this->pingOutputFile)) {
            return false;
        }
        
        $output = file_get_contents($this->pingOutputFile);
        
        // Парсим вывод ping для получения IP адреса
        return $this->parseIpFromPingOutput($output, $domain);
    }
    
    private function parseIpFromPingOutput($output, $domain) {
        // Пытаемся найти IP адрес в выводе ping
        // Пример: PING wkard.ru (12.12.258.12) 56(84) bytes of data.
        if (preg_match('/PING\s+' . preg_quote($domain, '/') . '\s*\(([^)]+)\)/', $output, $matches)) {
            $ip = $matches[1];
            
            // Проверяем, что это действительно IP адрес
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        
        // Альтернативный паттерн для некоторых систем
        if (preg_match('/PING\s+[^\s]+\s+\(([^)]+)\)/', $output, $matches)) {
            $ip = $matches[1];
            
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        
        return false;
    }
    
    private function saveData($data) {
        $content = "<?php\n\n";
        $content .= "\$data = [\n";
        
        foreach ($data as $domain => $info) {
            $content .= "\t'{$domain}' => ['{$info[0]}', '{$info[1]}'],\n";
        }
        
        $content .= "];\n";
        
        file_put_contents($this->dataFile, $content);
    }
}

// Запуск программы
$pinger = new LPinger();
$pinger->run($argv);
