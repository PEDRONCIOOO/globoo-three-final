// Cryptocurrency API functionality
class CryptocurrencyAPI {
  constructor() {
    this.apiKey = '57194955-d182-40c9-a050-e53320cbfdd3';
    this.baseURL = 'https://pro-api.coinmarketcap.com/v1';
    // Using a more reliable CORS proxy
    this.proxyURL = 'https://api.allorigins.win/get?url=';
  }

  async getTopCryptocurrencies(limit = 10) {
    try {
      const apiUrl = `${this.baseURL}/cryptocurrency/listings/latest?limit=${limit}&convert=USD`;
      const response = await fetch(`${this.proxyURL}${encodeURIComponent(apiUrl)}`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.contents);
      return parsedData.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Fallback to mock data if API fails
      return this.getMockData();
    }
  }

  // Mock data as fallback
  getMockData() {
    return [
      {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        cmc_rank: 1,
        quote: {
          USD: {
            price: 67543.21,
            percent_change_24h: 2.45,
            market_cap: 1334567890123
          }
        }
      },
      {
        id: 1027,
        name: 'Ethereum',
        symbol: 'ETH',
        cmc_rank: 2,
        quote: {
          USD: {
            price: 3876.54,
            percent_change_24h: -1.23,
            market_cap: 465789123456
          }
        }
      },
      {
        id: 825,
        name: 'Tether',
        symbol: 'USDT',
        cmc_rank: 3,
        quote: {
          USD: {
            price: 1.00,
            percent_change_24h: 0.01,
            market_cap: 125678912345
          }
        }
      },
      {
        id: 1839,
        name: 'BNB',
        symbol: 'BNB',
        cmc_rank: 4,
        quote: {
          USD: {
            price: 643.21,
            percent_change_24h: 1.87,
            market_cap: 98765432109
          }
        }
      },
      {
        id: 52,
        name: 'XRP',
        symbol: 'XRP',
        cmc_rank: 5,
        quote: {
          USD: {
            price: 0.6234,
            percent_change_24h: -0.92,
            market_cap: 35678912345
          }
        }
      },
      {
        id: 2010,
        name: 'Cardano',
        symbol: 'ADA',
        cmc_rank: 6,
        quote: {
          USD: {
            price: 0.4567,
            percent_change_24h: 3.21,
            market_cap: 15432198765
          }
        }
      },
      {
        id: 5426,
        name: 'Solana',
        symbol: 'SOL',
        cmc_rank: 7,
        quote: {
          USD: {
            price: 234.56,
            percent_change_24h: -2.15,
            market_cap: 112345678901
          }
        }
      },
      {
        id: 74,
        name: 'Dogecoin',
        symbol: 'DOGE',
        cmc_rank: 8,
        quote: {
          USD: {
            price: 0.0876,
            percent_change_24h: 5.43,
            market_cap: 12567891234
          }
        }
      },
      {
        id: 11419,
        name: 'Toncoin',
        symbol: 'TON',
        cmc_rank: 9,
        quote: {
          USD: {
            price: 5.67,
            percent_change_24h: 1.23,
            market_cap: 14321987654
          }
        }
      },
      {
        id: 3408,
        name: 'USDC',
        symbol: 'USDC',
        cmc_rank: 10,
        quote: {
          USD: {
            price: 1.00,
            percent_change_24h: -0.01,
            market_cap: 35987654321
          }
        }
      }
    ];
  }

  getCryptoIconURL(id) {
    return `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`;
  }
}

// Cryptocurrency Display Manager - ATUALIZADO PARA PAINEL
class CryptocurrencyDisplay {
  constructor() {
    this.api = new CryptocurrencyAPI();
    this.loadingElement = null;
    this.panelElement = null;
    this.listElement = null;
    this.errorElement = null;
    this.retryButton = null;
    this.refreshButton = null;
    this.isInitialized = false;
    this.isLoading = false;
  }

  // Initialize DOM elements
  init() {
    this.loadingElement = document.getElementById('crypto-loading');
    this.panelElement = document.getElementById('crypto-panel');
    this.listElement = document.getElementById('crypto-list');
    this.errorElement = document.getElementById('crypto-error');
    this.retryButton = document.getElementById('retry-btn');
    this.refreshButton = document.getElementById('refresh-btn');

    if (!this.loadingElement || !this.panelElement || !this.listElement || !this.errorElement) {
      console.warn('Cryptocurrency DOM elements not found. Make sure the HTML structure is in place.');
      return false;
    }

    // Event listeners
    this.retryButton?.addEventListener('click', () => this.loadCryptocurrencies());
    this.refreshButton?.addEventListener('click', () => this.refreshData());
    
    this.isInitialized = true;
    
    // Auto-load cryptocurrencies
    this.loadCryptocurrencies();
    return true;
  }

  async refreshData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.refreshButton.classList.add('loading');
    this.refreshButton.innerHTML = '<span class="refresh-icon">🔄</span>Atualizando...';
    
