import gi
import os
import dbus
import dbus.service
import dbus.mainloop.glib
import configparser
import shutil
import subprocess
from pathlib import Path
from dbus.mainloop.glib import DBusGMainLoop

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, GLib

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

class LocalhostManagerDBus(dbus.service.Object):
    def __init__(self, window):
        self.window = window
        bus_name = dbus.service.BusName('com.localhost.manager', bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, '/com/localhost/manager')
    
    @dbus.service.method('com.localhost.manager')
    def activate(self):
        """Активировать окно приложения"""
        if self.window.is_visible():
            self.window.present()
        else:
            self.window.show_all()
        return True

class LocalhostManager(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Managing sites on localhost")
        
        # Инициализация переменных
        self.names = []  # Список имен сайтов
        self.current_edit = -1
        self.hosts_file = "/etc/hosts"
        self.vhosts_file = "/opt/lampp/etc/extra/httpd-vhosts.conf"
        self.socket_file = os.path.expanduser("~/.config/fastxampp/.sock")
        self.dir_config_file = os.path.expanduser("~/.config/fastxampppersist/workdirs.ini")
        self.dir_config = IniFile()
        
        # Загружаем локализацию
        self.load_localization()
        
        # Инициализация конфигурации директорий
        self.init_dir_config()
        
        # Устанавливаем фиксированный размер окна
        self.set_resizable(False)
        self.set_default_size(366, 416)
        
        # Пробуем загрузить иконку из файла
        try:
            icon_path = os.path.abspath("../../i/sxampp.png")
            if os.path.exists(icon_path):
                self.set_icon_from_file(icon_path)
            else:
                icon_path = os.path.abspath("i/sxampp.png")
                if os.path.exists(icon_path):
                    self.set_icon_from_file(icon_path)
        except Exception as e:
            print(f"Не удалось загрузить иконку: {e}")
        
        # Основной контейнер с отступами как в CSS
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        main_box.set_margin_top(10)
        main_box.set_margin_bottom(10)
        main_box.set_margin_start(10)
        main_box.set_margin_end(10)
        
        # Устанавливаем цвет фона как в CSS (#EFEBE7)
        self.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.937, 0.922, 0.906, 1))
        
        # 1. Метка "Добавить сайт"
        add_site_label = Gtk.Label(label=self.t("add_site"))
        add_site_label.set_margin_start(7)
        add_site_label.set_margin_top(3)
        add_site_label.set_margin_bottom(6)
        add_site_label.set_halign(Gtk.Align.START)
        
        main_box.pack_start(add_site_label, False, False, 0)
        
        # Первый Frame (Добавить сайт)
        frame1 = Gtk.Frame()
        frame1.set_margin_bottom(10)
        
        # Настраиваем цвет рамки и фона Frame
        frame1.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.925, 0.909, 0.894, 1))
        
        # Контейнер для содержимого первого Frame
        frame1_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=4)
        frame1_box.set_margin_top(10)
        frame1_box.set_margin_bottom(10)
        frame1_box.set_margin_start(10)
        frame1_box.set_margin_end(10)
        
        # 1.1 Поле "Имя сайта"
        site_name_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        
        # Метка выровнена по левому краю с отступом справа 10px
        site_name_label = Gtk.Label(label=self.t("site_name"))
        site_name_label.set_halign(Gtk.Align.START)
        site_name_label.set_hexpand(False)
        site_name_label.set_vexpand(False)
        site_name_label.set_margin_start(6)  # margin-left: 6px из CSS
        site_name_label.set_margin_end(10)   # Отступ справа 10px
        
        self.site_name_entry = Gtk.Entry()
        self.site_name_entry.set_hexpand(True)
        self.site_name_entry.set_margin_end(6)  # margin-right: 6px из CSS
        self.site_name_entry.set_margin_top(2)  # margin-top: 2px из CSS
        self.site_name_entry.set_size_request(-1, 20)
        
        site_name_box.pack_start(site_name_label, False, False, 0)
        site_name_box.pack_end(self.site_name_entry, True, True, 0)
        frame1_box.pack_start(site_name_box, False, False, 0)
        
        # 1.2 Поле "Корневая директория"
        root_dir_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        
        # Метка выровнена по левому краю с отступом справа 10px
        root_dir_label = Gtk.Label(label=self.t("wd_name"))
        root_dir_label.set_halign(Gtk.Align.START)
        root_dir_label.set_hexpand(False)
        root_dir_label.set_vexpand(False)
        root_dir_label.set_margin_start(6)  # margin-left: 6px из CSS
        root_dir_label.set_margin_end(10)   # Отступ справа 10px
        
        self.root_dir_entry = Gtk.Entry()
        self.root_dir_entry.set_hexpand(True)
        self.root_dir_entry.set_margin_end(6)  # margin-right: 6px из CSS
        self.root_dir_entry.set_margin_top(2)  # margin-top: 2px из CSS
        self.root_dir_entry.set_size_request(-1, 20)  # Высота 20px
        self.root_dir_entry.set_text("www")
        
        root_dir_box.pack_start(root_dir_label, False, False, 0)
        root_dir_box.pack_end(self.root_dir_entry, True, True, 0)
        frame1_box.pack_start(root_dir_box, False, False, 0)
        
        # 1.3 Кнопка "Добавить"
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_halign(Gtk.Align.END)
        self.add_button = Gtk.Button(label=self.t("add"))
        self.add_button.set_size_request(82, 20)  # Высота 20px
        
        # Подключаем обработчик клика
        self.add_button.connect("clicked", self.on_add_clicked)
        
        button_box.pack_end(self.add_button, False, False, 5)
        frame1_box.pack_start(button_box, False, False, 4)  # margin-bottom: 4px из CSS
        
        frame1.add(frame1_box)
        main_box.pack_start(frame1, False, False, 0)
        
        # 2. Метка "Список сайтов на localhost"
        site_list_label = Gtk.Label(label=self.t("sitelist"))
        site_list_label.set_margin_start(7)
        site_list_label.set_margin_top(3)
        site_list_label.set_margin_bottom(6)
        site_list_label.set_halign(Gtk.Align.START)
        
        main_box.pack_start(site_list_label, False, False, 0)
        
        # Второй Frame (Список сайтов)
        frame2 = Gtk.Frame()
        
        # Настраиваем цвет рамки и фона Frame
        frame2.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.925, 0.909, 0.894, 1))
        
        # Контейнер для содержимого второго Frame
        frame2_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=4)
        frame2_box.set_margin_top(10)
        frame2_box.set_margin_bottom(10)
        frame2_box.set_margin_start(10)
        frame2_box.set_margin_end(10)
        
        # 2.1 Поле "Фильтр"
        filter_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        
        # Метка выровнена по левому краю с отступом справа 10px
        filter_label = Gtk.Label(label=self.t("filter"))
        filter_label.set_halign(Gtk.Align.START)
        filter_label.set_hexpand(False)
        filter_label.set_vexpand(False)
        filter_label.set_margin_start(6)  # margin-left: 6px из CSS
        filter_label.set_margin_end(10)   # Отступ справа 10px
        
        self.filter_entry = Gtk.Entry()
        self.filter_entry.set_hexpand(True)
        self.filter_entry.set_margin_end(6)  # margin-right: 6px из CSS
        self.filter_entry.set_margin_top(2)  # margin-top: 2px из CSS
        self.filter_entry.set_size_request(-1, 20)  # Высота 20px
        
        # Подключаем обработчик ввода
        self.filter_entry.connect("changed", self.on_filter_changed)
        
        filter_box.pack_start(filter_label, False, False, 0)
        filter_box.pack_end(self.filter_entry, True, True, 0)
        frame2_box.pack_start(filter_box, False, False, 0)
        
        # 2.2 ListBox для списка сайтов с контекстным меню
        self.all_sites = []
        
        # Контейнер для списка с отступом сверху 10px
        list_container = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        list_container.set_margin_top(10)  # Отступ сверху 10px
        list_container.set_size_request(-1, 196)  # Фиксированная высота 196px
        
        self.scrolled_window = Gtk.ScrolledWindow()
        self.scrolled_window.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        self.scrolled_window.set_min_content_height(196)
        self.scrolled_window.set_max_content_height(196)
        
        self.listbox = Gtk.ListBox()
        self.listbox.set_selection_mode(Gtk.SelectionMode.SINGLE)
        
        # Создаем контекстное меню
        self.context_menu = Gtk.Menu()
        delete_menu_item = Gtk.MenuItem(label=self.t("delete", default_text="Удалить"))
        delete_menu_item.connect("activate", self.on_delete_menu_clicked)
        self.context_menu.append(delete_menu_item)
        self.context_menu.show_all()
        
        # Подключаем обработчик правой кнопки мыши
        self.listbox.connect("button-press-event", self.on_listbox_button_press)
        
        self.scrolled_window.add(self.listbox)
        list_container.pack_start(self.scrolled_window, True, True, 0)
        frame2_box.pack_start(list_container, True, True, 0)
        
        frame2.add(frame2_box)
        main_box.pack_start(frame2, True, True, 0)
        
        # Применяем CSS стили
        self.apply_styles()
        
        # Добавляем основной контейнер в окно
        self.add(main_box)
        
        # Загружаем данные
        self.load_data()
        
        # Устанавливаем заголовок окна
        self.set_title(self.t("set_dlg_title"))
        
        # Подключаем обработчик закрытия окна
        self.connect("destroy", Gtk.main_quit)
    
    def load_localization(self):
        """Загрузить файл локализации"""
        # Пробуем загрузить русскую локализацию, если не найдена - английскую
        lang_paths = [
            "/usr/local/fastxampp/lang",
            os.path.expanduser("~/.local/share/fastxampp/lang"),
            "lang"
        ]
        
        self.If = None
        for path in lang_paths:
            if os.path.exists(path):
                self.If = IniFile(path)
                print(f"Загружена локализация из: {path}")
                break
        
        # Если не нашли файл, создаем дефолтные значения
        if not self.If:
            print("Файл локализации не найден, используются дефолтные значения")
            self.If = IniFile()
    
    def t(self, key, default_text=None):
        """Получить локализованную строку"""
        if self.If and key in self.If.data:
            return self.If.data[key].replace("\\n", "\n")
        return default_text or key
    
    def init_dir_config(self):
        """Инициализировать конфигурацию директорий"""
        config_dir = os.path.dirname(self.dir_config_file)
        if not os.path.exists(config_dir):
            os.makedirs(config_dir, exist_ok=True)
        
        if not os.path.exists(self.dir_config_file):
            # Создаем дефолтный конфиг
            with open(self.dir_config_file, 'w', encoding='utf-8') as f:
                f.write("localhost=www")
        
        self.dir_config.load_file(self.dir_config_file)
    
    def apply_styles(self):
        """Применить CSS стили ко всем элементам"""
        css = """
        * {
            font-family: Arial;
            font-size: 12px;
            font-weight: normal;
        }
        
        entry {
            border: 1px solid #548CAF;
            border-radius: 2px;
            padding: 0px 4px;
            margin: 0px;
            min-height: 20px;
        }
        
        button {
            background: linear-gradient(to bottom, #fcfcfd, #DEE5E8);
            border: 1px solid #548CAF;
            border-radius: 3px;
            font-size: 12px;
            color: #000000;
            padding: 0px 8px;
            min-height: 20px;
        }
        
        button:hover {
            background: linear-gradient(to bottom, #e6e6e6, #c8d1d4);
        }
        
        list {
            border: 1px solid #548CAF;
            border-radius: 2px;
            background-color: #FFFFFF;
        }
        
        list row:selected {
            background-color: #3584e4;
            color: white;
        }
        
        list row:selected label {
            color: white;
        }
        
        frame {
            border-color: #E0DCD9;
        }
        """
        
        css_provider = Gtk.CssProvider()
        css_provider.load_from_data(css.encode())
        screen = Gdk.Screen.get_default()
        style_context = Gtk.StyleContext()
        style_context.add_provider_for_screen(screen, css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
    
    def load_data(self):
        """Загрузить список сайтов из конфигурации"""
        self.names.clear()
        
        if not os.path.exists(self.vhosts_file):
            print(f"Файл виртуальных хостов не найден: {self.vhosts_file}")
            self.update_site_list([])
            return
        
        try:
            with open(self.vhosts_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            for line in lines:
                # Ищем строку с ServerName
                if "ServerName" in line:
                    # Проверяем, что это не комментарий
                    if self.is_no_comments(line, line.find("ServerName")):
                        hostname = self.extract_host_name(line, line.find("ServerName") + 11)
                        if hostname and hostname not in self.names:
                            self.names.append(hostname)
        
        except Exception as e:
            print(f"Ошибка при чтении файла виртуальных хостов: {e}")
        
        self.all_sites = self.names.copy()
        self.update_site_list(self.names)
    
    def is_no_comments(self, line, start_pos):
        """Проверить, что позиция не находится внутри комментария"""
        # Упрощенная проверка - ищем # перед ServerName
        comment_pos = line.find('#')
        if comment_pos != -1 and comment_pos < start_pos:
            return False
        return True
    
    def extract_host_name(self, line, start_pos):
        """Извлечь имя хоста из строки"""
        # Разрешенные символы в имени хоста
        allowed_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-"
        
        hostname = ""
        for i in range(start_pos, len(line)):
            char = line[i]
            if char in allowed_chars:
                hostname += char
            elif hostname:  # Если уже начали собирать имя и встретили неразрешенный символ
                break
        
        return hostname
    
    def update_site_list(self, sites):
        """Обновить список сайтов"""
        # Очищаем текущий список
        for child in self.listbox.get_children():
            self.listbox.remove(child)
        
        # Добавляем новые элементы
        for site in sites:
            row = Gtk.ListBoxRow()
            row.set_size_request(-1, 22)
            
            label = Gtk.Label(label=site)
            label.set_margin_start(5)
            label.set_halign(Gtk.Align.START)
            label.set_valign(Gtk.Align.CENTER)
            label.set_margin_top(2)
            label.set_margin_bottom(2)
            
            # Сохраняем имя сайта в данные строки
            row.site_name = site
            
            row.add(label)
            self.listbox.add(row)
        
        self.listbox.show_all()
    
    def on_filter_changed(self, entry):
        """Обработчик изменения текста в поле фильтра"""
        filter_text = entry.get_text().lower()
        
        if not filter_text:
            self.update_site_list(self.all_sites)
        else:
            filtered_sites = [
                site for site in self.all_sites 
                if filter_text in site.lower()
            ]
            self.update_site_list(filtered_sites)
    
    def on_listbox_button_press(self, widget, event):
        """Обработчик нажатия кнопки мыши на списке"""
        if event.button == 3:  # Правая кнопка мыши
            # Получаем выбранную строку
            row = self.listbox.get_selected_row()
            if row:
                # Показываем контекстное меню
                self.context_menu.popup_at_pointer(event)
                return True
        return False
    
    def on_delete_menu_clicked(self, menu_item):
        """Обработчик клика на пункт 'Удалить' в контекстном меню"""
        row = self.listbox.get_selected_row()
        if row and hasattr(row, 'site_name'):
            site_name = row.site_name
            self.on_delete(site_name)
    
    def on_delete(self, site_name):
        """Удалить сайт"""
        if not site_name:
            return
        
        # Запрос подтверждения
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.QUESTION,
            buttons=Gtk.ButtonsType.YES_NO,
            text=self.t("warning")
        )
        dialog.format_secondary_text(
            self.t("confirm_delete_host").replace("{HOST}", site_name)
        )
        
        response = dialog.run()
        dialog.destroy()
        
        if response == Gtk.ResponseType.YES:
            self.remove_from_hosts(site_name)
            
            # Удаляем из списка
            if site_name in self.names:
                self.names.remove(site_name)
            if site_name in self.all_sites:
                self.all_sites.remove(site_name)
            
            self.save()
            self.load_data()
            
            # Отправляем сигнал на перезапуск
            self.write_file(self.socket_file, "xampprestart")
    
    def remove_from_hosts(self, host_name):
        """Удалить хост из /etc/hosts"""
        if not os.path.exists(self.hosts_file):
            print(f"Файл hosts не найден: {self.hosts_file}")
            return
        
        try:
            with open(self.hosts_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if host_name in line:
                    # Если строка не начинается с #, закомментируем ее
                    if not line.strip().startswith('#'):
                        line = '#' + line
                new_lines.append(line.rstrip('\n'))
            
            with open(self.hosts_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
                
        except Exception as e:
            print(f"Ошибка при обновлении файла hosts: {e}")
            self.show_error(self.t("error"), str(e))
    
    def on_add_clicked(self, button):
        """Обработчик клика на кнопку 'Добавить'"""
        site_name = self.site_name_entry.get_text().strip()
        root_dir = self.root_dir_entry.get_text().strip()
        
        # Проверки
        if not site_name:
            self.show_error(self.t("error"), self.t("need_sitename"))
            return
        
        if site_name.endswith('.'):
            self.show_error(self.t("error"), self.t("need_domain"))
            return
        
        # Проверка на существование
        if site_name in self.names:
            self.show_error(self.t("error"), self.t("already_exists"))
            return
        
        # Добавляем сайт
        self.names.append(site_name)
        self.all_sites.append(site_name)
        
        # Создаем директорию
        self.create_directory(site_name, root_dir)
        
        # Сохраняем пользовательскую директорию если отличается от www
        if root_dir != "www":
            self.dir_config.data[site_name] = root_dir
            self.save_dir_config()
        
        # Сохраняем конфигурацию
        self.save()
        self.load_data()
        
        # Очищаем поля
        self.site_name_entry.set_text("")
        
        # Отправляем сигнал на перезапуск
        self.write_file(self.socket_file, "xampprestart")
        
        # Показываем сообщение об успехе
        self.show_info("Success", f"Site '{site_name}' added successfully")
    
    def create_directory(self, site_name, root_dir):
        """Создать директорию для сайта"""
        base_path = f"/opt/lampp/htdocs/{site_name}"
        full_path = f"{base_path}/{root_dir}"
        
        try:
            # Создаем директории если их нет
            os.makedirs(full_path, exist_ok=True)
            
            # Создаем index.php файл
            index_file = f"{full_path}/index.php"
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(f"It's {site_name} on localhost (127.0.0.1)")
                
        except Exception as e:
            print(f"Ошибка при создании директории: {e}")
            # Не прерываем выполнение, так как директория может уже существовать
    
    def save_dir_config(self):
        """Сохранить конфигурацию директорий"""
        try:
            with open(self.dir_config_file, 'w', encoding='utf-8') as f:
                for key, value in self.dir_config.data.items():
                    f.write(f"{key}={value}\n")
        except Exception as e:
            print(f"Ошибка при сохранении конфигурации директорий: {e}")
    
    def save(self):
        """Сохранить конфигурацию виртуальных хостов"""
        template = """<VirtualHost *:80>
\tServerAdmin webmaster@{HOST}
\tServerName {HOST}
\tDocumentRoot "/opt/lampp/htdocs/{HOST}/{www}"
\tScriptAlias /cgi/ "/opt/lampp/htdocs/{HOST}/cgi/
\tErrorLog /opt/lampp/htdocs/{HOST}/error.log
\tCustomLog /opt/lampp/htdocs/{HOST}/access.log common
</VirtualHost>

"""
        
        # Читаем текущий /etc/hosts
        hosts_lines = []
        if os.path.exists(self.hosts_file):
            with open(self.hosts_file, 'r', encoding='utf-8') as f:
                hosts_lines = [line.rstrip('\n') for line in f.readlines()]
        else:
            hosts_lines = []
        
        # Генерируем содержимое для vhosts
        vhosts_content = "NameVirtualHost *:80\n\n"
        
        for site_name in self.names:
            # Получаем корневую директорию
            root_dir = self.dir_config.data.get(site_name, "www")
            
            # Добавляем в vhosts
            site_config = template.replace("{HOST}", site_name).replace("{www}", root_dir)
            vhosts_content += site_config
            
            # Добавляем в hosts
            self.add_to_hosts(hosts_lines, site_name)
        
        # Сохраняем vhosts
        try:
            with open(self.vhosts_file, 'w', encoding='utf-8') as f:
                f.write(vhosts_content)
        except Exception as e:
            print(f"Ошибка при сохранении vhosts: {e}")
            self.show_error(self.t("error"), f"Error saving vhosts: {e}")
            return
        
        # Сохраняем hosts
        try:
            with open(self.hosts_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(hosts_lines))
        except Exception as e:
            print(f"Ошибка при сохранении hosts: {e}")
            self.show_error(self.t("error"), f"Error saving hosts: {e}")
    
    def add_to_hosts(self, hosts_lines, host_name):
        """Добавить запись в /etc/hosts"""
        found = False
        
        for i, line in enumerate(hosts_lines):
            if host_name in line:
                found = True
                # Если строка не начинается с # и не содержит 127.0.0.
                if not line.startswith('#') and '127.0.0.' not in line:
                    hosts_lines[i] = f"#{line}\n127.0.0.1\t{host_name}"
                elif line.startswith('#') and '127.0.0.1' in line:
                    # Если уже закомментирована с 127.0.0.1, раскомментируем
                    hosts_lines[i] = f"127.0.0.1\t{host_name}"
                break
        
        if not found:
            hosts_lines.append(f"127.0.0.1\t{host_name}")
    
    def write_file(self, path, content):
        """Записать содержимое в файл"""
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Ошибка записи файла {path}: {e}")
            return False
    
    def read_file(self, path):
        """Прочитать содержимое файла"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Ошибка чтения файла {path}: {e}")
            return None
    
    def show_error(self, title, message):
        """Показать сообщение об ошибке"""
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.ERROR,
            buttons=Gtk.ButtonsType.OK,
            text=title
        )
        dialog.format_secondary_text(message)
        dialog.run()
        dialog.destroy()
    
    def show_info(self, title, message):
        """Показать информационное сообщение"""
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.INFO,
            buttons=Gtk.ButtonsType.OK,
            text=title
        )
        dialog.format_secondary_text(message)
        dialog.run()
        dialog.destroy()
    
    def show_question(self, title, message):
        """Показать вопрос с выбором Да/Нет"""
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.QUESTION,
            buttons=Gtk.ButtonsType.YES_NO,
            text=title
        )
        dialog.format_secondary_text(message)
        response = dialog.run()
        dialog.destroy()
        return response == Gtk.ResponseType.YES

def check_already_running():
    """Проверить, запущено ли приложение уже"""
    try:
        bus = dbus.SessionBus()
        proxy = bus.get_object('com.localhost.manager', '/com/localhost/manager')
        interface = dbus.Interface(proxy, 'com.localhost.manager')
        interface.activate()
        return True
    except dbus.exceptions.DBusException:
        return False

def main():
    # Инициализируем D-Bus
    DBusGMainLoop(set_as_default=True)
    
    # Проверяем, не запущено ли приложение уже
    if check_already_running():
        print("Приложение уже запущено. Активируем существующее окно.")
        return
    
    # Создаем окно
    app = LocalhostManager()
    
    # Регистрируем сервис D-Bus
    try:
        dbus_service = LocalhostManagerDBus(app)
    except Exception as e:
        print(f"Ошибка регистрации D-Bus сервиса: {e}")
    
    # Показываем окно
    app.show_all()
    
    # Запускаем главный цикл
    Gtk.main()

if __name__ == "__main__":
    main()
