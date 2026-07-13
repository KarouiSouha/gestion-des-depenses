
App.initPage();

const filterCat = document.getElementById('filterCat');
const fCat = document.getElementById('fCategory');
App.populateCategorySelect(filterCat, { includeEmpty: true, emptyLabel: 'Toutes les catégories' });
App.populateCategorySelect(fCat, { includeEmpty: true, emptyLabel: 'Choisir une catégorie...' });

document.getElementById('fDate').value = new Date().toISOString().split('T')[0];

let currentFilter = { cat: '', from: '', to: '' };
let deleteTarget = null;

const expenseModal = new bootstrap.Modal(document.getElementById('expenseModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

function getFiltered() {
    let expenses = App.getExpenses();
    if (currentFilter.cat) expenses = expenses.filter(function (e) { return e.category === currentFilter.cat; });
    if (currentFilter.from) expenses = expenses.filter(function (e) { return e.date >= currentFilter.from; });
    if (currentFilter.to) expenses = expenses.filter(function (e) { return e.date <= currentFilter.to; });
    return expenses.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
}

function renderTable() {
    const expenses = getFiltered();
    const body = document.getElementById('expenseBody');
    document.getElementById('expenseCount').textContent = expenses.length;

    if (!expenses.length) {
        body.innerHTML = '<tr><td colspan="5" class="text-muted">Aucune dépense trouvée.</td></tr>';
        document.getElementById('filteredTotal').textContent = '0.000 DT';
        return;
    }

    const total = expenses.reduce(function (s, e) { return s + e.amount; }, 0);
    document.getElementById('filteredTotal').textContent = App.formatDT(total);

    body.innerHTML = expenses.map(function (e) {
        const style = App.getCategoryStyle(e.category);
        const parts = e.date.split('-');
        const y = parts[0], m = parts[1], d = parts[2];
        return '<tr>' +
            '<td>' + d + '/' + m + '/' + y + '</td>' +
            '<td><span class="badge" style="background:' + style.color + '">' + style.icon + ' ' + e.category + '</span></td>' +
            '<td class="text-muted">' + (e.description || '—') + '</td>' +
            '<td class="fw-bold">' + App.formatDT(e.amount) + '</td>' +
            '<td>' +
                '<button class="btn btn-sm btn-outline-primary" onclick="editExpense(' + e.id + ')">✏️</button> ' +
                '<button class="btn btn-sm btn-outline-danger" onclick="confirmDel(' + e.id + ')">🗑️</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function applyFilters() {
    currentFilter.cat = document.getElementById('filterCat').value;
    currentFilter.from = document.getElementById('filterFrom').value;
    currentFilter.to = document.getElementById('filterTo').value;
    renderTable();
}

function clearFilters() {
    document.getElementById('filterCat').value = '';
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    currentFilter = { cat: '', from: '', to: '' };
    renderTable();
}

function openModal(expense) {
    expense = expense || null;
    document.getElementById('editId').value = expense ? expense.id : '';
    document.getElementById('fAmount').value = expense ? expense.amount : '';
    document.getElementById('fCategory').value = expense ? expense.category : '';
    document.getElementById('fDate').value = expense ? expense.date : new Date().toISOString().split('T')[0];
    document.getElementById('fDesc').value = expense ? expense.description : '';
    document.getElementById('modalTitle').textContent = expense ? '✏️ Modifier la dépense' : '➕ Ajouter une dépense';
}

function editExpense(id) {
    const e = App.getExpenses().find(function (x) { return x.id === id; });
    if (e) {
        openModal(e);
        expenseModal.show();
    }
}

function saveExpense() {
    const amount = parseFloat(document.getElementById('fAmount').value);
    const category = document.getElementById('fCategory').value;
    const date = document.getElementById('fDate').value;
    const description = document.getElementById('fDesc').value.trim();

    if (!amount || amount <= 0 || !category || !date) {
        alert('Veuillez remplir correctement tous les champs obligatoires.');
        return;
    }

    const data = { amount: amount, category: category, date: date, description: description };
    const id = document.getElementById('editId').value;
    if (id) {
        App.updateExpense(parseInt(id), data);
    } else {
        App.addExpense(data);
    }

    expenseModal.hide();
    renderTable();
}

function confirmDel(id) {
    deleteTarget = id;
    deleteModal.show();
}

document.getElementById('confirmDelete').addEventListener('click', function () {
    if (deleteTarget !== null) {
        App.deleteExpense(deleteTarget);
        deleteTarget = null;
        deleteModal.hide();
        renderTable();
    }
});

// Ouvrir le popup d'ajout si on arrive avec ?action=add
if (new URLSearchParams(window.location.search).get('action') === 'add') {
    openModal();
    expenseModal.show();
}

renderTable();