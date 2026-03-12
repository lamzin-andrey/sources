import subprocess
import threading
import gi
#from gi.repository import Gtk, Gdk, GdkPixbuf, Pango
from gi.repository import Gdk

class CEnv:
    def dexec(self, command):
      p = subprocess.Popen(command, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
      _out = "";
      for line in p.stdout.readlines():
        _out = out + line
      retval = p.wait()
      return _out
      
    def exec(self, shellFile, onFinishExecute, onStdOut, onStdErr):
        def run_script():
            try:
                process = subprocess.Popen(
                    ['bash', shellFile],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                
                outputLines = ""
                errLines    = ""
                for line in process.stdout:
                    outputLines += line + "\n";
                for line in process.stderr:
                    errLines += line + "\n";
                if len(errLines):
                    onStdErr(errLines)
                
                process.wait()
                
                #вызываем callback
                #Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, process.returncode)
                Gdk.threads_add_idle(0, onFinishExecute, outputLines, errLines)
                
            except Exception as err:				
                #print(f"Ошибка выполнения: {str(err)}")
                #Gdk.threads_add_idle(0, self.on_script_finished, onFinishExecute, 1)
                errLines = str(err)
                for line in process.stderr:
                    errLines += line + "\n";
                Gdk.threads_add_idle(0, onFinishExecute, "", errLines)
        
        # Запускаем в отдельном потоке
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()

Env = CEnv()
             
