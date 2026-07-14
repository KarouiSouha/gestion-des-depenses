<?php
require_once __DIR__ . '/../config.php';

$data     = readJsonBody();
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

$stmt = $conn->prepare('SELECT id, name, password FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['ok' => false, 'error' => 'Email ou mot de passe incorrect.']);
    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];
$_SESSION['email']   = $email;

echo json_encode(['ok' => true, 'user' => ['name' => $user['name'], 'email' => $email]]);
