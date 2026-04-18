FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Ensure output is unbuffered so logs flow directly to kubernetes/fluentbit
ENV PYTHONUNBUFFERED=1

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy script
COPY job-sync.py .

# Run the script when container launches
ENTRYPOINT ["python", "job-sync.py"]
