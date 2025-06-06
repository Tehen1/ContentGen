#!/usr/bin/env python3
"""
CSV to JSON-LD Converter for Project Tracking Data

This script converts project tracking CSV files to JSON-LD format.
Features:
- Multi-format CSV parsing (UTF-8, Windows-1252)
- Dynamic @context generation based on CSV headers
- Section mapping for common project tracking fields
- Error logging for malformed rows
- Automated file saving to specified directory
"""

import os
import sys
import json
import logging
import argparse
import traceback
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

import pandas as pd
from slugify import slugify
from pyld import jsonld


def setup_logging(log_path: str) -> logging.Logger:
    """Configure logging to file and console."""
    logger = logging.getLogger('csv_to_jsonld')
    logger.setLevel(logging.INFO)
    
    # File handler
    file_handler = logging.FileHandler(log_path)
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter('%(levelname)s: %(message)s')
    console_handler.setFormatter(console_format)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def detect_encoding(file_path: str) -> str:
    """Attempt to detect file encoding."""
    encodings = ['utf-8', 'windows-1252', 'latin-1', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                f.read()
                return encoding
        except UnicodeDecodeError:
            continue
    
    # If no encoding worked, return utf-8 as default and let pandas handle errors
    return 'utf-8'


def read_csv_file(file_path: str, logger: logging.Logger) -> Optional[pd.DataFrame]:
    """Read a CSV file with encoding detection."""
    try:
        encoding = detect_encoding(file_path)
        logger.info(f"Detected encoding for {file_path}: {encoding}")
        
        # Try with different separators if needed
        for sep in [',', ';', '\t']:
            try:
                df = pd.read_csv(file_path, encoding=encoding, sep=sep, 
                                 on_bad_lines='warn', low_memory=False)
                if len(df.columns) > 1:  # Successful parsing should have multiple columns
                    logger.info(f"Successfully parsed with separator: '{sep}'")
                    return df
            except Exception as e:
                logger.debug(f"Failed with separator '{sep}': {str(e)}")
        
        # If all separators failed, try with automatic detection
        df = pd.read_csv(file_path, encoding=encoding, sep=None, engine='python', 
                         on_bad_lines='warn', low_memory=False)
        return df
        
    except Exception as e:
        logger.error(f"Error reading {file_path}: {str(e)}")
        return None


def create_context_from_headers(headers: List[str]) -> Dict[str, Any]:
    """Create a JSON-LD @context object from CSV headers."""
    context = {
        "schema": "http://schema.org/",
        "tracking": {
            "@id": "https://techen.inc/tracking#",
            "@prefix": True
        },
        "project": "schema:Project",
        "task": "schema:Action",
        "owner": "schema:agent",
        "due_date": "schema:dueDate"
    }
    
    # Map common CSV headers to schema.org or tracking vocabulary terms
    field_mappings = {
        # Common project fields
        "project": "schema:name",
        "project_name": "schema:name",
        "description": "schema:description",
        "status": "schema:status",
        "priority": "tracking:priority",
        "start_date": "schema:startDate",
        "end_date": "schema:endDate",
        "due_date": "schema:dueDate",
        "deadline": "schema:dueDate",
        
        # Resource/person fields
        "owner": "schema:agent",
        "manager": "schema:manager",
        "assignee": "schema:agent",
        "team": "schema:contributor",
        "department": "schema:department",
        
        # Task fields
        "task": "schema:name",
        "task_name": "schema:name",
        "task_description": "schema:description",
        "task_status": "schema:status",
        "percent_complete": "tracking:percentComplete",
        "completed": "tracking:isComplete",
        
        # Tracking fields
        "id": "schema:identifier",
        "project_id": "schema:identifier",
        "task_id": "schema:identifier",
        "created_at": "schema:dateCreated",
        "updated_at": "schema:dateModified",
        "created_by": "schema:creator",
        "modified_by": "schema:editor",
        
        # Notes and comments
        "notes": "schema:comment",
        "comments": "schema:comment",
        "feedback": "schema:comment"
    }
    
    # Add all headers to the context with appropriate mapping
    for header in headers:
        # Create a slugified version of the header for consistent property naming
        slug = slugify(header, separator='_')
        
        # Use predefined mapping or create a custom tracking term
        if slug.lower() in field_mappings:
            context[slug] = field_mappings[slug.lower()]
        else:
            context[slug] = f"tracking:{slug}"
    
    return {"@context": context}


def csv_row_to_jsonld(row: pd.Series, context: Dict[str, Any], 
                      row_index: int, filename: str) -> Dict[str, Any]:
    """Convert a CSV row to a JSON-LD object."""
    # Create base document with context
    doc = {"@context": context["@context"]}
    
    # Add @type - determine if it's a project or task based on fields
    if any(col in row.index for col in ["project", "project_name", "project_id"]):
        doc["@type"] = "project"
    elif any(col in row.index for col in ["task", "task_name", "task_id"]):
        doc["@type"] = "task"
    else:
        doc["@type"] = "tracking:ProjectItem"
    
    # Generate an ID if none exists in the data
    id_field = next((f for f in row.index if f.lower() in ["id", "project_id", "task_id"]), None)
    if id_field and not pd.isna(row[id_field]):
        doc["@id"] = f"tracking:{slugify(str(row[id_field]))}"
    else:
        # Create an ID based on filename and row number
        base_name = os.path.splitext(os.path.basename(filename))[0]
        doc["@id"] = f"tracking:{slugify(base_name)}_{row_index}"
    
    # Add all non-null fields from the row
    for col in row.index:
        if not pd.isna(row[col]):
            # Clean the column name to match context keys
            clean_col = slugify(col, separator='_')
            
            # Convert value to appropriate type
            value = row[col]
            
            # Handle date fields
            if any(date_term in clean_col.lower() for date_term in ["date", "deadline", "created_at", "updated_at"]):
                try:
                    # Try to parse as date if it's a string
                    if isinstance(value, str):
                        # Try various date formats
                        for fmt in ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d %H:%M:%S"]:
                            try:
                                parsed_date = datetime.strptime(value, fmt)
                                value = parsed_date.isoformat()
                                break
                            except ValueError:
                                continue
                except Exception:
                    # If parsing fails, keep the original value
                    pass
            
            # Handle boolean values
            elif clean_col.lower() in ["completed", "is_complete"]:
                if isinstance(value, str):
                    value = value.lower() in ["yes", "true", "1", "y", "t", "complete", "completed"]
            
            # Add the property to the document
            doc[clean_col] = value
    
    return doc


def process_csv_file(file_path: str, output_dir: str, logger: logging.Logger) -> Tuple[int, int]:
    """Process a single CSV file and convert to JSON-LD."""
    logger.info(f"Processing file: {file_path}")
    
    df = read_csv_file(file_path, logger)
    if df is None:
        return 0, 0
    
    # Create dynamic context from headers
    context = create_context_from_headers(df.columns)
    logger.info(f"Generated context with {len(context['@context'])} terms")
    
    # Process each row
    success_count = 0
    error_count = 0
    jsonld_docs = []
    
    for idx, row in df.iterrows():
        try:
            doc = csv_row_to_jsonld(row, context, idx, file_path)
            jsonld_docs.append(doc)
            success_count += 1
        except Exception as e:
            error_count += 1
            logger.error(f"Error processing row {idx} of {file_path}: {str(e)}")
            logger.debug(traceback.format_exc())
    
    # Save to output directory
    if jsonld_docs:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(output_dir, f"{base_name}.jsonld")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(jsonld_docs, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved {len(jsonld_docs)} documents to {output_path}")
    
    return success_count, error_count


def find_csv_files(input_pattern: str) -> List[str]:
    """Find CSV files matching the input pattern."""
    import glob
    
    # Path whitelist for security
    whitelisted_paths = [
        os.path.expanduser("~/CascadaProjects/"),
        os.path.expanduser("~/Library/CloudStorage/"),
        os.path.expanduser("~/Library/Mobile Documents/"),
        os.path.expanduser("~/temp_repo/")
    ]
    
    # Ensure pattern includes .csv extension if not already specified
    if not input_pattern.endswith('.csv'):
        input_pattern = f"{input_pattern}*.csv"
    
    all_files = []
    for base_path in whitelisted_paths:
        if os.path.exists(base_path):
            pattern = os.path.join(base_path, "**", input_pattern)
            all_files.extend(glob.glob(pattern, recursive=True))
    
    return all_files


def main():
    """Main function to run the script."""
    parser = argparse.ArgumentParser(description='Convert CSV files to JSON-LD format')
    parser.add_argument('--input-pattern', type=str, default='*project_tracking*.csv',
                        help='Glob pattern for input CSV files')
    parser.add_argument('--output-dir', type=str, 
                        default=os.path.expanduser('~/project_tracking_jsonld'),
                        help='Directory to save JSON-LD output')
    parser.add_argument('--error-log', type=str, 
                        default=os.path.expanduser('~/jsonld_errors.log'),
                        help='Path to error log file')
    parser.add_argument('--input-files', type=str, nargs='+',
                        help='Specific CSV files to process')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Setup logging
    logger = setup_logging(args.error_log)
    logger.info(f"=== CSV to JSON-LD Conversion Started at {datetime.now().isoformat()} ===")
    
    # Get list of files to process
    if args.input_files:
        csv_files = args.input_files
    else:
        csv_files = find_csv_files(args.input_pattern)
    
    logger.info(f"Found {len(csv_files)} CSV files to process")
    
    # Process each file
    total_success = 0
    total_errors = 0
    
    for file_path in csv_files:
        try:
            success, errors = process_csv_file(file_path, args.output_dir, logger)
            total_success += success
            total_errors += errors
        except Exception as e:
            logger.error(f"Failed to process {file_path}: {str(e)}")
            logger.debug(traceback.format_exc())
    
    logger.info(f"=== Conversion Completed ===")
    logger.info(f"Total records processed successfully: {total_success}")
    logger.info(f"Total errors: {total_errors}")
    logger.info(f"Output saved to: {args.output_dir}")


if __name__ == "__main__":
    main()

