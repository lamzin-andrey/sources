<?php
class FtpService
{
    public string $ftpUser = '';
    public string $ftpPass = '';
    public string $ftpIp = '';
    public string $ftpRoot = '';
    public int $ftpId = 0;



    public function __construct()
    {
        
    }


    public function executeFtpBat(string $bat, bool $verbose = false): string
    {
        if ($verbose) {
            echo "Will exec: $bat=======\n\n";
        }

        $batFile = sys_get_temp_dir() . '/ftpbat.bat';
        file_put_contents($batFile, $bat);

        $psftp = 'psftp';

        $cmd = "{$psftp}  {$this->ftpUser}@{$this->ftpIp} -pw {$this->ftpPass} -b {$batFile} 2>&1";
        $o = [];
        exec($cmd, $o);
        
        if ($verbose) {
			print_r($o);
		}
        
        return implode("\n", $o);
    }

    public function getFtpRootDir(): string
    {
        $sitename = '';
        $s = str_replace('{sitename}', $sitename, $this->ftpRoot);
        return $s;
    }



    public function ftpUpload(string $localPath, string $pathForFtp, string $targetName = '', string $md5 = ''):bool
    {
        $localName = pathinfo($localPath, PATHINFO_BASENAME);
        $pathForDir = pathinfo($pathForFtp, PATHINFO_DIRNAME);
        $bat = "cd {$pathForDir}\n";
        $bat .= "put {$localPath}\n";
        $bat .= "get {$localName} {$localPath}.dwnl\n";

        if ($targetName) {
            $shortName = pathinfo($localPath, PATHINFO_BASENAME);
            $bat .= "rename {$shortName} {$targetName}\n";
        }


		//$bat = "pwd\n";
        $bat .= "quit\n";
        
        $this->executeFtpBat($bat, true);

        $checkFile = $localPath . '.dwnl';
        if (file_exists($checkFile)) {
            $checkSum = md5_file($checkFile);
            $sum = $md5;
            if ($checkSum == $sum) {
                unlink($checkFile);
                unlink($localPath);
                return true;
            }
            unlink($checkFile);
        }

        return false;
    }

    private function createFtpOneFolder(string $dirName, array $cd): bool
    {
        $ftpRoot = $this->getFtpRootDir();
        $bat = "cd {$ftpRoot}\n";
        foreach ($cd as $d) {
            $bat .= "cd $d\n";
        }
        $bat .= "mkdir $dirName\n";

        $c  = '<!DOCTYPE html>
                <html>
                    <head>
                        <meta http-equiv="Refresh" content="0; url=/">
                    </head>
                    <body></body>
                    <script>location.href="/"</script>
                </html>
                ';
        $file = sys_get_temp_dir() . '/index.html';
        file_put_contents($file, $c);

        $bat .= "cd $dirName\n";
        //$bat .= "put $file\n";

        $c = $this->getFileContent();
        $phpFile = sys_get_temp_dir() . '/getfile.php';
        file_put_contents($phpFile, $c);
        // $bat .= "put $phpFile\n";

        $bat .= "quit\n";

        $out = $this->executeFtpBat($bat, true);
        unlink($file);
        unlink($phpFile);

        //echo "OUt:\n$out\n\n";

        if (strpos($out, 'failure') === false && strpos($out, 'no such file or directory') === false) {

            return true;
        }

        return false;
    }

    public function createFtpFolder($pathForFTP): void
    {
        // echo "Got path for Ftp {$pathForFTP}\n";
        $ftpRoot = $this->getFtpRootDir();
        $relPath = str_replace($ftpRoot . '/', '', $pathForFTP);
        $relPath = pathinfo($relPath, PATHINFO_DIRNAME);
        //echo "Start with relPath {$relPath}\n";
        $current = $relPath;
        $success = $this->createFtpOneFolder($current, []);
        if ($success) {
            return;
        }
        $a = explode('/', $relPath);
        $cd = [];
        foreach ($a as $dir) {
            $this->createFtpOneFolder($dir, $cd);
            $cd[] = $dir;
        }
    }

    public function removeFile(DrvFile $ent): void
    {
        $this->setFtp($ent);
        $root = pathinfo($this->getFtpRootDir(), PATHINFO_DIRNAME);

        $dir = pathinfo($ent->getWdPath(), PATHINFO_DIRNAME);
        $indexFile = "$dir/index.html";
        $htaccess = "$dir/.htaccess";
        $bat = "cd {$root}\n";
        $bat .= "rm {$ent->getWdPath()}\n";
        $bat .= "rm {$indexFile}\n";
        $bat .= "rm {$htaccess}\n";
        $bat .= "rmdir {$dir}\n";
        $bat .= "quit\n";
        $out = $this->executeFtpBat($bat, true);
    }

    private function getFileContent(): string
    {
        return '<?php
function main():void {
	$file = calculateFile();
	if (file_exists($file)) {
		if(filesize($file) < 40 * pow(1024, 2)) {
			makeRead($file);
		} else {
			makeRdr($file);
		}
	} else {
		make404();
	}
}

function make404(): void
{
	$s = "File not found";
	header("404 Not Found");
	header("Content-Type: text/html");
	header("Content-Length: " . strlen($s));
	echo $s;
	exit;
}

function makeRdr(string $file): void
{
	$s = $_SERVER["REQUEST_URI"];
	$a = explode("/", $s);
	$sz = count($a) - 1;
	$a[$sz] = basename($file);
	header("Location: " . implode("/", $a));
	exit;
}

function makeRead(string $file): void
{
	header("Content-Description: File Transfer");
	header("Content-Type: application/octet-stream");
	header("Content-Disposition: attachment; filename=\"" . basename($file) . "\"");
	header("Expires: 0");
	header("Cache-Control: must-revalidate");
	header("Pragma: public");
	header("Content-Length: " . filesize($file));
	readfile($file);
	exit;
}

function calculateFile():string
{
	$skip = [
		".",
		"..",
		"index.html",
		"getfile.php",
		".htaccess",
	];
	$ls = scandir(__DIR__);
	$trg = __DIR__ . "/notex.html";
	foreach ($ls as $name) {
		if (in_array($name, $skip) || is_dir(__DIR__ . "/" . $name)) {
			continue;
		}
		$trg = __DIR__ . "/" . $name;
		break;
	}
	
	return $trg;
}

main();

';
    }
}
