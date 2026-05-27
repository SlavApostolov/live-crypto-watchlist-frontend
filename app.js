const BASE_URL = 'https://crypto-backend-l7a5.onrender.com/api/watchlist';
let currentUserId = null;

const passwordInput = document.getElementById('password-input');
const signupBtn = document.getElementById('signup-btn');

const netWorthDisplay = document.getElementById('net-worth-display');
const newAmountInput = document.getElementById('new-amount-input');

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');
const logoutBtn = document.getElementById('logout-btn');

const addCoinBtn = document.getElementById('add-coin-btn');
const newCoinInput = document.getElementById('new-coin-input');
const addMessage = document.getElementById('add-coin-message');
const portfolioContainer = document.getElementById('portfolio-container');

const openModalBtn = document.getElementById('open-delete-modal-btn');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteSelect = document.getElementById('delete-coin-select');
const deleteMessage = document.getElementById('delete-message');

const POST_URL = 'https://localhost:7036/api/Watchlist/coins';
//const GET_URL = `https://localhost:7036/api/Watchlist/${currentUserId}/portfolio`;
//const DELETE_BASE_URL = `https://localhost:7036/api/Watchlist/${currentUserId}/coins/`;

let currentPortfolioList = [];

signupBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        loginMessage.textContent = "Please enter both a username and password.";
        loginMessage.style.color = "#ef4444";
        return;
    }

    try {
        loginMessage.textContent = "Creating account...";
        loginMessage.style.color = "#4ade80";

        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: username, Password: password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const newUser = await response.json();
        currentUserId = newUser.userId;

        // Clear inputs and swap screens
        passwordInput.value = '';
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadPortfolio();

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "#ef4444";
    }
});

// --- Login Logic ---
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        loginMessage.textContent = "Please enter both a username and password.";
        loginMessage.style.color = "#ef4444";
        return;
    }

    try {
        loginMessage.textContent = "Verifying credentials...";
        loginMessage.style.color = "#38bdf8";

        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: username, Password: password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText); // Catches the "Unauthorized" message
        }

        const user = await response.json();
        currentUserId = user.userId;

        // Clear inputs and swap screens
        passwordInput.value = '';
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadPortfolio();

    } catch (error) {
        loginMessage.textContent = "Invalid username or password.";
        loginMessage.style.color = "#ef4444";
    }
});

