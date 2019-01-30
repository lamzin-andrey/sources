<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
	<title>Данные о продуктах</title>
	<link rel="stylesheet" type="text/css" href="<?=WEB_ROOT ?>/css/style.css" />
	<script type="text/javascript" src="<?=WEB_ROOT ?>/js/app.js" ></script>
</head>
<body>
<div class="hide" id="emailList"><?=join(',', $app->emailList) ?></div>
	<div class="main">
		<div class="center w80 space">
			<div id="output" class="center output">
				<p>Форма для отправки сообщения</p> 
				<form name="message" id="msgform" action="<?=WEB_ROOT ?>/index.php" method="post">
					<table>
						<tr>
							<td colspan="2" class="err"><?=join('<p>', $app->errorMsg) ?></td>
						</tr>
						<tr>
							<td>E-mail</td>
							<td>
								<input type="text" id="email" name="email" value="lamzin80@mail.ru"/>
							</td>
						</tr>
						
						
						<tr>
							<td colspan="2">
								Введите текст:
							</td>
						</tr>
						
						<tr>
							<td colspan="2">
								<textarea id="body" name="body" class="tarea" rows="10"></textarea>
							</td>
						</tr>
						
						
						<tr>
							<td colspan="2" class="tright">
								<input type="submit" id="sub" disabled="disabled" />
							</td>
						</tr>
						<input type="hidden" name="action" value="newmsg"/>
					</table>
				</form>
			</div>
		</div>
	</div>
</body>
</html> 