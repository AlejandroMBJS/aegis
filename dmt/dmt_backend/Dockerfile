FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "test -f init_data.py && python init_data.py || true && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]

