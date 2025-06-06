"""
Unit tests for adapter modules.
"""

import unittest
import pytest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path
import re
from tempfile import TemporaryDirectory
import os
import shutil

from fixie_run.adapters.report_adapter import (
    extract_cycling_stats,
    adapt_report,
    ReportAdapterError,
    InputFileNotFoundError,
    ReportParsingError
)

from fixie_run.adapters.visual_adapter import (
    copy_visualizations,
    add_branding_to_images,
    modify_html_visualizations,
    VisualizationAdapterError
)

from fixie_run.core.rewards import ActivityData

class TestReportAdapter(unittest.TestCase):
    """Test cases for report adaptation functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.sample_report_content = """# Cycling Activity Analysis

## Basic Statistics

* Total number of cycling activities: 42
* Date range: 2023-01-01 to 2023-12-31
* Total distance cycled: 1234.56 km
* Total time spent cycling: 78.90 hours
* Average cycling speed: 15.65 km/h
* Total elevation gain: 3456.7 m

## Summary

This analysis provides insights into your cycling patterns.
"""
    
    def test_extract_cycling_stats(self):
        """Test extraction of cycling statistics from report content."""
        stats = extract_cycling_stats(self.sample_report_content)
        
        self.assertEqual(stats.distance_km, 1234.56)
        self.assertEqual(stats.duration_hours, 78.90)
        self.assertEqual(stats.avg_speed, 15.65)
        self.assertEqual(stats.num_activities, 42)
        self.assertEqual(stats.elevation_m, 3456.7)
    
    def test_extract_cycling_stats_missing_required(self):
        """Test that ReportParsingError is raised when required stats are missing."""
        incomplete_content = """# Cycling Activity Analysis

## Basic Statistics

* Total number of cycling activities: 42
* Date range: 2023-01-01 to 2023-12-31
* Average cycling speed: 15.65 km/h

## Summary

