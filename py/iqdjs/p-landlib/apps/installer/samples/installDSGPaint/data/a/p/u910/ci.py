#!/usr/bin/env python


import os
import sys
import glob
import optparse

# cjek PIL
try:
    import Image
except ImportError:
    print "Error: PIL (Python Imaging Library) not installed"
    print "Make: sudo apt-get install python-imaging"
    sys.exit(1)

# 
SUPPORTED_FORMATS = {
    'png': ['png'],
    'bmp': ['bmp', 'dib'],
    'gif': ['gif'],
    'jpeg': ['jpg', 'jpeg', 'jpe', 'jfif']
}

# create list
ALL_SUPPORTED_EXTENSIONS = []
for extensions in SUPPORTED_FORMATS.values():
    ALL_SUPPORTED_EXTENSIONS.extend(extensions)

def get_format_from_extension(filename):
    """
    get format
    """
    name, ext = os.path.splitext(filename)
    ext = ext.lower().lstrip('.')
    
    for format_name, extensions in SUPPORTED_FORMATS.items():
        if ext in extensions:
            return format_name, ext
    return None, ext

def convert_image(input_path, output_path=None, output_format=None):
    """
    Convert
    """
    try:
        # Open image
        img = Image.open(input_path)
        
        # Get first gif frame
        if hasattr(img, 'n_frames') and img.n_frames > 1:
            try:
                img.seek(0)
            except EOFError:
                pass  # unable, make as it
        
        # autogen
        if output_path is None:
            name, ext = os.path.splitext(input_path)
            input_format, input_ext = get_format_from_extension(input_path)
            
            if output_format:
                # Use different output format
                output_ext = SUPPORTED_FORMATS.get(output_format, [output_format])[0]
                output_path = "%s.%s" % (name, output_ext)
            else:
                # Auto
                if input_format == 'bmp':
                    output_path = name + '.png'
                else:
                    output_path = name + '.bmp'
        
        # output format
        output_format_from_path = get_format_from_extension(output_path)[0]
        
        # Saving
        if output_format_from_path == 'jpeg':
            # For JPEG modr RGB
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            img.save(output_path, 'JPEG', quality=95)
        else:
            img.save(output_path)
        
        print "Success: %s -> %s" % (input_path, output_path)
        return True
        
    except Exception, e:
        print "Error on convert %s: %s" % (input_path, str(e))
        return False

def convert_to_bmp(input_path, output_path=None):
    """
    To BMP
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = name + '.bmp'
    return convert_image(input_path, output_path, 'bmp')

def convert_from_bmp(input_path, output_format='png', output_path=None):
    """
     BMP to fmt
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_ext = SUPPORTED_FORMATS.get(output_format, [output_format])[0]
        output_path = "%s.%s" % (name, output_ext)
    return convert_image(input_path, output_path, output_format)

def convert_directory(directory, target_format=None, recursive=False):
    """
    All img in dir
    """
    converted_count = 0
    error_count = 0
    
    # Check search tpl
    pattern = "**/*" if recursive else "*"
    
    # Sarch all support fmts
    for ext in ALL_SUPPORTED_EXTENSIONS:
        search_pattern = os.path.join(directory, pattern + "." + ext)
        for file_path in glob.glob(search_pattern):
            success = False
            
            if target_format:
                # Convert to target fmt
                name, current_ext = os.path.splitext(file_path)
                output_ext = SUPPORTED_FORMATS.get(target_format, [target_format])[0]
                output_path = "%s.%s" % (name, output_ext)
                success = convert_image(file_path, output_path, target_format)
            else:
                # Auto convert
                input_format, _ = get_format_from_extension(file_path)
                if input_format == 'bmp':
                    success = convert_from_bmp(file_path, 'png')
                else:
                    success = convert_to_bmp(file_path)
            
            if success:
                converted_count += 1
            else:
                error_count += 1
    
    return converted_count, error_count

def show_supported_formats():
    """Supprt fmts"""
    print "Supported formats:"
    for format_name, extensions in SUPPORTED_FORMATS.items():
        print "  %-6s -> %s" % (format_name.upper(), ', '.join(extensions))

def main():
    parser = optparse.OptionParser(
        usage="%prog [options] [input] [output]",
        description='Convert images',
        version="1.0"
    )
    
    parser.add_option('-d', '--directory', dest='directory',
                      help='Directory for package convert')
    parser.add_option('-r', '--recursive', action='store_true', dest='recursive',
                      help='Recursive search in subdir')
    parser.add_option('-f', '--format', dest='format',
                      choices=['png', 'bmp', 'gif', 'jpeg'],
                      help='Target format for converting')
    parser.add_option('--formats', action='store_true', dest='show_formats',
                      help='Show supported formats and halt')
    
    # Parse args
    options, args = parser.parse_args()
    
    # Format list
    if options.show_formats:
        show_supported_formats()
        return 0
    
    # Position args
    input_file = args[0] if len(args) > 0 else None
    output_file = args[1] if len(args) > 1 else None
    
    # Check one source
    if not input_file and not options.directory:
        parser.print_help()
        print "\nError: Set output file or dir"
        return 1
    
    # Process one file
    if input_file and not options.directory:
        if not os.path.exists(input_file):
            print "Error: file '%s' NFound" % input_file
            return 1
        
        # cHECK fmt out file
        input_format, input_ext = get_format_from_extension(input_file)
        if input_format is None:
            print "Error: Unsupport fmt '%s'" % input_file
            print "Extension '.%s' not supported" % input_ext
            show_supported_formats()
            return 1
        
        if convert_image(input_file, output_file, options.format):
            print "Done!"
        else:
            print "Errors!!"
            return 1
    
    # Proces idr
    elif options.directory:
        if not os.path.isdir(options.directory):
            print "Error: directory '%s' nf" % options.directory
            return 1
        
        print "Process dir: %s" % options.directory
        if options.recursive:
            print "recursive search: on"
        if options.format:
            print "Target format: %s" % options.format
        
        converted, errors = convert_directory(options.directory, options.format, options.recursive)
        print "\nResult: success - %d, errors - %d" % (converted, errors)
        
        if errors > 0:
            return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
