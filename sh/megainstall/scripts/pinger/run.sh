#!/bin/bash
lpingerpath=/home/andrey/hdata/programs/my/sources/sh/megainstall/scripts/pinger
php $lpingerpath/lpinger.php --data > $lpingerpath/data.txt && xdg-open  $lpingerpath/data.txt
