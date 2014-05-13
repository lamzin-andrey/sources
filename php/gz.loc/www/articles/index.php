<? 
$url = explode('?', $_SERVER["REQUEST_URI"]);
$url = $url[0];
$dir = dirname(__FILE__);
$a = explode("/", $url);
$url = @$a[2];
if ($url != "index.php") {
	if ( file_exists("$dir/$url") ) {
		$content = file_get_contents("$dir/$url");
		exit($content);
	}
}
header("HTTP/1.1 404 Not Found");?><!DOCTYPE html>
<html manifest="/gazel.manifest">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Заказ Газели онлайн в любом городе России</title>
		<link href="/styles/main.css?1394700" media="all" rel="stylesheet" type="text/css" />
		<script type="text/javascript" src="/js/mootools1.4.5.js"></script>
				<script type="text/javascript" src="/js/lib.js"></script>
		<script type="text/javascript" src="/js/app.js?a=14"></script>
		<script type="text/javascript">
			var token = '49dcbf27eac2e1d5a48bb8eb7263f333';
			var uid   = '';
		</script>
	</head>
	<body><img src="/images/gazel.jpg" class="hide"/><img src="/images/gpasy.jpeg" class="hide"/><img src="/images/term.jpg" class="hide"/><img src="/images/up.png" class="upb hide" id="uppb" /><img src="/images/l-w.gif" class="hide" /><img src="/images/lw.gif" class="hide" />
		<header class="mainhead">
			<div id="logoplace">
				<div id="logo-out">
					<div id="logo-in">
						<a href="/">
							<img src="/images/gazeli.png"/>
						</a>
					</div>				
				</div>
				<div class="slogan">
				</div>
			</div>
			<div id="banner-out">
				<h1 id="banner-in">
					Заказ ГАЗели в любом городе России				</h1>
			</div>
		</header>
		<div id="content">			<div class="maincontent">
				<div id="mainsfrormerror" class="vis">
	<p class="adv404">
		<h3>404 Not Found</h3>
		Нет такой страницы на этом сайте
	</p>
</div>			</div>
			<div style="clear:both"> </div>
		</div>
		<div id="footer">
				<div id="counter-out">
					<div id="counter-in">
						<!--LiveInternet counter--><script type="text/javascript"><!--
document.write("<a href='http://www.liveinternet.ru/click' "+
"target=_blank><img src='//counter.yadro.ru/hit?t44.10;r"+
escape(document.referrer)+((typeof(screen)=="undefined")?"":
";s"+screen.width+"*"+screen.height+"*"+(screen.colorDepth?
screen.colorDepth:screen.pixelDepth))+";u"+escape(document.URL)+
";"+Math.random()+
"' alt='' title='LiveInternet' "+
"border='0' width='31' height='31'><\/a>")
//--></script><!--/LiveInternet-->
					</div>
				</div>
		</div>
	</body>
</html>
