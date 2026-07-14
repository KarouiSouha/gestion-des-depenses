<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();

$stmt = $conn->prepare('SELECT id, category, amount, date, description FROM expenses WHERE user_id = ? ORDER BY date DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$expenses = [];
while ($row = $result->fetch_assoc()) {
    $row['amount'] = (float) $row['amount'];
    $expenses[] = $row;
}

echo json_encode(['ok' => true, 'expenses' => $expenses]);
