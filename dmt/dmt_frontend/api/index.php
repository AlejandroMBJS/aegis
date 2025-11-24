<?php
/**
 * DMT API - Main Router
 * RESTful API for DMT application
 *
 * Security features:
 * - JWT authentication
 * - CORS handling
 * - Input validation
 * - SQL injection protection (PDO prepared statements)
 * - XSS protection
 * - Rate limiting (to be implemented)
 */

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/api_errors.log');

// Load Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Load dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/middleware/CORS.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/EntityController.php';
require_once __DIR__ . '/controllers/DMTController.php';

// Apply CORS middleware
CORSMiddleware::handle();

// Get request method and path
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string and get path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

// Split path into segments
$segments = array_filter(explode('/', $path));
$segments = array_values($segments); // Re-index array

try {
    // Route requests
    if (empty($segments)) {
        // Root endpoint
        Response::json([
            'message' => 'DMT Backend API',
            'version' => '1.0.0',
            'status' => 'running'
        ]);
        exit();
    }

    $endpoint = $segments[0];

    // Health check endpoint
    if ($endpoint === 'health') {
        Response::json(['status' => 'healthy']);
        exit();
    }

    // Authentication endpoints
    if ($endpoint === 'auth') {
        if (isset($segments[1]) && $segments[1] === 'token') {
            if ($request_method === 'POST') {
                AuthController::login();
            } else {
                Response::error('Method not allowed', 405);
            }
        } else {
            Response::error('Not found', 404);
        }
        exit();
    }

    // User endpoints
    if ($endpoint === 'users') {
        if ($request_method === 'GET') {
            if (isset($segments[1])) {
                UserController::get((int)$segments[1]);
            } else {
                UserController::list();
            }
        } elseif ($request_method === 'POST') {
            UserController::create();
        } elseif ($request_method === 'PUT' && isset($segments[1])) {
            UserController::update((int)$segments[1]);
        } elseif ($request_method === 'DELETE' && isset($segments[1])) {
            UserController::delete((int)$segments[1]);
        } else {
            Response::error('Method not allowed', 405);
        }
        exit();
    }

    // Entity endpoints (catalogs)
    if ($endpoint === 'entities') {
        $entity_name = $segments[1] ?? null;

        if (!$entity_name) {
            Response::error('Entity name is required', 400);
            exit();
        }

        if ($request_method === 'GET') {
            if (isset($segments[2])) {
                EntityController::get($entity_name, (int)$segments[2]);
            } else {
                EntityController::list($entity_name);
            }
        } elseif ($request_method === 'POST') {
            EntityController::create($entity_name);
        } elseif ($request_method === 'PUT' && isset($segments[2])) {
            EntityController::update($entity_name, (int)$segments[2]);
        } elseif ($request_method === 'DELETE' && isset($segments[2])) {
            EntityController::delete($entity_name, (int)$segments[2]);
        } else {
            Response::error('Method not allowed', 405);
        }
        exit();
    }

    // DMT endpoints
    if ($endpoint === 'dmt') {
        if ($request_method === 'GET') {
            // Check for export endpoint
            if (isset($segments[1]) && $segments[1] === 'export' && isset($segments[2]) && $segments[2] === 'csv') {
                DMTController::exportCSV();
            } elseif (isset($segments[1])) {
                DMTController::get((int)$segments[1]);
            } else {
                DMTController::list();
            }
        } elseif ($request_method === 'POST') {
            DMTController::create();
        } elseif ($request_method === 'PATCH' && isset($segments[1])) {
            DMTController::update((int)$segments[1]);
        } elseif ($request_method === 'DELETE' && isset($segments[1])) {
            DMTController::delete((int)$segments[1]);
        } else {
            Response::error('Method not allowed', 405);
        }
        exit();
    }

    // No route matched
    Response::error('Not found', 404);

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    Response::error('Internal server error', 500);
}
