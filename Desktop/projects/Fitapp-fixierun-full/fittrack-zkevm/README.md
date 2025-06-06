# Project Tracking CSV to JSON-LD Conversion System

## Overview

This system provides a suite of tools to convert project tracking data from CSV format to JSON-LD (JSON for Linked Data) format. JSON-LD enables your project data to be machine-readable with semantic context, making it more useful for knowledge graphs, data integration, and advanced analytics.

Key features:
- Robust CSV parsing supporting multiple encodings (UTF-8, Windows-1252)
- Dynamic context generation based on CSV headers
- Standardized mapping for common project tracking fields
- Automated batch processing
- Validation and verification tools
- Scheduled execution options

## Installation & Setup

### Prerequisites
- Python 3.6 or higher
- pip (Python package installer)
- Basic understanding of command line operations

### Setup Steps

1. **Create a virtual environment**:
   ```bash
   python3 -m venv ~/project_tracking_env
   source ~/project_tracking_env/bin/activate
   ```

2. **Install required dependencies**:
   ```bash
   pip install pandas pyld python-slugify
   ```

3. **Create output directory**:
   ```bash
   mkdir -p ~/project_tracking_jsonld
   ```

4. **Clone or download the conversion scripts**:
   - `csv_to_jsonld.py`: Main conversion script
   - `verify_jsonld.py`: Validation script
   - `convert_csv_to_jsonld.sh`: Wrapper shell script
   - `project_tracking_schema.json`: JSON Schema for validation
   - `context_template.json`: Template for JSON-LD context

5. **Make scripts executable**:
   ```bash
   chmod +x convert_csv_to_jsonld.sh
   chmod +x csv_to_jsonld.py
   ```

6. **Optional: Set up automated execution**:
   ```bash
   cp com.techen.csvtojsonld.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.techen.csvtojsonld.plist
   ```

## Usage Examples

### Basic Conversion

Convert a single CSV file:
```bash
python csv_to_jsonld.py --input-file ~/path/to/project_tracking.csv --output-dir ~/project_tracking_jsonld
```

### Using the Shell Script Wrapper

Run the conversion with default settings:
```bash
./convert_csv_to_jsonld.sh
```

This automatically:
- Searches for files matching "*project_tracking*.csv"
- Outputs JSON-LD files to ~/project_tracking_jsonld
- Logs errors to ~/jsonld_errors.log

### Validating Converted Files

Validate JSON-LD files against the schema:
```bash
python verify_jsonld.py --input-dir ~/project_tracking_jsonld --schema project_tracking_schema.json
```

### Advanced Options

Specify custom patterns and encodings:
```bash
python csv_to_jsonld.py --input-pattern "*.csv" --encoding "windows-1252" --output-dir ~/custom_output
```

Generate verbose logs:
```bash
python csv_to_jsonld.py --input-file project_data.csv --verbose --error-log detailed_errors.log
```

## JSON-LD Structure Documentation

### Basic Structure

Each converted JSON-LD file follows this structure:
```json
{
  "@context": {
    "schema": "http://schema.org/",
    "tracking": {
      "@id": "https://techen.inc/tracking#",
      "@prefix": true
    },
    "project": "schema:Project",
    "task": "schema:Action",
    "owner": "schema:agent",
    "due_date": "schema:dueDate",
    // Additional fields from CSV headers...
  },
  "@type": "Project",
  "@id": "tracking:project/{unique-identifier}",
  // Project properties mapped from CSV data...
}
```

### Key Components

- **@context**: Defines the semantic vocabulary used in the document
- **@type**: Specifies the type of the resource (typically "Project")
- **@id**: Provides a unique identifier for the resource
- **Properties**: The project data fields mapped from the CSV

### Context Generation

The system dynamically generates context based on CSV headers by:
1. Converting headers to camelCase
2. Mapping known fields to standard vocabulary terms
3. Creating custom vocabulary terms for unknown fields

## Troubleshooting Guide

### Common Errors

| Error | Possible Cause | Solution |
|-------|---------------|----------|
| `UnicodeDecodeError` | CSV file encoding mismatch | Specify the encoding explicitly with `--encoding` parameter |
| `KeyError` | Missing required column in CSV | Ensure CSV has required headers or use `--flexible` flag |
| `PermissionError` | Insufficient file permissions | Check file permissions, especially for iCloud locations |
| `JSONDecodeError` | Malformed JSON-LD output | Check CSV for special characters or use `--sanitize` option |
| `ValidationError` | JSON-LD doesn't match schema | Review error log for specific validation failures |

### Logging and Debugging

- Check `~/jsonld_errors.log` for detailed error information
- Use `--verbose` flag for additional processing details
- Run with `--dry-run` to test without writing files

### File Access Issues

For iCloud and cloud storage locations:
- Ensure files are fully downloaded and not just placeholders
- Check that the application has necessary permissions
- If using automation, ensure background processes can access cloud storage

## CSV Header Mapping Reference

### Standard Field Mappings

| CSV Header | JSON-LD Property | Type | Description |
|------------|-----------------|------|-------------|
| name | schema:name | String | Project or task name |
| description | schema:description | String | Detailed description |
| start_date | schema:startDate | Date | Project start date |
| due_date | schema:dueDate | Date | Project deadline |
| owner | schema:agent | String | Person responsible |
| status | tracking:status | String | Current project status |
| priority | tracking:priority | String | Project importance level |
| completion | tracking:completionPercentage | Number | Percentage complete |
| tags | tracking:tags | Array | Project categories/tags |
| dependencies | tracking:dependsOn | Array | Related project IDs |

### Custom Mappings

The system can map additional CSV headers by:
1. Converting spaces to camelCase (e.g., "Last Updated" → "lastUpdated")
2. Removing special characters
3. Applying the "tracking:" namespace to custom fields

Headers with specific terms like "date", "time", "cost", or "id" receive special type handling.

---

## Contributing

Please submit any bugs, feature requests, or improvements through our issue tracker.

## License

This software is copyright Techen Inc. and is provided under an MIT license.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
