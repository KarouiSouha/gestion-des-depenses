/**
 * MonBudget – Application Logic
 * Gestion des dépenses personnelles
 */

const App = (() => {

  /* ── DEMO USER ──────────────────────────────────────────── */
  const DEMO_USER = {
    email: 'admin@demo.com',
    password: '123456',
    name: 'Admin'
  };

  /* ── DEFAULT CATEGORIES ──────────────────────────────────── */
  const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Alimentation', description: 'Courses, supermarché, restaurants', color: '#F97316', icon: '🍽️', isDefault: true },
    { id: 2, name: 'Transport',    description: 'Taxi, bus, carburant, péages',        color: '#5C7AEA', icon: '🚗', isDefault: true },
    { id: 3, name: 'Logement',     description: 'Loyer, eau, électricité, internet',   color: '#10B981', icon: '🏠', isDefault: true },
    { id: 4, name: 'Santé',        description: 'Médecin, pharmacie, analyses',        color: '#EF4444', icon: '❤️', isDefault: true },
    { id: 5, name: 'Loisirs',      description: 'Cinéma, café, sorties culturelles',   color: '#8B5CF6', icon: '🎬', isDefault: true },
    { id: 6, name: 'Internet',     description: 'Wi-Fi, abonnement mobile',            color: '#06B6D4', icon: '📶', isDefault: true },
    { id: 7, name: 'Éducation',    description: 'Livres, formations, cours',           color: '#F59E0B', icon: '📚', isDefault: true },
    { id: 8, name: 'Autres',       description: 'Dépenses diverses non catégorisées',  color: '#6B7280', icon: '➖', isDefault: true }
  ];

  /* ── DEMO DATA ───────────────────────────────────────────── */
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const pm = String(now.getMonth()).padStart(2, '0') || '12';
  const py = now.getMonth() === 0 ? y - 1 : y;

  const DEMO_EXPENSES = [
    { id: 1,  amount: 85.000, category: 'Alimentation', date: `${y}-${m}-02`, description: 'Carrefour Market' },
    { id: 2,  amount: 12.500, category: 'Transport',    date: `${y}-${m}-03`, description: 'Taxi Uber' },
    { id: 3,  amount: 650.000,category: 'Logement',     date: `${y}-${m}-01`, description: 'Loyer mensuel' },
    { id: 4,  amount: 45.000, category: 'Santé',        date: `${y}-${m}-05`, description: 'Consultation Dr. Ahmed' },
    { id: 5,  amount: 30.000, category: 'Loisirs',      date: `${y}-${m}-06`, description: 'Cinéma + restaurant' },
    { id: 6,  amount: 39.900, category: 'Internet',     date: `${y}-${m}-01`, description: 'Abonnement TOPNET' },
    { id: 7,  amount: 75.000, category: 'Éducation',    date: `${y}-${m}-08`, description: 'Cours de langues' },
    { id: 8,  amount: 22.000, category: 'Alimentation', date: `${y}-${m}-10`, description: 'Restaurant déjeuner' },
    { id: 9,  amount: 8.500,  category: 'Transport',    date: `${y}-${m}-12`, description: 'Bus métro' },
    { id: 10, amount: 55.000, category: 'Alimentation', date: `${py}-${pm}-15`, description: 'Monoprix' },
    { id: 11, amount: 120.000,category: 'Santé',        date: `${py}-${pm}-20`, description: 'Analyses médicales' },
    { id: 12, amount: 18.000, category: 'Loisirs',      date: `${py}-${pm}-22`, description: 'Café et sorties' },
    { id: 13, amount: 650.000,category: 'Logement',     date: `${py}-${pm}-01`, description: 'Loyer mensuel' },
    { id: 14, amount: 95.000, category: 'Alimentation', date: `${py}-${pm}-05`, description: 'Marché Bab Bhar' },
  ];

  /* ── STORAGE HELPERS ─────────────────────────────────────── */
  const store = {
    get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  };

  function init() {
    if (!store.get('mb_users'))      store.set('mb_users', [DEMO_USER]);
    if (!store.get('mb_categories')) store.set('mb_categories', DEFAULT_CATEGORIES);
    if (!store.get('mb_expenses'))   store.set('mb_expenses',   DEMO_EXPENSES);
    if (!store.get('mb_nextId'))     store.set('mb_nextId', 100);
  }

  function nextId() {
    const id = (store.get('mb_nextId') || 100) + 1;
    store.set('mb_nextId', id);
    return id;
  }

  /* ── USERS ───────────────────────────────────────────────── */
  function getUsers() {
    return store.get('mb_users') || [DEMO_USER];
  }

  function emailExists(email) {
    return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /* ── AUTH ────────────────────────────────────────────────── */
  function login(email, password) {
    init();
    const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      store.set('mb_session', { email: user.email, name: user.name, loginAt: Date.now() });
      return true;
    }
    return false;
  }

  function register(name, email, password) {
    init();
    if (!name || !email || !password) {
      return { ok: false, error: 'Veuillez remplir tous les champs.' };
    }
    if (emailExists(email)) {
      return { ok: false, error: 'Un compte existe déjà avec cet e-mail.' };
    }
    const users = getUsers();
    users.push({ name, email, password });
    store.set('mb_users', users);
    store.set('mb_session', { email, name, loginAt: Date.now() });
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem('mb_session');
    window.location.href = 'index.html';
  }

  function isLoggedIn() {
    return !!store.get('mb_session');
  }

  function getUser() {
    return store.get('mb_session') || {};
  }

  function requireAuth() {
    if (!isLoggedIn()) window.location.href = 'index.html';
    init();
  }

  /* ── EXPENSES ────────────────────────────────────────────── */
  function getExpenses() {
    return store.get('mb_expenses') || [];
  }

  function addExpense(data) {
    const expenses = getExpenses();
    expenses.push({ id: nextId(), ...data });
    store.set('mb_expenses', expenses);
  }

  function updateExpense(id, data) {
    const expenses = getExpenses().map(e => e.id === id ? { ...e, ...data } : e);
    store.set('mb_expenses', expenses);
  }

  function deleteExpense(id) {
    store.set('mb_expenses', getExpenses().filter(e => e.id !== id));
  }

  /* ── CATEGORIES ──────────────────────────────────────────── */
  function getCategories() {
    return store.get('mb_categories') || DEFAULT_CATEGORIES;
  }

  function addCategory(data) {
    const cats = getCategories();
    cats.push({ id: nextId(), isDefault: false, ...data });
    store.set('mb_categories', cats);
  }

  function updateCategory(id, data) {
    const cats = getCategories().map(c => c.id === id ? { ...c, ...data } : c);
    store.set('mb_categories', cats);
  }

  function deleteCategory(id) {
    store.set('mb_categories', getCategories().filter(c => c.id !== id));
  }

  /* ── PUBLIC API ──────────────────────────────────────────── */
  return {
    login, logout, isLoggedIn, getUser, requireAuth, register, emailExists,
    getExpenses, addExpense, updateExpense, deleteExpense,
    getCategories, addCategory, updateCategory, deleteCategory
  };

})();