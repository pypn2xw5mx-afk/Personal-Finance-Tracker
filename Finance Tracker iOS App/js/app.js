/* ===== Finance Tracker - Full App Logic (single-file JS) ===== */
console.log("app.js loaded ✅");

/* ======================
   Tabs (global because HTML onclick uses it)
====================== */
window.showTab = function showTab(tabId) {
    document.querySelectorAll('div[id$="Tab"]').forEach(div => div.style.display = 'none');
    const activeTab = document.getElementById(tabId + 'Tab');
    if (activeTab) activeTab.style.display = 'block';

    document.querySelectorAll('#tabs button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`#tabs button[onclick="showTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
};

/* ======================
   Grab elements safely
====================== */
const el = {
    dashboardMoneyLeft: document.getElementById("dashboardMoneyLeft"),
    totalExpenses: document.getElementById("totalExpenses"),
    dashboardMonthLabel: document.getElementById("dashboardMonthLabel"),
    dashboardGeneralMonthLabel: document.getElementById("dashboardGeneralMonthLabel"),

    totalIncomeMonthly: document.getElementById("totalIncomeMonthly"),
    totalIncomeYearly: document.getElementById("totalIncomeYearly"),

    dashCash: document.getElementById("dashCash"),
    dashInvest: document.getElementById("dashInvest"),
    dashCrypto: document.getElementById("dashCrypto"),
    smallFixed: document.getElementById("smallFixed"),
    smallVariable: document.getElementById("smallVariable"),
    savingsRateSmall: document.getElementById("savingsRateSmall"),

    incomeMonthlyTotal: document.getElementById("incomeMonthlyTotal"),
    incomeYearlyTotal: document.getElementById("incomeYearlyTotal"),

    incomeName: document.getElementById("incomeName"),
    incomeAmount: document.getElementById("incomeAmount"),
    incomeFreq: document.getElementById("incomeFreq"),
    incomeList: document.getElementById("incomeList"),
    addIncomeBtn: document.getElementById("addIncomeBtn"),

    fixedName: document.getElementById("fixedName"),
    fixedAmount: document.getElementById("fixedAmount"),
    fixedList: document.getElementById("fixedList"),
    fixedTotal: document.getElementById("fixedTotal"),
    fixedCategory: document.getElementById("fixedCategory"),
    fixedCategorySummary: document.getElementById("fixedCategorySummary"),
    fixedFilter: document.getElementById("fixedFilter"),
    addFixedBtn: document.getElementById("addFixedBtn"),

    variableName: document.getElementById("variableName"),
    variableAmount: document.getElementById("variableAmount"),
    variableList: document.getElementById("variableList"),
    addVariableBtn: document.getElementById("addVariableBtn"),

    generalDesc: document.getElementById("generalDesc"),
    generalAmount: document.getElementById("generalAmount"),
    generalList: document.getElementById("generalList"),
    addGeneralBtn: document.getElementById("addGeneralBtn"),

    generalMonthSelect: document.getElementById("generalMonthSelect"),
    jumpCurrentMonthBtn: document.getElementById("jumpCurrentMonthBtn"),

    historyList: document.getElementById("historyList"),

    // Savings V2 (accounts + crypto)
    cashAccountName: document.getElementById("cashAccountName"),
    cashAccountValue: document.getElementById("cashAccountValue"),
    addCashAccountBtn: document.getElementById("addCashAccountBtn"),
    cashAccountsList: document.getElementById("cashAccountsList"),

    investAccountName: document.getElementById("investAccountName"),
    investAccountValue: document.getElementById("investAccountValue"),
    addInvestAccountBtn: document.getElementById("addInvestAccountBtn"),
    investAccountsList: document.getElementById("investAccountsList"),

    cryptoName: document.getElementById("cryptoName"),
    cryptoCoins: document.getElementById("cryptoCoins"),
    cryptoInvested: document.getElementById("cryptoInvested"),
    addCryptoBtn: document.getElementById("addCryptoBtn"),
    cryptoHoldingsList: document.getElementById("cryptoHoldingsList"),

    netWorthTotal: document.getElementById("netWorthTotal"),
    netWorthCash: document.getElementById("netWorthCash"),
    netWorthInvest: document.getElementById("netWorthInvest"),
    netWorthCrypto: document.getElementById("netWorthCrypto"),

    savingsTotalCash: document.getElementById("savingsTotalCash"),
    savingsTotalInvest: document.getElementById("savingsTotalInvest"),
    savingsTotalCrypto: document.getElementById("savingsTotalCrypto"),
    savingsTotalAll: document.getElementById("savingsTotalAll"),

    // Theme
    themeToggleBtn: document.getElementById("themeToggleBtn"),

    // Design controls
    uiFontSize: document.getElementById("uiFontSize"),
    uiRadius: document.getElementById("uiRadius"),
    uiPad: document.getElementById("uiPad"),
    resetDesignBtn: document.getElementById("resetDesignBtn"),
};

function on(node, event, handler) {
    if (!node) return;
    node.addEventListener(event, handler);
}

/* ======================
   Helpers
====================== */
function round2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
function num(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
}
function money(n) {
    return round2(num(n));
}

// Format numbers with comma separators; show 2 decimals only when needed
function formatMoney(n) {
    const v = money(n);
    const frac = Math.round((v - Math.trunc(v)) * 100);
    const opts = { maximumFractionDigits: 2, minimumFractionDigits: frac !== 0 ? 2 : 0 };
    return v.toLocaleString(undefined, opts);
}

/* ======================
   State initialization
====================== */
let incomes = JSON.parse(localStorage.getItem("incomes")) || [];

// migrate old salary keys once into incomes
if (incomes.length === 0) {
    const oldSalary = num(localStorage.getItem("salary"));
    const oldWifeSalary = num(localStorage.getItem("wifeSalary"));
    if (oldSalary > 0) incomes.push({ name: "Your Salary", amount: oldSalary, freq: "monthly" });
    if (oldWifeSalary > 0) incomes.push({ name: "Wife Salary", amount: oldWifeSalary, freq: "monthly" });
    if (oldSalary > 0 || oldWifeSalary > 0) {
        localStorage.setItem("incomes", JSON.stringify(incomes));
        localStorage.removeItem("salary");
        localStorage.removeItem("wifeSalary");
    }
}
incomes.forEach(i => { if (!i.name) i.name = 'Income'; if (!i.freq) i.freq = 'monthly'; if (i.amount === undefined) i.amount = 0; });
localStorage.setItem("incomes", JSON.stringify(incomes));

let fixedExpenses = JSON.parse(localStorage.getItem("fixedExpenses")) || [];
let variableExpenses = JSON.parse(localStorage.getItem("variableExpenses")) || [];
let generalSpendingByMonth = JSON.parse(localStorage.getItem("generalSpendingByMonth")) || {};

// migrate old generalSpending array into month bucket
const oldGeneral = JSON.parse(localStorage.getItem("generalSpending") || 'null');
if (Array.isArray(oldGeneral) && oldGeneral.length > 0) {
    const mk = (new Date()).getFullYear() + '-' + String((new Date()).getMonth()+1).padStart(2,'0');
    generalSpendingByMonth[mk] = generalSpendingByMonth[mk] || [];
    oldGeneral.forEach(it => generalSpendingByMonth[mk].push({ desc: it.desc || it.name || 'Spending', amount: num(it.amount), ts: Date.now() }));
    localStorage.setItem("generalSpendingByMonth", JSON.stringify(generalSpendingByMonth));
    localStorage.removeItem("generalSpending");
}

// savings V2 model
let savings = JSON.parse(localStorage.getItem("savingsV2")) || { cashAccounts: [], investmentAccounts: [], cryptoHoldings: [] };
function saveSavings(){ localStorage.setItem("savingsV2", JSON.stringify(savings)); }

// one-time migration from old single savings keys
(function(){
    if (localStorage.getItem('savingsV2_migrated')) return;
    const oldCash = num(localStorage.getItem('savingsCash'));
    const oldInvest = num(localStorage.getItem('savingsInvest'));
    const oldCrypto = num(localStorage.getItem('savingsCrypto'));
    if (oldCash) savings.cashAccounts.push({ name: 'Cash', value: oldCash });
    if (oldInvest) savings.investmentAccounts.push({ name: 'Investments', value: oldInvest });
    if (oldCrypto) savings.cryptoHoldings.push({ coinId: 'manual', coins: 0, invested: oldCrypto });
    saveSavings();
    localStorage.setItem('savingsV2_migrated','1');
})();

let selectedGeneralMonth = localStorage.getItem('selectedGeneralMonth') || (new Date()).getFullYear() + '-' + String((new Date()).getMonth()+1).padStart(2,'0');
let selectedFixedFilter = 'All';

function saveGeneral() { localStorage.setItem('generalSpendingByMonth', JSON.stringify(generalSpendingByMonth)); }

function getMonthArray(monthKey) {
    if (!generalSpendingByMonth[monthKey]) generalSpendingByMonth[monthKey] = [];
    return generalSpendingByMonth[monthKey];
}

function saveSelectedMonth() { localStorage.setItem('selectedGeneralMonth', selectedGeneralMonth); }

function getMonthKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function saveIncomes() { localStorage.setItem("incomes", JSON.stringify(incomes)); }

function formatMonthKey(key) {
    if (!key) key = getMonthKey();
    const parts = String(key).split('-');
    const y = parts[0];
    const m = parts[1] || '01';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mi = Math.max(0, Math.min(11, Number(m) - 1));
    return `${months[mi]} ${y}`;
}


function incomeToMonthly(item) {
    const amount = num(item.amount || 0);
    const freq = (item.freq || "monthly").toLowerCase();
    if (freq === "weekly") return amount * 52 / 12;
    if (freq === "yearly") return amount / 12;
    return amount;
}
function monthlyIncomeTotal() {
    return incomes.reduce((sum, item) => sum + incomeToMonthly(item), 0);
}
function yearlyFromMonthly(monthly) {
    return monthly * 12;
}

function freqLabel(freq) {
    const f = (freq || 'monthly').toLowerCase();
    if (f === 'weekly') return 'Weekly';
    if (f === 'yearly') return 'Yearly';
    return 'Monthly';
}

function sumAccountValues(arr) {
    return (arr || []).reduce((s, x) => s + num(x.value), 0);
}

function cryptoInvestedTotal() {
    return (savings.cryptoHoldings || []).reduce((s, x) => s + num(x.invested), 0);
}

function netWorthTotal() {
    const cash = sumAccountValues(savings.cashAccounts);
    const invest = sumAccountValues(savings.investmentAccounts);
    const crypto = cryptoInvestedTotal(); // invested baseline for now
    return cash + invest + crypto;
}

function monthTotalExpenses(monthKey) {
    const fixedTotal = fixedExpenses.reduce((a, b) => a + num(b.amount), 0);
    const variableTotal = variableExpenses.reduce((a, b) => a + num(b.amount), 0);
    const generalTotal = getMonthArray(monthKey).reduce((a, b) => a + num(b.amount), 0);
    return fixedTotal + variableTotal + generalTotal;
}

/* ======================
   Rendering helpers
====================== */
function renderSimpleList(listElement, dataArray, saveFn, labelGetter, amountGetter, editHandler, deleteHandler) {
    if (!listElement) return;
    listElement.innerHTML = "";

    dataArray.forEach((item, index) => {
        const li = document.createElement("li");

        const label = labelGetter(item, index);
        const amount = amountGetter(item, index);

        const text = document.createElement("div");
        text.className = "item-text";
        text.textContent = `${label} (£${formatMoney(amount)})`;
        li.appendChild(text);


        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("add-btn");
        editBtn.style.marginRight = "6px";
        editBtn.addEventListener("click", () => {
            editHandler(item, index);
            if (typeof saveFn === "function") saveFn();
            renderAll();
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.classList.add("delete-btn");
        delBtn.addEventListener("click", () => {
            deleteHandler(index);
            if (typeof saveFn === "function") saveFn();
            renderAll();
        });

        li.appendChild(editBtn);
        li.appendChild(delBtn);
        listElement.appendChild(li);
    });
}

/* ======================
   Rendering
====================== */
function renderIncomeList() {
    if (!el.incomeList) return;
    el.incomeList.innerHTML = "";

    incomes.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'income-row';

        const left = document.createElement('div');
        left.className = 'item-text';
        left.textContent = `${item.name} — ${freqLabel(item.freq)} • £${formatMoney(item.amount)}`;

        const actions = document.createElement('div');
        actions.className = 'item-actions';

        const edit = document.createElement('button');
        edit.className = 'save-btn';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => {
            const newName = prompt('Name:', item.name);
            if (newName === null) return;
            const newAmt = prompt('Amount (£):', item.amount);
            if (newAmt === null) return;
            const newFreq = prompt('Frequency (monthly/weekly/yearly):', item.freq || 'monthly');
            if (newFreq === null) return;

            incomes[index] = { name: (newName || item.name).trim(), amount: num(newAmt), freq: (newFreq || 'monthly').toLowerCase() };
            saveIncomes();
            renderAll();
        });

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = 'Delete';
        del.addEventListener('click', () => {
            if (!confirm('Delete this income stream?')) return;
            incomes.splice(index, 1);
            saveIncomes();
            renderAll();
        });

        actions.appendChild(edit);
        actions.appendChild(del);

        li.appendChild(left);
        li.appendChild(actions);
        el.incomeList.appendChild(li);
    });
}

