# Backend PHP + MySQL — Gestion des dépenses

Stack minimaliste : **PHP procédural + MySQLi + sessions**, aucun framework, aucune dépendance à installer.

## 1. Installer un environnement PHP + MySQL

Le plus simple pour débuter : **XAMPP** (Windows/Mac/Linux) — https://www.apachefriends.org
Il installe Apache, PHP et MySQL/phpMyAdmin en une seule fois.

## 2. Créer la base de données

1. Démarre XAMPP (Apache + MySQL).
2. Va sur `http://localhost/phpmyadmin`.
3. Onglet **SQL** → colle le contenu de `sql/schema.sql` → **Exécuter**.
   (Cela crée la base `gestion_depenses` et ses 3 tables.)

## 3. Placer le projet

Copie tout le dossier `backend/` (et ton dossier `gestion-depenses/` du frontend)
dans `htdocs/` (XAMPP) ou `www/` (WAMP/MAMP), par exemple :

```
htdocs/
└── gestion-des-depenses/
    ├── backend/            ← ce dossier
    └── gestion-depenses/   ← ton frontend HTML/CSS/JS existant
```

## 4. Vérifier `config.php`

Par défaut XAMPP utilise l'utilisateur `root` sans mot de passe — ça marche tel quel.
Si tu as changé les identifiants MySQL, adapte `backend/config.php` :

```php
$DB_HOST = 'localhost';
$DB_NAME = 'gestion_depenses';
$DB_USER = 'root';
$DB_PASS = '';
```

## 5. Tester

Ouvre : `http://localhost/gestion-des-depenses/backend/auth/me.php`
→ tu dois voir `{"ok":false}` (normal, tu n'es pas connecté).

## Endpoints disponibles

Toutes les requêtes se font en **POST** avec un corps JSON, sauf `get.php` (GET simple).
Toutes les réponses sont en JSON : `{"ok": true/false, ...}`.

| Endpoint                          | Méthode | Body JSON envoyé                                  |
|------------------------------------|---------|-----------------------------------------------------|
| `auth/register.php`               | POST    | `{name, email, password}`                            |
| `auth/login.php`                  | POST    | `{email, password}`                                  |
| `auth/logout.php`                 | POST    | —                                                     |
| `auth/me.php`                     | GET     | — (vérifie si connecté)                               |
| `categories/get.php`              | GET     | —                                                     |
| `categories/add.php`              | POST    | `{name, description, color, icon}`                   |
| `categories/update.php`           | POST    | `{id, name, description, color, icon}`                |
| `categories/delete.php`           | POST    | `{id}`                                                |
| `expenses/get.php`                | GET     | —                                                     |
| `expenses/add.php`                | POST    | `{category, amount, date, description}`               |
| `expenses/update.php`             | POST    | `{id, category, amount, date, description}`            |
| `expenses/delete.php`             | POST    | `{id}`                                                |

## Exemple d'appel depuis le JS du frontend

```js
async function login(email, password) {
  const res = await fetch('/gestion-des-depenses/backend/auth/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',           // ⚠️ indispensable pour garder la session
    body: JSON.stringify({ email, password })
  });
  return res.json();                  // { ok: true, user: {...} }
}
```

L'option `credentials: 'include'` est **obligatoire** : c'est elle qui permet au
navigateur d'envoyer/recevoir le cookie de session PHP à chaque requête.

## Sécurité — ce qui est déjà fait

- Mots de passe hashés avec `password_hash()` (jamais stockés en clair).
- Requêtes préparées (`mysqli::prepare`) partout → protection contre les injections SQL.
- Chaque catégorie/dépense est liée à un `user_id` et vérifiée à chaque
  modification/suppression → un utilisateur ne peut pas toucher aux données d'un autre.

## Prochaine étape suggérée

Une fois ce backend testé (avec Postman ou simplement en le branchant), on peut
remplacer les fonctions `localStorage` de `app.js` par des appels `fetch()`
vers ces endpoints. Dis-moi quand tu veux le faire et je m'en occupe.
