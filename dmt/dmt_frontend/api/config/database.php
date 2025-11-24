<?php
/**
 * Database Configuration - SQLite
 * Secure database connection with PDO
 */

class Database {
    private static $instance = null;
    private $pdo;

    // SQLite database file path
    private $db_file;

    private function __construct() {
        // Use environment variable or default to SQLite file in api directory
        $this->db_file = getenv('DATABASE_PATH') ?: __DIR__ . '/../../dmt.db';

        try {
            // Create PDO instance with SQLite
            $this->pdo = new PDO(
                "sqlite:" . $this->db_file,
                null,
                null,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false, // Use native prepared statements for security
                ]
            );

            // Enable foreign keys in SQLite
            $this->pdo->exec('PRAGMA foreign_keys = ON');

        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    /**
     * Get singleton instance
     */
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Get PDO connection
     */
    public function getConnection(): PDO {
        return $this->pdo;
    }

    /**
     * Initialize database schema
     */
    public function initSchema(): void {
        $schema = file_get_contents(__DIR__ . '/schema.sql');
        if ($schema === false) {
            throw new Exception("Failed to read schema file");
        }

        try {
            $this->pdo->exec($schema);
        } catch (PDOException $e) {
            error_log("Schema initialization error: " . $e->getMessage());
            throw new Exception("Failed to initialize database schema");
        }
    }

    // Prevent cloning
    private function __clone() {}

    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
