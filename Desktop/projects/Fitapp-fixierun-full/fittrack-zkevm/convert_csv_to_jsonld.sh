#!/bin/zsh

# Activate the virtual environment
source ~/project_tracking_env/bin/activate

# Run the Python script
python3 ~/csv_to_jsonld.py \
  --input-pattern "*project_tracking*.csv" \
  --output-dir ~/project_tracking_jsonld \
  --error-log ~/jsonld_errors.log
  
# Check exit status
if [ $? -eq 0 ]; then
  echo "Conversion completed successfully!"
else
  echo "Conversion failed. Check the error log for details."
fi

