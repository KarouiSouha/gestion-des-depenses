const monthSel = document.getElementById('monthFilter');
const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const now = new Date();

async function setupPage() {
    // Vérifie la session et charge catégories + dépenses depuis le backend.
    const ok = await App.initPage();
    if (!ok) return; // redirection vers signin.html déjà lancée

    // Création de la liste des mois
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const option = document.createElement('option');
        option.value = value;
        option.textContent = months[d.getMonth()] + ' ' + d.getFullYear();
        if (i === 0) {
            option.selected = true;
        }
        monthSel.appendChild(option);
    }
    document.getElementById('currentMonthLabel').textContent = months[now.getMonth()] + ' ' + now.getFullYear();
    monthSel.addEventListener('change', renderDashboard);

    // Remplir le menu déroulant des catégories du popup rapide
    App.populateCategorySelect(document.getElementById('qaCategory'));
    document.getElementById('qaDate').value = new Date().toISOString().split('T')[0];

    renderDashboard();
}

function renderDashboard() {
    let expenses = App.getExpenses();
    const filter = monthSel.value;
    if (filter != '') {
        expenses = expenses.filter(function (e) {
            return e.date.startsWith(filter);
        });
    }
    let total = 0;
    expenses.forEach(function (e) {
        total += e.amount;
    });
    const nombre = expenses.length;
    const moyenne = nombre > 0 ? total / nombre : 0;
    document.getElementById('kpiTotal').textContent = App.formatDT(total);
    document.getElementById('kpiCount').textContent = nombre;
    document.getElementById('kpiAvg').textContent = App.formatDT(moyenne);
    const categories = {};
    expenses.forEach(function (e) {
        if (categories[e.category]) {
            categories[e.category] += e.amount;
        }
        else {
            categories[e.category] = e.amount;
        }
    });
    let plusGrande = '-';
    let max = 0;
    for (let nom in categories) {
        if (categories[nom] > max) {
            max = categories[nom];
            plusGrande = nom;
        }
    }
    document.getElementById('kpiTop').textContent = plusGrande;
    afficherCategories(categories, total);
    afficherRecentes(expenses);
}

function afficherCategories(categories, total) {
    const zone = document.getElementById('categoryBreakdown');
    let html = '';
    for (let nom in categories) {
        const montant = categories[nom];
        let pourcentage = 0;
        if (total > 0) {
            pourcentage = (montant * 100) / total;
        }
        const style = App.getCategoryStyle(nom);
        html += `
        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span>${nom}</span>
                <span>${App.formatDT(montant)}</span>
            </div>
            <div class="progress">
                <div class="progress-bar" style="width:${pourcentage}%; background:${style.color};"></div>
            </div>
        </div>
        `;
    }
    if (html == '') {
        html = '<p class="text-center text-muted">Aucune dépense enregistrée.</p>';
    }
    zone.innerHTML = html;
}

function afficherRecentes(expenses) {
    const zone = document.getElementById('recentExpenses');
    let html = '';
    expenses.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    for (let i = 0; i < expenses.length && i < 5; i++) {
        const e = expenses[i];
        const style = App.getCategoryStyle(e.category);
        html += `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <strong>${e.category}</strong><br>
                <small>${e.description}</small><br>
                <small>${e.date}</small>
            </div>
            <div class="fw-bold" style="color:${style.color};">${App.formatDT(e.amount)}</div>
        </div>
        `;
    }
    if (html == '') {
        html = '<p class="text-center text-muted">Aucune dépense.</p>';
    }
    zone.innerHTML = html;
}

async function quickSave() {
    const amount = parseFloat(document.getElementById('qaAmount').value);
    const category = document.getElementById('qaCategory').value;
    const date = document.getElementById('qaDate').value;
    const description = document.getElementById('qaDesc').value;
    if (!amount || !category || !date) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    await App.addExpense({
        amount: amount,
        category: category,
        date: date,
        description: description
    });
    const modalEl = document.getElementById('quickAddModal');
    bootstrap.Modal.getInstance(modalEl).hide();
    renderDashboard();
}

setupPage();