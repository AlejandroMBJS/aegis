<?php
/**
 * DMT Controller
 * Handles /dmt/* endpoints for DMT record management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class DMTController {

    /**
     * POST /dmt
     * Create new DMT record (Inspector only)
     */
    public static function create(): void {
        $current_user = AuthMiddleware::requireRole(['Inspector']);

        $data = json_decode(file_get_contents('php://input'), true);
        $language = $_GET['language'] ?? 'en';

        // Validate required fields
        Response::validateRequired($data, [
            'part_number_id',
            'work_center_id',
            'customer_id',
            'prepared_by_id',
            'operation',
            'quantity',
            'date',
            'inspection_item_id',
            'process_code_id',
            'defect_description'
        ]);

        $db = Database::getInstance()->getConnection();

        // Auto-generate report number if not provided
        $report_number = $data['report_number'] ?? self::generateReportNumber($db);

        // For now, store the description in all language fields as the same value
        // TODO: Integrate with translation API
        $defect_desc_en = $language === 'en' ? $data['defect_description'] : $data['defect_description'];
        $defect_desc_es = $language === 'es' ? $data['defect_description'] : '';
        $defect_desc_zh = $language === 'zh' ? $data['defect_description'] : '';

        // Insert DMT record
        $stmt = $db->prepare('
            INSERT INTO dmtrecord (
                created_by_id, report_number,
                part_number_id, work_center_id, customer_id, level_id, area_id,
                prepared_by_id, operation, quantity, serial_number, date,
                inspection_item_id, process_code_id,
                defect_description_en, defect_description_es, defect_description_zh,
                is_closed, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
        ');

        $stmt->execute([
            $current_user['id'],
            $report_number,
            $data['part_number_id'],
            $data['work_center_id'],
            $data['customer_id'],
            $data['level_id'] ?? null,
            $data['area_id'] ?? null,
            $data['prepared_by_id'],
            $data['operation'],
            $data['quantity'],
            $data['serial_number'] ?? null,
            $data['date'],
            $data['inspection_item_id'],
            $data['process_code_id'],
            $defect_desc_en,
            $defect_desc_es,
            $defect_desc_zh
        ]);

        $dmt_id = $db->lastInsertId();

        // Get created record
        $dmt = self::getDMTById($db, $dmt_id);
        Response::created($dmt);
    }

    /**
     * GET /dmt
     * List DMT records with filters
     */
    public static function list(): void {
        $current_user = AuthMiddleware::requireAuth();

        $skip = (int)($_GET['skip'] ?? 0);
        $limit = min((int)($_GET['limit'] ?? 100), 1000);
        $is_closed = isset($_GET['is_closed']) ? (bool)$_GET['is_closed'] : null;
        $created_by_id = isset($_GET['created_by_id']) ? (int)$_GET['created_by_id'] : null;
        $part_number_id = isset($_GET['part_number_id']) ? (int)$_GET['part_number_id'] : null;
        $created_after = $_GET['created_after'] ?? null;
        $created_before = $_GET['created_before'] ?? null;

        $db = Database::getInstance()->getConnection();

        // Build query with filters
        $where_clauses = [];
        $params = [];

        if ($is_closed !== null) {
            $where_clauses[] = 'is_closed = ?';
            $params[] = $is_closed ? 1 : 0;
        }

        if ($created_by_id !== null) {
            $where_clauses[] = 'created_by_id = ?';
            $params[] = $created_by_id;
        }

        if ($part_number_id !== null) {
            $where_clauses[] = 'part_number_id = ?';
            $params[] = $part_number_id;
        }

        if ($created_after) {
            $where_clauses[] = 'created_at >= ?';
            $params[] = $created_after;
        }

        if ($created_before) {
            $where_clauses[] = 'created_at <= ?';
            $params[] = $created_before;
        }

        $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

        $stmt = $db->prepare("
            SELECT * FROM dmtrecord
            $where_sql
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");

        $params[] = $limit;
        $params[] = $skip;

        $stmt->execute($params);
        $records = $stmt->fetchAll();

        Response::json($records);
    }

    /**
     * GET /dmt/{id}
     * Get specific DMT record
     */
    public static function get(int $id): void {
        $current_user = AuthMiddleware::requireAuth();

        $db = Database::getInstance()->getConnection();
        $dmt = self::getDMTById($db, $id);

        if (!$dmt) {
            Response::error("DMT Record with id $id not found", 404);
            return;
        }

        Response::json($dmt);
    }

    /**
     * PATCH /dmt/{id}
     * Update DMT record with role-based field control
     */
    public static function update(int $id): void {
        $current_user = AuthMiddleware::requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);
        $language = $_GET['language'] ?? 'en';

        $db = Database::getInstance()->getConnection();

        // Get existing record
        $stmt = $db->prepare('SELECT * FROM dmtrecord WHERE id = ?');
        $stmt->execute([$id]);
        $record = $stmt->fetch();

        if (!$record) {
            Response::error("DMT Record with id $id not found", 404);
            return;
        }

        // Check if record is closed
        if ($record['is_closed']) {
            Response::error('Cannot edit a closed DMT record', 400);
            return;
        }

        // Role-based field control
        $allowed_fields = self::getAllowedFieldsForRole($current_user['role']);
        $fields_to_update = [];
        $values = [];

        foreach ($data as $key => $value) {
            // Handle multilingual fields
            if (in_array($key, ['defect_description', 'process_description', 'analysis', 'engineering_remarks', 'repair_process'])) {
                // Store in all language fields
                $fields_to_update[] = "{$key}_en = ?";
                $values[] = $language === 'en' ? $value : ($value ?? '');

                $fields_to_update[] = "{$key}_es = ?";
                $values[] = $language === 'es' ? $value : '';

                $fields_to_update[] = "{$key}_zh = ?";
                $values[] = $language === 'zh' ? $value : '';

                continue;
            }

            // Check if field is allowed for this role
            // '*' means all fields are allowed
            if (!in_array('*', $allowed_fields) && !in_array($key, $allowed_fields)) {
                Response::error("Field '$key' is not allowed for role '{$current_user['role']}'", 403);
                return;
            }

            $fields_to_update[] = "$key = ?";
            $values[] = $value;
        }

        // Quality Engineer closing validation
        // Only validate when trying to CHANGE status from open to closed
        if (isset($data['is_closed']) && $data['is_closed'] && !$record['is_closed'] && $current_user['role'] === 'Quality Engineer') {
            // Check that Tech Engineer has completed all required fields in Sections 4 & 5
            if (!$record['final_disposition_id'] || !$record['failure_code_id'] || !$record['engineer_id']) {
                Response::error('Cannot close: Tech Engineer must complete Section 4 (Disposition, Failure Code, Engineer)', 400);
                return;
            }
            if (!$record['disposition_approval_date'] || !$record['disposition_approved_by_id']) {
                Response::error('Cannot close: Tech Engineer must complete Section 5 (Approval Date, Approved By)', 400);
                return;
            }
        }

        if (empty($fields_to_update)) {
            Response::error('No valid fields to update', 400);
            return;
        }

        $values[] = $id;

        // Update record
        $stmt = $db->prepare('UPDATE dmtrecord SET ' . implode(', ', $fields_to_update) . ' WHERE id = ?');
        $stmt->execute($values);

        // Get updated record
        $dmt = self::getDMTById($db, $id);
        Response::json($dmt);
    }

    /**
     * DELETE /dmt/{id}
     * Delete DMT record (Admin only)
     */
    public static function delete(int $id): void {
        $current_user = AuthMiddleware::requireRole(['Admin']);

        $db = Database::getInstance()->getConnection();

        // Check if record exists
        $stmt = $db->prepare('SELECT id FROM dmtrecord WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::error("DMT Record with id $id not found", 404);
            return;
        }

        // Delete record
        $stmt = $db->prepare('DELETE FROM dmtrecord WHERE id = ?');
        $stmt->execute([$id]);

        Response::noContent();
    }

    /**
     * GET /dmt/export/csv
     * Export DMT records to CSV
     */
    public static function exportCSV(): void {
        $current_user = AuthMiddleware::requireAuth();

        $start_date = $_GET['start_date'] ?? null;
        $end_date = $_GET['end_date'] ?? null;
        $language = $_GET['language'] ?? 'en';

        $db = Database::getInstance()->getConnection();

        // Build query with date filters
        $where_clauses = [];
        $params = [];

        if ($start_date) {
            $where_clauses[] = 'created_at >= ?';
            $params[] = $start_date;
        }

        if ($end_date) {
            $where_clauses[] = 'created_at <= ?';
            $params[] = $end_date;
        }

        $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

        $stmt = $db->prepare("SELECT * FROM dmtrecord $where_sql ORDER BY created_at DESC");
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        // Generate CSV
        $filename = 'dmt_records';
        if ($start_date) $filename .= '_' . date('Ymd', strtotime($start_date));
        if ($end_date) $filename .= '_to_' . date('Ymd', strtotime($end_date));
        $filename .= '.csv';

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        // UTF-8 BOM for Excel compatibility
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Write header
        fputcsv($output, [
            'ID', 'Report Number', 'Created At', 'Created By', 'Is Closed',
            'Part Number', 'Work Center', 'Customer', 'Level', 'Area',
            'Prepared By', 'Operation', 'Quantity', 'Serial Number', 'Date',
            'Inspection Item', 'Process Code',
            'Defect Description', 'Process Description', 'Analysis', 'Analysis By',
            'Final Disposition', 'Disposition Date', 'Engineer', 'Failure Code',
            'Rework Hours', 'Responsible Department', 'Material Scrap Cost', 'Other Cost',
            'Engineering Remarks', 'Repair Process',
            'Disposition Approval Date', 'Disposition Approved By', 'SDR Number'
        ]);

        // Write data rows
        foreach ($records as $record) {
            $row = [
                $record['id'],
                $record['report_number'] ?? '',
                $record['created_at'] ?? '',
                self::getUserName($db, $record['created_by_id']),
                $record['is_closed'] ? 'Yes' : 'No',
                self::getEntityName($db, 'partnumber', $record['part_number_id']),
                self::getEntityName($db, 'workcenter', $record['work_center_id']),
                self::getEntityName($db, 'customer', $record['customer_id']),
                self::getEntityName($db, 'level', $record['level_id']),
                self::getEntityName($db, 'area', $record['area_id']),
                self::getEntityName($db, 'preparedby', $record['prepared_by_id']),
                $record['operation'] ?? '',
                $record['quantity'] ?? '',
                $record['serial_number'] ?? '',
                $record['date'] ?? '',
                self::getEntityName($db, 'inspectionitem', $record['inspection_item_id']),
                self::getEntityName($db, 'processcode', $record['process_code_id']),
                $record["defect_description_$language"] ?? $record['defect_description_en'] ?? '',
                $record["process_description_$language"] ?? $record['process_description_en'] ?? '',
                $record["analysis_$language"] ?? $record['analysis_en'] ?? '',
                self::getUserName($db, $record['analysis_by_id']),
                self::getEntityName($db, 'disposition', $record['final_disposition_id']),
                $record['disposition_date'] ?? '',
                self::getUserName($db, $record['engineer_id']),
                self::getEntityName($db, 'failurecode', $record['failure_code_id']),
                $record['rework_hours'] ?? '',
                $record['responsible_department'] ?? '',
                $record['material_scrap_cost'] ?? '',
                $record['other_cost'] ?? '',
                $record["engineering_remarks_$language"] ?? $record['engineering_remarks_en'] ?? '',
                $record["repair_process_$language"] ?? $record['repair_process_en'] ?? '',
                $record['disposition_approval_date'] ?? '',
                self::getUserName($db, $record['disposition_approved_by_id']),
                $record['sdr_number'] ?? ''
            ];

            fputcsv($output, $row);
        }

        fclose($output);
        exit();
    }

    /**
     * Helper: Get DMT record by ID
     */
    private static function getDMTById(PDO $db, int $id): ?array {
        $stmt = $db->prepare('SELECT * FROM dmtrecord WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Helper: Generate unique report number
     */
    private static function generateReportNumber(PDO $db): string {
        $prefix = 'DMT';
        $date = date('Ymd');
        $count = 1;

        // Find the next available number for today
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM dmtrecord WHERE report_number LIKE ?");
        $stmt->execute(["$prefix-$date-%"]);
        $result = $stmt->fetch();

        if ($result) {
            $count = $result['count'] + 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $date, $count);
    }

    /**
     * Helper: Get allowed fields for each role
     */
    private static function getAllowedFieldsForRole(string $role): array {
        $fields = [
            'Admin' => ['*'], // All fields
            'Tech Engineer' => [
                // Section 3: Process Analysis (can also edit these)
                'process_description', 'analysis', 'analysis_by_id',
                // Section 4: Engineering Analysis
                'final_disposition_id', 'disposition_date', 'engineer_id', 'failure_code_id',
                'rework_hours', 'responsible_department', 'material_scrap_cost', 'other_cost',
                'engineering_remarks', 'repair_process',
                // Section 5: Quality fields (Tech Engineer fills these too)
                'disposition_approval_date', 'disposition_approved_by_id', 'sdr_number'
            ],
            'Inspector' => [
                // Section 1: Basic Information
                'part_number_id', 'work_center_id', 'customer_id', 'level_id', 'area_id',
                'prepared_by_id', 'operation', 'quantity', 'serial_number', 'date',
                'inspection_item_id', 'process_code_id', 'defect_description', 'report_number',
                'batch_number', 'shop_order', 'calibration_id', 'responsible'
            ],
            'Operator' => [
                // Section 2 & 3: Process Analysis
                'process_description', 'analysis', 'analysis_by_id'
            ],
            'Quality Engineer' => [
                // Quality Engineer can ONLY close the record, cannot edit any fields
                'is_closed'
            ]
        ];

        return $fields[$role] ?? [];
    }

    /**
     * Helper: Get user name
     */
    private static function getUserName(PDO $db, ?int $user_id): string {
        if (!$user_id) return '';

        $stmt = $db->prepare('SELECT username, full_name FROM user WHERE id = ?');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        return $user ? "{$user['username']} - {$user['full_name']}" : '';
    }

    /**
     * Helper: Get entity name
     */
    private static function getEntityName(PDO $db, string $table, ?int $id): string {
        if (!$id) return '';

        $stmt = $db->prepare("SELECT item_number, item_name FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        $entity = $stmt->fetch();

        return $entity ? "{$entity['item_number']} - {$entity['item_name']}" : '';
    }
}
