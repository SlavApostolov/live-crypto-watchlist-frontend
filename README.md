# 📈 Live Cryptocurrency Portfolio Tracker

A full-stack web application that allows users to track their cryptocurrency holdings, view real-time market prices, and analyze historical trends. 

This project is divided into a **Vanilla JavaScript Frontend** and a secure **C# .NET 8 Backend**.

---

## 🏗️ Project Architecture

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js (Hosted on Netlify)
* **Backend API:** C# .NET 8 Web API (Hosted on Render)
* **Database:** Supabase (PostgreSQL)
* **External Data:** CoinGecko API v3 (Authenticated)

---

## 💻 Frontend Interface

The frontend is a responsive, Single Page Application (SPA) that communicates with the C# backend to manage user portfolios.

### Features
* **Real-Time Dashboard:** Calculates live total net worth based on current market prices.
* **Interactive Data Visualization:** Displays 7-day historical price trends using responsive line charts.
* **User Authentication:** Secure login and registration flows with dynamic UI state management.
* **Resilient UI:** Includes graceful error handling, loading states, and fallback icons.

### Local Setup (Frontend)
No build tools required.
1. Open the `/frontend` folder.
2. Open `index.html` in your browser or use the VS Code Live Server extension.
3. *Note: Ensure the `BASE_URL` in `app.js` is pointing to either your local backend (`localhost:7036`) or your live Render server.*

---

## ⚙️ Backend API

The backend handles user authentication, data validation, and aggregates real-time and historical cryptocurrency data securely.

### Features
* **Secure Authentication:** Endpoints for user registration (with 8-16 character password validation) and login.
* **Authenticated API Aggregation:** Securely communicates with the CoinGecko API using hidden environment variables.
* **Database Integration:** Built with Entity Framework Core, connecting to Supabase.
* **Safe Error Handling:** Smart fallbacks ensure the API remains resilient even if external endpoints hit rate limits.

### Environment Variables
To run this backend, you must configure the following environment variables (in Render or your local `appsettings.json`):

| Variable Key                           | Description                                        |
| :------------------------------------- | :------------------------------------------------- |
| `COINGECKO_API_KEY`                    | Your registered CoinGecko developer key.           |
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string pointing to Supabase. |

### Local Setup (Backend)
1. Ensure you have the [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) installed.
2. Open your terminal in the `/backend` folder.
3. Add your connection strings to `appsettings.Development.json`.
4. Run the following commands:
   ```bash
   dotnet restore
   dotnet build
   dotnet run
5.The API will launch locally (typically at https://localhost:7036).

### 🛡️ Production & Deployment Notes
Backend Cold Starts: The backend is hosted on a free Render tier. If the service has been inactive, the very first login/portfolio load might take 50-60 seconds while the server wakes up.

Security: The CoinGecko API key is never exposed to the frontend or hardcoded into GitHub. It is securely injected directly into the C# server environment.