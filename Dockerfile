# Use official Python 3.11 slim base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system packages (libpq for PostgreSQL, tesseract for OCR)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application code and ML datasets/models
COPY backend ./backend
COPY ml ./ml

# Default port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Start Uvicorn backend server optimized for 512MB RAM cap
CMD sh -c "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --limit-max-requests 1000 --timeout-keep-alive 30"
