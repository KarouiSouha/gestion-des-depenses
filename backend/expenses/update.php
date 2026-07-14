<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();
$data = readJsonBody();

$id          = (int) ($data['id'] ?? 0);
$category    = trim($data['category'] ?? '');
$amount      = (float) ($data['amount'] ?? 0);
$date        = $data['date'] ?? date('Y-m-d');
$description = trim($data['description'] ?? '');

$stmt = $conn->prepare(
    'UPDATE expenses SET category = ?, amount = ?, date = ?, description = ? WHERE id = ? AND user_id = ?'
);
$stmt->bind_param('sdssii', $category, $amount, $date, $description, $id, $userId);
$stmt->execute();

echo json_encode(['ok' => true]);
