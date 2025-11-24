<?php
/**
 * Database Initialization Script
 *
 * This script initializes the SQLite database with the schema
 * and optionally creates a default admin user.
 *
 * Usage:
 *   php utils/init_db.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

echo "=================================================\n";
echo "DMT Database Initialization\n";
echo "=================================================\n\n";

try {
    // Get database instance
    $db_instance = Database::getInstance();
    echo "✓ Database connection established\n";

    // Initialize schema
    echo "\nInitializing database schema...\n";
    $db_instance->initSchema();
    echo "✓ Schema initialized successfully\n";

    // Ask if user wants to create a default admin
    echo "\nDo you want to create a default admin user? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));

    if (strtolower($line) === 'y') {
        echo "\n--- Create Admin User ---\n";

        echo "Username (default: admin): ";
        $username = trim(fgets($handle)) ?: 'admin';

        echo "Email (default: admin@example.com): ";
        $email = trim(fgets($handle)) ?: 'admin@example.com';

        echo "Full Name (default: System Administrator): ";
        $full_name = trim(fgets($handle)) ?: 'System Administrator';

        echo "Password (default: admin123): ";
        $password = trim(fgets($handle)) ?: 'admin123';

        fclose($handle);

        // Hash password
        $hashed_password = Auth::hashPassword($password);

        // Insert admin user
        $pdo = $db_instance->getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO user (username, email, full_name, role, hashed_password)
            VALUES (?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $username,
            $email,
            $full_name,
            'Admin',
            $hashed_password
        ]);

        echo "\n✓ Admin user created successfully!\n";
        echo "\nCredentials:\n";
        echo "  Username: $username\n";
        echo "  Password: $password\n";
        echo "\n⚠ IMPORTANT: Change the default password immediately!\n";
    } else {
        fclose($handle);
        echo "\nSkipping admin user creation.\n";
    }

    echo "\n=================================================\n";
    echo "Database initialization completed successfully!\n";
    echo "=================================================\n";

} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