    try {
      const cryptocurrencies = await this.api.getTopCryptocurrencies(10);
      this.displayCryptocurrencies(cryptocurrencies);
      this.showPanel();
      
      // Success feedback
      this.refreshButton.innerHTML = '<span class="refresh-icon">✅</span>Atualizado!';
      setTimeout(() => {
        this.refreshButton.innerHTML = '<span class="refresh-icon">🔄</span>Atualizar Preços';
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing cryptocurrencies:', error);
      this.refreshButton.innerHTML = '<span class="refresh-icon">❌</span>Erro ao atualizar';
      setTimeout(() => {
        this.refreshButton.innerHTML = '<span class="refresh-icon">🔄</span>Atualizar Preços';
      }, 3000);
    } finally {
      this.isLoading = false;
      this.refreshButton.classList.remove('loading');
    }
  }

  async loadCryptocurrencies() {
    if (!this.isInitialized) {
      console.warn('CryptocurrencyDisplay not initialized. Call init() first.');
      return;
    }

    this.showLoading();

    try {
      const cryptocurrencies = await this.api.getTopCryptocurrencies(10);
      this.displayCryptocurrencies(cryptocurrencies);
      this.showPanel();
    } catch (error) {
      console.error('Error loading cryptocurrencies:', error);
      this.showError();
    }
  }

  displayCryptocurrencies(cryptocurrencies) {
    if (!this.listElement) return;
    
    this.listElement.innerHTML = '';

    cryptocurrencies.forEach(crypto => {
      const row = this.createCryptoRow(crypto);
      this.listElement.appendChild(row);
    });
  }

  createCryptoRow(crypto) {
    const row = document.createElement('div');
    row.className = 'crypto-row';

    const price = crypto.quote.USD.price;
    const change = crypto.quote.USD.percent_change_24h;
    const marketCap = crypto.quote.USD.market_cap;

    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeArrow = change >= 0 ? '↗' : '↘';

    row.innerHTML = `
      <div class="row-rank">#${crypto.cmc_rank}</div>
      
      <div class="row-coin">
        <div class="coin-info">
          <img 
            src="${this.api.getCryptoIconURL(crypto.id)}" 
            alt="${crypto.name} icon" 
            class="crypto-icon"
            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0MjkwYzgiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiPiQ8L3RleHQ+Cjwvc3ZnPg=='"
          />
          <div class="coin-details">
            <h4>${crypto.name}</h4>
            <p class="coin-symbol">${crypto.symbol}</p>
          </div>
        </div>
      </div>
      
      <div class="row-price">$${this.formatPrice(price)}</div>
      
      <div class="row-change ${changeClass}">
        <span class="change-arrow">${changeArrow}</span>
        ${Math.abs(change).toFixed(2)}%
      </div>
      
      <div class="row-market-cap">$${this.formatMarketCap(marketCap)}</div>
    `;

    return row;
  }

  formatPrice(price) {
    if (price >= 1) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      return price.toFixed(6);
    }
  }

  formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
      return (marketCap / 1e12).toFixed(2) + 'T';
    } else if (marketCap >= 1e9) {
      return (marketCap / 1e9).toFixed(2) + 'B';
    } else if (marketCap >= 1e6) {
      return (marketCap / 1e6).toFixed(2) + 'M';
    } else {
      return marketCap.toFixed(0);
    }
  }

  showLoading() {
    if (this.loadingElement) this.loadingElement.style.display = 'flex';
    if (this.panelElement) this.panelElement.style.display = 'none';
    if (this.errorElement) this.errorElement.style.display = 'none';
  }

  showPanel() {
    if (this.loadingElement) this.loadingElement.style.display = 'none';
    if (this.panelElement) this.panelElement.style.display = 'block';
    if (this.errorElement) this.errorElement.style.display = 'none';
  }

  showError() {
    if (this.loadingElement) this.loadingElement.style.display = 'none';
    if (this.panelElement) this.panelElement.style.display = 'none';
    if (this.errorElement) this.errorElement.style.display = 'block';
  }

  // Method to refresh data periodically
  startAutoRefresh(intervalMinutes = 5) {
    setInterval(() => {
      if (this.isInitialized && !this.isLoading) {
        this.refreshData();
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Clean up method
  destroy() {
    this.retryButton?.removeEventListener('click', () => this.loadCryptocurrencies());
    this.refreshButton?.removeEventListener('click', () => this.refreshData());
    this.isInitialized = false;
  }
}

// Export both classes and a convenience function
export { CryptocurrencyAPI, CryptocurrencyDisplay };

// Export a convenience function to initialize everything
export function initCryptocurrencyDisplay() {
  const cryptoDisplay = new CryptocurrencyDisplay();
  
  // Try to initialize immediately, or wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cryptoDisplay.init();
      cryptoDisplay.startAutoRefresh(5); // Refresh every 5 minutes
    });
  } else {
    cryptoDisplay.init();
    cryptoDisplay.startAutoRefresh(5); // Refresh every 5 minutes
  }
  
  return cryptoDisplay;
}