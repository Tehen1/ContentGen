"""
HTML generation functionality for Fixie.Run.
Generates HTML pages for displaying cycling reports and visualizations.
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import os
import shutil

from jinja2 import Environment, FileSystemLoader, select_autoescape

from fixie_run.config import settings
from fixie_run.core.rewards import ActivityData, RewardBreakdown

logger = logging.getLogger(__name__)

class TemplateError(Exception):
    """Exception raised for template rendering errors."""
    pass

class HtmlGenerator:
    """Generator for HTML pages using Jinja2 templates."""
    
    def __init__(self, template_dir: Optional[Path] = None):
        """
        Initialize HTML generator with templates.
        
        Args:
            template_dir: Directory containing templates (defaults to package templates)
        """
        if template_dir is None:
            # Use default templates from package
            package_dir = Path(__file__).resolve().parent
            template_dir = package_dir / "templates"
            
        self.template_dir = template_dir
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        logger.info(f"Initialized HTML generator with templates from: {template_dir}")
    
    def render_landing_page(
        self,
        output_path: Path,
        report_filename: str,
        visualizations: List[str],
        rewards: Optional[RewardBreakdown] = None,
        user_data: Optional[Dict[str, Any]] = None
    ) -> Path:
        """
        Generate landing page HTML file.
        
        Args:
            output_path: Path to write HTML file
            report_filename: Markdown report filename to link to
            visualizations: List of visualization filenames to include
            rewards: Optional reward breakdown to display
            user_data: Optional user data for personalization
            
        Returns:
            Path to generated HTML file
            
        Raises:
            TemplateError: If template rendering fails
        """
        logger.info(f"Generating landing page at: {output_path}")
        
        try:
            template = self.env.get_template("index.html")
            
            # Prepare context for template
            context = {
                "report_filename": report_filename,
                "visualizations": visualizations,
                "rewards": rewards,
                "user_data": user_data or {},
                "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "blockchain_enabled": settings.BLOCKCHAIN_ENABLED
            }
            
            # Render template
            html_content = template.render(**context)
            
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write to file
            with output_path.open('w', encoding='utf-8') as f:
                f.write(html_content)
                
            logger.info(f"Successfully generated landing page: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error generating landing page: {e}")
            raise TemplateError(f"Failed to render landing page: {e}")
    
    def render_rewards_page(
        self,
        output_path: Path,
        rewards: RewardBreakdown,
        activity_data: ActivityData,
        user_address: Optional[str] = None
    ) -> Path:
        """
        Generate rewards page HTML file.
        
        Args:
            output_path: Path to write HTML file
            rewards: Reward breakdown to display
            activity_data: Activity data for context
            user_address: Optional blockchain address
            
        Returns:
            Path to generated HTML file
        """
        logger.info(f"Generating rewards page at: {output_path}")
        
        try:
            template = self.env.get_template("rewards.html")
            
            # Prepare context for template
            context = {
                "rewards": rewards,
                "activity_data": activity_data,
                "user_address": user_address,
                "reward_tier": calculate_reward_tier(activity_data.distance_km),
                "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Render template
            html_content = template.render(**context)
            
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write to file
            with output_path.open('w', encoding='utf-8') as f:
                f.write(html_content)
                
            logger.info(f"Successfully generated rewards page: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error generating rewards page: {e}")
            raise TemplateError(f"Failed to render rewards page: {e}")
    
    def copy_static_assets(self, output_dir: Path) -> None:
        """
        Copy static assets (CSS, JS, images) to output directory.
        
        Args:
            output_dir: Directory to copy assets to
        """
        logger.info(f"Copying static assets to: {output_dir}")
        
        # Path to static assets in package
        static_dir = self.template_dir / "static"
        
        if not static_dir.exists():
            logger.warning(f"Static assets directory not found: {static_dir}")
            return
            
        # Ensure output static directory exists
        output_static_dir = output_dir / "static"
        output_static_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy all files from static directory
        for item in static_dir.glob("**/*"):
            if item.is_file():
                # Create relative path
                rel_path = item.relative_to(static_dir)
                dest_path = output_static_dir / rel_path
                
                # Ensure parent directory exists
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                shutil.copy2(item, dest_path)
                logger.debug(f"Copied static asset: {rel_path}")

def calculate_reward_tier(total_distance: float) -> str:
    """Calculate the user's reward tier based on total distance."""
    if total_distance > 1000:
        return "Diamond"
    elif total_distance > 500:
        return "Platinum"
    elif total_distance > 250:
        return "Gold"
    elif total_distance > 100:
        return "Silver"
    else:
        return "Bronze"