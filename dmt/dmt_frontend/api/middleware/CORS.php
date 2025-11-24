<?php
/**
 * CORS Middleware
 * Handle Cross-Origin Resource Sharing
 */

class CORSMiddleware {

    /**
     * Apply CORS headers
     */
    public static function handle(): void {
        // Allow all origins for development (restrict in production!)
        $allowed_origins = getenv('ALLOWED_ORIGINS') ?: '*';

        header("Access-Control-Allow-Origin: $allowed_origins");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 3600");

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
    }
}
