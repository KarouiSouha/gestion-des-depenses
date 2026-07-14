let deleteTarget = null;
let catModal, deleteCatModal;

const COLOR_PRESETS = ['#5C7AEA','#F97316','#10B981','#EF4444','#8B5CF6','#F59E0B','#06B6D4','#EC4899','#84CC16','#6B7280'];
const ICON_OPTIONS = ['🍽️','🚗','🏠','❤️','🎬','📶','📚','➖','👕','✈️','🎮','🏋️','🎵','🎁','🐾','⭐'];

async function setupPage() {
    const ok = await App.initPage();
    if (!ok) return; // redirection vers signin.html déjà lancée

    catModal = new bootstrap.Modal(document.getElementById('catModal'));
    deleteCatModal = new bootstrap.Modal(document.getElementById('deleteCatModal'));

    // Construire les pastilles de couleur
    const presets = document.getElementById('colorPresets');
    COLOR_PRESETS.forEach(function (color) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm';
        btn.style.background = color;
        btn.style.width = '25px';
        btn.style.height = '25px';
        btn.title = color;
        btn.onclick = function () { document.getElementById('catColor').value = color; };
        presets.appendChild(btn);
    });

    // Construire la grille d'icônes
    const iconGrid = document.getElementById('iconGrid');
    ICON_OPTIONS.forEach(function (icon) {
        const col = document.createElement('div');
        col.className = 'col';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-secondary w-100 icon-btn';
        btn.dataset.icon = icon;
        btn.textContent = icon;
        btn.onclick = function () {
            document.querySelectorAll('.icon-btn').forEach(function (b) { b.classList.remove('active', 'btn-primary'); b.classList.add('btn-outline-secondary'); });
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-outline-secondary');
            document.getElementById('catIcon').value = icon;
        };
        col.appendChild(btn);
        iconGrid.appendChild(col);
    });

    document.getElementById('confirmCatDelete').addEventListener('click', async function () {
        if (deleteTarget !== null) {
            await App.deleteCategory(deleteTarget);
            deleteTarget = null;
            deleteCatModal.hide();
            renderGrid();
        }
    });

    renderGrid();
}

function renderGrid() {
    const cats = App.getCategories();
    const expenses = App.getExpenses();
    const grid = document.getElementById('catGrid');

    grid.innerHTML = cats.map(function (c) {
        const count = expenses.filter(function (e) { return e.category === c.name; }).length;
        const total = expenses.filter(function (e) { return e.category === c.name; }).reduce(function (s, e) { return s + e.amount; }, 0);
        return '<div class="col-md-6 col-lg-4 mb-4">' +
            '<div class="card shadow-sm h-100">' +
                '<div class="card-body">' +
                    '<div class="d-flex align-items-center gap-2 mb-3">' +
                        '<span class="cat-card-icon" style="background:' + c.color + '">' + c.icon + '</span>' +
                        '<div>' +
                            '<div class="fw-bold">' + c.name + '</div>' +
                            '<div class="text-muted small">' + (c.description || 'Aucune description') + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="d-flex justify-content-between mb-3">' +
                        '<span>🧾 ' + count + ' dépense' + (count > 1 ? 's' : '') + '</span>' +
                        '<span class="fw-bold" style="color:' + c.color + '">' + App.formatDT(total) + '</span>' +
                    '</div>' +
                    '<div class="d-flex justify-content-between">' +
                        '<button class="btn btn-sm btn-outline-primary" onclick="editCat(' + c.id + ')">✏️ Modifier</button>' +
                        (!c.is_default ? '<button class="btn btn-sm btn-outline-danger" onclick="confirmDelCat(' + c.id + ')">🗑️ Supprimer</button>' : '<span class="badge bg-success">Défaut</span>') +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function openCatModal(cat) {
    cat = cat || null;
    document.getElementById('catEditId').value = cat ? cat.id : '';
    document.getElementById('catName').value = cat ? cat.name : '';
    document.getElementById('catDesc').value = cat ? (cat.description || '') : '';
    document.getElementById('catColor').value = cat ? cat.color : '#5C7AEA';
    document.getElementById('catIcon').value = cat ? cat.icon : '❓';
    document.getElementById('catModalTitle').textContent = cat ? '✏️ Modifier la catégorie' : '🏷️ Nouvelle catégorie';

    document.querySelectorAll('.icon-btn').forEach(function (b) {
        const isActive = b.dataset.icon === (cat ? cat.icon : '❓');
        b.classList.toggle('active', isActive);
        b.classList.toggle('btn-primary', isActive);
        b.classList.toggle('btn-outline-secondary', !isActive);
    });
}

function editCat(id) {
    const cat = App.getCategories().find(function (c) { return c.id === id; });
    if (cat) {
        openCatModal(cat);
        catModal.show();
    }
}

async function saveCat() {
    const name = document.getElementById('catName').value.trim();
    if (!name) { alert('Veuillez entrer un nom.'); return; }

    const data = {
        name: name,
        description: document.getElementById('catDesc').value.trim(),
        color: document.getElementById('catColor').value,
        icon: document.getElementById('catIcon').value
    };

    const id = document.getElementById('catEditId').value;
    if (id) {
        await App.updateCategory(parseInt(id), data);
    } else {
        await App.addCategory(data);
    }

    catModal.hide();
    renderGrid();
}

function confirmDelCat(id) {
    deleteTarget = id;
    const cat = App.getCategories().find(function (c) { return c.id === id; });
    const count = App.getExpenses().filter(function (e) { return e.category === (cat ? cat.name : null); }).length;
    document.getElementById('deleteCatWarning').textContent = count
        ? 'Attention : ' + count + ' dépense(s) utilisent cette catégorie.'
        : 'Cette action est irréversible.';
    deleteCatModal.show();
}

setupPage();