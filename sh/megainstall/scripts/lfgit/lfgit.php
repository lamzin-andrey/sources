#!/usr/bin/env php
<?php

include_once __DIR__ . '/FtpService.php';

class LfGit
{
    private string $gitDir;
    private string $configFile;
    private array $config;
    private FtpService $ftpService;

    public function __construct()
    {
        $this->gitDir = getcwd() . '/.git';
        $this->configFile = $this->gitDir . '/lfgit.json';
        
        // Check if we're in a git repository
        if (!is_dir($this->gitDir)) {
            die("Error: .git directory not found. Are you in a git repository?\n");
        }
        
        // Load or create config
        $this->loadConfig();
        
        // Initialize FTP service
        $this->initFtpService();
    }

    private function loadConfig(): void
    {
        if (!file_exists($this->configFile)) {
            $this->createConfig();
        }
        
        $configContent = file_get_contents($this->configFile);
        $this->config = json_decode($configContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            die("Error: Invalid JSON in lfgit.json\n");
        }
    }

    private function createConfig(): void
    {
        echo "Configuration file not found. Let's create it.\n";
        
        $connect = $this->getInput("Enter FTP connection string (user:password@host): ");
        if (empty($connect)) {
            die("Error: Connection string cannot be empty\n");
        }
        
        $fpath = $this->getInput("Enter FTP root path (should match local git root): ");
        if (empty($fpath)) {
            die("Error: FTP path cannot be empty\n");
        }
        
        $this->config = [
            'connect' => $connect,
            'fpath' => $fpath
        ];
        
        file_put_contents($this->configFile, json_encode($this->config, JSON_PRETTY_PRINT));
        echo "Configuration saved to {$this->configFile}\n";
    }

    private function initFtpService(): void
    {
        // Parse connection string
        $connect = $this->config['connect'];
        $parts = parse_url("ftp://{$connect}");
        
        if (!$parts || !isset($parts['user'], $parts['pass'], $parts['host'])) {
            die("Error: Invalid FTP connection string format\n");
        }
        
        // This would be replaced with your actual IFtpService implementation
        $this->ftpService = new FtpService();
        
        $this->ftpService->ftpUser = $parts['user'];
        $this->ftpService->ftpPass = $parts['pass'];
        $this->ftpService->ftpIp = $parts['host'];
        $this->ftpService->ftpRoot = $this->config['fpath'];
    }

    public function commit(): void
    {
        // Get git status
        exec('git status --porcelain', $statusOutput);
        if (empty($statusOutput)) {
            echo "No changes to commit.\n";
            return;
        }
        
        // Process changed files
        $lines = $statusOutput;
        print_r($lines);
        foreach ($lines as $line) {
            if (strlen($line) < 4) continue;
            
            $status = trim(substr($line, 0, 2));
            $file = trim(substr($line, 2));
            
            // We only care about new and modified files
            if ($status === '??' || ($status[0] ?? '') === ' ' || ($status[1] ?? '') === ' ') {
				echo "Skip `$status`, for file `$file`\n";
				continue;
			}
            
            $this->uploadFile($file);
        }
        
        // Ask for commit message
        $message = $this->getInput("Enter commit message (or press Enter to skip commit): ");
        if (!empty($message)) {
            shell_exec("git commit -am '" . addslashes($message) . "'");
            echo "Changes committed.\n";
        } else {
            echo "Commit skipped.\n";
        }
    }

    private function uploadFile(string $file): void
    {
        if (!file_exists($file)) {
            echo "Warning: File {$file} does not exist\n";
            return;
        }
        
        $remotePath = $this->config['fpath'] . '/' . dirname($file);
        $remoteFile = $this->config['fpath'] . '/' . $file;
        
        echo "Uploading {$file}...\n";
        
        // Create remote directory if needed
        $this->ftpService->createFtpFolder($remoteFile);
        
        // Upload file
        if (!$this->ftpService->ftpUpload($file, $remoteFile)) {
            echo "Error: Failed to upload {$file}\n";
        }
    }
    
    private function getInput(string $msg): string
	{
		echo "$msg\n";
		$handle = fopen("php://stdin", "r");
		$input = trim(fgets($handle));
		fclose($handle);
		return $input;
	}
}

// Main execution
if ($argc < 2 || $argv[1] !== 'commit') {
    die("Usage: lfgit commit\n");
}

try {
    $lfgit = new LfGit();
    $lfgit->commit();
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
