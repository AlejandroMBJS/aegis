<?php
/**
 * Rate Limiter
 *
 * Implements rate limiting to prevent brute force attacks
 * and API abuse. Uses file-based storage for simplicity.
 *
 * For production, consider using Redis or Memcached for better performance.
 */

class RateLimiter {
    private $max_requests;
    private $time_window; // in seconds
    private $storage_path;

    /**
     * Constructor
     *
     * @param int $max_requests Maximum requests allowed in time window
     * @param int $time_window Time window in seconds
     */
    public function __construct(int $max_requests = 60, int $time_window = 60) {
        $this->max_requests = $max_requests;
        $this->time_window = $time_window;
        $this->storage_path = __DIR__ . '/../logs/rate_limit/';

        // Create storage directory if it doesn't exist
        if (!is_dir($this->storage_path)) {
            mkdir($this->storage_path, 0755, true);
        }
    }

    /**
     * Check if request is allowed
     *
     * @param string $identifier Unique identifier (IP address, user ID, etc.)
     * @return bool True if request is allowed
     */
    public function isAllowed(string $identifier): bool {
        $identifier = $this->sanitizeIdentifier($identifier);
        $file_path = $this->storage_path . $identifier . '.json';

        // Get current requests
        $requests = $this->getRequests($file_path);

        // Remove old requests outside time window
        $current_time = time();
        $requests = array_filter($requests, function($timestamp) use ($current_time) {
            return ($current_time - $timestamp) < $this->time_window;
        });

        // Check if limit exceeded
        if (count($requests) >= $this->max_requests) {
            return false;
        }

        // Add current request
        $requests[] = $current_time;

        // Save requests
        $this->saveRequests($file_path, $requests);

        return true;
    }

    /**
     * Get remaining requests
     *
     * @param string $identifier Unique identifier
     * @return int Remaining requests
     */
    public function getRemaining(string $identifier): int {
        $identifier = $this->sanitizeIdentifier($identifier);
        $file_path = $this->storage_path . $identifier . '.json';

        $requests = $this->getRequests($file_path);
        $current_time = time();

        // Remove old requests
        $requests = array_filter($requests, function($timestamp) use ($current_time) {
            return ($current_time - $timestamp) < $this->time_window;
        });

        return max(0, $this->max_requests - count($requests));
    }

    /**
     * Get retry after seconds
     *
     * @param string $identifier Unique identifier
     * @return int Seconds until rate limit resets
     */
    public function getRetryAfter(string $identifier): int {
        $identifier = $this->sanitizeIdentifier($identifier);
        $file_path = $this->storage_path . $identifier . '.json';

        $requests = $this->getRequests($file_path);

        if (empty($requests)) {
            return 0;
        }

        $oldest_request = min($requests);
        $retry_after = $this->time_window - (time() - $oldest_request);

        return max(0, $retry_after);
    }

    /**
     * Sanitize identifier to prevent directory traversal
     */
    private function sanitizeIdentifier(string $identifier): string {
        return preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $identifier);
    }

    /**
     * Get requests from file
     */
    private function getRequests(string $file_path): array {
        if (!file_exists($file_path)) {
            return [];
        }

        $content = file_get_contents($file_path);
        $requests = json_decode($content, true);

        return is_array($requests) ? $requests : [];
    }

    /**
     * Save requests to file
     */
    private function saveRequests(string $file_path, array $requests): void {
        file_put_contents($file_path, json_encode($requests));
    }

    /**
     * Clean up old rate limit files (call periodically)
     */
    public function cleanup(): void {
        $files = glob($this->storage_path . '*.json');
        $current_time = time();

        foreach ($files as $file) {
            $file_time = filemtime($file);

            // Delete files older than 2x time window
            if (($current_time - $file_time) > ($this->time_window * 2)) {
                unlink($file);
            }
        }
    }
}
