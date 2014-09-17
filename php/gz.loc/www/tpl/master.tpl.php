<!DOCTYPE html>
<html manifest="/gazel.manifest">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title><?=$GLOBALS["title"]?></title>
		<link href="/styles/main.css?1394700" media="all" rel="stylesheet" type="text/css" />
		<script type="text/javascript" src="/js/mootools1.4.5.js"></script>
		<?=@$javascript ?>
		<script type="text/javascript" src="/js/lib.js"></script>
		<script type="text/javascript" src="/js/app.js?a=14"></script>
		<script type="text/javascript">
			var token = '<?=@$_SESSION['utoken']; ?>';
			var uid   = '<?=@$_SESSION['uid']?>';
		</script>
	</head>
	<body><img src="/images/gazel.jpg" class="hide"/><img src="/images/gpasy.jpeg" class="hide"/><img src="/images/term.jpg" class="hide"/><img src="/images/up.png" class="upb hide" id="uppb" /><img src="/images/l-w.gif" class="hide" /><img src="/images/lw.gif" class="hide" />
	<? if ( isset($regId) ) {?>
	<input type="hidden" id="selectedregionid" value="<?=$regId ?>" />
	<?}?>
	<? if ( isset($cityId) ) {?>
	<input type="hidden" id="selectedcityid" value="<?=$cityId ?>" />
	<?} ?>
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
					<?=$GLOBALS["h1"]?>
				</h1>
			</div>
		</header>
		<div id="content"><?php $url = explode('?', $_SERVER["REQUEST_URI"]); $url = $url[0]; 
		if (strpos($url , 'stavropol') !== false || $url == '/') {?>
			<div class="seo" style="margin:10px 10px">
    			<a href="/articles/cena_zakaza_gazeli_v_stavropole.html" target="_blank">Цена заказа газели в Ставрополе</a>
			</div>
		<?php
		 
		}?>
			<div class="maincontent">
				<? include $GLOBALS['inner'] ?>
			</div>
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
 
