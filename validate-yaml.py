#!/usr/bin/env python3
import yaml
import sys
import os

def validate_yaml_file(filepath):
    try:
        with open(filepath, 'r') as file:
            # Load all documents in the YAML file
            documents = list(yaml.safe_load_all(file))
            return True, f"Valid YAML with {len(documents)} document(s)"
    except yaml.YAMLError as e:
        return False, f"YAML Error: {e}"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    deployment_dir = "deployment"
    if not os.path.exists(deployment_dir):
        print(f"Directory {deployment_dir} not found")
        return
    
    for filename in os.listdir(deployment_dir):
        if filename.endswith('.yml') or filename.endswith('.yaml'):
            filepath = os.path.join(deployment_dir, filename)
            is_valid, message = validate_yaml_file(filepath)
            status = "✓" if is_valid else "✗"
            print(f"{status} {filename}: {message}")

if __name__ == "__main__":
    main()