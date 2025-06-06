"""
Command-line interface for the Fixie.Run API.
"""

import argparse
import sys
import logging
import uvicorn
from pathlib import Path

from fixie_run.config import settings

logger = logging.getLogger(__name__)

def parse_arguments():
    """Parse command line arguments for the API server."""
    parser = argparse.ArgumentParser(
        description="Start the Fixie.Run API server"
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host to bind the server to (default: 127.0.0.1)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind the server to (default: 8000)"
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload for development"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        choices=["debug", "info", "warning", "error", "critical"],
        default="info",
        help="Logging level (default: info)"
    )
    
    return parser.parse_args()

def main():
    """Start the API server."""
    args = parse_arguments()
    
    # Configure logging
    log_level = getattr(logging, args.log_level.upper())
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info(f"Starting Fixie.Run API server on {args.host}:{args.port}")
    
    if args.reload:
        logger.info("Auto-reload enabled (development mode)")
    
    # Start the API server using Uvicorn
    uvicorn.run(
        "fixie_run.api.rest_api:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level=args.log_level
    )
    
    return 0

if __name__ == "__main__":
    sys.exit(main())