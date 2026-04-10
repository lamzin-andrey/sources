#!/usr/bin/env php
<?php

/**
 * Здесь меняем ftp на aws
 * */

include_once __DIR__ . '/laws.php';

class LwGit
{
    private string $gitDir;
    private string $configFile;
    private array $config;
    private LandAws $awsService;

    public function __construct()
    {
        $this->gitDir = getcwd() . '/.git';
        $this->configFile = $this->gitDir . '/lwgit.json';
        
        // Check if we're in a git repository
        if (!is_dir($this->gitDir)) {
            die("Error: .git directory not found. Are you in a git repository?\n");
        }
        
        // Load or create config
        $this->loadConfig();
        
        // Initialize AWS service
        $this->initAwsService();
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
        
        $accessKey = $this->getInput("Enter accessKey: ");
        if (empty($accessKey)) {
            die("Error: accessKey cannot be empty\n");
        }
        
        $secretKey = $this->getInput("Enter secretKey: ");
        if (empty($secretKey)) {
            die("Error: secretKey cannot be empty\n");
        }
        
        $bucketName = $this->getInput("Enter bucketName: ");
        if (empty($bucketName)) {
            die("Error: bucketName cannot be empty\n");
        }
        
        $this->config = [
            'accessKey' => $accessKey,
            'secretKey' => $secretKey,
            'bucketName' => $bucketName
        ];
        
        file_put_contents($this->configFile, json_encode($this->config, JSON_PRETTY_PRINT));
        echo "Configuration saved to {$this->configFile}\n";
    }

    private function initAwsService(): void
    {
		
		if (!isset($this->config['accessKey'], $this->config['secretKey'], $this->config['bucketName'])) {
            die("Error: Invalid AWS connection string parameters. Required:\n\naccessKey\nsecretKey\nbucketName\n\n");
        }
        
        $accessKey = $this->config['accessKey'];
        $secretKey = $this->config['secretKey'];
        $bucketName = $this->config['bucketName'];
        
        
        // This would be replaced with your actual IFtpService implementation
        $this->awsService = new LandAws($accessKey, $secretKey, $bucketName);
        
        
    }

    public function commit(): void
    {
        // Get git status
        exec('git status --porcelain', $statusOutput);
        if (empty($statusOutput)) {
            echo "No changes to commit.\n";
            return;
        }
        //exec('mv $HOME/.ssh $HOME/.ssh--');
        
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
        
        // exec('mv $HOME/.ssh-- $HOME/.ssh');
    }

    private function uploadFile(string $file): void
    {
        if (!file_exists($file)) {
            echo "Warning: File {$file} does not exist\n";
            return;
        }
        
        //$remotePath = $this->config['fpath'] . '/' . dirname($file);
        //$remoteFile = $this->config['fpath'] . '/' . $file;
        $remoteFile = $file;
        
        echo "Try short way for {$file}; remote: '{$remoteFile}'\n";
        if ($this->awsService->send($file, $remoteFile)) {
			echo "Short upload ok!\n";
			return;
		}
        
        echo "Error: Failed to upload {$file}\n";
        
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
    die("Usage: lfgit2 commit\n");
}

try {
    $lfgit = new LwGit();
    $lfgit->commit();
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
