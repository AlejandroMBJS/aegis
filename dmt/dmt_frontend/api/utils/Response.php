<?php
/**
 * Response Utility
 * JSON response helper with consistent formatting
 */

class Response {

    /**
     * Send JSON response
     */
    public static function json($data, int $status_code = 200, array $headers = []): void {
        http_response_code($status_code);
        header('Content-Type: application/json; charset=utf-8');

        foreach ($headers as $key => $value) {
            header("$key: $value");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Send success response
     */
    public static function success($data, int $status_code = 200): void {
        self::json($data, $status_code);
    }

    /**
     * Send error response
     */
    public static function error(string $message, int $status_code = 400, array $headers = []): void {
        self::json(['detail' => $message], $status_code, $headers);
    }

    /**
     * Send created response (201)
     */
    public static function created($data): void {
        self::json($data, 201);
    }

    /**
     * Send no content response (204)
     */
    public static function noContent(): void {
        http_response_code(204);
    }

    /**
     * Validate required fields in request data
     */
    public static function validateRequired(array $data, array $required_fields): void {
        $missing = [];

        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                $missing[] = $field;
            }
        }

        if (!empty($missing)) {
            self::error('Missing required fields: ' . implode(', ', $missing), 422);
            exit();
        }
    }

    /**
     * Sanitize input to prevent XSS
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }

        if (is_string($data)) {
            return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return $data;
    }
}
