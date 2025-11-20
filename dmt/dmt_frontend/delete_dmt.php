<?php
require_once 'config.php';
requireAuth();

$currentUser = getCurrentUser(); // ← Faltaba ESTO

// Only admins can delete
if ($currentUser['role'] !== 'Admin') {
    http_response_code(403);
    die("Unauthorized");
}

// Validate POST
if (!isset($_POST['id'])) {
    http_response_code(400);
    die("Invalid request.");
}

$id = intval($_POST['id']);

// DELETE request to API
$apiUrl = API_DMT . $id;

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $_SESSION['token'],
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Successful delete
if ($httpCode === 200 || $httpCode === 204) {
    header("Location: dashboard.php?deleted=1");
    exit();
}

// Error
http_response_code($httpCode);
die("Error deleting record: " . $response);