function renderIncomeTotals() {
    const monthly = round2(monthlyIncomeTotal());
    const yearly = round2(yearlyFromMonthly(monthly));

    if (el.incomeMonthlyTotal) el.incomeMonthlyTotal.textContent = formatMoney(monthly);
    if (el.incomeYearlyTotal) el.incomeYearlyTotal.textContent = formatMoney(yearly);
    if (el.totalIncomeMonthly) el.totalIncomeMonthly.textContent = formatMoney(monthly);
    if (el.totalIncomeYearly) el.totalIncomeYearly.textContent = formatMoney(yearly);
}

function renderSavingsSnapshot() {
    const cash = money(sumAccountValues(savings.cashAccounts));
    const invest = money(sumAccountValues(savings.investmentAccounts));
    const crypto = money(cryptoInvestedTotal());

    if (el.dashCash) el.dashCash.textContent = formatMoney(cash);
    if (el.dashInvest) el.dashInvest.textContent = formatMoney(invest);
    if (el.dashCrypto) el.dashCrypto.textContent = formatMoney(crypto);
}

function renderSavingsTotals(){
    const cash = money(sumAccountValues(savings.cashAccounts));
    const invest = money(sumAccountValues(savings.investmentAccounts));
    const crypto = money(cryptoInvestedTotal());
    const all = money(cash + invest + crypto);

    if (el.savingsTotalCash) el.savingsTotalCash.textContent = formatMoney(cash);
    if (el.savingsTotalInvest) el.savingsTotalInvest.textContent = formatMoney(invest);
    if (el.savingsTotalCrypto) el.savingsTotalCrypto.textContent = formatMoney(crypto);
    if (el.savingsTotalAll) el.savingsTotalAll.textContent = formatMoney(all);

    // Backwards compatibility: older HTML used single inputs with ids `savingsCash`, `savingsInvest`, `savingsCrypto`.
    // If those exist, populate their values so older templates show totals.
        const legacyCashInput = document.getElementById('savingsCash');
        const legacyInvestInput = document.getElementById('savingsInvest');
        const legacyCryptoInput = document.getElementById('savingsCrypto');
    if (legacyCashInput) legacyCashInput.value = cash;
    if (legacyInvestInput) legacyInvestInput.value = invest;
    if (legacyCryptoInput) legacyCryptoInput.value = crypto;
}

