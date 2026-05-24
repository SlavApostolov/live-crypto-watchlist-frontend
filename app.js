const addCoinBtn = document.getElementById('add-coin-btn');
const newCoinInput = document.getElementById('new-coin-input');
const addMessage = document.getElementById('add-coin-message');

const POST_URL = 'https://localhost:7036/api/Watchlist/coins';
const GET_URL = 'https://localhost:7036/api/Watchlist/1/portfolio';

const portfolioContainer = document.getElementById('portfolio-container');

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
                UserId: 1,  // NOT FINE TO BE HARDCODDED
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
        const response = await fetch(GET_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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
            <h3>${coin.coinId.toUpperCase()}</h3>
            <p class="price">$${coin.currentPrice.toLocaleString()}</p>
        `;

        portfolioContainer.appendChild(coinCard);
    });
}

loadPortfolio();