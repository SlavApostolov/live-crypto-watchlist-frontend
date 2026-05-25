const BASE_URL = 'https://localhost:7036/api/Watchlist';
let currentUserId = null;

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');

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

// --- Login Logic ---
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
        loginMessage.textContent = "Please enter a username.";
        loginMessage.style.color = "#ef4444";
        return;
    }

    try {
        loginMessage.textContent = "Logging in...";
        loginMessage.style.color = "#38bdf8";

        // Fetch all users to check if this person exists
        const response = await fetch(`${BASE_URL}/users`);
        const users = await response.json();

        let existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (existingUser) {
            currentUserId = existingUser.userId;
        } else {
            loginMessage.textContent = "Creating new account...";
            const createResponse = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Username: username })
            });
            if (!createResponse.ok) throw new Error("Failed to create account.");
            const newUser = await createResponse.json();
            currentUserId = newUser.userId;
        }

        // Hide Login, Show Dashboard, Load their specific data!
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadPortfolio();

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "#ef4444";
    }
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
                CoinId: coinName
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

    const header = document.createElement('h2');
    header.textContent = `Welcome back, ${data.username}!`;
    portfolioContainer.appendChild(header);

    data.portfolio.forEach(coin => {

        const coinCard = document.createElement('div');
        coinCard.className = 'coin-card';

        coinCard.innerHTML = `
            <img src="${coin.imageUrl}" alt="${coin.coinId} logo" class="coin-logo">
            <h3>${coin.coinId.toUpperCase()}</h3>
            <p class="price">$${coin.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
        `;

        portfolioContainer.appendChild(coinCard);
    });
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