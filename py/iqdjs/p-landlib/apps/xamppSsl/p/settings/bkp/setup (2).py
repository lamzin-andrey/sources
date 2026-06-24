import gi
import os

gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk, Pango

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
        
        # 1. Метка "Добавить сайт"
        add_site_label = Gtk.Label()
        add_site_label.set_markup('<span font="Arial 12"><b>Добавить сайт</b></span>')
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
        
        # Метка выровнена по левому краю и занимает фиксированную ширину
        site_name_label = Gtk.Label(label="Имя сайта")
        site_name_label.set_halign(Gtk.Align.START)
        site_name_label.set_valign(Gtk.Align.CENTER)
        site_name_label.set_size_request(140, -1)  # Фиксированная ширина как в оригинале
        site_name_label.set_margin_start(6)  # margin-left: 6px из CSS
        
        site_name_entry = Gtk.Entry()
        site_name_entry.set_size_request(198, 20)  # Высота 20px
        site_name_entry.set_margin_end(6)  # margin-right: 6px из CSS
        site_name_entry.set_margin_top(2)  # margin-top: 2px из CSS
        
        # Стилизуем поле ввода
        site_name_entry.set_name("siteNameEntry")
        css_provider = Gtk.CssProvider()
        css = """
        #siteNameEntry {
            border: 1px solid #548CAF;
            border-radius: 2px;
            padding: 2px 4px;
        }
        """
        css_provider.load_from_data(css.encode())
        site_name_entry.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
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
        
        root_dir_entry = Gtk.Entry()
        root_dir_entry.set_size_request(198, 20)  # Высота 20px
        root_dir_entry.set_margin_end(6)  # margin-right: 6px из CSS
        root_dir_entry.set_margin_top(2)  # margin-top: 2px из CSS
        root_dir_entry.set_text("www")
        
        # Стилизуем поле ввода
        root_dir_entry.set_name("rootDirEntry")
        root_dir_entry.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        root_dir_box.pack_start(root_dir_label, False, False, 0)
        root_dir_box.pack_end(root_dir_entry, False, False, 0)
        frame1_box.pack_start(root_dir_box, False, False, 0)
        
        # 1.3 Кнопка "Добавить"
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        button_box.set_halign(Gtk.Align.END)
        add_button = Gtk.Button(label="Добавить")
        add_button.set_size_request(82, 20)  # Высота 20px
        
        # Стилизуем кнопку как в CSS
        add_button.set_name("addButton")
        button_css = """
        #addButton {
            background: linear-gradient(to bottom, #fcfcfd, #DEE5E8);
            border: 1px solid #548CAF;
            border-radius: 3px;
            font-size: 12px;
            color: #000000;
            padding: 2px 8px;
        }
        #addButton:hover {
            background: linear-gradient(to bottom, #e6e6e6, #c8d1d4);
        }
        """
        button_css_provider = Gtk.CssProvider()
        button_css_provider.load_from_data(button_css.encode())
        add_button.get_style_context().add_provider(button_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        button_box.pack_end(add_button, False, False, 5)
        frame1_box.pack_start(button_box, False, False, 4)  # margin-bottom: 4px из CSS
        
        frame1.add(frame1_box)
        main_box.pack_start(frame1, False, False, 0)
        
        # 2. Метка "Список сайтов на localhost"
        site_list_label = Gtk.Label()
        site_list_label.set_markup('<span font="Arial 12"><b>Список сайтов на localhost</b></span>')
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
        
        # Метка выровнена по левому краю
        filter_label = Gtk.Label(label="Фильтр")
        filter_label.set_halign(Gtk.Align.START)
        filter_label.set_valign(Gtk.Align.CENTER)
        filter_label.set_size_request(140, -1)  # Фиксированная ширина
        filter_label.set_margin_start(6)  # margin-left: 6px из CSS
        
        filter_entry = Gtk.Entry()
        filter_entry.set_size_request(268, 20)  # Высота 20px
        filter_entry.set_margin_end(6)  # margin-right: 6px из CSS
        filter_entry.set_margin_top(2)  # margin-top: 2px из CSS
        
        # Стилизуем поле ввода фильтра
        filter_entry.set_name("filterEntry")
        filter_entry.get_style_context().add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        filter_box.pack_start(filter_label, False, False, 0)
        filter_box.pack_end(filter_entry, False, False, 0)
        frame2_box.pack_start(filter_box, False, False, 0)
        
        # 2.2 ListBox для списка сайтов (одиночный выбор)
        sites = [
            "localhost", "mh.loc", "test.loc", "kasko.local.loc",
            "kasko.local.loc", "kasko.local.loc", "kasko.local.loc",
            "kasko.local.loc", "kasko.local.loc"
        ]
        
        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        scrolled_window.set_min_content_height(196)
        scrolled_window.set_propagate_natural_height(True)
        
        listbox = Gtk.ListBox()
        listbox.set_selection_mode(Gtk.SelectionMode.SINGLE)  # Одиночный выбор
        
        # Настраиваем стиль ListBox
        listbox.set_name("sitesListBox")
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
        listbox.get_style_context().add_provider(listbox_css_provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
        
        for site in sites:
            row = Gtk.ListBoxRow()
            label = Gtk.Label(label=site)
            label.set_margin_start(5)
            label.set_halign(Gtk.Align.START)
            label.set_valign(Gtk.Align.CENTER)
            
            # Устанавливаем фиксированную высоту строки
            row.set_size_request(-1, 24)
            
            row.add(label)
            listbox.add(row)
        
        scrolled_window.add(listbox)
        frame2_box.pack_start(scrolled_window, True, True, 0)
        
        frame2.add(frame2_box)
        main_box.pack_start(frame2, True, True, 0)
        
        # Добавляем основной контейнер в окно
        self.add(main_box)
        
        # Подключаем обработчик закрытия окна
        self.connect("destroy", Gtk.main_quit)

def main():
    app = LocalhostManager()
    app.show_all()
    Gtk.main()

if __name__ == "__main__":
    main()
