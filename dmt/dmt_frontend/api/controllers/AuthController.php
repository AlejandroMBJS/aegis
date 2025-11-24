<?php
/**
 * Authentication Controller
 * Handles /auth/* endpoints
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {

    /**
     * POST /auth/token
     * OAuth2 compatible login endpoint
     */
    public static function login(): void {
        // Parse form data (OAuth2 format)
        $username = $_POST['username'] ?? null;
        $password = $_POST['password'] ?? null;

        if (!$username || !$password) {
            Response::error('Username and password are required', 422);
            return;
        }

        // Get user from database
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM user WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !Auth::verifyPassword($password, $user['hashed_password'])) {
            Response::error('Incorrect username or password', 401, ['WWW-Authenticate' => 'Bearer']);
            return;
        }

        // Create access token
        $access_token = Auth::createAccessToken([
            'sub' => $user['username'],
            'role' => $user['role'],
            'full_name' => $user['full_name']
        ]);

        // Return token and user info (compatible with frontend)
        Response::json([
            'access_token' => $access_token,
            'token_type' => 'bearer',
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'role' => $user['role']
        ]);
    }
}
