"""
Command line interface package for Fixie.Run.
"""

from typing import List

def get_cli_entrypoints() -> List[str]:
    """Get a list of all CLI entrypoints."""
    return [
        "fixie-run = fixie_run.main:main",
        "fixie-run-api = fixie_run.api.cli:main"
    ]