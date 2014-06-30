class Object < BasicObject
  include Kernel

  ARGF = ARGF
  ARGV = []
  ArgumentError = ArgumentError
  Array = Array
  BasicObject = BasicObject
  Bignum = Bignum
  Binding = Binding
  CROSS_COMPILING = nil
  Class = Class
  Comparable = Comparable
  Complex = Complex
  Config = RbConfig
  Data = Data
  Date = Date
  DateTime = DateTime
  Dir = Dir
  ENV = {"SHLVL"=>"1", "SSH_AGENT_PID"=>"1654", "_system_arch"=>"i386", "XCURSOR_SIZE"=>"0", "_system_name"=>"Mint", "rvm_version"=>"1.25.22 (stable)", "SESSION_MANAGER"=>"local/andrey-SD:@/tmp/.ICE-unix/1896,unix/andrey-SD:/tmp/.ICE-unix/1896", "XDG_SESSION_COOKIE"=>"74ce4995a793ad78f2fa380c00000011-1397663357.124065-332676311", "XDG_DATA_DIRS"=>"/usr/share/default:/usr/local/share/:/usr/share/", "MANDATORY_PATH"=>"/usr/share/gconf/default.mandatory.path", "PWD"=>"/home/andrey", "XCURSOR_THEME"=>"oxy-white", "rvm_prefix"=>"/home/andrey", "LOGNAME"=>"andrey", "GPG_AGENT_INFO"=>"/tmp/gpg-vxIJZM/S.gpg-agent:1655:1", "QT_PLUGIN_PATH"=>"/home/andrey/.kde/lib/kde4/plugins/:/usr/lib/kde4/plugins/", "KDE_SESSION_VERSION"=>"4", "SSH_AUTH_SOCK"=>"/tmp/ssh-iYQzzgvm1502/agent.1502", "GS_LIB"=>"/home/andrey/.fonts", "DM_CONTROL"=>"/var/run/xdmctl", "LD_LIBRARY_PATH"=>"/usr/lib/jvm/java-7-openjdk-i386/jre/lib/i386/client:/usr/lib/jvm/java-7-openjdk-i386/jre/lib/i386:", "KDE_MULTIHEAD"=>"false", "LIBGL_DRIVERS_PATH"=>"/usr/lib/fglrx/dri", "SHELL"=>"/bin/bash", "DBUS_SESSION_BUS_ADDRESS"=>"unix:abstract=/tmp/dbus-v4Nm3SRoDY,guid=4e64d9864215f057c0e7ca7000000013", "rvm_bin_path"=>"/home/andrey/.rvm/bin", "_system_type"=>"Linux", "GTK_RC_FILES"=>"/etc/gtk/gtkrc:/home/andrey/.gtkrc:/home/andrey/.kde/share/config/gtkrc", "GTK2_RC_FILES"=>"/etc/gtk-2.0/gtkrc:/home/andrey/.gtkrc-2.0:/home/andrey/.gtkrc-2.0-kde4:/home/andrey/.kde/share/config/gtkrc-2.0", "XDM_MANAGED"=>"method=classic,auto", "XDG_CONFIG_DIRS"=>"/etc/xdg/xdg-default:/etc/xdg", "PATH"=>"/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/bin:/usr/local/bin:/home/andrey/.rvm/bin", "KDE_SESSION_UID"=>"1000", "DESKTOP_SESSION"=>"default", "APTANA_VERSION"=>"3.4.2.1368863613", "KDE_FULL_SESSION"=>"true", "DISPLAY"=>":0", "USER"=>"andrey", "HOME"=>"/home/andrey", "rvm_path"=>"/home/andrey/.rvm", "_system_version"=>"13", "WINDOWPATH"=>"7", "rvm_delete_flag"=>"0", "rvm_ruby_string"=>"system", "DEFAULTS_PATH"=>"/usr/share/gconf/default.default.path", "LANG"=>"ru_RU.UTF-8"}
  EOFError = EOFError
  Encoding = Encoding
  EncodingError = EncodingError
  Enumerable = Enumerable
  Enumerator = Enumerator
  Errno = Errno
  Etc = Etc
  Exception = Exception
  FALSE = false
  FalseClass = FalseClass
  Fiber = Fiber
  FiberError = FiberError
  File = File
  FileTest = FileTest
  FileUtils = FileUtils
  Fixnum = Fixnum
  Float = Float
  FloatDomainError = FloatDomainError
  GC = GC
  Gem = Gem
  Hash = Hash
  IO = IO
  IOError = IOError
  IndexError = IndexError
  Integer = Integer
  Interrupt = Interrupt
  Kernel = Kernel
  KeyError = KeyError
  LoadError = LoadError
  LocalJumpError = LocalJumpError
  Marshal = Marshal
  MatchData = MatchData
  Math = Math
  Method = Method
  Module = Module
  Mutex = Mutex
  NIL = nil
  NameError = NameError
  NilClass = NilClass
  NoMemoryError = NoMemoryError
  NoMethodError = NoMethodError
  NotImplementedError = NotImplementedError
  Numeric = Numeric
  OUTPUT_PATH = "/home/andrey/programs/my/Ruby/onrails/.metadata/.plugins/com.aptana.ruby.core/946270705/4/"
  Object = Object
  ObjectSpace = ObjectSpace
  Proc = Proc
  Process = Process
  Psych = Psych
  RUBY_COPYRIGHT = "ruby - Copyright (C) 1993-2011 Yukihiro Matsumoto"
  RUBY_DESCRIPTION = "ruby 1.9.3p0 (2011-10-30 revision 33570) [i686-linux]"
  RUBY_ENGINE = "ruby"
  RUBY_PATCHLEVEL = 0
  RUBY_PLATFORM = "i686-linux"
  RUBY_RELEASE_DATE = "2011-10-30"
  RUBY_REVISION = 33570
  RUBY_VERSION = "1.9.3"
  Random = Random
  Range = Range
  RangeError = RangeError
  Rational = Rational
  RbConfig = RbConfig
  Regexp = Regexp
  RegexpError = RegexpError
  RubyVM = RubyVM
  RuntimeError = RuntimeError
  STDERR = IO.new
  STDIN = IO.new
  STDOUT = IO.new
  ScanError = StringScanner::Error
  ScriptError = ScriptError
  SecurityError = SecurityError
  Signal = Signal
  SignalException = SignalException
  StandardError = StandardError
  StopIteration = StopIteration
  String = String
  StringIO = StringIO
  StringScanner = StringScanner
  Struct = Struct
  Syck = Syck
  Symbol = Symbol
  SyntaxError = SyntaxError
  SystemCallError = SystemCallError
  SystemExit = SystemExit
  SystemStackError = SystemStackError
  TOPLEVEL_BINDING = #<Binding:0x904a070>
  TRUE = true
  TSort = TSort
  Thread = Thread
  ThreadError = ThreadError
  ThreadGroup = ThreadGroup
  Time = Time
  TrueClass = TrueClass
  TypeError = TypeError
  URI = URI
  UnboundMethod = UnboundMethod
  YAML = Psych
  ZeroDivisionError = ZeroDivisionError
  Zlib = Zlib

  def self.yaml_tag(arg0)
  end


  def psych_to_yaml(arg0, arg1, *rest)
  end

  def to_yaml(arg0, arg1, *rest)
  end

  def to_yaml_properties
  end


  protected


  private

  def dir_names(arg0)
  end

  def file_name(arg0)
  end

  def get_classes
  end

  def grab_instance_method(arg0, arg1)
  end

  def print_args(arg0)
  end

  def print_instance_method(arg0, arg1)
  end

  def print_method(arg0, arg1, arg2, arg3, arg4, *rest)
  end

  def print_type(arg0)
  end

  def print_value(arg0)
  end

end
