<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();

$stmt = $conn->prepare('SELECT id, name, description, color, icon, is_default FROM categories WHERE user_id = ?');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$categories = [];
while ($row = $result->fetch_assoc()) {
    $row['is_default'] = (bool) $row['is_default'];
    $categories[] = $row;
}

echo json_encode(['ok' => true, 'categories' => $categories]);
