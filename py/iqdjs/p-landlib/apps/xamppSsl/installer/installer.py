import os
import gi
import subprocess
import threading
import re
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GdkPixbuf, Pango, cairo
from gi.repository import GLib
from gi.repository import GObject

import sys
sys.path.append("data/d/landdesk")
from IQdjs import *



# Константы
HEADER_SIZE = 12
TEXT_SIZE = 12
DEFAULT_HEADER = "Welcome to FastXamppSsl Setup Wizard"
DEFAULT_HEADER_EN = "Welcome to FastXamppSsl Setup Wizard"
DEFAULT_HEADER_RU = "Добро пожаловать в программу установки"
DEFAULT_TEXT = "<p>Программа установит FastXamppSsl на ваш компьютер.</p><p>Нажмите \"Далее\" для продолжения или \"Отмена\" для выхода из программы установки."
DEFAULT_TEXT_RU = "<p>Программа установит FastXamppSsl на ваш компьютер.</p><p>Нажмите \"Далее\" для продолжения или \"Отмена\" для выхода из программы установки."
DEFAULT_TEXT_EN = "<p>The program will install FastXamppSsl on your computer.</p><p>Click \"Next\" to continue or \"Cancel\" to exit the setup program."
DEFAULT_PREV_TEXT = "Previous"
DEFAULT_PREV_TEXT_EN = "Back"
DEFAULT_PREV_TEXT_RU = "Назад"
DEFAULT_NEXT_TEXT = "Next"
DEFAULT_NEXT_TEXT_EN = "Next"
DEFAULT_NEXT_TEXT_RU = "Далее"
DEFAULT_CANCEL_TEXT = "Cancel"
DEFAULT_CANCEL_TEXT_EN = "Cancel"
DEFAULT_CANCEL_TEXT_RU = "Отмена"
XAMPP_VERSION = "7.4.28"
STEP = 0
LANG = "en"
FINAL_SIZE=6561
STOP_TIMER = 0

def onCreate():
    app.modBtn("p", "", 0) # "p" - id Previous Button; "с", "n" - Next and Cancel.
    app.showChooser("Select language", "Russian", "English")


# Обработчики кнопок (расположены в начале файла)
def onClickPrev(button):
    global STEP
    if STEP == 1:
        app.modBtn("p", "", 0)
        app.showChooser("Select language", "Russian", "English")
        STEP = 0
    #app.setText(DEFAULT_HEADER, "Previous button clicked, appDir = " + app.getHome() + " " + app.getChoosedVariant())
    #app.showProgressBar()
    #app.setProgress("Process is show must go on...", 35, 210)
    #app.modBtn("p", "", 0)

def onClickNext(button):
    #app.setText(DEFAULT_HEADER, "Next button clicked, but you is `" +  app.getUser() + "`")
    #app.showChooser("Select language", "Russian", "English")
    #app.showProgressBar()
    #app.setProgress("Process is show must go on...", 35)
    #app.modBtn("p", "", 1);
    global STEP
    if STEP == 0:
        setLang()
        STEP = 1
    elif STEP == 1:
        STEP = 2
        #app.showMainText()
        #app.setText(DEFAULT_HEADER, "Тут будем думать")
        if checkXampp():
            #createAndStartScript() вместо этого теперь мы вынуждены получать путь к документам
            getDocDir()
            
# Проверяет, установлен ли уже XAMPP, если нет, то пытается установить из run файла рядом с собой.
# Если файла нет, то пишет соответствующее сообщение.
def checkXampp():
    # TODO import iqdjs или как там его
    if file_exists("/opt/lampp/lampp"):
        return True
    cat = app.getAppDir();
    ls = scandir(cat, 1)
    sz = count(ls)
    found = 0
    i = 0
    while (i < sz):
        fileName = ls[i]
        #if ("xampp-linux-x64-7.4.28-1-installer.run" == fileName):
        if (strpos(fileName, f"xampp-linux-x64-{XAMPP_VERSION}") != -1 and strpos(fileName, "installer.run") != -1):
            found = cat + f"/{fileName}";
        i += 1
    if (found != 0):
        rShell = "#!/bin/bash\n"
        rShell += f"chmod 777 {found}\n"
        rShell += f"{found}\n"
        rShellFile = cat + "/data/d/unpack.sh"
        app.writeFile(rShellFile, rShell);
        shell = "#!/bin/bash\n"
        #shell += f"xfce4-terminal -e \"sudo {rShellFile}\" --title=\"Install XAMPP\"\n"
        shell += f"xterm -e sudo {rShellFile} -title=\"Install XAMPP\"&\n"
        shellFile = cat + "/data/d/u.sh"
        app.writeFile(shellFile, shell)
        app.modBtn("p", None, 0)
        app.modBtn("n", None, 0)
        app.modBtn("c", None, 0)
        app.setText(t("XAMPP instalation process"), t("<p>Enter superuser password in xterm window for Install XAMPP.</p><p>Wait for the XAMPP installation to finish and restart this Installer.</p>"))
        GObject.timeout_add(1000, onNeedRunInstall)
        
    else:
        app.setText(t("XAMPP not found"), t(f"<p>XAMPP not found on this computer.</p><p>Download xampp-linux-x64-{XAMPP_VERSION}.run from https://apachefriends.org and put it near installer.py, after restart this installer.</p>"))
        app.modBtn("p", None, 0)
        app.modBtn("n", None, 0)
        app.modBtn("c", t("Exit"), 1)
    return False

def onNeedRunInstall():
    shellFile = app.getAppDir() + "/data/d/u.sh"
    Env.dexec(shellFile)
    #onCheckXamppInstallerProcess(f"xampp-linux-x64-{XAMPP_VERSION}-installer.run", "")
    if (file_exists("/opt/lampp/lampp")):
        app.modBtn("p", None, 1)
        app.modBtn("n", None, 1)
        app.modBtn("c", None, 1)
        getDocDir()
    

