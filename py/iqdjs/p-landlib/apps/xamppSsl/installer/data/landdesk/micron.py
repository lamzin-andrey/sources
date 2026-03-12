# It danger! While...

from php import *

def v(_input, val=""):
	r = ""
	try:
		if strpos(_input.__class__, "<class 'gi.repository.Gtk.TextView'>") == 0:
			textbuffer = _input.get_buffer()
			if val != "":
				textbuffer.set_text(val)
			start = textbuffer.get_iter_at_offset(0);
			end = textbuffer.get_char_count();
			endo = textbuffer.get_iter_at_offset(end);
			r = textbuffer.get_text(start, endo, True);
		if strpos(_input.__class__, "<class 'gi.overrides.Gtk.Label'>") == 0:
			if val != "":
				_input.set_label(val)
			r = _input.get_label()
	except:
		r = ""
	return r
	
def attr(_input, name, val=""):
	r = ""
	dis = "disabled"
	try:
		if strpos(_input.__class__, "<class 'gi.overrides.Gtk.Button'>") == 0:
			if name == dis and val == dis:
				_input.set_sensitive(False)
				r = dis
			if name == dis and val != dis:
				_input.set_sensitive(True)
				r = ""
			if name == dis and val == "":
				v = _input.is_sensitive()
				if v == True:
					r = ""
				else:
					r = dis
		if strpos(_input.__class__, "<class 'gi.repository.Gtk.TextView'>") == 0:
			if name == dis and val == dis:
				_input.set_editable(False)
				r = dis
			if name == dis and val != dis:
				_input.set_editable(True)
				r = ""
			if name == dis and val == "":
				v = _input.is_sensitive()
				if v == True:
					r = ""
				else:
					r = dis
	except:
		r = ""
	return r
	
def iDisable(_input):
	d = "disabled"
	attr(_input, d, d)

def iEnable(_input):
	d = "disabled"
	attr(_input, d, " ")
