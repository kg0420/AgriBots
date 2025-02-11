const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline'); // Correctly import ReadlineParser
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const port = 3001;

// Replace 'COM3' with the correct port for your Arduino
const arduinoPort = new SerialPort({
  path: 'COM5', 
  baudRate: 9600,
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' })); // Use ReadlineParser correctly

let sensorData = {
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  waterLevel: 0,
};

parser.on('data', (data) => {
  try {
    sensorData = JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse sensor data:', error);
  }
});

app.get('/data', (req, res) => {
  res.json(sensorData);
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
}); 
fetch('http://localhost:3000/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching data:', error));

  const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      styleSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }
}));