def onCheckXamppInstallerProcess(stdout, stderr):
    if (strpos(stdout, f"xampp-linux-x64-{XAMPP_VERSION}") != -1 and strpos(stdout, "installer.run") != -1):
        shell = "#!/bin/bash\n";
        shell += "ps -Ac t |grep xampp-\n";
        shellFile = app.getAppDir() + "/data/d/check.sh";
        app.writeFile(shellFile, shell);
        Env.exec(shellFile, onCheckXamppInstallerProcess, DevNull, DevNull)
    elif (file_exists("/opt/lampp/lampp")):
        app.modBtn("p", None, 1)
        app.modBtn("n", None, 1)
        app.modBtn("c", None, 1)
        #createAndStartScript()
        getDocDir()
    else:
        shell = "#!/bin/bash\n";
        shell += "ps -Ac t |grep xampp-\n";
        shellFile = app.getAppDir() + "/data/d/check.sh";
        app.writeFile(shellFile, shell);
        Env.exec(shellFile, onCheckXamppInstallerProcess, DevNull, DevNull)

def onXamppInstalled(arg):
    print("Complete!");
    
def DevNull(std):
    a = 1 + 1
    return a

def getDocDir():
    docFile = app.getAppDir() + "/data/d/documents.txt"
    cmd = '#!/bin/bash\nxdg-user-dir DOCUMENTS > ' + docFile + "\n";
    shellFile = app.getAppDir() + "/data/d/check.sh"
    app.writeFile(shellFile, cmd);
    if file_exists(docFile):
        os.remove(docFile)
    app.exec(shellFile, onGetDocPath)
    GObject.timeout_add(1000, onGetDocPath)

def onGetDocPath(arg=None):
    docFile = app.getAppDir() + "/data/d/documents.txt"
    if file_exists(docFile):
        print("File exists!")
        s = trim(app.readFile(docFile))
        if os.path.isdir(s):
            print("it dir!!")
            createAndStartScript()
            return;
        else:
            print(f"{s} is not dir!")
    GObject.timeout_add(1000, onGetDocPath)


def createAndStartScript():
    #if !os.file_exists('/opt/lampp/lampp'):
    #    xamppInstallerFile = getXamppInstallerFileName() # TODO
    #    if !os.file_exists(xamppInstallerFile):
    #        app.setText(t('Невозможно продолжить установку'), f"<p>Вам необходимо прежде установить XAMPP {XAMPP_VERSION}</p>.<p>Скачайте установщик с официального cайта https://www.apachefriends.org и установите его </p><p>Вам достаточно положить *.run файл в каталог data расположенный рядом с этим скриптом установкию</p>")
    #    else:
    #        # TODO run installer
    # install process
    
    user = app.getUser()
    
    programDir = "/opt/p-landlib/apps/xamppSsl"
    autostartDir = f"/home/{user}/.config/autostart"
    app.createDir(autostartDir)
    menuDir = f"/home/{user}/.local/share/applications"
    app.createDir(menuDir)
    distrDir = app.getAppDir() + "/data"
    docFile = app.getAppDir() + "/data/d/documents.txt"
    docsDir = trim(app.readFile(docFile));
    script = makeRootScript(programDir, autostartDir, menuDir, distrDir, docsDir)
    
    path = app.getAppDir() + "/data/d/unpack.sh"
    app.writeFile(path, script)
    script = "#!/bin/bash\n"
    script += f"cp {distrDir}/fastxamppssl.desktop {autostartDir}/fastxamppssl.desktop\n"
    script += f"cp {distrDir}/fastxamppssl.desktop {menuDir}/fastxamppssl.desktop\n"
    # Узкий момент: пока не добавил  2>&1 дождаться выполнения скрипта было невозможно
    script += "pkexec " + path + " > " + app.getAppDir() + "/data/d/out.txt 2>&1"
    path = app.getAppDir() + "/data/d/u.sh"
    app.writeFile(path, script)
    GObject.timeout_add(1000, onTick)
    app.exec(path, onFin)
    app.showProgressBar()
    app.setProgress(t("Start installation"), 1)

def onTick():
    path = app.getAppDir() + "/data/d/out.txt"
    if not os.path.exists(path):
        if STOP_TIMER != 1:
            GObject.timeout_add(1000, onTick)
        return
    sz = os.path.getsize(path)
    app.setProgress(t("Start installation"), sz, FINAL_SIZE)
    if STOP_TIMER != 1:
            GObject.timeout_add(1000, onTick)

def onFin(rk):
    global STOP_TIMER
    STOP_TIMER = 1
    app.setProgress(t("Thank you for choise fastxampp, you can run it from menu Development"), 100)
    #GObject.timeout_add(1000, onTickFin)
    app.setText(DEFAULT_HEADER, t("Thank you for choise fastxampp, you can run it from menu Development"))
    app.showMainText()
    app.modBtn('p', "", 0)
    app.modBtn('n', "", 0)
    app.modBtn('c', t("Done"), 1)
    app.writeFile("/opt/p-landlib/apps/xamppSsl/d/data.ini", f"lang={LANG}")
    


