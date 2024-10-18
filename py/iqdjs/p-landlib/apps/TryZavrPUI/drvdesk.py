
# python3 

import sys
sys.path.append("/opt/p-landlib/landdesk")
from IQdjs import *

import threading

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
        
        self.button = Gtk.Button(label="Generate")
        self.button.connect("clicked", self.onClickGenerate)
        
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
        
        
        # SEE text label align left - input for prompt
        self.textAreaLabel = Gtk.Box(spacing=0)
        self.textAreaLabelObj = Gtk.Label(label="Prompt for StableDiffusion", margin_top=10, margin_bottom=10)
        self.textAreaLabel.pack_start(self.textAreaLabelObj, False, False, 0)        
        
        # SEE textarea - input for prompt
        scrolledwindow = Gtk.ScrolledWindow()
        scrolledwindow.set_hexpand(True)
        scrolledwindow.set_vexpand(True)
        self.textview = Gtk.TextView()
        
        self.textbuffer = self.textview.get_buffer()
        scrolledwindow.add(self.textview)
        fillSpace=True
        doExpand=False
        self.textPlace.pack_start(scrolledwindow, doExpand, fillSpace, 0)
        # /SEE textarea
        
        # SEE text label align left - output for SDiff
        self.outputLabel = Gtk.Box(spacing=0)
        self.outputLabelObj = Gtk.Label(label="Output:", margin_top=10, margin_bottom=10, height_request=100)
        self.outputLabel.pack_start(self.outputLabelObj, False, False, 0)
        
        #  - output for SDiff with scrollbar
        self.textPlace2 = Gtk.Box(spacing=0)
        self.outputLabelMstr = Gtk.Label(label="", margin_top=10, margin_bottom=10, height_request=50)
        self.outputLabelMstr.set_xalign(0.0)
        #self.textPlace2.pack_start(self.outputLabelMstr, False, False, 0)
        
        scrolledwindow2 = Gtk.ScrolledWindow(height_request=70)
        scrolledwindow2.set_hexpand(True)
        scrolledwindow2.set_vexpand(True)
        scrolledwindow2.add(self.outputLabelMstr)
        
        fillSpace=True
        doExpand=True
        self.textPlace2.pack_start(scrolledwindow2, doExpand, fillSpace, 0)
        # 
        
        
        # SEE display:inline; text-align:left
        self.menubar.pack_start(self.menuButton, False, False, 0)
        self.menubar.pack_start(self.menuButton2, False, False, 0)
        
        #SEE build VLayout
        #self.vbox.pack_start(self.menubar, False, False, 0)
        self.vbox.pack_start(self.textAreaLabel, False, False, 0)
        self.vbox.pack_start(self.textPlace, False, True, 0)
        self.vbox.pack_start(self.outputLabel, False, True, 0)
        self.vbox.pack_start(self.textPlace2, False, True, 0)
        self.vbox.pack_start(self.buttons, False, False, 0)
        
        
        
        #self.label = Gtk.Label()
        #self.label.set_label("Hello World")
        #self.label.set_angle(25)
        #self.label.set_halign(Gtk.Align.END)
        #self.add(self.label)
        
        
        

    def onClickGenerate(self, widget):
        #self.label.set_label("OK!")
        #self.label.set_angle(self.label.get_angle() + 25)
        
        #widget = Gtk.Image
        #print(dir(widget.props))
        #self.n = 0;
        
        prompt = v(self.textview)
        self.setText(prompt);
        
        self.tickStop = 0;
        self.ival = setInterval(self.onTick, 3);
        
        
        command2 = "time python3 " + App.dir() + "/stable-diffusion/tryZavr.py \"" + prompt + "\" > " + App.dir() + "/stable-diffusion/log.log 2>&1 &";
        Env.dexec(command2);
        
        
    
    def setText(self, s):
        v(self.outputLabelMstr, s)
    
    def onTick(self):
        if self.tickStop == 1:
            return;
        c = FS.readfile(App.dir() + "/stable-diffusion/log.log");
        if strpos(c, "Done!") != -1:
            self.tickStop = 1
            SI.timer.cancel()
            Env.dexec("xdg-open " + App.dir() + "/0T2.jpg")
        
        a = explode("\n", c)
        sz = count(a);
        s = ""
        i = sz - 4
        if i <  0:
            i = 0

        countPct = 0
        percentStr = ""
        while i < sz:
            s += a[i] + "\n";
            if strpos(a[i], "%|", 0) != -1 or a[i].strip() == "":
                countPct += 1;
            if strpos(a[i], "%|", 0) != -1:
                percentStr = a[i]
            i += 1
        if countPct == 4:
            s = a[sz - 1]
        if percentStr != "":
            s = percentStr
            percentStr = ""
        
        try:
            win.setText(s)
        except:
            FS.writefile(App.dir() + "/stable-diffusion/log.log", "")
        


win = MyWindow()
win.connect("destroy", Gtk.main_quit)
MW.setWindow(win, __file__);
MW.moveTo(100, 10);
MW.resizeTo(600, 100);
MW.setTitle("Stable Diffusion UI - WC Group");

#MW.maximize();




#win.setText(App.dir());
win.show_all()
Gtk.main()
