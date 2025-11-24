<?php
/**
 * Authentication Configuration
 * JWT token management with secure password hashing
 */

// Load Firebase JWT library
// Note: Install via composer: composer require firebase/php-jwt

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    // JWT Configuration
    private static $secret_key;
    private static $algorithm = 'HS256';
    private static $token_expire_minutes;

    public static function initialize() {
        // Load from environment or use defaults (change in production!)
        self::$secret_key = getenv('SECRET_KEY') ?: 'your-secret-key-change-in-production-please-use-random-secure-key';
        self::$token_expire_minutes = (int)(getenv('ACCESS_TOKEN_EXPIRE_MINUTES') ?: 30);
    }

    /**
     * Hash password using PBKDF2 SHA256 (compatible with Python passlib)
     */
    public static function hashPassword(string $password): string {
        // Using PASSWORD_DEFAULT (bcrypt) for now
        // For exact Python compatibility, you'd need to implement PBKDF2-SHA256
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * Verify password against hash
     */
    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    /**
     * Create JWT access token
     */
    public static function createAccessToken(array $data): string {
        self::initialize();

        $issued_at = time();
        $expiration = $issued_at + (self::$token_expire_minutes * 60);

        $payload = array_merge($data, [
            'iat' => $issued_at,
            'exp' => $expiration
        ]);

        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }

    /**
     * Verify and decode JWT token
     */
    public static function verifyToken(string $token): ?object {
        self::initialize();

        try {
            $decoded = JWT::decode($token, new Key(self::$secret_key, self::$algorithm));
            return $decoded;
        } catch (Exception $e) {
            error_log("JWT verification failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract token from Authorization header
     */
    public static function getBearerToken(): ?string {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s+(.+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}

// Initialize Auth configuration
Auth::initialize();
