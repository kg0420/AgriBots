const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// Replace 'COM3' with the correct port for your Arduino
const arduinoPort = new SerialPort({path:'COM5', 
  baudRate: 9600,
});

const parser = arduinoPort.pipe(new Readline({ delimiter: '\n' }));

parser.on('data', (data) => {
  console.log('Received data:', data);
});
