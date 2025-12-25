const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultInput = document.getElementById('result');
const rateInfo = document.getElementById('rate-info');
const swapBtn = document.getElementById('swap');
const convertBtn = document.getElementById('convert');
const themeToggle = document.getElementById('theme-toggle');
const chartCtx = document.getElementById('rateChart').getContext('2d');

let currencies = [];
let chart;

// Load currencies
async function loadCurrencies() {
    const res = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json');
    currencies = await res.json();
    Object.keys(currencies).sort().forEach(code => {
        const option1 = new Option(`${code} - ${currencies[code]}`, code);
        const option2 = option1.cloneNode(true);
        fromCurrency.add(option1);
        toCurrency.add(option2);
    });
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
}

// Convert function
async function convert() {
    const amount = amountInput.value;
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    if (!amount || amount <= 0) return;
    
    try {
        const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from.toLowerCase()}/${to.toLowerCase()}.json`);
        const data = await res.json();
        const rate = data[to.toLowerCase()];
        const converted = (amount * rate).toFixed(4);
        resultInput.value = converted;
        rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to} (Updated: ${new Date(data.date).toLocaleDateString()})`;
        
        loadChart(from, to);
    } catch (e) {
        rateInfo.textContent = 'Error fetching rates. Try again!';
    }
}

// Historical chart (last 7 days approx)
async function loadChart(from, to) {
    const dates = [];
    const rates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0,10);
        try {
            const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${dateStr}/currencies/${from.toLowerCase()}/${to.toLowerCase()}.json`);
            const data = await res.json();
            dates.push(dateStr);
            rates.push(data[to.toLowerCase()]);
        } catch {}
    }
    
    if (chart) chart.destroy();
    chart = new Chart(chartCtx, {
        type: 'line',
        data: { labels: dates, datasets: [{ label: `${from} to ${to}`, data: rates, borderColor: '#007bff', tension: 0.4 }] },
        options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
}

// Swap
swapBtn.addEventListener('click', () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    convert();
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

convertBtn.addEventListener('click', convert);
amountInput.addEventListener('input', convert);
fromCurrency.addEventListener('change', convert);
toCurrency.addEventListener('change', convert);

loadCurrencies();
convert(); // Initial load