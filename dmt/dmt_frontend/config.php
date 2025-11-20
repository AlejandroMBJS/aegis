<?php
/**
 * DMT Frontend Configuration
 * API Connection Settings
 */

// API Base URL - Using nginx reverse proxy (relative path)
define('API_BASE_URL', '/api');

// API Endpoints
define('API_AUTH_TOKEN', API_BASE_URL . '/auth/token');
define('API_DMT', API_BASE_URL . '/dmt/');
define('API_ENTITIES', API_BASE_URL . '/entities/');

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_start();

// Available Entity Names for CRUD
$ENTITY_NAMES = [
    'partnumber' => 'Part Numbers',
    'workcenter' => 'Work Centers',
    'customer' => 'Customers',
    'level' => 'Levels',
    'area' => 'Areas',
    'calibration' => 'Calibrations',
    'inspectionitem' => 'Inspection Items',
    'preparedby' => 'Prepared By',
    'disposition' => 'Dispositions',
    'failurecode' => 'Failure Codes'
];

// Role Definitions
$ROLES = [
    'Admin',
    'Inspector',
    'Operator',
    'Tech Engineer',
    'Quality Engineer'
];

/**
 * Get current user from session
 */
function getCurrentUser() {
    return isset($_SESSION['user']) ? $_SESSION['user'] : null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['token']) && isset($_SESSION['user']);
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: index.php');
        exit();
    }
}

/**
 * Require specific role
 */
function requireRole($allowedRoles) {
    requireAuth();
    $user = getCurrentUser();
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        die('Access Denied. Required roles: ' . implode(', ', $allowedRoles));
    }
}

/**
 * Logout user
 */
function logout() {
    session_destroy();
    header('Location: index.php');
    exit();
}
