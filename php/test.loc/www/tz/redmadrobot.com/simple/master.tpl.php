<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
	<title>Сервис для отправки HTTP запросов - простейшая реализация</title>
	<link rel="stylesheet" type="text/css" href="<?=WEB_ROOT ?>/css/style.css" />
	<script type="text/javascript" src="<?=WEB_ROOT ?>/js/jquery-1.11.0.min.js"></script>
	<script type="text/javascript" src="<?=WEB_ROOT ?>/js/app.js"></script>
</head>
<body>
	<div class="main">
		<div class="center w80 space">
			<form method="POST" action="<?=WEB_ROOT ?>/">
				<table class="center w60">
					<tr>
						<td colspan="3">Введите URL</td>
					</tr>
					<tr>
						<td colspan="3">
							<input type="text" id="url" name="url" />
						</td>
					</tr>
					<tr class="selectMethodRow">
						<td colspan="3">
							<input type="radio" id="iGet" name="requestMethod" value="get" checked="checked" /> <label for="iGet">GET</label>
							<input type="radio" id="iPost" name="requestMethod" value="post" /> <label for="iPost">POST</label>
						</td>
					</tr>
					<tr>
						<td>Параметр 1</td>
						<td>
							<input type="text" class="argname" id="argname-1" name="argnames[]" />
						</td>
						<td>
							<input type="text" class="argval" id="arg-1" name="args[]" />
						</td>
					</tr>
					<tr>
						<td>Параметр 2</td>
						<td>
							<input type="text" class="argname" id="argname-2" name="argnames[]" />
						</td>
						<td>
							<input type="text" class="argval" id="arg-2" name="args[]" />
						</td>
					</tr>
					<tr>
						<td>Параметр 3</td>
						<td>
							<input type="text" class="argname" id="argname-3" name="argnames[]" />
						</td>
						<td>
							<input type="text" class="argval"id="arg-3" name="args[]" />
						</td>
					</tr>
					<tr>
						<td>Параметр 4</td>
						<td>
							<input type="text" class="argname" id="argname-4" name="argnames[]" />
						</td>
						<td>
							<input type="text" class="argval" id="arg-4" name="args[]" />
						</td>
					</tr>
					<tr>
						<td>Параметр 5</td>
						<td>
							<input type="text" class="argname" id="argname-5" name="argnames[]" />
						</td>
						<td>
							<input type="text" class="argval" id="arg-5" name="args[]" />
						</td>
					</tr>
					<tr class="submitRow">
						<td colspan="3">
							<input type="submit" id="iSubmit" name="op" value="Подождите..." disabled="disabled"/>
						</td>
					</tr>
				</table>
			</form>
			<div id="loader" class="center output loaderplace">
				<img src="<?=WEB_ROOT ?>/img/ploader.gif" />
			</div>
			<div id="output" class="center output"></div>
		</div>
	</div>
</body>
</html> 