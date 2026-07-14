<?php
/**
 * config.php
 * Connexion à la base de données + réglages communs à toutes les API.
 * Ce fichier est inclus (require) en haut de chaque script api/*.php
 */

// Affiche les erreurs pendant le développement (à désactiver en production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Toutes les réponses seront en JSON
header('Content-Type: application/json; charset=utf-8');

// Session PHP = notre système d'authentification (simple, pas de JWT)
session_start();

// ── Paramètres de connexion (à adapter selon ton environnement) ──
$DB_HOST = 'localhost';
$DB_NAME = 'gestion_depenses';
$DB_USER = 'root';       // par défaut avec XAMPP/WAMP
$DB_PASS = 'root';       // mot de passe MySQL root

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Connexion à la base de données échouée.']);
    exit;
}
$conn->set_charset('utf8mb4');

/**
 * Lit le corps JSON envoyé par le frontend (fetch avec body: JSON.stringify(...))
 */
function readJsonBody() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?: [];
}

/**
 * Bloque l'accès si l'utilisateur n'est pas connecté.
 * Renvoie l'id de l'utilisateur connecté.
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Non connecté.']);
        exit;
    }
    return $_SESSION['user_id'];
}
