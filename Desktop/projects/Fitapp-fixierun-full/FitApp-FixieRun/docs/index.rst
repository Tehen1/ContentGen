Welcome to Fixie.Run's documentation!
====================================

Fixie.Run is a toolkit for adapting cycling analytics reports with blockchain integration on zkEVM. It transforms standard cycling analysis reports into privacy-preserving, blockchain-integrated reports with token rewards.

.. image:: _static/fixie_logo.png
   :alt: Fixie.Run Logo
   :align: center
   :width: 300px

Key Features
-----------

* **Privacy-Preserving Analytics**: Generate zero-knowledge proofs of cycling activities
* **Token Rewards**: Calculate and distribute FIXIE tokens based on cycling performance
* **Enhanced Visualizations**: Brand and adapt cycling visualizations
* **Web Interface**: Generate a responsive web interface to display reports and rewards
* **zkEVM Integration**: Connect with the zkEVM blockchain for token transactions

Getting Started
--------------

Installation
^^^^^^^^^^^

.. code-block:: bash

   # Create a virtual environment
   python -m venv .venv
   source .venv/bin/activate  # Unix/macOS
   # or
   .\.venv\Scripts\activate  # Windows

   # Install the package
   pip install -e .

   # For development
   pip install -e ".[dev]"

Basic Usage
^^^^^^^^^^

.. code-block:: bash

   # Run with default settings
   fixie-run

   # Specify custom directories
   fixie-run --input-dir /path/to/cycling_data --output-dir /path/to/output

   # Disable blockchain integration
   fixie-run --no-blockchain

   # Display help
   fixie-run --help

API Usage
^^^^^^^^

.. code-block:: bash

   # Start the API server
   fixie-run-api

   # Specify host and port
   fixie-run-api --host 0.0.0.0 --port 8080

   # Enable auto-reload for development
   fixie-run-api --reload

Table of Contents
----------------

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   installation
   usage
   configuration
   api
   modules/index
   blockchain
   rest_api
   contributing
   changelog

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`