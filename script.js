var APIkey = "7d1b285353ccacd5326159e04cfab063";
var cityInputEl = $('#city-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var pastSearchedCitiesEl = $('#past-searches');
var City;

// handle submit of city name by trimming and sending to getCurrent function, clear HTML display of past weather data, cards, titles
function handleCityFormSubmit (event) {
    event.preventDefault();
    City = cityInputEl.val().trim();
    clearCurrentCityWeather();
    getCurrent();

    return;
}

searchBtn.on("click", handleCityFormSubmit);


// use Open Weather to get city coordinates to then send to 'One Call API' to get weather
function getCurrent () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${City}&appid=${APIkey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
        var cityInfo = {
            city: City,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        displaySearchHistory();
        return cityInfo;
      })
      .then(function (data) {
        getAllWeather(data);
      })
      return;
}

// use Open Weather 'One Call API' to get weather based on city coordinates
function getAllWeather(data) {
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIkey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // current weather
            var currentConditionsEl = $('#currentConditions');
            currentConditionsEl.addClass('border border-success');

            // create city name element and display
            var cityNameEl = $('<h1>');
            cityNameEl.text(City);
            currentConditionsEl.append(cityNameEl);

            // get date from results and display by appending to city name element
            var currentCityDate = data.current.dt;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
            var currentDateEl = $('<span>');
            currentDateEl.text(` (${currentCityDate}) `);
            cityNameEl.append(currentDateEl);

            // get weather icon and display by appending to city name element            
            var currentCityWeatherIcon = data.current.weather[0].icon; 
            var currentWeatherIconEl = $('<img>');
            currentWeatherIconEl.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityNameEl.append(currentWeatherIconEl);

            // get current temp data and display
            var currentCityTemp = data.current.temp;
            var currentTempEl = $('<p>')
            currentTempEl.text(`Temp: ${currentCityTemp}°C`)
            currentConditionsEl.append(currentTempEl);

            // get current wind speed and display
            var currentCityWind = data.current.wind_speed;
            var currentWindEl = $('<p>')
            currentWindEl.text(`Wind: ${currentCityWind} KPH`)
            currentConditionsEl.append(currentWindEl);

            // get current humidity and display
            var currentCityHumidity = data.current.humidity;
            var currentHumidityEl = $('<p>')
            currentHumidityEl.text(`Humidity: ${currentCityHumidity}%`)
            currentConditionsEl.append(currentHumidityEl);

            // 5 - Day Forecast
            var fiveDayForecastHeaderEl = $('#fiveDayForecastHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5-Day Forecast:');
            fiveDayForecastHeaderEl.append(fiveDayHeaderEl);
            var fiveDayForecastEl = $('#fiveDayForecast');
            // get key weather info from API data for five day forecast and display
            for (var i = 1; i <6; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(date).format("MM/DD/YYYY");
                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                // create a card
                var card = $('<div>').addClass('card col-2 m-1 bg-primary text-white');
                var cardBody = $('<div>').addClass('card-body').html(`<h6>${date}</h6>
                                                                    <img src="http://openweathermap.org/img/wn/${icon}.png"><br>
                                                                    ${temp}°C<br>
                                                                    ${wind} KPH<br>
                                                                    ${humidity}%`);
                card.append(cardBody);
                fiveDayForecastEl.append(card);
            }
        })
    return;
}

// Display search history as buttons
function displaySearchHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = $('#past-searches');

    pastSearchesEl.empty();

    for (var i = 0; i < storedCities.length; i++) {
        var pastCityBtn = $('<button>').addClass("btn btn-primary my-2 past-city").css("width", "100%").text(storedCities[i].city);
        pastSearchesEl.append(pastCityBtn);
    }
}



function clearCurrentCityWeather() {
    $("#currentConditions, #fiveDayForecastHeader, #fiveDayForecast").empty();
}


// When user clicks on city previously searched, an updated forecast will be retrieved and displayed
function getPastCity (event) {
    var element = event.target;

    if (element.matches(".past-city")) {
        City = element.textContent;       
        clearCurrentCityWeather();
        getCurrent ();
    }
}

// handle requst to clear past search history
function handleClearHistory(event) {
    event.preventDefault();
    localStorage.removeItem("cities");
    $('#past-searches').empty();
}

$('#clear-button').on('click', handleClearHistory);

pastSearchedCitiesEl.on("click", getPastCity);

displaySearchHistory();

searchBtn.on("click", handleCityFormSubmit);


pastSearchedCitiesEl.on("click", getPastCity);
