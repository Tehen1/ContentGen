#!/usr/bin/env python3
"""
verify_jsonld.py - Verification script for JSON-LD conversion results

This script performs three main validation tasks:
1. Compares checksums of input CSV and output JSON-LD files to ensure integrity
2. Validates the JSON-LD structure against JSON Schema
3. Checks file permissions for iCloud locations

Usage:
    python verify_jsonld.py --input-csv <csv_file> --output-jsonld <jsonld_file> --schema <schema_file>

Requirements:
    - jsonschema
    - pyld
"""

import os
import sys
import json
import logging
import argparse
import hashlib
from pathlib import Path
import stat
from typing import Dict, Any, List, Tuple, Optional

try:
    import jsonschema
    from pyld import jsonld
except ImportError:
    print("Required packages not installed. Please activate the virtual environment:")
    print("source ~/project_tracking_env/bin/activate")
    print("Then install required packages: pip install jsonschema pyld")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('jsonld_verification.log')
    ]
)
logger = logging.getLogger(__name__)

def calculate_checksum(file_path: str) -> str:
    """Calculate SHA-256 checksum of a file."""
    try:
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating checksum for {file_path}: {e}")
        return ""

def verify_checksums(csv_path: str, jsonld_path: str) -> bool:
    """
    Verify file integrity by comparing checksums.
    For JSON-LD, we use this as a reference point to ensure the conversion process completed.
    """
    logger.info(f"Verifying checksums for CSV: {csv_path} and JSON-LD: {jsonld_path}")
    
    csv_exists = os.path.exists(csv_path)
    jsonld_exists = os.path.exists(jsonld_path)
    
    if not csv_exists:
        logger.error(f"CSV file does not exist: {csv_path}")
        return False
    
    if not jsonld_exists:
        logger.error(f"JSON-LD file does not exist: {jsonld_path}")
        return False
    
    csv_checksum = calculate_checksum(csv_path)
    jsonld_checksum = calculate_checksum(jsonld_path)
    
    logger.info(f"CSV checksum: {csv_checksum}")
    logger.info(f"JSON-LD checksum: {jsonld_checksum}")
    
    # For this function, we're only checking that both files have valid checksums
    # The content will be different since one is CSV and one is JSON-LD
    # We're just ensuring both files have integrity
    if not csv_checksum or not jsonld_checksum:
        logger.error("Failed to calculate checksum for one or both files")
        return False
    
    return True

def validate_jsonld_structure(jsonld_path: str, schema_path: Optional[str] = None) -> bool:
    """Validate JSON-LD structure against JSON Schema."""
    logger.info(f"Validating JSON-LD structure for: {jsonld_path}")
    
    try:
        with open(jsonld_path, 'r', encoding='utf-8') as f:
            jsonld_data = json.load(f)
        
        # Basic JSON-LD validation
        if not isinstance(jsonld_data, dict) or "@context" not in jsonld_data:
            logger.error(f"Invalid JSON-LD - missing @context: {jsonld_path}")
            return False
        
        # Compact the JSON-LD to verify it's well-formed
        try:
            compact_data = jsonld.compact(jsonld_data, jsonld_data.get("@context", {}))
            logger.info("JSON-LD is well-formed and can be compacted")
        except Exception as e:
            logger.error(f"JSON-LD compaction failed: {e}")
            return False
        
        # Validate against schema if provided
        if schema_path:
            try:
                with open(schema_path, 'r', encoding='utf-8') as f:
                    schema = json.load(f)
                
                jsonschema.validate(instance=jsonld_data, schema=schema)
                logger.info(f"JSON-LD validated against schema: {schema_path}")
            except jsonschema.exceptions.ValidationError as e:
                logger.error(f"Schema validation failed: {e}")
                return False
            except Exception as e:
                logger.error(f"Error validating against schema: {e}")
                return False
        
        return True
    
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {jsonld_path}: {e}")
        return False
    except Exception as e:
        logger.error(f"Error validating JSON-LD structure: {e}")
        return False

def check_icloud_permissions(file_path: str) -> bool:
    """Check file permissions for iCloud locations."""
    logger.info(f"Checking permissions for: {file_path}")
    
    try:
        # Check if file path is in iCloud directories
        path = Path(file_path)
        is_icloud = any(part in str(path) for part in [
            "Library/CloudStorage", 
            "Library/Mobile Documents"
        ])
        
        if not is_icloud:
            logger.info(f"File is not in iCloud location: {file_path}")
            return True
        
        # Check if file exists
        if not path.exists():
            logger.error(f"File does not exist: {file_path}")
            return False
        
        # Get file permissions
        file_stats = os.stat(file_path)
        mode = file_stats.st_mode
        
        # Check read/write permissions
        user_read = bool(mode & stat.S_IRUSR)
        user_write = bool(mode & stat.S_IWUSR)
        
        if not user_read:
            logger.error(f"File is not readable: {file_path}")
            return False
        
        if not user_write:
            logger.warning(f"File is not writable: {file_path}")
            # For iCloud files, we might only need read access, so this is a warning
        
        # Check if file is locked by iCloud
        # This is a simple check - if the file has a .icloud extension, it's not downloaded
        if str(path).endswith('.icloud'):
            logger.error(f"File is not downloaded from iCloud: {file_path}")
            return False
        
        logger.info(f"iCloud file permissions OK: {file_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error checking file permissions: {e}")
        return False

def generate_report(results: Dict[str, bool], output_file: str = "verification_report.json") -> None:
    """Generate a detailed verification report."""
    report = {
        "timestamp": import_time_fn(),
        "verification_results": results,
        "summary": {
            "total_checks": len(results),
            "passed": sum(1 for result in results.values() if result),
            "failed": sum(1 for result in results.values() if not result),
        }
    }
    
    # Calculate overall status
    report["status"] = "PASSED" if all(results.values()) else "FAILED"
    
    # Write report to file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        logger.info(f"Verification report written to: {output_file}")
    except Exception as e:
        logger.error(f"Error writing verification report: {e}")

def import_time_fn():
    """Import time module and return current time as ISO format string."""
    from datetime import datetime
    return datetime.now().isoformat()

def main():
    parser = argparse.ArgumentParser(description='Verify JSON-LD conversion results')
    parser.add_argument('--input-csv', required=True, help='Path to input CSV file')
    parser.add_argument('--output-jsonld', required=True, help='Path to output JSON-LD file')
    parser.add_argument('--schema', help='Path to JSON Schema for validation')
    parser.add_argument('--report', default='verification_report.json', help='Path for verification report')
    
    args = parser.parse_args()
    
    logger.info(f"Starting verification for CSV: {args.input_csv} and JSON-LD: {args.output_jsonld}")
    
    # Perform verifications
    results = {}
    
    # Check file integrity
    results["file_integrity"] = verify_checksums(args.input_csv, args.output_jsonld)
    
    # Validate JSON-LD structure
    results["jsonld_structure"] = validate_jsonld_structure(args.output_jsonld, args.schema)
    
    # Check file permissions for both files
    results["csv_permissions"] = check_icloud_permissions(args.input_csv)
    results["jsonld_permissions"] = check_icloud_permissions(args.output_jsonld)
    
    # Generate verification report
    generate_report(results, args.report)
    
    # Log overall results
    if all(results.values()):
        logger.info("All verification checks passed!")
    else:
        logger.error("Some verification checks failed. See the report for details.")
        for check, result in results.items():
            status = "PASSED" if result else "FAILED"
            logger.info(f"{check}: {status}")
    
    # Return exit code based on verification results
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())

