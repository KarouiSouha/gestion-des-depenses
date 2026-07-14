<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();
$data = readJsonBody();
$id = (int) ($data['id'] ?? 0);

$stmt = $conn->prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?');
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();

echo json_encode(['ok' => true]);