// If older templates provide single legacy inputs (`savingsCash`, `savingsInvest`, `savingsCrypto`),
// allow changes to those inputs to sync back into the new `savingsV2` model.
function initLegacySavingsSync() {
    const legacyCashInput = document.getElementById('savingsCash');
    const legacyInvestInput = document.getElementById('savingsInvest');
    const legacyCryptoInput = document.getElementById('savingsCrypto');

    function parseAndPush() {
        const c = money(legacyCashInput?.value || 0);
        const i = money(legacyInvestInput?.value || 0);
        const x = money(legacyCryptoInput?.value || 0);

        // Replace single-account data with legacy values (keep names)
        if (legacyCashInput) savings.cashAccounts = [{ name: 'Cash', value: c }];
        if (legacyInvestInput) savings.investmentAccounts = [{ name: 'Investments', value: i }];
        if (legacyCryptoInput) savings.cryptoHoldings = [{ coinId: 'manual', coins: 0, invested: x }];

        saveSavings();
        renderAll();
    }

    if (legacyCashInput) legacyCashInput.addEventListener('change', parseAndPush);
    if (legacyInvestInput) legacyInvestInput.addEventListener('change', parseAndPush);
    if (legacyCryptoInput) legacyCryptoInput.addEventListener('change', parseAndPush);
}

