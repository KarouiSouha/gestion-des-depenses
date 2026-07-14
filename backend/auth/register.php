<?php
require_once __DIR__ . '/../config.php';

$data = readJsonBody();
$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$name || !$email || !$password) {
    echo json_encode(['ok' => false, 'error' => 'Veuillez remplir tous les champs.']);
    exit;
}

// Vérifie si l'email existe déjà
$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['ok' => false, 'error' => 'Un compte existe déjà avec cet e-mail.']);
    exit;
}
$stmt->close();

// Hash du mot de passe (jamais stocké en clair)
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $hash);
$stmt->execute();
$userId = $stmt->insert_id;
$stmt->close();

// Catégories par défaut pour ce nouvel utilisateur
$defaultCategories = [
    ['Alimentation', 'Courses, supermarché, restaurants', '#F97316', '🍽️'],
    ['Transport',    'Taxi, bus, carburant, péages',      '#5C7AEA', '🚗'],
    ['Logement',     'Loyer, eau, électricité, internet', '#10B981', '🏠'],
    ['Santé',        'Médecin, pharmacie, analyses',      '#EF4444', '❤️'],
    ['Loisirs',      'Cinéma, café, sorties culturelles', '#8B5CF6', '🎬'],
    ['Internet',     'Wi-Fi, abonnement mobile',          '#06B6D4', '📶'],
    ['Éducation',    'Livres, formations, cours',         '#F59E0B', '📚'],
    ['Autres',       'Dépenses diverses non catégorisées','#6B7280', '➖'],
];
$stmt = $conn->prepare(
    'INSERT INTO categories (user_id, name, description, color, icon, is_default) VALUES (?, ?, ?, ?, ?, 1)'
);
foreach ($defaultCategories as $c) {
    $stmt->bind_param('issss', $userId, $c[0], $c[1], $c[2], $c[3]);
    $stmt->execute();
}
$stmt->close();

// Connecte automatiquement l'utilisateur après inscription
$_SESSION['user_id'] = $userId;
$_SESSION['name']    = $name;
$_SESSION['email']   = $email;

echo json_encode(['ok' => true, 'user' => ['name' => $name, 'email' => $email]]);
