<?php
require_once __DIR__ . '/../config.php';
$userId = requireAuth();
$data = readJsonBody();

$category    = trim($data['category'] ?? '');
$amount      = (float) ($data['amount'] ?? 0);
$date        = $data['date'] ?? date('Y-m-d');
$description = trim($data['description'] ?? '');

if (!$category || $amount <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Catégorie et montant sont obligatoires.']);
    exit;
}

$stmt = $conn->prepare(
    'INSERT INTO expenses (user_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)'
);
$stmt->bind_param('isdss', $userId, $category, $amount, $date, $description);
$stmt->execute();

echo json_encode(['ok' => true, 'id' => $stmt->insert_id]);
