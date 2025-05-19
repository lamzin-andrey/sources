#!/bin/bash
Q=`zenity --list --checklist --multiple \
       --title="История изменения файла" \
       --text="Выберите два файла:" \
       --column="0" --column="Дата изменения" --column="Тэг" --column="Полный тэг"  --print-column="4"   --separator=";"  $1
zenity --info --text="$Q"