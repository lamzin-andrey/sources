# -*- coding: utf-8 -*-
import gtk, gobject
#import colors
import math
import random
#from simple_debug import simple_debug
#import sudoku
#import number_box


class MyApp:
	def __init__(self):
		Gtk = gtk
		window = gtk.Window()
		window.set_property("title", "Hello Gtk2")
		window.set_resizable(False)
		window.set_default_size(800, 600)
		window.set_property("width_request", 800)
		window.set_property("height_request", 600)
		window.move(100, 10)
		
		window.set_icon_from_file("48.png")
		#self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
		self.vbox = gtk.VBox()
		
		#SEE: Change background
		#self.vbox.modify_bg(gtk.STATE_NORMAL, gtk.gdk.color_parse("#EFE9D6"))
		window.modify_bg(gtk.STATE_NORMAL, gtk.gdk.color_parse("#EFE9D6"))
		
		window.add(self.vbox)
		#self.buttons = Gtk.Box(spacing=6,margin_top=16)
		self.buttons = Gtk.HBox()
		self.buttons.set_property("spacing", 6)
		#self.buttons.set_property("margin-top", 16)
		
		self.menubar = Gtk.HBox()
		self.textPlace = Gtk.HBox()
		#self.button = Gtk.Button(label="Click Here Click Here Click Here Click Here ")
		self.button = Gtk.Button()
		self.button.set_property("label", "Click Here Click Here Click Here Click Here ")
		self.button.connect("clicked", self.on_button_clicked)
		
		self.button2 = Gtk.Button()
		self.button2.set_property("label", "Button 2")
		
		self.menuButton = Gtk.Button()
		#self.menuButton.set_property("label", "Jello")
		image = Gtk.Image()
		image.set_from_file("24.png")
		self.menuButton.set_image(image)
		#self.menuButton.set_property("width_request", 24)
		
		self.menuButton2 = Gtk.Button()
		self.menuButton2.set_property("label", "Delete")
		
		# SEE display:inline; text-align:right
		self.spacer = Gtk.HBox()
		self.spacer.set_property("spacing", 0)
		self.buttons.pack_start(self.spacer, fill = True, expand = True)
		self.buttons.pack_start(self.button, False, False, 0)
		self.buttons.pack_start(self.button2, False, False, 0)
		
		# SEE textarea
		scrolledwindow = Gtk.ScrolledWindow()
		#scrolledwindow.set_hexpand(True)
		#scrolledwindow.set_vexpand(True)
		self.textview = Gtk.TextView()
		self.textbuffer = self.textview.get_buffer()
		self.textbuffer.set_text(
			"This is some text inside of a Gtk.TextView. "
			+ "Select text and click one of the buttons 'bold', 'italic', "
			+ "or 'underline' to modify the text accordingly."
		)
		scrolledwindow.add(self.textview)
		fillSpace=True
		doExpand=False
		self.textPlace.pack_start(scrolledwindow, fill = True, expand = True)
		# /SEE textarea
		
		# SEE display:inline; text-align:left
		self.menubar.pack_start(self.menuButton, False, False, 0)
		self.menubar.pack_start(self.menuButton2, False, False, 0)

		#SEE build VLayout
		self.vbox.pack_start(self.menubar, False, False, 0)
		self.vbox.pack_start(self.textPlace, fill = True, expand = True)
		self.vbox.pack_start(self.buttons, False, False, 0)
		
		window.connect('delete-event', gtk.main_quit)

	#    test_number_grid()
	#    reproduce_foobared_rendering()
		#test_sudoku_game()
		window.show_all()
		gtk.main()

	def on_button_clicked(self, widget):
		#print("Hello World")
		#self.label.set_label("OK!")
		#self.label.set_angle(self.label.get_angle() + 25)
		widget = gtk.Button
		print(dir(widget.props))


if __name__ == '__main__':
    app = MyApp()