def makeRootScript(programDir, autostartDir, menuDir, distrDir, docsDir):
    user = app.getUser()
    legacyDir = "/usr/local/fastxampp"
    
    cmd = "#!/bin/bash\n"
    
    # copy python app files
    cmd += "mkdir /opt/p-landlib\n"
    cmd += "mkdir /opt/p-landlib/apps\n"
    cmd += f"mkdir {programDir}\n"
    cmd += f"mkdir {legacyDir}\n"
    cmd += f"cp -f {distrDir}/a/xamppSsl.py {programDir}/xamppSsl.py\n"
    cmd += f"cp -f {distrDir}/a/xamppSsl.sh {programDir}/xamppSsl.sh\n"
    cmd += f"cp -rf {distrDir}/a/d {programDir}\n"
    cmd += f"cp -rf {distrDir}/a/i {programDir}\n"
    cmd += f"cp -rf {distrDir}/a/p {programDir}\n"
    cmd += f"cp -rf {distrDir}/d/landdesk /opt/p-landlib\n"
    cmd += f"chmod -R 755 {programDir}\n"
    cmd += f"mkdir {docsDir}/xamppSsl\n"
    cmd += f"cp -rf {distrDir}/a/p/settings/help/css {docsDir}/xamppSsl\n"
    cmd += f"echo {LANG} > {programDir}/p/settings/locale\n"
    cmd += f"cp -rf {distrDir}/a/p/settings/help/mkcert {docsDir}/xamppSsl\n"
    cmd += f"cp -rf {distrDir}/a/p/settings/help/rootCert {docsDir}/xamppSsl\n"
    cmd += f"chmod -R 755 {docsDir}/xamppSsl\n"
    cmd += f"chown {user}:{user} -R {docsDir}/xamppSsl\n"
    cmd += f"echo {docsDir} > {programDir}/d/docDir.txt\n"
    cmd += f"chmod  766 {programDir}/d/docDir.txt\n"
    
    if LANG == 'en':
        cmd += f"cp -f {programDir}/p/about/about-en.py {programDir}/p/about/about.py\n"
    cmd += f"chown {user}:{user} -R {programDir}\n"
   
    
    # copy fastXampp files
    cmd += """/etc/init.d/apache stop
/etc/init.d/apache22 stop
/etc/init.d/apache24 stop
/opt/lampp/lampp stop
mkdir /usr/local/fastxampp
"""
    s = t("Copying new files")
    cmd += f"echo {s}\n"
    cmd += f"#cp -f {distrDir}/xampp-php74.tar.gz /opt/xampp.tar.gz\n"
    s = t("Extract files from tar, please wait")
    cmd += f"echo {s}\n"
    cmd +="""cd /opt
adduser --system --disabled-password --disabled-login mysql
#tar -xzvf /opt/xampp.tar.gz
"""
    s = t("Extract complete")
    cmd += f"echo {s}\n"
    cmd += "mv /opt/lampp/etc/extra /opt/lampp/etc/__extra\n"
    cmd += f"cp -rf {distrDir}/x/extra /opt/lampp/etc/extra\n"
    cmd += """
chmod -R 777 /opt/lampp/etc/extra
chmod  776 /etc/hosts
"""
    s = t("Configure multihosts")
    cmd += f"echo {s}\n"
    cmd += "mv /opt/lampp/etc/httpd.conf /opt/lampp/etc/__httpd.conf\n"
    cmd += f"cp -f {distrDir}/x/httpd.conf /opt/lampp/etc/httpd.conf\n"
    cmd += """
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
"""
    cmd += f"cp -f {distrDir}/x/php.ini /opt/lampp/etc/php.ini\n"
    cmd += f"chmod 766 /opt/lampp/etc/php.ini\n"
    cmd += f"cp -f {distrDir}/x/exts/memcached.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/memcached.so\n"
    cmd += f"cp -f {distrDir}/x/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11\n"
    cmd += f"cp -f {distrDir}/x/exts/xdebug.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/xdebug.so\n"
    cmd += f"cp -f {distrDir}/x/exts/amqp.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/amqp.so\n"
    cmd += f"cp -f {distrDir}/x/exts/opcache.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/opcache.so\n"
    cmd += f"cp -f {distrDir}/x/exts/redis.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/redis.so\n"
    cmd += f"cp -f {distrDir}/x/exts/sodium.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/sodium.so\n"
    cmd += f"cp -f {distrDir}/x/exts/imagick.so /opt/lampp/lib/php/extensions/no-debug-non-zts-20190902/imagick.so\n"
    cmd += f"cp -f {distrDir}/x/exts/libMagickWand-6.Q16.so.6 /opt/lampp/lib/libMagickWand-6.Q16.so.6\n"
    cmd += f"cp -f {distrDir}/x/exts/libMagickCore-6.Q16.so.6 /opt/lampp/lib/libMagickCore-6.Q16.so.6\n"
    cmd += f"cp -f {distrDir}/x/exts/liblqr-1.so.0 /opt/lampp/lib/liblqr-1.so.0\n"
    cmd += f"cp -f {distrDir}/x/exts/libmemcached.so.11 /opt/lampp/lib/libmemcached.so.11\n"
    cmd += f"rm -r /opt/xampp.tar.gz\n"
    s = t("Configure multihosts complete")
    cmd += f"echo {s}\n"
    s = t("Create fastxampp folder")
    cmd += f"echo {s}\n"
    cmd += f"mkdir {legacyDir}\n"
    cmd += f"cp -f {distrDir}/x/bin/fastxamppd /usr/local/fastxampp/fastxamppd\n"
    cmd += f"cp -f {distrDir}/x/bin/{LANG}/lang /usr/local/fastxampp/lang\n"
    cmd += f"cp -f {distrDir}/x/bin/netstat /bin/netstat\n"
    cmd += f"cp -f {distrDir}/x/systemctl/fastxamppd.sh /usr/local/fastxampp/fastxamppd.sh\n"
    cmd += "chmod 766 /usr/local/fastxampp/fastxamppd.sh\n"
    cmd += "echo '#! /bin/sh' >> /usr/local/fastxampp/fastxamppd.sh\n"
    cmd += f"echo 'mount -t tmpfs tmpfs /home/{user}/.config/fastxampp -o size=1M' >> /usr/local/fastxampp/fastxamppd.sh\n"
    cmd += f"echo '/usr/local/fastxampp/fastxamppd {user}' >> /usr/local/fastxampp/fastxamppd.sh\n"
    cmd += f"cp -f {distrDir}/x/systemctl/fastxampp.service /etc/systemd/system/fastxampp.service\n"
    cmd += f"systemctl enable fastxampp.service\n"
    s = t("Create temp filesystem in memory")
    cmd += f"echo '{s}'\n"
    cmd += f"mount -t tmpfs tmpfs /home/{user}/.config/fastxampp -o size=1M\n"
    cmd += f"sleep 2\n"
    s = t("Create temp filesystem in memory")
    cmd += f"echo '{s}'\n"
    cmd += f"echo '' > /home/{user}/.config/fastxampp/.sock\n"
    cmd += f"chown {user}:{user} /home/{user}/.config/fastxampp/.sock\n"
    s = t("Run fastxamppd daemon")
    cmd += f"echo '{s}'\n"
    cmd += "killall fastxamppd\n"
    cmd += f"/usr/local/fastxampp/fastxamppd {user} &\n"
    cmd += f"cp -f {distrDir}/fastxamppssl.desktop /usr/share/applications/fastxamppssl.desktop\n"
    
    return cmd
    
