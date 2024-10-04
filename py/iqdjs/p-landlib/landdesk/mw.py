from cap import App

class CMw:
        
    def moveTo(self, x, y):
        self.wnd.move(x, y)
    def resizeTo(self, w, h):
        self.wnd.set_default_size(w, h)
        self.wnd.set_property("width_request", w)
        self.wnd.set_property("height_request", h)
    def setTitle(self, s):
        self.wnd.set_title(s)
    def setIconImage(self, s):
        self.wnd.set_icon_from_file(s)
    def maximize(self):
        self.wnd.set_resizable(True)
        self.wnd.maximize()

    def setWindow(self, w, defaultPath):
        self.wnd = w
        App.defaultPath = defaultPath
        
MW = CMw()
             
