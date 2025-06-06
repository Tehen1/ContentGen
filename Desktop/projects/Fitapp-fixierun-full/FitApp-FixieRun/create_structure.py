#!/usr/bin/env python3
"""
Migration script for Fixie.Run restructuring.
Creates the directory structure and empty files for the new package.
"""

import os
import shutil
from pathlib import Path

# Define the package structure
PACKAGE_STRUCTURE = {
    "fixie_run": {
        "__init__.py": "",
        "config": {
            "__init__.py": "",
            "settings.py": ""
        },
        "core": {
            "__init__.py": "",
            "rewards.py": "",
            "blockchain.py": ""
        },
        "adapters": {
            "__init__.py": "",
            "report_adapter.py": "",
            "visual_adapter.py": ""
        },
        "web": {
            "__init__.py": "",
            "generators.py": "",
            "templates": {
                "index.html": "",
                "components": {
                    "header.html": "",
                    "rewards.html": "",
                    "footer.html": ""
                }
            }
        },
        "tests": {
            "__init__.py": "",
            "test_rewards.py": "",
            "test_adapters.py": "",
            "test_web.py": ""
        },
        "main.py": ""
    }
}

# Files to create at the root level
ROOT_FILES = [
    "pyproject.toml",
    "requirements.txt",
    ".env.example",
    "README.md"
]

def create_directory_structure(base_path: Path, structure: dict, is_dir: bool = True):
    """Create directory structure recursively."""
    if is_dir:
        base_path.mkdir(exist_ok=True, parents=True)
        for name, content in structure.items():
            child_path = base_path / name
            if isinstance(content, dict):
                create_directory_structure(child_path, content)
            else:
                with open(child_path, 'w') as f:
                    f.write(content)
    else:
        with open(base_path, 'w') as f:
            f.write(structure)

def main():
    """Create the directory structure for the new package."""
    base_path = Path(".")
    
    # Create package structure
    create_directory_structure(base_path, PACKAGE_STRUCTURE)
    
    # Create root files
    for file in ROOT_FILES:
        (base_path / file).touch()
    
    print("Directory structure created successfully.")
    print("Next steps:")
    print("1. Install development dependencies: pip install -e .[dev]")
    print("2. Start implementing each module, beginning with config/settings.py")
    print("3. Write tests for each module as you implement it")

if __name__ == "__main__":
    main()