// --- Log Out Logic ---
logoutBtn.addEventListener('click', () => {
    // 1. Wipe the memory of who is logged in
    currentUserId = null;
    currentPortfolioList = [];

    // 2. Clean up the UI so the next person gets a fresh screen
    usernameInput.value = '';
    passwordInput.value = '';
    loginMessage.textContent = '';
    portfolioContainer.innerHTML = '<p>Loading your coins...</p>';

    // 3. Swap the screens!
    dashboardScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

addCoinBtn.addEventListener('click', async () => {

    const coinName = newCoinInput.value.toLowerCase().trim();

    if (!coinName) {
        addMessage.textContent = 'Please enter a coin name first!';
        addMessage.style.color = 'red';
        return;
    }

    try {
        addMessage.textContent = 'Saving to database...';
        addMessage.style.color = 'blue';

        const response = await fetch(POST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                UserId: currentUserId,
                CoinId: coinName,
                Amount: parseFloat(newAmountInput.value) || 0

            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        addMessage.textContent = `${coinName.toUpperCase()} successfully saved!!`;
        addMessage.style.color = 'green';
        newCoinInput.value = '';

        loadPortfolio();
    } catch (error) {
        addMessage.textContent = error.message;
        addMessage.style.color = 'red';
    }
});



async function loadPortfolio() {
    try {
        const response = await fetch(`${BASE_URL}/${currentUserId}/portfolio`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentPortfolioList = data.portfolio.map(coin => coin.coinId);
        displayPortfolio(data);
    } catch (error) {
        portfolioContainer.innerHTML = `<p style="color: red;">Failed to load data: ${error.message}</p>`;
    }
}

function displayPortfolio(data) {
    portfolioContainer.innerHTML = '';
    let totalNetWorth = 0;

    const header = document.createElement('h2');
    header.textContent = `Welcome back, ${data.username}!`;
    portfolioContainer.appendChild(header);

    data.portfolio.forEach(coin => {

        const totalCoinValue = coin.amount * coin.currentPrice;
        totalNetWorth += totalCoinValue;

        const coinCard = document.createElement('div');
        coinCard.className = 'coin-card clickable-card';

        coinCard.innerHTML = `
            <img src="${coin.imageUrl}" alt="${coin.coinId} logo" class="coin-logo">
            <h3>${coin.coinId.toUpperCase()}</h3>
            <p style="color: #94a3b8; margin: 5px 0;">Live: $${coin.currentPrice.toLocaleString()}</p>
            <p style="color: #38bdf8; margin: 5px 0;">Holdings: ${coin.amount} ${coin.coinId.toUpperCase()}</p>
            <p class="price">Value: $${totalCoinValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        `;

        coinCard.addEventListener('click', () => openChart(coin.coinId));

        portfolioContainer.appendChild(coinCard);
    });
    netWorthDisplay.textContent = `Total Net Worth: $${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

openModalBtn.addEventListener('click', () => {
    deleteSelect.innerHTML = '';
    deleteMessage.textContent = '';

    currentPortfolioList.forEach(coin => {
        const option = document.createElement('option');
        option.value = coin;
        option.textContent = coin.toUpperCase();
        deleteSelect.appendChild(option);
    });

    deleteModal.classList.remove('hidden');
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', async () => {
    const selectedCoin = deleteSelect.value;
    if (!selectedCoin) return;

    try {
        deleteMessage.textContent = 'Deleting...';
        deleteMessage.style.color = '#38bdf8';

        // Send the DELETE request to our C# URL
        const response = await fetch(`${BASE_URL}/${currentUserId}/coins/${selectedCoin}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete coin.');

        // Success! Hide the window and refresh the screen instantly
        deleteModal.classList.add('hidden');
        loadPortfolio();

    } catch (error) {
        deleteMessage.textContent = error.message;
        deleteMessage.style.color = '#ef4444';
    }
});


// --- 4. Chart Logic ---
const chartModal = document.getElementById('chart-modal');
const closeChartBtn = document.getElementById('close-chart-btn');
const chartTitle = document.getElementById('chart-title');
let currentChart = null; // Memory to hold our graph so we can destroy it when closing

closeChartBtn.addEventListener('click', () => {
    chartModal.classList.add('hidden');
});

async function openChart(coinId) {
    chartModal.classList.remove('hidden');
    chartTitle.textContent = `${coinId.toUpperCase()} - 7 Day Trend`;
    chartTitle.style.color = '#38bdf8';

    try {
        const response = await fetch(`${BASE_URL}/coins/${coinId}/history`);
        if (!response.ok) throw new Error("Failed to load chart");
        const data = await response.json();

        if (data.length === 0) {
            chartTitle.textContent = "API Rate Limit Hit! Please wait 60 seconds.";
            chartTitle.style.color = '#ef4444';

            // Wipe the blank chart off the screen
            if (currentChart) {
                currentChart.destroy();
            }
            return;
        }

        // Separate the timestamps (X-axis) and prices (Y-axis)
        const labels = data.map(point => {
            const date = new Date(point[0]); // Convert Unix timestamp to real date
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        const prices = data.map(point => point[1]);

        //Destroy the old chart if it exists (so they don't overlap)
        if (currentChart) {
            currentChart.destroy();
        }

        // 3. Draw the new Neon Graph!
        const ctx = document.getElementById('priceChart').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price (USD)',
                    data: prices,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

    } catch (error) {
        chartTitle.textContent = `Error loading data for ${coinId}`;
        chartTitle.style.color = '#ef4444';
    }
}