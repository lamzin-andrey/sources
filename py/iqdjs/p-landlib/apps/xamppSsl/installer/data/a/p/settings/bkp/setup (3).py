import gi
import os
import dbus
import dbus.service
import dbus.mainloop.glib
from dbus.mainloop.glib import DBusGMainLoop

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, Pango, GLib

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
        Gtk.Window.__init__(self, title="Управление сайтами на localhost")
        
        # Устанавливаем фиксированный размер окна
        self.set_resizable(False)
        self.set_default_size(366, 416)
        
        # Пробуем загрузить иконку из файла
        try:
            icon_path = os.path.abspath("../../i/sxampp.png")
            if os.path.exists(icon_path):
                self.set_icon_from_file(icon_path)
            else:
                # Если файл не найден, попробуем поискать относительно текущей директории
                icon_path = os.path.abspath("i/sxampp.png")
                if os.path.exists(icon_path):
                    self.set_icon_from_file(icon_path)
                else:
                    print(f"Иконка не найдена по пути: {icon_path}")
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
        
        # 1. Метка "Добавить сайт" (НЕ жирная, как другие метки)
        add_site_label = Gtk.Label(label="Добавить сайт")
        add_site_label.set_margin_start(7)
        add_site_label.set_margin_top(3)
        add_site_label.set_margin_bottom(6)
        add_site_label.set_halign(Gtk.Align.START)
        # Устанавливаем тот же стиль шрифта, что и у других меток
        add_site_label.set_name("sectionLabel")
        css_provider = Gtk.CssProvider()
        css = """
        #sectionLabel, #fieldLabel {
            font-family: Arial;
            font-size: 12px;
            font-weight: normal;
        }
        """
        css_provider.load_from_data(css.encode())
        add_site_label.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
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
        
        # Метка выровнена по левому краю и занимает фиксированную ширину
        site_name_label = Gtk.Label(label="Имя сайта")
        site_name_label.set_halign(Gtk.Align.START)
        site_name_label.set_valign(Gtk.Align.CENTER)
        site_name_label.set_size_request(140, -1)  # Фиксированная ширина как в оригинале
        site_name_label.set_margin_start(6)  # margin-left: 6px из CSS
        site_name_label.set_name("fieldLabel")
        site_name_label.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        site_name_entry = Gtk.Entry()
        site_name_entry.set_size_request(198, 20)  # Высота 20px
        site_name_entry.set_margin_end(6)  # margin-right: 6px из CSS
        site_name_entry.set_margin_top(2)  # margin-top: 2px из CSS
        
        # Стилизуем поле ввода
        site_name_entry.set_name("siteNameEntry")
        entry_css = """
        #siteNameEntry, #rootDirEntry, #filterEntry {
            border: 1px solid #548CAF;
            border-radius: 2px;
            padding: 2px 4px;
            font-family: Arial;
            font-size: 12px;
        }
        """
        entry_css_provider = Gtk.CssProvider()
        entry_css_provider.load_from_data(entry_css.encode())
        site_name_entry.get_style_context().add_provider(entry_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        site_name_box.pack_start(site_name_label, False, False, 0)
        site_name_box.pack_end(site_name_entry, False, False, 0)
        frame1_box.pack_start(site_name_box, False, False, 0)
        
        # 1.2 Поле "Корневая директория"
        root_dir_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        
        # Метка выровнена по левому краю
        root_dir_label = Gtk.Label(label="Корневая директория")
        root_dir_label.set_halign(Gtk.Align.START)
        root_dir_label.set_valign(Gtk.Align.CENTER)
        root_dir_label.set_size_request(140, -1)  # Фиксированная ширина
        root_dir_label.set_margin_start(6)  # margin-left: 6px из CSS
        root_dir_label.set_name("fieldLabel")
        root_dir_label.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        root_dir_entry = Gtk.Entry()
        root_dir_entry.set_size_request(198, 20)  # Высота 20px
        root_dir_entry.set_margin_end(6)  # margin-right: 6px из CSS
        root_dir_entry.set_margin_top(2)  # margin-top: 2px из CSS
        root_dir_entry.set_text("www")
        
        # Стилизуем поле ввода
        root_dir_entry.set_name("rootDirEntry")
        root_dir_entry.get_style_context().add_provider(entry_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        root_dir_box.pack_start(root_dir_label, False, False, 0)
        root_dir_box.pack_end(root_dir_entry, False, False, 0)
        frame1_box.pack_start(root_dir_box, False, False, 0)
        
        # 1.3 Кнопка "Добавить"
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_halign(Gtk.Align.END)
        self.add_button = Gtk.Button(label="Добавить")
        self.add_button.set_size_request(82, 20)  # Высота 20px
        
        # Стилизуем кнопку как в CSS
        self.add_button.set_name("addButton")
        button_css = """
        #addButton {
            background: linear-gradient(to bottom, #fcfcfd, #DEE5E8);
            border: 1px solid #548CAF;
            border-radius: 3px;
            font-size: 12px;
            color: #000000;
            padding: 2px 8px;
            font-family: Arial;
        }
        #addButton:hover {
            background: linear-gradient(to bottom, #e6e6e6, #c8d1d4);
        }
        """
        button_css_provider = Gtk.CssProvider()
        button_css_provider.load_from_data(button_css.encode())
        self.add_button.get_style_context().add_provider(button_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        # Подключаем обработчик клика
        self.add_button.connect("clicked", self.on_add_button_clicked)
        
        button_box.pack_end(self.add_button, False, False, 5)
        frame1_box.pack_start(button_box, False, False, 4)  # margin-bottom: 4px из CSS
        
        frame1.add(frame1_box)
        main_box.pack_start(frame1, False, False, 0)
        
        # 2. Метка "Список сайтов на localhost" (НЕ жирная)
        site_list_label = Gtk.Label(label="Список сайтов на localhost")
        site_list_label.set_margin_start(7)
        site_list_label.set_margin_top(3)
        site_list_label.set_margin_bottom(6)
        site_list_label.set_halign(Gtk.Align.START)
        site_list_label.set_name("sectionLabel")
        site_list_label.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
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
        
        # Метка выровнена по левому краю
        filter_label = Gtk.Label(label="Фильтр")
        filter_label.set_halign(Gtk.Align.START)
        filter_label.set_valign(Gtk.Align.CENTER)
        filter_label.set_size_request(140, -1)  # Фиксированная ширина
        filter_label.set_margin_start(6)  # margin-left: 6px из CSS
        filter_label.set_name("fieldLabel")
        filter_label.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        self.filter_entry = Gtk.Entry()
        self.filter_entry.set_size_request(268, 20)  # Высота 20px
        self.filter_entry.set_margin_end(6)  # margin-right: 6px из CSS
        self.filter_entry.set_margin_top(2)  # margin-top: 2px из CSS
        
        # Стилизуем поле ввода фильтра
        self.filter_entry.set_name("filterEntry")
        self.filter_entry.get_style_context().add_provider(entry_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        # Подключаем обработчик ввода
        self.filter_entry.connect("changed", self.on_filter_changed)
        
        filter_box.pack_start(filter_label, False, False, 0)
        filter_box.pack_end(self.filter_entry, False, False, 0)
        frame2_box.pack_start(filter_box, False, False, 0)
        
        # 2.2 ListBox для списка сайтов (одиночный выбор)
        self.all_sites = [
            "localhost", "mh.loc", "test.loc", "kasko.local.loc",
            "kasko.local.loc", "kasko.local.loc", "kasko.local.loc",
            "kasko.local.loc", "kasko.local.loc"
        ]
        
        self.scrolled_window = Gtk.ScrolledWindow()
        self.scrolled_window.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        self.scrolled_window.set_min_content_height(196)
        self.scrolled_window.set_propagate_natural_height(True)
        
        self.listbox = Gtk.ListBox()
        self.listbox.set_selection_mode(Gtk.SelectionMode.SINGLE)  # Одиночный выбор
        
        # Настраиваем стиль ListBox
        self.listbox.set_name("sitesListBox")
        listbox_css = """
        #sitesListBox {
            border: 1px solid #548CAF;
            border-radius: 2px;
            background-color: #FFFFFF;
            font-family: Arial;
            font-size: 12px;
        }
        #sitesListBox:selected {
            background-color: #E0E0E0;
        }
        """
        listbox_css_provider = Gtk.CssProvider()
        listbox_css_provider.load_from_data(listbox_css.encode())
        self.listbox.get_style_context().add_provider(listbox_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        # Изначально добавляем все сайты
        self.update_site_list(self.all_sites)
        
        self.scrolled_window.add(self.listbox)
        frame2_box.pack_start(self.scrolled_window, True, True, 0)
        
        frame2.add(frame2_box)
        main_box.pack_start(frame2, True, True, 0)
        
        # Добавляем основной контейнер в окно
        self.add(main_box)
        
        # Сохраняем ссылки на поля ввода для обработчика
        self.site_name_entry = site_name_entry
        self.root_dir_entry = root_dir_entry
        
        # Подключаем обработчик закрытия окна
        self.connect("destroy", Gtk.main_quit)
    
    def update_site_list(self, sites):
        """Обновить список сайтов"""
        # Очищаем текущий список
        for child in self.listbox.get_children():
            self.listbox.remove(child)
        
        # Добавляем новые элементы
        for site in sites:
            row = Gtk.ListBoxRow()
            label = Gtk.Label(label=site)
            label.set_margin_start(5)
            label.set_halign(Gtk.Align.START)
            label.set_valign(Gtk.Align.CENTER)
            
            # Устанавливаем фиксированную высоту строки
            row.set_size_request(-1, 24)
            
            row.add(label)
            self.listbox.add(row)
        
        # Обновляем отображение
        self.listbox.show_all()
    
    def on_filter_changed(self, entry):
        """Обработчик изменения текста в поле фильтра"""
        filter_text = entry.get_text().lower()
        
        if not filter_text:
            # Если поле пустое, показываем все сайты
            self.update_site_list(self.all_sites)
        else:
            # Фильтруем сайты по введенному тексту
            filtered_sites = [
                site for site in self.all_sites 
                if filter_text in site.lower()
            ]
            self.update_site_list(filtered_sites)
    
    def on_add_button_clicked(self, button):
        """Обработчик клика на кнопку 'Добавить'"""
        site_name = self.site_name_entry.get_text()
        root_dir = self.root_dir_entry.get_text()
        
        print(f"Добавить сайт: {site_name}, корневая директория: {root_dir}")
        # Здесь можно добавить логику для добавления сайта
    
    def writeFile(self, path, content):
        """Записать содержимое в файл"""
        try:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Ошибка записи файла {path}: {e}")
            return False
    
    def readFile(self, path):
        """Прочитать содержимое файла"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Ошибка чтения файла {path}: {e}")
            return None

def check_already_running():
    """Проверить, запущено ли приложение уже"""
    try:
        bus = dbus.SessionBus()
        # Пытаемся получить доступ к сервису
        proxy = bus.get_object('com.localhost.manager', '/com/localhost/manager')
        interface = dbus.Interface(proxy, 'com.localhost.manager')
        # Активируем существующее окно
        interface.activate()
        return True
    except dbus.exceptions.DBusException:
        # Сервис не найден, значит приложение не запущено
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
        # Продолжаем без D-Bus
    
    # Показываем окно
    app.show_all()
    
    # Запускаем главный цикл
    Gtk.main()

if __name__ == "__main__":
    main()
