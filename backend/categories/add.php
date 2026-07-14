<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();
$data = readJsonBody();

$name        = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$color       = $data['color'] ?? '#999999';
$icon        = $data['icon'] ?? '❓';

if (!$name) {
    echo json_encode(['ok' => false, 'error' => 'Le nom est obligatoire.']);
    exit;
}

$stmt = $conn->prepare(
    'INSERT INTO categories (user_id, name, description, color, icon, is_default) VALUES (?, ?, ?, ?, ?, 0)'
);
$stmt->bind_param('issss', $userId, $name, $description, $color, $icon);
$stmt->execute();

echo json_encode(['ok' => true, 'id' => $stmt->insert_id]);
