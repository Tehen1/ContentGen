#!/usr/bin/env python3
"""
Main entry point for Fixie.Run application.
Processes cycling analysis reports and adapts them for the Fixie.Run platform
with blockchain integration and token rewards.
"""

import argparse
import logging
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
import os
import time
from datetime import datetime

from fixie_run.config import settings
from fixie_run.adapters.report_adapter import (
    adapt_report,
    extract_cycling_stats,
    InputFileNotFoundError,
    ReportParsingError,
    ReportAdapterError
)
from fixie_run.adapters.visual_adapter import (
    copy_visualizations,
    add_branding_to_images,
    modify_html_visualizations,
    VisualizationAdapterError
)
from fixie_run.core.rewards import ActivityData, calculate_rewards
from fixie_run.core.blockchain import BlockchainClient
from fixie_run.web.generators import HtmlGenerator, TemplateError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("fixie_run.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("fixie_run")

def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Fixie.Run - Adapt cycling reports for blockchain integration with zkEVM"
    )
    
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=settings.INPUT_DIR,
        help=f"Input directory containing cycling analysis results (default: {settings.INPUT_DIR})"
    )
    
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=settings.OUTPUT_DIR,
        help=f"Output directory for Fixie.Run results (default: {settings.OUTPUT_DIR})"
    )
    
    parser.add_argument(
        "--report-file",
        type=str,
        default=settings.REPORT_FILENAME,
        help=f"Markdown report filename (default: {settings.REPORT_FILENAME})"
    )
    
    parser.add_argument(
        "--no-rewards",
        action="store_true",
        help="Disable token rewards calculation"
    )
    
    parser.add_argument(
        "--no-blockchain",
        action="store_true",
        help="Disable blockchain integration"
    )
    
    parser.add_argument(
        "--no-branding",
        action="store_true",
        help="Disable adding branding to visualizations"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    
    return parser.parse_args()

def setup_logging(verbose: bool) -> None:
    """
    Set up logging level based on verbosity.
    
    Args:
        verbose: Whether to use verbose (DEBUG) logging
    """
    if verbose:
        logger.setLevel(logging.DEBUG)
        for handler in logger.handlers:
            handler.setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    else:
        logger.setLevel(logging.INFO)

def process_report(
    input_dir: Path,
    output_dir: Path,
    report_filename: str,
    include_rewards: bool = True,
    include_blockchain: bool = True
) -> Dict[str, Any]:
    """
    Process a cycling report and adapt it for Fixie.Run.
    
    Args:
        input_dir: Directory containing the input report
        output_dir: Directory to write the output report
        report_filename: Name of the report file
        include_rewards: Whether to include token rewards
        include_blockchain: Whether to include blockchain integration
        
    Returns:
        Dict containing results of the processing, including:
        - success: Whether processing was successful
        - activity_data: Extracted ActivityData if successful
        - rewards: Calculated rewards if successful and include_rewards is True
        - error: Error message if not successful
        
    Raises:
        Various exceptions if processing fails
    """
    logger.info(f"Processing report: {report_filename}")
    
    # Prepare paths
    input_path = input_dir / report_filename
    output_path = output_dir / settings.OUTPUT_REPORT_FILENAME
    
    try:
        # Adapt the report
        adapt_report(
            input_path,
            output_path,
            include_rewards=include_rewards,
            include_blockchain=include_blockchain
        )
        
        # Read the input report to extract stats (needed for rewards calculation)
        content = input_path.read_text()
        activity_data = extract_cycling_stats(content)
        
        # Calculate rewards if requested
        rewards = calculate_rewards(activity_data) if include_rewards else None
        
        logger.info(f"Successfully processed report: {report_filename}")
        return {
            "success": True,
            "activity_data": activity_data,
            "rewards": rewards,
            "output_path": output_path
        }
    except InputFileNotFoundError as e:
        logger.error(f"Input file not found: {e}")
        return {
            "success": False,
            "error": f"Input file not found: {input_path}"
        }
    except ReportParsingError as e:
        logger.error(f"Failed to parse report: {e}")
        return {
            "success": False,
            "error": f"Failed to parse report: {e}"
        }
    except Exception as e:
        logger.exception(f"Error processing report: {e}")
        return {
            "success": False,
            "error": f"Error processing report: {e}"
        }

def process_visualizations(
    input_dir: Path,
    output_dir: Path,
    add_branding: bool = True
) -> Dict[str, Any]:
    """
    Process visualizations for Fixie.Run.
    
    Args:
        input_dir: Directory containing the input visualizations
        output_dir: Directory to write the output visualizations
        add_branding: Whether to add Fixie.Run branding
        
    Returns:
        Dict containing results of the processing
    """
    logger.info("Processing visualizations")
    
    try:
        # Copy visualizations with new names
        copied_files = copy_visualizations(
            input_dir,
            output_dir,
            settings.VISUALIZATION_MAPPING
        )
        
        # Add branding if requested
        if add_branding:
            # Separate image and HTML files
            image_files = [f for f in copied_files if f.suffix.lower() in ['.png', '.jpg', '.jpeg']]
            html_files = [f for f in copied_files if f.suffix.lower() == '.html']
            
            # Add branding to images
            branded_images = add_branding_to_images(image_files) if image_files else []
            
            # Modify HTML visualizations
            modified_html = modify_html_visualizations(html_files) if html_files else []
            
            logger.info(f"Added branding to {len(branded_images)} images and {len(modified_html)} HTML files")
        
        return {
            "success": True,
            "visualizations": [f.name for f in copied_files]
        }
    except VisualizationAdapterError as e:
        logger.error(f"Error processing visualizations: {e}")
        return {
            "success": False,
            "error": f"Error processing visualizations: {e}"
        }
    except Exception as e:
        logger.exception(f"Unexpected error processing visualizations: {e}")
        return {
            "success": False,
            "error": f"Unexpected error processing visualizations: {e}"
        }

def generate_web_content(
    output_dir: Path,
    report_filename: str,
    visualizations: List[str],
    activity_data: Optional[ActivityData] = None,
    rewards: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Generate web content for Fixie.Run.
    
    Args:
        output_dir: Directory to write the output files
        report_filename: Name of the report file
        visualizations: List of visualization filenames
        activity_data: Optional ActivityData for personalization
        rewards: Optional rewards data to display
        
    Returns:
        Dict containing results of the generation
    """
    logger.info("Generating web content")
    
    try:
        # Initialize HTML generator
        generator = HtmlGenerator()
        
        # Render landing page
        landing_page_path = output_dir / settings.LANDING_PAGE_FILENAME
        generator.render_landing_page(
            landing_page_path,
            report_filename,
            visualizations,
            rewards=rewards
        )
        
        # Copy static assets
        generator.copy_static_assets(output_dir)
        
        logger.info(f"Successfully generated web content: {landing_page_path}")
        return {
            "success": True,
            "landing_page": landing_page_path
        }
    except TemplateError as e:
        logger.error(f"Template error: {e}")
        return {
            "success": False,
            "error": f"Template error: {e}"
        }
    except Exception as e:
        logger.exception(f"Error generating web content: {e}")
        return {
            "success": False,
            "error": f"Error generating web content: {e}"
        }

def main() -> int:
    """
    Main entry point for the Fixie.Run application.
    
    Returns:
        Exit code (0 for success, non-zero for error)
    """
    # Parse command line arguments
    args = parse_arguments()
    
    # Configure logging based on verbosity
    setup_logging(args.verbose)
    
    logger.info("Starting Fixie.Run adaptation...")
    start_time = time.time()
    
    try:
        # Ensure output directory exists
        args.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Process report
        report_result = process_report(
            args.input_dir,
            args.output_dir,
            args.report_file,
            include_rewards=not args.no_rewards,
            include_blockchain=not args.no_blockchain
        )
        
        if not report_result["success"]:
            logger.error("Failed to process report, aborting.")
            return 1
            
        # Process visualizations
        visuals_result = process_visualizations(
            args.input_dir,
            args.output_dir,
            add_branding=not args.no_branding
        )
        
        if not visuals_result["success"]:
            logger.warning("Failed to process visualizations, continuing with limited functionality.")
            visualizations = []
        else:
            visualizations = visuals_result.get("visualizations", [])
        
        # Generate web content
        web_result = generate_web_content(
            args.output_dir,
            settings.OUTPUT_REPORT_FILENAME,
            visualizations,
            activity_data=report_result.get("activity_data"),
            rewards=report_result.get("rewards")
        )
        
        if not web_result["success"]:
            logger.warning("Failed to generate web content, but report was processed successfully.")
        
        # Initialize blockchain client if blockchain integration is enabled
        if settings.BLOCKCHAIN_ENABLED and not args.no_blockchain:
            try:
                logger.info("Initializing blockchain client...")
                blockchain_client = BlockchainClient()
                
                if blockchain_client.is_connected():
                    logger.info("Connected to blockchain at: %s", settings.BLOCKCHAIN_RPC_URL)
                else:
                    logger.warning("Could not connect to blockchain, integration will be limited.")
            except Exception as e:
                logger.error(f"Error initializing blockchain: {e}")
                logger.warning("Blockchain integration disabled due to error.")
        
        # Calculate and display execution time
        execution_time = time.time() - start_time
        logger.info("Fixie.Run adaptation completed in %.2f seconds.", execution_time)
        
        # Print final result
        print(f"\nFixie.Run adaptation complete!")
        print(f"Results saved to: {args.output_dir}")
        print(f"Open '{settings.LANDING_PAGE_FILENAME}' to view the Fixie.Run page.")
        
        return 0
    except Exception as e:
        logger.exception(f"Unexpected error during adaptation: {e}")
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())