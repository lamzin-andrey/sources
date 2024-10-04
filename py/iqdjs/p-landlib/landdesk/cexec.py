import os
import sys

class CApp:
    def dir(self):
      return os.path.dirname(os.path.abspath(__file__))
    def getArgs(self):
      return sys.argv
        
App = CApp()
             
