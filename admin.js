const SUPABASE_URL = 'https://yivgtnnbmjwdiouqbqum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TLc7OA2h5fSvvr7ms6NRYg_59GWUzmL';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


const authShell = document.getElementById('authShell');
const adminShell = document.getElementById('adminShell');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('authError');
const adminUserEmail = document.getElementById('adminUserEmail');
const responsesTableBody = document.getElementById('responsesTableBody');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');

const statTotal = document.getElementById('statTotal');
const statYes = document.getElementById('statYes');
const statNo = document.getElementById('statNo');
const statNoAlcohol = document.getElementById('statNoAlcohol');

let allResponses = [];

const drinkLabels = {
    champagne: 'Шампанское',
    'white-wine': 'Белое вино',
    'red-wine': 'Красное вино',
    vodka: 'Водка',
    whiskey: 'Виски',
    cognac: 'Коньяк',
    'no-alcohol': 'Не пью'
};

function showAuth() {
    authShell.classList.remove('hidden');
    adminShell.classList.add('hidden');
}

function showAdmin() {
    authShell.classList.add('hidden');
    adminShell.classList.remove('hidden');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatAttendance(value) {
    if (value === 'yes') {
        return '<span class="badge badge-success">Придет</span>';
    }

    return '<span class="badge badge-danger">Не сможет</span>';
}

function formatDrinks(drinks) {
    if (!Array.isArray(drinks) || drinks.length === 0) {
        return '<span class="drink-chip">Не указано</span>';
    }

    return `
        <div class="drinks-list">
            ${drinks.map((drink) => {
        const label = drinkLabels[drink] || drink;
        return `<span class="drink-chip">${escapeHtml(label)}</span>`;
    }).join('')}
        </div>
    `;
}

function formatDate(value) {
    if (!value) return '—';

    const date = new Date(value);

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function renderStats(rows) {
    const total = rows.length;
    const yesCount = rows.filter((row) => row.attendance === 'yes').length;
    const noCount = rows.filter((row) => row.attendance === 'no').length;
    const noAlcoholCount = rows.filter((row) =>
        Array.isArray(row.drinks) && row.drinks.includes('no-alcohol')
    ).length;

    statTotal.textContent = total;
    statYes.textContent = yesCount;
    statNo.textContent = noCount;
    statNoAlcohol.textContent = noAlcoholCount;
}

function renderTable(rows) {
    if (!rows.length) {
        responsesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">Пока нет записей</td>
            </tr>
        `;
        return;
    }

    responsesTableBody.innerHTML = rows.map((row) => `
        <tr>
            <td>${escapeHtml(row.guest_name)}</td>
            <td>${escapeHtml(row.phone)}</td>
            <td>${formatAttendance(row.attendance)}</td>
            <td>${formatDrinks(row.drinks)}</td>
            <td>${escapeHtml(formatDate(row.created_at))}</td>
        </tr>
    `).join('');
}

function applySearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderTable(allResponses);
        renderStats(allResponses);
        return;
    }

    const filtered = allResponses.filter((row) => {
        const guestName = String(row.guest_name || '').toLowerCase();
        const phone = String(row.phone || '').toLowerCase();

        return guestName.includes(query) || phone.includes(query);
    });

    renderTable(filtered);
    renderStats(filtered);
}

async function loadResponses() {
    responsesTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-cell">Загрузка данных...</td>
        </tr>
    `;

    const { data, error } = await supabaseClient
        .from('guest_responses')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Ошибка загрузки ответов:', error);
        responsesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">Не удалось загрузить данные</td>
            </tr>
        `;
        return;
    }

    allResponses = data || [];
    renderTable(allResponses);
    renderStats(allResponses);
}

async function handleLogin(event) {
    event.preventDefault();
    authError.textContent = '';

    const formData = new FormData(loginForm);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const initialText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Входим...';

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    submitButton.disabled = false;
    submitButton.textContent = initialText;

    if (error) {
        authError.textContent = 'Неверный email или пароль.';
        console.error('Ошибка входа:', error);
        return;
    }

    await initAdminPage();
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    showAuth();
    loginForm.reset();
}

async function initAdminPage() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
        showAuth();
        return;
    }

    adminUserEmail.textContent = `Вы вошли как ${data.user.email}`;
    showAdmin();
    await loadResponses();
}

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
refreshBtn.addEventListener('click', loadResponses);
searchInput.addEventListener('input', applySearch);

document.addEventListener('DOMContentLoaded', initAdminPage);