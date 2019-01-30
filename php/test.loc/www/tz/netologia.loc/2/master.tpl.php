<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
	<title>Данные о продуктах</title>
	<link rel="stylesheet" type="text/css" href="<?=WEB_ROOT ?>/css/style.css" />
</head>
<body>
	<div class="main">
		<div class="center w80 space">
			<div id="output" class="center output">
			<p>Сто последних продуктов</p> 
			<?php CViewHelper::renderData($app->data)?>
			</div>
		</div>
	</div>
</body>
</html> 