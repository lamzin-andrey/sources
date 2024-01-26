import os

class CApp:
        
    def dir(self):
        return os.path.dirname(os.path.abspath(__file__))
        
App = CApp()
             
