#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import subprocess
import threading
import re

try:
    import pygtk
    pygtk.require('2.0')
    import gtk
    import gobject
except ImportError:
    print("GTK not available")
    sys.exit(1)

# Constants
HEADER_SIZE = 12
TEXT_SIZE = 12
DEFAULT_HEADER = "Welcome to Your App Setup Wizard"
DEFAULT_TEXT = "This will install YourApp 1.0.0 on your computer\n\nClick Next to continue or Cancel to exit Setup."
DEFAULT_PREV_TEXT = "Previous"
DEFAULT_NEXT_TEXT = "Next"
DEFAULT_CANCEL_TEXT = "Cancel"
STEP = 0

# Handlers (at the beginning of file)
def onClicPrev(button):
    print("Previous button clicked")

def onClickNext(button):
    print("Next button clicked")

def onClickCancel(button):
    print("Cancel button clicked")
    gtk.main_quit()

def onCreate():
    print("Window created - initialization code here")

class InstallerApp:
    def __init__(self):
        self.window = gtk.Window(gtk.WINDOW_TOPLEVEL)
        self.window.set_title("Installer")
        self.window.set_resizable(False)
        self.window.set_size_request(500, 356)
        
        # Set icon
        app_dir = self.getAppDir()
        ico_path = os.path.join(app_dir, "data", "i", "nstaller", "ico.png")
        if os.path.exists(ico_path):
            self.window.set_icon_from_file(ico_path)
        
        # Main container
        main_box = gtk.VBox(False, 0)
        self.window.add(main_box)
        
        # Area B (top part)
        self.area_b = gtk.HBox(False, 0)
        self.area_b.set_size_request(500, 315)
        main_box.pack_start(self.area_b, True, True, 0)
        
        # Left part of area B - image
        self.image_area = gtk.VBox(False, 0)
        self.image_area.set_size_request(166, 315)
        self.area_b.pack_start(self.image_area, False, False, 0)
        
        # Load image
        promo_path = os.path.join(app_dir, "data", "i", "nstaller", "promo.png")
        self.setMainImage(promo_path)
        
        # Right part of area B - text
        self.text_area = gtk.VBox(False, 0)
        self.text_area.set_size_request(334, 315)
        self.area_b.pack_start(self.text_area, True, True, 0)
        
        # Create scrollable area for text
        scrolled_window = gtk.ScrolledWindow()
        scrolled_window.set_policy(gtk.POLICY_AUTOMATIC, gtk.POLICY_AUTOMATIC)
        self.text_area.pack_start(scrolled_window, True, True, 0)
        
        # Text area
        self.text_view = gtk.TextView()
        self.text_view.set_editable(False)
        self.text_view.set_cursor_visible(False)
        self.text_view.set_wrap_mode(gtk.WRAP_WORD)
        self.text_view.set_left_margin(12)
        self.text_view.set_right_margin(12)
        scrolled_window.add(self.text_view)
        
        # Set white background
        white_color = gtk.gdk.color_parse("white")
        self.text_view.modify_base(gtk.STATE_NORMAL, white_color)
        
        # Get text buffer
        self.text_buffer = self.text_view.get_buffer()
        
        # Area G (bottom part with buttons)
        self.area_g = gtk.HBox(False, 0)
        self.area_g.set_size_request(500, 41)
        bg_color = gtk.gdk.color_parse("#ECE9D8")
        self.area_g.modify_bg(gtk.STATE_NORMAL, bg_color)
        main_box.pack_start(self.area_g, False, False, 0)
        
        # Create button container (right aligned)
        button_box = gtk.HBox(False, 15)
        button_box.set_border_width(14)
        self.area_g.pack_end(button_box, False, False, 0)
        
        # Create buttons
        self.btn_prev = self.create_button(DEFAULT_PREV_TEXT, onClicPrev)
        self.btn_next = self.create_button(DEFAULT_NEXT_TEXT, onClickNext)
        self.btn_cancel = self.create_button(DEFAULT_CANCEL_TEXT, onClickCancel)
        
        # Add buttons to container
        button_box.pack_start(self.btn_prev, False, False, 0)
        button_box.pack_start(self.btn_next, False, False, 0)
        button_box.pack_end(self.btn_cancel, False, False, 0)
        
        # Hide Previous button at startup
        self.btn_prev.hide()
        
        # Set initial text
        self.setText(DEFAULT_HEADER, DEFAULT_TEXT)
        
        self.window.connect("destroy", gtk.main_quit)
        
        # Delayed onCreate call
        gobject.timeout_add(100, self.delayed_onCreate)
    
    def delayed_onCreate(self):
        onCreate()
        return False
    
    def create_button(self, text, handler):
        button = gtk.Button(text)
        button.connect("clicked", handler)
        
        # Set button style
        bg_color = gtk.gdk.color_parse("#F4F4F0")
        text_color = gtk.gdk.color_parse("black")
        border_color = gtk.gdk.color_parse("#878FB0")
        
        button.modify_bg(gtk.STATE_NORMAL, bg_color)
        button.modify_fg(gtk.STATE_NORMAL, text_color)
        
        return button
    
    def setText(self, header, content):
        # Format text with header and content
        full_text = header + "\n\n" + content
        
        # Set plain text
        self.text_buffer.set_text(full_text)
    
    def modBtn(self, id, text=None, hide=None):
        button = None
        if id == "p":
            button = self.btn_prev
        elif id == "n":
            button = self.btn_next
        elif id == "c":
            button = self.btn_cancel
        
        if button:
            if text is not None and text != "":
                button.set_label(text)
            if hide is not None:
                if hide == 0:
                    button.hide()
                elif hide == 1:
                    button.show()
    
    def set_buttons_sensitive(self, sensitive):
        self.btn_prev.set_sensitive(sensitive)
        self.btn_next.set_sensitive(sensitive)
        self.btn_cancel.set_sensitive(sensitive)
    
    def getUser(self):
        return os.getenv('USER', '')
    
    def getHome(self):
        return os.getenv('HOME', '')
    
    def createDir(self, path):
        os.makedirs(path, exist_ok=True)
    
    def getAppDir(self):
        return os.path.dirname(os.path.abspath(__file__))
    
    def exec(self, shellFile, onFinishExecute):
        # Disable buttons during execution
        self.set_buttons_sensitive(False)
        
        # Save current header
        start_iter = self.text_buffer.get_start_iter()
        end_iter = self.text_buffer.get_end_iter()
        current_text = self.text_buffer.get_text(start_iter, end_iter, False)
        lines = current_text.split('\n')
        self.current_header = lines[0] if lines else DEFAULT_HEADER
        
        self.last_output = []
        self.exec_process = None

        def run_script():
            try:
                self.exec_process = subprocess.Popen(
                    ['bash', shellFile],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True
                )
                
                # Read output
                while True:
                    line = self.exec_process.stdout.readline()
                    if not line:
                        break
                    self.last_output.append(line.strip())
                    if len(self.last_output) > 20:
                        self.last_output.pop(0)
                
                return_code = self.exec_process.wait()
                
                gobject.idle_add(self.on_script_finished, onFinishExecute, return_code)
                
            except Exception as e:
                self.last_output.append("Error: " + str(e))
                gobject.idle_add(self.on_script_finished, onFinishExecute, 1)
        
        # Start timer for periodic updates
        gobject.timeout_add(1000, self.update_exec_display)
        
        # Start script in separate thread
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()
    
    def update_exec_display(self):
        """Update output display every second"""
        if hasattr(self, 'exec_process') and self.exec_process:
            if self.exec_process.poll() is None:
                # Process still running, update text
                display_text = "Installation in progress:\n\n" + "\n".join(self.last_output[-8:])
                self.update_exec_text(display_text)
                return True  # Continue timer
        return False  # Stop timer
    
    def update_exec_text(self, content):
        """Update text during execution"""
        self.setText(self.current_header, content)
        return False
    
    def on_script_finished(self, onFinishExecute, returncode):
        self.set_buttons_sensitive(True)
        if onFinishExecute:
            onFinishExecute(returncode)
        return False
    
    def writeFile(self, filePath, text):
        try:
            with open(filePath, 'w') as f:
                f.write(text)
            return True
        except Exception as e:
            print("File write error: " + str(e))
            return False
    
    def readFile(self, filePath):
        try:
            with open(filePath, 'r') as f:
                return f.read()
        except Exception as e:
            print("File read error: " + str(e))
            return None
    
    def setMainImage(self, filePath):
        # Clear image area
        for child in self.image_area.get_children():
            self.image_area.remove(child)
        
        if os.path.exists(filePath):
            try:
                pixbuf = gtk.gdk.pixbuf_new_from_file_at_size(filePath, 166, 315)
                image = gtk.Image()
                image.set_from_pixbuf(pixbuf)
                self.image_area.pack_start(image, True, True, 0)
                image.show()
            except Exception as e:
                print("Image load error: " + str(e))
                # Create placeholder if image failed to load
                label = gtk.Label("Image\nnot found")
                self.image_area.pack_start(label, True, True, 0)
                label.show()
        else:
            label = gtk.Label("Image\nnot found")
            self.image_area.pack_start(label, True, True, 0)
            label.show()
    
    def checkLinuxInt(self):
        """Determine OS bitness"""
        try:
            result = subprocess.Popen(['uname', '-m'], stdout=subprocess.PIPE)
            output = result.communicate()[0]
            arch = output.strip()
            if '64' in arch:
                return 64
            else:
                return 32
        except:
            return 64  # Assume 64-bit by default
    
    def checkWine32(self):
        """Check 32-bit Wine availability"""
        try:
            result = subprocess.Popen(['wine', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            output, error = result.communicate()
            if result.returncode == 0:
                return True
            return False
        except:
            return False
    
    def checkWine64(self):
        """Check 64-bit Wine availability"""
        try:
            env = os.environ.copy()
            env['WINEARCH'] = 'win64'
            result = subprocess.Popen(['wine', '--version'], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            output, error = result.communicate()
            if result.returncode == 0:
                return True
            return False
        except:
            return False
    
    def getRAM(self, in_bytes=False):
        """Return RAM size"""
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = f.read()
            
            # Find total memory
            match = re.search(r'MemTotal:\s+(\d+)\s+kB', meminfo)
            if match:
                kb = int(match.group(1))
                bytes_value = kb * 1024
                
                if in_bytes:
                    return bytes_value
                else:
                    # Convert to human readable format
                    if bytes_value >= 1024**3:  # GB
                        return "%.1f Gb" % (bytes_value / (1024**3))
                    elif bytes_value >= 1024**2:  # MB
                        return "%.1f Mb" % (bytes_value / (1024**2))
                    else:  # KB
                        return "%.1f Kb" % (bytes_value / 1024)
            return "Unknown"
        except:
            return "Unknown"
    
    def getCPUName(self):
        """Return human readable CPU name"""
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
            
            # Find processor model
            model_match = re.search(r'model name\s*:\s*(.+)', cpuinfo)
            if model_match:
                cpu_name = model_match.group(1).strip()
                
                # Simplify name (remove extra information)
                cpu_name = re.sub(r'\(R\)|\(TM\)|@', '', cpu_name)
                cpu_name = re.sub(r'\s+', ' ', cpu_name).strip()
                
                return cpu_name
            return "Unknown CPU"
        except:
            return "Unknown CPU"
    
    def run(self):
        self.window.show_all()
        gtk.main()

# Application run
if __name__ == "__main__":
    app = InstallerApp()
    app.run()
