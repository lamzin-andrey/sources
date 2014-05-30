<?php
class CViewHelper {
	static public function renderData($data) {
		if (count($data) == 0) {
			return;
		}
		$k = 0;
		?><table><?
		for ($i = 0, $j = 0; $i < count($data); $i++, $j++, $k++) {
			if ($j == 0) {
				print "<tr>";
			}
			self::renderRecord($data[$i]);
			if ($j == 3) {
				print "</tr>";
				$j = 0;
			}
		}
		if ($k % 3 == 0) {
			print "</tr>";
		}
		?></table><?
	}
	
	static public function renderRecord($rec) {?>
		<td class='wrapp'><table>
			<tr>
				<td>ID</td>
				<td> <?=$rec["id"]?> </td>
			</tr>
			<tr>
				<td>Name</td>
				<td> <?=$rec["name"]?> </td>
			</tr>
			<tr>
				<td>Url</td>
				<td> 
					<a href="<?=$rec["url"]?>" > <?=$rec["url"]?> </a>
				</td>
			</tr>
			<tr>
				<td>Image</td>
				<td> 
					<img src="<?=WEB_ROOT . "/" .   $rec["image"]?>" width="16" />
				</td>
			</tr>
			<tr>
				<td>Price</td>
				<td> 
					<?= str_replace('.', ',', $rec["price"])?>
				</td>
			</tr>
		</table></td>
	<?}
}