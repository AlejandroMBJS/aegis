<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['access_token']) || 
    !isset($data['employee_number']) || 
    !isset($data['role']) || 
    !isset($data['full_name'])) {

    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing user data"]);
    exit();
}

$_SESSION['token'] = $data['access_token'];

$_SESSION['user'] = [
    "employee_number" => $data["employee_number"],
    "full_name"       => $data["full_name"],   
    "role"            => $data["role"]
];

echo json_encode(["success" => true]);