function renderNetWorth() {
    const cash = money(sumAccountValues(savings.cashAccounts));
    const invest = money(sumAccountValues(savings.investmentAccounts));
    const crypto = money(cryptoInvestedTotal());
    const total = money(netWorthTotal());

    if (el.netWorthTotal) el.netWorthTotal.textContent = formatMoney(total);
    if (el.netWorthCash) el.netWorthCash.textContent = formatMoney(cash);
    if (el.netWorthInvest) el.netWorthInvest.textContent = formatMoney(invest);
    if (el.netWorthCrypto) el.netWorthCrypto.textContent = formatMoney(crypto);
}

function renderMonthLabels() {
    if (el.dashboardMonthLabel) el.dashboardMonthLabel.textContent = formatMonthKey(getMonthKey());
    if (el.dashboardGeneralMonthLabel) el.dashboardGeneralMonthLabel.textContent = formatMonthKey(selectedGeneralMonth);
}

function buildGeneralMonthOptions() {
    const currentKey = getMonthKey();
    getMonthArray(currentKey);

    const keys = Object.keys(generalSpendingByMonth);
    if (!keys.includes(currentKey)) keys.push(currentKey);
    keys.sort((a, b) => b.localeCompare(a));

    if (!keys.includes(selectedGeneralMonth)) selectedGeneralMonth = currentKey;

    if (!el.generalMonthSelect) return;
    el.generalMonthSelect.innerHTML = "";
    keys.forEach(k => {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = formatMonthKey(k);
        if (k === selectedGeneralMonth) opt.selected = true;
        el.generalMonthSelect.appendChild(opt);
    });

    saveSelectedMonth();
}

