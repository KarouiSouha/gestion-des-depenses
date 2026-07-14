<?php
require_once __DIR__ . '/../config.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => true, 'user' => ['name' => $_SESSION['name'], 'email' => $_SESSION['email']]]);
} else {
    echo json_encode(['ok' => false]);
}
