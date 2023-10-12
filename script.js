
    var searchButton = document.getElementById('searchButton');
    var clearButton = document.getElementById('clearButton');
    var cityInput = document.getElementById('cityInput');
    var currentConditions = document.getElementById('currentConditions');
    var pastSearches = document.getElementById('past-searches');

    searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        var city = cityInput.value.trim();
        if (city !== '') {
            // Save the city to local storage
            saveToLocalStorage(city);

            // Call a function to get weather data for the current city
            getWeather(city);
        }
    });

    clearButton.addEventListener('click', function (event) {
        event.preventDefault();
    
        clearSearchHistory();
    });


    displaySearchHistory();

    function getWeather(city) {
    
        const apiKey = '9a587384f3a7b9621d246bc205c2af89';
        const currentWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        // Fetch current weather data
        fetch(currentWeatherUrl)
            .then(response => response.json())
            .then(data => {
                updateCurrentConditions(data);
            })
            .catch(error => {
                console.error('Error fetching current weather data:', error);
            });

        // Fetch forecast data
        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                updateFiveDayForecast(data.list);
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
            });
    }

    function updateCurrentConditions(weatherData) {
        var date = moment().format('MMMM Do YYYY');
        var iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;

        currentConditions.innerHTML = `
            <p>${weatherData.name}, ${weatherData.sys.country}</p>
            <p>Date: ${date}</p>
            <img src="${iconUrl}" alt="Weather Icon">
            <p>Temperature: ${weatherData.main.temp}°C</p>
            <p>Humidity: ${weatherData.main.humidity}%</p>
            <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
        `;
    }

    function updateFiveDayForecast(forecastData) {
        // Clear existing forecast content
        fiveDayForecast.innerHTML = '';

        // Display the forecast header
        fiveDayForecastHeader.innerHTML = '<strong>Five-Day Forecast:</strong>';

        // Extract and display the forecast information
        for (let i = 0; i < forecastData.length; i += 8) {
            const forecast = forecastData[i];

            // Format the date using the moment.js library
            const date = moment(forecast.dt_txt).format('MMMM Do YYYY');

            // Icon representation for weather conditions (adjust as needed)
            const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

            // Display the forecast information
            fiveDayForecast.innerHTML += `
                <div class="col-md-2">
                    <p>${date}</p>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>Temperature: ${forecast.main.temp}°C</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                    <p>Wind Speed: ${forecast.wind.speed} m/s</p>
                </div>`;
        }
    }

    function saveToLocalStorage(city) {
        // Get existing search history from local storage
        var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        // Add the new city to the search history
        searchHistory.push(city);

        // Save the updated search history back to local storage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    function displaySearchHistory() {
        // Get search history from local storage
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        // Display the search history
        pastSearches.innerHTML = '<strong>Search History:</strong>';
        searchHistory.forEach(city => {
            pastSearches.innerHTML += `<p>${city}</p>`;
        });
    }

    function clearSearchHistory() {
        // Clear the search history in local storage
        localStorage.removeItem('searchHistory');

        // Clear the displayed search history
        pastSearches.innerHTML = '';
    }

