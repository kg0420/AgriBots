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
  const gaugePest = new JustGage({ id: "gauge-pest", value: 0, min: 0, max: 100, title: "Pest Detection Level" });

  const pestVideo = document.getElementById("pest-video");
  const pestCountDisplay = document.getElementById("pest-count");

  // Auto-load the video stream from Flask
  pestVideo.src = "http://localhost:5001/video_feed";

  function fetchPestCount() {
    fetch("http://localhost:5001/pest_count")
      .then(response => response.json())
      .then(data => {
        const count = data.pest_count || 0;
        gaugePest.refresh(count);
        pestCountDisplay.textContent = `Pest Count: ${count}`;
      })
      .catch(error => console.error("Error fetching pest count:", error));
  }

  function checkServerStatus() {
    fetch("http://localhost:5001/pest_count")
      .then(response => {
        if (!response.ok) throw new Error("Server not running");
      })
      .catch(error => {
        console.log("Flask server not running. Starting it...");
        fetch("http://localhost:5000/start_server");
      });
  }

  // Check and start the server
  checkServerStatus();

  // Update pest count every 2 seconds
  setInterval(fetchPestCount, 2000);

  function fetchWeatherAndForecastData() {
    Promise.all([
      fetch(weatherUrl).then(response => response.json()),
      fetch(forecastUrl).then(response => response.json())
    ])
    .then(([weatherData, forecastData]) => {
      gaugeTemperature.refresh(weatherData.main.temp || 0);
      document.getElementById('temperature-reading').textContent = `${weatherData.main.temp || 'N/A'} °C`;
      document.getElementById('wind-speed-reading').textContent = `${weatherData.wind.speed || 'N/A'} km/h`;

      const dailyData = forecastData.list.filter((item, index) => index % 8 === 0);
      const days = ['day1', 'day2', 'day3', 'day4'];

      const today = new Date();
      dailyData.forEach((data, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index + 1);
        const dateString = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        document.querySelector(`#${days[index]} h3`).textContent = dateString;
        
        document.getElementById(`temperature-${days[index]}`).textContent = `${data.main.temp || 'N/A'} °C`;
        document.getElementById(`humidity-${days[index]}`).textContent = `${data.main.humidity || 'N/A'} %`;
        document.getElementById(`windspeed-${days[index]}`).textContent = `${data.wind.speed || 'N/A'} km/h`;
      });
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
        gaugePest.refresh(data.pestDetection || 0);

        document.getElementById('humidity-reading').textContent = `${data.humidity || 'N/A'} %`;
        document.getElementById('soilMoisture-reading').textContent = data.soilMoisture || 'N/A';
        document.getElementById('AirQuality-reading').textContent = data.AirQuality || 'N/A';
        document.getElementById('RainFall-reading').textContent = data.waterLevel || 'N/A';
        document.getElementById('nitrogen-reading').textContent = data.nitrogen || 'N/A';
        document.getElementById('phosphorus-reading').textContent = data.phosphorus || 'N/A';
        document.getElementById('potassium-reading').textContent = data.potassium || 'N/A';
        document.getElementById('pest-reading').textContent = data.pestDetection || 'N/A';

        document.getElementById('humidity-warning').textContent = data.humidity < 70 ? 'Low Humidity' : '';
        document.getElementById('moisture-warning').textContent = data.soilMoisture < 70 ? 'Low Moisture' : '';
        document.getElementById('RainFall-warning').textContent = data.waterLevel < 70 ? 'Heavy Rainfall' : '';
        document.getElementById('npk-warning').textContent = (data.nitrogen < 20 || data.phosphorus < 10 || data.potassium < 30) ? 'Low NPK Levels' : '';
        document.getElementById('pest-warning').textContent = data.pestDetection > 50 ? 'High Pest Infestation' : '';
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
