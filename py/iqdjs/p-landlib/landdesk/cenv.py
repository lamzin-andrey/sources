import subprocess

class CEnv:
    def dexec(self, command):
      p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
      _out = "";
      for line in p.stdout.readlines():
        _out = out + line
      retval = p.wait()
      return _out

Env = CEnv()
             