function renderGeneralForSelectedMonth() {
    const arr = getMonthArray(selectedGeneralMonth);
    if (!el.variableList) return;
    el.variableList.innerHTML = "";

    // Sort by timestamp (newest first)
    const sorted = [...arr].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    sorted.forEach(item => {
        const li = document.createElement('li');

        const text = document.createElement('div');
        text.className = 'item-text';
        text.textContent = item.desc || 'Spending';

        const amount = document.createElement('div');
        amount.className = 'fixed-amount';
        amount.textContent = `£${formatMoney(item.amount)}`;

        const actions = document.createElement('div');
        actions.className = 'item-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'save-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            const newDesc = prompt('Enter new description:', item.desc || 'Spending');
            const newAmt = prompt('Enter new amount (£):', item.amount);
            if (newDesc !== null) item.desc = newDesc;
            if (newAmt !== null && !isNaN(newAmt)) item.amount = num(newAmt);
            saveGeneral();
            renderAll();
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => {
            if (!confirm('Delete this spending item?')) return;
            const realIdx = arr.indexOf(item);
            if (realIdx >= 0) arr.splice(realIdx, 1);
            saveGeneral();
            renderAll();
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(text);
        li.appendChild(amount);
        li.appendChild(actions);
        el.variableList.appendChild(li);
    });
}

function renderFixedAndVariable() {
    // Update fixed total at top
    const fixedTotalVal = fixedExpenses.reduce((s, x) => s + num(x.amount), 0);
    if (el.fixedTotal) el.fixedTotal.textContent = formatMoney(fixedTotalVal);

    // Build category totals and summary boxes
    const categoryTotals = {};
    fixedExpenses.forEach(fe => {
        const c = fe.category || 'Other';
        categoryTotals[c] = (categoryTotals[c] || 0) + num(fe.amount);
    });
    if (el.fixedCategorySummary) {
        el.fixedCategorySummary.innerHTML = '';
        // Render an 'All' box first
        const allBox = document.createElement('div');
        allBox.className = 'category-summary-box';
        allBox.innerHTML = `<div class="summary-label">All</div><div class="summary-value">£${formatMoney(fixedTotalVal)}</div>`;
        allBox.addEventListener('click', () => { selectedFixedFilter = 'All'; if (el.fixedFilter) el.fixedFilter.value = 'All'; renderAll(); });
        el.fixedCategorySummary.appendChild(allBox);

        Object.keys(categoryTotals).sort().forEach(cat => {
            const box = document.createElement('div');
            box.className = 'category-summary-box';
            box.innerHTML = `<div class="summary-label">${cat}</div><div class="summary-value">£${formatMoney(categoryTotals[cat])}</div>`;
            box.addEventListener('click', () => { selectedFixedFilter = cat; if (el.fixedFilter) el.fixedFilter.value = cat; renderAll(); });
            el.fixedCategorySummary.appendChild(box);
        });
    }

    // Populate filter select options
    if (el.fixedFilter) {
        const opts = ['All', ...Object.keys(categoryTotals).sort()];
        const cur = el.fixedFilter.value || selectedFixedFilter || 'All';
        el.fixedFilter.innerHTML = '';
        opts.forEach(o => {
            const opt = document.createElement('option'); opt.value = o; opt.textContent = o;
            if (o === cur) opt.selected = true;
            el.fixedFilter.appendChild(opt);
        });
        // attach change handler once
        if (!el.fixedFilter._hasHandler) {
            el.fixedFilter.addEventListener('change', () => { selectedFixedFilter = el.fixedFilter.value; renderAll(); });
            el.fixedFilter._hasHandler = true;
        }
    }
    // Render Fixed Expenses in descending value order with a clearer layout
    if (el.fixedList) {
        el.fixedList.innerHTML = "";
        // Sort a shallow copy so we don't reorder source data unintentionally
        const sorted = [...fixedExpenses].sort((a, b) => num(b.amount) - num(a.amount));
        // Apply filter if selected
        const displayItems = (selectedFixedFilter && selectedFixedFilter !== 'All') ? sorted.filter(x => (x.category || 'Other') === selectedFixedFilter) : sorted;
        displayItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'fixed-row';

            const text = document.createElement('div');
            text.className = 'item-text';
            const pill = document.createElement('span');
            pill.className = 'category-pill';
            pill.textContent = item.category || 'Other';
            text.appendChild(pill);
            const nameText = document.createElement('span');
            nameText.style.marginLeft = '8px';
            nameText.textContent = item.name || 'Expense';
            text.appendChild(nameText);

            const amount = document.createElement('div');
            amount.className = 'fixed-amount';
            amount.textContent = `£${formatMoney(item.amount)}`;

            const actions = document.createElement('div');
            actions.className = 'item-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'save-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                const newName = prompt('Enter new name:', item.name || 'Expense');
                const newAmt = prompt('Enter new amount (£):', item.amount);
                const newCat = prompt('Category:', item.category || 'Other');
                if (newName !== null) item.name = newName;
                if (newAmt !== null && !isNaN(newAmt)) item.amount = num(newAmt);
                if (newCat !== null) item.category = newCat;
                localStorage.setItem('fixedExpenses', JSON.stringify(fixedExpenses));
                renderAll();
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => {
                if (!confirm('Delete this fixed expense?')) return;
                const realIdx = fixedExpenses.findIndex(x => x === item);
                if (realIdx >= 0) fixedExpenses.splice(realIdx, 1);
                localStorage.setItem('fixedExpenses', JSON.stringify(fixedExpenses));
                renderAll();
            });

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);

            li.appendChild(text);
            li.appendChild(amount);
            li.appendChild(actions);
            el.fixedList.appendChild(li);
        });
    }

    // Variable expenses use the existing simple list renderer
    renderSimpleList(
        el.variableList,
        variableExpenses,
        () => localStorage.setItem("variableExpenses", JSON.stringify(variableExpenses)),
        (it) => it.name || "Variable",
        (it) => it.amount,
        (it) => {
            const newName = prompt("Enter new name:", it.name || "Variable");
            const newAmt = prompt("Enter new amount (£):", it.amount);
            if (newName !== null) it.name = newName;
            if (newAmt !== null && !isNaN(newAmt)) it.amount = num(newAmt);
        },
        (idx) => { variableExpenses.splice(idx, 1); }
    );
}

