<?php

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and message are required']);
    exit;
}

$name    = trim(strip_tags($input['name']));
$message = trim(strip_tags($input['message']));

if (mb_strlen($name) < 1 || mb_strlen($name) > 60) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name must be between 1 and 60 characters']);
    exit;
}

if (mb_strlen($message) < 1 || mb_strlen($message) > 500) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message must be between 1 and 500 characters']);
    exit;
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare('INSERT INTO comments (name, message) VALUES (:name, :message)');
    $stmt->execute([':name' => $name, ':message' => $message]);

    echo json_encode(['success' => true, 'id' => (int) $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
