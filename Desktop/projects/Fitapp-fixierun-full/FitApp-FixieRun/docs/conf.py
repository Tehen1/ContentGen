# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

import os
import sys
from datetime import datetime

# Add the project root directory to the path so we can import the package
sys.path.insert(0, os.path.abspath('..'))

# Project information
project = 'Fixie.Run'
copyright = f'{datetime.now().year}, Fixie.Run Team'
author = 'Fixie.Run Team'

# The full version, including alpha/beta/rc tags
release = '0.1.0'

# Add any Sphinx extension module names here, as strings
extensions = [
    'sphinx.ext.autodoc',        # Include documentation from docstrings
    'sphinx.ext.viewcode',       # Add links to the source code
    'sphinx.ext.napoleon',       # Support for NumPy and Google style docstrings
    'sphinx.ext.intersphinx',    # Link to other project's documentation
    'sphinx.ext.autosummary',    # Generate autodoc summaries
    'sphinx.ext.coverage',       # Checks documentation coverage
    'sphinx_rtd_theme',          # Read the Docs theme
]

# Add any paths that contain templates here, relative to this directory
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# The theme to use for HTML and HTML Help pages
html_theme = 'sphinx_rtd_theme'

# Theme options
html_theme_options = {
    'navigation_depth': 4,
    'collapse_navigation': False,
    'sticky_navigation': True,
    'style_external_links': True,
}

# Add any paths that contain custom static files (such as style sheets)
html_static_path = ['_static']

# Custom sidebar templates
html_sidebars = {
    '**': [
        'relations.html',  # needs 'show_related': True theme option to display
        'searchbox.html',
    ]
}

# Intersphinx mapping
intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
    'web3py': ('https://web3py.readthedocs.io/en/stable/', None),
}

# Napoleon settings
napoleon_google_docstring = True
napoleon_numpy_docstring = True
napoleon_include_init_with_doc = False
napoleon_include_private_with_doc = False
napoleon_include_special_with_doc = True
napoleon_use_admonition_for_examples = True
napoleon_use_admonition_for_notes = True
napoleon_use_admonition_for_references = True
napoleon_use_ivar = False
napoleon_use_param = True
napoleon_use_rtype = True
napoleon_preprocess_types = True
napoleon_type_aliases = None
napoleon_attr_annotations = True

# AutoDoc settings
autodoc_default_options = {
    'member-order': 'bysource',
    'special-members': '__init__',
    'undoc-members': True,
    'exclude-members': '__weakref__'
}

# AutoSummary settings
autosummary_generate = True