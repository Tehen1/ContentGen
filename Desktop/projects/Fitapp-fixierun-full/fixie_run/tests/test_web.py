"""
Unit tests for web module.
"""

import unittest
from unittest.mock import patch, MagicMock, mock_open
import tempfile
from pathlib import Path
import os
import shutil

from fixie_run.web.generators import (
    HtmlGenerator,
    TemplateError,
    calculate_reward_tier
)
from fixie_run.core.rewards import ActivityData, RewardBreakdown

class TestHtmlGenerator(unittest.TestCase):
    """Test cases for HTML generation functionality."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for test output
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name)
        
        # Create a test template directory
        self.template_dir = self.output_dir / "templates"
        self.template_dir.mkdir(parents=True)
        
        # Create test templates
        self.create_test_templates()
        
        # Initialize the generator with test templates
        self.generator = HtmlGenerator(template_dir=self.template_dir)
        
        # Sample data for testing
        self.rewards = RewardBreakdown(
            base=10.0,
            distance=12.5,
            time=4.0,
            weekly_bonus=15.0,
            total=41.5
        )
        
        self.activity_data = ActivityData(
            distance_km=25.0,
            duration_hours=2.0,
            elevation_m=150.0,
            num_activities=1,
            avg_speed=12.5
        )
    
    def tearDown(self):
        """Clean up after tests."""
        self.temp_dir.cleanup()
    
    def create_test_templates(self):
        """Create test templates for testing."""
        # Simple index.html template
        index_template = """<!DOCTYPE html>
<html>
<head>
    <title>Fixie.Run</title>
</head>
<body>
    <h1>Fixie.Run</h1>
    <p>Report: <a href="{{ report_filename }}">View Report</a></p>
    {% if rewards %}
    <div>
        <h2>Rewards</h2>
        <p>Total: {{ rewards.total }}</p>
    </div>
    {% endif %}
    <div>
        <h2>Visualizations</h2>
        <ul>
            {% for visual in visualizations %}
            <li>{{ visual }}</li>
            {% endfor %}
        </ul>
    </div>
</body>
</html>"""
        
        # Simple rewards.html template
        rewards_template = """<!DOCTYPE html>
<html>
<head>
    <title>Fixie.Run Rewards</title>
</head>
<body>
    <h1>Your Rewards</h1>
    <p>Total: {{ rewards.total }}</p>
    <p>Your tier: {{ reward_tier }}</p>
</body>
</html>"""
        
        # Create templates directory
        components_dir = self.template_dir / "components"
        components_dir.mkdir(exist_ok=True)
        
        # Write templates to files
        with open(self.template_dir / "index.html", "w") as f:
            f.write(index_template)
            
        with open(self.template_dir / "rewards.html", "w") as f:
            f.write(rewards_template)
    
    def test_render_landing_page(self):
        """Test rendering the landing page."""
        output_path = self.output_dir / "index.html"
        report_filename = "report.md"
        visualizations = ["image1.png", "image2.png"]
        
        # Render the landing page
        result = self.generator.render_landing_page(
            output_path,
            report_filename,
            visualizations,
            self.rewards
        )
        
        # Check that the file was created
        self.assertTrue(output_path.exists())
        self.assertEqual(result, output_path)
        
        # Read the content to verify it was generated correctly
        with open(output_path, 'r') as f:
            content = f.read()
        
        # Verify the report filename is in the content
        self.assertIn(report_filename, content)
        
        # Verify the visualizations are listed
        for visual in visualizations:
            self.assertIn(visual, content)
        
        # Verify the rewards amount is shown
        self.assertIn(str(self.rewards.total), content)
    
    def test_render_rewards_page(self):
        """Test rendering the rewards page."""
        output_path = self.output_dir / "rewards.html"
        
        # Render the rewards page
        result = self.generator.render_rewards_page(
            output_path,
            self.rewards,
            self.activity_data,
            user_address="0x71C...F3E2"
        )
        
        # Check that the file was created
        self.assertTrue(output_path.exists())
        self.assertEqual(result, output_path)
        
        # Read the content to verify it was generated correctly
        with open(output_path, 'r') as f:
            content = f.read()
        
        # Verify the rewards amount is shown
        self.assertIn(str(self.rewards.total), content)
        
        # Verify the reward tier is calculated and shown
        expected_tier = calculate_reward_tier(self.activity_data.distance_km)
        self.assertIn(expected_tier, content)
    
    @patch('fixie_run.web.generators.shutil.copy2')
    def test_copy_static_assets(self, mock_copy):
        """Test copying static assets."""
        # Create a test static directory
        static_dir = self.template_dir / "static"
        static_dir.mkdir(exist_ok=True)
        
        # Create some test static files
        test_css = static_dir / "css"
        test_css.mkdir(exist_ok=True)
        with open(test_css / "main.css", "w") as f:
            f.write("body { color: #333; }")
        
        test_js = static_dir / "js"
        test_js.mkdir(exist_ok=True)
        with open(test_js / "app.js", "w") as f:
            f.write("console.log('Hello');")
        
        # Call the method
        self.generator.copy_static_assets(self.output_dir)
        
        # Check that copy was called for each file
        self.assertEqual(mock_copy.call_count, 2)
    
    def test_template_error_handling(self):
        """Test that template errors are properly handled."""
        # Create a test template with an error
        with open(self.template_dir / "error.html", "w") as f:
            f.write("{% for item in unclosed_loop %}")
        
        # Try to render the template
        with self.assertRaises(TemplateError):
            self.generator.env.get_template("error.html").render()


class TestRewardTier(unittest.TestCase):
    """Test cases for reward tier calculation."""
    
    def test_tier_thresholds(self):
        """Test that reward tiers have the correct thresholds."""
        # Bronze tier (0-100 km)
        self.assertEqual(calculate_reward_tier(0), "Bronze")
        self.assertEqual(calculate_reward_tier(50), "Bronze")
        self.assertEqual(calculate_reward_tier(100), "Bronze")
        
        # Silver tier (101-250 km)
        self.assertEqual(calculate_reward_tier(101), "Silver")
        self.assertEqual(calculate_reward_tier(175), "Silver")
        self.assertEqual(calculate_reward_tier(250), "Silver")
        
        # Gold tier (251-500 km)
        self.assertEqual(calculate_reward_tier(251), "Gold")
        self.assertEqual(calculate_reward_tier(375), "Gold")
        self.assertEqual(calculate_reward_tier(500), "Gold")
        
        # Platinum tier (501-1000 km)
        self.assertEqual(calculate_reward_tier(501), "Platinum")
        self.assertEqual(calculate_reward_tier(750), "Platinum")
        self.assertEqual(calculate_reward_tier(1000), "Platinum")
        
        # Diamond tier (1001+ km)
        self.assertEqual(calculate_reward_tier(1001), "Diamond")
        self.assertEqual(calculate_reward_tier(5000), "Diamond")