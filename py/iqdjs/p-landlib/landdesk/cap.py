import os
import sys

class CApp:
    def dir(self, _file=""):
      if _file == "":
        _file = self.defaultPath
      if _file == "":
        _file = __file__
      return os.path.dirname(os.path.abspath(_file))
    def getArgs(self):
      return sys.argv
        
App = CApp()
             
