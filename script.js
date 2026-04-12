// rewards.js

// Глобальна змінна для зберігання нагород після завантаження
let cachedRewards = null;

const CURRENCY_CONFIG = [
    { name: "btc",  divisor: 10000000000, prec: 8, geckoId: "bitcoin" },
    { name: "trx",  divisor: 10000000000, prec: 8, geckoId: "tron" },
    { name: "pol",  divisor: 10000000000, prec: 8, geckoId: "polygon-ecosystem-token" }, // Новий тікер MATIC
    { name: "bnb",  divisor: 10000000000, prec: 8, geckoId: "binancecoin" },
    { name: "eth",  divisor: 10000000000, prec: 8, geckoId: "ethereum" },
    { name: "doge", divisor: 10000,       prec: 2, geckoId: "dogecoin" },
    { name: "ltc",  divisor: 100000000,   prec: 8, geckoId: "litecoin" },
    { name: "algo", divisor: 1000000,  prec: 4, geckoId: "algorand" },
    { name: "sol",  divisor: 1000000000,  prec: 8, geckoId: "solana" },
    { name: "xrp",  divisor: 1000000,     prec: 2, geckoId: "ripple" },
    { name: "default", divisor: 1000000,  prec: 6, geckoId: null }
];

/**
 * Завантажує дані з локального data.json
 */
async function loadRewardsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Файл data.json не знайдено');
        const data = await response.json();
        cachedRewards = data.rewards;
        console.log("Нагороди завантажено успішно");
    } catch (e) {
        console.warn("Не вдалося завантажити data.json, буде використано дані з API");
        cachedRewards = {}; // Порожній об'єкт, щоб не було помилок
    }
}

/**
 * Повертає нагороду для конкретної монети.
 * Якщо в data.json її немає, повертає значення з API.
 */
function getRewardForCoin(coinName, apiPayout) {
    if (cachedRewards && cachedRewards[coinName]) {
        return cachedRewards[coinName];
    }
    return apiPayout; // fallback на дані з API
}

let cryptoPrices = {};

async function loadCryptoPrices() {
    try {
        const ids = Object.values(CURRENCY_CONFIG).map(c => c.geckoId).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await response.json();

        // Перетворюємо у зручний формат { bitcoin: 65000, ethereum: 3500 }
        for (const id in data) {
            cryptoPrices[id] = data[id].usd;
        }
        console.log("Курси валют оновлено");
    } catch (e) {
        console.error("Не вдалося завантажити курси з CoinGecko", e);
    }
}

function handleRefresh(btn) {

    // 2. Початкове блокування кнопки
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';

    let secondsLeft = 60; // Скільки секунд чекати
    btn.innerText = `Оновлення даних доступно через ${secondsLeft}с`;

    // 3. Запуск таймера
    const countdown = setInterval(() => {
        secondsLeft--; // Зменшуємо на 1
        btn.innerText = `Оновлення даних доступно через ${secondsLeft}с`;

        if (secondsLeft <= 0) {
            // 4. Коли час вийшов — розблоковуємо
            clearInterval(countdown);
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.innerText = 'Оновити';
        }
    }, 1000); // Повторювати кожну 1 секунду (1000 мс)
}

function checkInput() {
    const input = document.getElementById('nicknameInput');
    const btn = document.getElementById('calcBtn');

    // .trim() видаляє пробіли, щоб не можна було активувати кнопку просто натиснувши пробіл
    btn.disabled = input.value.trim() === "";
}

function copyTRXAddress() {
    const btn = document.getElementById("copy-btn");
    const originalText = btn.innerHTML;
    // Встав сюди свою реальну адресу TRX
    const walletAddress = "TKZJLxBRomBC287e5gVC3Z4PbEXzocnd4z";

    navigator.clipboard.writeText(walletAddress).then(() => {
        // Міняємо вміст кнопки
        btn.innerHTML = '<span class="icon">✅</span> Скопійовано!';

        // Через 3 секунди повертаємо як було
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 3000);
    }).catch(err => {
        console.error('Помилка:', err);
    });
}

window.onload = function() {
    const savedNick = localStorage.getItem('userNickname');
    if (savedNick) {
        const input = document.getElementById('nicknameInput');
        input.value = savedNick;
        checkInput(); // Активуємо кнопку, якщо нік підтягнувся
    }
};