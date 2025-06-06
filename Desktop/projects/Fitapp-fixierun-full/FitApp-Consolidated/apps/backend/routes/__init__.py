"""
Routes package initializer
This file makes routes a package and handles importing all blueprints
"""

from flask import Blueprint
from routes import auth_routes, activity_routes, web3_routes

# Create a list of all route blueprints for easy registration
all_blueprints = [
    (auth_routes.bp, '/api/auth'),
    (activity_routes.bp, '/api/activities'),
    (web3_routes.bp, '/api/web3')
]

def register_all_blueprints(app):
    """
    Register all blueprints with the Flask app
    
    Args:
        app: Flask application instance
    """
    for blueprint, url_prefix in all_blueprints:
        app.register_blueprint(blueprint, url_prefix=url_prefix)