def t(k):
    if LANG == "en":
        return k
    if k == "Done":
        return "Готово"
    if k == "Thank you for choise fastxampp, you can run it from menu Development":
        return "Спасибо за установку fastxampp, вы можете запустить его сейчас из меню \"Разработка\""
    if k == "Run fastxamppd daemon":
        return "Запуск демона fastxamppd"
    if k == "Create socket":
        return "Создание сокета"
    if k == "Create temp filesystem in memory":
        return "Создание файловой системы в оперативной памяти"
    if k == "Create fastxampp folder":
        return "Создание каталога fastxampp"
    if k == "Copying new files":
        return "Копирование файлов"
    if k == "Extract files from tar, please wait":
        return "Распаковка архива, пожалуйста ждите"
    if k == "Extract complete":
        return "Распаковка завершена"
    if k == "Configure multihosts":
        return "Конфигурация multihosts"
    if k == "Configure multihosts complete":
        return "Конфигурация multihosts завершена"
    if k == "XAMPP not found":
        return "XAMPP не найден"
    if k == f"<p>XAMPP not found on this computer.</p><p>Download xampp-linux-x64-{XAMPP_VERSION}.run from https://apachefriends.org and put it near installer.py, after restart this installer.</p>":
        return f"<p>XAMPP не найден на этом компьютере.</p><p>Скачайте установочный файл xampp-linux-x64-{XAMPP_VERSION}.run с https://apachefriends.org и разместите его рядом с installer.py, после чего перезапустите эту установку.</p>"
    if k == "Exit":
        return "Выход"
    if k == "XAMPP instalation process":
        return "Установка XAMPP..."
    if k == "<p>Enter superuser password in xterm window for Install XAMPP.</p><p>Wait for the XAMPP installation to finish and restart this Installer.</p>":
        return "<p>Введите пароль суперпользователя в окно xterm для установки XAMPP.</p><p>Дождитесь окончания установки XAMPP и перезапустите потом этот установщик.</p>"
        
    return k



def setLang():
    if app.getChoosedVariant() == "Russian":
        setRussianLang()
    elif app.getChoosedVariant() == "English":
        setEngLang()
    app.modBtn("p", "", 1)
    app.showMainText()
    app.setText(DEFAULT_HEADER, DEFAULT_TEXT)
    app.modBtn("p", DEFAULT_PREV_TEXT)
    app.modBtn("n", DEFAULT_NEXT_TEXT)
    app.modBtn("c", DEFAULT_CANCEL_TEXT)

def setRussianLang():
    global DEFAULT_HEADER
    global DEFAULT_TEXT
    global DEFAULT_CANCEL_TEXT
    global DEFAULT_NEXT_TEXT
    global DEFAULT_PREV_TEXT
    global LANG
    DEFAULT_HEADER = DEFAULT_HEADER_RU
    DEFAULT_TEXT = DEFAULT_TEXT_RU
    DEFAULT_CANCEL_TEXT = DEFAULT_CANCEL_TEXT_RU
    DEFAULT_NEXT_TEXT = DEFAULT_NEXT_TEXT_RU
    DEFAULT_PREV_TEXT = DEFAULT_PREV_TEXT_RU
    LANG = "ru"
    
def setEngLang():
    global DEFAULT_HEADER
    global DEFAULT_TEXT
    global DEFAULT_CANCEL_TEXT
    global DEFAULT_NEXT_TEXT
    global DEFAULT_PREV_TEXT
    global LANG
    DEFAULT_HEADER = DEFAULT_HEADER_EN
    DEFAULT_TEXT = DEFAULT_TEXT_EN
    DEFAULT_CANCEL_TEXT = DEFAULT_CANCEL_TEXT_EN
    DEFAULT_NEXT_TEXT = DEFAULT_NEXT_TEXT_EN
    DEFAULT_PREV_TEXT = DEFAULT_PREV_TEXT_EN
    LANG = "en"

def onClickCancel(button):
    #app.setText("Cancel button clicked")
    Gtk.main_quit()

#Ваш код установщика должен завершаться до этой строки. Хотя, никто не мешает вам экспериментировать.


