
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
        
        self.subdir = "helsinki-nlp"
        
        self.set_default_size(800, 600)
        #self.set_resizable(False)
                
        #self.move(100, 10);
        self.set_icon_from_file("48.png")
        self.get_style_context().add_class('red')
        self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        
        #SEE: Change background without css
        # AttributeError: 'gi.repository.Gtk' object has no attribute 'STATE_NORMAL'
        #self.vbox.modify_bg(0, Gdk.color_parse("#EFE9D6"))
        
        self.add(self.vbox)
        self.buttons = Gtk.Box(spacing=6,margin_top=16)
        
        self.button = Gtk.Button(label="Translate")
        self.button.connect("clicked", self.onClickTranslate)
        
        self.statusLabel = Gtk.Box(spacing=0)
        self.statusLabelObj = Gtk.Label(label="", margin_top=10, margin_bottom=10)
        self.statusLabel.pack_start(self.statusLabelObj, False, False, 0)
        
        self.translateDirectLabel = Gtk.Box(spacing=0)
        self.translateDirectLabelObj = Gtk.Label(label="Ru -> En", margin_top=10, margin_bottom=10)
        self.translateDirectLabel.pack_start(self.translateDirectLabelObj, False, False, 0)        
        
        self.bChangeTranslateDirect = Gtk.Button(label="Change language")
        self.bChangeTranslateDirect.connect("clicked", self.onClickChangeDirect)
                
        # SEE display:inline; text-align:right
        self.spacer = Gtk.Box(spacing=0)
        self.buttons.pack_start(self.spacer, True, True, 0)
        self.buttons.pack_start(self.statusLabel, False, False, 0)
        self.buttons.pack_start(self.translateDirectLabel, False, False, 0)
        self.buttons.pack_start(self.bChangeTranslateDirect, False, False, 0)
        self.buttons.pack_start(self.button, False, False, 0)
                
        # SEE text label align left - input for prompt
        self.inputTextPlace = Gtk.Box(spacing=0)
        self.inputTextAreaLabel = Gtk.Box(spacing=0)
        self.inputTextAreaLabelObj = Gtk.Label(label="Ru", margin_top=10, margin_bottom=10)
        self.inputTextAreaLabel.pack_start(self.inputTextAreaLabelObj, False, False, 0)        
        
        # SEE textarea - input for prompt
        swInputMemo = Gtk.ScrolledWindow()
        swInputMemo.set_hexpand(True)
        swInputMemo.set_vexpand(True)
        self.inputMemo = Gtk.TextView()
        #self.textbuffer = self.inputMemo.get_buffer()
        swInputMemo.add(self.inputMemo)
        fillSpace=True
        doExpand=False
        self.inputTextPlace.pack_start(swInputMemo, doExpand, fillSpace, 0)
        # /SEE textarea
        
        # text label align left - result
        self.outputTextAreaLabel = Gtk.Box(spacing=0)
        self.outputTextAreaLabelObj = Gtk.Label(label="En", margin_top=10, margin_bottom=10)
        self.outputTextAreaLabel.pack_start(self.outputTextAreaLabelObj, False, False, 0)
        
        # textarea - result
        self.outputTextPlace = Gtk.Box(spacing=0)
        swOutputMemo = Gtk.ScrolledWindow()
        swOutputMemo.set_hexpand(True)
        swOutputMemo.set_vexpand(True)
        self.outputMemo = Gtk.TextView()
        #self.textbuffer2 = self.inputMemo.get_buffer()
        swOutputMemo.add(self.outputMemo)
        fillSpace=True
        doExpand=False
        self.outputTextPlace.pack_start(swOutputMemo, doExpand, fillSpace, 0)
        # /SEE textarea
         
        
        #SEE build VLayout
        #self.vbox.pack_start(self.menubar, False, False, 0)
        self.vbox.pack_start(self.inputTextAreaLabel, False, False, 0)
        self.vbox.pack_start(self.inputTextPlace, False, True, 0)
        self.vbox.pack_start(self.outputTextAreaLabel, False, True, 0)
        self.vbox.pack_start(self.outputTextPlace, False, True, 0)
        self.vbox.pack_start(self.buttons, False, False, 0)
        
        
        
        #self.label = Gtk.Label()
        #self.label.set_label("Hello World")
        #self.label.set_angle(25)
        #self.label.set_halign(Gtk.Align.END)
        #self.add(self.label)
    
    def onClickTranslate(self, widget):
        #self.label.set_angle(self.label.get_angle() + 25)
        v(self.statusLabelObj, "I think...")
        current = v(self.inputTextAreaLabelObj)
        script = "ruen.py"
        if current == "En":
            script = "enru.py"
        prompt = v(self.inputMemo)
        self.tickStop = 0;
        self.ival = setInterval(self.onTick, 3);
        command2 = "time python3 " + App.dir() + f"/{self.subdir}/{script} \"" + prompt + "\" > " + App.dir() + f"/{self.subdir}/log.log 2>&1 &";
        iDisable(self.button)
        iDisable(self.bChangeTranslateDirect)
        iDisable(self.inputMemo)
        iDisable(self.outputMemo)
        Env.dexec(command2);
        
        #test
    def onClickChangeDirect(self, widget):
        current = v(self.inputTextAreaLabelObj)
        if current == "Ru":
            v(self.inputTextAreaLabelObj, "En")
            v(self.outputTextAreaLabelObj, "Ru")
            v(self.translateDirectLabelObj, "En -> Ru")
        else:
            v(self.inputTextAreaLabelObj, "Ru")
            v(self.outputTextAreaLabelObj, "En")
            v(self.translateDirectLabelObj, "Ru -> En")
        v(self.statusLabelObj, "Changed")
    
    
    def onTick(self):
        if self.tickStop == 1:
            return;
        logFile = App.dir() + f"/{self.subdir}/log.log"
        c = FS.readfile(App.dir() + f"/{self.subdir}/log.log");
        
        if strpos(c, "HNLPResultOutput:") != -1:
            v(self.statusLabelObj, " ")
            self.tickStop = 1
            clearInterval(self.ival)
            SI.timer.cancel()
            SI.timer = 0
            iEnable(self.button)
            iEnable(self.bChangeTranslateDirect)
            iEnable(self.inputMemo)
            iEnable(self.outputMemo)
            
            a = explode("HNLPResultOutput:", c)
            
            if count(a) > 0:
                a = explode("/HNLPResultOutput", a[1])
                v(self.outputMemo, a[0])
                
                if count(a) > 0:
                    a = explode("system", a[1])
                    if count(a) > 0:
                        a = explode("elapsed", a[1])
                        v(self.statusLabelObj, a[0])
            else:
                v(self.outputMemo, "Что-то пошло не так")


win = MyWindow()
win.connect("destroy", Gtk.main_quit)
MW.setWindow(win, __file__);
MW.moveTo(100, 10);
MW.resizeTo(600, 100);
MW.setTitle("Like Prompt Family ;)");

#MW.maximize();


win.show_all()
Gtk.main()
