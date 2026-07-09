#!/bin/bash
lpingerpath={LPINGERPATH}
php $lpingerpath/lpinger.php --data > $lpingerpath/data.txt && xdg-open  $lpingerpath/data.txt
