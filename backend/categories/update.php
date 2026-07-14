<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();
$data = readJsonBody();

$id          = (int) ($data['id'] ?? 0);
$name        = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$color       = $data['color'] ?? '#999999';
$icon        = $data['icon'] ?? '❓';

$stmt = $conn->prepare(
    'UPDATE categories SET name = ?, description = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?'
);
$stmt->bind_param('ssssii', $name, $description, $color, $icon, $id, $userId);
$stmt->execute();

echo json_encode(['ok' => true]);
