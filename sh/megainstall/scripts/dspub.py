#!/usr/bin/env python3
import os
import sys
import json
import shutil
import argparse
from pathlib import Path

CONFIG_PATH = os.path.expanduser('~/.config/dspub/config.json')

# Mapping of file types to their target directories
TARGET_DIRS = {
    'Command': 'src/Command',
    'Repository': 'src/Repository',
    'Entity': 'src/Entity',
    'Controller': 'src/Controller',
    'Service': 'src/Service'
}

def get_config():
    if not os.path.exists(CONFIG_PATH):
        return None
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def save_config(root_path):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, 'w') as f:
        json.dump({'root_path': root_path}, f)

def get_class_name_and_type(file_path):
    try:
        with open(file_path, 'r') as f:
            for line in f:
                if 'class ' in line:
                    # Extract class name
                    class_name = line.split('class ')[1].split(' ')[0].strip()
                    # Determine file type based on common patterns
                    if 'Command' in line:
                        file_type = 'Command'
                    elif 'Repository' in line:
                        file_type = 'Repository'
                    elif 'Entity' in line:
                        file_type = 'Entity'
                    elif 'Controller' in line:
                        file_type = 'Controller'
                    elif 'Service' in line:
                        file_type = 'Service'
                    else:
                        file_type = None
                    return class_name, file_type
    except Exception as e:
        print(f"Error reading file: {e}")
    return None, None

def main():
    parser = argparse.ArgumentParser(description='Deploy Symfony files')
    parser.add_argument('source_file', nargs='?', help='Source file to deploy')
    parser.add_argument('--set-root', help='Set Symfony root path')
    args = parser.parse_args()

    if args.set_root:
        save_config(args.set_root)
        print(f"Root path set to: {args.set_root}")
        return

    if not args.source_file:
        print("Error: No source file specified")
        sys.exit(1)

    source_path = Path(args.source_file)
    if not source_path.exists():
        print(f"Error: File {source_path} not found")
        sys.exit(1)

    config = get_config()
    if not config or 'root_path' not in config:
        print("Error: Symfony root path not configured. Use --set-root to set it.")
        sys.exit(1)

    class_name, file_type = get_class_name_and_type(source_path)
    if not class_name or not file_type:
        print("Error: Could not determine class name and type from file")
        sys.exit(1)

    if file_type not in TARGET_DIRS:
        print(f"Error: Unsupported file type '{file_type}'")
        sys.exit(1)

    dest_dir = Path(config['root_path']) / TARGET_DIRS[file_type]
    dest_path = dest_dir / f"{class_name}.php"

    try:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, dest_path)
        print(f"File copied to: {dest_path}")
    except Exception as e:
        print(f"Error copying file: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
