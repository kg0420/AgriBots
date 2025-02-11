const apiKey = "72e75ef2ca88fde707135ea760ad3177";
const city = 'Pune';

// Construct API URLs
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

document.addEventListener('DOMContentLoaded', function() {
  const gaugeTemperature = new JustGage({ id: "gauge-temperature", value: 0, min: -10, max: 100, title: "Temperature (°C)" });
  const gaugeHumidity = new JustGage({ id: "gauge-humidity", value: 0, min: 0, max: 100, title: "Humidity (%)" });
  const gaugeSoilMoisture = new JustGage({ id: "gauge-soilMoisture", value: 0, min: 0, max: 100, title: "Soil Moisture" });
  const gaugeRainFall = new JustGage({ id: "gauge-RainFall", value: 0, min: 0, max: 100, title: "Rainfall Level" });
  const gaugeAirQuality = new JustGage({ id: "gauge-AirQuality", value: 0, min: 0, max: 100, title: "Air Quality Level" });
  const gaugeNitrogen = new JustGage({ id: "gauge-nitrogen", value: 0, min: 0, max: 100, title: "Nitrogen (N)" });
  const gaugePhosphorus = new JustGage({ id: "gauge-phosphorus", value: 0, min: 0, max: 100, title: "Phosphorus (P)" });
  const gaugePotassium = new JustGage({ id: "gauge-potassium", value: 0, min: 0, max: 100, title: "Potassium (K)" });
  const gaugeDay1 = new JustGage({ id: "gauge-day1", value: 0, min: -10, max: 100, title: "Day 1" });
  const gaugeDay2 = new JustGage({ id: "gauge-day2", value: 0, min: -10, max: 100, title: "Day 2" });
  const gaugeDay3 = new JustGage({ id: "gauge-day3", value: 0, min: -10, max: 100, title: "Day 3" });
  const gaugeDay4 = new JustGage({ id: "gauge-day4", value: 0, min: -10, max: 100, title: "Day 4" });

  function fetchWeatherAndForecastData() {
    Promise.all([
      fetch(weatherUrl).then(response => response.json()),
      fetch(forecastUrl).then(response => response.json())
    ])
    .then(([weatherData, forecastData]) => {
      gaugeTemperature.refresh(weatherData.main.temp || 0);
      document.getElementById('temperature-reading').textContent = `${weatherData.main.temp || 'N/A'} °C`;
      
      const dailyTemperatures = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 4);
      gaugeDay1.refresh(dailyTemperatures[0]?.main.temp || 0);
      gaugeDay2.refresh(dailyTemperatures[1]?.main.temp || 0);
      gaugeDay3.refresh(dailyTemperatures[2]?.main.temp || 0);
      gaugeDay4.refresh(dailyTemperatures[3]?.main.temp || 0);
    })
    .catch(error => console.error('Error fetching weather/forecast data:', error));
  }

  function fetchData() {
    fetch('/data')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch sensor data');
        return response.json();
      })
      .then(data => {
        gaugeHumidity.refresh(data.humidity || 0);
        gaugeSoilMoisture.refresh(data.soilMoisture || 0);
        gaugeAirQuality.refresh(data.AirQuality || 0);
        gaugeRainFall.refresh(data.RainFall || 0);
        gaugeNitrogen.refresh(data.nitrogen || 0);
        gaugePhosphorus.refresh(data.phosphorus || 0);
        gaugePotassium.refresh(data.potassium || 0);
        
        document.getElementById('humidity-reading').textContent = `${data.humidity || 'N/A'} %`;
        document.getElementById('soilMoisture-reading').textContent = data.soilMoisture || 'N/A';
        document.getElementById('AirQuality-reading').textContent = data.AirQuality || 'N/A';
        document.getElementById('RainFall-reading').textContent = data.waterLevel || 'N/A';
        document.getElementById('nitrogen-reading').textContent = data.nitrogen || 'N/A';
        document.getElementById('phosphorus-reading').textContent = data.phosphorus || 'N/A';
        document.getElementById('potassium-reading').textContent = data.potassium || 'N/A';

        document.getElementById('humidity-warning').textContent = data.humidity < 70 ? 'Low Humidity' : '';
        document.getElementById('moisture-warning').textContent = data.soilMoisture < 70 ? 'Low Moisture' : '';
        document.getElementById('RainFall-warning').textContent = data.waterLevel < 70 ? 'Heavy Rainfall' : '';
        document.getElementById('npk-warning').textContent = (data.nitrogen < 20 || data.phosphorus < 10 || data.potassium < 30) ? 'Low NPK Levels' : '';
      })
      .catch(error => console.error('Error fetching sensor data:', error.message));
  }

  setInterval(fetchWeatherAndForecastData, 3600000);
  setInterval(fetchData, 2000);
  setInterval(toggleVisibility, 4000);

  fetchWeatherAndForecastData();
  fetchData();
});

function toggleVisibility() {
  document.querySelectorAll('.sensor p').forEach(el => el.classList.toggle('hidden'));
}

function toggleNPKInfo() {
  document.getElementById('npk-info').classList.toggle('hidden');
}

function showSection(sectionId) {
  let section = document.getElementById(sectionId);
  section.style.display = (section.style.display === 'block') ? 'none' : 'block';
}
