<?php
/**
 * User Controller
 * Handles /users/* endpoints
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class UserController {

    /**
     * GET /users
     * List all users with optional role filter
     */
    public static function list(): void {
        $current_user = AuthMiddleware::requireAuth();

        $db = Database::getInstance()->getConnection();

        // Optional role filter
        $role = $_GET['role'] ?? null;

        if ($role) {
            $stmt = $db->prepare('SELECT id, username, email, full_name, role FROM user WHERE role = ? ORDER BY username');
            $stmt->execute([$role]);
        } else {
            $stmt = $db->query('SELECT id, username, email, full_name, role FROM user ORDER BY username');
        }

        $users = $stmt->fetchAll();
        Response::json($users);
    }

    /**
     * POST /users
     * Create new user (Admin only)
     */
    public static function create(): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        $data = json_decode(file_get_contents('php://input'), true);

        Response::validateRequired($data, ['username', 'email', 'full_name', 'role', 'password']);

        $db = Database::getInstance()->getConnection();

        // Check if username already exists
        $stmt = $db->prepare('SELECT id FROM user WHERE username = ?');
        $stmt->execute([$data['username']]);
        if ($stmt->fetch()) {
            Response::error('Username already registered', 409);
            return;
        }

        // Check if email already exists
        $stmt = $db->prepare('SELECT id FROM user WHERE email = ?');
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            Response::error('Email already registered', 409);
            return;
        }

        // Hash password
        $hashed_password = Auth::hashPassword($data['password']);

        // Insert user
        $stmt = $db->prepare('
            INSERT INTO user (username, email, full_name, role, hashed_password)
            VALUES (?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $data['username'],
            $data['email'],
            $data['full_name'],
            $data['role'],
            $hashed_password
        ]);

        // Get created user
        $user_id = $db->lastInsertId();
        $stmt = $db->prepare('SELECT id, username, email, full_name, role FROM user WHERE id = ?');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        Response::created($user);
    }

    /**
     * GET /users/{id}
     * Get user by ID
     */
    public static function get(int $id): void {
        $current_user = AuthMiddleware::requireAuth();

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT id, username, email, full_name, role FROM user WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error("User with id $id not found", 404);
            return;
        }

        Response::json($user);
    }

    /**
     * PUT /users/{id}
     * Update user (Admin only)
     */
    public static function update(int $id): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        $db = Database::getInstance()->getConnection();

        // Check if user exists
        $stmt = $db->prepare('SELECT id FROM user WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error("User with id $id not found", 404);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Build update query dynamically for partial updates
        $fields = [];
        $values = [];

        if (isset($data['full_name'])) {
            $fields[] = 'full_name = ?';
            $values[] = $data['full_name'];
        }

        if (isset($data['email'])) {
            $fields[] = 'email = ?';
            $values[] = $data['email'];
        }

        if (isset($data['role'])) {
            $fields[] = 'role = ?';
            $values[] = $data['role'];
        }

        if (isset($data['password'])) {
            $fields[] = 'hashed_password = ?';
            $values[] = Auth::hashPassword($data['password']);
        }

        if (empty($fields)) {
            Response::error('No fields to update', 400);
            return;
        }

        $values[] = $id;

        $stmt = $db->prepare('UPDATE user SET ' . implode(', ', $fields) . ' WHERE id = ?');
        $stmt->execute($values);

        // Get updated user
        $stmt = $db->prepare('SELECT id, username, email, full_name, role FROM user WHERE id = ?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        Response::json($user);
    }

    /**
     * DELETE /users/{id}
     * Delete user (Admin only)
     */
    public static function delete(int $id): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        // Prevent self-deletion
        if ($current_user['id'] == $id) {
            Response::error('Admins cannot delete themselves', 400);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Check if user exists
        $stmt = $db->prepare('SELECT id FROM user WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error("User with id $id not found", 404);
            return;
        }

        // Delete user
        $stmt = $db->prepare('DELETE FROM user WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }
}
