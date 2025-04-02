const apiKey = "72e75ef2ca88fde707135ea760ad3177";
const city = 'Pune';
const ESP32_IP = "http://192.168.4.29/getSensorData"; // Replace with actual ESP32 IP

// API URLs
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

// Initialize JustGage Gauges
document.addEventListener('DOMContentLoaded', function () {
    const gauges = {
        temperature: new JustGage({ id: "gauge-temperature", value: 0, min: -10, max: 100, title: "Temperature (°C)" }),
        humidity: new JustGage({ id: "gauge-humidity", value: 0, min: 0, max: 100, title: "Humidity (%)" }),
        soilMoisture: new JustGage({ id: "gauge-soilMoisture", value: 0, min: 0, max: 100, title: "Soil Moisture" }),
        rainFall: new JustGage({ id: "gauge-RainFall", value: 0, min: 0, max: 100, title: "Rainfall Level" }),
        airQuality: new JustGage({ id: "gauge-AirQuality", value: 0, min: 0, max: 100, title: "Air Quality Level" }),
        nitrogen: new JustGage({ id: "gauge-nitrogen", value: 0, min: 0, max: 100, title: "Nitrogen (N)" }),
        phosphorus: new JustGage({ id: "gauge-phosphorus", value: 0, min: 0, max: 100, title: "Phosphorus (P)" }),
        potassium: new JustGage({ id: "gauge-potassium", value: 0, min: 0, max: 100, title: "Potassium (K)" }),
        pest: new JustGage({ id: "gauge-pest", value: 0, min: 0, max: 100, title: "Pest Detection Level" })
    };

    const pestVideo = document.getElementById("pest-video");
    const pestCountDisplay = document.getElementById("pest-count");
    pestVideo.src = "http://localhost:5001/video_feed";

    // Fetch Pest Detection Data
    function fetchPestCount() {
        fetch("http://localhost:5001/pest_count")
            .then(response => response.json())
            .then(data => {
                const count = data.pest_count || 0;
                gauges.pest.refresh(count);
                pestCountDisplay.textContent = `Pest Count: ${count}`;
            })
            .catch(error => console.error("Error fetching pest count:", error));
    }

    // Fetch Weather Data
    function fetchWeatherData() {
        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                gauges.temperature.refresh(data.main.temp || 0);
                document.getElementById('temperature-reading').textContent = `${data.main.temp || 'N/A'} °C`;
                document.getElementById('wind-speed-reading').textContent = `${data.wind.speed || 'N/A'} km/h`;
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    // Fetch Forecast Data
    function fetchForecastData() {
        fetch(forecastUrl)
            .then(response => response.json())
            .then(forecastData => {
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
            .catch(error => console.error('Error fetching forecast data:', error));
    }

    // Fetch Sensor Data from ESP32
    function fetchSensorData() {
        fetch("http://192.168.4.29/getSensorData") // Ensure ESP32 serves JSON response correctly
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not OK");
                }
                return response.json();
            })
            .then(data => {
                console.log("ESP32 Sensor Data:", data); // Debugging log
    
                // Update JustGage Gauges
                gauges.humidity.refresh(data.humidity || 0);
                gauges.soilMoisture.refresh(data.soilMoisture || 0);
                gauges.airQuality.refresh(data.airQuality || 0);
                gauges.rainFall.refresh(data.rainFall || 0);
                gauges.nitrogen.refresh(data.NPK_N || 0);
                gauges.phosphorus.refresh(data.NPK_P || 0);
                gauges.potassium.refresh(data.NPK_K || 0);
    
                // Update HTML Elements
                document.getElementById('humidity-reading').textContent = (data.humidity || 'N/A') + " %";
                document.getElementById('soilMoisture-reading').textContent = (data.soilMoisture || 'N/A') + " %";
                document.getElementById('AirQuality-reading').textContent = data.airQuality || 'N/A';
                document.getElementById('RainFall-reading').textContent = data.rainFall || 'N/A';
                document.getElementById('nitrogen-reading').textContent = data.NPK_N || 'N/A';
                document.getElementById('phosphorus-reading').textContent = data.NPK_P || 'N/A';
                document.getElementById('potassium-reading').textContent = data.NPK_K || 'N/A';
    
                // Warnings for Low Humidity & Moisture
                document.getElementById('humidity-warning').textContent = data.humidity < 30 ? '⚠️ Low Humidity!' : '';
                document.getElementById('moisture-warning').textContent = data.soilMoisture < 30 ? '⚠️ Low Moisture!' : '';
            })
            .catch(error => {
                console.error("Error fetching ESP32 sensor data:", error);
                document.getElementById('humidity-reading').textContent = "Error!";
                document.getElementById('soilMoisture-reading').textContent = "Error!";
            });
    }
    // Update Data at Intervals
    setInterval(fetchWeatherData, 3600000); // Every hour
    setInterval(fetchForecastData, 3600000);
    setInterval(fetchSensorData, 2000); // Every 2 seconds
    setInterval(fetchPestCount, 2000);
    
    fetchWeatherData();
    fetchForecastData();
    fetchSensorData();
    fetchPestCount();

    // Chatbot Functionality
    const sendButton = document.getElementById('send-btn');
    const userInputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    if (sendButton && userInputField && chatBox) {
        sendButton.addEventListener('click', sendMessage);
        userInputField.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
        });
    } else {
        console.error('Chatbot elements not found.');
    }

    function sendMessage() {
        const userInput = userInputField.value.trim();
        if (userInput === '') return;

        appendMessage('user-message', userInput);
        userInputField.value = '';

        fetch('http://127.0.0.1:5000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput }),
        })
            .then(response => response.json())
            .then(data => {
                appendMessage('bot-message', data.response || 'Error processing your request.');
            })
            .catch(error => {
                console.error('Chatbot Error:', error);
                appendMessage('bot-message', 'Error: Unable to fetch response.');
            });
    }

    function appendMessage(className, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