function renderSavingsAccounts() {
    // Cash accounts
    renderSimpleList(
        el.cashAccountsList,
        savings.cashAccounts,
        saveSavings,
        (it) => it.name || "Cash",
        (it) => it.value,
        (it) => {
            const newName = prompt("Account name:", it.name || "Cash");
            const newVal = prompt("Balance (£):", it.value);
            if (newName !== null) it.name = newName;
            if (newVal !== null && !isNaN(newVal)) it.value = num(newVal);
        },
        (idx) => { savings.cashAccounts.splice(idx, 1); }
    );

    // Investment accounts
    renderSimpleList(
        el.investAccountsList,
        savings.investmentAccounts,
        saveSavings,
        (it) => it.name || "Investments",
        (it) => it.value,
        (it) => {
            const newName = prompt("Account name:", it.name || "Investments");
            const newVal = prompt("Value (£):", it.value);
            if (newName !== null) it.name = newName;
            if (newVal !== null && !isNaN(newVal)) it.value = num(newVal);
        },
        (idx) => { savings.investmentAccounts.splice(idx, 1); }
    );
}

function renderCryptoHoldings() {
    renderSimpleList(
        el.cryptoHoldingsList,
        savings.cryptoHoldings,
        saveSavings,
        (it) => `${(it.coinId || "Crypto")} (${money(it.coins)} coins)`,
        (it) => it.invested,
        (it) => {
            const newCoin = prompt("Coin / Token:", it.coinId || "Crypto");
            const newCoins = prompt("Coins:", it.coins);
            const newInv = prompt("Total invested (£):", it.invested);
            if (newCoin !== null) it.coinId = newCoin;
            if (newCoins !== null && !isNaN(newCoins)) it.coins = num(newCoins);
            if (newInv !== null && !isNaN(newInv)) it.invested = num(newInv);
        },
        (idx) => { savings.cryptoHoldings.splice(idx, 1); }
    );
}

function renderHistory() {
    if (!el.historyList) return;

    const currentKey = getMonthKey();
    getMonthArray(currentKey);

    const keys = Object.keys(generalSpendingByMonth);
    if (!keys.includes(currentKey)) keys.push(currentKey);
    keys.sort((a, b) => b.localeCompare(a));

    const monthlyIncome = monthlyIncomeTotal();

    el.historyList.innerHTML = "";
    keys.forEach(k => {
        const expenses = money(monthTotalExpenses(k));
        const left = money(monthlyIncome - expenses);

        const row = document.createElement("div");
        row.className = "history-row";

        const monthEl = document.createElement("div");
        monthEl.innerHTML = `<strong>${formatMonthKey(k)}</strong>`;

        const incEl = document.createElement("div");
        incEl.textContent = `Income: £${formatMoney(monthlyIncome)}`;

        const expEl = document.createElement("div");
        expEl.textContent = `Expenses: £${formatMoney(expenses)}`;

        const leftEl = document.createElement("div");
        leftEl.textContent = `Left: £${formatMoney(left)}`;

        const btn = document.createElement("button");
        btn.className = "add-btn btn";
        btn.textContent = "View month";
        btn.addEventListener("click", () => {
            selectedGeneralMonth = k;
            saveSelectedMonth();
            showTab("variable");
            renderAll();
        });

        row.appendChild(monthEl);
        row.appendChild(incEl);
        row.appendChild(expEl);
        row.appendChild(leftEl);
        row.appendChild(btn);

        el.historyList.appendChild(row);
    });
}

