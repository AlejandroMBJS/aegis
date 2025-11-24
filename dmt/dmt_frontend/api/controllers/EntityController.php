<?php
/**
 * Entity Controller
 * Handles /entities/* endpoints for catalog management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class EntityController {

    // Valid entity table names
    private static $valid_entities = [
        'partnumber',
        'workcenter',
        'customer',
        'level',
        'area',
        'calibration',
        'inspectionitem',
        'preparedby',
        'processcode',
        'disposition',
        'failurecode'
    ];

    /**
     * Validate entity name to prevent SQL injection
     */
    private static function validateEntity(string $entity_name): bool {
        return in_array(strtolower($entity_name), self::$valid_entities);
    }

    /**
     * POST /entities/{entity_name}
     * Create new entity (Admin only)
     */
    public static function create(string $entity_name): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        if (!self::validateEntity($entity_name)) {
            Response::error('Invalid entity name', 400);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        Response::validateRequired($data, ['item_number', 'item_name']);

        $db = Database::getInstance()->getConnection();

        // Check for duplicate item_number
        $stmt = $db->prepare("SELECT id FROM $entity_name WHERE item_number = ?");
        $stmt->execute([$data['item_number']]);
        if ($stmt->fetch()) {
            Response::error('Item number already exists', 409);
            return;
        }

        // Insert entity
        $stmt = $db->prepare("INSERT INTO $entity_name (item_number, item_name) VALUES (?, ?)");
        $stmt->execute([$data['item_number'], $data['item_name']]);

        // Get created entity
        $entity_id = $db->lastInsertId();
        $stmt = $db->prepare("SELECT id, item_number, item_name FROM $entity_name WHERE id = ?");
        $stmt->execute([$entity_id]);
        $entity = $stmt->fetch();

        Response::created($entity);
    }

    /**
     * GET /entities/{entity_name}
     * List all entities
     */
    public static function list(string $entity_name): void {
        $current_user = AuthMiddleware::requireAuth();

        if (!self::validateEntity($entity_name)) {
            Response::error('Invalid entity name', 400);
            return;
        }

        $skip = (int)($_GET['skip'] ?? 0);
        $limit = min((int)($_GET['limit'] ?? 100), 1000);

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT id, item_number, item_name FROM $entity_name ORDER BY item_number LIMIT ? OFFSET ?");
        $stmt->execute([$limit, $skip]);
        $entities = $stmt->fetchAll();

        Response::json($entities);
    }

    /**
     * GET /entities/{entity_name}/{id}
     * Get specific entity
     */
    public static function get(string $entity_name, int $id): void {
        $current_user = AuthMiddleware::requireAuth();

        if (!self::validateEntity($entity_name)) {
            Response::error('Invalid entity name', 400);
            return;
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, item_number, item_name FROM $entity_name WHERE id = ?");
        $stmt->execute([$id]);
        $entity = $stmt->fetch();

        if (!$entity) {
            Response::error("Entity '$entity_name' with id $id not found", 404);
            return;
        }

        Response::json($entity);
    }

    /**
     * PUT /entities/{entity_name}/{id}
     * Update entity (Admin only)
     */
    public static function update(string $entity_name, int $id): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        if (!self::validateEntity($entity_name)) {
            Response::error('Invalid entity name', 400);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Check if entity exists
        $stmt = $db->prepare("SELECT id FROM $entity_name WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error("Entity '$entity_name' with id $id not found", 404);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        Response::validateRequired($data, ['item_number', 'item_name']);

        // Update entity
        $stmt = $db->prepare("UPDATE $entity_name SET item_number = ?, item_name = ? WHERE id = ?");
        $stmt->execute([$data['item_number'], $data['item_name'], $id]);

        // Get updated entity
        $stmt = $db->prepare("SELECT id, item_number, item_name FROM $entity_name WHERE id = ?");
        $stmt->execute([$id]);
        $entity = $stmt->fetch();

        Response::json($entity);
    }

    /**
     * DELETE /entities/{entity_name}/{id}
     * Delete entity (Admin only)
     */
    public static function delete(string $entity_name, int $id): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        if (!self::validateEntity($entity_name)) {
            Response::error('Invalid entity name', 400);
            return;
        }

        $db = Database::getInstance()->getConnection();

        // Check if entity exists
        $stmt = $db->prepare("SELECT id FROM $entity_name WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error("Entity '$entity_name' with id $id not found", 404);
            return;
        }

        // Delete entity
        $stmt = $db->prepare("DELETE FROM $entity_name WHERE id = ?");
        $stmt->execute([$id]);

        Response::noContent();
    }
}
