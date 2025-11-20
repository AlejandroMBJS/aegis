FROM php:8.2-cli

# Set working directory
WORKDIR /app

# Copy frontend files
COPY . .

# Expose port
EXPOSE 8080

# Run PHP built-in server
CMD ["php", "-S", "0.0.0.0:8080"]
