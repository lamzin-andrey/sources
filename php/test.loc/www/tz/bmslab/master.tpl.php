<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
	<title>Сравнение тестов методом шинглов</title>
	<link rel="stylesheet" type="text/css" href="<?=WEB_ROOT ?>/css/style.css" />
</head>
<body>
	<div class="main">
		<div class="center w80 space">
			<div id="output" class="center output">
				<?php if ($app->result !== null):?>
					<?php if ($app->result):?>
						<p class="bg-light-green green">
							Совпадение текстов <?=$app->result ?>%
						</p>
					<?php else:?>
						<p class="bg-rose red">
							Это различные тексты
						</p>
					<?php endif?>
					<p class="bg-light-green green">Time:<?=$app->microtime ?></p>
				<?php endif?>
				<form action="<?=WEB_ROOT ?>/" method="POST" name="inputform">
					<p>Введите первый текст</p>
					<textarea class="tarea" rows="15" name="text1"><?=$app->postValue('text1') ?></textarea>
					<p>Введите второй текст</p>
					<textarea class="tarea" rows="15" name="text2"><?=$app->postValue('text2') ?></textarea>
					<input type="hidden" name="action" value="compareShingle" />
					<p class="tright"><input type="submit" value="Compare"/></p>
				</form>
			</div>
		</div>
	</div>
</body>
</html> 