const App = (() => {

  /* ── CONFIG ──────────────────────────────────────────────── */
  // Chemin vers le backend PHP, relatif aux pages HTML du frontend.
  // Si tu suis le README (backend/ à côté de gestion-depenses/), ne change rien.
  const API_BASE = '../backend/';

  /* ── APPEL API (fetch) ───────────────────────────────────── */
  // credentials: 'include' est indispensable : c'est ce qui permet au
  // navigateur d'envoyer le cookie de session PHP à chaque requête.
  async function apiGet(path) {
    const res = await fetch(API_BASE + path, { credentials: 'include' });
    return res.json();
  }

  async function apiPost(path, data) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data || {})
    });
    return res.json();
  }

  /* ── CACHE LOCAL (évite de re-fetcher à chaque affichage) ─── */
  let _user = null;
  let _categories = [];
  let _expenses = [];

  /* ── AUTH ────────────────────────────────────────────────── */
  async function login(email, password) {
    const result = await apiPost('auth/login.php', { email, password });
    if (result.ok) _user = result.user;
    return result; // { ok, user } ou { ok:false, error }
  }

  async function register(name, email, password) {
    const result = await apiPost('auth/register.php', { name, email, password });
    if (result.ok) _user = result.user;
    return result;
  }

  async function logout() {
    await apiPost('auth/logout.php');
    window.location.href = 'signin.html';
  }

  // Interroge le serveur pour savoir si une session est active.
  async function checkAuth() {
    const result = await apiGet('auth/me.php');
    if (result.ok) _user = result.user;
    return result.ok;
  }

  function getUser() {
    return _user || {};
  }

  // À appeler en haut des pages publiques (signin.html, signup.html) :
  // redirige vers le dashboard si l'utilisateur est déjà connecté.
  async function redirectIfLoggedIn() {
    if (await checkAuth()) window.location.href = 'dashboard.html';
  }

  // À appeler en haut de chaque page protégée (dashboard, depenses, etc.) :
  // redirige vers signin.html si pas connecté, sinon charge les données.
  async function initPage() {
    const loggedIn = await checkAuth();
    if (!loggedIn) {
      window.location.href = 'signin.html';
      return false;
    }
    const greeting = document.getElementById('userGreeting');
    if (greeting) greeting.textContent = getUser().name;
    await Promise.all([loadCategories(), loadExpenses()]);
    return true;
  }

  /* ── EXPENSES ────────────────────────────────────────────── */
  // getExpenses() reste synchrone : elle lit le cache déjà chargé par initPage().
  function getExpenses() {
    return _expenses;
  }

  async function loadExpenses() {
    const result = await apiGet('expenses/get.php');
    _expenses = result.ok ? result.expenses : [];
    return _expenses;
  }

  async function addExpense(data) {
    await apiPost('expenses/add.php', data);
    await loadExpenses();
  }

  async function updateExpense(id, data) {
    await apiPost('expenses/update.php', { id, ...data });
    await loadExpenses();
  }

  async function deleteExpense(id) {
    await apiPost('expenses/delete.php', { id });
    await loadExpenses();
  }

  /* ── CATEGORIES ──────────────────────────────────────────── */
  function getCategories() {
    return _categories;
  }

  async function loadCategories() {
    const result = await apiGet('categories/get.php');
    _categories = result.ok ? result.categories : [];
    return _categories;
  }

  async function addCategory(data) {
    await apiPost('categories/add.php', data);
    await loadCategories();
  }

  async function updateCategory(id, data) {
    await apiPost('categories/update.php', { id, ...data });
    await loadCategories();
  }

  async function deleteCategory(id) {
    await apiPost('categories/delete.php', { id });
    await loadCategories();
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('d-none');
  }

  /* ── FORMATAGE ───────────────────────────────────────────── */
  function formatDT(amount) {
    return (amount || 0).toFixed(3) + ' DT';
  }

  /* ── HELPERS CATÉGORIES ──────────────────────────────────── */
  // Retourne la catégorie correspondant à un nom, ou un style par défaut si introuvable
  function getCategoryStyle(name) {
    const cat = getCategories().find(c => c.name === name);
    return cat || { name, color: '#999', icon: '❓' };
  }

  // Remplit un <select> avec la liste des catégories
  // options: { includeEmpty: bool, emptyLabel: string }
  function populateCategorySelect(selectEl, options) {
    options = options || {};
    if (!selectEl) return;
    if (options.includeEmpty) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = options.emptyLabel || 'Choisir une catégorie...';
      selectEl.appendChild(opt);
    }
    getCategories().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      selectEl.appendChild(opt);
    });
  }

  /* ── FORMULAIRES : AFFICHER/MASQUER MOT DE PASSE ──────────── */
  // Branche un bouton "Afficher/Masquer" sur un champ password (login.html, signup.html)
  function setupPasswordToggle(toggleBtnId, inputId) {
    const btn = document.getElementById(toggleBtnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', function () {
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Masquer';
      } else {
        input.type = 'password';
        btn.textContent = 'Afficher';
      }
    });
  }

  /* ── PUBLIC API ──────────────────────────────────────────── */
  return {
    login, logout, getUser, register, checkAuth, redirectIfLoggedIn,
    getExpenses, addExpense, updateExpense, deleteExpense, loadExpenses,
    getCategories, addCategory, updateCategory, deleteCategory, loadCategories,
    initPage, toggleSidebar, formatDT, getCategoryStyle,
    populateCategorySelect, setupPasswordToggle
  };

})();