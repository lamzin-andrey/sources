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
		left_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
		left_scroll.set_shadow_type(Gtk.ShadowType.IN)
		left_scroll.set_size_request(250, -1)
		
		# Контент левой области (вертикальный список кнопок)
		left_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
		left_box.set_margin_start(10)
		left_box.set_margin_end(10)
		left_box.set_margin_top(10)
		left_box.set_margin_bottom(10)
		
		label_left = Gtk.Label()
		label_left.set_markup("<b>Левая область</b>")
		label_left.set_halign(Gtk.Align.START)
		left_box.pack_start(label_left, False, False, 0)
		
		# Добавляем много элементов для проверки прокрутки
		for i in range(30):
			btn = Gtk.Button(label=f"Кнопка {i+1} (левая)")
			btn.set_size_request(-1, 40)
			left_box.pack_start(btn, False, False, 0)
		
		left_scroll.add(left_box)
		self.hpaned.pack1(left_scroll, True, False)
		
		# === ПРАВАЯ ОБЛАСТЬ ===
		right_scroll = Gtk.ScrolledWindow()
		right_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
		right_scroll.set_shadow_type(Gtk.ShadowType.IN)
		
		# Контент правой области (вертикальный список с разными виджетами)
		right_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
		right_box.set_margin_start(10)
		right_box.set_margin_end(10)
		right_box.set_margin_top(10)
		right_box.set_margin_bottom(10)
		
		label_right = Gtk.Label()
		label_right.set_markup("<b>Правая область</b>")
		label_right.set_halign(Gtk.Align.START)
		right_box.pack_start(label_right, False, False, 0)
		
		# Добавляем разнообразные виджеты
		for i in range(30):
			hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
			
			entry = Gtk.Entry()
			entry.set_text(f"Текст {i+1}")
			entry.set_hexpand(True)
			
			btn = Gtk.Button(label="OK")
			btn.set_size_request(60, -1)
			
			hbox.pack_start(entry, True, True, 0)
			hbox.pack_start(btn, False, False, 0)
			right_box.pack_start(hbox, False, False, 0)
		
		right_scroll.add(right_box)
		self.hpaned.pack2(right_scroll, True, False)
		
		# Настройка разделителя - начальная позиция 50%
		self.hpaned.set_position(400)
		
		# Обработка закрытия окна
		self.connect("destroy", Gtk.main_quit)

def main():
	win = MainWindow()
	
	
	win.connect("destroy", Gtk.main_quit)
	MW.setWindow(win, __file__);
	MW.setTitle("LandLib Desktop on Python3");
	MW.maximize();
	
	win.show_all()
	Gtk.main()

if __name__ == "__main__":
	main()
