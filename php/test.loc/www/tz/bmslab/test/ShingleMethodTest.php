<?php
//использую phpunit.phar  4.1.2 
 
require dirname(__FILE__) . "/../cshinglemethod.php";

class CShingleMethodTest extends PHPUnit_Framework_TestCase {
    public function testConstruct()  {
    	$shinglemethod_default = new CShingleMethod();
        $this->	assertEquals(3, $shinglemethod_default->getShingleSize());
		$shinglemethod = new CShingleMethod(2);
		$this->assertEquals(2, $shinglemethod->getShingleSize());
    }
    
	public function testShingleSize()  {
    	$shinglemethod_default = new CShingleMethod();
    	$shinglemethod_default->setShingleSize(1);
        $this->assertEquals(1, $shinglemethod_default->getShingleSize());
    }
    
	public function testCompare() {
    	$shinglemethod = new CShingleMethod();
    	//провальный тест, загружаю два заведомо разных файла
    	$data = $this->_loadExample("Kipling-Afrika-Marshak.txt", "Kipling-Tomlinson-Appel.txt");
    	if ($data !== false) {
    		print "\nstart faled test... \n";
    		$result = $shinglemethod->compare($data[0], $data[1]);
    		$this->assertTrue( (0.0 == $result));
    	}
		//ожидаю что файлы будут совпадать при размере шингла 3
    	$data = $this->_loadExample("Kipling-Tomlinson-Appel.txt", "Kipling-Tomlinson-Onoshkovich-i-Yacin.txt");
    	if ($data !== false) {
    		print "start test Kipling Tomlinson... \n";
    		$result = $shinglemethod->compare($data[0], $data[1]);
    		$this->assertGreaterThan( 0.0, $result);
    		printf('%.2f%%' . "\n", $result);
    	}
		//ожидаю что файлы будут совпадать при размере шингла 2
    	$data = $this->_loadExample("Kipling-Afrika-Marshak.txt", "Kipling-Afrika-Onoshkovich-Yacin.txt");
    	if ($data !== false) {
    		print "start test Kipling Afrika... \n";
    		$shinglemethod->setShingleSize(2);
    		$result = $shinglemethod->compare($data[0], $data[1]);
    		$this->assertGreaterThan( 0.0, $result);
    		printf('%.2f%%' . "\n", $result);
    	}
		//ожидаю что файлы будут совпадать при размере шингла 3
    	$data = $this->_loadExample("Kipling-TommyAtkins-Gringoltz.txt", "Kipling-TommyAtkins-Marshak.txt");
    	if ($data !== false) {
    		print "start test Kipling Tommy Atkins... \n";
    		$result = $shinglemethod->compare($data[0], $data[1]);
    		$this->assertGreaterThan( 0.0, $result);
    		printf('%.2f%%' . "\n", $result);
    	}
		//ожидаю что файлы будут совпадать при размере шингла 10 (и меньше)
    	$data = $this->_loadExample("Kipling-Maugli-Daruse.txt", "Kipling-Maugli-unknown.txt");
    	if ($data !== false) {
    		print "start test Kipling Maugli... It may take 30 seconds or more... \n";
    		$shinglemethod->setShingleSize(10);
    		$result = $shinglemethod->compare($data[0], $data[1]);
    		$this->assertGreaterThan( 0.0, $result);
    		printf('%.2f%%' . "\n", $result);
    	}
    	//тест ожидаемого исключения
    	print "start wait exception... \n";
    	$this->setExpectedException(
          'ShingleMethodException', 'Nothing to do', ShingleMethodException::NOTHING_TO_DO 
        );
        $shinglemethod->compare(150, '');
    }
    
    private function _loadExample($filename1, $filename2) {
    	$path = dirname(__FILE__). "/../data";
    	if ( file_exists("$path/$filename1") && file_exists("$path/$filename2")) {
    		return array( file_get_contents("$path/$filename1"),  file_get_contents("$path/$filename2"));
    	}
    	return false;
    }
}