function updateDashboard() {
    const totalIncomeMonthly = monthlyIncomeTotal();
    const totalExpenses = monthTotalExpenses(selectedGeneralMonth);
    const moneyLeft = money(totalIncomeMonthly - totalExpenses);

    // small metrics
    const fixedTotal = fixedExpenses.reduce((s, x) => s + num(x.amount), 0);
    // include monthly general spending in the variable total shown on dashboard
    const generalTotalForMonth = getMonthArray(selectedGeneralMonth).reduce((s, x) => s + num(x.amount), 0);
    const variableTotal = variableExpenses.reduce((s, x) => s + num(x.amount), 0) + generalTotalForMonth;
    const savingsRate = totalIncomeMonthly > 0 ? round2((totalIncomeMonthly - totalExpenses) / totalIncomeMonthly * 100) : 0;

    if (el.totalExpenses) el.totalExpenses.textContent = formatMoney(totalExpenses);
    if (el.dashboardMoneyLeft) el.dashboardMoneyLeft.textContent = formatMoney(moneyLeft);

    if (el.smallFixed) el.smallFixed.textContent = formatMoney(fixedTotal);
    if (el.smallVariable) el.smallVariable.textContent = formatMoney(variableTotal);
    if (el.savingsRateSmall) el.savingsRateSmall.textContent = `${savingsRate}%`;
}

function renderAll(){
  renderIncomeList();
  renderIncomeTotals();

  renderSavingsAccounts();
  renderCryptoHoldings();
  renderSavingsTotals();   // ✅ add this line

  renderSavingsSnapshot();
  renderNetWorth();

  renderFixedAndVariable();

  buildGeneralMonthOptions();
  renderGeneralForSelectedMonth();

  renderHistory();

  updateDashboard();
  renderMonthLabels();
}


/* ======================
   Events
====================== */
on(el.addIncomeBtn, "click", () => {
    const name = (el.incomeName?.value || "").trim();
    const amount = el.incomeAmount?.value;
    const freq = el.incomeFreq?.value;

    if (!name || !amount) return;

    incomes.push({ name, amount: num(amount), freq: (freq || "monthly").toLowerCase() });
    saveIncomes();

    if (el.incomeName) el.incomeName.value = "";
    if (el.incomeAmount) el.incomeAmount.value = "";
    if (el.incomeFreq) el.incomeFreq.value = "monthly";
    renderAll();
});

on(el.addFixedBtn, "click", () => {
    const name = (el.fixedName?.value || "").trim();
    const amount = el.fixedAmount?.value;
    const category = (el.fixedCategory?.value || "Other");
    if (!name || !amount) return;

    fixedExpenses.push({ name, amount: num(amount), category });
    localStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses));

    if (el.fixedName) el.fixedName.value = "";
    if (el.fixedAmount) el.fixedAmount.value = "";
    if (el.fixedCategory) el.fixedCategory.value = "Utilities";
    renderAll();
});

on(el.addVariableBtn, "click", () => {
    // Add an entry to the selected month's general spending (single combined input)
    const desc = (el.variableName?.value || "").trim();
    const amount = el.variableAmount?.value;
    if (!desc || !amount) return;

    const arr = getMonthArray(selectedGeneralMonth);
    arr.push({ desc, amount: num(amount), ts: Date.now() });
    saveGeneral();

    if (el.variableName) el.variableName.value = "";
    if (el.variableAmount) el.variableAmount.value = "";
    renderAll();
});

on(el.generalMonthSelect, "change", () => {
    selectedGeneralMonth = el.generalMonthSelect?.value || getMonthKey();
    saveSelectedMonth();
    renderAll();
});

on(el.jumpCurrentMonthBtn, "click", () => {
    selectedGeneralMonth = getMonthKey();
    saveSelectedMonth();
    renderAll();
});


// Savings V2: Add buttons
on(el.addCashAccountBtn, "click", () => {
    const name = (el.cashAccountName?.value || "").trim();
    const value = el.cashAccountValue?.value;
    if (!name || value === "" || value === null || value === undefined) return;

    savings.cashAccounts.push({ name, value: num(value) });
    saveSavings();

    if (el.cashAccountName) el.cashAccountName.value = "";
    if (el.cashAccountValue) el.cashAccountValue.value = "";
    renderAll();
});

