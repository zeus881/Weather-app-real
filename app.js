const apiKey = '3d096be6aefc9b3881b2d549db3e8165';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const weatherDisplay = document.getElementById('weather-display');
const weatherData = document.getElementById('weather-data');
const extendedForecast = document.getElementById('extended-forecast');
const forecastData = document.getElementById('forecast-data');

const weatherTypesImages = {
    sunny: "img/sunny.png",
    clouds: "img/cloudy.png",
    rain: "img/rainy.png",
    snow: "img/snow.png",
    clear: "img/clear.png",
    wind: "img/wind.png",
    fog: "img/fog.png",
    overcast: "img/overcast.png"
};

// Function to get day name from date 
function getDayInWords(dayNumber) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNumber];
}

// Fetch Weather Data
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    } catch (error) {
        alert(error.message);
    }
}

// Display Current Weather
function displayWeather(data) {
    const { name, weather, main, wind } = data;
    weatherDisplay.classList.remove('hidden');
    weatherData.innerHTML = `
        <h3 class='text-xl font-bold'>${name}</h3>
        <p><strong>Weather:</strong> ${weather[0].description}</p>
        <img src="${weatherTypesImages[weather[0].main.toLowerCase()] || './img/default.png'}" alt="Weather icon" class="w-16 h-16 mx-auto">
        <p><strong>Temperature:</strong> ${main.temp}&#8451;</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
    `;
}

// Display Extended Forecast
function displayForecast(data) {
    extendedForecast.classList.remove('hidden');

    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = getDayInWords(date.getDay());
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                dayName,
                date: date.toLocaleDateString(),
                weather: item.weather[0],
                main: item.main,
                wind: item.wind
            };
        }
    });

    forecastData.innerHTML = Object.values(dailyForecasts).slice(0, 5).map(day => `
        <div class='bg-white p-4 rounded shadow text-center'>
            <p><strong>${day.dayName}, ${day.date}</strong></p>
            <img src="${weatherTypesImages[day.weather.main.toLowerCase()] || './img/default.png'}" alt="Weather icon" class="w-12 h-12 mx-auto">
            <p><strong>Temp:</strong> ${day.main.temp}&#8451;</p>
            <p><strong>Humidity:</strong> ${day.main.humidity}%</p>
            <p><strong>Wind:</strong> ${day.wind.speed} m/s</p>
            <p>${day.weather.description}</p>
        </div>
    `).join('');
}

// Search by City
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    const weatherData = await fetchWeatherData(url);
    if (weatherData) displayWeather(weatherData);

    const forecastData = await fetchWeatherData(forecastUrl);
    if (forecastData) displayForecast(forecastData);
});

// Use Current Location
currentLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

        const weatherData = await fetchWeatherData(url);
        if (weatherData) displayWeather(weatherData);

        const forecastData = await fetchWeatherData(forecastUrl);
        if (forecastData) displayForecast(forecastData);
    }, () => {
        alert('Unable to retrieve your location');
    });
});
