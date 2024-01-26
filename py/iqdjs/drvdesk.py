# python3 
from IQdjs import *

import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk
from gi.repository import Gdk


# See Load Style
css_provider = Gtk.CssProvider()
css_provider.load_from_path('app.css')
Gtk.StyleContext.add_provider_for_screen(
    Gdk.Screen.get_default(),
    css_provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
)


class MyWindow(Gtk.Window):
    def __init__(self):
        super().__init__(title="Hello World")
        self.set_default_size(800, 600)
        self.set_resizable(False)
                
        #self.move(100, 10);
        self.set_icon_from_file("48.png")
        self.get_style_context().add_class('red')
        self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        
        #SEE: Change background without css
        # AttributeError: 'gi.repository.Gtk' object has no attribute 'STATE_NORMAL'
        #self.vbox.modify_bg(0, Gdk.color_parse("#EFE9D6"))
        
        self.add(self.vbox)
        self.buttons = Gtk.Box(spacing=6,margin_top=16)
        self.menubar = Gtk.Box(spacing=0)
        self.textPlace = Gtk.Box(spacing=0)
        
        self.button = Gtk.Button(label="Click Here Click Here Click Here Click Here ")
        self.button.connect("clicked", self.on_button_clicked)
        self.button2 = Gtk.Button(label="button2", margin_top=0, margin_right=0, margin_left=0)
        #self.button2.connect("clicked", self.on_button_clicked)
        
        self.menuButton = Gtk.Button(label="", margin_top=0, margin_right=0, margin_left=0, height_request=24)
        #image = Gtk.Image(icon_size=Gtk.IconSize.DIALOG)
        image = Gtk.Image()
        image.set_from_file("24.png")
        self.menuButton.set_image(image)
        self.menuButton2 = Gtk.Button(label="Delete", margin_top=0, margin_right=0, margin_left=0, height_request=24)
        
                
        # SEE display:inline; text-align:right
        self.spacer = Gtk.Box(spacing=0)
        self.buttons.pack_start(self.spacer, True, True, 0)
        self.buttons.pack_start(self.button, False, False, 0)
        self.buttons.pack_start(self.button2, False, False, 0)
        
        # SEE textarea
        scrolledwindow = Gtk.ScrolledWindow()
        scrolledwindow.set_hexpand(True)
        scrolledwindow.set_vexpand(True)
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
        self.textPlace.pack_start(scrolledwindow, doExpand, fillSpace, 0)
        # /SEE textarea
        
        
        # SEE display:inline; text-align:left
        self.menubar.pack_start(self.menuButton, False, False, 0)
        self.menubar.pack_start(self.menuButton2, False, False, 0)
        
        #SEE build VLayout
        self.vbox.pack_start(self.menubar, False, False, 0)
        self.vbox.pack_start(self.textPlace, False, True, 0)
        self.vbox.pack_start(self.buttons, False, False, 0)
        
        
        
        #self.label = Gtk.Label()
        #self.label.set_label("Hello World")
        #self.label.set_angle(25)
        #self.label.set_halign(Gtk.Align.END)
        #self.add(self.label)
        
        
        

    def on_button_clicked(self, widget):
        #print("Hello World")
        #self.label.set_label("OK!")
        #self.label.set_angle(self.label.get_angle() + 25)
        widget = Gtk.Image
        print(dir(widget.props))
    
    def setText(self, s):
        self.textbuffer.set_text(s)


win = MyWindow()
win.connect("destroy", Gtk.main_quit)
MW.setWindow(win);
MW.moveTo(100, 10);
MW.resizeTo(100, 100);
MW.setTitle("Пррви!");

#MW.maximize();




win.setText(App.dir());
win.show_all()
Gtk.main()
