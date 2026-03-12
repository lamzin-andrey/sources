#!/usr/bin/env python3
import os
#import sys
import threading
import configparser

import sys
sys.path.append("/opt/p-landlib/landdesk")
from IQdjs import *

import gi

gi.require_version('Gtk', '3.0')
gi.require_version('AppIndicator3', '0.1')
from gi.repository import Gtk, GLib, Gio


from gi.repository import AppIndicator3 as appindicator


class IniFile:
    """Класс для работы с INI файлами локализации"""
    def __init__(self, lang_file_path=None):
        self.data = {}
        if lang_file_path and os.path.exists(lang_file_path):
            self.load_file(lang_file_path)
    
    def load_file(self, file_path):
        """Загрузить INI файл"""
        config = configparser.ConfigParser()
        # Читаем файл как обычный текст, так как у нас нет секций в формате [section]
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if line and '=' in line:
                key, value = line.split('=', 1)
                self.data[key.strip()] = value.strip()
    
    def __getitem__(self, key):
        """Доступ к значениям по ключу"""
        return self.data.get(key, f"[{key}]")
    
    def __contains__(self, key):
        return key in self.data


class XAMPPTrayApp:
    def __init__(self):
        # Определяем базовый путь (где находится скрипт)
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Загружаем настройки
        self.settings = self._load_settings()
        
        # Загружаем локализацию
        self.strings = self._load_localization()
        
        # Файл с командой на перезапуск
        self.socket_file = os.path.expanduser("~/.config/fastxampp/.sock")
        self.ival = -1
        self.lastState = ""
        self.needHalt = False
        
        # Создаем индикатор
        icon_path = os.path.join(self.base_dir, "i", "sxampp.png")
        self.indicator = appindicator.Indicator.new(
            "xampp-tray-app",
            icon_path,
            appindicator.IndicatorCategory.APPLICATION_STATUS
        )
        self.indicator.set_status(appindicator.IndicatorStatus.ACTIVE)
        
        # Создаем меню
        self.menu = Gtk.Menu()
        self._create_menu()
        self.indicator.set_menu(self.menu)
        
        
        # Загрузить локализацию
        self.loadLocale();
        
        # Установить актуальное состояние иконки
        self.onTick()
        
        # Запускаем главный цикл GTK
        Gtk.main()
        
        

    def loadLocale(self):
        self.If = IniFile(App.dir() + "/p/settings/lang")
    
    def _load_settings(self):
        """Загружает настройки из data.ini"""
        settings_path = os.path.join(self.base_dir, "d", "data.ini")
        settings = {"lang": "en"}  # значение по умолчанию
        
        if os.path.exists(settings_path):
            content = self.readFile(settings_path)
            for line in content.split('\n'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    settings[key.strip()] = value.strip()
        
        return settings
    
    def _load_localization(self):
        """Загружает строки локализации"""
        lang = self.settings.get("lang", "en")
        lang_file = os.path.join(self.base_dir, "d", f"{lang}.txt")
        
        # Значения по умолчанию на английском
        default_strings = [
            "Stop XAMPP",
            "(Re)start XAMPP",
            "----------",
            "Settings",
            "About",
            "----------",
            "Exit"
        ]
        
        if os.path.exists(lang_file):
            content = self.readFile(lang_file)
            strings = [line.rstrip('\n') for line in content.splitlines()]
            # Убираем пустые строки, но сохраняем разделители
            strings = [line for line in strings if line.strip() != ""]
            
            # Убедимся, что у нас есть минимальное количество строк
            if len(strings) >= 5:
                return strings
            else:
                # Если строк меньше 5, дополняем дефолтными
                return default_strings
        
        return default_strings
    
    def _create_menu(self):
        """Создает меню с пунктами"""
        menu_items_added = 0
        
        for i, text in enumerate(self.strings):
            if text == "----------":
                # Добавляем разделитель
                self.menu.append(Gtk.SeparatorMenuItem())
                menu_items_added += 1
            elif text.strip():  # Пропускаем пустые строки
                # Создаем пункт меню
                menu_item = Gtk.MenuItem(label=text)
                
                # Связываем с соответствующим обработчиком
                if menu_items_added == 0:
                    menu_item.connect("activate", self.on_stop_xampp)
                elif menu_items_added == 1:
                    menu_item.connect("activate", self.on_restart_xampp)
                elif menu_items_added == 2:
                    menu_item.connect("activate", self.on_settings)
                elif menu_items_added == 3:
                    menu_item.connect("activate", self.on_about)
                elif menu_items_added == 5:
                    menu_item.connect("activate", self.on_exit)
                
                self.menu.append(menu_item)
                menu_items_added += 1
        
        # Если в файле локализации было меньше 5 пунктов, добавляем недостающие
        if menu_items_added < 5:
            self._add_missing_menu_items(menu_items_added)
        
        self.menu.show_all()
    
    def _add_missing_menu_items(self, current_count):
        """Добавляет недостающие пункты меню по умолчанию"""
        default_items = [
            ("Stop XAMPP", self.on_stop_xampp),
            ("(Re)start XAMPP", self.on_restart_xampp),
            ("Settings", self.on_settings),
            ("About", self.on_about),
            ("Exit", self.on_exit)
        ]
        
        # Добавляем разделители если нужно
        if current_count > 0 and current_count < 3:
            self.menu.append(Gtk.SeparatorMenuItem())
        
        # Добавляем недостающие пункты
        for i in range(current_count, 5):
            if i == 3:  # Перед "О программе" добавляем разделитель
                self.menu.append(Gtk.SeparatorMenuItem())
            
            text, handler = default_items[i]
            menu_item = Gtk.MenuItem(label=text)
            menu_item.connect("activate", handler)
            self.menu.append(menu_item)
    
    # Реализация требуемых методов
    def writeFile(self, path, content):
        """Записывает содержимое в файл"""
        try:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error writing file: {e}", file=sys.stderr)
            return False
    
    def readFile(self, path):
        """Читает содержимое файла"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file: {e}", file=sys.stderr)
            return ""
    
    def exec(self, pathToShellFile):
        """
        Асинхронно запускает shell-скрипт и возвращает PID процесса.
        
        Args:
            pathToShellFile: Путь к shell-скрипту
            
        Returns:
            int: PID запущенного процесса или -1 в случае ошибки
        """
        def run_script():
            try:
                import subprocess
                
                # Запускаем скрипт в фоновом режиме
                process = subprocess.Popen(
                    ['bash', pathToShellFile],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True  # Создаем новую сессию для процесса
                )
                
                pid = process.pid
                print(f"Script started with PID: {pid}")
                
                # Можно сохранить PID для последующего использования
                self.last_pid = pid
                
                return pid
                
            except Exception as e:
                print(f"Error executing script: {e}", file=sys.stderr)
                return -1
        
        # Запускаем в отдельном потоке и возвращаем PID
        result = {'pid': -1}
        
        def run_and_get_pid():
            result['pid'] = run_script()
        
        thread = threading.Thread(target=run_and_get_pid)
        thread.daemon = True
        thread.start()
        
        # Ждем завершения потока, чтобы получить PID
        thread.join(timeout=0.5)  # 500ms timeout
        
        return result['pid']
    
    # Обработчики пунктов меню
    def on_stop_xampp(self, widget):
        """Обработчик для 'Остановить XAMPP'"""
        #print("Stop XAMPP clicked")
        # Здесь будет код для остановки XAMPP
        self.startTimer()
        self.writeFile(self.socket_file, "xamppstop")
    
    def on_restart_xampp(self, widget):
        """Обработчик для '(Пере)запустить XAMPP'"""
        #print("Restart XAMPP clicked")
        #self.setIcon("i/gray.png")
        #self.showNotify("XAMPP Hello")
        # Здесь будет код для перезапуска XAMPP
        self.startTimer()
        self.writeFile(self.socket_file, "xampprestart")
        
    
    def on_settings(self, widget):
        """Запуск скрипта настроек"""
        script_path = os.path.join(self.base_dir, "p", "settings", "setup.sh")
        if os.path.exists(script_path):
            # Запускаем таймер проверки состояния
            self.startTimer()
            self.exec(script_path)
        else:
            print(f"Settings script not found: {script_path}", file=sys.stderr)
    
    def startTimer(self):
        if self.ival == -1:
            self.ival = setInterval(self.onTick, 1)
    
    def on_about(self, widget):
        """Запуск скрипта 'О программе'"""
        script_path = os.path.join(self.base_dir, "p", "about", "about.sh")
        if os.path.exists(script_path):
            self.exec(script_path)
        else:
            print(f"About script not found: {script_path}", file=sys.stderr)
    
    def on_exit(self, widget):
        """Завершение работы приложения"""
        if self.ival == -1:
            Gtk.main_quit()
        else:
            clearInterval(self.ival)
            SI.timer.cancel()
            self.needHalt = True
            Gtk.main_quit()

    #def on_exit(self, widget):
    #    """Завершение работы приложения"""
    #    print("Exit clicked - shutting down...")
    #    
    #    # Завершаем все запущенные процессы
    #    self.kill_all_processes()
    #    
    #    # Удаляем индикатор из трея
    #    self.indicator.set_status(appindicator.IndicatorStatus.PASSIVE)
    #    
    #    # Выходим из главного цикла GTK
    #    Gtk.main_quit()
    #    
    #    # Завершаем процесс Python
    #    sys.exit(0)
        
    def setIcon(self, icon_name):
        """
        Изменяет иконку в системном трее.
        
        Args:
            icon_name: Имя файла иконки (например, 'sxampp.png') или полный путь к файлу
        """
        try:
            # Проверяем, является ли переданное значение полным путем
            if os.path.isabs(icon_name):
                icon_path = icon_name
            else:
                # Ищем иконку в каталоге i относительно базовой директории
                icon_path = os.path.join(self.base_dir, "i", icon_name)
            
            # Проверяем существование файла
            if not os.path.exists(icon_path):
                print(f"Icon file not found: {icon_path}", file=sys.stderr)
                
                # Попробуем найти в других возможных местах
                alt_paths = [
                    os.path.join(self.base_dir, icon_name),  # прямо в базовой директории
                    icon_name  # возможно это уже полный путь
                ]
                
                for alt_path in alt_paths:
                    if os.path.exists(alt_path):
                        icon_path = alt_path
                        print(f"Found icon at alternative location: {icon_path}")
                        break
                else:
                    print(f"Cannot find icon: {icon_name}", file=sys.stderr)
                    return False
            
            # Устанавливаем новую иконку
            self.indicator.set_icon_full(icon_path, "XAMPP Tray Icon")
            print(f"Icon changed to: {icon_path}")
            return True
            
        except Exception as e:
            print(f"Error changing icon: {e}", file=sys.stderr)
            return False
    def showNotify(self, text, timeout=3):
        textC = 'XAMPP\n' + text + '\n/opt/p-landlib/apps/xamppSsl/i/sxampp.png' + '\n' + str(timeout) + '\n0\n';
        self.writeFile(App.dir() + "/p/not/data.txt", textC);
        scriptPath = os.path.join(self.base_dir, "p", "not", "not.sh")
        self.exec(scriptPath);

    def _hide_notify(self):
        """Скрывает уведомление"""
        if hasattr(self, 'notify_window') and self.notify_window:
            self.notify_window.destroy()
            delattr(self, 'notify_window')
        return False  # Останавливаем таймер

    def _show_fallback_notify(self, text):
        """Альтернативный метод показа уведомления"""
        try:
            # Используем стандартные уведомления через libnotify
            import subprocess
            subprocess.Popen([
                'notify-send', 
                'XAMPP Tray', 
                str(text),
                '-t', '3000',  # время показа 3 секунды
                '-i', os.path.join(self.base_dir, "i", "sxampp.png")
            ])
        except:
            # Если и это не работает, просто выводим в консоль
            print(f"Notification: {text}")
            
    def onTick(self):
        if self.needHalt:
            clearInterval(self.ival)
            SI.timer.cancel()
            Gtk.main_quit()
        if file_exists(self.socket_file):
            s = self.readFile(self.socket_file)
            #print("Tick: " + s)
            if s == "xampprestart" or s == "xamppstop":
                print("case 1");
                self.setIcon(App.dir() + "/i/gray.png")
                if self.lastState != s:
                    self.showNotify(self.t("in_process"))
                    self.lastState = s
            elif s == "stopped":
                self.setIcon(App.dir() + "/i/gray.png")
                if self.lastState != s:
                    print("case 2");
                    self.showNotify(self.t("stopped"))
                    self.lastState = s
            elif s == "restarted":
                self.setIcon(App.dir() + "/i/sxampp.png")
                if self.lastState != s:
                    print("case 3");
                    self.showNotify(self.t("started"))
                    self.lastState = s
            else:
                print("case 4");
                self.setIcon(App.dir() + "/i/sxampp.png")
                
    def t(self, key, default_text=None):
        """Получить локализованную строку"""
        if self.If and key in self.If.data:
            return self.If.data[key].replace("\\n", "\n")
        return default_text or key

App.defaultPath = __file__
if __name__ == "__main__":
    app = XAMPPTrayApp()