class InstallerApp:
    def __init__(self):
        self.window = Gtk.Window(title="Installer")
        self.window.set_resizable(False)
        self.window.set_size_request(500, 356)
        self.window.move(100, 100)
        
        # Установка иконки
        app_dir = self.getAppDir()
        ico_path = os.path.join(app_dir, "data", "i", "nstaller", "ico.png")
        if os.path.exists(ico_path):
            self.window.set_icon_from_file(ico_path)
        
        # Основной контейнер
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.window.add(main_box)
        
        # Область Б (верхняя часть)
        self.area_b = Gtk.Box()
        self.area_b.set_size_request(500, 315)
        main_box.pack_start(self.area_b, True, True, 0)
        
        # Левая часть области Б - изображение
        self.image_area = Gtk.Box()
        self.image_area.set_size_request(166, 315)
        self.area_b.pack_start(self.image_area, False, False, 0)
        
        # Загрузка изображения
        promo_path = os.path.join(app_dir, "data", "i", "nstaller", "promo.png")
        self.setMainImage(promo_path)
        
        # Правая часть области Б - основной контейнер
        self.right_area = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.right_area.set_size_request(334, 315)
        self.area_b.pack_start(self.right_area, True, True, 0)
        
        # Заголовок (всегда видим)
        self.header_area = Gtk.Box()
        self.header_area.set_size_request(334, 30)
        self.right_area.pack_start(self.header_area, False, False, 0)
        
        # Виджет для заголовка
        self.header_label = Gtk.Label()
        self.header_label.set_halign(Gtk.Align.START)
        self.header_label.set_margin_start(10)
        self.header_label.set_margin_top(0)
        self.header_label.set_margin_bottom(5)
        self.header_area.pack_start(self.header_label, True, True, 0)
        
        # Контентная область под заголовком
        self.content_area = Gtk.Box()
        self.content_area.set_size_request(334, 285)
        self.right_area.pack_start(self.content_area, True, True, 0)
        
        # Создаем стэк для переключения между режимами
        self.content_stack = Gtk.Stack()
        self.content_stack.set_transition_type(Gtk.StackTransitionType.NONE)
        self.content_area.pack_start(self.content_stack, True, True, 0)
        
        # Режим 1: Основной текст (по умолчанию)
        self.text_frame = Gtk.Frame()
        self.text_frame.set_shadow_type(Gtk.ShadowType.NONE)
        self.text_frame.set_margin_start(5)
        self.text_frame.set_margin_end(5)
        self.text_frame.set_margin_bottom(5)
        
        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        self.text_frame.add(scrolled_window)
        
        # Текстовая область
        self.text_view = Gtk.TextView()
        self.text_view.set_editable(False)
        self.text_view.set_cursor_visible(False)
        self.text_view.set_wrap_mode(Gtk.WrapMode.WORD)
        self.text_view.set_left_margin(12)
        self.text_view.set_right_margin(12)
        scrolled_window.add(self.text_view)
        
        # Установка белого фона
        white_color = Gdk.RGBA()
        white_color.parse("white")
        self.text_view.override_background_color(Gtk.StateFlags.NORMAL, white_color)
        
        # Получаем буфер текста
        self.text_buffer = self.text_view.get_buffer()
        
        # Режим 2: Выбор вариантов (Chooser) - с синей рамкой GroupBox
        self.chooser_frame = Gtk.Frame()
        self.chooser_frame.set_label("")  # Заголовок будет устанавливаться позже
        self.chooser_frame.set_shadow_type(Gtk.ShadowType.ETCHED_IN)
        self.chooser_frame.set_margin_start(5)
        self.chooser_frame.set_margin_end(5)
        self.chooser_frame.set_margin_bottom(5)
        
        # Создаем контейнер для содержимого с отступами
        chooser_content = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        chooser_content.set_margin_top(10)
        chooser_content.set_margin_bottom(10)
        chooser_content.set_margin_start(15)
        chooser_content.set_margin_end(15)
        self.chooser_frame.add(chooser_content)
        
        self.chooser_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        chooser_content.pack_start(self.chooser_box, True, True, 0)
        
        self.radio_buttons = []
        self.radio_group = None
        
        # Режим 3: Прогресс-бар
        self.progress_frame = Gtk.Frame()
        self.progress_frame.set_shadow_type(Gtk.ShadowType.NONE)
        self.progress_frame.set_margin_start(5)
        self.progress_frame.set_margin_end(5)
        self.progress_frame.set_margin_bottom(5)
        
        self.progress_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        self.progress_box.set_margin_top(10)
        self.progress_box.set_margin_bottom(10)
        self.progress_box.set_margin_start(10)
        self.progress_box.set_margin_end(10)
        self.progress_frame.add(self.progress_box)
        
        # Текст состояния прогресса
        self.progress_state_label = Gtk.Label()
        self.progress_state_label.set_halign(Gtk.Align.CENTER)
        self.progress_state_label.set_margin_bottom(2)
        self.progress_box.pack_start(self.progress_state_label, False, False, 0)
        
        # Контейнер для прогресс-бара с фиксированными размерами
        self.pbar_container = Gtk.DrawingArea()
        self.pbar_container.set_size_request(270, 14)
        self.pbar_container.set_margin_bottom(8)
        self.pbar_container.set_halign(Gtk.Align.CENTER)
        
        # Загружаем изображение для прогресс-бара
        self.pbar_pixbuf = None
        self.pbar_image_width = 0
        self.load_pbar_image(app_dir)
        
        # Обработчик отрисовки прогресс-бара
        self.pbar_container.connect("draw", self.on_draw_progress)
        
        # Текущие значения прогресса
        self.progress_value = 0
        self.progress_total = None
        self.progress_percent = 0
        
        # Добавляем контейнер прогресс-бара
        self.progress_box.pack_start(self.pbar_container, False, False, 0)
        
        # Текст прогресса
        self.progress_text = Gtk.Label()
        self.progress_text.set_halign(Gtk.Align.CENTER)
        self.progress_box.pack_start(self.progress_text, False, False, 0)
        
        # Добавляем все режимы в стэк
        self.content_stack.add_named(self.text_frame, "text")
        self.content_stack.add_named(self.chooser_frame, "chooser")
        self.content_stack.add_named(self.progress_frame, "progress")
        
        # Показываем режим текста по умолчанию
        self.content_stack.set_visible_child_name("text")
        
        # Область Г (нижняя часть с кнопками)
        self.area_g = Gtk.Box()
        self.area_g.set_size_request(500, 41)
        self.area_g.override_background_color(Gtk.StateFlags.NORMAL, self.parse_color("#ECE9D8"))
        main_box.pack_start(self.area_g, False, False, 0)
        
        # Создаем контейнер для кнопок (выравнивание по правому краю)
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_margin_top(14)
        button_box.set_margin_end(14)
        button_box.set_margin_bottom(14)
        self.area_g.pack_end(button_box, False, False, 0)
        
        # Создаем кнопки
        self.btn_prev = self.create_button(DEFAULT_PREV_TEXT, onClickPrev)
        self.btn_next = self.create_button(DEFAULT_NEXT_TEXT, onClickNext)
        self.btn_cancel = self.create_button(DEFAULT_CANCEL_TEXT, onClickCancel)
        
        # Добавляем кнопки в контейнер
        button_box.pack_start(self.btn_prev, False, False, 15)
        button_box.pack_start(self.btn_next, False, False, 15)
        button_box.pack_end(self.btn_cancel, False, False, 0)
        
        # Скрываем кнопку Previous при запуске
        self.btn_prev.hide()
        self.modBtn("p", "", 0)
        
        # Устанавливаем начальный текст
        self.setText(DEFAULT_HEADER, DEFAULT_TEXT)
        
        # Применяем стили
        self.apply_styles()
        
        GLib.timeout_add(100, self.delayed_onCreate)
        
        self.window.connect("destroy", Gtk.main_quit)
    
    def load_pbar_image(self, app_dir):
        """Загружает изображение для прогресс-бара"""
        # Пробуем разные пути к изображению
        possible_paths = [
            os.path.join(app_dir, "data", "i", "nstaller", "pbar-piece.png"),
            os.path.join(app_dir, "pbar-piece.png"),
            os.path.join(os.path.dirname(app_dir), "pbar-piece.png"),
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    # Загружаем с исходным размером
                    self.pbar_pixbuf = GdkPixbuf.Pixbuf.new_from_file(path)
                    self.pbar_image_width = self.pbar_pixbuf.get_width()
                    break
                except Exception as e:
                    print(f"Ошибка загрузки изображения прогресс-бара: {e}")
        
        # Если изображение не найдено, создаем простой зеленый прямоугольник
        if self.pbar_pixbuf is None:
            print("Изображение pbar-piece.png не найдено, использую простой цвет")
    
    def on_draw_progress(self, widget, cr):
        """Отрисовывает прогресс-бар с повторяющимся изображением"""
        width = widget.get_allocated_width()
        height = widget.get_allocated_height()
        
        if width <= 0 or height <= 0:
            return
        
        # 1. Очищаем область (белый фон)
        cr.set_source_rgb(1, 1, 1)  # Белый
        cr.rectangle(0, 0, width, height)
        cr.fill()
        
        # 2. Рисуем изображение pbar-piece.png по всей ширине
        if self.pbar_pixbuf:
            image_width = self.pbar_image_width
            image_height = self.pbar_pixbuf.get_height()
            
            # Рисуем повторяющееся изображение
            # Масштабируем изображение по высоте
            scale_factor = height / image_height
            scaled_width = int(image_width * scale_factor)
            scaled_height = int(image_height * scale_factor)
            for x in range(0, width, scaled_width):
                # Создаем масштабированный пиксбуф
                scaled_pixbuf = self.pbar_pixbuf.scale_simple(
                    scaled_width, 
                    scaled_height, 
                    GdkPixbuf.InterpType.BILINEAR
                )
                
                if scaled_pixbuf:
                    Gdk.cairo_set_source_pixbuf(cr, scaled_pixbuf, x, 0)
                    cr.rectangle(x, 0, min(scaled_width, width - x), height)
                    cr.fill()
        else:
            # Альтернатива: зеленый цвет
            cr.set_source_rgb(0.3, 0.7, 0.3)
            cr.rectangle(0, 0, width, height)
            cr.fill()
        
        # 3. Рисуем белый прямоугольник для "незаполненной" части
        # Вычисляем ширину заполненной части
        filled_width = int(width * self.progress_percent / 100)
        
        # Рисуем белый прямоугольник справа (незаполненная часть)
        if filled_width < width:
            cr.set_source_rgb(1, 1, 1)  # Белый
            cr.rectangle(filled_width, 0, width - filled_width, height)
            cr.fill()
        
        # 4. Рисуем черную рамку со скругленными краями
        cr.set_source_rgb(0, 0, 0)  # Черный
        cr.set_line_width(1)
        
        # Рисуем скругленный прямоугольник
        radius = 4
        cr.move_to(radius, 0)
        cr.line_to(width - radius, 0)
        cr.arc(width - radius, radius, radius, -1.5708, 0)  # 90° в радианах = 1.5708
        cr.line_to(width, height - radius)
        cr.arc(width - radius, height - radius, radius, 0, 1.5708)
        cr.line_to(radius, height)
        cr.arc(radius, height - radius, radius, 1.5708, 3.1416)
        cr.line_to(0, radius)
        cr.arc(radius, radius, radius, 3.1416, 4.7124)
        cr.close_path()
        
        cr.stroke()
        
        return False
    
    def apply_styles(self):
        """Применить CSS стили"""
        css = """
        /* Базовые стили для кнопок */
        button {
            background: #fcfcfd;
            border: 1px solid #548CAF;
            border-radius: 3px;
            font-size: 12px;
            color: #000000;
            padding: 2px 8px;
        }
        
        /* Простой синий fieldset */
        
        .blue-fieldset * {
            color: #000;
        }
        """
        
        css_provider = Gtk.CssProvider()
        try:
            css_provider.load_from_data(css.encode())
            screen = Gdk.Screen.get_default()
            style_context = Gtk.StyleContext()
            style_context.add_provider_for_screen(
                screen, 
                css_provider, 
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            )
        except Exception as e:
            print(f"Ошибка при загрузке CSS: {e}")
    
    
    def delayed_onCreate(self):
        onCreate()
        return False  # Не повторять таймер
    
    def parse_color(self, hex_color):
        color = Gdk.RGBA()
        color.parse(hex_color)
        return color
    
    def create_button(self, text, handler):
        button = Gtk.Button(label=text)
        button.connect("clicked", handler)
        
        # Применяем CSS класс к кнопке для лучшего контроля
        ctx = button.get_style_context()
        ctx.add_class("installer-button")
        
        return button
    
    def showChooser(self, title, *variants):
        """Показать выбор вариантов"""
        # Очищаем предыдущие радиокнопки
        for child in self.chooser_box.get_children():
            self.chooser_box.remove(child)
        
        self.radio_buttons = []
        self.radio_group = None
        
        # Устанавливаем заголовок GroupBox
        self.chooser_frame.set_label(title)
        
        # Применяем синий стиль ко всему фрейму
        ctx = self.chooser_frame.get_style_context()
        ctx.add_class("blue-fieldset")
        
        
        
        # Создаем радиокнопки для каждого варианта
        for i, variant in enumerate(variants):
            if i == 0:
                radio = Gtk.RadioButton.new_with_label(None, variant)
                self.radio_group = radio
            else:
                radio = Gtk.RadioButton.new_with_label_from_widget(self.radio_group, variant)
            
            radio.set_margin_bottom(5)
            radio.set_halign(Gtk.Align.START)
            self.radio_buttons.append(radio)
            self.chooser_box.pack_start(radio, False, False, 0)
        
        # Выбираем первый вариант по умолчанию
        if self.radio_buttons:
            self.radio_buttons[0].set_active(True)
        
        self.chooser_box.show_all()
        self.content_stack.set_visible_child_name("chooser")
    
    def getChoosedVariant(self):
        """Получить выбранный вариант"""
        for radio in self.radio_buttons:
            if radio.get_active():
                return radio.get_label()
        return ""
    
    def showMainText(self):
        """Показать основной текст"""
        self.content_stack.set_visible_child_name("text")
    
    def showProgressBar(self):
        """Показать прогресс-бар"""
        self.content_stack.set_visible_child_name("progress")
    
    def setProgress(self, topText, value, total=None):
        """Установить прогресс"""
        # Устанавливаем верхний текст
        self.progress_state_label.set_text(topText)
        
        # Вычисляем процент
        if total is None:
            # value от 0 до 100
            self.progress_percent = min(max(value, 0), 100)
            progress_text = f"{int(self.progress_percent)}%"
        else:
            # value и total указаны
            if total > 0:
                self.progress_percent = (value / total) * 100
                self.progress_percent = min(max(self.progress_percent, 0), 100)
                progress_text = f"{value} / {total} ({int(self.progress_percent)}%)"
            else:
                self.progress_percent = 0
                progress_text = f"{value} / {total} (0%)"
        
        # Сохраняем значения
        self.progress_value = value
        self.progress_total = total
        
        # Принудительная перерисовка прогресс-бара
        self.pbar_container.queue_draw()
        
        # Устанавливаем текст прогресса
        self.progress_text.set_text(progress_text)
    
    def setText(self, header, content):
        # Устанавливаем заголовок (всегда видим)
        header_markup = f"<span size='{HEADER_SIZE * 1000}' weight='bold'>{header}</span>"
        self.header_label.set_markup(header_markup)
        
        # Преобразуем базовые HTML-теги в Pango Markup для основного текста
        formatted_content = self.html_to_pango(content)
        
        # Устанавливаем текст с поддержкой разметки Pango
        self.text_buffer.set_text("")
        iter = self.text_buffer.get_iter_at_offset(0)
        self.text_buffer.insert_markup(iter, formatted_content, -1)

    def html_to_pango(self, html_text):
        """Преобразует базовые HTML-теги в Pango Markup"""
        # Заменяем HTML-теги на Pango-теги
        pango_text = html_text
    
        # Обрабатываем параграфы
        pango_text = pango_text.replace('<p>', '\n')
        pango_text = pango_text.replace('</p>', '\n')
    
        # Обрабатываем жирный текст
        pango_text = pango_text.replace('<b>', '<span weight="bold">')
        pango_text = pango_text.replace('</b>', '</span>')
    
        # Обрабатываем курсив
        pango_text = pango_text.replace('<i>', '<span style="italic">')
        pango_text = pango_text.replace('</i>', '</span>')
    
        # Убираем лишние переносы строк
        pango_text = pango_text.strip()
    
        return pango_text
    
    def modBtn(self, id, text=None, hide=None):
        button = None
        if id == "p":
            button = self.btn_prev
        elif id == "n":
            button = self.btn_next
        elif id == "c":
            button = self.btn_cancel
        
        if button:
            if text is not None and text != "":
                button.set_label(text)
            if hide is not None:
                if hide == 0:
                    button.hide()
                elif hide == 1:
                    button.show()
    
    def getUser(self):
        return os.getenv('USER', '')
    
    def getHome(self):
        return os.getenv('HOME', '')
    
    def createDir(self, path):
        os.makedirs(path, exist_ok=True)
    
    def getAppDir(self):
        return os.path.dirname(os.path.abspath(__file__))
    
    def exec(self, shellFile, onFinishExecute):
        # Отключаем кнопки во время выполнения
        self.set_buttons_sensitive(False)
        
        def run_script():
            try:
                process = subprocess.Popen(
                    ['bash', shellFile],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True
                )
                
                output_lines = []
                for line in process.stdout:
                    output_lines.append(line.strip())
                    # Берем последние 2 строки для отображения
                    #display_text = "Выполняется установка:\n\n" + "\n".join(output_lines[-2:])
                    
                    # Обновляем UI в основном потоке
                    #Gdk.threads_add_idle(0, self.update_text, display_text)
                
                process.wait()
                
                
                # Восстанавливаем кнопки и вызываем callback
                Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, process.returncode)
                
            except Exception as e:
                error_text = f"Ошибка выполнения: {str(e)}"
                Gdk.threads_add_idle(0, self.update_text, error_text)
                Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, 1)
        
        # Запускаем в отдельном потоке
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()
    
    def set_buttons_sensitive(self, sensitive):
        self.btn_prev.set_sensitive(sensitive)
        self.btn_next.set_sensitive(sensitive)
        self.btn_cancel.set_sensitive(sensitive)
    
    def update_text(self, content):
        # Сохраняем текущий заголовок
        header = self.header_label.get_text()
        if not header:
            header = DEFAULT_HEADER
        
        self.setText(header, content)
        return False
    
    def on_script_finished(self, onFinishExecute, returncode):
        self.set_buttons_sensitive(True)
        if onFinishExecute:
            onFinishExecute(returncode)
        return False
    
    def writeFile(self, filePath, text):
        try:
            with open(filePath, 'w', encoding='utf-8') as f:
                f.write(text)
            return True
        except Exception as e:
            print(f"Ошибка записи файла: {str(e)}")
            return False
    
    def readFile(self, filePath):
        try:
            with open(filePath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Ошибка чтения файла: {e}")
            return None

    def checkLinuxInt(self):
        """Определяет разрядность операционной системы"""
        try:
            result = subprocess.run(['uname', '-m'], capture_output=True, text=True)
            arch = result.stdout.strip()
            if '64' in arch:
                return 64
            else:
                return 32
        except:
            return 64  # предполагаем 64-бит по умолчанию

    def checkWine32(self):
        """Проверяет доступность 32-битного Wine"""
        try:
            # Проверяем наличие wine (аналог capture_output=True)
            result = subprocess.run(
                ['wine', '--version'], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, 
                timeout=5
            )
            if result.returncode != 0:
                return False

            # Проверяем через file
            which_result = subprocess.run(
                ['which', 'wine'], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE
            )
            if which_result.returncode == 0:
                wine_path = which_result.stdout.decode('utf-8', errors='ignore').strip()
                file_result = subprocess.run(
                    ['file', wine_path], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE
                )
                file_output = file_result.stdout.decode('utf-8', errors='ignore')
                if 'ELF 64-bit' in file_output:
                    return False
                elif 'ELF 32-bit' in file_output:
                    return True

            # Проверяем запуск простой команды
            env = os.environ.copy()
            env['WINEDEBUG'] = '-all'
            
            result = subprocess.run(
                ['wine', 'cmd', '/c', 'echo OK && exit 0'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                timeout=15
            )
            
            return result.returncode == 0
                
        except Exception as ex:
            print(str(ex))
            return False

    def checkWine64(self):
        """Проверяет доступность 64-битного Wine"""
        try:
            # Проверяем наличие WINEARCH=win64
            env = os.environ.copy()
            env['WINEARCH'] = 'win64'
            result = subprocess.run(['wine', '--version'], env=env, 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                # Проверяем поддержку 64-бит через winepath
                result = subprocess.run(['wine', 'winepath', 'C:\\windows\\system32'], 
                                      env=env, capture_output=True, text=True, timeout=5)
                return True
            return False
        except:
            return False

    def getRAM(self, in_bytes=False):
        """Возвращает размер оперативной памяти"""
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
            
            # Ищем общую память
            match = re.search(r'MemTotal:\s+(\d+)\s+kB', meminfo)
            if match:
                kb = int(match.group(1))
                bytes_value = kb * 1024
                
                if in_bytes:
                    return bytes_value
                else:
                    # Конвертируем в человекопонятный формат
                    if bytes_value >= 1024**3:  # GB
                        return f"{bytes_value / (1024**3):.1f} Gb"
                    elif bytes_value >= 1024**2:  # MB
                        return f"{bytes_value / (1024**2):.1f} Mb"
                    else:  # KB
                        return f"{bytes_value / 1024:.1f} Kb"
            return "Unknown"
        except:
            return "Unknown"

    def getCPUName(self):
        """Возвращает человекопонятное название процессора"""
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
            
            # Ищем модель процессора
            model_match = re.search(r'model name\s*:\s*(.+)', cpuinfo)
            if model_match:
                cpu_name = model_match.group(1).strip()
                
                # Упрощаем название (убираем лишнюю информацию)
                # Убираем "(R)", "(TM)", лишние пробелы
                cpu_name = re.sub(r'\(R\)|\(TM\)|@', '', cpu_name)
                cpu_name = re.sub(r'\s+', ' ', cpu_name).strip()
                
                return cpu_name
            return "Unknown CPU"
        except:
            return "Unknown CPU"

    def setMainImage(self, filePath):
        # Очищаем область изображения
        for child in self.image_area.get_children():
            self.image_area.remove(child)
        
        if os.path.exists(filePath):
            try:
                pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(filePath, 166, 315)
                image = Gtk.Image.new_from_pixbuf(pixbuf)
                self.image_area.pack_start(image, True, True, 0)
                image.show()
            except Exception as e:
                print(f"Ошибка загрузки изображения: {e}")
                # Создаем placeholder если изображение не загрузилось
                label = Gtk.Label(label="Image\nnot found")
                self.image_area.pack_start(label, True, True, 0)
                label.show()
        else:
            label = Gtk.Label(label="Image\nnot found")
            self.image_area.pack_start(label, True, True, 0)
            label.show()
    
    def run(self):
        self.window.show_all()
        Gtk.main()

# Запуск приложения
if __name__ == "__main__":
    app = InstallerApp()
    app.modBtn("p", "", 0)
    app.run()
