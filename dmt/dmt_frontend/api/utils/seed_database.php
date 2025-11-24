<?php
/**
 * Database Seeding Script for DMT System
 * Creates initial users and catalog data for testing and development
 *
 * Usage: php utils/seed_database.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

echo "============================================================\n";
echo "DMT Database Seeding\n";
echo "============================================================\n\n";

try {
    $db = Database::getInstance()->getConnection();

    // Create users
    createUsers($db);

    // Create catalog data
    createPartNumbers($db);
    createWorkCenters($db);
    createCustomers($db);
    createLevels($db);
    createAreas($db);
    createDispositions($db);
    createFailureCodes($db);
    createPreparedBy($db);
    createInspectionItems($db);
    createProcessCodes($db);
    createCalibrations($db);

    echo "\n============================================================\n";
    echo "✓ Database seeded successfully!\n";
    echo "============================================================\n\n";

    echo "Default Login Credentials:\n";
    echo "------------------------------------------------------------\n";
    echo "Admin:           ADM001 / admin123\n";
    echo "Tech Engineer:   ENG001 / engineer123\n";
    echo "Quality Engineer:QUA001 / quality123\n";
    echo "Inspectors:      INS001-INS011 / employee123\n";
    echo "Operators:       OPR001-OPR062 / employee123\n";
    echo "------------------------------------------------------------\n";
    echo "\nNote: All employees use password: employee123\n";

} catch (Exception $e) {
    echo "\n✗ Error seeding database: " . $e->getMessage() . "\n";
    exit(1);
}

function createUsers($db) {
    echo "Creating users...\n";

    $users = [];

    // System admin
    $users[] = [
        'username' => 'ADM001',
        'email' => 'adm001@example.com',
        'full_name' => 'System Administrator',
        'role' => 'Admin',
        'password' => 'admin123'
    ];

    // Tech Engineer
    $users[] = [
        'username' => 'ENG001',
        'email' => 'eng001@example.com',
        'full_name' => 'Technical Engineer',
        'role' => 'Tech Engineer',
        'password' => 'engineer123'
    ];

    // Quality Engineer
    $users[] = [
        'username' => 'QUA001',
        'email' => 'qua001@example.com',
        'full_name' => 'Quality Engineer',
        'role' => 'Quality Engineer',
        'password' => 'quality123'
    ];

    // Inspectors - default password: employee123
    $inspector_names = [
        "Liying Zhou",
        "Leilei Zheng",
        "Yong Chang",
        "Karen Ponce",
        "Lopez Perez, Nataly Raquel",
        "Rodriguez Padron, Diana Isela",
        "Becerra Mendez Elizabeth",
        "Mora Aviles Gloria Esmeralda",
        "Ramirez Elías Vanessa",
        "Perez Orta Javier",
        "Uriel De Jesus Flores Marin"
    ];

    foreach ($inspector_names as $idx => $name) {
        $username = sprintf("INS%03d", $idx + 1);
        $users[] = [
            'username' => $username,
            'email' => strtolower($username) . '@example.com',
            'full_name' => $name,
            'role' => 'Inspector',
            'password' => 'employee123'
        ];
    }

    // Operators - default password: employee123
    $operator_names = [
        "Li Yaojie", "Zhou Liying", "Vega Segura, Emmanuel", "Rodriguez Hernandez, Braulio",
        "Hernandez Guerrero, Jose Victor", "Gutierrez , Jonathan", "Esteva Luis, Jonathan Vicente",
        "Rodriguez Lopez, Leonardo Daniel", "Rocha Sanchez, David Emmanuel", "Aguilera Salas, Miguel Naim",
        "De La Luz Octaviano, Eric", "Covarrubias Gonzalez, Gael Antonio", "Martinez Gutierrez, Juan Misael",
        "Colunga Mendez, Tadeo Gael", "Rivera Quezada, Erik", "Herrera Zuñiga, Cesar Carmelo",
        "Miranda Cuevas, Fernando Enrique", "Infante Dimas, Karina Lizbeth", "Juarez Uribe, Juan Alan",
        "Jalomo Gone, Cesar Omar", "Aviles Segura, Liliana", "Fuentes Fuentes, Angelica Maria",
        "Niño Rodriguez, Luis Antonio", "Martinez Vazquez, Jonathan Orlando", "Jasso Silva, Lesly Alondra",
        "Ornelas Flores, Gerardo", "Garcia Ovalle, Juan Gustavo", "Marquez Bravo, Adriana",
        "Hernandez Gaspar, Rocio Jhoana", "Hernandez Reyes, Amado", "Maya Salas, Valeria",
        "Castro Sanchez, Olga Carolina", "Oliva Gutierrez, Ma Del Carmen", "Torres Silva, Ximena Sarahi",
        "Garcia Ovalle, Victor Manuel", "Rodriguez Salazar, Jose Enrique", "Alvarado Salazar, Paola Guadalupe",
        "Silva Lopez, Sonia Alejandra", "Ramos Hernandez, Angel Josue", "Ramirez Campos, Erick Adolfo",
        "Gallegos Ruedas, Patricia Lili", "Romero Olaya, Cesar", "Bravo Lopez, Victor Javier",
        "Orozco Alvarado, Jesus Alberto", "Martinez Martinez, Rosario De Jesus", "Cardenas Lopez, Jesus Alberto",
        "Martinez Segura, Sandra", "Lopez Moreno, Sergio Eduardo", "Jalomo Garcia, Efren",
        "Gonzalez Hernandez, Carlos Eduardo", "Morales Argot, Angel Giovanni", "Sun Huaqiao",
        "Yang Daquan", "Zheng Leilei", "Yu Zhu", "Hu Kaisong", "Yuan Lei", "Kong Leifeng",
        "Guan Haobin", "Zhang Wei", "Xiao Gang", "Chang Yong"
    ];

    foreach ($operator_names as $idx => $name) {
        $username = sprintf("OPR%03d", $idx + 1);
        $users[] = [
            'username' => $username,
            'email' => strtolower($username) . '@example.com',
            'full_name' => $name,
            'role' => 'Operator',
            'password' => 'employee123'
        ];
    }

    // Insert users
    $stmt_check = $db->prepare('SELECT id FROM user WHERE username = ?');
    $stmt_insert = $db->prepare('
        INSERT INTO user (username, email, full_name, role, hashed_password)
        VALUES (?, ?, ?, ?, ?)
    ');

    foreach ($users as $user) {
        $stmt_check->execute([$user['username']]);
        if (!$stmt_check->fetch()) {
            $hashed_password = Auth::hashPassword($user['password']);
            $stmt_insert->execute([
                $user['username'],
                $user['email'],
                $user['full_name'],
                $user['role'],
                $hashed_password
            ]);
            echo "  ✓ Created user: {$user['username']} - {$user['full_name']} ({$user['role']})\n";
        } else {
            echo "  ⚠ User already exists: {$user['username']}\n";
        }
    }
}

function createPartNumbers($db) {
    echo "\nCreating part numbers...\n";

    $part_numbers = [
        "9151355", "5073135-101", "10101B-518", "10101C-744", "10101B-514", "5153060-101",
        "5073134-101", "5203024-101", "5133103-101", "10101C-732", "1-01-050(09)", "5203118-101",
        "5093208-102", "336-0035-01", "10101B-572", "2823488-101", "5193156-101", "436-890",
        "488-133", "A1-379-1", "230-1056-01", "5113269-101", "5113267-101", "5203258-101",
        "5043158-101", "5103200-101", "5073180-101", "5153042-101", "5133061-101", "5043152-101",
        "5043103-101", "5133052-102", "2793957-101", "5203312-101", "3171539-113", "2305449-1",
        "5093782-102", "5093913-102", "3171539-2", "3171539-2-1", "5193467-101", "5203028-101",
        "5203023-101", "5203083-101", "2093123-101", "26538", "A3-766-1", "A3-769-1",
        "5193468-101", "5023008-1", "5023008-101", "5143020-101", "5203054-101", "5203062-101",
        "5193418-101", "2103120-101", "5203086-101", "5193357-101", "5193215-101", "5193082-102",
        "5193082-101", "5073121-101", "5203288-101", "5203263-101", "5193354-101", "5093243-102",
        "880420-103", "7203012-101", "5093831-102", "7203013-101", "5193032-101", "5113117-101",
        "24828-02", "24827-02", "27044", "476181-101", "617553-101", "617552-101", "26480",
        "617562-101", "617563-101", "27145", "617151-101", "27440", "27441", "616539-1",
        "24823-02", "24824-02", "624420-1", "624432-1", "A1-1352-2", "A1-1473-1", "A1-1474-1",
        "A1-1602-1", "A1-1600-1", "A1-1601-1", "2200007-101", "A1-1060-1", "A9-374-2",
        "A9-384-2", "6122145", "5163010-101", "5153068-101", "10101-1", "5173063-101",
        "10101C-749", "5203025-101", "10101C-724", "5133104-101", "5203112-101", "5153043-101",
        "5093207-101", "5133062-101", "5203119-101", "5093621-101", "10101C-731", "5153053-101",
        "5113270-101", "5043104-101", "331-0013-01", "336-0038-01", "5113268-101", "5073126-101",
        "2083314-101", "1-01-09", "436-889", "10101B-571", "332-0019-01", "2793956-101",
        "332-0008-01", "10101B-511", "332-0100-01", "10101C-712", "488-120", "A1-380-1",
        "5043159-104", "5153129-101", "5073181-101", "5133053-102", "5203260-101", "5203313-101",
        "5203314-101", "2306540-1", "FONN-863668", "14-0005", "7A008900", "A066L687",
        "67731651000", "HXE102048", "5639729", "5639761"
    ];

    insertCatalogItems($db, 'partnumber', $part_numbers);
}

function createWorkCenters($db) {
    echo "\nCreating work centers...\n";

    $work_centers = [
        "WC-001" => "Wax Pattern",
        "WC-002" => "Shell Making",
        "WC-003" => "Cast",
        "WC-004" => "Cutting",
        "WC-005" => "Grinding",
        "WC-006" => "Sandblasting",
        "WC-007" => "Manual Operation_Casting",
        "WC-008" => "Welding",
        "WC-009" => "Milling",
        "WC-010" => "Turning",
        "WC-011" => "Manual Operation_Machining",
        "WC-012" => "Assembly",
        "WC-013" => "Surface treatment",
        "WC-014" => "Incoming Inspection",
        "WC-015" => "other"
    ];

    insertCatalogItemsWithNames($db, 'workcenter', $work_centers);
}

function createCustomers($db) {
    echo "\nCreating customers...\n";

    $customers = ["A108", "A109", "A135", "A146", "A261", "IMMX"];

    insertCatalogItems($db, 'customer', $customers);
}

function createLevels($db) {
    echo "\nCreating defect levels...\n";

    $levels = [
        "L1" => "Critical",
        "L2" => "Major",
        "L3" => "Minor",
        "L4" => "Cosmetic"
    ];

    insertCatalogItemsWithNames($db, 'level', $levels);
}

function createAreas($db) {
    echo "\nCreating areas...\n";

    $areas = [
        "AREA-01" => "Production Floor",
        "AREA-02" => "Quality Control",
        "AREA-03" => "Warehouse",
        "AREA-04" => "Finishing"
    ];

    insertCatalogItemsWithNames($db, 'area', $areas);
}

function createDispositions($db) {
    echo "\nCreating dispositions...\n";

    $dispositions = [
        "DISP-001" => "Use As Is",
        "DISP-002" => "Rework",
        "DISP-003" => "Scrap",
        "DISP-004" => "Return to Supplier"
    ];

    insertCatalogItemsWithNames($db, 'disposition', $dispositions);
}

function createFailureCodes($db) {
    echo "\nCreating failure codes...\n";

    $codes = [
        "FC-001" => "Material Defect",
        "FC-002" => "Process Error",
        "FC-003" => "Equipment Malfunction",
        "FC-004" => "Human Error",
        "FC-005" => "Design Issue"
    ];

    insertCatalogItemsWithNames($db, 'failurecode', $codes);
}

function createPreparedBy($db) {
    echo "\nCreating prepared by entries...\n";

    $prepared_by_names = [
        "Liying Zhou",
        "Leilei Zheng",
        "Yong Chang",
        "Karen Ponce",
        "Lopez Perez, Nataly Raquel",
        "Rodriguez Padron, Diana Isela",
        "Becerra Mendez Elizabeth",
        "Mora Aviles Gloria Esmeralda",
        "Ramirez Elías Vanessa",
        "Perez Orta Javier",
        "Uriel De Jesus Flores Marin"
    ];

    $prepared_by = [];
    foreach ($prepared_by_names as $idx => $name) {
        $item_number = sprintf("PB-%03d", $idx + 1);
        $prepared_by[$item_number] = $name;
    }

    insertCatalogItemsWithNames($db, 'preparedby', $prepared_by);
}

function createInspectionItems($db) {
    echo "\nCreating inspection items...\n";

    $items = [
        "II-001" => "Visual Inspection",
        "II-002" => "Dimensional Check",
        "II-003" => "Functional Test",
        "II-004" => "Surface Finish",
        "II-005" => "Material Verification"
    ];

    insertCatalogItemsWithNames($db, 'inspectionitem', $items);
}

function createProcessCodes($db) {
    echo "\nCreating process codes...\n";

    $codes = [
        "PC-001" => "Receiving Inspection",
        "PC-002" => "In-Process Inspection",
        "PC-003" => "Final Inspection",
        "PC-004" => "First Article Inspection",
        "PC-005" => "Supplier Quality"
    ];

    insertCatalogItemsWithNames($db, 'processcode', $codes);
}

function createCalibrations($db) {
    echo "\nCreating calibrations...\n";

    $calibrations = [
        "CAL-001" => "Micrometer",
        "CAL-002" => "Caliper",
        "CAL-003" => "Gauge Block",
        "CAL-004" => "CMM Machine",
        "CAL-005" => "Pressure Gauge"
    ];

    insertCatalogItemsWithNames($db, 'calibration', $calibrations);
}

// Helper function to insert catalog items (item_number only)
function insertCatalogItems($db, $table, $items) {
    $stmt_check = $db->prepare("SELECT id FROM $table WHERE item_number = ?");
    $stmt_insert = $db->prepare("INSERT INTO $table (item_number, item_name) VALUES (?, ?)");

    foreach ($items as $item) {
        $stmt_check->execute([$item]);
        if (!$stmt_check->fetch()) {
            $stmt_insert->execute([$item, $item]);
            echo "  ✓ Created: $item\n";
        }
    }
}

// Helper function to insert catalog items with separate item_number and item_name
function insertCatalogItemsWithNames($db, $table, $items) {
    $stmt_check = $db->prepare("SELECT id FROM $table WHERE item_number = ?");
    $stmt_insert = $db->prepare("INSERT INTO $table (item_number, item_name) VALUES (?, ?)");

    foreach ($items as $item_number => $item_name) {
        $stmt_check->execute([$item_number]);
        if (!$stmt_check->fetch()) {
            $stmt_insert->execute([$item_number, $item_name]);
            echo "  ✓ Created: $item_number - $item_name\n";
        }
    }
}