This analysis provides insights into your cycling patterns.
"""
        with self.assertRaises(ReportParsingError):
            extract_cycling_stats(incomplete_content)
    
    def test_adapt_report_file_not_found(self):
        """Test that InputFileNotFoundError is raised for missing input file."""
        with self.assertRaises(InputFileNotFoundError):
            adapt_report(
                Path("nonexistent_file.md"),
                Path("output.md")
            )
    
    @patch("pathlib.Path.exists")
    @patch("pathlib.Path.read_text")
    @patch("pathlib.Path.write_text")
    def test_adapt_report_successful(self, mock_write, mock_read, mock_exists):
        """Test successful report adaptation."""
        # Setup mocks
        mock_exists.return_value = True
        mock_read.return_value = self.sample_report_content
        
        # Call the function
        result = adapt_report(
            Path("input.md"),
            Path("output.md")
        )
        
        # Verify the result
        self.assertTrue(result)
        mock_write.assert_called_once()
        
        # Get the content that was written
        written_content = mock_write.call_args[0][0]
        
        # Check that the title was replaced
        self.assertIn("# Fixie.Run: Your Cycling Activity on zkEVM", written_content)
        
        # Check that the blockchain section was added
        self.assertIn("## Blockchain Integration", written_content)
        
        # Check that the rewards section was added
        self.assertIn("## Token Rewards", written_content)
        
        # Check that the privacy note was added
        self.assertIn("Privacy Protection with zkEVM", written_content)


class TestVisualAdapter(unittest.TestCase):
    """Test cases for visualization adaptation functionality."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for testing
        self.temp_dir = TemporaryDirectory()
        self.input_dir = Path(self.temp_dir.name) / "input"
        self.output_dir = Path(self.temp_dir.name) / "output"
        
        # Create input directory
        self.input_dir.mkdir()
        
        # Create some test visualization files
        self.test_files = {
            "cycling_distance_distribution.png": b"test png content",
            "cycling_by_day.png": b"test png content 2",
            "cycling_routes_map.html": "<html>Test HTML content</html>"
        }
        
        for filename, content in self.test_files.items():
            with open(self.input_dir / filename, "wb" if isinstance(content, bytes) else "w") as f:
                f.write(content)
    
    def tearDown(self):
        """Clean up after tests."""
        self.temp_dir.cleanup()
    
    def test_copy_visualizations(self):
        """Test copying visualizations with renamed files."""
        file_mapping = {
            "cycling_distance_distribution.png": "fixie_distance.png",
            "cycling_by_day.png": "fixie_days.png",
            "cycling_routes_map.html": "fixie_routes.html"
        }
        
        copied_files = copy_visualizations(
            self.input_dir,
            self.output_dir,
            file_mapping
        )
        
        # Check all files were copied with new names
        self.assertEqual(len(copied_files), 3)
        for original, renamed in file_mapping.items():
            output_path = self.output_dir / renamed
            self.assertTrue(output_path.exists())
            
            # Verify file content remains the same
            with open(self.input_dir / original, "rb" if original.endswith("png") else "r") as f_in, \
                 open(output_path, "rb" if renamed.endswith("png") else "r") as f_out:
                self.assertEqual(f_in.read(), f_out.read())
    
    def test_copy_visualizations_missing_file(self):
        """Test copying visualizations when some files are missing."""
        # Use a mapping with a non-existent file
        file_mapping = {
            "cycling_distance_distribution.png": "fixie_distance.png",
            "non_existent_file.png": "fixie_missing.png"
        }
        
        copied_files = copy_visualizations(
            self.input_dir,
            self.output_dir,
            file_mapping
        )
        
        # Only the existing file should be copied
        self.assertEqual(len(copied_files), 1)
        self.assertTrue((self.output_dir / "fixie_distance.png").exists())
        self.assertFalse((self.output_dir / "fixie_missing.png").exists())
    
    @patch("fixie_run.adapters.visual_adapter.Image.open")
    @patch("fixie_run.adapters.visual_adapter.ImageDraw.Draw")
    @patch("fixie_run.adapters.visual_adapter.ImageFont.truetype")
    def test_add_branding_to_images(self, mock_font, mock_draw, mock_open):
        """Test adding branding to images."""
        # Setup mocks for PIL
        mock_img = MagicMock()
        mock_img.width = 800
        mock_img.height = 600
        mock_open.return_value = mock_img
        
        mock_draw_obj = MagicMock()
        mock_draw.return_value = mock_draw_obj
        mock_draw_obj.textsize.return_value = (100, 20)
        
        # Test file paths
        image_paths = [
            Path("test1.png"),
            Path("test2.jpg"),
            Path("test3.html")  # Non-image should be skipped
        ]
        
        branded_paths = add_branding_to_images(image_paths)
        
        # Check that all paths were returned
        self.assertEqual(len(branded_paths), 3)
        
        # Check that draw.text was called for images only
        self.assertEqual(mock_draw_obj.text.call_count, 2)
        
        # Check the position calculation for watermark
        positions = [call_args[0][0] for call_args in mock_draw_obj.text.call_args_list]
        for pos in positions:
            # Should be in bottom right corner
            self.assertEqual(pos, (680, 560))  # 800-100-20, 600-20-20
    
    def test_modify_html_visualizations(self):
        """Test modifying HTML visualizations."""
        # Create an HTML file
        html_path = self.output_dir / "test.html"
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <div>Test content</div>
</body>
</html>
"""
        self.output_dir.mkdir(exist_ok=True)
        with open(html_path, "w") as f:
            f.write(html_content)
        
        modified_paths = modify_html_visualizations([html_path])
        
        # Check that the file was returned
        self.assertEqual(len(modified_paths), 1)
        self.assertEqual(modified_paths[0], html_path)
        
        # Read the modified file
        with open(html_path, "r") as f:
            modified_content = f.read()
        
        # Check that our additions were made
        self.assertIn("fixie-header", modified_content)
        self.assertIn("Privacy Preserved with zkEVM", modified_content)
        self.assertIn("fixie-footer", modified_content)