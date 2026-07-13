
App.initPage();

const monthsShort = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function getFilteredExpenses() {
    const period = document.getElementById('chartPeriod').value;
    const all = App.getExpenses();
    if (period === 'all') return all;
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - parseInt(period) + 1, 1);
    return all.filter(function (e) { return new Date(e.date) >= cutoff; });
}

function renderCharts() {
    const expenses = getFilteredExpenses();
    const total = expenses.reduce(function (s, e) { return s + e.amount; }, 0);

    // --- Répartition par catégorie ---
    const catTotals = {};
    expenses.forEach(function (e) { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const sorted = Object.entries(catTotals).sort(function (a, b) { return b[1] - a[1]; });

    const legend = document.getElementById('pieLegend');
    if (!sorted.length) {
        legend.innerHTML = '<p class="text-center text-muted">Aucune donnée disponible.</p>';
    } else {
        legend.innerHTML = sorted.map(function (entry) {
            const name = entry[0], amount = entry[1];
            const style = App.getCategoryStyle(name);
            const pct = total ? (amount / total) * 100 : 0;
            return '<div class="mb-3">' +
                '<div class="d-flex align-items-center mb-1">' +
                    '<span class="legend-dot me-2" style="background:' + style.color + '"></span>' +
                    '<span>' + name + '</span>' +
                '</div>' +
                '<div class="progress mb-1">' +
                    '<div class="progress-bar" style="width:' + pct + '%;background:' + style.color + '"></div>' +
                '</div>' +
                '<small class="text-muted">' + pct.toFixed(1) + '% · ' + App.formatDT(amount) + '</small>' +
            '</div>';
        }).join('');
    }

    // --- Évolution mensuelle ---
    const now = new Date();
    const period = document.getElementById('chartPeriod').value;
    const nMonths = period === 'all' ? 12 : parseInt(period);
    const monthLabels = [];
    const monthTotals = [];
    for (let i = nMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        monthLabels.push(monthsShort[d.getMonth()] + ' ' + d.getFullYear().toString().slice(-2));
        monthTotals.push(expenses.filter(function (e) { return e.date.startsWith(key); }).reduce(function (s, e) { return s + e.amount; }, 0));
    }

    const barChart = document.getElementById('barChart');
    const maxVal = Math.max.apply(null, monthTotals.concat([1]));

    if (monthTotals.every(function (v) { return v === 0; })) {
        barChart.innerHTML = '<p class="text-center text-muted">Aucune donnée disponible.</p>';
    } else {
        barChart.innerHTML = monthLabels.map(function (label, i) {
            const heightPct = (monthTotals[i] / maxVal) * 100;
            return '<div class="bar-col">' +
                '<div class="bar-value">' + (monthTotals[i] > 0 ? monthTotals[i].toFixed(0) : '') + '</div>' +
                '<div class="bar-track"><div class="bar-fill" style="height:' + heightPct + '%"></div></div>' +
                '<div class="bar-label">' + label + '</div>' +
            '</div>';
        }).join('');
    }

    // --- Tableau récapitulatif ---
    const tbody = document.getElementById('summaryBody');
    if (!sorted.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Aucune donnée.</td></tr>';
    } else {
        tbody.innerHTML = sorted.map(function (entry) {
            const name = entry[0], amount = entry[1];
            const style = App.getCategoryStyle(name);
            const count = expenses.filter(function (e) { return e.category === name; }).length;
            const avg = count ? amount / count : 0;
            const pct = total ? (amount / total) * 100 : 0;
            return '<tr>' +
                '<td><span class="badge" style="background:' + style.color + '">' + style.icon + ' ' + name + '</span></td>' +
                '<td class="fw-bold">' + App.formatDT(amount) + '</td>' +
                '<td>' + count + '</td>' +
                '<td>' + App.formatDT(avg) + '</td>' +
                '<td>' +
                    '<div class="d-flex align-items-center gap-2">' +
                        '<div class="progress flex-grow-1"><div class="progress-bar" style="width:' + pct + '%;background:' + style.color + '"></div></div>' +
                        '<span>' + pct.toFixed(1) + '%</span>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }).join('');
    }
}

document.getElementById('chartPeriod').addEventListener('change', renderCharts);

renderCharts();