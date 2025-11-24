<?php
/**
 * Input Validator
 *
 * Comprehensive input validation to prevent security vulnerabilities
 * Implements validation rules for different data types
 */

class Validator {

    /**
     * Validate email address
     *
     * @param string $email Email to validate
     * @return bool True if valid
     */
    public static function email(string $email): bool {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate username
     * Only alphanumeric, underscore, and hyphen allowed
     * Length: 3-50 characters
     *
     * @param string $username Username to validate
     * @return bool True if valid
     */
    public static function username(string $username): bool {
        return preg_match('/^[a-zA-Z0-9_-]{3,50}$/', $username) === 1;
    }

    /**
     * Validate password strength
     * Minimum 8 characters, at least one letter and one number
     *
     * @param string $password Password to validate
     * @return bool True if valid
     */
    public static function password(string $password): bool {
        // At least 8 characters, one letter, one number
        return strlen($password) >= 8 &&
               preg_match('/[a-zA-Z]/', $password) === 1 &&
               preg_match('/[0-9]/', $password) === 1;
    }

    /**
     * Validate integer within range
     *
     * @param mixed $value Value to validate
     * @param int|null $min Minimum value (inclusive)
     * @param int|null $max Maximum value (inclusive)
     * @return bool True if valid
     */
    public static function integer($value, ?int $min = null, ?int $max = null): bool {
        if (!is_numeric($value)) {
            return false;
        }

        $int_value = (int)$value;

        if ($min !== null && $int_value < $min) {
            return false;
        }

        if ($max !== null && $int_value > $max) {
            return false;
        }

        return true;
    }

    /**
     * Validate float within range
     *
     * @param mixed $value Value to validate
     * @param float|null $min Minimum value (inclusive)
     * @param float|null $max Maximum value (inclusive)
     * @return bool True if valid
     */
    public static function float($value, ?float $min = null, ?float $max = null): bool {
        if (!is_numeric($value)) {
            return false;
        }

        $float_value = (float)$value;

        if ($min !== null && $float_value < $min) {
            return false;
        }

        if ($max !== null && $float_value > $max) {
            return false;
        }

        return true;
    }

    /**
     * Validate string length
     *
     * @param string $value String to validate
     * @param int $min_length Minimum length
     * @param int $max_length Maximum length
     * @return bool True if valid
     */
    public static function stringLength(string $value, int $min_length, int $max_length): bool {
        $length = strlen($value);
        return $length >= $min_length && $length <= $max_length;
    }

    /**
     * Validate date format (ISO 8601)
     *
     * @param string $date Date string to validate
     * @return bool True if valid
     */
    public static function date(string $date): bool {
        $parsed = date_parse($date);
        return $parsed !== false && $parsed['error_count'] === 0;
    }

    /**
     * Validate enum value (value in allowed list)
     *
     * @param mixed $value Value to validate
     * @param array $allowed_values List of allowed values
     * @return bool True if valid
     */
    public static function enum($value, array $allowed_values): bool {
        return in_array($value, $allowed_values, true);
    }

    /**
     * Validate role
     *
     * @param string $role Role to validate
     * @return bool True if valid
     */
    public static function role(string $role): bool {
        $valid_roles = ['Admin', 'Inspector', 'Operator', 'Tech Engineer', 'Quality Engineer'];
        return in_array($role, $valid_roles, true);
    }

    /**
     * Sanitize HTML to prevent XSS
     *
     * @param string $html HTML to sanitize
     * @return string Sanitized HTML
     */
    public static function sanitizeHtml(string $html): string {
        return htmlspecialchars($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Validate and sanitize file path
     * Prevents directory traversal attacks
     *
     * @param string $path Path to validate
     * @return bool True if valid
     */
    public static function filePath(string $path): bool {
        // Check for directory traversal attempts
        if (strpos($path, '..') !== false) {
            return false;
        }

        if (strpos($path, './') !== false) {
            return false;
        }

        // Check for null bytes
        if (strpos($path, "\0") !== false) {
            return false;
        }

        return true;
    }

    /**
     * Validate UUID
     *
     * @param string $uuid UUID to validate
     * @return bool True if valid
     */
    public static function uuid(string $uuid): bool {
        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';
        return preg_match($pattern, $uuid) === 1;
    }

    /**
     * Validate URL
     *
     * @param string $url URL to validate
     * @return bool True if valid
     */
    public static function url(string $url): bool {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Validate IP address
     *
     * @param string $ip IP address to validate
     * @return bool True if valid
     */
    public static function ip(string $ip): bool {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }
}
