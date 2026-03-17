
# -----------------------------
# Base image with Python
# -----------------------------
FROM python:3.10-slim

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Install dependencies
# -----------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------
# Copy API code + model artifacts
# -----------------------------
COPY app.py .
COPY ../model ./model

# -----------------------------
# Expose port for FastAPI
# -----------------------------
EXPOSE 8000

# -----------------------------
# Start the FastAPI server
# -----------------------------
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
