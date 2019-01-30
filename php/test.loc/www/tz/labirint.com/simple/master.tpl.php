<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
	<title>Чудо-Дерево - простейшая реализация</title>
	<link rel="stylesheet" type="text/css" href="<?=WEB_ROOT ?>/css/style.css" />
</head>
<body>
	<div class="main">
		<div class="center w80 space">
			<div id="output" class="center output"><?php CViewHelper::renderTree($app->tree)?></div>
		</div>
	</div>
</body>
</html> 