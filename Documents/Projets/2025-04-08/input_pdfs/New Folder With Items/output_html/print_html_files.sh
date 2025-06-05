#!/bin/bash

# print_html_files.sh
# This script loops through all HTML files in the current directory,
# converts each to PDF using macOS's built-in tools, and prints them
# in double-sided mode (duplex=two-sided-long-edge).

# Create a temporary directory to store the PDF files
echo "Creating temporary directory for PDF files..."
TEMP_DIR=$(mktemp -d)
echo "Temporary directory created at: $TEMP_DIR"

# Count the number of HTML files in the current directory
HTML_FILES_COUNT=$(ls -1 *.html 2>/dev/null | wc -l)
if [ "$HTML_FILES_COUNT" -eq 0 ]; then
    echo "No HTML files found in the current directory."
    exit 1
fi

echo "Found $HTML_FILES_COUNT HTML files to process."
echo "Starting conversion and printing process..."

# Loop through all HTML files in the current directory
for HTML_FILE in *.html; do
    # Check if the file exists and is a regular file
    if [ -f "$HTML_FILE" ]; then
        echo "Processing: $HTML_FILE"
        
        # Get the base name of the file (without extension)
        BASENAME=$(basename "$HTML_FILE" .html)
        
        # Define the output PDF path
        PDF_FILE="$TEMP_DIR/$BASENAME.pdf"
        
        # Step 1: Convert HTML to PDF using textutil and cupsfilter
        # textutil converts HTML to RTF, then cupsfilter converts RTF to PDF
        echo "  Converting to PDF..."
        textutil -convert rtf -output "$TEMP_DIR/$BASENAME.rtf" "$HTML_FILE"
        cupsfilter "$TEMP_DIR/$BASENAME.rtf" > "$PDF_FILE"
        
        # Alternative conversion method using Safari's command line capabilities
        # Uncomment if the textutil method doesn't work well for your files
        # echo "  Converting to PDF using Safari..."
        # /usr/bin/safari -i "$HTML_FILE" -o "$PDF_FILE"
        
        # Step 2: Print the PDF in double-sided mode
        echo "  Printing PDF in double-sided mode..."
        lp -d "$(lpstat -d | awk '{print $NF}')" \
           -o sides=two-sided-long-edge \
           -o media=a4 \
           "$PDF_FILE"
        
        echo "  Completed: $HTML_FILE"
    fi
done

# Clean up the temporary files
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "All HTML files have been converted and sent to the printer."
echo "Double-sided printing (duplex=two-sided-long-edge) was enabled."

