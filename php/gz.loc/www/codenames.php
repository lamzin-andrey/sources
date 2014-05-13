<?php


function translite ($string)  {
	$string = @ereg_replace("ё","e",$string);
	$string = @ereg_replace("й","i",$string);
	$string = @ereg_replace("ю","yu",$string);
	$string = @ereg_replace("ь","",$string);
	$string = @ereg_replace("ч","ch",$string);
	$string = @ereg_replace("щ","sh",$string);
	$string = @ereg_replace("ц","c",$string);
	$string = @ereg_replace("у","u",$string);
	$string = @ereg_replace("к","k",$string);
	$string = @ereg_replace("е","e",$string);
	$string = @ereg_replace("н","n",$string);
	$string = @ereg_replace("г","g",$string);
	$string = @ereg_replace("ш","sh",$string);
	$string = @ereg_replace("з","z",$string);
	$string = @ereg_replace("х","h",$string);
	$string = @ereg_replace("ъ","",$string);
	$string = @ereg_replace("ф","f",$string);
	$string = @ereg_replace("ы","i",$string);
	$string = @ereg_replace("в","v",$string);
	$string = @ereg_replace("а","a",$string);
	$string = @ereg_replace("п","p",$string);
	$string = @ereg_replace("р","r",$string);
	$string = @ereg_replace("о","o",$string);
	$string = @ereg_replace("л","l",$string);
	$string = @ereg_replace("д","d",$string);
	$string = @ereg_replace("ж","j",$string);
	$string = @ereg_replace("э","е",$string);
	$string = @ereg_replace("я","ya",$string);
	$string = @ereg_replace("с","s",$string);
	$string = @ereg_replace("м","m",$string);
	$string = @ereg_replace("и","i",$string);
	$string = @ereg_replace("т","t",$string);
	$string = @ereg_replace("б","b",$string);
	$string = @ereg_replace("Ё","E",$string);
	$string = @ereg_replace("Й","I",$string);
	$string = @ereg_replace("Ю","YU",$string);
	$string = @ereg_replace("Ч","CH",$string);
	$string = @ereg_replace("Ь","",$string);
	$string = @ereg_replace("Щ","SH",$string);
	$string = @ereg_replace("Ц","C",$string);
	$string = @ereg_replace("У","U",$string);
	$string = @ereg_replace("К","K",$string);
	$string = @ereg_replace("Е","E",$string);
	$string = @ereg_replace("Н","N",$string);
	$string = @ereg_replace("Г","G",$string);
	$string = @ereg_replace("Ш","SH",$string);
	$string = @ereg_replace("З","Z",$string);
	$string = @ereg_replace("Х","H",$string);
	$string = @ereg_replace("Ъ","",$string);
	$string = @ereg_replace("Ф","F",$string);
	$string = @ereg_replace("Ы","I",$string);
	$string = @ereg_replace("В","V",$string);
	$string = @ereg_replace("А","A",$string);
	$string = @ereg_replace("П","P",$string);
	$string = @ereg_replace("Р","R",$string);
	$string = @ereg_replace("О","O",$string);
	$string = @ereg_replace("Л","L",$string);
	$string = @ereg_replace("Д","D",$string);
	$string = @ereg_replace("Ж","J",$string);
	$string = @ereg_replace("Э","E",$string);
	$string = @ereg_replace("Я","YA",$string);
	$string = @ereg_replace("С","S",$string);
	$string = @ereg_replace("М","M",$string);
	$string = @ereg_replace("И","I",$string);
	$string = @ereg_replace("Т","T",$string);
	$string = @ereg_replace("Б","B",$string);
	$string = str_replace(" ","_",$string);
	$string = str_replace('"',"",$string);
	$string = str_replace('.',"",$string);
	$string = str_replace("'","",$string);
	$string = str_replace(",","",$string);
	$string = str_replace('\\', "", $string);
	
	return strtolower($string);
}

include dirname(__FILE__). "/config.php";

set_time_limit(0);

$cmd = "SELECT * FROM countries";
$res = mysql_query($cmd);

while ($row = mysql_fetch_array($res)) {
	$name = $row["country_name"];
	$codename = translite($name);
	$id = $row['id'];
	$cmd = "UPDATE countries SET codename = '$codename' WHERE id = $id";
	print "$name, $codename<br>";
	mysql_query($cmd);
}




$cmd = "SELECT * FROM regions";
$res = mysql_query($cmd);

while ($row = mysql_fetch_array($res)) {
	$name = $row["region_name"];
	$codename = translite($name);
	$id = $row['id'];
	$cmd = "UPDATE regions SET codename = '$codename' WHERE id = $id";
	print "$name, $codename<br>";
	mysql_query($cmd);
}




$cmd = "SELECT * FROM cities";
$res = mysql_query($cmd);

while ($row = mysql_fetch_array($res)) {
	$name = $row["city_name"];
	$codename = translite($name);
	$id = $row['id'];
	$cmd = "UPDATE cities SET codename = '$codename' WHERE id = $id";
	print "$name, $codename<br>";
	mysql_query($cmd);
}


 $cmd = "SELECT * FROM main";
$res = mysql_query($cmd);

while ($row = mysql_fetch_array($res)) {
	$name = $row["title"];
	$codename = translite($name);
	$id = $row['id'];
	$cmd = "UPDATE main SET codename = '$codename' WHERE id = $id";
	print "$name, $codename<br>";
	mysql_query($cmd);
}