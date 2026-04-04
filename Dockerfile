# Stage 1: Build the frontend (React + Vite)
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend
# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend runtime (Python + FastAPI)
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV (libGL) and other requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy structure: backend for logic, model for weighting
COPY backend/ ./backend/
COPY model/ ./model/

# Copy built frontend assets from first stage to a directory the backend can serve
COPY --from=build-stage /app/frontend/dist ./frontend-dist

# Create static directory for runtime image processing
RUN mkdir -p /app/backend/static

# Environment variable for legacy Keras support (required for this project's .keras model)
ENV TF_USE_LEGACY_KERAS=1
ENV PORT=8000

# Expose the application port
EXPOSE 8000

# Run the FastAPI server using uvicorn
# We run from the root directory so it can access both ./backend/ and ./model/
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
