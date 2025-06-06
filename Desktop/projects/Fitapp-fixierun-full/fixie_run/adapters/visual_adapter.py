"""
Visual adaptation functionality for Fixie.Run.
Handles the copying and transformation of visualizations from
standard cycling analysis to Fixie.Run branded format.
"""

import logging
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import re
from PIL import Image, ImageDraw, ImageFont
import os

from fixie_run.config import settings

logger = logging.getLogger(__name__)

class VisualizationAdapterError(Exception):
    """Base exception for visualization adaptation failures."""
    pass

class VisualizationNotFoundError(VisualizationAdapterError):
    """Raised when a visualization file is not found."""
    pass

def copy_visualizations(
    input_dir: Path,
    output_dir: Path,
    file_mapping: Optional[Dict[str, str]] = None
) -> List[Path]:
    """
    Copy visualization files with modified names to the output directory.
    
    Args:
        input_dir: Source directory containing visualizations
        output_dir: Target directory for adapted visualizations
        file_mapping: Optional custom mapping of original to target filenames
        
    Returns:
        List of paths to copied files
        
    Raises:
        VisualizationAdapterError: If copy operation fails
    """
    logger.info(f"Copying visualizations from {input_dir} to {output_dir}")
    
    # Use provided mapping or default from settings
    mapping = file_mapping or settings.VISUALIZATION_MAPPING
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    copied_files = []
    for orig_file, new_file in mapping.items():
        orig_path = input_dir / orig_file
        new_path = output_dir / new_file
        
        try:
            if orig_path.exists():
                shutil.copy(orig_path, new_path)
                logger.info(f"Copied {orig_file} to {new_file}")
                copied_files.append(new_path)
            else:
                logger.warning(f"Visualization not found: {orig_path}")
        except Exception as e:
            logger.error(f"Error copying {orig_file} to {new_file}: {e}")
            raise VisualizationAdapterError(f"Failed to copy visualization: {e}")
    
    return copied_files

def add_branding_to_images(
    image_paths: List[Path],
    logo_path: Optional[Path] = None,
    brand_text: str = "Fixie.Run",
    opacity: float = 0.3
) -> List[Path]:
    """
    Add Fixie.Run branding to visualization images.
    
    Args:
        image_paths: List of paths to images
        logo_path: Optional path to logo image
        brand_text: Text to add as watermark
        opacity: Opacity of the watermark (0.0-1.0)
        
    Returns:
        List of paths to branded images
    """
    logger.info(f"Adding branding to {len(image_paths)} images")
    
    branded_paths = []
    for img_path in image_paths:
        try:
            # Skip non-image files
            if not img_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                logger.info(f"Skipping non-image file: {img_path}")
                branded_paths.append(img_path)  # Add to list but don't modify
                continue
                
            # Open image
            img = Image.open(img_path)
            
            # Create drawing context
            draw = ImageDraw.Draw(img)
            
            # Try to load a font, fall back to default if not available
            try:
                font_size = max(14, img.width // 30)  # Scale font with image
                font = ImageFont.truetype("Arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()
                
            # Calculate text position (bottom right corner)
            text_width, text_height = draw.textsize(brand_text, font=font)
            position = (img.width - text_width - 20, img.height - text_height - 20)
            
            # Add watermark text
            draw.text(
                position,
                brand_text,
                fill=(255, 255, 255, int(255 * opacity)),
                font=font
            )
            
            # If logo provided, add it too
            if logo_path and logo_path.exists():
                try:
                    logo = Image.open(logo_path)
                    # Resize logo to reasonable size (10% of image width)
                    logo_size = max(50, img.width // 10)
                    logo = logo.resize((logo_size, logo_size))
                    
                    # Calculate position (top right corner)
                    logo_position = (img.width - logo_size - 20, 20)
                    
                    # Create a transparent version of the logo
                    logo_transparent = logo.copy()
                    logo_transparent.putalpha(int(255 * opacity))
                    
                    # Paste logo using itself as mask for transparency
                    img.paste(logo_transparent, logo_position, logo_transparent)
                except Exception as e:
                    logger.warning(f"Could not add logo to image: {e}")
            
            # Save image with same name (overwrite)
            img.save(img_path)
            logger.info(f"Added branding to {img_path}")
            
            branded_paths.append(img_path)
        except Exception as e:
            logger.error(f"Error adding branding to {img_path}: {e}")
            # Add original path to returned list even if branding failed
            branded_paths.append(img_path)
    
    return branded_paths

def modify_html_visualizations(
    html_paths: List[Path],
    inject_css: bool = True,
    inject_header: bool = True
) -> List[Path]:
    """
    Modify HTML visualizations to add Fixie.Run branding and styling.
    
    Args:
        html_paths: List of paths to HTML files
        inject_css: Whether to inject custom CSS
        inject_header: Whether to inject Fixie.Run header
        
    Returns:
        List of paths to modified files
    """
    logger.info(f"Modifying {len(html_paths)} HTML visualizations")
    
    modified_paths = []
    
    # CSS to inject
    fixie_css = """
    <style>
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f5f8f5;
        color: #333;
        line-height: 1.6;
    }
    .fixie-header {
        background-color: #2E7D32;
        color: white;
        padding: 15px;
        text-align: center;
        margin-bottom: 20px;
        border-radius: 5px;
    }
    .fixie-footer {
        text-align: center;
        margin-top: 30px;
        color: #666;
        font-size: 0.9em;
        padding: 15px;
        border-top: 1px solid #ddd;
    }
    .privacy-note {
        background-color: #e8f5e9;
        border-left: 4px solid #2E7D32;
        padding: 10px 15px;
        margin: 20px 0;
        color: #333;
    }
    </style>
    """
    
    # Header HTML to inject
    fixie_header = """
    <div class="fixie-header">
        <h2>🚴‍♂️ Fixie.Run</h2>
        <p>Privacy-Preserving Cycling Analytics on zkEVM</p>
    </div>
    """
    
    # Footer HTML to inject
    fixie_footer = """
    <div class="fixie-footer">
        <p>Powered by Fixie.Run on zkEVM blockchain</p>
        <p><small>Your cycling data, protected by zero-knowledge proofs</small></p>
    </div>
    """
    
    # Privacy note to inject
    privacy_note = """
    <div class="privacy-note">
        <h4>🔒 Privacy Preserved with zkEVM</h4>
        <p>This visualization has been generated in a privacy-preserving manner.
        Your route data is encrypted and only you control who can access it.</p>
    </div>
    """
    
    for html_path in html_paths:
        try:
            with html_path.open('r', encoding='utf-8') as f:
                content = f.read()
                
            # Inject CSS in head section
            if inject_css and "<head>" in content:
                content = content.replace("<head>", "<head>\n" + fixie_css)
                
            # Inject header after body tag
            if inject_header and "<body>" in content:
                content = content.replace("<body>", "<body>\n" + fixie_header)
                
            # Inject privacy note before end of body
            if "</body>" in content:
                content = content.replace("</body>", privacy_note + "\n" + fixie_footer + "\n</body>")
                
            # Write modified content back to file
            with html_path.open('w', encoding='utf-8') as f:
                f.write(content)
                
            logger.info(f"Modified HTML visualization: {html_path}")
            modified_paths.append(html_path)
        except Exception as e:
            logger.error(f"Error modifying HTML visualization {html_path}: {e}")
    
    return modified_paths