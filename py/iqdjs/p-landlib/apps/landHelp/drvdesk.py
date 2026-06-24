#!/usr/bin/env python3

import sys
sys.path.append("/opt/p-landlib/landdesk")
from IQdjs import *

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk



class MainWindow(Gtk.Window):
	def __init__(self):
		Gtk.Window.__init__(self, title="Две области с прокруткой")
		self.set_default_size(800, 500)
		
		# Главный контейнер - горизонтальный разделитель
		self.hpaned = Gtk.Paned(orientation=Gtk.Orientation.HORIZONTAL)
		self.add(self.hpaned)
		
		# === ЛЕВАЯ ОБЛАСТЬ ===
		left_scroll = Gtk.ScrolledWindow()
		left_scroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
		left_scroll.set_shadow_type(Gtk.ShadowType.IN)
		SIDE_WIDTH = 250
		left_scroll.set_size_request(SIDE_WIDTH, -1)
		
		
		# Контент левой области (вертикальный список кнопок)
		left_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
		self.left_box = left_box
		left_box.set_margin_start(10)
		left_box.set_margin_end(10)
		left_box.set_margin_top(10)
		left_box.set_margin_bottom(10)
		
		#left_box.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.61, 0.35, 0.71, 1.0))
		left_box.override_background_color(Gtk.StateFlags.NORMAL, Gdk.RGBA(0.11, 0.11, 0.60, 1.0))
		
		
		# Добавляем в содержание
		self.addLeftPoint('О программе', 0);
		self.addLeftPoint('Зачем этому миру ещё\n одно API для удобного создания\n приложений', 1);
		
		left_scroll.add(left_box)
		self.hpaned.pack1(left_scroll, False, False)
		
		# === ПРАВАЯ ОБЛАСТЬ ===
		right_scroll = Gtk.ScrolledWindow()
		self.right_scroll = right_scroll;
		right_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
		right_scroll.set_shadow_type(Gtk.ShadowType.IN)
		
		# Контент правой области (вертикальный список с разными виджетами)
		right_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
		self.right_box = right_box
		right_box.set_margin_start(10)
		right_box.set_margin_end(10)
		right_box.set_margin_top(10)
		right_box.set_margin_bottom(10)
		
		self.list_of_texts = [];
		
		# Добавляем контент
		lang = 'ru'
		self.addContent(f"data/{lang}/about.html", 0);
		self.addContent(f"data/{lang}/why.html", 1);
		
		right_scroll.add(right_box)
		self.hpaned.pack2(right_scroll, True, False)
		
		# Настройка разделителя - начальная позиция 50%
		self.hpaned.set_position(SIDE_WIDTH + 30)
		
		# Обработка закрытия окна
		self.connect("destroy", Gtk.main_quit)
	
	def addLeftPoint(self, name, _id):
		btn = Gtk.Label()
		btn.set_markup('<span color="white" size="large"><u><b>' + name + '</b></u></span>');
		btn.set_halign(Gtk.Align.START);
		btn.set_margin_start(10)
		btn.data_index = _id
		btn.set_size_request(-1, 40)
		event_box = Gtk.EventBox()
		event_box.add(btn)
		event_box.connect("button-press-event", self.on_click_menu_item, name)
		self.left_box.pack_start(event_box, False, False, 0)
	
	def addContent(self, filename, _id):
		hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
		content = Gtk.Label()
		content.set_halign(Gtk.Align.START);
		content.set_margin_start(10)
		content.set_margin_bottom(20)
		s = FS.readfile(filename)
		content.set_markup(s)
		content.set_hexpand(True)
		content.data_index = _id
		hbox.pack_start(content, True, True, 0)
		self.right_box.pack_start(hbox, False, False, 0)
		self.list_of_texts.insert(_id, content);
		
		
	
	def on_click_menu_item(self, widget, event, name):
		print("Event "  + str(name))
		button = widget.get_child()
		print("button n = " + str(button.data_index))
		i = 0
		while i < len(self.list_of_texts):
			if self.list_of_texts[i].data_index == button.data_index:
				print("Will Scroll to " + str(i))
				vadjustment = self.right_scroll.get_vadjustment()
				_, y = self.list_of_texts[i].translate_coordinates(
					self.right_box,  # от какого виджета
					0, 0             # координаты (x, y) в системе target_widget
				)
				vadjustment.set_value(y)
			i = i + 1

def main():
	win = MainWindow()
	
	
	win.connect("destroy", Gtk.main_quit)
	MW.setWindow(win, __file__);
	MW.setTitle("LandLib Desktop on Python3");
	MW.maximize();
	MW.setIconImage('48.png')
	
	win.show_all()
	Gtk.main()

if __name__ == "__main__":
	main()
