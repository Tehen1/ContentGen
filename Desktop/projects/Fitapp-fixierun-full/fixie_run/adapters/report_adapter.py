"""
Report adaptation functionality for Fixie.Run.
Transforms standard cycling reports into Fixie.Run branded reports
with blockchain and rewards information.
"""

import re
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

from fixie_run.config import settings
from fixie_run.core.rewards import ActivityData, calculate_rewards, rewards_to_dict

logger = logging.getLogger(__name__)

class ReportAdapterError(Exception):
    """Base exception for report adaptation failures."""
    pass

class InputFileNotFoundError(ReportAdapterError):
    """Raised when input file is missing."""
    pass

class ReportParsingError(ReportAdapterError):
    """Raised when report cannot be parsed correctly."""
    pass

def extract_cycling_stats(content: str) -> ActivityData:
    """
    Extract cycling statistics from report content.
    
    Args:
        content: Raw report content as string
        
    Returns:
        ActivityData object with extracted metrics
        
    Raises:
        ReportParsingError: If required metrics cannot be extracted
    """
    # Compile regular expressions for better performance
    distance_pattern = re.compile(r"Total distance cycled: (\d+\.\d+) km")
    duration_pattern = re.compile(r"Total time spent cycling: (\d+\.\d+) hours")
    speed_pattern = re.compile(r"Average cycling speed: (\d+\.\d+) km/h")
    activities_pattern = re.compile(r"Total number of cycling activities: (\d+)")
    elevation_pattern = re.compile(r"Total elevation gain: (\d+\.\d+) m")
    
    # Extract values
    try:
        distance_match = distance_pattern.search(content)
        duration_match = duration_pattern.search(content)
        
        # These are required fields
        if not distance_match or not duration_match:
            raise ReportParsingError("Could not extract required metrics (distance or duration)")
            
        distance = float(distance_match.group(1))
        duration = float(duration_match.group(1))
        
        # These are optional fields
        speed = float(speed_pattern.search(content).group(1)) if speed_pattern.search(content) else None
        activities = int(activities_pattern.search(content).group(1)) if activities_pattern.search(content) else None
        elevation = float(elevation_pattern.search(content).group(1)) if elevation_pattern.search(content) else None
        
        return ActivityData(
            distance_km=distance,
            duration_hours=duration,
            avg_speed=speed,
            num_activities=activities,
            elevation_m=elevation
        )
    except (ValueError, AttributeError) as e:
        raise ReportParsingError(f"Failed to parse cycling statistics: {e}")

def adapt_report(
    input_path: Path,
    output_path: Path,
    include_rewards: bool = True,
    include_blockchain: bool = True
) -> bool:
    """
    Adapt a cycling report to Fixie.Run format.
    
    Args:
        input_path: Path to input report file
        output_path: Path to output report file
        include_rewards: Whether to include token rewards section
        include_blockchain: Whether to include blockchain integration section
        
    Returns:
        bool: True if successful, False otherwise
        
    Raises:
        InputFileNotFoundError: If input file doesn't exist
        ReportParsingError: If report parsing fails
    """
    logger.info(f"Adapting report: {input_path} -> {output_path}")
    
    # Validate input file
    if not input_path.exists():
        raise InputFileNotFoundError(f"Input file not found: {input_path}")
    
    try:
        # Read input file
        content = input_path.read_text()
        
        # Extract cycling statistics
        activity_data = extract_cycling_stats(content)
        
        # Calculate rewards if enabled
        rewards = calculate_rewards(activity_data) if include_rewards else None
        
        # Replace title
        content = content.replace("# Cycling Activity Analysis", "# Fixie.Run: Your Cycling Activity on zkEVM")
        
        # Add blockchain section if enabled
        if include_blockchain:
            blockchain_intro = """
## Blockchain Integration

Your cycling data has been securely processed and is ready for zkEVM integration. With Fixie.Run, your activities are:

* **Verifiable**: Generate zero-knowledge proofs of your rides without revealing sensitive data
* **Rewarding**: Earn FIXIE tokens for your cycling efforts
* **Private**: You control your data - no third-party access without your permission
* **Sustainable**: Your cycling activity contributes to reducing carbon footprints, tracked on-chain
"""
            # Insert after basic statistics section
            content = re.sub(
                r"(## Basic Statistics.*?)(\\n## )",
                r"\1" + blockchain_intro + r"\2",
                content,
                flags=re.DOTALL
            )
        
        # Add rewards section if enabled
        if include_rewards and rewards:
            token_rewards = f"""
## Token Rewards 🏆

Based on your cycling activity, you've earned:

| Reward Type | Amount (FIXIE) |
|-------------|----------------|
| Base Rewards | {rewards.base} |
| Distance Bonus | {rewards.distance} |
| Time Commitment | {rewards.time} |
| Weekly Challenge Bonus | {rewards.weekly_bonus} |
| **TOTAL FIXIE TOKENS** | **{rewards.total}** |

Connect your wallet to claim these rewards and participate in weekly challenges!

### Weekly Challenge: Mountain Climber

Earn an additional 25 FIXIE tokens by climbing 500+ meters of elevation this week.

Current progress: {activity_data.elevation_m if activity_data.elevation_m else 0} meters

### Community Leaderboard

Your riding ranks you in the top 15% of Fixie.Run users in your area.
"""
            # Insert rewards section before summary
            content = re.sub(r"(## Summary)", token_rewards + r"\n\1", content)
        
        # Update image references
        for orig, new in settings.VISUALIZATION_MAPPING.items():
            content = content.replace(orig, new)
        
        # Add privacy note
        privacy_note = """
### Privacy Protection with zkEVM

Your data is protected using zero-knowledge proofs, allowing you to prove your activities
without revealing sensitive details like exact routes or locations.
"""
        # Add before conclusion
        if "## Conclusion" in content:
            content = content.replace("## Conclusion", privacy_note + "\n## Conclusion")
        else:
            content += "\n" + privacy_note
        
        # Update generation timestamp
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if "_Generated on:" in content:
            content = re.sub(
                r"_Generated on:.*?_",
                f"_Generated on: {current_time} - Powered by Fixie.Run on zkEVM_",
                content
            )
        else:
            content += f"\n\n_Generated on: {current_time} - Powered by Fixie.Run on zkEVM_"
        
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write output file
        output_path.write_text(content)
        
        logger.info(f"Successfully adapted report to: {output_path}")
        return True
        
    except (ReportParsingError, InputFileNotFoundError) as e:
        # Re-raise known exceptions
        raise
    except Exception as e:
        # Catch all other exceptions and convert to appropriate error
        logger.exception(f"Error adapting report: {e}")
        raise ReportAdapterError(f"Failed to adapt report: {e}")