on(el.addInvestAccountBtn, "click", () => {
    const name = (el.investAccountName?.value || "").trim();
    const value = el.investAccountValue?.value;
    if (!name || value === "" || value === null || value === undefined) return;

    savings.investmentAccounts.push({ name, value: num(value) });
    saveSavings();

    if (el.investAccountName) el.investAccountName.value = "";
    if (el.investAccountValue) el.investAccountValue.value = "";
    renderAll();
});

on(el.addCryptoBtn, "click", () => {
    const coinId = (el.cryptoName?.value || "").trim();
    const coins = el.cryptoCoins?.value;
    const invested = el.cryptoInvested?.value;

    if (!coinId || invested === "" || invested === null || invested === undefined) return;

    savings.cryptoHoldings.push({
        coinId,
        coins: num(coins),
        invested: num(invested)
    });

    saveSavings();

    if (el.cryptoName) el.cryptoName.value = "";
    if (el.cryptoCoins) el.cryptoCoins.value = "";
    if (el.cryptoInvested) el.cryptoInvested.value = "";
    renderAll();
});

window.quickAddPrompt = function quickAddPrompt() {
    const desc = prompt("Enter expense description:");
    const amount = prompt("Enter amount (£):");
    if (desc && amount && !isNaN(amount)) {
        getMonthArray(selectedGeneralMonth).push({ desc, amount: num(amount), ts: Date.now() });
        saveGeneral();
        renderAll();
    }
};

/* ======================
   Theme handling
====================== */
function getStoredTheme() { return localStorage.getItem('theme'); }
function setStoredTheme(t) { if (t) localStorage.setItem('theme', t); else localStorage.removeItem('theme'); }
function detectSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme, save = true) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');

    if (el.themeToggleBtn) {
        el.themeToggleBtn.classList.toggle('is-dark', theme === 'dark');
        el.themeToggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        const vis = el.themeToggleBtn.querySelector('.visually-hidden');
        if (vis) vis.textContent = theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme';
    }
    if (save) setStoredTheme(theme);
}
(function initTheme() {
    const stored = getStoredTheme();
    const theme = stored || detectSystemTheme();
    applyTheme(theme, false);
})();
on(el.themeToggleBtn, "click", () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
});

/* ======================
   Design controls
====================== */
function setVar(name, val) { document.documentElement.style.setProperty(name, val); }
function loadDesignPrefs() {
    const prefs = JSON.parse(localStorage.getItem("designPrefs") || "{}");
    if (prefs.fontSize) setVar("--font-size", prefs.fontSize);
    if (prefs.radius) setVar("--radius", prefs.radius);
    if (prefs.pad) setVar("--pad", prefs.pad);

    if (el.uiFontSize && prefs.fontSize) el.uiFontSize.value = parseInt(prefs.fontSize, 10);
    if (el.uiRadius && prefs.radius) el.uiRadius.value = parseInt(prefs.radius, 10);
    if (el.uiPad && prefs.pad) el.uiPad.value = parseInt(prefs.pad, 10);
}
function saveDesignPrefs(prefs) {
    localStorage.setItem("designPrefs", JSON.stringify(prefs));
}
(function initDesignControls() {
    loadDesignPrefs();
    function sync() {
        const prefs = JSON.parse(localStorage.getItem("designPrefs") || "{}");
        if (el.uiFontSize) { prefs.fontSize = `${el.uiFontSize.value}px`; setVar("--font-size", prefs.fontSize); }
        if (el.uiRadius) { prefs.radius = `${el.uiRadius.value}px`; setVar("--radius", prefs.radius); }
        if (el.uiPad) { prefs.pad = `${el.uiPad.value}px`; setVar("--pad", prefs.pad); }
        saveDesignPrefs(prefs);
    }
    on(el.uiFontSize, "input", sync);
    on(el.uiRadius, "input", sync);
    on(el.uiPad, "input", sync);

    on(el.resetDesignBtn, "click", () => {
        localStorage.removeItem("designPrefs");
        document.documentElement.style.removeProperty("--font-size");
        document.documentElement.style.removeProperty("--radius");
        document.documentElement.style.removeProperty("--pad");
        if (el.uiFontSize) el.uiFontSize.value = 16;
        if (el.uiRadius) el.uiRadius.value = 16;
        if (el.uiPad) el.uiPad.value = 12;
    });
})();

/* ======================
   Start
====================== */
// Initialize legacy input sync (if legacy inputs present) before first render
initLegacySavingsSync();

renderAll();
