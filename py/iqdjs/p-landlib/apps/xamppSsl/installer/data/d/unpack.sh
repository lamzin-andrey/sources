#!/bin/bash
mkdir /opt/p-landlib
mkdir /opt/p-landlib/apps
mkdir /opt/p-landlib/apps/xamppSsl
mkdir /usr/local/fastxampp
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/xamppSsl.py /opt/p-landlib/apps/xamppSsl/xamppSsl.py
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/xamppSsl.sh /opt/p-landlib/apps/xamppSsl/xamppSsl.sh
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/d /opt/p-landlib/apps/xamppSsl
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/i /opt/p-landlib/apps/xamppSsl
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/p /opt/p-landlib/apps/xamppSsl
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/d/landdesk /opt/p-landlib
chmod -R 755 /opt/p-landlib/apps/xamppSsl
mkdir /home/andrey/Документы/xamppSsl
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/p/settings/help/css /home/andrey/Документы/xamppSsl
echo ru > /opt/p-landlib/apps/xamppSsl/p/settings/locale
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/p/settings/help/mkcert /home/andrey/Документы/xamppSsl
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/a/p/settings/help/rootCert /home/andrey/Документы/xamppSsl
chmod -R 755 /home/andrey/Документы/xamppSsl
chown andrey:andrey -R /home/andrey/Документы/xamppSsl
echo /home/andrey/Документы > /opt/p-landlib/apps/xamppSsl/d/docDir.txt
chmod  766 /opt/p-landlib/apps/xamppSsl/d/docDir.txt
chown andrey:andrey -R /opt/p-landlib/apps/xamppSsl
/etc/init.d/apache stop
/etc/init.d/apache22 stop
/etc/init.d/apache24 stop
/opt/lampp/lampp stop
mkdir /usr/local/fastxampp
echo Копирование файлов
#cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/xampp-php74.tar.gz /opt/xampp.tar.gz
echo Распаковка архива, пожалуйста ждите
cd /opt
adduser --system --disabled-password --disabled-login mysql
#tar -xzvf /opt/xampp.tar.gz
echo Распаковка завершена
mv /opt/lampp/etc/extra /opt/lampp/etc/__extra
cp -rf /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/extra /opt/lampp/etc/extra

chmod -R 777 /opt/lampp/etc/extra
chmod  776 /etc/hosts
echo Конфигурация multihosts
mv /opt/lampp/etc/httpd.conf /opt/lampp/etc/__httpd.conf
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/httpd.conf /opt/lampp/etc/httpd.conf

chmod 777 /opt/lampp/htdocs
mkdir /opt/lampp/htdocs/localhost
mkdir /opt/lampp/htdocs/localhost/www
chmod 777 /opt/lampp/htdocs/localhost/www
cp -rf /opt/lampp/htdocs/dashboard /opt/lampp/htdocs/localhost/www/dashboard
rm -r /opt/lampp/htdocs/dashboard
cp -rf /opt/lampp/htdocs/img /opt/lampp/htdocs/localhost/www/img
rm -r /opt/lampp/htdocs/img
cp -rf /opt/lampp/htdocs/webalizer /opt/lampp/htdocs/localhost/www/webalizer
rm -r /opt/lampp/htdocs/webalizer
cp -f /opt/lampp/htdocs/applications.html /opt/lampp/htdocs/localhost/www/applications.html
rm  /opt/lampp/htdocs/applications.html
cp -f /opt/lampp/htdocs/bitnami.css /opt/lampp/htdocs/localhost/www/bitnami.css
rm  /opt/lampp/htdocs/bitnami.css
cp -f /opt/lampp/htdocs/favicon.ico /opt/lampp/htdocs/localhost/www/favicon.ico
rm  /opt/lampp/htdocs/favicon.ico
cp -f /opt/lampp/htdocs/index.php /opt/lampp/htdocs/localhost/www/index.php
rm  /opt/lampp/htdocs/index.php
mv /opt/lampp/etc/php.ini /opt/lampp/etc/__php.ini
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/php.ini /opt/lampp/etc/php.ini
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/memcached.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/memcached.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/xdebug.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/xdebug.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/amqp.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/amqp.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/opcache.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/opcache.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/redis.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/redis.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/sodium.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/sodium.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/imagick.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/imagick.so
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/libMagickWand-6.Q16.so.6 /opt/lampp/lib/libMagickWand-6.Q16.so.6
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/libMagickCore-6.Q16.so.6 /opt/lampp/lib/libMagickCore-6.Q16.so.6
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/liblqr-1.so.0 /opt/lampp/lib/liblqr-1.so.0
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11
rm -r /opt/xampp.tar.gz
echo Конфигурация multihosts завершена
echo Создание каталога fastxampp
mkdir /usr/local/fastxampp
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/bin/fastxamppd /usr/local/fastxampp/fastxamppd
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/bin/ru/lang /usr/local/fastxampp/lang
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/bin/netstat /bin/netstat
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/systemctl/fastxamppd.sh /usr/local/fastxampp/fastxamppd.sh
chmod 766 /usr/local/fastxampp/fastxamppd.sh
echo '#! /bin/sh' >> /usr/local/fastxampp/fastxamppd.sh
echo 'mount -t tmpfs tmpfs /home/andrey/.config/fastxampp -o size=1M' >> /usr/local/fastxampp/fastxamppd.sh
echo '/usr/local/fastxampp/fastxamppd andrey' >> /usr/local/fastxampp/fastxamppd.sh
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/x/systemctl/fastxampp.service /etc/systemd/system/fastxampp.service
systemctl enable fastxampp.service
echo 'Создание файловой системы в оперативной памяти'
mount -t tmpfs tmpfs /home/andrey/.config/fastxampp -o size=1M
sleep 2
echo 'Создание файловой системы в оперативной памяти'
echo '' > /home/andrey/.config/fastxampp/.sock
chown andrey:andrey /home/andrey/.config/fastxampp/.sock
echo 'Запуск демона fastxamppd'
killall fastxamppd
/usr/local/fastxampp/fastxamppd andrey &
cp -f /home/andrey/hdata/programs/my/sources/py/iqdjs/p-landlib/apps/xamppSsl/installer/data/fastxamppssl.desktop /usr/share/applications/fastxamppssl.desktop
