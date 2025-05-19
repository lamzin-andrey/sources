#! /bin/bash
#zenity --list --radiolist \
#       --title="Сжатие архива файлов" \
#       --text="Выберите способ сжатия архива файлов:" \
#       --column="Отметка выбора" --column="Утилита сжатия" \
#       FALSE zip TRUE gzip FALSE bzip2 FALSE 7zip
       

Q=`zenity --list --checklist --multiple \
       --title="Подписка на новости" \
       --text="Отметьте необходимые источники новостей:" \
       --column="Пометить" --column="Источник новостей" --column="Обозначение" --column="N"    --print-column="4"   --separator=";"\
       TRUE "Организация GNU" "gnu-info" "1" \
       FALSE "Linux Week News" "lwn" "2"\
       FALSE "Open Source News" "OSNews" "3" \
       FALSE "LinuxFormat" "LXF" "4"`
zenity --info --text="$Q"