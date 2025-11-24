<?php
/**
 * Authentication Middleware
 * Verify JWT tokens and check user roles
 */

require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {

    /**
     * Require valid JWT token and return user data
     */
    public static function requireAuth(): array {
        $token = Auth::getBearerToken();

        if (!$token) {
            Response::error('No token provided', 401, ['WWW-Authenticate' => 'Bearer']);
            exit();
        }

        $decoded = Auth::verifyToken($token);

        if (!$decoded) {
            Response::error('Invalid or expired token', 401, ['WWW-Authenticate' => 'Bearer']);
            exit();
        }

        // Get user from database to ensure they still exist
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM user WHERE username = ?');
        $stmt->execute([$decoded->sub]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found', 401);
            exit();
        }

        return $user;
    }

    /**
     * Require specific role(s)
     */
    public static function requireRole(array $allowed_roles): array {
        $user = self::requireAuth();

        if (!in_array($user['role'], $allowed_roles)) {
            Response::error(
                'Access denied. Required roles: ' . implode(', ', $allowed_roles) . '. Your role: ' . $user['role'],
                403
            );
            exit();
        }

        return $user;
    }

    /**
     * Get current user (optional auth - for routes that work with or without auth)
     */
    public static function getCurrentUser(): ?array {
        $token = Auth::getBearerToken();

        if (!$token) {
            return null;
        }

        $decoded = Auth::verifyToken($token);

        if (!$decoded) {
            return null;
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM user WHERE username = ?');
        $stmt->execute([$decoded->sub]);

        return $stmt->fetch() ?: null;
    }
}
